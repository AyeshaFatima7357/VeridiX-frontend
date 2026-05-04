/**
 * ToastNotification — cold-start warning toast.
 *
 * Props:
 *   show    (boolean) — controls visibility
 *   message (string)  — optional override; defaults to cold-start message
 *
 * Position: bottom-right on desktop, bottom-center on mobile.
 * Animates in from below using CSS transform translateY.
 * Auto-dismissed by Landing after 8 seconds.
 *
 * Also exports standalone helper functions used elsewhere in the app.
 */

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Info, WifiOff } from "lucide-react";

// ── Visual toast component (used by Landing.tsx) ──────────────────────────────

interface ToastNotificationProps {
  show:     boolean;
  message?: string;
  onClose?: () => void;
}

export function ToastNotification({
  show,
  message,
  onClose,
}: ToastNotificationProps) {
  const [visible, setVisible] = useState(false);

  // Delay one frame so the CSS translateY transition fires on entry
  useEffect(() => {
    if (show) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Server status notification"
      style={{
        position:        "fixed",
        bottom:          "24px",
        right:           "16px",
        left:            "16px",
        zIndex:          9999,
        transform:       visible ? "translateY(0)" : "translateY(120%)",
        opacity:         visible ? 1 : 0,
        transition:      "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        maxWidth:        "420px",
        /* On desktop: pin to bottom-right */
        marginLeft:      "auto",
      }}
    >
      <div
        style={{
          background:   "#1E293B",
          border:       "1px solid #FFB800",
          borderRadius: "12px",
          padding:      "14px 16px",
          display:      "flex",
          alignItems:   "flex-start",
          gap:          "12px",
          boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            flexShrink:      0,
            width:           "32px",
            height:          "32px",
            borderRadius:    "8px",
            background:      "rgba(255,184,0,0.15)",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}
        >
          <Zap style={{ width: "16px", height: "16px", color: "#FFB800" }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin:     0,
              fontSize:   "13px",
              fontWeight: 600,
              color:      "#FFB800",
              lineHeight: 1.4,
            }}
          >
            {message || "Server is waking up, please wait a moment..."}
          </p>
          <p
            style={{
              margin:     "4px 0 0",
              fontSize:   "12px",
              color:      "#94A3B8",
              lineHeight: 1.4,
            }}
          >
            This only happens after 15 minutes of inactivity. Ready soon.
          </p>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            style={{
              flexShrink:  0,
              background:  "none",
              border:      "none",
              cursor:      "pointer",
              padding:     "2px",
              color:       "#64748B",
              lineHeight:  1,
            }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Standalone sonner helpers (used from UploadBox, etc.) ─────────────────────

/** Show a "server is waking up" cold-start warning via sonner. */
export function showColdStartToast() {
  toast.warning("Server is waking up, please wait a moment...", {
    icon:        <WifiOff style={{ width: "16px", height: "16px", color: "#FFB800" }} />,
    duration:    8_000,
    description: "This only happens after 15 minutes of inactivity. Ready soon.",
  });
}

/** Show a success toast after detection completes. */
export function showSuccessToast(verdict: string) {
  toast.success(`Analysis complete — ${verdict}`, {
    icon:     <CheckCircle style={{ width: "16px", height: "16px", color: "#00FF88" }} />,
    duration: 4_000,
  });
}

/** Show a rate-limit / API error toast. */
export function showErrorToast(message: string) {
  toast.error(message, {
    icon:     <AlertTriangle style={{ width: "16px", height: "16px", color: "#FF3B3B" }} />,
    duration: 6_000,
  });
}

/** Show a generic info toast. */
export function showInfoToast(message: string) {
  toast.info(message, {
    icon:     <Info style={{ width: "16px", height: "16px", color: "#00D4FF" }} />,
    duration: 4_000,
  });
}
