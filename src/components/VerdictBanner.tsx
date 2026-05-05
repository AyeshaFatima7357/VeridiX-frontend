import type { AnalysisResult } from "@/lib/detector";
import { VERDICT_META } from "@/lib/detector";
import { ShieldCheck, AlertTriangle, ShieldAlert, UserX } from "lucide-react";

const ICON = {
  authentic: ShieldCheck,
  suspicious: AlertTriangle,
  deepfake:  ShieldAlert,
};

const TONE_BG = {
  safe:       "bg-gradient-verdict-safe border-verdict-safe/40",
  suspicious: "bg-gradient-verdict-warn border-verdict-suspicious/40",
  fake:       "bg-gradient-verdict-fake border-verdict-fake/40",
};

const TONE_TEXT = {
  safe:       "text-verdict-safe",
  suspicious: "text-verdict-suspicious",
  fake:       "text-verdict-fake",
};

export const VerdictBanner = ({ result }: { result: AnalysisResult }) => {
  const meta     = VERDICT_META[result.verdict];
  const Icon     = ICON[result.verdict];
  const toneBg   = TONE_BG[meta.tone as keyof typeof TONE_BG];
  const toneText = TONE_TEXT[meta.tone as keyof typeof TONE_TEXT];

  return (
    <div className={`relative overflow-hidden rounded-xl border p-6 ${toneBg} animate-float-up space-y-4`}>

      {/* ── Verdict header ── */}
      <div className="flex items-start gap-5">
        <div className={`rounded-lg border border-current/30 p-3 ${toneText}`}>
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className={`font-display text-2xl font-semibold ${toneText}`}>
              {meta.label}
            </h3>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {meta.sub}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ensemble confidence across 3 models · {result.framesAnalyzed} frame
            {result.framesAnalyzed > 1 ? "s" : ""} analyzed in{" "}
            {(result.durationMs / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="text-right">
          <div className={`font-display text-5xl font-bold tabular-nums ${toneText}`}>
            {result.overall}
            <span className="text-2xl">%</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            manipulation probability
          </div>
        </div>
      </div>

      {/* ── Face detection notice ── */}
      {!result.faceDetected && (
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2.5">
          <UserX className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            No human face detected in this image — facial analysis was skipped.
            Results are based on frequency-domain and texture analysis only.
          </p>
        </div>
      )}

      {/* ── Plain-English explanation ── */}
      <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          What we found
        </div>
        {result.explanation.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/90">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};
