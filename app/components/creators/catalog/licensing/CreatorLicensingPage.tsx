"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import typography from "../CreatorTypography.module.css";
import CreatorLicensingHero from "./CreatorLicensingHero";
import CreatorLicenseCards from "./CreatorLicenseCards";
import CreatorLicenseComparison from "./CreatorLicenseComparison";
import CreatorRightsGrid from "./CreatorRightsGrid";
import CreatorReleaseSection from "./CreatorReleaseSection";
import CreatorCertificatePreview from "./CreatorCertificatePreview";
import CreatorWorkflow from "./CreatorWorkflow";
import CreatorFAQ from "./CreatorFAQ";
import CreatorLicensingCTA from "./CreatorLicensingCTA";

export default function CreatorLicensingPage() {
  const router = useRouter();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [notice, setNotice] = useState("");
  const studio = () => isAuthenticated && user ? router.push("/creator-studio") : openLoginModal();
  const compare = () => document.getElementById("license-comparison")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-white text-slate-950`}>
    <CreatorMarketplaceHeader onStudio={studio} userName={user?.fullName ?? user?.email ?? "Account"} />
    <main>
      <CreatorLicensingHero onCompare={compare} onPlans={() => router.push("/creators#creator-plans")} />
      <CreatorLicenseCards onCompare={compare} />
      <CreatorLicenseComparison />
      <CreatorRightsGrid />
      <CreatorReleaseSection />
      <CreatorCertificatePreview />
      <CreatorWorkflow />
      <CreatorFAQ />
      <CreatorLicensingCTA notice={notice} onContact={() => setNotice("Licensing team contact preview opened — no request was sent.")} onPlans={() => router.push("/creators#creator-plans")} onExplore={() => router.push("/creators/search")} />
    </main>
    <CreatorMarketplaceFooter onStudio={studio} />
  </div>;
}
