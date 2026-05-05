import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkText } from "@/lib/ai/chunker";
import { embed } from "@/lib/ai/embeddings";
import { classifyDocument } from "@/lib/ai/classifier";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  filename: string;
  mimeType?: string;
  size?: number;
  content: string;        // pre-extracted text (client extracts PDFs via pdf.js etc.)
  storagePath?: string;   // optional path returned by a prior storage upload
};

const MAX_CHARS = 1_200_000; // ~300k tokens cap per upload

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.filename || typeof body.content !== "string") {
    return NextResponse.json({ error: "filename and content are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const text = body.content.slice(0, MAX_CHARS);

  // 1. Insert document row in 'processing' state
  const { data: doc, error: insertErr } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      storage_path: body.storagePath ?? `${user.id}/${Date.now()}-${body.filename}`,
      filename: body.filename,
      mime_type: body.mimeType ?? null,
      size_bytes: body.size ?? null,
      status: "processing",
    })
    .select()
    .single();

  if (insertErr || !doc) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  // 2. Classify (kind / dates / summary)
  let meta;
  try {
    meta = await classifyDocument(body.filename, text);
  } catch {
    meta = { kind: "Other", doc_year: null, doc_month: null, doc_date: null, summary: body.filename };
  }

  // 3. Chunk and embed
  const chunks = chunkText(text);
  let embeddedCount = 0;

  if (chunks.length > 0) {
    try {
      // Batch in groups of 32 to stay friendly with free embedding APIs
      const BATCH = 32;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const slice = chunks.slice(i, i + BATCH);
        const { vectors } = await embed(slice.map((c) => c.content));

        const rows = slice.map((c, j) => ({
          document_id: doc.id,
          user_id: user.id,
          chunk_index: c.index,
          content: c.content,
          token_count: c.approxTokens,
          embedding: vectors[j] ? `[${vectors[j].join(",")}]` : null,
        }));

        const { error: chunkErr } = await supabase.from("document_chunks").insert(rows);
        if (chunkErr) throw new Error(chunkErr.message);
        embeddedCount += slice.length;
      }
    } catch (err) {
      await supabase
        .from("documents")
        .update({ status: "error", error_message: (err as Error).message })
        .eq("id", doc.id);
      return NextResponse.json({ error: (err as Error).message, documentId: doc.id }, { status: 502 });
    }
  }

  // 4. Mark ready with derived metadata
  const { error: updErr } = await supabase
    .from("documents")
    .update({
      status: "ready",
      kind: meta.kind,
      doc_year: meta.doc_year,
      doc_month: meta.doc_month,
      doc_date: meta.doc_date,
      summary: meta.summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doc.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    documentId: doc.id,
    chunks: embeddedCount,
    meta,
  });
}

/** GET — list current user's documents, segregated by year/month/kind. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, kind, doc_year, doc_month, doc_date, summary, size_bytes, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: data ?? [] });
}
