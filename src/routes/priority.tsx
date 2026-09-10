import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/shell";
import { Bar, Chip, Panel, bandTone, num } from "@/components/widgets";
import { GOLDEN_CLUSTER_ID, districtById } from "@/data/civic";
import { rankedClusters } from "@/lib/priority";

export const Route = createFileRoute("/priority")({
  head: () => ({
    meta: [
      { title: "Priority Engine — CivicNexus AI" },
      {
        name: "description",
        content: "Every cluster scored 0–100 across six explainable factors: demand, severity, population, infrastructure gap, equity and urgency.",
      },
      { property: "og:title", content: "Priority Engine — CivicNexus AI" },
      {
        property: "og:description",
        content: "Transparent, factor-by-factor priority scoring for every civic issue cluster.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PriorityPage,
});

function PriorityPage() {
  const [selectedId, setSelectedId] = useState(GOLDEN_CLUSTER_ID);
  const selected = rankedClusters.find((r) => r.cluster.id === selectedId) ?? rankedClusters[0]!;
  const district = districtById(selected.cluster.districtId);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Priority Engine</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            No black box. Every cluster is scored 0–100 across six weighted factors, and each factor shows the exact
            evidence behind its value.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Panel title="Ranked clusters" subtitle={`${rankedClusters.length} clusters, sorted by score`}>
            <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
              {rankedClusters.map(({ cluster, priority }, i) => {
                const d = districtById(cluster.districtId);
                const active = cluster.id === selected.cluster.id;
                return (
                  <button
                    key={cluster.id}
                    onClick={() => setSelectedId(cluster.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/60"
                    }`}
                  >
                    <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground">#{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {cluster.category} · {d?.name}
                      </span>
                      <span className="block font-mono text-[11px] text-muted-foreground">
                        {cluster.id} · {cluster.requestCount} reports
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Chip tone={bandTone(priority.band)}>{priority.band}</Chip>
                      <span className="font-display text-base font-bold">{priority.score}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel
            title={`Factor breakdown — ${selected.cluster.id}`}
            subtitle={`${selected.cluster.category} in ${district?.name}, ${district?.state} · ${num(selected.cluster.populationImpact)} residents affected`}
            actions={<Chip tone={bandTone(selected.priority.band)}>{selected.priority.band}</Chip>}
          >
            <div className="mb-5 flex items-end gap-2">
              <span className="font-display text-5xl font-bold tracking-tight">{selected.priority.score}</span>
              <span className="pb-1.5 text-sm text-muted-foreground">/100 composite</span>
            </div>
            <div className="space-y-4">
              {selected.priority.factors.map((f) => (
                <div key={f.key}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-medium">
                      {f.label}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">weight {f.weight}</span>
                    </span>
                    <span className="font-mono text-xs">
                      {Math.round(f.value)}/{f.weight}
                    </span>
                  </div>
                  <Bar value={f.value} max={f.weight} className={f.value / f.weight > 0.75 ? "bg-amber" : undefined} />
                  <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Why this matters: an official can defend this score line by line in a public hearing. Change any input
              and the score — and its explanation — changes with it.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
