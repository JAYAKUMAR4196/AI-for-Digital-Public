import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell";
import { Chip, Panel } from "@/components/widgets";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — CivicNexus AI" },
      {
        name: "description",
        content: "Audit log, model transparency and human-in-the-loop controls for every AI recommendation CivicNexus AI produces.",
      },
      { property: "og:title", content: "Governance — CivicNexus AI" },
      {
        property: "og:description",
        content: "Every AI decision is logged, explainable and reversible. Humans approve; the audit trail remembers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GovernancePage,
});

const AUDIT_LOG = [
  {
    at: "2026-08-24 06:30 UTC",
    actor: "System · language pipeline v2.3",
    action: "Detected Telugu (96% confidence) and translated REQ-0001 to English",
    tone: "neutral" as const,
  },
  {
    at: "2026-08-24 06:31 UTC",
    actor: "System · clustering v1.8",
    action: "Matched REQ-0001 to cluster MOB-042 (similarity 0.94) — no new cluster created",
    tone: "neutral" as const,
  },
  {
    at: "2026-08-24 06:31 UTC",
    actor: "System · priority engine v3.1",
    action: "Scored MOB-042 at 91/100 (Critical). Six factor values recorded with evidence",
    tone: "neutral" as const,
  },
  {
    at: "2026-08-24 06:32 UTC",
    actor: "System · recommendation drafter",
    action: "Drafted REC-MOB-042: Rural Public Transport Expansion, ₹471 Cr, 18-month horizon — status Pending",
    tone: "amber" as const,
  },
  {
    at: "2026-08-24 09:14 UTC",
    actor: "Officer · District Collector, Anantapur",
    action: "Opened REC-MOB-042, reviewed factor breakdown and source reports REQ-0001…REQ-0162",
    tone: "neutral" as const,
  },
  {
    at: "2026-08-24 09:17 UTC",
    actor: "Officer · District Collector, Anantapur",
    action: "Approved REC-MOB-042 with note: 'Fast-track shelter construction before monsoon.'",
    tone: "primary" as const,
  },
];

const SAFEGUARDS = [
  {
    title: "Human approval is mandatory",
    body: "No recommendation can move funds, create tenders or notify departments until an authorised officer approves it. The Approve and Reject controls on the Recommendations screen are the only path out of Pending.",
  },
  {
    title: "Every score is explainable",
    body: "The Priority Engine shows each of its six factors with weights and the exact evidence used. There is no hidden model output anywhere in the decision path.",
  },
  {
    title: "Source data stays attached",
    body: "Every cluster links back to the original citizen reports — language, transcript and translation — so any decision can be traced to a real voice.",
  },
  {
    title: "Decisions are reversible",
    body: "Approvals can be reset to Pending, and every state change is appended to this audit log with actor and timestamp. Nothing is silently overwritten.",
  },
];

function GovernancePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Governance</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            AI advises; humans decide; the ledger remembers. This is the accountability layer of CivicNexus AI.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Audit log" subtitle="Golden-thread trace, end to end">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {AUDIT_LOG.map((e, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ${
                      e.tone === "amber" ? "bg-amber" : e.tone === "primary" ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="font-mono text-[11px] text-muted-foreground">{e.at}</div>
                  <div className="mt-0.5 text-xs font-medium">{e.actor}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{e.action}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <div className="space-y-4">
            <Panel title="Safeguards" subtitle="Built into every screen, not bolted on">
              <ul className="space-y-4">
                {SAFEGUARDS.map((s) => (
                  <li key={s.title} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Model registry" subtitle="What is running and where">
              <div className="space-y-2.5 text-xs">
                {[
                  ["Language detection", "script + lexical heuristics", "on-device, deterministic"],
                  ["Translation", "Gemini (fallback: phrase bank)", "cloud, logged"],
                  ["Classification & severity", "multilingual keyword model", "on-device, deterministic"],
                  ["Clustering", "category × district matching", "deterministic"],
                  ["Priority scoring", "six-factor weighted composite", "fully transparent"],
                ].map(([name, model, where]) => (
                  <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                    <span className="font-medium">{name}</span>
                    <span className="text-right text-muted-foreground">
                      {model}
                      <span className="block text-[10px] uppercase tracking-wide">{where}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Chip tone="primary">All demo data is synthetic — no real citizen data</Chip>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
