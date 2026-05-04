import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Detector } from "@/components/Detector";
import { Pipeline } from "@/components/Pipeline";
import { TechStack } from "@/components/TechStack";
import { Impact } from "@/components/Impact";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Detector />
        <Pipeline />
        <TechStack />
        <Impact />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
