"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Route } from "lucide-react";

import BuildItineraryWorkspace from "@/app/components/ecosystem/planner/workspace/build/BuildItineraryWorkspace";
import WorkspaceAdvancedTabs from "@/app/components/ecosystem/planner/workspace/WorkspaceAdvancedTabs";
import WorkspaceMediaGrid from "@/app/components/ecosystem/planner/workspace/WorkspaceMediaGrid";
import WorkspaceTopBar from "@/app/components/ecosystem/planner/workspace/WorkspaceTopBar";
import {
  buildBookingBasketItemFromTimeline,
  type WorkspaceBookingBasketItem,
} from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import { readWorkspacePayloadFromStorage, saveWorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceStorage";
import { defaultPreferences, type WorkspacePreferences, type WorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceTypes";
import {
  buildSmartPlannerReviewPayload,
  persistSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import { MY_TRIPS_RESTORE_BASKET_KEY } from "@/app/lib/ecosystem/planner/myTripsStorage";

function reconcileBookingBasketWithPlan(
  currentBasket: WorkspaceBookingBasketItem[],
  plan: TiyaGeneratedPlan
) {
  const activeDays = Array.isArray(plan.days) ? plan.days : [];
  const validDayIds = new Set(activeDays.map((day) => day.id).filter(Boolean));
  const timelineByCompositeKey = new Map<
    string,
    { day: TiyaDayPlan; dayIndex: number; itemId: string }
  >();
  const timelineByItemId = new Map<
    string,
    { day: TiyaDayPlan; dayIndex: number; itemId: string }
  >();

  activeDays.forEach((day, dayIndex) => {
    (Array.isArray(day.items) ? day.items : []).forEach((item) => {
      timelineByCompositeKey.set(`${day.id}:${item.id}`, {
        day,
        dayIndex,
        itemId: item.id,
      });
      if (!timelineByItemId.has(item.id)) {
        timelineByItemId.set(item.id, { day, dayIndex, itemId: item.id });
      }
    });
  });

  return currentBasket.flatMap((basketItem) => {
    if (basketItem.dayId && !validDayIds.has(basketItem.dayId)) {
      return [];
    }

    const timelineRef = basketItem.sourceItemId
      ? timelineByCompositeKey.get(`${basketItem.dayId}:${basketItem.sourceItemId}`) ??
        timelineByItemId.get(basketItem.sourceItemId)
      : undefined;

    if (basketItem.sourceItemId && basketItem.dayId && !timelineRef) {
      return [];
    }

    if (!timelineRef) {
      return [basketItem];
    }

    const timelineItem = timelineRef.day.items.find(
      (item) => item.id === timelineRef.itemId
    );

    if (!timelineItem) return [];

    return [
      {
        ...buildBookingBasketItemFromTimeline({
          allDays: activeDays,
          day: timelineRef.day,
          dayIndex: timelineRef.dayIndex,
          item: timelineItem,
          plan,
          selectedOptionName: basketItem.selectedOptionName,
          totalBudget: plan.totalBudget,
        }),
        bookingStatus: basketItem.bookingStatus,
        id: basketItem.id,
        status: basketItem.status,
      },
    ];
  });
}

export default function TiyaSmartPlannerWorkspacePage() {
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);
  const [preferences, setPreferences] =
    useState<WorkspacePreferences>(defaultPreferences);
  const [itineraryBuilderOpen, setItineraryBuilderOpen] = useState(false);
  const [itineraryGenerated, setItineraryGenerated] = useState(false);
  const [bookingBasket, setBookingBasket] = useState<WorkspaceBookingBasketItem[]>(
    []
  );
  const [workspaceGeneratedPlan, setWorkspaceGeneratedPlan] =
    useState<TiyaGeneratedPlan | null>(null);
  const [, setWorkspaceEditableDays] = useState<TiyaDayPlan[]>([]);
  const bookingBasketRef = useRef<WorkspaceBookingBasketItem[]>(bookingBasket);

  useEffect(() => {
    bookingBasketRef.current = bookingBasket;
  }, [bookingBasket]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedPayload = readWorkspacePayloadFromStorage();
      setPayload(storedPayload);
      if (storedPayload?.buildItineraryGenerated && storedPayload.generatedPlan?.days?.length) {
        setWorkspaceGeneratedPlan(storedPayload.generatedPlan);
        setWorkspaceEditableDays(storedPayload.generatedPlan.days);
        setItineraryGenerated(true);
        setItineraryBuilderOpen(true);
      }
      const restoreBasketRaw = window.sessionStorage.getItem(
        MY_TRIPS_RESTORE_BASKET_KEY
      );

      if (restoreBasketRaw) {
        try {
          const restoredBasket = JSON.parse(restoreBasketRaw);
          if (Array.isArray(restoredBasket)) {
            setBookingBasket(restoredBasket as WorkspaceBookingBasketItem[]);
          }
        } catch {
          setBookingBasket([]);
        } finally {
          window.sessionStorage.removeItem(MY_TRIPS_RESTORE_BASKET_KEY);
        }
      }

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

  useEffect(() => {
    if (!payload) return;

    const activePlan = workspaceGeneratedPlan ?? payload.generatedPlan;
    if (!activePlan) return;

    try {
      window.sessionStorage.setItem(
        MY_TRIPS_RESTORE_BASKET_KEY,
        JSON.stringify(bookingBasket)
      );
    } catch {
      // Basket restore is best-effort; review payload still persists below.
    }

    const workspacePayload = { ...payload, generatedPlan: activePlan };
    saveWorkspacePayload(workspacePayload);

    const reviewPayload = buildSmartPlannerReviewPayload({
      bookingBasket,
      intent: payload.tripIntent,
      plan: activePlan,
      selectedRoute: payload.selectedRoute,
      workspace: workspacePayload,
    });

    if (reviewPayload) {
      persistSmartPlannerReviewPayload(reviewPayload);
    }

    window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
  }, [bookingBasket, payload, workspaceGeneratedPlan]);

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
    setItineraryBuilderOpen(false);
    bookingBasketRef.current = [];
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

  function normalizeWorkspacePlan(plan: TiyaGeneratedPlan): TiyaGeneratedPlan {
    return {
      ...plan,
      bookingModules: Array.isArray(plan.bookingModules)
        ? plan.bookingModules
        : [],
      budgetLines: Array.isArray(plan.budgetLines) ? plan.budgetLines : [],
      creatorPicks: Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [],
      days: Array.isArray(plan.days) ? plan.days : [],
      insights: Array.isArray(plan.insights) ? plan.insights : [],
      localMarketPicks: Array.isArray(plan.localMarketPicks)
        ? plan.localMarketPicks
        : [],
      routeOptions:
        Array.isArray(plan.routeOptions) && plan.routeOptions.length
          ? plan.routeOptions
          : routeOptions,
      routeStops: Array.isArray(plan.routeStops) ? plan.routeStops : [],
      suggestions: Array.isArray(plan.suggestions) ? plan.suggestions : [],
    };
  }

  function syncWorkspacePlan(plan: TiyaGeneratedPlan) {
    const normalizedPlan = normalizeWorkspacePlan(plan);
    const reconciledBasket = reconcileBookingBasketWithPlan(
      bookingBasketRef.current,
      normalizedPlan
    );

    setWorkspaceGeneratedPlan(normalizedPlan);
    setWorkspaceEditableDays(normalizedPlan.days);
    setPayload((current) =>
      current
        ? { ...current, buildItineraryGenerated: true, generatedPlan: normalizedPlan }
        : current
    );
    bookingBasketRef.current = reconciledBasket;
    setBookingBasket(reconciledBasket);

    const nextPayload = payload
      ? { ...payload, buildItineraryGenerated: true, generatedPlan: normalizedPlan }
      : null;

    if (nextPayload) {
      saveWorkspacePayload(nextPayload);

      const reviewPayload = buildSmartPlannerReviewPayload({
        bookingBasket: reconciledBasket,
        intent: nextPayload.tripIntent,
        plan: normalizedPlan,
        selectedRoute: nextPayload.selectedRoute,
        workspace: nextPayload,
      });

      if (reviewPayload) {
        persistSmartPlannerReviewPayload(reviewPayload);
      }
    }

    return normalizedPlan;
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_45%,#fff7ed_100%)] px-3 py-4 pr-3 text-slate-950 sm:px-5 sm:py-6 lg:px-8 xl:pr-6">
      <section className="mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden">
        <Link
          href="/smart-planner"
          className="mb-3 inline-flex min-h-10 max-w-full items-center justify-center rounded-full border border-orange-200 bg-white/88 px-4 text-xs font-black text-orange-700 shadow-[0_12px_28px_rgba(249,115,22,0.12)] backdrop-blur transition hover:border-orange-300 hover:bg-orange-50 lg:hidden"
        >
          ← Back to Smart Planner
        </Link>

        <WorkspaceTopBar
          routeOptions={routeOptions}
          selectedRoute={selectedRoute}
          fromCity={fromCity}
          toCity={toCity}
          workspaceDraft={payload.smartPlannerWorkspaceDraft}
          onSwitchRoute={switchRoute}
        />

        <div className="mt-4 min-w-0 max-w-full overflow-x-hidden">
          <WorkspaceMediaGrid
            selectedRoute={selectedRoute}
            fromCity={fromCity}
            toCity={toCity}
          />
        </div>

        {!itineraryBuilderOpen ? (
          <section className="mt-4 min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-white/80 bg-[#061839] p-5 text-white shadow-[0_28px_85px_rgba(15,23,42,0.14)] sm:p-6">
            <div className="min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Smart itinerary builder
                </p>
                <h2 className="mt-2 break-words text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Build your day-wise itinerary when you are ready.
                </h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/72">
                  Your route, dates, preferences, basket, saved items and
                  workspace payload are ready. Open the builder to generate or
                  continue the full itinerary flow.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-white/70">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                    {fromCity} to {toCity}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                    {selectedRoute.name}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                    {preferences.transportMode}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => setItineraryBuilderOpen(true)}
                className="inline-flex min-h-14 w-full max-w-[420px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-8 py-4 text-base font-black text-white shadow-[0_18px_44px_rgba(255,123,0,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(255,123,0,0.38)] sm:w-auto sm:min-w-[320px]"
              >
                Build Itinerary
              </button>
            </div>
          </section>
        ) : (
          <div className="mt-4 min-w-0 max-w-full overflow-x-hidden">
            <BuildItineraryWorkspace
              key={selectedRoute.id}
              selectedRoute={selectedRoute}
              preferences={preferences}
              fromCity={fromCity}
              toCity={toCity}
              sourceIntent={payload.tripIntent}
              sourcePlan={workspaceGeneratedPlan ?? payload.generatedPlan}
              updatePreference={updatePreference}
              toggleInterest={toggleInterest}
              bookingBasket={bookingBasket}
              setBookingBasket={setBookingBasket}
              onGenerated={(plan, days) => {
                const normalizedPlan = syncWorkspacePlan({
                  ...plan,
                  days: Array.isArray(days) ? days : plan.days,
                });
                setWorkspaceEditableDays(normalizedPlan.days);
                setItineraryGenerated(true);
              }}
              onGeneratedPlanChange={(plan, days) => {
                syncWorkspacePlan({
                  ...plan,
                  days: Array.isArray(days) ? days : plan.days,
                });
              }}
            />
          </div>
        )}

        {itineraryGenerated ? (
          <div className="min-w-0 max-w-full overflow-x-hidden">
          <WorkspaceAdvancedTabs
            selectedRoute={selectedRoute}
            preferences={preferences}
            fromCity={fromCity}
            toCity={toCity}
            sourceIntent={payload.tripIntent}
            sourcePlan={workspaceGeneratedPlan ?? payload.generatedPlan}
            bookingBasket={bookingBasket}
            onPlanChange={(plan) => {
              syncWorkspacePlan(plan);
            }}
            setBookingBasket={setBookingBasket}
          />
          </div>
        ) : null}
      </section>
    </main>
  );
}

