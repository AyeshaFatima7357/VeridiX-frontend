/**
 * Navbar — VeridiX top navigation bar.
 * Sticky, full-width, 56px height.
 * Mobile-first, works at 360px width.
 */

export function Navbar() {
  return (
    <nav
      className="fade-in"
      style={{
        position:        "sticky",
        top:             0,
        zIndex:          50,
        width:           "100%",
        height:          "56px",
        background:      "#0A0E1A",
        borderBottom:    "1px solid #1E293B",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 16px",
        boxSizing:       "border-box",
      }}
    >
      {/* Left — logo + subtitle */}
      <a
        href="/"
        style={{
          display:        "flex",
          flexDirection:  "column",
          textDecoration: "none",
          lineHeight:     1.2,
        }}
      >
        <span
          style={{
            fontFamily:  "'Space Grotesk', system-ui, sans-serif",
            fontWeight:  700,
            fontSize:    "18px",
            color:       "#00D4FF",
            letterSpacing: "-0.02em",
          }}
        >
          VeridiX
        </span>
        <span
          style={{
            fontSize:    "10px",
            fontWeight:  500,
            color:       "#64748B",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          DeepFake Detector
        </span>
      </a>

      {/* Right — hackathon label */}
      <span
        style={{
          fontSize:    "11px",
          fontWeight:  500,
          color:       "#64748B",
          textAlign:   "right",
          maxWidth:    "140px",
          lineHeight:  1.3,
        }}
      >
        W!NNOVX Hackfest 2026
      </span>
    </nav>
  );
}
