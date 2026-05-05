import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // For production, ensure we use the correct domain
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://clauseit.vercel.app' 
    : origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user has completed onboarding
      const { data: orgData } = await supabase
        .from("organizations")
        .select("company_name")
        .eq("owner_id", data.user.id)
        .single();
      
      // If no organization exists, redirect to onboarding
      if (!orgData) {
        next = "/onboarding";
      }
      
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
}
