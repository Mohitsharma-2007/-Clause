import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = { storagePath: string };

/**
 * Extract text from a PDF (or other binary) already uploaded to the
 * `clause-files` storage bucket. Returns plain text the client can then
 * POST to /api/documents for chunking + embedding.
 *
 * Server-side parsing avoids shipping the ~2MB pdf.js worker to the browser
 * and keeps RAM-heavy parsing off the user's machine.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.storagePath) {
    return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // RLS: storage_path begins with `${user.id}/...`
  if (!body.storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: blob, error: dlErr } = await supabase.storage
    .from("clause-files")
    .download(body.storagePath);

  if (dlErr || !blob) {
    return NextResponse.json(
      { error: dlErr?.message ?? "File not found in storage" },
      { status: 404 },
    );
  }

  const arrayBuffer = await blob.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);

  try {
    // Dynamic import — pdf-parse loads test fixtures at top level when imported eagerly,
    // which crashes Next's bundler. require-at-call avoids that.
    const pdfParse = (await import("pdf-parse")).default as (b: Buffer) => Promise<{
      text: string;
      numpages: number;
    }>;
    const parsed = await pdfParse(buf);
    const text = (parsed.text ?? "").replace(/\u0000/g, "").trim();
    return NextResponse.json({
      ok: true,
      text,
      pages: parsed.numpages,
      bytes: buf.byteLength,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `PDF parse failed: ${(err as Error).message}` },
      { status: 422 },
    );
  }
}
