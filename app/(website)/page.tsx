import { Suspense } from "react";

import HeroSection from "../components/homepage/HeroSection";
import SpecialOffersStrip from "../components/homepage/SpecialOffers/SpecialOffersStrip";
import PopularDestinations from "../components/homepage/PopularDestinations/PopularDestinations";
import ContinentsSection from "../components/homepage/continents/ContinentsSection";
import ThemeSection from "../components/homepage/themes/ThemeSection";
import ExperiencesSection from "../components/homepage/experiences/ExperiencesSection";
import TPLCreatorEcosystemTeaser from "../components/homepage/creators/TPLCreatorEcosystemTeaser";
import WhyChooseUsSection from "../components/homepage/why-choose-us/WhyChooseUsSection";
import TestimonialsSection from "../components/homepage/testimonials/TestimonialsSection";
import FaqSection from "../components/homepage/faq/FaqSection";
import FinalCtaSection from "../components/homepage/final-cta/FinalCtaSection";
import FooterSection from "../components/homepage/footer/FooterSection";

export default function Home() {
  return (
    <Suspense fallback={<div />}>
      <HeroSection />
      <SpecialOffersStrip />
      <PopularDestinations />
      <ContinentsSection />
      <ThemeSection />
      <ExperiencesSection />
      <TPLCreatorEcosystemTeaser />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </Suspense>
  );
}