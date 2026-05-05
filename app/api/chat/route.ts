import { NextResponse } from "next/server";
import { chat, type ChatMessage } from "@/lib/ai/providers";
import { getAgent } from "@/lib/ai/agents";
import { embed, isEmbeddingAvailable } from "@/lib/ai/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  messages: ChatMessage[];
  conversationId?: string;
  agent?: string;
  useRag?: boolean;
};

type Citation = {
  n: number;
  documentId: string;
  filename: string;
  page: number | null;
  similarity: number;
  snippet: string;
};

const MAX_CONTEXT_CHARS = 6000;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userMessages = (body.messages ?? []).filter(
    (m): m is ChatMessage =>
      !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
  );
  if (userMessages.length === 0) {
    return NextResponse.json({ error: "messages[] is required" }, { status: 400 });
  }

  // Default to FinanceAgent if no agent specified or agent not found
  const agentId = body.agent || "FinanceAgent";
  const agent = getAgent(agentId) || getAgent("FinanceAgent");
  const lastUser = [...userMessages].reverse().find((m) => m.role === "user");
  const useRag = body.useRag !== false && !!lastUser;

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = supabaseConfigured ? await createClient() : null;
  let userId: string | null = null;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }

  // Retrieve RAG context (only if user is signed in and embeddings are configured)
  let citations: Citation[] = [];
  let contextBlock = "";
  if (useRag && userId && supabase && isEmbeddingAvailable()) {
    try {
      const { vectors } = await embed([lastUser!.content]);
      const queryVec = vectors[0];
      if (queryVec) {
        const { data: matches } = await supabase.rpc("match_document_chunks", {
          query_embedding: `[${queryVec.join(",")}]`,
          match_count: 6,
          min_similarity: 0.25,
        });

        if (Array.isArray(matches) && matches.length > 0) {
          let used = 0;
          citations = matches
            .map((m: {
              id: string;
              document_id: string;
              filename: string;
              page_number: number | null;
              content: string;
              similarity: number;
            }, i: number) => {
              const snippet = String(m.content).slice(0, 1000);
              if (used + snippet.length > MAX_CONTEXT_CHARS) return null;
              used += snippet.length;
              return {
                n: i + 1,
                documentId: m.document_id,
                filename: m.filename,
                page: m.page_number,
                similarity: m.similarity,
                snippet,
              };
            })
            .filter(Boolean) as Citation[];

          if (citations.length > 0) {
            contextBlock = `## Context (from your data room)\n\n${citations
              .map(
                (c) =>
                  `[${c.n}] ${c.filename}${c.page ? ` p.${c.page}` : ""} — similarity ${c.similarity.toFixed(2)}\n${c.snippet}`,
              )
              .join("\n\n---\n\n")}`;
          }
        }
      }
    } catch {
      // RAG is best-effort; continue without it.
    }
  }

  const systemMessages: ChatMessage[] = [{ role: "system", content: agent.system }];
  if (contextBlock) systemMessages.push({ role: "system", content: contextBlock });

  // Strip any extra fields (e.g. agent, citations) that DB-rehydrated messages may carry —
  // Groq and other strict providers reject unknown properties on message objects.
  const sanitized: ChatMessage[] = userMessages
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));
  const messages: ChatMessage[] = [...systemMessages, ...sanitized];

  let result;
  try {
    result = await chat(messages);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  // Persist (best-effort)
  if (supabase && userId && lastUser) {
    try {
      await supabase.from("chat_messages").insert([
        {
          user_id: userId,
          role: "user",
          content: lastUser.content,
          conversation_id: body.conversationId ?? null,
          agent: agent.id,
        },
        {
          user_id: userId,
          role: "assistant",
          content: result.content,
          conversation_id: body.conversationId ?? null,
          agent: agent.id,
          citations: citations.length ? citations : null,
        },
      ]);
    } catch {
      /* best-effort */
    }
  }

  return NextResponse.json({
    content: result.content,
    agent: agent.id,
    citations,
  });
}
