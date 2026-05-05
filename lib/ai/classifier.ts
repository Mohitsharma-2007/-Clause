/**
 * Document auto-classifier — uses one cheap LLM call to derive:
 *   - kind         (Policy | Statement | Contract | KYC | Ledger | Report | Memo | Other)
 *   - doc_year     (year the doc is about, not upload year)
 *   - doc_month    (1..12 if known, else null)
 *   - doc_date     (ISO date if a single specific date is in the header/title)
 *   - summary      (≤2 sentences, business-readable)
 *
 * Output is JSON, validated. On failure we fall back to filename heuristics.
 */

import { chat } from "./providers";

export type DocMeta = {
  kind: string;
  doc_year: number | null;
  doc_month: number | null;
  doc_date: string | null;
  summary: string;
};

const KINDS = [
  "Policy",
  "Statement",
  "Contract",
  "KYC",
  "Ledger",
  "Report",
  "Memo",
  "Invoice",
  "Filing",
  "Other",
] as const;

const PROMPT = `You classify a single business or finance document. Return ONLY a JSON object with this shape:
{
  "kind": one of [${KINDS.map((k) => `"${k}"`).join(", ")}],
  "doc_year": integer year the document is about (e.g. fiscal year, statement year), or null,
  "doc_month": integer 1-12 if a specific month is the subject, or null,
  "doc_date": "YYYY-MM-DD" if a single specific date is the subject, or null,
  "summary": one or two sentences, business-readable
}
No prose. No code fences. JSON only.`;

function fallbackFromFilename(filename: string): DocMeta {
  const f = filename.toLowerCase();
  let kind = "Other";
  if (/(policy|procedure|manual)/.test(f)) kind = "Policy";
  else if (/(statement|stmt|balance)/.test(f)) kind = "Statement";
  else if (/(contract|agreement|nda|msa)/.test(f)) kind = "Contract";
  else if (/(kyc|onboard|verification)/.test(f)) kind = "KYC";
  else if (/(ledger|wires|transactions|journal)/.test(f)) kind = "Ledger";
  else if (/(report|audit|review)/.test(f)) kind = "Report";
  else if (/(invoice|bill|receipt)/.test(f)) kind = "Invoice";
  else if (/(memo|note)/.test(f)) kind = "Memo";

  const yearMatch = filename.match(/\b(19|20)\d{2}\b/);
  const monthMatch = filename.match(/\b(0?[1-9]|1[0-2])[-_/](19|20)\d{2}\b/);
  const monthNumber = monthMatch ? parseInt(monthMatch[1], 10) : null;

  return {
    kind,
    doc_year: yearMatch ? parseInt(yearMatch[0], 10) : null,
    doc_month: monthNumber,
    doc_date: null,
    summary: filename.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " "),
  };
}

function tryParseJson(s: string): unknown {
  // Strip common LLM fences if present.
  const stripped = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function classifyDocument(
  filename: string,
  textSample: string,
): Promise<DocMeta> {
  const head = textSample.slice(0, 4000);
  const userPrompt = `Filename: ${filename}\n\nFirst pages (excerpt):\n"""\n${head}\n"""`;

  try {
    const { content } = await chat([
      { role: "system", content: PROMPT },
      { role: "user", content: userPrompt },
    ]);

    const parsed = tryParseJson(content);
    if (!parsed || typeof parsed !== "object") return fallbackFromFilename(filename);

    const p = parsed as Record<string, unknown>;
    const kindRaw = typeof p.kind === "string" ? p.kind : "Other";
    const kind = (KINDS as readonly string[]).includes(kindRaw) ? kindRaw : "Other";

    const yr = typeof p.doc_year === "number" ? p.doc_year : null;
    const mo = typeof p.doc_month === "number" && p.doc_month >= 1 && p.doc_month <= 12 ? p.doc_month : null;
    const dt = typeof p.doc_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.doc_date) ? p.doc_date : null;
    const summary =
      typeof p.summary === "string" && p.summary.trim()
        ? p.summary.trim().slice(0, 600)
        : fallbackFromFilename(filename).summary;

    return { kind, doc_year: yr, doc_month: mo, doc_date: dt, summary };
  } catch {
    return fallbackFromFilename(filename);
  }
}
