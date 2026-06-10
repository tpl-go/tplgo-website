import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaPriceBasis,
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
  TiyaTimelineServiceOption,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type WorkspaceBookingType =
  | "flight"
  | "hotel"
  | "cab"
  | "activity"
  | "package";

export type WorkspaceBookingBasketItem = {
  id: string;
  sourceItemId?: string;
  dayId?: string;
  day: number;
  dayLabel: string;
  category: NonNullable<TiyaTimelineItem["category"]>;
  serviceType: WorkspaceBookingType;
  serviceLabel?: string;
  serviceName: string;
  selectedOptionName: string;
  title: string;
  description: string;
  dayRange?: string;
  from: string;
  to: string;
  finalDestination?: string;
  city: string;
  date: string;
  startDate?: string;
  endDate?: string;
  checkInDay?: number;
  checkOutDay?: number;
  checkInDate?: string;
  checkOutDate?: string;
  cabKind?: "transfer" | "local" | "full_trip";
  coverageStartDay?: number;
  coverageEndDay?: number;
  coverageStartDate?: string;
  coverageEndDate?: string;
  travellers: number;
  rooms?: number;
  nights?: number;
  durationDays?: number;
  quantity?: number;
  time?: string;
  meta: string;
  unitPrice: number;
  priceBasis: TiyaPriceBasis;
  displayPriceLabel: string;
  estimatedPrice: number;
  price: number;
  estimatedTotal?: number;
  currency: "INR";
  providerName?: string;
  detailSummary?: string;
  details?: Record<string, TiyaTimelineDetailValue>;
  options?: TiyaTimelineServiceOption[];
  status: "recommended" | "selected";
  bookingStatus: "available" | "selected" | "recommended" | "optional";
};

export function bookingTypeFromTimelineItem(
  type: TiyaTimelineItem["type"],
  serviceType?: string
): WorkspaceBookingType {
  const normalizedServiceType = serviceType?.toLowerCase() || "";
  if (
    normalizedServiceType.includes("flight") ||
    normalizedServiceType.includes("train") ||
    normalizedServiceType.includes("bus")
  ) {
    return "flight";
  }
  if (type === "stay") return "hotel";
  if (type === "activity" || type === "meal") return "activity";
  return "cab";
}

export function bookingServiceName(type: WorkspaceBookingType) {
  if (type === "flight") return "Flight / Transport";
  if (type === "hotel") return "Hotel / Stay";
  if (type === "cab") return "Cab / Local Transfer";
  if (type === "package") return "Package";
  return "Activities / Experiences";
}

export function bookingDisplayType(type: WorkspaceBookingType) {
  if (type === "flight") return "Flight";
  if (type === "hotel") return "Hotel";
  if (type === "cab") return "Cab";
  if (type === "package") return "Package";
  return "Activity";
}

export function estimateBookingItemPrice({
  type,
  dayIndex,
  totalBudget,
}: {
  type: WorkspaceBookingType;
  dayIndex: number;
  totalBudget: number;
}) {
  const safeBudget =
    Number.isFinite(totalBudget) && totalBudget > 0 ? totalBudget : 42000;

  if (type === "flight" || type === "cab") {
    return Math.max(2200, Math.round(safeBudget * 0.14 + dayIndex * 350));
  }

  if (type === "hotel") {
    return Math.max(3200, Math.round(safeBudget * 0.12 + dayIndex * 450));
  }

  if (type === "package") {
    return Math.max(5200, Math.round(safeBudget * 0.18 + dayIndex * 500));
  }

  return Math.max(900, Math.round(safeBudget * 0.045 + dayIndex * 160));
}

function formatInr(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

export function priceBasisFromTimelineItem(
  item: TiyaTimelineItem,
  serviceType: WorkspaceBookingType
): TiyaPriceBasis {
  const serviceLabel =
    `${item.serviceType || ""} ${item.title} ${item.description || ""}`.toLowerCase();

  if (
    serviceLabel.includes("transfer") ||
    serviceLabel.includes("airport") ||
    serviceLabel.includes("railway") ||
    serviceLabel.includes("pickup") ||
    serviceLabel.includes("drop") ||
    serviceLabel.includes("station")
  ) {
    return "per_transfer";
  }
  if (serviceType === "hotel") return "per_night";
  if (serviceType === "activity") return "per_traveller";
  if (serviceType === "package") return "per_package";
  if (
    serviceLabel.includes("driver") ||
    serviceLabel.includes("guide") ||
    serviceLabel.includes("local cab")
  ) {
    return "per_day";
  }
  if (serviceType === "cab") return "per_day";
  if (item.priceBasis) return item.priceBasis;

  return "per_traveller";
}

export function displayPriceLabelForBasis(
  unitPrice: number,
  priceBasis: TiyaPriceBasis
) {
  const price = formatInr(unitPrice);

  if (priceBasis === "per_room_night") return `${price} per night`;
  if (priceBasis === "per_night") return `${price} per night`;
  if (priceBasis === "per_day") return `${price} per day`;
  if (priceBasis === "per_transfer") return `${price} one-time`;
  if (priceBasis === "per_group") return `${price} per group`;
  if (priceBasis === "per_item") return `${price} per item`;
  if (priceBasis === "per_package") return `${price} package estimate`;
  if (priceBasis === "fixed") return `${price} fixed`;
  return `${price} per traveller`;
}

export function priceBasisFromBookingItem(
  item: WorkspaceBookingBasketItem
): TiyaPriceBasis {
  const text =
    `${item.category} ${item.serviceType} ${item.serviceLabel || ""} ${item.title} ${item.description}`.toLowerCase();

  if (
    /(airport|railway|pickup|drop|transfer|station)/.test(text)
  ) {
    return "per_transfer";
  }

  if (item.category === "Stay" || item.serviceType === "hotel") {
    return "per_night";
  }

  if (/(local cab|driver|guide)/.test(text)) return "per_day";
  if (item.serviceType === "cab") return "per_day";
  if (/(permit)/.test(text)) return "fixed";
  if (/(insurance)/.test(text)) return "per_traveller";
  if (item.serviceType === "package") return "per_package";
  if (item.serviceType === "activity") return "per_traveller";

  return item.priceBasis || "per_traveller";
}

export function getPriceLabel(item: WorkspaceBookingBasketItem) {
  const unitPrice = Number.isFinite(item.unitPrice)
    ? item.unitPrice
    : Number.isFinite(item.price)
      ? item.price
      : Number.isFinite(item.estimatedPrice)
        ? item.estimatedPrice
        : 0;

  return displayPriceLabelForBasis(unitPrice, priceBasisFromBookingItem(item));
}

export function calculateBookingItemTotal(item: WorkspaceBookingBasketItem) {
  const unitPrice = Number.isFinite(item.unitPrice)
    ? item.unitPrice
    : Number.isFinite(item.price)
      ? item.price
      : 0;

  const priceBasis = priceBasisFromBookingItem(item);

  if (priceBasis === "per_room_night") {
    return unitPrice * Math.max(1, item.nights || 1) * Math.max(1, item.rooms || 1);
  }

  if (priceBasis === "per_night") {
    return unitPrice * Math.max(1, item.nights || 1);
  }

  if (priceBasis === "per_day") {
    return unitPrice * Math.max(1, item.durationDays || item.quantity || 1);
  }

  if (priceBasis === "per_traveller") {
    return unitPrice * Math.max(1, item.travellers || 1);
  }

  if (priceBasis === "per_item") {
    return unitPrice * Math.max(1, item.quantity || 1);
  }

  return unitPrice * Math.max(1, item.quantity || 1);
}

export function getBookingItemPriceBreakup(item: WorkspaceBookingBasketItem) {
  const unitPrice = Number.isFinite(item.unitPrice)
    ? item.unitPrice
    : Number.isFinite(item.price)
      ? item.price
      : Number.isFinite(item.estimatedPrice)
        ? item.estimatedPrice
        : 0;
  const priceBasis = priceBasisFromBookingItem(item);
  const basisLabel = displayPriceLabelForBasis(unitPrice, priceBasis);
  const travellers = Math.max(1, item.travellers || 1);
  const nights = Math.max(1, item.nights || 1);
  const rooms = Math.max(1, item.rooms || 1);
  const days = Math.max(1, item.durationDays || item.quantity || 1);
  const quantity = Math.max(1, item.quantity || 1);
  const estimatedTotal = calculateBookingItemTotal(item);
  let calculationLabel = basisLabel;

  if (priceBasis === "per_traveller") {
    calculationLabel = `${formatInr(unitPrice)} × ${travellers} traveller${travellers === 1 ? "" : "s"}`;
  } else if (priceBasis === "per_room_night") {
    calculationLabel = `${formatInr(unitPrice)} × ${nights} night${nights === 1 ? "" : "s"} × ${rooms} room${rooms === 1 ? "" : "s"}`;
  } else if (priceBasis === "per_night") {
    calculationLabel = `${formatInr(unitPrice)} × ${nights} night${nights === 1 ? "" : "s"}`;
  } else if (priceBasis === "per_day") {
    calculationLabel = `${formatInr(unitPrice)} × ${days} day${days === 1 ? "" : "s"}`;
  } else if (priceBasis === "per_transfer") {
    calculationLabel = "One-time transfer";
  } else if (priceBasis === "per_group") {
    calculationLabel = "Group price";
  } else if (priceBasis === "per_item") {
    calculationLabel = `${formatInr(unitPrice)} × ${quantity} item${quantity === 1 ? "" : "s"}`;
  } else if (priceBasis === "fixed") {
    calculationLabel = "Fixed charge";
  } else if (priceBasis === "per_package") {
    calculationLabel = "Package estimate";
  }

  return {
    basisLabel,
    calculationLabel,
    estimatedTotal,
  };
}

export function getBookingItemCoverageLabel(item: WorkspaceBookingBasketItem) {
  const priceBasis = priceBasisFromBookingItem(item);

  if (priceBasis === "per_night" || priceBasis === "per_room_night") {
    return item.dayRange || `${item.checkInDate || item.startDate || item.dayLabel} → ${item.checkOutDate || item.endDate || item.dayLabel}`;
  }

  if (priceBasis === "per_day") {
    return item.dayRange || `${item.coverageStartDate || item.startDate || item.dayLabel} → ${item.coverageEndDate || item.endDate || item.dayLabel}`;
  }

  return item.dayRange || item.dayLabel;
}

export function getBookingItemInvoiceServiceLabel(item: WorkspaceBookingBasketItem) {
  const priceBasis = priceBasisFromBookingItem(item);

  if (priceBasis === "per_night" || priceBasis === "per_room_night") {
    return item.serviceLabel || "Hotel";
  }

  if (priceBasis === "per_day" && item.serviceType === "cab") {
    return "Cab Coverage";
  }

  if (priceBasis === "per_transfer") {
    return item.serviceLabel || "Transfer";
  }

  return item.serviceLabel || bookingDisplayType(item.serviceType);
}

export function getBookingItemRouteLabel(item: WorkspaceBookingBasketItem) {
  const priceBasis = priceBasisFromBookingItem(item);

  if (priceBasis === "per_night" || priceBasis === "per_room_night") {
    return `Location: ${item.city}`;
  }

  if (priceBasis === "per_day" && item.serviceType === "cab") {
    return `Coverage in ${item.city}`;
  }

  if (item.from && item.to) return `${item.from} → ${item.to}`;
  return item.city;
}

export function buildBasketOptions(item: WorkspaceBookingBasketItem) {
  if (item.options?.length) {
    return item.options.map((option) => ({
      id: option.id,
      name: option.title,
      detail: option.description,
      price: option.price,
      providerName: option.providerName,
      detailSummary: option.detailSummary,
      details: option.details,
    }));
  }

  const city = item.city || "selected city";
  const optionMap: Record<WorkspaceBookingType, string[]> = {
    flight: [
      `Fastest flight to ${city}`,
      `Flexible fare to ${city}`,
      `Morning arrival to ${city}`,
    ],
    hotel: [
      `Premium hotel in ${city}`,
      `Boutique stay in ${city}`,
      `Comfort hotel near ${city}`,
    ],
    cab: [
      `Private SUV transfer in ${city}`,
      `Verified cab for ${city}`,
      `Self-drive ready route in ${city}`,
    ],
    activity: [
      `Curated experience in ${city}`,
      `Creator recommended activity in ${city}`,
      `Flexible local experience in ${city}`,
    ],
    package: [
      `Smart package for ${city}`,
      `Comfort package for ${city}`,
      `Premium package for ${city}`,
    ],
  };

  const baseUnitPrice = Number.isFinite(item.unitPrice)
    ? item.unitPrice
    : Number.isFinite(item.price)
      ? item.price
      : item.estimatedPrice;

  return optionMap[item.serviceType].map((name, index) => ({
    id: `${item.id}-option-${index}`,
    name,
    detail:
      index === 0
        ? "Best matched to the selected itinerary flow."
        : "Alternative option with different comfort and timing balance.",
    price: Math.max(1200, baseUnitPrice + (index - 1) * 650),
  }));
}

export function buildBookingBasketItemFromTimeline({
  day,
  item,
  dayIndex,
  totalBudget,
  plan,
  allDays,
  selectedOptionName,
  estimatedPrice,
}: {
  day: TiyaDayPlan;
  item: TiyaTimelineItem;
  dayIndex: number;
  totalBudget: number;
  plan?: TiyaGeneratedPlan;
  allDays?: TiyaDayPlan[];
  selectedOptionName?: string;
  estimatedPrice?: number;
}): WorkspaceBookingBasketItem {
  const serviceType = bookingTypeFromTimelineItem(item.type, item.serviceType);
  const city = item.location || day.city || "Destination";
  const priceBasis = priceBasisFromTimelineItem(item, serviceType);
  const inferredDayCount = Math.max(1, allDays?.length || plan?.days?.length || 1);
  const resolvedNights =
    item.nights ??
    plan?.nights ??
    Math.max(1, inferredDayCount - 1);
  const isLocalCab = priceBasis === "per_day" && serviceType === "cab";
  const resolvedCoverageStartDay = item.coverageStartDay ?? day.day;
  const resolvedCoverageEndDay =
    item.coverageEndDay ??
    (isLocalCab
      ? resolvedCoverageStartDay + (item.durationDays ?? inferredDayCount) - 1
      : day.day);
  const resolvedDurationDays =
    item.durationDays ??
    (isLocalCab
      ? Math.max(1, resolvedCoverageEndDay - resolvedCoverageStartDay + 1)
      : undefined);
  const resolvedCheckInDay = item.checkInDay ?? day.day;
  const resolvedCheckOutDay =
    item.checkOutDay ??
    (serviceType === "hotel" ? resolvedCheckInDay + resolvedNights : day.day);
  const fallbackUnitPrice = estimateBookingItemPrice({
    type: serviceType,
    dayIndex,
    totalBudget,
  });
  const unitPrice = (() => {
    if (estimatedPrice) return estimatedPrice;
    if (item.unitPrice) {
      const hasExplicitUnitPricing = Boolean(item.displayPriceLabel) ||
        Boolean(item.priceBasis && item.unitPrice !== item.price);

      if (
        serviceType === "hotel" &&
        !hasExplicitUnitPricing &&
        resolvedNights > 1 &&
        item.price &&
        item.unitPrice === item.price
      ) {
        return Math.max(1, Math.round(item.unitPrice / resolvedNights));
      }

      return item.unitPrice;
    }
    if (
      serviceType === "hotel" &&
      item.price &&
      resolvedNights > 1
    ) {
      return Math.max(1, Math.round(item.price / resolvedNights));
    }
    if (item.price) return item.price;
    return fallbackUnitPrice;
  })();
  const displayPriceLabel = displayPriceLabelForBasis(unitPrice, priceBasis);
  const nights = serviceType === "hotel" ? resolvedNights : item.nights;
  const durationDays =
    priceBasis === "per_day" && serviceType === "cab"
      ? resolvedDurationDays
      : item.durationDays;
  const dayRange =
    serviceType === "hotel"
      ? `Day ${resolvedCheckInDay} → Day ${resolvedCheckOutDay}`
      : durationDays && durationDays > 1
        ? `Day ${resolvedCoverageStartDay} → Day ${resolvedCoverageEndDay}`
        : `Day ${day.day}`;
  const endDayLabel =
    serviceType === "hotel"
      ? `Day ${resolvedCheckOutDay}`
      : durationDays && durationDays > 1
        ? `Day ${resolvedCoverageEndDay}`
        : `Day ${day.day}`;
  const basketItem: WorkspaceBookingBasketItem = {
    id: `${day.id}-${item.id}`,
    sourceItemId: item.id,
    dayId: day.id,
    day: day.day,
    dayLabel: `Day ${day.day}`,
    category:
      item.category ??
      (item.type === "stay"
        ? "Stay"
        : item.type === "meal"
          ? "Meals"
          : item.type === "transport"
            ? "Transport"
            : "Activities"),
    serviceType,
    serviceLabel: item.serviceType,
    serviceName: bookingServiceName(serviceType),
    selectedOptionName: selectedOptionName || item.title,
    title: selectedOptionName || item.title,
    description: item.description || item.title,
    dayRange,
    from: item.from || day.city,
    to: item.to || city,
    finalDestination: item.finalDestination,
    city,
    date: item.date || day.date,
    startDate: item.checkInDate || item.coverageStartDate || item.date || day.date,
    endDate: item.checkOutDate || item.coverageEndDate || item.date || day.date,
    checkInDay: serviceType === "hotel" ? resolvedCheckInDay : undefined,
    checkOutDay: serviceType === "hotel" ? resolvedCheckOutDay : undefined,
    checkInDate:
      serviceType === "hotel"
        ? item.checkInDate || `Day ${resolvedCheckInDay}`
        : undefined,
    checkOutDate:
      serviceType === "hotel"
        ? item.checkOutDate || endDayLabel
        : undefined,
    cabKind: serviceType === "cab" ? item.cabKind : undefined,
    coverageStartDay: serviceType === "cab" ? resolvedCoverageStartDay : undefined,
    coverageEndDay: serviceType === "cab" ? resolvedCoverageEndDay : undefined,
    coverageStartDate:
      serviceType === "cab"
        ? item.coverageStartDate || `Day ${resolvedCoverageStartDay}`
        : undefined,
    coverageEndDate:
      serviceType === "cab"
        ? item.coverageEndDate || endDayLabel
        : undefined,
    travellers: item.travellers || 1,
    rooms: item.rooms ?? (serviceType === "hotel" ? 1 : undefined),
    nights,
    durationDays,
    time: item.time,
    meta: `${item.time} · ${city}`,
    unitPrice,
    priceBasis,
    displayPriceLabel,
    estimatedPrice: unitPrice,
    price: unitPrice,
    currency: item.currency || "INR",
    providerName: item.providerName,
    detailSummary: item.detailSummary,
    details: item.details,
    options: item.options,
    status: "selected",
    bookingStatus: "selected",
  };

  return {
    ...basketItem,
    estimatedTotal: calculateBookingItemTotal(basketItem),
  };
}

export function buildInitialBookingBasket(
  days: TiyaDayPlan[],
  plan: TiyaGeneratedPlan
): WorkspaceBookingBasketItem[] {
  const basket = days.flatMap((day, dayIndex) =>
    day.items
      .filter(
        (item) =>
          item.type === "transport" ||
          item.type === "stay" ||
          item.type === "activity"
      )
      .map((item) =>
        buildBookingBasketItemFromTimeline({
          day,
          item,
          dayIndex,
          totalBudget: plan.totalBudget,
          plan,
          allDays: days,
        })
      )
  );

  const packageModule = plan.bookingModules.find(
    (module) => module.id === "packages"
  );
  const packageDestination =
    plan.routeStops.find((stop) => stop.nights > 0)?.city ||
    plan.routeStops[1]?.city ||
    plan.routeTitle;

  if (packageModule) {
    basket.push({
      id: `package-${packageModule.id}`,
      day: 0,
      dayLabel: "Trip",
      category: "Package",
      serviceType: "package",
      serviceLabel: "Package",
      serviceName: bookingServiceName("package"),
      selectedOptionName: packageModule.serviceName,
      title: packageModule.serviceName,
      description: packageModule.reason,
      dayRange: "Trip",
      from: plan.routeStops[0]?.city || plan.routeTitle,
      to: packageDestination,
      finalDestination: packageDestination,
      city: plan.routeTitle,
      date: plan.days[0]?.date || "",
      startDate: plan.days[0]?.date || "",
      endDate: plan.days[plan.days.length - 1]?.date || plan.days[0]?.date || "",
      travellers: plan.travellerCount || 1,
      quantity: 1,
      meta: `${plan.nights} nights · ${plan.routeTitle}`,
      unitPrice: estimateBookingItemPrice({
        type: "package",
        dayIndex: basket.length,
        totalBudget: plan.totalBudget,
      }),
      priceBasis: "per_package",
      displayPriceLabel: `${formatInr(
        estimateBookingItemPrice({
          type: "package",
          dayIndex: basket.length,
          totalBudget: plan.totalBudget,
        })
      )} package estimate`,
      estimatedPrice: estimateBookingItemPrice({
        type: "package",
        dayIndex: basket.length,
        totalBudget: plan.totalBudget,
      }),
      price: estimateBookingItemPrice({
        type: "package",
        dayIndex: basket.length,
        totalBudget: plan.totalBudget,
      }),
      estimatedTotal: estimateBookingItemPrice({
        type: "package",
        dayIndex: basket.length,
        totalBudget: plan.totalBudget,
      }),
      currency: "INR",
      providerName: "TPL Smart Package",
      detailSummary:
        "Package draft generated from the selected route, itinerary and booking modules.",
      details: {
        route: plan.routeTitle,
        nights: plan.nights,
        travellers: plan.travellerCount,
      },
      status: packageModule.readiness === "Ready" ? "selected" : "recommended",
      bookingStatus: "available",
    });
  }

  return basket.slice(0, 12);
}

export function upsertBookingBasketItem(
  basket: WorkspaceBookingBasketItem[],
  item: WorkspaceBookingBasketItem
) {
  const priceBasis = priceBasisFromBookingItem(item);
  const itemKey =
    priceBasis === "per_night" || priceBasis === "per_room_night"
      ? `stay-${item.city}-${item.title}`
      : priceBasis === "per_day" && item.serviceType === "cab"
        ? `cab-coverage-${item.city}-${item.title}`
        : item.sourceItemId || item.id;
  const exists = basket.some(
    (basketItem) => {
      const basketPriceBasis = priceBasisFromBookingItem(basketItem);
      const basketKey =
        basketPriceBasis === "per_night" || basketPriceBasis === "per_room_night"
          ? `stay-${basketItem.city}-${basketItem.title}`
          : basketPriceBasis === "per_day" && basketItem.serviceType === "cab"
            ? `cab-coverage-${basketItem.city}-${basketItem.title}`
            : basketItem.sourceItemId || basketItem.id;

      return basketKey === itemKey;
    }
  );

  if (!exists) return [...basket, item];

  return basket.map((basketItem) =>
    (() => {
      const basketPriceBasis = priceBasisFromBookingItem(basketItem);
      const basketKey =
        basketPriceBasis === "per_night" || basketPriceBasis === "per_room_night"
          ? `stay-${basketItem.city}-${basketItem.title}`
          : basketPriceBasis === "per_day" && basketItem.serviceType === "cab"
            ? `cab-coverage-${basketItem.city}-${basketItem.title}`
            : basketItem.sourceItemId || basketItem.id;

      return basketKey === itemKey
        ? { ...basketItem, ...item, status: "selected" }
        : basketItem;
    })()
  );
}
