import { NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? "https://clauseit.vercel.app/api/auth/github/callback"
  : "http://localhost:3000/api/auth/github/callback";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") || "/dashboard";

  // If GitHub OAuth not configured, redirect to login with message
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://clauseit.vercel.app' 
      : origin;
    return NextResponse.redirect(`${baseUrl}/login?error=github_not_configured`);
  }

  // Generate random state for security
  const state = Buffer.from(JSON.stringify({ next })).toString("base64");

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "read:user user:email",
    state,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}