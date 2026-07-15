"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { creatorBenefits } from "@/app/lib/creators/creatorOnboardingData";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import typography from "../CreatorTypography.module.css";
import CreatorOnboardingHero from "./CreatorOnboardingHero";

export default function CreatorBecomeCreatorPage() {
  const router = useRouter();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const studio = () => isAuthenticated && user ? router.push("/creator-studio") : openLoginModal();
  const learn = () => document.getElementById("creator-benefits")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-slate-50 text-slate-950`}><CreatorMarketplaceHeader onStudio={studio} userName={user?.fullName ?? user?.email ?? "Account"} /><main><CreatorOnboardingHero onStart={() => router.push("/creators/onboarding")} onLearn={learn} /><section id="creator-benefits" className="scroll-mt-24 py-14"><div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Creator-first platform</p><h2 className="mt-2">Everything you need to grow professionally</h2><p className="mt-3 font-medium text-slate-600">A guided application opens the path to trusted licensing, portfolio tools and a global marketplace.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{creatorBenefits.map(({ title, description, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm font-medium text-slate-600">{description}</p></article>)}</div><div className="mt-9 text-center"><button type="button" onClick={() => router.push("/creators/onboarding")} className="min-h-11 rounded-lg bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-500">Start Your Application</button></div></div></section></main><CreatorMarketplaceFooter onStudio={studio} /></div>;
}
