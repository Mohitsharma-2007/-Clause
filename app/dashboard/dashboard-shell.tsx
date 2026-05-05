"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Terminal,
  LogOut,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AIConsole, { type Message } from "./ai-console";
import Library from "@/components/library/Library";

type Org = { company_name: string; industry: string; role: string | null } | null;

type Tab = "console" | "library" | "overview";

export default function DashboardShell({
  userEmail,
  org,
  history,
  configured,
}: {
  userEmail: string | null;
  org: Org;
  history: Message[];
  configured: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("console");

  const headerLabel: Record<Tab, string> = {
    console: "AI Console",
    library: "Data Room",
    overview: "Workspace Overview",
  };
  const headerTitle: Record<Tab, string> = {
    console: "Compliance Co-pilot",
    library: "Files & Embeddings",
    overview: org?.company_name ?? "Your Workspace",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex w-64 shrink-0 bg-black/40 border-r border-foreground/5 flex-col p-6 space-y-8 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full border border-foreground/15 flex items-center justify-center bg-surface/40">
            <Shield className="w-4 h-4" strokeWidth={1.4} />
          </div>
          <span className="font-display text-2xl font-medium tracking-tight">
            Clause<span className="text-foreground/40">.</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1.5">
          <SidebarLink
            icon={<Terminal size={18} strokeWidth={1.4} />}
            label="AI Console"
            active={activeTab === "console"}
            onClick={() => setActiveTab("console")}
          />
          <SidebarLink
            icon={<FolderOpen size={18} strokeWidth={1.4} />}
            label="Data Room"
            active={activeTab === "library"}
            onClick={() => setActiveTab("library")}
          />
          <SidebarLink
            icon={<LayoutDashboard size={18} strokeWidth={1.4} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
        </nav>

        {configured && userEmail && (
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full py-3 bg-surface/40 border border-foreground/8 text-muted-foreground rounded-full flex items-center justify-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] hover:text-foreground hover:border-foreground/25 transition-colors"
            >
              <LogOut size={14} strokeWidth={1.4} /> Sign out
            </button>
          </form>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-foreground/5 flex items-center justify-between px-6 md:px-10 shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {headerLabel[activeTab]}
            </p>
            <h1 className="font-display text-2xl font-light tracking-tight">
              {headerTitle[activeTab]}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {userEmail ? (
              <>
                <div className="text-right">
                  <p className="text-xs font-medium tracking-tight">{userEmail}</p>
                  {org?.industry && (
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.25em]">
                      {org.industry}
                      {org.role ? ` · ${org.role}` : ""}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-medium text-xs">
                  {userEmail.slice(0, 2).toUpperCase()}
                </div>
              </>
            ) : (
              <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Local Mode
              </span>
            )}
          </div>
        </header>

        {!configured && (
          <div className="px-6 md:px-10 pt-6">
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-foreground/10 bg-surface/40">
              <AlertCircle
                size={16}
                strokeWidth={1.4}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div className="text-xs text-muted-foreground font-light leading-relaxed">
                Supabase is not configured. Sign-in, file upload, and history are disabled. Add{" "}
                <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                <code className="font-mono text-foreground">.env.local</code> to enable them. The AI
                Console still works once an LLM key is set.
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden p-6 md:p-10">
          {activeTab === "console" && <AIConsole initialHistory={history} />}
          {activeTab === "library" && <Library />}
          {activeTab === "overview" && <Overview org={org} email={userEmail} />}
        </div>
      </main>
    </div>
  );
}

function Overview({ org, email }: { org: Org; email: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card label="Account" value={email ?? "—"} mono />
        <Card label="Industry" value={org?.industry ?? "—"} />
      </div>
      <Card label="Role" value={org?.role ?? "—"} />
      <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xl">
        Open the <span className="text-foreground font-medium">AI Console</span> to chat with one
        of six agents. Drop files in the <span className="text-foreground font-medium">Data Room</span>{" "}
        and they&apos;ll be embedded, sorted, and used as grounding context for every reply.
      </p>
    </motion.div>
  );
}

function Card({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-6 rounded-2xl border border-foreground/8 bg-surface/40 space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("text-sm tracking-tight break-words", mono ? "font-mono" : "font-medium")}>
        {value}
      </p>
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-medium text-sm tracking-tight">{label}</span>
    </button>
  );
}
