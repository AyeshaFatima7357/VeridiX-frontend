import { ArrowRight, Cpu, EyeOff, Globe } from "lucide-react";
import heroImage from "@/assets/hero-face.jpg";

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-40" />

    <div className="container relative mx-auto px-6 py-16 md:py-20 lg:py-24" style={{ maxWidth: "1280px" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ── LEFT: text ── */}
        <div className="flex flex-col justify-center order-1">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1.5 w-fit mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#22d3ee" }}>
              AI-Powered · On-Device · Explainable
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-bold leading-tight tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "clamp(36px, 5vw, 68px)", letterSpacing: "-0.03em", color: "#F1F5F9", lineHeight: 1.05 }}>
            See the lie.
          </h1>
          <h1 className="font-bold leading-tight tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "clamp(36px, 5vw, 68px)", letterSpacing: "-0.03em", color: "#22d3ee", lineHeight: 1.05 }}>
            Expose the deepfake.
          </h1>

          {/* Body */}
          <p className="mb-8 max-w-lg" style={{ fontSize: "15px", color: "#94A3B8", lineHeight: 1.7 }}>
            VeridiX is a free, offline-first deepfake detection shield. A 3-model ensemble flags
            manipulated video and overlays an artifact heatmap so you see <em>exactly</em> where
            the fakery lives — built first for India, designed for the world.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-12">
            <a href="#analyze" className="inline-flex items-center gap-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-85"
              style={{ padding: "13px 24px", background: "#22d3ee", color: "#0A0E1A", textDecoration: "none", minHeight: "48px" }}>
              Analyze a file <ArrowRight style={{ width: "16px", height: "16px" }} />
            </a>
            <a href="#how" className="inline-flex items-center rounded-lg font-medium text-sm transition-colors"
              style={{ padding: "13px 24px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#F1F5F9", textDecoration: "none", minHeight: "48px" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
              How it works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { k: "900%",     v: "growth in deepfakes since 2019" },
              { k: "₹1,200cr", v: "lost to deepfake fraud in India (2024)" },
              { k: "87%",      v: "of people can't tell real from fake" },
            ].map((s) => (
              <div key={s.k}>
                <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                  {s.k}
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", lineHeight: 1.4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: image + pills ── */}
        <div className="order-2 relative">

          {/* Glow */}
          <div className="absolute -inset-4 rounded-3xl pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.12), transparent 60%)", filter: "blur(40px)", zIndex: 0 }} />

          {/* Image — stable aspect ratio */}
          <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", zIndex: 1, aspectRatio: "16/10" }}>
            <img
              src={heroImage}
              alt="Wireframe face dissolving into pixels with red deepfake heatmap"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
            {/* Bottom gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(10,14,26,0.75) 0%, transparent 55%)" }} />
            {/* Overlay badges */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "6px", border: "1px solid rgba(255,59,59,0.4)", background: "rgba(255,59,59,0.12)", padding: "4px 8px", color: "#FF3B3B" }}>
                ● Heatmap: cheek + jaw artefacts
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "6px", border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.1)", padding: "4px 8px", color: "#22d3ee" }}>
                ● Confidence: 87%
              </span>
            </div>
          </div>

          {/* On-device / Zero cloud / Indic UI pills — centered content */}
          <div className="grid grid-cols-3 gap-2 mt-3" style={{ position: "relative", zIndex: 1 }}>
            {[
              { Icon: Cpu,    label: "On-device" },
              { Icon: EyeOff, label: "Zero cloud" },
              { Icon: Globe,  label: "Indic UI" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 rounded-lg py-2 px-3"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(17,24,39,0.7)" }}>
                <Icon style={{ width: "13px", height: "13px", color: "#22d3ee", flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#94A3B8" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </section>
);
