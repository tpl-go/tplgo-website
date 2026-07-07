"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import {
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { readChunkedBookingDetail } from "@/app/lib/booking/chunkedBookingStorage";
import { resolvePlannerPayloadRecord } from "@/app/lib/ecosystem/planner/plannerPayloadStorage";

type RecordValue = Record<string, unknown>;

const SMART_PLANNER_STORAGE_KEYS = [
  "tpl_tiya_planner_confirmation_v1",
  "tpl_tiya_planner_payment_v1",
  "tpl_tiya_planner_booking_draft_v1",
  "tpl_tiya_checkout_v1",
  "tpl_tiya_review_draft_v1",
  "tpl_tiya_workspace_review_payload_v1",
  "tpl_tiya_booking_route_result_v1",
  "tpl_tiya_checkout_draft",
  "tpl_tiya_checkout_draft_v1",
  "tpl_tiya_selected_bundle",
  "tpl_tiya_quote_preview",
  "tpl_tiya_custom_package_draft",
  "tpl_tiya_smart_basket_draft",
];

const BOOKING_DETAIL_INDEX_KEY = "tpl_booking_index_v1";

export type SmartPlannerBookingResolveResult = {
  availableBookingIds: string[];
  booking: BookingItem | null;
  checkedStorageKeys: string[];
  fullPayload: RecordValue | null;
  originalPayload: RecordValue | null;
  payload: RecordValue | null;
  rawPayloadAvailable: boolean;
  requestedBookingId: string;
};

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function readStorageJSON(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    if (!raw) return null;
    return resolvePlannerPayloadRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readBookingDetailIndexManifest(bookingId: string) {
  if (typeof window === "undefined") return "";

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(BOOKING_DETAIL_INDEX_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(rows)) continue;
      const match = rows.find((row) => {
        const record = asRecord(row);
        return text(record.bookingId) === bookingId || text(record.id) === bookingId;
      });
      const manifestKey = text(asRecord(match).manifestKey);
      if (manifestKey) return manifestKey;
    } catch {
      // Try next storage backend.
    }
  }

  return "";
}

function deepIds(value: unknown, depth = 0): string[] {
  if (!value || depth > 5) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => deepIds(item, depth + 1));
  }

  const record = asRecord(value);
  if (!Object.keys(record).length) return [];

  const direct = [
    record.id,
    record.bookingId,
    record.referenceId,
    record.confirmationId,
    record.packageBookingId,
    record.smartPlannerBookingId,
    asRecord(record.bookingMeta).bookingId,
    asRecord(record.confirmation).bookingId,
    asRecord(record.payment).bookingId,
    asRecord(record.summary).bookingId,
  ]
    .map(text)
    .filter(Boolean);

  const nested = [
    record.payload,
    record.smartPlannerPayload,
    record.reviewPayload,
    record.checkoutPayload,
    record.confirmationPayload,
    record.plannerPayload,
    record.booking,
  ].flatMap((item) => deepIds(item, depth + 1));

  return Array.from(new Set([...direct, ...nested]));
}

function mergeBookingAndPayload(booking: BookingItem | null, payload: unknown): RecordValue {
  const payloadRecord = asRecord(payload);
  const smartPlannerPayload = asRecord(payloadRecord.smartPlannerPayload);
  const selectedServices = asRecord(payloadRecord.selectedServices);

  return {
    ...payloadRecord,
    dayPlans:
      payloadRecord.dayPlans ||
      asRecord(payloadRecord.itinerary).dayPlans ||
      asRecord(payloadRecord.itinerary).days ||
      smartPlannerPayload.dayPlans ||
      asRecord(smartPlannerPayload.itinerary).dayPlans ||
      asRecord(smartPlannerPayload.itinerary).days,
    itinerary:
      payloadRecord.itinerary ||
      smartPlannerPayload.itinerary ||
      (payloadRecord.dayPlans ? { dayPlans: payloadRecord.dayPlans } : undefined),
    plannerAudit: payloadRecord.plannerAudit || smartPlannerPayload.plannerAudit,
    plannerIntelligence:
      payloadRecord.plannerIntelligence || smartPlannerPayload.plannerIntelligence,
    readinessStatus: payloadRecord.readinessStatus || smartPlannerPayload.readinessStatus,
    routeData:
      payloadRecord.routeData ||
      payloadRecord.route ||
      smartPlannerPayload.routeData ||
      smartPlannerPayload.route,
    routeVariants: payloadRecord.routeVariants || smartPlannerPayload.routeVariants,
    selectedActivities:
      payloadRecord.selectedActivities ||
      selectedServices.selectedActivities ||
      smartPlannerPayload.selectedActivities,
    selectedBasketItems:
      payloadRecord.selectedBasketItems || smartPlannerPayload.selectedBasketItems,
    selectedCabs:
      payloadRecord.selectedCabs || selectedServices.selectedCabs || smartPlannerPayload.selectedCabs,
    selectedCreatorSpots:
      payloadRecord.selectedCreatorSpots ||
      selectedServices.selectedCreatorSpots ||
      smartPlannerPayload.selectedCreatorSpots,
    selectedHotels:
      payloadRecord.selectedHotels ||
      selectedServices.selectedHotels ||
      smartPlannerPayload.selectedHotels,
    selectedHomestays:
      payloadRecord.selectedHomestays ||
      selectedServices.selectedHomestays ||
      smartPlannerPayload.selectedHomestays,
    selectedLocalMarketItems:
      payloadRecord.selectedLocalMarketItems ||
      selectedServices.selectedLocalMarketItems ||
      smartPlannerPayload.selectedLocalMarketItems,
    selectedMeals:
      payloadRecord.selectedMeals ||
      selectedServices.selectedMeals ||
      smartPlannerPayload.selectedMeals,
    selectedRoute:
      payloadRecord.selectedRoute || smartPlannerPayload.selectedRoute,
    selectedRouteVariant:
      payloadRecord.selectedRouteVariant || smartPlannerPayload.selectedRouteVariant,
    selectedTransfers:
      payloadRecord.selectedTransfers ||
      selectedServices.selectedTransfers ||
      smartPlannerPayload.selectedTransfers,
    booking,
    bookingRecord: booking,
    fullPayload: payloadRecord,
    originalPayload: payloadRecord,
    __rawPayload: payloadRecord,
    payload: payloadRecord,
    rawPayloadAvailable: Object.keys(payloadRecord).length > 0,
  };
}

function resolvePayloadForBooking(booking: BookingItem | null): RecordValue | null {
  if (!booking) return null;

  const record = booking as BookingItem & {
    detailPayloadStorageKey?: string;
    detailStorageKey?: string;
    bookingId?: string;
  };
  const candidateKeys = [
    record.detailStorageKey,
    record.detailPayloadStorageKey,
    booking.payloadStorageKey,
    readBookingDetailIndexManifest(booking.id),
    readBookingDetailIndexManifest(text(record.bookingId)),
    booking.id,
    text(record.bookingId),
  ].filter((key): key is string => Boolean(key));

  for (const key of Array.from(new Set(candidateKeys))) {
    try {
      const payload =
        getBookingPayload<RecordValue>(key) ||
        readChunkedBookingDetail<RecordValue>(key) ||
        resolvePlannerPayloadRecord<RecordValue>(readStorageJSON(key));
      const resolved = asRecord(resolvePlannerPayloadRecord(payload));
      if (Object.keys(resolved).length) return resolved;
    } catch {
      // Try next candidate key.
    }
  }

  return null;
}

export function resolveSmartPlannerBooking(
  requestedBookingId: string
): SmartPlannerBookingResolveResult {
  const allPlannerBookings =
    typeof window === "undefined"
      ? []
      : getAllBookings().filter((booking) => {
          const record = booking as BookingItem & {
            bookingId?: string;
            referenceId?: string;
            service?: string;
          };

          return (
            booking.type === "smart-planner" ||
            record.service === "smart-planner" ||
            booking.id.startsWith("TPL-SPL-") ||
            String(record.bookingId || "").startsWith("TPL-SPL-") ||
            String(record.referenceId || "").startsWith("TPL-SPL-")
          );
        });

  const availableBookingIds = Array.from(
    new Set(
      allPlannerBookings
        .flatMap((booking) => {
          const record = booking as BookingItem & {
            bookingId?: string;
            referenceId?: string;
          };

          return [
            booking.id,
            text(record.bookingId),
            text(record.referenceId),
            booking.payloadStorageKey || "",
          ];
        })
        .filter(Boolean)
    )
  );

  const directBooking =
    allPlannerBookings.find((booking) => {
      const record = booking as BookingItem & {
        bookingId?: string;
        referenceId?: string;
      };

      return (
        booking.id === requestedBookingId ||
        record.bookingId === requestedBookingId ||
        record.referenceId === requestedBookingId ||
        booking.payloadStorageKey === requestedBookingId
      );
    }) || null;

  if (directBooking) {
    const payload = resolvePayloadForBooking(directBooking);

    return {
      availableBookingIds,
      booking: directBooking,
      checkedStorageKeys: ["tpl_bookings_v1", directBooking.payloadStorageKey || ""].filter(Boolean),
      fullPayload: asRecord(payload),
      originalPayload: asRecord(payload),
      payload: mergeBookingAndPayload(directBooking, payload || {}),
      rawPayloadAvailable: Boolean(payload && Object.keys(asRecord(payload)).length),
      requestedBookingId,
    };
  }

  for (const booking of allPlannerBookings) {
    const payload = resolvePayloadForBooking(booking);
    const ids = deepIds(payload);

    if (ids.includes(requestedBookingId)) {
      return {
        availableBookingIds: Array.from(new Set([...availableBookingIds, ...ids])),
        booking,
        checkedStorageKeys: ["tpl_bookings_v1", booking.payloadStorageKey || ""].filter(Boolean),
        fullPayload: asRecord(payload),
        originalPayload: asRecord(payload),
        payload: mergeBookingAndPayload(booking, payload || {}),
        rawPayloadAvailable: Boolean(payload && Object.keys(asRecord(payload)).length),
        requestedBookingId,
      };
    }
  }

  for (const key of SMART_PLANNER_STORAGE_KEYS) {
    const stored = readStorageJSON(key);
    const ids = deepIds(stored);

    if (ids.length) availableBookingIds.push(...ids);

    if (ids.includes(requestedBookingId)) {
      const matchedBooking =
        allPlannerBookings.find((booking) => ids.includes(booking.id)) || null;

      return {
        availableBookingIds: Array.from(new Set(availableBookingIds)),
        booking: matchedBooking,
        checkedStorageKeys: ["tpl_bookings_v1", key],
        fullPayload: asRecord(stored),
        originalPayload: asRecord(stored),
        payload: mergeBookingAndPayload(matchedBooking, stored || {}),
        rawPayloadAvailable: Boolean(stored && Object.keys(asRecord(stored)).length),
        requestedBookingId,
      };
    }
  }

  return {
    availableBookingIds: Array.from(new Set(availableBookingIds)),
    booking: null,
    checkedStorageKeys: ["tpl_bookings_v1", ...SMART_PLANNER_STORAGE_KEYS],
    fullPayload: null,
    originalPayload: null,
    payload: null,
    rawPayloadAvailable: false,
    requestedBookingId,
  };
}
