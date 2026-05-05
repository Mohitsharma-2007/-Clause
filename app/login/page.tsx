"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2, AlertCircle, Mail, Code, Globe } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

function LoginInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const initialError = searchParams.get("error") ? "Authentication failed. Try again." : null;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(initialError);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setStatus("error");
      setError("Authentication is not configured. Add Supabase keys to .env.local.");
      return;
    }

    const supabase = createClient();
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://clauseit.vercel.app' 
      : window.location.origin;
    
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("sent");
  }

  async function handleOAuthSignIn(provider: 'google' | 'github') {
    console.log(`Attempting ${provider} sign in...`);
    setError(null);
    setStatus("sending");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setStatus("error");
      setError("Authentication is not configured. Add Supabase keys to .env.local.");
      return;
    }

    const supabase = createClient();
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://clauseit.vercel.app' 
      : window.location.origin;

    try {
      const { error: err, data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (err) {
        console.error(`${provider} OAuth error:`, err);
        setStatus("error");
        setError(`${provider} sign in failed: ${err.message}`);
        return;
      }
      
      console.log(`${provider} OAuth initiated successfully:`, data);
      // The OAuth flow will redirect the user, so we don't need to do anything else
    } catch (error) {
      console.error(`Unexpected ${provider} error:`, error);
      setStatus("error");
      setError(`${provider} sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 bg-mesh relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-[420px] h-[420px] rounded-full bg-foreground/[0.025] blur-[140px]" />
        <div className="absolute bottom-[15%] right-[15%] w-[360px] h-[360px] rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full max-w-md glass rounded-3xl p-10 space-y-8 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <Link href="/" className="w-12 h-12 rounded-full border border-foreground/20 bg-surface/60 flex items-center justify-center">
            <Shield className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight">
              Sign in to <span className="italic text-foreground/80">Clause.</span>
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              Choose your preferred sign-in method.
            </p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full border border-foreground/30 bg-surface/60 mx-auto flex items-center justify-center">
              <CheckCircle2 size={20} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl font-normal">Check your inbox.</h2>
            <p className="text-sm text-muted-foreground font-light">
              We sent a sign-in link to <span className="text-foreground font-medium">{email}</span>.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <div className="text-xs text-subtle text-center mb-2">Quick sign-in</div>
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={status === "sending"}
                className="w-full py-3.5 px-5 rounded-full bg-surface/60 border border-foreground/8 hover:border-foreground/35 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ display: 'flex' }}
              >
                <Globe size={18} strokeWidth={1.5} />
                <span className="text-sm font-light">Continue with Google</span>
              </button>
              
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={status === "sending"}
                className="w-full py-3.5 px-5 rounded-full bg-surface/60 border border-foreground/8 hover:border-foreground/35 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ display: 'flex' }}
              >
                <Code size={18} strokeWidth={1.5} />
                <span className="text-sm font-light">Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-foreground/8"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground ml-3">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full px-5 py-3.5 rounded-full bg-surface/60 border border-foreground/8 focus:border-foreground/35 outline-none transition-colors font-light text-sm placeholder:text-subtle"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-foreground/10 bg-surface/60 text-xs text-muted-foreground">
                  <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email}
                className="w-full py-3.5 bg-foreground text-background rounded-full text-sm font-medium uppercase tracking-[0.22em] hover:bg-foreground/90 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending…" : "Send Magic Link"}
                {status !== "sending" && (
                  <ArrowRight size={15} strokeWidth={1.75} className="group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </form>
          </div>
        )}

        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground font-light">
            New to Clause?{" "}
            <Link href="/onboarding" className="text-foreground font-medium hover:underline underline-offset-4">
              Create your workspace
            </Link>
          </p>
          <p className="text-[10px] text-subtle">
            Free for individuals • No credit card required
          </p>
        </div>
      </motion.div>

      <div className="fixed bottom-6 text-[10px] font-medium uppercase tracking-[0.32em] text-subtle">
        Secured by Supabase Auth
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
