"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  AlertCircle,
  User,
  Database,
  ChevronDown,
  FileText,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENTS, type AgentId } from "@/lib/ai/agents";
import { parseAssistantContent } from "@/lib/viz/parse";
import Viz from "@/components/viz/Viz";
import Canvas, { type CanvasItem } from "@/components/canvas/Canvas";

export type Citation = {
  n: number;
  documentId: string;
  filename: string;
  page: number | null;
  similarity: number;
  snippet: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
  citations?: Citation[];
};

const SUGGESTIONS_BY_AGENT: Record<AgentId, string[]> = {
  general: [
    "Summarize the latest FATF guidance on virtual asset transfers.",
    "Is a $9,800 cash deposit a structuring red flag under BSA?",
  ],
  "data-analyst": [
    "Profile the uploaded ledger — show the top 10 counterparties by volume.",
    "Plot monthly wire totals for the last 12 months.",
  ],
  "risk-auditor": [
    "Audit my AML policy against FATF Recommendations 10–12. Score each control.",
    "List SOX 404 control gaps you can find in the uploaded SOC 2 report.",
  ],
  "policy-drafter": [
    "Draft a Customer Risk Rating policy section for a digital-asset firm.",
    "Red-line the Travel Rule procedure in our AML policy.",
  ],
  "transaction-forensics": [
    "Find structuring clusters under $10k in Q4 wires.",
    "Show the rapid pass-through patterns in the uploaded ledger.",
  ],
  "sanctions-screener": [
    "Screen 'Globex Holdings, Cyprus' and 'Yuri Petrov, Moscow' against OFAC + EU lists.",
    "Match these counterparties: Aldebaran SA, BlueRiver Trust, Phoenix Energy DMCC.",
  ],
  "disclosure-writer": [
    "Draft a SAR narrative based on the structuring findings.",
    "Write a board memo summarising the Q4 audit results.",
  ],
};

export default function AIConsole({ initialHistory }: { initialHistory: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<AgentId>("general");
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [canvasItem, setCanvasItem] = useState<CanvasItem | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const agent = useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(content: string) {
    const text = content.trim();
    if (!text || pending) return;
    setError(null);

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, agent: agentId, useRag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.content,
          agent: data.agent,
          citations: data.citations ?? [],
        },
      ]);
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setPending(false);
    }
  }

  const suggestions = SUGGESTIONS_BY_AGENT[agentId] ?? SUGGESTIONS_BY_AGENT.general;

  return (
    <>
      <div className="h-full max-h-[calc(100vh-12rem)] flex flex-col rounded-3xl border border-foreground/8 bg-surface/30 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-foreground/8 bg-background/60">
          <div className="relative">
            <button
              onClick={() => setAgentMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/10 bg-surface/40 text-xs font-medium tracking-tight hover:border-foreground/25"
            >
              <Sparkles size={12} strokeWidth={1.4} />
              {agent.name}
              <ChevronDown size={12} strokeWidth={1.4} />
            </button>
            <AnimatePresence>
              {agentMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 mt-2 w-72 rounded-2xl border border-foreground/10 bg-elevated/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  {AGENTS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setAgentId(a.id);
                        setAgentMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-foreground/5 transition-colors",
                        a.id === agentId && "bg-foreground/8",
                      )}
                    >
                      <div className="text-sm font-medium tracking-tight">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground font-light leading-snug mt-0.5">
                        {a.tagline}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setUseRag((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.22em] transition-colors",
              useRag
                ? "bg-foreground text-background"
                : "border border-foreground/10 text-muted-foreground hover:text-foreground",
            )}
            title="Ground answers in your data room"
          >
            <Database size={12} strokeWidth={1.4} />
            RAG {useRag ? "on" : "off"}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-6">
          {messages.length === 0 && !pending && (
            <EmptyState agentName={agent.name} suggestions={suggestions} onPick={(s) => send(s)} />
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                message={m}
                onOpenCitation={(c) =>
                  setCanvasItem({
                    type: "doc",
                    documentId: c.documentId,
                    filename: c.filename,
                    jumpToSnippet: c.snippet,
                  })
                }
                onOpenViz={(spec, title) => setCanvasItem({ type: "viz", spec, title })}
              />
            ))}
          </AnimatePresence>

          {pending && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-muted-foreground font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse-soft" />
              {agent.name} is thinking…
            </motion.div>
          )}

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-foreground/15 bg-elevated/60 text-xs text-muted-foreground">
              <AlertCircle size={14} strokeWidth={1.4} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-foreground/8 p-4 md:p-5 bg-background/60 backdrop-blur-xl"
        >
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={`Ask ${agent.name} anything…`}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none px-3 py-2.5 text-sm font-light leading-relaxed placeholder:text-subtle max-h-40"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send size={15} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-subtle mt-3 px-3">
            Enter to send · Shift+Enter for newline
          </p>
        </form>
      </div>

      <Canvas open={!!canvasItem} item={canvasItem} onClose={() => setCanvasItem(null)} />
    </>
  );
}

function MessageBubble({
  message,
  onOpenCitation,
  onOpenViz,
}: {
  message: Message;
  onOpenCitation: (c: Citation) => void;
  onOpenViz: (spec: import("@/lib/viz/parse").VizSpec, title?: string) => void;
}) {
  const isUser = message.role === "user";
  const segments = useMemo(
    () => (isUser ? null : parseAssistantContent(message.content)),
    [isUser, message.content],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3 max-w-3xl", isUser && "ml-auto flex-row-reverse")}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border",
          isUser
            ? "bg-foreground text-background border-foreground"
            : "bg-elevated/60 text-foreground border-foreground/15",
        )}
      >
        {isUser ? <User size={14} strokeWidth={1.4} /> : <Sparkles size={14} strokeWidth={1.4} />}
      </div>
      <div
        className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed font-light min-w-0",
          isUser
            ? "bg-foreground text-background whitespace-pre-wrap"
            : "bg-surface/60 border border-foreground/8 text-foreground prose-clause max-w-none",
        )}
      >
        {isUser
          ? message.content
          : segments?.map((seg, i) =>
              seg.kind === "text" ? (
                <RichText key={i} content={seg.content} />
              ) : (
                <div key={i} className="not-prose">
                  <Viz spec={seg.spec} />
                  <button
                    onClick={() => onOpenViz(seg.spec, seg.spec.title)}
                    className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground mt-1"
                  >
                    <PanelRightOpen size={10} strokeWidth={1.4} className="inline mr-1" />
                    Open in canvas
                  </button>
                </div>
              ),
            )}

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-foreground/8 flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <button
                key={c.n}
                onClick={() => onOpenCitation(c)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-foreground/10 bg-elevated/40 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <FileText size={10} strokeWidth={1.4} />[{c.n}] {truncate(c.filename, 28)}
                {c.page ? ` · p.${c.page}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* Minimal markdown-ish renderer: paragraphs, **bold**, `code`, lists, [n] citation chips. */
function RichText({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        if (/^[-*]\s/.test(block.trim())) {
          const items = block.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ""));
          return (
            <ul key={i}>
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(block.trim())) {
          const items = block.split(/\n/).map((l) => l.replace(/^\d+\.\s+/, ""));
          return (
            <ol key={i}>
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        if (/^#{1,3}\s/.test(block.trim())) {
          const level = (block.match(/^#+/)?.[0].length ?? 1) as 1 | 2 | 3;
          const text = block.replace(/^#+\s+/, "");
          if (level === 1) return <h1 key={i}>{renderInline(text)}</h1>;
          if (level === 2) return <h2 key={i}>{renderInline(text)}</h2>;
          return <h3 key={i}>{renderInline(text)}</h3>;
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode[] {
  // ** bold ** , `code` , [n] citation
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    const t = m[0];
    if (t.startsWith("**")) parts.push(<strong key={key++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) parts.push(<code key={key++}>{t.slice(1, -1)}</code>);
    else parts.push(
      <sup key={key++} className="font-mono text-[0.7em] text-foreground-muted px-0.5">
        {t}
      </sup>,
    );
    lastIndex = m.index + t.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function EmptyState({
  agentName,
  suggestions,
  onPick,
}: {
  agentName: string;
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <div className="w-14 h-14 rounded-full border border-foreground/15 bg-elevated/60 flex items-center justify-center mb-6">
        <Sparkles size={20} strokeWidth={1.4} />
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight">
        {agentName} is ready.
      </h2>
      <p className="text-sm text-muted-foreground font-light max-w-md mt-3">
        Ground in your data room with the RAG toggle. Ask for a chart and you&apos;ll get one.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10 w-full max-w-2xl">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="text-left px-5 py-4 rounded-2xl border border-foreground/8 bg-surface/40 hover:border-foreground/25 hover:bg-surface/60 transition-colors text-sm font-light leading-relaxed text-muted-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
