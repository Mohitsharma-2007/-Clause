/**
 * Tiny dependency-free text chunker.
 *
 * Splits on paragraph boundaries first, falls back to sentences, then to hard
 * character windows. Approximate: 1 token ≈ 4 chars for English.
 */

const TARGET_CHARS = 1200;   // ~300 tokens
const OVERLAP_CHARS = 180;   // ~45 tokens

export type Chunk = {
  index: number;
  content: string;
  approxTokens: number;
};

export function chunkText(text: string): Chunk[] {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let buffer = "";

  const flush = () => {
    const trimmed = buffer.trim();
    if (!trimmed) return;
    chunks.push({
      index: chunks.length,
      content: trimmed,
      approxTokens: Math.ceil(trimmed.length / 4),
    });
    // Keep the last OVERLAP_CHARS of context for continuity.
    buffer = trimmed.length > OVERLAP_CHARS ? trimmed.slice(-OVERLAP_CHARS) : "";
  };

  for (const p of paragraphs) {
    if ((buffer + " " + p).length <= TARGET_CHARS) {
      buffer = buffer ? `${buffer}\n\n${p}` : p;
      continue;
    }

    // Paragraph alone exceeds budget — split by sentences then hard-wrap.
    if (p.length > TARGET_CHARS) {
      flush();
      const sentences = p.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [p];
      for (const s of sentences) {
        const sentence = s.trim();
        if (!sentence) continue;
        if ((buffer + " " + sentence).length > TARGET_CHARS) flush();
        // Sentence still too long? Hard-wrap.
        if (sentence.length > TARGET_CHARS) {
          for (let i = 0; i < sentence.length; i += TARGET_CHARS - OVERLAP_CHARS) {
            const slice = sentence.slice(i, i + TARGET_CHARS);
            chunks.push({
              index: chunks.length,
              content: slice,
              approxTokens: Math.ceil(slice.length / 4),
            });
          }
          buffer = "";
        } else {
          buffer = buffer ? `${buffer} ${sentence}` : sentence;
        }
      }
      continue;
    }

    flush();
    buffer = p;
  }

  flush();
  return chunks;
}
