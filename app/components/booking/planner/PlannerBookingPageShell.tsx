"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import BookingAddOnsSection from "@/app/components/booking/packages/BookingAddOnsSection";
import BookingCancellationSection from "@/app/components/booking/packages/BookingCancellationSection";
import BookingPackageSummary from "@/app/components/booking/packages/BookingPackageSummary";
import BookingPackageOffersSection, {
  type PackageOfferItem,
} from "@/app/components/booking/packages/BookingPackageOffersSection";
import BookingTopNav from "@/app/components/booking/packages/BookingTopNav";
import BookingTravellersSection from "@/app/components/booking/packages/BookingTravellersSection";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  TIYA_CHECKOUT_PAYLOAD_KEY,
  TIYA_REVIEW_DRAFT_KEY,
  type TiyaSmartPlannerReviewPayload,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import { TIYA_CUSTOM_PACKAGE_DRAFT_KEY } from "@/app/lib/ecosystem/planner/plannerBookingBridge";
import {
  compactPlannerDetailRecord,
  savePlannerDetailPayload,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import { getLoggedInDisplayName } from "@/app/lib/auth/displayName";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  buildPlannerFareSummary,
  plannerFareSummaryToFare,
} from "@/app/lib/ecosystem/planner/plannerPricing";
import {
  logSmartPlannerProceedStorageSummary,
  logSmartPlannerStorageWrite,
} from "@/app/lib/ecosystem/planner/booking/smartPlannerStorageWriteAudit";
import { getWallet, type Wallet } from "@/app/lib/wallet/walletStorage";

import PlannerBookingActionBar from "./PlannerBookingActionBar";
import PlannerBookingBasketSummary from "./PlannerBookingBasketSummary";
import PlannerBookingDaywiseItinerary from "./PlannerBookingDaywiseItinerary";
import PlannerBookingFareSummary from "./PlannerBookingFareSummary";

export const PLANNER_BOOKING_DRAFT_KEY = "tpl_tiya_planner_booking_draft_v1";
const PLANNER_PAYMENT_KEY = "tpl_tiya_planner_payment_v1";

export type PlannerBookingCategory =
  | "Flight"
  | "Train"
  | "Bus"
  | "Cab / Transfer"
  | "Cruise"
  | "Hotel"
  | "Homestay"
  | "Meal"
  | "Activity"
  | "Insurance"
  | "Visa"
  | "Local Life"
  | "Creator"
  | "Local Market"
  | "Other";

export type PlannerBookingBasketItem = Record<string, unknown> & {
  id?: string;
  title?: string;
  serviceType?: string;
  category?: string;
  type?: string;
  serviceName?: string;
  serviceLabel?: string;
  selectedOptionName?: string;
  selectedOption?: string;
  bookingType?: string;
  serviceCategory?: string;
  day?: number;
  dayNumber?: number;
  dayLabel?: string;
  date?: string;
  city?: string;
  location?: string;
  time?: string;
  estimatedTotal?: number;
  estimatedPrice?: number;
  price?: number;
};

export type PlannerBookingPayload = TiyaSmartPlannerReviewPayload & {
  __plannerBookingLoadedAt?: number;
  bookingMode?: string;
  checkoutSource?: string;
};

export type PlannerBookingGroup = {
  category: PlannerBookingCategory;
  items: PlannerBookingBasketItem[];
  value: number;
};

type SessionUser = {
  email?: string;
  fullName?: string;
  id?: string;
  mobile?: string;
  name?: string;
  phone?: string;
};

type TravellerValidationPayload = {
  travellers: Array<{
    id: string;
    age?: string;
    email?: string;
    travellerType: string;
    label: string;
    firstName?: string;
    fullName?: string;
    gender: string;
    lastName?: string;
    mobile?: string;
    notes?: string;
    roomLabel?: string;
  }>;
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  gstDetails: {
    hasGst: boolean;
    state: string;
    saveBillingToProfile: boolean;
  };
  allRequiredTravellersCompleted: boolean;
  contactValid: boolean;
  canProceed: boolean;
};

function readStorageJSON(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function serializeBookingPayload(label: string, value: unknown) {
  try {
    const serialized = JSON.stringify(value);

    if (process.env.NODE_ENV === "development") {
      console.info(`[Smart Planner Booking] serialized ${label}`, {
        bytes: serialized.length,
      });
    }

    return serialized;
  } catch (error) {
    console.error(`[Smart Planner Booking] JSON stringify failed: ${label}`, error);
    throw error;
  }
}

function writeRequiredSessionStorage(key: string, serialized: string) {
  try {
    logSmartPlannerStorageWrite({
      file: "app/components/booking/planner/PlannerBookingPageShell.tsx",
      functionName: "writeRequiredSessionStorage",
      key,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "attempt",
    });
    window.sessionStorage.setItem(key, serialized);
    logSmartPlannerStorageWrite({
      file: "app/components/booking/planner/PlannerBookingPageShell.tsx",
      functionName: "writeRequiredSessionStorage",
      key,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "success",
    });

    if (process.env.NODE_ENV === "development") {
      console.info(`[Smart Planner Booking] sessionStorage saved: ${key}`);
    }
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/components/booking/planner/PlannerBookingPageShell.tsx",
      functionName: "writeRequiredSessionStorage",
      key,
      serialized,
      storageType: "sessionStorage",
      successOrFailed: "failed",
    });
    console.error(`[Smart Planner Booking] sessionStorage write failed: ${key}`, error);
    throw error;
  }
}

function writeOptionalLocalStorage(key: string, serialized: string) {
  if (process.env.NODE_ENV === "development") {
    logSmartPlannerStorageWrite({
      file: "app/components/booking/planner/PlannerBookingPageShell.tsx",
      functionName: "writeOptionalLocalStorage:skipped",
      key,
      serialized,
      storageType: "localStorage",
      successOrFailed: "attempt",
    });
    console.info(`[Smart Planner Booking] localStorage mirror skipped for quota safety: ${key}`, {
      bytes: serialized.length,
    });
  }
}

function bookingErrorMessage(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error || "Unknown storage error");
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function timestampFromRecord(record: Record<string, unknown>) {
  const candidates = [
    record.updatedAt,
    record.reviewedAt,
    record.savedAt,
    record.createdAt,
    record.timestamp,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}

function extractReviewPayload(value: unknown): PlannerBookingPayload | null {
  const record = asRecord(value);
  const checkoutPayload = asRecord(record.checkoutPayload);
  const payload = asRecord(record.payload);
  const reviewPayload = asRecord(record.reviewPayload);
  const smartPlannerPayload = asRecord(record.smartPlannerPayload);
  const summary = asRecord(record.summary);
  const hasNestedPayload =
    Object.keys(reviewPayload).length > 0 ||
    Object.keys(checkoutPayload).length > 0 ||
    Object.keys(payload).length > 0 ||
    Object.keys(smartPlannerPayload).length > 0 ||
    Object.keys(summary).length > 0;
  const candidate = Object.keys(reviewPayload).length
    ? reviewPayload
    : Object.keys(checkoutPayload).length
      ? checkoutPayload
      : Object.keys(payload).length
        ? payload
        : Object.keys(smartPlannerPayload).length
          ? smartPlannerPayload
      : record;

  if (!Object.keys(candidate).length) return null;

  const source = String(candidate.source || candidate.checkoutSource || record.source || "");
  const hasSelectedBasket =
    Array.isArray(candidate.selectedBasketItems) ||
    Array.isArray(record.selectedBasketItems) ||
    Array.isArray(payload.selectedBasketItems) ||
    Array.isArray(checkoutPayload.selectedBasketItems) ||
    Array.isArray(reviewPayload.selectedBasketItems) ||
    Array.isArray(smartPlannerPayload.selectedBasketItems) ||
    Array.isArray(summary.selectedBasketItems);
  const hasSmartMarker =
    source.toLowerCase().includes("smart-planner") ||
    hasSelectedBasket;

  if (!hasSmartMarker || (!hasNestedPayload && !hasSelectedBasket)) return null;

  return {
    ...candidate,
    __plannerBookingLoadedAt: Math.max(
      timestampFromRecord(record),
      timestampFromRecord(candidate),
      timestampFromRecord(payload),
      timestampFromRecord(checkoutPayload),
      timestampFromRecord(reviewPayload),
      timestampFromRecord(smartPlannerPayload)
    ),
    selectedBasketItems: getPlannerSelectedBasketItems({
      ...candidate,
      checkoutPayload,
      payload,
      reviewPayload,
      selectedBasketItems: candidate.selectedBasketItems,
      smartPlannerPayload,
      summary,
    }),
  } as PlannerBookingPayload;
}

function loadPlannerBookingPayload(): PlannerBookingPayload | null {
  const payloads = [
    extractReviewPayload(readStorageJSON(PLANNER_BOOKING_DRAFT_KEY)),
    extractReviewPayload(readStorageJSON(TIYA_CHECKOUT_PAYLOAD_KEY)),
    extractReviewPayload(readStorageJSON(TIYA_REVIEW_DRAFT_KEY)),
    extractReviewPayload(readStorageJSON(TIYA_CUSTOM_PACKAGE_DRAFT_KEY)),
  ].filter(Boolean) as PlannerBookingPayload[];

  if (!payloads.length) return null;

  return payloads.sort(
    (left, right) =>
      Number(right.__plannerBookingLoadedAt || 0) -
      Number(left.__plannerBookingLoadedAt || 0)
  )[0];
}

function itemText(item: PlannerBookingBasketItem) {
  return [item.serviceName, item.serviceLabel, item.selectedOptionName, item.selectedOption, item.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function structuredItemText(item: PlannerBookingBasketItem) {
  return [item.serviceType, item.type, item.bookingType, item.serviceCategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function legacyCategoryText(item: PlannerBookingBasketItem) {
  return [item.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function categoryFromServiceText(text: string): PlannerBookingCategory | null {
  if (/(train|rail)/.test(text)) return "Train";
  if (/(bus|coach)/.test(text)) return "Bus";
  if (/(cab|taxi|transfer|local[-_\s]?transfer|vehicle)/.test(text)) {
    return "Cab / Transfer";
  }
  if (/(flight|flights|airline|\bair\b)/.test(text)) return "Flight";
  if (/(homestay)/.test(text)) return "Homestay";
  if (/(hotel|stay|resort|villa|retreat|camp)/.test(text)) return "Hotel";
  if (/(meal|food|dinner|breakfast|lunch|dining|restaurant|cafe|tea|supper)/.test(text)) {
    return "Meal";
  }
  if (/(activity|experience|tour|sightseeing)/.test(text)) return "Activity";
  if (/(cruise|ship)/.test(text)) return "Cruise";
  if (/(insurance)/.test(text)) return "Insurance";
  if (/(visa)/.test(text)) return "Visa";
  if (/(creator|reel|photo|story)/.test(text)) return "Creator";
  if (/(local[-_\s]?market|shopping|souvenir|handicraft|bazaar)/.test(text)) {
    return "Local Market";
  }
  if (/(local[-_\s]?life|hidden gem|local walk|culture)/.test(text)) {
    return "Local Life";
  }

  return null;
}

function categoryFromFallbackText(text: string): PlannerBookingCategory | null {
  if (/(meal|food|dinner|breakfast|lunch|dining|restaurant|cafe|tea|supper)/.test(text)) {
    return "Meal";
  }
  if (/(homestay)/.test(text)) return "Homestay";
  if (/(hotel|stay|resort|villa|retreat|camp)/.test(text)) return "Hotel";
  if (/(activity|experience|tour|sightseeing)/.test(text)) return "Activity";
  if (/(local[-_\s]?life|hidden gem|local walk|culture)/.test(text)) {
    return "Local Life";
  }
  if (/(creator|reel|photo|story)/.test(text)) return "Creator";
  if (/(local[-_\s]?market|shopping|souvenir|handicraft|bazaar)/.test(text)) {
    return "Local Market";
  }
  if (/(insurance)/.test(text)) return "Insurance";
  if (/(visa)/.test(text)) return "Visa";
  if (/(cruise|ship)/.test(text)) return "Cruise";
  if (/(cab|taxi|transfer|local[-_\s]?transfer|vehicle)/.test(text)) {
    return "Cab / Transfer";
  }
  if (/(bus|coach)/.test(text)) return "Bus";
  if (/(flight|flights|airline|\bair\b)/.test(text)) return "Flight";
  if (/(train|rail)/.test(text)) return "Train";

  return null;
}

export function classifyPlannerBasketItem(
  item: PlannerBookingBasketItem
): PlannerBookingCategory {
  const serviceCategory = categoryFromServiceText(structuredItemText(item));
  const fallbackCategory = categoryFromFallbackText(itemText(item));
  const legacyCategory = categoryFromServiceText(legacyCategoryText(item));

  if (fallbackCategory === "Meal") return "Meal";
  if (fallbackCategory === "Homestay") return "Homestay";
  if (
    fallbackCategory === "Train" ||
    fallbackCategory === "Bus" ||
    fallbackCategory === "Cab / Transfer" ||
    fallbackCategory === "Flight"
  ) {
    return fallbackCategory;
  }

  return serviceCategory || fallbackCategory || legacyCategory || "Other";
}

export function basketItemTitle(item: PlannerBookingBasketItem) {
  return (
    item.selectedOptionName ||
    item.selectedOption ||
    item.serviceLabel ||
    item.serviceName ||
    item.title ||
    "Selected basket item"
  );
}

export function basketItemValue(item: PlannerBookingBasketItem) {
  return Number(
    item.estimatedTotal ||
      item.estimatedPrice ||
      item.price ||
      item.value ||
      item.amount ||
      item.total ||
      item.cost ||
      item.fare ||
      item.unitPrice ||
      0
  );
}

export function getPlannerSelectedBasketItems(
  payload?: unknown
): PlannerBookingBasketItem[] {
  if (!payload) return [];

  const record = asRecord(payload);
  const payloadRecord = asRecord(record.payload);
  const checkoutRecord = asRecord(record.checkoutPayload);
  const reviewRecord = asRecord(record.reviewPayload);
  const smartPlannerRecord = asRecord(record.smartPlannerPayload);
  const summaryRecord = asRecord(record.summary);
  const candidates = [
    record.selectedBasketItems,
    payloadRecord.selectedBasketItems,
    checkoutRecord.selectedBasketItems,
    reviewRecord.selectedBasketItems,
    smartPlannerRecord.selectedBasketItems,
    summaryRecord.selectedBasketItems,
  ];

  const selectedBasketItems =
    candidates.find((candidate) => Array.isArray(candidate) && candidate.length > 0) ||
    candidates.find(Array.isArray);
  return Array.isArray(selectedBasketItems)
    ? (selectedBasketItems as PlannerBookingBasketItem[])
    : [];
}

export function formatPlannerCurrency(value?: number) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Not available";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function readActiveUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function sessionUserSignature(user: SessionUser | null) {
  if (!user) return "";
  return [user.id, user.email, user.mobile, user.phone, user.name, user.fullName]
    .filter(Boolean)
    .join("|");
}

function routeArray(payload: PlannerBookingPayload) {
  const variant =
    typeof payload.route?.selectedRouteVariant === "object" &&
    payload.route.selectedRouteVariant !== null
      ? (payload.route.selectedRouteVariant as Record<string, unknown>)
      : {};
  const stops = Array.isArray(variant.stops)
    ? variant.stops.map(String).filter(Boolean)
    : [];

  return stops.length
    ? stops
    : [payload.trip?.origin, payload.trip?.destination].filter(Boolean) as string[];
}

function itineraryDayCount(payload: PlannerBookingPayload) {
  if (Array.isArray(payload.itinerary)) return payload.itinerary.length;

  const itinerary = asRecord(payload.itinerary);
  if (Array.isArray(itinerary.days)) return itinerary.days.length;
  if (Array.isArray(itinerary.dayPlans)) return itinerary.dayPlans.length;
  if (Array.isArray(itinerary.itineraryDays)) return itinerary.itineraryDays.length;
  if (Array.isArray(itinerary.generatedDays)) return itinerary.generatedDays.length;

  const plan = asRecord(itinerary.plan);
  if (Array.isArray(plan.days)) return plan.days.length;

  return 0;
}

function inclusiveDateDays(startValue: unknown, endValue: unknown) {
  if (!startValue || !endValue) return 0;

  const start = new Date(String(startValue));
  const end = new Date(String(endValue));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const diff = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return diff > 0 ? diff : 0;
}

function parseDurationLabel(value: unknown) {
  const label = typeof value === "string" ? value.trim() : "";
  if (!label || /\b0\s*d\b/i.test(label)) return null;

  const nightsMatch = label.match(/(\d+)\s*n/i);
  const daysMatch = label.match(/(\d+)\s*d/i);
  const days = Number(daysMatch?.[1] || 0);
  const nights = Number(nightsMatch?.[1] || Math.max(days - 1, 0));

  return days > 0
    ? {
        days,
        label,
        nights: Math.max(nights, 0),
      }
    : null;
}

function getPlannerDuration(payload: PlannerBookingPayload) {
  const trip = asRecord(payload.trip);
  const dateRange = asRecord(trip.dateRange);
  const fromLabel = parseDurationLabel(trip.durationLabel);

  if (fromLabel) return fromLabel;

  const daysFromItinerary = itineraryDayCount(payload);

  if (daysFromItinerary > 0) {
    const nights = Math.max(daysFromItinerary - 1, 0);
    return {
      days: daysFromItinerary,
      label: `${nights}N / ${daysFromItinerary}D`,
      nights,
    };
  }

  const daysFromDates = inclusiveDateDays(
    trip.startDate || trip.date || dateRange.start,
    trip.endDate || dateRange.end
  );

  if (daysFromDates > 0) {
    const nights = Math.max(daysFromDates - 1, 0);
    return {
      days: daysFromDates,
      label: `${nights}N / ${daysFromDates}D`,
      nights,
    };
  }

  const daysFromTrip = Number(trip.days || trip.durationDays || trip.totalDays || 0);
  const nightsFromTrip = Number(trip.nights || 0);

  if (daysFromTrip > 0) {
    const nights = nightsFromTrip > 0 ? nightsFromTrip : Math.max(daysFromTrip - 1, 0);
    return {
      days: daysFromTrip,
      label: `${nights}N / ${daysFromTrip}D`,
      nights,
    };
  }

  return { days: 0, label: "Duration not available", nights: 0 };
}

function buildRooms(payload: PlannerBookingPayload) {
  const adults = Math.max(1, Number(payload.travellers?.adults || payload.travellers?.total || 1));
  const children = Math.max(0, Number(payload.travellers?.children || 0));
  const rooms = Math.max(1, Number(payload.travellers?.rooms || Math.ceil((adults + children) / 2)));

  return Array.from({ length: rooms }, (_, index) => ({
    adults: index === 0 ? adults : 0,
    children: index === 0 ? children : 0,
  }));
}

function groupBasketItems(items: PlannerBookingBasketItem[]): PlannerBookingGroup[] {
  const order: PlannerBookingCategory[] = [
    "Flight",
    "Train",
    "Bus",
    "Cab / Transfer",
    "Cruise",
    "Hotel",
    "Homestay",
    "Meal",
    "Activity",
    "Local Life",
    "Creator",
    "Local Market",
    "Insurance",
    "Visa",
    "Other",
  ];
  const groups = new Map<PlannerBookingCategory, PlannerBookingBasketItem[]>();

  items.forEach((item) => {
    const category = classifyPlannerBasketItem(item);
    groups.set(category, [...(groups.get(category) || []), item]);
  });

  return order
    .map((category) => {
      const groupedItems = groups.get(category) || [];
      return {
        category,
        items: groupedItems,
        value: groupedItems.reduce((sum, item) => sum + basketItemValue(item), 0),
      };
    })
    .filter((group) => group.items.length > 0);
}

function summaryTitleForCategory(category: PlannerBookingCategory) {
  const labels: Record<PlannerBookingCategory, string> = {
    Activity: "Activities",
    "Cab / Transfer": "Transfers",
    Bus: "Bus",
    Creator: "Creator Experience",
    Cruise: "Cruise",
    Flight: "Flights",
    Homestay: "Homestays",
    Hotel: "Hotels",
    Insurance: "Insurance",
    "Local Life": "Local Life",
    "Local Market": "Local Market",
    Meal: "Meals",
    Other: "Other",
    Train: "Trains",
    Visa: "Visa",
  };

  return labels[category];
}

function summaryIconForCategory(category: PlannerBookingCategory) {
  const icons: Record<
    PlannerBookingCategory,
    | "flight"
    | "train"
    | "bus"
    | "hotel"
    | "homestay"
    | "transfer"
    | "meal"
    | "activity"
    | "insurance"
    | "visa"
    | "cruise"
    | "localLife"
    | "creator"
    | "localMarket"
  > = {
    Activity: "activity",
    "Cab / Transfer": "transfer",
    Bus: "bus",
    Creator: "creator",
    Cruise: "cruise",
    Flight: "flight",
    Homestay: "homestay",
    Hotel: "hotel",
    Insurance: "insurance",
    "Local Life": "localLife",
    "Local Market": "localMarket",
    Meal: "meal",
    Other: "activity",
    Train: "train",
    Visa: "visa",
  };

  return icons[category];
}

function resolveTransportSummaryTitle(item: PlannerBookingBasketItem) {
  const details = asRecord(item.details);
  const text = [
    item.serviceType,
    item.type,
    item.bookingType,
    item.serviceCategory,
    item.transportMode,
    item.mode,
    item.selectedTransportMode,
    details.transportMode,
    details.mode,
    item.serviceName,
    item.serviceLabel,
    item.selectedOptionName,
    item.selectedOption,
    item.title,
    item.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(private[-_\s]?ev|electric vehicle|\bev\b)/.test(text)) return "Private EV";
  if (/(private[-_\s]?car|self[-_\s]?drive|car rental)/.test(text)) {
    return "Private Car";
  }
  if (/(train|rail)/.test(text)) return "Train";
  if (/(bus|coach)/.test(text)) return "Bus";
  if (/(cruise|ship)/.test(text)) return "Cruise";
  if (/(cab|taxi|transfer|local[-_\s]?transfer)/.test(text)) return "Cab";
  if (/(flight|flights|airline|\bair\b)/.test(text)) return "Flight";

  return "Transport";
}

export function summaryTitleForItem(
  item: PlannerBookingBasketItem,
  category: PlannerBookingCategory
) {
  if (
    category === "Flight" ||
    category === "Train" ||
    category === "Bus" ||
    category === "Cruise" ||
    category === "Cab / Transfer"
  ) {
    return resolveTransportSummaryTitle(item);
  }

  return summaryTitleForCategory(category);
}

function summaryMetaForItem(item: PlannerBookingBasketItem) {
  const dayLabel =
    item.dayLabel ||
    (item.day || item.dayNumber ? `Day ${String(item.day || item.dayNumber)}` : "");
  const date = item.date ? String(item.date) : "";
  const time = item.time ? String(item.time) : "";
  const value = basketItemValue(item);
  const valueLabel = value > 0 ? formatPlannerCurrency(value) : "";

  return [dayLabel, date, time, valueLabel].filter(Boolean).join(" • ");
}

export default function PlannerBookingPageShell() {
  const router = useRouter();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [payload, setPayload] = useState<PlannerBookingPayload | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<PackageOfferItem | null>(null);
  const [activeUser, setActiveUser] = useState<SessionUser | null>(null);
  const [wallet, setWallet] = useState<Wallet>({
    earnedCredit: 0,
    promoCredit: 0,
    refundableBalance: 0,
  });
  const [travellerValidation, setTravellerValidation] =
    useState<TravellerValidationPayload | null>(null);
  const latestUserRef = useRef<SessionUser | null>((user as SessionUser | null) || null);
  const authUserSignature = useMemo(
    () => sessionUserSignature((user as SessionUser | null) || null),
    [user]
  );

  useEffect(() => {
    latestUserRef.current = (user as SessionUser | null) || null;
  }, [user]);

  useEffect(() => {
    queueMicrotask(() => {
      setPayload(loadPlannerBookingPayload());
      setHasLoaded(true);
    });
  }, []);

  useEffect(() => {
    const syncUserAndWallet = () => {
      const sessionUser = latestUserRef.current || readActiveUser();
      setActiveUser((current) =>
        sessionUserSignature(current) === sessionUserSignature(sessionUser)
          ? current
          : sessionUser
      );

      if (sessionUser?.mobile) {
        const nextWallet = getWallet(sessionUser.mobile);
        setWallet((current) =>
          current.earnedCredit === nextWallet.earnedCredit &&
          current.promoCredit === nextWallet.promoCredit &&
          current.refundableBalance === nextWallet.refundableBalance
            ? current
            : nextWallet
        );
      } else {
        const emptyWallet = {
          earnedCredit: 0,
          promoCredit: 0,
          refundableBalance: 0,
        };
        setWallet((current) =>
          current.earnedCredit === 0 &&
          current.promoCredit === 0 &&
          current.refundableBalance === 0
            ? current
            : emptyWallet
        );
      }
    };

    syncUserAndWallet();

    window.addEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
    window.addEventListener("storage", syncUserAndWallet);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, syncUserAndWallet);
      window.removeEventListener("storage", syncUserAndWallet);
    };
  }, [authUserSignature]);

  const basketItems = useMemo<PlannerBookingBasketItem[]>(
    () => getPlannerSelectedBasketItems(payload),
    [payload]
  );

  const groupedBasket = useMemo(() => groupBasketItems(basketItems), [basketItems]);

  const smartSummaryItems = useMemo(
    () =>
      basketItems.map((item, index) => {
        const category = classifyPlannerBasketItem(item);

        return {
          body: basketItemTitle(item),
          icon: summaryIconForCategory(category),
          key: `${String(item.id || item.sourceItemId || basketItemTitle(item))}-${index}`,
          meta: summaryMetaForItem(item),
          title: summaryTitleForItem(item, category),
        };
      }),
    [basketItems]
  );
  const basketValue = useMemo(
    () => basketItems.reduce((sum, item) => sum + basketItemValue(item), 0),
    [basketItems]
  );
  const taxesAndFees = Number(payload?.budgetEstimate?.taxesPlaceholder || 0);
  const appliedOffer = Number(selectedOffer?.discountAmount || 0);
  const benefitPricing = useMemo(
    () =>
      applyBenefitPricing({
        baseAmount: basketValue,
        earnedCredit: wallet.earnedCredit,
        offerDiscount: appliedOffer,
        promoCredit: wallet.promoCredit,
        refundWallet: wallet.refundableBalance,
        taxes: taxesAndFees,
      }),
    [appliedOffer, basketValue, taxesAndFees, wallet]
  );
  const plannerFareSummary = useMemo(
    () =>
      buildPlannerFareSummary({
        benefitPricing,
        offerData: selectedOffer ? { ...selectedOffer } : null,
        selectedBasketValue: basketValue,
        taxesAndFees,
      }),
    [benefitPricing, basketValue, selectedOffer, taxesAndFees]
  );
  const totalAdults = Math.max(1, Number(payload?.travellers?.adults || payload?.travellers?.total || 1));
  const totalChildren = Math.max(0, Number(payload?.travellers?.children || 0));
  const totalRooms = Math.max(1, Number(payload?.travellers?.rooms || Math.ceil((totalAdults + totalChildren) / 2)));
  const packageSlug = "heritage-india-historical-monuments";
  const travelDate = payload?.trip?.startDate || "";
  const route = payload ? routeArray(payload) : [];
  const duration = payload
    ? getPlannerDuration(payload)
    : { days: 0, label: "Duration not available", nights: 0 };
  const days = duration.days;
  const nights = duration.nights;
  const packageContext = payload
    ? {
        cities: route,
        country: "India",
        countries: ["India"],
        isInternationalTrip: false,
        route,
        tags: ["Smart Planner", payload.trip?.tripType || "", payload.preferences?.travelStyle || ""].filter(Boolean),
        title: payload.trip?.title || "Smart Planner Trip",
      }
    : undefined;
  const rooms = useMemo(
    () => (payload ? buildRooms(payload) : [{ adults: 1, children: 0 }]),
    [payload]
  );
  const fareSnapshot = plannerFareSummaryToFare(plannerFareSummary);

  const handleContinue = () => {
    if (!payload) {
      setStatusMessage("Smart Planner checkout payload is missing. Please return to Review and try again.");
      return;
    }

    if (!basketItems.length) {
      setStatusMessage("No selected basket items found. Please return to Workspace and add at least one item.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Please login before continuing.");
      return;
    }

    if (!travellerValidation?.canProceed) {
      setStatusMessage("Please complete traveller and contact details.");
      return;
    }

    const leadTraveller = travellerValidation.travellers[0];
    const leadTravellerName = leadTraveller
      ? String(
          "fullName" in leadTraveller
            ? leadTraveller.fullName
            : `${leadTraveller.firstName || ""} ${leadTraveller.lastName || ""}`
        ).trim()
      : "";
    const leadTravellerEmail =
      travellerValidation.contactDetails?.email ||
      ("email" in (leadTraveller || {}) ? String(leadTraveller?.email || "") : "");
    const leadTravellerMobile =
      travellerValidation.contactDetails?.mobile ||
      ("mobile" in (leadTraveller || {}) ? String(leadTraveller?.mobile || "") : "");
    const normalizedContactDetails = {
      countryCode: travellerValidation.contactDetails?.countryCode || "+91",
      email: leadTravellerEmail,
      mobile: leadTravellerMobile,
    };
    const updatedCheckoutPayload = {
      ...payload,
      contactDetails: normalizedContactDetails,
      leadTraveller: {
        ...leadTraveller,
        email: leadTravellerEmail,
        mobile: leadTravellerMobile,
        name: leadTravellerName,
      },
      travellerDetails: travellerValidation.travellers,
      plannerFareSummary,
      selectedBasketValue: plannerFareSummary.selectedBasketValue,
      travellers: {
        ...payload.travellers,
        contactDetails: normalizedContactDetails,
        details: travellerValidation.travellers,
        leadTraveller: {
          ...leadTraveller,
          email: leadTravellerEmail,
          mobile: leadTravellerMobile,
          name: leadTravellerName,
        },
        profilesComplete: travellerValidation.canProceed,
      },
      updatedAt: new Date().toISOString(),
    };
    const leadTravellerPayload = {
      contactDetails: normalizedContactDetails,
      email: leadTravellerEmail,
      gstDetails: {},
      mobile: `${normalizedContactDetails.countryCode}-${leadTravellerMobile}`,
      name: leadTravellerName || "Lead Traveller",
      travellers: travellerValidation.travellers,
    };

    const draft = {
      contactDetails: normalizedContactDetails,
      createdAt: new Date().toISOString(),
      leadTraveller: leadTravellerPayload,
      payload: updatedCheckoutPayload,
      selectedBasketItems: basketItems,
      serviceGroups: groupedBasket,
      source: "smart-planner-booking",
      status: "draft",
      totalBasketValue: basketValue,
      plannerFareSummary,
      selectedBasketValue: plannerFareSummary.selectedBasketValue,
      travellerDetails: travellerValidation.travellers,
      travellerPayload: {
        contactDetails: normalizedContactDetails,
        travellers: travellerValidation.travellers,
      },
    };
    const paymentReviewPayload = {
      addOn: {
        isInternationalTrip: false,
      },
      appliedOffer,
      appliedOfferCode: selectedOffer?.code || "",
      appliedOfferTitle: selectedOffer?.title || "",
      bookingStatus: "draft",
      bookingType: "smart-planner",
      cancellation: {
        exclusions: [],
      },
      fare: {
        ...plannerFareSummaryToFare(plannerFareSummary),
        appliedOffer,
        appliedOfferCode: selectedOffer?.code || "",
        appliedOfferTitle: selectedOffer?.title || "",
        walletBreakdown: {
          ...plannerFareSummaryToFare(plannerFareSummary).walletBreakdown,
          earnedAvailable: wallet.earnedCredit,
          promoAvailable: wallet.promoCredit,
          refundWalletAvailable: wallet.refundableBalance,
        },
      },
      itinerary: {
        dayPlans: payload.itinerary,
        features: Object.fromEntries(groupedBasket.map((group) => [group.category, group.items.length])),
        packageSelectionState: null,
        travelDate,
      },
      manageBookingReady: true,
      originalBookingBaseline: {
        amount: plannerFareSummary.finalPayable,
        basePrice: plannerFareSummary.selectedBasketValue,
        feesAndTaxes: taxesAndFees,
        originCity: payload.trip?.origin || "",
        packageSlug,
        packageTitle: payload.trip?.title || "Smart Planner Trip",
        payableAmount: plannerFareSummary.finalPayable,
        totalBeforeWallet:
          plannerFareSummary.baseAfterOffer +
          plannerFareSummary.taxesAndFees +
          plannerFareSummary.convenienceFee +
          plannerFareSummary.addOnsTotal,
        upgradedDiffTotal: 0,
        variant: "withoutFlight",
      },
      paymentStatus: "pending",
      plannerFareSummary,
      serviceType: "smart-planner",
      source: "smart-planner",
      smartPlannerPayload: updatedCheckoutPayload,
      summary: {
        days,
        features: Object.fromEntries(groupedBasket.map((group) => [group.category, group.items.length])),
        includedActivityLabels: [],
        includedFlightLabels: [],
        includedHotelLabels: [],
        includedMealLabels: [],
        includedTransferLabels: [],
        isInternationalTrip: false,
        nights,
        originCity: payload.trip?.origin || "",
        packageSelectionState: null,
        packageSlug,
        packageTitle: payload.trip?.title || "Your Smart Planner Trip",
        route,
        rooms: buildRooms(payload),
        selectedBasketItems: basketItems,
        selectedVariant: {
          label: "Smart Planner Basket",
          pricePerPerson: Math.round(basketValue / Math.max(totalAdults, 1)),
        },
        totalAdults,
        totalChildren,
        totalRooms,
        travelDate,
        variant: "withoutFlight",
      },
      timestamp: Date.now(),
      traveller: {
        allRequiredTravellersCompleted:
          travellerValidation.allRequiredTravellersCompleted,
        canProceed: travellerValidation.canProceed,
        contactDetails: leadTravellerPayload.contactDetails,
        gstDetails: travellerValidation.gstDetails || {},
        travellers: travellerValidation.travellers,
      },
    };

    try {
      console.info("[Smart Planner Booking] Proceed to payment handoff started", {
        basketItems: basketItems.length,
        basketValue,
        canProceed: travellerValidation.canProceed,
        route: "/smart-planner/payment",
      });
      logSmartPlannerProceedStorageSummary();

      const itinerarySummary = Array.isArray(updatedCheckoutPayload.itinerary)
        ? updatedCheckoutPayload.itinerary.map((day, index) => {
            const dayRecord = asRecord(day);
            return {
              city: dayRecord.city || dayRecord.destination || dayRecord.location || "",
              date: dayRecord.date || dayRecord.dayDate || "",
              day: dayRecord.day || dayRecord.dayNumber || index + 1,
              dayLabel: dayRecord.dayLabel || `Day ${index + 1}`,
              id: dayRecord.id || dayRecord.dayId || index + 1,
              itemsCount: Array.isArray(dayRecord.items)
                ? dayRecord.items.length
                : Array.isArray(dayRecord.activities)
                  ? dayRecord.activities.length
                  : 0,
              status: dayRecord.status || dayRecord.dayStatus || "planned",
              title: dayRecord.title || dayRecord.dayTitle || "",
            };
          })
        : [];
      const fullPlannerDraftDetail = {
        checkoutPayload: updatedCheckoutPayload,
        draft,
        paymentReviewPayload,
        plannerFareSummary,
        selectedBasketItems: basketItems,
        source: "smart-planner-booking",
        updatedAt: new Date().toISOString(),
      };
      const detailSave = savePlannerDetailPayload(
        `planner_booking_payment_${Date.now()}`,
        fullPlannerDraftDetail
      );
      const detailStorageKey = detailSave.key || "";
      const detailRecord = compactPlannerDetailRecord(detailStorageKey, {
        basketItems: basketItems.length,
        basketValue: plannerFareSummary.selectedBasketValue,
        key: PLANNER_BOOKING_DRAFT_KEY,
        route,
        savedAt: new Date().toISOString(),
      });
      const compactSmartPlannerPayload = {
        bookingMode: updatedCheckoutPayload.bookingMode,
        contactDetails: normalizedContactDetails,
        detailStorageKey,
        durationLabel: getPlannerDuration(updatedCheckoutPayload),
        itinerary: itinerarySummary,
        leadTraveller: leadTravellerPayload,
        plannerFareSummary,
        route: updatedCheckoutPayload.route,
        routeLabel: route.join(" -> "),
        selectedBasketItems: basketItems,
        selectedBasketValue: plannerFareSummary.selectedBasketValue,
        source: "smart-planner",
        trip: updatedCheckoutPayload.trip,
        travellers: updatedCheckoutPayload.travellers,
        updatedAt: updatedCheckoutPayload.updatedAt,
      };
      const compactDraft = {
        ...draft,
        detailRecord,
        detailStorageKey,
        fullDetailStorageKey: detailStorageKey,
        payload: compactSmartPlannerPayload,
      };
      const compactPaymentReviewPayload = {
        ...paymentReviewPayload,
        detailRecord,
        detailStorageKey,
        fullDetailStorageKey: detailStorageKey,
        itinerary: {
          ...paymentReviewPayload.itinerary,
          dayPlans: itinerarySummary,
        },
        smartPlannerPayload: compactSmartPlannerPayload,
      };

      const leadTravellerSerialized = serializeBookingPayload(
        "tplPaymentLeadTraveller",
        leadTravellerPayload
      );
      const plannerPaymentSerialized = serializeBookingPayload(
        PLANNER_PAYMENT_KEY,
        compactPaymentReviewPayload
      );
      const checkoutSerialized = serializeBookingPayload(
        TIYA_CHECKOUT_PAYLOAD_KEY,
        compactSmartPlannerPayload
      );
      const plannerDraftSerialized = serializeBookingPayload(
        PLANNER_BOOKING_DRAFT_KEY,
        compactDraft
      );

      writeRequiredSessionStorage("tplPaymentLeadTraveller", leadTravellerSerialized);
      writeRequiredSessionStorage(PLANNER_PAYMENT_KEY, plannerPaymentSerialized);
      writeRequiredSessionStorage(TIYA_CHECKOUT_PAYLOAD_KEY, checkoutSerialized);
      writeRequiredSessionStorage(PLANNER_BOOKING_DRAFT_KEY, plannerDraftSerialized);

      writeOptionalLocalStorage(PLANNER_PAYMENT_KEY, plannerPaymentSerialized);
      writeOptionalLocalStorage(TIYA_CHECKOUT_PAYLOAD_KEY, checkoutSerialized);
      writeOptionalLocalStorage(PLANNER_BOOKING_DRAFT_KEY, plannerDraftSerialized);

      console.info("[Smart Planner Booking] Proceed to payment handoff saved", {
        keys: [
          "tplPaymentLeadTraveller",
          PLANNER_PAYMENT_KEY,
          TIYA_CHECKOUT_PAYLOAD_KEY,
          PLANNER_BOOKING_DRAFT_KEY,
        ],
        detailStorageKey,
        route: "/smart-planner/payment",
      });

      router.push("/smart-planner/payment");
    } catch (error) {
      console.error("[Smart Planner Booking] Proceed to payment handoff failed", error);
      setStatusMessage(
        `Unable to save Smart Planner booking draft in this browser session. ${bookingErrorMessage(error)}`
      );
    }
  };

  if (!hasLoaded) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          Loading Smart Planner booking...
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-orange-600">
            Smart Planner Booking
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-950">
            No Smart Planner checkout payload found
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            Return to the review page and use Proceed To Book again so the booking payload can be prepared.
          </p>
          <button
            type="button"
            onClick={() => router.push("/smart-planner/review")}
            className="mt-8 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20"
          >
            Back to Review
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-6 text-black lg:pb-0">
      <div className="border-b border-slate-100 bg-white px-3 py-2 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <div
        style={{
          background: "#f5f7fb",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <BookingTopNav />
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,76%)_minmax(0,24%)] lg:items-start">
          <div className="min-w-0">
            <div className="mb-4">
              <BookingPackageSummary
                fareSnapshot={fareSnapshot}
                durationLabel={duration.label}
                includedActivityLabels={[]}
                includedFlightLabels={[]}
                includedHotelLabels={[]}
                includedMealLabels={[]}
                includedTransferLabels={[]}
                nights={nights}
                originCity={payload.trip?.origin || ""}
                packageSlug="smart-planner"
                packageTitle={payload.trip?.title || "Your Smart Planner Trip"}
                pricePerPerson={Math.round(basketValue / Math.max(totalAdults, 1))}
                rooms={rooms}
                route={route}
                selectionState={{
                  finalPrice: basketValue,
                  selectedActivities: [],
                  selectedFlights: [],
                  selectedHotels: [],
                  selectedMeals: [],
                  selectedTransfers: [],
                }}
                smartSummaryItems={smartSummaryItems}
                totalAdults={totalAdults}
                totalChildren={totalChildren}
                totalPrice={basketValue}
                totalRooms={totalRooms}
                travelDate={travelDate}
                variant="withoutFlight"
              />
            </div>

            <LoginStrip
              activeUser={activeUser}
              isAuthenticated={isAuthenticated}
              onLogin={() => openLoginModal({ accountType: "personal", intent: "ai" })}
            />

            <div
              className="mt-4"
              style={{
                background: "#ffffff",
                border: "1px solid #d9e2ec",
                borderRadius: "0",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                overflow: "hidden",
              }}
            >
              <BookingTravellersSection
                defaultOpen
                isInternationalTrip={false}
                onValidationChange={setTravellerValidation}
                rooms={rooms}
              />

              <BookingAddOnsSection isInternationalTrip={false} />

              <div className="border-t border-[#d9e2ec]">
                <PlannerBookingBasketSummary groups={groupedBasket} />
              </div>

              <div className="border-t border-[#d9e2ec]">
                <PlannerBookingDaywiseItinerary payload={payload} basketItems={basketItems} />
              </div>

              <BookingCancellationSection travelDate={travelDate} />
            </div>
          </div>

          <aside className="min-w-0">
            <div className="space-y-4">
            <PlannerBookingFareSummary
              basketItems={basketItems}
              basketValue={basketValue}
              benefitPricing={benefitPricing}
              plannerFareSummary={plannerFareSummary}
              selectedOffer={selectedOffer}
              payload={payload}
              taxesAndFees={taxesAndFees}
            />
            <PlannerBookingActionBar
              basketItemsCount={basketItems.length}
              basketValue={basketValue}
              canContinue={Boolean(
                basketItems.length &&
                  isAuthenticated &&
                  travellerValidation?.canProceed
              )}
              disabledReason={
                !basketItems.length
                  ? "No selected basket items found."
                  : !isAuthenticated
                    ? "Please login before continuing."
                    : !travellerValidation?.canProceed
                      ? "Please complete traveller and contact details."
                      : ""
              }
              onContinue={handleContinue}
              statusMessage={statusMessage}
            />
            <BookingPackageOffersSection
              appliedOfferCode={selectedOffer?.code || ""}
              bookingValue={basketValue || 25000}
              onApplyOffer={setSelectedOffer}
              onRemoveOffer={() => setSelectedOffer(null)}
              packageContext={packageContext}
            />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function LoginStrip({
  activeUser,
  isAuthenticated,
  onLogin,
}: {
  activeUser: SessionUser | null;
  isAuthenticated: boolean;
  onLogin: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#f3d7c7] bg-[#fff7ed] px-5 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <div className="text-[15px] font-extrabold text-slate-900">
            {isAuthenticated
              ? `Logged in as ${getLoggedInDisplayName(activeUser)}`
              : "Login Now to avail exciting offers"}
          </div>
          <div className="mt-1 text-[13px] text-slate-600">
            {isAuthenticated
              ? "Saved traveller details and wallet benefits can be used for faster booking."
              : "Use saved travellers, Promo Credit, Earned Credit and Refund Wallet."}
          </div>
        </div>

        {!isAuthenticated ? (
          <button
            type="button"
            onClick={onLogin}
            className="h-[42px] w-full rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-extrabold text-slate-900 transition hover:border-sky-400 hover:text-sky-600 sm:w-auto"
          >
            LOGIN
          </button>
        ) : null}
      </div>
    </div>
  );
}
