"use client";

import { HeroSection } from "../components/HeroSection";
import { UseCasesSection } from "../components/UseCasesSection";
import { DemoSection } from "../components/DemoSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { CTASection } from "../components/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UseCasesSection />
      <DemoSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
