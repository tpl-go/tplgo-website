"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Printer,
  Save,
  Send,
} from "lucide-react";
import {
  confirmTripReview,
  generateReviewChecklist,
  generateTripReviewSnapshot,
  saveTripReview,
  TIYA_CONFIRMED_PLAN_KEY,
  TIYA_TRIP_REVIEW_KEY,
} from "@/app/lib/ecosystem/planner/plannerReviewEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaReviewChecklist from "./TiyaReviewChecklist";
import TiyaReviewScore from "./TiyaReviewScore";

type TiyaTripReviewProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  smartAlerts?: TiyaSmartAlert[];
  isGenerating?: boolean;
};

export default function TiyaTripReview({
  intent,
  plan,
  days,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  smartAlerts = [],
  isGenerating = false,
}: TiyaTripReviewProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const snapshot = useMemo(
    () =>
      generateTripReviewSnapshot({
        intent,
        plan,
        days,
        selectedRoute,
        selectedScenarioId,
        selectedVariantId,
        smartAlerts,
      }),
    [
      days,
      intent,
      plan,
      selectedRoute,
      selectedScenarioId,
      selectedVariantId,
      smartAlerts,
    ]
  );
  const checklist = useMemo(
    () => generateReviewChecklist({ intent, plan, selectedRoute }),
    [intent, plan, selectedRoute]
  );
  const editShortcuts = [
    "Edit route",
    "Edit dates",
    "Edit travellers",
    "Edit stays",
    "Edit budget",
    "Edit activities",
    "Edit bundle",
  ];
  const reviewBlocks = [
    ["Trip intent", `${intent.travelStyle} · ${intent.pace} · ${intent.tripType}`],
    [
      "Selected route/scenario",
      `${snapshot.selectedRoute}${
        snapshot.selectedScenario ? ` · ${snapshot.selectedScenario}` : ""
      }`,
    ],
    ["Selected variant", snapshot.selectedVariant || "Base plan"],
    ["Itinerary summary", snapshot.itinerarySummary],
    ["Travel intelligence", snapshot.travelIntelligence],
    ["Selected bundle", snapshot.selectedBundle],
    ["Quote estimate", `₹${snapshot.quoteEstimate.toLocaleString("en-IN")}`],
    ["Booking readiness", snapshot.bookingReadiness],
    ["Expert review status", snapshot.expertReviewStatus],
  ];

  function handleSaveReview() {
    saveTripReview(snapshot);
    setStatusMessage("Trip review saved");
  }

  function handleConfirmPlan() {
    confirmTripReview(snapshot);
    setStatusMessage("Trip plan confirmed locally");
  }

  function handlePrintReview() {
    window.print();
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <ClipboardCheck
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              AI trip review page
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Final Tiya trip review
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Final frontend review of route, itinerary, quote, bundle,
              booking readiness, creator/local market add-ons and expert status.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            Quality {snapshot.scores.tripQualityScore}% · Review ready
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Complete review
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {reviewBlocks.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Seasonal/weather notes
              </div>
              <div className="mt-3 grid gap-2">
                {(snapshot.seasonalWeatherNotes.length
                  ? snapshot.seasonalWeatherNotes
                  : ["Seasonal simulation is within normal range."]
                ).map((note) => (
                  <p
                    key={note}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Rules and warnings
              </div>
              <div className="mt-3 grid gap-2">
                {(snapshot.rulesWarnings.length
                  ? snapshot.rulesWarnings
                  : ["No critical warnings in final review."]
                ).map((warning) => (
                  <p
                    key={warning}
                    className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-semibold leading-5 text-orange-50"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Creator picks
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(snapshot.creatorPicks.length
                  ? snapshot.creatorPicks
                  : ["No creator pick selected"]
                ).map((pick) => (
                  <span
                    key={pick}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {pick}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Local market picks
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(snapshot.localMarketPicks.length
                  ? snapshot.localMarketPicks
                  : ["No market pick selected"]
                ).map((pick) => (
                  <span
                    key={pick}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {pick}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Edit3 size={15} />
              Edit shortcuts
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {editShortcuts.map((shortcut) => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setStatusMessage(`${shortcut} shortcut selected`);
                  }}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-orange-300/30 hover:bg-orange-400/15"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid h-fit gap-3">
          <TiyaReviewScore scores={snapshot.scores} />
          <TiyaReviewChecklist items={checklist} />
          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <button
              type="button"
              onClick={handleConfirmPlan}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              <CheckCircle2 size={15} />
              Confirm Trip Plan
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Send size={15} />
              Request Expert Review
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Send size={15} />
              Continue to Booking
            </button>
            <button
              type="button"
              onClick={handleSaveReview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Save size={15} />
              Save Review
            </button>
            <button
              type="button"
              onClick={handlePrintReview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Printer size={15} />
              Print Review
            </button>
            {statusMessage ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-center text-xs font-black text-emerald-100">
                {statusMessage}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {TIYA_TRIP_REVIEW_KEY}, {TIYA_CONFIRMED_PLAN_KEY}
          </div>
        </aside>
      </div>
    </section>
  );
}
