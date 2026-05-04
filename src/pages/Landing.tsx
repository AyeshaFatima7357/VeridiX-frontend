/**
 * Landing — main page for VeridiX.
 * Single page: upload → progress → result, all state owned here.
 * Mobile-first, works at 360px width.
 */

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UploadBox } from "@/components/UploadBox";
import { ProgressAnimation } from "@/components/ProgressAnimation";
import { ResultCard } from "@/components/ResultCard";
import { ToastNotification } from "@/components/ToastNotification";
import { pingHealth } from "@/services/detectService";
import type { DetectionResult } from "@/services/detectService";

const TRUST_BADGES = [
  { emoji: "🔒", label: "On-Device Analysis" },
  { emoji: "⚡", label: "Under 15 Seconds" },
  { emoji: "🆓", label: "Free — Rs. 0" },
];

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult]       = useState<DetectionResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // ── Cold-start check on mount ─────────────────────────────────────────────
  useEffect(() => {
    const checkServer = async () => {
      const start   = Date.now();
      const alive   = await pingHealth();
      const elapsed = Date.now() - start;

      // Show toast if server is unreachable OR took more than 3 seconds
      if (!alive || elapsed > 3000) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 8000);
      }
    };
    checkServer();
  }, []);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setShowToast(false);
  };

  return (
    <div className="fade-in min-h-screen bg-[#0A0E1A]">
      <Navbar />

      {/* Toast notification — fixed bottom-right, cold-start warning */}
      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <main className="mx-auto max-w-xl px-4 pb-16 pt-10">

        {/* ── 1. Hero section ─────────────────────────────────────────────── */}
        <section className="mb-8 text-center">
          {/* Headline */}
          <h1 className="mb-3 font-display text-4xl font-bold leading-tight tracking-tight text-[#F1F5F9] sm:text-5xl">
            Is It Real<br className="sm:hidden" /> or Fake?
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-[#64748B] sm:text-base">
            AI-powered deepfake detection. Upload a photo or paste a video link
            — results in under 15 seconds.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full border border-[#00D4FF]/30 bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#00D4FF]"
              >
                <span>{badge.emoji}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── 2. Main card — upload / progress / result ───────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl">

          {/* Show ResultCard when we have a result and are not loading */}
          {result && !isLoading ? (
            <ResultCard result={result} resetApp={handleReset} />
          ) : (
            <>
              {/* UploadBox — owns detection trigger, reports state up */}
              <UploadBox
                setIsLoading={setIsLoading}
                setResult={setResult}
                setError={setError}
                setShowToast={setShowToast}
                isLoading={isLoading}
              />

              {/* ProgressAnimation — shown while API call is in flight */}
              <ProgressAnimation isVisible={isLoading} />
            </>
          )}
        </div>

        {/* ── 3. Footer ────────────────────────────────────────────────────── */}
        <footer className="mt-8 text-center">
          <p className="text-xs leading-relaxed text-[#64748B]">
            Built for W!NNOVX Hackfest 2026&nbsp;&nbsp;•&nbsp;&nbsp;
            Stanley College of Engineering &amp; Technology for Women&nbsp;&nbsp;•&nbsp;&nbsp;
            VeridiX by VisionX Core
          </p>
        </footer>

      </main>
    </div>
  );
}
