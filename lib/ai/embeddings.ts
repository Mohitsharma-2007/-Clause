/**
 * Embedding router — produces 768-dim vectors.
 *
 * Tries free providers in order. The first one with a configured key wins.
 *   JINA_API_KEY      → https://jina.ai (free tier, jina-embeddings-v2-base-en, 768d)
 *   HF_API_TOKEN      → https://huggingface.co/inference-api (sentence-transformers/all-mpnet-base-v2, 768d)
 *   TOGETHER_API_KEY  → Together has BAAI/bge-base-en-v1.5 (768d)
 *
 * If none are configured we throw a clean error that the caller surfaces.
 */

export const EMBED_DIM = 768;

type Embedder = {
  name: string;
  isAvailable: () => boolean;
  embed: (texts: string[]) => Promise<number[][]>;
};

async function jinaEmbed(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JINA_API_KEY!}`,
    },
    body: JSON.stringify({
      model: process.env.JINA_EMBED_MODEL ?? "jina-embeddings-v2-base-en",
      input: texts,
    }),
  });
  if (!res.ok) throw new Error(`Jina ${res.status}: ${(await res.text()).slice(0, 240)}`);
  const data: { data?: { embedding: number[] }[] } = await res.json();
  const out = data.data?.map((d) => d.embedding) ?? [];
  if (out.length !== texts.length) throw new Error("Jina returned mismatched embeddings");
  return out;
}

async function hfEmbed(texts: string[]): Promise<number[][]> {
  const model = process.env.HF_EMBED_MODEL ?? "sentence-transformers/all-mpnet-base-v2";
  const res = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HF_API_TOKEN!}`,
    },
    body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
  });
  if (!res.ok) throw new Error(`HF ${res.status}: ${(await res.text()).slice(0, 240)}`);
  const data = (await res.json()) as number[][] | number[][][];
  // HF returns either [n_inputs][dim] or [n_inputs][1][dim] depending on the model.
  const flat = (Array.isArray(data[0]) && Array.isArray((data as number[][][])[0][0]))
    ? (data as number[][][]).map((x) => x[0])
    : (data as number[][]);
  return flat;
}

async function togetherEmbed(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.together.xyz/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY!}`,
    },
    body: JSON.stringify({
      model: process.env.TOGETHER_EMBED_MODEL ?? "BAAI/bge-base-en-v1.5",
      input: texts,
    }),
  });
  if (!res.ok) throw new Error(`Together ${res.status}: ${(await res.text()).slice(0, 240)}`);
  const data: { data?: { embedding: number[] }[] } = await res.json();
  return data.data?.map((d) => d.embedding) ?? [];
}

const embedders: Embedder[] = [
  { name: "jina", isAvailable: () => !!process.env.JINA_API_KEY, embed: jinaEmbed },
  { name: "huggingface", isAvailable: () => !!process.env.HF_API_TOKEN, embed: hfEmbed },
  { name: "together", isAvailable: () => !!process.env.TOGETHER_API_KEY, embed: togetherEmbed },
];

export function isEmbeddingAvailable(): boolean {
  return embedders.some((e) => e.isAvailable());
}

export async function embed(texts: string[]): Promise<{ provider: string; vectors: number[][] }> {
  const cleaned = texts.map((t) => (t ?? "").replace(/\s+/g, " ").trim()).filter(Boolean);
  if (cleaned.length === 0) return { provider: "noop", vectors: [] };

  const available = embedders.filter((e) => e.isAvailable());
  if (available.length === 0) {
    throw new Error(
      "No embedding provider configured. Set JINA_API_KEY (or HF_API_TOKEN / TOGETHER_API_KEY) in .env.local.",
    );
  }

  const errors: string[] = [];
  for (const e of available) {
    try {
      const vectors = await e.embed(cleaned);
      if (vectors.length === cleaned.length && vectors[0]?.length === EMBED_DIM) {
        return { provider: e.name, vectors };
      }
      errors.push(`${e.name}: returned dim ${vectors[0]?.length} (expected ${EMBED_DIM})`);
    } catch (err) {
      errors.push(`${e.name}: ${(err as Error).message}`);
    }
  }
  throw new Error(`All embedders failed.\n${errors.join("\n")}`);
}
