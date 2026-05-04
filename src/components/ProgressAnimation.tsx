/**
 * ProgressAnimation — loading state shown while the API call is in progress.
 *
 * Props:
 *   isLoading (boolean) — only renders when true, animates in with a fade.
 *
 * Behaviour:
 *   - Progress bar fills 0% → 95% over exactly 6 seconds via CSS animation.
 *     Stops at 95% — never reaches 100% until the real result arrives.
 *   - Status messages cycle every 2 seconds.
 *   - The 6s animation and the real API call run simultaneously.
 *     The real result replaces this component whenever it arrives —
 *     it does NOT wait for the animation to finish.
 *
 * Mobile-first, works at 360px width.
 */

import { useEffect, useRef, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_MESSAGES = [
  "Extracting facial features...",
  "Running deepfake analysis...",
  "Calculating confidence score...",
  "Checking GAN fingerprint signatures...",
  "Generating heatmap overlay...",
];

const MESSAGE_INTERVAL_MS  = 2_000;   // rotate every 2 seconds
const BAR_DURATION_SECS    = 6;       // CSS animation duration

// ── Component ─────────────────────────────────────────────────────────────────

interface ProgressAnimationProps {
  isLoading: boolean;
}

export function ProgressAnimation({ isLoading }: ProgressAnimationProps) {
  const [msgIndex, setMsgIndex]   = useState(0);
  const [visible, setVisible]     = useState(false);   // controls fade-in
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fade in on mount, reset on unmount ───────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      setMsgIndex(0);
      // One-frame delay so the CSS opacity transition fires
      const raf = requestAnimationFrame(() => setVisible(true));

      // Cycle messages every 2 seconds
      intervalRef.current = setInterval(() => {
        setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length);
      }, MESSAGE_INTERVAL_MS);

      return () => {
        cancelAnimationFrame(raf);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setVisible(false);
      };
    } else {
      setVisible(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="w-full rounded-xl border border-[#00D4FF]/20 bg-[#111827] p-5"
      style={{
        opacity:    visible ? 1 : 0,
        transition: "opacity 0.3s ease-in",
      }}
      role="status"
      aria-live="polite"
      aria-label="Analysing content, please wait"
    >

      {/* ── 1. Progress bar ── */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#1E293B]">
        <div
          className="h-full rounded-full bg-[#00D4FF]"
          style={{
            /*
             * Fills 0% → 95% over exactly BAR_DURATION_SECS seconds.
             * Uses a CSS keyframe animation so it runs independently of JS.
             * Stops at 95% — the real result replaces this component on arrival.
             */
            animation: `veridix-progress ${BAR_DURATION_SECS}s ease-out forwards`,
          }}
        />
      </div>

      {/* ── 2. Status message ── */}
      <p
        key={msgIndex}   /* key change triggers re-render for fade */
        className="mb-2 text-center text-sm font-medium text-[#00D4FF]"
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
          animation:  "veridix-msg-fade 0.4s ease-in-out",
        }}
      >
        {STATUS_MESSAGES[msgIndex]}
      </p>

      {/* ── 3. Subtext ── */}
      <p className="text-center text-xs text-[#64748B]">
        VeridiX is analysing your file. This takes 8–15 seconds.
      </p>

      {/* Scanning dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#00D4FF]"
            style={{
              animation: `veridix-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

    </div>
  );
}
