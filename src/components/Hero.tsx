import { ArrowRight, Cpu, EyeOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-face.jpg";

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-40" />
    <div className="container relative grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-8 lg:py-36">
      <div className="flex flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          AI-Powered · On-Device · Explainable
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          See the lie.
          <br />
          <span className="text-gradient">Expose the deepfake.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          VeridiX is a free, offline-first deepfake detection shield. A 3-model ensemble flags
          manipulated video and overlays an artifact heatmap so you see <em>exactly</em> where the
          fakery lives — built first for India, designed for the world.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90">
            <a href="#analyze">
              Analyze a file <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#how">How it works</a>
          </Button>
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            { k: "900%", v: "growth in deepfakes since 2019" },
            { k: "₹1,200cr", v: "lost to deepfake fraud in India (2024)" },
            { k: "87%", v: "of people can't tell real from fake" },
          ].map((s) => (
            <div key={s.k}>
              <dt className="font-display text-2xl font-bold text-foreground md:text-3xl">{s.k}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <img
            src={heroImage}
            alt="Wireframe face dissolving into pixels with red deepfake heatmap"
            width={1920}
            height={1080}
            className="block w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <span className="rounded-md border border-verdict-fake/40 bg-verdict-fake/10 px-2 py-1 text-verdict-fake">
              ● Heatmap: cheek + jaw artefacts
            </span>
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
              ● Confidence: 87%
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {[
            { i: Cpu, t: "On-device" },
            { i: EyeOff, t: "Zero cloud" },
            { i: Globe, t: "Indic UI" },
          ].map(({ i: Icon, t }) => (
            <div key={t} className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2 py-1.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[11px]">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
