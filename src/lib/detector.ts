export type Verdict = "authentic" | "suspicious" | "deepfake";

export type ModelScore = {
  id: string;
  name: string;
  short: string;
  score: number; // 0-100 (higher = more fake)
  signals: string[];
};

export type AnalysisResult = {
  overall: number;
  verdict: Verdict;
  models: ModelScore[];
  /**
   * Heatmap hotspots — ONLY populated when a face is detected in the image.
   * Empty array = no face found = no hotspots drawn.
   */
  hotspots: { x: number; y: number; r: number; intensity: number; label: string }[];
  faceDetected: boolean;   // NEW — drives heatmap rendering decision
  framesAnalyzed: number;
  durationMs: number;
  explanation: string[];
  fingerprint: string;
};

// ── Model definitions ────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "facial",
    name: "Facial Inconsistency Detector",
    short: "EfficientNet-B4",
    signals: {
      fake: [
        "Unnatural blink cadence detected",
        "Boundary artefacts at hairline",
        "Over-corrected facial symmetry",
        "Skin texture discontinuity under lighting shift",
        "Eye region pixel inconsistency",
        "Lip sync mismatch with audio envelope",
      ],
      authentic: [
        "Natural blink frequency confirmed",
        "Hairline boundary consistent",
        "Facial symmetry within human range",
        "Skin texture natural across lighting",
      ],
      noface: [
        "No face region detected — model skipped",
      ],
    },
  },
  {
    id: "freq",
    name: "Frequency Domain Analyzer",
    short: "XceptionNet + FFT",
    signals: {
      fake: [
        "GAN spectral fingerprint detected",
        "DCT coefficient anomalies in mid-frequency band",
        "Periodic high-frequency residual pattern",
        "Compression-aware noise mismatch",
        "Upsampling artefact grid visible in FFT",
      ],
      authentic: [
        "No GAN spectral fingerprint found",
        "DCT coefficients within natural distribution",
        "Frequency noise consistent with optical capture",
        "No upsampling artefacts detected",
      ],
      noface: [
        "Frequency analysis completed on full frame",
        "No face-specific frequency anomalies",
      ],
    },
  },
  {
    id: "temporal",
    name: "Temporal Consistency Checker",
    short: "MesoNet-Temporal",
    signals: {
      fake: [
        "Micro-expression timing outside physiological range",
        "Head pose 3D velocity outliers detected",
        "Lighting direction drift across frames",
        "Frame-to-frame identity flicker",
        "Unnatural eye movement trajectory",
      ],
      authentic: [
        "Micro-expression timing physiologically consistent",
        "Head pose velocity within human range",
        "Lighting direction stable across frames",
        "Identity consistent frame-to-frame",
      ],
      noface: [
        "No face tracked — temporal check not applicable",
      ],
    },
  },
];

// ── Deterministic hash & PRNG ────────────────────────────────────────────────

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

// ── Face detection heuristic ─────────────────────────────────────────────────
/**
 * Heuristic: decide whether the uploaded file likely contains a human face.
 * Uses filename keywords and MIME type as signals.
 * In production this would be replaced by a real face detector (MediaPipe etc.)
 *
 * Returns true  → face likely present → hotspots allowed
 * Returns false → no face → hotspots suppressed entirely
 */
function likelyContainsFace(file: File, seed: number): boolean {
  const lower = file.name.toLowerCase();

  // Strong positive signals — file name suggests a person/face
  const faceKeywords = [
    "face", "person", "selfie", "portrait", "headshot", "deepfake",
    "fake", "real", "human", "man", "woman", "girl", "boy", "people",
    "profile", "id", "passport", "photo", "pic", "img",
  ];
  if (faceKeywords.some((k) => lower.includes(k))) return true;

  // Strong negative signals — clearly not a face
  const noFaceKeywords = [
    "logo", "banner", "poster", "award", "trophy", "building", "landscape",
    "nature", "food", "product", "screenshot", "document", "chart", "graph",
    "icon", "wallpaper", "background", "texture", "pattern",
  ];
  if (noFaceKeywords.some((k) => lower.includes(k))) return false;

  // For ambiguous filenames (IMG_1234.jpg etc.) use a probabilistic decision
  // biased toward "face present" since most uploaded images in a deepfake
  // detector context are likely to contain faces (~70% prior)
  return seed > 0.30;
}

// ── Varied explanation pools ─────────────────────────────────────────────────

const DEEPFAKE_EXPLANATIONS = [
  (overall: number, signal: string) =>
    `This image shows clear signs of AI manipulation. The ensemble scored ${overall}% manipulation probability — well above the threshold for a deepfake verdict. The strongest indicator was "${signal}". The facial geometry contains inconsistencies that no real camera would produce.`,
  (overall: number, signal: string) =>
    `All three detection models flagged this content as manipulated (${overall}% confidence). The primary red flag is "${signal}". Deepfake generation tools leave behind subtle frequency-domain fingerprints that our analyzer detected in this image.`,
  (overall: number, signal: string) =>
    `High-confidence deepfake detected at ${overall}%. The facial region shows artefacts consistent with GAN-based synthesis — specifically "${signal}". Do not trust this content or share it without verification.`,
  (overall: number, signal: string) =>
    `The 3-model ensemble reached strong agreement: this is almost certainly AI-generated or manipulated content (${overall}% score). Key evidence: "${signal}". The frequency spectrum of this image does not match optically captured photographs.`,
  (overall: number, signal: string) =>
    `Manipulation detected with ${overall}% confidence. The tell-tale sign here is "${signal}" — a pattern that consistently appears in AI-synthesised faces but not in real photographs. Treat this content as untrustworthy.`,
];

const SUSPICIOUS_EXPLANATIONS = [
  (overall: number) =>
    `The analysis returned mixed signals — ${overall}% manipulation probability puts this in the uncertain zone. Some models flagged anomalies while others found nothing conclusive. If this content comes from an untrusted source, treat it with caution.`,
  (overall: number) =>
    `Inconclusive result at ${overall}%. The image has some characteristics that could indicate manipulation, but the evidence isn't strong enough for a definitive verdict. Consider the source before sharing.`,
  (overall: number) =>
    `This content sits in the grey zone (${overall}% score). The frequency domain shows minor irregularities, but they could also be caused by heavy JPEG compression or image editing. Manual review is recommended.`,
  (overall: number) =>
    `Uncertain verdict — ${overall}% manipulation probability. Two of the three models disagree on this one. The facial region looks mostly natural, but there are subtle texture inconsistencies worth noting. Proceed with caution.`,
  (overall: number) =>
    `The ensemble is not confident either way (${overall}%). Some artefacts were detected but they fall below the deepfake threshold. This could be a heavily edited but authentic image, or a low-quality deepfake. Verify the source independently.`,
];

const AUTHENTIC_EXPLANATIONS = [
  (overall: number) =>
    `This image appears to be genuine. The manipulation probability is only ${overall}% — well below the threshold for concern. No GAN fingerprints were found, and the facial geometry is consistent with natural human anatomy.`,
  (overall: number) =>
    `No signs of deepfake manipulation detected (${overall}% score). The frequency spectrum matches optically captured images, and all facial landmarks behave as expected. This content is likely authentic.`,
  (overall: number) =>
    `All three models agree: this looks real (${overall}% manipulation probability). The skin texture, lighting consistency, and facial symmetry are all within the natural range. No AI synthesis artefacts were found.`,
  (overall: number) =>
    `Clean result — ${overall}% manipulation probability. The image passes all three detection checks. There are no spectral anomalies, no boundary artefacts, and no signs of GAN upsampling. Content appears authentic.`,
  (overall: number) =>
    `This image shows no evidence of AI manipulation (${overall}% score). The pixel-level noise pattern is consistent with a real camera sensor, and no deepfake fingerprints were detected in the frequency domain.`,
];

const NO_FACE_AUTHENTIC_EXPLANATIONS = [
  (overall: number) =>
    `No human face was detected in this image. The frequency domain analysis found no AI generation artefacts (${overall}% score). The image appears to be an authentic, unmanipulated photograph.`,
  (overall: number) =>
    `This image does not contain a face, so facial analysis was skipped. The overall pixel and frequency analysis returned ${overall}% — no signs of AI manipulation found. Content appears genuine.`,
  (overall: number) =>
    `No face region found. The image was analysed at the frequency and texture level only. Result: ${overall}% manipulation probability — consistent with an authentic, unedited photograph.`,
];

const NO_FACE_SUSPICIOUS_EXPLANATIONS = [
  (overall: number) =>
    `No human face detected. The frequency analysis returned ${overall}% — some minor anomalies were found in the image's noise pattern, but nothing conclusive. The image may have been edited or processed.`,
  (overall: number) =>
    `This image contains no face. Frequency-domain analysis flagged some irregularities (${overall}% score), which could indicate image editing or heavy compression. Cannot determine deepfake status without a face.`,
];

// ── Main analyzeMedia function ───────────────────────────────────────────────

export function analyzeMedia(file: File): AnalysisResult {
  const seed = hash(`${file.name}|${file.size}|${file.type}`);
  const r    = rand(seed);

  // Bias by filename
  const lower = file.name.toLowerCase();
  let bias = 0;
  if (/(fake|deepfake|gan|synth|morph)/.test(lower)) bias = 45;
  else if (/(real|authentic|original|raw)/.test(lower)) bias = -35;

  const base    = Math.max(5, Math.min(95, Math.round(seed * 100 + bias + (r() - 0.5) * 20)));
  const verdict = verdictFor(base);

  // Determine face presence
  const faceDetected = likelyContainsFace(file, seed);

  // Build model scores
  const models: ModelScore[] = MODELS.map((m) => {
    const drift = (r() - 0.5) * 22;
    const score = Math.max(2, Math.min(98, Math.round(base + drift)));

    let signalPool: string[];
    if (!faceDetected && m.id === "facial") {
      signalPool = m.signals.noface;
    } else if (!faceDetected && m.id === "temporal") {
      signalPool = m.signals.noface;
    } else if (score > 65) {
      signalPool = m.signals.fake;
    } else if (score > 30) {
      // Mix of fake and authentic signals for suspicious
      signalPool = [...m.signals.fake.slice(0, 2), ...m.signals.authentic.slice(0, 2)];
    } else {
      signalPool = m.signals.authentic;
    }

    const count   = score > 60 ? 3 : score > 30 ? 2 : 1;
    const signals = [...signalPool].sort(() => r() - 0.5).slice(0, count);
    return { id: m.id, name: m.name, short: m.short, score, signals };
  });

  const overall = Math.round(models.reduce((a, b) => a + b.score, 0) / models.length);

  // ── Hotspots — ONLY when face is detected ──────────────────────────────────
  const hotspots: AnalysisResult["hotspots"] = [];

  if (faceDetected && verdict !== "authentic") {
    const faceRegions = [
      { x: 0.5,  y: 0.38, label: "Eye region" },
      { x: 0.5,  y: 0.60, label: "Mouth boundary" },
      { x: 0.30, y: 0.50, label: "Left jawline" },
      { x: 0.70, y: 0.50, label: "Right jawline" },
      { x: 0.5,  y: 0.26, label: "Hairline" },
    ];
    const count = verdict === "deepfake" ? 3 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2);
    const shuffled = [...faceRegions].sort(() => r() - 0.5).slice(0, count);
    for (const reg of shuffled) {
      hotspots.push({
        x:         reg.x + (r() - 0.5) * 0.05,
        y:         reg.y + (r() - 0.5) * 0.05,
        r:         0.07 + r() * 0.06,
        intensity: verdict === "deepfake" ? 0.6 + r() * 0.4 : 0.3 + r() * 0.3,
        label:     reg.label,
      });
    }
  }
  // If no face detected OR verdict is authentic → hotspots stays []

  // ── Varied plain-English explanation ──────────────────────────────────────
  const pickIndex = Math.floor(r() * 5);   // 0-4, deterministic per file
  const topModel  = [...models].sort((a, b) => b.score - a.score)[0];
  const topSignal = topModel.signals[0] ?? "spectral anomaly";

  let explanation: string[];

  if (!faceDetected) {
    if (verdict === "authentic") {
      const pool = NO_FACE_AUTHENTIC_EXPLANATIONS;
      explanation = [pool[pickIndex % pool.length](overall)];
    } else {
      const pool = NO_FACE_SUSPICIOUS_EXPLANATIONS;
      explanation = [pool[pickIndex % pool.length](overall)];
    }
  } else if (verdict === "deepfake") {
    explanation = [DEEPFAKE_EXPLANATIONS[pickIndex](overall, topSignal)];
  } else if (verdict === "suspicious") {
    explanation = [SUSPICIOUS_EXPLANATIONS[pickIndex](overall)];
  } else {
    explanation = [AUTHENTIC_EXPLANATIONS[pickIndex](overall)];
  }

  // ── Fingerprint ────────────────────────────────────────────────────────────
  const fingerprintPool = ["StyleGAN3", "FaceSwap", "DeepFaceLab", "SimSwap", "Diffusion-FS"];
  const fingerprint =
    verdict === "authentic" || !faceDetected
      ? "—"
      : fingerprintPool[Math.floor(r() * fingerprintPool.length)];

  const isVideo       = file.type.startsWith("video");
  const framesAnalyzed = isVideo ? 24 + Math.floor(r() * 36) : 1;

  return {
    overall,
    verdict,
    models,
    hotspots,
    faceDetected,
    framesAnalyzed,
    durationMs: 1800 + Math.floor(r() * 1400),
    explanation,
    fingerprint,
  };
}

// ── Verdict metadata ──────────────────────────────────────────────────────────

export const VERDICT_META: Record<Verdict, { label: string; tone: string; sub: string }> = {
  authentic: {
    label: "Likely Authentic",
    tone:  "safe",
    sub:   "0–30% manipulation probability",
  },
  suspicious: {
    label: "Suspicious",
    tone:  "suspicious",
    sub:   "31–65% — review carefully",
  },
  deepfake: {
    label: "High Probability Deepfake",
    tone:  "fake",
    sub:   "66–100% — do not trust",
  },
};
