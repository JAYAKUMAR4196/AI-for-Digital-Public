import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell";
import { Chip, Panel, num } from "@/components/widgets";
import { DISTRICTS, GOLDEN_DISTRICT_ID, clusters, districtById, requests } from "@/data/civic";
import { priorityFor } from "@/lib/priority";

export const Route = createFileRoute("/hotspot")({
  validateSearch: (s: Record<string, unknown>) => ({ reveal: s["reveal"] === true || s["reveal"] === "true" }),
  head: () => ({
    meta: [
      { title: "Hotspot Map — CivicNexus AI" },
      {
        name: "description",
        content: "A geographic view of unmet civic need: which districts have the most converging citizen demand and the deepest infrastructure gaps.",
      },
      { property: "og:title", content: "Hotspot Map — CivicNexus AI" },
      {
        property: "og:description",
        content: "District-level hotspot view of citizen demand, severity and infrastructure gaps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HotspotPage,
});

function districtStats(districtId: string) {
  const districtClusters = clusters.filter((c) => c.districtId === districtId);
  const reportCount = requests.filter((r) => r.districtId === districtId).length;
  const best = districtClusters
    .map((c) => priorityFor(c.id))
    .filter(Boolean)
    .sort((a, b) => b!.priority.score - a!.priority.score)[0];
  return { reportCount, best: best ?? undefined, clusterCount: districtClusters.length };
}

function HotspotPage() {
  const { reveal } = Route.useSearch();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(reveal ? GOLDEN_DISTRICT_ID : "");
  const [revealed, setRevealed] = useState(reveal);

  const active = revealed ? GOLDEN_DISTRICT_ID : selected;
  const activeDistrict = active ? districtById(active) : undefined;
  const activeStats = active ? districtStats(active) : undefined;

  const revealNeed = () => {
    setRevealed(true);
    setSelected(GOLDEN_DISTRICT_ID);
    void navigate({ to: "/hotspot", search: { reveal: true }, replace: true });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Hotspot Map</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Each point is a district. Size shows report volume; the amber ring marks the district where need,
              severity, equity and infrastructure gap converge most strongly.
            </p>
          </div>
          {!revealed && (
            <button
              onClick={revealNeed}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Flame className="h-4 w-4" />
              Show me where the need is greatest
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Panel className="relative overflow-hidden" title="District demand map" subtitle="Stylised geography — positions approximate">
            <div className="relative h-[420px] rounded-lg border border-border bg-gradient-to-b from-frost-deep to-background">
              {/* grid lines */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {DISTRICTS.map((d) => {
                const s = districtStats(d.id);
                const size = 14 + Math.min(34, s.reportCount * 2.2);
                const isActive = active === d.id;
                const isGolden = revealed && d.id === GOLDEN_DISTRICT_ID;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelected(d.id);
                      setRevealed(false);
                    }}
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: size, height: size }}
                    title={`${d.name}, ${d.state}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
                      isGolden
                        ? "bg-amber shadow-[0_0_0_10px_var(--color-amber)/25] ring-4 ring-amber/60 animate-pulse"
                        : isActive
                          ? "bg-primary ring-4 ring-primary/30"
                          : "bg-primary/45 hover:bg-primary/70"
                    }`}
                  />
                );
              })}
              {revealed && (
                <div
                  className="absolute -translate-x-1/2 rounded-lg border border-amber/50 bg-card/95 px-3 py-2 text-xs shadow-lg"
                  style={{ left: "38%", top: "58%" }}
                >
                  <div className="font-display font-bold text-amber-ink">Anantapur, Andhra Pradesh</div>
                  <div className="text-muted-foreground">Rural transport cluster MOB-042 · score 91/100</div>
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title={activeDistrict ? `${activeDistrict.name}, ${activeDistrict.state}` : "Select a district"}
            subtitle={activeDistrict ? "Demand and priority snapshot" : "Click any point on the map"}
          >
            {!activeDistrict || !activeStats ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                No district selected
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Population</div>
                    <div className="mt-0.5 font-display font-bold">{num(activeDistrict.population)}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Equity index</div>
                    <div className="mt-0.5 font-display font-bold">{activeDistrict.equityIndex.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Reports</div>
                    <div className="mt-0.5 font-display font-bold">{activeStats.reportCount}</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Clusters</div>
                    <div className="mt-0.5 font-display font-bold">{activeStats.clusterCount}</div>
                  </div>
                </div>
                {activeStats.best && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{activeStats.best.cluster.id}</span>
                      <Chip tone={activeStats.best.priority.score >= 85 ? "danger" : "amber"}>
                        Score {activeStats.best.priority.score}
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Strongest cluster: {activeStats.best.cluster.category} · {activeStats.best.cluster.requestCount}{" "}
                      reports · {num(activeStats.best.cluster.populationImpact)} residents affected
                    </p>
                  </div>
                )}
                {activeDistrict.rural && <Chip tone="primary">Predominantly rural block</Chip>}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
