"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Route } from "lucide-react";

import BuildItineraryWorkspace from "@/app/components/ecosystem/planner/workspace/build/BuildItineraryWorkspace";
import WorkspaceAdvancedTabs from "@/app/components/ecosystem/planner/workspace/WorkspaceAdvancedTabs";
import WorkspaceMediaGrid from "@/app/components/ecosystem/planner/workspace/WorkspaceMediaGrid";
import WorkspaceTopBar from "@/app/components/ecosystem/planner/workspace/WorkspaceTopBar";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import { readWorkspacePayloadFromStorage, saveWorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceStorage";
import { defaultPreferences, type WorkspacePreferences, type WorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceTypes";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export default function TiyaSmartPlannerWorkspacePage() {
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);
  const [preferences, setPreferences] =
    useState<WorkspacePreferences>(defaultPreferences);
  const [itineraryGenerated, setItineraryGenerated] = useState(false);
  const [bookingBasket, setBookingBasket] = useState<WorkspaceBookingBasketItem[]>(
    []
  );
  const [workspaceGeneratedPlan, setWorkspaceGeneratedPlan] =
    useState<TiyaGeneratedPlan | null>(null);
  const [, setWorkspaceEditableDays] = useState<TiyaDayPlan[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedPayload = readWorkspacePayloadFromStorage();
      setPayload(storedPayload);

      if (storedPayload?.preferences) {
        setPreferences({
          ...defaultPreferences,
          ...storedPayload.preferences,
          interests: Array.isArray(storedPayload.preferences.interests)
            ? storedPayload.preferences.interests
            : defaultPreferences.interests,
        });
      } else if (storedPayload?.tripIntent) {
        setPreferences({
          transportMode: storedPayload.tripIntent.transportMode,
          stayPreference: storedPayload.tripIntent.stayPreference,
          pace: storedPayload.tripIntent.pace,
          comfortLevel: storedPayload.tripIntent.budgetTier,
          interests: storedPayload.tripIntent.interests,
        });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const selectedRoute = payload?.selectedRoute;
  const hasSelectedPlannerPayload = Boolean(
    payload?.selectedSmartPlannerTrip && payload?.tripIntent && selectedRoute
  );

  const routeOptions = (() => {
    if (!payload?.routeOptions?.length) {
      return selectedRoute ? [selectedRoute] : [];
    }

    const selectedExists = payload.routeOptions.some(
      (routeOption) => routeOption.id === selectedRoute?.id
    );

    return selectedExists || !selectedRoute
      ? payload.routeOptions
      : [selectedRoute, ...payload.routeOptions];
  })();

  const [routeFrom = "Origin", routeTo = "Destination"] =
    selectedRoute?.note?.match(/(.+?) to (.+?) using/i)?.slice(1, 3) ?? [];
  const fromCity = payload?.tripIntent?.fromCity ?? routeFrom;
  const toCity = payload?.tripIntent?.toCity ?? routeTo;

  useEffect(() => {
    if (!payload) return;

    const timer = window.setTimeout(() => {
      saveWorkspacePayload({ ...payload, preferences });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [payload, preferences]);

  function switchRoute(routeOption: TiyaRouteOption) {
    setPayload((current) => {
      if (!current) return current;

      return {
        ...current,
        routeId: routeOption.id,
        selectedRoute: routeOption,
        routeOptions,
      };
    });

    setItineraryGenerated(false);
    setBookingBasket([]);
    setWorkspaceGeneratedPlan(null);
    setWorkspaceEditableDays([]);
  }

  function updatePreference<K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K]
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function toggleInterest(interest: string) {
    setPreferences((current) => {
      const interests = current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest];

      return { ...current, interests };
    });
  }

  if (!selectedRoute || !hasSelectedPlannerPayload) {
    return (
      <main className="min-h-screen bg-[#071226] px-6 py-8 text-white">
        <section className="mx-auto flex min-h-[520px] max-w-4xl items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,#10284f_0%,#123d69_46%,#172033_100%)] p-6 text-center shadow-[0_30px_110px_rgba(2,6,23,0.36)]">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-300/24 bg-orange-500/14 text-orange-100">
              <Route size={22} />
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-normal">
              Please create a route first.
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-white/72">
              Start from Smart Planner, generate route options and continue with
              a selected route to open this workspace.
            </p>

            <Link
              href="/smart-planner"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-6 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(255,123,0,0.28)]"
            >
              Create Route
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_45%,#fff7ed_100%)] px-5 py-6 text-slate-950 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <WorkspaceTopBar
          routeOptions={routeOptions}
          selectedRoute={selectedRoute}
          fromCity={fromCity}
          toCity={toCity}
          onSwitchRoute={switchRoute}
        />

        <div className="mt-4">
          <WorkspaceMediaGrid
            selectedRoute={selectedRoute}
            fromCity={fromCity}
            toCity={toCity}
          />
        </div>

        <div className="mt-4">
          <BuildItineraryWorkspace
            key={selectedRoute.id}
            selectedRoute={selectedRoute}
            preferences={preferences}
            fromCity={fromCity}
            toCity={toCity}
            sourceIntent={payload.tripIntent}
            updatePreference={updatePreference}
            toggleInterest={toggleInterest}
            bookingBasket={bookingBasket}
            setBookingBasket={setBookingBasket}
            onGenerated={(plan, days) => {
              setWorkspaceGeneratedPlan(plan);
              setWorkspaceEditableDays(days);
              setPayload((current) =>
                current ? { ...current, generatedPlan: plan } : current
              );
              setItineraryGenerated(true);
            }}
            onGeneratedPlanChange={(plan, days) => {
              setWorkspaceGeneratedPlan(plan);
              setWorkspaceEditableDays(days);
              setPayload((current) =>
                current ? { ...current, generatedPlan: plan } : current
              );
            }}
          />
        </div>

        {itineraryGenerated ? (
          <WorkspaceAdvancedTabs
            selectedRoute={selectedRoute}
            preferences={preferences}
            fromCity={fromCity}
            toCity={toCity}
            sourceIntent={payload.tripIntent}
            sourcePlan={workspaceGeneratedPlan ?? payload.generatedPlan}
            bookingBasket={bookingBasket}
            setBookingBasket={setBookingBasket}
          />
        ) : null}
      </section>
    </main>
  );
}

