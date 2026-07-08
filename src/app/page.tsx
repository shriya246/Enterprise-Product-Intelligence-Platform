import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { TrustSection } from "@/components/landing/trust-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <TrustSection />
        <FeatureGrid />
        <WorkflowSection />
        <DashboardPreview />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
