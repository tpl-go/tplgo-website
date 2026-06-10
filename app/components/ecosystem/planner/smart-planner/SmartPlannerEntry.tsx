"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSmartPlannerMock } from "@/app/lib/ecosystem/planner/plannerMockGenerator";
import { saveRouteWorkspacePayload } from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaDesktopEntryHero from "./sections/TiyaDesktopEntryHero";
import TiyaRouteIntelligence from "./tabs/TiyaRouteIntelligence";
import TiyaRouteThinking from "./sections/TiyaRouteThinking";

const defaultIntent: TiyaTripIntent = {
  fromCity: "Delhi",
  toCity: "Jaipur",
  startDate: "2026-08-12",
  endDate: "2026-08-17",
  tripType: "Round Trip",
  transportMode: "Flight",
  transportPreference: "Flight",
  stayPreference: "Hotel",
  cabRequirement: "Airport / Station Transfer Only",
  returnToOrigin: true,
  stops: [],
  multiCityStops: [],
  budgetTier: "Premium",
  customBudgetAmount: "₹85,000",
  adults: 2,
  children: 0,
  seniors: 0,
  pets: false,
  travelStyle: "Couple",
  pace: "Balanced",
  interests: ["Food", "Culture", "Local Market"],
  smartPreferences: {
    includeStays: true,
    includeLocalMarket: true,
    includeCreatorSpots: false,
    includeInsurance: true,
    avoidNightTravel: true,
    preferScenicRoute: true,
  },
};

const emptyHeroIntent: TiyaTripIntent = {
  ...defaultIntent,
  fromCity: "",
  toCity: "",
  startDate: "",
  endDate: "",
  tripType: "One Way / Destination Trip",
  transportMode: "",
  transportPreference: "",
  stayPreference: "",
  cabRequirement: "",
  returnToOrigin: false,
  stops: [],
  multiCityStops: [],
  budgetTier: "",
  customBudgetAmount: "",
  adults: 0,
  children: 0,
  seniors: 0,
  travelStyle: "",
};

const defaultPlan = generateSmartPlannerMock(defaultIntent);

function getRecommendedRouteId(plan: TiyaGeneratedPlan) {
  return (
    plan.routeOptions.find((route) => route.isRecommended)?.id ??
    plan.routeOptions[0]?.id
  );
}

export default function SmartPlannerEntry() {
  const router = useRouter();
  const [submittedIntent, setSubmittedIntent] =
    useState<TiyaTripIntent>(defaultIntent);
  const [generatedPlan, setGeneratedPlan] =
    useState<TiyaGeneratedPlan>(defaultPlan);
  const [selectedRouteId, setSelectedRouteId] = useState<
    TiyaRouteOption["id"] | undefined
  >(getRecommendedRouteId(defaultPlan));
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedRoutes, setHasGeneratedRoutes] = useState(false);

  function handleGenerate(intent: TiyaTripIntent) {
    setIsGenerating(true);

    window.setTimeout(() => {
      const nextPlan = generateSmartPlannerMock(intent);

      setSubmittedIntent(intent);
      setGeneratedPlan(nextPlan);
      setSelectedRouteId(getRecommendedRouteId(nextPlan));
      setSelectionConfirmed(false);
      setIsGenerating(false);
      setHasGeneratedRoutes(true);
    }, 650);
  }

  function handleHeroIntentChange() {
    setHasGeneratedRoutes(false);
    setSelectionConfirmed(false);
  }

  function handleRouteChange(routeId: TiyaRouteOption["id"]) {
    setSelectedRouteId(routeId);
    setSelectionConfirmed(true);
  }

  const selectedRoute = generatedPlan.routeOptions.find(
    (route) => route.id === selectedRouteId
  );

  function compareRoutes() {
    document
      .getElementById("route-intelligence")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function continueWithSelectedRoute() {
    if (!selectedRoute) return;

    saveRouteWorkspacePayload(
      selectedRoute,
      generatedPlan.routeOptions,
      submittedIntent,
      generatedPlan
    );
    router.push("/smart-planner/workspace");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_10%,rgba(14,165,233,0.13),transparent_28%),radial-gradient(circle_at_92%_8%,rgba(249,115,22,0.13),transparent_30%),linear-gradient(180deg,#f7fbff_0%,#eef6ff_48%,#fff7ed_100%)] text-slate-950">
      <TiyaDesktopEntryHero
        initialIntent={emptyHeroIntent}
        onSubmit={handleGenerate}
        onIntentChange={handleHeroIntentChange}
        isGenerating={isGenerating}
      />

      {isGenerating ? <TiyaRouteThinking /> : null}

      {hasGeneratedRoutes ? (
        <section
          id="route-intelligence"
          className="mx-auto max-w-7xl scroll-mt-4 px-3 py-4 sm:px-4 sm:py-5 lg:scroll-mt-6 lg:px-8 lg:py-6"
        >
          <TiyaRouteIntelligence
            key={generatedPlan.subtitle}
            routeOptions={generatedPlan.routeOptions}
            isGenerating={isGenerating}
            selectedRouteId={selectionConfirmed ? selectedRouteId : undefined}
            selectionConfirmed={selectionConfirmed}
            tripIntent={submittedIntent}
            generatedPlan={generatedPlan}
            onSelectedRouteChange={handleRouteChange}
          />

          {selectionConfirmed && selectedRoute ? (
          <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-cyan-200/35 bg-[#061839]/95 text-white shadow-[0_28px_90px_rgba(6,24,57,0.18)] backdrop-blur-2xl sm:mt-5 sm:rounded-[2rem]">
            <div className="relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.2),transparent_28%)]" />
              <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-sm font-black text-emerald-100">
                      ✓
                    </span>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                      Selected Route Ready
                    </p>
                  </div>

                  <h2 className="mt-3 text-xl font-black tracking-tight text-white sm:text-3xl">
                    {selectedRoute.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-cyan-50/78">
                    {selectedRoute.routeStyle || selectedRoute.bestFor || selectedRoute.note}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                      ["Route Type", selectedRoute.bestFor || selectedRoute.routeStyle],
                      ["Distance", selectedRoute.distance],
                      ["Duration", selectedRoute.duration],
                      ["Budget Estimate", `${selectedRoute.budgetFit}% fit`],
                      ["Risk Level", selectedRoute.riskLevel],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                          {label}
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.08] p-3 sm:rounded-[1.5rem] sm:p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
                    Confirm route
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/68">
                    Continue with this route to build the full journey details.
                  </p>
                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={compareRoutes}
                      className="min-h-11 w-full rounded-full border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                    >
                      Compare Routes
                    </button>
                    <button
                      type="button"
                      onClick={continueWithSelectedRoute}
                      className="min-h-12 w-full rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,123,0,0.26)] transition hover:-translate-y-0.5"
                    >
                      Continue With This Route →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
