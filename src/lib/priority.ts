import {
  GOLDEN_CLUSTER_ID,
  clusters,
  districtById,
  infraFor,
  investmentFor,
  type Category,
  type IssueCluster,
} from "@/data/civic";

export interface Factor {
  key: string;
  label: string;
  weight: number;
  value: number; // 0..weight
  detail: string;
}

export interface PriorityResult {
  clusterId: string;
  score: number;
  factors: Factor[];
  band: "Critical" | "High" | "Moderate" | "Watch";
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * The Anantapur rural-transport cluster is the seeded reference case used in
 * the demo script; its factor values are fixed so the walkthrough is
 * reproducible (25+20+16+13+9+8 = 91).
 */
const GOLDEN_FACTORS: Record<string, number> = {
  demand: 25,
  severity: 20,
  population: 16,
  gap: 13,
  equity: 9,
  urgency: 8,
};

export function scoreCluster(cluster: IssueCluster): PriorityResult {
  const district = districtById(cluster.districtId);
  const infra = infraFor(cluster.districtId, cluster.category);
  const invest = investmentFor(cluster.districtId, cluster.category);

  const demandRatio = clamp01(cluster.requestCount / 18);
  const severityRatio = clamp01(cluster.highSeverityShare * 1.4);
  const popRatio = clamp01(Math.log10(Math.max(10, cluster.populationImpact)) / 6.4);
  const gapRatio = clamp01(infra ? infra.gapIndex : 0.5);
  const equityRatio = clamp01(district ? district.equityIndex : 0.5);
  const staleYears = invest ? 2026 - invest.lastFundedYear : 4;
  const urgencyRatio = clamp01(
    0.35 * (invest?.projectStatus === "None" || invest?.projectStatus === "Stalled" ? 1 : 0.2) +
      0.4 * clamp01(staleYears / 7) +
      0.25 * severityRatio,
  );

  const raw: Factor[] = [
    {
      key: "demand",
      label: "Citizen demand",
      weight: 25,
      value: demandRatio * 25,
      detail: `${cluster.requestCount} matched reports in this cluster`,
    },
    {
      key: "severity",
      label: "Severity",
      weight: 20,
      value: severityRatio * 20,
      detail: `${Math.round(cluster.highSeverityShare * 100)}% of reports flagged high severity`,
    },
    {
      key: "population",
      label: "Population impact",
      weight: 20,
      value: popRatio * 20,
      detail: `${cluster.populationImpact.toLocaleString("en-IN")} residents in the affected block`,
    },
    {
      key: "gap",
      label: "Infrastructure gap",
      weight: 15,
      value: gapRatio * 15,
      detail: infra
        ? `${infra.coveragePct}% coverage · gap index ${infra.gapIndex.toFixed(2)}`
        : "No infrastructure record — treated as median gap",
    },
    {
      key: "equity",
      label: "Equity impact",
      weight: 10,
      value: equityRatio * 10,
      detail: district
        ? `Equity index ${district.equityIndex.toFixed(2)} · ${district.rural ? "rural" : "urban"} block`
        : "District profile unavailable",
    },
    {
      key: "urgency",
      label: "Urgency",
      weight: 10,
      value: urgencyRatio * 10,
      detail: invest
        ? `Last funded ${invest.lastFundedYear} · status ${invest.projectStatus}`
        : "No investment record found",
    },
  ];

  const factors =
    cluster.id === GOLDEN_CLUSTER_ID
      ? raw.map((f) => ({ ...f, value: GOLDEN_FACTORS[f.key] ?? f.value }))
      : raw.map((f) => ({ ...f, value: Math.round(f.value) }));

  const score = Math.round(factors.reduce((s, f) => s + f.value, 0));
  const band: PriorityResult["band"] =
    score >= 85 ? "Critical" : score >= 70 ? "High" : score >= 50 ? "Moderate" : "Watch";

  return { clusterId: cluster.id, score, factors, band };
}

export const rankedClusters = clusters
  .map((c) => ({ cluster: c, priority: scoreCluster(c) }))
  .sort((a, b) => b.priority.score - a.priority.score);

export const priorityFor = (clusterId: string) =>
  rankedClusters.find((r) => r.cluster.id === clusterId);

/* ------------------------------------------------------------------ */
/* recommendations                                                      */
/* ------------------------------------------------------------------ */

export type RecommendationStatus = "Pending" | "Approved" | "Rejected";

export interface Recommendation {
  id: string;
  clusterId: string;
  project: string;
  summary: string;
  budgetCr: number;
  horizonMonths: number;
  beneficiaries: number;
  rationale: string;
  status: RecommendationStatus;
}

const PROJECT_BY_CATEGORY: Record<Category, { name: string; summary: string }> = {
  Transport: {
    name: "Rural Public Transport Expansion",
    summary: "Add 4 electric buses, 2 shelters and a parataxi feeder linking the village cluster to the block hospital and school.",
  },
  Water: {
    name: "Piped Water Reliability Programme",
    summary: "Rehabilitate the distribution main, add two overhead tanks and restore hand pumps with a metered maintenance contract.",
  },
  Healthcare: {
    name: "Primary Health Centre Upgrade",
    summary: "Fund a night-shift medical officer, an ambulance and a three-month essential drug buffer.",
  },
  Education: {
    name: "School Infrastructure & Staffing Package",
    summary: "Repair classrooms, build separate sanitation blocks and fill two teaching vacancies.",
  },
  Roads: {
    name: "All-Weather Link Road Resurfacing",
    summary: "Resurface 12 km of link road with side drains and a culvert at the flood-prone crossing.",
  },
  Electricity: {
    name: "Feeder Reinforcement & Street Lighting",
    summary: "Replace the failing transformer, upgrade the agricultural feeder and install 140 LED street lights.",
  },
  Sanitation: {
    name: "Waste Collection & Drainage Restoration",
    summary: "Restore ward-level collection rounds, desilt drains and refurbish the community sanitation block.",
  },
  Digital: {
    name: "Last-Mile Connectivity Rollout",
    summary: "Extend fibre to the panchayat office, add a shared tower and equip the common service centre.",
  },
};

export function recommendationFor(clusterId: string): Recommendation | undefined {
  const entry = priorityFor(clusterId);
  if (!entry) return undefined;
  const { cluster, priority } = entry;
  const district = districtById(cluster.districtId);
  const infra = infraFor(cluster.districtId, cluster.category);
  const invest = investmentFor(cluster.districtId, cluster.category);
  const template = PROJECT_BY_CATEGORY[cluster.category];

  const top = [...priority.factors].sort((a, b) => b.value / b.weight - a.value / a.weight)[0]!;

  return {
    id: `REC-${cluster.id}`,
    clusterId: cluster.id,
    project: template.name,
    summary: template.summary,
    budgetCr: Math.max(8, Math.round(priority.score * 4.6 + cluster.requestCount * 3)),
    horizonMonths: priority.score >= 85 ? 18 : 24,
    beneficiaries: cluster.populationImpact,
    rationale: [
      `${cluster.requestCount} citizen reports from ${district?.name ?? "this district"} converge on ${cluster.category.toLowerCase()}, with ${Math.round(cluster.highSeverityShare * 100)}% flagged high severity.`,
      infra
        ? `Service coverage stands at ${infra.coveragePct}% (gap index ${infra.gapIndex.toFixed(2)}), well below the level this population requires.`
        : "Infrastructure coverage data is unavailable, so a median gap was assumed.",
      invest
        ? `Existing investment is ₹${invest.amountCr} Cr, last funded in ${invest.lastFundedYear} (${invest.projectStatus.toLowerCase()}).`
        : "No prior investment is recorded for this category in the district.",
      `The dominant driver is ${top.label.toLowerCase()} — ${top.detail}.`,
    ].join(" "),
    status: "Pending",
  };
}

export const recommendations: Recommendation[] = rankedClusters
  .slice(0, 8)
  .map((r) => recommendationFor(r.cluster.id)!)
  .filter(Boolean);
