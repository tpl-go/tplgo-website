"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Car,
  ChevronRight,
  Clock,
  CloudSun,
  Coffee,
  Copy,
  Hotel,
  MapPin,
  NotebookPen,
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

type DayTab = "Overview" | "Bookings" | "Explore" | "Notes";
type BookingStatus = "selected" | "recommended" | "optional";
type BookingType = "flight" | "stay" | "transfer" | "activity";

type BookingBasketItem = {
  bookingType: BookingType;
  serviceId: string;
  serviceName: string;
  selectedOption: string;
  estimatedPrice: number;
  bookingStatus: BookingStatus;
  reason: string;
  meta?: string;
  cta: string;
  changeCta: string;
  icon: typeof Hotel;
  sourceItemId?: string;
};

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

const color = {
  ink: "#0B0F1A",
  panel: "#131929",
  panel2: "#1C2438",
  row: "#24314D",
  border: "#252E45",
  amber: "#F5A623",
  sky: "#38BDF8",
  teal: "#2DD4BF",
  rose: "#FB7185",
  lime: "#A3E635",
  violet: "#C084FC",
  muted: "#94A3B8",
};

const dayTabs: { id: DayTab; icon: typeof Hotel; tone: string }[] = [
  { id: "Overview", icon: Route, tone: color.amber },
  { id: "Bookings", icon: Ticket, tone: color.sky },
  { id: "Explore", icon: Sparkles, tone: color.lime },
  { id: "Notes", icon: NotebookPen, tone: color.violet },
];

const dayIdentity = [
  { tone: color.amber, glow: "rgba(245,166,35,0.22)" },
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
  transport: { label: "Transport", tone: color.sky, icon: Plane },
  stay: { label: "Stay", tone: color.teal, icon: Hotel },
  activity: { label: "Activity", tone: color.lime, icon: Sparkles },
  meal: { label: "Food", tone: color.rose, icon: Utensils },
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

function estimateFor(type: BookingType, day: TiyaDayPlan) {
  const paceFactor =
    day.pace === "Packed" ? 1.14 : day.pace === "Relaxed" ? 0.92 : 1;

  if (type === "flight") return Math.round(7450 * paceFactor);
  if (type === "stay") return Math.round(5800 * paceFactor);
  if (type === "transfer") return Math.round(2800 * paceFactor);
  return Math.round(1250 * paceFactor);
}

function viewOptionsLabel(type: TiyaTimelineItem["type"]) {
  void type;
  return "Change";
}

function rowHelperText(type: TiyaTimelineItem["type"]) {
  if (type === "stay") return "Recommended stay candidate for this day.";
  if (type === "activity") return "Experience option that can move into booking basket.";
  if (type === "meal") return "Food stop for the day plan; add when pace allows.";
  return "Best matched transport movement for this day.";
}

function modalTitle(type: TiyaTimelineItem["type"]) {
  if (type === "transport") return "Transport Options";
  if (type === "stay") return "Stay Options";
  if (type === "activity") return "Experience Options";
  return "Food Options";
}

function bookingTypeToTimelineType(
  bookingType: BookingType
): TiyaTimelineItem["type"] {
  if (bookingType === "stay") return "stay";
  if (bookingType === "activity") return "activity";
  return "transport";
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
    text.includes("market") || text.includes("shopping") ? "Local Market" : "",
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

function buildDayBookings(
  day: TiyaDayPlan,
  selectedBookingItemIds: string[]
): BookingBasketItem[] {
  const transportItem = day.items.find((item) => item.type === "transport");
  const stayItem = day.items.find((item) => item.type === "stay");
  const activityItem = day.items.find((item) => item.type === "activity");
  const city = day.city || "Destination";
  const transportSelected = transportItem
    ? selectedBookingItemIds.includes(transportItem.id)
    : false;
  const staySelected = stayItem
    ? selectedBookingItemIds.includes(stayItem.id)
    : false;
  const activitySelected = activityItem
    ? selectedBookingItemIds.includes(activityItem.id)
    : false;

  return [
    {
      bookingType: "flight",
      serviceId: `flight-${day.id}`,
      serviceName: "Flight / Transport",
      selectedOption: transportItem?.title || `Best available transfer to ${city}`,
      estimatedPrice: transportItem?.unitPrice || transportItem?.price || estimateFor("flight", day),
      bookingStatus: transportSelected ? "selected" : "recommended",
      reason: transportItem
        ? `Timeline movement available at ${transportItem.time}.`
        : "Recommended option for the first movement on this day.",
      meta: transportItem
        ? `${transportItem.time} · ${transportItem.location || city}`
        : city,
      cta: "Select Flight",
      changeCta: "Change",
      icon: Plane,
      sourceItemId: transportItem?.id,
    },
    {
      bookingType: "stay",
      serviceId: `stay-${day.id}`,
      serviceName: "Hotel / Stay",
      selectedOption: stayItem?.title || `Recommended stay in ${city}`,
      estimatedPrice: stayItem?.unitPrice || stayItem?.price || estimateFor("stay", day),
      bookingStatus: staySelected ? "selected" : "recommended",
      reason: stayItem
        ? `Timeline stay available at ${stayItem.time}.`
        : "Recommended stay option for this city and comfort window.",
      meta: stayItem ? `${stayItem.time} · ${stayItem.location || city}` : city,
      cta: "Select Hotel",
      changeCta: "Change Hotel",
      icon: Hotel,
      sourceItemId: stayItem?.id,
    },
    {
      bookingType: "transfer",
      serviceId: `transfer-${day.id}`,
      serviceName: "Cab / Local Transfer",
      selectedOption: `Private SUV for ${city}`,
      estimatedPrice: estimateFor("transfer", day),
      bookingStatus: transportItem ? "recommended" : "optional",
      reason: "Useful for airport, hotel and local activity movements.",
      meta: city,
      cta: "Select Cab",
      changeCta: "Change",
      icon: Car,
    },
    {
      bookingType: "activity",
      serviceId: `activity-${day.id}`,
      serviceName: "Activities / Experiences",
      selectedOption: activityItem?.title || `${city} curated experience`,
      estimatedPrice: activityItem?.unitPrice || activityItem?.price || estimateFor("activity", day),
      bookingStatus: activitySelected ? "selected" : "optional",
      reason: activityItem
        ? "Timeline activity available for booking basket selection."
        : "Optional ticketed or guided experience for this day.",
      meta: activityItem
        ? `${activityItem.time} · ${activityItem.location || city}`
        : city,
      cta: "Add Activity",
      changeCta: "Change",
      icon: Ticket,
      sourceItemId: activityItem?.id,
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
      tag: market?.specialtyLabel || "Local Market",
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

function DayNoteWidgetCard({ widget }: { widget: DayNoteWidget }) {
  const WidgetIcon = widget.icon;

  return (
    <article
      className="rounded-3xl border border-white/10 bg-[#22304A] p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, #22304A, ${widget.tone}10)`,
        borderColor: `${widget.tone}34`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              color: widget.tone,
              background: `${widget.tone}18`,
              borderColor: `${widget.tone}44`,
            }}
          >
            <WidgetIcon size={18} />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-white">{widget.title}</h4>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
              {widget.subtitle}
            </p>
          </div>
        </div>
        {widget.meterLabel ? (
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]"
            style={{
              color: widget.tone,
              background: `${widget.tone}16`,
              borderColor: `${widget.tone}38`,
            }}
          >
            {widget.meterLabel}
          </span>
        ) : null}
      </div>

      {typeof widget.score === "number" ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${clampPercent(widget.score)}%`,
                background: widget.tone,
              }}
            />
          </div>
        </div>
      ) : null}

      {widget.chips?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {widget.chips.map((chip, index) => (
            <span
              key={`${widget.id}-chip-${chip}-${index}`}
              className="rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[11px] font-black text-slate-200"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {widget.badges?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {widget.badges.map((badge, index) => (
            <span
              key={`${widget.id}-badge-${badge.label}-${index}`}
              className="rounded-full border px-2.5 py-1 text-[11px] font-black"
              style={{
                color: badge.tone,
                background: `${badge.tone}16`,
                borderColor: `${badge.tone}40`,
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
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

function BookingRecommendationCard({
  booking,
  tone,
  onSelect,
  onChange,
}: {
  booking: BookingBasketItem;
  tone: string;
  onSelect: () => void;
  onChange: () => void;
}) {
  const Icon = booking.icon;
  const isSelected = booking.bookingStatus === "selected";
  const status = statusStyles[booking.bookingStatus];

  return (
    <article
      className={`rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
        isSelected
          ? "border-emerald-300/35 bg-emerald-400/10 shadow-[0_0_26px_rgba(16,185,129,0.14)]"
          : "border-white/10 bg-[#22304A]"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-[210px_minmax(0,1fr)_230px] md:items-center">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              color: tone,
              background: `${tone}18`,
              borderColor: `${tone}44`,
            }}
          >
            <Icon size={19} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Service
            </p>
            <h4 className="mt-1 text-sm font-black text-white">
              {booking.serviceName}
            </h4>
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="text-base font-black leading-6 text-white">
            {booking.selectedOption}
          </h4>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
            {booking.reason}
          </p>
          {booking.meta ? (
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              {booking.meta}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-black text-white">
            {currency(booking.estimatedPrice)}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${status.className}`}>
            {status.label}
          </span>
          <button
            type="button"
            onClick={isSelected ? undefined : onSelect}
            className={`min-h-9 rounded-full px-3 text-xs font-black ${
              isSelected
                ? "cursor-default border border-emerald-300/35 bg-emerald-400/15 text-emerald-100"
                : "text-slate-950"
            }`}
            style={isSelected ? undefined : { background: tone }}
          >
            {isSelected ? "Selected ✓" : "Select"}
          </button>
          <button
            type="button"
            onClick={onChange}
            className="min-h-9 rounded-full border border-white/10 bg-white/[0.08] px-3 text-xs font-black text-white"
          >
            Change
          </button>
        </div>
      </div>
    </article>
  );
}

function TimelineActionRow({
  dayId,
  item,
  isSelected,
  onAddToBooking,
  onViewDetails,
  onViewOptions,
  onRemove,
  onUpdate,
}: {
  dayId: string;
  item: TiyaTimelineItem;
  isSelected: boolean;
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
  const cfg = itemConfig[item.type];
  const Icon = cfg.icon;
  const status = isSelected ? statusStyles.selected : statusStyles.recommended;

  return (
    <div
      className="group grid gap-3 rounded-3xl border p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(56,189,248,0.10)] md:grid-cols-[92px_minmax(0,1fr)_minmax(260px,auto)_38px] md:items-center"
      style={{
        background: `linear-gradient(135deg, ${color.row}, #1B2740)`,
        borderTopColor: isSelected
          ? "rgba(16,185,129,0.42)"
          : "rgba(148,163,184,0.18)",
        borderRightColor: isSelected
          ? "rgba(16,185,129,0.42)"
          : "rgba(148,163,184,0.18)",
        borderBottomColor: isSelected
          ? "rgba(16,185,129,0.42)"
          : "rgba(148,163,184,0.18)",
        borderLeftColor: cfg.tone,
        borderLeftWidth: 5,
        borderLeftStyle: "solid",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{
            color: cfg.tone,
            background: `${cfg.tone}18`,
            borderColor: `${cfg.tone}40`,
          }}
        >
          <Clock size={14} />
        </span>
        <input
          value={item.time}
          onChange={(event) =>
            onUpdate(dayId, item.id, "time", event.target.value)
          }
          className="w-[58px] rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 font-mono text-sm font-black text-white outline-none"
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
            style={{
              color: cfg.tone,
              background: `${cfg.tone}20`,
              borderColor: `${cfg.tone}38`,
            }}
          >
            <Icon size={15} />
          </span>
          <input
            value={item.title}
            onChange={(event) =>
              onUpdate(dayId, item.id, "title", event.target.value)
            }
            className="min-w-0 flex-1 border-none bg-transparent text-[15px] font-black text-white outline-none"
          />
        </div>
        <div className="mt-1 flex items-center gap-1.5 pl-10">
          <MapPin size={12} className="text-slate-300" />
          <input
            value={item.location}
            onChange={(event) =>
              onUpdate(dayId, item.id, "location", event.target.value)
            }
            className="min-w-0 flex-1 border-none bg-transparent text-xs font-bold text-slate-200 outline-none"
          />
        </div>
        <p className="mt-1.5 pl-10 text-xs font-semibold leading-5 text-slate-300">
          {rowHelperText(item.type)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]"
          style={{
            color: cfg.tone,
            background: `${cfg.tone}16`,
            borderColor: `${cfg.tone}40`,
          }}
        >
          {cfg.label}
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${status.className}`}>
          {isSelected ? "Selected" : "Recommended"}
        </span>
        <button
          type="button"
          onClick={onViewDetails}
          className="min-h-9 rounded-full border bg-white/[0.10] px-3 text-xs font-black transition hover:bg-white/[0.16]"
          style={{ color: cfg.tone, borderColor: `${cfg.tone}42` }}
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onViewOptions}
          className="min-h-9 rounded-full border bg-white/[0.10] px-3 text-xs font-black transition hover:bg-white/[0.16]"
          style={{ color: cfg.tone, borderColor: `${cfg.tone}42` }}
        >
          {viewOptionsLabel(item.type)}
        </button>
        <button
          type="button"
          onClick={isSelected ? undefined : onAddToBooking}
          className={`min-h-9 rounded-full border px-3 text-xs font-black transition ${
            isSelected
              ? "cursor-default border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
              : "border-orange-300 bg-[#F5A623] text-slate-950 hover:bg-[#ffb63d]"
          }`}
        >
          {isSelected ? "Selected ✓" : "Add to Booking"}
        </button>
      </div>

      <div className="flex md:justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300/35 bg-rose-400/15 text-rose-200 opacity-80 transition group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
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
            className="min-h-9 rounded-full bg-[#F5A623] px-3 text-xs font-black text-slate-950"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-5">
          <div className="flex min-w-0 gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
              style={{
                color: cfg.tone,
                background: `${cfg.tone}12`,
                borderColor: `${cfg.tone}36`,
              }}
            >
              <DetailIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                {detailModalTitle(item)}
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {item.detailSummary || item.description || "Service details generated from the selected planner payload."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <div className="grid gap-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
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
              <div key={`${item.id}-${label}`} className="rounded-2xl bg-white px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(details).map(([label, value]) => (
              <div
                key={`${item.id}-${label}`}
                className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {formatDetailLabel(label)}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-slate-700">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
        <section className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
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
                      className="min-h-10 rounded-full bg-[#F5A623] px-4 text-xs font-black text-slate-950 shadow-[0_10px_24px_rgba(245,166,35,0.22)] transition hover:bg-[#ffb63d]"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/60 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
              Change Option
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-tight">
              {modal.title}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Compare options for {modal.dayCity || "this day"}. Selecting one
              updates the itinerary source and booking basket when this item is
              already selected.
            </p>
            {modal.currentTitle ? (
              <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">
                  Current selected option
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {modal.currentTitle}
                  {modal.currentPrice ? ` · ${currency(modal.currentPrice)}` : ""}
                </p>
              </div>
            ) : null}
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
          {options.map((option, index) => {
            const priceDifference =
              modal.currentPrice && option.price
                ? option.price - modal.currentPrice
                : 0;

            return (
            <article
              key={`${modal.dayId}-${modal.itemType}-${option.name}-${index}`}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                    style={{
                      color: cfg.tone,
                      background: `${cfg.tone}12`,
                      borderColor: `${cfg.tone}36`,
                    }}
                  >
                    <OptionIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-slate-950">
                      {option.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {option.detail}
                    </p>
                    {option.providerName ? (
                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-blue-700">
                        {option.providerName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-black text-slate-950">
                    {currency(option.price)}
                  </span>
                  {modal.currentPrice ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        priceDifference > 0
                          ? "bg-orange-50 text-orange-700"
                          : priceDifference < 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
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
                    className="min-h-10 rounded-full bg-[#F5A623] px-4 text-xs font-black text-slate-950 shadow-[0_10px_24px_rgba(245,166,35,0.22)] transition hover:bg-[#ffb63d]"
                  >
                    {modal.currentTitle ? "Replace Option" : "Select Option"}
                  </button>
                </div>
              </div>
            </article>
            );
          })}
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
  const [optionModal, setOptionModal] = useState<OptionModalState>({
    open: false,
  });
  const [serviceDetailModal, setServiceDetailModal] =
    useState<ServiceDetailModalState>({ open: false });
  const selectedBookingItemIds = useMemo(
    () =>
      bookingBasket
        .map((item) => item.sourceItemId)
        .filter((itemId): itemId is string => Boolean(itemId)),
    [bookingBasket]
  );

  useEffect(() => {
    setDays(initialDays);
    setOpenDayId((current) => current || initialDays[0]?.id || "");
  }, [initialDays]);

  function commitDays(nextDays: TiyaDayPlan[]) {
    const normalizedDays = nextDays.map((day, index) => ({
      ...day,
      day: index + 1,
    }));

    setDays(normalizedDays);
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

    const basketItem = buildBookingBasketItemFromTimeline({
      day,
      item,
      dayIndex: Math.max(0, dayIndex),
      totalBudget: 42000,
      allDays: days,
    });

    setBookingBasket((current) => upsertBookingBasketItem(current, basketItem));
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

    const nextItem = { ...sourceItem, ...patch };

    commitDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.map((item) =>
                item.id === itemId ? nextItem : item
              ),
            }
          : day
      )
    );

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

    commitDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : day
      )
    );

    if (sourceDay && sourceItem && selectedBookingItemIds.includes(itemId)) {
      const nextItem = { ...sourceItem, [field]: value };

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

  function removeStop(dayId: string, itemId: string) {
    setBookingBasket?.((current) =>
      current.filter((basketItem) => basketItem.sourceItemId !== itemId)
    );

    commitDays(
      days.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.filter((item) => item.id !== itemId) }
          : day
      )
    );
  }

  function addItem(
    dayId: string,
    type: TiyaTimelineItem["type"],
    title?: string,
    options?: { selectAfterAdd?: boolean; time?: string }
  ) {
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
      )
    );

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

  function addDay() {
    const lastDay = days[days.length - 1];
    const nextDay: TiyaDayPlan = {
      id: `day-${days.length + 1}`,
      day: days.length + 1,
      date: lastDay?.date || "Flexible",
      city: lastDay?.city || "Destination",
      pace: "Balanced",
      headline: "New Day",
      notes: "Start planning this day.",
      items: [],
    };

    commitDays([...days, nextDay]);
    setOpenDayId(nextDay.id);
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0F1A] p-4 font-sans text-white sm:p-5">
      <section className="relative mb-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,#172033_0%,#101827_100%)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
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
          <button
            type="button"
            onClick={addDay}
            className="rounded-full bg-[#F5A623] px-6 py-3 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(245,166,35,0.34)]"
          >
            + Add Day
          </button>
        </div>
        {days.length > 0 ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill value={days.length} label="Days" tone={color.amber} />
            <StatPill value={totals.transport} label="Rides" tone={color.sky} />
            <StatPill value={totals.stays} label="Stays" tone={color.teal} />
            <StatPill value={totals.activities} label="Bookable" tone={color.lime} />
          </div>
        ) : null}
      </section>

      {days.length === 0 ? (
        <TiyaEmptyState
          icon={MapPin}
          eyebrow="Itinerary canvas"
          title="Tiya has not built day cards yet"
          detail="Generate a smart plan or restore a draft to populate this editable day-wise workspace."
          tone="light"
        />
      ) : null}

      <div className="grid gap-3">
        {days.map((day, dayIndex) => {
          const open = openDayId === day.id;
          const activeTab = getTab(day.id);
          const identity = dayIdentity[dayIndex % dayIdentity.length];
          const bookings = buildDayBookings(day, selectedBookingItemIds);
          const discoveryItems = buildDiscoveryItems(day, plannerIntelligence);
          const noteWidgets = buildDayNoteWidgets(day, plannerIntelligence);
          const selectedBookingCount = day.items.filter((item) =>
            selectedBookingItemIds.includes(item.id)
          ).length;
          const itemCategories: NonNullable<TiyaTimelineItem["category"]>[] = [
            "Transport",
            "Stay",
            "Activities",
            "Meals",
            "Package",
            "Other",
          ];
          const categorizedItems = itemCategories
            .map((category) => ({
              category,
              items: day.items.filter(
                (item) =>
                  (item.category ??
                    (item.type === "transport"
                      ? "Transport"
                      : item.type === "stay"
                        ? "Stay"
                        : item.type === "meal"
                          ? "Meals"
                          : "Activities")) === category
              ),
            }))
            .filter((group) => group.items.length > 0);

          return (
            <article
              key={day.id}
              className="overflow-hidden rounded-3xl border bg-[#131929] transition-all duration-300"
              style={{
                borderColor: open ? `${identity.tone}55` : color.border,
                boxShadow: open ? `0 0 40px ${identity.glow}` : "none",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenDayId(open ? "" : day.id)}
                className="w-full text-left"
              >
                <div
                  className="h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, ${identity.tone}, ${identity.tone}44, transparent)`,
                  }}
                />
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border"
                      style={{
                        color: identity.tone,
                        background: `${identity.tone}14`,
                        borderColor: `${identity.tone}55`,
                      }}
                    >
                      <span className="font-mono text-[9px] font-black tracking-[0.16em] text-slate-400">
                        DAY
                      </span>
                      <span className="font-mono text-2xl font-black leading-none">
                        {String(day.day).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <span
                          className="rounded-full border px-2.5 py-1 text-[11px] font-black"
                          style={{
                            color: identity.tone,
                            background: `${identity.tone}18`,
                            borderColor: `${identity.tone}44`,
                          }}
                        >
                          {day.date}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-black text-white">
                          {day.city}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-black text-slate-300">
                          {day.pace}
                        </span>
                      </div>
                      <h4 className="truncate text-lg font-black text-white">
                        {day.headline}
                      </h4>
                      {!open ? (
                        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                          {day.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-100">
                      {selectedBookingCount} selected
                    </span>
                    <span className="font-mono text-xs font-black text-slate-400">
                      {day.items.length} events
                    </span>
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
              </button>

              {open ? (
                <div className="border-t border-white/10 p-4">
                  <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition hover:-translate-y-0.5"
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
                      <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
                        <div className="flex min-w-max gap-2 lg:justify-end">
                          {[
                            {
                              label: "Move ↑",
                              action: () => moveDay(day.id, "up"),
                              icon: ArrowUp,
                              className:
                                "border-white/10 bg-white/[0.06] text-slate-300",
                            },
                            {
                              label: "Move ↓",
                              action: () => moveDay(day.id, "down"),
                              icon: ArrowDown,
                              className:
                                "border-white/10 bg-white/[0.06] text-slate-300",
                            },
                            {
                              label: "Duplicate",
                              action: () => duplicateDay(day.id),
                              icon: Copy,
                              className:
                                "border-sky-300/25 bg-sky-400/10 text-sky-100",
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
                              className:
                                "border-orange-300 bg-[#F5A623] text-slate-950",
                            },
                          ].map(({ label, action, icon: ActionIcon, className }, index) => (
                            <button
                              key={`${day.id}-action-${label}-${index}`}
                              type="button"
                              onClick={action}
                              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition hover:-translate-y-0.5 ${className}`}
                            >
                              <ActionIcon size={13} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {activeTab === "Overview" ? (
                    <section className="rounded-3xl border border-white/10 bg-[#22304A] p-3 sm:p-4">
                      {day.items.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-white/10 p-7 text-center text-sm font-semibold text-slate-400">
                          No events yet. Use Bookings or Explore to build this day.
                        </div>
                      ) : null}
                      <div className="grid gap-4">
                        {categorizedItems.map((group) => (
                          <div key={`${day.id}-${group.category}`} className="grid gap-2">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                                {group.category}
                              </p>
                              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                {group.items.length} item
                                {group.items.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            {group.items.map((item) => (
                              <TimelineActionRow
                                key={item.id}
                                dayId={day.id}
                                item={item}
                                isSelected={selectedBookingItemIds.includes(item.id)}
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
                            ))}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {activeTab === "Bookings" ? (
                    <section>
                      <SectionTitle
                        eyebrow="Booking layer"
                        title="Selected from timeline and recommended options"
                        tone={identity.tone}
                      />
                      <div className="grid gap-3">
                        {bookings.map((booking) => {
                          const itemType = bookingTypeToTimelineType(
                            booking.bookingType
                          );

                          return (
                          <BookingRecommendationCard
                            key={booking.serviceId}
                            booking={booking}
                            tone={identity.tone}
                            onSelect={() =>
                              booking.sourceItemId
                                ? addTimelineItemToBooking(booking.sourceItemId)
                                : addItem(
                                    day.id,
                                    itemType,
                                    booking.selectedOption,
                                    { selectAfterAdd: true }
                                  )
                            }
                            onChange={() =>
                              openOptionModal({
                                dayId: day.id,
                                dayCity: day.city,
                                itemId: booking.sourceItemId,
                                mode: "booking",
                                itemType,
                              })
                            }
                          />
                          );
                        })}
                      </div>
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
                    <section className="rounded-3xl border border-white/10 bg-[#1C2438] p-4">
                      <SectionTitle
                        eyebrow="Smart notes"
                        title="Day readiness board"
                        tone={identity.tone}
                      />
                      <div className="grid gap-3 lg:grid-cols-2">
                        {noteWidgets.map((widget, index) => (
                          <DayNoteWidgetCard
                            key={`${day.id}-${widget.id}-${index}`}
                            widget={widget}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

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
    </div>
  );
}
