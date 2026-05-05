import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? "https://clauseit.vercel.app/api/auth/github/callback"
  : "http://localhost:3000/api/auth/github/callback";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://clauseit.vercel.app' 
    : origin;

  // If GitHub OAuth not configured, redirect to login
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(`${baseUrl}/login?error=github_not_configured`);
  }

  let next = "/dashboard";
  
  // Decode state to get the intended redirect
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      next = decoded.next || "/dashboard";
    } catch {
      // ignore invalid state
    }
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=github_no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("GitHub token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=github_token`);
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResponse.json();

    // Get user email (might need separate call)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

    // Sign in/up with Supabase using GitHub email
    const supabase = await createClient();
    
    // Try to sign in with the GitHub email
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        skipEmailConfirmation: true,
      },
    });

    // If OAuth with Supabase works, redirect there
    if (!authError && authData?.url) {
      return NextResponse.redirect(authData.url);
    }

    // Fallback: Create a magic link or direct login with the email
    if (primaryEmail) {
      // Send magic link for this email to complete auth
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: primaryEmail,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (!magicError) {
        // Redirect to login with message that magic link was sent
        return NextResponse.redirect(`${baseUrl}/login?sent=${encodeURIComponent(primaryEmail)}`);
      }
    }

    console.error("GitHub auth fallback failed:", authError);
    return NextResponse.redirect(`${baseUrl}/login?error=github_auth_failed`);

  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=github_exception`);
  }
}