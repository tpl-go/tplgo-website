"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";

export type SmartPlannerRecord = Record<string, unknown>;

export type SmartPlannerServiceGroup =
  | "transport"
  | "stay"
  | "activity"
  | "meal"
  | "localMarket"
  | "creator"
  | "localLife"
  | "insurance"
  | "visa"
  | "cruise"
  | "other";

export type NormalizedSmartPlannerItem = {
  amount: number;
  city: string;
  date: string;
  day: number;
  id: string;
  location: string;
  raw: SmartPlannerRecord;
  serviceGroup: SmartPlannerServiceGroup;
  time: string;
  title: string;
  type: string;
};

export type NormalizedSmartPlannerDay = {
  city: string;
  date: string;
  day: number;
  id: string;
  items: NormalizedSmartPlannerItem[];
  raw: SmartPlannerRecord;
  title: string;
};

export type NormalizedSmartPlannerBooking = {
  bookingDate: string;
  bookingId: string;
  bookingStatus: string;
  creatorItems: NormalizedSmartPlannerItem[];
  destination: string;
  durationLabel: string;
  finalPaidAmount: number;
  itineraryDays: NormalizedSmartPlannerDay[];
  localMarketItems: NormalizedSmartPlannerItem[];
  mealItems: NormalizedSmartPlannerItem[];
  origin: string;
  paymentStatus: string;
  priceSummary: {
    baseAfterOffer: number;
    finalPayable: number;
    offerDiscount: number;
    selectedBasketValue: number;
    subtotal: number;
    taxesAndFees: number;
    totalAmount: number;
  };
  raw: SmartPlannerRecord;
  routeLabel: string;
  selectedBasketItems: NormalizedSmartPlannerItem[];
  service: "smart-planner";
  status: string;
  stayItems: NormalizedSmartPlannerItem[];
  totalAmount: number;
  transportItems: NormalizedSmartPlannerItem[];
  travellers: {
    contactDetails: SmartPlannerRecord;
    count: number;
    label: string;
    leadTraveller: SmartPlannerRecord;
    list: SmartPlannerRecord[];
  };
  travelDate: string;
  tripTitle: string;
  walletSummary: {
    earnedCreditUsed: number;
    earnedOnThisBooking: number;
    promoCreditUsed: number;
    refundWalletUsed: number;
    totalWalletBenefit: number;
  };
};

function asRecord(value: unknown): SmartPlannerRecord {
  return typeof value === "object" && value !== null ? (value as SmartPlannerRecord) : {};
}

function safeArray(value: unknown): SmartPlannerRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is SmartPlannerRecord => typeof item === "object" && item !== null)
    : [];
}

function text(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" || typeof value === "number") {
      const result = String(value).trim();
      if (result) return result;
    }
  }

  return "";
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value ?? 0);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }

  return 0;
}

function routeText(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean).join(" → ");
  return text(value);
}

function deepRecords(root: unknown, depth = 0): SmartPlannerRecord[] {
  if (!root || depth > 7) return [];

  if (Array.isArray(root)) {
    return root.flatMap((item) => deepRecords(item, depth + 1));
  }

  const record = asRecord(root);
  if (!Object.keys(record).length) return [];

  return [
    record,
    ...Object.values(record).flatMap((value) => deepRecords(value, depth + 1)),
  ];
}

function arraysByKey(root: unknown, keyNames: string[]) {
  const keys = keyNames.map((key) => key.toLowerCase());
  const found: SmartPlannerRecord[][] = [];

  for (const record of deepRecords(root)) {
    for (const [key, value] of Object.entries(record)) {
      if (keys.includes(key.toLowerCase()) && Array.isArray(value)) {
        const rows = safeArray(value);
        if (rows.length) found.push(rows);
      }
    }
  }

  return found;
}

function firstRecordByKey(root: unknown, keyNames: string[]) {
  const keys = keyNames.map((key) => key.toLowerCase());

  for (const record of deepRecords(root)) {
    for (const [key, value] of Object.entries(record)) {
      if (keys.includes(key.toLowerCase())) {
        const result = asRecord(value);
        if (Object.keys(result).length) return result;
      }
    }
  }

  return {};
}

function firstTextByKey(root: unknown, keyNames: string[]) {
  const keys = keyNames.map((key) => key.toLowerCase());

  for (const record of deepRecords(root)) {
    for (const [key, value] of Object.entries(record)) {
      if (keys.includes(key.toLowerCase())) {
        const result = text(value);
        if (result) return result;
      }
    }
  }

  return "";
}

function firstNumberByKey(root: unknown, keyNames: string[]) {
  const keys = keyNames.map((key) => key.toLowerCase());

  for (const record of deepRecords(root)) {
    for (const [key, value] of Object.entries(record)) {
      if (keys.includes(key.toLowerCase())) {
        const result = numberValue(value);
        if (result) return result;
      }
    }
  }

  return 0;
}

function serviceText(item: SmartPlannerRecord) {
  return [
    item.__serviceGroup,
    item.serviceGroup,
    item.serviceType,
    item.type,
    item.category,
    item.itemType,
    item.bookingType,
    item.service,
    item.serviceName,
    item.serviceLabel,
    item.title,
    item.name,
    item.label,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
}

export function resolveSmartPlannerServiceGroup(item: SmartPlannerRecord): SmartPlannerServiceGroup {
  const raw = serviceText(item);

  if (/\b(train|rail|flight|air|airline|bus|coach|cab|taxi|transfer|private\s*car|self\s*drive|ev|pickup|drop|transport)\b/.test(raw)) return "transport";
  if (/\b(cruise|ship)\b/.test(raw)) return "cruise";
  if (/\b(homestay|hotel|resort|villa|stay|retreat|camp|room|property)\b/.test(raw)) return "stay";
  if (/\b(meal|food|dinner|breakfast|lunch|cafe|restaurant)\b/.test(raw)) return "meal";
  if (/\b(local[-\s]*market|market|shopping|souvenir|handicraft|spice)\b/.test(raw)) return "localMarket";
  if (/\b(creator|reel|photo|story|influencer|content)\b/.test(raw)) return "creator";
  if (/\b(local[-\s]*life|hidden\s*gem|local\s*walk|culture)\b/.test(raw)) return "localLife";
  if (/\b(activity|experience|tour|sightseeing|walk|show|adventure)\b/.test(raw)) return "activity";
  if (/\b(insurance)\b/.test(raw)) return "insurance";
  if (/\b(visa)\b/.test(raw)) return "visa";

  return "other";
}

function titleOf(item: SmartPlannerRecord) {
  return (
    text(
      item.displayName,
      item.title,
      item.name,
      item.label,
      item.itemName,
      item.optionName,
      item.serviceName,
      item.serviceLabel,
      item.selectedOptionName,
      item.hotelName,
      item.stayName,
      item.propertyName,
      item.activityName,
      item.mealName,
      item.marketName,
      item.creatorName,
      item.routeLabel
    ) ||
    (text(item.from, item.origin) && text(item.to, item.destination)
      ? `${text(item.from, item.origin)} → ${text(item.to, item.destination)}`
      : "") ||
    "Selected Smart Planner item"
  );
}

function amountOf(item: SmartPlannerRecord) {
  const pricing = asRecord(item.pricing);
  const fare = asRecord(item.fare);
  const priceSummary = asRecord(item.priceSummary);

  return numberValue(
    item.total,
    item.totalPrice,
    item.finalTotal,
    item.finalAmount,
    item.amount,
    item.value,
    item.price,
    item.selectedPrice,
    item.estimatedValue,
    item.estimatedCost,
    pricing.total,
    pricing.amount,
    pricing.price,
    fare.total,
    fare.amount,
    priceSummary.total,
    priceSummary.amount
  );
}

function dayOf(item: SmartPlannerRecord) {
  const rawDay = numberValue(item.day, item.dayNumber, item.dayNo, item.number);
  if (rawDay) return rawDay;

  const dayIndex = Number(item.dayIndex);
  if (Number.isFinite(dayIndex)) return dayIndex + 1;

  return 0;
}

function normalizeItem(item: SmartPlannerRecord, index: number): NormalizedSmartPlannerItem {
  const group = resolveSmartPlannerServiceGroup(item);

  return {
    amount: amountOf(item),
    city: text(item.city, item.destination, item.location),
    date: text(item.date, item.dayDate, item.travelDate, item.startDate),
    day: dayOf(item),
    id: text(item.id, item.itemId, item.serviceId, item.selectionId) || `planner-item-${index + 1}`,
    location: text(item.location, item.city, item.destination, item.pickup, item.drop),
    raw: item,
    serviceGroup: group,
    time: text(item.time, item.startTime, item.departureTime, item.pickupTime, item.checkInTime),
    title: titleOf(item),
    type: text(item.serviceType, item.type, item.category, item.__serviceGroup) || group,
  };
}

function dedupeItems(items: NormalizedSmartPlannerItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = [
      item.id,
      item.serviceGroup,
      item.day,
      item.title,
      item.amount,
      item.time,
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectServiceArrays(root: unknown) {
  const mapping: Array<[string[], SmartPlannerServiceGroup]> = [
    [["selectedTransport", "selectedTransports", "selectedTransfers", "selectedCabs", "selectedFlights", "selectedTrains", "selectedBuses"], "transport"],
    [["selectedHotels", "selectedStays", "selectedHomestays", "selectedRooms"], "stay"],
    [["selectedActivities", "selectedExperiences"], "activity"],
    [["selectedMeals", "selectedFood"], "meal"],
    [["selectedLocalMarketItems", "selectedLocalMarkets", "selectedMarketItems"], "localMarket"],
    [["selectedCreatorSpots", "selectedCreatorItems", "selectedCreators"], "creator"],
    [["selectedLocalLifeItems"], "localLife"],
  ];

  const rows: SmartPlannerRecord[] = [];

  for (const [keys, group] of mapping) {
    for (const arr of arraysByKey(root, keys)) {
      rows.push(...arr.map((item) => ({ ...item, __serviceGroup: group })));
    }
  }

  return rows;
}

function collectSelectedItems(root: unknown) {
  const directArrays = [
    ...arraysByKey(root, [
      "selectedBasketItems",
      "basketItems",
      "bookingBasket",
      "selectedItems",
      "tripSelections",
      "checkoutItems",
      "selectedServices",
      "services",
    ]),
  ].flat();

  const serviceArrays = collectServiceArrays(root);

  return dedupeItems([...directArrays, ...serviceArrays].map(normalizeItem));
}

function looksLikeDay(item: SmartPlannerRecord) {
  return Boolean(
    text(item.dayTitle, item.title, item.date, item.dateLabel) ||
      numberValue(item.day, item.dayNumber, item.number) ||
      Array.isArray(item.items) ||
      Array.isArray(item.timeline) ||
      Array.isArray(item.timelineItems) ||
      Array.isArray(item.events)
  );
}

function collectDays(root: unknown) {
  const candidates = arraysByKey(root, [
    "itineraryDays",
    "dayWiseItinerary",
    "dayPlans",
    "days",
    "itinerary",
  ]).flat();

  return candidates.filter(looksLikeDay);
}

function normalizeDays(root: unknown, basket: NormalizedSmartPlannerItem[]) {
  const records = collectDays(root);

  if (!records.length) {
    const grouped = new Map<number, NormalizedSmartPlannerItem[]>();

    for (const item of basket) {
      const day = item.day || 1;
      grouped.set(day, [...(grouped.get(day) || []), item]);
    }

    return Array.from(grouped.entries()).map(([day, items]) => ({
      city: text(items[0]?.city),
      date: text(items[0]?.date),
      day,
      id: `day-${day}`,
      items,
      raw: {},
      title: `Day ${day}`,
    }));
  }

  return records.map((day, index) => {
    const dayNo = numberValue(day.day, day.dayNumber, day.number, index + 1) || index + 1;

    const timelineRows = [
      ...safeArray(day.items),
      ...safeArray(day.timeline),
      ...safeArray(day.timelineItems),
      ...safeArray(day.events),
      ...safeArray(day.plan),
    ];

    const timelineItems = timelineRows.map((item, itemIndex) => normalizeItem(item, itemIndex));

    const basketForDay = basket.filter(
      (item) =>
        item.day === dayNo ||
        text(item.raw.dayId) === text(day.id) ||
        text(item.raw.dayTitle) === text(day.title, day.dayTitle)
    );

    return {
      city: text(day.city, day.destination, day.location),
      date: text(day.date, day.dateLabel, day.travelDate),
      day: dayNo,
      id: text(day.id) || `day-${dayNo}`,
      items: dedupeItems([...timelineItems, ...basketForDay]),
      raw: day,
      title: text(day.title, day.dayTitle, day.label) || `Day ${dayNo}`,
    };
  });
}

function routeLabel(root: unknown) {
  const trip = firstRecordByKey(root, ["trip"]);
  const route = firstRecordByKey(root, ["route"]);
  const selectedRoute = asRecord(route.selectedRouteVariant);
  const stops = safeArray(selectedRoute.stops)
    .map((stop) => text(stop.name, stop.city, stop.label))
    .filter(Boolean);

  const destinations = safeArray(trip.destinations)
    .map((item) => text(item.name, item.city, item.label, item))
    .filter(Boolean);

  const direct =
    routeText(firstTextByKey(root, ["routeLabel", "routeTitle"])) ||
    routeText(firstTextByKey(root, ["route"])) ||
    routeText(stops) ||
    routeText(destinations);

  if (direct) return direct;

  const origin = text(
    firstTextByKey(root, ["origin"]),
    firstTextByKey(root, ["originCity"]),
    firstTextByKey(root, ["from"])
  );

  const destination = text(
    firstTextByKey(root, ["destination"]),
    firstTextByKey(root, ["destinationCity"]),
    firstTextByKey(root, ["to"])
  );

  return [origin, destination].filter(Boolean).join(" → ");
}

function travellerBlock(root: unknown, booking?: BookingItem | null) {
  const list =
    arraysByKey(root, ["travellers", "travellerDetails", "passengers", "guests"])[0] || [];

  const lead =
    firstRecordByKey(root, ["leadTraveller", "primaryTraveller", "contactTraveller"]) ||
    asRecord(list[0]) ||
    asRecord(booking?.leadTraveller);

  const contact =
    firstRecordByKey(root, ["contactDetails", "contact"]) ||
    lead;

  const explicitCount = numberValue(
    firstNumberByKey(root, ["totalTravellers", "travellerCount", "passengerCount", "guestCount"])
  );

  const parsedBookingCount = Number(String(booking?.travellers || "").match(/\d+/)?.[0] || 0);
  const count = explicitCount || list.length || parsedBookingCount || 1;

  return {
    contactDetails: contact,
    count,
    label: booking?.travellers || `${count} Traveller${count > 1 ? "s" : ""}`,
    leadTraveller: lead,
    list,
  };
}

function priceBlock(root: unknown, basket: NormalizedSmartPlannerItem[], booking?: BookingItem | null) {
  const fare =
    firstRecordByKey(root, ["plannerFareSummary", "priceSummary", "fareSummary", "fare", "paymentSummary"]);

  const payment = firstRecordByKey(root, ["payment", "paymentData"]);

  const selectedBasketValue =
    numberValue(
      fare.selectedBasketValue,
      fare.subtotal,
      fare.basePrice,
      fare.totalSelectionValue,
      firstNumberByKey(root, ["selectedBasketValue", "subtotal"])
    ) || basket.reduce((sum, item) => sum + item.amount, 0);

  const offerDiscount = numberValue(fare.offerDiscount, fare.couponDiscount, fare.discount);
  const taxesAndFees = numberValue(fare.taxesAndFees, fare.feesAndTaxes, fare.tax, fare.serviceFee);

  const finalPayable = numberValue(
    fare.finalPayable,
    fare.finalPayableAmount,
    fare.grandTotal,
    fare.totalAmount,
    payment.totalPaid,
    payment.amountPaid,
    booking?.amount,
    selectedBasketValue + taxesAndFees - offerDiscount
  );

  const wallet = asRecord(fare.walletBreakdown || payment.walletBreakdown);

  return {
    priceSummary: {
      baseAfterOffer: numberValue(fare.baseAfterOffer, selectedBasketValue - offerDiscount),
      finalPayable,
      offerDiscount,
      selectedBasketValue,
      subtotal: selectedBasketValue,
      taxesAndFees,
      totalAmount: finalPayable,
    },
    walletSummary: {
      earnedCreditUsed: numberValue(wallet.earnedUsed, payment.earnedUsed),
      earnedOnThisBooking: numberValue(wallet.earnedOnThisBooking, fare.earnedCreditAmount),
      promoCreditUsed: numberValue(wallet.promoUsed, payment.promoUsed),
      refundWalletUsed: numberValue(wallet.refundUsed, payment.refundUsed),
      totalWalletBenefit: numberValue(wallet.totalWalletUsed, fare.tplCreditUsed),
    },
  };
}

function durationLabel(root: unknown, dayCount: number) {
  const explicit = text(firstTextByKey(root, ["durationLabel", "duration"]));
  if (explicit && !/0\s*D/i.test(explicit)) return explicit;

  const days = numberValue(firstNumberByKey(root, ["durationDays", "days", "dayCount"]), dayCount);
  if (days) return `${Math.max(days - 1, 0)}N / ${days}D`;

  return "";
}

export function normalizeSmartPlannerBooking(params: {
  booking?: BookingItem | null;
  payload?: unknown;
}): NormalizedSmartPlannerBooking {
  const booking = params.booking || null;
  const root = {
    ...asRecord(params.payload),
    booking,
    bookingRecord: booking,
  };

  const basket = collectSelectedItems(root);
  const days = normalizeDays(root, basket);
  const fare = priceBlock(root, basket, booking);
  const travellers = travellerBlock(root, booking);

  const route = routeLabel(root);

  const tripTitle =
    text(
      firstTextByKey(root, ["tripTitle", "tripName", "title", "packageTitle"]),
      booking?.title
    ) || "Smart Planner Trip";

  const travelDate =
    text(
      firstTextByKey(root, ["travelDate", "startDate", "tripStartDate"]),
      booking?.travelDate
    ) || "";

  const origin =
    text(
      firstTextByKey(root, ["origin", "originCity", "from"]),
      route.split("→")[0]?.trim()
    ) || "";

  const destination =
    text(
      firstTextByKey(root, ["destination", "destinationCity", "to"]),
      route.split("→").pop()?.trim()
    ) || "";

  const payment = firstRecordByKey(root, ["payment", "paymentData"]);

  return {
    bookingDate: booking?.bookingDate || text(payment.paidAt, firstTextByKey(root, ["bookingDate"])),
    bookingId: booking?.id || firstTextByKey(root, ["bookingId", "smartPlannerBookingId", "confirmationId"]),
    bookingStatus: booking?.status || firstTextByKey(root, ["bookingStatus", "status"]) || "confirmed",
    creatorItems: basket.filter((item) => item.serviceGroup === "creator"),
    destination,
    durationLabel: durationLabel(root, days.length),
    finalPaidAmount: fare.priceSummary.finalPayable,
    itineraryDays: days,
    localMarketItems: basket.filter((item) => item.serviceGroup === "localMarket"),
    mealItems: basket.filter((item) => item.serviceGroup === "meal"),
    origin,
    paymentStatus: text(payment.paymentStatus, payment.paymentActionState) || "paid",
    priceSummary: fare.priceSummary,
    raw: asRecord(params.payload),
    routeLabel: route,
    selectedBasketItems: basket,
    service: "smart-planner",
    status: booking?.status || "upcoming",
    stayItems: basket.filter((item) => item.serviceGroup === "stay"),
    totalAmount: fare.priceSummary.finalPayable,
    transportItems: basket.filter(
      (item) => item.serviceGroup === "transport" || item.serviceGroup === "cruise"
    ),
    travellers,
    travelDate,
    tripTitle,
    walletSummary: fare.walletSummary,
  };
}