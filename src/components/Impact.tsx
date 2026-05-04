import { Users, Building2, Newspaper, Scale, GraduationCap, Landmark, ShieldHalf } from "lucide-react";

const GROUPS = [
  { i: Users, h: "Women & Families", p: "Immediate alert before sharing suspicious clips. Tool to report and prove morphed content. Verify identity in video calls." },
  { i: Building2, h: "Businesses", p: "Stop CEO-fraud deepfake attacks. Verify video-call identity before financial transactions. Vet interview footage." },
  { i: Newspaper, h: "Journalists", p: "Verify video evidence before publishing. Build credibility through verified content labelling." },
  { i: Scale, h: "Legal Professionals", p: "Submit deepfake analysis as expert evidence. Verify video testimony. Build cases against perpetrators." },
  { i: GraduationCap, h: "Education", p: "Detect identity-deepfake cheating in online exams. Verify remote video submissions." },
  { i: Landmark, h: "Government & EC", p: "Cyber-crime cells get a free, deployable tool. Election Commission can flag political deepfakes for rapid fact-check." },
  { i: ShieldHalf, h: "Defence & Intelligence", p: "Verify intercepted enemy comms. Counter narrative-warfare. Edge-AI deployment on field tablets without internet." },
];

export const Impact = () => (
  <section id="impact" className="relative border-t border-border bg-card/30 py-20 md:py-28">
    <div className="container max-w-6xl">
      <div className="mb-12 max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Stakeholder Impact</div>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
          Built for everyone the lie can hurt.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map(({ i: Icon, h, p }) => (
          <div key={h} className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card/80">
            <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" strokeWidth={1.75} />
            <h3 className="mt-4 font-display text-lg font-semibold">{h}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
