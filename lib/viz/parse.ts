/**
 * Parse the assistant's markdown for ```clause:viz blocks.
 * Returns segments in order: text | viz | text | viz | ...
 */

export type VizSpec = {
  type:
    | "bar"
    | "line"
    | "area"
    | "pie"
    | "donut"
    | "scatter"
    | "kpi"
    | "table"
    | "heatmap"
    | "sparkline";
  title?: string;
  subtitle?: string;
  x?: string;
  y?: string;
  data?: Array<{
    label?: string;
    value?: number;
    x?: number;
    y?: number;
    row?: string;
    col?: string;
  }>;
  columns?: string[];
  rows?: Array<Array<string | number>>;
  unit?: string;
  trend?: number;
};

export type Segment = { kind: "text"; content: string } | { kind: "viz"; spec: VizSpec };

const BLOCK_RE = /```clause:viz\s*([\s\S]*?)```/g;

export function parseAssistantContent(content: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(BLOCK_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      const text = content.slice(lastIndex, start).trim();
      if (text) segments.push({ kind: "text", content: text });
    }
    const raw = (match[1] ?? "").trim();
    const spec = safeParseSpec(raw);
    if (spec) segments.push({ kind: "viz", spec });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    const tail = content.slice(lastIndex).trim();
    if (tail) segments.push({ kind: "text", content: tail });
  }
  if (segments.length === 0) segments.push({ kind: "text", content });
  return segments;
}

function safeParseSpec(raw: string): VizSpec | null {
  try {
    const parsed = JSON.parse(raw) as VizSpec;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.type) return null;
    return parsed;
  } catch {
    return null;
  }
}
