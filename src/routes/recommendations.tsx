import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell";
import { Chip, Panel, inr, num } from "@/components/widgets";
import { districtById, clusterById } from "@/data/civic";
import { priorityFor, recommendations, type RecommendationStatus } from "@/lib/priority";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — CivicNexus AI" },
      {
        name: "description",
        content: "AI-generated investment recommendations with budgets, beneficiaries and rationale — each one awaiting human approval.",
      },
      { property: "og:title", content: "Recommendations — CivicNexus AI" },
      {
        property: "og:description",
        content: "Human-in-the-loop investment recommendations generated from citizen demand and infrastructure gaps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({});

  const set = (id: string, s: RecommendationStatus) => setStatuses((prev) => ({ ...prev, [id]: s }));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Recommendations</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The AI drafts the investment; the officer decides. Every recommendation stays{" "}
            <span className="font-medium text-foreground">Pending</span> until a human approves or rejects it — and
            every decision is written to the audit log.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.map((rec) => {
            const status = statuses[rec.id] ?? rec.status;
            const cluster = clusterById(rec.clusterId)!;
            const district = districtById(cluster.districtId);
            const priority = priorityFor(rec.clusterId)!;
            return (
              <Panel key={rec.id} className="flex flex-col" title={rec.project} subtitle={`${rec.id} · for cluster ${rec.clusterId}`}
                actions={
                  <Chip tone={status === "Approved" ? "primary" : status === "Rejected" ? "danger" : "amber"}>
                    {status}
                  </Chip>
                }
              >
                <p className="text-sm leading-relaxed">{rec.summary}</p>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Budget</div>
                    <div className="mt-0.5 font-display font-bold">{inr(rec.budgetCr)}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Horizon</div>
                    <div className="mt-0.5 font-display font-bold">{rec.horizonMonths} mo</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Beneficiaries</div>
                    <div className="mt-0.5 font-display font-bold">{num(rec.beneficiaries)}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    AI rationale · priority {priority.priority.score}/100 · {district?.name}, {district?.state}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rec.rationale}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => set(rec.id, "Approved")}
                    disabled={status !== "Pending"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => set(rec.id, "Rejected")}
                    disabled={status !== "Pending"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-background px-3.5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  {status !== "Pending" && (
                    <button
                      onClick={() => set(rec.id, "Pending")}
                      className="ml-auto text-xs font-medium text-muted-foreground hover:underline"
                    >
                      Reset to pending
                    </button>
                  )}
                </div>
                <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  Human-in-the-loop: this recommendation has no effect until approved by an authorised officer.
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
