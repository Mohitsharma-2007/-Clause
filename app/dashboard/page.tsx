import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) {
    return (
      <DashboardShell
        userEmail={null}
        org={null}
        history={[]}
        configured={false}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [{ data: org }, { data: history }] = await Promise.all([
    supabase
      .from("organizations")
      .select("company_name, industry, role")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("chat_messages")
      .select("role, content, agent, citations, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50),
  ]);

  return (
    <DashboardShell
      userEmail={user.email ?? null}
      org={org ?? null}
      history={
        (history ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          agent: m.agent ?? undefined,
          citations: Array.isArray(m.citations) ? m.citations : undefined,
        }))
      }
      configured={true}
    />
  );
}
