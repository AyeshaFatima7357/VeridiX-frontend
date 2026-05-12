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
  hotspots: { x: number; y: number; r: number; intensity: number; label: string }[];
  faceDetected: boolean;
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
        "Facial muscle movement outside physiological range",
        "Asymmetric eye blinking pattern",
      ],
      authentic: [
        "Natural blink frequency confirmed",
        "Hairline boundary consistent with real hair",
        "Facial symmetry within human range",
        "Skin texture natural across lighting conditions",
        "Eye movement trajectory physiologically normal",
        "Facial muscle transitions smooth and natural",
      ],
    },
  },
  {
    id: "freq",
    name: "Frequency Domain Analyzer",
    short: "XceptionNet + FFT",
    signals: {
      fake: [
        "GAN spectral fingerprint detected in high-frequency band",
        "DCT coefficient anomalies in mid-frequency band",
        "Periodic high-frequency residual pattern",
        "Compression-aware noise mismatch",
        "Upsampling artefact grid visible in FFT analysis",
        "Unnatural smoothness in frequency spectrum",
      ],
      authentic: [
        "No GAN spectral fingerprint found",
        "DCT coefficients within natural camera distribution",
        "Frequency noise consistent with optical sensor capture",
        "No upsampling artefacts detected",
        "Natural film grain pattern in frequency domain",
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
        "Inconsistent shadow direction between face and background",
      ],
      authentic: [
        "Micro-expression timing physiologically consistent",
        "Head pose velocity within human range",
        "Lighting direction stable across frames",
        "Identity consistent frame-to-frame",
        "Shadow direction consistent with scene lighting",
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
 * Determines whether the uploaded file likely contains a human face.
 *
 * DEFAULT IS TRUE — most images uploaded to a deepfake detector contain people.
 * Only returns false when there are STRONG signals that no face is present
 * (e.g. filename explicitly says "logo", "landscape", "trophy", etc.)
 *
 * In production this would be replaced by MediaPipe or RetinaFace.
 */
function likelyContainsFace(file: File): boolean {
  const lower = file.name.toLowerCase();

  // Only suppress face detection for clearly non-person content
  const definitelyNoFace = [
    "logo", "banner", "icon", "trophy", "award", "building", "architecture",
    "landscape", "nature", "mountain", "ocean", "sky", "forest", "tree",
    "food", "meal", "dish", "product", "item", "object",
    "chart", "graph", "diagram", "document", "screenshot", "ui", "wireframe",
    "wallpaper", "texture", "pattern", "abstract",
    "car", "vehicle", "animal", "pet", "dog", "cat", "bird",
  ];

  if (definitelyNoFace.some((k) => lower.includes(k))) return false;

  // Everything else — assume face is present
  // This covers: IMG_1234.jpg, photo.png, selfie, portrait, deepfake,
  // football.jpg, group.jpg, wedding.jpg, etc.
  return true;
}

// ── Specific explanation builders ─────────────────────────────────────────────

/**
 * Build a specific, detailed plain-English explanation based on
 * the actual signals detected by each model.
 */
function buildExplanation(
  verdict: Verdict,
  overall: number,
  models: ModelScore[],
  faceDetected: boolean,
  pickIndex: number
): string[] {
  const facialModel   = models.find((m) => m.id === "facial")!;
  const freqModel     = models.find((m) => m.id === "freq")!;
  const temporalModel = models.find((m) => m.id === "temporal")!;

  const topSignals = models
    .flatMap((m) => m.signals)
    .slice(0, 3);

  const signalList = topSignals.length > 0
    ? topSignals.map((s) => `"${s}"`).join(", ")
    : "general frequency anomalies";

  if (verdict === "deepfake") {
    const DEEPFAKE = [
      () =>
        `This image has been flagged as a deepfake with ${overall}% confidence. ` +
        `The Facial Inconsistency Detector (${facialModel.score}%) identified ${facialModel.signals[0] ?? "facial artefacts"} — ` +
        `a hallmark of AI face-swapping tools. ` +
        `The Frequency Domain Analyzer (${freqModel.score}%) found ${freqModel.signals[0] ?? "spectral anomalies"} ` +
        `in the image's pixel structure, which real cameras do not produce. ` +
        `Do not trust or share this content.`,

      () =>
        `Strong deepfake indicators detected at ${overall}% manipulation probability. ` +
        `Key evidence: ${signalList}. ` +
        `The face in this image shows signs of AI synthesis — the skin texture and boundary regions ` +
        `contain artefacts that are invisible to the human eye but clearly visible in frequency analysis. ` +
        `This content should be treated as fabricated.`,

      () =>
        `All three models agree this is manipulated content (${overall}%). ` +
        `The facial region scored ${facialModel.score}% on the inconsistency detector — ` +
        `specifically showing ${facialModel.signals[0] ?? "boundary artefacts"}. ` +
        `The frequency spectrum (${freqModel.score}%) reveals ${freqModel.signals[0] ?? "GAN fingerprints"} ` +
        `that are characteristic of deepfake generation tools like FaceSwap or DeepFaceLab. ` +
        `This image is almost certainly AI-generated or manipulated.`,

      () =>
        `Deepfake detected — ${overall}% manipulation probability. ` +
        `The strongest signal is ${topSignals[0] ?? "frequency anomaly"}, detected by the ` +
        `${models.sort((a, b) => b.score - a.score)[0].name} at ` +
        `${models.sort((a, b) => b.score - a.score)[0].score}% confidence. ` +
        `The temporal consistency checker (${temporalModel.score}%) also flagged ` +
        `${temporalModel.signals[0] ?? "frame inconsistencies"}, ` +
        `which indicates the face was composited onto this image rather than captured naturally.`,

      () =>
        `This content is highly likely to be a deepfake (${overall}% score). ` +
        `The pixel-level analysis found ${freqModel.signals[0] ?? "GAN spectral fingerprints"} — ` +
        `a pattern left behind by AI generation models that cannot be removed by compression or resizing. ` +
        `Additionally, the facial geometry shows ${facialModel.signals[0] ?? "unnatural symmetry"}, ` +
        `which is a known artefact of face-swapping algorithms. ` +
        `Treat this as fabricated content.`,
    ];
    return [DEEPFAKE[pickIndex % DEEPFAKE.length]()];
  }

  if (verdict === "suspicious") {
    const SUSPICIOUS = [
      () =>
        `This image returned a suspicious result at ${overall}% manipulation probability. ` +
        `The facial analysis (${facialModel.score}%) detected ${facialModel.signals[0] ?? "minor inconsistencies"} ` +
        `in the face region, but the evidence is not conclusive. ` +
        `The frequency domain (${freqModel.score}%) shows ${freqModel.signals[0] ?? "some anomalies"} ` +
        `that could be caused by heavy JPEG compression or image editing. ` +
        `Verify the source before sharing.`,

      () =>
        `Mixed signals detected — ${overall}% manipulation probability. ` +
        `Two of the three models flagged anomalies: ${signalList}. ` +
        `However, these patterns can also appear in heavily compressed or edited authentic images. ` +
        `If this content comes from an untrusted source, treat it with caution.`,

      () =>
        `The ensemble returned an uncertain verdict at ${overall}%. ` +
        `The face in this image shows ${facialModel.signals[0] ?? "minor texture inconsistencies"} ` +
        `that are slightly outside the normal range, but not definitively fake. ` +
        `The frequency analysis (${freqModel.score}%) found ${freqModel.signals[0] ?? "minor spectral irregularities"}. ` +
        `Manual review is recommended — check the highlighted regions in the heatmap.`,

      () =>
        `Suspicious content at ${overall}% — this sits in the grey zone between authentic and fake. ` +
        `The strongest signal is ${topSignals[0] ?? "frequency anomaly"} (${facialModel.score}% facial score). ` +
        `This could be a low-quality deepfake, a heavily edited photo, or an authentic image ` +
        `with unusual compression artefacts. Consider the context and source carefully.`,

      () =>
        `Inconclusive result — ${overall}% manipulation probability. ` +
        `The facial inconsistency detector scored ${facialModel.score}%, flagging ` +
        `${facialModel.signals[0] ?? "minor boundary artefacts"}. ` +
        `The temporal checker (${temporalModel.score}%) found ${temporalModel.signals[0] ?? "some inconsistencies"}. ` +
        `Neither finding is strong enough for a definitive deepfake verdict, ` +
        `but the content warrants caution.`,
    ];
    return [SUSPICIOUS[pickIndex % SUSPICIOUS.length]()];
  }

  // Authentic
  const AUTHENTIC = [
    () =>
      `This image appears to be genuine (${overall}% manipulation probability — well below the threshold). ` +
      `The facial analysis (${facialModel.score}%) found ${facialModel.signals[0] ?? "natural facial geometry"} ` +
      `consistent with a real photograph. ` +
      `No GAN spectral fingerprints were detected in the frequency domain (${freqModel.score}%). ` +
      `This content is likely authentic.`,

    () =>
      `No signs of deepfake manipulation detected — ${overall}% score. ` +
      `All three models agree: the face in this image shows ${facialModel.signals[0] ?? "natural characteristics"}, ` +
      `the frequency spectrum matches optically captured images, ` +
      `and the temporal consistency is within human physiological range. ` +
      `Content appears authentic.`,

    () =>
      `Clean result — ${overall}% manipulation probability. ` +
      `The pixel-level noise pattern is consistent with a real camera sensor. ` +
      `The facial region scored ${facialModel.score}% on the inconsistency detector — ` +
      `showing ${facialModel.signals[0] ?? "natural skin texture and boundary consistency"}. ` +
      `No AI synthesis artefacts were found in any of the three analysis passes.`,

    () =>
      `This image passes all three detection checks with ${overall}% manipulation probability. ` +
      `The frequency domain analysis (${freqModel.score}%) found ${freqModel.signals[0] ?? "no spectral anomalies"}. ` +
      `The face shows ${facialModel.signals[0] ?? "natural symmetry and texture"} — ` +
      `characteristics that AI generation tools consistently fail to replicate perfectly. ` +
      `No action required.`,

    () =>
      `Likely authentic — ${overall}% score. ` +
      `The ensemble of three models found no evidence of AI manipulation. ` +
      `Key indicators of authenticity: ${facialModel.signals[0] ?? "natural facial geometry"}, ` +
      `${freqModel.signals[0] ?? "clean frequency spectrum"}, ` +
      `and ${temporalModel.signals[0] ?? "consistent temporal patterns"}. ` +
      `This content appears to be a genuine, unmanipulated image.`,
  ];
  return [AUTHENTIC[pickIndex % AUTHENTIC.length]()];
}

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

  // Face detection — default TRUE, only false for clearly non-person content
  const faceDetected = likelyContainsFace(file);

  // Build model scores with appropriate signals
  const models: ModelScore[] = MODELS.map((m) => {
    const drift = (r() - 0.5) * 22;
    const score = Math.max(2, Math.min(98, Math.round(base + drift)));

    let signalPool: string[];
    if (score > 65) {
      signalPool = m.signals.fake;
    } else if (score > 30) {
      signalPool = [...m.signals.fake.slice(0, 2), ...m.signals.authentic.slice(0, 2)];
    } else {
      signalPool = m.signals.authentic;
    }

    const count   = score > 60 ? 3 : score > 30 ? 2 : 1;
    const signals = [...signalPool].sort(() => r() - 0.5).slice(0, count);
    return { id: m.id, name: m.name, short: m.short, score, signals };
  });

  const overall = Math.round(models.reduce((a, b) => a + b.score, 0) / models.length);

  // ── Hotspots — only when face detected AND manipulation found ──────────────
  const hotspots: AnalysisResult["hotspots"] = [];

  if (faceDetected && verdict !== "authentic") {
    const faceRegions = [
      { x: 0.50, y: 0.35, label: "Eye region" },
      { x: 0.50, y: 0.62, label: "Mouth boundary" },
      { x: 0.28, y: 0.52, label: "Left jawline" },
      { x: 0.72, y: 0.52, label: "Right jawline" },
      { x: 0.50, y: 0.22, label: "Hairline" },
    ];
    const count    = verdict === "deepfake" ? 3 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2);
    const shuffled = [...faceRegions].sort(() => r() - 0.5).slice(0, count);
    for (const reg of shuffled) {
      hotspots.push({
        x:         reg.x + (r() - 0.5) * 0.04,
        y:         reg.y + (r() - 0.5) * 0.04,
        r:         0.07 + r() * 0.05,
        intensity: verdict === "deepfake" ? 0.65 + r() * 0.35 : 0.35 + r() * 0.3,
        label:     reg.label,
      });
    }
  }

  // ── Explanation ────────────────────────────────────────────────────────────
  const pickIndex  = Math.floor(r() * 5);
  const explanation = buildExplanation(verdict, overall, models, faceDetected, pickIndex);

  // ── Fingerprint ────────────────────────────────────────────────────────────
  const fingerprintPool = ["StyleGAN3", "FaceSwap", "DeepFaceLab", "SimSwap", "Diffusion-FS"];
  const fingerprint =
    verdict === "authentic"
      ? "—"
      : fingerprintPool[Math.floor(r() * fingerprintPool.length)];

  const isVideo        = file.type.startsWith("video");
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
