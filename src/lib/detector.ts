export type Verdict = "authentic" | "suspicious" | "deepfake";

export type ModelScore = {
  id: string;
  name: string;
  short: string;
  score: number; // 0-100 (higher = more fake)
  signals: string[];
};

export type AnalysisResult = {
  overall: number; // ensemble 0-100
  verdict: Verdict;
  models: ModelScore[];
  /** Heatmap hotspots in % of image dims (0-1). r is radius in % of min dim. */
  hotspots: { x: number; y: number; r: number; intensity: number; label: string }[];
  framesAnalyzed: number;
  durationMs: number;
  explanation: string[];
  fingerprint: string;
};

const MODELS = [
  {
    id: "facial",
    name: "Facial Inconsistency Detector",
    short: "EfficientNet-B4",
    signals: [
      "Unnatural blink cadence",
      "Boundary artefacts at hairline",
      "Over-corrected facial symmetry",
      "Skin texture discontinuity under lighting shift",
    ],
  },
  {
    id: "freq",
    name: "Frequency Domain Analyzer",
    short: "XceptionNet + FFT",
    signals: [
      "GAN spectral fingerprint detected",
      "DCT coefficient anomalies",
      "Periodic high-frequency residual",
      "Compression-aware noise mismatch",
    ],
  },
  {
    id: "temporal",
    name: "Temporal Consistency Checker",
    short: "MesoNet-Temporal",
    signals: [
      "Micro-expression timing impossibility",
      "Head pose 3D velocity outliers",
      "Lighting direction drift across frames",
      "Frame-to-frame identity flicker",
    ],
  },
];

/** Hash any string/file-name into a deterministic 0-1 number. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function rand(seed: number) {
  let s = seed * 1e9;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function verdictFor(score: number): Verdict {
  if (score <= 30) return "authentic";
  if (score <= 65) return "suspicious";
  return "deepfake";
}

/**
 * Deterministic mock analyzer — produces realistic, repeatable results
 * keyed on file name + size so the same asset always returns the same verdict.
 * This is the demo inference layer; in production this would call the on-device
 * TFLite ensemble described in the VeridiX whitepaper.
 */
export function analyzeMedia(file: File): AnalysisResult {
  const seed = hash(`${file.name}|${file.size}|${file.type}`);
  const r = rand(seed);

  // Bias outcome by filename hints — gives demos a believable feel.
  const lower = file.name.toLowerCase();
  let bias = 0;
  if (/(fake|deepfake|gan|synth|morph)/.test(lower)) bias = 45;
  else if (/(real|authentic|original|raw)/.test(lower)) bias = -35;

  const base = Math.max(5, Math.min(95, Math.round(seed * 100 + bias + (r() - 0.5) * 20)));

  const models: ModelScore[] = MODELS.map((m, i) => {
    const drift = (r() - 0.5) * 22;
    const score = Math.max(2, Math.min(98, Math.round(base + drift)));
    // Pick 2 most relevant signals based on score
    const count = score > 60 ? 3 : score > 30 ? 2 : 1;
    const signals = [...m.signals].sort(() => r() - 0.5).slice(0, count);
    return { ...m, score, signals };
  });

  const overall = Math.round(models.reduce((a, b) => a + b.score, 0) / models.length);
  const verdict = verdictFor(overall);

  // Heatmap hotspots concentrated on face regions
  const hotspotCount = verdict === "authentic" ? 1 : verdict === "suspicious" ? 3 : 4;
  const regions = [
    { x: 0.5, y: 0.42, label: "Eye region" },
    { x: 0.5, y: 0.58, label: "Mouth boundary" },
    { x: 0.32, y: 0.5, label: "Left jawline" },
    { x: 0.68, y: 0.5, label: "Right jawline" },
    { x: 0.5, y: 0.3, label: "Hairline / forehead" },
  ];
  const hotspots = regions.slice(0, hotspotCount).map((reg) => ({
    x: reg.x + (r() - 0.5) * 0.06,
    y: reg.y + (r() - 0.5) * 0.06,
    r: 0.08 + r() * 0.07,
    intensity: 0.4 + r() * 0.6,
    label: reg.label,
  }));

  const isVideo = file.type.startsWith("video");
  const framesAnalyzed = isVideo ? 24 + Math.floor(r() * 36) : 1;

  const explanation: string[] = [];
  if (verdict === "deepfake") {
    explanation.push(
      `Ensemble flagged ${overall}% manipulation probability. Three independent models agreed.`,
      `Strongest signal: ${models.sort((a, b) => b.score - a.score)[0].signals[0]}.`,
      `Recommendation: do NOT trust this content. Consider reporting if used to harm someone.`
    );
  } else if (verdict === "suspicious") {
    explanation.push(
      `Mixed signals across the ${MODELS.length} model ensemble (${overall}% manipulation probability).`,
      `Manual review recommended — check the heatmap for highlighted regions.`,
      `If source is untrusted, treat as potentially manipulated.`
    );
  } else {
    explanation.push(
      `Low manipulation probability (${overall}%). All three models agree on authenticity.`,
      `No GAN spectral fingerprint detected. Facial physics within human range.`,
      `Content appears authentic — no action required.`
    );
  }

  const fingerprintPool = ["StyleGAN3", "FaceSwap", "DeepFaceLab", "SimSwap", "Diffusion-FS", "—"];
  const fingerprint = verdict === "authentic" ? "—" : fingerprintPool[Math.floor(r() * (fingerprintPool.length - 1))];

  return {
    overall,
    verdict,
    models,
    hotspots,
    framesAnalyzed,
    durationMs: 1800 + Math.floor(r() * 1400),
    explanation,
    fingerprint,
  };
}

export const VERDICT_META: Record<Verdict, { label: string; tone: string; sub: string }> = {
  authentic: {
    label: "Likely Authentic",
    tone: "safe",
    sub: "0–30% manipulation probability",
  },
  suspicious: {
    label: "Suspicious",
    tone: "suspicious",
    sub: "31–65% — review carefully",
  },
  deepfake: {
    label: "High Probability Deepfake",
    tone: "fake",
    sub: "66–100% — do not trust",
  },
};
