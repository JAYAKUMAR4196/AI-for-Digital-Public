/**
 * Deterministic on-device analysis pipeline. This is the fallback service
 * layer used whenever the Gemini call is unavailable (no key, offline,
 * rate-limited) so the product never breaks during a demo.
 */
import {
  CATEGORIES,
  DISTRICTS,
  GOLDEN_CLUSTER_ID,
  clusters,
  type Category,
  type LanguageCode,
  type Severity,
} from "@/data/civic";

export interface AnalysisResult {
  language: LanguageCode;
  confidence: number;
  translated: string;
  category: Category;
  severity: Severity;
  sentiment: string;
  entities: { location?: string; infrastructure: string; peopleAffected: number };
  summary: string;
  matchedClusterId: string;
  similarity: number;
  source: "gemini" | "demo";
}

const SCRIPTS: { lang: LanguageCode; re: RegExp }[] = [
  { lang: "te", re: /[\u0C00-\u0C7F]/ },
  { lang: "kn", re: /[\u0C80-\u0CFF]/ },
  { lang: "ta", re: /[\u0B80-\u0BFF]/ },
  { lang: "bn", re: /[\u0980-\u09FF]/ },
  { lang: "hi", re: /[\u0900-\u097F]/ },
];

const MARATHI_HINTS = ["आहे", "नाही", "गावात", "रस्ता", "शाळेच"];

export function detectLanguage(text: string): { language: LanguageCode; confidence: number } {
  for (const s of SCRIPTS) {
    if (s.re.test(text)) {
      if (s.lang === "hi" && MARATHI_HINTS.some((h) => text.includes(h))) {
        return { language: "mr", confidence: 0.89 };
      }
      return { language: s.lang, confidence: 0.96 };
    }
  }
  return { language: "en", confidence: 0.92 };
}

const KEYWORDS: Record<Category, string[]> = {
  Transport: ["bus", "బస్", "बस", "பேருந்து", "ಬಸ್", "transport", "auto", "commute", "rtc", "stop"],
  Water: ["water", "నీరు", "पानी", "தண்ணீர்", "ನೀರು", "জল", "tanker", "pump", "borewell", "tap"],
  Healthcare: ["hospital", "ఆసుపత్రి", "अस्पताल", "மருத்துவ", "ಆಸ್ಪತ್ರೆ", "doctor", "ambulance", "phc", "medicine"],
  Education: ["school", "బడి", "स्कूल", "पाठशाला", "பள்ளி", "ಶಾಲೆ", "স্কুল", "teacher", "class"],
  Roads: ["road", "రహదారి", "सड़क", "रस्ता", "சாலை", "ರಸ್ತೆ", "pothole", "bridge", "culvert"],
  Electricity: ["power", "electric", "కరెంట్", "बिजली", "மின்", "ವಿದ್ಯುತ್", "transformer", "streetlight", "voltage"],
  Sanitation: ["garbage", "drain", "toilet", "శౌచ", "शौचालय", "கழிவு", "ಶೌಚ", "sewage", "waste"],
  Digital: ["internet", "network", "signal", "broadband", "ఇంటర్నెట్", "इंटरनेट", "இணைய", "ಇಂಟರ್ನೆಟ್", "tower"],
};

export function classify(text: string): Category {
  const lower = text.toLowerCase();
  let best: Category = "Transport";
  let bestHits = 0;
  for (const c of CATEGORIES) {
    const hits = KEYWORDS[c].filter((k) => lower.includes(k.toLowerCase())).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = c;
    }
  }
  return bestHits === 0 ? "Transport" : best;
}

const HIGH_SIGNALS = ["no ", "not ", "never", "emergency", "hospital", "child", "school", "unsafe", "లేదు", "नहीं", "இல்லை", "ಇಲ್ಲ", "নেই"];

export function assessSeverity(text: string): Severity {
  const hits = HIGH_SIGNALS.filter((s) => text.toLowerCase().includes(s)).length;
  if (hits >= 3) return "High";
  if (hits >= 1) return "Medium";
  return "Low";
}

export function extractDistrict(text: string): string | undefined {
  const found = DISTRICTS.find((d) => text.toLowerCase().includes(d.name.toLowerCase()));
  return found?.name;
}

export function matchCluster(category: Category, districtName?: string) {
  const district = DISTRICTS.find((d) => d.name === districtName);
  const exact = clusters.find(
    (c) => c.category === category && (district ? c.districtId === district.id : false),
  );
  if (exact) return exact;
  const byCategory = clusters.filter((c) => c.category === category);
  return byCategory[0] ?? clusters[0]!;
}

const TRANSLATION_HINTS: { re: RegExp; english: string }[] = [
  {
    re: /బస్|బస్సు/,
    english: "There is no bus service to our village; residents walk long distances to reach school and the hospital.",
  },
  { re: /నీరు|నీళ్ళ/, english: "Drinking water supply has failed in our habitation." },
  { re: /बस/, english: "No bus service connects our village to the block headquarters." },
  { re: /पानी/, english: "The drinking water supply in our colony has stopped." },
];

export function analyseLocally(text: string): AnalysisResult {
  const { language, confidence } = detectLanguage(text);
  const category = classify(text);
  const severity = assessSeverity(text);
  const districtName = extractDistrict(text);
  const cluster = matchCluster(category, districtName);
  const hint = TRANSLATION_HINTS.find((h) => h.re.test(text));
  const translated =
    language === "en" ? text : (hint?.english ?? `[${language.toUpperCase()} → EN] ${text}`);

  return {
    language,
    confidence,
    translated,
    category,
    severity,
    sentiment: severity === "High" ? "Urgent" : "Concerned",
    entities: {
      location: districtName ?? (cluster.id === GOLDEN_CLUSTER_ID ? "Anantapur" : undefined),
      infrastructure: category,
      peopleAffected: Math.max(60, Math.round(translated.length * 1.8)),
    },
    summary: `${category} service failure reported in ${districtName ?? "the reporting block"}; classified ${severity.toLowerCase()} severity.`,
    matchedClusterId: cluster.id,
    similarity: districtName ? 0.94 : 0.81,
    source: "demo",
  };
}
