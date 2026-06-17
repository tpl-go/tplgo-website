import type {
  TiyaBookingModule,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";
import { packageSeeds } from "@/app/data/packages/packageSeeds";
import { savePackageSelectionState } from "@/app/lib/packages/packageSelectionStorage";
import type { PackageSelectionState } from "@/app/lib/packages/packageSelectionTypes";

export type TiyaBookingBridgeService =
  | "Flights"
  | "Hotels"
  | "Homestays"
  | "Packages"
  | "Activities"
  | "Insurance"
  | "Local Transport"
  | "Local Market";

export type TiyaBookingBridgeItem = {
  id: string;
  service: TiyaBookingBridgeService;
  title: string;
  readiness: "Ready" | "Recommended" | "Review" | "Optional";
  statusText: string;
  cta: string;
  href: string;
  payload: Record<string, string | number | boolean>;
  isPrimary: boolean;
};

export type TiyaItineraryBookingStatus = {
  dayId: string;
  dayLabel: string;
  city: string;
  bookingReadyStatus: string;
  transportReadiness: number;
  stayReadiness: number;
  insuranceReadiness: number;
  packageReadiness: number;
  primaryCta: string;
};

export const TIYA_SMART_BASKET_DRAFT_KEY = "tpl_tiya_smart_basket_draft";
export const TIYA_CUSTOM_PACKAGE_DRAFT_KEY = "tpl_tiya_custom_package_draft";

export type TiyaSmartBasketServiceType =
  | "flight"
  | "hotel"
  | "cab"
  | "activity"
  | "package";

export type TiyaSmartBasketItem = {
  bookingType: string;
  serviceId: string;
  serviceName: string;
  selectedOption: string;
  estimatedPrice: number;
  dayLabel?: string;
  city?: string;
  time?: string;
};

export type TiyaSmartBasketRouteResult = {
  route: string;
  serviceType: TiyaSmartBasketServiceType;
  isCustomPackage: boolean;
  draftId: string;
};

function getNights(intent: TiyaTripIntent) {
  const start = new Date(intent.startDate);
  const end = new Date(intent.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 4;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function isTransportService(intent: TiyaTripIntent, service: TiyaBookingBridgeService) {
  if (service === "Flights") return intent.transportMode === "Flight" || intent.transportMode === "Mixed Mode";
  if (service === "Local Transport") {
    return ["Cab", "Self-drive Car", "EV", "Bike", "Mixed Mode"].includes(intent.transportMode);
  }
  return false;
}

function hrefForService(service: TiyaBookingBridgeService) {
  const hrefs: Record<TiyaBookingBridgeService, string> = {
    Flights: "/flights",
    Hotels: "/hotels/results",
    Homestays: "/homestays/results",
    Packages: "/holidays",
    Activities: "/explore",
    Insurance: "/insurance/results",
    "Local Transport": "/cab/result",
    "Local Market": "/local-life",
  };

  return hrefs[service];
}

function ctaForService(service: TiyaBookingBridgeService) {
  const labels: Record<TiyaBookingBridgeService, string> = {
    Flights: "View Flights",
    Hotels: "View Hotels",
    Homestays: "View Homestays",
    Packages: "View Packages",
    Activities: "View Activities",
    Insurance: "Add Insurance",
    "Local Transport": "Book Route",
    "Local Market": "View Local Life",
  };

  return labels[service];
}

function buildPayload(intent: TiyaTripIntent, service: TiyaBookingBridgeService) {
  return {
    source: "tiya-smart-planner",
    from: intent.fromCity,
    to: intent.toCity,
    startDate: intent.startDate,
    endDate: intent.endDate,
    travellers: intent.adults + intent.children + intent.seniors,
    transportMode: intent.transportMode,
    stayPreference: intent.stayPreference,
    budgetTier: intent.budgetTier,
    nights: getNights(intent),
    service,
  };
}

export function generateBookingBridgeItems({
  intent,
  plan,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}): TiyaBookingBridgeItem[] {
  const modules = Array.isArray(plan.bookingModules) ? plan.bookingModules : [];
  const moduleByName = modules.reduce<Record<string, TiyaBookingModule>>(
    (acc, module) => {
      acc[module.serviceName.toLowerCase()] = module;
      return acc;
    },
    {}
  );
  const localMarketFit =
    intent.smartPreferences.includeLocalMarket ||
    intent.interests.includes("Local Market") ||
    intent.interests.includes("Shopping");
  const creatorFit =
    intent.smartPreferences.includeCreatorSpots ||
    intent.interests.includes("Creator Spots");
  const services: TiyaBookingBridgeService[] = [
    "Flights",
    "Hotels",
    "Homestays",
    "Packages",
    "Activities",
    "Insurance",
    "Local Transport",
    "Local Market",
  ];

  return services.map((service) => {
    const serviceKey = service.toLowerCase();
    const matchingModule =
      moduleByName[serviceKey] ||
      moduleByName[service === "Activities" ? "activities/experiences" : serviceKey];
    const transportPrimary = isTransportService(intent, service);
    const stayPrimary =
      (service === "Hotels" && intent.stayPreference === "Hotel") ||
      (service === "Homestays" && intent.stayPreference === "Homestay");
    const packagePrimary =
      service === "Packages" &&
      (intent.tripType === "Multi-city" ||
        intent.travelStyle === "Family" ||
        intent.travelStyle === "Luxury");
    const insurancePrimary =
      service === "Insurance" &&
      (intent.smartPreferences.includeInsurance || selectedRoute?.riskLevel === "High");
    const marketPrimary = service === "Local Market" && (localMarketFit || creatorFit);
    const activityPrimary =
      service === "Activities" &&
      intent.interests.some((interest) =>
        ["Food", "Culture", "Nature", "Trekking", "Temples", "Nightlife"].includes(interest)
      );
    const isPrimary =
      transportPrimary ||
      stayPrimary ||
      packagePrimary ||
      insurancePrimary ||
      marketPrimary ||
      activityPrimary;

    return {
      id: service.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      service,
      title:
        service === "Flights"
          ? `Flight search: ${intent.fromCity} to ${intent.toCity}`
          : service === "Local Transport"
            ? `${intent.transportMode} route transfer`
            : `${service} for ${intent.toCity}`,
      readiness: isPrimary
        ? "Ready"
        : matchingModule?.readiness === "Optional"
          ? "Optional"
          : service === "Insurance" && selectedRoute?.riskLevel === "High"
            ? "Review"
            : "Recommended",
      statusText:
        matchingModule?.reason ||
        `${service} can be opened from this planner with simulated trip context.`,
      cta: ctaForService(service),
      href: hrefForService(service),
      payload: buildPayload(intent, service),
      isPrimary,
    };
  });
}

export function generateItineraryBookingStatuses({
  days,
  intent,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
}): TiyaItineraryBookingStatus[] {
  const safeDays = Array.isArray(days) ? days : [];
  const transportBase =
    intent.transportMode === "Flight" || intent.transportMode === "Mixed Mode"
      ? 88
      : ["Cab", "Self-drive Car", "EV", "Bike"].includes(intent.transportMode)
        ? 82
        : 76;
  const stayBase = intent.smartPreferences.includeStays ? 86 : 58;
  const insuranceBase = intent.smartPreferences.includeInsurance ? 90 : 52;
  const packageBase =
    intent.tripType === "Multi-city" || intent.travelStyle === "Family" ? 84 : 68;

  return safeDays.map((day) => ({
    dayId: day.id,
    dayLabel: `Day ${day.day}`,
    city: day.city,
    bookingReadyStatus:
      day.pace === "Packed" ? "Package recommended" : "Segment ready",
    transportReadiness: Math.min(96, transportBase + (day.day % 2) * 4),
    stayReadiness: Math.min(96, stayBase + (day.pace === "Relaxed" ? 6 : 0)),
    insuranceReadiness: insuranceBase,
    packageReadiness: Math.min(96, packageBase + (day.pace === "Packed" ? 8 : 0)),
    primaryCta: day.pace === "Packed" ? "Book this package" : "Book this segment",
  }));
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function writeSessionPayload(key: string, payload: unknown) {
  if (!canUseStorage()) return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Storage can fail in private mode or quota-limited browsers.
  }
}

function safeDate(value?: string) {
  if (!value) {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString();
}

function safeDateOnly(value?: string) {
  return safeDate(value).split("T")[0];
}

function basketText(items: TiyaSmartBasketItem[]) {
  return items
    .map((item) => `${item.bookingType} ${item.serviceName} ${item.selectedOption}`)
    .join(" ")
    .toLowerCase();
}

function inferSingleServiceType(
  items: TiyaSmartBasketItem[]
): TiyaSmartBasketServiceType {
  const rawTypes = Array.from(
    new Set(items.map((item) => item.bookingType.toLowerCase()))
  );
  const text = basketText(items);
  const hasStay = rawTypes.some((type) => type.includes("stay") || type.includes("hotel"));
  const hasActivity = rawTypes.some(
    (type) => type.includes("activity") || type.includes("experience") || type.includes("meal")
  );
  const hasCab =
    rawTypes.some((type) => type.includes("cab") || type.includes("transfer")) ||
    /(cab|transfer|self-drive|self drive|road|suv|ev|local transport)/i.test(text);
  const hasFlight =
    rawTypes.some((type) => type.includes("flight") || type.includes("transport")) ||
    /(flight|airline|airport|train|transport)/i.test(text);

  if (hasStay) return "hotel";
  if (hasActivity) return "activity";
  if (hasCab) return "cab";
  if (hasFlight) return "flight";

  return "package";
}

function getBasketServiceTypes(items: TiyaSmartBasketItem[]) {
  return Array.from(
    new Set(
      items.map((item) => inferSingleServiceType([item]))
    )
  );
}

function buildDraftId(intent: TiyaTripIntent) {
  return `tiya_basket_${intent.fromCity}_${intent.toCity}_${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function buildFlightRoute(intent: TiyaTripIntent) {
  const params = new URLSearchParams({
    tripType: "oneway",
    fareType: "Regular",
    adults: String(Math.max(1, intent.adults || 1)),
    children: String(Math.max(0, intent.children || 0)),
    infants: "0",
    cabin: "Economy",
    from: intent.fromCity || "Origin",
    fromCity: intent.fromCity || "Origin",
    to: intent.toCity || "Destination",
    toCity: intent.toCity || "Destination",
    departure: safeDate(intent.startDate),
    returnDate: "",
  });

  return `/flights?${params.toString()}`;
}

function buildHotelRoute(intent: TiyaTripIntent) {
  const params = new URLSearchParams({
    city: intent.toCity || "Destination",
    checkIn: safeDateOnly(intent.startDate),
    checkOut: safeDateOnly(intent.endDate || intent.startDate),
    rooms: "1",
    adults: String(Math.max(1, intent.adults || 1)),
    price: intent.budgetTier || "",
  });

  return `/hotels/results?${params.toString()}`;
}

function buildCabRoute(intent: TiyaTripIntent) {
  const params = new URLSearchParams({
    rideType: "outstationOneWay",
    from: intent.fromCity || "Origin",
    to: intent.toCity || "Destination",
    departureDate: safeDateOnly(intent.startDate),
    pickupDate: safeDateOnly(intent.startDate),
    pickupTime: "10:00 AM",
  });

  return `/cab/result?${params.toString()}`;
}

function pickPackageSlug(intent: TiyaTripIntent) {
  const destination = intent.toCity.toLowerCase();
  const style = intent.travelStyle.toLowerCase();
  const interestText = intent.interests.join(" ").toLowerCase();
  const matchedByCity = packageSeeds.find((pkg) =>
    pkg.cities.some((city) => destination.includes(city.toLowerCase()))
  );
  const matchedByTheme = packageSeeds.find((pkg) =>
    `${pkg.theme} ${pkg.subTheme || ""}`.toLowerCase().includes(style)
  );
  const matchedByInterest = packageSeeds.find((pkg) =>
    `${pkg.theme} ${pkg.subTheme || ""} ${pkg.title}`
      .toLowerCase()
      .split(/\s+/)
      .some((token) => interestText.includes(token))
  );

  return (
    matchedByCity?.slug ||
    matchedByTheme?.slug ||
    matchedByInterest?.slug ||
    "heritage-india-historical-monuments"
  );
}

function buildPackageSelectionState(
  items: TiyaSmartBasketItem[],
  basePrice: number
): PackageSelectionState {
  const safeBasePrice = Math.max(0, Math.round(basePrice || 0));

  return {
    basePrice: safeBasePrice,
    selectedFlights: items
      .filter((item) => inferSingleServiceType([item]) === "flight")
      .map((item) => ({
        id: item.serviceId,
        airline: item.selectedOption,
        from: item.city,
        to: item.city,
        departureTime: item.time,
        fareDiff: 0,
        included: true,
      })),
    selectedHotels: items
      .filter((item) => inferSingleServiceType([item]) === "hotel")
      .map((item) => ({
        id: item.serviceId,
        hotelName: item.selectedOption,
        city: item.city || "",
        roomType: "Smart Planner selected stay",
        mealPlan: "As per itinerary",
        starRating: 4,
        nights: 1,
        fareDiff: 0,
        included: true,
      })),
    selectedTransfers: items
      .filter((item) => inferSingleServiceType([item]) === "cab")
      .map((item) => ({
        id: item.serviceId,
        vehicleType: "Smart transfer",
        title: item.selectedOption,
        subtitle: item.city || item.dayLabel,
        fareDiff: 0,
        included: true,
      })),
    selectedMeals: items
      .filter((item) => item.bookingType.toLowerCase().includes("meal"))
      .map((item) => ({
        id: item.serviceId,
        title: item.selectedOption,
        description: item.city || item.dayLabel,
        fareDiff: 0,
        included: true,
      })),
    selectedActivities: items
      .filter(
        (item) =>
          inferSingleServiceType([item]) === "activity" &&
          !item.bookingType.toLowerCase().includes("meal")
      )
      .map((item) => ({
        id: item.serviceId,
        title: item.selectedOption,
        description: item.city || item.dayLabel,
        category: item.serviceName,
        fareDiff: 0,
        included: true,
      })),
    flightFareDiff: 0,
    hotelFareDiff: 0,
    transferFareDiff: 0,
    mealFareDiff: 0,
    activityFareDiff: 0,
    finalPrice: safeBasePrice,
  };
}

function buildPackageRoute({
  intent,
  items,
  totalEstimate,
}: {
  intent: TiyaTripIntent;
  items: TiyaSmartBasketItem[];
  totalEstimate: number;
}) {
  const slug = pickPackageSlug(intent);
  const hasFlight = items.some((item) => inferSingleServiceType([item]) === "flight");
  const variant = hasFlight ? "withFlight" : "withoutFlight";
  const params = new URLSearchParams({
    variant,
    date: safeDateOnly(intent.startDate),
    origin: intent.fromCity || "Origin",
    adults: String(Math.max(1, intent.adults || 1)),
    children: String(Math.max(0, intent.children || 0)),
    rooms: "1",
    source: "tiya-smart-planner",
  });

  if (canUseStorage()) {
    savePackageSelectionState(
      slug,
      buildPackageSelectionState(items, totalEstimate)
    );
  }

  return `/packages/booking/${slug}?${params.toString()}`;
}

export function routeTiyaSmartBookingBasket({
  intent,
  items,
}: {
  intent: TiyaTripIntent;
  items: TiyaSmartBasketItem[];
}): TiyaSmartBasketRouteResult {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const draftId = buildDraftId(intent);
  const serviceTypes = getBasketServiceTypes(safeItems);
  const totalEstimate = safeItems.reduce(
    (sum, item) => sum + Number(item.estimatedPrice || 0),
    0
  );
  const isSingleService = serviceTypes.length === 1;
  const serviceType = isSingleService ? serviceTypes[0] : "package";
  const isCustomPackage = !isSingleService || serviceType === "activity";
  const route =
    serviceType === "flight"
      ? buildFlightRoute(intent)
      : serviceType === "hotel"
        ? buildHotelRoute(intent)
        : serviceType === "cab"
          ? buildCabRoute(intent)
          : buildPackageRoute({ intent, items: safeItems, totalEstimate });
  const draft = {
    draftId,
    source: "tiya-smart-planner",
    serviceType,
    isCustomPackage,
    route,
    intent,
    items: safeItems,
    totalEstimate,
    createdAt: new Date().toISOString(),
  };

  writeSessionPayload(TIYA_SMART_BASKET_DRAFT_KEY, draft);

  if (isCustomPackage) {
    writeSessionPayload(TIYA_CUSTOM_PACKAGE_DRAFT_KEY, {
      ...draft,
      packageMode: serviceType === "activity" ? "experience-only" : "custom-package",
    });
  }

  return {
    route,
    serviceType,
    isCustomPackage,
    draftId,
  };
}
