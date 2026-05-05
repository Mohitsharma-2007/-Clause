import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Find the document so we can also remove its blob (best-effort).
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("documents").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (doc?.storage_path) {
    try {
      await supabase.storage.from("clause-files").remove([doc.storage_path]);
    } catch {
      /* best-effort */
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: chunks } = await supabase
    .from("document_chunks")
    .select("chunk_index, content, page_number")
    .eq("document_id", id)
    .order("chunk_index", { ascending: true })
    .limit(50);

  // Best-effort signed URL so the canvas can render the original file.
  // 1-hour expiry is enough for a session; clients re-fetch on tab focus.
  let signedUrl: string | null = null;
  if (doc.storage_path) {
    const { data: signed } = await supabase.storage
      .from("clause-files")
      .createSignedUrl(doc.storage_path, 60 * 60);
    signedUrl = signed?.signedUrl ?? null;
  }

  return NextResponse.json({ document: doc, chunks: chunks ?? [], signedUrl });
}
