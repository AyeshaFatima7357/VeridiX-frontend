import { useState } from "react";
import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "#analyze", label: "Analyze" },
  { href: "#how", label: "How it works" },
  { href: "#stack", label: "Tech stack" },
  { href: "#impact", label: "Impact" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">VeridiX</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              DeepFake Detector
            </div>
          </div>
        </a>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <a href="#analyze"><Shield className="mr-2 h-4 w-4" /> Try detector</a>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {NAV.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base text-foreground/90 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {n.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-gradient-primary text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  <a href="#analyze"><Shield className="mr-2 h-4 w-4" /> Try detector</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
