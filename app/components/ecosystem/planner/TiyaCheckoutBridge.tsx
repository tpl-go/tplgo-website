"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CreditCard,
  Database,
  FileText,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  generateCheckoutDraft,
  saveCheckoutDraft,
  TIYA_CHECKOUT_DRAFT_KEY,
  TIYA_QUOTE_PREVIEW_KEY,
  TIYA_SELECTED_BUNDLE_KEY,
  type TiyaCheckoutChecklistItem,
} from "@/app/lib/ecosystem/planner/plannerCheckoutBridge";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaCheckoutChecklist from "./TiyaCheckoutChecklist";

type CheckoutChangeHistoryItem = {
  appliedAt?: string;
  costDelta?: number;
  diffs?: Array<{ label: string; previousValue: string; nextValue: string }>;
  summary?: string;
  title: string;
};

type TiyaCheckoutBridgeProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days?: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  changeHistory?: CheckoutChangeHistoryItem[];
  isGenerating?: boolean;
  onAction?: (action: string) => void;
  onProceedToBook?: () => void;
};

const CHECKOUT_PAYLOAD_KEY = "tpl_tiya_checkout_v1";
const CHECKOUT_DRAFT_V1_KEY = "tpl_tiya_checkout_draft_v1";
const EXPERT_REQUEST_KEY = "tpl_tiya_expert_request_v1";
const CHANGE_LOG_KEY = "tpl_tiya_change_log_v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

function writeSession(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function dateOnly(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function localLifeLabel(text?: string) {
  return String(text || "")
    .replace(/Local Market Picks/g, "Local Life")
    .replace(/Local Market/g, "Local Life")
    .replace(/local market/g, "Local Life");
}

function travellerTotal(intent: TiyaTripIntent) {
  return Number(intent.adults || 0) + Number(intent.children || 0) + Number(intent.seniors || 0);
}

function roomsFromItinerary(days: TiyaDayPlan[], fallbackTravellers: number) {
  const roomCount =
    days
      .flatMap((day) => day.items || [])
      .map((item) => Number(item.rooms || 0))
      .filter((rooms) => rooms > 0)
      .sort((a, b) => b - a)[0] || 0;

  return roomCount || Math.max(1, Math.ceil(Math.max(1, fallbackTravellers) / 2));
}

function itemsByType(days: TiyaDayPlan[], type: TiyaTimelineItem["type"]) {
  return days
    .flatMap((day) =>
      (day.items || []).map((item) => ({
        ...item,
        day: day.day,
        date: day.date,
        city: day.city,
      }))
    )
    .filter((item) => item.type === type);
}

function budgetAmount(plan: TiyaGeneratedPlan, label: string) {
  return (
    plan.budgetLines?.find((line) =>
      line.label.toLowerCase().includes(label.toLowerCase())
    )?.amount || 0
  );
}

function selectedModules(plan: TiyaGeneratedPlan) {
  return (Array.isArray(plan.bookingModules) ? plan.bookingModules : []).filter(
    (module) => module.isHighlighted || module.readiness === "Ready"
  );
}

function hasTravellerProfiles(intent: TiyaTripIntent) {
  const travellers = intent as unknown as {
    travellers?: Array<{ age?: number; gender?: string; name?: string }>;
    travellerProfiles?: Array<{ age?: number; gender?: string; name?: string }>;
  };
  const profiles = travellers.travellers || travellers.travellerProfiles || [];
  const expected = travellerTotal(intent);

  return profiles.length >= expected && profiles.every((profile) => profile.name && profile.age && profile.gender);
}

function buildCheckoutPayload({
  changeHistory = [],
  days,
  draft,
  intent,
  plan,
  selectedRoute,
}: {
  changeHistory?: CheckoutChangeHistoryItem[];
  days: TiyaDayPlan[];
  draft: ReturnType<typeof generateCheckoutDraft>;
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}) {
  const transportItems = itemsByType(days, "transport");
  const stayItems = itemsByType(days, "stay");
  const activityItems = itemsByType(days, "activity");
  const mealItems = itemsByType(days, "meal");
  const hotelItems = stayItems.filter((item) =>
    `${item.serviceType || ""} ${item.title}`.toLowerCase().includes("hotel")
  );
  const homestayItems = stayItems.filter((item) =>
    `${item.serviceType || ""} ${item.title}`.toLowerCase().includes("homestay")
  );
  const selectedServices = selectedModules(plan);
  const rooms = roomsFromItinerary(days, draft.travellers.total);
  const changeGroups = {
    budgetChanges: changeHistory.filter((change) =>
      `${change.title} ${(change as { category?: string }).category || ""}`.toLowerCase().includes("budget")
    ),
    costOptimizationChanges: changeHistory.filter((change) =>
      `${change.title} ${change.summary || ""}`.toLowerCase().includes("optimization")
    ),
    riskFixes: changeHistory.filter((change) =>
      `${change.title} ${(change as { category?: string }).category || ""}`.toLowerCase().includes("risk")
    ),
    routeChanges: changeHistory.filter((change) =>
      `${change.title} ${(change as { category?: string }).category || ""}`.toLowerCase().includes("route")
    ),
    weatherAdjustments: changeHistory.filter((change) =>
      `${change.title} ${(change as { category?: string }).category || ""}`.toLowerCase().includes("weather")
    ),
  };
  const readinessScore = Math.round(
    ([
      selectedServices.length > 0,
      transportItems.length > 0 || Boolean(intent.transportMode),
      stayItems.length > 0 || !intent.smartPreferences.includeStays,
      activityItems.length > 0,
      plan.totalBudget > 0,
    ].filter(Boolean).length /
      5) *
      100
  );
  const healthScore = Math.max(
    42,
    Math.min(
      96,
      76 +
        Math.min(12, changeHistory.length * 2) -
        (changeGroups.riskFixes.length ? 0 : 4) -
        (changeGroups.weatherAdjustments.length ? 0 : 2)
    )
  );

  return {
    source: "smart-planner",
    generatedAt: new Date().toISOString(),
    trip: {
      destination: intent.toCity,
      endDate: dateOnly(intent.endDate),
      origin: intent.fromCity,
      pace: intent.pace,
      startDate: dateOnly(intent.startDate),
      title: plan.title,
      totalDays: days.length || Number(plan.nights || 0) + 1,
      travelStyle: intent.travelStyle,
      tripType: intent.tripType,
    },
    route: {
      activeRouteId: selectedRoute?.id || "",
      distance: selectedRoute?.distance || "",
      duration: selectedRoute?.duration || "",
      name: selectedRoute?.name || plan.routeTitle || draft.route,
      routeType: selectedRoute?.routeStyle || "",
      segments: transportItems.map((item) => ({
        day: item.day,
        date: item.date,
        from: item.from || item.location || item.city,
        title: item.title,
        to: item.to || item.finalDestination || intent.toCity,
        type: item.serviceType || intent.transportMode,
      })),
      transportMode: intent.transportMode,
    },
    itinerary: days,
    travellers: {
      adults: intent.adults,
      children: intent.children,
      pets: intent.pets,
      profilesComplete: hasTravellerProfiles(intent),
      rooms,
      seniors: intent.seniors,
      total: draft.travellers.total,
      travellerType: intent.travelStyle,
    },
    selectedServices,
    selectedHotels: hotelItems,
    selectedHomestays: homestayItems,
    selectedCabs: transportItems,
    selectedActivities: activityItems,
    selectedMeals: mealItems,
    selectedInsurance: intent.smartPreferences.includeInsurance
      ? [{ id: "insurance", title: "Planner insurance preference", status: "selected" }]
      : [],
    selectedLocalMarketItems: plan.localMarketPicks?.filter((item) => item.isHighlighted) || [],
    budgetEstimate: {
      activity: budgetAmount(plan, "activit"),
      baseBudget: intent.customBudgetAmount || intent.budgetTier,
      insurance: draft.quotePreview.insuranceEstimate,
      localMarket: draft.quotePreview.localMarketAddOns,
      localTravel: budgetAmount(plan, "local"),
      stay: budgetAmount(plan, "stay"),
      taxesPlaceholder: draft.quotePreview.taxesFeesEstimate,
      totalEstimatedCost: plan.totalBudget,
      transport: budgetAmount(plan, "transport"),
    },
    optimizationHistory: changeGroups.costOptimizationChanges,
    weatherAdjustments: changeGroups.weatherAdjustments,
    riskFixes: changeGroups.riskFixes,
    changeHistory: changeGroups,
    quoteEstimate: {
      ...draft.quotePreview,
      estimatedTotal: draft.quotePreview.totalQuoteEstimate,
      note: "Estimate only. Final booking price depends on live inventory and checkout adjustments.",
    },
    plannerAudit: {
      bookingConfidenceScore: Math.max(45, Math.min(96, Math.round((healthScore + readinessScore) / 2))),
      finalVerdict:
        healthScore >= 82 && readinessScore >= 78
          ? "Ready To Book"
          : healthScore >= 62
            ? "Needs Review"
            : "Not Recommended",
      healthScore,
      readinessScore,
    },
    ecosystemRouting: {
      activities: "/explore",
      cabs: "/cab/result",
      flights: "/flights",
      homestays: "/homestays/results",
      hotels: "/hotels/results",
      insurance: "/insurance/results",
      localMarket: "/local-life",
      packages: "/holidays",
    },
    paymentStarted: false,
  };
}

function buildReadinessChecklist({
  checkoutPayload,
  draft,
  intent,
}: {
  checkoutPayload: ReturnType<typeof buildCheckoutPayload>;
  draft: ReturnType<typeof generateCheckoutDraft>;
  intent: TiyaTripIntent;
}): TiyaCheckoutChecklistItem[] {
  const hasTransport = Boolean(intent.transportMode || checkoutPayload.selectedCabs.length);
  const stayRequired = intent.smartPreferences.includeStays && intent.stayPreference !== "No Stay Needed";
  const hasStay = checkoutPayload.selectedHotels.length > 0 || checkoutPayload.selectedHomestays.length > 0 || !stayRequired;
  const hasActivities = checkoutPayload.selectedActivities.length > 0;
  const hasServices = checkoutPayload.selectedServices.length > 0;
  const hasQuote = draft.quotePreview.totalQuoteEstimate > 0;

  return [
    {
      id: "travellers",
      label: "Traveller Details",
      status: checkoutPayload.travellers.profilesComplete ? "Ready" : "Required",
      detail: checkoutPayload.travellers.profilesComplete
        ? "All traveller profiles include name, age and gender."
        : `${checkoutPayload.travellers.total} traveller profile${checkoutPayload.travellers.total === 1 ? "" : "s"} need name, age and gender before live booking.`,
    },
    {
      id: "transport",
      label: "Transport",
      status: hasTransport ? "Ready" : "Required",
      detail: hasTransport ? intent.transportMode : "Choose flight, train, cab, self-drive or transfer before checkout.",
    },
    {
      id: "stay",
      label: "Stay",
      status: hasStay ? "Ready" : "Required",
      detail: hasStay
        ? stayRequired
          ? `${checkoutPayload.selectedHotels.length + checkoutPayload.selectedHomestays.length} stay item${checkoutPayload.selectedHotels.length + checkoutPayload.selectedHomestays.length === 1 ? "" : "s"} available.`
          : "Stay is optional for this planner brief."
        : "Hotel or homestay selection required.",
    },
    {
      id: "activities",
      label: "Activities",
      status: hasActivities ? "Ready" : "Warning",
      detail: hasActivities ? `${checkoutPayload.selectedActivities.length} activity item${checkoutPayload.selectedActivities.length === 1 ? "" : "s"} included.` : "No activity selected yet; itinerary can still proceed with review.",
    },
    {
      id: "insurance",
      label: "Insurance",
      status: checkoutPayload.selectedInsurance.length ? "Ready" : "Optional",
      detail: checkoutPayload.selectedInsurance.length ? "Insurance preference included." : "Insurance is optional but recommended before payment.",
    },
    {
      id: "quote",
      label: "Quote",
      status: hasQuote ? "Ready" : "Required",
      detail: hasQuote ? `Estimated quote ${formatCurrency(draft.quotePreview.totalQuoteEstimate)}.` : "Quote estimate unavailable.",
    },
    {
      id: "bundle",
      label: "Bundle",
      status: hasServices ? "Ready" : "Required",
      detail: hasServices ? `${checkoutPayload.selectedServices.length} selected service${checkoutPayload.selectedServices.length === 1 ? "" : "s"} ready for handoff.` : "Select at least one service before checkout.",
    },
  ];
}

export default function TiyaCheckoutBridge({
  intent,
  plan,
  days,
  selectedRoute,
  changeHistory = [],
  isGenerating = false,
  onProceedToBook,
}: TiyaCheckoutBridgeProps) {
  const activeDays = useMemo(
    () => (Array.isArray(days) && days.length ? days : plan.days || []),
    [days, plan.days]
  );
  const draft = useMemo(
    () => generateCheckoutDraft({ intent, plan }),
    [intent, plan]
  );
  const checkoutPayload = useMemo(
    () =>
      buildCheckoutPayload({
        changeHistory,
        days: activeDays,
        draft,
        intent,
        plan,
        selectedRoute,
      }),
    [activeDays, changeHistory, draft, intent, plan, selectedRoute]
  );
  const checklist = useMemo(
    () => buildReadinessChecklist({ checkoutPayload, draft, intent }),
    [checkoutPayload, draft, intent]
  );
  const [draftSavedAt, setDraftSavedAt] = useState<string | undefined>();
  const [expertSentAt, setExpertSentAt] = useState<string | undefined>();
  const [showReview, setShowReview] = useState(false);
  const [restoreMessage] = useState(() => {
    if (!canUseStorage()) return "";
    return window.sessionStorage.getItem(CHECKOUT_DRAFT_V1_KEY)
      ? "Saved checkout draft restored from this browser session."
      : "";
  });
  const selectedServices = Array.isArray(draft.bookingModules)
    ? draft.bookingModules
    : [];
  const addOns = Array.isArray(draft.addOns) ? draft.addOns : [];
  const changeLog = [
    ...checkoutPayload.changeHistory.routeChanges,
    ...checkoutPayload.changeHistory.weatherAdjustments,
    ...checkoutPayload.changeHistory.riskFixes,
    ...checkoutPayload.changeHistory.budgetChanges,
    ...checkoutPayload.changeHistory.costOptimizationChanges,
  ].sort((a, b) => String(b.appliedAt || "").localeCompare(String(a.appliedAt || "")));

  useEffect(() => {
    writeSession(CHECKOUT_PAYLOAD_KEY, checkoutPayload);
    writeSession(CHANGE_LOG_KEY, changeLog);
  }, [checkoutPayload, changeLog]);

  function persistCheckoutPayload() {
    writeSession(CHECKOUT_PAYLOAD_KEY, checkoutPayload);
    writeSession(CHANGE_LOG_KEY, changeLog);
  }

  function handleSaveDraft() {
    persistCheckoutPayload();
    saveCheckoutDraft(draft);
    writeSession(CHECKOUT_DRAFT_V1_KEY, {
      checkoutPayload,
      draft,
      restoredAt: new Date().toISOString(),
    });
    setDraftSavedAt(new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }));
  }

  function handleReviewBooking() {
    persistCheckoutPayload();
    onProceedToBook?.();
  }

  function handleSendExpert() {
    const expertDraft = {
      createdAt: new Date().toISOString(),
      expertRequestId: `expert_${Date.now()}`,
      optimizationNotes: checkoutPayload.optimizationHistory,
      route: checkoutPayload.route,
      selectedServices: checkoutPayload.selectedServices,
      source: "smart-planner",
      travellers: checkoutPayload.travellers,
      trip: checkoutPayload.trip,
      budget: checkoutPayload.budgetEstimate,
    };

    persistCheckoutPayload();
    writeSession(EXPERT_REQUEST_KEY, expertDraft);
    setExpertSentAt(new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }));
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <CreditCard
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Checkout readiness orchestration layer
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Tiya checkout handoff draft
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Prepares the selected trip, bundle, quote and service modules for
              a future TPL checkout flow. No payment or real booking starts here.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 text-xs font-black text-orange-100">
            {formatCurrency(draft.quotePreview.totalQuoteEstimate)} quote preview
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {restoreMessage ? (
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">
              {restoreMessage}
            </div>
          ) : null}

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Checkout bridge panel
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Trip intent", `${intent.travelStyle} · ${intent.pace}`],
                ["Route/scenario", selectedRoute?.name || draft.route],
                ["Package variant", intent.budgetTier],
                ["Quote", formatCurrency(draft.quotePreview.totalQuoteEstimate)],
                ["Selected bundle", draft.selectedBundle.name],
                ["Travellers", `${draft.travellers.total}`],
                ["Dates", `${draft.dates.startDate} to ${draft.dates.endDate}`],
                ["Payment", "Not started"],
                ["Draft ID", draft.plannerTripId],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-xs font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Selected services
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {localLifeLabel(service.serviceName)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Add-ons
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(addOns.length ? addOns : ["No add-ons selected yet"]).map((addOn) => (
                  <span
                    key={addOn}
                    className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100"
                  >
                    {localLifeLabel(addOn)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <TiyaCheckoutChecklist items={checklist} />

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BriefcaseBusiness size={15} />
              Quote preview foundation
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Transport", checkoutPayload.budgetEstimate.transport],
                ["Stay", checkoutPayload.budgetEstimate.stay],
                ["Activities", checkoutPayload.budgetEstimate.activity],
                ["Insurance", checkoutPayload.budgetEstimate.insurance],
                ["Local Life", checkoutPayload.budgetEstimate.localMarket],
                ["Taxes placeholder", checkoutPayload.budgetEstimate.taxesPlaceholder],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {formatCurrency(Number(value))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3 text-sm font-black text-orange-100">
              Estimated Total: {formatCurrency(checkoutPayload.quoteEstimate.estimatedTotal)}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <FileText size={15} />
              Transparent itinerary updates
            </div>
            {changeLog.length ? (
              <div className="mt-3 grid gap-2">
                {changeLog.slice(0, 5).map((change, index) => (
                  <div key={`${change.title}-${change.appliedAt || index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm font-black text-white">{change.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {change.summary || "Planner change applied and available for checkout handoff."}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/38">
                      {change.appliedAt ? new Date(change.appliedAt).toLocaleString() : "Current session"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold leading-6 text-white/60">
                No route, weather, risk, budget or hotel/activity changes logged yet.
              </p>
            )}
          </div>
        </div>

        <aside className="grid h-fit gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Database size={15} />
              Traveller handoff data
            </div>
            <div className="mt-3 grid gap-2">
              {[
                ["Route", draft.route],
                ["Bundle", draft.selectedBundle.name],
                ["Package estimate", formatCurrency(draft.packageEstimate)],
                ["Modules", `${selectedServices.length}`],
                ["Payment started", "No"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <button
              type="button"
              onClick={handleReviewBooking}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              Proceed to Book
            </button>
            <button
              type="button"
              onClick={handleSendExpert}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <Send size={15} />
              Send to Expert
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              Save Checkout Draft
            </button>
            <button
              type="button"
              disabled
              title="Available after review"
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/45"
            >
              Available after review
            </button>
            {draftSavedAt ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-center text-xs font-black text-emerald-100">
                Checkout draft saved at {draftSavedAt}
              </p>
            ) : null}
            {expertSentAt ? (
              <p className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-center text-xs font-black text-cyan-100">
                Draft sent successfully at {expertSentAt}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
            Storage keys: {CHECKOUT_PAYLOAD_KEY}, {CHECKOUT_DRAFT_V1_KEY},{" "}
            {EXPERT_REQUEST_KEY}, {CHANGE_LOG_KEY}, {TIYA_CHECKOUT_DRAFT_KEY},{" "}
            {TIYA_SELECTED_BUNDLE_KEY}, {TIYA_QUOTE_PREVIEW_KEY}
          </div>
        </aside>
      </div>

      {showReview ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/12 bg-[#07111F] text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                  Final trip review
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Proceed to Book Review
                </h3>
                <p className="mt-1 text-sm font-semibold text-white/62">
                  Verify planner data before entering the booking ecosystem. No payment starts here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/15"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  ["Trip Summary", `${checkoutPayload.trip.origin} → ${checkoutPayload.trip.destination} · ${checkoutPayload.trip.totalDays} days`],
                  ["Route Summary", checkoutPayload.route.name],
                  ["Travellers", `${checkoutPayload.travellers.total} travellers · ${checkoutPayload.travellers.rooms} rooms`],
                  ["Selected Services", checkoutPayload.selectedServices.map((service) => localLifeLabel(service.serviceName)).join(", ") || "No services selected"],
                  ["Hotels", `${checkoutPayload.selectedHotels.length}`],
                  ["Homestays", `${checkoutPayload.selectedHomestays.length}`],
                  ["Activities", `${checkoutPayload.selectedActivities.length}`],
                  ["Insurance", checkoutPayload.selectedInsurance.length ? "Included" : "Optional"],
                  ["Local Life", `${checkoutPayload.selectedLocalMarketItems.length} highlighted items`],
                  ["Budget", formatCurrency(checkoutPayload.budgetEstimate.totalEstimatedCost)],
                  ["Estimated Quote", formatCurrency(checkoutPayload.quoteEstimate.estimatedTotal)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black leading-6 text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  Day-wise itinerary
                </div>
                <div className="mt-3 grid gap-2">
                  {activeDays.map((day) => (
                    <div key={day.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="text-sm font-black text-white">
                        Day {String(day.day).padStart(2, "0")} · {day.city}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/64">
                        {(day.items || []).map((item) => item.title).join(" · ") || day.headline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
