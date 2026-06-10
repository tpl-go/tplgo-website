"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  BadgeIndianRupee,
  BedDouble,
  BrainCircuit,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  DatabaseZap,
  PackageCheck,
  Plane,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";

import TiyaAIRecommendationRail from "@/app/components/ecosystem/planner/TiyaAIRecommendationRail";
import TiyaBookingReadyLayer from "@/app/components/ecosystem/planner/TiyaBookingReadyLayer";
import TiyaBudgetPreview from "@/app/components/ecosystem/planner/TiyaBudgetPreview";
import TiyaCheckoutBridge from "@/app/components/ecosystem/planner/TiyaCheckoutBridge";
import TiyaCostOptimization from "@/app/components/ecosystem/planner/TiyaCostOptimization";
import TiyaCreatorPicks from "@/app/components/ecosystem/planner/TiyaCreatorPicks";
import TiyaExpeditionBuilder from "@/app/components/ecosystem/planner/TiyaExpeditionBuilder";
import TiyaExpertReview from "@/app/components/ecosystem/planner/TiyaExpertReview";
import TiyaExperiencePlanner from "@/app/components/ecosystem/planner/TiyaExperiencePlanner";
import TiyaExportItinerary from "@/app/components/ecosystem/planner/TiyaExportItinerary";
import TiyaGroupPlanner from "@/app/components/ecosystem/planner/TiyaGroupPlanner";
import TiyaJourneyTimeline from "@/app/components/ecosystem/planner/TiyaJourneyTimeline";
import TiyaLocalMarketPicks from "@/app/components/ecosystem/planner/TiyaLocalMarketPicks";
import TiyaMemoryDashboard from "@/app/components/ecosystem/planner/TiyaMemoryDashboard";
import TiyaOperatingDashboard from "@/app/components/ecosystem/planner/TiyaOperatingDashboard";
import TiyaPackageBuilder from "@/app/components/ecosystem/planner/TiyaPackageBuilder";
import TiyaPackingEngine from "@/app/components/ecosystem/planner/TiyaPackingEngine";
import TiyaPlannerActions from "@/app/components/ecosystem/planner/TiyaPlannerActions";
import TiyaPostTripEcosystem from "@/app/components/ecosystem/planner/TiyaPostTripEcosystem";
import TiyaQuoteGenerator from "@/app/components/ecosystem/planner/TiyaQuoteGenerator";
import TiyaRulesEnginePanel from "@/app/components/ecosystem/planner/TiyaRulesEnginePanel";
import TiyaSavedTripLibrary from "@/app/components/ecosystem/planner/TiyaSavedTripLibrary";
import TiyaScenarioEngine from "@/app/components/ecosystem/planner/TiyaScenarioEngine";
import TiyaSeasonalWeather from "@/app/components/ecosystem/planner/TiyaSeasonalWeather";
import TiyaSmartBundleEngine from "@/app/components/ecosystem/planner/TiyaSmartBundleEngine";
import TiyaSuggestionCards from "@/app/components/ecosystem/planner/TiyaSuggestionCards";
import TiyaTravelCompanion from "@/app/components/ecosystem/planner/TiyaTravelCompanion";
import TiyaTripNotes from "@/app/components/ecosystem/planner/TiyaTripNotes";
import TiyaTripReview from "@/app/components/ecosystem/planner/TiyaTripReview";
import TiyaTripVariantBuilder from "@/app/components/ecosystem/planner/TiyaTripVariantBuilder";
import { generatePlannerSmartAlerts } from "@/app/lib/ecosystem/planner/plannerAlertEngine";
import { generatePlannerBudgetIntelligence } from "@/app/lib/ecosystem/planner/plannerBudgetInsightEngine";
import { buildPlannerSnapshot } from "@/app/lib/ecosystem/planner/plannerDraftEngine";
import {
  generatePlannerTravelStats,
  generatePlannerTripHealth,
} from "@/app/lib/ecosystem/planner/plannerHealthEngine";
import { generatePlannerJourneyMap } from "@/app/lib/ecosystem/planner/plannerJourneyMapEngine";
import { generateSmartPlannerMock } from "@/app/lib/ecosystem/planner/plannerMockGenerator";
import { generatePlannerRecommendations } from "@/app/lib/ecosystem/planner/plannerRecommendationEngine";
import type { TiyaRouteScenario } from "@/app/lib/ecosystem/planner/plannerScenarioEngine";
import {
  deletePlannerTrip,
  duplicatePlannerTrip,
  loadLastPlannerTrip,
  loadPlannerDraft,
  loadSavedPlannerTrips,
  renamePlannerTrip,
  savePlannerDraft,
} from "@/app/lib/ecosystem/planner/plannerStorage";
import {
  generatePlannerJourneyStatus,
  generatePlannerJourneyTimeline,
} from "@/app/lib/ecosystem/planner/plannerTimelineEngine";
import type { TiyaTripVariant } from "@/app/lib/ecosystem/planner/plannerVariantEngine";
import type {
  TiyaTimelineDetailValue,
  TiyaGeneratedPlan,
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaTripNotes as TiyaTripNotesState,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import {
  bookingDisplayType,
  buildBasketOptions,
  calculateBookingItemTotal,
  displayPriceLabelForBasis,
  getBookingItemPriceBreakup,
  getBookingItemCoverageLabel,
  getBookingItemInvoiceServiceLabel,
  getBookingItemRouteLabel,
  getPriceLabel,
  priceBasisFromBookingItem,
  type WorkspaceBookingBasketItem,
  type WorkspaceBookingType,
} from "./utils/bookingBasket";
import type { WorkspacePreferences } from "./utils/workspaceTypes";

type WorkspaceAdvancedTabsProps = {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  fromCity: string;
  toCity: string;
  sourceIntent?: TiyaTripIntent;
  sourcePlan?: TiyaGeneratedPlan;
  bookingBasket: WorkspaceBookingBasketItem[];
  setBookingBasket: Dispatch<SetStateAction<WorkspaceBookingBasketItem[]>>;
};

type WorkspaceCapabilityId =
  | "Flight & Transport Planning"
  | "Stay Selection"
  | "Package Builder"
  | "Quote Comparison"
  | "Checkout Readiness"
  | "Expert Assistance"
  | "Booking Readiness"
  | "Trip Health Score"
  | "Weather Intelligence"
  | "Route Risk Analysis"
  | "Journey Timeline & Map"
  | "Route Variants & Alternatives"
  | "Smart Travel Recommendations"
  | "Budget Overview"
  | "Cost Optimization"
  | "Creator Recommendations"
  | "Local Market Picks"
  | "Experiences & Activities"
  | "Packing Checklist"
  | "Travel Readiness"
  | "Expedition Planner"
  | "AI Travel Companion"
  | "Group Planning"
  | "Travel Memory"
  | "Trip Review"
  | "Saved Trips & Notes"
  | "Export & Share"
  | "Post Trip Insights";

type BookingOptionModalState = {
  itemId: string;
  open: boolean;
};

const defaultNotes: TiyaTripNotesState = {
  personal: "",
  packing: "",
  localTips: "",
  creatorNotes: "",
};

function normalizePace(value: string): TiyaTripIntent["pace"] {
  if (value === "Relaxed" || value === "Packed") return value;
  return "Balanced";
}

function buildWorkspaceIntent({
  preferences,
  fromCity,
  toCity,
}: {
  preferences: WorkspacePreferences;
  fromCity: string;
  toCity: string;
}): TiyaTripIntent {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  return {
    fromCity,
    toCity,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    tripType: "Multi-city",
    transportMode: preferences.transportMode,
    stayPreference: preferences.stayPreference,
    budgetTier: preferences.comfortLevel,
    customBudgetAmount: "",
    adults: 2,
    children: 0,
    seniors: 0,
    pets: false,
    travelStyle: preferences.interests[0] || "Leisure",
    pace: normalizePace(preferences.pace),
    interests: preferences.interests,
    smartPreferences: {
      includeStays: true,
      includeLocalMarket: preferences.interests.includes("Local Market"),
      includeCreatorSpots: preferences.interests.includes("Creator Spots"),
      includeInsurance: true,
      avoidNightTravel: true,
      preferScenicRoute: true,
    },
  };
}

function ensureSelectedRouteInPlan(
  plan: TiyaGeneratedPlan,
  selectedRoute: TiyaRouteOption
): TiyaGeneratedPlan {
  const routeExists = plan.routeOptions.some((route) => route.id === selectedRoute.id);

  return {
    ...plan,
    routeTitle: selectedRoute.name,
    routeOptions: routeExists
      ? plan.routeOptions.map((route) => ({
          ...route,
          isRecommended: route.id === selectedRoute.id,
        }))
      : [
          { ...selectedRoute, isRecommended: true },
          ...plan.routeOptions.map((route) => ({ ...route, isRecommended: false })),
        ],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);
}

type BasketSummaryGroupId = "transport" | "stay" | "activity" | "other";

type BasketSummaryLine = {
  id: string;
  dayLabel: string;
  dayRange?: string;
  serviceLabel: string;
  title: string;
  routeLabel: string;
  basisLabel: string;
  calculationLabel: string;
  estimatedTotal: number;
  coverageCaption: string;
};

type BasketSummaryGroup = {
  id: BasketSummaryGroupId;
  title: string;
  total: number;
  lines: BasketSummaryLine[];
};

function basisNoteForItem(item: WorkspaceBookingBasketItem) {
  const priceBasis = priceBasisFromBookingItem(item);

  if (priceBasis === "per_room_night") {
    const nights = Math.max(1, item.nights || 1);
    const rooms = Math.max(1, item.rooms || 1);
    return `${nights} night${nights === 1 ? "" : "s"} stay · ${rooms} room${rooms === 1 ? "" : "s"}`;
  }

  if (priceBasis === "per_night") {
    const nights = Math.max(1, item.nights || 1);
    return `${nights} night${nights === 1 ? "" : "s"} stay`;
  }

  if (priceBasis === "per_day") {
    const days = Math.max(1, item.durationDays || item.quantity || 1);
    return `${days} day${days === 1 ? "" : "s"} required`;
  }

  if (priceBasis === "per_traveller") {
    const travellers = Math.max(1, item.travellers || 1);
    return `${travellers} traveller${travellers === 1 ? "" : "s"} for booking calculation`;
  }

  if (priceBasis === "per_group") return "Group based estimate";
  if (priceBasis === "per_item") return "Item quantity based estimate";

  return undefined;
}

function resolveBasketSummaryGroup(
  item: WorkspaceBookingBasketItem
): BasketSummaryGroupId {
  const text = `${item.category} ${item.serviceType} ${item.serviceLabel || ""} ${item.serviceName} ${item.title}`.toLowerCase();

  if (
    item.category === "Transport" ||
    item.serviceType === "flight" ||
    item.serviceType === "cab" ||
    /(flight|train|bus|cab|transfer|cruise|transport)/.test(text)
  ) {
    return "transport";
  }

  if (
    item.category === "Stay" ||
    item.serviceType === "hotel" ||
    /(hotel|homestay|resort|villa|stay)/.test(text)
  ) {
    return "stay";
  }

  if (
    item.category === "Activities" ||
    item.category === "Meals" ||
    item.serviceType === "activity" ||
    /(activity|sightseeing|adventure|experience|local experience|food|meal)/.test(text)
  ) {
    return "activity";
  }

  return "other";
}

function buildBasketSummaryGroups(
  bookingBasket: WorkspaceBookingBasketItem[]
): BasketSummaryGroup[] {
  const groups: BasketSummaryGroup[] = [
    { id: "transport", title: "Transport", total: 0, lines: [] },
    { id: "stay", title: "Stay", total: 0, lines: [] },
    { id: "activity", title: "Activities", total: 0, lines: [] },
    { id: "other", title: "Package / Other", total: 0, lines: [] },
  ];

  bookingBasket.forEach((item) => {
    const groupId = resolveBasketSummaryGroup(item);
    const group = groups.find((currentGroup) => currentGroup.id === groupId);
    const priceBreakup = getBookingItemPriceBreakup(item);

    if (!group) return;

    group.total += priceBreakup.estimatedTotal;
    group.lines.push({
      id: item.id,
      dayLabel: item.dayLabel,
      dayRange: getBookingItemCoverageLabel(item),
      serviceLabel: getBookingItemInvoiceServiceLabel(item),
      title: item.selectedOptionName || item.title,
      routeLabel: getBookingItemRouteLabel(item),
      basisLabel: priceBreakup.basisLabel,
      calculationLabel: priceBreakup.calculationLabel,
      estimatedTotal: priceBreakup.estimatedTotal,
      coverageCaption:
        priceBasisFromBookingItem(item) === "per_night" ||
        priceBasisFromBookingItem(item) === "per_room_night"
          ? "Check-in / Check-out"
          : priceBasisFromBookingItem(item) === "per_day"
            ? "Coverage"
            : "Date",
    });
  });

  return groups;
}

function CapabilityAccordion({
  id,
  icon: Icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  id: WorkspaceCapabilityId;
  icon: typeof Plane;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: (id: WorkspaceCapabilityId) => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/84 shadow-[0_18px_58px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-300">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-orange-50/55 sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isOpen
                ? "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_12px_28px_rgba(249,115,22,0.24)]"
                : "border border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            <Icon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black text-slate-950 sm:text-lg">
              {title}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-5 text-slate-500">
              {subtitle}
            </span>
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-slate-500 transition duration-300 ${
            isOpen ? "rotate-180 text-orange-600" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="grid gap-4 border-t border-slate-100 bg-white/68 p-4 sm:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function BookingModuleCards({
  title,
  moduleIds,
  plan,
}: {
  title: string;
  moduleIds: string[];
  plan: TiyaGeneratedPlan;
}) {
  const modules = plan.bookingModules.filter((module) =>
    moduleIds.includes(module.id)
  );

  return (
    <section className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_56px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            Booking planning
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
        </div>
        <span className="w-fit rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
          {modules.length} option{modules.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {modules.map((module) => (
          <article
            key={module.id}
            className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-base font-black text-slate-950">
                  {module.serviceName}
                </h4>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  {module.reason}
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                {module.readiness}
              </span>
            </div>
            <div className="mt-4 inline-flex rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(255,123,0,0.2)]">
              {module.cta}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function WorkspaceAdvancedTabs({
  selectedRoute,
  preferences,
  fromCity,
  toCity,
  sourceIntent,
  sourcePlan,
  bookingBasket,
  setBookingBasket,
}: WorkspaceAdvancedTabsProps) {
  const [openCapability, setOpenCapability] =
    useState<WorkspaceCapabilityId | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>();
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [tripNotes, setTripNotes] =
    useState<TiyaTripNotesState>(defaultNotes);
  const [savedTrips, setSavedTrips] = useState<TiyaPlannerSnapshot[]>([]);
  const [lastTrip, setLastTrip] = useState<TiyaPlannerSnapshot | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [optionModal, setOptionModal] = useState<BookingOptionModalState>({
    itemId: "",
    open: false,
  });
  const intent = useMemo(
    () => sourceIntent ?? buildWorkspaceIntent({ preferences, fromCity, toCity }),
    [fromCity, preferences, sourceIntent, toCity]
  );
  const plan = useMemo(
    () =>
      ensureSelectedRouteInPlan(
        sourcePlan ?? generateSmartPlannerMock(intent),
        selectedRoute
      ),
    [intent, selectedRoute, sourcePlan]
  );
  const days = plan.days;
  const journeyTimeline = useMemo(
    () =>
      generatePlannerJourneyTimeline({
        days,
        intent,
        creatorPicks: plan.creatorPicks,
        localMarketPicks: plan.localMarketPicks,
        bookingModules: plan.bookingModules,
      }),
    [days, intent, plan.bookingModules, plan.creatorPicks, plan.localMarketPicks]
  );
  const journeyMap = useMemo(
    () => generatePlannerJourneyMap({ days, intent }),
    [days, intent]
  );
  const journeyStatus = useMemo(
    () =>
      generatePlannerJourneyStatus({
        intent,
        days,
        bookingModules: plan.bookingModules,
      }),
    [days, intent, plan.bookingModules]
  );
  const tripHealth = useMemo(
    () =>
      generatePlannerTripHealth({
        intent,
        days,
        journeyStatus,
        selectedRoute,
        bookingModules: plan.bookingModules,
      }),
    [days, intent, journeyStatus, plan.bookingModules, selectedRoute]
  );
  const budgetIntelligence = useMemo(
    () =>
      generatePlannerBudgetIntelligence({
        intent,
        budgetLines: plan.budgetLines,
        totalBudget: plan.totalBudget,
      }),
    [intent, plan.budgetLines, plan.totalBudget]
  );
  const smartAlerts = useMemo(
    () =>
      generatePlannerSmartAlerts({
        intent,
        days,
        selectedRoute,
        totalBudget: plan.totalBudget,
      }),
    [days, intent, plan.totalBudget, selectedRoute]
  );
  const recommendations = useMemo(
    () => generatePlannerRecommendations({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const travelStats = useMemo(
    () =>
      generatePlannerTravelStats({
        routeOptions: plan.routeOptions,
        selectedRoute,
        journeyStatus,
      }),
    [journeyStatus, plan.routeOptions, selectedRoute]
  );
  const snapshot = useMemo(
    () =>
      buildPlannerSnapshot({
        intent,
        plan,
        itinerary: days,
        notes: tripNotes,
        selectedRouteId: selectedRoute.id,
      }),
    [days, intent, plan, selectedRoute.id, tripNotes]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSavedTrips(loadSavedPlannerTrips());
      setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleScenarioSelect(scenario: TiyaRouteScenario) {
    setSelectedScenarioId(scenario.id);
    setHasUnsavedChanges(true);
  }

  function handleVariantSelect(variant: TiyaTripVariant) {
    setSelectedVariantId(variant.id);
    setHasUnsavedChanges(true);
  }

  function handleVariantApply(variant: TiyaTripVariant) {
    setSelectedVariantId(variant.id);
    setHasUnsavedChanges(true);
  }

  function handleNotesChange(notes: TiyaTripNotesState) {
    setTripNotes(notes);
    setHasUnsavedChanges(true);
  }

  function restorePlannerSnapshot(restoredSnapshot: TiyaPlannerSnapshot) {
    setTripNotes(restoredSnapshot.notes || defaultNotes);
    setLastSavedAt(restoredSnapshot.savedAt);
    setLastTrip(restoredSnapshot);
    setHasUnsavedChanges(false);
    savePlannerDraft(restoredSnapshot);
  }

  function handleRenameTrip(tripId: string, tripName: string) {
    const nextTrips = renamePlannerTrip(tripId, tripName);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function handleDuplicateTrip(tripId: string) {
    const nextTrips = duplicatePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function handleDeleteTrip(tripId: string) {
    const nextTrips = deletePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function toggleCapability(id: WorkspaceCapabilityId) {
    setOpenCapability((current) => (current === id ? null : id));
  }

  function selectBasketOption(
    itemId: string,
    option: {
      name: string;
      price: number;
      providerName?: string;
      detailSummary?: string;
      details?: Record<string, TiyaTimelineDetailValue>;
    }
  ) {
    setBookingBasket((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? (() => {
              const nextItem = {
                ...item,
                selectedOptionName: option.name,
                title: option.name,
                unitPrice: option.price,
                estimatedPrice: option.price,
                price: option.price,
                priceBasis: priceBasisFromBookingItem(item),
                displayPriceLabel: displayPriceLabelForBasis(
                  option.price,
                  priceBasisFromBookingItem(item)
                ),
                providerName: option.providerName ?? item.providerName,
                detailSummary: option.detailSummary ?? item.detailSummary,
                details: option.details ?? item.details,
                status: "selected" as const,
                bookingStatus: "selected" as const,
              };

              return {
                ...nextItem,
                estimatedTotal: calculateBookingItemTotal(nextItem),
              };
            })()
          : item
      )
    );
    setOptionModal({ itemId: "", open: false });
  }

  function markBasketItemSelected(itemId: string) {
    setBookingBasket((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, status: "selected", bookingStatus: "selected" }
          : item
      )
    );
  }

  function removeBasketItem(itemId: string) {
    setBookingBasket((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  }

  const activeOptionItem = optionModal.open
    ? bookingBasket.find((item) => item.id === optionModal.itemId)
    : undefined;
  const basketSummaryGroups = buildBasketSummaryGroups(bookingBasket);
  const basketSubtotal = basketSummaryGroups.reduce(
    (total, group) => total + group.total,
    0
  );
  const taxesAndFees = Math.round(basketSubtotal * 0.08);
  const grandTotal = basketSubtotal + taxesAndFees;
  const basketIconMap: Record<WorkspaceBookingType, typeof Plane> = {
    flight: Plane,
    hotel: BedDouble,
    cab: Car,
    activity: Ticket,
    package: PackageCheck,
  };
  const basketCategories: Array<WorkspaceBookingBasketItem["category"]> = [
    "Transport",
    "Stay",
    "Activities",
    "Meals",
    "Package",
    "Other",
  ];

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-orange-100/80 bg-white/88 shadow-[0_30px_96px_rgba(249,115,22,0.12)] backdrop-blur-2xl">
        <div className="border-b border-orange-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,237,0.92),rgba(239,246,255,0.84))] px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
              <Plane size={15} />
              Primary booking flow
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Booking Basket & Checkout
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Review selected transport, stays, activities, packages, quotes
              and checkout readiness.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-5 p-4 sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="grid min-w-0 gap-3">
              {bookingBasket.length === 0 ? (
                <div className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                    <Plane size={20} />
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    No booking items selected yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    Add transport, stay, activity or package items from the
                    itinerary to prepare a checkout-ready basket.
                  </p>
                </div>
              ) : null}

              {basketCategories.map((category) => {
                const categoryItems = bookingBasket.filter(
                  (item) => item.category === category
                );

                if (!categoryItems.length) return null;

                return (
                  <section key={category} className="grid gap-2">
                    <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/80 px-3 py-2">
                      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                        {category}
                      </h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-600">
                        {categoryItems.length} item
                        {categoryItems.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {categoryItems.map((item) => {
                      const ItemIcon = basketIconMap[item.serviceType];
                      const itemEstimate = calculateBookingItemTotal(item);
                      const itemBasisNote = basisNoteForItem(item);

                      return (
                        <article
                          key={item.id}
                          className="rounded-3xl border border-orange-100/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
                        >
                          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_12px_30px_rgba(249,115,22,0.24)]">
                                <ItemIcon size={19} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                                  {item.dayLabel}
                                </p>
                                <span className="mt-1 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                                  {bookingDisplayType(item.serviceType)}
                                </span>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-black text-slate-950 sm:text-lg">
                                  {item.selectedOptionName}
                                </h3>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                    item.status === "selected"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-orange-50 text-orange-700"
                                  }`}
                                >
                                  {item.status === "selected"
                                    ? "Selected"
                                    : "Recommended"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                {item.dayRange || item.dayLabel} · {item.date} ·{" "}
                                {getBookingItemRouteLabel(item)} · {item.travellers} traveller
                                {item.travellers === 1 ? "" : "s"}
                              </p>
                            </div>

                            <div className="grid gap-3 md:min-w-[220px]">
                              <p className="text-xl font-black text-slate-950 md:text-right">
                                {getPriceLabel(item)}
                              </p>
                              {itemBasisNote ? (
                                <p className="-mt-2 text-right text-[11px] font-black text-slate-500">
                                  {itemBasisNote}
                                </p>
                              ) : null}
                              {itemEstimate !== item.unitPrice ? (
                                <p className="-mt-2 text-right text-xs font-black text-orange-700">
                                  Estimated {formatCurrency(itemEstimate)}
                                </p>
                              ) : null}
                              <div className="flex flex-wrap gap-2 md:justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOptionModal({ itemId: item.id, open: true })
                                  }
                                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                                >
                                  View Options
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOptionModal({ itemId: item.id, open: true })
                                  }
                                  className="rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={() => markBasketItemSelected(item.id)}
                                  className="rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-3 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(255,123,0,0.22)]"
                                >
                                  {item.status === "selected"
                                    ? "Selected"
                                    : "Select"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBasketItem(item.id)}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-white/80 bg-[#061839] p-4 text-white shadow-[0_24px_76px_rgba(6,24,57,0.22)] lg:sticky lg:top-5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <CheckCircle2 size={15} />
                Price summary
              </div>
              <h3 className="mt-2 text-xl font-black">Estimated booking value</h3>

              <div className="mt-4 grid gap-2">
                {bookingBasket.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                    <p className="text-sm font-black text-white">
                      No booking items selected yet.
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      Add flights, stays, activities or transfers from your
                      itinerary to see checkout estimate.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {basketSummaryGroups
                    .filter((group) => group.lines.length > 0)
                    .map((group) => (
                      <section
                        key={group.id}
                        className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3"
                      >
                        <h4 className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                          {group.title}
                        </h4>

                        <div className="mt-2 space-y-2">
                          {group.lines.map((line) => (
                            <article
                              key={line.id}
                              className="grid gap-2 rounded-xl bg-black/14 px-2.5 py-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/58">
                                    {line.serviceLabel}
                                  </p>
                                  <h5 className="mt-1 text-sm font-black leading-5 text-white">
                                    {line.title}
                                  </h5>
                                  <p className="mt-1 text-[11px] font-semibold text-cyan-100/62">
                                    {line.coverageCaption}: {line.dayRange || line.dayLabel}
                                  </p>
                                </div>
                                <span className="shrink-0 text-xs font-black text-orange-100">
                                  Estimated {formatCurrency(line.estimatedTotal)}
                                </span>
                              </div>

                              <p className="text-[11px] font-semibold leading-4 text-white/56">
                                {line.routeLabel}
                              </p>

                              <div className="grid gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2">
                                <p className="text-xs font-black text-white">
                                  {line.basisLabel}
                                </p>
                                <p className="text-[11px] font-semibold text-white/58">
                                  {line.calculationLabel}
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                          <span className="text-xs font-black text-white/70">
                            {group.title} Total
                          </span>
                          <span className="text-sm font-black text-white">
                            {formatCurrency(group.total)} Estimated
                          </span>
                        </div>
                      </section>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="text-xs font-bold text-white/65">
                    Subtotal
                  </span>
                  <span className="text-sm font-black text-white">
                    {formatCurrency(basketSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="text-xs font-bold text-white/65">
                    Estimated taxes & fees
                  </span>
                  <span className="text-sm font-black text-white">
                    {formatCurrency(taxesAndFees)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-100/70">
                  Estimated trip value
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,123,0,0.3)] transition hover:-translate-y-0.5"
              >
                Continue Booking
              </button>
            </aside>
          </div>
        </div>
      </section>

      {activeOptionItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_30px_110px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff,#eff6ff,#fff7ed)] p-4 sm:p-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                  {bookingDisplayType(activeOptionItem.serviceType)} options
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  Change selected option
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {activeOptionItem.dayLabel} · {activeOptionItem.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptionModal({ itemId: "", open: false })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 p-4 sm:p-5">
              {buildBasketOptions(activeOptionItem).map((option) => (
                <article
                  key={option.id}
                  className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-black text-slate-950">
                        {option.name}
                      </h4>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {option.detail}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-lg font-black text-slate-950">
                        {formatCurrency(option.price)}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          selectBasketOption(activeOptionItem.id, option)
                        }
                        className="mt-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-4 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(255,123,0,0.22)]"
                      >
                        Select Option
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/82 shadow-[0_28px_90px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
        <div className="border-b border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(239,246,255,0.88),rgba(255,247,237,0.86))] px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              <ShieldCheck size={15} />
              Travel planning
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Travel Insights & Planning Tools
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Open any planning capability when you need deeper guidance,
              checks, recommendations or trip actions.
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:p-5">
          <CapabilityAccordion
            id="Flight & Transport Planning"
            icon={Plane}
            title="Flight & Transport Planning"
            subtitle="Review flight, train, cab and transfer planning options."
            isOpen={openCapability === "Flight & Transport Planning"}
            onToggle={toggleCapability}
          >
            <BookingModuleCards
              title="Transport planning options"
              moduleIds={["flights", "cabs", "insurance"]}
              plan={plan}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Stay Selection"
            icon={BedDouble}
            title="Stay Selection"
            subtitle="Review hotels, homestays and accommodation planning."
            isOpen={openCapability === "Stay Selection"}
            onToggle={toggleCapability}
          >
            <BookingModuleCards
              title="Stay planning options"
              moduleIds={["hotels", "homestays"]}
              plan={plan}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Package Builder"
            icon={PackageCheck}
            title="Package Builder"
            subtitle="Build trip packages and combine selected services."
            isOpen={openCapability === "Package Builder"}
            onToggle={toggleCapability}
          >
            <TiyaPackageBuilder intent={intent} plan={plan} />
            <TiyaSmartBundleEngine intent={intent} plan={plan} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Quote Comparison"
            icon={BadgeIndianRupee}
            title="Quote Comparison"
            subtitle="Compare travel quotes and pricing options."
            isOpen={openCapability === "Quote Comparison"}
            onToggle={toggleCapability}
          >
            <TiyaQuoteGenerator intent={intent} plan={plan} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Checkout Readiness"
            icon={CheckCircle2}
            title="Checkout Readiness"
            subtitle="Check trip readiness before moving to booking."
            isOpen={openCapability === "Checkout Readiness"}
            onToggle={toggleCapability}
          >
            <TiyaCheckoutBridge
              intent={intent}
              plan={plan}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Expert Assistance"
            icon={Plane}
            title="Expert Assistance"
            subtitle="Get expert review and planning support."
            isOpen={openCapability === "Expert Assistance"}
            onToggle={toggleCapability}
          >
            <TiyaExpertReview
              intent={intent}
              plan={plan}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Booking Readiness"
            icon={CheckCircle2}
            title="Booking Readiness"
            subtitle="Check booking availability, readiness and selected services."
            isOpen={openCapability === "Booking Readiness"}
            onToggle={toggleCapability}
          >
            <TiyaBookingReadyLayer modules={plan.bookingModules} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Trip Health Score"
            icon={BrainCircuit}
            title="Trip Health Score"
            subtitle="Understand trip balance, comfort and overall travel health."
            isOpen={openCapability === "Trip Health Score"}
            onToggle={toggleCapability}
          >
            <TiyaOperatingDashboard
              health={tripHealth}
              budget={budgetIntelligence}
              alerts={smartAlerts}
              recommendations={recommendations}
              stats={travelStats}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Weather Intelligence"
            icon={BrainCircuit}
            title="Weather Intelligence"
            subtitle="Season, weather and travel timing insights."
            isOpen={openCapability === "Weather Intelligence"}
            onToggle={toggleCapability}
          >
            <TiyaSeasonalWeather intent={intent} selectedRoute={selectedRoute} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Route Risk Analysis"
            icon={ShieldCheck}
            title="Route Risk Analysis"
            subtitle="Travel risks, safety checks and planning constraints."
            isOpen={openCapability === "Route Risk Analysis"}
            onToggle={toggleCapability}
          >
            <TiyaRulesEnginePanel
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Journey Timeline & Map"
            icon={Car}
            title="Journey Timeline & Map"
            subtitle="View route flow, movement and travel progression."
            isOpen={openCapability === "Journey Timeline & Map"}
            onToggle={toggleCapability}
          >
            <TiyaJourneyTimeline
              days={journeyTimeline}
              map={journeyMap}
              status={journeyStatus}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Route Variants & Alternatives"
            icon={Car}
            title="Route Variants & Alternatives"
            subtitle="Compare alternate routes and travel scenarios."
            isOpen={openCapability === "Route Variants & Alternatives"}
            onToggle={toggleCapability}
          >
            <TiyaScenarioEngine
              intent={intent}
              plan={plan}
              selectedScenarioId={selectedScenarioId}
              onScenarioSelect={handleScenarioSelect}
            />
            <TiyaTripVariantBuilder
              intent={intent}
              plan={plan}
              selectedVariantId={selectedVariantId}
              onVariantSelect={handleVariantSelect}
              onVariantApply={handleVariantApply}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Smart Travel Recommendations"
            icon={BrainCircuit}
            title="Smart Travel Recommendations"
            subtitle="AI-powered suggestions for a better journey."
            isOpen={openCapability === "Smart Travel Recommendations"}
            onToggle={toggleCapability}
          >
            <TiyaAIRecommendationRail recommendations={recommendations} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Budget Overview"
            icon={BadgeIndianRupee}
            title="Budget Overview"
            subtitle="Review estimated travel budget and cost breakdown."
            isOpen={openCapability === "Budget Overview"}
            onToggle={toggleCapability}
          >
            <TiyaBudgetPreview
              lines={plan.budgetLines}
              total={plan.totalBudget}
              budgetRange={intent.customBudgetAmount || intent.budgetTier}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Cost Optimization"
            icon={BadgeIndianRupee}
            title="Cost Optimization"
            subtitle="Discover savings and improve value without reducing experience."
            isOpen={openCapability === "Cost Optimization"}
            onToggle={toggleCapability}
          >
            <TiyaCostOptimization
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Creator Recommendations"
            icon={Clapperboard}
            title="Creator Recommendations"
            subtitle="Discover creator-curated places and experiences."
            isOpen={openCapability === "Creator Recommendations"}
            onToggle={toggleCapability}
          >
            <TiyaCreatorPicks creators={plan.creatorPicks} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Local Market Picks"
            icon={Clapperboard}
            title="Local Market Picks"
            subtitle="Explore destination-based local products and shopping ideas."
            isOpen={openCapability === "Local Market Picks"}
            onToggle={toggleCapability}
          >
            <TiyaLocalMarketPicks products={plan.localMarketPicks} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Experiences & Activities"
            icon={Ticket}
            title="Experiences & Activities"
            subtitle="Find activities, attractions and unique experiences."
            isOpen={openCapability === "Experiences & Activities"}
            onToggle={toggleCapability}
          >
            <TiyaExperiencePlanner
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
            />
            <TiyaSuggestionCards suggestions={plan.suggestions} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Packing Checklist"
            icon={BriefcaseBusiness}
            title="Packing Checklist"
            subtitle="Know what to carry before starting the journey."
            isOpen={openCapability === "Packing Checklist"}
            onToggle={toggleCapability}
          >
            <TiyaPackingEngine intent={intent} selectedRoute={selectedRoute} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Travel Readiness"
            icon={ShieldCheck}
            title="Travel Readiness"
            subtitle="Preparation status, readiness score and trip preparation guidance."
            isOpen={openCapability === "Travel Readiness"}
            onToggle={toggleCapability}
          >
            <TiyaPackingEngine intent={intent} selectedRoute={selectedRoute} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Expedition Planner"
            icon={Car}
            title="Expedition Planner"
            subtitle="Explore advanced route combinations and multi-destination planning."
            isOpen={openCapability === "Expedition Planner"}
            onToggle={toggleCapability}
          >
            <TiyaExpeditionBuilder
              intent={intent}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="AI Travel Companion"
            icon={DatabaseZap}
            title="AI Travel Companion"
            subtitle="Get smart travel assistance and trip guidance."
            isOpen={openCapability === "AI Travel Companion"}
            onToggle={toggleCapability}
          >
            <TiyaTravelCompanion
              intent={intent}
              plan={plan}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Group Planning"
            icon={DatabaseZap}
            title="Group Planning"
            subtitle="Manage group preferences and collaborative planning."
            isOpen={openCapability === "Group Planning"}
            onToggle={toggleCapability}
          >
            <TiyaGroupPlanner intent={intent} plan={plan} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Travel Memory"
            icon={DatabaseZap}
            title="Travel Memory"
            subtitle="Learn from previous trips and personalized travel behavior."
            isOpen={openCapability === "Travel Memory"}
            onToggle={toggleCapability}
          >
            <TiyaMemoryDashboard intent={intent} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Trip Review"
            icon={CheckCircle2}
            title="Trip Review"
            subtitle="Review the entire trip before finalizing."
            isOpen={openCapability === "Trip Review"}
            onToggle={toggleCapability}
          >
            <TiyaTripReview
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              smartAlerts={smartAlerts}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Saved Trips & Notes"
            icon={CheckCircle2}
            title="Saved Trips & Notes"
            subtitle="Access saved journeys, notes and planning history."
            isOpen={openCapability === "Saved Trips & Notes"}
            onToggle={toggleCapability}
          >
            <TiyaSavedTripLibrary
              savedTrips={savedTrips}
              lastTrip={lastTrip}
              onRestore={restorePlannerSnapshot}
              onRename={handleRenameTrip}
              onDuplicate={handleDuplicateTrip}
              onDelete={handleDeleteTrip}
            />
            <TiyaTripNotes notes={tripNotes} onChange={handleNotesChange} />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Export & Share"
            icon={CheckCircle2}
            title="Export & Share"
            subtitle="Export, save and share itinerary information."
            isOpen={openCapability === "Export & Share"}
            onToggle={toggleCapability}
          >
            <TiyaExportItinerary
              snapshot={snapshot}
              selectedRoute={selectedRoute}
              smartAlerts={smartAlerts}
            />
            <TiyaPlannerActions
              snapshot={snapshot}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSavedAt={lastSavedAt}
              onSaved={(savedSnapshot) => {
                setLastSavedAt(savedSnapshot.savedAt);
                setSavedTrips(loadSavedPlannerTrips());
                setLastTrip(loadLastPlannerTrip() || savedSnapshot);
                setHasUnsavedChanges(false);
              }}
            />
          </CapabilityAccordion>

          <CapabilityAccordion
            id="Post Trip Insights"
            icon={Clapperboard}
            title="Post Trip Insights"
            subtitle="Continue the journey with creator, memory and ecosystem recommendations."
            isOpen={openCapability === "Post Trip Insights"}
            onToggle={toggleCapability}
          >
            <TiyaPostTripEcosystem
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
            />
          </CapabilityAccordion>
        </div>
      </section>
    </>
  );
}
