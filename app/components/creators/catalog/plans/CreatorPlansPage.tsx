"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import type { BillingCycle } from "@/app/lib/creators/creatorPlansData";
import { creatorTestCheckoutAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { stageCreatorCommerceSelection } from "@/app/lib/creators/creatorCommerceCheckoutAdapter";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import typography from "../CreatorTypography.module.css";
import CreatorPlansHero from "./CreatorPlansHero";
import CreatorBillingToggle from "./CreatorBillingToggle";
import CreatorPlanCards from "./CreatorPlanCards";
import CreatorPlanComparison from "./CreatorPlanComparison";
import CreatorPlansInclude from "./CreatorPlansInclude";
import CreatorPlansTrust from "./CreatorPlansTrust";
import CreatorPlansFAQ from "./CreatorPlansFAQ";
import CreatorEnterpriseCTA from "./CreatorEnterpriseCTA";

export default function CreatorPlansPage() {
  const router = useRouter();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [notice, setNotice] = useState("");
  const studio = () => isAuthenticated && user ? router.push("/creator-studio") : openLoginModal();
  const compare = () => document.getElementById("plan-comparison")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const preview = (planKey: string, plan: string) => {
    if (planKey === "enterprise") return setNotice("Sales inquiry preview opened — enterprise does not enter payment.");
    if (planKey === "free") return router.push("/creators/search");
    if (!creatorTestCheckoutAllowed()) return setNotice(`${plan} selection preview opened — testing commerce is disabled and no subscription was created.`);
    if (!isAuthenticated || !user) return openLoginModal({ redirectAfterLogin: "/creators/plans" });
    stageCreatorCommerceSelection({ productType: "creator_plan", planId: planKey, billingCycle: cycle });
    router.push("/creators/checkout/review");
  };

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-white text-slate-950`}><CreatorMarketplaceHeader onStudio={studio} userName={user?.fullName ?? user?.email ?? "Account"} /><main><CreatorPlansHero onCompare={compare} onLicensing={() => router.push("/creators/licensing")} /><section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Flexible preview pricing</p><h2 className="mt-2">Choose the plan that fits your work</h2><p className="mt-3 font-medium text-slate-600">Switch billing periods to preview monthly-equivalent pricing. No checkout or subscription action occurs.</p><div className="mt-6"><CreatorBillingToggle cycle={cycle} onChange={setCycle} /></div></div><div className="mt-9"><CreatorPlanCards cycle={cycle} onSelect={preview} /></div>{notice && <p role="status" className="mx-auto mt-5 max-w-2xl rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800">{notice}</p>}</section><CreatorPlanComparison /><CreatorPlansInclude /><CreatorPlansTrust /><CreatorPlansFAQ /><CreatorEnterpriseCTA notice={notice.startsWith("Sales") ? notice : ""} onContact={() => setNotice("Sales contact preview opened — no request was sent.")} /></main><CreatorMarketplaceFooter onStudio={studio} /></div>;
}
