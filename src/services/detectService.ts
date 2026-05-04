/**
 * detectService.ts
 *
 * Sends a file (JPEG/PNG Blob) or a URL string to the VeridiX backend
 * for deepfake detection and returns the parsed response object.
 *
 * Error handling philosophy:
 *   Errors are NOT caught here — they propagate to UploadBox which owns
 *   the error display logic. This keeps the service layer clean and testable.
 *
 * Expected response shape from backend:
 * {
 *   status:           "success" | "error",
 *   verdict:          "FAKE" | "REAL" | "SUSPICIOUS",
 *   confidence_score: 0.97,           // raw float 0.0 – 1.0
 *   confidence_band:  "HIGH PROBABILITY DEEPFAKE" | "SUSPICIOUS — Review Carefully" | "LIKELY AUTHENTIC",
 *   source_api:       "sightengine" | "hive" | "cache",
 *   heatmap_base64:   "<base64 JPEG string>",
 *   explanation:      "<plain English description>",
 *   message:          "<error message when status === 'error'>"
 * }
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

export interface DetectionResult {
  status:            "success" | "error";
  verdict?:          "FAKE" | "REAL" | "SUSPICIOUS";
  confidence_score?: number;       // raw float 0.0 – 1.0, never rounded
  confidence_band?:  string;       // human-readable label for the frontend
  source_api?:       "sightengine" | "hive" | "cache";
  heatmap_base64?:   string;       // base64 JPEG — use as data:image/jpeg;base64,...
  explanation?:      string;       // plain English summary
  message?:          string;       // error message when status === "error"
}

// ── Main detection function ──────────────────────────────────────────────────

/**
 * Send a file Blob or a URL to the backend /detect endpoint.
 *
 * @param fileOrBlob  JPEG/PNG File or Blob (from extractVideoFrame for MP4s).
 *                    Pass null if using URL mode.
 * @param url         Plain-text URL string. Pass "" if using file mode.
 * @returns           Parsed DetectionResult from the backend.
 *
 * @throws  axios errors propagate to the caller (UploadBox):
 *   - Timeout (30s)                → UploadBox shows cold-start message
 *   - HTTP 400 / 413               → UploadBox reads error.response.data.error
 *   - HTTP 429 / 503               → UploadBox reads error.response.data.message
 *   - Network failure (no response)→ UploadBox shows "Cannot reach server..."
 */
export async function detect(
  fileOrBlob: File | Blob | null = null,
  url: string = ""
): Promise<DetectionResult> {
  const formData = new FormData();

  if (fileOrBlob) {
    // Always send as "upload.jpg" — backend expects JPEG/PNG only
    formData.append("file", fileOrBlob, "upload.jpg");
  } else if (url.trim()) {
    formData.append("url", url.trim());
  } else {
    throw new Error("Provide either a file or a URL.");
  }

  const response = await axios.post<DetectionResult>(
    `${BASE_URL}/detect`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30_000,   // 30 seconds — accounts for Render free tier cold start
    }
  );

  return response.data;
}

// ── Health ping ──────────────────────────────────────────────────────────────

/**
 * Ping the backend /health endpoint.
 *
 * Returns true  if the server responds with HTTP 200.
 * Returns false if the server is unreachable, sleeping, or errors.
 *
 * Used by UploadBox to detect Render cold starts and show a toast warning
 * if the response takes more than 3 seconds.
 */
export async function pingHealth(): Promise<boolean> {
  try {
    const res = await axios.get(`${BASE_URL}/health`, { timeout: 5_000 });
    return res.status === 200;
  } catch {
    return false;
  }
}
