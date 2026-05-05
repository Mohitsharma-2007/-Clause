"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Loader2, ExternalLink, Download } from "lucide-react";
import Viz from "@/components/viz/Viz";
import type { VizSpec } from "@/lib/viz/parse";

export type CanvasItem =
  | { type: "doc"; documentId: string; filename: string; jumpToSnippet?: string }
  | { type: "viz"; spec: VizSpec; title?: string };

export default function Canvas({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: CanvasItem | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && item && (
        <motion.aside
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-y-0 right-0 z-30 w-full md:w-[44rem] lg:w-[52rem] bg-background border-l border-foreground/8 shadow-2xl flex flex-col"
        >
          <header className="h-16 border-b border-foreground/8 flex items-center justify-between px-6 shrink-0">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                Canvas
              </p>
              <p className="text-sm font-medium tracking-tight truncate">
                {item.type === "doc" ? item.filename : item.title ?? "Visualization"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-elevated/50 text-muted-foreground hover:text-foreground"
              aria-label="Close canvas"
            >
              <X size={18} strokeWidth={1.4} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            {item.type === "doc" ? (
              <DocPreview documentId={item.documentId} jumpToSnippet={item.jumpToSnippet} />
            ) : (
              <Viz spec={item.spec} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DocPreview({
  documentId,
  jumpToSnippet,
}: {
  documentId: string;
  jumpToSnippet?: string;
}) {
  const [data, setData] = useState<{
    document: {
      filename: string;
      summary: string | null;
      kind: string | null;
      doc_year: number | null;
      doc_month: number | null;
      mime_type: string | null;
    } | null;
    chunks: { chunk_index: number; content: string; page_number: number | null }[];
    signedUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/documents/${documentId}`);
        const j = await r.json();
        if (alive) {
          setData(j);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 size={14} className="animate-spin" /> Loading document…
      </div>
    );
  }
  if (!data?.document) return <div className="text-xs text-muted-foreground">Document unavailable.</div>;

  const d = data.document;
  const url = data.signedUrl;
  const isPdf =
    !!url && (d.mime_type === "application/pdf" || /\.pdf(\?|$)/i.test(d.filename));
  const isImage = !!url && (d.mime_type ?? "").startsWith("image/");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl border border-foreground/10 bg-elevated/40 flex items-center justify-center shrink-0">
          <FileText size={16} strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-medium tracking-tight">{d.filename}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {d.kind && <Tag>{d.kind}</Tag>}
            {d.doc_year && (
              <Tag>
                {d.doc_month ? `Month ${d.doc_month} · ` : ""}
                {d.doc_year}
              </Tag>
            )}
          </div>
          {d.summary && (
            <p className="text-sm text-muted-foreground font-light leading-relaxed mt-3">
              {d.summary}
            </p>
          )}
          {url && (
            <div className="flex items-center gap-2 mt-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/10 hover:border-foreground/30 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink size={12} strokeWidth={1.4} /> Open
              </a>
              <a
                href={url}
                download={d.filename}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/10 hover:border-foreground/30 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download size={12} strokeWidth={1.4} /> Download
              </a>
            </div>
          )}
        </div>
      </div>

      {(isPdf || isImage) && url && (
        <div className="rounded-xl overflow-hidden border border-foreground/10 bg-elevated/40">
          {isPdf ? (
            <iframe
              src={url}
              title={d.filename}
              className="w-full h-[60vh] bg-white"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={d.filename} className="w-full max-h-[60vh] object-contain bg-black" />
          )}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
          Indexed passages ({data.chunks.length})
        </p>
        <div className="space-y-3">
          {data.chunks.map((c) => (
            <ChunkBlock
              key={c.chunk_index}
              content={c.content}
              page={c.page_number}
              highlight={jumpToSnippet}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChunkBlock({
  content,
  page,
  highlight,
}: {
  content: string;
  page: number | null;
  highlight?: string;
}) {
  const isMatch = !!highlight && content.includes(highlight.slice(0, 60));
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isMatch ? "border-foreground/40 bg-elevated/40" : "border-foreground/8 bg-surface/30"
      }`}
    >
      <div className="text-[9px] font-mono uppercase tracking-[0.24em] text-subtle mb-2">
        {page ? `Page ${page}` : "Passage"}
      </div>
      <p className="text-sm font-light leading-relaxed whitespace-pre-wrap text-foreground-muted">
        {content}
      </p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-subtle px-2 py-0.5 rounded-full border border-foreground/8">
      {children}
    </span>
  );
}
