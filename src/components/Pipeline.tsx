import { Aperture, Waves, Activity, Layers } from "lucide-react";

const STAGES = [
  {
    icon:  Aperture,
    step:  "01",
    title: "Input Capture",
    body:  "Frame extraction every 5–10 frames. MediaPipe / RetinaFace isolates faces and crops the region of interest.",
  },
  {
    icon:  Waves,
    step:  "02",
    title: "3 Models in Parallel",
    body:  "Facial inconsistency (EfficientNet-B4), frequency-domain GAN fingerprints (XceptionNet+FFT), and temporal consistency (MesoNet).",
  },
  {
    icon:  Activity,
    step:  "03",
    title: "Ensemble Confidence",
    body:  "Weighted vote produces a 0–100% manipulation score with 3 verdict tiers: Authentic, Suspicious, High-Probability Deepfake.",
  },
  {
    icon:  Layers,
    step:  "04",
    title: "Explainable Output",
    body:  "Bounding boxes around suspicious regions, an artifact heatmap overlay, and plain-English reasoning so the user knows WHY.",
  },
];

export const Pipeline = () => (
  <section id="how" className="relative border-y border-border bg-card/30 py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-14 max-w-2xl">
        <div
          style={{
            fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
            fontSize:      "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#22d3ee",
            marginBottom:  "12px",
          }}
        >
          Detection Pipeline
        </div>
        <h2
          style={{
            fontFamily:    "'Space Grotesk', system-ui, sans-serif",
            fontSize:      "clamp(28px, 5vw, 48px)",
            fontWeight:    700,
            color:         "#F1F5F9",
            lineHeight:    1.1,
            letterSpacing: "-0.02em",
            margin:        "0 0 16px",
          }}
        >
          Four stages.{" "}
          <span style={{ color: "#64748B" }}>Zero cloud.</span>
        </h2>
        <p style={{ color: "#64748B", fontSize: "15px", lineHeight: 1.6 }}>
          The whitepaper architecture, end to end. Every step runs on the user's device — no
          video ever leaves the phone or browser.
        </p>
      </div>

      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {STAGES.map((s) => (
          <li
            key={s.title}
            style={{
              borderRadius: "12px",
              border:       "1px solid rgba(255,255,255,0.08)",
              background:   "rgba(17,24,39,0.8)",
              padding:      "24px",
              transition:   "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,211,238,0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          >
            <div
              style={{
                fontFamily:    "'JetBrains Mono', monospace",
                fontSize:      "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "#64748B",
                marginBottom:  "12px",
              }}
            >
              Step {s.step}
            </div>
            <s.icon
              style={{ width: "22px", height: "22px", color: "#22d3ee" }}
              strokeWidth={1.75}
            />
            <h3
              style={{
                fontFamily:  "'Space Grotesk', system-ui, sans-serif",
                fontSize:    "16px",
                fontWeight:  600,
                color:       "#F1F5F9",
                margin:      "14px 0 8px",
              }}
            >
              {s.title}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
