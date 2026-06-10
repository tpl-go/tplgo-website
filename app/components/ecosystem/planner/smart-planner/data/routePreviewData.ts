import { Info } from "lucide-react";
import type { TiyaRouteOption, TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
export { smartPlannerPreviewTabs, type SmartPlannerPreviewTab } from "../types/plannerTypes";

export type JourneyFlowItem = {
  id: string;
  dayNumber: number;
  title: string;
  city: string;
  journeyType: string;
  dayLabel: string;
  transferMode: string;
  timeWindow: string;
  distanceText: string;
  durationText: string;
  distance: string;
  duration: string;
  transferFromPrevious: string;
  distanceFromPrevious: string;
  durationFromPrevious: string;
  stay: string;
  activities: string[];
  meals: string;
  localMovement: string;
  notes: string;
  estimatedCost: string;
  activityCount: number;
  foodStops: string;
  riskLevel: TiyaRouteOption["riskLevel"];
  weatherWindow: string;
};


export type CostEstimateLine = {
  id: "transport" | "stay" | "activities" | "buffer";
  label: string;
  amount: number;
  percentage: number;
};


export type DayWiseEstimate = {
  day: number;
  transport: number;
  stay: number;
  food: number;
  activity: number;
  buffer: number;
  total: number;
};


export type SavingsInsight = {
  label: string;
  amount: number;
  detail: string;
};


export type RoutePricing = {
  totalCost: number;
  transportCost: number;
  stayCost: number;
  activityCost: number;
  bufferCost: number;
  travellerCount: number;
  tripDays: number;
  budgetType: string;
  perPersonCost: number;
  perDayCost: number;
  dayWiseCosts: DayWiseEstimate[];
  savings: {
    insights: SavingsInsight[];
    totalSavings: number;
  };
};


export const riskStyles: Record<TiyaRouteOption["riskLevel"], string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Medium: "bg-orange-50 text-orange-700 border-orange-100",
  High: "bg-rose-50 text-rose-700 border-rose-100",
};


export type RoutePersonality = {
  accent: string;
  base: string;
  gapGlow: string;
  glow: string;
  badge: string;
  icon: string;
  title: string;
  line: string;
  terrain: string;
};


export const fallbackPersonalities: RoutePersonality[] = [
  {
    accent: "border-orange-300/60 bg-orange-500/[0.08]",
    base: "bg-[linear-gradient(135deg,rgba(28,25,23,0.94),rgba(67,36,18,0.72)),radial-gradient(circle_at_8%_18%,rgba(251,146,60,0.18),transparent_32%)]",
    gapGlow: "bg-gradient-to-r from-transparent via-orange-300/35 to-transparent",
    glow: "shadow-[0_20px_64px_rgba(249,115,22,0.18)]",
    badge: "bg-orange-300/15 text-orange-100 border-orange-200/20",
    icon: "text-orange-100",
    title: "text-orange-200",
    line: "from-orange-200 via-amber-300 to-orange-500",
    terrain: "bg-[radial-gradient(circle_at_20%_28%,rgba(251,146,60,0.2),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.64),rgba(124,45,18,0.42))]",
  },
  {
    accent: "border-cyan-300/60 bg-cyan-300/[0.08]",
    base: "bg-[linear-gradient(135deg,rgba(8,47,73,0.94),rgba(13,78,94,0.7)),radial-gradient(circle_at_8%_18%,rgba(45,212,191,0.18),transparent_32%)]",
    gapGlow: "bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent",
    glow: "shadow-[0_20px_64px_rgba(34,211,238,0.16)]",
    badge: "bg-cyan-300/15 text-cyan-100 border-cyan-200/20",
    icon: "text-cyan-100",
    title: "text-cyan-100",
    line: "from-cyan-200 via-teal-300 to-emerald-300",
    terrain: "bg-[radial-gradient(circle_at_18%_24%,rgba(45,212,191,0.2),transparent_30%),linear-gradient(135deg,rgba(8,47,73,0.72),rgba(20,83,45,0.38))]",
  },
  {
    accent: "border-emerald-300/60 bg-emerald-400/[0.08]",
    base: "bg-[linear-gradient(135deg,rgba(6,78,59,0.92),rgba(20,83,45,0.68)),radial-gradient(circle_at_8%_18%,rgba(52,211,153,0.16),transparent_32%)]",
    gapGlow: "bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent",
    glow: "shadow-[0_20px_64px_rgba(16,185,129,0.15)]",
    badge: "bg-emerald-300/15 text-emerald-100 border-emerald-200/20",
    icon: "text-emerald-100",
    title: "text-emerald-100",
    line: "from-emerald-200 via-lime-300 to-green-400",
    terrain: "bg-[radial-gradient(circle_at_18%_26%,rgba(74,222,128,0.18),transparent_30%),linear-gradient(135deg,rgba(6,78,59,0.48),rgba(15,23,42,0.68))]",
  },
  {
    accent: "border-violet-300/55 bg-violet-500/[0.08]",
    base: "bg-[linear-gradient(135deg,rgba(46,16,101,0.92),rgba(88,28,135,0.62)),radial-gradient(circle_at_8%_18%,rgba(244,63,94,0.16),transparent_32%)]",
    gapGlow: "bg-gradient-to-r from-transparent via-violet-300/35 to-transparent",
    glow: "shadow-[0_20px_64px_rgba(190,24,93,0.16)]",
    badge: "bg-violet-300/15 text-violet-100 border-violet-200/20",
    icon: "text-violet-100",
    title: "text-violet-100",
    line: "from-violet-300 via-rose-300 to-red-400",
    terrain: "bg-[radial-gradient(circle_at_18%_24%,rgba(244,63,94,0.2),transparent_30%),linear-gradient(135deg,rgba(76,29,149,0.48),rgba(127,29,29,0.42))]",
  },
];


export const personalityStyles: Partial<Record<string, RoutePersonality>> = {
  fastest: fallbackPersonalities[0],
  scenic: fallbackPersonalities[1],
  budget: fallbackPersonalities[2],
  adventure: fallbackPersonalities[3],
};


export function getRoutePersonality(routeId: string, index: number) {
  return (
    personalityStyles[routeId] ??
    fallbackPersonalities[index % fallbackPersonalities.length]
  );
}


export function transportHint(routeOption: TiyaRouteOption) {
  if (routeOption.routeStyle.toLowerCase().includes("rail")) return "Train + cab";
  if (routeOption.routeStyle.toLowerCase().includes("airport"))
    return "Flight + transfer";
  if (routeOption.id === "adventure") return "Bike / self-drive";
  if (routeOption.id === "scenic") return "Self-drive / cab";
  return "Best available mode";
}


export function shortNote(note: string) {
  const [firstSentence] = note.split(".");
  return firstSentence ? `${firstSentence}.` : note;
}


export function stopsHint(routeOption: TiyaRouteOption) {
  if (routeOption.id === "fastest") return "Minimal stops";
  if (routeOption.id === "scenic") return "Viewpoint halts";
  if (routeOption.id === "budget") return "Efficient stops";
  return "Terrain stops";
}


export function permitHint(routeOption: TiyaRouteOption) {
  if (routeOption.riskLevel === "High") return "Permit/weather review";
  if (routeOption.id === "adventure") return "Terrain permit check";
  return "No major permit flag";
}


export function routeCountLabel(count: number) {
  if (count === 1) {
    return "Total 1 route is possible. Please select as per your requirement.";
  }

  return `Total ${count} routes are possible. Please select as per your requirement.`;
}


export function buildRoutePathCities(tripIntent?: TiyaTripIntent) {
  if (!tripIntent?.fromCity || !tripIntent?.toCity) return [];

  const cleanCity = (city: string) => city.trim();
  const fromCity = cleanCity(tripIntent.fromCity);
  const toCity = cleanCity(tripIntent.toCity);

  if (!fromCity || !toCity) return [];

  if (tripIntent.tripType === "Round Trip" || tripIntent.returnToOrigin) {
    return [fromCity, toCity, fromCity];
  }

  if (tripIntent.tripType === "Multi City") {
    const extraStops = (tripIntent.multiCityStops || tripIntent.stops || [])
      .map(cleanCity)
      .filter(Boolean);
    const stops = extraStops[0] === toCity ? extraStops : [toCity, ...extraStops];

    return [fromCity, ...stops];
  }

  return [fromCity, toCity];
}


export function getTripDayCount(tripIntent?: TiyaTripIntent) {
  if (tripIntent?.startDate && tripIntent.endDate) {
    const start = new Date(tripIntent.startDate);
    const end = new Date(tripIntent.endDate);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const days =
        Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

      if (days > 0) return days;
    }
  }

  return 5;
}


export function getDayDateLabel(startDate: string | undefined, dayNumber: number) {
  if (!startDate || dayNumber < 1) return "";

  const trimmedDate = startDate.trim();
  const isoMatch = trimmedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const localMatch = trimmedDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const parsedDate = isoMatch
    ? new Date(
        Number(isoMatch[1]),
        Number(isoMatch[2]) - 1,
        Number(isoMatch[3])
      )
    : localMatch
      ? new Date(
          Number(localMatch[3]),
          Number(localMatch[2]) - 1,
          Number(localMatch[1])
        )
      : new Date(trimmedDate);

  if (Number.isNaN(parsedDate.getTime())) return "";

  parsedDate.setDate(parsedDate.getDate() + dayNumber - 1);

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}


export function normalizeIntentValue(value?: string) {
  return (value || "").trim().toLowerCase();
}


export function chooseStayLabel(tripIntent?: TiyaTripIntent, dayType = "base") {
  const stay = normalizeIntentValue(tripIntent?.stayPreference);
  const budget = normalizeIntentValue(tripIntent?.budgetTier);

  if (stay.includes("homestay")) {
    if (dayType === "local") return "Local Host Stay";
    if (dayType === "scenic") return "Mountain Homestay";
    return "Homestay";
  }

  if (stay.includes("resort")) return "Resort";
  if (stay.includes("premium") || budget.includes("premium"))
    return "Premium Scenic Property";
  if (budget.includes("luxury")) return "Luxury Stay";
  if (stay.includes("budget") || budget.includes("budget")) return "Budget Stay";
  if (stay.includes("no stay")) return "No stay needed";

  return dayType === "local" ? "Boutique Stay" : "Hotel";
}


export function buildTransportActivities(tripIntent?: TiyaTripIntent) {
  const mode = normalizeIntentValue(
    tripIntent?.transportPreference || tripIntent?.transportMode
  );

  if (mode.includes("ev")) {
    return ["Road journey", "Charging stop", "Scenic route stop"];
  }
  if (mode.includes("flight")) {
    return ["Airport transfer", "Flight movement", "Arrival coordination"];
  }
  if (mode.includes("train")) {
    return ["Station transfer", "Rail journey", "Arrival point coordination"];
  }
  if (mode.includes("bus")) {
    return ["Boarding point", "Bus route", "Arrival point"];
  }
  if (mode.includes("bike")) {
    return ["Ride briefing", "Fuel halt", "Scenic riding stop"];
  }
  if (mode.includes("car") || mode.includes("cab")) {
    return ["Road journey", "Comfort halt", "Scenic stop"];
  }

  return ["Mixed movement", "Transfer coordination", "Route buffer"];
}


export function buildPreferenceActivities(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const style = normalizeIntentValue(tripIntent?.travelStyle);
  const interests = (tripIntent?.interests || []).map((item) =>
    normalizeIntentValue(item)
  );
  const budget = normalizeIntentValue(tripIntent?.budgetTier);
  const activities: string[] = [];

  if (style.includes("couple")) {
    activities.push("Sunset point", "Cafe stop", "Scenic walk", "Romantic experience");
  } else if (style.includes("family")) {
    activities.push("Family activity", "Kid friendly stop", "Easy local walk");
  } else if (style.includes("adventure")) {
    activities.push("Trek", "Trail", "Outdoor experience");
  }

  if (interests.includes("food")) {
    activities.push("Food stops", "Local cuisine");
  }
  if (interests.includes("culture")) {
    activities.push("Local market", "Museum", "Monastery", "Heritage area");
  }
  if (interests.includes("nature")) {
    activities.push("Viewpoints", "Lakes", "Valleys");
  }

  if (budget.includes("budget")) {
    activities.push("Local food", "Value experience");
  } else if (budget.includes("premium")) {
    activities.push("Premium experience", "Premium scenic property");
  } else if (budget.includes("luxury")) {
    activities.push("Private experience", "Luxury stay experience");
  }

  buildExperiencePreview(routeOption).forEach((activity) =>
    activities.push(activity)
  );

  return Array.from(new Set(activities)).slice(0, 6);
}


export function getWeatherWindow(routeOption: TiyaRouteOption) {
  if (routeOption.riskLevel === "High") return "Weather review";
  if (routeOption.riskLevel === "Medium") return "Buffer advised";
  return "Stable window";
}


export function buildSmartNearbyStops(
  destination: string,
  _tripIntent?: TiyaTripIntent,
  routeOption?: TiyaRouteOption
) {
  const key = normalizeIntentValue(destination);
  const fallbackMap: Record<string, string[]> = {
    leh: [
      "Leh Arrival",
      "Sham Valley",
      "Nubra Valley",
      "Pangong Lake",
      "Leh Local Market",
      "Monastery Circuit",
      "Return Buffer",
      "Trip Closure",
    ],
    srinagar: [
      "Srinagar",
      "Gulmarg",
      "Sonmarg",
      "Pahalgam",
      "Dal Lake",
      "Local Market",
      "Trip Closure",
    ],
    manali: [
      "Manali",
      "Solang Valley",
      "Atal Tunnel",
      "Sissu",
      "Jispa",
      "Local Market",
      "Trip Closure",
    ],
    jaipur: [
      "Jaipur City",
      "Amer Fort",
      "Nahargarh",
      "Local Market",
      "Chokhi Dhani",
      "Trip Closure",
    ],
  };
  const matchedKey = Object.keys(fallbackMap).find((item) =>
    key.includes(item)
  );
  const fallbackStops = [
    `${destination} Arrival`,
    "Local Sightseeing",
    routeOption?.id === "scenic" ? "Scenic Viewpoint" : "Nearby Excursion",
    "Local Market",
    "Free Exploration",
    "Return Buffer",
    "Trip Closure",
  ];

  return matchedKey ? fallbackMap[matchedKey] : fallbackStops;
}


export function getJourneyTimeWindow(journeyType: string) {
  if (journeyType === "departure") return "Morning Departure";
  if (journeyType === "travel") return "Transit Window";
  if (journeyType === "arrival") return "Arrival Buffer";
  if (journeyType === "return") return "Return Window";
  if (journeyType === "excursion") return "Full Day";
  if (journeyType === "culture") return "Afternoon Window";
  return "Local Window";
}


export function getJourneyNodeDisplay(city: string, title: string, journeyType: string) {
  const cleanTitle = title.replace(/^Day \d+ - /, "").trim();
  const normalizedCity = normalizeIntentValue(city);
  const subtitleMap: Record<string, string> = {
    "leh arrival": "Arrival & acclimatization",
    "sham valley": "Scenic valley exploration",
    "nubra valley": "Desert valley stay",
    "pangong lake": "High-altitude lake experience",
    "leh local market": "Local market walk",
    "monastery circuit": "Heritage monastery circuit",
    "return buffer": "Return buffer day",
    "trip closure": "Journey closure",
  };
  const categoryMap: Record<string, string> = {
    arrival: "Arrival",
    excursion: "Scenic Stop",
    culture: "Culture",
    free: "Local",
    return: "Return",
    travel: "Transfer",
    departure: "Start",
  };
  const inferredCategory =
    normalizedCity.includes("market")
      ? "Market"
      : categoryMap[journeyType] || "Route";
  const subtitle =
    subtitleMap[normalizedCity] ||
    (normalizeIntentValue(cleanTitle) === normalizedCity
      ? `${inferredCategory} plan`
      : cleanTitle);

  return { category: inferredCategory, subtitle };
}


export function transferModeLabel(routeOption: TiyaRouteOption, tripIntent?: TiyaTripIntent) {
  const selectedMode =
    tripIntent?.transportPreference || tripIntent?.transportMode || "";
  const normalized = selectedMode.toLowerCase();

  if (normalized.includes("flight")) return "Flight + transfer";
  if (normalized.includes("train")) return "Train + cab";
  if (normalized.includes("bus")) return "Bus + local transfer";
  if (normalized.includes("ev")) return "EV / self-drive";
  if (normalized.includes("car")) return "Self-drive";
  if (normalized.includes("cab")) return "Cab";
  if (normalized.includes("bike")) return "Bike";
  if (normalized.includes("mixed")) return "Mixed";

  return transportHint(routeOption);
}


export function buildJourneyFlow(
  routeOption: TiyaRouteOption,
  tripIntent: TiyaTripIntent | undefined,
  routePricing: RoutePricing
): JourneyFlowItem[] {
  const routeCities = buildRoutePathCities(tripIntent);
  const { origin, destination } = getRouteCities(tripIntent);
  const isMultiCity = tripIntent?.tripType === "Multi City";
  const isRoundTrip =
    tripIntent?.tripType === "Round Trip" || tripIntent?.returnToOrigin;
  const tripDays = getTripDayCount(tripIntent);
  const cabPreference = tripIntent?.cabRequirement || "Local movement as needed";
  const transferMode = transferModeLabel(routeOption, tripIntent);
  const baseCities =
    routeCities.length >= 2
      ? routeCities
      : [origin, destination].filter((city) => city && city !== "your origin");
  const transportActivities = buildTransportActivities(tripIntent);
  const preferenceActivities = buildPreferenceActivities(routeOption, tripIntent);
  const weatherWindow = getWeatherWindow(routeOption);
  const mainDestination = destination || baseCities[1] || "destination";
  const nearbyStops = buildSmartNearbyStops(mainDestination, tripIntent, routeOption);
  const transportPreference = normalizeIntentValue(
    tripIntent?.transportPreference || tripIntent?.transportMode
  );
  const isRoadMode =
    transportPreference.includes("ev") ||
    transportPreference.includes("car") ||
    transportPreference.includes("cab") ||
    transportPreference.includes("bike");
  const arrivalDay = isRoadMode && tripDays >= 3 ? 3 : Math.min(2, tripDays);
  const resolveMultiCityNode = (dayNumber: number) => {
    const cityIndex = Math.min(
      Math.floor(((dayNumber - 1) / Math.max(tripDays - 1, 1)) * baseCities.length),
      baseCities.length - 1
    );
    const city = baseCities[cityIndex] || mainDestination;
    const previousCity =
      dayNumber > 1
        ? baseCities[
            Math.min(
              Math.floor(((dayNumber - 2) / Math.max(tripDays - 1, 1)) * baseCities.length),
              baseCities.length - 1
            )
          ]
        : city;
    const changedCity = dayNumber === 1 || city !== previousCity;

    return {
      city,
      journeyType: dayNumber === 1 ? "departure" : changedCity ? "travel" : "local",
      title:
        dayNumber === 1
          ? `${city} Departure`
          : changedCity
            ? `${city} Route Stop`
            : `${city} Local Exploration`,
    };
  };
  const resolveDayNode = (dayNumber: number) => {
    if (isMultiCity && baseCities.length > 1) {
      return resolveMultiCityNode(dayNumber);
    }

    if (dayNumber === 1) {
      return {
        city: origin,
        journeyType: "departure",
        title: `${origin} Departure`,
      };
    }

    if (isRoundTrip && dayNumber === tripDays) {
      return {
        city: origin,
        journeyType: "return",
        title: "Arrival / Trip Closure",
      };
    }

    if (isRoadMode && dayNumber === 2 && tripDays >= 3) {
      return {
        city: "Road Journey / Stopover",
        journeyType: "travel",
        title: "Road Journey / Stopover",
      };
    }

    if (dayNumber === arrivalDay) {
      const arrivalStop = nearbyStops[0] || `${mainDestination} Arrival`;

      return {
        city: arrivalStop,
        journeyType: "arrival",
        title: arrivalStop,
      };
    }

    if (isRoundTrip && dayNumber === tripDays - 1) {
      const returnStop =
        nearbyStops.find((stop) => stop.toLowerCase().includes("return")) ||
        "Return Buffer";

      return {
        city: returnStop,
        journeyType: "return",
        title: returnStop,
      };
    }

    const nearbyIndex = Math.max(1, dayNumber - arrivalDay);
    const stop =
      nearbyStops[nearbyIndex] ||
      nearbyStops[(nearbyIndex - 1) % nearbyStops.length] ||
      `${mainDestination} Local Exploration`;
    const normalizedStop = stop.toLowerCase();
    const journeyType =
      normalizedStop.includes("market") ||
      normalizedStop.includes("monastery") ||
      normalizedStop.includes("fort")
        ? "culture"
        : normalizedStop.includes("valley") ||
            normalizedStop.includes("lake") ||
            normalizedStop.includes("tunnel") ||
            normalizedStop.includes("excursion")
          ? "excursion"
          : normalizedStop.includes("free")
            ? "free"
            : "local";

    return {
      city: stop,
      journeyType,
      title: stop,
    };
  };

  return Array.from({ length: tripDays }, (_, index) => {
    const dayNumber = index + 1;
    const dayNode = resolveDayNode(dayNumber);
    const city = dayNode.city;
    const isFirstDay = dayNumber === 1;
    const isLastDay = dayNumber === tripDays;
    const isTravelDay =
      isFirstDay ||
      (isRoundTrip && isLastDay) ||
      dayNode.journeyType === "travel" ||
      dayNode.journeyType === "arrival" ||
      (isMultiCity && dayNode.journeyType === "travel");
    const dayType = dayNode.journeyType;
    const dayLabel = `DAY ${dayNumber}`;
    const dayTitle = `Day ${dayNumber} - ${dayNode.title}`;
    const dayActivities = isTravelDay
      ? [...transportActivities, ...preferenceActivities.slice(0, 2)]
      : [...preferenceActivities];
    const activities = Array.from(new Set(dayActivities)).slice(0, 5);
    const isLocalDay = !isTravelDay;
    const stayType = chooseStayLabel(
      tripIntent,
      routeOption.id === "scenic" || dayType === "excursion" ? "scenic" : isLocalDay ? "local" : "base"
    );
    const meals = activities.some((activity) =>
      activity.toLowerCase().includes("food")
    )
      ? "Local cuisine, food stops and flexible dinner"
      : normalizeIntentValue(tripIntent?.budgetTier).includes("budget")
        ? "Local food and practical meal stops"
        : "Breakfast, local lunch and curated dinner window";
    const localMovement = isTravelDay
      ? `${transferMode} with ${cabPreference}`
      : `${cabPreference} for local movement and experience transfers`;
    const distance = isTravelDay
      ? routeOption.distance || "Distance TBD"
      : "Local 25-45 KM";
    const duration = isTravelDay
      ? routeOption.duration || "Duration TBD"
      : "4-6 Hours";
    const dayCost =
      routePricing.dayWiseCosts[index]?.total ?? routePricing.perDayCost;

    return {
      id: `${routeOption.id}-day-${dayNumber}-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      dayNumber,
      title: dayTitle,
      city,
      journeyType: dayType,
      dayLabel,
      transferMode,
      timeWindow: getJourneyTimeWindow(dayType),
      distanceText: distance,
      durationText: duration,
      distance,
      duration,
      transferFromPrevious: isFirstDay ? "Start" : transferMode,
      distanceFromPrevious: isFirstDay ? "Origin" : distance,
      durationFromPrevious: isFirstDay ? "Ready" : duration,
      stay: isFirstDay
        ? "Departure city stay as per traveler preference"
        : isLastDay && isRoundTrip
          ? "Return arrival, stay optional"
          : stayType,
      activities,
      meals,
      localMovement,
      notes: `${routeOption.riskLevel} risk watch. ${weatherWindow}. ${permitHint(routeOption)}. ${routeOption.difficulty} pacing stays editable in workspace.`,
      estimatedCost: `${formatCurrency(dayCost)} day estimate`,
      activityCount: activities.length,
      foodStops: activities.some((activity) =>
        activity.toLowerCase().includes("food")
      )
        ? "Food stops planned"
        : "Meal stops planned",
      riskLevel: routeOption.riskLevel,
      weatherWindow,
    };
  });
}


export function distributeAmount(total: number, weights: number[]) {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const distributed = weights.map((weight) =>
    Math.floor((total * weight) / weightTotal)
  );
  const remainder =
    total - distributed.reduce((sum, amount) => sum + amount, 0);

  if (distributed.length) {
    distributed[distributed.length - 1] += remainder;
  }

  return distributed;
}


export function buildRoutePricing(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
): RoutePricing {
  const distanceValue = Number(routeOption.distance.match(/\d+/)?.[0] ?? 360);
  const routeFactor =
    routeOption.id === "budget"
      ? 0.82
      : routeOption.id === "scenic"
        ? 1.08
        : routeOption.id === "adventure"
        ? 1.14
        : 1;
  const base = Math.max(8000, Math.round(distanceValue * 52 * routeFactor));
  const transportAmount = base;
  const stayAmount = Math.round(base * 0.72);
  const activityAmount = Math.round(base * 0.34);
  const bufferAmount = Math.round(base * 0.18);
  const totalCost =
    transportAmount + stayAmount + activityAmount + bufferAmount;
  const tripDays = getTripDayCount(tripIntent);
  const travellerCount = Math.max(
    1,
    (tripIntent?.adults || 0) +
      (tripIntent?.children || 0) +
      (tripIntent?.seniors || 0)
  );
  const transportMode = normalizeIntentValue(
    tripIntent?.transportPreference || tripIntent?.transportMode
  );
  const stayPreference = normalizeIntentValue(tripIntent?.stayPreference);
  const budgetType = tripIntent?.budgetTier || "Flexible";
  const savingsInsights: SavingsInsight[] = [
    {
      label: "EV Route Saving",
      amount: transportMode.includes("ev")
        ? Math.round(transportAmount * 0.14)
        : Math.round(transportAmount * 0.06),
      detail: transportMode.includes("ev")
        ? "Charging-led route can reduce fuel cost."
        : "Route optimization can reduce transfer spend.",
    },
    {
      label: "Homestay Saving",
      amount: stayPreference.includes("homestay")
        ? Math.round(stayAmount * 0.18)
        : Math.round(stayAmount * 0.08),
      detail: stayPreference.includes("homestay")
        ? "Local host stays improve value."
        : "Alternative stay mix can improve value.",
    },
    {
      label: "Off Peak Saving",
      amount: Math.round((activityAmount + bufferAmount) * 0.1),
      detail: "Flexible timing can reduce activity and buffer cost.",
    },
  ];
  const totalSavings = savingsInsights.reduce(
    (sum, insight) => sum + insight.amount,
    0
  );
  const travelWeights = Array.from({ length: tripDays }, (_, index) =>
    index === 0 || index === tripDays - 1 ? 1.22 : 0.92
  );
  const activityWeights = Array.from({ length: tripDays }, (_, index) =>
    index === 0 || index === tripDays - 1 ? 0.72 : 1.08
  );
  const transportByDay = distributeAmount(transportAmount, travelWeights);
  const stayByDay = distributeAmount(stayAmount, Array(tripDays).fill(1));
  const foodByDay = distributeAmount(
    Math.round(activityAmount * 0.28),
    activityWeights
  );
  const activityByDay = distributeAmount(
    activityAmount - foodByDay.reduce((sum, amount) => sum + amount, 0),
    activityWeights
  );
  const bufferByDay = distributeAmount(bufferAmount, Array(tripDays).fill(1));
  const dayWiseCosts = Array.from({ length: tripDays }, (_, index) => {
    const day = index + 1;
    const transport = transportByDay[index] ?? 0;
    const stay = stayByDay[index] ?? 0;
    const food = foodByDay[index] ?? 0;
    const activity = activityByDay[index] ?? 0;
    const buffer = bufferByDay[index] ?? 0;

    return {
      day,
      transport,
      stay,
      food,
      activity,
      buffer,
      total: transport + stay + food + activity + buffer,
    };
  });

  return {
    totalCost,
    transportCost: transportAmount,
    stayCost: stayAmount,
    activityCost: activityAmount,
    bufferCost: bufferAmount,
    travellerCount,
    tripDays,
    budgetType,
    perPersonCost: Math.round(totalCost / travellerCount),
    perDayCost: Math.round(totalCost / tripDays),
    dayWiseCosts,
    savings: {
      insights: savingsInsights,
      totalSavings,
    },
  };
}


export function getCostDistribution(routePricing: RoutePricing): CostEstimateLine[] {
  const percentage = (amount: number) =>
    routePricing.totalCost > 0
      ? Math.round((amount / routePricing.totalCost) * 100)
      : 0;

  return [
    {
      id: "transport",
      label: "Transport",
      amount: routePricing.transportCost,
      percentage: percentage(routePricing.transportCost),
    },
    {
      id: "stay",
      label: "Stay",
      amount: routePricing.stayCost,
      percentage: percentage(routePricing.stayCost),
    },
    {
      id: "activities",
      label: "Activities",
      amount: routePricing.activityCost,
      percentage: percentage(routePricing.activityCost),
    },
    {
      id: "buffer",
      label: "Buffer",
      amount: routePricing.bufferCost,
      percentage: percentage(routePricing.bufferCost),
    },
  ];
}


export function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}


export function buildTravelIntelligence(routeOption: TiyaRouteOption) {
  return [
    `Weather Intelligence: ${routeOption.riskLevel === "High" ? "review before departure" : "stable window expected"}`,
    `Road & Route Conditions: ${routeOption.difficulty}`,
    `Permit & Regulations: ${permitHint(routeOption)}`,
    "Network Coverage: verify live coverage before remote stretches",
    `Health & Altitude: ${routeOption.riskLevel === "High" ? "acclimatization buffer recommended" : "standard travel readiness"}`,
    `Safety Intelligence: ${routeOption.riskLevel} route watch`,
    "Seasonal Advisories: verify live conditions in workspace",
    `AI Recommendations: ${routeOption.note}`,
    "Local Alerts: check local closures, traffic and event updates",
    "Emergency Information: add nearest support contacts in workspace",
  ];
}


export function getTravelIntelligenceDashboard(routeOption: TiyaRouteOption) {
  const intelligence = buildTravelIntelligence(routeOption);
  const weatherScore =
    routeOption.riskLevel === "Low" ? 88 : routeOption.riskLevel === "Medium" ? 72 : 54;
  const safetyScore =
    routeOption.riskLevel === "Low" ? 90 : routeOption.riskLevel === "Medium" ? 76 : 58;
  const comfortScore = routeOption.comfortScore;
  const creatorScore =
    routeOption.id === "scenic" ? 91 : routeOption.id === "adventure" ? 86 : 78;
  const overallScore = Math.round(
    (weatherScore + safetyScore + comfortScore + creatorScore) / 4
  );

  return {
    intelligence,
    scores: [
      ["Overall Travel Score", overallScore, "from-orange-400 to-cyan-400"],
      ["Weather Score", weatherScore, "from-sky-400 to-cyan-400"],
      ["Safety Score", safetyScore, "from-emerald-400 to-green-500"],
      ["Comfort Score", comfortScore, "from-blue-400 to-indigo-500"],
      ["Creator Score", creatorScore, "from-violet-400 to-fuchsia-500"],
    ] as const,
    weather: {
      temperatureRange: routeOption.riskLevel === "High" ? "Live check" : "18°-26°C",
      rainRisk:
        routeOption.riskLevel === "Low"
          ? "Low / 12%"
          : routeOption.riskLevel === "Medium"
            ? "Moderate / 34%"
            : "High / 62%",
      windSpeed: routeOption.riskLevel === "High" ? "18 km/h" : "8 km/h",
      visibility: routeOption.riskLevel === "High" ? "Variable" : "Clear",
      bestWindow:
        routeOption.riskLevel === "High" ? "Review before lock" : "Good to plan",
      status:
        routeOption.riskLevel === "High" ? "Weather watch" : "Travel friendly",
    },
    route: {
      roadStatus:
        routeOption.riskLevel === "High" ? "Needs review" : "Route-ready",
      drivingDifficulty: routeOption.difficulty,
      fuelAvailability:
        routeOption.id === "adventure" ? "Plan fuel stops" : "Available on route",
      evCharging:
        routeOption.id === "scenic" || routeOption.id === "adventure"
          ? "Plan charging halts"
          : "Available near hubs",
      networkCoverage:
        routeOption.riskLevel === "High" ? "Patchy sections" : "Mostly stable",
    },
    safety: {
      safetyStatus:
        routeOption.riskLevel === "Low" ? "Safe to plan" : `${routeOption.riskLevel} watch`,
      altitudeRisk:
        routeOption.id === "adventure" ? "Acclimatization advised" : "Standard readiness",
      medicalReadiness:
        routeOption.riskLevel === "High" ? "Carry essentials" : "Standard kit",
      emergencyAccess:
        routeOption.riskLevel === "High" ? "Verify nearby support" : "Available nearby",
    },
    permit: {
      permitStatus: permitHint(routeOption),
      restrictedZones:
        routeOption.riskLevel === "High" ? "Check live restrictions" : "No major flag",
      travelAdvisory:
        routeOption.riskLevel === "High" ? "Review before departure" : "Advisory normal",
      localAlerts: "Workspace live checks",
    },
    recommendations: [
      {
        title: "Best departure time",
        description: "Early morning movement window",
        priorityTag: "Time Saver",
      },
      {
        title: "Scenic stop suggestion",
        description: `${stopsHint(routeOption)} recommended`,
        priorityTag: "High Value",
      },
      {
        title: "Creator hotspot",
        description:
          routeOption.id === "scenic"
            ? "Cafe + sunset points"
            : "Add creator picks from workspace",
        priorityTag: "Creator Friendly",
      },
      {
        title: "Driving recommendation",
        description: `${routeOption.difficulty} pacing with buffers`,
        priorityTag: "Safety First",
      },
    ],
  };
}


export function getMobilityMode(tripIntent?: TiyaTripIntent) {
  const mode = normalizeIntentValue(
    tripIntent?.transportPreference || tripIntent?.transportMode
  );

  if (mode.includes("ev")) return "ev";
  if (mode.includes("flight")) return "flight";
  if (mode.includes("train")) return "train";
  if (mode.includes("bus")) return "bus";
  if (mode.includes("cab")) return "cab";
  if (mode.includes("car") || mode.includes("self")) return "self-drive";
  return "mixed";
}


export function buildMobilityIntelligence(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const mode = getMobilityMode(tripIntent);
  const commonScore =
    routeOption.riskLevel === "Low" ? 88 : routeOption.riskLevel === "Medium" ? 74 : 62;
  const mobilityMap: Record<string, { title: string; score: number; items: Array<[string, string]> }> = {
    ev: {
      title: "EV Mobility Intelligence",
      score: commonScore,
      items: [
        ["EV Route Score", `${commonScore}/100`],
        ["Battery Planning", "Plan 20-30% reserve"],
        ["Charging Stations", "Map before departure"],
        ["Fast Chargers", routeOption.id === "adventure" ? "Limited stretches" : "Available near hubs"],
        ["Charging Stops", stopsHint(routeOption)],
        ["Last Reliable Charger", "Verify in workspace"],
        ["Charging Buffer", "45-60 min buffer"],
        ["EV Readiness", `${commonScore}/100`],
      ],
    },
    "self-drive": {
      title: "Self Drive Intelligence",
      score: commonScore,
      items: [
        ["Fuel Stations", "Available on route"],
        ["Highway Quality", routeOption.difficulty],
        ["Road Conditions", routeOption.riskLevel === "High" ? "Review required" : "Route-ready"],
        ["Toll Estimate", "Workspace estimate ready"],
        ["Parking", "Destination dependent"],
        ["Night Driving Risk", routeOption.riskLevel === "Low" ? "Low" : "Avoid night movement"],
        ["Driving Comfort", `${routeOption.comfortScore}/100`],
      ],
    },
    flight: {
      title: "Airport Intelligence",
      score: commonScore,
      items: [
        ["Terminal Info", "Verify after booking"],
        ["Check-in Window", "2-3 hours before departure"],
        ["Transfer Duration", "Airport + local transfer"],
        ["Airport Connectivity", "Cab / local transfer ready"],
        ["Travel Buffer", "Add city traffic buffer"],
      ],
    },
    train: {
      title: "Station Intelligence",
      score: commonScore,
      items: [
        ["Platform Guidance", "Check before departure"],
        ["Local Transport", "Station transfer required"],
        ["Crowd Expectation", "Moderate"],
        ["Station Facilities", "Food, lounge and cab access"],
      ],
    },
    bus: {
      title: "Bus Mobility Intelligence",
      score: commonScore,
      items: [
        ["Boarding Point", "Verify pickup point"],
        ["Rest Stops", "Planned on route"],
        ["Comfort Level", `${routeOption.comfortScore}/100`],
        ["Route Quality", routeOption.difficulty],
        ["Travel Window", "Day movement preferred"],
      ],
    },
    cab: {
      title: "Cab Mobility Intelligence",
      score: commonScore,
      items: [
        ["Pickup Guidance", "Doorstep / hub pickup"],
        ["Route Efficiency", routeOption.id === "fastest" ? "High" : "Balanced"],
        ["Stop Flexibility", "Custom halts possible"],
        ["Travel Comfort", `${routeOption.comfortScore}/100`],
        ["Driver Window", "Avoid late night stretch"],
      ],
    },
    mixed: {
      title: "Mixed Mobility Intelligence",
      score: commonScore,
      items: [
        ["Mode Mix", transportHint(routeOption)],
        ["Transfer Sync", "Workspace editable"],
        ["Travel Buffer", "Recommended"],
        ["Comfort Level", `${routeOption.comfortScore}/100`],
      ],
    },
  };

  return mobilityMap[mode] ?? mobilityMap.mixed;
}


export function buildLocalLife(routeOption: TiyaRouteOption, tripIntent?: TiyaTripIntent) {
  return {
    sections: [
      ["Local Food", buildLocalFood(routeOption, tripIntent).join(" • ")],
      ["Local Products", buildLocalProducts(routeOption, tripIntent).join(" • ")],
      ["Local Markets", "Market walks, regional products, creator-friendly stops"],
      ["Hidden Gems", buildMajorAttractions(routeOption, tripIntent).join(" • ")],
      ["Culture Experiences", "Heritage areas, local walks and community stops"],
      ["Shopping Areas", "Local market clusters and souvenir stops"],
      ["Local Festivals", "API-ready seasonal event layer"],
      ["Local Recommendations", buildExperiencePreview(routeOption).join(" • ")],
    ] as Array<[string, string]>,
    cta: "Explore More Local Experiences",
  };
}


export function buildCreatorIntelligence(routeOption: TiyaRouteOption) {
  return {
    sections: [
      ["Creator Recommended Spots", routeOption.id === "scenic" ? "Viewpoint cafes and scenic halts" : "Workspace creator picks"],
      ["Photography Locations", "Golden hour stops, route frames and landmark angles"],
      ["Viral Reel Locations", "Short-form friendly stopovers"],
      ["Sunrise Points", "Early movement scenic window"],
      ["Sunset Points", "Cafe + viewpoint closure"],
      ["Creator Route Suggestions", stopsHint(routeOption)],
      ["Content Creation Spots", "Food, market, trail and viewpoint content"],
    ] as Array<[string, string]>,
    cta: "Explore on TPL Creators",
  };
}


export function buildExperiencePreview(routeOption: TiyaRouteOption) {
  if (routeOption.id === "scenic") return ["Scenic stopovers", "Hidden viewpoints", "Local food"];
  if (routeOption.id === "budget") return ["Local food", "Market walks", "Value activities"];
  if (routeOption.id === "adventure") return ["Terrain trails", "Creator stop", "Rugged viewpoints"];
  return ["Fast transfer", "City highlight", "Comfort stopover"];
}


export function buildRouteHighlights(routeOption: TiyaRouteOption) {
  const highlights = new Set<string>();
  const routeText = `${routeOption.name} ${routeOption.routeStyle} ${routeOption.bestFor} ${routeOption.note}`.toLowerCase();

  if (routeOption.scenicScore >= 82 || routeText.includes("scenic")) {
    highlights.add("Best scenic views");
    highlights.add("Scenic photography points");
  }

  if (routeOption.comfortScore >= 78 || routeText.includes("comfort")) {
    highlights.add("Comfort-focused travel windows");
  }

  if (routeOption.budgetFit >= 80 || routeOption.id === "budget") {
    highlights.add("Budget-friendly route choices");
  }

  if (routeOption.riskLevel === "Low") {
    highlights.add("Safe driving conditions");
  } else if (routeOption.riskLevel === "Medium") {
    highlights.add("Weather-aware route planning");
  } else {
    highlights.add("Permit and terrain review needed");
  }

  if (routeText.includes("family") || routeOption.comfortScore >= 74) {
    highlights.add("Family friendly route");
  }

  if (routeText.includes("food") || routeOption.id === "budget") {
    highlights.add("Popular food stops");
  }

  if (routeText.includes("creator") || routeOption.id === "scenic") {
    highlights.add("Recommended creator spots");
  }

  buildExperiencePreview(routeOption).forEach((item) => highlights.add(item));
  highlights.add(transportHint(routeOption));

  return Array.from(highlights).slice(0, 6);
}


export function getRouteCities(tripIntent?: TiyaTripIntent) {
  const origin = tripIntent?.fromCity?.trim() || "your origin";
  const destination = tripIntent?.toCity?.trim() || "the destination";
  const stops =
    tripIntent?.tripType === "Multi City"
      ? (tripIntent.multiCityStops || []).filter((stop) => stop.trim())
      : [];

  return { origin, destination, stops };
}


export function buildDestinationBrief(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const { origin, destination, stops } = getRouteCities(tripIntent);
  const viaText = stops.length ? ` via ${stops.join(", ")}` : "";
  const note = shortNote(routeOption.note || "");

  return `${origin} to ${destination}${viaText} is shaped as a ${routeOption.routeStyle || "smart travel route"}. ${
    note || "Tiya will optimize this route based on your travel style."
  }`;
}


export function buildRouteExperience(routeOption: TiyaRouteOption) {
  if (routeOption.id === "scenic") {
    return "Expect softer halts, viewpoint-led pacing and enough buffers for photography, food stops and weather changes.";
  }

  if (routeOption.id === "fastest") {
    return "Expect cleaner transfers, fewer detours and a timing-first route that keeps movement efficient.";
  }

  if (routeOption.id === "budget") {
    return "Expect value-led movement with practical stops, efficient stay choices and lower-cost transport combinations.";
  }

  if (routeOption.id === "adventure") {
    return "Expect active terrain, route readiness checks and a more energetic pace with recovery windows built in.";
  }

  return "Expect a balanced route experience tuned around comfort, timing, budget and route readiness.";
}


export function buildBestTimeToVisit(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const destination = getRouteCities(tripIntent).destination;
  const dateWindow =
    tripIntent?.startDate && tripIntent?.endDate
      ? `${tripIntent.startDate} to ${tripIntent.endDate}`
      : "your selected travel window";
  const weatherNote =
    routeOption.riskLevel === "High"
      ? "Live weather and permit checks should be reviewed before locking this route."
      : routeOption.riskLevel === "Medium"
        ? "Keep a weather buffer for road, rail or local transfer changes."
        : "The route currently reads as a stable planning window.";

  return `${destination} can be planned around ${dateWindow}. ${weatherNote}`;
}


export function buildThingsToKeepInMind(routeOption: TiyaRouteOption) {
  return [
    `${routeOption.riskLevel || "Review"} risk level`,
    `${routeOption.distance || "Distance"} route distance`,
    `${routeOption.duration || "Duration"} movement window`,
    permitHint(routeOption),
    transportHint(routeOption),
    routeOption.difficulty || "Terrain readiness review",
  ];
}


export function buildMajorAttractions(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const destination = getRouteCities(tripIntent).destination;
  if (routeOption.id === "scenic") {
    return [
      `${destination} viewpoint circuit`,
      `${destination} sunrise/sunset stop`,
      "Hidden scenic halts",
    ];
  }
  if (routeOption.id === "adventure") {
    return [`${destination} terrain trail`, "Outdoor activity zone", "Creator route stop"];
  }
  if (routeOption.id === "budget") {
    return [`${destination} old market`, "Walkable local quarter", "Value activity cluster"];
  }
  return [`${destination} city highlight`, "Primary arrival zone", "Comfort stopover area"];
}


export function buildLocalFood(routeOption: TiyaRouteOption, tripIntent?: TiyaTripIntent) {
  const destination = getRouteCities(tripIntent).destination;
  if (routeOption.id === "budget") {
    return [`${destination} street food belt`, "Local breakfast stops", "Market snack trail"];
  }
  if (routeOption.id === "scenic") {
    return [`${destination} cafe viewpoints`, "Regional lunch halt", "Scenic tea/snack stop"];
  }
  return [`${destination} signature food stops`, "Reliable meal halt", "Local dessert/snack pick"];
}


export function buildLocalProducts(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const destination = getRouteCities(tripIntent).destination;
  return [
    `${destination} local market picks`,
    "Handicraft and souvenir stops",
    routeOption.id === "scenic" ? "Creator-recommended local goods" : "Regional specialty products",
  ];
}


export function buildHistoryGeography(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
) {
  const { origin, destination, stops } = getRouteCities(tripIntent);
  const viaText = stops.length ? ` through ${stops.join(", ")}` : "";

  return `This journey connects ${origin} with ${destination}${viaText}, combining ${routeOption.routeStyle || "regional movement"} with ${routeOption.difficulty || "route"} conditions. Tiya keeps geography, transfer time, risk and stop quality in view while shaping the final itinerary.`;
}


export type OverviewCard = {
  id: string;
  title: string;
  preview: string;
  detail: string;
  icon: typeof Info;
};


export function previewText(text: string) {
  const sentences = text
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean);
  const preview = sentences.slice(0, 2).join(". ");

  return preview ? `${preview}.` : "Tiya will refine this section with live destination intelligence.";
}


export function buildOverviewCards(
  routeOption: TiyaRouteOption,
  tripIntent?: TiyaTripIntent
): OverviewCard[] {
  const thingsToKeepInMind = buildThingsToKeepInMind(routeOption);
  const majorAttractions = buildMajorAttractions(routeOption, tripIntent);
  const localFood = buildLocalFood(routeOption, tripIntent);
  const localProducts = buildLocalProducts(routeOption, tripIntent);
  const brief = buildDestinationBrief(routeOption, tripIntent);
  const experience = buildRouteExperience(routeOption);
  const bestTime = buildBestTimeToVisit(routeOption, tripIntent);
  const historyGeography = buildHistoryGeography(routeOption, tripIntent);

  return [
    {
      id: "route-brief",
      title: "About this route",
      preview: previewText(brief),
      detail: `${brief} Route style, transfer choices and stop quality will remain editable once the workspace opens.`,
      icon: Info,
    },
    {
      id: "route-experience",
      title: "Travel experience",
      preview: previewText(experience),
      detail: `${experience} Tiya will balance scenic score ${routeOption.scenicScore}, comfort score ${routeOption.comfortScore}, budget fit ${routeOption.budgetFit}% and ${routeOption.riskLevel.toLowerCase()} risk while building the final day plan.`,
      icon: Info,
    },
    {
      id: "best-time",
      title: "Best time to visit",
      preview: previewText(bestTime),
      detail: `${bestTime} Live weather, seasonal closures, local events and transport reliability can replace this placeholder when API intelligence is connected.`,
      icon: Info,
    },
    {
      id: "travel-notes",
      title: "Important travel notes",
      preview: thingsToKeepInMind.slice(0, 3).join(" • "),
      detail: thingsToKeepInMind.join("\n"),
      icon: Info,
    },
    {
      id: "attractions",
      title: "Major attractions",
      preview: majorAttractions.slice(0, 3).join(" • "),
      detail: majorAttractions.join("\n"),
      icon: Info,
    },
    {
      id: "local-food",
      title: "Local food to try",
      preview: localFood.slice(0, 3).join(" • "),
      detail: localFood.join("\n"),
      icon: Info,
    },
    {
      id: "local-products",
      title: "Local products & markets",
      preview: localProducts.slice(0, 3).join(" • "),
      detail: localProducts.join("\n"),
      icon: Info,
    },
    {
      id: "history-geography",
      title: "History & geography",
      preview: previewText(historyGeography),
      detail: `${historyGeography} Future API data can enrich this with city history, terrain type, altitude, border/permit context, cultural zones and route-specific geography.`,
      icon: Info,
    },
  ];
}
