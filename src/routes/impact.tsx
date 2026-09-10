import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/shell";
import { Bar, Chip, Panel, Stat, num } from "@/components/widgets";
import { GOLDEN_CLUSTER_ID, GOLDEN_DISTRICT_ID, clusterById, districtById, infraFor } from "@/data/civic";
import { priorityFor, recommendationFor } from "@/lib/priority";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Monitor — CivicNexus AI" },
      {
        name: "description",
        content: "Projected before-and-after impact of the approved investment: coverage, travel time, school attendance and citizen sentiment.",
      },
      { property: "og:title", content: "Impact Monitor — CivicNexus AI" },
      {
        property: "og:description",
        content: "Track what changes after an investment is approved — the golden-thread transport project in Anantapur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImpactPage,
});

const PROJECTIONS = [
  { metric: "Bus service coverage", before: 22, after: 78, unit: "% of habitations" },
  { metric: "Average walk to school", before: 92, after: 25, unit: "index (minutes × distance)", invert: true },
  { metric: "Hospital reach within 45 min", before: 31, after: 84, unit: "% of residents" },
  { metric: "Girls' school attendance", before: 68, after: 91, unit: "%" },
  { metric: "Weekly market access trips", before: 40, after: 85, unit: "% of households" },
];

function ImpactPage() {
  const cluster = clusterById(GOLDEN_CLUSTER_ID)!;
  const district = districtById(GOLDEN_DISTRICT_ID)!;
  const priority = priorityFor(GOLDEN_CLUSTER_ID)!;
  const rec = recommendationFor(GOLDEN_CLUSTER_ID)!;
  const infra = infraFor(GOLDEN_DISTRICT_ID, "Transport");

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Impact Monitor</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              What changes if the golden-thread recommendation is funded? Projections for{" "}
              <span className="font-medium text-foreground">
                {rec.project} · {district.name}, {district.state}
              </span>{" "}
              over an {rec.horizonMonths}-month horizon.
            </p>
          </div>
          <Chip tone="amber">Projected — pre-implementation baseline</Chip>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Budget" value={num(rec.budgetCr) + " Cr ₹"} hint={`cluster ${cluster.id} · score ${priority.priority.score}`} />
          <Stat label="Beneficiaries" value={num(rec.beneficiaries)} hint="residents in affected block" />
          <Stat label="Reports driving this" value={num(cluster.requestCount)} hint="converging citizen voices" />
          <Stat label="Current coverage" value={`${infra?.coveragePct ?? 22}%`} hint="bus service to habitations" accent />
        </div>

        <Panel title="Before → after" subtitle="Baseline today vs projected at project completion">
          <div className="space-y-6">
            {PROJECTIONS.map((p) => (
              <div key={p.metric}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{p.metric}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.before}
                    {"invert" in p && p.invert ? " → " : " → "}
                    <span className="font-semibold text-primary-ink">{p.after}</span>{" "}
                    <span className="text-muted-foreground">· {p.unit}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] uppercase tracking-wide text-muted-foreground">Before</span>
                    <Bar value={p.before} max={100} className="bg-muted-foreground/40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] uppercase tracking-wide text-muted-foreground">After</span>
                    <Bar value={p.after} max={100} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="How impact is verified" subtitle="Closing the loop back to citizens">
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <div className="font-display font-semibold">1 · Service telemetry</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Bus GPS pings, route timetables and ridership counts stream into the same coverage index that flagged
                the gap — the metric that moves is the metric that was broken.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="font-display font-semibold">2 · Citizen re-survey</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                The original reporters are re-contacted in their own language at 3, 6 and 12 months. Sentiment shifts
                feed straight back into the demand model.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="font-display font-semibold">3 · Independent audit</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Fund release milestones, contractor records and field photos are logged to the governance ledger for
                public inspection.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
