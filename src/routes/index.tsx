import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame } from "lucide-react";

import { AppShell } from "@/components/shell";
import { Chip, Panel, SeverityChip, Stat, num } from "@/components/widgets";
import { GOLDEN_CLUSTER_ID, GOLDEN_REQUEST_ID, clusterById, districtById, requests } from "@/data/civic";
import { priorityFor, rankedClusters } from "@/lib/priority";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicNexus AI — From Citizen Voices to Smarter Public Investment" },
      {
        name: "description",
        content:
          "CivicNexus AI turns multilingual citizen feedback into clustered demand, explainable priorities and auditable public investment recommendations.",
      },
      { property: "og:title", content: "CivicNexus AI — From Citizen Voices to Smarter Public Investment" },
      {
        property: "og:description",
        content:
          "Multilingual civic feedback, clustered demand, explainable priority scoring and human-approved investment recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const golden = clusterById(GOLDEN_CLUSTER_ID)!;
  const goldenDistrict = districtById(golden.districtId)!;
  const goldenPriority = priorityFor(GOLDEN_CLUSTER_ID)!;
  const goldenRequest = requests.find((r) => r.id === GOLDEN_REQUEST_ID)!;
  const highSeverity = requests.filter((r) => r.severity === "High").length;
  const top = rankedClusters.slice(0, 5);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Where should the next rupee go?
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              CivicNexus AI listens to citizen reports in seven languages, clusters them into demand signals, and
              scores every cluster against infrastructure gaps, equity and urgency — with a human approving every
              recommendation.
            </p>
          </div>
          <Link
            to="/hotspot"
            search={{ reveal: true }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Flame className="h-4 w-4" />
            Show me where the need is greatest
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Citizen reports" value={num(requests.length)} hint="7 languages · 8 categories" />
          <Stat label="Districts covered" value="14" hint="across 7 states" />
          <Stat label="Issue clusters" value={num(rankedClusters.length)} hint="grouped by demand signal" />
          <Stat label="High-severity reports" value={num(highSeverity)} hint="flagged for urgency" accent />
        </div>

        <Panel
          title="Golden thread — one voice, traced end to end"
          subtitle="Follow a single Telugu complaint from raw audio transcript to a funded recommendation"
          className="border-amber/40 bg-amber/5"
          actions={<Chip tone="amber">Demo path</Chip>}
        >
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <blockquote className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm leading-relaxed">{goldenRequest.originalText}</p>
                <p className="mt-2 text-xs text-muted-foreground">“{goldenRequest.translatedText}”</p>
              </blockquote>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Chip tone="primary">Telugu detected</Chip>
                <Chip>{golden.category}</Chip>
                <SeverityChip severity={goldenRequest.severity} />
                <Chip tone="amber">
                  Cluster {golden.id} · {goldenDistrict.name}, {goldenDistrict.state}
                </Chip>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Priority score
                </div>
                <div className="mt-1 font-display text-4xl font-bold text-amber-ink">
                  {goldenPriority.priority.score}
                  <span className="text-base font-medium text-muted-foreground">/100</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rank #1 of {rankedClusters.length} clusters · {golden.requestCount} converging reports ·{" "}
                  {num(golden.populationImpact)} residents affected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/priority"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  See the scoring <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/citizen-voice"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Replay the analysis
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Top priority clusters" subtitle="Ranked by the explainable six-factor score">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Rank</th>
                  <th className="py-2 pr-4 font-medium">Cluster</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">District</th>
                  <th className="py-2 pr-4 font-medium">Reports</th>
                  <th className="py-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {top.map(({ cluster, priority }, i) => {
                  const d = districtById(cluster.districtId);
                  return (
                    <tr key={cluster.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">#{i + 1}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs">{cluster.id}</td>
                      <td className="py-2.5 pr-4">{cluster.category}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {d?.name}, {d?.state}
                      </td>
                      <td className="py-2.5 pr-4">{cluster.requestCount}</td>
                      <td className="py-2.5">
                        <span className="font-display font-bold">{priority.score}</span>
                        <span className="ml-2">
                          <Chip tone={priority.band === "Critical" ? "danger" : "amber"}>{priority.band}</Chip>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
