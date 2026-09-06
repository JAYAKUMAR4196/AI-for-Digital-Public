/**
 * CivicNexus AI — synthetic dataset + deterministic generation.
 *
 * Everything here is pure and deterministic (seeded LCG, no Math.random),
 * so it is safe to evaluate at module scope in the worker runtime and
 * produces identical data on server and client (no hydration drift).
 */

export type LanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "bn" | "mr";

export const LANGUAGES: Record<LanguageCode, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  hi: { label: "Hindi", native: "हिन्दी" },
  te: { label: "Telugu", native: "తెలుగు" },
  ta: { label: "Tamil", native: "தமிழ்" },
  kn: { label: "Kannada", native: "ಕನ್ನಡ" },
  bn: { label: "Bengali", native: "বাংলা" },
  mr: { label: "Marathi", native: "मराठी" },
};

export type Category =
  | "Transport"
  | "Water"
  | "Healthcare"
  | "Education"
  | "Roads"
  | "Electricity"
  | "Sanitation"
  | "Digital";

export const CATEGORIES: Category[] = [
  "Transport",
  "Water",
  "Healthcare",
  "Education",
  "Roads",
  "Electricity",
  "Sanitation",
  "Digital",
];

export const CATEGORY_PREFIX: Record<Category, string> = {
  Transport: "MOB",
  Water: "WTR",
  Healthcare: "MED",
  Education: "EDU",
  Roads: "ORD",
  Electricity: "ELE",
  Sanitation: "SAN",
  Digital: "DIG",
};

export type Severity = "Low" | "Medium" | "High";

export interface District {
  id: string;
  name: string;
  state: string;
  /** map position in percent of the panel */
  x: number;
  y: number;
  population: number;
  /** 0-1, higher = more disadvantaged */
  equityIndex: number;
  rural: boolean;
}

export const DISTRICTS: District[] = [
  { id: "AP-ATP", name: "Anantapur", state: "Andhra Pradesh", x: 38, y: 66, population: 4083315, equityIndex: 0.82, rural: true },
  { id: "AP-SKL", name: "Srikakulam", state: "Andhra Pradesh", x: 62, y: 52, population: 2703114, equityIndex: 0.74, rural: true },
  { id: "TG-ADB", name: "Adilabad", state: "Telangana", x: 46, y: 47, population: 1855485, equityIndex: 0.71, rural: true },
  { id: "TG-HYD", name: "Hyderabad", state: "Telangana", x: 43, y: 55, population: 6809970, equityIndex: 0.34, rural: false },
  { id: "TN-TVL", name: "Tiruvallur", state: "Tamil Nadu", x: 49, y: 78, population: 3728104, equityIndex: 0.51, rural: false },
  { id: "TN-RMD", name: "Ramanathapuram", state: "Tamil Nadu", x: 44, y: 86, population: 1353445, equityIndex: 0.77, rural: true },
  { id: "KA-KLB", name: "Kalaburagi", state: "Karnataka", x: 36, y: 56, population: 2566326, equityIndex: 0.68, rural: true },
  { id: "KA-BLR", name: "Bengaluru Rural", state: "Karnataka", x: 34, y: 72, population: 990923, equityIndex: 0.45, rural: true },
  { id: "MH-STR", name: "Satara", state: "Maharashtra", x: 26, y: 52, population: 3003741, equityIndex: 0.55, rural: true },
  { id: "MH-NDD", name: "Nanded", state: "Maharashtra", x: 33, y: 48, population: 3361292, equityIndex: 0.66, rural: true },
  { id: "WB-MSD", name: "Murshidabad", state: "West Bengal", x: 72, y: 40, population: 7103807, equityIndex: 0.79, rural: true },
  { id: "WB-PRL", name: "Purulia", state: "West Bengal", x: 68, y: 43, population: 2930115, equityIndex: 0.81, rural: true },
  { id: "UP-ALG", name: "Aligarh", state: "Uttar Pradesh", x: 40, y: 28, population: 3673889, equityIndex: 0.72, rural: false },
  { id: "UP-SNB", name: "Sonbhadra", state: "Uttar Pradesh", x: 58, y: 34, population: 1862559, equityIndex: 0.86, rural: true },
];

export interface CitizenRequest {
  id: string;
  timestamp: string;
  language: LanguageCode;
  originalText: string;
  translatedText: string;
  category: Category;
  districtId: string;
  severity: Severity;
  peopleAffected: number;
  clusterId: string;
  sentiment: "Concerned" | "Frustrated" | "Urgent" | "Neutral";
}

export interface IssueCluster {
  id: string;
  category: Category;
  districtId: string;
  requestCount: number;
  populationImpact: number;
  firstSeen: string;
  lastSeen: string;
  highSeverityShare: number;
}

export interface InfrastructureRecord {
  districtId: string;
  category: Category;
  capacity: number;
  coveragePct: number;
  /** 0-1, higher = bigger gap */
  gapIndex: number;
}

export interface InvestmentRecord {
  districtId: string;
  category: Category;
  amountCr: number;
  projectStatus: "Completed" | "Ongoing" | "Stalled" | "None";
  lastFundedYear: number;
}

/* ------------------------------------------------------------------ */
/* deterministic RNG                                                    */
/* ------------------------------------------------------------------ */

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)] as T;

/* ------------------------------------------------------------------ */
/* complaint phrase bank (per category, per language)                   */
/* ------------------------------------------------------------------ */

type Phrase = { original: string; english: string };

const PHRASES: Record<Category, Partial<Record<LanguageCode, Phrase[]>>> = {
  Transport: {
    te: [
      {
        original: "మా గ్రామానికి బస్సు సౌకర్యం లేదు. పిల్లలు ఆరు కిలోమీటర్లు నడిచి బడికి వెళ్తున్నారు.",
        english: "Our village has no bus service. Children walk six kilometres to school every day.",
      },
      {
        original: "చివరి బస్సు సాయంత్రం నాలుగు గంటలకే. ఆసుపత్రికి వెళ్ళడం చాలా కష్టంగా ఉంది.",
        english: "The last bus leaves at 4pm, so reaching the hospital is very difficult.",
      },
    ],
    hi: [
      { original: "गाँव से जिला अस्पताल तक कोई बस नहीं चलती।", english: "No bus runs from the village to the district hospital." },
    ],
    ta: [{ original: "பேருந்து நிறுத்தம் அகற்றப்பட்டதால் மக்கள் நடந்தே செல்கின்றனர்.", english: "The bus stop was removed, so residents now walk." }],
    en: [{ original: "The morning bus to the taluk office was cancelled without notice.", english: "The morning bus to the taluk office was cancelled without notice." }],
    kn: [{ original: "ಹಳ್ಳಿಗೆ ಬಸ್ ಸಂಪರ್ಕ ಇಲ್ಲ, ಕೂಲಿ ಕಾರ್ಮಿಕರು ಕೆಲಸಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿಲ್ಲ.", english: "No bus link to the village; daily-wage workers cannot reach work." }],
    mr: [{ original: "एसटी बस बंद झाल्याने विद्यार्थ्यांचे शिक्षण बुडत आहे.", english: "Students are missing school since the state bus was discontinued." }],
    bn: [{ original: "গ্রামে বাস না থাকায় রোগীদের নিয়ে যেতে সমস্যা হচ্ছে।", english: "With no bus in the village, taking patients to hospital is a problem." }],
  },
  Water: {
    hi: [{ original: "कॉलोनी का हैंडपंप एक महीने से खराब है, महिलाएँ दो किलोमीटर दूर से पानी लाती हैं।", english: "The colony hand pump has been broken for a month; women fetch water two kilometres away." }],
    en: [{ original: "Piped supply arrives once every three days and only for twenty minutes.", english: "Piped supply arrives once every three days and only for twenty minutes." }],
    te: [{ original: "బోరు నీరు ఉప్పగా ఉంది, తాగడానికి పనికిరాదు.", english: "The borewell water is saline and undrinkable." }],
    bn: [{ original: "টিউবওয়েলের জল থেকে দুর্গন্ধ আসছে, শিশুরা অসুস্থ হচ্ছে।", english: "Tubewell water smells foul and children are falling ill." }],
    ta: [{ original: "தண்ணீர் லாரி வாரத்திற்கு ஒரு முறை மட்டுமே வருகிறது.", english: "The water tanker comes only once a week." }],
    mr: [{ original: "उन्हाळ्यात विहीर आटते, टँकर वेळेवर येत नाही.", english: "The well dries up in summer and tankers arrive late." }],
    kn: [{ original: "ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ಹೋಗಿದೆ, ದುರಸ್ತಿ ಆಗಿಲ್ಲ.", english: "The drinking water pipeline is broken and unrepaired." }],
  },
  Healthcare: {
    en: [{ original: "The primary health centre has no resident doctor after 2pm.", english: "The primary health centre has no resident doctor after 2pm." }],
    hi: [{ original: "प्राथमिक स्वास्थ्य केंद्र में दवाइयाँ महीनों से नहीं आईं।", english: "Medicines have not reached the primary health centre for months." }],
    bn: [{ original: "নিকটতম হাসপাতাল ৩০ কিমি দূরে, অ্যাম্বুলেন্স নেই।", english: "The nearest hospital is 30 km away and there is no ambulance." }],
    te: [{ original: "గర్భిణీ స్త్రీలకు స్థానికంగా వైద్య సదుపాయం లేదు.", english: "There is no local maternal care for pregnant women." }],
    ta: [{ original: "ஆரம்ப சுகாதார நிலையத்தில் செவிலியர் பற்றாக்குறை.", english: "The primary health centre is short of nurses." }],
    mr: [{ original: "रुग्णवाहिका मागवली तरी दोन तास लागतात.", english: "An ambulance takes two hours even after being called." }],
    kn: [{ original: "ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ರಾತ್ರಿ ಪಾಳಿ ವೈದ್ಯರಿಲ್ಲ.", english: "The hospital has no night-shift doctor." }],
  },
  Education: {
    en: [{ original: "The upper primary school runs three grades in one room with a single teacher.", english: "The upper primary school runs three grades in one room with a single teacher." }],
    hi: [{ original: "स्कूल में शौचालय नहीं है, लड़कियाँ बीच में पढ़ाई छोड़ रही हैं।", english: "The school has no toilet, so girls are dropping out." }],
    mr: [{ original: "शाळेच्या इमारतीचे छप्पर गळते, पावसाळ्यात वर्ग बंद असतात.", english: "The school roof leaks and classes shut during monsoon." }],
    ta: [{ original: "அரசுப் பள்ளியில் அறிவியல் ஆசிரியர் இல்லை.", english: "The government school has no science teacher." }],
    te: [{ original: "మా బడిలో కంప్యూటర్ ల్యాబ్ లేదు.", english: "Our school has no computer lab." }],
    bn: [{ original: "স্কুলে মধ্যাহ্নভোজ অনিয়মিত হয়ে গেছে।", english: "The midday meal at school has become irregular." }],
    kn: [{ original: "ಶಾಲೆಗೆ ಕುಡಿಯುವ ನೀರಿನ ವ್ಯವಸ್ಥೆ ಇಲ್ಲ.", english: "The school has no drinking water facility." }],
  },
  Roads: {
    ta: [{ original: "தார் இல்லாத சாலை மழையில் சேறாகி சந்தையை துண்டிக்கிறது.", english: "The unpaved road turns to slush in the rain and cuts off the market." }],
    en: [{ original: "Potholes on the link road caused three two-wheeler accidents this month.", english: "Potholes on the link road caused three two-wheeler accidents this month." }],
    mr: [{ original: "पुराने रस्ता वाहून गेला, गावाचा संपर्क तुटतो.", english: "Floods washed away the road and the village gets cut off." }],
    hi: [{ original: "सड़क अधूरी बनी है, ठेकेदार छह महीने से नहीं लौटा।", english: "The road is half-built; the contractor has not returned in six months." }],
    te: [{ original: "గ్రామ రహదారి పూర్తిగా గుంతలమయం అయ్యింది.", english: "The village road is riddled with potholes." }],
    bn: [{ original: "সেতুর কাজ অসম্পূর্ণ, ঘুরপথে ১২ কিমি যেতে হয়।", english: "The bridge is unfinished; the detour is 12 km." }],
    kn: [{ original: "ಮಳೆಯಲ್ಲಿ ರಸ್ತೆ ಕೊಚ್ಚಿ ಹೋಗಿದೆ.", english: "The road washed away in the rains." }],
  },
  Electricity: {
    ta: [{ original: "மூன்று வாரங்களாக தெருவிளக்கு எரியவில்லை, இரவில் பாதுகாப்பு இல்லை.", english: "Streetlights have been out for three weeks; the lane is unsafe at night." }],
    hi: [{ original: "रोज़ छह घंटे बिजली कटौती होती है, सिंचाई रुक जाती है।", english: "Six-hour daily power cuts stall irrigation." }],
    en: [{ original: "Voltage fluctuation burnt out two pump sets in the farm cluster.", english: "Voltage fluctuation burnt out two pump sets in the farm cluster." }],
    te: [{ original: "ట్రాన్స్‌ఫార్మర్ కాలిపోయి పది రోజులైంది.", english: "The transformer burnt out ten days ago." }],
    kn: [{ original: "ರಾತ್ರಿಯಿಡೀ ವಿದ್ಯುತ್ ಇಲ್ಲ, ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಓದಲು ಆಗುತ್ತಿಲ್ಲ.", english: "No power all night; students cannot study." }],
    bn: [{ original: "ঝড়ের পরে বিদ্যুতের খুঁটি পড়ে আছে।", english: "Power poles are still down after the storm." }],
    mr: [{ original: "शेतीसाठी वीज फक्त रात्रीच मिळते.", english: "Power for farming is supplied only at night." }],
  },
  Sanitation: {
    bn: [{ original: "নর্দমা উপচে পড়ছে, ডেঙ্গুর আশঙ্কা বাড়ছে।", english: "Drains are overflowing and dengue risk is rising." }],
    en: [{ original: "Solid waste has not been collected from the ward for eleven days.", english: "Solid waste has not been collected from the ward for eleven days." }],
    hi: [{ original: "सामुदायिक शौचालय में पानी और सफाई दोनों नहीं है।", english: "The community toilet has neither water nor cleaning." }],
    te: [{ original: "డ్రైనేజీ నీరు వీధుల్లో నిలిచిపోతోంది.", english: "Drainage water is stagnating in the streets." }],
    ta: [{ original: "குப்பை கிடங்கு குடியிருப்புக்கு அருகில் உள்ளது.", english: "The garbage dump sits right next to housing." }],
    mr: [{ original: "गटार तुंबल्याने दुर्गंधी पसरली आहे.", english: "Blocked sewers have spread a stench." }],
    kn: [{ original: "ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ ಮುಚ್ಚಿದೆ.", english: "The public toilet is shut." }],
  },
  Digital: {
    en: [{ original: "No mobile signal at the panchayat office; e-services need a 14 km trip.", english: "No mobile signal at the panchayat office; e-services need a 14 km trip." }],
    kn: [{ original: "ಹಳ್ಳಿಯಲ್ಲಿ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ, ಆನ್‌ಲೈನ್ ತರಗತಿ ಸಾಧ್ಯವಿಲ್ಲ.", english: "No internet in the village, so online classes are impossible." }],
    hi: [{ original: "कॉमन सर्विस सेंटर का सर्वर हमेशा बंद रहता है।", english: "The common service centre server is always down." }],
    te: [{ original: "గ్రామంలో బ్రాడ్‌బ్యాండ్ కనెక్షన్ లేదు.", english: "The village has no broadband connection." }],
    ta: [{ original: "நெட்வொர்க் இல்லாததால் ரேஷன் இயந்திரம் வேலை செய்யவில்லை.", english: "The ration machine fails because there is no network." }],
    bn: [{ original: "মোবাইল টাওয়ার না থাকায় জরুরি ফোন করা যায় না।", english: "With no mobile tower, emergency calls cannot be made." }],
    mr: [{ original: "ऑनलाइन सातबारा काढण्यासाठी तालुक्याला जावे लागते.", english: "Getting land records online requires a trip to the taluka." }],
  },
};

const SENTIMENTS = ["Concerned", "Frustrated", "Urgent", "Neutral"] as const;

/* ------------------------------------------------------------------ */
/* generation                                                           */
/* ------------------------------------------------------------------ */

const BASE_TIME = Date.UTC(2026, 7, 24, 6, 30, 0);

/** The golden-thread cluster: Telugu village bus complaint in Anantapur. */
export const GOLDEN_CLUSTER_ID = "MOB-042";
export const GOLDEN_REQUEST_ID = "REQ-0001";
export const GOLDEN_DISTRICT_ID = "AP-ATP";

function clusterKey(category: Category, districtId: string) {
  return `${category}::${districtId}`;
}

function buildRequests(): CitizenRequest[] {
  const rng = makeRng(20260824);
  const out: CitizenRequest[] = [];

  // 1. Golden thread request — always first, always Telugu transport in Anantapur.
  const goldenPhrase = PHRASES.Transport.te![0]!;
  out.push({
    id: GOLDEN_REQUEST_ID,
    timestamp: new Date(BASE_TIME).toISOString(),
    language: "te",
    originalText: goldenPhrase.original,
    translatedText: goldenPhrase.english,
    category: "Transport",
    districtId: GOLDEN_DISTRICT_ID,
    severity: "High",
    peopleAffected: 214,
    clusterId: GOLDEN_CLUSTER_ID,
    sentiment: "Urgent",
  });

  // 2. Bulk synthetic corpus.
  const total = 168;
  for (let i = 1; i < total; i++) {
    const district = pick(rng, DISTRICTS);
    // Anantapur transport is deliberately over-represented (the hotspot).
    const forceGolden = i % 9 === 0;
    const category: Category = forceGolden ? "Transport" : pick(rng, CATEGORIES);
    const districtId = forceGolden ? GOLDEN_DISTRICT_ID : district.id;

    const bank = PHRASES[category];
    const langs = Object.keys(bank) as LanguageCode[];
    const language = pick(rng, langs);
    const phrase = pick(rng, bank[language]!);

    const sevRoll = rng();
    const severity: Severity = sevRoll > 0.72 ? "High" : sevRoll > 0.34 ? "Medium" : "Low";

    out.push({
      id: `REQ-${String(i + 1).padStart(4, "0")}`,
      timestamp: new Date(BASE_TIME - i * 47 * 60 * 1000).toISOString(),
      language,
      originalText: phrase.original,
      translatedText: phrase.english,
      category,
      districtId,
      severity,
      peopleAffected: 40 + Math.floor(rng() * 900),
      clusterId: "",
      sentiment: pick(rng, SENTIMENTS),
    });
  }
  return out;
}

function buildClusters(requests: CitizenRequest[]): IssueCluster[] {
  const groups = new Map<string, CitizenRequest[]>();
  for (const r of requests) {
    const key = clusterKey(r.category, r.districtId);
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }

  const counters = new Map<Category, number>();
  const clusters: IssueCluster[] = [];

  for (const [key, list] of groups) {
    const first = list[0]!;
    const isGolden = first.category === "Transport" && first.districtId === GOLDEN_DISTRICT_ID;
    let id: string;
    if (isGolden) {
      id = GOLDEN_CLUSTER_ID;
    } else {
      const n = (counters.get(first.category) ?? 0) + 1;
      counters.set(first.category, n);
      id = `${CATEGORY_PREFIX[first.category]}-${String(n * 13 + 7).padStart(3, "0")}`;
    }

    for (const r of list) r.clusterId = id;

    const times = list.map((r) => Date.parse(r.timestamp)).sort((a, b) => a - b);
    const district = DISTRICTS.find((d) => d.id === first.districtId)!;
    const affected = list.reduce((s, r) => s + r.peopleAffected, 0);

    clusters.push({
      id,
      category: first.category,
      districtId: first.districtId,
      requestCount: list.length,
      populationImpact: Math.min(district.population, affected * 120),
      firstSeen: new Date(times[0]!).toISOString(),
      lastSeen: new Date(times[times.length - 1]!).toISOString(),
      highSeverityShare: list.filter((r) => r.severity === "High").length / list.length,
    });
    void key;
  }

  return clusters.sort((a, b) => b.requestCount - a.requestCount);
}

function buildInfrastructure(): InfrastructureRecord[] {
  const rng = makeRng(771102);
  const out: InfrastructureRecord[] = [];
  for (const d of DISTRICTS) {
    for (const c of CATEGORIES) {
      const golden = d.id === GOLDEN_DISTRICT_ID && c === "Transport";
      const coverage = golden ? 22 : Math.round((d.rural ? 34 : 62) + rng() * 34);
      out.push({
        districtId: d.id,
        category: c,
        capacity: Math.round(40 + rng() * 460),
        coveragePct: coverage,
        gapIndex: golden ? 0.78 : Math.round((1 - coverage / 100) * 100) / 100,
      });
    }
  }
  return out;
}

function buildInvestments(): InvestmentRecord[] {
  const rng = makeRng(410277);
  const statuses: InvestmentRecord["projectStatus"][] = ["Completed", "Ongoing", "Stalled", "None"];
  const out: InvestmentRecord[] = [];
  for (const d of DISTRICTS) {
    for (const c of CATEGORIES) {
      const golden = d.id === GOLDEN_DISTRICT_ID && c === "Transport";
      out.push({
        districtId: d.id,
        category: c,
        amountCr: golden ? 3 : Math.round(rng() * 480),
        projectStatus: golden ? "None" : pick(rng, statuses),
        lastFundedYear: golden ? 2019 : 2019 + Math.floor(rng() * 7),
      });
    }
  }
  return out;
}

export const requests: CitizenRequest[] = buildRequests();
export const clusters: IssueCluster[] = buildClusters(requests);
export const infrastructure: InfrastructureRecord[] = buildInfrastructure();
export const investments: InvestmentRecord[] = buildInvestments();

export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id);
export const clusterById = (id: string) => clusters.find((c) => c.id === id);
export const infraFor = (districtId: string, category: Category) =>
  infrastructure.find((i) => i.districtId === districtId && i.category === category);
export const investmentFor = (districtId: string, category: Category) =>
  investments.find((i) => i.districtId === districtId && i.category === category);
export const requestsForCluster = (clusterId: string) =>
  requests.filter((r) => r.clusterId === clusterId);
