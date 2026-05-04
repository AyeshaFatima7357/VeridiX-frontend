/**
 * UploadBox — unified file upload + URL paste interface.
 *
 * Both input modes are visible at the same time:
 *   Mode A — drag-drop / click file zone (JPG, PNG, MP4)
 *   Mode B — URL paste input below the zone
 *
 * One shared "Detect Now" button triggers the detection flow.
 * State is owned by Landing.tsx — this component reports up via props.
 * Mobile-first, works at 360px width.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Upload,
  Film,
  Link,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { detect, pingHealth } from "@/services/detectService";
import { extractVideoFrame, isVideoFile } from "@/services/extractVideoFrame";
import { showColdStartToast } from "@/components/ToastNotification";
import type { DetectionResult } from "@/services/detectService";

// ── Props ────────────────────────────────────────────────────────────────────

interface UploadBoxProps {
  setIsLoading: (v: boolean) => void;
  setResult:    (v: DetectionResult | null) => void;
  setError:     (v: string | null) => void;
  setShowToast: (v: boolean) => void;
  isLoading:    boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES   = 50 * 1024 * 1024;   // 50 MB
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_EXTS_RE  = /\.(jpe?g|png|mp4|mov|webm)$/i;

// ── Component ────────────────────────────────────────────────────────────────

export function UploadBox({
  setIsLoading,
  setResult,
  setError,
  setShowToast,
  isLoading,
}: UploadBoxProps) {
  // File state
  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]         = useState<string | null>(null);
  const [isVideo, setIsVideo]               = useState(false);

  // URL state
  const [urlValue, setUrlValue]             = useState("");

  // UI state
  const [isDragging, setIsDragging]         = useState(false);
  const [inlineError, setInlineError]       = useState<string | null>(null);
  const [statusText, setStatusText]         = useState<string | null>(null);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const resultAnchor  = useRef<HTMLDivElement>(null);   // scroll target in Landing

  // ── Cleanup preview object URL on unmount / file change ──────────────────

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const clearAll = () => {
    setInlineError(null);
    setError(null);
    setStatusText(null);
  };

  const showInlineError = (msg: string) => {
    setInlineError(msg);
    setError(msg);
    setShowToast(true);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsVideo(false);
    clearAll();
  };

  // ── File validation & preview ─────────────────────────────────────────────

  const processFile = (file: File) => {
    clearAll();

    const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS_RE.test(file.name);
    if (!typeOk) {
      showInlineError("Only JPG, PNG, or MP4 files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showInlineError("File too large. Maximum 50MB.");
      return;
    }

    // Revoke previous preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const video = isVideoFile(file);
    setIsVideo(video);
    setSelectedFile(file);

    if (!video) {
      // Image preview
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // Video — generate thumbnail via canvas
      generateVideoThumbnail(file).then((thumb) => {
        setPreviewUrl(thumb);
      }).catch(() => {
        setPreviewUrl(null);   // fall back to film icon
      });
    }
  };

  const generateVideoThumbnail = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const url   = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload    = "metadata";
      video.muted      = true;
      video.playsInline = true;

      video.addEventListener("loadeddata", () => {
        video.currentTime = Math.min(video.duration / 2, 2);
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width  = video.videoWidth  || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("no ctx")); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      });

      video.addEventListener("error", () => { URL.revokeObjectURL(url); reject(new Error("load error")); });
      video.src = url;
    });

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  // ── Detection flow ────────────────────────────────────────────────────────

  const runDetection = useCallback(async () => {
    const hasFile = !!selectedFile;
    const hasUrl  = !!urlValue.trim();

    // Validation
    if (hasFile && hasUrl) {
      showInlineError("Use either a file or a URL, not both.");
      return;
    }
    if (!hasFile && !hasUrl) {
      showInlineError("Please select a file or enter a URL.");
      return;
    }
    if (hasUrl && !/^https?:\/\//i.test(urlValue.trim())) {
      showInlineError("URL must start with http:// or https://");
      return;
    }

    // Step 2 — set loading state
    setIsLoading(true);
    setResult(null);
    setError(null);
    setInlineError(null);
    setStatusText(null);

    // Ping health — cold-start toast if slow
    const coldTimer = setTimeout(showColdStartToast, 3_000);
    await pingHealth();
    clearTimeout(coldTimer);

    try {
      let result: DetectionResult;

      if (hasFile && selectedFile) {
        // Step 1 — extract frame if MP4
        let imageFile: File | Blob = selectedFile;
        if (isVideoFile(selectedFile)) {
          setStatusText("Extracting frame from video...");
          imageFile = await extractVideoFrame(selectedFile);
        }
        setStatusText(null);

        // Step 3 — call detection service with unified detect()
        result = await detect(imageFile, "");
      } else {
        result = await detect(null, urlValue.trim());
      }

      // Step 4 — report result up
      if (result.status === "error") {
        setError(result.message || "Detection failed.");
        setShowToast(true);
      }
      setResult(result);

      // Step 5 — scroll result into view
      setTimeout(() => {
        resultAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err: unknown) {
      // Error shapes per spec:
      //   HTTP 400/413 → err.response.data.error
      //   HTTP 429/503 → err.response.data.message
      //   Network fail → no response object at all
      type AxiosErr = {
        response?: {
          data?: {
            error?:   string;
            message?: string;
            detail?:  { error?: string } | string;
          };
        };
        message?: string;
      };
      const axErr = err as AxiosErr;
      const data  = axErr?.response?.data;

      let msg: string;
      if (!axErr.response) {
        // Network failure — server unreachable or no internet
        msg = "Cannot reach server. Check your connection or wait for the server to wake up.";
      } else {
        msg =
          data?.error ||
          data?.message ||
          (typeof data?.detail === "string" ? data.detail : data?.detail?.error) ||
          axErr.message ||
          "Something went wrong. Please try again.";
      }

      setError(msg);
      setShowToast(true);
      setInlineError(msg);
      setResult({ status: "error", message: msg });
    } finally {
      setIsLoading(false);
      setStatusText(null);
    }
  }, [selectedFile, urlValue, setIsLoading, setResult, setError, setShowToast]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasFile      = !!selectedFile;
  const hasUrl       = !!urlValue.trim();
  const bothFilled   = hasFile && hasUrl;
  const canDetect    = (hasFile || hasUrl) && !isLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">

      {/* ── Mode A: Drop zone ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image or video file"
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !isLoading && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed transition ${
          isDragging
            ? "border-[#00D4FF] bg-[#00D4FF]/10"
            : "border-[#00D4FF]/30 bg-[#111827] hover:border-[#00D4FF]/60 hover:bg-[#00D4FF]/5"
        } ${isLoading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
      >
        {/* Preview or placeholder */}
        {previewUrl ? (
          /* ── Preview ── */
          <div className="relative">
            <img
              src={previewUrl}
              alt={isVideo ? "Video thumbnail" : "Selected image preview"}
              className="max-h-56 w-full object-cover"
            />
            {/* Video badge */}
            {isVideo && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <Film className="h-3 w-3" /> MP4
              </span>
            )}
            {/* Clear button */}
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Filename bar */}
            <div className="border-t border-white/10 bg-black/40 px-3 py-2 backdrop-blur-sm">
              <p className="truncate text-xs text-[#F1F5F9]">{selectedFile?.name}</p>
            </div>
          </div>
        ) : (
          /* ── Empty placeholder ── */
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00D4FF]/10 ring-1 ring-[#00D4FF]/20">
              <Upload className="h-6 w-6 text-[#00D4FF]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#F1F5F9]">
                Drop file here or click to browse
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                JPG, PNG, MP4 &nbsp;·&nbsp; Max 50 MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
        />
      </div>

      {/* ── Mode B: URL input ── */}
      <div className="space-y-1.5">
        <div
          className={`flex overflow-hidden rounded-xl border bg-[#111827] transition ${
            urlValue
              ? "border-[#00D4FF]/50 ring-1 ring-[#00D4FF]/20"
              : "border-white/15 focus-within:border-[#00D4FF]/50 focus-within:ring-1 focus-within:ring-[#00D4FF]/20"
          }`}
        >
          <div className="flex items-center pl-3.5">
            <Link className="h-4 w-4 shrink-0 text-[#64748B]" />
          </div>
          <input
            type="url"
            value={urlValue}
            onChange={(e) => { setUrlValue(e.target.value); clearAll(); }}
            onKeyDown={(e) => e.key === "Enter" && canDetect && runDetection()}
            placeholder="Or paste a YouTube / video URL here..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none disabled:opacity-60"
          />
          {urlValue && (
            <button
              onClick={() => { setUrlValue(""); clearAll(); }}
              className="flex items-center pr-3 text-[#64748B] hover:text-[#F1F5F9]"
              aria-label="Clear URL"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-[#64748B]">
          Direct image links or short video clips (under 5 seconds) are supported.
        </p>
      </div>

      {/* ── Both-filled warning ── */}
      {bothFilled && (
        <div className="flex items-start gap-2 rounded-lg border border-[#FFB800]/30 bg-[#FFB800]/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB800]" />
          <p className="text-sm text-[#FFB800]">Use either a file or a URL, not both.</p>
        </div>
      )}

      {/* ── Inline error ── */}
      {inlineError && !bothFilled && (
        <div className="flex items-start gap-2 rounded-lg border border-[#FF3B3B]/30 bg-[#FF3B3B]/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3B3B]" />
          <p className="text-sm text-[#FF3B3B]">{inlineError}</p>
        </div>
      )}

      {/* ── Status text (frame extraction) ── */}
      {statusText && (
        <p className="text-center text-xs font-medium text-[#00D4FF]">{statusText}</p>
      )}

      {/* ── Detect Now button ── */}
      <button
        onClick={runDetection}
        disabled={!canDetect || bothFilled}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition active:scale-95 ${
          canDetect && !bothFilled
            ? "bg-[#00D4FF] text-[#0A0E1A] hover:bg-[#00D4FF]/90"
            : "cursor-not-allowed bg-[#00D4FF]/20 text-[#00D4FF]/50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analysing...
          </>
        ) : (
          "Detect Now"
        )}
      </button>

      {/* Invisible scroll anchor — Landing mounts ResultCard below this */}
      <div ref={resultAnchor} />
    </div>
  );
}
