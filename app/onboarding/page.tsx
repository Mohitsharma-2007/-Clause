"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Building2,
  Briefcase,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Company", icon: <Building2 size={16} strokeWidth={1.4} /> },
  { id: 2, title: "Role", icon: <Briefcase size={16} strokeWidth={1.4} /> },
];

const INDUSTRIES = [
  "Banking",
  "FinTech",
  "Asset Management",
  "Insurance",
  "Crypto / Digital Assets",
  "Capital Markets",
  "Other",
];

const ROLES = [
  "Compliance Officer",
  "Risk Manager",
  "Internal Auditor",
  "Finance / Controller",
  "Operations",
  "Founder / Executive",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    role: "",
  });

  const next = () => setStep((p) => Math.min(p + 1, STEPS.length));
  const back = () => setStep((p) => Math.max(p - 1, 1));

  const canProceed =
    (step === 1 && form.companyName.trim().length > 0 && form.industry !== "") ||
    (step === 2 && form.role !== "");

  async function provision() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Request failed (${res.status})`);
      }
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col bg-mesh">
      <nav className="px-6 md:px-10 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-foreground/15 bg-surface/40 flex items-center justify-center">
            <Shield className="w-4 h-4" strokeWidth={1.4} />
          </div>
          <span className="font-display text-xl font-medium tracking-tight">
            Clause<span className="text-foreground/40">.</span>
          </span>
        </Link>
        <div className="hidden sm:flex gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "w-12 h-0.5 rounded-full",
                step >= s.id ? "bg-foreground/30" : "bg-foreground/5",
              )}
            />
          ))}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              <div className="space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                  Step {step} / {STEPS.length}
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
                  {step === 1 ? (
                    <>
                      Tell us about
                      <br />
                      <span className="italic text-foreground/85">your company.</span>
                    </>
                  ) : (
                    <>
                      What&apos;s your role
                      <br />
                      <span className="italic text-foreground/85">at the firm?</span>
                    </>
                  )}
                </h1>
              </div>

              {step === 1 && (
                <div className="space-y-7">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      Company name
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder="e.g. Atlas Capital Partners"
                      className="w-full bg-transparent border-b border-foreground/10 px-1 py-3 text-lg font-light tracking-tight focus:border-foreground/40 outline-none transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      Industry
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, industry: ind }))}
                          className={cn(
                            "text-left px-4 py-3 rounded-2xl border text-sm font-light transition-colors",
                            form.industry === ind
                              ? "bg-foreground text-background border-foreground"
                              : "border-foreground/8 bg-surface/30 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    Pick the closest fit
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                        className={cn(
                          "text-left px-4 py-4 rounded-2xl border text-sm font-light transition-colors",
                          form.role === r
                            ? "bg-foreground text-background border-foreground"
                            : "border-foreground/8 bg-surface/30 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-foreground/12 bg-elevated/60 text-xs text-muted-foreground">
                  <AlertCircle size={14} strokeWidth={1.4} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-2 px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={14} strokeWidth={1.4} /> Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={!canProceed || submitting}
                  onClick={step === STEPS.length ? provision : next}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10.5px] font-medium uppercase tracking-[0.24em] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {step === STEPS.length
                    ? submitting
                      ? "Provisioning…"
                      : "Open workspace"
                    : "Continue"}
                  <ArrowRight size={14} strokeWidth={1.4} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
