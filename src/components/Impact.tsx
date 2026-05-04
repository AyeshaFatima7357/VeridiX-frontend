import { useState } from "react";
import {
  Users, Building2, Newspaper, Scale, GraduationCap, Landmark, ShieldHalf,
} from "lucide-react";

const GROUPS = [
  { i: Users,        h: "Women & Families",      p: "Immediate alert before sharing suspicious clips. Tool to report and prove morphed content. Verify identity in video calls." },
  { i: Building2,    h: "Businesses",             p: "Stop CEO-fraud deepfake attacks. Verify video-call identity before financial transactions. Vet interview footage." },
  { i: Newspaper,    h: "Journalists",            p: "Verify video evidence before publishing. Build credibility through verified content labelling." },
  { i: Scale,        h: "Legal Professionals",    p: "Submit deepfake analysis as expert evidence. Verify video testimony. Build cases against perpetrators." },
  { i: GraduationCap,h: "Education",              p: "Detect identity-deepfake cheating in online exams. Verify remote video submissions." },
  { i: Landmark,     h: "Government & EC",        p: "Cyber-crime cells get a free, deployable tool. Election Commission can flag political deepfakes for rapid fact-check." },
  { i: ShieldHalf,   h: "Defence & Intelligence", p: "Verify intercepted enemy comms. Counter narrative-warfare. Edge-AI deployment on field tablets without internet." },
];

const ImpactCard = ({ i: Icon, h, p }: typeof GROUPS[0]) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "12px",
        border:       hovered ? "1px solid rgba(34,211,238,0.35)" : "1px solid rgba(255,255,255,0.08)",
        background:   hovered ? "rgba(34,211,238,0.05)"           : "rgba(17,24,39,0.8)",
        padding:      "24px",
        transition:   "border-color 0.2s, background 0.2s",
        cursor:       "default",
      }}
    >
      <Icon style={{ width: "22px", height: "22px", color: "#22d3ee" }} strokeWidth={1.75} />
      <h3 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "16px", fontWeight: 600, color: "#F1F5F9", margin: "14px 0 8px" }}>
        {h}
      </h3>
      <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>{p}</p>
    </div>
  );
};

export const Impact = () => (
  <section id="impact" className="relative border-t border-border bg-card/30 py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-12 max-w-2xl">
        <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22d3ee", marginBottom: "12px" }}>
          Stakeholder Impact
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, color: "#F1F5F9", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
          Built for everyone the lie can hurt.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => <ImpactCard key={g.h} {...g} />)}
      </div>
    </div>
  </section>
);
