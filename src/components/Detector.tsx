import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, RotateCcw, Eye, EyeOff, Fingerprint, FileVideo, FileImage, Link2, Youtube, Instagram, Twitter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { analyzeMedia, type AnalysisResult } from "@/lib/detector";
import { HeatmapCanvas } from "./HeatmapCanvas";
import { ScanningOverlay } from "./ScanningOverlay";
import { VerdictBanner } from "./VerdictBanner";
import { ModelBreakdown } from "./ModelBreakdown";
import heroImage from "@/assets/hero-face.jpg";

type State = "idle" | "scanning" | "done";

export const Detector = () => {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs when replaced
  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image") && !f.type.startsWith("video")) {
      toast.error("Please upload an image or video file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error("File too large. Demo limit is 50MB.");
      return;
    }
    if (src) URL.revokeObjectURL(src);
    const url = URL.createObjectURL(f);
    setFile(f);
    setSrc(url);
    setResult(null);
    const analysis = analyzeMedia(f);
    setState("scanning");
    setTimeout(() => {
      setResult(analysis);
      setState("done");
    }, analysis.durationMs);
  }, [src]);

  const handleLink = useCallback(() => {
    const raw = linkUrl.trim();
    if (!raw) {
      toast.error("Paste a video link first.");
      return;
    }
    let host = "";
    try {
      host = new URL(raw).hostname.toLowerCase();
    } catch {
      toast.error("That doesn't look like a valid URL.");
      return;
    }
    const supported = ["youtube.com", "youtu.be", "instagram.com", "twitter.com", "x.com"];
    const ok = supported.some((s) => host.endsWith(s));
    if (!ok) {
      toast.error("Supported sources: YouTube, Instagram, X (Twitter).");
      return;
    }
    toast.info("Link analysis is a preview. Running ensemble on a representative frame.");
    const synthetic = new File([new Uint8Array(64)], `${host}-remote-clip.mp4`, { type: "video/mp4" });
    const analysis = analyzeMedia(synthetic);
    if (src) URL.revokeObjectURL(src);
    setFile(synthetic);
    setSrc(heroImage);
    setResult(null);
    setState("scanning");
    setTimeout(() => {
      setResult(analysis);
      setState("done");
    }, analysis.durationMs);
  }, [linkUrl, src]);

  const reset = () => {
    if (src) URL.revokeObjectURL(src);
    setFile(null);
    setSrc(null);
    setResult(null);
    setState("idle");
    setLinkUrl("");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const isVideo = !!file?.type.startsWith("video");

  return (
    <section id="analyze" className="relative py-20 md:py-28">
      <div className="container max-w-6xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Demo
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            Try the <span className="text-gradient">Detector</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Upload an image or short video. The 3-model ensemble simulates the on-device VeridiX
            pipeline and produces an explainable artifact heatmap.
          </p>
        </div>

        {!src && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-card/40 p-12 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/60 hover:bg-card/70"
            }`}
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-primary">
                <Upload className="h-8 w-8" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">
                  Drop a file here or click to upload
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Images (JPG, PNG, WEBP) or short videos (MP4, WEBM) · max 50MB
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"><FileImage className="h-3 w-3" /> Image</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"><FileVideo className="h-3 w-3" /> Video</span>
                <span className="rounded-md bg-muted px-2 py-1">All processing on-device</span>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {!src && (
          <div className="mt-8">
            <div className="relative my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Or paste a link
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 p-8">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-30 blur-3xl"
              />

              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
                  <Link2 className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">
                    Analyze a video link
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Paste a public URL from YouTube, Instagram, or X (Twitter).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"><Youtube className="h-3 w-3" /> YouTube</span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"><Instagram className="h-3 w-3" /> Instagram</span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"><Twitter className="h-3 w-3" /> X (Twitter)</span>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); handleLink(); }}
                  className="mt-2 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
                >
                  <Input
                    type="url"
                    inputMode="url"
                    placeholder="https://youtube.com/watch?v=…"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    maxLength={500}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Analyze link
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                  Preview feature · simulates remote-frame analysis with the same on-device ensemble.
                </p>
              </div>
            </div>
          </div>
        )}

        {src && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="relative">
                <HeatmapCanvas
                  src={src}
                  isVideo={isVideo}
                  result={result}
                  showHeatmap={showHeatmap}
                />
                {state === "scanning" && (
                  <>
                    <ScanningOverlay durationMs={result?.durationMs ?? 2400} />
                    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg">
                      <div className="scan-line absolute inset-x-0 h-24 animate-scan" />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3">
                <div className="flex items-center gap-3 text-sm">
                  {isVideo ? <FileVideo className="h-4 w-4 text-muted-foreground" /> : <FileImage className="h-4 w-4 text-muted-foreground" />}
                  <span className="truncate font-mono text-xs text-muted-foreground">{file?.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {result && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {showHeatmap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Heatmap
                      </span>
                    </label>
                  )}
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" /> New file
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              {state === "scanning" && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="font-mono text-xs uppercase tracking-wider text-primary">
                    Analyzing…
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Running ensemble inference on-device. No data leaves this browser.
                  </p>
                </div>
              )}
              {result && (
                <>
                  <VerdictBanner result={result} />
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <Fingerprint className="h-5 w-5 shrink-0 text-primary" />
                      <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          GAN Fingerprint
                        </div>
                        <div className="font-display text-lg font-semibold">
                          {result.fingerprint}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Plain-English explanation
                      </div>
                      {result.explanation.map((line, i) => (
                        <p key={i} className="text-sm text-foreground/90">{line}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {result && (
              <div className="lg:col-span-5">
                <div className="mb-4 flex items-end justify-between">
                  <h3 className="font-display text-xl font-semibold">3-Model Ensemble Breakdown</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    weighted vote · ensemble = {result.overall}%
                  </span>
                </div>
                <ModelBreakdown models={result.models} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
