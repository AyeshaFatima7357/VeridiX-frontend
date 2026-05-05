import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/detector";

type Props = {
  src: string;
  isVideo: boolean;
  result: AnalysisResult | null;
  showHeatmap: boolean;
};

/**
 * Renders the uploaded media with a deepfake artifact heatmap drawn on top.
 *
 * IMPORTANT: Hotspots are ONLY drawn when result.faceDetected === true AND
 * result.hotspots is non-empty. If no face was found, the canvas stays clear
 * so we never show fake "jawline" or "eye region" boxes on non-face images.
 */
export const HeatmapCanvas = ({ src, isVideo, result, showHeatmap }: Props) => {
  const overlayRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas whenever we shouldn't draw
    const shouldDraw =
      result &&
      showHeatmap &&
      dims.w > 0 &&
      result.faceDetected &&          // ← only draw if face was detected
      result.hotspots.length > 0;     // ← only draw if hotspots exist

    if (!shouldDraw) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width        = dims.w * dpr;
    canvas.height       = dims.h * dpr;
    canvas.style.width  = `${dims.w}px`;
    canvas.style.height = `${dims.h}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dims.w, dims.h);

    const colorFor = (intensity: number): [string, string, string] => {
      if (result!.verdict === "deepfake") {
        return [
          `rgba(239, 68, 68, ${0.55 * intensity})`,
          `rgba(239, 68, 68, ${0.25 * intensity})`,
          "rgba(239, 68, 68, 0)",
        ];
      }
      if (result!.verdict === "suspicious") {
        return [
          `rgba(251, 191, 36, ${0.55 * intensity})`,
          `rgba(251, 191, 36, ${0.25 * intensity})`,
          "rgba(251, 191, 36, 0)",
        ];
      }
      return [
        `rgba(34, 197, 94, ${0.4 * intensity})`,
        `rgba(34, 197, 94, ${0.15 * intensity})`,
        "rgba(34, 197, 94, 0)",
      ];
    };

    // Draw radial heat blobs
    ctx.globalCompositeOperation = "screen";
    for (const h of result!.hotspots) {
      const cx     = h.x * dims.w;
      const cy     = h.y * dims.h;
      const radius = h.r * Math.min(dims.w, dims.h) * 1.6;
      const [c0, c1, c2] = colorFor(h.intensity);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, c0);
      grad.addColorStop(0.5, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bounding boxes + labels on top
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "500 11px JetBrains Mono, monospace";

    for (const h of result!.hotspots) {
      const cx = h.x * dims.w;
      const cy = h.y * dims.h;
      const r  = h.r * Math.min(dims.w, dims.h);

      const boxColor =
        result!.verdict === "deepfake"
          ? "rgba(239, 68, 68, 0.85)"
          : result!.verdict === "suspicious"
          ? "rgba(251, 191, 36, 0.85)"
          : "rgba(34, 197, 94, 0.7)";

      ctx.strokeStyle = boxColor;
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
      ctx.setLineDash([]);

      // Label background + text
      const label = h.label;
      const padX  = 6;
      const tw    = ctx.measureText(label).width + padX * 2;
      ctx.fillStyle = "rgba(8, 12, 18, 0.85)";
      ctx.fillRect(cx - r, cy - r - 18, tw, 16);
      ctx.fillStyle = boxColor;
      ctx.fillText(label, cx - r + padX, cy - r - 6);
    }
  }, [dims, result, showHeatmap]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-black"
    >
      {isVideo ? (
        <video src={src} controls className="block w-full" />
      ) : (
        <img
          src={src}
          alt="Media being analyzed for deepfake artifacts"
          className="block w-full"
        />
      )}
      <canvas
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: showHeatmap && result?.faceDetected && result.hotspots.length > 0 ? 1 : 0 }}
      />
    </div>
  );
};
