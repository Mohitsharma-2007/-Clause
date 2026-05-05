import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  companyName: string;
  industry: string;
  role?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.companyName?.trim() || !body.industry?.trim()) {
    return NextResponse.json({ error: "companyName and industry are required" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase.from("organizations").upsert(
    {
      owner_id: user.id,
      company_name: body.companyName.trim(),
      industry: body.industry.trim(),
      role: body.role?.trim() ?? null,
    },
    { onConflict: "owner_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
