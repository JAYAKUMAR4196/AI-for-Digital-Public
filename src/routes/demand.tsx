import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/shell";
import { Bar, Panel, num } from "@/components/widgets";
import { CATEGORIES, DISTRICTS, LANGUAGES, requests, type Category, type LanguageCode } from "@/data/civic";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Demand Intelligence — CivicNexus AI" },
      {
        name: "description",
        content: "Aggregate citizen demand by service category, language and district to see where unmet need concentrates.",
      },
      { property: "og:title", content: "Demand Intelligence — CivicNexus AI" },
      {
        property: "og:description",
        content: "Category, language and district breakdowns of 168 multilingual citizen reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemandPage,
});

function countBy<T extends string>(key: (r: (typeof requests)[number]) => T) {
  const m = new Map<T, number>();
  for (const r of requests) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return m;
}

function DemandPage() {
  const byCategory = countBy((r) => r.category);
  const byLanguage = countBy((r) => r.language);
  const byDistrict = countBy((r) => r.districtId);
  const bySeverity = countBy((r) => r.severity);
  const maxCat = Math.max(...[...byCategory.values()]);
  const maxDist = Math.max(...[...byDistrict.values()]);
  const districtRows = DISTRICTS.map((d) => ({ d, n: byDistrict.get(d.id) ?? 0 })).sort((a, b) => b.n - a.n);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Demand Intelligence</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {num(requests.length)} citizen reports aggregated across categories, languages and districts. Demand is
            a signal, not a vote — severity and equity weight it downstream.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Reports by service category" subtitle="Where citizens are asking for help">
            <div className="space-y-3">
              {CATEGORIES.map((c: Category) => (
                <div key={c} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
                  <span className="truncate">{c}</span>
                  <Bar value={byCategory.get(c) ?? 0} max={maxCat} />
                  <span className="text-right font-mono text-xs text-muted-foreground">{byCategory.get(c) ?? 0}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Reports by language" subtitle="Multilingual intake — no citizen left unheard">
            <div className="space-y-3">
              {(Object.keys(LANGUAGES) as LanguageCode[])
                .map((l) => ({ l, n: byLanguage.get(l) ?? 0 }))
                .sort((a, b) => b.n - a.n)
                .map(({ l, n }) => (
                  <div key={l} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
                    <span className="truncate">
                      {LANGUAGES[l].native} <span className="text-xs text-muted-foreground">{LANGUAGES[l].label}</span>
                    </span>
                    <Bar value={n} max={requests.length} />
                    <span className="text-right font-mono text-xs text-muted-foreground">{n}</span>
                  </div>
                ))}
            </div>
          </Panel>

          <Panel title="Reports by district" subtitle="Geographic concentration of demand">
            <div className="space-y-3">
              {districtRows.map(({ d, n }) => (
                <div key={d.id} className="grid grid-cols-[170px_1fr_40px] items-center gap-3 text-sm">
                  <span className="truncate">
                    {d.name} <span className="text-xs text-muted-foreground">{d.state}</span>
                  </span>
                  <Bar value={n} max={maxDist} className={d.id === "AP-ATP" ? "bg-amber" : undefined} />
                  <span className="text-right font-mono text-xs text-muted-foreground">{n}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Severity mix" subtitle="Share of reports flagged by the severity model">
            <div className="space-y-4 pt-2">
              {(["High", "Medium", "Low"] as const).map((s) => {
                const n = bySeverity.get(s) ?? 0;
                const pct = Math.round((n / requests.length) * 100);
                return (
                  <div key={s}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium">{s}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {n} · {pct}%
                      </span>
                    </div>
                    <Bar value={n} max={requests.length} className={s === "High" ? "bg-destructive" : s === "Medium" ? "bg-amber" : undefined} />
                  </div>
                );
              })}
              <p className="pt-2 text-xs text-muted-foreground">
                High-severity signals — missing hospitals, unsafe roads, failed drinking water — are weighted up in
                the Priority Engine, so loud but low-stakes demand cannot crowd out silent emergencies.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
