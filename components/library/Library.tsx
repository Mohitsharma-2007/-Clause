"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type DocRow = {
  id: string;
  filename: string;
  kind: string | null;
  doc_year: number | null;
  doc_month: number | null;
  doc_date: string | null;
  summary: string | null;
  size_bytes: number | null;
  status: "pending" | "processing" | "ready" | "error";
  created_at: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Library({
  onPreview,
}: {
  onPreview?: (doc: DocRow) => void;
}) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ name: string; phase: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"year" | "kind" | "month">("year");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Load failed");
      setDocs(json.documents ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/documents");
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(json.error ?? "Load failed");
        setDocs(json.documents ?? []);
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setError("Not signed in. Refresh and sign in again.");
        return;
      }

      for (const file of list) {
        setError(null);
        try {
          // 1. Upload bytes directly to Supabase Storage (RLS folder = user.id).
          setUploading({ name: file.name, phase: "Uploading" });
          const safeName = file.name.replace(/[^\w.\-]+/g, "_");
          const storagePath = `${userId}/${Date.now()}-${safeName}`;
          const { error: upErr } = await supabase.storage
            .from("clause-files")
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type || "application/octet-stream",
            });
          if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

          // 2. Get text — either client-side for plain text, or server-side for PDFs.
          setUploading({ name: file.name, phase: "Extracting" });
          let text = "";
          if (isPlainText(file)) {
            text = await file.text();
          } else if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
            const exRes = await fetch("/api/documents/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storagePath }),
            });
            const exJson = await exRes.json();
            if (!exRes.ok) throw new Error(exJson.error ?? "PDF extraction failed");
            text = exJson.text ?? "";
          } else {
            text = `[Binary upload: ${file.name}. Indexed by filename and metadata only.]`;
          }

          // 3. Ingest text → classify, chunk, embed.
          setUploading({ name: file.name, phase: "Embedding" });
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              size: file.size,
              content: text,
              storagePath,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
        } catch (e) {
          setError(`${file.name}: ${(e as Error).message}`);
        }
      }
      setUploading(null);
      refresh();
    },
    [refresh],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document and its embeddings?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) setDocs((d) => d.filter((x) => x.id !== id));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.filename.toLowerCase().includes(q) ||
        (d.summary ?? "").toLowerCase().includes(q) ||
        (d.kind ?? "").toLowerCase().includes(q),
    );
  }, [docs, search]);

  const groups = useMemo(() => groupDocs(filtered, groupBy), [filtered, groupBy]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-3xl font-light tracking-tight">Data Room</h2>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Drop files. Clause sorts them by year, month, and kind, and grounds every answer in them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["year", "month", "kind"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setGroupBy(k)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.22em]",
                groupBy === k
                  ? "bg-foreground text-background"
                  : "border border-foreground/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Search + dropzone */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-foreground/8 bg-surface/30 flex-1">
          <Search size={14} strokeWidth={1.4} className="text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, kinds, or summaries…"
            className="flex-1 bg-transparent outline-none text-sm font-light"
          />
        </div>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer text-xs font-medium uppercase tracking-[0.22em] transition-colors"
        >
          <Upload size={14} strokeWidth={1.4} />
          Drop or browse
          <input
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.pdf"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {uploading && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/10 bg-elevated/40 text-xs">
          <Loader2 size={14} strokeWidth={1.4} className="animate-spin" />
          <span className="font-mono text-muted-foreground">
            {uploading.phase} · {uploading.name}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl border border-foreground/10 bg-elevated/40 text-xs text-muted-foreground">
          <AlertCircle size={14} strokeWidth={1.4} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-8 pr-1">
        {loading && (
          <div className="text-xs text-subtle font-mono uppercase tracking-[0.22em]">Loading…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-xs text-subtle font-mono uppercase tracking-[0.22em]">
            No documents yet. Drop files above to get started.
          </div>
        )}
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                {g.label}
              </span>
              <span className="text-[10px] font-mono text-subtle">{g.items.length}</span>
              <div className="flex-1 h-px bg-foreground/5" />
            </div>
            <ul className="space-y-1">
              {g.items.map((d) => (
                <motion.li
                  key={d.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/5 bg-surface/30 hover:border-foreground/15 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-elevated/50 border border-foreground/8 flex items-center justify-center shrink-0">
                    <FileText size={14} strokeWidth={1.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium tracking-tight truncate">{d.filename}</span>
                      {d.kind && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-subtle px-2 py-0.5 rounded-full border border-foreground/8">
                          {d.kind}
                        </span>
                      )}
                      {d.doc_year && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-subtle">
                          {d.doc_month ? `${MONTHS[d.doc_month - 1]} ` : ""}
                          {d.doc_year}
                        </span>
                      )}
                      {d.status !== "ready" && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-warning">
                          {d.status}
                        </span>
                      )}
                    </div>
                    {d.summary && (
                      <p className="text-xs text-muted-foreground font-light leading-relaxed mt-1 line-clamp-1">
                        {d.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPreview?.(d)}
                      className="p-2 rounded-lg hover:bg-elevated/50 text-muted-foreground hover:text-foreground"
                      aria-label="Preview"
                    >
                      <Eye size={14} strokeWidth={1.4} />
                    </button>
                    <button
                      onClick={() => deleteDoc(d.id)}
                      className="p-2 rounded-lg hover:bg-elevated/50 text-muted-foreground hover:text-foreground"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} strokeWidth={1.4} />
                    </button>
                    <ChevronRight size={14} strokeWidth={1.4} className="text-subtle" />
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Group docs by the chosen field. */
function groupDocs(docs: DocRow[], by: "year" | "month" | "kind") {
  const map = new Map<string, DocRow[]>();
  const sortKeyFor = new Map<string, string>();

  for (const d of docs) {
    let label = "Unsorted";
    let sortKey = "0000";

    if (by === "year") {
      label = d.doc_year ? String(d.doc_year) : "Unsorted";
      sortKey = d.doc_year ? `9${String(d.doc_year).padStart(4, "0")}` : "0000";
    } else if (by === "month") {
      if (d.doc_year && d.doc_month) {
        label = `${MONTHS[d.doc_month - 1]} ${d.doc_year}`;
        sortKey = `9${d.doc_year}${String(d.doc_month).padStart(2, "0")}`;
      } else if (d.doc_year) {
        label = String(d.doc_year);
        sortKey = `9${d.doc_year}00`;
      } else {
        label = "Unsorted";
        sortKey = "0000";
      }
    } else {
      label = d.kind ?? "Unsorted";
      sortKey = (d.kind ?? "zzz").toLowerCase();
    }

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(d);
    sortKeyFor.set(label, sortKey);
  }

  return Array.from(map.entries())
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => {
      const ka = sortKeyFor.get(a.label) ?? "";
      const kb = sortKeyFor.get(b.label) ?? "";
      // year/month: descending (newest first); kind: ascending alpha
      return by === "kind" ? ka.localeCompare(kb) : kb.localeCompare(ka);
    });
}

function isPlainText(file: File): boolean {
  const t = file.type;
  return (
    t.startsWith("text/") ||
    t === "application/json" ||
    t === "application/csv" ||
    /\.(txt|md|csv|json|log|tsv|yaml|yml|xml|html|sql)$/i.test(file.name)
  );
}
