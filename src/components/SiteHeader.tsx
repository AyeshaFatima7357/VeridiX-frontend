import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";

const NAV = [
  { href: "#analyze", label: "Analyze" },
  { href: "#how",     label: "How it works" },
  { href: "#stack",   label: "Tech stack" },
  { href: "#impact",  label: "Impact" },
];

export const SiteHeader = () => {
  const [open, setOpen]       = useState(false);
  const [isWide, setIsWide]   = useState(false);

  // Use a JS resize listener so the breakpoint is pixel-perfect
  // Desktop nav shows at >= 1024px, burger shows below that
  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isWide) setOpen(false);
  }, [isWide]);

  return (
    <header
      style={{
        position:             "sticky",
        top:                  0,
        zIndex:               50,
        width:                "100%",
        height:               "56px",
        background:           "rgba(10,14,26,0.95)",
        borderBottom:         "1px solid rgba(255,255,255,0.07)",
        backdropFilter:       "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          maxWidth:       "1280px",
          margin:         "0 auto",
          padding:        "0 24px",
          height:         "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "16px",
        }}
      >
        {/* ── Logo ── */}
        <a
          href="#"
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "10px",
            textDecoration: "none",
            flexShrink:     0,
          }}
        >
          <div
            style={{
              width:          "34px",
              height:         "34px",
              borderRadius:   "8px",
              background:     "#22d3ee",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
          >
            <Shield
              style={{ width: "18px", height: "18px", color: "#0A0E1A" }}
              strokeWidth={2.5}
            />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontFamily:    "'Space Grotesk', system-ui, sans-serif",
                fontWeight:    700,
                fontSize:      "17px",
                color:         "#F1F5F9",
                letterSpacing: "-0.02em",
              }}
            >
              VeridiX
            </div>
            <div
              style={{
                fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
                fontSize:      "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "#64748B",
              }}
            >
              Deepfake Detector
            </div>
          </div>
        </a>

        {/* ── Desktop nav (>= 1024px only) ── */}
        {isWide && (
          <nav
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "32px",
              flex:       1,
              justifyContent: "center",
            }}
          >
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                style={{
                  fontFamily:     "'Inter', system-ui, sans-serif",
                  fontSize:       "14px",
                  color:          "#94A3B8",
                  textDecoration: "none",
                  transition:     "color 0.2s",
                  whiteSpace:     "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                {n.label}
              </a>
            ))}
          </nav>
        )}

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>

          {/* Try detector — desktop only */}
          {isWide && (
            <a
              href="#analyze"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "8px",
                padding:        "8px 16px",
                borderRadius:   "8px",
                border:         "1px solid rgba(255,255,255,0.15)",
                background:     "transparent",
                color:          "#F1F5F9",
                fontSize:       "14px",
                fontWeight:     500,
                textDecoration: "none",
                transition:     "border-color 0.2s, background 0.2s",
                whiteSpace:     "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)";
                e.currentTarget.style.background  = "rgba(34,211,238,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.background  = "transparent";
              }}
            >
              <Shield style={{ width: "15px", height: "15px", color: "#94A3B8" }} />
              Try detector
            </a>
          )}

          {/* Hamburger — below 1024px only */}
          {!isWide && (
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              style={{
                background:  "none",
                border:      "1px solid rgba(255,255,255,0.12)",
                borderRadius:"8px",
                cursor:      "pointer",
                color:       "#F1F5F9",
                padding:     "6px 8px",
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
              }}
            >
              {open
                ? <X    style={{ width: "20px", height: "20px" }} />
                : <Menu style={{ width: "20px", height: "20px" }} />
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile / tablet dropdown menu ── */}
      {!isWide && open && (
        <div
          style={{
            position:     "absolute",
            top:          "56px",
            left:         0,
            right:        0,
            background:   "#0D1117",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding:      "8px 24px 20px",
            zIndex:       49,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={{
                display:        "block",
                padding:        "13px 0",
                fontSize:       "15px",
                color:          "#94A3B8",
                textDecoration: "none",
                borderBottom:   "1px solid rgba(255,255,255,0.05)",
                transition:     "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              {n.label}
            </a>
          ))}

          {/* Try detector in mobile menu */}
          <a
            href="#analyze"
            onClick={() => setOpen(false)}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "8px",
              marginTop:      "16px",
              padding:        "12px 24px",
              borderRadius:   "8px",
              background:     "#22d3ee",
              color:          "#0A0E1A",
              fontSize:       "14px",
              fontWeight:     700,
              textDecoration: "none",
              minHeight:      "48px",
            }}
          >
            <Shield style={{ width: "15px", height: "15px" }} />
            Try detector
          </a>
        </div>
      )}
    </header>
  );
};
