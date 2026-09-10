# CivicNexus AI

**From citizen voices to smarter public investment.**

CivicNexus AI is a civic-intelligence prototype: it listens to citizen reports in seven Indian languages, clusters them into demand signals, scores every cluster with a transparent six-factor model, and drafts investment recommendations that stay pending until a human officer approves them.

## The core formula

```
Citizen Demand + Infrastructure Gaps + Demographic Need + Existing Investment + AI Reasoning
    = Evidence-Based Development Priorities
```

## Screens

| Screen | What it shows |
| --- | --- |
| Overview | KPIs, the golden-thread trace, top priority clusters, and the "show me where the need is greatest" jump |
| Citizen Voice | Paste or dictate a complaint in any of 7 languages; watch detection → translation → classification → severity → clustering |
| Demand Intelligence | Volume by category, language share, district leaderboard, severity mix |
| Hotspot Map | District demand map; the amber reveal highlights the single most convergent hotspot |
| Priority Engine | Ranked clusters with a factor-by-factor score breakdown (no black box) |
| Recommendations | AI-drafted investments with budget, horizon, beneficiaries — each with Approve / Reject controls |
| Impact Monitor | Before/after projections for the golden-thread transport project in Anantapur |
| Governance | Audit log, safeguards, and the model registry |

## The golden thread

One Telugu complaint — *"మా గ్రామానికి బస్సు సౌకర్యం లేదు…"* ("Our village has no bus service. Children walk six kilometres to school every day.") — flows through the whole system:

1. Submitted on **Citizen Voice** (REQ-0001)
2. Detected as Telugu, translated, classified **Transport / High severity**
3. Matched to cluster **MOB-042** in Anantapur (similarity 0.94)
4. Scored **91/100 (Critical)** by the Priority Engine
5. Highlighted amber on the **Hotspot Map**
6. Drafted as **REC-MOB-042 — Rural Public Transport Expansion (₹476 Cr, 18 months)**
7. Projected outcomes tracked on the **Impact Monitor**

## Priority score

Every cluster is scored 0–100 from six weighted factors, and each factor shows its evidence:

- Citizen demand — 25%
- Severity — 20%
- Population impact — 20%
- Infrastructure gap — 15%
- Equity impact — 10%
- Urgency — 10%

## Tech stack

- **React 19 + TypeScript**, TanStack Start (SSR), Tailwind CSS v4, shadcn-style tokens
- Deterministic synthetic dataset: 168 citizen reports, 14 districts, 7 languages, 8 categories (`src/data/civic.ts`)
- Scoring engine: `src/lib/priority.ts` · Analysis pipeline: `src/lib/analysis.ts`

## AI integration

The analysis pipeline is designed to call Google Gemini for language detection, translation, entity extraction, summarization, and similarity matching. When no API key is configured (or the API is unreachable), a deterministic on-device fallback (`analyseLocally`) keeps every screen fully functional — the demo never breaks.

To enable Gemini in a deployed environment, set `GEMINI_API_KEY` as a server secret and wire it into the analysis server function; the fallback layer remains as the resilience path.

## Demo script (90–120 seconds)

1. **Overview** — "Where should the next rupee go?" Click *Show me where the need is greatest*.
2. **Hotspot Map** — the amber ring lands on Anantapur: 19 converging reports, 11.3 lakh residents affected.
3. **Citizen Voice** — replay the Telugu complaint; watch it detected, translated, and classified in seconds.
4. **Priority Engine** — open MOB-042: 91/100, with every factor explained line by line.
5. **Recommendations** — the AI drafted the fix; approve it as the officer. Human-in-the-loop, visible.
6. **Impact Monitor** — coverage 22% → 78%, girls' attendance 68% → 91%.
7. **Governance** — every step is in the audit log.

## Run locally

```bash
bun install
bun run dev
```

All data is synthetic; no credentials are required.
