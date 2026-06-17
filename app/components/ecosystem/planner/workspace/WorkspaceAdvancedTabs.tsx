"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BedDouble,
  Bookmark,
  BrainCircuit,
  BriefcaseBusiness,
  Bus,
  Camera,
  Car,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clock,
  DatabaseZap,
  Fuel,
  GitCompareArrows,
  Hotel,
  MapPinned,
  Mountain,
  PackageCheck,
  Plane,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  TrainFront,
  Utensils,
  X,
} from "lucide-react";

import TiyaAIRecommendationRail from "@/app/components/ecosystem/planner/TiyaAIRecommendationRail";
import TiyaBookingReadyLayer from "@/app/components/ecosystem/planner/TiyaBookingReadyLayer";
import TiyaBudgetPreview from "@/app/components/ecosystem/planner/TiyaBudgetPreview";
import TiyaCheckoutBridge from "@/app/components/ecosystem/planner/TiyaCheckoutBridge";
import TiyaCostOptimization from "@/app/components/ecosystem/planner/TiyaCostOptimization";
import TiyaCreatorPicks from "@/app/components/ecosystem/planner/TiyaCreatorPicks";
import TiyaExpeditionBuilder, {
  type TiyaRouteStrategySnapshot,
} from "@/app/components/ecosystem/planner/TiyaExpeditionBuilder";
import TiyaExpertReview from "@/app/components/ecosystem/planner/TiyaExpertReview";
import TiyaExperiencePlanner from "@/app/components/ecosystem/planner/TiyaExperiencePlanner";
import TiyaExportItinerary from "@/app/components/ecosystem/planner/TiyaExportItinerary";
import TiyaGroupPlanner, {
  type TiyaGroupDecision,
} from "@/app/components/ecosystem/planner/TiyaGroupPlanner";
import TiyaJourneyTimeline from "@/app/components/ecosystem/planner/TiyaJourneyTimeline";
import TiyaLocalMarketPicks from "@/app/components/ecosystem/planner/TiyaLocalMarketPicks";
import TiyaMemoryDashboard from "@/app/components/ecosystem/planner/TiyaMemoryDashboard";
import TiyaOperatingDashboard from "@/app/components/ecosystem/planner/TiyaOperatingDashboard";
import TiyaPackingEngine from "@/app/components/ecosystem/planner/TiyaPackingEngine";
import TiyaPlannerActions from "@/app/components/ecosystem/planner/TiyaPlannerActions";
import TiyaPostTripEcosystem from "@/app/components/ecosystem/planner/TiyaPostTripEcosystem";
import TiyaRulesEnginePanel from "@/app/components/ecosystem/planner/TiyaRulesEnginePanel";
import TiyaSavedTripLibrary from "@/app/components/ecosystem/planner/TiyaSavedTripLibrary";
import TiyaScenarioEngine from "@/app/components/ecosystem/planner/TiyaScenarioEngine";
import TiyaSeasonalWeather from "@/app/components/ecosystem/planner/TiyaSeasonalWeather";
import TiyaSuggestionCards from "@/app/components/ecosystem/planner/TiyaSuggestionCards";
import TiyaTravelCompanion, {
  type TiyaCoPilotAction,
} from "@/app/components/ecosystem/planner/TiyaTravelCompanion";
import TiyaTripNotes from "@/app/components/ecosystem/planner/TiyaTripNotes";
import TiyaTripReview from "@/app/components/ecosystem/planner/TiyaTripReview";
import TiyaTripVariantBuilder from "@/app/components/ecosystem/planner/TiyaTripVariantBuilder";
import { generatePlannerSmartAlerts } from "@/app/lib/ecosystem/planner/plannerAlertEngine";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  MY_TRIPS_ACTIVE_TRIP_ID_KEY,
  loadMyTripById,
  loadMyTrips,
  myTripOwnerKey,
  removeSavedItemFromMyTrip,
  saveMyTrip,
  type MyTripSavedItem,
  type MyTripSnapshot,
  type MyTripStatus,
} from "@/app/lib/ecosystem/planner/myTripsStorage";
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
  savePlannerTrip,
  updatePlannerTripNotes,
} from "@/app/lib/ecosystem/planner/plannerStorage";
import {
  generatePlannerJourneyStatus,
  generatePlannerJourneyTimeline,
} from "@/app/lib/ecosystem/planner/plannerTimelineEngine";
import type { TiyaExpertLeadPayload } from "@/app/lib/ecosystem/planner/plannerExpertLeadEngine";
import {
  buildSmartPlannerReviewPayload,
  persistSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaTripReviewSnapshot } from "@/app/lib/ecosystem/planner/plannerReviewEngine";
import type { TiyaTripVariant } from "@/app/lib/ecosystem/planner/plannerVariantEngine";
import type {
  TiyaCreatorPick,
  TiyaAIRecommendation,
  TiyaDayPlan,
  TiyaTimelineDetailValue,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaSuggestion,
  TiyaTimelineItem,
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
  upsertBookingBasketItem,
  type WorkspaceBookingBasketItem,
} from "./utils/bookingBasket";
import type { WorkspacePreferences } from "./utils/workspaceTypes";
import { saveWorkspacePayload } from "./utils/workspaceStorage";

type WorkspaceAdvancedTabsProps = {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  fromCity: string;
  toCity: string;
  sourceIntent?: TiyaTripIntent;
  sourcePlan?: TiyaGeneratedPlan;
  bookingBasket: WorkspaceBookingBasketItem[];
  onPlanChange?: (plan: TiyaGeneratedPlan) => void;
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
  | "Local Life"
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

const savedItemGroupOrder = [
  "Local Life",
  "Activities",
  "Stays",
  "Transport",
  "Routes",
  "Recommendations",
  "Creators",
  "Expedition Strategies",
  "Group Decisions",
  "Notes",
  "Other",
];

const RECOMMENDATION_STATE_KEY = "tpl_tiya_recommendation_state_v1";

type BookingOptionModalState = {
  itemId: string;
  open: boolean;
};

type BookingDetailModalState = {
  itemId: string;
  open: boolean;
};

type TripReadinessDay = {
  id: string;
  day: number;
  date: string;
  headline: string;
  status: "PLANNING" | "READY_TO_FINALIZE" | "FINALIZED" | "EDITING";
};

type TripReadinessSnapshot = {
  allFinalized: boolean;
  dayStatuses?: Record<string, string>;
  finalizedDayIds?: string[];
  finalizedDayNumbers?: number[];
  finalizedDays: number;
  journeyPercent: number;
  pendingDays: TripReadinessDay[];
  totalDays: number;
};

type ProtectedWorkspaceAction =
  | "save"
  | "share"
  | "continue"
  | "exportShare";

type FinalJourneySnapshot = {
  tripId: string;
  tripName: string;
  origin: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travellers: number;
  finalizedDays: number;
  dayWiseItinerary: TiyaGeneratedPlan["days"];
  selectedItems: WorkspaceBookingBasketItem[];
  estimatedTripValue: number;
  priceSummary: {
    selectedItems: number;
    subtotal: number;
    taxesAndFees: number;
    total: number;
    categories: {
      id: string;
      title: string;
      itemCount: number;
      total: number;
    }[];
  };
  notes: TiyaTripNotesState;
  generatedAt: string;
  status: "generated";
};

type ItineraryImpactDiff = {
  label: string;
  previousValue: string;
  nextValue: string;
};

type ItineraryImpactPreview = {
  applyChange?: () => void;
  bookingAffected: boolean;
  costDelta: number;
  diffs: ItineraryImpactDiff[];
  id: string;
  impactItems: string[];
  severity: "minor" | "major";
  summary: string;
  title: string;
  variant?: TiyaTripVariant;
};

type TripChangeLogEntry = Omit<
  Partial<ItineraryImpactPreview>,
  "costDelta" | "diffs" | "summary" | "title"
> & {
  affectedDays?: number[];
  actionType?: string;
  appliedAt: string;
  costDelta: number;
  diffs: ItineraryImpactDiff[];
  module?: string;
  riskDelta?: number;
  summary: string;
  title: string;
};

type ChangeVisualStatus = "success" | "warning" | "critical";

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

const changeStatusStyles: Record<
  ChangeVisualStatus,
  {
    accent: string;
    badge: string;
    card: string;
    chip: string;
    Icon: typeof CheckCircle2;
    label: string;
    title: string;
  }
> = {
  success: {
    accent: "bg-emerald-400",
    badge: "border-emerald-300/35 bg-emerald-400/15 text-emerald-50",
    card: "border-emerald-300/45 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(6,24,57,0.96))] shadow-[0_22px_58px_rgba(16,185,129,0.18)]",
    chip: "border-emerald-300/24 bg-emerald-400/12 text-emerald-50",
    Icon: CheckCircle2,
    label: "Success",
    title: "Trip Change Applied",
  },
  warning: {
    accent: "bg-amber-400",
    badge: "border-amber-300/40 bg-amber-400/15 text-amber-50",
    card: "border-amber-300/48 bg-[linear-gradient(135deg,rgba(245,158,11,0.20),rgba(6,24,57,0.96))] shadow-[0_22px_58px_rgba(245,158,11,0.18)]",
    chip: "border-amber-300/28 bg-amber-400/12 text-amber-50",
    Icon: AlertTriangle,
    label: "Warning",
    title: "Trip Change Needs Review",
  },
  critical: {
    accent: "bg-rose-400",
    badge: "border-rose-300/40 bg-rose-400/15 text-rose-50",
    card: "border-rose-300/50 bg-[linear-gradient(135deg,rgba(244,63,94,0.22),rgba(6,24,57,0.96))] shadow-[0_22px_58px_rgba(244,63,94,0.18)]",
    chip: "border-rose-300/28 bg-rose-400/12 text-rose-50",
    Icon: ShieldAlert,
    label: "Critical",
    title: "Trip Change Requires Attention",
  },
};

function classifyChangeStatus(
  change: Pick<TripChangeLogEntry, "costDelta" | "severity" | "summary" | "title">
): ChangeVisualStatus {
  const text = `${change.title} ${change.summary}`.toLowerCase();

  if (
    text.includes("unavailable") ||
    text.includes("conflict") ||
    text.includes("failure") ||
    text.includes("critical") ||
    text.includes("weather issue")
  ) {
    return "critical";
  }

  if (
    change.costDelta > 0 ||
    change.severity === "major" ||
    text.includes("family") ||
    text.includes("extra") ||
    text.includes("longer") ||
    text.includes("trade")
  ) {
    return "warning";
  }

  return "success";
}

function classifyActionStatus(message: string): ChangeVisualStatus {
  const text = message.toLowerCase();

  if (text.includes("error") || text.includes("failed") || text.includes("unavailable")) {
    return "critical";
  }

  if (
    text.includes("login") ||
    text.includes("required") ||
    text.includes("prepared") ||
    text.includes("review")
  ) {
    return "warning";
  }

  return "success";
}

function buildImpactSummary(change: TripChangeLogEntry) {
  const labels = change.diffs.map((diff) => diff.label.toLowerCase());
  const summary = [
    change.costDelta === 0
      ? "Cost Impact: No change"
      : `${change.costDelta < 0 ? "-" : "+"} Cost Impact: ${formatCurrency(Math.abs(change.costDelta))}`,
    labels.some((label) => label.includes("route") || label.includes("scenario"))
      ? "Route Updated"
      : "",
    labels.some((label) => label.includes("stay") || label.includes("hotel"))
      ? "Stay Configuration Updated"
      : "",
    labels.some((label) => label.includes("transport"))
      ? "Transport Updated"
      : "",
    labels.some((label) => label.includes("activity") || label.includes("market") || label.includes("creator"))
      ? "Experience Added"
      : "",
    change.bookingAffected ? "Booking Review Needed" : "",
  ].filter(Boolean);

  return summary.length ? summary : ["Itinerary Updated"];
}

function formatPdfDateLabel(value?: string) {
  if (!value) return "Flexible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safePdfFileName(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}

type BasketSummaryGroupId = "transport" | "stay" | "activity" | "other";

type BasketSummaryLine = {
  id: string;
  dayLabel: string;
  dayDateLabel: string;
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

function formatBasketDayLabel(item: Pick<WorkspaceBookingBasketItem, "day" | "dayLabel" | "date">) {
  const normalizedDay =
    item.dayLabel && /^day\s+\d+/i.test(item.dayLabel)
      ? item.dayLabel.replace(/day\s+(\d+)/i, (_, dayNumber) => `Day ${String(dayNumber).padStart(2, "0")}`)
      : `Day ${String(item.day || 1).padStart(2, "0")}`;

  return item.date ? `${normalizedDay} • ${item.date}` : normalizedDay;
}

function stackedBasketDayLabel(item: Pick<WorkspaceBookingBasketItem, "day" | "date">) {
  return {
    day: `DAY ${String(item.day || 1).padStart(2, "0")}`,
    date: item.date || "",
  };
}

function selectionServiceLabel(item: WorkspaceBookingBasketItem) {
  const text = `${item.category} ${item.serviceName} ${item.serviceLabel || ""} ${item.title}`.toLowerCase();

  if (text.includes("market")) return "Local Life";
  if (text.includes("creator")) return "Creator Experience";
  if (item.category === "Transport") return "Transport";
  if (item.category === "Stay") return "Stay";
  if (item.category === "Meals") return "Meal";
  if (item.category === "Activities") return "Activity";
  return item.category;
}

function categorySelectionHeading(category: WorkspaceBookingBasketItem["category"]) {
  if (category === "Transport") return "Transport Selections";
  if (category === "Stay") return "Stay Selections";
  if (category === "Activities") return "Activity Selections";
  if (category === "Meals") return "Meal Selections";
  if (category === "Package") return "Package Selections";
  return "Trip Selections";
}

function categoryIconForSelection(category: WorkspaceBookingBasketItem["category"]) {
  if (category === "Transport") return Car;
  if (category === "Stay") return BedDouble;
  if (category === "Activities") return Mountain;
  if (category === "Meals") return Utensils;
  if (category === "Package") return PackageCheck;
  return ShoppingBag;
}

function basketSummaryIconForGroup(groupId: BasketSummaryGroupId) {
  if (groupId === "transport") return Car;
  if (groupId === "stay") return BedDouble;
  if (groupId === "activity") return Mountain;
  return PackageCheck;
}

function basketCalculationDisplay(line: BasketSummaryLine) {
  const calculation = line.calculationLabel;

  if (!calculation) return "Included in selected trip value";
  return calculation;
}

function selectionIconForItem(item: WorkspaceBookingBasketItem) {
  const label = selectionServiceLabel(item).toLowerCase();
  const text =
    `${item.category} ${item.serviceType} ${item.serviceName} ${item.serviceLabel || ""} ${item.title} ${item.selectedOptionName} ${item.description}`.toLowerCase();

  if (label.includes("creator") || text.includes("creator") || text.includes("camera")) {
    return Camera;
  }
  if (label.includes("market") || text.includes("market") || text.includes("shopping")) {
    return ShoppingBag;
  }
  if (item.category === "Meals" || label.includes("meal") || text.includes("food")) {
    return Utensils;
  }
  if (item.category === "Stay" || item.serviceType === "hotel") {
    return BedDouble;
  }
  if (item.category === "Transport" || item.serviceType === "cab" || item.serviceType === "flight") {
    return Car;
  }
  if (item.category === "Activities" || item.serviceType === "activity") {
    return Mountain;
  }

  return PackageCheck;
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
      dayDateLabel: formatBasketDayLabel(item),
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

function transportItemsFromDays(days: TiyaDayPlan[]) {
  return days.flatMap((day) =>
    (day.items || [])
      .filter((item) => item.type === "transport")
      .map((item) => ({ ...item, day: day.day, date: day.date, city: day.city }))
  );
}

function budgetLineAmount(plan: TiyaGeneratedPlan, label: string) {
  return (
    plan.budgetLines.find((line) =>
      line.label.toLowerCase().includes(label.toLowerCase())
    )?.amount || 0
  );
}

function saveTransportHandoff({
  days,
  intent,
  plan,
  selectedRoute,
  service,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute: TiyaRouteOption;
  service: "flight" | "cab" | "train" | "bus" | "self-drive" | "insurance";
}) {
  if (typeof window === "undefined") return;

  const transfers = transportItemsFromDays(days);
  const payload = {
    source: "smart-planner",
    createdAt: new Date().toISOString(),
    service,
    origin: intent.fromCity,
    destination: intent.toCity,
    departureDate: intent.startDate,
    returnDate: intent.endDate,
    travellers: {
      adults: intent.adults,
      children: intent.children,
      seniors: intent.seniors,
      total: intent.adults + intent.children + intent.seniors,
    },
    routeContext: {
      activeRouteId: selectedRoute.id,
      routeName: selectedRoute.name,
      routeType: selectedRoute.routeStyle,
      distance: selectedRoute.distance,
      duration: selectedRoute.duration,
      transportMode: intent.transportMode,
      segments: transfers.map((item) => ({
        day: item.day,
        date: item.date,
        from: item.from || item.location || item.city,
        to: item.to || item.finalDestination || intent.toCity,
        title: item.title,
        type: item.serviceType || item.type,
      })),
    },
    itineraryContext: days,
    budgetContext: {
      transportEstimate: budgetLineAmount(plan, "transport"),
      totalEstimate: plan.totalBudget,
    },
  };
  const checkoutPayload = {
    source: "smart-planner",
    trip: {
      origin: intent.fromCity,
      destination: intent.toCity,
      startDate: intent.startDate,
      endDate: intent.endDate,
      totalDays: days.length,
      title: plan.title,
      travelStyle: intent.travelStyle,
      tripType: intent.tripType,
    },
    route: payload.routeContext,
    itinerary: days,
    travellers: payload.travellers,
    selectedServices: plan.bookingModules.filter((module) => module.isHighlighted || module.readiness === "Ready"),
    budgetEstimate: {
      transport: budgetLineAmount(plan, "transport"),
      stay: budgetLineAmount(plan, "stay"),
      activity: budgetLineAmount(plan, "activit"),
      localTravel: budgetLineAmount(plan, "local"),
      totalEstimatedCost: plan.totalBudget,
    },
    quoteEstimate: {
      estimatedTotal: plan.totalBudget,
    },
  };

  window.sessionStorage.setItem("tpl_tiya_checkout_v1", JSON.stringify(checkoutPayload));
  if (service === "flight") {
    window.sessionStorage.setItem("tpl_smart_planner_flight_search_v1", JSON.stringify(payload));
  }
  if (service === "cab" || service === "self-drive") {
    window.sessionStorage.setItem("tpl_smart_planner_cab_search_v1", JSON.stringify(payload));
  }
}

function TransportPlanningEngine({
  days,
  intent,
  onApplyPlan,
  onProceedToBook,
  plan,
  selectedRoute,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  onApplyPlan: (plan: {
    affectedDays: string;
    costImpact: number;
    detail: string;
    newMode: string;
    previousMode: string;
    timeImpact: string;
    title: string;
  }) => void;
  onProceedToBook: (plan: {
    affectedDays: string;
    costImpact: number;
    detail: string;
    newMode: string;
    previousMode: string;
    timeImpact: string;
    title: string;
  }) => void;
  plan: TiyaGeneratedPlan;
  selectedRoute: TiyaRouteOption;
}) {
  const [previewPlan, setPreviewPlan] = useState<{
    affectedDays: string;
    costImpact: number;
    detail: string;
    newMode: string;
    previousMode: string;
    timeImpact: string;
    title: string;
  } | null>(null);
  const transfers = transportItemsFromDays(days);
  const transportEstimate = budgetLineAmount(plan, "transport");
  const comfortScore = selectedRoute.comfortScore || 82;
  const recommendedMode =
    intent.transportMode === "Self-drive Car"
      ? "Self Drive + Local Transfer"
      : intent.transportMode === "Flight"
        ? "Flight + Local Cab"
        : intent.transportMode === "Train"
          ? "Train + Local Cab"
          : "Flight + Local Cab";
  const affectedDays = days.length > 1
    ? `Day 1, Day ${days.length}`
    : "Day 1";
  const optionCards = [
    {
      id: "flight",
      Icon: Plane,
      title: "Flights",
      status: intent.transportMode === "Flight" || intent.transportMode === "Mixed Mode" ? "Ready" : "Recommended",
      why: "Fastest gateway into the route and protects mountain movement time.",
      data: `${intent.fromCity} → ${intent.toCity} · ${intent.startDate || "date pending"} · ${intent.adults + intent.children + intent.seniors} travellers`,
      missing: [!intent.fromCity ? "origin" : "", !intent.toCity ? "destination" : "", !intent.startDate ? "travel date" : ""].filter(Boolean),
      cost: Math.round(transportEstimate * 0.46),
      time: "-6h vs full road movement",
      comfort: "+18",
      cta: "Search Flights",
      service: "flight" as const,
    },
    {
      id: "cab",
      Icon: Car,
      title: "Cabs / Local Transfers",
      status: transfers.length ? "Ready" : "Recommended",
      why: "Useful for airport/station pickups, local movement and last-mile comfort.",
      data: `${transfers.length} required segment${transfers.length === 1 ? "" : "s"} · ${selectedRoute.name}`,
      missing: transfers.length ? [] : ["transfer segment review"],
      cost: Math.round(transportEstimate * 0.32),
      time: "Flexible local timing",
      comfort: "+10",
      cta: "Add Cab / Plan Transfers",
      service: "cab" as const,
    },
    {
      id: "self-drive",
      Icon: Fuel,
      title: "Self Drive",
      status: intent.transportMode.toLowerCase().includes("self") ? "Ready" : "Optional",
      why: "Best when route freedom matters and driver fatigue is acceptable.",
      data: `Risk: ${selectedRoute.riskLevel} · Fuel/EV stops need review · daylight driving advised`,
      missing: intent.transportMode.toLowerCase().includes("self") ? [] : ["self-drive mode not selected"],
      cost: Math.round(transportEstimate * 0.74),
      time: "+4h route flexibility",
      comfort: "-6",
      cta: "Review Self-Drive Plan",
      service: "self-drive" as const,
    },
    {
      id: "train",
      Icon: TrainFront,
      title: "Train",
      status: intent.budgetTier === "Economy" || intent.transportMode === "Train" ? "Recommended" : "Optional",
      why: "Useful for budget-sensitive origin to gateway movement.",
      data: `${intent.fromCity} → gateway city → ${intent.toCity}`,
      missing: intent.fromCity && intent.toCity ? [] : ["origin/destination"],
      cost: Math.round(transportEstimate * 0.58),
      time: "+5h vs flight",
      comfort: "-4",
      cta: "Search Train",
      service: "train" as const,
    },
    {
      id: "bus",
      Icon: Bus,
      title: "Bus",
      status: intent.budgetTier === "Economy" ? "Recommended" : "Optional",
      why: "Good for short regional legs where budget matters more than speed.",
      data: "Budget fallback for supported route segments.",
      missing: [],
      cost: Math.round(transportEstimate * 0.44),
      time: "+7h vs flight",
      comfort: "-9",
      cta: "Search Bus",
      service: "bus" as const,
    },
    {
      id: "local",
      Icon: MapPinned,
      title: "Local Transfers",
      status: transfers.length ? "Ready" : "Recommended",
      why: "Covers hotel pickups, market hops and activity transfers.",
      data: `${transfers.map((item) => item.title).slice(0, 2).join(" · ") || "Planner local movement"}`,
      missing: [],
      cost: Math.round(transportEstimate * 0.18),
      time: "Reduces local friction",
      comfort: "+8",
      cta: "Plan Transfers",
      service: "cab" as const,
    },
    {
      id: "insurance",
      Icon: ShieldCheck,
      title: "Insurance",
      status: intent.smartPreferences.includeInsurance ? "Ready" : "Optional",
      why: "Protects route delays, medical risk and weather disruption.",
      data: `${intent.toCity} · ${intent.startDate || "start date"} to ${intent.endDate || "end date"}`,
      missing: intent.endDate ? [] : ["return date"],
      cost: Math.round(plan.totalBudget * 0.025),
      time: "No travel time impact",
      comfort: "+4",
      cta: "Add Insurance",
      service: "insurance" as const,
    },
  ];
  const comparisonRows = [
    ["Flight + Cab", formatCurrency(Math.round(transportEstimate * 0.78)), "Fastest", "High", "High", "Medium", "First/last day transfer"],
    ["Self Drive", formatCurrency(Math.round(transportEstimate * 0.74)), "Slow", "Medium", selectedRoute.riskLevel, "High", "Route freedom"],
    ["Train + Cab", formatCurrency(Math.round(transportEstimate * 0.62)), "Medium", "Medium", "Medium", "Medium", "Budget balance"],
    ["Bus + Local Transfer", formatCurrency(Math.round(transportEstimate * 0.48)), "Slow", "Low", "Medium", "Low", "Budget fallback"],
  ];

  function goToReview(service: "flight" | "cab" | "train" | "bus" | "self-drive" | "insurance") {
    saveTransportHandoff({ days, intent, plan, selectedRoute, service });
    onProceedToBook({
      ...recommendedPlan,
      title: optionCards.find((card) => card.service === service)?.title || recommendedPlan.title,
    });
  }

  const recommendedPlan = {
    affectedDays,
    costImpact: Math.round(transportEstimate * 0.16),
    detail: "Use flight for the longest gateway movement and local cab for route segments while keeping scenic movement intact.",
    newMode: "Flight + Local Cab",
    previousMode: intent.transportMode || "Current transport mode",
    timeImpact: "-6h",
    title: "AI Recommended Transport Plan",
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Plane size={15} />
              Transport Planning Engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Flight & Transport Planning
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Compare flight, cab, train, bus and self-drive options before sending the route into TPL booking flows.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
            Status: Ready
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Car size={15} />
            Transport Strategy Summary
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Recommended", recommendedMode],
              ["Route", `${intent.fromCity} → ${intent.toCity}`],
              ["Transfers", `${transfers.length}`],
              ["Transport Estimate", formatCurrency(transportEstimate)],
              ["Travel Time", selectedRoute.duration || "Planner estimate"],
              ["Comfort", `${comfortScore}%`],
              ["Selected Route", selectedRoute.name],
              ["Readiness", "Ready"],
            ].map(([label, value], index) => (
              <div key={`transport-metric-${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
                <p className="mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {optionCards.map((card, index) => (
            <article key={`${card.id ?? card.title ?? "transport-option"}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 transition hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/16 bg-cyan-300/10 text-cyan-100">
                  <card.Icon size={20} />
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
                  card.status === "Ready"
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : card.status === "Missing"
                      ? "border-red-300/20 bg-red-400/10 text-red-100"
                      : "border-orange-300/20 bg-orange-400/10 text-orange-100"
                }`}>
                  {card.status}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-white">{card.title}</h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-white/68">{card.why}</p>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Data available</p>
                <p className="mt-1 text-xs font-bold leading-5 text-white/76">{card.data}</p>
              </div>
              {card.missing.length ? (
                <p className="mt-2 rounded-2xl border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100">
                  Missing: {card.missing.join(", ")}
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Cost</p>
                  <p className="mt-1 text-xs font-black text-white">{formatCurrency(card.cost)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Time</p>
                  <p className="mt-1 text-xs font-black text-white">{card.time}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Comfort</p>
                  <p className="mt-1 text-xs font-black text-white">{card.comfort}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => goToReview(card.service)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
              >
                Proceed to Book
              </button>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <GitCompareArrows size={15} />
            Transport Comparison Matrix
          </div>
          <div className="mt-3 grid gap-2">
            {comparisonRows.map(([mode, cost, time, comfort, safety, scenic, bestFor], index) => (
              <div key={`transport-comparison-${mode}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold text-white/70 md:grid-cols-7 md:items-center">
                <span className="font-black text-white">{mode}</span>
                <span>Cost: {cost}</span>
                <span>Time: {time}</span>
                <span>Comfort: {comfort}</span>
                <span>Safety: {safety}</span>
                <span>Scenic: {scenic}</span>
                <span>Best: {bestFor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <Sparkles size={15} />
              AI Recommended Transport Plan
            </div>
            <h3 className="mt-3 text-xl font-black text-white">Use flight gateway + local cab coverage</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/78">
              Use flight from {intent.fromCity || "origin"} to {intent.toCity || "destination"} or nearest gateway and local cab for destination segments.
            </p>
            <div className="mt-3 grid gap-2 text-xs font-black text-emerald-50/82">
              <span>✓ Reduces fatigue</span>
              <span>✓ Protects mountain route time</span>
              <span>✓ Improves booking readiness</span>
              <span>✓ Keeps scenic route intact</span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPlan(recommendedPlan)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)] transition hover:-translate-y-0.5"
            >
              Apply Transport Plan
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Clock size={15} />
              What Will Change Preview
            </div>
            {previewPlan ? (
              <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-white/72">
                <p>Before: {previewPlan.previousMode}</p>
                <p>After: {previewPlan.newMode}</p>
                <p>Travel time: {previewPlan.timeImpact}</p>
                <p>Cost impact: +{formatCurrency(previewPlan.costImpact)}</p>
                <p>Comfort: +18 · Safety: +12</p>
                <p>Affected days: {previewPlan.affectedDays}</p>
                <button
                  type="button"
                  onClick={() => {
                    onApplyPlan(previewPlan);
                    setPreviewPlan(null);
                  }}
                  className="mt-2 min-h-10 rounded-full border border-orange-300/28 bg-orange-400/15 px-4 text-xs font-black text-orange-100 transition hover:bg-orange-400/20"
                >
                  Confirm Impact Preview
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-white/62">
                Click Apply Transport Plan to preview before changing itinerary, route, budget, booking readiness, checkout readiness and review payload.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <PackageCheck size={15} />
            Transport Change Log
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
            Applied transport plans are logged in Recent Trip Changes with previous mode, new mode, cost impact, time impact, affected days and timestamp.
          </p>
        </div>
      </div>
    </section>
  );
}

function stayItemsFromDays(days: TiyaDayPlan[]) {
  return days.flatMap((day) =>
    (day.items || [])
      .filter((item) => item.type === "stay")
      .map((item) => ({ ...item, day: day.day, date: day.date, city: day.city }))
  );
}

function saveStayHandoff({
  days,
  intent,
  plan,
  selectedRoute,
  service,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute: TiyaRouteOption;
  service: "hotel" | "homestay" | "camp" | "premium" | "budget" | "family";
}) {
  if (typeof window === "undefined") return;

  const stays = stayItemsFromDays(days);
  const travellers = intent.adults + intent.children + intent.seniors;
  const rooms =
    stays
      .map((item) => Number(item.rooms || 0))
      .filter((roomCount) => roomCount > 0)
      .sort((a, b) => b - a)[0] || Math.max(1, Math.ceil(Math.max(1, travellers) / 2));
  const stayZones = Array.from(new Set(stays.map((item) => item.city || item.location).filter(Boolean)));
  const payload = {
    source: "smart-planner",
    createdAt: new Date().toISOString(),
    service,
    destination: intent.toCity,
    checkIn: intent.startDate,
    checkOut: intent.endDate,
    rooms,
    travellers: {
      adults: intent.adults,
      children: intent.children,
      seniors: intent.seniors,
      total: travellers,
    },
    stayZones,
    itineraryContext: days,
    budgetContext: {
      stayEstimate: budgetLineAmount(plan, "stay"),
      totalEstimate: plan.totalBudget,
    },
    routeContext: {
      activeRouteId: selectedRoute.id,
      routeName: selectedRoute.name,
      routeType: selectedRoute.routeStyle,
    },
  };
  const checkoutPayload = {
    source: "smart-planner",
    trip: {
      origin: intent.fromCity,
      destination: intent.toCity,
      startDate: intent.startDate,
      endDate: intent.endDate,
      totalDays: days.length,
      title: plan.title,
      travelStyle: intent.travelStyle,
      tripType: intent.tripType,
    },
    route: payload.routeContext,
    itinerary: days,
    travellers: payload.travellers,
    selectedHotels: stays.filter((item) => `${item.title} ${item.serviceType || ""}`.toLowerCase().includes("hotel")),
    selectedHomestays: stays.filter((item) => `${item.title} ${item.serviceType || ""}`.toLowerCase().includes("homestay")),
    selectedServices: plan.bookingModules.filter((module) => module.isHighlighted || module.readiness === "Ready"),
    budgetEstimate: {
      transport: budgetLineAmount(plan, "transport"),
      stay: budgetLineAmount(plan, "stay"),
      activity: budgetLineAmount(plan, "activit"),
      localTravel: budgetLineAmount(plan, "local"),
      totalEstimatedCost: plan.totalBudget,
    },
    quoteEstimate: {
      estimatedTotal: plan.totalBudget,
    },
  };

  window.sessionStorage.setItem("tpl_tiya_checkout_v1", JSON.stringify(checkoutPayload));
  if (service === "hotel" || service === "premium" || service === "budget" || service === "family") {
    window.sessionStorage.setItem("tpl_smart_planner_hotel_search_v1", JSON.stringify(payload));
  }
  if (service === "homestay" || service === "camp") {
    window.sessionStorage.setItem("tpl_smart_planner_homestay_search_v1", JSON.stringify(payload));
  }
}

function StayPlanningEngine({
  days,
  intent,
  onApplyPlan,
  onProceedToBook,
  plan,
  selectedRoute,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  onApplyPlan: (plan: {
    affectedDays: string;
    comfortImpact: number;
    costImpact: number;
    detail: string;
    localImpact: number;
    newSetup: string;
    previousSetup: string;
    title: string;
  }) => void;
  onProceedToBook: (plan: {
    affectedDays: string;
    comfortImpact: number;
    costImpact: number;
    detail: string;
    localImpact: number;
    newSetup: string;
    previousSetup: string;
    title: string;
  }) => void;
  plan: TiyaGeneratedPlan;
  selectedRoute: TiyaRouteOption;
}) {
  const [previewPlan, setPreviewPlan] = useState<{
    affectedDays: string;
    comfortImpact: number;
    costImpact: number;
    detail: string;
    localImpact: number;
    newSetup: string;
    previousSetup: string;
    title: string;
  } | null>(null);
  const stays = stayItemsFromDays(days);
  const stayEstimate = budgetLineAmount(plan, "stay");
  const travellers = intent.adults + intent.children + intent.seniors;
  const rooms =
    stays
      .map((item) => Number(item.rooms || 0))
      .filter((roomCount) => roomCount > 0)
      .sort((a, b) => b - a)[0] || Math.max(1, Math.ceil(Math.max(1, travellers) / 2));
  const nights =
    stays.reduce((sum, item) => sum + Number(item.nights || 0), 0) ||
    Math.max(0, days.length - 1);
  const stayZones = Array.from(new Set(stays.map((item) => item.city || item.location).filter(Boolean)));
  const recommendedStay =
    intent.stayPreference === "Homestay"
      ? "Homestay + 1 premium hotel night"
      : intent.travelStyle === "Luxury"
        ? "Premium stays + recovery hotel"
        : "Hotel + local homestay mix";
  const affectedDays = days.length > 4 ? "Day 2, Day 5" : `Day 1${days.length > 1 ? `, Day ${days.length}` : ""}`;
  const checkIn = stays[0]?.checkInDate || intent.startDate;
  const checkOut = stays[0]?.checkOutDate || intent.endDate;
  const optionCards = [
    {
      id: "hotel",
      Icon: Hotel,
      title: "Hotels",
      status: intent.stayPreference === "Hotel" || stays.some((item) => item.title.toLowerCase().includes("hotel")) ? "Ready" : "Recommended",
      why: "Best for predictable comfort, recovery and city-center access.",
      data: `${intent.toCity} · ${checkIn || "check-in pending"} to ${checkOut || "check-out pending"} · ${rooms} room${rooms === 1 ? "" : "s"} · ${travellers} traveller${travellers === 1 ? "" : "s"}`,
      missing: [!intent.toCity ? "destination" : "", !checkIn ? "check-in" : "", !checkOut ? "check-out" : ""].filter(Boolean),
      cost: Math.round(stayEstimate * 0.92),
      comfort: "+10",
      location: "Strong city access",
      cta: "Find Hotels",
      service: "hotel" as const,
    },
    {
      id: "homestay",
      Icon: BedDouble,
      title: "Homestays",
      status: intent.stayPreference === "Homestay" || stays.some((item) => item.title.toLowerCase().includes("homestay")) ? "Ready" : "Recommended",
      why: "Adds host-led local experience and better cultural fit.",
      data: `${stayZones.join(", ") || intent.toCity} · local host experience · budget-friendly stay mix`,
      missing: stayZones.length ? [] : ["stay zone"],
      cost: Math.round(stayEstimate * 0.76),
      comfort: "+4",
      location: "Local neighbourhood access",
      cta: "Find Homestays",
      service: "homestay" as const,
    },
    {
      id: "camp",
      Icon: Mountain,
      title: "Camps",
      status: selectedRoute.id === "adventure" ? "Recommended" : "Optional",
      why: "Useful for scenic or adventure-heavy segments where hotels are limited.",
      data: `${selectedRoute.name} · scenic stay fallback · route-sensitive`,
      missing: [],
      cost: Math.round(stayEstimate * 0.64),
      comfort: "-6",
      location: "High scenic value",
      cta: "Explore Camps",
      service: "camp" as const,
    },
    {
      id: "premium",
      Icon: Sparkles,
      title: "Premium Stays",
      status: intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury" ? "Ready" : "Optional",
      why: "Best after long transfers and for high-comfort recovery nights.",
      data: `Recovery night after transfer · ${selectedRoute.comfortScore}% route comfort baseline`,
      missing: [],
      cost: Math.round(stayEstimate * 1.22),
      comfort: "+16",
      location: "Best access and recovery",
      cta: "Find Premium Stays",
      service: "premium" as const,
    },
    {
      id: "budget",
      Icon: BadgeIndianRupee,
      title: "Budget Stays",
      status: intent.budgetTier === "Economy" ? "Recommended" : "Optional",
      why: "Controls trip value without changing route structure.",
      data: `${stayZones.length || 1} stay zone${stayZones.length === 1 ? "" : "s"} eligible for budget review`,
      missing: [],
      cost: Math.round(stayEstimate * 0.58),
      comfort: "-8",
      location: "Functional access",
      cta: "Find Budget Stays",
      service: "budget" as const,
    },
    {
      id: "family",
      Icon: ShieldCheck,
      title: "Family/Senior Friendly Stays",
      status: intent.travelStyle === "Family" || intent.seniors > 0 || intent.children > 0 ? "Recommended" : "Optional",
      why: "Prioritizes safer access, lower stairs, recovery and vehicle-friendly locations.",
      data: `${intent.children} children · ${intent.seniors} seniors · ${rooms} room${rooms === 1 ? "" : "s"}`,
      missing: [],
      cost: Math.round(stayEstimate * 1.05),
      comfort: "+14",
      location: "Safety-first access",
      cta: "Find Family Stays",
      service: "family" as const,
    },
  ];
  const comparisonRows = [
    ["Hotel", formatCurrency(Math.round(stayEstimate * 0.92)), "High", "Medium", "High", "High", "Recovery and city access"],
    ["Homestay", formatCurrency(Math.round(stayEstimate * 0.76)), "Medium", "High", "Medium", "Medium", "Local experience"],
    ["Camp", formatCurrency(Math.round(stayEstimate * 0.64)), "Low-Medium", "High", "Low", "Scenic", "Adventure segments"],
    ["Premium Stay", formatCurrency(Math.round(stayEstimate * 1.22)), "Very High", "Medium", "High", "High", "Comfort recovery"],
    ["Budget Stay", formatCurrency(Math.round(stayEstimate * 0.58)), "Basic", "Low-Medium", "Medium", "Functional", "Budget control"],
  ];
  const readiness = [
    ["Destination available", Boolean(intent.toCity)],
    ["Dates available", Boolean(checkIn && checkOut)],
    ["Rooms available", rooms > 0],
    ["Traveller count available", travellers > 0],
    ["Stay zones available", stayZones.length > 0],
    ["Budget available", stayEstimate > 0],
  ];
  const recommendedPlan = {
    affectedDays,
    comfortImpact: 12,
    costImpact: -Math.round(stayEstimate * 0.11),
    detail: "Use homestay for local experience and add one premium hotel night after the longest transfer.",
    localImpact: 18,
    newSetup: "Homestay + premium recovery hotel",
    previousSetup: intent.stayPreference ? `${intent.stayPreference} only` : "Current stay mix",
    title: "AI Recommended Stay Plan",
  };

  function goToReview(service: "hotel" | "homestay" | "camp" | "premium" | "budget" | "family") {
    saveStayHandoff({ days, intent, plan, selectedRoute, service });
    onProceedToBook({
      ...recommendedPlan,
      title: optionCards.find((card) => card.service === service)?.title || recommendedPlan.title,
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <BedDouble size={15} />
              Stay Planning Engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Stay Selection
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Compare hotels, homestays, camps and recovery stays before handing planner data into TPL stay flows.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
            Status: Ready
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Hotel size={15} />
            Stay Strategy Summary
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Recommended", recommendedStay],
              ["Stay Zones", stayZones.join(", ") || intent.toCity || "Pending"],
              ["Nights", `${nights}`],
              ["Rooms / Travellers", `${rooms} / ${travellers}`],
              ["Stay Estimate", formatCurrency(stayEstimate)],
              ["Comfort", `${Math.max(72, selectedRoute.comfortScore)}%`],
              ["Selected Route", selectedRoute.name],
              ["Readiness", "Ready"],
            ].map(([label, value], index) => (
              <div key={`stay-metric-${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
                <p className="mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {optionCards.map((card, index) => (
            <article key={`${card.id ?? card.title ?? "stay-option"}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 transition hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/16 bg-cyan-300/10 text-cyan-100">
                  <card.Icon size={20} />
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
                  card.status === "Ready"
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : card.status === "Missing"
                      ? "border-red-300/20 bg-red-400/10 text-red-100"
                      : "border-orange-300/20 bg-orange-400/10 text-orange-100"
                }`}>
                  {card.status}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-white">{card.title}</h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-white/68">{card.why}</p>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Planner data</p>
                <p className="mt-1 text-xs font-bold leading-5 text-white/76">{card.data}</p>
              </div>
              {card.missing.length ? (
                <p className="mt-2 rounded-2xl border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100">
                  Missing: {card.missing.join(", ")}
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Cost</p>
                  <p className="mt-1 text-xs font-black text-white">{formatCurrency(card.cost)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Comfort</p>
                  <p className="mt-1 text-xs font-black text-white">{card.comfort}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">Location</p>
                  <p className="mt-1 text-xs font-black text-white">{card.location}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => goToReview(card.service)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
              >
                Proceed to Book
              </button>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <GitCompareArrows size={15} />
            Stay Comparison Matrix
          </div>
          <div className="mt-3 grid gap-2">
            {comparisonRows.map(([type, cost, comfort, local, safety, access, bestFor], index) => (
              <div key={`stay-comparison-${type}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold text-white/70 md:grid-cols-7 md:items-center">
                <span className="font-black text-white">{type}</span>
                <span>Cost: {cost}</span>
                <span>Comfort: {comfort}</span>
                <span>Local: {local}</span>
                <span>Safety: {safety}</span>
                <span>Access: {access}</span>
                <span>Best: {bestFor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <Sparkles size={15} />
              AI Recommended Stay Plan
            </div>
            <h3 className="mt-3 text-xl font-black text-white">Homestay + premium recovery hotel</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/78">
              Use homestay for local experience and add one premium hotel night after the longest transfer.
            </p>
            <div className="mt-3 grid gap-2 text-xs font-black text-emerald-50/82">
              <span>✓ Improves recovery</span>
              <span>✓ Keeps budget controlled</span>
              <span>✓ Matches {intent.travelStyle.toLowerCase()} style</span>
              <span>✓ Supports Local Life route</span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPlan(recommendedPlan)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)] transition hover:-translate-y-0.5"
            >
              Apply Stay Plan
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Clock size={15} />
              What Will Change Preview
            </div>
            {previewPlan ? (
              <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-white/72">
                <p>Before: {previewPlan.previousSetup}</p>
                <p>After: {previewPlan.newSetup}</p>
                <p>Stay cost: {previewPlan.costImpact < 0 ? "-" : "+"}{formatCurrency(Math.abs(previewPlan.costImpact))}</p>
                <p>Comfort: +{previewPlan.comfortImpact}</p>
                <p>Local experience: +{previewPlan.localImpact}</p>
                <p>Affected days: {previewPlan.affectedDays}</p>
                <button
                  type="button"
                  onClick={() => {
                    onApplyPlan(previewPlan);
                    setPreviewPlan(null);
                  }}
                  className="mt-2 min-h-10 rounded-full border border-orange-300/28 bg-orange-400/15 px-4 text-xs font-black text-orange-100 transition hover:bg-orange-400/20"
                >
                  Confirm Impact Preview
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-white/62">
                Click Apply Stay Plan to preview before changing itinerary, budget, booking readiness, checkout readiness and review payload.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <CalendarDays size={15} />
              Day-wise Stay Mapping
            </div>
            <div className="mt-3 grid gap-2">
              {days.map((day, index) => {
                const dayStay = stays.find((item) => item.day === day.day);
                return (
                  <div key={`${day.id ?? `day-${day.day}`}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-xs font-black text-white">Day {String(day.day).padStart(2, "0")} · {day.city}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {dayStay ? `${dayStay.title} · ${dayStay.location}` : "Stay not selected"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <ShieldCheck size={15} />
              Stay Readiness Checklist
            </div>
            <div className="mt-3 grid gap-2">
              {readiness.map(([label, ready], index) => (
                <div key={`stay-readiness-${label as string}-${index}`} className={`rounded-2xl border px-3 py-2 text-xs font-black ${
                  ready
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : "border-orange-300/20 bg-orange-400/10 text-orange-100"
                }`}>
                  {ready ? "✓" : "!"} {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <PackageCheck size={15} />
            Stay Change Log
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
            Applied stay plans are logged in Recent Trip Changes with previous setup, new setup, cost impact, comfort impact, affected days and timestamp.
          </p>
        </div>
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
  onPlanChange,
  setBookingBasket,
}: WorkspaceAdvancedTabsProps) {
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [openCapability, setOpenCapability] =
    useState<WorkspaceCapabilityId>("Journey Timeline & Map");
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
  const [detailModal, setDetailModal] = useState<BookingDetailModalState>({
    itemId: "",
    open: false,
  });
  const [showTripSelections, setShowTripSelections] = useState(false);
  const [bookingProceedBlocker, setBookingProceedBlocker] = useState("");
  const [partialBookingConfirmOpen, setPartialBookingConfirmOpen] =
    useState(false);
  const [tripReadiness, setTripReadiness] =
    useState<TripReadinessSnapshot | null>(null);
  const [finalJourney, setFinalJourney] =
    useState<FinalJourneySnapshot | null>(null);
  const [pendingProtectedAction, setPendingProtectedAction] =
    useState<ProtectedWorkspaceAction | null>(null);
  const [myTripsSaveMessage, setMyTripsSaveMessage] = useState("");
  const [pendingSavedItem, setPendingSavedItem] = useState<MyTripSavedItem | null>(null);
  const [pendingRestoreSnapshot, setPendingRestoreSnapshot] =
    useState<TiyaPlannerSnapshot | null>(null);
  const [savedItems, setSavedItems] = useState<MyTripSavedItem[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [appliedRecommendationIds, setAppliedRecommendationIds] = useState<string[]>([]);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<string[]>([]);
  const [savedRecommendationIds, setSavedRecommendationIds] = useState<string[]>([]);
  const [savedItemsOpen, setSavedItemsOpen] = useState(false);
  const [savedItemToast, setSavedItemToast] = useState<{
    itemName: string;
    message: string;
  } | null>(null);
  const [pendingImpactPreview, setPendingImpactPreview] =
    useState<ItineraryImpactPreview | null>(null);
  const [pendingProceedImpactPreview, setPendingProceedImpactPreview] =
    useState<ItineraryImpactPreview | null>(null);
  const [recentTripChanges, setRecentTripChanges] = useState<
    TripChangeLogEntry[]
  >([]);
  const [selectedChangeLog, setSelectedChangeLog] =
    useState<TripChangeLogEntry | null>(null);
  const [impactSuccessMessage, setImpactSuccessMessage] = useState("");
  const [moduleActionMessage, setModuleActionMessage] = useState("");
  const [highlightImpactTarget, setHighlightImpactTarget] = useState(false);
  const intelligenceWorkspaceRef = useRef<HTMLElement | null>(null);
  const buildCanonicalWorkspacePayloadRef = useRef(buildCanonicalWorkspacePayload);
  const syncCanonicalPlannerPayloadRef = useRef(syncCanonicalPlannerPayload);
  const runProtectedWorkspaceActionRef = useRef(runProtectedWorkspaceAction);
  const performSaveItemToMyTripsRef = useRef(performSaveItemToMyTrips);
  const performRestorePlannerSnapshotRef = useRef(performRestorePlannerSnapshot);
  const applyImmediateImpactAndProceedRef = useRef(applyImmediateImpactAndProceed);
  const refreshSavedItemStateRef = useRef(refreshSavedItemState);
  const exportCurrentTripRef = useRef(exportCurrentTrip);
  const shareCurrentTripRef = useRef(shareCurrentTrip);
  const generateFinalJourneyRef = useRef(generateFinalJourney);
  const requestSaveItemToMyTripsRef = useRef(requestSaveItemToMyTrips);
  const intent = useMemo(
    () => sourceIntent ?? buildWorkspaceIntent({ preferences, fromCity, toCity }),
    [fromCity, preferences, sourceIntent, toCity]
  );
  useEffect(() => {
    buildCanonicalWorkspacePayloadRef.current = buildCanonicalWorkspacePayload;
    syncCanonicalPlannerPayloadRef.current = syncCanonicalPlannerPayload;
    runProtectedWorkspaceActionRef.current = runProtectedWorkspaceAction;
    performSaveItemToMyTripsRef.current = performSaveItemToMyTrips;
    performRestorePlannerSnapshotRef.current = performRestorePlannerSnapshot;
    applyImmediateImpactAndProceedRef.current = applyImmediateImpactAndProceed;
    refreshSavedItemStateRef.current = refreshSavedItemState;
    exportCurrentTripRef.current = exportCurrentTrip;
    shareCurrentTripRef.current = shareCurrentTrip;
    generateFinalJourneyRef.current = generateFinalJourney;
    requestSaveItemToMyTripsRef.current = requestSaveItemToMyTrips;
  });
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
  const savedItemsByType = useMemo(() => {
    const groups = new Map<string, MyTripSavedItem[]>();

    savedItemGroupOrder.forEach((group) => groups.set(group, []));
    savedItems.forEach((item) => {
      const groupName = savedItemGroupOrder.includes(item.type)
        ? item.type
        : "Other";
      groups.set(groupName, [...(groups.get(groupName) || []), item]);
    });

    return savedItemGroupOrder
      .map((group) => ({ group, items: groups.get(group) || [] }))
      .filter(({ items }) => items.length > 0);
  }, [savedItems]);
  const basketSyncSignature = useMemo(
    () =>
      bookingBasket
        .map((item) => `${item.id}:${item.sourceItemId || ""}:${item.estimatedTotal || item.price || 0}`)
        .join("|"),
    [bookingBasket]
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

  useEffect(() => {
    function openTripSelections() {
      if (bookingBasket.length < 1) {
        setBookingProceedBlocker(
          "Please add at least one item to booking before continuing."
        );
        showJourneyControlMessage(
          "Please add at least one item to booking before continuing."
        );
        return;
      }

      setShowTripSelections(true);
      setBookingProceedBlocker("");
      window.setTimeout(() => {
        document
          .getElementById("booking-basket-checkout")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }

    window.addEventListener("tpl:open-trip-selections", openTripSelections);
    if (
      window.sessionStorage.getItem("tpl_open_trip_selections_after_restore") ===
      "true"
    ) {
      window.sessionStorage.removeItem("tpl_open_trip_selections_after_restore");
      openTripSelections();
    }

    return () => {
      window.removeEventListener("tpl:open-trip-selections", openTripSelections);
    };
  }, [bookingBasket.length, tripReadiness]);

  useEffect(() => {
    syncCanonicalPlannerPayloadRef.current({ nextBasket: bookingBasket });
  }, [basketSyncSignature, bookingBasket]);

  useEffect(() => {
    function updateTripReadiness(event: Event) {
      const snapshot = (event as CustomEvent<TripReadinessSnapshot>).detail;

      if (!snapshot || typeof snapshot.totalDays !== "number") return;
      setTripReadiness(snapshot);
      saveWorkspacePayload({
        ...buildCanonicalWorkspacePayloadRef.current(plan),
        dayStatuses: snapshot.dayStatuses,
        finalizedDayIds: snapshot.finalizedDayIds,
        finalizedDayNumbers: snapshot.finalizedDayNumbers,
        finalizedDays: snapshot.finalizedDays,
      });
    }

    window.addEventListener(
      "tpl:journey-readiness-update",
      updateTripReadiness
    );

    return () => {
      window.removeEventListener(
        "tpl:journey-readiness-update",
        updateTripReadiness
      );
    };
  }, [plan]);

  useEffect(() => {
    function logFinalizedDay(event: Event) {
      const detail = (
        event as CustomEvent<{ dayId?: string; dayNumber?: number; title?: string }>
      ).detail;
      const dayNumber = detail?.dayNumber || 0;
      const change: TripChangeLogEntry = {
        actionType: "Day finalized and added to booking",
        affectedDays: dayNumber ? [dayNumber] : [],
        appliedAt: new Date().toISOString(),
        costDelta: 0,
        diffs: [],
        module: "Journey Timeline",
        riskDelta: 0,
        summary: dayNumber
          ? `Day ${dayNumber} finalized and added to booking.`
          : "Itinerary day finalized and added to booking.",
        title: dayNumber
          ? `Day ${dayNumber} finalized and added to booking.`
          : "Day finalized and added to booking.",
      };

      setRecentTripChanges((current) => {
        const next = [change, ...current].slice(0, 8);
        syncCanonicalPlannerPayloadRef.current({ nextChangeLog: next });
        return next;
      });
    }

    window.addEventListener("tpl:itinerary-day-finalized", logFinalizedDay);
    return () => {
      window.removeEventListener("tpl:itinerary-day-finalized", logFinalizedDay);
    };
  }, []);

  useEffect(() => {
    function logAddedBookingItem(event: Event) {
      const detail = (
        event as CustomEvent<{
          costDelta?: number;
          dayId?: string;
          dayNumber?: number;
          itemId?: string;
          title?: string;
        }>
      ).detail;
      const dayNumber = detail?.dayNumber || 0;
      const itemTitle = detail?.title || "Itinerary item";
      const change: TripChangeLogEntry = {
        actionType: "Booking item added",
        affectedDays: dayNumber ? [dayNumber] : [],
        appliedAt: new Date().toISOString(),
        costDelta: Number(detail?.costDelta || 0),
        diffs: [
          {
            label: "Booking basket",
            previousValue: "Not selected",
            nextValue: itemTitle,
          },
        ],
        id: `booking-add-${detail?.itemId || itemTitle}-${Date.now()}`,
        module: "Journey Timeline",
        riskDelta: 0,
        summary: dayNumber
          ? `${itemTitle} added to Day ${dayNumber} booking basket.`
          : `${itemTitle} added to booking basket.`,
        title: "Booking item added",
      };

      setRecentTripChanges((current) => {
        const next = [change, ...current].slice(0, 8);
        syncCanonicalPlannerPayloadRef.current({ nextChangeLog: next });
        return next;
      });
    }

    window.addEventListener("tpl:itinerary-item-added-to-booking", logAddedBookingItem);
    return () => {
      window.removeEventListener("tpl:itinerary-item-added-to-booking", logAddedBookingItem);
    };
  }, []);

  useEffect(() => {
    if (!pendingProtectedAction || !isAuthenticated || !user) return;
    const action = pendingProtectedAction;
    setPendingProtectedAction(null);
    runProtectedWorkspaceActionRef.current(action);
  }, [pendingProtectedAction, isAuthenticated, user]);

  useEffect(() => {
    function continuePartialBooking() {
      runProtectedWorkspaceActionRef.current("continue");
    }

    window.addEventListener(
      "tpl:continue-partial-trip-booking",
      continuePartialBooking
    );
    return () => {
      window.removeEventListener(
        "tpl:continue-partial-trip-booking",
        continuePartialBooking
      );
    };
  }, [isAuthenticated, user, bookingBasket.length, tripReadiness]);

  useEffect(() => {
    if (!pendingSavedItem || !isAuthenticated || !user) return;
    const item = pendingSavedItem;
    setPendingSavedItem(null);
    performSaveItemToMyTripsRef.current(item);
  }, [pendingSavedItem, isAuthenticated, user]);

  useEffect(() => {
    if (!pendingRestoreSnapshot || !isAuthenticated || !user) return;
    const snapshotToRestore = pendingRestoreSnapshot;
    const timer = window.setTimeout(() => {
      setPendingRestoreSnapshot(null);
      performRestorePlannerSnapshotRef.current(snapshotToRestore);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pendingRestoreSnapshot, isAuthenticated, user]);

  useEffect(() => {
    if (!pendingProceedImpactPreview || !isAuthenticated || !user) return;
    const preview = pendingProceedImpactPreview;
    const timer = window.setTimeout(() => {
      setPendingProceedImpactPreview(null);
      applyImmediateImpactAndProceedRef.current(preview);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pendingProceedImpactPreview, isAuthenticated, user]);

  useEffect(() => {
    refreshSavedItemStateRef.current();
  }, [isAuthenticated, user?.id, user?.mobile, selectedRoute.id, intent.startDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(RECOMMENDATION_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const tripKey = `${intent.fromCity}-${intent.toCity}-${intent.startDate}-${selectedRoute.id}`;
      const state = parsed?.[tripKey] || {};

      setAppliedRecommendationIds(
        Array.isArray(state.applied) ? state.applied : []
      );
      setDismissedRecommendationIds(
        Array.isArray(state.dismissed) ? state.dismissed : []
      );
      setSavedRecommendationIds(
        Array.isArray(state.saved) ? state.saved : []
      );
    } catch {
      setAppliedRecommendationIds([]);
      setDismissedRecommendationIds([]);
      setSavedRecommendationIds([]);
    }
  }, [intent.fromCity, intent.startDate, intent.toCity, selectedRoute.id]);

  useEffect(() => {
    function resumeExportShareAfterLogin() {
      if (window.sessionStorage.getItem("tpl_pending_export_share_after_login") !== "true") {
        return;
      }

      window.sessionStorage.removeItem("tpl_pending_export_share_after_login");
      window.setTimeout(() => {
        window.dispatchEvent(new Event("tpl:open-itinerary-action-center"));
      }, 0);
    }

    window.addEventListener(AUTH_UPDATED_EVENT, resumeExportShareAfterLogin);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, resumeExportShareAfterLogin);
    };
  }, []);

  useEffect(() => {
    function saveFromJourneyControl() {
      runProtectedWorkspaceActionRef.current("save");
    }

    function savePlannerItemFromModule(event: Event) {
      const item = (event as CustomEvent<MyTripSavedItem>).detail;
      if (!item?.id || !item.title) return;
      requestSaveItemToMyTripsRef.current({
        ...item,
        savedAt: item.savedAt || new Date().toISOString(),
      });
    }

    function exportFromJourneyControl() {
      void exportCurrentTripRef.current();
    }

    function shareFromJourneyControl() {
      void shareCurrentTripRef.current();
    }

    function generateFromJourneyControl() {
      generateFinalJourneyRef.current();
    }

    function openExportShareFromSidebar() {
      runProtectedWorkspaceActionRef.current("exportShare");
    }

    function proceedToBookFromModule() {
      runProtectedWorkspaceActionRef.current("continue");
    }

    function updateFinalJourneyState(event: Event) {
      const status = (
        event as CustomEvent<{ status?: "pending" | "generated" | "stale" }>
      ).detail?.status;

      if (status === "stale" || status === "pending") {
        setFinalJourney(null);
      }
    }

    window.addEventListener("tpl:save-current-trip-to-my-trips", saveFromJourneyControl);
    window.addEventListener("tpl:save-planner-item-to-my-trips", savePlannerItemFromModule);
    window.addEventListener("tpl:export-current-trip", exportFromJourneyControl);
    window.addEventListener("tpl:share-current-trip", shareFromJourneyControl);
    window.addEventListener("tpl:generate-final-journey", generateFromJourneyControl);
    window.addEventListener("tpl:open-export-share", openExportShareFromSidebar);
    window.addEventListener("tpl:proceed-to-book", proceedToBookFromModule);
    window.addEventListener("tpl:final-journey-state", updateFinalJourneyState);

    return () => {
      window.removeEventListener(
        "tpl:save-current-trip-to-my-trips",
        saveFromJourneyControl
      );
      window.removeEventListener("tpl:save-planner-item-to-my-trips", savePlannerItemFromModule);
      window.removeEventListener("tpl:export-current-trip", exportFromJourneyControl);
      window.removeEventListener("tpl:share-current-trip", shareFromJourneyControl);
      window.removeEventListener(
        "tpl:generate-final-journey",
        generateFromJourneyControl
      );
      window.removeEventListener("tpl:open-export-share", openExportShareFromSidebar);
      window.removeEventListener("tpl:proceed-to-book", proceedToBookFromModule);
      window.removeEventListener(
        "tpl:final-journey-state",
        updateFinalJourneyState
      );
    };
  }, [isAuthenticated, user, bookingBasket, tripReadiness, finalJourney]);

  function handleScenarioSelect(scenario: TiyaRouteScenario) {
    setSelectedScenarioId(scenario.id);
    setHasUnsavedChanges(true);
    setModuleActionMessage(`${scenario.name} is now selected for comparison.`);
  }

  function showModuleActionMessage(message: string) {
    setModuleActionMessage(message);
    setImpactSuccessMessage("");
  }

  function openPreparedModuleAction(actionName: string) {
    showModuleActionMessage(`${actionName} is being prepared for this trip.`);
  }

  function openProtectedModuleAction(actionName: string) {
    if (!isAuthenticated || !user) {
      showModuleActionMessage(`Login required to ${actionName.toLowerCase()}.`);
      openLoginModal({ accountType: "personal", intent: "ai" });
      return;
    }

    showModuleActionMessage(`${actionName} is being prepared for this trip.`);
  }

  function openModuleImpactPreview({
    applyChange,
    bookingAffected = bookingBasket.length > 0,
    changes,
    costDelta = 0,
    severity = "minor",
    summary,
    title,
  }: {
    applyChange?: () => void;
    bookingAffected?: boolean;
    changes: ItineraryImpactDiff[];
    costDelta?: number;
    severity?: ItineraryImpactPreview["severity"];
    summary: string;
    title: string;
  }) {
    setModuleActionMessage("");
    setPendingImpactPreview({
      applyChange,
      bookingAffected,
      costDelta,
      diffs: changes,
      id: `impact-${Date.now()}`,
      impactItems: changes.map(
        (change) =>
          `${change.label}: ${change.previousValue} → ${change.nextValue}`
      ),
      severity,
      summary,
      title,
    });
  }

  function handleScenarioMerge(scenario: TiyaRouteScenario) {
    openModuleImpactPreview({
      changes: [
        {
          label: "Scenario highlights",
          previousValue: selectedScenarioId || "Base scenario",
          nextValue: scenario.name,
        },
        {
          label: "Route profile",
          previousValue: selectedRoute.name,
          nextValue: scenario.routeSummary,
        },
        {
          label: "Booking selections",
          previousValue: "Current selections",
          nextValue: "Review recommended",
        },
      ],
      summary: scenario.tradeOffNote,
      title: `${scenario.name} Merge Preview`,
    });
  }

  function showJourneyControlMessage(message: string) {
    window.dispatchEvent(
      new CustomEvent("tpl:journey-control-message", {
        detail: { message },
      })
    );
  }

  function setItineraryActionOperation(running: boolean) {
    window.dispatchEvent(
      new CustomEvent("tpl:itinerary-action-operation", {
        detail: { running },
      })
    );
  }

  function buildFinalJourneySnapshot(): FinalJourneySnapshot {
    const now = new Date().toISOString();
    const tripName = `${intent.fromCity || fromCity} to ${
      intent.toCity || toCity
    } ${selectedRoute.name}`;
    const travellers = Math.max(
      1,
      (intent.adults || 0) + (intent.children || 0) + (intent.seniors || 0)
    );

    return {
      tripId: finalJourney?.tripId || `final-journey-${Date.now()}`,
      tripName,
      origin: intent.fromCity || fromCity,
      destination: intent.toCity || toCity,
      startDate: intent.startDate,
      endDate: intent.endDate,
      durationDays: plan.days.length,
      travellers,
      finalizedDays: tripReadiness?.finalizedDays || 0,
      dayWiseItinerary: plan.days,
      selectedItems: bookingBasket,
      estimatedTripValue: grandTotal,
      priceSummary: {
        selectedItems: bookingBasket.length,
        subtotal: basketSubtotal,
        taxesAndFees,
        total: grandTotal,
        categories: basketSummaryGroups.map((group) => ({
          id: group.id,
          title: group.title,
          itemCount: group.lines.length,
          total: group.total,
        })),
      },
      notes: tripNotes,
      generatedAt: now,
      status: "generated",
    };
  }

  function activeMyTripId() {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(MY_TRIPS_ACTIVE_TRIP_ID_KEY) || "";
  }

  function findCurrentMyTrip() {
    if (!user) return null;
    const activeTrip = loadMyTripById(activeMyTripId());
    if (activeTrip && myTripOwnerKey(activeTrip.owner) === myTripOwnerKey(user)) {
      return activeTrip;
    }

    return loadMyTrips(user).find((trip) => {
      const payload = trip.workspacePayload;
      return (
        payload?.routeId === selectedRoute.id &&
        trip.origin === (intent.fromCity || fromCity) &&
        trip.destination === (intent.toCity || toCity) &&
        trip.startDate === intent.startDate
      );
    }) || null;
  }

  function refreshSavedItemState() {
    const currentTrip = findCurrentMyTrip();
    const nextItems = currentTrip?.savedItems || [];
    setSavedItems(nextItems);
    setSavedItemIds(nextItems.map((item) => item.id));
  }

  function generateFinalJourney() {
    const allFinalized =
      Boolean(tripReadiness?.allFinalized) ||
      (tripReadiness?.totalDays
        ? tripReadiness.finalizedDays === tripReadiness.totalDays
        : false);

    if (!allFinalized) {
      showJourneyControlMessage("Please finalize all days before generating final journey.");
      window.dispatchEvent(
        new CustomEvent("tpl:final-journey-state", {
          detail: { status: "pending" },
        })
      );
      return;
    }

    const generatedJourney = buildFinalJourneySnapshot();
    setFinalJourney(generatedJourney);
    showJourneyControlMessage("Your itinerary is ready for export, sharing, saving, or booking.");
    window.dispatchEvent(
      new CustomEvent("tpl:final-journey-state", {
        detail: {
          status: "generated",
          generatedAt: generatedJourney.generatedAt,
        },
      })
    );
  }

  function buildCurrentTripSnapshot(): MyTripSnapshot | null {
    if (!user) return null;
    const now = new Date().toISOString();
    const existingTrip = findCurrentMyTrip();
    const pendingStatusById = new Map(
      (tripReadiness?.pendingDays ?? []).map((day) => [day.id, day.status])
    );
    const allFinalized =
      Boolean(tripReadiness?.allFinalized) ||
      (tripReadiness?.totalDays
        ? tripReadiness.finalizedDays === tripReadiness.totalDays
        : false);
    const tripStatus: MyTripStatus = allFinalized
      ? bookingBasket.length > 0
        ? "Booking Ready"
        : "Finalized"
      : plan.days.length > 0
        ? "Generated"
        : "Draft";
    const workspacePayload = {
      routeId: selectedRoute.id,
      selectedRoute,
      routeOptions: plan.routeOptions,
      tripIntent: intent,
      generatedPlan: plan,
      generatedAt: now,
      source: "route-intelligence" as const,
    };
    const dayStatuses = Object.fromEntries(
      plan.days.map((day) => [
        day.id,
        pendingStatusById.get(day.id) || "FINALIZED",
      ])
    );
    const tripName = `${intent.fromCity || fromCity} to ${
      intent.toCity || toCity
    } ${selectedRoute.name}`;

    return {
      id: existingTrip?.id || `trip-${Date.now()}`,
      tripName,
      origin: intent.fromCity || fromCity,
      destination: intent.toCity || toCity,
      startDate: intent.startDate,
      endDate: intent.endDate,
      duration: `${plan.days.length} Day${plan.days.length === 1 ? "" : "s"}`,
      travellerCount: Math.max(
        1,
        (intent.adults || 0) + (intent.children || 0) + (intent.seniors || 0)
      ),
      selectedItemsCount: bookingBasket.length,
      estimatedTripValue: grandTotal,
      status: tripStatus,
      createdAt: existingTrip?.createdAt || now,
      updatedAt: now,
      owner: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
      },
      workspacePayload,
      itineraryDays: plan.days,
      dayStatuses,
      selectedTripItems: bookingBasket,
      savedItems: existingTrip?.savedItems || [],
      notes: tripNotes.personal || tripNotes.localTips || "",
      generatedJourneyData: finalJourney ?? plan,
    };
  }

  function buildCanonicalWorkspacePayload(
    nextPlan: TiyaGeneratedPlan = plan
  ) {
    return {
      dayStatuses: tripReadiness?.dayStatuses,
      finalizedDayIds: tripReadiness?.finalizedDayIds || [],
      finalizedDayNumbers: tripReadiness?.finalizedDayNumbers || [],
      finalizedDays: tripReadiness?.finalizedDays || 0,
      routeId: selectedRoute.id,
      selectedRoute,
      routeOptions: nextPlan.routeOptions,
      tripIntent: intent,
      generatedPlan: nextPlan,
      generatedAt: new Date().toISOString(),
      source: "route-intelligence" as const,
    };
  }

  function broadcastPlannerRefresh() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
    window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
    window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
  }

  function syncCanonicalPlannerPayload({
    nextBasket = bookingBasket,
    nextChangeLog = recentTripChanges,
    nextPlan = plan,
    nextSavedItems = savedItems,
  }: {
    nextBasket?: WorkspaceBookingBasketItem[];
    nextChangeLog?: TripChangeLogEntry[];
    nextPlan?: TiyaGeneratedPlan;
    nextSavedItems?: MyTripSavedItem[];
  } = {}) {
    const workspacePayload = buildCanonicalWorkspacePayload(nextPlan);
    saveWorkspacePayload(workspacePayload);

    const reviewPayload = buildSmartPlannerReviewPayload({
      bookingBasket: nextBasket,
      intent,
      notes: tripNotes,
      plan: nextPlan,
      plannerAudit: {
        bookingConfidenceScore: journeyStatus.bookingReadiness,
        finalVerdict:
          journeyStatus.bookingReadiness >= 82
            ? "Ready To Book"
            : journeyStatus.bookingReadiness >= 58
              ? "Needs Review"
              : "Not Recommended",
        healthScore: tripHealth.overallScore,
        readinessScore: journeyStatus.bookingReadiness,
      },
      savedItems: nextSavedItems,
      selectedRoute,
    });

    if (reviewPayload) {
      (reviewPayload as typeof reviewPayload & {
        finalizedDayIds?: string[];
        finalizedDayNumbers?: number[];
        appliedRecommendationIds?: string[];
        savedRecommendationIds?: string[];
        dismissedRecommendationIds?: string[];
      }).finalizedDayIds = tripReadiness?.finalizedDayIds || [];
      (reviewPayload as typeof reviewPayload & {
        finalizedDayIds?: string[];
        finalizedDayNumbers?: number[];
        appliedRecommendationIds?: string[];
        savedRecommendationIds?: string[];
        dismissedRecommendationIds?: string[];
      }).finalizedDayNumbers = tripReadiness?.finalizedDayNumbers || [];
      (reviewPayload as typeof reviewPayload & {
        appliedRecommendationIds?: string[];
        savedRecommendationIds?: string[];
        dismissedRecommendationIds?: string[];
      }).appliedRecommendationIds = appliedRecommendationIds;
      (reviewPayload as typeof reviewPayload & {
        appliedRecommendationIds?: string[];
        savedRecommendationIds?: string[];
        dismissedRecommendationIds?: string[];
      }).savedRecommendationIds = savedRecommendationIds;
      (reviewPayload as typeof reviewPayload & {
        appliedRecommendationIds?: string[];
        savedRecommendationIds?: string[];
        dismissedRecommendationIds?: string[];
      }).dismissedRecommendationIds = dismissedRecommendationIds;
      reviewPayload.changeHistory = {
        transparentUpdates: nextChangeLog.map((change) => ({
          appliedAt: change.appliedAt,
          summary: change.summary,
          title: change.title,
        })),
      };
      persistSmartPlannerReviewPayload(reviewPayload);
    }
    if (user) {
      const existingTrip = findCurrentMyTrip();
      const now = new Date().toISOString();
      const travellerCount = Math.max(
        1,
        (intent.adults || 0) + (intent.children || 0) + (intent.seniors || 0)
      );
      const estimatedTripValue =
        nextBasket.reduce(
          (sum, item) =>
            sum + Number(item.estimatedTotal ?? item.estimatedPrice ?? item.price ?? 0),
          0
        ) || nextPlan.totalBudget;

      saveMyTrip({
        id: existingTrip?.id || `trip-${Date.now()}`,
        tripName:
          existingTrip?.tripName ||
          `${intent.fromCity || fromCity} to ${intent.toCity || toCity} ${selectedRoute.name}`,
        origin: intent.fromCity || fromCity,
        destination: intent.toCity || toCity,
        startDate: intent.startDate,
        endDate: intent.endDate,
        duration: `${nextPlan.days.length} Day${nextPlan.days.length === 1 ? "" : "s"}`,
        travellerCount,
        selectedItemsCount: nextBasket.length,
        estimatedTripValue,
        status:
          (tripReadiness?.finalizedDays || 0) > 0 && nextBasket.length > 0
            ? "Booking Ready"
            : (tripReadiness?.finalizedDays || 0) > 0
              ? "Finalized"
              : "Generated",
        createdAt: existingTrip?.createdAt || now,
        updatedAt: now,
        owner: {
          id: user.id,
          mobile: user.mobile,
          email: user.email,
        },
        workspacePayload,
        itineraryDays: nextPlan.days,
        dayStatuses:
          tripReadiness?.dayStatuses ||
          existingTrip?.dayStatuses ||
          Object.fromEntries(nextPlan.days.map((day) => [day.id, "PLANNING"])),
        selectedTripItems: nextBasket,
        savedItems: nextSavedItems,
        expertRequests: existingTrip?.expertRequests || [],
        checklist: existingTrip?.checklist || {},
        notes: tripNotes.personal || tripNotes.localTips || existingTrip?.notes || "",
        generatedJourneyData: {
          ...nextPlan,
          selectedTripItems: nextBasket,
        },
      });
    }
    broadcastPlannerRefresh();
    return { reviewPayload, workspacePayload };
  }

  function performSaveToMyTrips() {
    const tripSnapshot = buildCurrentTripSnapshot();
    if (!tripSnapshot) return;
    setItineraryActionOperation(true);
    try {
      saveMyTrip(tripSnapshot);
      syncCanonicalPlannerPayload();
      setMyTripsSaveMessage("Trip saved to My Trips");
      showJourneyControlMessage("Trip saved to My Trips.");
      refreshSavedItemState();
    } finally {
      setItineraryActionOperation(false);
    }
  }

  function performSaveItemToMyTrips(item: MyTripSavedItem) {
    const tripSnapshot = buildCurrentTripSnapshot();
    if (!tripSnapshot) return;
    const existingItems = tripSnapshot.savedItems || [];
    const nextItems = [
      item,
      ...existingItems.filter((savedItem) => savedItem.id !== item.id),
    ];
    const nextTrip = {
      ...tripSnapshot,
      savedItems: nextItems,
      updatedAt: new Date().toISOString(),
    };

    const savedTrip = saveMyTrip(nextTrip);
    const normalizedItems = savedTrip.savedItems || nextItems;
    const bookmarkChange: TripChangeLogEntry = {
      actionType: "Bookmark saved",
      affectedDays: [],
      appliedAt: new Date().toISOString(),
      costDelta: Number(item.estimatedCost || 0),
      diffs: [
        {
          label: "My Trips bookmark",
          previousValue: "Not saved",
          nextValue: item.title,
        },
      ],
      id: `bookmark-save-${item.id}-${Date.now()}`,
      module: item.sourceModule || "Workspace",
      riskDelta: 0,
      summary: `${item.title} saved to My Trips bookmarks.`,
      title: "Bookmark saved",
    };
    const nextChangeLog = [bookmarkChange, ...recentTripChanges].slice(0, 8);
    setSavedItems(normalizedItems);
    setSavedItemIds(normalizedItems.map((savedItem) => savedItem.id));
    setRecentTripChanges(nextChangeLog);
    syncCanonicalPlannerPayload({
      nextChangeLog,
      nextBasket: tripSnapshot.selectedTripItems,
      nextSavedItems: normalizedItems,
    });
    setMyTripsSaveMessage("Saved to My Trips");
    setSavedItemToast({
      itemName: item.title,
      message: "Saved to My Trips",
    });
    if (item.type === "Creators") {
      const creator = plan.creatorPicks.find(
        (pick) => `creator:${pick.id}` === item.id
      );
      if (creator) {
        logCreatorAction({
          action: "Saved creator spot",
          creator,
          previousValue: "Not bookmarked",
          nextValue: creator.creatorName,
          summary: `Saved creator spot: ${creator.creatorName}`,
        });
      }
    }
    showJourneyControlMessage(`Saved to My Trips: ${item.title}`);
  }

  function requestSaveItemToMyTrips(item: MyTripSavedItem) {
    if (!isAuthenticated || !user) {
      setPendingSavedItem(item);
      setSavedItemToast(null);
      showJourneyControlMessage("Login required to save this item to My Trips.");
      openLoginModal({ accountType: "personal", intent: "ai" });
      return;
    }

    performSaveItemToMyTrips(item);
  }

  function removeSavedItemFromCurrentTrip(savedItemId: string) {
    const currentTrip = findCurrentMyTrip();
    if (!currentTrip || !user) return;
    const removedItem = (currentTrip.savedItems || []).find(
      (item) => item.id === savedItemId
    );
    const nextTrip = removeSavedItemFromMyTrip(user, currentTrip.id, savedItemId);
    const nextItems = nextTrip?.savedItems || [];

    setSavedItems(nextItems);
    setSavedItemIds(nextItems.map((item) => item.id));
    syncCanonicalPlannerPayload({
      nextBasket: nextTrip?.selectedTripItems || bookingBasket,
      nextPlan: nextTrip?.workspacePayload.generatedPlan || plan,
      nextSavedItems: nextItems,
    });
    setSavedItemToast({
      itemName: removedItem?.title || "Saved item",
      message: "Removed from My Trips",
    });
    setMyTripsSaveMessage("Saved item removed");
  }

  function localLifeSavedItem(product: TiyaLocalMarketPick): MyTripSavedItem {
    return {
      id: `local-life:${product.id}`,
      type: "Local Life",
      title: product.productName,
      subtitle: product.specialtyLabel,
      category: "Local Life",
      sourceModule: "Local Life",
      destination: intent.toCity || toCity,
      city: product.localRegion,
      day: "Flexible",
      time: "Evening",
      estimatedCost:
        product.priceRange
          .match(/\d[\d,]*/g)
          ?.map((value) => Number(value.replace(/,/g, "")))
          .filter((value) => Number.isFinite(value))[0] || undefined,
      metadata: {
        authenticityBadge: product.authenticityBadge,
        priceRange: product.priceRange,
        routeRelevance: product.routeRelevance,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function recommendationSavedItem(recommendationId: string): MyTripSavedItem | null {
    const recommendation = recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) return null;

    return {
      id: `recommendation:${recommendation.id}`,
      type: "Recommendations",
      title: recommendation.title,
      subtitle: recommendation.impactSummary,
      category: recommendation.category === "Local Market" ? "Local Life" : recommendation.category,
      sourceModule: "Smart Travel Recommendations",
      destination: intent.toCity || toCity,
      day: recommendation.affectedDay,
      estimatedCost: recommendation.costImpact,
      metadata: {
        confidenceScore: recommendation.confidenceScore,
        priority: recommendation.priority,
        reason: recommendation.reason,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function creatorSavedItem(creator: TiyaCreatorPick): MyTripSavedItem {
    return {
      id: `creator:${creator.id}`,
      type: "Creators",
      title: creator.creatorName,
      subtitle: creator.specialty,
      category: "Creator",
      sourceModule: "Creator Recommendations",
      destination: creator.destination,
      city: creator.destination,
      day: "Flexible",
      time: "Golden hour",
      metadata: {
        handle: creator.handle,
        routeFit: creator.routeFit,
        engagementScore: creator.engagementScore,
        suggestedStopover: creator.suggestedStopover,
        tags: creator.tags,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function creatorTargetDay(creator: TiyaCreatorPick) {
    const preferredIndex = creator.id.includes("food")
      ? 0
      : creator.id.includes("route")
        ? 1
        : Math.min(1, Math.max(0, plan.days.length - 1));

    return plan.days[preferredIndex] || plan.days[0];
  }

  function creatorTargetTime(creator: TiyaCreatorPick) {
    if (creator.id.includes("food")) return "Food Window";
    if (creator.id.includes("route")) return "Scenic Route Segment";
    return "Evening";
  }

  function creatorTimelineItem(creator: TiyaCreatorPick) {
    const targetDay = creatorTargetDay(creator);
    const time = creatorTargetTime(creator);

    return {
      id: `creator-stop-${creator.id}`,
      time,
      title: creator.creatorName,
      location: creator.suggestedStopover || creator.destination,
      type: "activity" as const,
      category: "Activities" as const,
      serviceType: "Creator Experience",
      description: `${creator.specialty}. ${creator.recommendationNote}`,
      date: targetDay?.date,
      travellers: Math.max(1, plan.travellerCount || 1),
      unitPrice: 0,
      priceBasis: "fixed" as const,
      displayPriceLabel: "Included creator stop",
      price: 0,
      currency: "INR" as const,
      providerName: "TPL Creators",
      detailSummary: `Creator stop added from Creator Recommendations with ${creator.routeFit}% route match.`,
      details: {
        creator: creator.creatorName,
        handle: creator.handle,
        routeFit: `${creator.routeFit}%`,
        engagement: creator.engagementScore,
        tags: creator.tags,
      },
      bookingStatus: "selected" as const,
    };
  }

  function creatorBasketItem(creator: TiyaCreatorPick): WorkspaceBookingBasketItem | null {
    const targetDay = creatorTargetDay(creator);
    if (!targetDay) return null;
    const item = creatorTimelineItem(creator);

    return {
      id: `creator-basket-${creator.id}`,
      sourceItemId: item.id,
      dayId: targetDay.id,
      day: targetDay.day,
      dayLabel: `Day ${targetDay.day}`,
      category: "Activities",
      serviceType: "activity",
      serviceLabel: "Creator Experience",
      serviceName: "Activities / Experiences",
      selectedOptionName: creator.creatorName,
      title: creator.creatorName,
      description: item.description || creator.specialty,
      dayRange: `Day ${targetDay.day}`,
      from: targetDay.city,
      to: creator.suggestedStopover || creator.destination,
      city: creator.destination,
      date: targetDay.date,
      startDate: targetDay.date,
      endDate: targetDay.date,
      travellers: Math.max(1, plan.travellerCount || 1),
      quantity: 1,
      time: item.time,
      meta: `${item.time} · ${creator.destination}`,
      unitPrice: 0,
      priceBasis: "fixed",
      displayPriceLabel: "Included creator stop",
      estimatedPrice: 0,
      price: 0,
      estimatedTotal: 0,
      currency: "INR",
      providerName: "TPL Creators",
      detailSummary: item.detailSummary,
      details: item.details,
      status: "selected",
      bookingStatus: "selected",
    };
  }

  function persistCreatorTripUpdate(
    nextPlan: TiyaGeneratedPlan,
    nextBasket: WorkspaceBookingBasketItem[]
  ) {
    syncCanonicalPlannerPayload({ nextBasket, nextPlan });
    const tripSnapshot = buildCurrentTripSnapshot();
    if (!tripSnapshot) return;
    const now = new Date().toISOString();
    saveMyTrip({
      ...tripSnapshot,
      updatedAt: now,
      estimatedTripValue: nextPlan.totalBudget,
      itineraryDays: nextPlan.days,
      selectedTripItems: nextBasket,
      selectedItemsCount: nextBasket.length,
      workspacePayload: {
        ...tripSnapshot.workspacePayload,
        generatedPlan: nextPlan,
      },
      generatedJourneyData: {
        ...nextPlan,
        selectedTripItems: nextBasket,
      },
    });
  }

  function logCreatorAction({
    action,
    creator,
    nextValue,
    previousValue,
    summary,
  }: {
    action: string;
    creator: TiyaCreatorPick;
    nextValue: string;
    previousValue: string;
    summary: string;
  }) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Creator spot",
          previousValue,
          nextValue,
        },
      ],
      id: `creator-${action.toLowerCase().replace(/\s+/g, "-")}-${creator.id}-${Date.now()}`,
      impactItems: [
        `Creator spot: ${previousValue} → ${nextValue}`,
        `Source: Creator Recommendations`,
      ],
      severity: "minor",
      summary,
      title: `${action}: ${creator.creatorName}`,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
  }

  function handleExpertRequestSaved(payload: TiyaExpertLeadPayload) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Expert review",
          previousValue: "Not requested",
          nextValue: "Requested",
        },
        {
          label: "Contact mode",
          previousValue: "Not selected",
          nextValue: payload.communicationMode,
        },
        {
          label: "Priority score",
          previousValue: "Not scored",
          nextValue: `${payload.priorityScore}/100`,
        },
      ],
      id: `expert-review-${payload.leadId}`,
      impactItems: [
        `Contact mode: ${payload.communicationMode}`,
        `Priority score: ${payload.priorityScore}/100`,
        "Frontend lead draft saved. Backend/CRM sync pending.",
      ],
      severity: payload.priorityScore >= 70 ? "major" : "minor",
      summary: `Contact mode: ${payload.communicationMode}. Priority score: ${payload.priorityScore}/100.`,
      title: "Expert review requested",
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
    setImpactSuccessMessage(
      "Expert review request saved. Our travel expert will contact you."
    );
  }

  function handlePackingChecklistUpdate(message: string) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Packing checklist",
          previousValue: "Pending",
          nextValue: message,
        },
      ],
      id: `packing-checklist-${Date.now()}`,
      impactItems: [
        message,
        "Preparation status updated in My Trips.",
      ],
      severity: "minor",
      summary: message,
      title: message,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
    setImpactSuccessMessage(message);
  }

  function expeditionStrategySavedItem(
    strategy: TiyaRouteStrategySnapshot
  ): MyTripSavedItem {
    return {
      id: `expedition-strategy:${strategy.id}`,
      type: "Expedition Strategies",
      title: strategy.label,
      subtitle: strategy.clusterStructure,
      category: "Route Strategy",
      sourceModule: "Expedition Planner",
      destination: intent.toCity || toCity,
      city: intent.toCity || toCity,
      day: "Trip",
      time: `${strategy.travelHours}h travel window`,
      estimatedCost: strategy.budget,
      metadata: {
        comfortScore: strategy.comfortScore,
        riskScore: strategy.riskScore,
        budgetImpact: strategy.budgetImpact,
        creatorOpportunities: strategy.creatorOpportunities,
        localLifeOpportunities: strategy.localLifeOpportunities,
        scenicExposure: strategy.scenicExposure,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function expeditionStrategyBasketItem(
    strategy: TiyaRouteStrategySnapshot
  ): WorkspaceBookingBasketItem {
    const firstDay = plan.days[0];

    return {
      id: `expedition-strategy-basket-${strategy.id}`,
      sourceItemId: `expedition-strategy:${strategy.id}`,
      dayId: firstDay?.id,
      day: firstDay?.day || 0,
      dayLabel: "Trip",
      category: "Package",
      serviceType: "package",
      serviceLabel: "Route Strategy",
      serviceName: "Package",
      selectedOptionName: strategy.label,
      title: strategy.label,
      description: `Strategic route plan with ${strategy.comfortScore} comfort, ${strategy.riskScore} risk and ${strategy.travelHours}h travel window.`,
      dayRange: "Trip",
      from: intent.fromCity || fromCity,
      to: intent.toCity || toCity,
      finalDestination: intent.toCity || toCity,
      city: intent.toCity || toCity,
      date: firstDay?.date || intent.startDate || "",
      startDate: firstDay?.date || intent.startDate || "",
      endDate: plan.days[plan.days.length - 1]?.date || intent.endDate || "",
      travellers: Math.max(1, plan.travellerCount || 1),
      quantity: 1,
      meta: `${strategy.travelHours}h · ${strategy.clusterStructure}`,
      unitPrice: Math.max(0, strategy.budgetImpact),
      priceBasis: "per_package",
      displayPriceLabel: `${formatCurrency(Math.max(0, strategy.budgetImpact))} strategy impact`,
      estimatedPrice: Math.max(0, strategy.budgetImpact),
      price: Math.max(0, strategy.budgetImpact),
      estimatedTotal: Math.max(0, strategy.budgetImpact),
      currency: "INR",
      providerName: "Tiya Strategic Route Intelligence",
      detailSummary: `Applied ${strategy.label}: fatigue -${strategy.fatigueReduction}%, backtracking -${strategy.backtrackingReduction}%.`,
      details: {
        comfort: strategy.comfortScore,
        risk: strategy.riskScore,
        travelHours: `${strategy.travelHours}h`,
        clusterStructure: strategy.clusterStructure,
        creatorOpportunities: strategy.creatorOpportunities,
        localLifeOpportunities: strategy.localLifeOpportunities,
      },
      status: "selected",
      bookingStatus: "selected",
    };
  }

  function applyExpeditionStrategyToPlan(strategy: TiyaRouteStrategySnapshot) {
    const targetDay = plan.days[Math.min(1, Math.max(0, plan.days.length - 1))] || plan.days[0];
    const strategyItem = {
      id: `expedition-strategy-${strategy.id}`,
      time: "Strategic Route Window",
      title: strategy.label,
      location: intent.toCity || toCity,
      type: "activity" as const,
      category: "Activities" as const,
      serviceType: "Route Strategy",
      description: `Applied strategic route plan: ${strategy.clusterStructure}. Comfort ${strategy.comfortScore}, risk ${strategy.riskScore}.`,
      date: targetDay?.date,
      travellers: Math.max(1, plan.travellerCount || 1),
      unitPrice: Math.max(0, strategy.budgetImpact),
      priceBasis: "fixed" as const,
      displayPriceLabel: `${formatCurrency(Math.max(0, strategy.budgetImpact))} strategy impact`,
      price: Math.max(0, strategy.budgetImpact),
      currency: "INR" as const,
      providerName: "Tiya Strategic Route Intelligence",
      detailSummary: `Reduced fatigue by ${strategy.fatigueReduction}% and backtracking by ${strategy.backtrackingReduction}%.`,
      details: {
        comfort: strategy.comfortScore,
        risk: strategy.riskScore,
        travelHours: `${strategy.travelHours}h`,
        fuelEfficiency: `${strategy.fuelEfficiency}%`,
      },
      bookingStatus: "selected" as const,
    };
    const nextDays = plan.days.map((day, index) =>
      day.id === targetDay?.id || (!targetDay && index === 0)
        ? {
            ...day,
            items: day.items.some((item) => item.id === strategyItem.id)
              ? day.items
              : [...day.items, strategyItem],
            notes:
              `${day.notes || ""} Expedition Strategy Applied: ${strategy.label}. Reduced fatigue by ${strategy.fatigueReduction}%, reduced backtracking by ${strategy.backtrackingReduction}%.`.trim(),
          }
        : day
    );
    const strategyBasketItem = expeditionStrategyBasketItem(strategy);
    const nextBasket = upsertBookingBasketItem(
      bookingBasket,
      strategyBasketItem
    ) as WorkspaceBookingBasketItem[];
    const nextBudgetLines = [
      ...plan.budgetLines.filter((line) => line.label !== "Route Strategy"),
      ...(strategy.budgetImpact
        ? [
            {
              label: "Route Strategy",
              amount: strategy.budgetImpact,
              tone: "orange" as const,
            },
          ]
        : []),
    ];
    const nextPlan: TiyaGeneratedPlan = {
      ...plan,
      days: nextDays,
      budgetLines: nextBudgetLines,
      totalBudget: Math.max(0, plan.totalBudget + strategy.budgetImpact),
      routeOptions: plan.routeOptions.map((route) =>
        route.id === selectedRoute.id
          ? {
              ...route,
              bestFor: `${route.bestFor} · ${strategy.label}`,
              comfortScore: Math.max(route.comfortScore, strategy.comfortScore),
            }
          : route
      ),
    };

    onPlanChange?.(nextPlan);
    setBookingBasket(nextBasket);
    persistCreatorTripUpdate(nextPlan, nextBasket);
    showModuleActionMessage(
      `Expedition Strategy Applied: ${strategy.label}. Fatigue -${strategy.fatigueReduction}%, backtracking -${strategy.backtrackingReduction}%.`
    );
  }

  function handleExpeditionStrategyAction(
    action: "preview" | "compare" | "apply" | "convert" | "save" | "remove",
    strategy: TiyaRouteStrategySnapshot
  ) {
    const savedItemId = `expedition-strategy:${strategy.id}`;

    if (action === "save") {
      requestSaveItemToMyTrips(expeditionStrategySavedItem(strategy));
      return;
    }

    if (action === "remove") {
      removeSavedItemFromCurrentTrip(savedItemId);
      return;
    }

    if (action === "preview" || action === "compare") {
      showModuleActionMessage(`${strategy.label} ${action === "preview" ? "preview" : "comparison"} is active in Expedition Planner.`);
      return;
    }

    const alreadyApplied = bookingBasket.some(
      (item) => item.sourceItemId === savedItemId
    );
    if (alreadyApplied) {
      showModuleActionMessage(`${strategy.label} is already applied to the main itinerary.`);
      return;
    }

    openModuleImpactPreview({
      applyChange: () => applyExpeditionStrategyToPlan(strategy),
      changes: [
        {
          label: "Route strategy",
          previousValue: "Current itinerary route logic",
          nextValue: strategy.label,
        },
        {
          label: "Fatigue",
          previousValue: "Current fatigue baseline",
          nextValue: `Reduced by ${strategy.fatigueReduction}%`,
        },
        {
          label: "Backtracking",
          previousValue: "Current movement pattern",
          nextValue: `Reduced by ${strategy.backtrackingReduction}%`,
        },
        {
          label: "Creator opportunity",
          previousValue: "Current route coverage",
          nextValue: `+${strategy.creatorOpportunities} opportunities`,
        },
        {
          label: "Local Life segment",
          previousValue: "Current route coverage",
          nextValue: `+${strategy.localLifeOpportunities} opportunities`,
        },
      ],
      costDelta: strategy.budgetImpact,
      severity: strategy.riskScore > 34 ? "major" : "minor",
      summary: `Expedition Strategy Applied: ${strategy.label}. Reduced fatigue by ${strategy.fatigueReduction}% and backtracking by ${strategy.backtrackingReduction}%.`,
      title: `Expedition Strategy Applied Preview`,
    });
  }

  function coPilotBasketItem(action: TiyaCoPilotAction): WorkspaceBookingBasketItem {
    const targetDay = plan.days[Math.min(1, Math.max(0, plan.days.length - 1))] || plan.days[0];
    const amount = Math.max(0, action.impact.budget);

    return {
      id: `tiya-copilot-${action.id}`,
      sourceItemId: `tiya-copilot:${action.id}`,
      dayId: targetDay?.id,
      day: targetDay?.day || 0,
      dayLabel: targetDay ? `Day ${targetDay.day}` : "Trip",
      category: action.id.includes("booking") ? "Package" : "Activities",
      serviceType: action.id.includes("booking") ? "package" : "activity",
      serviceLabel: "Tiya Co-Pilot Action",
      serviceName: action.id.includes("booking")
        ? "Package"
        : "Activities / Experiences",
      selectedOptionName: action.title,
      title: action.title,
      description: action.detail,
      dayRange: action.affectedDay,
      from: intent.fromCity || fromCity,
      to: intent.toCity || toCity,
      finalDestination: intent.toCity || toCity,
      city: intent.toCity || toCity,
      date: targetDay?.date || intent.startDate || "",
      startDate: targetDay?.date || intent.startDate || "",
      endDate: targetDay?.date || intent.endDate || "",
      travellers: Math.max(1, plan.travellerCount || 1),
      quantity: 1,
      time: action.affectedDay,
      meta: `${action.affectedModule} · ${action.source}`,
      unitPrice: amount,
      priceBasis: "fixed",
      displayPriceLabel: `${formatCurrency(amount)} co-pilot impact`,
      estimatedPrice: amount,
      price: amount,
      estimatedTotal: amount,
      currency: "INR",
      providerName: "Tiya Live Co-Pilot",
      detailSummary: `Comfort ${action.impact.comfort}, budget ${action.impact.budget}, risk ${action.impact.risk}, weather ${action.impact.weather}.`,
      details: {
        source: action.source,
        affectedModule: action.affectedModule,
        comfort: action.impact.comfort,
        budget: action.impact.budget,
        risk: action.impact.risk,
        weather: action.impact.weather,
        experience: action.impact.experience,
        localLife: action.impact.localLife,
        creator: action.impact.creator,
      },
      status: "selected",
      bookingStatus: "selected",
    };
  }

  function applyCoPilotAction(action: TiyaCoPilotAction) {
    const targetDay = plan.days[Math.min(1, Math.max(0, plan.days.length - 1))] || plan.days[0];
    const timelineItem = {
      id: `tiya-copilot-${action.id}`,
      time: action.affectedDay,
      title: action.title,
      location: intent.toCity || toCity,
      type: "activity" as const,
      category: "Activities" as const,
      serviceType: "Tiya Co-Pilot Action",
      description: action.detail,
      date: targetDay?.date,
      travellers: Math.max(1, plan.travellerCount || 1),
      unitPrice: Math.max(0, action.impact.budget),
      priceBasis: "fixed" as const,
      displayPriceLabel: `${formatCurrency(Math.max(0, action.impact.budget))} co-pilot impact`,
      price: Math.max(0, action.impact.budget),
      currency: "INR" as const,
      providerName: "Tiya Live Co-Pilot",
      detailSummary: `Comfort ${action.impact.comfort}, risk ${action.impact.risk}, weather ${action.impact.weather}, experience ${action.impact.experience}.`,
      bookingStatus: "selected" as const,
    };
    const nextDays = plan.days.map((day, index) =>
      day.id === targetDay?.id || (!targetDay && index === 0)
        ? {
            ...day,
            items: day.items.some((item) => item.id === timelineItem.id)
              ? day.items
              : [...day.items, timelineItem],
            notes:
              `${day.notes || ""} Tiya Co-Pilot Applied: ${action.title}. Comfort ${action.impact.comfort > 0 ? "+" : ""}${action.impact.comfort}, Risk ${action.impact.risk}.`.trim(),
          }
        : day
    );
    const nextBudgetLines = [
      ...plan.budgetLines.filter((line) => line.label !== "Tiya Co-Pilot"),
      ...(action.impact.budget
        ? [
            {
              label: "Tiya Co-Pilot",
              amount: action.impact.budget,
              tone: action.impact.budget > 0 ? "orange" as const : "green" as const,
            },
          ]
        : []),
    ];
    const basketItem = coPilotBasketItem(action);
    const nextBasket = upsertBookingBasketItem(
      bookingBasket,
      basketItem
    ) as WorkspaceBookingBasketItem[];
    const nextPlan: TiyaGeneratedPlan = {
      ...plan,
      days: nextDays,
      budgetLines: nextBudgetLines,
      totalBudget: Math.max(0, plan.totalBudget + action.impact.budget),
    };

    onPlanChange?.(nextPlan);
    setBookingBasket(nextBasket);
    persistCreatorTripUpdate(nextPlan, nextBasket);
    showModuleActionMessage(
      `Tiya Co-Pilot synced: ${action.title}. Comfort ${action.impact.comfort}, risk ${action.impact.risk}, budget ${formatCurrency(action.impact.budget)}.`
    );
  }

  function handleCoPilotAction(action: TiyaCoPilotAction) {
    const alreadyApplied = bookingBasket.some(
      (item) => item.sourceItemId === `tiya-copilot:${action.id}`
    );

    if (alreadyApplied) {
      showModuleActionMessage(`${action.title} is already synced to this trip.`);
      return;
    }

    openModuleImpactPreview({
      applyChange: () => applyCoPilotAction(action),
      changes: [
        {
          label: "Tiya action",
          previousValue: "Not applied",
          nextValue: action.title,
        },
        {
          label: "Affected module",
          previousValue: "Monitoring only",
          nextValue: action.affectedModule,
        },
        {
          label: "Comfort",
          previousValue: "Current score",
          nextValue: `${action.impact.comfort > 0 ? "+" : ""}${action.impact.comfort}`,
        },
        {
          label: "Risk",
          previousValue: "Current risk",
          nextValue: `${action.impact.risk}`,
        },
        {
          label: "Budget",
          previousValue: "Current budget",
          nextValue: formatCurrency(action.impact.budget),
        },
        {
          label: "Experience",
          previousValue: "Current experience",
          nextValue: `+${action.impact.experience}`,
        },
      ],
      costDelta: action.impact.budget,
      severity: Math.abs(action.impact.risk) > 10 ? "major" : "minor",
      summary: `Tiya Live Co-Pilot applied ${action.title}: comfort ${action.impact.comfort}, budget ${formatCurrency(action.impact.budget)}, risk ${action.impact.risk}, weather +${action.impact.weather}, experience +${action.impact.experience}.`,
      title: `Tiya Co-Pilot Action Preview`,
    });
  }

  function groupDecisionSavedItem(decision: TiyaGroupDecision): MyTripSavedItem {
    return {
      id: `group-decision:${decision.id}`,
      type: "Group Decisions",
      title: decision.title,
      subtitle: decision.summary,
      category: "Group Planning",
      sourceModule: "Group Planning",
      destination: intent.toCity || toCity,
      city: intent.toCity || toCity,
      day: "Trip",
      time: "Group preference layer",
      estimatedCost: decision.impact.budget,
      metadata: {
        harmonyScore: decision.harmonyScore,
        travellers: decision.travellers,
        winningVotes: decision.winningVotes,
        conflicts: decision.conflicts,
        recommendations: decision.recommendations,
        impact: decision.impact,
      },
      savedAt: new Date().toISOString(),
    };
  }

  function groupDecisionBasketItem(decision: TiyaGroupDecision): WorkspaceBookingBasketItem {
    const targetDay = plan.days[0];
    const amount = Math.max(0, decision.impact.budget);

    return {
      id: `group-decision-basket-${decision.id}`,
      sourceItemId: `group-decision:${decision.id}`,
      dayId: targetDay?.id,
      day: targetDay?.day || 0,
      dayLabel: "Trip",
      category: "Package",
      serviceType: "package",
      serviceLabel: "Group Decision",
      serviceName: "Package",
      selectedOptionName: decision.title,
      title: decision.title,
      description: decision.summary,
      dayRange: "Trip",
      from: intent.fromCity || fromCity,
      to: intent.toCity || toCity,
      finalDestination: intent.toCity || toCity,
      city: intent.toCity || toCity,
      date: targetDay?.date || intent.startDate || "",
      startDate: targetDay?.date || intent.startDate || "",
      endDate: plan.days[plan.days.length - 1]?.date || intent.endDate || "",
      travellers: Math.max(1, decision.travellers.length),
      quantity: 1,
      meta: `Harmony ${decision.harmonyScore}% · ${decision.travellers.length} travellers`,
      unitPrice: amount,
      priceBasis: "fixed",
      displayPriceLabel: `${formatCurrency(amount)} group decision impact`,
      estimatedPrice: amount,
      price: amount,
      estimatedTotal: amount,
      currency: "INR",
      providerName: "Tiya Group Planning",
      detailSummary: `Group decision synced: comfort ${decision.impact.comfort}, risk ${decision.impact.risk}, experience +${decision.impact.experience}.`,
      details: {
        harmonyScore: decision.harmonyScore,
        routeVote: decision.winningVotes.route,
        stayVote: decision.winningVotes.stay,
        transportVote: decision.winningVotes.transport,
        activitiesVote: decision.winningVotes.activities,
        conflicts: decision.conflicts,
      },
      status: "selected",
      bookingStatus: "selected",
    };
  }

  function applyGroupDecision(decision: TiyaGroupDecision) {
    const targetDay = plan.days[0];
    const timelineItem = {
      id: `group-decision-${decision.id}`,
      time: "Group Decision Layer",
      title: decision.title,
      location: intent.toCity || toCity,
      type: "activity" as const,
      category: "Activities" as const,
      serviceType: "Group Planning",
      description: decision.summary,
      date: targetDay?.date,
      travellers: Math.max(1, decision.travellers.length),
      unitPrice: Math.max(0, decision.impact.budget),
      priceBasis: "fixed" as const,
      displayPriceLabel: `${formatCurrency(Math.max(0, decision.impact.budget))} group decision impact`,
      price: Math.max(0, decision.impact.budget),
      currency: "INR" as const,
      providerName: "Tiya Group Planning",
      detailSummary: `Harmony ${decision.harmonyScore}% with ${decision.travellers.length} traveller profiles.`,
      details: {
        harmonyScore: decision.harmonyScore,
        winningVotes: Object.entries(decision.winningVotes).map(([key, value]) => `${key}: ${value}`),
        recommendations: decision.recommendations,
      },
      bookingStatus: "selected" as const,
    };
    const nextDays = plan.days.map((day, index) =>
      day.id === targetDay?.id || (!targetDay && index === 0)
        ? {
            ...day,
            items: day.items.some((item) => item.id === timelineItem.id)
              ? day.items
              : [...day.items, timelineItem],
            notes:
              `${day.notes || ""} Group Decision Synced: ${decision.summary}. Harmony ${decision.harmonyScore}%.`.trim(),
          }
        : day
    );
    const nextBudgetLines = [
      ...plan.budgetLines.filter((line) => line.label !== "Group Decision"),
      ...(decision.impact.budget
        ? [
            {
              label: "Group Decision",
              amount: decision.impact.budget,
              tone: decision.impact.budget > 0 ? "orange" as const : "green" as const,
            },
          ]
        : []),
    ];
    const nextBasket = upsertBookingBasketItem(
      bookingBasket,
      groupDecisionBasketItem(decision)
    ) as WorkspaceBookingBasketItem[];
    const nextPlan: TiyaGeneratedPlan = {
      ...plan,
      days: nextDays,
      budgetLines: nextBudgetLines,
      totalBudget: Math.max(0, plan.totalBudget + decision.impact.budget),
      suggestions: [
        ...plan.suggestions.filter((suggestion) => suggestion.id !== "group-decision"),
        {
          id: "group-decision",
          category: "Activity",
          title: "Group-balanced itinerary",
          detail: decision.summary,
          price: formatCurrency(decision.impact.budget),
          fit: `${decision.harmonyScore}% harmony`,
        },
      ],
    };

    onPlanChange?.(nextPlan);
    setBookingBasket(nextBasket);
    persistCreatorTripUpdate(nextPlan, nextBasket);
    showModuleActionMessage(
      `Group decision synced: ${decision.harmonyScore}% harmony, comfort ${decision.impact.comfort}, risk ${decision.impact.risk}.`
    );
  }

  function handleGroupDecisionAction(
    action: "save" | "remove" | "apply",
    decision: TiyaGroupDecision
  ) {
    const savedItemId = `group-decision:${decision.id}`;

    if (action === "save") {
      requestSaveItemToMyTrips(groupDecisionSavedItem(decision));
      return;
    }

    if (action === "remove") {
      removeSavedItemFromCurrentTrip(savedItemId);
      return;
    }

    const alreadyApplied = bookingBasket.some(
      (item) => item.sourceItemId === savedItemId
    );
    if (alreadyApplied) {
      showModuleActionMessage("This group decision is already synced to the itinerary.");
      return;
    }

    openModuleImpactPreview({
      applyChange: () => applyGroupDecision(decision),
      changes: [
        {
          label: "Group harmony",
          previousValue: "Unapplied traveller preferences",
          nextValue: `${decision.harmonyScore}% harmony`,
        },
        {
          label: "Route vote",
          previousValue: "Current route preference",
          nextValue: decision.winningVotes.route || "Balanced",
        },
        {
          label: "Stay vote",
          previousValue: "Current stay preference",
          nextValue: decision.winningVotes.stay || "Balanced",
        },
        {
          label: "Transport vote",
          previousValue: "Current transport preference",
          nextValue: decision.winningVotes.transport || "Balanced",
        },
        {
          label: "Activities vote",
          previousValue: "Current activity mix",
          nextValue: decision.winningVotes.activities || "Balanced",
        },
        {
          label: "Tiya recommendation",
          previousValue: "No group decision applied",
          nextValue: decision.recommendations[0] || decision.summary,
        },
      ],
      costDelta: decision.impact.budget,
      severity: decision.conflicts.length > 1 ? "major" : "minor",
      summary: `Group Planning synced ${decision.travellers.length} traveller profiles into itinerary generation with ${decision.harmonyScore}% harmony.`,
      title: "Group Decision Sync Preview",
    });
  }

  function handleSaveRecommendationToMyTrips(recommendationId: string) {
    const savedItemId = `recommendation:${recommendationId}`;
    const nextSavedRecommendationIds = savedRecommendationIds.includes(recommendationId)
      ? savedRecommendationIds.filter((id) => id !== recommendationId)
      : [...savedRecommendationIds, recommendationId];

    setSavedRecommendationIds(nextSavedRecommendationIds);
    persistRecommendationState({ saved: nextSavedRecommendationIds });

    if (savedItemIds.includes(savedItemId)) {
      removeSavedItemFromCurrentTrip(savedItemId);
      return;
    }

    const savedItem = recommendationSavedItem(recommendationId);
    if (!savedItem) return;
    requestSaveItemToMyTrips(savedItem);
  }

  function persistRecommendationState(nextState: {
    applied?: string[];
    dismissed?: string[];
    saved?: string[];
  }) {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(RECOMMENDATION_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const tripKey = `${intent.fromCity}-${intent.toCity}-${intent.startDate}-${selectedRoute.id}`;
      const previous = parsed?.[tripKey] || {};
      const updated = {
        ...parsed,
        [tripKey]: {
          ...previous,
          ...nextState,
          updatedAt: new Date().toISOString(),
        },
      };

      window.localStorage.setItem(RECOMMENDATION_STATE_KEY, JSON.stringify(updated));
      broadcastPlannerRefresh();
    } catch {
      return;
    }
  }

  function recommendationImpactPreview(recommendation: TiyaAIRecommendation): ItineraryImpactPreview {
    return {
      bookingAffected: true,
      costDelta: recommendation.costImpact,
      diffs: [
        {
          label: "AI recommendation applied",
          previousValue: "Not applied",
          nextValue: recommendation.title,
        },
        {
          label: "Affected module",
          previousValue: "Current plan",
          nextValue: recommendation.category === "Local Market" ? "Local Life" : recommendation.category,
        },
        {
          label: "Affected day",
          previousValue: "Current itinerary",
          nextValue: String(recommendation.affectedDay || "Trip"),
        },
      ],
      id: `recommendation-apply-${recommendation.id}-${Date.now()}`,
      impactItems: [
        recommendation.impactSummary,
        `Comfort ${recommendation.comfortImpact >= 0 ? "+" : ""}${recommendation.comfortImpact}`,
        `Risk ${recommendation.riskImpact}`,
        `Budget ${formatCurrency(recommendation.costImpact)}`,
      ],
      severity: recommendation.priority === "High" ? "major" : "minor",
      summary: recommendation.reason,
      title: `AI Recommendation Applied: ${recommendation.title}`,
    };
  }

  function handleApplyRecommendation(recommendation: TiyaAIRecommendation) {
    if (appliedRecommendationIds.includes(recommendation.id)) {
      showModuleActionMessage(`${recommendation.title} is already applied.`);
      return;
    }

    const preview = recommendationImpactPreview(recommendation);
    const appliedChange: TripChangeLogEntry = {
      ...preview,
      appliedAt: new Date().toISOString(),
    };
    const nextChangeLog = [appliedChange, ...recentTripChanges].slice(0, 8);
    const nextAppliedIds = [...appliedRecommendationIds, recommendation.id];

    applyGenericImpactToPlan(preview, nextChangeLog);
    setRecentTripChanges(nextChangeLog);
    setAppliedRecommendationIds(nextAppliedIds);
    persistRecommendationState({ applied: nextAppliedIds });
    setImpactSuccessMessage(`${recommendation.title} applied to this trip.`);
  }

  function handleDismissRecommendation(recommendationId: string) {
    const nextDismissedIds = dismissedRecommendationIds.includes(recommendationId)
      ? dismissedRecommendationIds
      : [...dismissedRecommendationIds, recommendationId];
    const recommendation = recommendations.find((item) => item.id === recommendationId);
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "AI recommendation",
          previousValue: recommendation?.title || recommendationId,
          nextValue: "Dismissed",
        },
      ],
      id: `recommendation-dismiss-${recommendationId}-${Date.now()}`,
      impactItems: ["Recommendation hidden from active list."],
      severity: "minor",
      summary: `${recommendation?.title || "Recommendation"} dismissed.`,
      title: "AI Recommendation Dismissed",
    };
    const nextChangeLog = [change, ...recentTripChanges].slice(0, 8);

    setDismissedRecommendationIds(nextDismissedIds);
    setRecentTripChanges(nextChangeLog);
    persistRecommendationState({ dismissed: nextDismissedIds });
    syncCanonicalPlannerPayload({ nextChangeLog });
    setImpactSuccessMessage(`${recommendation?.title || "Recommendation"} dismissed.`);
  }

  function openModuleForSavedItem(item: MyTripSavedItem) {
    const moduleId: WorkspaceCapabilityId =
      item.type === "Local Life"
        ? "Local Life"
        : item.type === "Activities"
          ? "Experiences & Activities"
          : item.type === "Stays"
            ? "Stay Selection"
            : item.type === "Transport"
              ? "Flight & Transport Planning"
              : item.type === "Routes"
                ? "Route Variants & Alternatives"
                : item.type === "Recommendations"
                ? "Smart Travel Recommendations"
                  : item.type === "Creators"
                    ? "Creator Recommendations"
                    : "Saved Trips & Notes";

    setSavedItemsOpen(false);
    setOpenCapability(moduleId);
  }

  async function downloadFinalJourneyPdf(
    journey: FinalJourneySnapshot,
    tripSnapshot: MyTripSnapshot
  ) {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    function addPageIfNeeded(requiredHeight = 32) {
      if (y + requiredHeight <= pageHeight - margin) return;
      pdf.addPage();
      y = margin;
    }

    function addText(
      text: string,
      options: {
        size?: number;
        style?: "normal" | "bold";
        color?: [number, number, number];
        gap?: number;
      } = {}
    ) {
      const size = options.size ?? 10;
      pdf.setFont("helvetica", options.style ?? "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...(options.color ?? [40, 52, 72]));
      const lines = pdf.splitTextToSize(text, contentWidth);
      addPageIfNeeded(lines.length * (size + 4));
      pdf.text(lines, margin, y);
      y += lines.length * (size + 4) + (options.gap ?? 8);
    }

    function addDivider() {
      addPageIfNeeded(16);
      pdf.setDrawColor(220, 226, 235);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 18;
    }

    function addSection(title: string) {
      addPageIfNeeded(42);
      y += 6;
      addText(title.toUpperCase(), {
        size: 11,
        style: "bold",
        color: [10, 82, 122],
        gap: 10,
      });
    }

    pdf.setFillColor(7, 17, 31);
    pdf.rect(0, 0, pageWidth, 112, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("TPL Smart Trip Itinerary", margin, 46);
    pdf.setFontSize(12);
    pdf.text(journey.tripName, margin, 72);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Generated ${formatPdfDateLabel(journey.generatedAt)}`, margin, 94);
    y = 140;

    addText(
      `${journey.origin} to ${journey.destination} · ${formatPdfDateLabel(
        journey.startDate
      )} - ${formatPdfDateLabel(journey.endDate)} · ${
        journey.durationDays
      } Days · ${journey.travellers} Traveller${
        journey.travellers === 1 ? "" : "s"
      }`,
      { size: 11, style: "bold", color: [15, 23, 42], gap: 12 }
    );
    addText(`Estimated Trip Value: ${formatCurrency(journey.estimatedTripValue)}`, {
      size: 13,
      style: "bold",
      color: [194, 65, 12],
      gap: 14,
    });

    addSection("Day-wise Itinerary");
    journey.dayWiseItinerary.forEach((day) => {
      addPageIfNeeded(64);
      addText(`Day ${String(day.day).padStart(2, "0")} · ${day.date}`, {
        size: 12,
        style: "bold",
        color: [15, 23, 42],
        gap: 4,
      });
      addText(day.headline || day.city || "Planned day", {
        size: 10,
        style: "bold",
        color: [71, 85, 105],
        gap: 6,
      });
      day.items.forEach((item) => {
        const itemLine = `${item.time || "Flexible"} · ${item.type.toUpperCase()} · ${
          item.title
        }`;
        addText(itemLine, { size: 9, style: "bold", gap: 2 });
        addText(
          [
            (item as TiyaTimelineItem & { routeLabel?: string }).routeLabel,
            item.location,
            item.description,
            item.price ? formatCurrency(item.price) : "",
          ]
            .filter(Boolean)
            .join(" · "),
          { size: 8, color: [100, 116, 139], gap: 5 }
        );
      });
      y += 4;
    });

    addDivider();
    addSection("Selected Trip Items");
    if (journey.selectedItems.length === 0) {
      addText("No trip selections added yet.", { size: 9 });
    } else {
      journey.selectedItems.forEach((item) => {
        addText(
          `${bookingDisplayType(item.serviceType)} · ${
            item.selectedOptionName || item.title
          } · ${formatCurrency(item.estimatedTotal || item.estimatedPrice || 0)}`,
          { size: 9, style: "bold", gap: 3 }
        );
        addText(
          `${item.dayLabel || ""} ${item.date || ""} · ${getBookingItemRouteLabel(
            item
          )}`,
          { size: 8, color: [100, 116, 139], gap: 5 }
        );
      });
    }

    addDivider();
    addSection("Price Summary");
    journey.priceSummary.categories.forEach((category) => {
      addText(
        `${category.title}: ${category.itemCount} item${
          category.itemCount === 1 ? "" : "s"
        } · ${formatCurrency(category.total)}`,
        { size: 9, style: "bold", gap: 4 }
      );
    });
    addText(`Subtotal: ${formatCurrency(journey.priceSummary.subtotal)}`, {
      size: 9,
      gap: 3,
    });
    addText(`Estimated taxes & fees: ${formatCurrency(journey.priceSummary.taxesAndFees)}`, {
      size: 9,
      gap: 3,
    });
    addText(`Total: ${formatCurrency(journey.priceSummary.total)}`, {
      size: 12,
      style: "bold",
      color: [194, 65, 12],
      gap: 12,
    });

    addDivider();
    addSection("Notes / Readiness Summary");
    addText(
      [
        tripSnapshot.notes,
        journey.notes.packing ? `Packing: ${journey.notes.packing}` : "",
        journey.notes.localTips ? `Local Tips: ${journey.notes.localTips}` : "",
        journey.notes.creatorNotes
          ? `Creator Notes: ${journey.notes.creatorNotes}`
          : "",
      ]
        .filter(Boolean)
        .join("\n") || "No additional notes added.",
      { size: 9, color: [71, 85, 105] }
    );

    const destination = safePdfFileName(journey.destination || "smart-trip");
    const start = safePdfFileName(formatPdfDateLabel(journey.startDate));
    pdf.save(`TPL-Smart-Trip-${destination}-${start}.pdf`);
  }

  async function exportCurrentTrip() {
    setItineraryActionOperation(true);
    try {
      const exportPayload = finalJourney ?? buildFinalJourneySnapshot();
      const tripSnapshot =
        buildCurrentTripSnapshot() ??
        ({
          tripName: exportPayload.tripName,
          notes: [
            tripNotes.personal,
            tripNotes.packing,
            tripNotes.localTips,
            tripNotes.creatorNotes,
          ]
            .filter(Boolean)
            .join("\n"),
        } as MyTripSnapshot);
      await downloadFinalJourneyPdf(exportPayload, tripSnapshot);
      showJourneyControlMessage("PDF itinerary downloaded successfully.");
    } catch {
      showJourneyControlMessage("Export preview is not ready yet. Build itinerary first.");
    } finally {
      setItineraryActionOperation(false);
    }
  }

  async function shareCurrentTrip() {
    const journey = finalJourney ?? buildFinalJourneySnapshot();
    const tripSnapshot = buildCurrentTripSnapshot();
    const shareText = `${journey?.tripName || tripSnapshot?.tripName || `${intent.fromCity || fromCity} to ${intent.toCity || toCity}`} · ${
      journey ? `${journey.durationDays} Days` : tripSnapshot?.duration || `${plan.days.length} Days`
    } · ${formatCurrency(
      journey?.estimatedTripValue ?? tripSnapshot?.estimatedTripValue ?? plan.totalBudget
    )} estimated value`;

    setItineraryActionOperation(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: journey?.tripName || tripSnapshot?.tripName || "Tiya Smart Planner Trip",
          text: shareText,
        });
        showJourneyControlMessage("Trip share sheet opened.");
        return;
      }

      await navigator.clipboard?.writeText(shareText);
      showJourneyControlMessage("Trip summary copied for sharing.");
    } catch {
      showJourneyControlMessage("Share link feature is being prepared for this trip.");
    } finally {
      setItineraryActionOperation(false);
    }
  }

  function buildAndPersistWorkspaceReviewPayload(
    bookingMode: "FULL_TRIP_BOOKING" | "PARTIAL_TRIP_BOOKING" =
      "FULL_TRIP_BOOKING"
  ) {
    syncCanonicalPlannerPayload();
    const payload = buildSmartPlannerReviewPayload({
      bookingBasket,
      intent,
      notes: tripNotes,
      plan,
      plannerAudit: {
        bookingConfidenceScore: journeyStatus.bookingReadiness,
        finalVerdict:
          journeyStatus.bookingReadiness >= 82
            ? "Ready To Book"
            : journeyStatus.bookingReadiness >= 58
              ? "Needs Review"
              : "Not Recommended",
        healthScore: tripHealth.overallScore,
        readinessScore: journeyStatus.bookingReadiness,
      },
      savedItems,
      selectedRoute,
    });

    if (!payload) {
      showJourneyControlMessage("Review payload is not ready yet. Build itinerary first.");
      return null;
    }

    (payload as typeof payload & {
      bookingMode: "FULL_TRIP_BOOKING" | "PARTIAL_TRIP_BOOKING";
      appliedRecommendationIds?: string[];
      savedRecommendationIds?: string[];
      dismissedRecommendationIds?: string[];
    }).bookingMode = bookingMode;
    (payload as typeof payload & {
      appliedRecommendationIds?: string[];
      savedRecommendationIds?: string[];
      dismissedRecommendationIds?: string[];
    }).appliedRecommendationIds = appliedRecommendationIds;
    (payload as typeof payload & {
      appliedRecommendationIds?: string[];
      savedRecommendationIds?: string[];
      dismissedRecommendationIds?: string[];
    }).savedRecommendationIds = savedRecommendationIds;
    (payload as typeof payload & {
      appliedRecommendationIds?: string[];
      savedRecommendationIds?: string[];
      dismissedRecommendationIds?: string[];
    }).dismissedRecommendationIds = dismissedRecommendationIds;
    persistSmartPlannerReviewPayload(payload);
    return payload;
  }

  function continueBookingFromSelections() {
    if (bookingBasket.length === 0) {
      setBookingProceedBlocker(
        "Please add at least one item to booking before continuing."
      );
      showJourneyControlMessage(
        "Please add at least one item to booking before continuing."
      );
      return;
    }

    if (!tripReadiness?.allFinalized) {
      setPartialBookingConfirmOpen(true);
      setBookingProceedBlocker("");
      return;
    }

    const payload = buildAndPersistWorkspaceReviewPayload("FULL_TRIP_BOOKING");
    if (!payload) return;

    setBookingProceedBlocker("");
    window.location.href = "/smart-planner/review";
  }

  function continueWithPartialBooking() {
    if (bookingBasket.length === 0) {
      setPartialBookingConfirmOpen(false);
      setBookingProceedBlocker(
        "Please add at least one item to booking before continuing."
      );
      return;
    }

    const payload = buildAndPersistWorkspaceReviewPayload("PARTIAL_TRIP_BOOKING");
    if (!payload) return;

    setPartialBookingConfirmOpen(false);
    setBookingProceedBlocker("");
    window.location.href = "/smart-planner/review";
  }

  function openExportShareModal() {
    window.dispatchEvent(new Event("tpl:open-itinerary-action-center"));
  }

  function runProtectedWorkspaceAction(action: ProtectedWorkspaceAction) {
    if (action === "continue" && bookingBasket.length === 0) {
      setBookingProceedBlocker(
        "Please add at least one item to booking before continuing."
      );
      showJourneyControlMessage(
        "Please add at least one item to booking before continuing."
      );
      return;
    }

    if (!isAuthenticated || !user) {
      const loginMessages: Record<ProtectedWorkspaceAction, string> = {
        share: "Login required to create a shareable trip link.",
        save: "Login required to save this trip in your account.",
        continue: "Login required to continue booking.",
        exportShare: "Login required to export or share your generated itinerary.",
      };

      showJourneyControlMessage(loginMessages[action]);
      if (action === "exportShare") {
        window.sessionStorage.setItem(
          "tpl_pending_export_share_after_login",
          "true"
        );
      }
      setPendingProtectedAction(action);
      openLoginModal({ accountType: "personal", intent: "ai" });
      return;
    }

    if (action === "share") {
      void shareCurrentTrip();
      return;
    }

    if (action === "exportShare") {
      openExportShareModal();
      return;
    }

    if (action === "save") {
      performSaveToMyTrips();
      return;
    }

    continueBookingFromSelections();
  }

  function handleVariantSelect(variant: TiyaTripVariant) {
    setSelectedVariantId(variant.id);
    setHasUnsavedChanges(true);
  }

  function handleVariantApply(variant: TiyaTripVariant) {
    setPendingImpactPreview(buildVariantImpactPreview(variant));
  }

  function buildVariantImpactPreview(
    variant: TiyaTripVariant
  ): ItineraryImpactPreview {
    const costDelta = variant.estimatedCost - plan.totalBudget;
    const selectedVariantLabel =
      selectedVariantId || selectedRoute.routeStyle || selectedRoute.name;
    const severity: ItineraryImpactPreview["severity"] =
      costDelta > 0 || variant.id === "family" || variant.id === "luxury"
        ? "major"
        : "minor";
    const affectedDays = days
      .slice(0, Math.min(days.length, variant.id === "short" ? 2 : variant.id === "long" ? 4 : 3))
      .map((day) => `Day ${day.day}`)
      .join(", ");
    const currentStay =
      days
        .flatMap((day) => day.items)
        .find((item) => item.type.toLowerCase().includes("stay"))?.title ||
      intent.stayPreference;
    const currentActivity =
      days
        .flatMap((day) => day.items)
        .find((item) => item.type.toLowerCase().includes("activity"))?.title ||
      "Current activity mix";

    return {
      bookingAffected: bookingBasket.length > 0,
      costDelta,
      diffs: [
        {
          label: "Route changed",
          previousValue: selectedVariantLabel,
          nextValue: variant.name,
        },
        {
          label: "Transport updated",
          previousValue: intent.transportMode,
          nextValue: variant.transportStyle,
        },
        {
          label: "Stay updated",
          previousValue: currentStay,
          nextValue: variant.stayStyle,
        },
        {
          label: "Duration impact",
          previousValue: `${days.length} day${days.length === 1 ? "" : "s"}`,
          nextValue: variant.duration,
        },
        {
          label: "Cost impact",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue: formatCurrency(variant.estimatedCost),
        },
        {
          label: "Days affected",
          previousValue: "Current day sequence",
          nextValue: affectedDays || "Timing review",
        },
        {
          label: "Activities changed",
          previousValue: currentActivity,
          nextValue:
            variant.id === "adventure"
              ? "Outdoor activity pressure increased"
              : variant.id === "family"
                ? "Safer, easier activity blocks"
                : variant.id === "short"
                  ? "Priority highlights only"
                  : "Curated activity timing",
        },
      ],
      id: `impact-${variant.id}-${Date.now()}`,
      impactItems: [
        `Route changed: ${selectedVariantLabel} → ${variant.name}.`,
        `Transport style changes to ${variant.transportStyle}.`,
        `Stay updated: ${currentStay} → ${variant.stayStyle}.`,
        `Updated: ${affectedDays || "timing and route review"}.`,
        `Activity changed: ${currentActivity} → ${variant.id === "adventure" ? "higher intensity outdoor blocks" : variant.id === "family" ? "family-safe activity blocks" : "optimized activity sequence"}.`,
        costDelta === 0
          ? "Estimated trip cost remains unchanged."
          : `Estimated trip cost ${costDelta < 0 ? "reduces" : "increases"} by ${formatCurrency(Math.abs(costDelta))}.`,
        "Trip duration and booking selections will be reviewed before checkout.",
      ],
      severity,
      summary: variant.aiNote || variant.changesFromBase,
      title: `${variant.name} Selected`,
      variant,
    };
  }

  function handleCostSuggestionAction(suggestion: {
    actionLabel: string;
    category: string;
    detail: string;
    estimatedSavings: number;
    title: string;
  }) {
    openModuleImpactPreview({
      changes: [
        {
          label: "Optimization",
          previousValue: "Current budget plan",
          nextValue: suggestion.title,
        },
        {
          label: "Affected area",
          previousValue: "Current itinerary cost mix",
          nextValue: suggestion.category,
        },
        {
          label: "Cost impact",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue:
            suggestion.estimatedSavings === 0
              ? formatCurrency(plan.totalBudget)
              : `${suggestion.estimatedSavings > 0 ? "Reduce by" : "Increase by"} ${formatCurrency(Math.abs(suggestion.estimatedSavings))}`,
        },
      ],
      costDelta: -suggestion.estimatedSavings,
      summary: suggestion.detail,
      title: `${suggestion.actionLabel} Preview`,
    });
  }

  function handleTransportPlanAction(planAction: {
    affectedDays: string;
    costImpact: number;
    detail: string;
    newMode: string;
    previousMode: string;
    timeImpact: string;
    title: string;
  }) {
    openModuleImpactPreview({
      bookingAffected: bookingBasket.length > 0,
      changes: [
        {
          label: "Transport plan",
          previousValue: planAction.previousMode,
          nextValue: planAction.newMode,
        },
        {
          label: "Cost impact",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue: `Increase by ${formatCurrency(planAction.costImpact)}`,
        },
        {
          label: "Time impact",
          previousValue: "Current route timing",
          nextValue: planAction.timeImpact,
        },
        {
          label: "Affected days",
          previousValue: "Current transport days",
          nextValue: planAction.affectedDays,
        },
      ],
      costDelta: planAction.costImpact,
      severity: "minor",
      summary: planAction.detail,
      title: "Transport Plan Updated Preview",
    });
  }

  function handleTransportProceedToBook(planAction: {
    affectedDays: string;
    costImpact: number;
    detail: string;
    newMode: string;
    previousMode: string;
    timeImpact: string;
    title: string;
  }) {
    applyImmediateImpactAndProceed({
      bookingAffected: true,
      costDelta: planAction.costImpact,
      diffs: [
        {
          label: "Transport recommendation applied",
          previousValue: planAction.previousMode,
          nextValue: planAction.newMode,
        },
        {
          label: "Affected days",
          previousValue: "Current transport plan",
          nextValue: planAction.affectedDays,
        },
      ],
      id: `transport-proceed-${Date.now()}`,
      impactItems: [
        `Transport updated: ${planAction.previousMode} → ${planAction.newMode}`,
        `Time impact: ${planAction.timeImpact}`,
      ],
      severity: "minor",
      summary: planAction.detail,
      title: "Transport recommendation applied",
    });
  }

  function handleStayPlanAction(planAction: {
    affectedDays: string;
    comfortImpact: number;
    costImpact: number;
    detail: string;
    localImpact: number;
    newSetup: string;
    previousSetup: string;
    title: string;
  }) {
    openModuleImpactPreview({
      bookingAffected: bookingBasket.length > 0,
      changes: [
        {
          label: "Stay plan",
          previousValue: planAction.previousSetup,
          nextValue: planAction.newSetup,
        },
        {
          label: "Cost impact",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue:
            planAction.costImpact < 0
              ? `Reduce by ${formatCurrency(Math.abs(planAction.costImpact))}`
              : `Increase by ${formatCurrency(planAction.costImpact)}`,
        },
        {
          label: "Comfort impact",
          previousValue: "Current stay comfort",
          nextValue: `+${planAction.comfortImpact}`,
        },
        {
          label: "Affected days",
          previousValue: "Current stay days",
          nextValue: planAction.affectedDays,
        },
      ],
      costDelta: planAction.costImpact,
      severity: planAction.costImpact > 0 ? "major" : "minor",
      summary: planAction.detail,
      title: "Stay Plan Updated Preview",
    });
  }

  function handleStayProceedToBook(planAction: {
    affectedDays: string;
    comfortImpact: number;
    costImpact: number;
    detail: string;
    localImpact: number;
    newSetup: string;
    previousSetup: string;
    title: string;
  }) {
    applyImmediateImpactAndProceed({
      bookingAffected: true,
      costDelta: planAction.costImpact,
      diffs: [
        {
          label: "Stay recommendation applied",
          previousValue: planAction.previousSetup,
          nextValue: planAction.newSetup,
        },
        {
          label: "Affected days",
          previousValue: "Current stay plan",
          nextValue: planAction.affectedDays,
        },
      ],
      id: `stay-proceed-${Date.now()}`,
      impactItems: [
        `Stay updated: ${planAction.previousSetup} → ${planAction.newSetup}`,
        `Comfort +${planAction.comfortImpact}`,
        `Local Life +${planAction.localImpact}`,
      ],
      severity: planAction.costImpact > 0 ? "major" : "minor",
      summary: planAction.detail,
      title: "Stay recommendation applied",
    });
  }

  function handleExperienceAction(action: {
    costImpact: number;
    detail: string;
    fatigueImpact: number;
    title: string;
    day: number;
  }) {
    openModuleImpactPreview({
      bookingAffected: bookingBasket.length > 0,
      changes: [
        {
          label: "Activity update",
          previousValue: `Day ${action.day} current activity plan`,
          nextValue: action.title,
        },
        {
          label: "Cost impact",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue: `Increase by ${formatCurrency(action.costImpact)}`,
        },
        {
          label: "Fatigue impact",
          previousValue: "Current day fatigue",
          nextValue: `+${action.fatigueImpact}`,
        },
        {
          label: "Review payload",
          previousValue: "Current selected activities",
          nextValue: "Activity handoff updated",
        },
      ],
      costDelta: action.costImpact,
      severity: action.fatigueImpact >= 8 ? "major" : "minor",
      summary: action.detail,
      title: `${action.title} Preview`,
    });
  }

  function handleSmartSuggestionAction(suggestion: TiyaSuggestion) {
    openModuleImpactPreview({
      bookingAffected: bookingBasket.length > 0,
      changes: [
        {
          label: "Suggestion",
          previousValue: "Current planner recommendation set",
          nextValue: suggestion.title,
        },
        {
          label: "Category",
          previousValue: "Current experience mix",
          nextValue: suggestion.category,
        },
        {
          label: "Budget estimate",
          previousValue: "Current activity estimate",
          nextValue: suggestion.price,
        },
      ],
      costDelta: 0,
      severity: "minor",
      summary: suggestion.detail,
      title: "Smart Suggestion Applied Preview",
    });
  }

  function handleBudgetAction(action: {
    costImpact: number;
    detail: string;
    title: string;
    type: "budget-route" | "balanced-route" | "luxury-route" | "auto-optimize";
  }) {
    openModuleImpactPreview({
      changes: [
        {
          label: "Budget optimization",
          previousValue: formatCurrency(plan.totalBudget),
          nextValue:
            action.costImpact === 0
              ? formatCurrency(plan.totalBudget)
              : `${action.costImpact > 0 ? "+" : "-"}${formatCurrency(Math.abs(action.costImpact))}`,
        },
        {
          label: "Route impact",
          previousValue: selectedRoute.name,
          nextValue:
            action.type === "budget-route"
              ? "Budget route review"
              : action.type === "luxury-route"
                ? "Luxury route review"
                : action.type === "auto-optimize"
                  ? "Optimized value route"
                  : "Balanced route retained",
        },
        {
          label: "Stay impact",
          previousValue: intent.stayPreference,
          nextValue:
            action.type === "luxury-route"
              ? "Premium stay upgrade"
              : action.type === "budget-route" || action.type === "auto-optimize"
                ? "Smart comfort substitution"
                : "Current stay mix",
        },
        {
          label: "Booking selections",
          previousValue: "Current selected items",
          nextValue: "Review recommended before checkout",
        },
      ],
      costDelta: action.costImpact,
      severity: action.costImpact > 0 ? "major" : "minor",
      summary: action.detail,
      title: `${action.title} Preview`,
    });
  }

  function handleRuleAction(rule: {
    actionLabel: string;
    affectedArea: string;
    id?: string;
    reason: string;
    status: string;
    suggestedFix: string;
    title: string;
  }) {
    const preview =
      rule.id === "avoid-night-travel"
        ? {
            cost: "+₹2,500",
            impact: "+1 Halt",
            safety: "+24%",
          }
        : rule.id === "overpacked-itinerary"
          ? {
              cost: "No major change",
              impact: "4 activities moved",
              safety: "+12%",
            }
          : rule.id === "auto-safe-plan"
            ? {
                cost: "+₹2,000",
                impact: "+1 Day",
                safety: "+28%",
              }
            : {
                cost: "Review at checkout",
                impact: "Plan improved",
                safety: "+16%",
              };

    openModuleImpactPreview({
      changes: [
        {
          label: "Risk fix applied",
          previousValue: rule.title,
          nextValue: rule.suggestedFix,
        },
        {
          label: "Affected",
          previousValue: rule.affectedArea,
          nextValue: "Updated after confirmation",
        },
        {
          label: "Impact",
          previousValue: "Current plan",
          nextValue: preview.impact,
        },
        {
          label: "Cost",
          previousValue: "Current estimate",
          nextValue: preview.cost,
        },
        {
          label: "Safety",
          previousValue: rule.status,
          nextValue: preview.safety,
        },
      ],
      severity: rule.status === "critical" ? "major" : "minor",
      summary: `Risk Fix Applied: ${rule.reason}`,
      title: `${rule.title} Risk Fix`,
    });
  }

  function handleWeatherAdviceAction(advice: {
    action: string;
    detail: string;
    severity: string;
    title: string;
  }) {
    const affectedDay = days[3] || days[1] || days[0];
    openModuleImpactPreview({
      changes: [
        {
          label: "Weather action applied",
          previousValue: "Current route timing",
          nextValue: advice.title,
        },
        {
          label: "Reason",
          previousValue: "Current seasonal plan",
          nextValue: advice.detail,
        },
        {
          label: "Affected",
          previousValue: affectedDay ? `Day ${affectedDay.day}` : "Trip route",
          nextValue: advice.action === "Add buffer" ? "+1 buffer day" : "Timing and route review",
        },
        {
          label: "Impact",
          previousValue: advice.severity,
          nextValue:
            advice.action === "Add buffer"
              ? "+1 day"
              : advice.action === "Shift timing"
                ? "Earlier transfer window"
                : "Route safety adjustment",
        },
        {
          label: "Booking selections",
          previousValue: "Current selections",
          nextValue: "Review recommended",
        },
      ],
      severity: advice.severity === "High" ? "major" : "minor",
      summary: `Weather Action Applied: ${advice.detail}`,
      title: `${advice.action} Weather Action`,
    });
  }

  function handleMarketAction(
    action: string,
    product: TiyaLocalMarketPick
  ) {
    const savedItemId = `local-life:${product.id}`;

    if (action.toLowerCase().includes("remove")) {
      removeSavedItemFromCurrentTrip(savedItemId);
      return;
    }

    if (action.toLowerCase().includes("save")) {
      requestSaveItemToMyTrips(localLifeSavedItem(product));
      return;
    }

    const priceEstimate =
      product.priceRange
        .match(/\d[\d,]*/g)
        ?.map((value) => Number(value.replace(/,/g, "")))
        .filter((value) => Number.isFinite(value))[0] || 0;
    const targetDay = Math.min(2, plan.days[1]?.day || plan.days[0]?.day || 1);

    openModuleImpactPreview({
      applyChange: () => {
        const nextDays = plan.days.map((day, index) => {
          const matchesTarget =
            day.day === targetDay ||
            (!plan.days.some((item) => item.day === targetDay) && index === 0);
          if (!matchesTarget) return day;
          if ((day.items || []).some((item) => item.id.includes(`local-life-${product.id}`))) return day;

          const localLifeItem: TiyaTimelineItem = {
            id: `local-life-${product.id}-${Date.now()}`,
            time: "17:30",
            title: product.productName,
            location: product.localRegion || day.city,
            type: "activity",
            category: "Activities",
            description: `${product.description} Route fit ${product.routeRelevance}%.`,
            price: priceEstimate,
            currency: "INR",
            bookingStatus: "recommended",
            detailSummary: "Local Life item added from the discovery engine.",
          };

          return {
            ...day,
            notes: `${day.notes || ""} Local Life Added: ${product.productName}. Route fit ${product.routeRelevance}%.`.trim(),
            items: [...(day.items || []), localLifeItem],
          };
        });
        const localLineIndex = (plan.budgetLines || []).findIndex((line) =>
          line.label.toLowerCase().includes("local")
        );
        const nextBudgetLines =
          localLineIndex >= 0
            ? plan.budgetLines.map((line, index) =>
                index === localLineIndex
                  ? { ...line, amount: Math.max(0, line.amount + priceEstimate) }
                  : line
              )
            : [
                ...(plan.budgetLines || []),
                { label: "Local Life", amount: priceEstimate, tone: "orange" as const },
              ];

        const nextPlan: TiyaGeneratedPlan = {
          ...plan,
          days: nextDays,
          localMarketPicks: (plan.localMarketPicks || []).map((pick) =>
            pick.id === product.id ? { ...pick, isHighlighted: true } : pick
          ),
          bookingModules: (plan.bookingModules || []).map((module) =>
            module.id === "local-market"
              ? { ...module, isHighlighted: true, readiness: "Ready" as const }
              : module
          ),
          budgetLines: nextBudgetLines,
          totalBudget: Math.max(0, plan.totalBudget + priceEstimate),
        };
        const targetDayPlan =
          plan.days.find((day) => day.day === targetDay) || plan.days[0];
        const nextBasket = targetDayPlan
          ? (upsertBookingBasketItem(bookingBasket, {
              id: `local-life-basket-${product.id}`,
              sourceItemId: `local-life:${product.id}`,
              dayId: targetDayPlan.id,
              day: targetDayPlan.day,
              dayLabel: `Day ${targetDayPlan.day}`,
              category: "Activities",
              serviceType: "activity",
              serviceLabel: "Local Life",
              serviceName: "Activities / Experiences",
              selectedOptionName: product.productName,
              title: product.productName,
              description: product.description,
              dayRange: `Day ${targetDayPlan.day}`,
              from: targetDayPlan.city || intent.fromCity || fromCity,
              to: product.localRegion || intent.toCity || toCity,
              city: product.localRegion || intent.toCity || toCity,
              date: targetDayPlan.date || intent.startDate || "",
              startDate: targetDayPlan.date || intent.startDate || "",
              endDate: targetDayPlan.date || intent.startDate || "",
              travellers: Math.max(1, plan.travellerCount || 1),
              quantity: 1,
              time: "17:30",
              meta: `Local Life · Route fit ${product.routeRelevance}%`,
              unitPrice: priceEstimate,
              priceBasis: "fixed",
              displayPriceLabel: `${formatCurrency(priceEstimate)} estimate`,
              estimatedPrice: priceEstimate,
              price: priceEstimate,
              estimatedTotal: priceEstimate,
              currency: "INR",
              providerName: "TPL Local Life",
              detailSummary: `Local Life item added from the discovery engine with ${product.routeRelevance}% route fit.`,
              details: {
                routeRelevance: `${product.routeRelevance}%`,
                priceRange: product.priceRange,
                authenticityBadge: product.authenticityBadge,
              },
              status: "selected",
              bookingStatus: "selected",
            }) as WorkspaceBookingBasketItem[])
          : bookingBasket;

        onPlanChange?.(nextPlan);
        setBookingBasket(nextBasket);
        syncCanonicalPlannerPayload({ nextBasket, nextPlan });
      },
      changes: [
        {
          label: "Local Life item",
          previousValue: "Not included",
          nextValue: product.productName,
        },
        {
          label: "Region",
          previousValue: "Current route",
          nextValue: product.localRegion,
        },
        {
          label: "Price range",
          previousValue: "Not added",
          nextValue: product.priceRange,
        },
      ],
      summary: `${product.productName} can be added as a Local Life stop or shopping reminder after confirmation.`,
      title: `${action} Impact Preview`,
    });
  }

  function handleCreatorAction(
    action: string,
    creator: TiyaCreatorPick
  ) {
    if (
      action.toLowerCase().includes("view") ||
      action.toLowerCase().includes("explore")
    ) {
      showModuleActionMessage(`${creator.creatorName} details are open in the Creator Recommendations module.`);
      return;
    }

    if (action.toLowerCase().includes("remove")) {
      removeSavedItemFromCurrentTrip(`creator:${creator.id}`);
      logCreatorAction({
        action: "Removed creator bookmark",
        creator,
        previousValue: creator.creatorName,
        nextValue: "Removed from My Trips bookmarks",
        summary: `Removed creator bookmark: ${creator.creatorName}`,
      });
      return;
    }

    if (action.toLowerCase().includes("save")) {
      requestSaveItemToMyTrips(creatorSavedItem(creator));
      return;
    }

    const targetDay = creatorTargetDay(creator);
    const timelineItem = creatorTimelineItem(creator);
    const basketItem = creatorBasketItem(creator);
    const alreadyAdded =
      plan.days.some((day) =>
        day.items.some((item) => item.id === timelineItem.id)
      ) ||
      bookingBasket.some(
        (item) =>
          item.sourceItemId === timelineItem.id ||
          item.id === `creator-basket-${creator.id}`
      );

    if (alreadyAdded) {
      showModuleActionMessage(`${creator.creatorName} is already added to this trip.`);
      return;
    }

    openModuleImpactPreview({
      applyChange: () => {
        if (!targetDay || !basketItem) return;
        const nextDays = plan.days.map((day) =>
          day.id === targetDay.id
            ? {
                ...day,
                items: [...day.items, timelineItem],
                notes:
                  `${day.notes || ""} Creator stop added: ${creator.creatorName} at ${creator.suggestedStopover}.`.trim(),
              }
            : day
        );
        const nextPlan: TiyaGeneratedPlan = {
          ...plan,
          days: nextDays,
        };
        const nextBasket = upsertBookingBasketItem(
          bookingBasket,
          basketItem
        ) as WorkspaceBookingBasketItem[];

        onPlanChange?.(nextPlan);
        setBookingBasket(nextBasket);
        persistCreatorTripUpdate(nextPlan, nextBasket);
        showModuleActionMessage(
          `Creator stop added: ${creator.creatorName} · Day ${targetDay.day} ${timelineItem.time}.`
        );
      },
      changes: [
        {
          label: "Creator experience",
          previousValue: "Not included",
          nextValue: creator.creatorName,
        },
        {
          label: "Destination",
          previousValue: "Current itinerary",
          nextValue: creator.destination,
        },
        {
          label: "Suggested stopover",
          previousValue: "No creator stopover",
          nextValue: creator.suggestedStopover,
        },
        {
          label: "Itinerary slot",
          previousValue: "No creator stop",
          nextValue: targetDay
            ? `Day ${targetDay.day} ${timelineItem.time}`
            : "Next available slot",
        },
        {
          label: "Planner basket",
          previousValue: "Not included",
          nextValue: "Creator experience selected",
        },
      ],
      summary: `${creator.creatorName} will be added as a creator-led experience in Day ${targetDay?.day || 1} ${timelineItem.time}.`,
      title: `Creator stop added: ${creator.creatorName} Preview`,
    });
  }

  function handleCheckoutAction(action: string) {
    if (action.toLowerCase().includes("expert")) {
      openProtectedModuleAction(action);
      return;
    }

    if (action.toLowerCase().includes("booking")) {
      runProtectedWorkspaceAction("continue");
      return;
    }

    openPreparedModuleAction(action);
  }

  function handlePostTripAction(action: string) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Post Trip Insights",
          previousValue: "No post-trip action",
          nextValue: action,
        },
      ],
      id: `post-trip-${Date.now()}`,
      impactItems: [action],
      severity: "minor",
      summary: action,
      title: action,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
    setImpactSuccessMessage(action);

    if (action.toLowerCase().includes("upload")) {
      openProtectedModuleAction(action);
      return;
    }

    openPreparedModuleAction(action);
  }

  function applyGenericImpactToPlan(
    preview: ItineraryImpactPreview,
    nextChangeLog = recentTripChanges
  ) {
    const targetDay = plan.days[0];
    const amount = Number(preview.costDelta || 0);
    const genericItem: TiyaTimelineItem = {
      id: `planner-decision-${preview.id}`,
      time: "Planner Decision",
      title: preview.title.replace(" Preview", "").replace(" Selected", ""),
      location: targetDay?.city || intent.toCity || toCity,
      type: "activity",
      category: "Activities",
      serviceType: "Planner Intelligence",
      description: preview.summary,
      date: targetDay?.date,
      price: amount > 0 ? amount : 0,
      currency: "INR",
      bookingStatus: "recommended",
      detailSummary: preview.impactItems.join(" "),
    };
    const nextDays = plan.days.map((day, index) =>
      day.id === targetDay?.id || (!targetDay && index === 0)
        ? {
            ...day,
            items: (day.items || []).some((item) => item.id === genericItem.id)
              ? day.items
              : [...(day.items || []), genericItem],
            notes:
              `${day.notes || ""} ${preview.title.replace(" Preview", "")}: ${preview.summary}`.trim(),
          }
        : day
    );
    const nextBudgetLines =
      amount === 0
        ? plan.budgetLines
        : [
            ...plan.budgetLines.filter(
              (line) => line.label !== "Planner Intelligence"
            ),
            {
              label: "Planner Intelligence",
              amount,
              tone: amount > 0 ? ("orange" as const) : ("green" as const),
            },
          ];
    const nextPlan: TiyaGeneratedPlan = {
      ...plan,
      days: nextDays,
      budgetLines: nextBudgetLines,
      totalBudget: Math.max(0, plan.totalBudget + amount),
    };
    const basketAmount = amount;
    const genericBasketItem: WorkspaceBookingBasketItem = {
      id: `planner-decision-basket-${preview.id}`,
      sourceItemId: genericItem.id,
      dayId: targetDay?.id,
      day: targetDay?.day || 0,
      dayLabel: targetDay ? `Day ${targetDay.day}` : "Trip",
      category: "Package",
      serviceType: "package",
      serviceLabel: "Planner Intelligence",
      serviceName: "Package",
      selectedOptionName: genericItem.title,
      title: genericItem.title,
      description: preview.summary,
      dayRange: targetDay ? `Day ${targetDay.day}` : "Trip",
      from: intent.fromCity || fromCity,
      to: intent.toCity || toCity,
      finalDestination: intent.toCity || toCity,
      city: targetDay?.city || intent.toCity || toCity,
      date: targetDay?.date || intent.startDate || "",
      startDate: targetDay?.date || intent.startDate || "",
      endDate: targetDay?.date || intent.endDate || "",
      travellers: Math.max(1, plan.travellerCount || 1),
      quantity: 1,
      time: genericItem.time,
      meta: preview.title,
      unitPrice: basketAmount,
      priceBasis: "fixed",
      displayPriceLabel:
        basketAmount < 0
          ? `${formatCurrency(Math.abs(basketAmount))} saving`
          : `${formatCurrency(basketAmount)} impact`,
      estimatedPrice: basketAmount,
      price: basketAmount,
      estimatedTotal: basketAmount,
      currency: "INR",
      providerName: "Tiya Smart Planner Intelligence",
      detailSummary: preview.impactItems.join(" "),
      details: {
        sourceModule: preview.title,
        impact: preview.impactItems,
      },
      status: "selected",
      bookingStatus: "selected",
    };
    const nextBasket = upsertBookingBasketItem(
      bookingBasket,
      genericBasketItem
    ) as WorkspaceBookingBasketItem[];

    onPlanChange?.(nextPlan);
    setBookingBasket(nextBasket);
    syncCanonicalPlannerPayload({ nextBasket, nextChangeLog, nextPlan });
  }

  function applyImmediateImpactAndProceed(preview: ItineraryImpactPreview) {
    if (!isAuthenticated || !user) {
      setPendingProceedImpactPreview(preview);
      showJourneyControlMessage("Login required to proceed to book.");
      openLoginModal({ accountType: "personal", intent: "ai" });
      return;
    }

    const appliedPreview = { ...preview };
    delete appliedPreview.applyChange;
    const appliedChange: TripChangeLogEntry = {
      ...appliedPreview,
      appliedAt: new Date().toISOString(),
    };
    const nextChangeLog = [appliedChange, ...recentTripChanges].slice(0, 8);

    applyGenericImpactToPlan(preview, nextChangeLog);
    setRecentTripChanges(nextChangeLog);
    setImpactSuccessMessage(
      `${preview.title.replace(" Preview", "")} has been synced to your trip.`
    );
    runProtectedWorkspaceAction("continue");
  }

  function applyPendingImpact() {
    if (!pendingImpactPreview) return;

    if (pendingImpactPreview.variant) {
      setSelectedVariantId(pendingImpactPreview.variant.id);
    }
    setHasUnsavedChanges(true);
    const appliedPreview = { ...pendingImpactPreview };
    delete appliedPreview.applyChange;
    const appliedChange: TripChangeLogEntry = {
      ...appliedPreview,
      appliedAt: new Date().toISOString(),
    };
    const nextChangeLog = [appliedChange, ...recentTripChanges].slice(0, 8);
    if (pendingImpactPreview.applyChange) {
      pendingImpactPreview.applyChange();
    } else {
      applyGenericImpactToPlan(pendingImpactPreview, nextChangeLog);
    }
    setRecentTripChanges(nextChangeLog);
    setImpactSuccessMessage(
      `${pendingImpactPreview.title.replace(" Preview", "").replace(" Selected", "")} has been applied to your trip. Review updated selections before booking.`
    );
    setPendingImpactPreview(null);
  }

  function focusImpactArea(change?: TripChangeLogEntry) {
    if (change) setSelectedChangeLog(change);
    setHighlightImpactTarget(true);
    intelligenceWorkspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.setTimeout(() => setHighlightImpactTarget(false), 1800);
  }

  function logSavedTripAction(title: string, summary: string) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Saved Trips & Notes",
          previousValue: "Workspace draft",
          nextValue: summary,
        },
      ],
      id: `saved-trip-action-${Date.now()}`,
      impactItems: [summary],
      severity: "minor",
      summary,
      title,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
  }

  function logExportShareAction(title: string, summary: string) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: false,
      costDelta: 0,
      diffs: [
        {
          label: "Export & Share",
          previousValue: "Workspace active",
          nextValue: summary,
        },
      ],
      id: `export-share-${Date.now()}`,
      impactItems: [summary],
      severity: "minor",
      summary,
      title,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
    setImpactSuccessMessage(summary);
  }

  function logTripReviewAction(title: string, summary: string) {
    const change: TripChangeLogEntry = {
      appliedAt: new Date().toISOString(),
      bookingAffected: title.toLowerCase().includes("confirm"),
      costDelta: 0,
      diffs: [
        {
          label: "Trip Review",
          previousValue: "Review pending",
          nextValue: summary,
        },
      ],
      id: `trip-review-${Date.now()}`,
      impactItems: [summary],
      severity: title.toLowerCase().includes("confirm") ? "major" : "minor",
      summary,
      title,
    };

    setRecentTripChanges((current) => [change, ...current].slice(0, 8));
    setImpactSuccessMessage(summary);
  }

  function handleTripReviewSave(reviewSnapshot: TiyaTripReviewSnapshot) {
    if (!isAuthenticated || !user) {
      openLoginModal({ accountType: "personal", intent: "ai" });
      return "Login required to save review to My Trips.";
    }

    const savedSnapshot = savePlannerTrip({
      ...buildSavedTripSnapshot(),
      userId: user.id,
      owner: {
        id: user.id || user.mobile || user.email || "guest",
        mobile: user.mobile,
        email: user.email,
      },
      readinessScore: reviewSnapshot.scores.bookingReadinessScore,
      plannerState: {
        selectedScenarioId,
        selectedVariantId,
        openCapability,
        reviewSnapshot,
      },
      recentActivity: [
        {
          id: `review-save-${Date.now()}`,
          label: "Trip review saved",
          createdAt: new Date().toISOString(),
        },
        ...(lastTrip?.recentActivity || []),
      ].slice(0, 12),
    });

    setLastSavedAt(savedSnapshot.savedAt);
    setSavedTrips(loadSavedPlannerTrips());
    setLastTrip(savedSnapshot);
    setHasUnsavedChanges(false);
    logTripReviewAction("Review saved", "Trip review saved to My Trips.");
    return "Review saved to My Trips.";
  }

  function handleTripReviewShortcut(shortcut: string) {
    const moduleMap: Record<string, WorkspaceCapabilityId> = {
      "Edit route": "Route Variants & Alternatives",
      "Edit dates": "Journey Timeline & Map",
      "Edit travellers": "Group Planning",
      "Edit stays": "Stay Selection",
      "Edit budget": "Budget Overview",
      "Edit activities": "Experiences & Activities",
      "Edit bundle": "Booking Readiness",
    };
    const moduleId = moduleMap[shortcut] || "Journey Timeline & Map";

    setOpenCapability(moduleId);
    setModuleActionMessage(`${shortcut} opened ${moduleId}.`);
    window.setTimeout(() => {
      intelligenceWorkspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function buildSavedTripSnapshot() {
    const now = new Date().toISOString();
    const activeTripId = lastTrip?.tripId || snapshot.tripId;

    return {
      ...snapshot,
      tripId: activeTripId,
      status: snapshot.status || "Planning",
      createdAt: lastTrip?.createdAt || snapshot.createdAt || now,
      updatedAt: now,
      draftData: {
        route: selectedRoute,
        timeline: journeyTimeline,
        budget: budgetIntelligence,
        selectedItems: bookingBasket,
      },
      plannerState: {
        selectedScenarioId,
        selectedVariantId,
        openCapability,
      },
      readinessScore: tripHealth.overallScore,
      recentActivity: [
        {
          id: `save-${Date.now()}`,
          label: "Trip saved",
          createdAt: now,
        },
        ...(lastTrip?.recentActivity || []),
      ].slice(0, 12),
    };
  }

  function handleSaveCurrentTrip() {
    const savedSnapshot = savePlannerTrip(buildSavedTripSnapshot());
    setLastSavedAt(savedSnapshot.savedAt);
    setSavedTrips(loadSavedPlannerTrips());
    setLastTrip(savedSnapshot);
    setHasUnsavedChanges(false);
    logSavedTripAction("Trip saved", `${savedSnapshot.tripName} saved to workspace.`);
    setModuleActionMessage("Current trip saved.");
  }

  function handleNotesChange(notes: TiyaTripNotesState) {
    setTripNotes(notes);
    setHasUnsavedChanges(true);
    if (lastTrip?.tripId) {
      const nextTrips = updatePlannerTripNotes(lastTrip.tripId, notes);
      setSavedTrips(nextTrips);
      setLastTrip(loadLastPlannerTrip() || lastTrip);
    } else {
      savePlannerDraft({
        ...snapshot,
        notes,
      });
    }
  }

  function performRestorePlannerSnapshot(restoredSnapshot: TiyaPlannerSnapshot) {
    setTripNotes(restoredSnapshot.notes || defaultNotes);
    setLastSavedAt(restoredSnapshot.savedAt);
    setLastTrip(restoredSnapshot);
    setHasUnsavedChanges(false);
    savePlannerDraft(restoredSnapshot);
    setModuleActionMessage(`${restoredSnapshot.tripName} restored for planning.`);
    broadcastPlannerRefresh();
  }

  function restorePlannerSnapshot(restoredSnapshot: TiyaPlannerSnapshot) {
    if (!isAuthenticated || !user) {
      setPendingRestoreSnapshot(restoredSnapshot);
      setModuleActionMessage("Login required to continue planning from a saved trip.");
      openLoginModal({ accountType: "personal", intent: "ai" });
      return;
    }

    performRestorePlannerSnapshot(restoredSnapshot);
  }

  function handleRenameTrip(tripId: string, tripName: string) {
    const nextTrips = renamePlannerTrip(tripId, tripName);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
    logSavedTripAction("Trip renamed", `Trip renamed to ${tripName}.`);
  }

  function handleDuplicateTrip(tripId: string) {
    const nextTrips = duplicatePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
    logSavedTripAction("Trip duplicated", "Saved trip duplicated.");
  }

  function handleDeleteTrip(tripId: string) {
    const nextTrips = deletePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
    logSavedTripAction("Trip deleted", "Saved trip soft deleted.");
  }

  function toggleCapability(id: WorkspaceCapabilityId) {
    setOpenCapability(id);
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

  function removeBasketItem(itemId: string) {
    const removedItem = bookingBasket.find((item) => item.id === itemId);
    const nextBasket = bookingBasket.filter((item) => item.id !== itemId);
    setBookingBasket(nextBasket);

    const change: TripChangeLogEntry = {
      actionType: "Booking item removed",
      affectedDays: removedItem?.day ? [removedItem.day] : [],
      appliedAt: new Date().toISOString(),
      costDelta: -Number(
        removedItem?.estimatedTotal ?? removedItem?.estimatedPrice ?? removedItem?.price ?? 0
      ),
      diffs: [
        {
          label: "Booking basket",
          previousValue: removedItem?.title || "Selected item",
          nextValue: "Removed from selected booking items",
        },
      ],
      module: "Trip Selections",
      riskDelta: 0,
      summary: removedItem
        ? `${removedItem.title} removed from booking selections.`
        : "Booking item removed from trip selections.",
      title: "Booking item removed",
    };

    setRecentTripChanges((current) => {
      const nextChangeLog = [change, ...current].slice(0, 8);
      syncCanonicalPlannerPayload({
        nextBasket,
        nextChangeLog,
      });
      return nextChangeLog;
    });
  }

  const activeOptionItem = optionModal.open
    ? bookingBasket.find((item) => item.id === optionModal.itemId)
    : undefined;
  const activeDetailItem = detailModal.open
    ? bookingBasket.find((item) => item.id === detailModal.itemId)
    : undefined;
  const basketSummaryGroups = buildBasketSummaryGroups(bookingBasket);
  const basketSubtotal = basketSummaryGroups.reduce(
    (total, group) => total + group.total,
    0
  );
  const taxesAndFees = Math.round(basketSubtotal * 0.08);
  const grandTotal = basketSubtotal + taxesAndFees;
  const basketCategories: Array<WorkspaceBookingBasketItem["category"]> = [
    "Transport",
    "Stay",
    "Activities",
    "Meals",
    "Package",
    "Other",
  ];
  const readinessSnapshot: TripReadinessSnapshot =
    tripReadiness ?? {
      allFinalized: false,
      finalizedDays: 0,
      journeyPercent: 0,
      pendingDays: days.map((day) => ({
        date: day.date,
        day: day.day,
        headline: day.headline,
        id: day.id,
        status: "PLANNING",
      })),
      totalDays: days.length,
    };
  const pendingReviewDays = readinessSnapshot.pendingDays;
  const pendingCount = pendingReviewDays.length;
  const intelligenceModuleGroups: {
    title: string;
    modules: {
      id: WorkspaceCapabilityId;
      icon: typeof Plane;
      status?: string;
      subtitle: string;
    }[];
  }[] = [
    {
      title: "Core Intelligence",
      modules: [
        { id: "Journey Timeline & Map", icon: Car, status: "Live", subtitle: "Route flow and movement map" },
        { id: "Route Variants & Alternatives", icon: Car, subtitle: "Compare alternate route scenarios" },
        { id: "Weather Intelligence", icon: BrainCircuit, status: "Signal", subtitle: "Season and travel timing" },
        { id: "Route Risk Analysis", icon: ShieldCheck, subtitle: "Safety and route constraints" },
        { id: "Budget Overview", icon: BadgeIndianRupee, status: "Cost", subtitle: "Estimated spend overview" },
        { id: "Cost Optimization", icon: BadgeIndianRupee, subtitle: "Savings and value improvements" },
        { id: "Booking Readiness", icon: CheckCircle2, status: "Ready", subtitle: "Selected service readiness" },
        { id: "Checkout Readiness", icon: CheckCircle2, subtitle: "Pre-checkout validation" },
      ],
    },
    {
      title: "Travel Planning",
      modules: [
        { id: "Flight & Transport Planning", icon: Plane, subtitle: "Flight, cab and transfer options" },
        { id: "Stay Selection", icon: BedDouble, subtitle: "Hotel and homestay planning" },
        { id: "Experiences & Activities", icon: Ticket, subtitle: "Activities and attractions" },
        { id: "Smart Travel Recommendations", icon: BrainCircuit, status: "AI", subtitle: "Planner recommendations" },
        { id: "Trip Health Score", icon: BrainCircuit, subtitle: "Balance and comfort score" },
        { id: "Local Life", icon: ShoppingBag, subtitle: "Local culture, food, products and experiences" },
        { id: "Creator Recommendations", icon: Clapperboard, subtitle: "Creator-curated places" },
      ],
    },
    {
      title: "Advanced",
      modules: [
        { id: "Expedition Planner", icon: Mountain, subtitle: "Advanced route combinations" },
        { id: "AI Travel Companion", icon: DatabaseZap, status: "AI", subtitle: "Guidance and assistance" },
        { id: "Group Planning", icon: DatabaseZap, subtitle: "Group preference planning" },
        { id: "Travel Memory", icon: DatabaseZap, subtitle: "Personal travel behavior" },
        { id: "Expert Assistance", icon: Plane, subtitle: "Expert review and support" },
      ],
    },
    {
      title: "Utilities",
      modules: [
        { id: "Packing Checklist", icon: BriefcaseBusiness, subtitle: "Packing and preparation" },
        { id: "Saved Trips & Notes", icon: CheckCircle2, subtitle: "Saved journeys and notes" },
        { id: "Export & Share", icon: CheckCircle2, subtitle: "Export, save and share" },
        { id: "Trip Review", icon: CheckCircle2, subtitle: "Full trip review" },
        { id: "Post Trip Insights", icon: Clapperboard, subtitle: "Post-trip ecosystem" },
      ],
    },
  ];
  const activeIntelligenceModule =
    intelligenceModuleGroups
      .flatMap((group) => group.modules)
      .find((module) => module.id === openCapability) ||
    intelligenceModuleGroups[0].modules[0];

  function renderIntelligenceModule(id: WorkspaceCapabilityId) {
    switch (id) {
      case "Journey Timeline & Map":
        return <TiyaJourneyTimeline days={journeyTimeline} map={journeyMap} status={journeyStatus} />;
      case "Route Variants & Alternatives":
        return (
          <>
            <TiyaScenarioEngine intent={intent} plan={plan} selectedScenarioId={selectedScenarioId as never} onScenarioSelect={handleScenarioSelect} onScenarioMerge={handleScenarioMerge} />
            <TiyaTripVariantBuilder intent={intent} plan={plan} selectedVariantId={selectedVariantId as never} onVariantSelect={handleVariantSelect} onVariantApply={handleVariantApply} />
          </>
        );
      case "Weather Intelligence":
        return <TiyaSeasonalWeather intent={intent} days={days} selectedRoute={selectedRoute} onAdviceAction={handleWeatherAdviceAction} />;
      case "Route Risk Analysis":
        return <TiyaRulesEnginePanel intent={intent} plan={plan} days={days} selectedRoute={selectedRoute} onRuleAction={handleRuleAction} />;
      case "Budget Overview":
        return <TiyaBudgetPreview lines={plan.budgetLines} total={plan.totalBudget} budgetRange={intent.customBudgetAmount || intent.budgetTier} onBudgetAction={handleBudgetAction} />;
      case "Cost Optimization":
        return <TiyaCostOptimization intent={intent} plan={plan} days={days} selectedRoute={selectedRoute} onSuggestionAction={handleCostSuggestionAction} />;
      case "Booking Readiness":
        return (
          <TiyaBookingReadyLayer
            modules={plan.bookingModules}
            intent={intent}
            plan={plan}
            days={days}
            selectedRoute={selectedRoute}
            changeHistory={recentTripChanges}
            onProceedToBook={(serviceName) => {
              showJourneyControlMessage(`${serviceName} handoff prepared. Proceeding to review.`);
              runProtectedWorkspaceAction("continue");
            }}
          />
        );
      case "Checkout Readiness":
        return (
          <TiyaCheckoutBridge
            intent={intent}
            plan={plan}
            days={days}
            selectedRoute={selectedRoute}
            changeHistory={recentTripChanges}
            onAction={handleCheckoutAction}
            onProceedToBook={() => runProtectedWorkspaceAction("continue")}
          />
        );
      case "Flight & Transport Planning":
        return (
          <TransportPlanningEngine
            days={days}
            intent={intent}
            plan={plan}
            selectedRoute={selectedRoute}
            onApplyPlan={handleTransportPlanAction}
            onProceedToBook={handleTransportProceedToBook}
          />
        );
      case "Stay Selection":
        return (
          <StayPlanningEngine
            days={days}
            intent={intent}
            plan={plan}
            selectedRoute={selectedRoute}
            onApplyPlan={handleStayPlanAction}
            onProceedToBook={handleStayProceedToBook}
          />
        );
      case "Experiences & Activities":
        return (
          <>
            <TiyaExperiencePlanner
              intent={intent}
              plan={plan}
              days={days}
              selectedRoute={selectedRoute}
              onExperienceAction={handleExperienceAction}
            />
            <TiyaSuggestionCards
              suggestions={plan.suggestions}
              onSuggestionAction={handleSmartSuggestionAction}
            />
          </>
        );
      case "Smart Travel Recommendations":
        return (
          <TiyaAIRecommendationRail
            recommendations={recommendations}
            appliedRecommendationIds={appliedRecommendationIds}
            dismissedRecommendationIds={dismissedRecommendationIds}
            savedRecommendationIds={Array.from(
              new Set([
                ...savedRecommendationIds,
                ...recommendations
                  .filter((recommendation) =>
                    savedItemIds.includes(`recommendation:${recommendation.id}`)
                  )
                  .map((recommendation) => recommendation.id),
              ])
            )}
            onApply={handleApplyRecommendation}
            onDismiss={handleDismissRecommendation}
            onSave={handleSaveRecommendationToMyTrips}
          />
        );
      case "Trip Health Score":
        return (
          <div className="trip-health-overflow-fix w-full max-w-full min-w-0 overflow-hidden pb-20 pr-4 lg:pb-6">
            <TiyaOperatingDashboard
              health={tripHealth}
              budget={budgetIntelligence}
              alerts={smartAlerts}
              recommendations={recommendations}
              stats={travelStats}
            />
            <style>{`
              .trip-health-overflow-fix,
              .trip-health-overflow-fix * {
                box-sizing: border-box;
                max-width: 100%;
                min-width: 0;
              }

              .trip-health-overflow-fix > section,
              .trip-health-overflow-fix > section > div:nth-child(2),
              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                overflow: hidden;
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child {
                padding-bottom: 5rem;
              }

              @media (min-width: 1024px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child {
                  padding-bottom: 1.5rem;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child p,
              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child span,
              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child h3 {
                overflow-wrap: anywhere;
                white-space: normal;
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 1.25rem;
              }

              @media (min-width: 1280px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) {
                  grid-template-columns: 260px minmax(0, 1fr) !important;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) > div:nth-child(2) {
                min-width: 0;
                overflow: hidden;
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 0.75rem;
              }

              @media (min-width: 768px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) {
                  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 0.75rem;
              }

              @media (min-width: 768px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(3) {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 1rem;
              }

              @media (min-width: 1024px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(3) {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
              }

              @media (min-width: 1536px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(3) {
                  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(4) {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 1rem;
              }

              @media (min-width: 1024px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(4) {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
              }

              .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(5) > div {
                display: grid;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 0.75rem;
              }

              @media (min-width: 1024px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(5) > div {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
              }

              @media (min-width: 1536px) {
                .trip-health-overflow-fix > section > div:nth-child(2) > section:first-child > div:nth-child(5) > div {
                  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                }
              }
            `}</style>
          </div>
        );
      case "Local Life":
        return (
          <TiyaLocalMarketPicks
            products={plan.localMarketPicks}
            savedProductIds={savedItemIds
              .filter((id) => id.startsWith("local-life:"))
              .map((id) => id.replace("local-life:", ""))}
            onProductAction={handleMarketAction}
          />
        );
      case "Creator Recommendations":
        return (
          <TiyaCreatorPicks
            creators={plan.creatorPicks}
            addedCreatorIds={bookingBasket
              .filter((item) => item.sourceItemId?.startsWith("creator-stop-"))
              .map((item) => item.sourceItemId?.replace("creator-stop-", "") || "")}
            savedCreatorIds={savedItemIds
              .filter((id) => id.startsWith("creator:"))
              .map((id) => id.replace("creator:", ""))}
            onCreatorAction={handleCreatorAction}
          />
        );
      case "Expedition Planner":
        return (
          <TiyaExpeditionBuilder
            intent={intent}
            selectedScenarioId={selectedScenarioId}
            selectedVariantId={selectedVariantId}
            appliedStrategyId={bookingBasket
              .find((item) => item.sourceItemId?.startsWith("expedition-strategy:"))
              ?.sourceItemId?.replace("expedition-strategy:", "")}
            savedStrategyIds={savedItemIds
              .filter((id) => id.startsWith("expedition-strategy:"))
              .map((id) => id.replace("expedition-strategy:", ""))}
            onStrategyAction={handleExpeditionStrategyAction}
          />
        );
      case "AI Travel Companion":
        return (
          <TiyaTravelCompanion
            intent={intent}
            plan={plan}
            selectedRoute={selectedRoute}
            appliedActionIds={bookingBasket
              .filter((item) => item.sourceItemId?.startsWith("tiya-copilot:"))
              .map((item) => item.sourceItemId?.replace("tiya-copilot:", "") || "")}
            onCoPilotAction={handleCoPilotAction}
          />
        );
      case "Group Planning":
        return (
          <TiyaGroupPlanner
            intent={intent}
            plan={plan}
            savedDecisionIds={savedItemIds
              .filter((id) => id.startsWith("group-decision:"))
              .map((id) => id.replace("group-decision:", ""))}
            appliedDecisionIds={bookingBasket
              .filter((item) => item.sourceItemId?.startsWith("group-decision:"))
              .map((item) => item.sourceItemId?.replace("group-decision:", "") || "")}
            onGroupDecisionAction={handleGroupDecisionAction}
          />
        );
      case "Travel Memory":
        return <TiyaMemoryDashboard intent={intent} />;
      case "Expert Assistance":
        return (
          <TiyaExpertReview
            intent={intent}
            plan={plan}
            selectedRoute={selectedRoute}
            onExpertRequestSaved={handleExpertRequestSaved}
          />
        );
      case "Packing Checklist":
        return (
          <TiyaPackingEngine
            intent={intent}
            selectedRoute={selectedRoute}
            onChecklistUpdate={handlePackingChecklistUpdate}
          />
        );
      case "Saved Trips & Notes":
        return (
          <>
            <TiyaSavedTripLibrary
              savedTrips={savedTrips}
              lastTrip={lastTrip}
              currentSnapshot={snapshot}
              onSaveCurrent={handleSaveCurrentTrip}
              onRestore={restorePlannerSnapshot}
              onRename={handleRenameTrip}
              onDuplicate={handleDuplicateTrip}
              onDelete={handleDeleteTrip}
            />
            <TiyaTripNotes
              notes={tripNotes}
              activeTrip={lastTrip}
              onChange={handleNotesChange}
              onNoteActivity={(label) =>
                logSavedTripAction(label, `${label} in trip notes.`)
              }
            />
          </>
        );
      case "Export & Share":
        return (
          <>
            <TiyaExportItinerary snapshot={snapshot} selectedRoute={selectedRoute} smartAlerts={smartAlerts} />
            <TiyaPlannerActions
              snapshot={snapshot}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSavedAt={lastSavedAt}
              selectedRoute={selectedRoute}
              smartAlerts={smartAlerts}
              healthScore={tripHealth.overallScore}
              readinessScore={journeyStatus.bookingReadiness}
              onActionLog={logExportShareAction}
              onSaved={(savedSnapshot) => {
                setLastSavedAt(savedSnapshot.savedAt);
                setSavedTrips(loadSavedPlannerTrips());
                setLastTrip(loadLastPlannerTrip() || savedSnapshot);
                setHasUnsavedChanges(false);
              }}
            />
          </>
        );
      case "Trip Review":
        return (
          <TiyaTripReview
            intent={intent}
            plan={plan}
            days={days}
            selectedRoute={selectedRoute}
            selectedScenarioId={selectedScenarioId}
            selectedVariantId={selectedVariantId}
            smartAlerts={smartAlerts}
            recommendationChangeLog={recentTripChanges.map((change) => ({
              id: change.id || `trip-review-change-${change.appliedAt}`,
              recommendationId: change.id || `trip-review-change-${change.appliedAt}`,
              title: change.title,
              summary: change.summary,
              reason: change.diffs.map((diff) => diff.label).join(", ") || "Planner change applied.",
              impact: change.impactItems?.join(", ") || change.summary,
              appliedAt: change.appliedAt,
              category: "Route",
              costDelta: change.costDelta,
              actionType: change.actionType,
              affectedDays: change.affectedDays?.map((day) => `Day ${day}`) || [],
              sourceModule: "Transparent Itinerary Updates",
              previousState: "Workspace plan",
              newState: change.summary,
              riskImpact: change.riskDelta,
            }))}
            onConfirmReview={(summary) =>
              logTripReviewAction("Trip plan confirmed", summary)
            }
            onEditShortcut={handleTripReviewShortcut}
            onExpertReviewRequested={(payload) =>
              logTripReviewAction(
                "Expert review requested",
                `Expert review requested. Lead ${payload.leadId}.`
              )
            }
            onSaveReview={handleTripReviewSave}
          />
        );
      case "Post Trip Insights":
        return <TiyaPostTripEcosystem intent={intent} plan={plan} days={days} selectedRoute={selectedRoute} onAction={handlePostTripAction} />;
      default:
        return null;
    }
  }

  function reviewPendingDay(dayId?: string) {
    const targetDayId = dayId || pendingReviewDays[0]?.id;

    if (!targetDayId) return;

    setShowTripSelections(false);
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("tpl:return-to-itinerary-day", {
          detail: { dayId: targetDayId },
        })
      );
    }, 0);
  }

  const latestTripChange = recentTripChanges[0];
  const latestChangeStatus = latestTripChange
    ? classifyChangeStatus(latestTripChange)
    : "success";
  const latestChangeStyle = changeStatusStyles[latestChangeStatus];
  const LatestChangeIcon = latestChangeStyle.Icon;
  const moduleActionStatus = moduleActionMessage
    ? classifyActionStatus(moduleActionMessage)
    : "success";
  const moduleActionStyle = changeStatusStyles[moduleActionStatus];
  const ModuleActionIcon = moduleActionStyle.Icon;

  return (
    <>
      {showTripSelections ? (
      <section
        id="booking-basket-checkout"
        className="relative mt-6 w-full max-w-full min-w-0 overflow-x-hidden rounded-[2rem] border border-orange-100/80 bg-white/88 shadow-[0_30px_96px_rgba(249,115,22,0.12)] backdrop-blur-2xl"
      >
        <div className="border-b border-orange-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,237,0.92),rgba(239,246,255,0.84))] px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setShowTripSelections(false);
              window.setTimeout(() => {
                window.dispatchEvent(new Event("tpl:return-to-itinerary"));
              }, 0);
            }}
            className="mb-4 inline-flex min-h-9 items-center justify-center rounded-full border border-orange-100 bg-white px-4 text-xs font-black text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            ← Back to Itinerary
          </button>
          <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/82 p-4 shadow-[0_18px_48px_rgba(249,115,22,0.10)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                <Plane size={15} />
                Primary trip flow
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Trip Selections & Checkout
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {bookingBasket.length} Selected Item
                {bookingBasket.length === 1 ? "" : "s"} ·{" "}
                {formatCurrency(grandTotal)} Estimated Value
              </p>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Review your selected transport, stays, activities and experiences before checkout.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-950 px-4 py-3 text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)] sm:min-w-[260px]">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                Total Price
              </span>
              <span className="text-2xl font-black leading-none">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid w-full min-w-0 gap-5 p-3 sm:p-5 lg:p-6">
          <section className="grid gap-3 rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed,#ffffff,#eff6ff)] p-4 shadow-[0_18px_52px_rgba(15,23,42,0.08)] lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
                  Trip Summary
                </p>
                <h3 className="mt-1 break-words text-xl font-black text-slate-950">
                  Booking selection overview
                </h3>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                {bookingBasket.length > 0 ? "Booking Ready" : "Pending"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Selected", bookingBasket.length],
                ["Days", readinessSnapshot.totalDays],
                ["Ready", readinessSnapshot.finalizedDays],
                ["Pending", pendingCount],
              ].map(([label, value]) => (
                <div
                  key={`mobile-trip-summary-${label}`}
                  className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Estimated Value
                </span>
                <span className="font-mono text-base font-black text-orange-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-2 rounded-[1.5rem] border border-cyan-100 bg-white/88 p-3 shadow-[0_18px_52px_rgba(15,23,42,0.08)] lg:hidden">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">
              Selected Categories
            </p>
            {basketCategories.map((category, index) => {
              const categoryItems = bookingBasket.filter(
                (item) => item.category === category
              );
              const CategoryIcon = categoryIconForSelection(category);

              return (
                <details
                  key={`mobile-category-accordion-${category}-${index}`}
                  className="group rounded-2xl border border-slate-100 bg-white"
                  open={categoryItems.length > 0 && index === 0}
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                        <CategoryIcon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-black text-slate-950">
                          {String(category).includes("Local")
                            ? "Local Life"
                            : category}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                          {categoryItems.length} selected item{categoryItems.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </span>
                    <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-700">
                      {categoryItems.length}
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
                    {categoryItems.length > 0
                      ? categoryItems
                          .slice(0, 3)
                          .map((item) => item.selectedOptionName || item.title)
                          .join(" · ")
                      : "No item selected in this category yet."}
                  </div>
                </details>
              );
            })}
          </section>

          <section
            className={`rounded-[1.5rem] border p-4 shadow-[0_18px_52px_rgba(15,23,42,0.08)] ${
              readinessSnapshot.allFinalized
                ? "border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#ffffff,#f0fdf4)]"
                : "border-orange-100 bg-[linear-gradient(135deg,#fff7ed,#ffffff,#eff6ff)]"
            }`}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                      readinessSnapshot.allFinalized
                        ? "text-emerald-700"
                        : "text-orange-700"
                    }`}
                  >
                    Trip Readiness
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                      readinessSnapshot.allFinalized
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {readinessSnapshot.finalizedDays} /{" "}
                    {readinessSnapshot.totalDays} Finalized
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  {readinessSnapshot.allFinalized
                    ? "✓ Trip Planning Complete"
                    : "⚠ Trip planning is still in progress"}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {readinessSnapshot.allFinalized
                    ? "All days reviewed and finalized. Ready to generate final journey."
                    : `${pendingCount} day${pendingCount === 1 ? "" : "s"} require review. Finalize all days before generating the final journey.`}
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      readinessSnapshot.allFinalized
                        ? "bg-gradient-to-r from-emerald-400 to-lime-300"
                        : "bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300"
                    }`}
                    style={{ width: `${readinessSnapshot.journeyPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-black text-slate-500">
                  {readinessSnapshot.finalizedDays} /{" "}
                  {readinessSnapshot.totalDays} Finalized
                </p>

                {!readinessSnapshot.allFinalized ? (
                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Pending Review
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pendingReviewDays.map((day) => (
                        <button
                          key={`pending-review-${day.id}`}
                          type="button"
                          onClick={() => reviewPendingDay(day.id)}
                          className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                          Day {String(day.day).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[220px] lg:grid-cols-1">
                {!readinessSnapshot.allFinalized ? (
                  <button
                    type="button"
                    onClick={() => reviewPendingDay()}
                    className="min-h-11 rounded-full border border-orange-200 bg-[#FF8A1F] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,138,31,0.22)] transition hover:bg-[#FFA63A]"
                  >
                    Review Pending Days
                  </button>
                ) : null}
                {myTripsSaveMessage ? (
                  <p className="text-center text-xs font-black text-emerald-700 lg:text-right">
                    {myTripsSaveMessage}
                  </p>
                ) : null}
                {savedItemToast ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-800 lg:text-right">
                    <p>{savedItemToast.message}</p>
                    <p className="mt-0.5 truncate text-[11px] text-emerald-700">
                      {savedItemToast.itemName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedItemsOpen(true);
                        setSavedItemToast(null);
                      }}
                      className="mt-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-black text-emerald-700"
                    >
                      View Saved
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="grid min-w-0 gap-3">
              {bookingBasket.length === 0 ? (
                <div className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                    <Plane size={20} />
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    No trip selections added yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    Add transport, stays, activities or experiences from your itinerary to prepare checkout.
                  </p>
                </div>
              ) : null}

              {basketCategories.map((category, categoryIndex) => {
                const categoryItems = bookingBasket.filter(
                  (item) => item.category === category
                );
                const CategoryIcon = categoryIconForSelection(category);

                if (!categoryItems.length) return null;

                return (
                  <section key={`basket-category-${category}-${categoryIndex}`} className="grid gap-2">
                    <div className="rounded-[1.35rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed,#ffffff)] px-4 py-4 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                          <CategoryIcon size={16} />
                        </span>
                        <h3 className="text-lg font-black tracking-tight text-slate-950">
                          {categorySelectionHeading(category)}
                        </h3>
                      </div>
                      <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-600 shadow-sm">
                        {categoryItems.length} Selected Item
                        {categoryItems.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {categoryItems.map((item, index) => {
                      const ItemIcon = selectionIconForItem(item);
                      const itemEstimate = calculateBookingItemTotal(item);
                      const itemBasisNote = basisNoteForItem(item);
                      const dayDateLabel = formatBasketDayLabel(item);
                      const stackedDay = stackedBasketDayLabel(item);
                      const serviceLabel = selectionServiceLabel(item);

                      return (
                        <article
                          key={`${item.id ?? item.sourceItemId ?? item.title ?? "basket-item"}-${index}`}
                          className="overflow-hidden rounded-[1.75rem] border border-orange-100/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,247,237,0.76),rgba(239,246,255,0.72))] shadow-[0_22px_70px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_86px_rgba(15,23,42,0.12)]"
                        >
                          <div className="grid min-w-0 gap-4 p-3 xl:grid-cols-[138px_minmax(0,1fr)_190px] xl:items-center">
                            <div className="rounded-[1.35rem] border border-white/80 bg-white/78 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_12px_28px_rgba(249,115,22,0.24)]">
                                <ItemIcon size={23} />
                              </div>
                              <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                                {serviceLabel}
                              </p>
                              <div className="mx-auto mt-2.5 w-fit rounded-2xl border border-orange-100 bg-orange-50 px-3 py-1.5">
                                <p className="font-mono text-sm font-black leading-none text-orange-700">
                                  {stackedDay.day}
                                </p>
                                <p className="mt-1 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                  {stackedDay.date}
                                </p>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                <h3 className="min-w-0 break-words text-lg font-black leading-tight text-slate-950 xl:whitespace-nowrap">
                                  {item.selectedOptionName}
                                </h3>
                                <span className="hidden shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-700 xl:inline-flex">
                                  ✓ TPL Verified
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                {getBookingItemRouteLabel(item)}
                              </p>
                              <div className="mt-2.5 grid gap-1.5 text-xs font-bold text-slate-500 sm:grid-cols-2 2xl:grid-cols-4">
                                <span className="rounded-2xl border border-slate-100 bg-white/72 px-2.5 py-1.5">
                                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Route</span>
                                  {item.from && item.to ? `${item.from} → ${item.to}` : item.city}
                                </span>
                                <span className="rounded-2xl border border-slate-100 bg-white/72 px-2.5 py-1.5">
                                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Coverage</span>
                                  {item.dayRange || dayDateLabel}
                                </span>
                                <span className="rounded-2xl border border-slate-100 bg-white/72 px-2.5 py-1.5">
                                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Travellers</span>
                                  {item.travellers}
                                </span>
                                <span className="rounded-2xl border border-slate-100 bg-white/72 px-2.5 py-1.5">
                                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Type</span>
                                  {itemBasisNote || getBookingItemInvoiceServiceLabel(item)}
                                </span>
                              </div>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-100 bg-white/82 p-3 text-left xl:text-right">
                              <div className="mb-2 flex justify-start xl:justify-end">
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 shadow-[0_8px_22px_rgba(16,185,129,0.12)]">
                                  ✓ Selected
                                </span>
                              </div>
                              <p className="text-2xl font-black leading-none text-slate-950">
                                {getPriceLabel(item)}
                              </p>
                              <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                                {itemBasisNote || getBookingItemPriceBreakup(item).basisLabel}
                              </p>
                              {itemEstimate !== item.unitPrice ? (
                                <p className="mt-1.5 text-[11px] font-black text-orange-700">
                                  Estimated {formatCurrency(itemEstimate)}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="border-t border-orange-100/70 bg-white/72 px-3 py-2.5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailModal({ itemId: item.id, open: true })
                                }
                                className="min-h-11 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setOptionModal({ itemId: item.id, open: true })
                                }
                                className="min-h-11 w-full rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100 sm:w-auto"
                              >
                                View Options
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBasketItem(item.id)}
                                className="min-h-11 w-full rounded-full border border-rose-100 bg-white px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50 sm:w-auto"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                );
              })}
            </div>

            <aside className="h-fit self-start rounded-3xl border border-white/80 bg-[#061839] p-4 text-white shadow-[0_24px_76px_rgba(6,24,57,0.22)] lg:sticky lg:top-6">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <CheckCircle2 size={15} />
                Price Summary
              </div>
              <h3 className="mt-2 text-xl font-black">Trip Cost Snapshot</h3>

              <div className="mt-4 grid gap-2">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                      Selected Items
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {bookingBasket.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-300/18 bg-orange-400/10 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-100/65">
                      Estimated Trip Value
                    </p>
                    <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(24px,2vw,30px)] font-black leading-none text-white">
                      {formatCurrency(grandTotal)}
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-4 text-orange-100/55">
                      Before final checkout adjustments
                    </p>
                  </div>
                </div>

                {bookingBasket.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                    <p className="text-sm font-black text-white">
                      No trip selections added yet.
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      Add transport, stays, activities or experiences from your itinerary to see checkout estimate.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {basketSummaryGroups
                    .filter((group) => group.lines.length > 0)
                    .map((group, groupIndex) => {
                      const GroupIcon = basketSummaryIconForGroup(group.id);

                      return (
                        <section key={`${group.id ?? group.title ?? "basket-group"}-${groupIndex}`} className="border-t border-white/10 pt-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-cyan-100">
                                <GroupIcon size={15} />
                              </span>
                              <div>
                                <h4 className="text-lg font-semibold text-white">
                                  {group.title}
                                </h4>
                                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/42">
                                  {group.lines.length} item
                                  {group.lines.length === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                            <span className="text-lg font-semibold text-orange-100">
                              {formatCurrency(group.total)}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {group.lines.map((line, index) => (
                              <article
                                key={`${line.id ?? line.title ?? "basket-line"}-${index}`}
                                className="flex items-start justify-between gap-3 rounded-2xl bg-white/[0.055] px-3 py-2"
                              >
                                <h5 className="min-w-0 break-words text-[15px] font-medium leading-5 text-white/88 lg:truncate">
                                  {line.title}
                                </h5>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-semibold text-white">
                                    {formatCurrency(line.estimatedTotal)}
                                  </p>
                                <p className="mt-1 max-w-full break-words text-[13px] font-medium leading-5 text-white/60 xl:max-w-[190px] xl:whitespace-nowrap">
                                    {basketCalculationDisplay(line)}
                                  </p>
                                </div>
                            </article>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="text-[12px] font-medium text-white/55">
                    Subtotal
                  </span>
                  <span className="text-sm font-black text-white">
                    {formatCurrency(basketSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5">
                  <span className="text-[12px] font-medium text-white/55">
                    Estimated taxes & fees
                  </span>
                  <span className="text-sm font-black text-white">
                    {formatCurrency(taxesAndFees)}
                  </span>
                </div>

                {bookingProceedBlocker ? (
                  <p className="rounded-2xl border border-rose-300/24 bg-rose-400/10 px-3 py-2 text-xs font-black leading-5 text-rose-100">
                    {bookingProceedBlocker}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => runProtectedWorkspaceAction("continue")}
                  className="mt-2 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,123,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(255,123,0,0.34)]"
                >
                  Proceed to Book →
                </button>
              </div>

            </aside>
          </div>

          <div className="flex justify-center pb-10 pt-12 sm:pb-14 sm:pt-14">
            <div className="grid w-full max-w-[460px] justify-items-center gap-3">
            {bookingProceedBlocker ? (
              <p className="w-full rounded-2xl border border-rose-300/24 bg-rose-400/10 px-3 py-2 text-center text-xs font-black leading-5 text-rose-100">
                {bookingProceedBlocker}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => runProtectedWorkspaceAction("continue")}
              className="inline-flex min-h-14 w-full max-w-[420px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-8 text-base font-black text-white shadow-[0_18px_38px_rgba(255,123,0,0.30)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(255,123,0,0.36)] sm:min-w-[320px] sm:w-auto"
            >
              Proceed to Book →
            </button>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {partialBookingConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/65 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-lg overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:w-full sm:rounded-3xl">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,138,31,0.18),rgba(34,211,238,0.10),rgba(7,17,31,0.98))] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                Partial Trip Booking
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Continue with selected items?
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                You have selected only some items/days for booking. Some itinerary days are not finalized yet. Do you want to continue with the selected booking items?
              </p>
            </div>

            <div className="grid gap-4 p-5">
              <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/10 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
                  Selected booking items
                </p>
                <p className="mt-1 font-mono text-2xl font-black text-white">
                  {bookingBasket.length}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-cyan-100/70">
                  Review will use only the items currently in your booking basket.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={continueWithPartialBooking}
                  className="min-h-11 rounded-full bg-[#FF8A1F] px-4 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(255,138,31,0.22)] transition hover:bg-[#FFA63A]"
                >
                  Continue with Selected Items
                </button>
                <button
                  type="button"
                  onClick={() => setPartialBookingConfirmOpen(false)}
                  className="min-h-11 rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-black text-slate-100 transition hover:bg-white/[0.12]"
                >
                  Go Back and Finalize Days
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeDetailItem ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-3xl flex-col overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_30px_110px_rgba(15,23,42,0.24)] sm:max-h-[85vh] sm:w-full sm:rounded-3xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff,#eff6ff,#fff7ed)] p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                  {bookingDisplayType(activeDetailItem.serviceType)} details
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {activeDetailItem.selectedOptionName || activeDetailItem.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatBasketDayLabel(activeDetailItem)} · {activeDetailItem.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal({ itemId: "", open: false })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 overflow-y-auto p-4 sm:p-5">
              <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
                  Description
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                  {activeDetailItem.description ||
                    activeDetailItem.detailSummary ||
                    "Selected itinerary option prepared for checkout."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Route", getBookingItemRouteLabel(activeDetailItem)],
                  ["Coverage", getBookingItemCoverageLabel(activeDetailItem)],
                  ["Timing", activeDetailItem.time || activeDetailItem.date],
                  ["Travellers", `${activeDetailItem.travellers}`],
                  ["Pricing", getPriceLabel(activeDetailItem)],
                  ["Calculation", getBookingItemPriceBreakup(activeDetailItem).calculationLabel],
                ].map(([label, value], index) => (
                  <div
                    key={`${activeDetailItem.id}-detail-${label}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-white px-3 py-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              {activeDetailItem.details ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(activeDetailItem.details).map(([label, value], index) => (
                    <div
                      key={`${activeDetailItem.id}-extra-${label}-${index}`}
                      className="rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-3"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                        {label.replace(/([A-Z])/g, " $1")}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {activeOptionItem ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-2xl overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_30px_110px_rgba(15,23,42,0.24)] sm:w-full sm:rounded-3xl">
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
              {buildBasketOptions(activeOptionItem).map((option, index) => (
                <article
                  key={`${option.id ?? option.name ?? "basket-option"}-${index}`}
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

      {savedItemsOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="flex max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-3xl min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_110px_rgba(0,0,0,0.46)] sm:max-h-[86vh] sm:w-full sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,138,31,0.09),rgba(7,17,31,0.96))] p-5">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Workspace saved items
                </p>
                <h3 className="mt-1 break-words text-2xl font-black text-white">
                  My Trip Bookmarks ({savedItems.length})
                </h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                  Bookmarks stay separate from itinerary selections until you add them from their module.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSavedItemsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-slate-200 transition hover:bg-white/[0.14]"
                aria-label="Close saved items"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              {savedItemsByType.length ? (
                <div className="grid gap-4">
                  {savedItemsByType.map(({ group, items }, groupIndex) => (
                    <div
                      key={`saved-group-${group}-${groupIndex}`}
                      className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                          <Bookmark size={14} />
                          {group === "Creators" ? "Creator Bookmarks" : group}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
                          {items.length} saved
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3">
                        {items.map((item, index) => (
                          <article
                            key={`${item.id ?? item.title ?? item.type ?? "saved-item"}-${index}`}
                            className="min-w-0 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <span className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">
                                  Bookmarked
                                </span>
                                <h4 className="mt-2 break-words text-base font-black text-white">
                                  {item.title}
                                </h4>
                                {item.subtitle ? (
                                  <p className="mt-1 break-words text-xs font-semibold leading-5 text-white/62">
                                    {item.subtitle}
                                  </p>
                                ) : null}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black text-white/70">
                                    {item.category || item.type}
                                  </span>
                                  {item.city || item.destination ? (
                                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black text-white/70">
                                      {item.city || item.destination}
                                    </span>
                                  ) : null}
                                  {item.day ? (
                                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black text-white/70">
                                      {item.day}
                                      {item.time ? ` · ${item.time}` : ""}
                                    </span>
                                  ) : null}
                                  {typeof item.estimatedCost === "number" ? (
                                    <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-black text-orange-100">
                                      {formatCurrency(item.estimatedCost)}
                                    </span>
                                  ) : null}
                                  <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black text-cyan-100">
                                    {item.sourceModule}
                                  </span>
                                </div>
                              </div>

                              <div className="grid shrink-0 gap-2 sm:min-w-[150px]">
                                <button
                                  type="button"
                                  onClick={() => openModuleForSavedItem(item)}
                                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-400"
                                >
                                  Add to Trip
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSavedItemFromCurrentTrip(item.id)}
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-300/20 bg-red-400/10 px-3 text-xs font-black text-red-100 transition hover:bg-red-400/15"
                                >
                                  <Trash2 size={14} />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                    <Bookmark size={20} />
                  </div>
                  <h4 className="mt-3 text-lg font-black text-white">
                    No bookmarks saved yet
                  </h4>
                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-300">
                    Save Local Life, recommendations, stays, transport or route ideas to keep them inside this trip draft.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {pendingImpactPreview ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/65 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-2xl overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_110px_rgba(0,0,0,0.42)] sm:w-full sm:rounded-3xl">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,138,31,0.16),rgba(34,211,238,0.08),rgba(7,17,31,0.96))] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                Itinerary Impact Preview
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {pendingImpactPreview.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                {pendingImpactPreview.summary}
              </p>
            </div>

            <div className="grid gap-4 p-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  The following changes will occur
                </p>
                <div className="mt-3 grid gap-2">
                  {pendingImpactPreview.impactItems.map((item, index) => (
                    <div
                      key={`${pendingImpactPreview.id}-impact-${item}-${index}`}
                      className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-black text-slate-100"
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>

              {pendingImpactPreview.bookingAffected ? (
                <div className="rounded-2xl border border-amber-300/24 bg-amber-400/10 px-4 py-3 text-sm font-black text-amber-100">
                  Your booking selections may have changed. Please review Trip Selections before proceeding to booking.
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={applyPendingImpact}
                  className="min-h-11 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,123,0,0.24)] transition hover:-translate-y-0.5"
                >
                  Apply Changes
                </button>
                <button
                  type="button"
                  onClick={() => setPendingImpactPreview(null)}
                  className="min-h-11 rounded-full border border-white/12 bg-white/[0.06] px-5 text-sm font-black text-slate-100 transition hover:bg-white/[0.12]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedChangeLog ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/65 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="max-h-[calc(100dvh-2.5rem)] w-[92vw] max-w-2xl overflow-y-auto overflow-x-hidden rounded-[20px] border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_110px_rgba(0,0,0,0.42)] sm:w-full sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(7,17,31,0.96))] p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  View Changes
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {selectedChangeLog.title.replace(" Selected", " applied")}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {new Date(selectedChangeLog.appliedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChangeLog(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/[0.12]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 p-5">
              {selectedChangeLog.diffs.map((diff, index) => (
                <div
                  key={`${selectedChangeLog.id}-${diff.label}-${index}`}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.055] p-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    {diff.label}
                  </p>
                  <div className="grid gap-1 text-sm font-black text-slate-100 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                    <span className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2 text-slate-400">
                      {diff.previousValue}
                    </span>
                    <span className="text-cyan-100">→</span>
                    <span className="min-w-0 rounded-xl bg-cyan-300/10 px-3 py-2 text-white">
                      {diff.nextValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <section className="mt-6 w-full max-w-full min-w-0 overflow-x-hidden rounded-[2rem] border border-white/80 bg-[#07111F] pr-0 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(13,27,47,0.98),rgba(7,17,31,0.96),rgba(18,36,61,0.92))] px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                <ShieldCheck size={15} />
                Travel intelligence workspace
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Advanced Travel Intelligence Center
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
                Open any intelligence module to analyze, optimize and improve your journey before booking.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-cyan-300/12 bg-white/[0.05] p-2 text-center sm:grid-cols-3">
              <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                <p className="text-lg font-black text-white">{intelligenceModuleGroups.reduce((total, group) => total + group.modules.length, 0)}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Modules</p>
              </div>
              <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                <p className="text-lg font-black text-cyan-100">{bookingBasket.length}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Selected</p>
              </div>
              <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                <p className="text-lg font-black text-orange-100">{readinessSnapshot.journeyPercent}%</p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-4 p-3 pr-3 sm:p-5 sm:pr-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:p-6 lg:pr-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0 max-w-full rounded-3xl border border-white/10 bg-[#0D1B2F] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:hidden">
            <label className="block min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Advanced Intelligence
              </span>
              <select
                value={openCapability}
                onChange={(event) =>
                  setOpenCapability(event.target.value as WorkspaceCapabilityId)
                }
                className="mt-2 h-11 w-full min-w-0 rounded-2xl border border-cyan-300/18 bg-[#12243D] px-3 text-sm font-black text-white outline-none"
              >
                {intelligenceModuleGroups.map((group) => (
                  <optgroup key={`mobile-module-group-${group.title}`} label={group.title}>
                    {group.modules.map((module) => (
                      <option key={`mobile-module-${module.id}`} value={module.id}>
                        {module.id}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
              Choose a module to review route, budget, safety, weather and booking readiness.
            </p>
          </div>

          <aside className="hidden min-w-0 max-w-full rounded-3xl border border-white/10 bg-[#0D1B2F] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:block">
            <div className="mb-3 rounded-2xl border border-cyan-300/12 bg-white/[0.045] px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Advanced Intelligence
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                Choose an insight module to review route, budget, safety, weather and booking readiness.
              </p>
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {intelligenceModuleGroups.map((group, groupIndex) => (
                <div key={`module-group-${group.title}-${groupIndex}`} className="min-w-[260px] lg:min-w-0">
                  <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {group.title}
                  </p>
                  <div className="grid gap-2">
                    {group.modules.map((module, moduleIndex) => {
                      const ModuleIcon = module.icon;
                      const active = activeIntelligenceModule.id === module.id;

                      return (
                        <button
                          key={`${module.id ?? "module"}-${moduleIndex}`}
                          type="button"
                          onClick={() => toggleCapability(module.id)}
                          className={`group relative grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                            active
                              ? "border-orange-300/45 bg-[linear-gradient(135deg,rgba(255,138,31,0.20),rgba(34,211,238,0.10),rgba(255,255,255,0.06))] shadow-[0_16px_34px_rgba(255,138,31,0.16)]"
                              : "border-white/10 bg-white/[0.045] hover:border-cyan-200/24 hover:bg-white/[0.07]"
                          }`}
                        >
                          {active ? (
                            <span className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-r-full bg-[#FF8A1F]" />
                          ) : null}
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                              active
                                ? "border-orange-200/45 bg-[#FF8A1F] text-slate-950"
                                : "border-cyan-200/12 bg-cyan-300/10 text-cyan-100"
                            }`}
                          >
                            <ModuleIcon size={17} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-white">
                              {module.id}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-400">
                              {module.subtitle}
                            </span>
                          </span>
                          {module.status ? (
                            <span
                              className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                                active
                                  ? "border-orange-200/36 bg-orange-300/16 text-orange-100"
                                  : "border-white/10 bg-white/[0.055] text-slate-400"
                              }`}
                            >
                              {module.status}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section
            ref={intelligenceWorkspaceRef}
            className={`min-w-0 w-full max-w-full overflow-x-hidden rounded-3xl border bg-[#0D1B2F] shadow-[0_22px_70px_rgba(7,17,31,0.32)] transition duration-300 ${
              highlightImpactTarget
                ? "border-orange-300/65 ring-2 ring-orange-300/35"
                : "border-cyan-300/12"
            }`}
          >
            <div className="min-w-0 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(18,36,61,0.96),rgba(7,17,31,0.96))] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                    Active Intelligence Module
                  </p>
                  <h3 className="mt-1 break-words text-xl font-black text-white sm:text-2xl">
                    {activeIntelligenceModule.id}
                  </h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                    {activeIntelligenceModule.subtitle}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSavedItemsOpen(true)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-50 shadow-[0_12px_28px_rgba(34,211,238,0.08)] transition hover:border-cyan-200/36 hover:bg-cyan-300/15"
                  >
                    <Bookmark size={14} />
                    My Trip Bookmarks ({savedItems.length})
                  </button>
                  {activeIntelligenceModule.status ? (
                    <span className="w-fit rounded-full border border-orange-300/28 bg-orange-300/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-orange-100">
                      {activeIntelligenceModule.status}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid min-w-0 max-w-full gap-4 overflow-x-hidden bg-[#12243D] p-4 transition-all duration-300 sm:p-5 lg:p-6">
              {impactSuccessMessage && latestTripChange ? (
                <div className={`relative min-w-0 overflow-hidden break-words rounded-3xl border p-4 ${latestChangeStyle.card}`}>
                  <span className={`absolute left-0 top-0 h-full w-1.5 ${latestChangeStyle.accent}`} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border ${latestChangeStyle.badge}`}>
                          <LatestChangeIcon size={17} />
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${latestChangeStyle.badge}`}>
                          {latestChangeStyle.label}
                        </span>
                        <p className="text-sm font-black text-white">
                          {latestChangeStyle.title}
                        </p>
                      </div>
                      <h4 className="mt-3 text-xl font-black text-white">
                        {latestTripChange.title.replace(" Selected", " Applied").replace(" Preview", "")}
                      </h4>
                      <p className="mt-2 text-xs font-semibold leading-5 text-white/76">
                        {impactSuccessMessage}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {buildImpactSummary(latestTripChange).map((summary, index) => (
                          <span
                            key={`${latestTripChange.id ?? latestTripChange.title ?? "latest-change"}-${summary}-${index}`}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${latestChangeStyle.chip}`}
                          >
                            {summary}
                          </span>
                        ))}
                      </div>
                      {bookingBasket.length > 0 ? (
                        <p className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-50">
                          Your booking selections may have changed. Please review Trip Selections before proceeding to booking.
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => focusImpactArea(latestTripChange)}
                      className="min-h-10 shrink-0 rounded-full border border-white/18 bg-white/[0.10] px-4 text-xs font-black text-white transition hover:bg-white/[0.16]"
                    >
                      View Impact
                    </button>
                  </div>
                </div>
              ) : null}

              {moduleActionMessage ? (
                <div className={`relative min-w-0 overflow-hidden break-words rounded-3xl border p-4 ${moduleActionStyle.card}`}>
                  <span className={`absolute left-0 top-0 h-full w-1.5 ${moduleActionStyle.accent}`} />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border ${moduleActionStyle.badge}`}>
                          <ModuleActionIcon size={17} />
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${moduleActionStyle.badge}`}>
                          {moduleActionStyle.label}
                        </span>
                        <p className="text-sm font-black text-white">
                          Action Status
                        </p>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-white/76">
                        {moduleActionMessage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModuleActionMessage("")}
                      className="min-h-10 rounded-full border border-white/18 bg-white/[0.10] px-4 text-xs font-black text-white transition hover:bg-white/[0.16]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mobile-intelligence-module-shell min-w-0 max-w-full overflow-x-hidden">
                {renderIntelligenceModule(activeIntelligenceModule.id)}
              </div>

              <style>{`
                @media (max-width: 1023px) {
                  .mobile-intelligence-module-shell,
                  .mobile-intelligence-module-shell * {
                    box-sizing: border-box;
                    max-width: 100%;
                    min-width: 0;
                  }

                  .mobile-intelligence-module-shell {
                    width: 100%;
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                  }

                  .mobile-intelligence-module-shell section,
                  .mobile-intelligence-module-shell article,
                  .mobile-intelligence-module-shell aside,
                  .mobile-intelligence-module-shell div {
                    max-width: 100%;
                    min-width: 0;
                    overflow-wrap: anywhere;
                  }

                  .mobile-intelligence-module-shell .grid {
                    grid-template-columns: minmax(0, 1fr) !important;
                  }

                  .mobile-intelligence-module-shell .flex {
                    flex-wrap: wrap;
                  }

                  .mobile-intelligence-module-shell p,
                  .mobile-intelligence-module-shell span,
                  .mobile-intelligence-module-shell h1,
                  .mobile-intelligence-module-shell h2,
                  .mobile-intelligence-module-shell h3,
                  .mobile-intelligence-module-shell h4,
                  .mobile-intelligence-module-shell h5,
                  .mobile-intelligence-module-shell h6,
                  .mobile-intelligence-module-shell li {
                    overflow-wrap: anywhere;
                    white-space: normal;
                  }

                  .mobile-intelligence-module-shell button,
                  .mobile-intelligence-module-shell a {
                    min-height: 44px;
                    white-space: normal;
                  }

                  .mobile-intelligence-module-shell img,
                  .mobile-intelligence-module-shell video,
                  .mobile-intelligence-module-shell canvas,
                  .mobile-intelligence-module-shell svg {
                    max-width: 100%;
                  }

                  .mobile-intelligence-module-shell table {
                    display: block;
                    width: 100%;
                    overflow-x: auto;
                  }
                }
              `}</style>

              <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(6,24,57,0.92))] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                      Recent Trip Changes
                    </p>
                    <h4 className="mt-1 text-lg font-black text-white">
                      Transparent itinerary updates
                    </h4>
                  </div>
                  <span className="w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                    {recentTripChanges.length} logged
                  </span>
                </div>

                {recentTripChanges.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3 text-sm font-semibold text-slate-400">
                    No itinerary changes applied yet. Any route, budget, stay, transport or timing update will appear here after confirmation.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {recentTripChanges.map((change, index) => {
                      const status = classifyChangeStatus(change);
                      const style = changeStatusStyles[status];
                      const StatusIcon = style.Icon;

                      return (
                        <button
                          key={`${change.id ?? change.actionType ?? change.title ?? "change"}-${index}`}
                          type="button"
                          onClick={() => focusImpactArea(change)}
                          className={`relative grid gap-3 overflow-hidden rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${style.card}`}
                        >
                          <span className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
                          <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${style.badge}`}>
                                <StatusIcon size={15} />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-black text-white">
                                  {change.title.replace(" Selected", " Applied").replace(" Preview", "")}
                                </span>
                                <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                                  {new Date(change.appliedAt).toLocaleString()}
                                </span>
                              </span>
                            </span>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${style.badge}`}>
                              {style.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-2">
                            {buildImpactSummary(change).slice(0, 4).map((summary, summaryIndex) => (
                              <span
                                key={`${change.id ?? change.title ?? "change"}-row-${summary}-${summaryIndex}`}
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${style.chip}`}
                              >
                                {summary}
                              </span>
                            ))}
                          </div>
                          <span className="pl-2 text-xs font-black text-white/70">
                            View Impact
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
