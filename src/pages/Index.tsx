import { SiteHeader } from "@/components/SiteHeader";
import { Hero }       from "@/components/Hero";
import { Detector }   from "@/components/Detector";
import { Pipeline }   from "@/components/Pipeline";
import { TechStack }  from "@/components/TechStack";
import { Impact }     from "@/components/Impact";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => (
  <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
    <SiteHeader />
    <main>
      <Hero />
      {/* id="analyze" lives inside Detector */}
      <Detector />
      {/* id="how" lives inside Pipeline */}
      <Pipeline />
      {/* id="stack" lives inside TechStack */}
      <TechStack />
      {/* id="impact" lives inside Impact */}
      <Impact />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
