import { Shield } from "lucide-react";

export const SiteFooter = () => (
  <footer
    style={{
      borderTop:  "1px solid rgba(255,255,255,0.07)",
      background: "#0A0E1A",
      padding:    "28px 24px",
    }}
  >
    <div
      style={{
        maxWidth:       "1280px",
        margin:         "0 auto",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        flexWrap:       "wrap",
        gap:            "16px",
      }}
    >
      {/* Left — logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width:          "28px",
            height:         "28px",
            borderRadius:   "6px",
            background:     "#22d3ee",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <Shield
            style={{ width: "14px", height: "14px", color: "#0A0E1A" }}
            strokeWidth={2.5}
          />
        </div>
        <span
          style={{
            fontFamily:  "'Space Grotesk', system-ui, sans-serif",
            fontWeight:  700,
            fontSize:    "14px",
            color:       "#F1F5F9",
          }}
        >
          VeridiX
        </span>
        <span
          style={{
            fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
            fontSize:      "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#64748B",
          }}
        >
          Deepfake Detector
        </span>
      </div>

      {/* Right — tagline */}
      <p
        style={{
          fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
          fontSize:      "11px",
          color:         "#64748B",
          margin:        0,
          letterSpacing: "0.02em",
        }}
      >
        Built first for India · Designed for the world · Free for all
      </p>
    </div>
  </footer>
);
