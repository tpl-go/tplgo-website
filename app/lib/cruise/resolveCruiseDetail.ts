import { cruiseResultsSeed } from "@/app/lib/cruise/cruiseResultData";
import { cruiseDeckPlansSeed } from "@/app/lib/cruise/cruiseDeckPlanData";
import type { CruiseDeckPlan } from "@/app/lib/cruise/cruiseDetailTypes";

export type CruiseDetailResolved = {
  cruiseId: string;
  title: string;
  tripLabel: string;
  cruiseLine: string;
  shipName: string;
  departurePort: string;
  arrivalPort: string;
  durationNights: number;
  durationLabel: string;
  route: string;
  mapImage: string;
  media: string[];
  taxesText: string;
  sailingDateId: string | null;
  sailingDate: string | null;
  rates: {
    inside?: number;
    outside?: number;
    balcony?: number;
    suite?: number;
  };
  startingPrice: number;
  overview: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
    dateLabel?: string;
  }[];
  policies: {
    id: string;
    title: string;
    description: string;
  }[];

  videoUrl?: string;
  cruiseHighlights?: string[];
  routeMap?: {
    name: string;
    lat: number;
    lng: number;
    day?: string;
  }[];
  diningHighlights?: string[];
  entertainmentHighlights?: string[];
  deckPlans?: CruiseDeckPlan[];
  cruiseInfoBlocks?: {
    title: string;
    value: string;
  }[];
};

type SelectedSailingPayload = {
  cruiseId: string;
  title: string;
  tripLabel: string;
  cruiseLine: string;
  shipName: string;
  departurePort: string;
  arrivalPort: string;
  durationNights: number;
  mapImage: string;
  taxesText: string;
  sailingDateId: string;
  sailingDate: string;
  rates: {
    inside?: number;
    outside?: number;
    balcony?: number;
    suite?: number;
  };
};

function buildFallbackItinerary(
  departurePort: string,
  arrivalPort: string,
  durationNights: number,
  sailingDate?: string | null
) {
  const totalDays = durationNights + 1;
  const baseDate = sailingDate ? new Date(sailingDate) : null;

  return Array.from({ length: totalDays }).map((_, index) => {
    const day = index + 1;
    const dateLabel = baseDate
      ? new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      : undefined;

    if (day === 1) {
      return {
        day,
        title: `${departurePort} Embarkation`,
        description: `Board your cruise from ${departurePort}. Complete check-in, explore the ship, enjoy welcome experiences, and begin your sailing journey.`,
        dateLabel,
      };
    }

    if (day === totalDays) {
      return {
        day,
        title: `${arrivalPort} Arrival`,
        description: `Arrive at ${arrivalPort}. Disembark after onboard breakfast and complete your cruise journey.`,
        dateLabel,
      };
    }

    return {
      day,
      title: `Cruising Day ${day - 1}`,
      description:
        "Enjoy onboard dining, entertainment, sea views, activities, deck experiences, and leisure facilities throughout the day.",
      dateLabel,
    };
  });
}

function buildFallbackPolicies() {
  return [
    {
      id: "deposit",
      title: "Deposit & Payment Policy",
      description:
        "Selected fares may require an upfront deposit. Full payment timelines depend on the sailing date and fare conditions.",
    },
    {
      id: "cancellation",
      title: "Cancellation Policy",
      description:
        "Cancellation charges may apply based on fare category, promotional conditions, and departure timeline.",
    },
    {
      id: "documents",
      title: "Travel Documents",
      description:
        "Valid government ID, passport, visa, and supporting travel documents may be required depending on the route and guest nationality.",
    },
    {
      id: "checkin",
      title: "Check-in & Boarding Policy",
      description:
        "Guests should reach the port before reporting time. Boarding may close before departure as per cruise line rules.",
    },
  ];
}

function getStartingPrice(rates: {
  inside?: number;
  outside?: number;
  balcony?: number;
  suite?: number;
}) {
  const prices = [
    Number(rates.inside || 0),
    Number(rates.outside || 0),
    Number(rates.balcony || 0),
    Number(rates.suite || 0),
  ].filter((price) => price > 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
}

function buildMediaFromImage(image: string) {
  return [image, image, image, image, image];
}

function buildFallbackCruiseHighlights(
  cruiseLine: string,
  shipName: string,
  departurePort: string,
  arrivalPort: string
) {
  return [
    `${shipName} by ${cruiseLine}`,
    `Sailing from ${departurePort}`,
    `Arrival at ${arrivalPort}`,
    "Dining, entertainment & sea-view experiences onboard",
  ];
}

function buildFallbackRouteMap(
  departurePort: string,
  arrivalPort: string,
  durationNights: number
) {
  const samePort = departurePort.toLowerCase() === arrivalPort.toLowerCase();

  if (samePort) {
    return [
      { name: departurePort, lat: 25.2048, lng: 55.2708, day: "Day 1" },
      { name: "Cruising", lat: 24.9, lng: 55.0, day: "Day 2" },
      {
        name: arrivalPort,
        lat: 25.2048,
        lng: 55.2708,
        day: `Day ${durationNights + 1}`,
      },
    ];
  }

  return [
    { name: departurePort, lat: 25.2048, lng: 55.2708, day: "Day 1" },
    { name: "Cruising", lat: 24.9, lng: 55.0, day: "Mid Sailing" },
    {
      name: arrivalPort,
      lat: 24.4667,
      lng: 54.3667,
      day: `Day ${durationNights + 1}`,
    },
  ];
}

function buildFallbackDiningHighlights() {
  return [
    "Multi-cuisine dining venues available onboard",
    "Buffet, specialty dining and curated meal experiences",
    "Dining schedule may vary by sailing and ship operations",
  ];
}

function buildFallbackEntertainmentHighlights() {
  return [
    "Live shows and stage performances onboard",
    "Deck activities and family entertainment zones",
    "Evening music, leisure and recreation experiences",
  ];
}

function buildFallbackCruiseInfoBlocks(
  cruiseLine: string,
  shipName: string,
  departurePort: string,
  arrivalPort: string,
  sailingDate?: string | null
) {
  return [
    { title: "Cruise Line", value: cruiseLine },
    { title: "Ship", value: shipName },
    { title: "Departure Port", value: departurePort },
    { title: "Arrival Port", value: arrivalPort },
    { title: "Sailing Date", value: sailingDate || "On Request" },
  ];
}

function buildFallbackVideoUrl() {
  return "";
}

function buildResolvedDeckPlans(): CruiseDeckPlan[] {
  return cruiseDeckPlansSeed.map((deck) => ({
    ...deck,
    selectionAvailable: deck.selectionAvailable ?? false,
    cabins: Array.isArray(deck.cabins) ? deck.cabins : [],
  }));
}

export function resolveCruiseDetailFromSelection(
  cruiseId: string,
  selectedDate?: string | null
): CruiseDetailResolved | null {
  if (typeof window === "undefined") return null;

  const normalizedCruiseId =
    typeof cruiseId === "string" ? cruiseId.trim() : "";

  if (!normalizedCruiseId) return null;

  let payload: SelectedSailingPayload | null = null;

  try {
    const raw = sessionStorage.getItem("tpl_cruise_selected_sailing");
    payload = raw ? (JSON.parse(raw) as SelectedSailingPayload) : null;
  } catch {
    payload = null;
  }

  const fromSelection =
    payload && payload.cruiseId === normalizedCruiseId ? payload : null;

  if (fromSelection) {
    const resolvedSailingDate = selectedDate || fromSelection.sailingDate;
    const startingPrice = getStartingPrice(fromSelection.rates);

    return {
      cruiseId: normalizedCruiseId,
      title: fromSelection.title,
      tripLabel: fromSelection.tripLabel,
      cruiseLine: fromSelection.cruiseLine,
      shipName: fromSelection.shipName,
      departurePort: fromSelection.departurePort,
      arrivalPort: fromSelection.arrivalPort,
      durationNights: fromSelection.durationNights,
      durationLabel: `${fromSelection.durationNights}N/${fromSelection.durationNights + 1}D`,
      route: `${fromSelection.departurePort} - Cruising - ${fromSelection.arrivalPort}`,
      mapImage: fromSelection.mapImage,
      media: buildMediaFromImage(fromSelection.mapImage),
      taxesText: fromSelection.taxesText,
      sailingDateId: fromSelection.sailingDateId,
      sailingDate: resolvedSailingDate,
      rates: fromSelection.rates,
      startingPrice,
      overview: `${fromSelection.shipName} by ${fromSelection.cruiseLine} offers a premium cruise experience with route-based sailings, curated dining, onboard entertainment, and sea-view leisure experiences.`,
      itinerary: buildFallbackItinerary(
        fromSelection.departurePort,
        fromSelection.arrivalPort,
        fromSelection.durationNights,
        resolvedSailingDate
      ),
      policies: buildFallbackPolicies(),
      videoUrl: buildFallbackVideoUrl(),
      cruiseHighlights: buildFallbackCruiseHighlights(
        fromSelection.cruiseLine,
        fromSelection.shipName,
        fromSelection.departurePort,
        fromSelection.arrivalPort
      ),
      routeMap: buildFallbackRouteMap(
        fromSelection.departurePort,
        fromSelection.arrivalPort,
        fromSelection.durationNights
      ),
      diningHighlights: buildFallbackDiningHighlights(),
      entertainmentHighlights: buildFallbackEntertainmentHighlights(),
      deckPlans: buildResolvedDeckPlans(),
      cruiseInfoBlocks: buildFallbackCruiseInfoBlocks(
        fromSelection.cruiseLine,
        fromSelection.shipName,
        fromSelection.departurePort,
        fromSelection.arrivalPort,
        resolvedSailingDate
      ),
    };
  }

  const seed =
    cruiseResultsSeed.find((item) => item.id === normalizedCruiseId) ||
    cruiseResultsSeed.find((item) => normalizedCruiseId.startsWith(item.id));

  if (!seed) return null;

  const selectedSailing =
    seed.sailingDates?.find((row) => row.date === selectedDate) ||
    seed.sailingDates?.find((row) => row.id === selectedDate) ||
    seed.sailingDates?.[0];

  const resolvedSailingDate = selectedDate || selectedSailing?.date || null;

  const fallbackRates = {
    inside: selectedSailing?.inside ?? seed.lowestRates.inside,
    outside: selectedSailing?.outside ?? seed.lowestRates.outside,
    balcony: selectedSailing?.balcony ?? seed.lowestRates.balcony,
    suite: selectedSailing?.suite ?? seed.lowestRates.suite,
  };

  return {
    cruiseId: normalizedCruiseId,
    title: seed.title,
    tripLabel: seed.tripLabel,
    cruiseLine: seed.cruiseLine,
    shipName: seed.shipName,
    departurePort: seed.departurePort,
    arrivalPort: seed.arrivalPort,
    durationNights: seed.durationNights,
    durationLabel: `${seed.durationNights}N/${seed.durationNights + 1}D`,
    route: `${seed.departurePort} - Cruising - ${seed.arrivalPort}`,
    mapImage: seed.mapImage,
    media: buildMediaFromImage(seed.mapImage),
    taxesText: seed.taxesText,
    sailingDateId: selectedSailing?.id ?? null,
    sailingDate: resolvedSailingDate,
    rates: fallbackRates,
    startingPrice: getStartingPrice(fallbackRates),
    overview: `${seed.shipName} by ${seed.cruiseLine} offers a premium cruise experience with route-based sailings, curated dining, onboard entertainment, and sea-view leisure experiences.`,
    itinerary: buildFallbackItinerary(
      seed.departurePort,
      seed.arrivalPort,
      seed.durationNights,
      resolvedSailingDate
    ),
    policies: buildFallbackPolicies(),
    videoUrl: buildFallbackVideoUrl(),
    cruiseHighlights: buildFallbackCruiseHighlights(
      seed.cruiseLine,
      seed.shipName,
      seed.departurePort,
      seed.arrivalPort
    ),
    routeMap: buildFallbackRouteMap(
      seed.departurePort,
      seed.arrivalPort,
      seed.durationNights
    ),
    diningHighlights: buildFallbackDiningHighlights(),
    entertainmentHighlights: buildFallbackEntertainmentHighlights(),
    deckPlans: buildResolvedDeckPlans(),
    cruiseInfoBlocks: buildFallbackCruiseInfoBlocks(
      seed.cruiseLine,
      seed.shipName,
      seed.departurePort,
      seed.arrivalPort,
      resolvedSailingDate
    ),
  };
}