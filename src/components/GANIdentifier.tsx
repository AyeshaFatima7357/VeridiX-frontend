/**
 * GANIdentifier — shows which AI tool likely created a detected deepfake.
 *
 * Only renders when:
 *   - isVisible is true (verdict is Fake or confidenceScore > 40)
 *   - identifyGANTool returns a non-null result
 *
 * Animations:
 *   1. Card slides in from bottom (translateY 20px → 0, opacity 0 → 1, 0.5s, 0.3s delay)
 *   2. Confidence bar fills from 0 → matchScore% over 1.2s ease-out on mount
 *   3. Indicator pills stagger in with 50ms delay each
 */

import { useEffect, useRef, useState } from "react";
import { identifyGANTool } from "@/utils/ganIdentifier";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GANIdentifierProps {
  confidenceScore: number;   // 0–100
  findings: string[];        // signal strings from model breakdown
  isVisible: boolean;        // true when verdict === "deepfake" or score > 40
}

// ── Danger badge config ───────────────────────────────────────────────────────

const DANGER_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  High: {
    bg:     "rgba(255,59,92,0.15)",
    border: "1px solid rgba(255,59,92,0.3)",
    color:  "#FF3B5C",
  },
  Medium: {
    bg:     "rgba(255,179,71,0.15)",
    border: "1px solid rgba(255,179,71,0.3)",
    color:  "#FFB347",
  },
  Low: {
    bg:     "rgba(136,146,164,0.15)",
    border: "1px solid rgba(136,146,164,0.3)",
    color:  "#8892A4",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const GANIdentifier = ({
  confidenceScore,
  findings,
  isVisible,
}: GANIdentifierProps) => {
  const tool = identifyGANTool(confidenceScore, findings);

  // Don't render if hidden or no match
  if (!isVisible || !tool) return null;

  const dangerStyle = DANGER_STYLE[tool.danger_level] ?? DANGER_STYLE.Low;

  // ── Bar animation ──────────────────────────────────────────────────────────
  const [barWidth, setBarWidth] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [pillsVisible, setPillsVisible] = useState<boolean[]>(
    new Array(tool.indicators.length).fill(false)
  );
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Card slide-in after 300ms
    const cardTimer = setTimeout(() => setCardVisible(true), 300);

    // Bar fill after 400ms (slight delay after card appears)
    const barTimer = setTimeout(() => setBarWidth(tool.matchScore), 400);

    // Stagger pills — 50ms apart, starting at 500ms
    const pillTimers = tool.indicators.map((_, i) =>
      setTimeout(() => {
        setPillsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 500 + i * 50)
    );

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(barTimer);
      pillTimers.forEach(clearTimeout);
    };
  }, [tool.matchScore, tool.indicators.length]);

  return (
    <div
      style={{
        background:    "#111827",
        border:        "1px solid #1E2D4E",
        borderRadius:  "14px",
        padding:       "20px",
        marginTop:     "16px",
        // Card slide-in animation
        opacity:       cardVisible ? 1 : 0,
        transform:     cardVisible ? "translateY(0)" : "translateY(20px)",
        transition:    "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   "16px",
        }}
      >
        {/* Left: icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Fingerprint SVG icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M2 12a10 10 0 0 1 18-6" />
            <path d="M2 17c1 .5 2.5 1 4 1" />
            <path d="M20 12c0 2-.5 4-2 5.5" />
            <path d="M7 13.4a6 6 0 0 0 .75 3.6" />
            <path d="M9.5 8a6 6 0 0 1 5 5.5" />
          </svg>
          <span
            style={{
              color:         "#8892A4",
              fontSize:      "10px",
              fontWeight:    600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily:    "'JetBrains Mono', monospace",
            }}
          >
            GAN Tool Identified
          </span>
        </div>

        {/* Right: danger badge */}
        <span
          style={{
            background:   dangerStyle.bg,
            border:       dangerStyle.border,
            color:        dangerStyle.color,
            borderRadius: "20px",
            padding:      "3px 10px",
            fontSize:     "10px",
            fontWeight:   600,
            fontFamily:   "'JetBrains Mono', monospace",
            letterSpacing:"0.05em",
          }}
        >
          {tool.danger_level} Risk
        </span>
      </div>

      {/* ── Tool name + match confidence ── */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize:    "22px",
            fontWeight:  700,
            color:       tool.color,
            fontFamily:  "'Space Grotesk', system-ui, sans-serif",
            lineHeight:  1.2,
          }}
        >
          {tool.name}
        </div>
        <div
          style={{
            color:      "#8892A4",
            fontSize:   "12px",
            marginTop:  "4px",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Match confidence: {tool.matchScore}%
        </div>
      </div>

      {/* ── Match confidence bar ── */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            marginBottom:   "6px",
          }}
        >
          <span
            style={{
              color:      "#8892A4",
              fontSize:   "11px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Pattern match
          </span>
          <span
            style={{
              color:      tool.color,
              fontSize:   "11px",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {tool.matchScore}%
          </span>
        </div>
        {/* Track */}
        <div
          style={{
            height:       "6px",
            background:   "#1E2D4E",
            borderRadius: "3px",
            overflow:     "hidden",
          }}
        >
          {/* Fill — animates via state */}
          <div
            style={{
              height:     "100%",
              width:      `${barWidth}%`,
              background: tool.color,
              borderRadius: "3px",
              transition: "width 1.2s ease-out",
            }}
          />
        </div>
      </div>

      {/* ── Description box ── */}
      <div
        style={{
          background:   "#0D1525",
          borderLeft:   `3px solid ${tool.color}`,
          borderRadius: "0 8px 8px 0",
          padding:      "12px 14px",
          fontSize:     "12px",
          color:        "#8892A4",
          lineHeight:   1.7,
          marginTop:    "12px",
          fontFamily:   "'Inter', system-ui, sans-serif",
        }}
      >
        {tool.description}
      </div>

      {/* ── Indicators ── */}
      <div style={{ marginTop: "12px" }}>
        <div
          style={{
            color:         "#8892A4",
            fontSize:      "10px",
            marginBottom:  "6px",
            fontFamily:    "'JetBrains Mono', monospace",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Detection signals:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {tool.indicators.map((indicator, i) => (
            <span
              key={indicator}
              style={{
                background:   "#1E2D4E",
                borderRadius: "20px",
                padding:      "3px 10px",
                fontSize:     "10px",
                color:        "#E2E8F0",
                display:      "inline-flex",
                fontFamily:   "'Inter', system-ui, sans-serif",
                // Stagger animation
                opacity:      pillsVisible[i] ? 1 : 0,
                transform:    pillsVisible[i] ? "translateY(0)" : "translateY(6px)",
                transition:   "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              {indicator}
            </span>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <p
        style={{
          marginTop:  "14px",
          color:      "#8892A4",
          fontSize:   "10px",
          fontStyle:  "italic",
          lineHeight: 1.5,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        * GAN identification is based on pattern matching and may not be 100%
        accurate. Use as supporting evidence only.
      </p>
    </div>
  );
};
