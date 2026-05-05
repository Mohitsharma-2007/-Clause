"use client";

import React from "react";
import type { VizSpec } from "@/lib/viz/parse";

type Datum = { label?: string; value?: number; x?: number; y?: number };

const PALETTE = [
  "var(--foreground)",
  "rgba(245,241,232,0.65)",
  "rgba(245,241,232,0.45)",
  "rgba(245,241,232,0.30)",
  "rgba(245,241,232,0.20)",
  "rgba(245,241,232,0.12)",
];

export default function Viz({ spec }: { spec: VizSpec }) {
  const Body = (() => {
    switch (spec.type) {
      case "bar":
        return <BarChart spec={spec} />;
      case "line":
        return <LineChart spec={spec} />;
      case "area":
        return <LineChart spec={spec} filled />;
      case "pie":
        return <PieChart spec={spec} />;
      case "scatter":
        return <ScatterChart spec={spec} />;
      case "kpi":
        return <KpiBlock spec={spec} />;
      case "table":
        return <TableBlock spec={spec} />;
      default:
        return <Empty msg={`Unsupported viz type: ${spec.type}`} />;
    }
  })();

  return (
    <figure className="my-4 rounded-2xl border border-foreground/8 bg-surface/40 p-5">
      <figcaption className="flex items-center justify-between mb-4">
        <div className="font-display text-sm font-medium tracking-tight">
          {spec.title ?? "Visualization"}
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.24em] text-subtle">
          {spec.type}
        </span>
      </figcaption>
      {Body}
      {(spec.x || spec.y) && (
        <div className="mt-3 flex justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-subtle">
          {spec.x && <span>x · {spec.x}</span>}
          {spec.y && <span>y · {spec.y}</span>}
        </div>
      )}
    </figure>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-xs text-muted-foreground italic">{msg}</div>;
}

/* ─────────── Bar ─────────── */
function BarChart({ spec }: { spec: VizSpec }) {
  const data: Datum[] = spec.data ?? [];
  if (data.length === 0) return <Empty msg="No data" />;
  const values = data.map((d) => Number(d.value ?? 0));
  const max = Math.max(...values, 1);
  const W = 600, H = 240, P = 28;
  const innerW = W - P * 2;
  const innerH = H - P * 2;
  const bw = (innerW / data.length) * 0.7;
  const gap = (innerW / data.length) * 0.3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="rgba(245,241,232,0.12)" />
      {data.map((d, i) => {
        const v = Number(d.value ?? 0);
        const h = (v / max) * innerH;
        const x = P + i * (bw + gap);
        const y = H - P - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} fill={PALETTE[0]} rx={2} />
            <text
              x={x + bw / 2}
              y={H - P + 14}
              textAnchor="middle"
              fontSize={9}
              fill="var(--subtle)"
              fontFamily="var(--font-mono)"
              style={{ textTransform: "uppercase", letterSpacing: "0.18em" }}
            >
              {String(d.label ?? i + 1).slice(0, 10)}
            </text>
            <text
              x={x + bw / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize={10}
              fill="var(--foreground-muted)"
              fontFamily="var(--font-mono)"
            >
              {formatNum(v)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────── Line / Area ─────────── */
function LineChart({ spec, filled = false }: { spec: VizSpec; filled?: boolean }) {
  const data: Datum[] = spec.data ?? [];
  if (data.length < 2) return <Empty msg="Need at least 2 points" />;
  const values = data.map((d) => Number(d.value ?? 0));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const W = 600, H = 240, P = 28;
  const innerW = W - P * 2;
  const innerH = H - P * 2;
  const stepX = innerW / (data.length - 1);

  const pts = data.map((d, i) => {
    const v = Number(d.value ?? 0);
    const x = P + i * stepX;
    const y = max === min ? H / 2 : H - P - ((v - min) / (max - min)) * innerH;
    return [x, y] as const;
  });

  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L ${(W - P).toFixed(1)} ${H - P} L ${P} ${H - P} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={P} x2={W - P}
          y1={P + innerH * t} y2={P + innerH * t}
          stroke="rgba(245,241,232,0.05)"
        />
      ))}
      {filled && <path d={area} fill="rgba(245,241,232,0.12)" />}
      <path d={path} stroke={PALETTE[0]} strokeWidth={1.6} fill="none" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={PALETTE[0]} />
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={P + i * stepX}
          y={H - P + 14}
          textAnchor="middle"
          fontSize={9}
          fill="var(--subtle)"
          fontFamily="var(--font-mono)"
          style={{ textTransform: "uppercase", letterSpacing: "0.18em" }}
        >
          {String(d.label ?? i + 1).slice(0, 10)}
        </text>
      ))}
    </svg>
  );
}

/* ─────────── Pie ─────────── */
function PieChart({ spec }: { spec: VizSpec }) {
  const data: Datum[] = spec.data ?? [];
  if (data.length === 0) return <Empty msg="No data" />;
  const values = data.map((d) => Math.max(0, Number(d.value ?? 0)));
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = 110, cy = 110, r = 90;
  // Build cumulative offsets without post-render mutation.
  const cumulative = values.reduce<number[]>(
    (acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v],
    [0],
  );
  const arcs = values.map((_, i) => {
    const a0 = (cumulative[i] / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = (cumulative[i + 1] / total) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 220 220" className="w-44 h-44 shrink-0">
        {arcs.map((d, i) => (
          <path key={i} d={d} fill={PALETTE[i % PALETTE.length]} stroke="var(--background)" strokeWidth={1} />
        ))}
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d, i) => {
          const v = Number(d.value ?? 0);
          const pct = ((v / total) * 100).toFixed(1);
          return (
            <li key={i} className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="text-foreground-muted">{d.label ?? `#${i + 1}`}</span>
              <span className="text-subtle">{formatNum(v)} ({pct}%)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────── Scatter ─────────── */
function ScatterChart({ spec }: { spec: VizSpec }) {
  const data: Datum[] = spec.data ?? [];
  if (data.length === 0) return <Empty msg="No data" />;
  const xs = data.map((d) => Number(d.x ?? 0));
  const ys = data.map((d) => Number(d.y ?? 0));
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  const W = 600, H = 240, P = 28;
  const innerW = W - P * 2;
  const innerH = H - P * 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="rgba(245,241,232,0.12)" />
      <line x1={P} y1={P} x2={P} y2={H - P} stroke="rgba(245,241,232,0.12)" />
      {data.map((d, i) => {
        const x = P + ((Number(d.x) - xmin) / Math.max(xmax - xmin, 1e-9)) * innerW;
        const y = H - P - ((Number(d.y) - ymin) / Math.max(ymax - ymin, 1e-9)) * innerH;
        return <circle key={i} cx={x} cy={y} r={3.5} fill={PALETTE[0]} fillOpacity={0.85} />;
      })}
    </svg>
  );
}

/* ─────────── KPI ─────────── */
function KpiBlock({ spec }: { spec: VizSpec }) {
  const data: Datum[] = spec.data ?? [];
  if (data.length === 0) return <Empty msg="No data" />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {data.map((d, i) => (
        <div key={i} className="rounded-xl border border-foreground/8 bg-elevated/30 p-4">
          <div className="text-[9px] font-mono uppercase tracking-[0.24em] text-subtle">{d.label}</div>
          <div className="font-display text-3xl font-light tracking-tight mt-1">
            {formatNum(Number(d.value ?? 0))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Table ─────────── */
function TableBlock({ spec }: { spec: VizSpec }) {
  const cols = spec.columns ?? [];
  const rows = spec.rows ?? [];
  if (cols.length === 0 || rows.length === 0) return <Empty msg="No rows" />;
  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/8">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-foreground/8 bg-elevated/30">
            {cols.map((c) => (
              <th
                key={c}
                className="text-left px-3 py-2 font-mono uppercase tracking-[0.18em] text-[10px] text-subtle"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-foreground/5 last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-3 py-2 font-light text-foreground-muted">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  if (abs < 1 && abs > 0) return n.toFixed(2);
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
