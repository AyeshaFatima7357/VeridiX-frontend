import { useEffect, useState } from "react";

const STAGES = [
  "Extracting frames",
  "Detecting faces (MediaPipe)",
  "Cropping regions of interest",
  "Running EfficientNet-B4 (facial)",
  "Running XceptionNet + FFT (frequency)",
  "Running MesoNet-Temporal (temporal)",
  "Computing ensemble confidence",
  "Generating heatmap",
];

export const ScanningOverlay = ({ durationMs }: { durationMs: number }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const step = durationMs / STAGES.length;
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), step);
    return () => clearInterval(id);
  }, [durationMs]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-background/85 backdrop-blur-sm">
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" />
        <div className="absolute inset-3 rounded-full border border-primary/40" />
        <div className="absolute inset-6 rounded-full border border-primary/60 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs text-primary">SCANNING</span>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-2">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-xs">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i < stage ? "bg-primary" : i === stage ? "bg-primary animate-pulse" : "bg-muted"
              }`}
            />
            <span
              className={`font-mono transition-colors ${
                i <= stage ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
              {i === stage && "…"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
