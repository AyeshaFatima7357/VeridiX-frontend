import { Shield } from "lucide-react";

export const SiteFooter = () => (
  <footer className="border-t border-border bg-background py-10">
    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
          <Shield className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-display text-sm font-semibold">VeridiX</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">DeepFake Detector Lite</span>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">
        Built first for India · Designed for the world · Free for all
      </p>
    </div>
  </footer>
);
