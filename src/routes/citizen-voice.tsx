import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/shell";
import { Chip, Panel, SeverityChip } from "@/components/widgets";
import { LANGUAGES, clusterById, districtById } from "@/data/civic";
import { analyseLocally, type AnalysisResult } from "@/lib/analysis";

export const Route = createFileRoute("/citizen-voice")({
  head: () => ({
    meta: [
      { title: "Citizen Voice — CivicNexus AI" },
      {
        name: "description",
        content: "Paste a citizen complaint in any of seven Indian languages and watch CivicNexus AI translate, classify and cluster it.",
      },
      { property: "og:title", content: "Citizen Voice — CivicNexus AI" },
      {
        property: "og:description",
        content: "Multilingual complaint intake: language detection, translation, categorisation, severity and cluster matching.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CitizenVoicePage,
});

const GOLDEN_TEXT =
  "మా గ్రామానికి బస్సు సౌకర్యం లేదు. పిల్లలు ఆరు కిలోమీటర్లు నడిచి బడికి వెళ్తున్నారు.";

function CitizenVoicePage() {
  const [text, setText] = useState(GOLDEN_TEXT);
  const [result, setResult] = useState<AnalysisResult | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const analyse = () => {
    setBusy(true);
    // Simulated latency so the pipeline steps read as a real AI call; the
    // deterministic local engine guarantees the demo never fails offline.
    setTimeout(() => {
      setResult(analyseLocally(text.trim() || GOLDEN_TEXT));
      setBusy(false);
    }, 650);
  };

  const cluster = result ? clusterById(result.matchedClusterId) : undefined;
  const district = cluster ? districtById(cluster.districtId) : undefined;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Citizen Voice</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Citizens speak in their own language. The pipeline detects the language, translates to English,
            classifies the issue, scores severity and matches the report to an existing demand cluster.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Incoming report" subtitle="Prefilled with the golden-thread Telugu complaint">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type or paste a citizen complaint in any language…"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={analyse}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {busy ? "Analysing…" : "Analyse report"}
              </button>
              <button
                onClick={() => setText(GOLDEN_TEXT)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                Reset to golden thread
              </button>
            </div>
          </Panel>

          <Panel
            title="AI pipeline output"
            subtitle={result ? "Every step is inspectable — no black box" : "Run the analysis to see each stage"}
          >
            {!result ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Awaiting a report to analyse
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone="primary">
                    {LANGUAGES[result.language].native} · {Math.round(result.confidence * 100)}% confidence
                  </Chip>
                  <Chip>{result.category}</Chip>
                  <SeverityChip severity={result.severity} />
                  <Chip tone={result.sentiment === "Urgent" ? "danger" : "neutral"}>{result.sentiment}</Chip>
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    English translation
                  </div>
                  <p className="mt-1 rounded-lg bg-muted/60 p-3 text-sm leading-relaxed">{result.translated}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Location</div>
                    <div className="mt-0.5 font-medium">
                      {result.entities.location ?? district?.name ?? "Unspecified block"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">People affected</div>
                    <div className="mt-0.5 font-medium">{result.entities.peopleAffected.toLocaleString("en-IN")}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{result.summary}</p>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber/40 bg-amber/10 p-3 text-xs">
                  <Chip tone="amber">
                    Matched cluster {result.matchedClusterId} · {Math.round(result.similarity * 100)}% similar
                  </Chip>
                  {district && (
                    <span className="text-muted-foreground">
                      {district.name}, {district.state} — joins {cluster?.requestCount ?? 0} converging reports
                    </span>
                  )}
                  <Link to="/priority" className="ml-auto font-semibold text-primary-ink hover:underline">
                    View priority score →
                  </Link>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
