import { Aperture, Waves, Activity, Layers } from "lucide-react";

const STAGES = [
  {
    icon: Aperture,
    title: "Stage 1 · Input Capture",
    body: "Frame extraction every 5–10 frames. MediaPipe / RetinaFace isolates faces and crops the region of interest.",
  },
  {
    icon: Waves,
    title: "Stage 2 · 3 Models in Parallel",
    body: "Facial inconsistency (EfficientNet-B4), frequency-domain GAN fingerprints (XceptionNet+FFT), and temporal consistency (MesoNet).",
  },
  {
    icon: Activity,
    title: "Stage 3 · Ensemble Confidence",
    body: "Weighted vote produces a 0–100% manipulation score with 3 verdict tiers: Authentic, Suspicious, High-Probability Deepfake.",
  },
  {
    icon: Layers,
    title: "Stage 4 · Explainable Output",
    body: "Bounding boxes around suspicious regions, an artifact heatmap overlay, and plain-English reasoning so the user knows WHY.",
  },
];

export const Pipeline = () => (
  <section id="how" className="relative border-y border-border bg-card/30 py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-14 max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Detection Pipeline</div>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
          Four stages. <span className="text-muted-foreground">Zero cloud.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          The whitepaper architecture, end to end. Every step runs on the user's device — no video
          ever leaves the phone or browser.
        </p>
      </div>

      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((s, i) => (
          <li key={s.title} className="relative rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Step {String(i + 1).padStart(2, "0")}
            </div>
            <s.icon className="mt-3 h-6 w-6 text-primary" strokeWidth={1.75} />
            <h3 className="mt-4 font-display text-lg font-semibold">{s.title.split(" · ")[1]}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
