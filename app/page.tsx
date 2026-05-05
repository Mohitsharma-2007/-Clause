"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Shield,
  ArrowUpRight,
  Menu,
  X,
  FileSearch,
  Sparkles,
  Workflow,
  Layers,
  LineChart,
  Database,
} from "lucide-react";
import Link from "next/link";

const NAV = [
  { label: "Platform", href: "#platform" },
  { label: "Agents", href: "#agents" },
  { label: "Canvas", href: "#canvas" },
  { label: "Pricing", href: "#pricing" },
];

const AGENTS = [
  {
    name: "Data Analyst",
    blurb: "Cleans, joins and segments uploaded files. Returns charts, tables, and outliers without you writing SQL.",
  },
  {
    name: "Risk Auditor",
    blurb: "Reads policy docs and transactions, flags control gaps against AML, SOX, MiFID II, FATF, OFAC.",
  },
  {
    name: "Policy Drafter",
    blurb: "Drafts and red-lines internal policy and procedure documents grounded in your existing material.",
  },
  {
    name: "Transaction Forensics",
    blurb: "Pattern-matches structuring, layering, and rapid-movement signals across ledger uploads.",
  },
  {
    name: "Sanctions Screener",
    blurb: "Cross-checks counterparty names and identifiers against OFAC, UN, EU, UK consolidated lists.",
  },
  {
    name: "Disclosure Writer",
    blurb: "Turns evidence and findings into board-ready reports, SAR narratives, and regulator submissions.",
  },
];

const CAPABILITIES = [
  {
    icon: <Database size={18} strokeWidth={1.4} />,
    title: "Drop your data room",
    body: "PDFs, statements, ledgers, contracts, KYC files. Auto-sorted by year, month, and kind on upload.",
  },
  {
    icon: <FileSearch size={18} strokeWidth={1.4} />,
    title: "Retrieval that cites",
    body: "Every answer is grounded in your own documents, with the source page, paragraph, and confidence shown.",
  },
  {
    icon: <Workflow size={18} strokeWidth={1.4} />,
    title: "Six specialist agents",
    body: "Data analyst, risk auditor, policy drafter, forensics, sanctions, disclosures — pick one or chain them.",
  },
  {
    icon: <LineChart size={18} strokeWidth={1.4} />,
    title: "Visuals on demand",
    body: "Ask for a chart, get a chart. The model emits structured viz blocks rendered natively in the canvas.",
  },
  {
    icon: <Layers size={18} strokeWidth={1.4} />,
    title: "Canvas, side-by-side",
    body: "Documents, analysis, and charts live in a side panel. Read the source while the model explains it.",
  },
  {
    icon: <Shield size={18} strokeWidth={1.4} />,
    title: "Single-tenant by default",
    body: "Row-level isolation in Supabase. Your files, your embeddings, your audit trail. No shared models.",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(245,241,232,0)", "rgba(245,241,232,0.06)"]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-50 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 -z-40 pointer-events-none">
        <div className="absolute -top-40 left-1/3 w-[720px] h-[720px] rounded-full bg-foreground/[0.018] blur-[180px]" />
        <div className="absolute bottom-0 right-0 w-[560px] h-[560px] rounded-full bg-accent/[0.025] blur-[160px]" />
      </div>

      {/* Nav */}
      <motion.nav
        style={{ backgroundColor: navBg, borderColor: navBorder }}
        className="fixed top-0 w-full z-50 px-6 md:px-10 py-5 flex items-center justify-between backdrop-blur-xl border-b"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-foreground/15 flex items-center justify-center bg-surface/40">
            <Shield className="w-4 h-4" strokeWidth={1.4} />
          </div>
          <span className="font-display text-2xl font-medium tracking-tight">
            Clause<span className="text-foreground/40">.</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-9">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="group px-5 py-2.5 rounded-full bg-foreground text-background"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.24em]">
              Get Access
            </span>
            <ArrowUpRight className="inline-block ml-1.5 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} strokeWidth={1.4} /> : <Menu size={22} strokeWidth={1.4} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-40 bg-black p-10 lg:hidden flex flex-col"
          >
            <div className="flex flex-col gap-7 mt-24">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-display text-5xl font-light tracking-tight hover:text-foreground/70"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-4 rounded-full border border-foreground/12 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-4 rounded-full bg-foreground text-background text-center text-[11px] font-medium uppercase tracking-[0.24em]"
              >
                Get access
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 md:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-foreground/10 bg-surface/40 mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-soft" />
            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
              RAG · Agents · Canvas
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95]"
          >
            Compliance,
            <br />
            <span className="italic text-foreground/85">grounded</span> in your data.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mt-8"
          >
            Drop in your statements, contracts and KYC files. Clause sorts them by year, month and kind,
            embeds them, and routes every question through a panel of finance-trained agents — with
            citations, charts, and a side-by-side canvas you can read.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col md:flex-row items-center justify-center gap-3 mt-12"
          >
            <Link
              href="/onboarding"
              className="group px-7 py-4 rounded-full bg-foreground text-background flex items-center gap-2"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.24em]">
                Open the workspace
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-4 rounded-full border border-foreground/12 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* Hero canvas mock */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-24"
        >
          <div className="relative rounded-3xl border border-foreground/8 bg-surface/30 overflow-hidden glass-strong">
            <div className="px-5 py-3 border-b border-foreground/5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
              <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.24em] text-subtle">
                clause / canvas
              </span>
            </div>
            <div className="grid md:grid-cols-[1.2fr_1fr] min-h-[360px]">
              <div className="p-8 space-y-5 border-r border-foreground/5">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-subtle">Console</div>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">You</div>
                  <div className="text-sm font-light leading-relaxed">
                    Audit Q4 wires above $25k for structuring patterns. Cite the rule and chart by week.
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles size={12} strokeWidth={1.4} /> Transaction Forensics agent
                  </div>
                  <div className="text-sm font-light leading-relaxed">
                    Reviewed 412 outbound wires from <em>ledger_q4.csv</em>. Flagged 7 clusters of
                    sub-$10k transfers within 24h windows from the same originator — pattern consistent
                    with structuring under <strong>31 USC §5324</strong>.
                  </div>
                </div>
              </div>
              <div className="p-8 bg-black/40">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-subtle mb-4">
                  Canvas — wires_by_week.bar
                </div>
                <div className="h-44 flex items-end gap-2">
                  {[28, 45, 22, 68, 55, 92, 41, 35, 78, 110, 64, 48].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 bg-foreground/85 rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.22em] text-subtle">
                  Wk 1 → Wk 12
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Capabilities */}
      <section id="platform" className="px-6 md:px-10 py-24 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-4">
              Platform
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              One workspace. <span className="italic text-foreground/80">Everything in it</span>{" "}
              answers from your own data.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/5 border border-foreground/5 rounded-2xl overflow-hidden">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="bg-background p-8 space-y-4">
                <div className="w-10 h-10 rounded-full border border-foreground/12 flex items-center justify-center text-foreground">
                  {c.icon}
                </div>
                <div className="font-display text-xl font-medium tracking-tight">{c.title}</div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="px-6 md:px-10 py-24 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-4">
              Agents
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Six specialists. <span className="italic text-foreground/80">One panel.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="p-7 rounded-2xl border border-foreground/8 bg-surface/30 space-y-3 hover:border-foreground/20 transition-colors"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-subtle">
                  {String(i + 1).padStart(2, "0")} / 06
                </div>
                <div className="font-display text-2xl font-medium tracking-tight">{a.name}</div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{a.blurb}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Canvas */}
      <section id="canvas" className="px-6 md:px-10 py-24 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-4">
              Canvas
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Read the source. <span className="italic text-foreground/80">Watch the model think.</span>
            </h2>
            <p className="text-base text-muted-foreground font-light leading-relaxed mt-6 max-w-lg">
              The canvas opens beside the chat. Documents, tables, charts, and findings live there —
              cross-referenced to the answer on the left. No tab switching. No copy-paste. Click any
              citation to jump to the exact paragraph it came from.
            </p>
          </div>
          <div className="rounded-3xl border border-foreground/8 bg-surface/40 p-2">
            <div className="aspect-[4/3] rounded-2xl bg-black/60 border border-foreground/5 p-6 flex flex-col gap-4 font-mono text-[10px] text-subtle">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-[0.24em]">aml_policy_v3.pdf · p.14</span>
                <span className="uppercase tracking-[0.24em]">cited 3×</span>
              </div>
              <div className="flex-1 rounded-xl bg-elevated/40 border border-foreground/5 p-5 text-foreground/80 text-xs font-sans font-light leading-relaxed">
                <p className="mb-3">
                  <strong className="text-foreground">§4.2 Customer Risk Rating.</strong> All onboarding
                  flows shall assess geography, industry, ownership structure and product type prior to
                  account activation.
                </p>
                <p className="text-muted-foreground">
                  Where the rating is High, EDD must include source-of-wealth verification and senior-
                  management sign-off within 5 business days.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full border border-foreground/10 uppercase tracking-[0.22em]">
                  PDF
                </span>
                <span className="px-2 py-1 rounded-full border border-foreground/10 uppercase tracking-[0.22em]">
                  2024 · Q3
                </span>
                <span className="px-2 py-1 rounded-full border border-foreground/10 uppercase tracking-[0.22em]">
                  Policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-10 py-24 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-4">
              Pricing
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Two tiers. <span className="italic text-foreground/80">Both real.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-10 rounded-3xl border border-foreground/8 bg-surface/30 space-y-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Workspace</p>
                <div className="mt-3 font-display text-5xl font-light tracking-tight">Free</div>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Single seat. 100 documents. Six agents. Canvas. Visualizations. RAG citations. Bring your
                own model key.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-foreground/15 text-[10.5px] font-medium uppercase tracking-[0.24em] text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Start now <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-10 rounded-3xl border border-foreground/15 bg-elevated/40 space-y-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-foreground">Team</p>
                <div className="mt-3 font-display text-5xl font-light tracking-tight">On request</div>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Multi-seat workspaces, shared data rooms, audit log export, SSO, dedicated embedding
                pipeline, and on-prem-friendly deployment.
              </p>
              <Link
                href="mailto:hello@clause.app"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background text-[10.5px] font-medium uppercase tracking-[0.24em]"
              >
                Talk to us <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-12 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center bg-surface/40">
              <Shield className="w-3.5 h-3.5" strokeWidth={1.4} />
            </div>
            <span className="font-display text-xl font-medium tracking-tight">Clause.</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-subtle">
            © {new Date().getFullYear()} · Built for finance & risk teams
          </p>
        </div>
      </footer>
    </div>
  );
}
