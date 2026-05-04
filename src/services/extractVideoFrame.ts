/**
 * extractVideoFrame.ts
 *
 * Extracts a single JPEG frame from an MP4 file entirely in the browser
 * using the HTML5 Canvas API. No libraries. No server. Pure browser APIs.
 *
 * HARD REQUIREMENT: The VeridiX backend (Render free tier, 512MB RAM) must
 * NEVER receive a raw MP4 file. This function converts any video to a JPEG
 * Blob before anything leaves the browser.
 *
 * Steps:
 *  1.  Create an invisible <video> element (muted, playsInline)
 *  2.  Create an object URL from the File
 *  3.  Set video.src to the object URL
 *  4.  Wait for "loadedmetadata" (5s timeout)
 *  5.  Set video.currentTime = video.duration / 2
 *  6.  Wait for "seeked" (5s timeout)
 *  7.  Create a <canvas> matching video dimensions
 *  8.  drawImage(video) onto the canvas
 *  9.  Export as JPEG Blob at quality 0.85
 * 10.  Revoke the object URL
 * 11.  Remove the video element from memory
 * 12.  Resolve with the JPEG Blob
 */

const METADATA_TIMEOUT_MS = 5_000;
const SEEK_TIMEOUT_MS     = 5_000;
const JPEG_QUALITY        = 0.85;

/**
 * Extract the midpoint frame from a video File as a JPEG Blob.
 *
 * @param file  Any video File (MP4, MOV, WebM, etc.)
 * @returns     A JPEG Blob ready to send to the backend as a regular image upload.
 * @throws      A human-readable string error if extraction fails at any step.
 */
export function extractVideoFrame(file: File): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    let objectUrl: string | null = null;
    let video: HTMLVideoElement | null = null;
    let metadataTimer: ReturnType<typeof setTimeout> | null = null;
    let seekTimer: ReturnType<typeof setTimeout>     | null = null;

    // ── Cleanup helper ────────────────────────────────────────────────────
    const cleanup = () => {
      if (metadataTimer) clearTimeout(metadataTimer);
      if (seekTimer)     clearTimeout(seekTimer);
      if (objectUrl)     URL.revokeObjectURL(objectUrl);   // Step 10
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();   // Step 11 — release memory
        video = null;
      }
    };

    const fail = (msg: string) => {
      cleanup();
      reject(msg);
    };

    try {
      // Step 1 — create invisible video element
      video = document.createElement("video");
      video.muted       = true;
      video.playsInline = true;
      video.preload     = "metadata";
      video.style.display = "none";
      // Not appended to DOM — kept purely in memory

      // Step 2 & 3 — create object URL and assign to video
      objectUrl  = URL.createObjectURL(file);
      video.src  = objectUrl;

      // Step 4 — wait for loadedmetadata with 5s timeout
      metadataTimer = setTimeout(() => {
        fail("Could not read this video file. Try a different format.");
      }, METADATA_TIMEOUT_MS);

      video.addEventListener("loadedmetadata", () => {
        if (!video) return;
        if (metadataTimer) clearTimeout(metadataTimer);

        // Step 5 — seek to midpoint
        const seekTo = video.duration > 0
          ? video.duration / 2
          : 0;

        // Step 6 — wait for seeked with 5s timeout
        seekTimer = setTimeout(() => {
          fail("Video frame extraction timed out.");
        }, SEEK_TIMEOUT_MS);

        video.addEventListener("seeked", () => {
          if (!video) return;
          if (seekTimer) clearTimeout(seekTimer);

          try {
            // Step 7 — create canvas matching video dimensions
            const canvas = document.createElement("canvas");
            canvas.width  = video.videoWidth  || 640;
            canvas.height = video.videoHeight || 480;

            // Step 8 — draw current frame
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              fail("Canvas 2D context is not available in this browser.");
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Step 9 — export as JPEG Blob at quality 0.85
            canvas.toBlob(
              (blob) => {
                cleanup();   // Steps 10 & 11
                if (!blob) {
                  reject("Failed to export canvas frame as JPEG.");
                  return;
                }
                // Step 12 — resolve with the JPEG Blob
                resolve(blob);
              },
              "image/jpeg",
              JPEG_QUALITY
            );
          } catch (drawErr) {
            fail(
              drawErr instanceof Error
                ? drawErr.message
                : "Unexpected error while drawing video frame."
            );
          }
        }, { once: true });

        video.currentTime = seekTo;
      }, { once: true });

      video.addEventListener("error", () => {
        fail("Could not read this video file. Try a different format.");
      }, { once: true });

    } catch (outerErr) {
      // Wrap entire function in try/catch — reject with readable string
      fail(
        outerErr instanceof Error
          ? outerErr.message
          : "Unexpected error during video frame extraction."
      );
    }
  });
}

/**
 * Returns true if the given File is a video that needs frame extraction
 * before being sent to the backend.
 */
export function isVideoFile(file: File): boolean {
  return (
    file.type.startsWith("video/") ||
    /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)
  );
}
