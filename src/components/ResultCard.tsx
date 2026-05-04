/**
 * ResultCard — displays the deepfake detection result.
 *
 * Sections (top to bottom):
 *  1. Verdict banner   — full-width coloured header
 *  2. Confidence bar   — animated CSS fill on mount
 *  3. Confidence band  — pill badge
 *  4. Heatmap          — base64 image or placeholder
 *  5. Explanation      — plain-English paragraph
 *  6. Source badge     — which API answered
 *  7. Try Another      — resets the app
 *
 * Error state: red warning card with Try Another button.
 * Never crashes on missing/null fields.
 * Mobile-first, works at 360px width.
 */

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import type { DetectionResult } from "@/services/detectService";

// ── Props ────────────────────────────────────────────────────────────────────

interface ResultCardProps {
  result:   DetectionResult;
  resetApp: () => void;
}

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  FAKE: {
    bannerBg:   "bg-[#FF3B3B]",
    bannerText: "DEEPFAKE DETECTED",
    icon:       <XCircle className="h-6 w-6" />,
    barColor:   "bg-[#FF3B3B]",
    pillBg:     "bg-[#FF3B3B]/15",
    pillBorder: "border-[#FF3B3B]/40",
    pillText:   "text-[#FF3B3B]",
    cardBorder: "border-[#FF3B3B]/25",
  },
  REAL: {
    bannerBg:   "bg-[#00FF88]",
    bannerText: "LIKELY AUTHENTIC",
    icon:       <CheckCircle className="h-6 w-6" />,
    barColor:   "bg-[#00FF88]",
    pillBg:     "bg-[#00FF88]/15",
    pillBorder: "border-[#00FF88]/40",
    pillText:   "text-[#00FF88]",
    cardBorder: "border-[#00FF88]/25",
  },
  SUSPICIOUS: {
    bannerBg:   "bg-[#FFB800]",
    bannerText: "SUSPICIOUS — REVIEW",
    icon:       <HelpCircle className="h-6 w-6" />,
    barColor:   "bg-[#FFB800]",
    pillBg:     "bg-[#FFB800]/15",
    pillBorder: "border-[#FFB800]/40",
    pillText:   "text-[#FFB800]",
    cardBorder: "border-[#FFB800]/25",
  },
} as const;

type VerdictKey = keyof typeof VERDICT_CONFIG;

// ── Component ─────────────────────────────────────────────────────────────────

export function ResultCard({ result, resetApp }: ResultCardProps) {

  // ── Animated confidence bar ───────────────────────────────────────────────
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (result.status === "success" && result.confidence_score != null) {
      // Delay one frame so the CSS transition fires after mount
      const raf = requestAnimationFrame(() => {
        setBarWidth(Math.round(result.confidence_score! * 100));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [result]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (result.status === "error") {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-[#FF3B3B]/30 bg-[#111827]">
        {/* Error banner */}
        <div className="flex items-center gap-3 bg-[#FF3B3B]/15 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#FF3B3B]" />
          <p className="font-bold text-[#FF3B3B]">Detection Unavailable</p>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            {result.message || "An error occurred. Please try again."}
          </p>
          <TryAnotherButton onClick={resetApp} />
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  const verdict = (result.verdict ?? "SUSPICIOUS") as VerdictKey;
  const cfg     = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.SUSPICIOUS;
  const pct     = Math.round((result.confidence_score ?? 0) * 100);
  const pctStr  = ((result.confidence_score ?? 0) * 100).toFixed(1);

  return (
    <div className={`w-full overflow-hidden rounded-xl border ${cfg.cardBorder} bg-[#111827]`}>

      {/* ── 1. Verdict banner ── */}
      <div className={`${cfg.bannerBg} flex items-center justify-center gap-2.5 px-5 py-4`}>
        <span className="text-[#0A0E1A]">{cfg.icon}</span>
        <span className="text-lg font-extrabold tracking-wide text-[#0A0E1A]">
          {cfg.bannerText}
        </span>
      </div>

      <div className="space-y-5 p-5">

        {/* ── 2. Confidence bar ── */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[#94A3B8]">
              Confidence Score: {pctStr}%
            </span>
            <span className={`font-bold ${cfg.pillText}`}>{pct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#1E293B]">
            <div
              className={`h-full rounded-full ${cfg.barColor}`}
              style={{
                width:      `${barWidth}%`,
                transition: "width 1s ease-out",
              }}
            />
          </div>
        </div>

        {/* ── 3. Confidence band pill ── */}
        {result.confidence_band && (
          <div className="flex">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold
                ${cfg.pillBg} ${cfg.pillBorder} ${cfg.pillText}`}
            >
              {result.confidence_band}
            </span>
          </div>
        )}

        {/* ── 4. Heatmap ── */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            AI Manipulation Heatmap
          </p>
          {result.heatmap_base64 ? (
            <>
              <img
                src={`data:image/jpeg;base64,${result.heatmap_base64}`}
                alt="AI manipulation heatmap overlay"
                className="w-full rounded-lg border border-white/10 object-cover"
                style={{ maxHeight: "320px" }}
              />
              <p className="mt-1.5 text-xs text-[#64748B]">
                Red regions indicate where manipulation signals were detected.
              </p>
            </>
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border border-white/10 bg-[#1E293B]">
              <p className="text-sm text-[#64748B]">Heatmap unavailable for this result.</p>
            </div>
          )}
        </div>

        {/* ── 5. Explanation ── */}
        {result.explanation && (
          <p className="text-sm italic leading-relaxed text-[#94A3B8]">
            {result.explanation}
          </p>
        )}

        {/* ── 6. Source badge ── */}
        {result.source_api && (
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="text-xs text-[#64748B]">
              Detection by:{" "}
              <span className="font-semibold text-[#94A3B8]">
                {result.source_api.toUpperCase()}
              </span>
              {result.source_api === "cache" && (
                <span className="ml-1 text-[#64748B]">(Cached result — instant)</span>
              )}
            </span>
          </div>
        )}

        {/* ── 7. Try Another button ── */}
        <TryAnotherButton onClick={resetApp} />

      </div>
    </div>
  );
}

// ── Shared Try Another button ─────────────────────────────────────────────────

function TryAnotherButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00D4FF] bg-[#0A0E1A] py-3 text-sm font-bold text-[#00D4FF] transition hover:bg-[#00D4FF]/10 active:scale-95"
    >
      <RefreshCw className="h-4 w-4" />
      Try Another
    </button>
  );
}
