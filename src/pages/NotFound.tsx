/**
 * NotFound — 404 page.
 * Cyber Noir design. Centered vertically. fade-in on mount.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="fade-in"
      style={{
        minHeight:       "100vh",
        background:      "#0A0E1A",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "24px 16px",
        textAlign:       "center",
        boxSizing:       "border-box",
      }}
    >
      {/* 404 number */}
      <h1
        style={{
          fontFamily:    "'Space Grotesk', system-ui, sans-serif",
          fontSize:      "clamp(80px, 20vw, 140px)",
          fontWeight:    800,
          color:         "#FF3B3B",
          lineHeight:    1,
          margin:        "0 0 16px",
          letterSpacing: "-0.04em",
        }}
      >
        404
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize:   "clamp(14px, 4vw, 18px)",
          color:      "#94A3B8",
          margin:     "0 0 32px",
          maxWidth:   "320px",
          lineHeight: 1.5,
        }}
      >
        Nothing fake here… except this page.
      </p>

      {/* Back link */}
      <a
        href="/"
        style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           "8px",
          padding:       "14px 28px",
          minHeight:     "48px",
          background:    "#0A0E1A",
          border:        "1px solid #00D4FF",
          borderRadius:  "12px",
          color:         "#00D4FF",
          fontWeight:    700,
          fontSize:      "14px",
          textDecoration:"none",
          transition:    "background 0.2s",
          boxSizing:     "border-box",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,212,255,0.1)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.background = "#0A0E1A")
        }
      >
        ← Back to VeridiX
      </a>
    </div>
  );
};

export default NotFound;
