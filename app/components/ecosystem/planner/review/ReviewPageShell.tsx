"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import ReviewActivityMaster from "./ReviewActivityMaster";
import ReviewBookingReadiness from "./ReviewBookingReadiness";
import ReviewBudgetCommandCenter from "./ReviewBudgetCommandCenter";
import ReviewChangeHistory from "./ReviewChangeHistory";
import ReviewCreatorExperience from "./ReviewCreatorExperience";
import ReviewFinalBookingBasket from "./ReviewFinalBookingBasket";
import ReviewFinalCTA from "./ReviewFinalCTA";
import ReviewHero from "./ReviewHero";
import ReviewDayWiseItinerary from "./ReviewDayWiseItinerary";
import ReviewExecutiveSummary from "./ReviewExecutiveSummary";
import ReviewReadinessStrip from "./ReviewReadinessStrip";
import ReviewRouteJourney from "./ReviewRouteJourney";
import ReviewSectionNavigator from "./ReviewSectionNavigator";
import ReviewLocalLife from "./ReviewLocalLife";
import ReviewLocalMarket from "./ReviewLocalMarket";
import ReviewPlannerAuditCenter from "./ReviewPlannerAuditCenter";
import ReviewStayMaster from "./ReviewStayMaster";
import ReviewStickyBottomBar from "./ReviewStickyBottomBar";
import ReviewTopStats from "./ReviewTopStats";
import ReviewTransportMaster from "./ReviewTransportMaster";
import ReviewTravellerSection from "./ReviewTravellerSection";
import { useReviewProceedToBook } from "./useReviewProceedToBook";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewPageShellProps = {
  hasLoaded: boolean;
  payload: TiyaSmartPlannerReviewPayload | null;
};

const reviewSections = [
  { id: "section-review-overview", label: "Overview" },
  { id: "section-route", label: "Route" },
  { id: "section-itinerary", label: "Itinerary" },
  { id: "section-transport", label: "Transport" },
  { id: "section-stay", label: "Stay" },
  { id: "section-activities", label: "Activities" },
  { id: "section-local-life", label: "Local Life" },
  { id: "section-creator", label: "Creator" },
  { id: "section-market", label: "Market" },
  { id: "section-travellers", label: "Travellers" },
  { id: "section-budget", label: "Budget" },
  { id: "section-audit", label: "Audit" },
  { id: "section-history", label: "History" },
  { id: "section-readiness", label: "Readiness" },
  { id: "section-basket", label: "Basket" },
  { id: "section-final-cta", label: "Final CTA" },
];

export default function ReviewPageShell({
  hasLoaded,
  payload,
}: ReviewPageShellProps) {
  if (!hasLoaded) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f8ff] px-4 py-10 text-slate-950 lg:px-6 xl:px-8">
        <section className="mx-auto flex min-h-[520px] w-full max-w-6xl min-w-0 items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3 text-sm font-black text-slate-600">
            <Loader2 className="animate-spin text-[#4f46e5]" size={20} />
            Loading Smart Planner review payload
          </div>
        </section>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f8ff] px-4 py-10 text-slate-950 lg:px-6 xl:px-8">
        <section className="mx-auto flex min-h-[520px] w-full max-w-5xl min-w-0 items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#4f46e5]">
              Smart Planner Review
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950">
              No Smart Planner review payload found
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
              Build or update your trip inside Workspace, then proceed to review
              after selecting booking items.
            </p>
            <Link
              href="/smart-planner/workspace"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-7 text-sm font-black text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)]"
            >
              <ArrowLeft size={17} />
              Back to Workspace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <ReviewLoadedPage payload={payload} />;
}

function ReviewLoadedPage({ payload }: { payload: TiyaSmartPlannerReviewPayload }) {
  const proceed = useReviewProceedToBook(payload);
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f8ff] px-4 pb-32 pt-8 text-slate-950 lg:px-6 xl:px-8">
      <section className="mx-auto grid w-full max-w-7xl min-w-0 gap-6 overflow-hidden">
        <div id="section-review-overview" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewHero payload={payload} />
        </div>
        <ReviewSectionNavigator sections={reviewSections} />
        <div className="grid min-w-0 gap-6 overflow-hidden scroll-mt-28">
          <ReviewTopStats payload={payload} />
          <ReviewReadinessStrip payload={payload} />
          <ReviewExecutiveSummary payload={payload} />
        </div>
        <div id="section-route" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewRouteJourney payload={payload} />
        </div>
        <div id="section-itinerary" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewDayWiseItinerary payload={payload} />
        </div>
        <div id="section-transport" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewTransportMaster payload={payload} />
        </div>
        <div id="section-stay" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewStayMaster payload={payload} />
        </div>
        <div id="section-activities" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewActivityMaster payload={payload} />
        </div>
        <div id="section-local-life" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewLocalLife payload={payload} />
        </div>
        <div id="section-creator" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewCreatorExperience payload={payload} />
        </div>
        <div id="section-market" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewLocalMarket payload={payload} />
        </div>
        <div id="section-travellers" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewTravellerSection payload={payload} />
        </div>
        <div id="section-budget" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewBudgetCommandCenter payload={payload} />
        </div>
        <div id="section-audit" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewPlannerAuditCenter payload={payload} />
        </div>
        <div id="section-history" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewChangeHistory payload={payload} />
        </div>
        <div id="section-readiness" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewBookingReadiness payload={payload} />
        </div>
        <div id="section-basket" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewFinalBookingBasket payload={payload} />
        </div>
        <div id="section-final-cta" className="min-w-0 scroll-mt-28 overflow-hidden">
          <ReviewFinalCTA payload={payload} proceed={proceed} />
        </div>
      </section>
      <ReviewStickyBottomBar proceed={proceed} />
    </main>
  );
}
