"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  Car,
  ChevronRight,
  Check,
  CloudSun,
  Coffee,
  Copy,
  Hotel,
  MapPin,
  NotebookPen,
  PackageCheck,
  Plane,
  Plus,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trash2,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
  TiyaTimelineServiceOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import { generatePlannerSmartAlerts } from "@/app/lib/ecosystem/planner/plannerAlertEngine";
import { generatePlannerCreatorPicks } from "@/app/lib/ecosystem/planner/plannerCreatorEngine";
import { generatePlannerDynamicItinerary } from "@/app/lib/ecosystem/planner/plannerDynamicItineraryEngine";
import { generatePlannerExperiences } from "@/app/lib/ecosystem/planner/plannerExperienceEngine";
import { calculatePlannerFatigueSummary } from "@/app/lib/ecosystem/planner/plannerFatigueEngine";
import { generatePlannerLocalMarketPicks } from "@/app/lib/ecosystem/planner/plannerLocalMarketEngine";
import { generatePlannerPackingSections } from "@/app/lib/ecosystem/planner/plannerPackingEngine";
import { generatePlannerPreparationNotes } from "@/app/lib/ecosystem/planner/plannerPreparationEngine";
import { generatePlannerReadiness } from "@/app/lib/ecosystem/planner/plannerReadinessEngine";
import { generatePlannerRecoverySuggestions } from "@/app/lib/ecosystem/planner/plannerRecoveryEngine";
import { MY_TRIPS_RESTORE_DAY_STATUSES_KEY } from "@/app/lib/ecosystem/planner/myTripsStorage";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { TiyaEmptyState } from "./TiyaPolishStates";
import {
  buildBookingBasketItemFromTimeline,
  upsertBookingBasketItem,
  type WorkspaceBookingBasketItem,
} from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";

type TiyaItineraryTimelineProps = {
  initialDays: TiyaDayPlan[];
  onDaysChange?: (days: TiyaDayPlan[]) => void;
  bookingBasket?: WorkspaceBookingBasketItem[];
  setBookingBasket?: Dispatch<SetStateAction<WorkspaceBookingBasketItem[]>>;
};

type DayTab = "Overview" | "Day Selections" | "Explore" | "Notes";
type BookingStatus = "selected" | "recommended" | "optional";
type DayStatus = "PLANNING" | "READY_TO_FINALIZE" | "FINALIZED" | "EDITING";
const ITINERARY_ACTIVE_DAY_KEY = "tpl_tiya_itinerary_active_day_v1";

type DiscoveryItem = {
  title: string;
  detail: string;
  tag: string;
  type: TiyaTimelineItem["type"];
  icon: typeof Hotel;
  tone: string;
};

type OptionModalState =
  | { open: false }
  | {
      open: true;
      dayId: string;
      dayCity: string;
      itemId?: string;
      mode: "timeline" | "booking" | "explore" | "addItem";
      itemType: TiyaTimelineItem["type"];
      title: string;
      dayNumber?: number;
      currentTitle?: string;
      currentPrice?: number;
      currentPriceBasis?: TiyaTimelineItem["priceBasis"];
      serviceType?: string;
      options?: TiyaTimelineServiceOption[];
    };

type TimelineOption = {
  name: string;
  detail: string;
  price: number;
  providerName?: string;
  detailSummary?: string;
  details?: Record<string, TiyaTimelineDetailValue>;
};

type ServiceDetailModalState =
  | { open: false }
  | { open: true; day: TiyaDayPlan; item: TiyaTimelineItem };

type DurationReduceModalState =
  | { open: false }
  | { open: true; day: TiyaDayPlan; selectedItemIds: string[] };

type FinalizationAssistModalState =
  | { open: false }
  | { open: true; dayId: string; nextDayId?: string };

type AddItemOption = {
  type: TiyaTimelineItem["type"];
  title: string;
  detail: string;
  suggestedTime: string;
  defaultTitle: string;
  icon: typeof Hotel;
  tone: string;
};

type PlannerIntelligence = ReturnType<typeof buildPlannerIntelligence>;

type DayNoteWidget = {
  id: string;
  icon: typeof Hotel;
  title: string;
  subtitle: string;
  tone: string;
  score?: number;
  meterLabel?: string;
  chips?: string[];
  badges?: { label: string; tone: string }[];
};

const dayStatusMeta: Record<
  DayStatus,
  { label: string; marker: string; tone: string; bg: string; border: string }
> = {
  PLANNING: {
    label: "Not finalized",
    marker: "○",
    tone: "#38BDF8",
    bg: "rgba(56,189,248,0.14)",
    border: "rgba(56,189,248,0.32)",
  },
  READY_TO_FINALIZE: {
    label: "Not finalized",
    marker: "⚡",
    tone: "#38BDF8",
    bg: "rgba(56,189,248,0.14)",
    border: "rgba(56,189,248,0.32)",
  },
  FINALIZED: {
    label: "Finalized",
    marker: "✓",
    tone: "#22C55E",
    bg: "rgba(34,197,94,0.14)",
    border: "rgba(34,197,94,0.32)",
  },
  EDITING: {
    label: "Editing",
    marker: "✎",
    tone: "#F59E0B",
    bg: "rgba(245,158,11,0.14)",
    border: "rgba(245,158,11,0.34)",
  },
};

const color = {
  ink: "#07111F",
  panel: "#0D1B2F",
  panel2: "#12243D",
  row: "#173455",
  border: "rgba(59,130,246,0.15)",
  amber: "#FF8A1F",
  sky: "#38BDF8",
  blue: "#60A5FA",
  cyan: "#22D3EE",
  indigo: "#818CF8",
  darkIndigo: "#4F46E5",
  purple: "#A78BFA",
  orange: "#FF8A1F",
  yellow: "#FACC15",
  emerald: "#22C55E",
  electricGreen: "#7CFF6B",
  pink: "#F472B6",
  red: "#F87171",
  teal: "#2DD4BF",
  rose: "#FB7185",
  lime: "#A3E635",
  violet: "#C084FC",
  muted: "#94A3B8",
};

const dayTabs: { id: DayTab; icon: typeof Hotel; tone: string }[] = [
  { id: "Overview", icon: Route, tone: color.amber },
  { id: "Day Selections", icon: Ticket, tone: color.sky },
  { id: "Explore", icon: Sparkles, tone: color.lime },
  { id: "Notes", icon: NotebookPen, tone: color.violet },
];

const dayIdentity = [
  { tone: color.amber, glow: "rgba(255,138,31,0.22)" },
  { tone: color.sky, glow: "rgba(56,189,248,0.22)" },
  { tone: color.teal, glow: "rgba(45,212,191,0.22)" },
  { tone: color.lime, glow: "rgba(163,230,53,0.22)" },
  { tone: color.rose, glow: "rgba(251,113,133,0.22)" },
  { tone: color.violet, glow: "rgba(192,132,252,0.22)" },
];

const itemConfig: Record<
  TiyaTimelineItem["type"],
  { label: string; tone: string; icon: typeof Hotel }
> = {
  transport: { label: "Transport", tone: color.blue, icon: Plane },
  stay: { label: "Stay", tone: color.emerald, icon: Hotel },
  activity: { label: "Activity", tone: color.purple, icon: Sparkles },
  meal: { label: "Food", tone: color.red, icon: Utensils },
};

const addItemOptions: AddItemOption[] = [
  {
    type: "transport",
    title: "Transport",
    detail: "Add flight/train/cab/self-drive movement",
    suggestedTime: "09:00",
    defaultTitle: "New transport option",
    icon: Plane,
    tone: color.sky,
  },
  {
    type: "stay",
    title: "Stay",
    detail: "Add hotel/homestay/resort check-in",
    suggestedTime: "13:00",
    defaultTitle: "New stay option",
    icon: Hotel,
    tone: color.teal,
  },
  {
    type: "activity",
    title: "Activity",
    detail: "Add sightseeing, experience, ticketed activity",
    suggestedTime: "15:00",
    defaultTitle: "New activity / experience",
    icon: Sparkles,
    tone: color.lime,
  },
  {
    type: "meal",
    title: "Food",
    detail: "Add meal, cafe, local food trail",
    suggestedTime: "20:00",
    defaultTitle: "New food stop",
    icon: Utensils,
    tone: color.rose,
  },
];

const statusStyles: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  selected: {
    label: "Selected",
    className: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100",
  },
  recommended: {
    label: "Recommended",
    className: "border-orange-300/35 bg-orange-400/15 text-orange-100",
  },
  optional: {
    label: "Optional",
    className: "border-slate-400/25 bg-slate-400/10 text-slate-300",
  },
};

function currency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function tripSelectionSummary(bookingBasket: WorkspaceBookingBasketItem[]) {
  const counters = {
    transport: 0,
    stay: 0,
    activity: 0,
    meal: 0,
    localMarket: 0,
    creatorExperience: 0,
  };

  bookingBasket.forEach((item) => {
    const signature =
      `${item.category} ${item.serviceName} ${item.serviceLabel || ""} ${item.title} ${item.selectedOptionName} ${item.description} ${item.detailSummary || ""}`.toLowerCase();

    if (item.category === "Transport") counters.transport += 1;
    if (item.category === "Stay") counters.stay += 1;
    if (item.category === "Meals" || signature.includes("meal") || signature.includes("food")) {
      counters.meal += 1;
    }
    if (
      item.category === "Activities" &&
      !signature.includes("market") &&
      !signature.includes("creator")
    ) {
      counters.activity += 1;
    }
    if (signature.includes("market") || signature.includes("local market")) {
      counters.localMarket += 1;
    }
    if (signature.includes("creator") || signature.includes("reel") || signature.includes("photo")) {
      counters.creatorExperience += 1;
    }
  });

  return {
    selectedItems: bookingBasket.length,
    counters,
    estimatedTripValue: bookingBasket.reduce(
      (sum, item) => sum + (item.estimatedTotal || item.estimatedPrice || item.price || 0),
      0
    ),
  };
}

function displayTimelinePriceLabel(
  value: number,
  basis: TiyaTimelineItem["priceBasis"]
) {
  const price = currency(value);

  if (basis === "per_room_night") return `${price} per night`;
  if (basis === "per_night") return `${price} per night`;
  if (basis === "per_day") return `${price} per day`;
  if (basis === "per_transfer") return `${price} one-time`;
  if (basis === "per_group") return `${price} per group`;
  if (basis === "per_item") return `${price} per item`;
  if (basis === "per_package") return `${price} package estimate`;
  if (basis === "fixed") return `${price} fixed`;
  return `${price} per traveller`;
}

function modalTitle(type: TiyaTimelineItem["type"]) {
  if (type === "transport") return "Transport Options";
  if (type === "stay") return "Stay Options";
  if (type === "activity") return "Experience Options";
  return "Food Options";
}

function uniqueValues(values: string[]) {
  return values.filter(
    (value, index, safeValues) => value && safeValues.indexOf(value) === index
  );
}

function inferTransportMode(days: TiyaDayPlan[]) {
  const text = days
    .flatMap((day) => day.items)
    .map((item) => `${item.title} ${item.location}`)
    .join(" ")
    .toLowerCase();

  if (text.includes("ev") || text.includes("charging")) return "EV";
  if (text.includes("bike")) return "Bike";
  if (text.includes("self-drive") || text.includes("self drive")) {
    return "Self-drive Car";
  }
  if (text.includes("cab") || text.includes("suv") || text.includes("transfer")) {
    return "Cab";
  }
  if (text.includes("train")) return "Train";
  if (text.includes("flight") || text.includes("airport")) return "Flight";

  return "Cab";
}

function inferStayPreference(days: TiyaDayPlan[]) {
  const text = days
    .flatMap((day) => day.items)
    .filter((item) => item.type === "stay")
    .map((item) => item.title)
    .join(" ")
    .toLowerCase();

  if (text.includes("homestay")) return "Homestay";
  if (text.includes("resort")) return "Resort";
  if (text.includes("villa")) return "Villa";

  return "Hotel";
}

function inferTravelStyle(days: TiyaDayPlan[]) {
  const text = days
    .map((day) => `${day.city} ${day.headline} ${day.notes}`)
    .join(" ")
    .toLowerCase();

  if (text.includes("temple") || text.includes("spiritual")) return "Spiritual";
  if (text.includes("trek") || text.includes("adventure")) return "Adventure";
  if (text.includes("luxury") || text.includes("premium")) return "Luxury";
  if (text.includes("family")) return "Family";

  return "Food";
}

function inferInterests(days: TiyaDayPlan[]) {
  const allItems = days.flatMap((day) => day.items);
  const text = days
    .map((day) => `${day.city} ${day.headline} ${day.notes}`)
    .concat(allItems.map((item) => `${item.title} ${item.location}`))
    .join(" ")
    .toLowerCase();
  const interests = [
    allItems.some((item) => item.type === "meal") || text.includes("food")
      ? "Food"
      : "",
    text.includes("market") || text.includes("shopping") ? "Local Life" : "",
    text.includes("view") || text.includes("scenic") || text.includes("nature")
      ? "Nature"
      : "",
    text.includes("culture") || text.includes("heritage") ? "Culture" : "",
    text.includes("trek") || text.includes("adventure") ? "Trekking" : "",
    text.includes("creator") || text.includes("reel") ? "Creator Spots" : "",
    text.includes("temple") || text.includes("darshan") ? "Temples" : "",
  ];

  return uniqueValues(interests).length ? uniqueValues(interests) : ["Food"];
}

function buildIntentFromDays(days: TiyaDayPlan[]): TiyaTripIntent {
  const safeDays = Array.isArray(days) ? days : [];
  const cities = uniqueValues(safeDays.map((day) => day.city));
  const interests = inferInterests(safeDays);
  const itemText = safeDays
    .flatMap((day) => day.items)
    .map((item) => item.title)
    .join(" ")
    .toLowerCase();

  return {
    fromCity: cities[0] || "Origin",
    toCity: cities[cities.length - 1] || cities[0] || "Destination",
    startDate: safeDays[0]?.date || "",
    endDate: safeDays[safeDays.length - 1]?.date || "",
    tripType: "Leisure",
    transportMode: inferTransportMode(safeDays),
    stayPreference: inferStayPreference(safeDays),
    budgetTier: itemText.includes("premium") || itemText.includes("luxury") ? "Luxury" : "Premium",
    customBudgetAmount: "",
    adults: 2,
    children: 0,
    seniors: 0,
    pets: false,
    travelStyle: inferTravelStyle(safeDays),
    pace: safeDays.some((day) => day.pace === "Packed")
      ? "Packed"
      : safeDays.every((day) => day.pace === "Relaxed")
        ? "Relaxed"
        : "Balanced",
    interests,
    smartPreferences: {
      includeStays: safeDays.some((day) =>
        day.items.some((item) => item.type === "stay")
      ),
      includeLocalMarket:
        interests.includes("Local Market") || itemText.includes("market"),
      includeCreatorSpots:
        interests.includes("Creator Spots") || itemText.includes("view"),
      includeInsurance: true,
      avoidNightTravel: !safeDays.some((day) =>
        day.items.some((item) => {
          const hour = Number(item.time.split(":")[0]);
          return Number.isFinite(hour) && hour >= 21;
        })
      ),
      preferScenicRoute:
        interests.includes("Nature") || itemText.includes("scenic"),
    },
  };
}

function buildRouteFromDays(days: TiyaDayPlan[]): TiyaRouteOption {
  const transportDays = days.filter((day) =>
    day.items.some((item) => item.type === "transport")
  ).length;
  const packedDays = days.filter((day) => day.pace === "Packed").length;
  const highRisk = transportDays > 2 || packedDays > 1;

  return {
    id: highRisk ? "adventure" : "scenic",
    name: highRisk ? "High-movement route" : "Balanced scenic route",
    distance: `${Math.max(120, transportDays * 180)} km`,
    duration: `${Math.max(1, days.length)} days`,
    difficulty: highRisk ? "High" : "Medium",
    scenicScore: highRisk ? 82 : 88,
    comfortScore: highRisk ? 64 : 82,
    budgetFit: 76,
    riskLevel: highRisk ? "High" : "Medium",
    note: highRisk
      ? "Generated from transfer-heavy itinerary days."
      : "Generated from current day-wise itinerary flow.",
    bestFor: highRisk ? "Adventure and road movement" : "Balanced discovery",
    routeStyle: highRisk ? "Adventure" : "Scenic",
    isRecommended: true,
  };
}

function buildPlanSkeleton({
  days,
  intent,
  selectedRoute,
  creatorPicks,
  localMarketPicks,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  selectedRoute: TiyaRouteOption;
  creatorPicks: TiyaGeneratedPlan["creatorPicks"];
  localMarketPicks: TiyaGeneratedPlan["localMarketPicks"];
}): TiyaGeneratedPlan {
  return {
    title: `${intent.toCity} smart itinerary`,
    subtitle: "Day-wise workspace intelligence",
    routeTitle: selectedRoute.name,
    nights: Math.max(0, days.length - 1),
    travellerCount: intent.adults + intent.children + intent.seniors,
    routeStops: days.map((day) => ({
      city: day.city,
      nights: day.items.some((item) => item.type === "stay") ? 1 : 0,
      transfer:
        day.items.find((item) => item.type === "transport")?.title ||
        "Local movement",
    })),
    days,
    suggestions: [],
    budgetLines: [],
    totalBudget: Math.max(25000, days.length * 8500),
    insights: [],
    routeOptions: [selectedRoute],
    bookingModules: [],
    creatorPicks,
    localMarketPicks,
  };
}

function buildPlannerIntelligence(days: TiyaDayPlan[]) {
  const safeDays = Array.isArray(days) ? days : [];
  const intent = buildIntentFromDays(safeDays);
  const selectedRoute = buildRouteFromDays(safeDays);
  const creatorPicks = generatePlannerCreatorPicks(intent);
  const localMarketPicks = generatePlannerLocalMarketPicks(intent);
  const plan = buildPlanSkeleton({
    days: safeDays,
    intent,
    selectedRoute,
    creatorPicks,
    localMarketPicks,
  });
  const packingSections = generatePlannerPackingSections({
    intent,
    selectedRoute,
  });
  const preparationNotes = generatePlannerPreparationNotes({
    intent,
    selectedRoute,
  });
  const readiness = generatePlannerReadiness({
    intent,
    sections: packingSections,
    notes: preparationNotes,
  });
  const dynamicPlan = generatePlannerDynamicItinerary({
    days: safeDays,
    intent,
    selectedRoute,
  });

  return {
    intent,
    selectedRoute,
    plan,
    creatorPicks,
    localMarketPicks,
    experiences: generatePlannerExperiences({
      intent,
      plan,
      days: safeDays,
      selectedRoute,
    }),
    alerts: generatePlannerSmartAlerts({
      intent,
      days: safeDays,
      selectedRoute,
      totalBudget: plan.totalBudget,
    }),
    packingSections,
    preparationNotes,
    readiness,
    dynamicPlan,
    fatigueSummary: calculatePlannerFatigueSummary({
      days: safeDays,
      intent,
      selectedRoute,
    }),
    recoverySuggestions: generatePlannerRecoverySuggestions({
      intent,
      adaptiveDays: dynamicPlan.adaptiveDays,
      plan: dynamicPlan,
    }),
  };
}

function buildOptionsForType(
  type: TiyaTimelineItem["type"],
  city: string
): TimelineOption[] {
  const destination = city || "Destination";

  if (type === "transport") {
    return [
      {
        name: `Private SUV transfer in ${destination}`,
        detail: "Door-to-door route movement with flexible halt timing.",
        price: 2800,
      },
      {
        name: `Shared cab to ${destination}`,
        detail: "Value option for airport, station or inter-city transfer.",
        price: 1450,
      },
      {
        name: `Self-drive route plan`,
        detail: "Best for flexible timing with fuel and rest-stop checks.",
        price: 3200,
      },
    ];
  }

  if (type === "stay") {
    return [
      {
        name: `Premium hotel in ${destination}`,
        detail: "Central stay with breakfast and easy transfer access.",
        price: 5800,
      },
      {
        name: `Boutique homestay in ${destination}`,
        detail: "Local host-led stay for a more regional experience.",
        price: 4200,
      },
      {
        name: `Comfort resort near ${destination}`,
        detail: "Relaxed stay option with better recovery time.",
        price: 7200,
      },
    ];
  }

  if (type === "activity") {
    return [
      {
        name: `${destination} guided experience`,
        detail: "Curated local activity with timing matched to this day.",
        price: 1800,
      },
      {
        name: `${destination} scenic viewpoint pass`,
        detail: "Short high-value stop for photos and route discovery.",
        price: 950,
      },
      {
        name: `${destination} cultural walk`,
        detail: "Local history, markets and neighbourhood highlights.",
        price: 1250,
      },
    ];
  }

  return [
    {
      name: `${destination} local food trail`,
      detail: "Popular local dishes with a route-friendly time window.",
      price: 900,
    },
    {
      name: `${destination} cafe stop`,
      detail: "Light meal stop that keeps the day pace comfortable.",
      price: 650,
    },
    {
      name: `${destination} regional tasting`,
      detail: "Curated food pick for local flavours and creator notes.",
      price: 1100,
    },
  ];
}

function buildDiscoveryItems(
  day: TiyaDayPlan,
  intelligence: PlannerIntelligence
): DiscoveryItem[] {
  const city = day.city || "Destination";
  const creator = intelligence.creatorPicks.find(
    (pick) => pick.destination === intelligence.intent.toCity
  );
  const market = intelligence.localMarketPicks[0];
  const dayExperiences = intelligence.experiences.filter(
    (experience) => experience.suggestedDay === day.day
  );
  const foodExperience =
    dayExperiences.find((experience) => experience.category === "Food trails") ||
    intelligence.experiences.find((experience) => experience.category === "Food trails");
  const marketExperience =
    dayExperiences.find(
      (experience) => experience.category === "Shopping/local market"
    ) ||
    intelligence.experiences.find(
      (experience) => experience.category === "Shopping/local market"
    );
  const scenicExperience =
    dayExperiences.find((experience) => experience.category === "Nature spots") ||
    intelligence.experiences.find((experience) => experience.category === "Nature spots");
  const creatorExperience =
    dayExperiences.find(
      (experience) => experience.category === "Creator photo/video spots"
    ) ||
    intelligence.experiences.find(
      (experience) => experience.category === "Creator photo/video spots"
    );
  const readyExperience =
    dayExperiences.find((experience) => experience.bookingReadiness === "Ready") ||
    intelligence.experiences.find(
      (experience) => experience.bookingReadiness === "Ready"
    );
  const alert = intelligence.alerts[0];

  return [
    {
      title: creatorExperience?.title || creator?.suggestedStopover || `${city} creator viewpoint`,
      detail:
        creator?.recommendationNote ||
        creatorExperience?.reason ||
        "Creator engine matched this day to a photo or video friendly stop.",
      tag: creator?.creatorName || "Creator Pick",
      type: "activity",
      icon: Sparkles,
      tone: color.violet,
    },
    {
      title: foodExperience?.title || `${city} local food trail`,
      detail:
        foodExperience?.reason ||
        "Experience engine matched a food trail to the current route pace.",
      tag: "Local Food",
      type: "meal",
      icon: Coffee,
      tone: color.rose,
    },
    {
      title: marketExperience?.title || market?.productName || `${city} local market`,
      detail:
        market?.description ||
        marketExperience?.reason ||
        "Local market engine matched this day to regional commerce relevance.",
      tag: market?.specialtyLabel || "Local Life",
      type: "activity",
      icon: ShoppingBag,
      tone: color.amber,
    },
    {
      title: scenicExperience?.title || "Scenic stop",
      detail:
        scenicExperience?.reason ||
        "Experience engine suggests a lower-friction viewpoint for this day.",
      tag: "Scenic Stop",
      type: "activity",
      icon: MapPin,
      tone: color.lime,
    },
    {
      title: readyExperience?.title || alert?.title || "Experience suggestion",
      detail:
        readyExperience?.reason ||
        alert?.detail ||
        "Planner engines found an add-on that fits this day's route flow.",
      tag: readyExperience?.bookingReadiness || alert?.severity || "Recommended",
      type: "activity",
      icon: readyExperience ? Ticket : Bell,
      tone: readyExperience ? color.sky : color.violet,
    },
  ];
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isRoadTransport(item: TiyaTimelineItem) {
  const text = `${item.title} ${item.location}`.toLowerCase();

  return (
    item.type === "transport" &&
    (text.includes("drive") ||
      text.includes("cab") ||
      text.includes("road") ||
      text.includes("suv") ||
      text.includes("ev") ||
      text.includes("self-drive") ||
      text.includes("self drive"))
  );
}

function buildDayNoteWidgets(
  day: TiyaDayPlan,
  intelligence: PlannerIntelligence
): DayNoteWidget[] {
  const adaptiveDay = intelligence.dynamicPlan.adaptiveDays.find(
    (currentDay) => currentDay.day.id === day.id
  );
  const hasTransport = day.items.some((item) => item.type === "transport");
  const hasRoadTransport = day.items.some(isRoadTransport);
  const hasActivity = day.items.some((item) => item.type === "activity");
  const hasMeal = day.items.some((item) => item.type === "meal");
  const hasStay = day.items.some((item) => item.type === "stay");
  const fatigueScore =
    day.pace === "Packed"
      ? Math.max(adaptiveDay?.fatigue.score || 72, 78)
      : adaptiveDay?.fatigue.score || (day.pace === "Relaxed" ? 38 : 56);
  const weatherScore = clampPercent(
    intelligence.readiness.weatherReadiness - (hasTransport ? 8 : 0)
  );
  const packingItems = intelligence.packingSections
    .flatMap((section) => section.items)
    .filter((item) => item.priority === "Critical" || item.priority === "Recommended")
    .slice(0, 4)
    .map((item) => item.label);
  const safetyBadges = [
    ...intelligence.alerts.slice(0, 2).map((alert) => ({
      label: alert.severity === "critical" ? "Permit review" : alert.title,
      tone: alert.severity === "critical" ? color.rose : color.amber,
    })),
    ...intelligence.preparationNotes.slice(0, 2).map((note) => ({
      label: note.tone === "success" ? "Ready" : note.title,
      tone:
        note.tone === "critical"
          ? color.rose
          : note.tone === "warning"
            ? color.amber
            : color.teal,
    })),
  ].slice(0, 4);
  const localChips = [
    hasMeal ? "Food stop added" : "Food trail",
    intelligence.localMarketPicks[0]?.specialtyLabel || "Market pick",
    intelligence.creatorPicks[0]?.suggestedStopover || "Creator stop",
    day.city || intelligence.intent.toCity || "Local tip",
  ].filter(Boolean);
  const fuelChips = hasRoadTransport
    ? ["Fuel/charging", "Daylight route", "Range buffer"]
    : ["Route buffer", "Weather window", "Transfer timing"];

  return [
    {
      id: `weather-${day.id}`,
      icon: CloudSun,
      title: "Weather readiness",
      subtitle: hasTransport ? "Buffer transfer windows" : "Good for local movement",
      tone: weatherScore >= 72 ? color.teal : color.amber,
      score: weatherScore,
      meterLabel: `${weatherScore}% ready`,
      chips: hasTransport ? fuelChips : ["Clear window", "Flexible"],
    },
    {
      id: `fatigue-${day.id}`,
      icon: Zap,
      title: "Route intensity",
      subtitle:
        day.pace === "Packed"
          ? "Packed day: keep recovery buffer"
          : adaptiveDay?.fatigue.recoveryHint || "Balanced movement load",
      tone: fatigueScore >= 76 ? color.rose : fatigueScore >= 52 ? color.amber : color.teal,
      score: fatigueScore,
      meterLabel:
        fatigueScore >= 76 ? "High" : fatigueScore >= 52 ? "Medium" : "Low",
      chips: [
        day.pace,
        hasTransport ? "Transfer" : "Local",
        hasActivity ? "Activity" : "Open slot",
      ],
    },
    {
      id: `packing-${day.id}`,
      icon: NotebookPen,
      title: "Packing checklist",
      subtitle: hasActivity ? "Activity-ready essentials" : "Day movement basics",
      tone: color.amber,
      chips: uniqueValues([
        ...(hasActivity ? ["Walking shoes", "Daypack"] : []),
        ...(hasTransport ? ["Power bank", "Offline maps"] : []),
        ...packingItems,
      ]).slice(0, 6),
    },
    {
      id: `safety-${day.id}`,
      icon: ShieldCheck,
      title: "Safety / permit",
      subtitle:
        safetyBadges.length > 0 ? "Review active readiness signals" : "No major flags",
      tone: safetyBadges.some((badge) => badge.tone === color.rose)
        ? color.rose
        : color.teal,
      badges:
        safetyBadges.length > 0
          ? safetyBadges
          : [
              { label: "ID ready", tone: color.teal },
              { label: "Low risk", tone: color.sky },
            ],
    },
    {
      id: `offline-${day.id}`,
      icon: Route,
      title: "Offline readiness",
      subtitle: "Keep essentials accessible without network",
      tone: color.sky,
      score: clampPercent(intelligence.readiness.safetyReadiness),
      meterLabel: `${clampPercent(intelligence.readiness.safetyReadiness)}% safe`,
      chips: uniqueValues([
        "Government ID",
        "Offline maps",
        hasStay ? "Stay copy" : "Route summary",
        "Emergency contacts",
        hasRoadTransport ? "Fuel stops" : "",
      ]).slice(0, 5),
    },
    {
      id: `local-${day.id}`,
      icon: ShoppingBag,
      title: "Local tip stack",
      subtitle: day.city ? `Best around ${day.city}` : "Destination-linked picks",
      tone: color.violet,
      chips: uniqueValues(localChips).slice(0, 5),
    },
  ];
}

function widgetScore(widget?: DayNoteWidget) {
  if (!widget) return 72;
  if (typeof widget.score === "number") return clampPercent(widget.score);
  if (widget.badges?.some((badge) => badge.tone === color.rose)) return 58;
  if (widget.badges?.length) return 74;
  return 82;
}

function widgetStatusLabel(widget: DayNoteWidget) {
  const score = widgetScore(widget);
  if (score >= 81) return "Ready";
  if (score >= 61) return "Ready";
  if (score >= 31) return "Attention Needed";
  return "Critical";
}

function readinessTone(score: number) {
  if (score <= 30) return color.red;
  if (score <= 60) return color.orange;
  if (score <= 80) return color.yellow;
  return color.emerald;
}

function readinessLabel(score: number) {
  if (score <= 30) return "Critical";
  if (score <= 60) return "Attention Needed";
  return "Ready";
}

function moduleBullets(widget: DayNoteWidget) {
  return uniqueValues([
    widget.subtitle,
    ...(widget.chips || []),
    ...(widget.badges || []).map((badge) => badge.label),
  ])
    .filter(Boolean)
    .slice(0, 3);
}

function moduleRecommendation(widget: DayNoteWidget) {
  const score = widgetScore(widget);
  const title = widget.title.toLowerCase();

  if (title.includes("weather")) {
    return score >= 70 ? "Start before 10 AM" : "Keep a flexible weather buffer";
  }
  if (title.includes("route")) {
    return score >= 76 ? "Keep recovery time after movement" : "Reduce late activity pressure";
  }
  if (title.includes("packing")) {
    return "Keep essentials in a quick-access day bag";
  }
  if (title.includes("safety")) {
    return score >= 70 ? "Carry ID and permit copies" : "Review permit and safety notes first";
  }
  if (title.includes("offline")) {
    return "Download maps and contacts before departure";
  }
  return "Keep one local buffer window open";
}

function dayReadinessScore(widgets: DayNoteWidget[]) {
  return clampPercent(
    widgets.reduce((sum, widget) => sum + widgetScore(widget), 0) /
      Math.max(1, widgets.length)
  );
}

function dayTravelSignals(widgets: DayNoteWidget[]) {
  const signalMap = [
    ["weather", "Weather suitable"],
    ["fatigue", "Route intensity medium"],
    ["safety", "Safety acceptable"],
    ["packing", "Packing incomplete"],
    ["offline", "Offline readiness available"],
    ["local", "Local guidance available"],
  ];

  return signalMap.map(([prefix, label]) => {
    const widget = widgets.find((currentWidget) =>
      currentWidget.id.startsWith(prefix)
    );
    const score = widgetScore(widget);
    const warning = prefix === "fatigue" ? score >= 61 : score < 70;

    return {
      label,
      warning,
      tone: warning ? color.amber : color.emerald,
    };
  });
}

function dayScopedAlerts(day: TiyaDayPlan, widgets: DayNoteWidget[]) {
  const alerts = [];
  const weather = widgets.find((widget) => widget.id.startsWith("weather"));
  const route = widgets.find((widget) => widget.id.startsWith("fatigue"));
  const packing = widgets.find((widget) => widget.id.startsWith("packing"));
  const safety = widgets.find((widget) => widget.id.startsWith("safety"));

  if (widgetScore(weather) < 62) alerts.push("Weather advisory");
  if (widgetScore(route) >= 76 || day.pace === "Packed") alerts.push("High route intensity");
  if (widgetScore(safety) < 68) alerts.push("Permit required");
  if (widgetScore(packing) < 68) alerts.push("Packing incomplete");
  if (day.items.some(isRoadTransport) && widgetScore(route) >= 70) {
    alerts.push("Long driving stretch");
  }

  return uniqueValues(alerts).slice(0, 4);
}

function DayNoteWidgetCard({ widget }: { widget: DayNoteWidget }) {
  const WidgetIcon = widget.icon;
  const score = widgetScore(widget);
  const status = widgetStatusLabel(widget);
  const tone = readinessTone(score);
  const bullets = moduleBullets(widget);

  return (
    <article
      className="flex min-h-[210px] flex-col justify-between rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(145deg, rgba(23,52,85,0.96), ${tone}0F)`,
        borderColor: `${tone}34`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 36px rgba(7,17,31,0.18)`,
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border"
              style={{
                color: "#07111F",
                background: widget.tone,
                borderColor: widget.tone,
              }}
            >
              <WidgetIcon size={22} />
            </span>
            <div>
              <h4 className="text-base font-black text-white">{widget.title}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {score}% {status}
              </p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]"
            style={{
              color: tone,
              background: `${tone}16`,
              borderColor: `${tone}38`,
            }}
          >
            {status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:items-center">
          <div
            className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${tone} ${score * 3.6}deg, rgba(255,255,255,0.10) 0deg)`,
            }}
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#07111F] font-mono text-sm font-black text-white">
              {score}%
            </div>
          </div>
          <div className="grid gap-1.5">
            {bullets.map((bullet, index) => (
              <p
                key={`${widget.id}-bullet-${bullet}-${index}`}
                className="text-xs font-semibold leading-5 text-slate-200"
              >
                <span style={{ color: tone }}>•</span> {bullet}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-black/16 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          Recommendation
        </p>
        <p className="mt-1 text-xs font-black leading-5 text-white">
          {moduleRecommendation(widget)}
        </p>
      </div>
    </article>
  );
}

function DayReadinessHero({
  day,
  widgets,
}: {
  day: TiyaDayPlan;
  widgets: DayNoteWidget[];
}) {
  const score = dayReadinessScore(widgets);
  const tone = readinessTone(score);
  const status = readinessLabel(score);
  const signals = dayTravelSignals(widgets);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32%),linear-gradient(135deg,#173455,#0D1B2F)] p-5 shadow-[0_22px_60px_rgba(7,17,31,0.35)]" style={{ borderColor: `${tone}38` }}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-center">
        <div className="flex min-h-[calc(100vh-8rem)] min-w-0 flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
            Day-wise Travel Readiness
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
            Day {String(day.day).padStart(2, "0")} · {day.headline}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black text-slate-300">
            <span>{day.date}</span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-cyan-200" />
              {day.city}
            </span>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/16 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Travel Signals
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {signals.map((signal) => (
                <div
                  key={`${day.id}-signal-${signal.label}`}
                  className="flex items-center gap-2 text-xs font-black text-slate-100"
                >
                  <span style={{ color: signal.tone }}>
                    {signal.warning ? "⚠" : "✓"}
                  </span>
                  <span>{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-start lg:justify-center">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${tone} ${score * 3.6}deg, rgba(255,255,255,0.10) 0deg)`,
              boxShadow: `0 0 34px ${tone}22`,
            }}
          >
            <div className="flex h-[138px] w-[138px] flex-col items-center justify-center rounded-full border border-white/10 bg-[#07111F] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="font-mono text-4xl font-black text-white">{score}%</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                {status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DayAiRecommendationCard({
  day,
  widgets,
}: {
  day: TiyaDayPlan;
  widgets: DayNoteWidget[];
}) {
  const weatherScore = widgetScore(widgets.find((widget) => widget.id.startsWith("weather")));
  const routeScore = widgetScore(widgets.find((widget) => widget.id.startsWith("fatigue")));
  const hasRoadTransport = day.items.some(isRoadTransport);
  const recommendations = [
    `Best movement window: ${weatherScore >= 70 ? "08:00-11:30" : "09:30-12:00"}`,
    routeScore >= 76 ? "Avoid late activity pressure" : "Keep the planned pace steady",
    weatherScore < 75 ? "Keep jacket after sunset" : "Hydrate and keep sun cover ready",
    "Carry offline map",
    hasRoadTransport ? "Keep luggage transfer-friendly" : "Keep local movement light",
  ];

  return (
    <section className="rounded-[1.5rem] border border-violet-300/18 bg-[linear-gradient(135deg,rgba(167,139,250,0.14),rgba(18,36,61,0.86))] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-violet-300/28 bg-violet-400/14 text-violet-100">
          <Sparkles size={16} />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
            Today&apos;s AI Recommendation
          </p>
          <h4 className="text-sm font-black text-white">
            Day {String(day.day).padStart(2, "0")} guidance for {day.city}
          </h4>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {recommendations.map((recommendation, index) => (
          <p
            key={`${day.id}-ai-recommendation-${index}`}
            className="rounded-2xl border border-white/8 bg-black/15 px-3 py-2.5 text-xs font-semibold leading-5 text-slate-100"
          >
            <span className="text-violet-200">•</span> {recommendation}
          </p>
        ))}
      </div>
    </section>
  );
}

function DayTravelAlertBar({
  day,
  widgets,
}: {
  day: TiyaDayPlan;
  widgets: DayNoteWidget[];
}) {
  const alerts = dayScopedAlerts(day, widgets);

  if (alerts.length === 0) return null;

  return (
    <section className="rounded-[1.5rem] border border-amber-300/24 bg-amber-400/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/18 text-amber-100">
          <AlertTriangle size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">
            Travel Alert Bar
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {alerts.map((alert, index) => (
              <span
                key={`${day.id}-alert-${alert}-${index}`}
                className="rounded-full border border-amber-300/24 bg-black/16 px-3 py-1.5 text-xs font-black text-amber-50"
              >
                ⚠ {alert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DayPersonalNotesCard({
  day,
  widgets,
}: {
  day: TiyaDayPlan;
  widgets: DayNoteWidget[];
}) {
  const reminderChips = uniqueValues(
    widgets.flatMap((widget) => widget.chips || [])
  ).slice(0, 4);
  const notes = [
    ["Reminders", reminderChips.join(" • ") || "Keep documents and timing buffer ready"],
    ["Custom notes", `${day.city || "This destination"} day plan can be refined before final booking`],
    ["Important contacts", "Keep hotel, driver and emergency contacts offline"],
    ["Budget notes", "Track selected items against day-level estimated spend"],
  ];

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(18,36,61,0.82))] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-300/24 bg-orange-400/14 text-orange-100">
          <NotebookPen size={16} />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
            Day {String(day.day).padStart(2, "0")} Notes
          </p>
          <h4 className="text-sm font-black text-white">Travel journal for this day</h4>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {notes.map(([label, value]) => (
          <div key={`${day.id}-personal-${label}`} className="rounded-2xl border border-white/8 bg-black/16 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-200">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DayIntelligenceCenter({
  day,
  widgets,
}: {
  day: TiyaDayPlan;
  widgets: DayNoteWidget[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#102742] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="grid gap-4">
        <DayReadinessHero day={day} widgets={widgets} />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Intelligence Grid
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                Day readiness modules
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
              6 modules
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {widgets.map((widget, index) => (
              <DayNoteWidgetCard
                key={`${day.id}-${widget.id}-${index}`}
                widget={widget}
              />
            ))}
          </div>
        </div>

        <DayAiRecommendationCard day={day} widgets={widgets} />
        <DayTravelAlertBar day={day} widgets={widgets} />
        <DayPersonalNotesCard day={day} widgets={widgets} />
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  tone,
}: {
  eyebrow: string;
  title: string;
  tone: string;
}) {
  return (
    <div className="mb-3">
      <p
        className="font-mono text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: tone }}
      >
        {eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-black tracking-tight text-white">
        {title}
      </h3>
    </div>
  );
}

function StatPill({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-center shadow-sm"
      style={{ borderColor: `${tone}28` }}
    >
      <p className="text-2xl font-black leading-none" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function initialDayStatus(day: TiyaDayPlan): DayStatus {
  void day;
  return "PLANNING";
}

function dayNumberFromLabel(value?: string) {
  if (!value) return undefined;
  const match = value.match(/day\s*(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

function basketItemCoversDay(
  item: WorkspaceBookingBasketItem,
  day: TiyaDayPlan,
  kind: "stay" | "transport"
) {
  if (kind === "stay") {
    if (item.category !== "Stay" && item.serviceType !== "hotel") return false;
    if (item.dayId === day.id || item.day === day.day) return true;

    const checkInDay =
      item.checkInDay ?? dayNumberFromLabel(item.checkInDate || item.startDate);
    const checkOutDay =
      item.checkOutDay ?? dayNumberFromLabel(item.checkOutDate || item.endDate);

    if (checkInDay !== undefined && checkOutDay !== undefined) {
      return day.day >= checkInDay && day.day < checkOutDay;
    }

    if (item.nights && item.day) {
      return day.day >= item.day && day.day < item.day + item.nights;
    }

    return false;
  }

  if (item.category !== "Transport" && item.serviceType !== "cab") return false;
  if (item.dayId === day.id || item.day === day.day) return true;

  const coverageStartDay =
    item.coverageStartDay ?? dayNumberFromLabel(item.coverageStartDate || item.startDate);
  const coverageEndDay =
    item.coverageEndDay ?? dayNumberFromLabel(item.coverageEndDate || item.endDate);

  if (coverageStartDay !== undefined && coverageEndDay !== undefined) {
    return day.day >= coverageStartDay && day.day <= coverageEndDay;
  }

  if (item.durationDays && item.day) {
    return day.day >= item.day && day.day < item.day + item.durationDays;
  }

  return false;
}

function coverageSourceLabel(item: WorkspaceBookingBasketItem) {
  return item.selectedOptionName || item.title || item.serviceName;
}

function resolveDayCoverage(
  day: TiyaDayPlan,
  allDays: TiyaDayPlan[],
  bookingBasket: WorkspaceBookingBasketItem[]
) {
  const directTransport = day.items.find((item) => item.type === "transport");
  const directStay = day.items.find((item) => item.type === "stay");
  const selectedStay = bookingBasket.find((item) =>
    basketItemCoversDay(item, day, "stay")
  );
  const selectedTransport = bookingBasket.find((item) =>
    basketItemCoversDay(item, day, "transport")
  );
  const lastDayNumber = Math.max(...allDays.map((currentDay) => currentDay.day));
  const stayRequired = day.day < lastDayNumber || Boolean(directStay || selectedStay);
  const transportAdded = Boolean(selectedTransport);
  const stayAdded = Boolean(selectedStay);
  const transportAvailable = Boolean(directTransport || selectedTransport);
  const stayAvailable = !stayRequired || Boolean(directStay || selectedStay);

  return {
    transport: transportAdded,
    stay: !stayRequired || stayAdded,
    activity: day.items.some((item) => item.type === "activity"),
    meal: day.items.some((item) => item.type === "meal"),
    stayRequired,
    transportAvailable,
    stayAvailable,
    transportCoverageLabel: selectedTransport
      ? `Transport added and covering this day: ${coverageSourceLabel(selectedTransport)}`
      : directTransport
        ? "Transport available, not added"
        : "",
    stayCoverageLabel: selectedStay
      ? `Stay added and covering this day: ${coverageSourceLabel(selectedStay)}`
      : directStay
        ? "Stay available, not added"
        : "",
  };
}

function dayFinalizeIssues(
  day: TiyaDayPlan,
  allDays: TiyaDayPlan[] = [day],
  bookingBasket: WorkspaceBookingBasketItem[] = []
) {
  const coverage = resolveDayCoverage(day, allDays, bookingBasket);

  return [
    !coverage.transport ? "Transport" : "",
    coverage.stayRequired && !coverage.stay ? "Stay" : "",
  ].filter(Boolean);
}

function statusForChangedDay(currentStatus: DayStatus | undefined, day: TiyaDayPlan): DayStatus {
  if (currentStatus === "FINALIZED") return "EDITING";
  if (currentStatus === "EDITING") return "PLANNING";
  return initialDayStatus(day);
}

function displayDayStatus(status: DayStatus, readyToFinalize: boolean): DayStatus {
  if (status === "FINALIZED" || status === "EDITING") return status;
  return readyToFinalize ? "READY_TO_FINALIZE" : "PLANNING";
}

function DayStatusBadge({ status }: { status: DayStatus }) {
  const meta = dayStatusMeta[status];
  const label = status === "FINALIZED" ? "Day Finalized" : meta.label;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em]"
      style={{
        color: meta.tone,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <span>{meta.marker}</span>
      {label}
    </span>
  );
}

function DaySelectionCard({
  item,
  tone,
}: {
  item: WorkspaceBookingBasketItem;
  tone: string;
}) {
  const categoryIcon: Record<WorkspaceBookingBasketItem["category"], typeof Hotel> = {
    Transport: Plane,
    Stay: Hotel,
    Activities: Ticket,
    Meals: Utensils,
    Package: PackageCheck,
    Other: Sparkles,
  };
  const Icon = categoryIcon[item.category] || Sparkles;

  return (
    <article className="rounded-3xl border border-emerald-300/24 bg-emerald-400/[0.08] p-4 shadow-[0_0_22px_rgba(34,197,94,0.08)]">
      <div className="grid gap-3 md:grid-cols-[190px_minmax(0,1fr)_150px] md:items-center">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              color: tone,
              background: `${tone}18`,
              borderColor: `${tone}44`,
            }}
          >
            <Icon size={18} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {item.category}
            </p>
            <h4 className="mt-1 text-sm font-black text-white">
              {item.serviceName}
            </h4>
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-base font-black leading-6 text-white">
            {item.selectedOptionName || item.title}
          </h4>
          <p className="mt-1 truncate text-xs font-semibold text-slate-300">
            {item.meta || item.city || item.dayLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-black text-white">
            {currency(item.estimatedTotal || item.estimatedPrice || item.price || 0)}
          </span>
          <span className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-100">
            Selected
          </span>
        </div>
      </div>
    </article>
  );
}

function detailValue(item: TiyaTimelineItem, keys: string[]) {
  const details = item.details || {};
  const foundKey = keys.find((key) => details[key] !== undefined);

  if (!foundKey) return "";

  const value = details[foundKey];
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function itemTextSignature(item: TiyaTimelineItem) {
  return `${item.serviceType || ""} ${item.title} ${item.location} ${item.description || ""} ${item.detailSummary || ""}`.toLowerCase();
}

function journeyProfile(item: TiyaTimelineItem) {
  const text = itemTextSignature(item);

  if (item.type === "stay") {
    return {
      label: "Hotel",
      Icon: Hotel,
      helper: "Check-in, room style and stay comfort mapped to this day.",
      flow:
        item.checkInDate || item.checkOutDate
          ? `${item.checkInDate || "Check-in"} → ${item.checkOutDate || "Check-out"}`
          : `${item.location || "Stay"} · ${item.nights || 1} night${item.nights === 1 ? "" : "s"}`,
    };
  }

  if (item.type === "meal") {
    return {
      label: "Meal",
      Icon: Utensils,
      helper: "Food stop timed around the route pace and local area.",
      flow: detailValue(item, ["mealType", "foodType", "category"]) || "Breakfast / lunch / dinner stop",
    };
  }

  if (item.type === "activity") {
    const creatorLike =
      text.includes("creator") ||
      text.includes("reel") ||
      text.includes("photo") ||
      text.includes("viewpoint");
    const localLifeLike =
      text.includes("market") ||
      text.includes("local") ||
      text.includes("hidden") ||
      text.includes("cafe");

    return {
      label: creatorLike ? "Creator Stop" : localLifeLike ? "Local Life" : "Activity",
      Icon: creatorLike ? Sparkles : Ticket,
      helper: creatorLike
        ? "Creator-friendly stop with strong photo, reel or route discovery value."
        : localLifeLike
          ? "Local discovery block for markets, food, culture or hidden gems."
          : "Experience block matched to this day's timing and destination.",
      flow: detailValue(item, ["duration", "bestTime", "timing"]) || item.location || "Timed experience",
    };
  }

  if (text.includes("flight") || text.includes("airport")) {
    return {
      label: "Flight",
      Icon: Plane,
      helper: "Airport movement with departure, arrival and terminal readiness.",
      flow: `${item.from || "Departure"} → ${item.to || item.finalDestination || item.location || "Arrival"}`,
    };
  }

  if (text.includes("train") || text.includes("rail")) {
    return {
      label: "Train",
      Icon: Route,
      helper: "Station flow with train/class placeholder and platform readiness.",
      flow: `${item.from || "Station"} → ${item.to || item.finalDestination || item.location || "Station"}`,
    };
  }

  if (text.includes("bus") || text.includes("coach")) {
    return {
      label: "Bus",
      Icon: Car,
      helper: "Boarding and drop movement with operator/type placeholder.",
      flow: `${item.from || "Pickup"} → ${item.to || item.finalDestination || item.location || "Drop"}`,
    };
  }

  if (text.includes("ev") || text.includes("charging") || text.includes("charger")) {
    return {
      label: "EV Drive",
      Icon: Zap,
      helper: "Charging stop, range buffer and night-halt planning layer.",
      flow:
        detailValue(item, ["rangeBuffer", "chargingDuration", "chargerType"]) ||
        `${item.from || "Start"} → ${item.to || item.finalDestination || item.location || "Halt"}`,
    };
  }

  if (text.includes("cab") || text.includes("transfer") || item.cabKind) {
    return {
      label:
        item.cabKind === "full_trip"
          ? "Full-trip Cab"
          : item.cabKind === "local"
            ? "Local Transfer"
            : "Cab Transfer",
      Icon: Car,
      helper: "Cab movement block for full-day, partial-day or point transfer.",
      flow: `${item.from || "Pickup"} → ${item.to || item.finalDestination || item.location || "Drop"}`,
    };
  }

  return {
    label: "Private Car",
    Icon: Car,
    helper: "Driving segment with route timing, stop and comfort planning.",
    flow: `${item.from || "Start"} → ${item.to || item.finalDestination || item.location || "Stop"}`,
  };
}

function itemDuration(item: TiyaTimelineItem) {
  return (
    detailValue(item, ["duration", "travelTime", "driveTime", "chargingDuration"]) ||
    (item.durationDays ? `${item.durationDays} day${item.durationDays === 1 ? "" : "s"}` : "")
  );
}

function itemStatusLabel(item: TiyaTimelineItem, isSelected: boolean) {
  if (isSelected) return "Added";
  if (item.bookingStatus === "selected") return "Selected";
  if (item.bookingStatus === "optional") return "Recommended";
  if (item.bookingStatus === "recommended") return "Recommended";
  return "Recommended";
}

function routeLabel(item: TiyaTimelineItem) {
  const from = item.from || "";
  const to = item.to || item.finalDestination || "";
  if (from && to) return `${from} → ${to}`;
  return "";
}

function timelineItemRouteLabel(item: TiyaTimelineItem) {
  const detailRouteLabel =
    item.details && typeof item.details.routeLabel === "string"
      ? item.details.routeLabel
      : "";

  return detailRouteLabel || routeLabel(item);
}

function itemPriceLabel(item: TiyaTimelineItem) {
  return (
    item.displayPriceLabel ||
    (item.unitPrice || item.price
      ? displayTimelinePriceLabel(item.unitPrice || item.price || 0, item.priceBasis)
      : "")
  );
}

function compactPriceLabel(item: TiyaTimelineItem) {
  const rawPrice = itemPriceLabel(item);
  const currencyMatch = rawPrice.match(/₹[\d,]+/);

  return currencyMatch?.[0] || rawPrice;
}

function itemDisplayName(item: TiyaTimelineItem, profile: ReturnType<typeof journeyProfile>) {
  const displayName = detailValue(item, ["displayName"]);
  const hotelName = detailValue(item, ["hotelName", "stayName"]);
  const activityName = detailValue(item, ["activityName", "marketName"]);
  const mealName = detailValue(item, ["mealName"]);
  const providerName = item.providerName || detailValue(item, ["providerName", "operator", "airline", "trainName"]);
  const route = routeLabel(item);

  if (displayName) return displayName;
  if (item.type === "transport") return route || providerName || item.title || item.serviceType || profile.label;
  if (item.type === "stay") return hotelName || providerName || item.title || item.location || "Stay Select";
  if (item.type === "activity") return activityName || item.title || providerName || item.location || profile.label;
  if (item.type === "meal") return mealName || item.title || providerName || item.location || "Meal Stop";
  return item.title || hotelName || providerName || activityName || mealName || route || item.serviceType || profile.label;
}

function itemSecondaryName(item: TiyaTimelineItem, primaryName: string, profile: ReturnType<typeof journeyProfile>) {
  const title = item.title && item.title !== primaryName ? item.title : "";
  const roomType = detailValue(item, ["roomType", "stayType", "category"]);
  const cuisine = detailValue(item, ["cuisine", "mealType", "foodType"]);
  const providerName = item.providerName || detailValue(item, ["providerName", "operator", "airline", "trainName"]);

  if (item.type === "transport") return providerName || item.serviceType || "TPL Verified Transfer";
  if (item.type === "stay") return title || roomType || "Smart comfort room";
  if (item.type === "meal") return cuisine || title || "Local food experience";
  if (item.type === "activity") return title || detailValue(item, ["experienceType", "category"]) || profile.label;
  return title || profile.label;
}

function decisionCardTitle(item: TiyaTimelineItem, profile: ReturnType<typeof journeyProfile>) {
  return itemDisplayName(item, profile);
}

function timelineHeaderSubtitle(item: TiyaTimelineItem, profile: ReturnType<typeof journeyProfile>) {
  const primary = itemDisplayName(item, profile);
  const secondary = itemSecondaryName(item, primary, profile);
  const rating = detailValue(item, ["rating", "starRating", "hotelRating"]);
  const routeStyle = detailValue(item, ["routeStyle", "roadType", "comfort"]);
  const difficulty = detailValue(item, ["difficulty", "activityLevel"]);
  const cuisine = detailValue(item, ["cuisine", "mealType", "foodType"]);
  const roomType = detailValue(item, ["roomType", "stayType", "category"]);
  const detail =
    rating ? `${rating}/5 estimated` :
    routeStyle || difficulty || cuisine || roomType || "";

  return [secondary, detail].filter(Boolean).slice(0, 2).join(" • ");
}

function timelineCardContextRows(item: TiyaTimelineItem) {
  const duration = itemDuration(item);
  const rating = detailValue(item, ["rating", "starRating", "hotelRating"]);
  const routeStyle = detailValue(item, ["routeStyle", "roadType", "comfort"]);
  const roomType = detailValue(item, ["roomType", "stayType", "category"]);
  const cuisine = detailValue(item, ["cuisine", "mealType", "foodType"]);
  const difficulty = detailValue(item, ["difficulty", "activityLevel"]);
  const departure = detailValue(item, ["departure", "departureTime", "departTime"]);
  const arrival = detailValue(item, ["arrival", "arrivalTime"]);
  const pickup = detailValue(item, ["pickup", "pickupTime"]);
  const checkIn = item.checkInDate || detailValue(item, ["checkIn", "checkInTime"]);
  const checkOut = item.checkOutDate || detailValue(item, ["checkOut", "checkOutTime"]);

  if (item.type === "stay") {
    return {
      contextLeft: checkIn ? `Check-in ${checkIn}` : "Check-in ready",
      contextRight: checkOut ? `Check-out ${checkOut}` : "",
      supportLeft: item.location,
      supportRight: rating ? `${rating}/5 Rating` : roomType,
    };
  }

  if (item.type === "meal") {
    return {
      contextLeft: cuisine || "Local food experience",
      contextRight: duration,
      supportLeft: item.location,
      supportRight: "Local Experience",
    };
  }

  if (item.type === "activity") {
    return {
      contextLeft: duration ? `Duration ${duration}` : "Timed experience",
      contextRight: difficulty,
      supportLeft: item.location,
      supportRight: difficulty ? "" : routeStyle,
    };
  }

  return {
    contextLeft: departure ? `Departure ${departure}` : pickup ? `Pickup ${pickup}` : duration ? `Duration ${duration}` : "",
    contextRight: arrival ? `Arrival ${arrival}` : routeLabel(item),
    supportLeft: routeStyle || item.serviceType || "TPL Verified Transfer",
    supportRight: duration && !departure ? duration : "",
  };
}

function miniTimelineItems(day: TiyaDayPlan) {
  return day.items.slice(0, 5);
}

function timelineNodeProfile(item: TiyaTimelineItem) {
  const text = itemTextSignature(item);
  const profile = journeyProfile(item);

  if (text.includes("visa")) {
    return {
      ...profile,
      label: "Visa",
      Icon: ShieldCheck,
      tone: color.teal,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Visa readiness",
    };
  }

  if (text.includes("insurance")) {
    return {
      ...profile,
      label: "Insurance",
      Icon: ShieldCheck,
      tone: color.emerald,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Trip protection",
    };
  }

  if (text.includes("permit") || text.includes("alert") || text.includes("risk")) {
    return {
      ...profile,
      label: "Permit / Alert",
      Icon: AlertTriangle,
      tone: color.red,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Review required",
    };
  }

  if (text.includes("flight") || text.includes("airport")) {
    return {
      ...profile,
      label: "Flight",
      Icon: Plane,
      tone: color.cyan,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || profile.flow,
    };
  }

  if (text.includes("train") || text.includes("rail")) {
    return {
      ...profile,
      label: "Train",
      Icon: Route,
      tone: color.indigo,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || profile.flow,
    };
  }

  if (text.includes("bus") || text.includes("coach") || text.includes("volvo")) {
    return {
      ...profile,
      label: "Bus",
      Icon: Car,
      tone: color.orange,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || profile.flow,
    };
  }

  if (text.includes("charging") || text.includes("charger") || text.includes("ev")) {
    return {
      ...profile,
      label: "EV Charging",
      Icon: Zap,
      tone: color.electricGreen,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || detailValue(item, ["chargerType", "chargingDuration", "rangeBuffer"]) || item.location,
    };
  }

  if (
    text.includes("self-drive") ||
    text.includes("self drive") ||
    text.includes("private car") ||
    text.includes("drive")
  ) {
    return {
      ...profile,
      label: "Self Drive",
      Icon: Car,
      tone: color.blue,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || profile.flow,
    };
  }

  if (text.includes("cab") || text.includes("transfer") || item.cabKind) {
    return {
      ...profile,
      label:
        item.cabKind === "local"
          ? "Local Transfer"
          : item.cabKind === "full_trip"
            ? "Full-trip Cab"
            : "Cab Transfer",
      Icon: Car,
      tone: color.blue,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || profile.flow,
    };
  }

  if (text.includes("creator") || text.includes("reel") || text.includes("photo")) {
    return {
      ...profile,
      label: "Creator",
      Icon: Sparkles,
      tone: color.pink,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Creator recommendation",
    };
  }

  if (text.includes("market") || text.includes("souvenir") || text.includes("shopping")) {
    return {
      ...profile,
      label: "Local Life",
      Icon: ShoppingBag,
      tone: color.amber,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Local commerce stop",
    };
  }

  if (text.includes("night halt") || text.includes("overnight")) {
    return {
      ...profile,
      label: "Night Halt",
      Icon: CloudSun,
      tone: color.darkIndigo,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Night halt",
    };
  }

  if (item.type === "stay") {
    const isHomestay = text.includes("homestay");
    return {
      ...profile,
      label: isHomestay ? "Homestay" : "Hotel",
      tone: color.emerald,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Check-in / Night stay",
    };
  }

  if (item.type === "meal") {
    return {
      ...profile,
      Icon: Coffee,
      tone: color.red,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Meal stop",
    };
  }

  if (item.type === "activity") {
    return {
      ...profile,
      tone: color.purple,
      title: itemDisplayName(item, profile),
      detail: timelineHeaderSubtitle(item, profile) || "Experience",
    };
  }

  return {
    ...profile,
    tone: item.type === "transport" ? color.blue : color.purple,
    title: itemDisplayName(item, profile),
    detail: timelineHeaderSubtitle(item, profile) || profile.flow,
  };
}

function TPLSignatureTimeline({
  day,
  compact = false,
  activeItemId,
  selectedItemIds = [],
  onSelectItem,
  renderItemDetail,
}: {
  day: TiyaDayPlan;
  compact?: boolean;
  activeItemId?: string;
  selectedItemIds?: string[];
  onSelectItem?: (itemId: string) => void;
  renderItemDetail?: (item: TiyaTimelineItem) => ReactNode;
}) {
  const items = compact ? miniTimelineItems(day) : day.items;

  if (items.length === 0) return null;

  if (compact) {
    return (
      <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none]">
        <div className="flex min-w-max items-center rounded-2xl border border-cyan-300/12 bg-[#12243D] px-3 py-2">
          {items.map((item, itemIndex) => {
            const node = timelineNodeProfile(item);
            const NodeIcon = node.Icon;
            const added = selectedItemIds.includes(item.id);

            return (
              <div key={`${day.id}-signature-mini-${item.id}`} className="flex items-center">
                {itemIndex > 0 ? (
                  <span
                    className="mx-2 h-px w-8"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08), ${node.tone}42, rgba(255,255,255,0.08))`,
                    }}
                  />
                ) : null}
                <span className="group/node flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border"
                    style={{
                      color: "#0B0F1A",
                      background: node.tone,
                      borderColor: node.tone,
                    }}
                  >
                    {added ? <Check size={13} /> : <NodeIcon size={13} />}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-black text-slate-300">
                    {node.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-cyan-300/12 bg-[#12243D] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
          TPL signature timeline
        </p>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {items.length} journey node{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative grid gap-2.5 pl-6">
        <span className="absolute left-[13px] top-3 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-white/14 via-white/8 to-transparent" />
        {items.map((item) => {
          const node = timelineNodeProfile(item);
          const NodeIcon = node.Icon;
          const active = activeItemId === item.id;
          const added = selectedItemIds.includes(item.id);
          const price = compactPriceLabel(item);
          const duration = itemDuration(item);
          const quickMeta =
            duration ||
            routeLabel(item) ||
            detailValue(item, ["roomType", "stayType", "difficulty", "cuisine"]) ||
            node.detail;

          return (
            <div key={`${day.id}-signature-full-${item.id}`} className="relative">
              <span
                className={`absolute -left-6 top-5 flex items-center justify-center rounded-full border bg-[#0B0F1A] transition-all duration-300 ${
                  active ? "h-8 w-8 -translate-x-0.5" : "h-7 w-7"
                }`}
                style={{
                  color: "#0B0F1A",
                  background: added ? color.emerald : node.tone,
                  borderColor: added ? color.emerald : node.tone,
                }}
              >
                {added ? <Check size={13} /> : <NodeIcon size={13} />}
              </span>
              <button
                type="button"
                onClick={() => onSelectItem?.(active ? "" : item.id)}
                className={`grid w-full grid-cols-[120px_minmax(0,1fr)_230px] items-center gap-4 rounded-2xl border px-3.5 py-3 text-left transition hover:-translate-y-0.5 max-lg:grid-cols-[104px_minmax(0,1fr)_210px] max-lg:gap-3 max-md:grid-cols-1 max-md:gap-3 ${
                  active ? "bg-[#173455]" : "bg-[#0D1B2F]/86 hover:bg-[#173455]/64"
                }`}
                style={{
                  borderColor: active ? `${node.tone}58` : "rgba(255,255,255,0.09)",
                  boxShadow: active ? `0 10px 22px ${node.tone}10` : "none",
                }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
                    style={{
                      color: "#07111F",
                      background: node.tone,
                      borderColor: node.tone,
                    }}
                  >
                    {added ? <Check size={16} /> : <NodeIcon size={16} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-black leading-none text-white">
                      {item.time}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {added ? "Added" : "Time"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate text-base font-black leading-5 text-white">
                      {node.title}
                    </p>
                  <span
                      className="inline-flex max-w-[130px] truncate rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]"
                    style={{
                      color: added ? color.emerald : node.tone,
                      background: added
                        ? `${color.emerald}1F`
                        : active
                          ? `${node.tone}1F`
                          : `${node.tone}12`,
                      borderColor: added
                        ? `${color.emerald}66`
                        : active
                          ? `${node.tone}55`
                          : `${node.tone}34`,
                    }}
                  >
                    {node.label}
                  </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                    {quickMeta}
                  </p>
                </div>

                <div className="flex min-w-0 items-center justify-end gap-3 max-md:justify-between max-md:border-t max-md:border-white/8 max-md:pt-2">
                  <div className="min-w-0 text-right max-sm:text-left">
                    {price ? (
                      <div>
                        <p className="truncate text-sm font-black text-white lg:text-base">{price}</p>
                        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                          Est. Cost
                        </p>
                      </div>
                    ) : null}
                    {added ? (
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-100">
                        ✓ In Booking Basket
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-orange-100">
                        Recommended
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 text-slate-400 transition ${active ? "rotate-90" : ""}`}
                  />
                </div>
              </button>
              {active && renderItemDetail ? (
                <div className="relative ml-5 mt-2 pl-5">
                  <span
                    className="absolute left-0 top-0 h-5 w-5 rounded-bl-2xl border-b border-l"
                    style={{
                      borderColor: `${node.tone}66`,
                    }}
                  />
                  <div className="overflow-hidden transition-all duration-300 ease-out">
                    {renderItemDetail(item)}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineActionRow({
  dayId,
  item,
  isSelected,
  isLocked = false,
  onAddToBooking,
  onViewDetails,
  onViewOptions,
  onRemove,
  onUpdate,
}: {
  dayId: string;
  item: TiyaTimelineItem;
  isSelected: boolean;
  isLocked?: boolean;
  onAddToBooking: () => void;
  onViewDetails: () => void;
  onViewOptions: () => void;
  onRemove: () => void;
  onUpdate: (
    dayId: string,
    itemId: string,
    field: keyof TiyaTimelineItem,
    value: string
  ) => void;
}) {
  const profile = journeyProfile(item);
  const node = timelineNodeProfile(item);
  const NodeIcon = node.Icon;
  const accent = node.tone;
  const status = isSelected ? statusStyles.selected : statusStyles.recommended;
  const cardTitle = decisionCardTitle(item, profile);
  const secondaryName = itemSecondaryName(item, cardTitle, profile);
  const centerRows = timelineCardContextRows(item);
  const routeText = routeLabel(item) || centerRows.contextRight;
  const supportLine =
    [centerRows.supportLeft, centerRows.supportRight]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(" • ") || centerRows.contextLeft;
  const editableLocationLabel =
    item.type === "transport"
      ? "Pickup"
      : item.type === "stay"
        ? "Location"
        : item.type === "meal"
          ? "Place"
          : "Location";
  const infoLines = [
    routeText ? { label: item.type === "transport" ? "Route" : "Context", value: routeText } : null,
    supportLine && supportLine !== secondaryName
      ? { label: item.type === "transport" ? "Flow" : "Detail", value: supportLine }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        background: "linear-gradient(180deg, rgba(23,52,85,0.88), rgba(19,45,73,0.86))",
        borderTopColor: isSelected ? color.emerald : accent,
        borderTopWidth: 3,
        borderTopStyle: "solid",
        borderRightColor: isSelected
          ? "rgba(52,211,153,0.58)"
          : "rgba(34,211,238,0.24)",
        borderBottomColor: isSelected
          ? "rgba(52,211,153,0.58)"
          : "rgba(34,211,238,0.24)",
        borderLeftColor: isSelected
          ? "rgba(52,211,153,0.58)"
          : "rgba(34,211,238,0.24)",
        boxShadow: isSelected
          ? "inset 0 1px 0 rgba(34,197,94,0.14), 0 12px 26px rgba(34,197,94,0.08)"
          : "0 12px 26px rgba(7,17,31,0.20)",
      }}
    >
      <div className="grid gap-3 p-3">
        <div className="grid gap-3 lg:grid-cols-[150px_minmax(0,1fr)_170px] lg:items-start">
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center gap-2">
              <input
                value={item.time}
                onChange={(event) =>
                  onUpdate(dayId, item.id, "time", event.target.value)
                }
                disabled={isLocked}
                className="w-[58px] border-none bg-transparent font-mono text-base font-black leading-none text-cyan-100 outline-none"
              />
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{
                  color: "#07111F",
                  background: accent,
                  borderColor: accent,
                }}
              >
                <NodeIcon size={16} />
              </span>
            </div>
            <span
              className="w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]"
              style={{
                color: accent,
                background: `${accent}12`,
                borderColor: `${accent}38`,
              }}
            >
              {node.label}
            </span>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex min-w-0 items-center gap-2">
              <input
                value={cardTitle}
                onChange={(event) =>
                  onUpdate(dayId, item.id, "title", event.target.value)
                }
                disabled={isLocked}
                className="min-w-0 flex-1 border-none bg-transparent text-base font-black leading-5 text-white outline-none"
              />
            </div>

            {secondaryName ? (
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
                {secondaryName}
              </p>
            ) : null}

            <div className="mt-3 grid gap-1.5 text-[11px] font-semibold leading-5 text-slate-300">
              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
                <span className="text-slate-500">{editableLocationLabel}:</span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin size={12} className="shrink-0 text-slate-500" />
                  <input
                    value={item.location}
                    onChange={(event) =>
                      onUpdate(dayId, item.id, "location", event.target.value)
                    }
                    disabled={isLocked}
                    className="min-w-0 flex-1 border-none bg-transparent text-[11px] font-semibold text-slate-300 outline-none"
                  />
                </span>
              </div>
              {infoLines.map((line) => (
                <div
                  key={`${item.id}-line-${line.label}-${line.value}`}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-2"
                >
                  <span className="text-slate-500">{line.label}:</span>
                  <span className="min-w-0 truncate text-slate-300">{line.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 lg:justify-items-end">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {isSelected ? (
                <span className="w-fit rounded-full border border-emerald-300/35 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-100">
                  ✓ Added To Booking
                </span>
              ) : (
                <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${status.className}`}>
                  {itemStatusLabel(item, isSelected)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={onViewDetails}
              className="min-h-8 min-w-[112px] whitespace-nowrap rounded-full border border-blue-300/45 bg-blue-400/8 px-3 text-[11px] font-black text-blue-100 transition hover:border-blue-200/70 hover:bg-blue-400/14 hover:shadow-[0_0_16px_rgba(96,165,250,0.16)]"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={onViewOptions}
              disabled={isLocked}
              className="min-h-8 min-w-[104px] whitespace-nowrap rounded-full border border-cyan-300/45 bg-cyan-400/8 px-3 text-[11px] font-black text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-400/14 hover:shadow-[0_0_16px_rgba(34,211,238,0.16)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cyan-300/45 disabled:hover:bg-cyan-400/8 disabled:hover:shadow-none"
            >
              Change
            </button>
            <button
              type="button"
              disabled={isLocked}
              className="min-h-8 min-w-[92px] whitespace-nowrap rounded-full border border-amber-300/45 bg-amber-400/10 px-3 text-[11px] font-black text-amber-100 transition hover:border-amber-200/70 hover:bg-amber-400/16 hover:shadow-[0_0_16px_rgba(245,158,11,0.16)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-amber-300/45 disabled:hover:bg-amber-400/10 disabled:hover:shadow-none"
            >
              Maybe
            </button>
            {isSelected ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={isLocked}
                className="flex min-h-8 min-w-[150px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-rose-300/35 bg-rose-400/10 px-3 text-[11px] font-black text-rose-100 transition hover:border-rose-200/60 hover:bg-rose-400/16 hover:shadow-[0_0_16px_rgba(251,113,133,0.14)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-rose-300/35 disabled:hover:bg-rose-400/10 disabled:hover:shadow-none"
                aria-label={`Remove ${item.title} from booking`}
              >
                <Trash2 size={15} />
                Remove From Booking
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddToBooking}
                disabled={isLocked}
                className="min-h-8 min-w-[130px] whitespace-nowrap rounded-full border border-orange-300/50 bg-[#FF8A1F] px-3 text-[11px] font-black text-slate-950 transition hover:bg-[#FFA63A] hover:shadow-[0_0_18px_rgba(255,138,31,0.20)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#FF8A1F] disabled:hover:shadow-none"
              >
                Add To Booking
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              disabled={isLocked}
              className="flex min-h-8 min-w-[92px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-rose-300/24 bg-rose-400/8 px-3 text-[11px] font-black text-rose-200 opacity-75 transition hover:border-rose-200/50 hover:bg-rose-400/14 hover:shadow-[0_0_14px_rgba(251,113,133,0.12)] group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-rose-300/24 disabled:hover:bg-rose-400/8 disabled:hover:shadow-none"
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function DiscoveryCard({
  item,
  onAdd,
  onChange,
}: {
  item: DiscoveryItem;
  onAdd: () => void;
  onChange: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      className="rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, #22304A, ${item.tone}10)`,
        borderColor: `${item.tone}36`,
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            color: item.tone,
            background: `${item.tone}18`,
            borderColor: `${item.tone}44`,
          }}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-black text-white">{item.title}</h4>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-black"
              style={{
                color: item.tone,
                background: `${item.tone}16`,
                borderColor: `${item.tone}38`,
              }}
            >
              {item.tag}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
            {item.detail}
          </p>
        </div>
      </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="min-h-9 rounded-full bg-[#FF8A1F] px-3 text-xs font-black text-slate-950 transition hover:bg-[#FFA63A]"
          >
            Add To Day
          </button>
          <button
            type="button"
            onClick={onChange}
            className="min-h-9 rounded-full border bg-white/[0.08] px-3 text-xs font-black"
            style={{ color: item.tone, borderColor: `${item.tone}42` }}
          >
            View Options
          </button>
        </div>
      </div>
    </article>
  );
}

function optionFromServiceOption(option: TiyaTimelineServiceOption): TimelineOption {
  return {
    name: option.title,
    detail: option.description,
    price: option.price,
    providerName: option.providerName,
    detailSummary: option.detailSummary,
    details: option.details,
  };
}

function detailModalTitle(item: TiyaTimelineItem) {
  const serviceType = item.serviceType?.toLowerCase() || "";

  if (serviceType.includes("flight")) return "Flight Details";
  if (serviceType.includes("hotel") || item.type === "stay") return "Hotel Details";
  if (
    serviceType.includes("cab") ||
    serviceType.includes("transfer") ||
    serviceType.includes("ev")
  ) {
    return "Cab Details";
  }
  if (serviceType.includes("train")) return "Train Details";
  if (item.type === "meal") return "Food Details";
  return "Activity Details";
}

function formatDetailLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function renderDetailValue(value: TiyaTimelineDetailValue) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function nextDateLabel(value?: string) {
  if (!value || value === "Flexible") return "Flexible";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  parsedDate.setDate(parsedDate.getDate() + 1);
  return parsedDate.toISOString().slice(0, 10);
}

function generatedDayTitle(dayNumber: number, city?: string) {
  const safeCity = city || "Destination";
  return `${safeCity} Exploration`;
}

function ServiceDetailModal({
  modal,
  onClose,
}: {
  modal: ServiceDetailModalState;
  onClose: () => void;
}) {
  if (!modal.open) return null;

  const { day, item } = modal;
  const cfg = itemConfig[item.type];
  const DetailIcon = cfg.icon;
  const details = item.details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/58 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <section className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-[720px] flex-col overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/12 bg-[#101827]/95 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:max-h-[80vh]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-5">
          <div className="flex min-w-0 gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
              style={{
                color: "#0B0F1A",
                background: cfg.tone,
                borderColor: cfg.tone,
              }}
            >
              <DetailIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: cfg.tone }}>
                {detailModalTitle(item)}
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                {item.detailSummary || item.description || "Service details generated from the selected planner payload."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/[0.12]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Provider", item.providerName || "TPL Smart Planner"],
              ["Day", `Day ${day.day} · ${day.date}`],
              ["Route", `${item.from || day.city} → ${item.to || item.location}`],
              ["Travellers", `${item.travellers || 1}`],
              [
                "Price",
                displayTimelinePriceLabel(
                  item.unitPrice || item.price || 0,
                  item.priceBasis
                ),
              ],
              ["Status", item.bookingStatus || "available"],
            ].map(([label, value]) => (
              <div key={`${item.id}-${label}`} className="rounded-2xl border border-white/8 bg-black/15 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(details).map(([label, value]) => (
              <div
                key={`${item.id}-${label}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {formatDetailLabel(label)}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-slate-200">
                  {renderDetailValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DurationReduceModal({
  modal,
  onMoveToPreviousDay,
  onRemoveAnyway,
  onClose,
}: {
  modal: DurationReduceModalState;
  onMoveToPreviousDay: () => void;
  onRemoveAnyway: () => void;
  onClose: () => void;
}) {
  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <section className="max-h-[calc(100dvh-2.5rem)] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/60 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
              Trip duration change
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight">
              This day has saved or booking items.
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Move them to the previous day or remove the day and its selected
              booking references.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:p-5">
          <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4">
            <p className="text-sm font-black text-slate-950">
              Day {String(modal.day.day).padStart(2, "0")} · {modal.day.headline}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-600">
              {modal.selectedItemIds.length} selected item
              {modal.selectedItemIds.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onMoveToPreviousDay}
              className="min-h-11 rounded-full bg-[#FF8A1F] px-4 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(255,138,31,0.24)] transition hover:bg-[#FFA63A]"
            >
              Move to Previous Day
            </button>
            <button
              type="button"
              onClick={onRemoveAnyway}
              className="min-h-11 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700"
            >
              Remove Anyway
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function OptionModal({
  modal,
  onClose,
  onSelectOption,
  onSelectAddItem,
}: {
  modal: OptionModalState;
  onClose: () => void;
  onSelectOption: (option: TimelineOption) => void;
  onSelectAddItem: (option: AddItemOption) => void;
}) {
  if (!modal.open) return null;

  if (modal.mode === "addItem") {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
        <section className="max-h-[calc(100dvh-2.5rem)] w-full max-w-3xl overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/60 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                Add to timeline
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight">
                {modal.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Choose the type of timeline item you want to add. Nothing is
                added until you select an option.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {addItemOptions.map((option, index) => {
              const OptionIcon = option.icon;

              return (
                <article
                  key={`${modal.dayId}-add-${option.type}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                      style={{
                        color: option.tone,
                        background: `${option.tone}12`,
                        borderColor: `${option.tone}36`,
                      }}
                    >
                      <OptionIcon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-black text-slate-950">
                        {option.title}
                      </h4>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                        {option.detail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
                      Suggested time · {option.suggestedTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectAddItem(option)}
                      className="min-h-10 rounded-full bg-[#FF8A1F] px-4 text-xs font-black text-slate-950 shadow-[0_10px_24px_rgba(255,138,31,0.22)] transition hover:bg-[#FFA63A]"
                    >
                      Add to Timeline
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const cfg = itemConfig[modal.itemType];
  const OptionIcon = cfg.icon;
  const options = modal.options?.length
    ? modal.options.map(optionFromServiceOption)
    : buildOptionsForType(modal.itemType, modal.dayCity);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/58 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <section className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-[720px] flex-col overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/12 bg-[#101827]/95 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:max-h-[80vh]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: cfg.tone }}>
              OTA Compare Flow
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
              {modal.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Compare options for {modal.dayCity || "this day"}. Selecting one
              updates the itinerary source and booking basket when this item is
              already selected.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/[0.12]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 gap-4 overflow-y-auto p-4 sm:p-5 md:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                style={{
                  color: "#0B0F1A",
                  background: cfg.tone,
                  borderColor: cfg.tone,
                }}
              >
                <OptionIcon size={18} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Compare Type
                </p>
                <p className="text-sm font-black text-white">{cfg.label}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {[
                ["Day", modal.dayCity || "Current day"],
                ["Options", `${options.length} available`],
                ["Source", "TPL Smart Planner"],
              ].map(([label, value]) => (
                <div key={`${modal.dayId}-filter-${label}`} className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-200">{value}</p>
                </div>
              ))}
            </div>

            {modal.currentTitle ? (
              <div className="mt-4 rounded-2xl border px-3 py-3" style={{ borderColor: `${cfg.tone}38`, background: `${cfg.tone}10` }}>
                <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: cfg.tone }}>
                  Current selected option
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {modal.currentTitle}
                </p>
                {modal.currentPrice ? (
                  <p className="mt-1 text-xs font-black text-slate-300">
                    {currency(modal.currentPrice)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {["Recommended", "Best Value", "Refundable", "TPL Verified"].map((filter) => (
                <span
                  key={`${modal.dayId}-filter-${filter}`}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black text-slate-300"
                >
                  {filter}
                </span>
              ))}
            </div>
          </aside>

          <div className="grid content-start gap-3">
            {options.map((option, index) => {
              const priceDifference =
                modal.currentPrice && option.price
                  ? option.price - modal.currentPrice
                  : 0;

              return (
              <article
                key={`${modal.dayId}-${modal.itemType}-${option.name}-${index}`}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-orange-300/35 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                    style={{
                      color: "#0B0F1A",
                      background: cfg.tone,
                      borderColor: cfg.tone,
                    }}
                  >
                    <OptionIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-white">
                      {option.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                      {option.detail}
                    </p>
                    {option.providerName ? (
                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: cfg.tone }}>
                        {option.providerName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-black text-white">
                    {currency(option.price)}
                  </span>
                  {modal.currentPrice ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        priceDifference > 0
                          ? "bg-orange-400/15 text-orange-200"
                          : priceDifference < 0
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      {priceDifference === 0
                        ? "Same price"
                        : `${priceDifference > 0 ? "+" : "-"}${currency(Math.abs(priceDifference))}`}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSelectOption(option)}
                    className="min-h-10 rounded-full bg-[#FF8A1F] px-4 text-xs font-black text-slate-950 shadow-[0_10px_24px_rgba(255,138,31,0.22)] transition hover:bg-[#FFA63A]"
                  >
                    {modal.currentTitle ? "Replace Option" : "Select Option"}
                  </button>
                </div>
              </div>
            </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TiyaItineraryTimeline({
  initialDays,
  onDaysChange,
  bookingBasket = [],
  setBookingBasket,
}: TiyaItineraryTimelineProps) {
  const [days, setDays] = useState(initialDays);
  const [openDayId, setOpenDayId] = useState(initialDays[0]?.id || "");
  const [activeTabs, setActiveTabs] = useState<Record<string, DayTab>>({});
  const [activeTimelineItems, setActiveTimelineItems] = useState<Record<string, string>>({});
  const [optionModal, setOptionModal] = useState<OptionModalState>({
    open: false,
  });
  const [serviceDetailModal, setServiceDetailModal] =
    useState<ServiceDetailModalState>({ open: false });
  const [durationReduceModal, setDurationReduceModal] =
    useState<DurationReduceModalState>({ open: false });
  const [finalizationAssistModal, setFinalizationAssistModal] =
    useState<FinalizationAssistModalState>({ open: false });
  const [finalJourneyState, setFinalJourneyState] = useState<
    "draft" | "generated" | "stale"
  >("draft");
  const finalJourneyStateRef = useRef(finalJourneyState);
  const [journeyControlMessage, setJourneyControlMessage] = useState("");
  const [dayNavigationWarning, setDayNavigationWarning] = useState("");
  const [continueBookingWarning, setContinueBookingWarning] = useState("");
  const [
    selectedItemsContinueConfirmOpen,
    setSelectedItemsContinueConfirmOpen,
  ] = useState(false);
  const [itineraryActionCenterOpen, setItineraryActionCenterOpen] =
    useState(false);
  const [itineraryPreviewOpen, setItineraryPreviewOpen] = useState(false);
  const [itineraryActionRunning, setItineraryActionRunning] = useState(false);
  const actionCenterRef = useRef<HTMLDivElement | null>(null);
  const exportCenterCardRef = useRef<HTMLDivElement | null>(null);
  const [showHelpBanner, setShowHelpBanner] = useState(false);
  const [showDayHint, setShowDayHint] = useState(false);
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>(
    () => {
      const baseStatuses = Object.fromEntries(
        initialDays.map((day) => [day.id, initialDayStatus(day)])
      ) as Record<string, DayStatus>;

      if (typeof window === "undefined") return baseStatuses;

      try {
        const raw = window.sessionStorage.getItem(
          MY_TRIPS_RESTORE_DAY_STATUSES_KEY
        );
        const restored = raw ? JSON.parse(raw) : null;
        if (restored && typeof restored === "object") {
          return { ...baseStatuses, ...(restored as Record<string, DayStatus>) };
        }
      } catch {
        return baseStatuses;
      }

      return baseStatuses;
    }
  );
  const selectedBookingItemIds = useMemo(
    () =>
      bookingBasket
        .map((item) => item.sourceItemId)
        .filter((itemId): itemId is string => Boolean(itemId)),
    [bookingBasket]
  );

  useEffect(() => {
    setDays(initialDays);
    setOpenDayId((current) => {
      if (current && initialDays.some((day) => day.id === current)) return current;

      try {
        const restoredDayId = window.sessionStorage.getItem(
          ITINERARY_ACTIVE_DAY_KEY
        );
        if (restoredDayId && initialDays.some((day) => day.id === restoredDayId)) {
          return restoredDayId;
        }
      } catch {
        return initialDays[0]?.id || "";
      }

      return initialDays[0]?.id || "";
    });
    setDayStatuses((current) =>
      Object.fromEntries(
        initialDays.map((day) => [
          day.id,
          current[day.id] || initialDayStatus(day),
        ])
      )
    );
  }, [initialDays]);

  useEffect(() => {
    try {
      setShowHelpBanner(localStorage.getItem("planner_help_seen") !== "true");
    } catch {
      setShowHelpBanner(false);
    }
  }, []);

  useEffect(() => {
    try {
      setShowDayHint(localStorage.getItem("planner_day_hint_seen") !== "true");
    } catch {
      setShowDayHint(false);
    }
  }, []);

  function dismissHelpBanner() {
    setShowHelpBanner(false);
    try {
      localStorage.setItem("planner_help_seen", "true");
    } catch {
      // Ignore storage failures; the banner remains safely dismissible.
    }
  }

  function dismissDayHint() {
    setShowDayHint(false);
    try {
      localStorage.setItem("planner_day_hint_seen", "true");
    } catch {
      // Ignore storage failures; the hint remains safely dismissible.
    }
  }

  function markDayChanged(dayId: string, nextDay?: TiyaDayPlan) {
    const day = nextDay || days.find((currentDay) => currentDay.id === dayId);
    if (!day) return;

    setDayStatuses((current) => ({
      ...current,
      [dayId]: statusForChangedDay(current[dayId], day),
    }));
  }

  function syncStatusesForDays(nextDays: TiyaDayPlan[]) {
    setDayStatuses((current) =>
      Object.fromEntries(
        nextDays.map((day) => [
          day.id,
          current[day.id] || initialDayStatus(day),
        ])
      )
    );
  }

  function jumpToDay(dayId: string) {
    setOpenDayId(dayId);
    try {
      window.sessionStorage.setItem(ITINERARY_ACTIVE_DAY_KEY, dayId);
    } catch {
      // Active day restore is best-effort only.
    }
    document
      .getElementById(`planner-day-${dayId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function viewTripSelections() {
    if (!tripProgress.allFinalized) {
      setContinueBookingWarning(
        "Please finalize all itinerary days before continuing to booking."
      );
      setJourneyControlMessage(
        "Please finalize all itinerary days before continuing to booking."
      );
      return;
    }

    if (bookingBasket.length < 1) {
      setContinueBookingWarning(
        "Please finalize a day and add booking items before continuing."
      );
      setJourneyControlMessage(
        "Please finalize a day and add booking items before continuing."
      );
      return;
    }

    setContinueBookingWarning("");
    window.dispatchEvent(new Event("tpl:open-trip-selections"));
  }

  function continueWithSelectedBookingItems() {
    if (bookingBasket.length < 1) {
      setContinueBookingWarning(
        "Please add at least one item to booking before continuing."
      );
      setJourneyControlMessage(
        "Please add at least one item to booking before continuing."
      );
      return;
    }

    if (!tripProgress.allFinalized) {
      setContinueBookingWarning("");
      setSelectedItemsContinueConfirmOpen(true);
      return;
    }

    setContinueBookingWarning("");
    window.dispatchEvent(new Event("tpl:open-trip-selections"));
  }

  function confirmSelectedItemsContinue() {
    setSelectedItemsContinueConfirmOpen(false);
    setContinueBookingWarning("");
    window.dispatchEvent(new Event("tpl:open-trip-selections"));
  }

  function openItineraryActionCenterInline() {
    setItineraryActionCenterOpen(true);
    window.setTimeout(() => {
      document
        .getElementById("itinerary-action-center")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
  }

  function closeItineraryActionCenter() {
    if (itineraryActionRunning) return;
    setItineraryActionCenterOpen(false);
  }

  function handleExportShareClick() {
    openItineraryActionCenterInline();
  }

  function addVisibleDayItemsToBooking(day: TiyaDayPlan) {
    const dayIndex = days.findIndex((currentDay) => currentDay.id === day.id);
    if (dayIndex < 0 || !setBookingBasket) return 0;

    const visibleBookingItems = day.items.map((item) =>
      buildBookingBasketItemFromTimeline({
        day,
        item,
        dayIndex,
        totalBudget: 42000,
        allDays: days,
      })
    );

    if (visibleBookingItems.length === 0) return 0;

    setBookingBasket((current) =>
      visibleBookingItems.reduce<WorkspaceBookingBasketItem[]>(
        (nextBasket, item) => upsertBookingBasketItem(nextBasket, item),
        current
      )
    );

    return visibleBookingItems.length;
  }

  function finalizeDay(day: TiyaDayPlan) {
    if (dayStatuses[day.id] === "FINALIZED") {
      setJourneyControlMessage(`Day ${day.day} is already finalized.`);
      return;
    }

    const addedCount = addVisibleDayItemsToBooking(day);
    setDayStatuses((current) => ({
      ...current,
      [day.id]: "FINALIZED",
    }));
    setContinueBookingWarning("");
    setDayNavigationWarning("");
    setJourneyControlMessage(`Day ${day.day} finalized and added to booking.`);
    window.dispatchEvent(
      new CustomEvent("tpl:itinerary-day-finalized", {
        detail: {
          addedBookingItems: addedCount,
          dayId: day.id,
          dayNumber: day.day,
          title: `Day ${day.day} finalized and added to booking.`,
        },
      })
    );
  }

  function continueToNextDay(day: TiyaDayPlan) {
    const currentIndex = days.findIndex((currentDay) => currentDay.id === day.id);
    const nextDay = days[currentIndex + 1];

    if (!nextDay) return;

    const dayStatus = dayStatuses[day.id] || initialDayStatus(day);
    if (dayStatus !== "FINALIZED") {
      setFinalizationAssistModal({
        open: true,
        dayId: day.id,
        nextDayId: nextDay.id,
      });
      setDayNavigationWarning("");
      setContinueBookingWarning("");
      return;
    }

    jumpToDay(nextDay.id);
  }

  function finalizeDayAndContinue(day: TiyaDayPlan, nextDayId?: string) {
    finalizeDay(day);
    setFinalizationAssistModal({ open: false });

    if (nextDayId) {
      window.setTimeout(() => jumpToDay(nextDayId), 0);
    }
  }

  function skipDayAndContinue(day: TiyaDayPlan, nextDayId?: string) {
    setFinalizationAssistModal({ open: false });
    setDayNavigationWarning(
      `Day ${day.day} skipped without finalizing. Booking will use only selected basket items.`
    );
    setJourneyControlMessage(
      `Day ${day.day} skipped without finalizing. You can return and finalize it later.`
    );

    if (nextDayId) {
      window.setTimeout(() => jumpToDay(nextDayId), 0);
    }
  }

  function editFinalizedDay(day: TiyaDayPlan) {
    const confirmed = window.confirm(
      "Editing this day may affect Trip Selections and final journey readiness."
    );

    if (!confirmed) return;

    setDayStatuses((current) => ({
      ...current,
      [day.id]: "EDITING",
    }));
  }

  function commitDays(nextDays: TiyaDayPlan[]) {
    const normalizedDays = nextDays.map((day, index) => ({
      ...day,
      day: index + 1,
    }));

    // Future AI hook: recalculateSmartJourney(normalizedDays, currentRoute, preferences)
    setDays(normalizedDays);
    syncStatusesForDays(normalizedDays);
    onDaysChange?.(normalizedDays);
  }

  function getTab(dayId: string): DayTab {
    return activeTabs[dayId] || "Overview";
  }

  function setTab(dayId: string, tab: DayTab) {
    setActiveTabs((current) => ({ ...current, [dayId]: tab }));
  }

  function addTimelineItemToBooking(itemId: string) {
    const dayIndex = days.findIndex((day) =>
      day.items.some((item) => item.id === itemId)
    );
    const day = days[dayIndex];
    const item = day?.items.find((dayItem) => dayItem.id === itemId);

    if (!day || !item || !setBookingBasket) return;
    if (dayStatuses[day.id] === "FINALIZED") return;
    if (selectedBookingItemIds.includes(itemId)) {
      setJourneyControlMessage(`${item.title} is already in the booking basket.`);
      return;
    }

    const basketItem = buildBookingBasketItemFromTimeline({
      day,
      item,
      dayIndex: Math.max(0, dayIndex),
      totalBudget: 42000,
      allDays: days,
    });

    setBookingBasket((current) => upsertBookingBasketItem(current, basketItem));
    setJourneyControlMessage(`${item.title} added to booking basket.`);
    window.dispatchEvent(
      new CustomEvent("tpl:itinerary-item-added-to-booking", {
        detail: {
          dayId: day.id,
          dayNumber: day.day,
          itemId: item.id,
          title: item.title,
          costDelta: basketItem.estimatedTotal ?? basketItem.estimatedPrice ?? basketItem.price ?? 0,
        },
      })
    );
  }

  function openOptionModal({
    dayId,
    dayCity,
    itemId,
    mode,
    itemType,
  }: {
    dayId: string;
    dayCity: string;
    itemId?: string;
    mode: "timeline" | "booking" | "explore";
    itemType: TiyaTimelineItem["type"];
  }) {
    const day = days.find((currentDay) => currentDay.id === dayId);
    if (dayStatuses[dayId] === "FINALIZED") return;
    const item = itemId
      ? day?.items.find((currentItem) => currentItem.id === itemId)
      : undefined;

    setOptionModal({
      open: true,
      dayId,
      dayCity,
      itemId,
      mode,
      itemType,
      title: modalTitle(itemType),
      currentTitle: item?.title,
      currentPrice: item?.price,
      currentPriceBasis: item?.priceBasis,
      serviceType: item?.serviceType,
      options: item?.options,
    });
  }

  function patchTimelineItem(
    dayId: string,
    itemId: string,
    patch: Partial<TiyaTimelineItem>
  ) {
    const dayIndex = days.findIndex((day) => day.id === dayId);
    const sourceDay = days[dayIndex];
    const sourceItem = sourceDay?.items.find((item) => item.id === itemId);

    if (!sourceDay || !sourceItem) return;
    if (dayStatuses[dayId] === "FINALIZED") return;

    const nextItem = { ...sourceItem, ...patch };
    const nextDay = {
      ...sourceDay,
      items: sourceDay.items.map((item) =>
        item.id === itemId ? nextItem : item
      ),
    };

    commitDays(
      days.map((day) =>
        day.id === dayId ? nextDay : day
      )
    );
    markDayChanged(dayId, nextDay);

    if (selectedBookingItemIds.includes(itemId)) {
      setBookingBasket?.((current) =>
        upsertBookingBasketItem(
          current,
          buildBookingBasketItemFromTimeline({
            day: sourceDay,
            item: nextItem,
            dayIndex: Math.max(0, dayIndex),
            totalBudget: 42000,
            allDays: days,
          })
        )
      );
    }
  }

  function selectOptionFromModal(option: TimelineOption) {
    if (!optionModal.open || optionModal.mode === "addItem") return;

    if (optionModal.itemId) {
      patchTimelineItem(optionModal.dayId, optionModal.itemId, {
        title: option.name,
        unitPrice: option.price,
        displayPriceLabel: displayTimelinePriceLabel(
          option.price,
          optionModal.currentPriceBasis
        ),
        price: option.price,
        providerName: option.providerName,
        detailSummary: option.detailSummary,
        details: option.details,
        bookingStatus: selectedBookingItemIds.includes(optionModal.itemId)
          ? "selected"
          : "available",
      });
    } else {
      addItem(optionModal.dayId, optionModal.itemType, option.name, {
        selectAfterAdd: true,
      });
    }

    setOpenDayId(optionModal.dayId);
    setTab(optionModal.dayId, "Overview");
    setOptionModal({ open: false });
  }

  function selectAddItemOption(option: AddItemOption) {
    if (!optionModal.open || optionModal.mode !== "addItem") return;

    addItem(optionModal.dayId, option.type, option.defaultTitle, {
      time: option.suggestedTime,
    });
    setOpenDayId(optionModal.dayId);
    setTab(optionModal.dayId, "Overview");
    setOptionModal({ open: false });
  }

  function updateItem(
    dayId: string,
    itemId: string,
    field: keyof TiyaTimelineItem,
    value: string
  ) {
    const dayIndex = days.findIndex((day) => day.id === dayId);
    const sourceDay = days[dayIndex];
    const sourceItem = sourceDay?.items.find((item) => item.id === itemId);
    if (dayStatuses[dayId] === "FINALIZED") return;
    const nextItem = sourceItem ? { ...sourceItem, [field]: value } : null;
    const nextDay = sourceDay
      ? {
          ...sourceDay,
          items: sourceDay.items.map((item) =>
            item.id === itemId && nextItem ? nextItem : item
          ),
        }
      : null;

    commitDays(
      days.map((day) =>
        day.id === dayId && nextDay ? nextDay : day
      )
    );
    if (nextDay) markDayChanged(dayId, nextDay);

    if (sourceDay && sourceItem && selectedBookingItemIds.includes(itemId)) {
      setBookingBasket?.((current) =>
        upsertBookingBasketItem(
          current,
          buildBookingBasketItemFromTimeline({
            day: sourceDay,
            item: nextItem as TiyaTimelineItem,
            dayIndex: Math.max(0, dayIndex),
            totalBudget: 42000,
            allDays: days,
          })
        )
      );
    }
  }

  function removeStop(dayId: string, itemId: string) {
    if (dayStatuses[dayId] === "FINALIZED") return;
    const sourceDay = days.find((day) => day.id === dayId);
    const nextDay = sourceDay
      ? {
          ...sourceDay,
          items: sourceDay.items.filter((item) => item.id !== itemId),
        }
      : null;

    if (nextDay) markDayChanged(dayId, nextDay);
    setBookingBasket?.((current) =>
      current.filter((basketItem) => basketItem.sourceItemId !== itemId)
    );

    commitDays(
      days.map((day) =>
        day.id === dayId && nextDay ? nextDay : day
      )
    );
  }

  function addItem(
    dayId: string,
    type: TiyaTimelineItem["type"],
    title?: string,
    options?: { selectAfterAdd?: boolean; time?: string }
  ) {
    if (dayStatuses[dayId] === "FINALIZED") return;
    const day = days.find((currentDay) => currentDay.id === dayId);
    const timeMap: Record<TiyaTimelineItem["type"], string> = {
      transport: "09:00",
      stay: "13:00",
      meal: "20:00",
      activity: "15:00",
    };
    const titleMap: Record<TiyaTimelineItem["type"], string> = {
      transport: "New transport option",
      stay: "New stay option",
      meal: "New food stop",
      activity: "New activity / experience",
    };

    let newItemId = "";
    let newItem: TiyaTimelineItem | null = null;
    let changedDay: TiyaDayPlan | null = null;

    commitDays(
      days.map((currentDay) =>
        currentDay.id === dayId
          ? (() => {
              newItemId = `${type}-${dayId}-${currentDay.items.length + 1}`;
              const createdItem: TiyaTimelineItem = {
                id: newItemId,
                time: options?.time || timeMap[type],
                title: title || titleMap[type],
                location: day?.city || "",
                type,
              };
              newItem = createdItem;

              return {
                ...currentDay,
                items: [...currentDay.items, createdItem],
              };
            })()
          : currentDay
      ).map((currentDay) => {
        if (currentDay.id !== dayId || !newItem) return currentDay;
        changedDay = currentDay;
        return currentDay;
      })
    );
    if (changedDay) markDayChanged(dayId, changedDay);

    if (options?.selectAfterAdd && day && newItem) {
      const dayIndex = days.findIndex((currentDay) => currentDay.id === dayId);

      setBookingBasket?.((current) =>
        upsertBookingBasketItem(
          current,
          buildBookingBasketItemFromTimeline({
            day,
            item: newItem as TiyaTimelineItem,
            dayIndex: Math.max(0, dayIndex),
            totalBudget: 42000,
            allDays: days,
          })
        )
      );
    }
  }

  function duplicateDay(dayId: string) {
    const sourceIndex = days.findIndex((day) => day.id === dayId);
    const sourceDay = days[sourceIndex];

    if (!sourceDay) return;

    const copyCount = days.filter((day) =>
      day.id.startsWith(`${sourceDay.id}-copy`)
    ).length;
    const duplicatedDay: TiyaDayPlan = {
      ...sourceDay,
      id: `${sourceDay.id}-copy-${copyCount + 1}`,
      headline: `${sourceDay.headline} (copy)`,
      items: sourceDay.items.map((item, itemIndex) => ({
        ...item,
        id: `${item.id}-copy-${copyCount + 1}-${itemIndex + 1}`,
      })),
    };

    const nextDays = [...days];
    nextDays.splice(sourceIndex + 1, 0, duplicatedDay);
    commitDays(nextDays);
  }

  function moveDay(dayId: string, direction: "up" | "down") {
    const currentIndex = days.findIndex((day) => day.id === dayId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= days.length) return;

    const nextDays = [...days];
    const [movedDay] = nextDays.splice(currentIndex, 1);
    nextDays.splice(targetIndex, 0, movedDay);
    commitDays(nextDays);
  }

  function increaseTripDuration() {
    const lastDay = days[days.length - 1];
    const nextDayNumber = days.length + 1;
    const nextDay: TiyaDayPlan = {
      id: `day-${nextDayNumber}`,
      day: nextDayNumber,
      date: nextDateLabel(lastDay?.date),
      city: lastDay?.city || "Destination",
      pace: "Balanced",
      headline: generatedDayTitle(nextDayNumber, lastDay?.city),
      notes: "AI-ready day shell generated from the current route context.",
      items: [],
    };

    commitDays([...days, nextDay]);
    setOpenDayId(nextDay.id);
  }

  function removeLastDayDirectly() {
    if (days.length <= 1) return;

    const lastDay = days[days.length - 1];
    setBookingBasket?.((current) =>
      current.filter(
        (basketItem) =>
          !lastDay.items.some((item) => item.id === basketItem.sourceItemId)
      )
    );
    commitDays(days.slice(0, -1));
    setOpenDayId(days[days.length - 2]?.id || "");
  }

  function decreaseTripDuration() {
    if (days.length <= 1) return;

    const lastDay = days[days.length - 1];
    const selectedItemIds = lastDay.items
      .map((item) => item.id)
      .filter((itemId) => selectedBookingItemIds.includes(itemId));

    if (selectedItemIds.length > 0) {
      setDurationReduceModal({ open: true, day: lastDay, selectedItemIds });
      return;
    }

    removeLastDayDirectly();
  }

  function moveLastDayItemsToPreviousDay() {
    if (!durationReduceModal.open || days.length <= 1) return;

    const lastDay = days[days.length - 1];
    const previousDay = days[days.length - 2];
    const movedItems = lastDay.items.map((item, index) => ({
      ...item,
      id: item.id,
      time: item.time || `${9 + index}:00`,
    }));

    const nextDays = days.slice(0, -2).concat({
      ...previousDay,
      items: [...previousDay.items, ...movedItems],
    });

    setBookingBasket?.((current) =>
      current.map((basketItem) =>
        movedItems.some((item) => item.id === basketItem.sourceItemId)
          ? {
              ...basketItem,
              dayId: previousDay.id,
              day: previousDay.day,
              dayLabel: `Day ${String(previousDay.day).padStart(2, "0")}`,
              city: previousDay.city,
              date: previousDay.date,
            }
          : basketItem
      )
    );
    commitDays(nextDays);
    setOpenDayId(previousDay.id);
    setDurationReduceModal({ open: false });
  }

  function removeLastDayAnyway() {
    removeLastDayDirectly();
    setDurationReduceModal({ open: false });
  }

  const totals = useMemo(
    () => ({
      stays: days.reduce(
        (sum, day) => sum + day.items.filter((item) => item.type === "stay").length,
        0
      ),
      activities: days.reduce(
        (sum, day) =>
          sum + day.items.filter((item) => item.type === "activity").length,
        0
      ),
      transport: days.reduce(
        (sum, day) =>
          sum + day.items.filter((item) => item.type === "transport").length,
        0
      ),
      meals: days.reduce(
        (sum, day) => sum + day.items.filter((item) => item.type === "meal").length,
        0
      ),
    }),
    [days]
  );
  const plannerIntelligence = useMemo(
    () => buildPlannerIntelligence(days),
    [days]
  );
  const finalizedDayCount = days.filter(
    (day) => dayStatuses[day.id] === "FINALIZED"
  ).length;
  const inProgressDayCount = days.some(
    (day) => day.id === openDayId && dayStatuses[day.id] !== "FINALIZED"
  )
    ? 1
    : 0;
  const tripProgress = {
    finalizedDays: finalizedDayCount,
    inProgressDays: inProgressDayCount,
    pendingDays: Math.max(0, days.length - finalizedDayCount - inProgressDayCount),
    remainingDays: Math.max(0, days.length - finalizedDayCount),
    journeyPercent:
      days.length > 0 ? Math.round((finalizedDayCount / days.length) * 100) : 0,
    allFinalized: days.length > 0 && finalizedDayCount === days.length,
  };
  const selectionSummary = useMemo(
    () => tripSelectionSummary(bookingBasket),
    [bookingBasket]
  );
  const finalJourneyGenerated = finalJourneyState === "generated";
  const selectedDayId = openDayId || days[0]?.id || "";
  const selectedDayIndex = Math.max(
    0,
    days.findIndex((day) => day.id === selectedDayId)
  );
  const selectedDay = days[selectedDayIndex];
  const selectedDayStatus = selectedDay
    ? dayStatuses[selectedDay.id] || initialDayStatus(selectedDay)
    : "PLANNING";
  const selectedDayReadyToFinalize = selectedDay
    ? selectedDayStatus !== "FINALIZED"
    : false;
  const selectedDisplayStatus = displayDayStatus(
    selectedDayStatus,
    selectedDayReadyToFinalize
  );
  const selectedStatusMeta = dayStatusMeta[selectedDisplayStatus];
  const assistDay = finalizationAssistModal.open
    ? days.find((day) => day.id === finalizationAssistModal.dayId)
    : undefined;

  useEffect(() => {
    function returnToActiveDay() {
      const activeDay =
        document.getElementById(`planner-day-${selectedDayId}`) ||
        document.querySelector<HTMLElement>("[id^='planner-day-']");

      activeDay?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.addEventListener("tpl:return-to-itinerary", returnToActiveDay);

    return () => {
      window.removeEventListener("tpl:return-to-itinerary", returnToActiveDay);
    };
  }, [selectedDayId]);

  useEffect(() => {
    function returnToRequestedDay(event: Event) {
      const dayId = (event as CustomEvent<{ dayId?: string }>).detail?.dayId;
      if (!dayId) return;

      jumpToDay(dayId);
    }

    window.addEventListener("tpl:return-to-itinerary-day", returnToRequestedDay);

    return () => {
      window.removeEventListener(
        "tpl:return-to-itinerary-day",
        returnToRequestedDay
      );
    };
  }, [days]);

  useEffect(() => {
    function updateFinalJourneyState(event: Event) {
      const status = (
        event as CustomEvent<{ status?: "pending" | "generated" | "stale" }>
      ).detail?.status;

      if (status === "generated") {
        setFinalJourneyState("generated");
        return;
      }

      if (status === "stale") {
        setFinalJourneyState("stale");
        return;
      }

      if (status === "pending") {
        setFinalJourneyState("draft");
      }
    }

    function updateJourneyControlMessage(event: Event) {
      const message = (event as CustomEvent<{ message?: string }>).detail
        ?.message;

      if (message) setJourneyControlMessage(message);
    }

    function toggleItineraryActionCenter() {
      setItineraryActionCenterOpen((current) => !current);
      window.setTimeout(() => {
        document
          .getElementById("itinerary-action-center")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 0);
    }

    function openItineraryActionCenter() {
      openItineraryActionCenterInline();
    }

    function resumeExportShareAfterLogin() {
      if (
        window.sessionStorage.getItem("tpl_pending_export_share_after_login") !==
        "true"
      ) {
        return;
      }

      window.sessionStorage.removeItem("tpl_pending_export_share_after_login");
      openItineraryActionCenterInline();
    }

    function updateItineraryActionOperation(event: Event) {
      const running = Boolean(
        (event as CustomEvent<{ running?: boolean }>).detail?.running
      );
      setItineraryActionRunning(running);
    }

    window.addEventListener("tpl:final-journey-state", updateFinalJourneyState);
    window.addEventListener(
      "tpl:journey-control-message",
      updateJourneyControlMessage
    );
    window.addEventListener(
      "tpl:toggle-itinerary-action-center",
      toggleItineraryActionCenter
    );
    window.addEventListener(
      "tpl:open-itinerary-action-center",
      openItineraryActionCenter
    );
    window.addEventListener(AUTH_UPDATED_EVENT, resumeExportShareAfterLogin);
    window.addEventListener(
      "tpl:itinerary-action-operation",
      updateItineraryActionOperation
    );

    return () => {
      window.removeEventListener(
        "tpl:final-journey-state",
        updateFinalJourneyState
      );
      window.removeEventListener(
        "tpl:journey-control-message",
        updateJourneyControlMessage
      );
      window.removeEventListener(
        "tpl:toggle-itinerary-action-center",
        toggleItineraryActionCenter
      );
      window.removeEventListener(
        "tpl:open-itinerary-action-center",
        openItineraryActionCenter
      );
      window.removeEventListener(AUTH_UPDATED_EVENT, resumeExportShareAfterLogin);
      window.removeEventListener(
        "tpl:itinerary-action-operation",
        updateItineraryActionOperation
      );
    };
  }, []);

  useEffect(() => {
    if (!itineraryActionCenterOpen) return;

    function handleDocumentPointerDown(event: MouseEvent) {
      if (itineraryActionRunning) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (actionCenterRef.current?.contains(target)) return;
      if (exportCenterCardRef.current?.contains(target)) return;

      setItineraryActionCenterOpen(false);
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || itineraryActionRunning) return;
      setItineraryActionCenterOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [itineraryActionCenterOpen, itineraryActionRunning]);

  useEffect(() => {
    finalJourneyStateRef.current = finalJourneyState;
  }, [finalJourneyState]);

  useEffect(() => {
    if (finalJourneyStateRef.current !== "generated") return;
    setFinalJourneyState("stale");
    window.dispatchEvent(
      new CustomEvent("tpl:final-journey-state", {
        detail: { status: "stale" },
      })
    );
  }, [bookingBasket, days, dayStatuses]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        MY_TRIPS_RESTORE_DAY_STATUSES_KEY,
        JSON.stringify(dayStatuses)
      );
    } catch {
      // Session restore is best-effort; readiness events still update the parent.
    }

    window.dispatchEvent(
      new CustomEvent("tpl:journey-readiness-update", {
        detail: {
          allFinalized: tripProgress.allFinalized,
          finalizedDays: tripProgress.finalizedDays,
          finalizedDayIds: days
            .filter((day) => dayStatuses[day.id] === "FINALIZED")
            .map((day) => day.id),
          finalizedDayNumbers: days
            .filter((day) => dayStatuses[day.id] === "FINALIZED")
            .map((day) => day.day),
          journeyPercent: tripProgress.journeyPercent,
          dayStatuses,
          pendingDays: days
            .filter((day) => dayStatuses[day.id] !== "FINALIZED")
            .map((day) => ({
              date: day.date,
              day: day.day,
              headline: day.headline,
              id: day.id,
              status: displayDayStatus(
                dayStatuses[day.id] || initialDayStatus(day),
                dayFinalizeIssues(day, days, bookingBasket).length === 0
              ),
            })),
          totalDays: days.length,
        },
      })
    );
  }, [
    bookingBasket,
    days,
    dayStatuses,
    tripProgress.allFinalized,
    tripProgress.finalizedDays,
    tripProgress.journeyPercent,
  ]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07111F] p-4 font-sans text-white sm:p-5">
      <section className="relative mb-5 overflow-hidden rounded-[1.75rem] border border-blue-400/15 bg-[linear-gradient(135deg,#0D1B2F_0%,#091827_100%)] p-5 shadow-[0_18px_60px_rgba(7,17,31,0.28)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white">
              Your Smart Day-wise Itinerary
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
              Review each day, compare options, add items to your booking basket,
              and continue when ready.
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-blue-400/15 bg-[#102742] p-2 shadow-[0_0_28px_rgba(255,138,31,0.10)]">
            <p className="mb-1 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Trip Duration
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decreaseTripDuration}
                disabled={days.length <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-lg font-black text-white transition hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-35"
              >
                -
              </button>
              <span className="min-w-[92px] rounded-full border border-orange-300/35 bg-[#FF8A1F] px-4 py-2 text-center text-sm font-black text-slate-950 shadow-[0_0_22px_rgba(255,138,31,0.24)]">
                {days.length} Day{days.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={increaseTripDuration}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-300/35 bg-orange-400/15 text-lg font-black text-orange-100 transition hover:bg-orange-400/24"
              >
                +
              </button>
            </div>
          </div>
        </div>
        {days.length > 0 ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill value={days.length} label="Days" tone={color.amber} />
            <StatPill value={totals.transport} label="Rides" tone={color.sky} />
            <StatPill value={totals.stays} label="Stays" tone={color.teal} />
            <StatPill value={totals.activities} label="Bookable" tone={color.lime} />
          </div>
        ) : null}
        {days.length > 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-blue-400/25 bg-[linear-gradient(180deg,#102742,#0D1E35)] p-4 shadow-[0_16px_44px_rgba(7,17,31,0.28)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Trip Progress
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {days.map((day) => {
                    const status = dayStatuses[day.id] || initialDayStatus(day);
                    const active = openDayId === day.id;
                    const finalized = status === "FINALIZED";
                    const ready = dayFinalizeIssues(day, days, bookingBasket).length === 0 && !finalized;
                    const displayStatus = displayDayStatus(status, ready);
                    const meta = dayStatusMeta[displayStatus];
                    const pillTone = finalized ? dayStatusMeta.FINALIZED.tone : active ? dayStatusMeta.PLANNING.tone : meta.tone;
                    const pillBg = finalized ? dayStatusMeta.FINALIZED.bg : active ? dayStatusMeta.PLANNING.bg : meta.bg;
                    const pillBorder = finalized ? dayStatusMeta.FINALIZED.border : active ? dayStatusMeta.PLANNING.border : meta.border;

                    return (
                      <button
                        key={`${day.id}-progress`}
                        type="button"
                        onClick={() => jumpToDay(day.id)}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-black transition hover:-translate-y-0.5"
                        style={{
                          color: active && !finalized ? "#0B0F1A" : pillTone,
                          background: active && !finalized ? pillTone : pillBg,
                          borderColor: active ? pillTone : pillBorder,
                          boxShadow: active ? `0 0 22px ${pillTone}55` : "none",
                        }}
                      >
                        <span>{finalized ? "✓" : active ? "⚡" : "○"}</span>
                        Day {String(day.day).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0 rounded-2xl border border-cyan-300/12 bg-[#12243D] p-3 sm:min-w-[220px]">
                  <div className="grid gap-1.5 text-xs font-black">
                    <span className="text-emerald-100">
                      ✓ {tripProgress.finalizedDays} Day{tripProgress.finalizedDays === 1 ? "" : "s"} Finalized
                    </span>
                    <span className="text-blue-100">
                      ⚡ {tripProgress.inProgressDays} Day{tripProgress.inProgressDays === 1 ? "" : "s"} In Progress
                    </span>
                    <span className="text-slate-300">
                      ○ {tripProgress.pendingDays} Day{tripProgress.pendingDays === 1 ? "" : "s"} Pending
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300 transition-all duration-500"
                      style={{ width: `${tripProgress.journeyPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {tripProgress.journeyPercent}% Journey Complete
                  </p>
                </div>
                <div className="hidden gap-2 lg:grid">
                  {tripProgress.allFinalized ? (
                    <button
                      type="button"
                      onClick={viewTripSelections}
                      className="min-h-11 rounded-full border border-orange-300/45 bg-[#FF8A1F] px-5 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(255,138,31,0.20)] transition hover:bg-[#FFA63A]"
                    >
                      Continue To Booking →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="min-h-11 rounded-full border border-orange-300/25 bg-[#FF8A1F] px-5 text-sm font-black text-slate-950 opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue To Booking →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {showHelpBanner ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-50 shadow-[0_14px_34px_rgba(34,211,238,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-black">Tip:</span> Hover over any action
            button to learn what it does.
          </p>
          <button
            type="button"
            onClick={dismissHelpBanner}
            className="min-h-8 rounded-full border border-cyan-200/25 bg-white/[0.06] px-3 text-xs font-black text-cyan-50 transition hover:bg-white/[0.12] sm:self-auto"
          >
            Got it
          </button>
        </div>
      ) : null}

      {dayNavigationWarning ? (
        <div className="mb-4 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
          {dayNavigationWarning}
        </div>
      ) : null}

      {days.length === 0 ? (
        <TiyaEmptyState
          icon={MapPin}
          eyebrow="Itinerary canvas"
          title="Tiya has not built day cards yet"
          detail="Generate a smart plan or restore a draft to populate this editable day-wise workspace."
          tone="light"
        />
      ) : null}

      {showDayHint && days.length > 0 ? (
        <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-400/[0.08] p-4 shadow-[0_18px_44px_rgba(8,145,178,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/25 bg-cyan-300/15 text-cyan-100">
              <Sparkles size={17} />
            </span>
            <p className="text-sm font-black text-white">
              Click a day to explore its timeline
            </p>
          </div>
          <button
            type="button"
            onClick={dismissDayHint}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-slate-200 transition hover:border-cyan-200/30 hover:bg-cyan-300/10"
          >
            Got it
            <X size={14} />
          </button>
        </div>
      ) : null}

      {days.length > 0 ? (
        <section className="mb-4 grid min-w-0 gap-3 lg:hidden">
          <div className="rounded-3xl border border-cyan-300/16 bg-[#0D1B2F] p-4 shadow-[0_16px_44px_rgba(7,17,31,0.22)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
              Your Smart Day-wise Itinerary
            </p>
            <h3 className="mt-1 break-words text-xl font-black text-white">
              {days.length} day plan
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] font-black text-cyan-50">
                {days[0]?.city || "Origin"} → {days[days.length - 1]?.city || "Destination"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-black text-slate-200">
                {days.length} Days
              </span>
              <span className="rounded-full border border-orange-300/22 bg-orange-400/10 px-3 py-1 text-[11px] font-black text-orange-100">
                {selectionSummary.selectedItems} Bookable
              </span>
              <span className="rounded-full border border-emerald-300/22 bg-emerald-400/10 px-3 py-1 text-[11px] font-black text-emerald-100">
                {tripProgress.finalizedDays} Finalized · {tripProgress.pendingDays} Pending
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-400/15 bg-[#0D1B2F] p-4 shadow-[0_16px_44px_rgba(7,17,31,0.18)]">
            <label className="block min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Select Day
              </span>
              <select
                value={selectedDayId}
                onChange={(event) => jumpToDay(event.target.value)}
                className="mt-2 h-12 w-full min-w-0 rounded-2xl border border-cyan-300/16 bg-[#12243D] px-3 text-sm font-black text-white outline-none"
              >
                {days.map((day) => (
                  <option key={`mobile-day-select-${day.id}`} value={day.id}>
                    Day {String(day.day).padStart(2, "0")} - {day.headline}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedDay ? (
            <div className="grid min-w-0 gap-3">
              {selectedDay.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/12 bg-[#0D1B2F] p-5 text-center text-sm font-semibold text-slate-400">
                  No events yet. Add items to build this day.
                </div>
              ) : (
                selectedDay.items.map((item) => (
                  <div
                    key={`${selectedDay.id}-mobile-primary-${item.id}`}
                    className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1B2F] p-3 shadow-[0_14px_34px_rgba(7,17,31,0.20)]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-2.5 py-1 font-mono text-[11px] font-black text-cyan-50">
                          {item.time || "Flexible"}
                        </span>
                        <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="mt-2 break-words text-base font-black leading-tight text-white">
                        {item.title}
                      </h4>
                      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                        {[
                          ["Duration", itemDuration(item) || "Flexible"],
                          ["Route", timelineItemRouteLabel(item) || item.location || selectedDay.city],
                          [
                            "Value",
                            displayTimelinePriceLabel(
                              item.unitPrice || item.price || 0,
                              item.priceBasis
                            ),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={`${item.id}-mobile-primary-meta-${label}`}
                            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2"
                          >
                            <span className="shrink-0 text-slate-500">{label}</span>
                            <span className="min-w-0 break-words text-right font-black text-slate-100">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <TimelineActionRow
                          dayId={selectedDay.id}
                          item={item}
                          isSelected={selectedBookingItemIds.includes(item.id)}
                          isLocked={selectedDayStatus === "FINALIZED"}
                          onAddToBooking={() => addTimelineItemToBooking(item.id)}
                          onViewDetails={() =>
                            setServiceDetailModal({
                              open: true,
                              day: selectedDay,
                              item,
                            })
                          }
                          onViewOptions={() =>
                            openOptionModal({
                              dayId: selectedDay.id,
                              dayCity: selectedDay.city,
                              itemId: item.id,
                              mode: "timeline",
                              itemType: item.type,
                            })
                          }
                          onRemove={() => removeStop(selectedDay.id, item.id)}
                          onUpdate={updateItem}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="rounded-3xl border border-cyan-300/14 bg-[#12243D]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Category Summary
              </p>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/12 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                Live
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              {[
                ["Transport", selectionSummary.counters.transport],
                ["Stay", selectionSummary.counters.stay],
                ["Activity", selectionSummary.counters.activity],
                ["Meal", selectionSummary.counters.meal],
                ["Local Life", selectionSummary.counters.localMarket],
                ["Creator Experience", selectionSummary.counters.creatorExperience],
              ].map(([label, value]) => (
                <div
                  key={`mobile-category-${label}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2"
                >
                  <span className="min-w-0 break-words text-xs font-bold text-slate-300">
                    {label}
                  </span>
                  <span className="font-mono text-sm font-black text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedDay ? (
            <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,26,0.96),rgba(8,10,15,0.94))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                Mobile Action Panel
              </p>
              <h4 className="mt-1 break-words text-base font-black text-white">
                Day {String(selectedDay.day).padStart(2, "0")} · {selectedDay.headline}
              </h4>
              <div className="mt-3 grid gap-2">
                {selectedDayReadyToFinalize ? (
                  <button
                    type="button"
                    onClick={() => finalizeDay(selectedDay)}
                    className="min-h-11 rounded-full border border-emerald-300/28 bg-emerald-400/90 px-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                  >
                    Finalize Day {String(selectedDay.day).padStart(2, "0")}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={selectedDayStatus === "FINALIZED"}
                  onClick={() =>
                    setOptionModal({
                      open: true,
                      dayId: selectedDay.id,
                      dayCity: selectedDay.city,
                      mode: "addItem",
                      itemType: "activity",
                      title: `Add item to Day ${String(selectedDay.day).padStart(2, "0")}`,
                      dayNumber: selectedDay.day,
                    })
                  }
                  className="min-h-11 rounded-full border border-orange-300 bg-[#FF8A1F] px-4 text-sm font-black text-slate-950 transition hover:bg-[#FFA63A] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Add Item
                </button>
                <details className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                  <summary className="cursor-pointer text-sm font-black text-slate-100">
                    More Actions
                  </summary>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => moveDay(selectedDay.id, "up")}
                      disabled={selectedDayStatus === "FINALIZED"}
                      className="min-h-10 rounded-full border border-white/10 bg-white/[0.06] px-4 text-xs font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Move Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDay(selectedDay.id, "down")}
                      disabled={selectedDayStatus === "FINALIZED"}
                      className="min-h-10 rounded-full border border-white/10 bg-white/[0.06] px-4 text-xs font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Move Down
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateDay(selectedDay.id)}
                      disabled={selectedDayStatus === "FINALIZED"}
                      className="min-h-10 rounded-full border border-sky-300/25 bg-sky-400/10 px-4 text-xs font-black text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Duplicate
                    </button>
                  </div>
                </details>
              </div>
            </div>
          ) : null}

          {selectedDay ? (
            <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,26,0.96),rgba(8,10,15,0.94))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.22)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                Journey Control
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]"
                  style={{
                    color: selectedStatusMeta.tone,
                    background: selectedStatusMeta.bg,
                    borderColor: selectedStatusMeta.border,
                  }}
                >
                  {selectedStatusMeta.marker} {selectedStatusMeta.label}
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {tripProgress.allFinalized ? (
                  <button
                    type="button"
                    disabled={bookingBasket.length < 1}
                    onClick={viewTripSelections}
                    className="min-h-11 rounded-full border border-orange-300/45 bg-[#FF8A1F] px-4 text-sm font-black text-slate-950 transition hover:bg-[#FFA63A] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FF8A1F]"
                  >
                    Continue To Booking →
                  </button>
                ) : null}
                {selectedDayStatus === "FINALIZED" && selectedDayIndex < days.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const nextDay = days[selectedDayIndex + 1];
                      if (nextDay) jumpToDay(nextDay.id);
                    }}
                    className="min-h-11 rounded-full border border-emerald-300/28 bg-emerald-400/90 px-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                  >
                    Open Day {String(days[selectedDayIndex + 1]?.day || selectedDay.day).padStart(2, "0")} →
                  </button>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={selectedDayIndex <= 0}
                    onClick={() => {
                      const previousDay = days[selectedDayIndex - 1];
                      if (previousDay) jumpToDay(previousDay.id);
                    }}
                    className="min-h-10 rounded-full border border-slate-500/18 bg-slate-700/28 px-3 text-xs font-black text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={selectedDayIndex >= days.length - 1}
                    onClick={() => continueToNextDay(selectedDay)}
                    className="min-h-10 rounded-full border border-emerald-300/20 bg-emerald-500/12 px-3 text-xs font-black text-emerald-50 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex w-full flex-col items-center justify-center gap-2">
            <button
              type="button"
              disabled={bookingBasket.length < 1}
              onClick={continueWithSelectedBookingItems}
              className="min-h-14 w-full rounded-full border border-orange-300/45 bg-[#FF8A1F] px-8 text-base font-black text-slate-950 shadow-[0_20px_44px_rgba(255,138,31,0.28)] transition hover:-translate-y-0.5 hover:bg-[#FFA63A] hover:shadow-[0_24px_52px_rgba(255,138,31,0.34)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#FF8A1F] disabled:hover:shadow-[0_20px_44px_rgba(255,138,31,0.28)]"
            >
              Continue To Booking →
            </button>
            {bookingBasket.length < 1 ? (
              <p className="w-full rounded-2xl border border-rose-300/28 bg-rose-500/12 px-3 py-2 text-center text-[11px] font-black leading-5 text-rose-100">
                ⚠ Please add at least one item to booking before continuing.
              </p>
            ) : !tripProgress.allFinalized ? (
              <p className="w-full rounded-2xl border border-rose-300/28 bg-rose-500/12 px-3 py-2 text-center text-[11px] font-black leading-5 text-rose-100">
                ⚠ Please finalize all itinerary days before continuing.
              </p>
            ) : continueBookingWarning ? (
              <p className="w-full rounded-2xl border border-rose-300/28 bg-rose-500/12 px-3 py-2 text-center text-[11px] font-black leading-5 text-rose-100">
                ⚠ {continueBookingWarning}
              </p>
            ) : null}
          </div>

          <div
            ref={exportCenterCardRef}
            className={`overflow-hidden rounded-3xl border bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.28),transparent_36%),linear-gradient(135deg,rgba(49,46,129,0.96),rgba(88,28,135,0.86),rgba(15,23,42,0.92))] p-4 shadow-[0_18px_42px_rgba(88,28,135,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] transition ${
              itineraryActionCenterOpen
                ? "border-violet-200/55"
                : "border-violet-300/24"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
              Trip Export Center
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-violet-100/78">
              Export, share or save your generated itinerary.
            </p>
            <button
              type="button"
              onClick={handleExportShareClick}
              className="mt-4 min-h-11 w-full rounded-full border border-white/18 bg-white px-4 text-sm font-black text-violet-950 shadow-[0_14px_28px_rgba(255,255,255,0.12)] transition hover:bg-violet-50"
            >
              Export & Share
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        {days.length > 0 ? (
          <aside className="hidden min-w-0 rounded-3xl border border-blue-400/15 bg-[#0D1B2F] p-4 shadow-[0_18px_48px_rgba(7,17,31,0.24)] lg:sticky lg:top-4 lg:block">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Trip Plan
              </p>
              <h3 className="mt-1 text-xl font-black text-white">
                {days.length} Days Trip
              </h3>
              <div className="mt-3 grid gap-1.5 text-xs font-black">
                <span className="text-emerald-100">
                  ✓ {tripProgress.finalizedDays} Finalized
                </span>
                <span className="text-blue-100">
                  ⚡ {tripProgress.inProgressDays} Active
                </span>
                <span className="text-slate-300">
                  ○ {tripProgress.pendingDays} Pending
                </span>
              </div>
            </div>
            <div className="grid max-h-[42vh] gap-2 overflow-y-auto pr-1 [scrollbar-width:none] lg:max-h-[70vh]">
              {days.map((day) => {
                const status = dayStatuses[day.id] || initialDayStatus(day);
                const active = selectedDayId === day.id;
                const finalized = status === "FINALIZED";
                const editing = status === "EDITING";
                const needsAttention = dayFinalizeIssues(day, days, bookingBasket).length > 0 && !finalized;
                const ready = !needsAttention && !finalized;
                const displayStatus = displayDayStatus(status, ready);
                const navTone = finalized
                  ? dayStatusMeta.FINALIZED.tone
                  : active
                    ? dayStatusMeta.PLANNING.tone
                    : dayStatusMeta[displayStatus].tone;
                const icon = finalized ? "✓" : active ? "⚡" : editing ? "✎" : "○";

                return (
                  <button
                    key={`${day.id}-navigator`}
                    type="button"
                    onClick={() => {
                      if (showDayHint) dismissDayHint();
                      setOpenDayId(day.id);
                    }}
                    className="grid w-full grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5"
                    style={{
                      borderColor: active ? `${navTone}66` : "rgba(59,130,246,0.15)",
                      background: active ? `${navTone}18` : "rgba(18,36,61,0.72)",
                      boxShadow: active ? `0 0 24px ${navTone}22` : "none",
                    }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black"
                      style={{
                        color: active && !finalized ? "#07111F" : navTone,
                        background: active && !finalized ? navTone : `${navTone}14`,
                        borderColor: `${navTone}55`,
                      }}
                    >
                      {icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-white">
                        Day {String(day.day).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                        {day.date}
                      </span>
                      <span className="mt-1 block truncate text-xs font-semibold text-slate-300">
                        {day.headline}
                      </span>
                      <span
                        className="mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black"
                        style={{
                          color: finalized
                            ? dayStatusMeta.FINALIZED.tone
                            : needsAttention
                              ? dayStatusMeta.PLANNING.tone
                              : dayStatusMeta[displayStatus].tone,
                          background: finalized
                            ? dayStatusMeta.FINALIZED.bg
                            : needsAttention
                              ? dayStatusMeta.PLANNING.bg
                              : dayStatusMeta[displayStatus].bg,
                          borderColor: finalized
                            ? dayStatusMeta.FINALIZED.border
                            : needsAttention
                              ? dayStatusMeta.PLANNING.border
                              : dayStatusMeta[displayStatus].border,
                        }}
                      >
                        {finalized ? "✓ Finalized" : editing ? "Editing" : ready ? "Ready" : "Planning"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="rounded-3xl border border-cyan-300/14 bg-[#12243D]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                    Trip Selections
                  </p>
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-400/12 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                    Live
                  </span>
                </div>

                <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Selected Items
                    </span>
                    <span className="font-mono text-lg font-black text-white">
                      {selectionSummary.selectedItems}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/8 pt-2">
                    <span className="text-xs font-bold text-slate-400">
                      Estimated Trip Value
                    </span>
                    <span className="font-mono text-sm font-black text-orange-100">
                      {currency(selectionSummary.estimatedTripValue)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-1.5">
                  {[
                    ["Transport", selectionSummary.counters.transport],
                    ["Stay", selectionSummary.counters.stay],
                    ["Activity", selectionSummary.counters.activity],
                    ["Meal", selectionSummary.counters.meal],
                    ["Local Life", selectionSummary.counters.localMarket],
                    ["Creator Experience", selectionSummary.counters.creatorExperience],
                  ].map(([label, value]) => (
                    <div
                      key={`trip-selection-${label}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2"
                    >
                      <span className="text-[11px] font-bold text-slate-400">
                        {label}
                      </span>
                      <span className="font-mono text-xs font-black text-slate-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              <div
                ref={exportCenterCardRef}
                className={`mt-7 overflow-hidden rounded-3xl border bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.28),transparent_36%),linear-gradient(135deg,rgba(49,46,129,0.96),rgba(88,28,135,0.86),rgba(15,23,42,0.92))] p-4 shadow-[0_18px_42px_rgba(88,28,135,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] transition ${
                  itineraryActionCenterOpen
                    ? "border-violet-200/55 shadow-[0_18px_46px_rgba(168,85,247,0.30),inset_0_1px_0_rgba(255,255,255,0.10)]"
                    : "border-violet-300/24"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-violet-100">
                      {itineraryActionCenterOpen
                        ? "✓ Export Center Open"
                        : "TPL Smart Planner"}
                    </span>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
                      ✨ Trip Export Center
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-violet-100/78">
                      Export, share or save your generated itinerary.
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/12 text-violet-50 shadow-[0_0_20px_rgba(168,85,247,0.18)]">
                    <PackageCheck size={18} />
                  </span>
                </div>
                  <button
                    type="button"
                    onClick={handleExportShareClick}
                    className="mt-4 min-h-10 w-full rounded-full border border-white/18 bg-white px-4 text-xs font-black text-violet-950 shadow-[0_14px_28px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-violet-50"
                  >
                  Export & Share
                </button>
              </div>
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
        {days.filter((day) => day.id === selectedDayId).map((day) => {
          const dayIndex = Math.max(0, days.findIndex((currentDay) => currentDay.id === day.id));
          const open = true;
          const activeTab = getTab(day.id);
          const identity = dayIdentity[dayIndex % dayIdentity.length];
          const daySelectedItems = bookingBasket.filter(
            (item) => item.dayId === day.id
          );
          const discoveryItems = buildDiscoveryItems(day, plannerIntelligence);
          const noteWidgets = buildDayNoteWidgets(day, plannerIntelligence);
          const selectedBookingCount = day.items.filter((item) =>
            selectedBookingItemIds.includes(item.id)
          ).length;
          const activeTimelineItemId = activeTimelineItems[day.id] || "";
          const activeTimelineItem =
            day.items.find((item) => item.id === activeTimelineItemId);
          const dayStatus = dayStatuses[day.id] || initialDayStatus(day);
          const missingRequired = dayFinalizeIssues(day, days, bookingBasket);
          const dayCoverage = resolveDayCoverage(day, days, bookingBasket);
          const readyToFinalize = missingRequired.length === 0 && dayStatus !== "FINALIZED";
          const displayStatus = displayDayStatus(dayStatus, readyToFinalize);
          const isDayLocked = dayStatus === "FINALIZED";
          const calendarGlow =
            dayStatus === "FINALIZED"
              ? "rgba(34,197,94,0.26)"
              : readyToFinalize
                ? "rgba(56,189,248,0.24)"
                : "rgba(255,138,31,0.22)";
          const calendarAccent =
            dayStatus === "FINALIZED"
              ? "#22C55E"
              : readyToFinalize
                ? "#38BDF8"
                : "#FF8A1F";
          const chapterAccent =
            dayStatus === "FINALIZED"
              ? "#22C55E"
              : open
                ? "#38BDF8"
                : "#64748B";
          const chapterGlow =
            dayStatus === "FINALIZED"
              ? "rgba(34,197,94,0.15)"
              : open
                ? "rgba(56,189,248,0.15)"
                : "rgba(100,116,139,0.08)";
          return (
            <article
              id={`planner-day-${day.id}`}
              key={day.id}
              className="hidden overflow-hidden rounded-3xl border bg-[#0D1B2F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(56,189,248,0.14)] lg:block"
              style={{
                borderColor:
                  dayStatus === "FINALIZED"
                    ? "rgba(34,197,94,0.32)"
                    : open
                      ? "rgba(56,189,248,0.34)"
                      : "rgba(59,130,246,0.15)",
                boxShadow: `inset 4px 0 0 ${chapterAccent}, 0 0 ${
                  open || dayStatus === "FINALIZED" ? 34 : 18
                }px ${chapterGlow}`,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (showDayHint) dismissDayHint();
                  setOpenDayId(day.id);
                }}
                className="w-full cursor-pointer text-left"
              >
                <div
                  className="h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, ${identity.tone}, ${identity.tone}44, transparent)`,
                  }}
                />
                <div className="bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_34%)] p-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)] md:items-center">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <DayStatusBadge status={displayStatus} />
                        {dayStatus === "EDITING" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/12 px-3 py-1.5 text-[11px] font-black text-amber-100">
                            Editing after finalization
                          </span>
                        ) : null}
                      </div>
                      <h4 className="text-xl font-black leading-tight text-white">
                        {day.headline}
                      </h4>
                    </div>

                    <div className="flex justify-start md:justify-center">
                      <div
                        className="flex h-[104px] w-[132px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[1.4rem] border text-center shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
                        style={{
                          color: calendarAccent,
                          background: `linear-gradient(180deg, rgba(255,255,255,0.10), ${calendarAccent}20 42%, rgba(11,15,26,0.82))`,
                          borderColor: `${calendarAccent}70`,
                          boxShadow: `0 0 34px ${calendarGlow}`,
                        }}
                      >
                        <span className="max-w-[100px] truncate font-mono text-sm font-black uppercase tracking-[0.14em] text-slate-100">
                          {day.date}
                        </span>
                        <span className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Day
                        </span>
                        <span className="font-mono text-3xl font-black leading-none text-white">
                          {String(day.day).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <div className="grid gap-2 md:justify-items-end">
                        <div className="grid min-w-[168px] gap-1.5 rounded-2xl border border-cyan-300/10 bg-[#12243D]/85 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          {[
                            ["Shortlisted", selectedBookingCount, "text-emerald-100"],
                            ["Maybe", 0, "text-amber-100"],
                            ["Bookable", day.items.length, "text-slate-100"],
                          ].map(([label, value, tone]) => (
                            <div
                              key={`${day.id}-header-stat-${label}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2"
                            >
                              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                {label}
                              </span>
                              <span className={`font-mono text-sm font-black ${tone}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                          open ? "rotate-90" : ""
                        }`}
                        style={{
                          color: identity.tone,
                          background: `${identity.tone}18`,
                          borderColor: `${identity.tone}44`,
                        }}
                      >
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {open ? (
                <div className="border-t border-white/10 p-4">
                  <div className="mb-5 rounded-3xl border border-cyan-300/10 bg-[#102742] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="grid gap-3">
                      <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
                        <div className="flex min-w-max gap-2">
                        {dayTabs.map((tab) => {
                          const TabIcon = tab.icon;
                          const active = activeTab === tab.id;

                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setTab(day.id, tab.id)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
                              style={{
                                color: active ? tab.tone : color.muted,
                                background: active ? `${tab.tone}22` : color.panel2,
                                borderColor: active ? tab.tone : color.border,
                                boxShadow: active ? `0 0 14px ${tab.tone}33` : "none",
                              }}
                            >
                              <TabIcon size={13} />
                              {tab.id}
                            </button>
                          );
                        })}
                        </div>
                      </div>

                      {activeTab === "Overview" ? (
                      <div className="-mx-1 hidden border-t border-white/10 px-1 pt-3 lg:block">
                        <div className="flex flex-wrap gap-2">
                          {[
                            {
                              label: "Move ↑",
                              action: () => moveDay(day.id, "up"),
                              icon: ArrowUp,
                              disabled: isDayLocked,
                              className:
                                "border-white/10 bg-white/[0.06] text-slate-300",
                            },
                            {
                              label: "Move ↓",
                              action: () => moveDay(day.id, "down"),
                              icon: ArrowDown,
                              disabled: isDayLocked,
                              className:
                                "border-white/10 bg-white/[0.06] text-slate-300",
                            },
                            {
                              label: "Duplicate",
                              action: () => duplicateDay(day.id),
                              icon: Copy,
                              disabled: isDayLocked,
                              className:
                                "border-sky-300/25 bg-sky-400/10 text-sky-100",
                            },
                            {
                              label:
                                dayStatus === "FINALIZED"
                                  ? "Edit Day"
                                  : `Finalize Day ${String(day.day).padStart(2, "0")}`,
                              action: () =>
                                dayStatus === "FINALIZED"
                                  ? editFinalizedDay(day)
                                  : finalizeDay(day),
                              icon: dayStatus === "FINALIZED" ? NotebookPen : Check,
                              disabled: false,
                              className:
                                dayStatus === "FINALIZED"
                                  ? "border-amber-300/30 bg-amber-400/12 text-amber-100"
                                  : "border-emerald-300/30 bg-emerald-400/90 text-slate-950",
                            },
                            {
                              label: "Add Item",
                              action: () =>
                                setOptionModal({
                                  open: true,
                                  dayId: day.id,
                                  dayCity: day.city,
                                  mode: "addItem",
                                  itemType: "activity",
                                  title: `Add item to Day ${String(day.day).padStart(2, "0")}`,
                                  dayNumber: day.day,
                                }),
                              icon: Plus,
                              disabled: isDayLocked,
                              className:
                                "border-orange-300 bg-[#FF8A1F] text-slate-950 hover:bg-[#FFA63A]",
                            },
                          ].map(({ label, action, icon: ActionIcon, className, disabled }, index) => (
                            <button
                              key={`${day.id}-action-${label}-${index}`}
                              type="button"
                              onClick={action}
                              disabled={disabled}
                              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(34,211,238,0.10)] disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none ${className}`}
                            >
                              <ActionIcon size={13} />
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {dayCoverage.transportAvailable ? (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                                dayCoverage.transport
                                  ? "border-emerald-300/24 bg-emerald-400/10 text-emerald-100"
                                  : "border-amber-300/24 bg-amber-400/10 text-amber-100"
                              }`}
                            >
                              {dayCoverage.transport ? "✓" : "○"}{" "}
                              {dayCoverage.transportCoverageLabel || "Transport covered"}
                            </span>
                          ) : null}
                          {dayCoverage.stayRequired && dayCoverage.stayAvailable ? (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                                dayCoverage.stay
                                  ? "border-emerald-300/24 bg-emerald-400/10 text-emerald-100"
                                  : "border-amber-300/24 bg-amber-400/10 text-amber-100"
                              }`}
                            >
                              {dayCoverage.stay ? "✓" : "○"}{" "}
                              {dayCoverage.stayCoverageLabel || "Stay covered"}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    </div>
                  </div>

                  {activeTab === "Overview" ? (
                    <section className="rounded-3xl border border-white/10 bg-[#22304A] p-3 sm:p-4">
                      {day.items.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-white/10 p-7 text-center text-sm font-semibold text-slate-400">
                          No events yet. Use Day Selections or Explore to build this day.
                        </div>
                      ) : null}
                      <div className="hidden">
                        {day.items.map((item) => (
                          <div
                            key={`${day.id}-mobile-item-${item.id}`}
                            className="rounded-3xl border border-white/10 bg-[#172945] p-3"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-2.5 py-1 font-mono text-[11px] font-black text-cyan-50">
                                  {item.time || "Flexible"}
                                </span>
                                <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">
                                  {item.type}
                                </span>
                              </div>
                              <h4 className="break-words text-base font-black leading-tight text-white">
                                {item.title}
                              </h4>
                              <div className="grid gap-2 text-xs font-semibold text-slate-300">
                                {[
                                  ["Duration", itemDuration(item) || "Flexible"],
                                  ["Route", timelineItemRouteLabel(item) || item.location || day.city],
                                  [
                                    "Value",
                                    displayTimelinePriceLabel(
                                      item.unitPrice || item.price || 0,
                                      item.priceBasis
                                    ),
                                  ],
                                ].map(([label, value]) => (
                                  <div
                                    key={`${item.id}-mobile-meta-${label}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2"
                                  >
                                    <span className="text-slate-500">{label}</span>
                                    <span className="min-w-0 break-words text-right font-black text-slate-100">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <TimelineActionRow
                                dayId={day.id}
                                item={item}
                                isSelected={selectedBookingItemIds.includes(item.id)}
                                isLocked={isDayLocked}
                                onAddToBooking={() => addTimelineItemToBooking(item.id)}
                                onViewDetails={() =>
                                  setServiceDetailModal({
                                    open: true,
                                    day,
                                    item,
                                  })
                                }
                                onViewOptions={() =>
                                  openOptionModal({
                                    dayId: day.id,
                                    dayCity: day.city,
                                    itemId: item.id,
                                    mode: "timeline",
                                    itemType: item.type,
                                  })
                                }
                                onRemove={() => removeStop(day.id, item.id)}
                                onUpdate={updateItem}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mb-4 hidden lg:block">
                        <TPLSignatureTimeline
                          day={day}
                          activeItemId={activeTimelineItem?.id}
                          selectedItemIds={selectedBookingItemIds}
                          onSelectItem={(itemId) =>
                            setActiveTimelineItems((current) => ({
                              ...current,
                              [day.id]: itemId,
                            }))
                          }
                          renderItemDetail={(item) => (
                          <TimelineActionRow
                              dayId={day.id}
                              item={item}
                              isSelected={selectedBookingItemIds.includes(item.id)}
                              isLocked={isDayLocked}
                              onAddToBooking={() => addTimelineItemToBooking(item.id)}
                              onViewDetails={() =>
                                setServiceDetailModal({
                                  open: true,
                                  day,
                                  item,
                                })
                              }
                              onViewOptions={() =>
                                openOptionModal({
                                  dayId: day.id,
                                  dayCity: day.city,
                                  itemId: item.id,
                                  mode: "timeline",
                                  itemType: item.type,
                                })
                              }
                              onRemove={() => removeStop(day.id, item.id)}
                              onUpdate={updateItem}
                            />
                          )}
                        />
                      </div>
                    </section>
                  ) : null}

                  {activeTab === "Day Selections" ? (
                    <section>
                      <SectionTitle
                        eyebrow="Current day selections"
                        title="Selected items for this active day"
                        tone={identity.tone}
                      />
                      {daySelectedItems.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/12 bg-[#22304A]/70 p-6 text-center text-sm font-semibold text-slate-400">
                          No selected items for this day yet. Add items from Overview to build the day selection.
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {daySelectedItems.map((item) => (
                            <DaySelectionCard
                              key={item.id}
                              item={item}
                              tone={identity.tone}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}

                  {activeTab === "Explore" ? (
                    <section>
                      <SectionTitle
                        eyebrow="Smart discovery"
                        title="Explore more around this day"
                        tone={identity.tone}
                      />
                      <div className="grid gap-3">
                        {discoveryItems.map((item, index) => (
                          <DiscoveryCard
                            key={`${day.id}-${item.title}-${index}`}
                            item={item}
                            onAdd={() =>
                              addItem(day.id, item.type, item.title, {
                                selectAfterAdd: true,
                              })
                            }
                            onChange={() =>
                              openOptionModal({
                                dayId: day.id,
                                dayCity: day.city,
                                mode: "explore",
                                itemType: item.type,
                              })
                            }
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {activeTab === "Notes" ? (
                    <DayIntelligenceCenter
                      day={day}
                      widgets={noteWidgets}
                    />
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
        {selectedDay ? (
          <section className="mb-10 mt-8 hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,26,0.96),rgba(8,10,15,0.94))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl lg:block">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                  Journey Control
                </p>
                {!tripProgress.allFinalized ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]"
                      style={{
                        color: selectedStatusMeta.tone,
                        background: selectedStatusMeta.bg,
                        borderColor: selectedStatusMeta.border,
                      }}
                    >
                      {selectedStatusMeta.marker} {selectedStatusMeta.label}
                    </span>
                    {selectedDayReadyToFinalize ? (
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                        Visible itinerary can be finalized
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {tripProgress.allFinalized ? (
                  <>
                    <h4 className="mt-1 text-base font-black text-emerald-100">
                      ✓ Journey Ready
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Your itinerary is complete and ready for booking.
                    </p>
                  </>
                ) : selectedDayStatus === "FINALIZED" && selectedDayIndex < days.length - 1 ? (
                  <>
                    <h4 className="mt-1 text-base font-black text-emerald-100">
                      ✓ Day {String(selectedDay.day).padStart(2, "0")} Finalized
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Ready to continue planning
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="mt-1 font-mono text-base font-black uppercase tracking-[0.12em] text-white">
                      <span className="text-orange-200">
                        Day {String(selectedDay.day).padStart(2, "0")}
                      </span>{" "}
                      <span className="text-slate-500">of</span>{" "}
                      <span className="text-orange-100">
                        {String(days.length).padStart(2, "0")}
                      </span>
                    </h4>
                    <p className="mt-1 max-w-xl truncate text-xs font-semibold text-slate-300">
                      {selectedDay.headline}
                    </p>
                  </>
                )}
              </div>

              {tripProgress.allFinalized ? (
                <button
                  type="button"
                  onClick={viewTripSelections}
                  className="min-h-11 rounded-full border border-orange-300/45 bg-[#FF8A1F] px-6 text-sm font-black text-slate-950 transition hover:bg-[#FFA63A] hover:shadow-[0_0_22px_rgba(255,138,31,0.22)]"
                >
                  Continue To Booking →
                </button>
              ) : selectedDayStatus === "FINALIZED" && selectedDayIndex < days.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextDay = days[selectedDayIndex + 1];
                    if (nextDay) jumpToDay(nextDay.id);
                  }}
                  className="min-h-11 rounded-full border border-emerald-300/28 bg-emerald-400/90 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-300 hover:shadow-[0_0_22px_rgba(34,197,94,0.20)]"
                >
                  Open Day {String(days[selectedDayIndex + 1]?.day || selectedDay.day).padStart(2, "0")} →
                </button>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
                  {selectedDayReadyToFinalize ? (
                    <button
                      type="button"
                      onClick={() => finalizeDay(selectedDay)}
                      className="min-h-10 rounded-full border border-emerald-300/28 bg-emerald-400/90 px-4 text-xs font-black text-slate-950 transition hover:bg-emerald-300 hover:shadow-[0_0_18px_rgba(34,197,94,0.18)] sm:col-span-2"
                    >
                      Finalize Day {String(selectedDay.day).padStart(2, "0")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={selectedDayIndex <= 0}
                    onClick={() => {
                      const previousDay = days[selectedDayIndex - 1];
                      if (previousDay) jumpToDay(previousDay.id);
                    }}
                    className="min-h-10 rounded-full border border-slate-500/18 bg-slate-700/28 px-4 text-xs font-black text-slate-100 transition hover:border-slate-300/28 hover:bg-slate-600/38 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous Day
                  </button>
                  <button
                    type="button"
                    disabled={selectedDayIndex >= days.length - 1}
                    onClick={() => continueToNextDay(selectedDay)}
                    className="min-h-10 rounded-full border border-emerald-300/20 bg-emerald-500/12 px-4 text-xs font-black text-emerald-50 transition hover:border-emerald-200/34 hover:bg-emerald-400/18 hover:shadow-[0_0_16px_rgba(34,197,94,0.13)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
                  >
                    Next Day →
                  </button>
                </div>
              )}
            </div>

              {!tripProgress.allFinalized ? (
                <p className="mt-[14px] w-full rounded-2xl border border-rose-300/28 bg-rose-500/12 px-3 py-2 text-xs font-black leading-5 text-rose-100">
                  Please finalize all itinerary days before continuing to booking.
                </p>
              ) : continueBookingWarning ? (
                <p className="mt-[14px] w-full rounded-2xl border border-rose-300/28 bg-rose-500/12 px-3 py-2 text-xs font-black leading-5 text-rose-100">
                  {continueBookingWarning}
                </p>
              ) : null}

              {finalJourneyGenerated && journeyControlMessage ? (
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black leading-5 text-slate-100">
                  {journeyControlMessage}
                </p>
              ) : null}
          </section>
        ) : null}
        <section
          id="itinerary-action-center"
          className={`overflow-hidden transition-all duration-300 ease-out ${
            itineraryActionCenterOpen
              ? "mb-16 mt-6 max-h-[5000px] pb-20 opacity-100 sm:mb-20 lg:pb-24"
              : "max-h-0 opacity-0"
          }`}
        >
          <div
            ref={actionCenterRef}
            className="rounded-3xl border border-violet-300/20 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(49,46,129,0.88),rgba(8,10,15,0.94))] p-4 shadow-[0_22px_58px_rgba(88,28,135,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-5"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">
                  Itinerary Action Center
                </p>
                <h4 className="mt-1 text-xl font-black text-white">
                  Manage your generated itinerary.
                </h4>
                <p className="mt-1 text-sm font-semibold leading-6 text-violet-100/70">
                  Preview, download, share, or save this Smart Planner journey.
                </p>
              </div>
              <button
                type="button"
                onClick={closeItineraryActionCenter}
                className="min-h-10 rounded-full border border-white/12 bg-white/[0.06] px-4 text-xs font-black text-violet-50 transition hover:bg-white/[0.12]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setItineraryPreviewOpen((current) => !current)}
                className="min-h-11 rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 text-sm font-black text-blue-50 transition hover:bg-blue-300/16"
              >
                Preview Itinerary
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("tpl:export-current-trip"))
                }
                className="min-h-11 rounded-2xl border border-orange-300/24 bg-orange-300/12 px-4 text-sm font-black text-orange-50 transition hover:bg-orange-300/18"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("tpl:share-current-trip"))
                }
                className="min-h-11 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/16"
              >
                Share Trip
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("tpl:save-current-trip-to-my-trips"))
                }
                className="min-h-11 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 text-sm font-black text-emerald-50 transition hover:bg-emerald-300/16"
              >
                Save To My Trips
              </button>
            </div>

            {itineraryPreviewOpen ? (
              <div className="mt-5 max-h-[450px] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.06] p-4 [scrollbar-width:thin] md:max-h-[600px]">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
                      Trip Overview
                    </p>
                    <h5 className="mt-1 text-lg font-black text-white">
                      {days[0]?.city || "Trip"} Journey Plan
                    </h5>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                      {days.length} day{days.length === 1 ? "" : "s"} ·{" "}
                      {selectionSummary.selectedItems} selected item
                      {selectionSummary.selectedItems === 1 ? "" : "s"} ·{" "}
                      {currency(selectionSummary.estimatedTripValue)} estimated value
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-300/18 bg-orange-300/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
                      Price Summary
                    </p>
                    <p className="mt-2 font-mono text-2xl font-black text-white">
                      {currency(selectionSummary.estimatedTripValue)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-orange-100/65">
                      Before final checkout adjustments
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {days.map((day) => (
                    <article
                      key={`action-center-preview-${day.id}`}
                      className="rounded-2xl border border-white/10 bg-black/16 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                            Day {String(day.day).padStart(2, "0")} · {day.date}
                          </p>
                          <h6 className="mt-1 truncate text-sm font-black text-white">
                            {day.headline}
                          </h6>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-300">
                          {day.items.length} items
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {day.items.map((item) => (
                          <div
                            key={`action-center-preview-${day.id}-${item.id}`}
                            className="grid gap-1 rounded-xl border border-white/8 bg-white/[0.045] px-3 py-2"
                          >
                            <p className="text-sm font-black text-slate-100">
                              {item.time || "Flexible"} · {item.title}
                            </p>
                            <p className="text-xs font-semibold capitalize text-slate-400">
                              {item.type} · {[timelineItemRouteLabel(item), item.location]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
        {days.length > 0 ? (
          <div className="mt-[18px] mb-[18px] hidden w-full flex-col items-center justify-center gap-2 lg:flex">
            <button
              type="button"
              disabled={bookingBasket.length < 1}
              onClick={continueWithSelectedBookingItems}
              className="min-h-14 w-full max-w-[420px] rounded-full border border-orange-300/45 bg-[#FF8A1F] px-8 text-base font-black text-slate-950 shadow-[0_20px_44px_rgba(255,138,31,0.28)] transition hover:-translate-y-0.5 hover:bg-[#FFA63A] hover:shadow-[0_24px_52px_rgba(255,138,31,0.34)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#FF8A1F] disabled:hover:shadow-[0_20px_44px_rgba(255,138,31,0.28)] sm:min-w-[320px] sm:w-auto"
            >
              Continue To Booking →
            </button>
            {bookingBasket.length < 1 ? (
              <p className="text-center text-[11px] font-black leading-4 text-rose-200">
                Please add at least one item to booking before continuing.
              </p>
            ) : null}
          </div>
        ) : null}
        </div>
      </div>

      {selectedItemsContinueConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/70 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="w-[92vw] max-w-lg overflow-hidden rounded-[20px] border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:w-full sm:rounded-3xl">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,138,31,0.18),rgba(34,211,238,0.10),rgba(7,17,31,0.98))] p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">
                Trip Selection Check
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Continue with selected items?
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                You have selected some items. Do you want to continue with selected items or finalize remaining days?
              </p>
            </div>
            <div className="grid gap-3 p-4 sm:p-5">
              <button
                type="button"
                onClick={confirmSelectedItemsContinue}
                className="min-h-12 w-full rounded-full bg-[#FF8A1F] px-4 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(255,138,31,0.22)] transition hover:bg-[#FFA63A]"
              >
                Continue with Selected Items
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemsContinueConfirmOpen(false)}
                className="min-h-12 w-full rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-black text-slate-100 transition hover:bg-white/[0.12]"
              >
                Finalize Remaining Days
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <OptionModal
        modal={optionModal}
        onClose={() => setOptionModal({ open: false })}
        onSelectOption={selectOptionFromModal}
        onSelectAddItem={selectAddItemOption}
      />
      <ServiceDetailModal
        modal={serviceDetailModal}
        onClose={() => setServiceDetailModal({ open: false })}
      />
      {assistDay && finalizationAssistModal.open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/62 px-3 py-5 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <section className="max-h-[calc(100dvh-2.5rem)] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/12 bg-[#101827]/96 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,0.14),rgba(56,189,248,0.08),rgba(255,138,31,0.10))] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                Day Gate
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Finalize Day {assistDay.day}?
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                Please finalize this day or add it to booking before moving to the next day.
              </p>
            </div>

            <div className="grid max-h-[calc(100dvh-11rem)] gap-4 overflow-y-auto p-4 sm:p-5">
              <div className="rounded-3xl border border-emerald-300/18 bg-emerald-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                  Visible itinerary to add
                </p>
                <div className="mt-3 grid gap-2">
                  {assistDay.items.map((item) => (
                    <div
                      key={`${assistDay.id}-finalize-${item.id}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-black text-emerald-50"
                    >
                      {item.time || "Flexible"} · {item.title}
                    </div>
                  ))}
                  {assistDay.items.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-black text-emerald-50">
                      No visible items yet.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    finalizeDayAndContinue(
                      assistDay,
                      finalizationAssistModal.nextDayId
                    )
                  }
                  className="min-h-11 rounded-full bg-emerald-400 px-4 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(34,197,94,0.22)] transition hover:bg-emerald-300"
                >
                  Finalize & Add to Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFinalizationAssistModal({ open: false });
                  }}
                  className="min-h-11 rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-black text-slate-100 transition hover:bg-white/[0.12]"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={() =>
                    skipDayAndContinue(
                      assistDay,
                      finalizationAssistModal.nextDayId
                    )
                  }
                  className="min-h-11 rounded-full border border-amber-300/22 bg-amber-400/10 px-4 text-sm font-black text-amber-100 transition hover:bg-amber-400/16"
                >
                  Skip Day
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
      <DurationReduceModal
        modal={durationReduceModal}
        onMoveToPreviousDay={moveLastDayItemsToPreviousDay}
        onRemoveAnyway={removeLastDayAnyway}
        onClose={() => setDurationReduceModal({ open: false })}
      />
    </div>
  );
}
