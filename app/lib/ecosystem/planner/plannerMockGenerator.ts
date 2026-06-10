import { generatePlannerBookingModules } from "./plannerBookingEngine";
import { generatePlannerBudget, getPlannerBudgetTotal } from "./plannerBudgetEngine";
import { generatePlannerCreatorPicks } from "./plannerCreatorEngine";
import { generatePlannerInsights } from "./plannerInsightEngine";
import { generatePlannerLocalMarketPicks } from "./plannerLocalMarketEngine";
import { generatePlannerRouteOptions } from "./plannerRouteEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaPriceBasis,
  TiyaRouteStop,
  TiyaSuggestion,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "./plannerTypes";

function parseNights(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 5;
  }

  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function getTripDayCount(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 4;
  }

  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

function formatDayDate(startDate: string, offset: number) {
  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return `Day ${offset + 1}`;
  }

  start.setDate(start.getDate() + offset);

  return start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getDestinationTheme(intent: TiyaTripIntent) {
  const text = `${intent.toCity} ${intent.travelStyle} ${intent.interests.join(" ")}`.toLowerCase();

  if (text.includes("ladakh")) return "Scenic";
  if (text.includes("kerala")) return intent.travelStyle === "Luxury" ? "Luxury" : "Slow";
  if (text.includes("uttarakhand") || text.includes("temple") || text.includes("spiritual")) return "Spiritual";
  if (text.includes("himachal") || text.includes("trek")) return "Adventure";
  if (intent.smartPreferences.preferScenicRoute) return "Scenic";
  if (intent.travelStyle === "Luxury") return "Luxury";
  if (intent.travelStyle === "Spiritual") return "Spiritual";
  if (intent.travelStyle === "Adventure") return "Adventure";
  return "Curated";
}

function makeTitle(intent: TiyaTripIntent) {
  const destination = intent.toCity.trim() || "Destination";
  const theme = getDestinationTheme(intent);

  if (intent.tripType === "Road trip loop") return `${theme} ${destination} Loop`;
  if (["Self-drive Car", "Bike", "EV"].includes(intent.transportMode)) {
    return `${theme} ${destination} Road Journey`;
  }
  if (intent.travelStyle === "Spiritual") return `Spiritual ${destination} Circuit`;
  if (intent.travelStyle === "Luxury") return `Luxury ${destination} Escape`;
  if (intent.travelStyle === "Adventure") return `Adventure ${destination} Plan`;

  return `${theme} ${destination} Trip`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getTravellerCount(intent: TiyaTripIntent) {
  return Math.max(1, intent.adults + intent.children + intent.seniors);
}

function nearestPracticalHub(destination: string) {
  const normalized = destination.toLowerCase();

  if (normalized.includes("manali")) return "Chandigarh";
  if (normalized.includes("ladakh") || normalized.includes("leh")) return "Leh";
  if (normalized.includes("goa")) return "Goa";
  if (normalized.includes("shimla")) return "Chandigarh";
  if (normalized.includes("rishikesh")) return "Dehradun";
  if (normalized.includes("mcleod") || normalized.includes("dharamshala")) {
    return "Dharamshala";
  }
  if (normalized.includes("kerala") || normalized.includes("munnar")) {
    return "Kochi";
  }

  return destination;
}

function providerFor(serviceType: string, destination: string) {
  const normalized = serviceType.toLowerCase();

  if (normalized.includes("flight")) return "TPL Smart Fare";
  if (normalized.includes("train")) return "TPL Rail Connect";
  if (normalized.includes("bus")) return "TPL Coach Select";
  if (normalized.includes("cab") || normalized.includes("transfer")) {
    return "TPL Verified Transfers";
  }
  if (
    normalized.includes("hotel") ||
    normalized.includes("homestay") ||
    normalized.includes("resort") ||
    normalized.includes("villa")
  ) {
    return `${destination} Stay Select`;
  }
  if (normalized.includes("food")) return "TPL Local Food Picks";

  return "TPL Experience Desk";
}

function priceBasisForService(serviceType: string): TiyaPriceBasis {
  const normalized = serviceType.toLowerCase();

  if (
    normalized.includes("hotel") ||
    normalized.includes("homestay") ||
    normalized.includes("resort") ||
    normalized.includes("villa")
  ) {
    return "per_night";
  }
  if (
    normalized.includes("cab") &&
    !normalized.includes("transfer") &&
    !normalized.includes("airport")
  ) {
    return "per_day";
  }
  if (normalized.includes("transfer")) return "per_transfer";
  if (normalized.includes("package")) return "per_package";
  if (normalized.includes("guide")) return "per_day";
  if (normalized.includes("permit") || normalized.includes("insurance")) {
    return "per_traveller";
  }
  if (normalized.includes("flight") || normalized.includes("train")) {
    return "per_traveller";
  }

  return "per_traveller";
}

function priceBasisForTimelineItem(
  item: TiyaTimelineItem,
  serviceType: string
): TiyaPriceBasis {
  const text =
    `${serviceType} ${item.title} ${item.description || ""}`.toLowerCase();

  if (/(airport|railway|pickup|drop|transfer|station)/.test(text)) {
    return "per_transfer";
  }

  if (/(local cab|driver|guide)/.test(text)) return "per_day";

  return priceBasisForService(serviceType);
}

function displayPriceLabel(unitPrice: number, basis: TiyaPriceBasis) {
  const price = `₹${unitPrice.toLocaleString("en-IN")}`;

  if (basis === "per_room_night") return `${price} per night`;
  if (basis === "per_night") return `${price} per night`;
  if (basis === "per_day") return `${price} per day`;
  if (basis === "per_transfer") return `${price} one-time`;
  if (basis === "per_group") return `${price} per group`;
  if (basis === "per_item") return `${price} per item`;
  if (basis === "per_package") return `${price} package estimate`;
  if (basis === "fixed") return `${price} one-time`;
  return `${price} per traveller`;
}

function serviceDetails({
  serviceType,
  title,
  origin,
  destination,
  hub,
  date,
  travellers,
  price,
}: {
  serviceType: string;
  title: string;
  origin: string;
  destination: string;
  hub: string;
  date: string;
  travellers: number;
  price: number;
}) {
  const normalized = serviceType.toLowerCase();

  if (normalized.includes("flight")) {
    return {
      airlineName: "TPL Smart Fare",
      flightNumber: "TPL-214",
      fromAirport: `${origin} Airport`,
      toAirport: `${hub} Airport`,
      departureTime: "09:30",
      arrivalTime: "12:05",
      duration: "2h 35m",
      travelDate: date,
      baggage: "15 kg check-in + 7 kg cabin",
      fare: `₹${price.toLocaleString("en-IN")}`,
      refundability: "Partially refundable",
      travellerCount: travellers,
    };
  }

  if (normalized.includes("train")) {
    return {
      trainName: `${origin} ${hub} Express`,
      trainNumber: "129-TPL",
      fromStation: `${origin} Junction`,
      toStation: `${hub} Station`,
      class: "AC Chair / Sleeper fit",
      departure: "08:10",
      arrival: "18:40",
      duration: "10h 30m",
      travelDate: date,
      fare: `₹${price.toLocaleString("en-IN")}`,
    };
  }

  if (
    normalized.includes("cab") ||
    normalized.includes("transfer") ||
    normalized.includes("ev")
  ) {
    return {
      cabType: normalized.includes("ev") ? "EV SUV" : "Private SUV",
      pickup: origin,
      drop: destination,
      time: "13:00",
      travelDate: date,
      distance: hub === destination ? "Local route" : `${hub} to ${destination}`,
      driverVehicleSummary: "Verified driver, AC vehicle, route buffer included",
      fareInclusions: "Fuel, toll guidance and standard waiting buffer",
      extraChargesNote: "Parking, permits and extended waiting billed if applicable",
    };
  }

  if (
    normalized.includes("hotel") ||
    normalized.includes("homestay") ||
    normalized.includes("resort") ||
    normalized.includes("villa")
  ) {
    return {
      hotelName: title,
      location: destination,
      checkIn: "14:00",
      checkOut: "11:00",
      stayDate: date,
      roomType: "Smart comfort room",
      mealPlan: "Breakfast included",
      rating: "4.2/5 estimated",
      amenities: ["Wi-Fi", "Breakfast", "Parking", "Heating/AC"],
      price: `₹${price.toLocaleString("en-IN")}`,
      cancellationSummary: "Free cancellation window subject to supplier rules",
    };
  }

  return {
    activityName: title,
    location: destination,
    duration: normalized.includes("food") ? "1.5 hours" : "2-3 hours",
    timing: "Flexible day slot",
    activityDate: date,
    inclusions: normalized.includes("food")
      ? ["Local recommendations", "Route-friendly timing"]
      : ["Entry guidance", "Local host support", "Timing buffer"],
    difficulty: normalized.includes("adventure") ? "Moderate" : "Easy",
    price: `₹${price.toLocaleString("en-IN")}`,
    cancellationSummary: "Flexible replacement before final booking",
  };
}

function serviceOptions({
  serviceType,
  title,
  origin,
  destination,
  hub,
  date,
  travellers,
  price,
}: {
  serviceType: string;
  title: string;
  origin: string;
  destination: string;
  hub: string;
  date: string;
  travellers: number;
  price: number;
}): TiyaTimelineItem["options"] {
  const normalized = serviceType.toLowerCase();
  const optionTitles = normalized.includes("flight")
    ? [
        `Budget flight from ${origin} to ${hub}`,
        `Faster flight from ${origin} to ${hub}`,
        `Premium flight from ${origin} to ${hub}`,
      ]
    : normalized.includes("train")
      ? [
          `Value train from ${origin} to ${hub}`,
          `Faster train connection to ${hub}`,
          `Premium rail class to ${hub}`,
        ]
      : normalized.includes("cab") ||
          normalized.includes("transfer") ||
          normalized.includes("ev")
        ? [
            `Sedan transfer to ${destination}`,
            `Private SUV transfer to ${destination}`,
            `Traveller transfer to ${destination}`,
          ]
        : normalized.includes("hotel") ||
            normalized.includes("homestay") ||
            normalized.includes("resort") ||
            normalized.includes("villa")
          ? [
              `Standard stay in ${destination}`,
              `Premium stay in ${destination}`,
              `Luxury stay in ${destination}`,
            ]
          : normalized.includes("food")
            ? [
                `${destination} local food trail`,
                `${destination} cafe stop`,
                `${destination} regional tasting`,
              ]
            : [
                `Basic sightseeing in ${destination}`,
                `Adventure combo in ${destination}`,
                `Private guided tour in ${destination}`,
              ];

  return optionTitles.map((optionTitle, index) => {
    const optionPrice = Math.max(500, price + (index - 1) * Math.round(price * 0.18));

    return {
      id: `${slug(title)}-option-${index + 1}`,
      title: optionTitle,
      description:
        index === 0
          ? "Value option with essentials covered."
          : index === 1
            ? "Best balanced option for comfort, timing and price."
            : "Upgrade option with stronger comfort and flexibility.",
      providerName: providerFor(serviceType, destination),
      price: optionPrice,
      currency: "INR",
      detailSummary: `${optionTitle} selected for ${travellers} traveller${travellers === 1 ? "" : "s"}.`,
      details: serviceDetails({
        serviceType,
        title: optionTitle,
        origin,
        destination,
        hub,
        date,
        travellers,
        price: optionPrice,
      }),
    };
  });
}

function transportItem(intent: TiyaTripIntent): TiyaTimelineItem {
  const destination = intent.toCity.trim() || "Destination";
  const origin = intent.fromCity.trim() || "Origin";
  const hub = nearestPracticalHub(destination);
  const travellers = getTravellerCount(intent);
  const baseTransportPrice = Math.max(
    1800,
    Math.round(getPlannerBudgetTotal(intent) * 0.14)
  );
  const enrichTransport = (item: TiyaTimelineItem): TiyaTimelineItem => ({
    ...item,
    unitPrice: item.price || baseTransportPrice,
    priceBasis: priceBasisForService(item.serviceType || "Transfer"),
    displayPriceLabel: displayPriceLabel(
      item.price || baseTransportPrice,
      priceBasisForService(item.serviceType || "Transfer")
    ),
    finalDestination: destination,
    providerName: providerFor(item.serviceType || "Transfer", destination),
    detailSummary:
      item.serviceType === "Flight"
        ? `Nearest practical airport route for ${destination} with transfer support.`
        : `${item.serviceType || "Transport"} option generated from ${origin} to ${destination}.`,
    details: serviceDetails({
      serviceType: item.serviceType || "Transfer",
      title: item.title,
      origin,
      destination,
      hub,
      date: item.date || intent.startDate,
      travellers,
    price: item.price || baseTransportPrice,
    }),
    options: serviceOptions({
      serviceType: item.serviceType || "Transfer",
      title: item.title,
      origin,
      destination,
      hub,
      date: item.date || intent.startDate,
      travellers,
      price: item.price || baseTransportPrice,
    }),
  });

  if (["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode)) {
    return enrichTransport({
      id: "transport-road",
      time: "07:00",
      title: `${origin} → ${destination} route segment`,
      location: intent.smartPreferences.preferScenicRoute
        ? "Scenic highway corridor"
        : "Primary route corridor",
      type: "transport",
      category: "Transport",
      serviceType:
        intent.transportMode === "EV"
          ? "EV Transfer"
          : intent.transportMode === "Cab"
            ? "Cab"
            : "Transfer",
      description: `${intent.transportMode} movement from ${origin} to ${destination}.`,
      from: origin,
      to: destination,
      date: intent.startDate,
      travellers,
      price: baseTransportPrice,
      currency: "INR",
      bookingStatus: "available",
    });
  }

  if (intent.transportMode === "Train") {
    return enrichTransport({
      id: "transport-train",
      time: "08:10",
      title: `Train from ${origin} to ${hub}`,
      location: `${origin} station`,
      type: "transport",
      category: "Transport",
      serviceType: "Train",
      description: `Train from ${origin} to nearest practical station for ${destination}.`,
      from: origin,
      to: hub,
      finalDestination: destination,
      date: intent.startDate,
      travellers,
      price: baseTransportPrice,
      currency: "INR",
      bookingStatus: "available",
    });
  }

  if (intent.transportMode === "Bus") {
    return enrichTransport({
      id: "transport-bus",
      time: "07:45",
      title: `Bus from ${origin} to ${destination}`,
      location: "Verified boarding point",
      type: "transport",
      category: "Transport",
      serviceType: "Bus",
      description: `Bus from ${origin} to ${destination} with verified boarding.`,
      from: origin,
      to: destination,
      date: intent.startDate,
      travellers,
      price: baseTransportPrice,
      currency: "INR",
      bookingStatus: "available",
    });
  }

  return enrichTransport({
    id: "transport-flight",
    time: "09:30",
    title: `Flight from ${origin} to ${hub}`,
    location: `${hub} airport`,
    type: "transport",
    category: "Transport",
    serviceType: "Flight",
    description: `Nearest practical airport route for ${destination}.`,
    from: origin,
    to: hub,
    finalDestination: destination,
    date: intent.startDate,
    travellers,
    price: baseTransportPrice,
    currency: "INR",
    bookingStatus: "available",
  });
}

function getActivityTitle(intent: TiyaTripIntent, day: number) {
  if (intent.travelStyle === "Luxury") {
    return day === 1 ? "Premium arrival experience" : "Curated luxury activity";
  }
  if (intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")) {
    return day === 1 ? "Acclimatisation walk" : "Adventure experience block";
  }
  if (intent.travelStyle === "Couple") {
    return day === 1 ? "Sunset orientation" : "Couple-friendly experience";
  }
  if (intent.interests.includes("Temples")) return day === 1 ? "Temple arrival circuit" : "Morning darshan route";
  if (intent.interests.includes("Food")) return day === 1 ? "Local food trail" : "Regional tasting route";
  if (intent.interests.includes("Culture")) return day === 1 ? "Heritage orientation" : "Museum and craft district";
  if (intent.interests.includes("Shopping")) return day === 1 ? "Market scan" : "Curated shopping lane";
  if (intent.interests.includes("Nature")) return day === 1 ? "Sunset nature point" : "Viewpoint and slow trail";
  return day === 1 ? "Neighbourhood orientation" : "Signature local experience";
}

type StaySegment = {
  city: string;
  startDay: number;
  endDay: number;
  nights: number;
};

function splitDestinationCities(destination: string) {
  const parts = destination
    .split(/\s*(?:\+|,|\/|\band\b|&)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : [destination.trim() || "Destination"];
}

function distributeNights(totalNights: number, cityCount: number) {
  const safeCityCount = Math.max(1, cityCount);
  const safeNights = Math.max(1, totalNights);
  const base = Math.floor(safeNights / safeCityCount);
  const remainder = safeNights % safeCityCount;

  return Array.from({ length: safeCityCount }, (_, index) =>
    Math.max(1, base + (index < remainder ? 1 : 0))
  );
}

function deriveStaySegments(destination: string, dayCount: number): StaySegment[] {
  const cities = splitDestinationCities(destination);
  const totalNights = Math.max(1, dayCount - 1);
  const nightBlocks = distributeNights(totalNights, cities.length);
  let startDay = 1;

  return cities.map((city, index) => {
    const nights = nightBlocks[index] || 1;
    const segment = {
      city,
      startDay,
      endDay: Math.min(dayCount, startDay + nights),
      nights,
    };

    startDay = segment.endDay;
    return segment;
  });
}

function segmentForDay(segments: StaySegment[], day: number): StaySegment {
  return (
    segments.find((segment) => day >= segment.startDay && day < segment.endDay) ||
    segments[segments.length - 1] || {
      city: "Destination",
      startDay: 1,
      endDay: Math.max(2, day),
      nights: 1,
    }
  );
}

function isSegmentStart(segments: StaySegment[], day: number) {
  return segments.find((segment) => segment.startDay === day);
}

function buildDepartureItem(intent: TiyaTripIntent, destination: string): TiyaTimelineItem {
  const origin = intent.fromCity.trim() || "Origin";
  const hub = nearestPracticalHub(destination);
  const travellers = getTravellerCount(intent);
  const price = Math.max(1400, Math.round(getPlannerBudgetTotal(intent) * 0.1));
  const serviceType =
    intent.transportMode === "Train"
      ? "Train"
      : intent.transportMode === "Bus"
        ? "Bus"
        : ["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode)
          ? "Transfer"
          : "Flight";
  const transportDestination =
    serviceType === "Flight" || serviceType === "Train" ? hub : destination;

  if (["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode)) {
    const priceBasis = priceBasisForService(serviceType);

    return {
      id: "transport-departure-road",
      time: intent.pace === "Relaxed" ? "10:30" : "08:00",
      title: `${destination} → ${origin} return route`,
      location: destination,
      type: "transport",
      category: "Transport",
      serviceType: "Transfer",
      description: `Return transfer from ${destination} to ${origin}.`,
      from: destination,
      to: origin,
      date: intent.endDate,
      travellers,
      durationDays: priceBasis === "per_day" ? 1 : undefined,
      unitPrice: price,
      priceBasis,
      displayPriceLabel: displayPriceLabel(price, priceBasis),
      price,
      currency: "INR",
      providerName: providerFor(serviceType, destination),
      detailSummary: `Return transfer from ${destination} to ${origin}.`,
      details: serviceDetails({
        serviceType,
        title: `${destination} → ${origin} return route`,
        origin: destination,
        destination: origin,
        hub: destination,
        date: intent.endDate,
        travellers,
        price,
      }),
      options: serviceOptions({
        serviceType,
        title: `${destination} → ${origin} return route`,
        origin: destination,
        destination: origin,
        hub: destination,
        date: intent.endDate,
        travellers,
        price,
      }),
      bookingStatus: "available",
    };
  }

  const priceBasis = priceBasisForService(serviceType);

  return {
    id: "transport-departure",
    time: intent.pace === "Relaxed" ? "12:00" : "09:30",
    title: `${serviceType} from ${transportDestination} to ${origin}`,
    location: transportDestination,
    type: "transport",
    category: "Transport",
    serviceType,
    description: `${serviceType} return from ${transportDestination} to ${origin}.`,
    from: transportDestination,
    to: origin,
    finalDestination: origin,
    date: intent.endDate,
    travellers,
    unitPrice: price,
    priceBasis,
    displayPriceLabel: displayPriceLabel(price, priceBasis),
    price,
    currency: "INR",
    providerName: providerFor(serviceType, destination),
    detailSummary: `${serviceType} return option with timing matched to checkout.`,
    details: serviceDetails({
      serviceType,
      title: `${serviceType} from ${transportDestination} to ${origin}`,
      origin: transportDestination,
      destination: origin,
      hub: transportDestination,
      date: intent.endDate,
      travellers,
      price,
    }),
    options: serviceOptions({
      serviceType,
      title: `${serviceType} from ${transportDestination} to ${origin}`,
      origin: transportDestination,
      destination: origin,
      hub: transportDestination,
      date: intent.endDate,
      travellers,
      price,
    }),
    bookingStatus: "available",
  };
}

function enrichItem(
  item: TiyaTimelineItem,
  intent: TiyaTripIntent,
  day: number,
  date: string,
  category: NonNullable<TiyaTimelineItem["category"]>,
  serviceType: string,
  priceShare: number
): TiyaTimelineItem {
  const origin = intent.fromCity.trim() || "Origin";
  const destination = intent.toCity.trim() || "Destination";
  const hub = nearestPracticalHub(destination);
  const travellers = getTravellerCount(intent);
  const price =
    item.price ?? Math.max(500, Math.round(getPlannerBudgetTotal(intent) * priceShare));
  const priceBasis = item.priceBasis || priceBasisForTimelineItem(item, serviceType);
  const from = item.from || (category === "Transport" ? origin : destination);
  const to = item.to || item.location || destination;
  const resolvedNights =
    item.nights ??
    (priceBasis === "per_room_night" || priceBasis === "per_night"
      ? 1
      : undefined);
  const resolvedDurationDays =
    item.durationDays ?? (priceBasis === "per_day" ? 1 : undefined);
  const unitPrice =
    item.unitPrice ??
    (priceBasis === "per_night" && item.price && resolvedNights && resolvedNights > 1
      ? Math.max(1, Math.round(item.price / resolvedNights))
      : price);

  return {
    ...item,
    category,
    serviceType,
    description:
      item.description ||
      `${item.title} for ${travellers} traveller${travellers === 1 ? "" : "s"} in ${item.location || destination}.`,
    from,
    to,
    finalDestination: destination,
    date,
    travellers,
    rooms: item.rooms ?? (priceBasis === "per_room_night" ? 1 : undefined),
    nights: resolvedNights,
    durationDays: resolvedDurationDays,
    unitPrice,
    priceBasis,
    displayPriceLabel:
      item.displayPriceLabel || displayPriceLabel(unitPrice, priceBasis),
    price: unitPrice,
    currency: "INR",
    providerName: item.providerName || providerFor(serviceType, destination),
    detailSummary:
      item.detailSummary ||
      `${serviceType} option generated from the planner search and selected route.`,
    details:
      item.details ||
      serviceDetails({
        serviceType,
        title: item.title,
        origin: from,
        destination: to,
        hub,
        date,
        travellers,
        price,
      }),
    options:
      item.options ||
      serviceOptions({
        serviceType,
        title: item.title,
        origin: from,
        destination: to,
        hub,
        date,
        travellers,
        price,
      }),
    bookingStatus: category === "Meals" ? "optional" : "available",
    id: item.id || `day-${day}-${serviceType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  };
}

function generateDays(intent: TiyaTripIntent, dayCount: number): TiyaDayPlan[] {
  const destination = intent.toCity.trim() || "Destination";
  const origin = intent.fromCity.trim() || "Origin";
  const hub = nearestPracticalHub(destination);
  const safeDayCount = Math.min(Math.max(dayCount, 1), 10);
  const staySegments = deriveStaySegments(destination, safeDayCount);
  const roadTrip = ["Self-drive Car", "Bike", "EV", "Cab"].includes(intent.transportMode);
  const fullTripCab = intent.transportMode === "Cab";
  const transferPrice = Math.max(1800, Math.round(getPlannerBudgetTotal(intent) * 0.08));
  const localCabRate = Math.max(1200, Math.round(getPlannerBudgetTotal(intent) * 0.045));

  return Array.from({ length: safeDayCount }, (_, index) => {
    const day = index + 1;
    const isFirstDay = day === 1;
    const isLastDay = day === safeDayCount;
    const activeSegment = segmentForDay(staySegments, day);
    const startedSegment = isSegmentStart(staySegments, day);
    const previousSegment = staySegments.find(
      (segment) => segment.endDay === day && segment.startDay < day
    );
    const city = roadTrip && isFirstDay
      ? `${origin} → ${activeSegment.city}`
      : activeSegment.city;
    const date = formatDayDate(intent.startDate, index);
    const segmentStayItems: TiyaTimelineItem[] =
      startedSegment && intent.stayPreference !== "No Stay Needed"
        ? [
            {
              id: `stay-${startedSegment.startDay}-${slug(startedSegment.city)}`,
              time: "14:00",
              title: `${intent.stayPreference} in ${startedSegment.city}`,
              location: startedSegment.city,
              type: "stay",
              category: "Stay",
              serviceType: intent.stayPreference,
              description: `Stay coverage in ${startedSegment.city} from Day ${startedSegment.startDay} to Day ${startedSegment.endDay}.`,
              from: startedSegment.city,
              to: startedSegment.city,
              finalDestination: destination,
              date,
              travellers: getTravellerCount(intent),
              rooms: 1,
              nights: startedSegment.nights,
              checkInDay: startedSegment.startDay,
              checkOutDay: startedSegment.endDay,
              checkInDate: formatDayDate(intent.startDate, startedSegment.startDay - 1),
              checkOutDate: formatDayDate(intent.startDate, startedSegment.endDay - 1),
              priceBasis: "per_night",
              currency: "INR",
              bookingStatus: "available",
            },
          ]
        : [];
    const localCabItems: TiyaTimelineItem[] =
      startedSegment && !fullTripCab
        ? [
            {
              id: `transport-${startedSegment.startDay}-${slug(startedSegment.city)}-local-cab`,
              time: intent.pace === "Relaxed" ? "09:45" : "08:30",
              title: `Local cab coverage in ${startedSegment.city}`,
              location: startedSegment.city,
              type: "transport",
              category: "Transport",
              serviceType: "Cab",
              cabKind: "local",
              description: `Local cab coverage for ${startedSegment.city} activity windows.`,
              from: startedSegment.city,
              to: startedSegment.city,
              finalDestination: destination,
              date,
              travellers: getTravellerCount(intent),
              unitPrice: localCabRate,
              price: localCabRate,
              priceBasis: "per_day",
              displayPriceLabel: displayPriceLabel(localCabRate, "per_day"),
              durationDays: Math.max(1, startedSegment.nights),
              coverageStartDay: startedSegment.startDay,
              coverageEndDay: startedSegment.endDay,
              coverageStartDate: formatDayDate(intent.startDate, startedSegment.startDay - 1),
              coverageEndDate: formatDayDate(intent.startDate, startedSegment.endDay - 1),
              currency: "INR",
              bookingStatus: "available",
            },
          ]
        : [];
    const fullTripCabItems: TiyaTimelineItem[] =
      isFirstDay && fullTripCab
        ? [
            {
              id: "transport-full-trip-cab",
              time: "07:00",
              title: `Full trip cab coverage for ${destination}`,
              location: destination,
              type: "transport",
              category: "Transport",
              serviceType: "Cab",
              cabKind: "full_trip",
              description: `Personal cab coverage from Day 1 to Day ${safeDayCount}.`,
              from: origin,
              to: destination,
              finalDestination: destination,
              date,
              travellers: getTravellerCount(intent),
              unitPrice: localCabRate,
              price: localCabRate,
              priceBasis: "per_day",
              displayPriceLabel: displayPriceLabel(localCabRate, "per_day"),
              durationDays: safeDayCount,
              coverageStartDay: 1,
              coverageEndDay: safeDayCount,
              coverageStartDate: formatDayDate(intent.startDate, 0),
              coverageEndDate: formatDayDate(intent.startDate, safeDayCount - 1),
              currency: "INR",
              bookingStatus: "available",
            },
          ]
        : [];
    const cityTransferItems: TiyaTimelineItem[] =
      previousSegment && startedSegment
        ? [
            {
              id: `transfer-${day}-${slug(previousSegment.city)}-${slug(startedSegment.city)}`,
              time: intent.pace === "Relaxed" ? "09:30" : "08:00",
              title: `Cab transfer from ${previousSegment.city} to ${startedSegment.city}`,
              location: startedSegment.city,
              type: "transport",
              category: "Transport",
              serviceType: "Cab",
              cabKind: "transfer",
              description: `Intercity transfer from ${previousSegment.city} to ${startedSegment.city}.`,
              from: previousSegment.city,
              to: startedSegment.city,
              finalDestination: destination,
              date,
              travellers: getTravellerCount(intent),
              unitPrice: transferPrice,
              price: transferPrice,
              priceBasis: "per_transfer",
              displayPriceLabel: displayPriceLabel(transferPrice, "per_transfer"),
              currency: "INR",
              bookingStatus: "available",
            },
          ]
        : [];
    const rawItems: TiyaTimelineItem[] =
      isFirstDay
        ? [
            ...(fullTripCab ? [] : [transportItem(intent)]),
            ...(hub !== activeSegment.city && !roadTrip
              ? [
                  {
                    id: `transfer-${day}-${slug(hub)}-${slug(activeSegment.city)}`,
                    time: "13:00",
                    title: `Cab transfer from ${hub} to ${activeSegment.city}`,
                    location: activeSegment.city,
                    type: "transport" as const,
                    category: "Transport" as const,
                    serviceType: "Cab",
                    cabKind: "transfer" as const,
                    description: `Airport or station pickup from ${hub} for ${activeSegment.city}.`,
                    from: hub,
                    to: activeSegment.city,
                    finalDestination: destination,
                    date,
                    travellers: getTravellerCount(intent),
                    unitPrice: transferPrice,
                    price: transferPrice,
                    priceBasis: "per_transfer" as const,
                    displayPriceLabel: displayPriceLabel(transferPrice, "per_transfer"),
                    currency: "INR" as const,
                    bookingStatus: "available" as const,
                  },
                ]
              : []),
            ...segmentStayItems,
            ...localCabItems,
            ...fullTripCabItems,
            {
              id: `activity-${day}`,
              time: "17:00",
              title: getActivityTitle(intent, day),
              location: activeSegment.city,
              type: "activity",
            },
            {
              id: `meal-${day}`,
              time: "20:00",
              title: intent.interests.includes("Food")
                ? `${activeSegment.city} local dinner trail`
                : "Dinner recommendation",
              location: activeSegment.city,
              type: "meal",
            },
          ]
        : isLastDay
          ? [
              ...(hub !== activeSegment.city && !roadTrip
                ? [
                    {
                      id: `transfer-return-${day}-${slug(activeSegment.city)}-${slug(hub)}`,
                      time: intent.pace === "Relaxed" ? "08:30" : "07:00",
                      title: `Cab transfer from ${activeSegment.city} to ${hub}`,
                      location: hub,
                      type: "transport" as const,
                      category: "Transport" as const,
                      serviceType: "Cab",
                      cabKind: "transfer" as const,
                      description: `Hotel pickup and transfer to ${hub} for return movement.`,
                      from: activeSegment.city,
                      to: hub,
                      finalDestination: origin,
                      date,
                      travellers: getTravellerCount(intent),
                      unitPrice: transferPrice,
                      price: transferPrice,
                      priceBasis: "per_transfer" as const,
                      displayPriceLabel: displayPriceLabel(transferPrice, "per_transfer"),
                      currency: "INR" as const,
                      bookingStatus: "available" as const,
                    },
                  ]
                : []),
              {
                id: `activity-${day}-checkout`,
                time: intent.pace === "Relaxed" ? "10:00" : "08:30",
                title:
                  intent.travelStyle === "Luxury"
                    ? "Leisure breakfast and checkout"
                    : `${activeSegment.city} final local window`,
                location: activeSegment.city,
                type: "activity",
              },
              {
                id: `meal-${day}`,
                time: "12:30",
                title: intent.interests.includes("Food")
                  ? "Final regional meal"
                  : "Flexible meal buffer",
                location: activeSegment.city,
                type: "meal",
              },
              buildDepartureItem(intent, activeSegment.city),
            ]
        : [
            ...cityTransferItems,
            ...segmentStayItems,
            ...localCabItems,
            {
              id: `activity-${day}-morning`,
              time: intent.pace === "Relaxed" ? "10:00" : "08:30",
              title: getActivityTitle(intent, day),
              location: activeSegment.city,
              type: "activity",
            },
            {
              id: `meal-${day}`,
              time: "13:00",
              title: intent.interests.includes("Food")
                  ? "Regional lunch pick"
                  : "Flexible meal buffer",
              location: activeSegment.city,
              type: "meal",
            },
            {
              id: `activity-${day}-evening`,
              time: "17:30",
              title: intent.smartPreferences.includeLocalMarket
                ? "Local market window"
                : "Easy evening exploration",
              location: activeSegment.city,
              type: "activity",
            },
          ];
    const items = rawItems.map((item) => {
      if (item.category) {
        const serviceType =
          item.serviceType ||
          (item.type === "transport"
            ? "Cab"
            : item.type === "stay"
              ? intent.stayPreference
              : item.type === "meal"
                ? "Local food"
                : "Sightseeing");
        const priceShare =
          item.type === "transport"
            ? 0.06
            : item.type === "stay"
              ? 0.12
              : item.type === "meal"
                ? 0.025
                : 0.055;

        return enrichItem(
          item,
          intent,
          day,
          date,
          item.category,
          serviceType,
          priceShare
        );
      }
      if (item.type === "stay") {
        return enrichItem(item, intent, day, date, "Stay", intent.stayPreference, 0.12);
      }
      if (item.type === "meal") {
        return enrichItem(item, intent, day, date, "Meals", "Local food", 0.025);
      }
      return enrichItem(
        item,
        intent,
        day,
        date,
        "Activities",
        intent.interests.includes("Trekking")
          ? "Adventure"
          : intent.interests.includes("Temples")
            ? "Spiritual"
            : intent.interests.includes("Shopping") ||
                intent.smartPreferences.includeLocalMarket
              ? "Shopping"
              : "Sightseeing",
        0.055
      );
    });

    return {
      id: `generated-day-${day}`,
      day,
      date,
      city,
      pace: intent.pace,
      headline:
        isFirstDay
          ? roadTrip
            ? `${origin} to ${activeSegment.city} arrival route`
            : `${intent.transportMode} arrival and ${intent.stayPreference.toLowerCase()} setup`
          : isLastDay
            ? `${activeSegment.city} leisure and departure`
          : `${activeSegment.city} ${intent.interests[0] || intent.travelStyle} plan`,
      notes:
        isFirstDay
          ? "Generated from the selected route, transport and stay preferences."
          : isLastDay
            ? "Departure timing and final experience are based on selected pace."
          : "Pacing and activity blocks are adjusted from selected interests.",
      items,
    };
  });
}

function generateRouteStops(intent: TiyaTripIntent, nights: number): TiyaRouteStop[] {
  const origin = intent.fromCity.trim() || "Origin";
  const destination = intent.toCity.trim() || "Destination";
  const dayCount = Math.max(2, nights + 1);
  const staySegments = deriveStaySegments(destination, dayCount);
  const midpoint =
    intent.tripType === "Multi-city"
      ? "Smart mid-route stop"
      : intent.smartPreferences.preferScenicRoute
        ? "Scenic waypoint"
        : destination;

  if (staySegments.length > 1 || intent.tripType === "One-way route") {
    return [
      { city: origin, nights: 0, transfer: `${intent.transportMode} departure` },
      ...staySegments.map((segment) => ({
        city: segment.city,
        nights: segment.nights,
        transfer: `${intent.stayPreference} base`,
      })),
    ];
  }

  return [
    { city: origin, nights: 0, transfer: `${intent.transportMode} departure` },
    { city: midpoint, nights: Math.max(1, Math.floor(nights / 2)), transfer: intent.tripType },
    { city: destination, nights: Math.max(1, Math.ceil(nights / 2)), transfer: `${intent.pace} destination stay` },
    { city: origin, nights: 0, transfer: `${intent.transportMode} return alignment` },
  ];
}

function generateSuggestions(intent: TiyaTripIntent, totalBudget: number): TiyaSuggestion[] {
  const destination = intent.toCity.trim() || "Destination";
  const stayPrice = Math.round(totalBudget * 0.11);
  const transportPrice = Math.round(totalBudget * 0.18);
  const activityPrice = Math.round(totalBudget * 0.08);
  const activityTitle = intent.interests.includes("Trekking")
    ? `${destination} guided trekking slot`
    : intent.interests.includes("Temples")
      ? `${destination} temple route assist`
      : intent.smartPreferences.includeCreatorSpots
        ? `${destination} creator spot trail`
        : intent.smartPreferences.includeLocalMarket
          ? `${destination} local market walk`
          : `${destination} signature experience`;

  return [
    {
      id: "dynamic-stay",
      category: "Stay",
      title:
        intent.stayPreference === "No Stay Needed"
          ? "Day-use refresh base"
          : `${destination} ${intent.stayPreference}`,
      detail: `${intent.travelStyle} fit with ${intent.pace.toLowerCase()} pacing and route access.`,
      price: intent.stayPreference === "No Stay Needed" ? "On demand" : `From ₹${stayPrice.toLocaleString("en-IN")}`,
      fit: intent.stayPreference === "No Stay Needed" ? "76% fit" : "91% fit",
    },
    {
      id: "dynamic-activity",
      category: "Activity",
      title: activityTitle,
      detail: `Built from ${intent.interests.slice(0, 3).join(", ") || "selected"} interests.`,
      price: `₹${activityPrice.toLocaleString("en-IN")} estimate`,
      fit: "89% fit",
    },
    {
      id: "dynamic-transport",
      category: "Transport",
      title: `${intent.transportMode} route plan`,
      detail: intent.smartPreferences.avoidNightTravel
        ? "Avoids late-night movement and keeps transfer buffers visible."
        : "Optimises transfer timing around selected pace.",
      price: `₹${transportPrice.toLocaleString("en-IN")} estimate`,
      fit: "94% fit",
    },
  ];
}

export function generateSmartPlannerMock(intent: TiyaTripIntent): TiyaGeneratedPlan {
  const nights = parseNights(intent.startDate, intent.endDate);
  const dayCount = getTripDayCount(intent.startDate, intent.endDate);
  const budgetLines = generatePlannerBudget(intent);
  const totalBudget = getPlannerBudgetTotal(intent);
  const travellerCount = intent.adults + intent.children + intent.seniors;
  const title = makeTitle(intent);

  return {
    title,
    subtitle: `${intent.fromCity || "Origin"} → ${intent.toCity || "Destination"} · ${nights} Nights · ${travellerCount} Travellers · ${intent.transportMode} · ${intent.budgetTier}`,
    routeTitle: `${intent.fromCity || "Origin"} → ${intent.toCity || "Destination"}`,
    nights,
    travellerCount,
    routeStops: generateRouteStops(intent, nights),
    days: generateDays(intent, dayCount),
    suggestions: generateSuggestions(intent, totalBudget),
    budgetLines,
    totalBudget,
    insights: generatePlannerInsights(intent),
    routeOptions: generatePlannerRouteOptions(intent),
    bookingModules: generatePlannerBookingModules(intent),
    creatorPicks: generatePlannerCreatorPicks(intent),
    localMarketPicks: generatePlannerLocalMarketPicks(intent),
  };
}
