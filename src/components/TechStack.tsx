const STACK = [
  {
    layer: "Frontend (Browser Plugin)",
    items: [
      "Manifest V3 Chrome Extension",
      "JavaScript + WebAssembly",
      "TensorFlow.js",
      "React + Canvas API",
    ],
  },
  {
    layer: "Mobile (Android-first)",
    items: [
      "Flutter (Android + iOS)",
      "TFLite on-device inference",
      "OpenCV frame ops",
      "MLKit face detection",
    ],
  },
  {
    layer: "AI Models",
    items: [
      "EfficientNet-B4 (facial)",
      "XceptionNet (frequency)",
      "MesoNet (lightweight temporal)",
      "FaceForensics++ · Celeb-DF · DFDC",
    ],
  },
  {
    layer: "Optional Backend",
    items: [
      "FastAPI (Python)",
      "Heavy uploaded-video analysis",
      "Anonymous threat-intel telemetry",
      "AWS Lambda / GCP Run",
    ],
  },
];

export const TechStack = () => (
  <section id="stack" className="py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-12 max-w-2xl">
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
          Tech Stack
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
          Engineered for 2GB RAM phones.
        </h2>
        <p style={{ color: "#64748B", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
          INT8 quantisation shrinks models 4× without meaningful accuracy loss, so VeridiX runs
          on the vast majority of smartphones in India's market.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STACK.map((s) => (
          <div
            key={s.layer}
            style={{
              borderRadius: "12px",
              border:       "1px solid rgba(255,255,255,0.08)",
              background:   "rgba(17,24,39,0.8)",
              padding:      "24px",
            }}
          >
            <h3
              style={{
                fontFamily:  "'Space Grotesk', system-ui, sans-serif",
                fontSize:    "15px",
                fontWeight:  600,
                color:       "#F1F5F9",
                margin:      "0 0 16px",
              }}
            >
              {s.layer}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {s.items.map((it) => (
                <li
                  key={it}
                  style={{
                    display:    "flex",
                    gap:        "8px",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize:   "12px",
                    color:      "#64748B",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: "#22d3ee", flexShrink: 0 }}>›</span>
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
