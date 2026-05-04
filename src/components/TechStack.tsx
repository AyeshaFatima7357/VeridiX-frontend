const STACK = [
  {
    layer: "Frontend (Browser Plugin)",
    items: ["Manifest V3 Chrome Extension", "JavaScript + WebAssembly", "TensorFlow.js", "React + Canvas API"],
  },
  {
    layer: "Mobile (Android-first)",
    items: ["Flutter (Android + iOS)", "TFLite on-device inference", "OpenCV frame ops", "MLKit face detection"],
  },
  {
    layer: "AI Models",
    items: ["EfficientNet-B4 (facial)", "XceptionNet (frequency)", "MesoNet (lightweight temporal)", "FaceForensics++ · Celeb-DF · DFDC"],
  },
  {
    layer: "Optional Backend",
    items: ["FastAPI (Python)", "Heavy uploaded-video analysis", "Anonymous threat-intel telemetry", "AWS Lambda / GCP Run"],
  },
];

export const TechStack = () => (
  <section id="stack" className="py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-12 max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Tech Stack</div>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Engineered for 2GB RAM phones.</h2>
        <p className="mt-4 text-muted-foreground">
          INT8 quantisation shrinks models 4× without meaningful accuracy loss, so VeridiX runs on
          the vast majority of smartphones in India's market.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STACK.map((s) => (
          <div key={s.layer} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-semibold">{s.layer}</h3>
            <ul className="mt-4 space-y-2">
              {s.items.map((it) => (
                <li key={it} className="flex gap-2 font-mono text-xs text-muted-foreground">
                  <span className="text-primary">›</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
