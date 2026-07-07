"use client";

import { getAllBookings, type BookingItem } from "@/app/lib/booking/bookingStorage";
import {
  readChunkedBookingDetail,
  type BookingDetailManifest,
} from "@/app/lib/booking/chunkedBookingStorage";
import {
  resetSmartPlannerWorkingSession,
  resolvePlannerPayloadRecord,
} from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import { resolveSmartPlannerBooking } from "@/app/lib/ecosystem/planner/smartPlannerBookingResolver";

type RecordValue = Record<string, unknown>;

export type PlannerSnapshotStage =
  | "workspace"
  | "review"
  | "payment"
  | "confirmation"
  | "myBookingCard"
  | "chunkedDetail"
  | "viewDetailResolver"
  | "manageResolver";

export type PlannerStorageSnapshot = {
  exists: boolean;
  importantFieldsFound: string[];
  key: string;
  parsed: unknown;
  problem: string;
  size: number;
  storage: "localStorage" | "sessionStorage";
};

export type PlannerStageSnapshot = {
  bookingId?: string;
  label: string;
  payload: unknown;
  size: number;
  sourceKeys: string[];
  stage: PlannerSnapshotStage;
};

export type PlannerFieldComparison = {
  destinationValue: string;
  field: string;
  lostBetween: string;
  sourceValue: string;
  stageValues: Record<PlannerSnapshotStage, string>;
  status: "present" | "missing" | "empty" | "mismatched";
};

export type PlannerFlowIssue = {
  field: string;
  lostBetween: string;
  priority: "high" | "medium" | "low";
  reason: string;
  suggestedFixFile: string;
};

export type SmartPlannerFlowSnapshots = {
  bookingIds: {
    chunkedDetail?: string;
    confirmation?: string;
    latest?: string;
    myBookingCard?: string;
    payment?: string;
    resolver?: string;
  };
  latestBooking: BookingItem | null;
  snapshots: Record<PlannerSnapshotStage, PlannerStageSnapshot>;
  storageSnapshots: PlannerStorageSnapshot[];
};

export type SmartPlannerFlowDiagnostic = {
  bookingIdComparison: SmartPlannerFlowSnapshots["bookingIds"];
  fieldComparisons: PlannerFieldComparison[];
  issues: PlannerFlowIssue[];
  snapshotSummary: {
    chunkedDetailAvailable: boolean;
    confirmationPayloadAvailable: boolean;
    latestSmartPlannerBookingId: string;
    manageResolverHasFullPayload: boolean;
    myBookingCardAvailable: boolean;
    viewDetailResolverHasFullPayload: boolean;
  };
  snapshots: SmartPlannerFlowSnapshots;
  storageSnapshots: PlannerStorageSnapshot[];
};

const BOOKING_STORAGE_KEY = "tpl_bookings_v1";
const BOOKING_DETAIL_INDEX_KEY = "tpl_booking_index_v1";
const BOOKING_MANIFEST_PREFIX = "tpl_booking_detail_manifest_";
const BOOKING_CHUNK_PREFIX = "tpl_booking_detail_chunk_";

const SMART_PLANNER_STORAGE_KEYS = [
  "tpl_smart_planner_generated_routes_v1",
  "tpl_smart_planner_return_search_v1",
  "tpl_smart_planner_workspace_draft_v1",
  "tpl_smart_planner_flight_search_v1",
  "tpl_smart_planner_cab_search_v1",
  "tpl_smart_planner_hotel_search_v1",
  "tpl_smart_planner_homestay_search_v1",
  "tpl_tiya_selected_route_preview",
  "tpl_tiya_workspace_draft",
  "tpl_tiya_workspace_review_payload_v1",
  "tpl_tiya_review_draft_v1",
  "tpl_tiya_checkout_v1",
  "tpl_tiya_checkout_draft",
  "tpl_tiya_checkout_draft_v1",
  "tpl_tiya_selected_bundle",
  "tpl_tiya_quote_preview",
  "tpl_tiya_booking_route_result_v1",
  "tpl_tiya_smart_basket_draft",
  "tpl_tiya_custom_package_draft",
  "tpl_tiya_planner_booking_draft_v1",
  "tpl_tiya_planner_payment_v1",
  "tpl_tiya_planner_confirmation_v1",
  "tpl_tiya_recommendation_state_v1",
  "tpl_my_trips_restore_basket_v1",
  "tpl_my_trips_active_trip_id_v1",
  BOOKING_STORAGE_KEY,
  BOOKING_DETAIL_INDEX_KEY,
] as const;

const FIELD_MATRIX: Array<{
  field: string;
  paths: string[];
  suggestedFixFile: string;
}> = [
  { field: "bookingId", paths: ["bookingId", "smartPlannerBookingId", "bookingMeta.bookingId", "payment.bookingId", "id"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "smartPlannerBookingId", paths: ["smartPlannerBookingId", "bookingMeta.smartPlannerBookingId", "bookingMeta.bookingId"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "type/serviceType", paths: ["type", "serviceType", "service", "bookingMeta.service"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "routeLabel", paths: ["routeLabel", "route.label", "route.name", "summary.route", "trip.routeLabel", "smartPlannerPayload.route.name"], suggestedFixFile: "smartPlannerBookingNormalizer.ts" },
  { field: "origin/from", paths: ["origin", "from", "trip.origin", "trip.fromCity", "smartPlannerPayload.trip.origin", "smartPlannerPayload.trip.fromCity"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "destination/to", paths: ["destination", "to", "trip.destination", "trip.toCity", "smartPlannerPayload.trip.destination", "smartPlannerPayload.trip.toCity"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "travelDate", paths: ["travelDate", "summary.travelDate", "trip.startDate", "smartPlannerPayload.trip.startDate"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "startDate", paths: ["startDate", "trip.startDate", "smartPlannerPayload.trip.startDate"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "endDate", paths: ["endDate", "trip.endDate", "smartPlannerPayload.trip.endDate"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "durationLabel", paths: ["durationLabel", "summary.durationLabel", "trip.durationLabel", "smartPlannerPayload.trip.durationLabel", "routeData.duration"], suggestedFixFile: "smartPlannerBookingNormalizer.ts" },
  { field: "travellerCount", paths: ["travellerCount", "travellers.total", "summary.totalAdults", "smartPlannerPayload.travellers.total"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "travellers", paths: ["travellers", "traveller.travellers", "travellerDetails", "smartPlannerPayload.travellerDetails", "smartPlannerPayload.travellers"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "contact/email/mobile", paths: ["contactDetails", "traveller.contactDetails", "leadTraveller", "smartPlannerPayload.contactDetails"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "status", paths: ["status", "bookingStatus"], suggestedFixFile: "bookingStorage.ts" },
  { field: "paymentStatus", paths: ["paymentStatus", "payment.paymentActionState", "payment.status"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "selectedBasketValue", paths: ["selectedBasketValue", "plannerFareSummary.selectedBasketValue", "fareSummary.selectedBasketValue", "smartPlannerPayload.selectedBasketValue"], suggestedFixFile: "plannerPricing.ts" },
  { field: "baseAmount", paths: ["baseAmount", "plannerFareSummary.baseAmount", "fareSummary.baseAmount"], suggestedFixFile: "plannerPricing.ts" },
  { field: "baseAfterOffer", paths: ["baseAfterOffer", "plannerFareSummary.baseAfterOffer", "fareSummary.baseAfterOffer"], suggestedFixFile: "plannerPricing.ts" },
  { field: "offerDiscount", paths: ["offerDiscount", "plannerFareSummary.offerDiscount", "fare.couponDiscount"], suggestedFixFile: "plannerPricing.ts" },
  { field: "taxesAndFees", paths: ["taxesAndFees", "plannerFareSummary.taxesAndFees", "fare.feesAndTaxes"], suggestedFixFile: "plannerPricing.ts" },
  { field: "totalBeforeWallet", paths: ["totalBeforeWallet", "plannerFareSummary.totalBeforeWallet", "fare.totalBeforeWallet"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "promoCreditUsed", paths: ["promoCreditUsed", "plannerFareSummary.promoCreditUsed", "fare.walletBreakdown.promoCreditUsed"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "earnedCreditUsed", paths: ["earnedCreditUsed", "plannerFareSummary.earnedCreditUsed", "fare.walletBreakdown.earnedCreditUsed"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "refundWalletUsed", paths: ["refundWalletUsed", "plannerFareSummary.refundWalletUsed", "fare.walletBreakdown.refundWalletUsed"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "totalPaid", paths: ["totalPaid", "payment.amountPaid", "plannerFareSummary.finalPayable", "fare.grandTotal"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "paidAmount", paths: ["paidAmount", "payment.amountPaid", "amount"], suggestedFixFile: "bookingStorage.ts" },
  { field: "earnedCreditAmount", paths: ["earnedCreditAmount", "plannerFareSummary.earnedCreditAmount", "fare.walletBreakdown.earnedOnThisBooking"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "fareSummary", paths: ["fareSummary", "plannerFareSummary", "pricing.fareSummary", "fare.plannerFareSummary"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "pricing", paths: ["pricing", "plannerFareSummary", "fare"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "paymentSummary", paths: ["paymentSummary", "payment"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "walletSummary", paths: ["walletSummary", "plannerFareSummary.walletSummary", "fare.walletBreakdown"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "offerSummary", paths: ["offerSummary", "plannerFareSummary.offerData", "fare.appliedCoupon"], suggestedFixFile: "PlannerPaymentPageShell.tsx" },
  { field: "selectedBasketItems", paths: ["selectedBasketItems", "smartPlannerPayload.selectedBasketItems", "checkoutPayload.selectedBasketItems"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "itinerary", paths: ["itinerary", "smartPlannerPayload.itinerary"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "itinerary.days", paths: ["itinerary.days", "smartPlannerPayload.itinerary.days"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "itinerary.dayPlans", paths: ["itinerary.dayPlans", "dayPlans", "smartPlannerPayload.itinerary.dayPlans"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedHotels", paths: ["selectedHotels", "selectedServices.selectedHotels", "smartPlannerPayload.selectedHotels"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedHomestays", paths: ["selectedHomestays", "selectedServices.selectedHomestays", "smartPlannerPayload.selectedHomestays"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedTransfers", paths: ["selectedTransfers", "selectedServices.selectedTransfers", "smartPlannerPayload.selectedTransfers"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedCabs", paths: ["selectedCabs", "selectedServices.selectedCabs", "smartPlannerPayload.selectedCabs"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedActivities", paths: ["selectedActivities", "selectedServices.selectedActivities", "smartPlannerPayload.selectedActivities"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedMeals", paths: ["selectedMeals", "selectedServices.selectedMeals", "smartPlannerPayload.selectedMeals"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedLocalMarketItems", paths: ["selectedLocalMarketItems", "selectedServices.selectedLocalMarketItems", "smartPlannerPayload.selectedLocalMarketItems"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedCreatorSpots", paths: ["selectedCreatorSpots", "selectedServices.selectedCreatorSpots", "smartPlannerPayload.selectedCreatorSpots"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "routeData", paths: ["routeData", "route", "smartPlannerPayload.routeData", "smartPlannerPayload.route"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "routeVariants", paths: ["routeVariants", "routeOptions", "smartPlannerPayload.routeVariants", "smartPlannerPayload.routeOptions"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedRoute", paths: ["selectedRoute", "smartPlannerPayload.selectedRoute"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "selectedRouteVariant", paths: ["selectedRouteVariant", "route.selectedRouteVariant", "smartPlannerPayload.selectedRouteVariant"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "plannerIntelligence", paths: ["plannerIntelligence", "smartPlannerPayload.plannerIntelligence"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "plannerAudit", paths: ["plannerAudit", "smartPlannerPayload.plannerAudit"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "readinessStatus", paths: ["readinessStatus", "smartPlannerPayload.readinessStatus"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "notes", paths: ["notes", "smartPlannerPayload.notes"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "dayStatus", paths: ["dayStatus", "dayStatuses", "smartPlannerPayload.dayStatus", "smartPlannerPayload.dayStatuses"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
  { field: "payloadStorageKey", paths: ["payloadStorageKey"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "detailStorageKey", paths: ["detailStorageKey"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "detailPayloadStorageKey", paths: ["detailPayloadStorageKey"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "manifestKey", paths: ["manifestKey", "payloadStorageKey", "detailStorageKey"], suggestedFixFile: "chunkedBookingStorage.ts" },
  { field: "hasChunkedDetail", paths: ["hasChunkedDetail"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "detailSaved", paths: ["detailSaved"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "smartPlannerDetailSaved", paths: ["smartPlannerDetailSaved"], suggestedFixFile: "PlannerConfirmationPageShell.tsx" },
  { field: "chunk count", paths: ["chunkCount", "manifest.chunkCount"], suggestedFixFile: "chunkedBookingStorage.ts" },
  { field: "payload size", paths: ["payloadSize", "size"], suggestedFixFile: "smartPlannerBookingPayload.ts" },
];

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function safeParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function getStore(storage: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") return null;
  return storage === "localStorage" ? window.localStorage : window.sessionStorage;
}

function readStorageJSON(key: string, storage?: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") return null;
  const stores = storage ? [storage] : (["sessionStorage", "localStorage"] as const);
  for (const storeName of stores) {
    const store = getStore(storeName);
    const parsed = safeParse(store?.getItem(key) || null);
    if (parsed !== null) return resolvePlannerPayloadRecord(parsed);
  }
  return null;
}

function rawStorageSize(key: string, storage: "localStorage" | "sessionStorage") {
  const store = getStore(storage);
  return store?.getItem(key)?.length || 0;
}

function valueAtPath(value: unknown, path: string): unknown {
  if (!path) return value;
  const parts = path.split(".");
  let current: unknown = value;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      current = Number.isInteger(index) ? current[index] : undefined;
    } else {
      current = asRecord(current)[part];
    }
  }
  return current;
}

function hasMeaningfulValue(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function summarizeValue(value: unknown): string {
  if (!hasMeaningfulValue(value)) return "";
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object") {
    const record = asRecord(value);
    const label = text(record.title) || text(record.name) || text(record.label) || text(record.id);
    return label ? `{${label}}` : `{${Object.keys(record).slice(0, 5).join(", ")}}`;
  }
  return text(value);
}

function normalizeComparable(value: unknown): string {
  if (!hasMeaningfulValue(value)) return "";
  if (Array.isArray(value)) return `array:${value.length}`;
  if (typeof value === "object") {
    const record = asRecord(value);
    return text(record.id) || text(record.bookingId) || text(record.title) || JSON.stringify(record).slice(0, 240);
  }
  return text(value).toLowerCase();
}

function importantFieldsFound(payload: unknown) {
  return FIELD_MATRIX.filter((field) =>
    field.paths.some((path) => hasMeaningfulValue(valueAtPath(payload, path)))
  ).map((field) => field.field);
}

function bookingIdFromPayload(payload: unknown) {
  return (
    text(getPlannerFieldValue(payload, ["bookingId", "smartPlannerBookingId", "bookingMeta.bookingId", "payment.bookingId", "id"])) ||
    ""
  );
}

function getLatestSmartPlannerBooking(bookings: BookingItem[]) {
  const plannerBookings = bookings.filter((booking) => {
    const record = booking as BookingItem & { service?: string; serviceType?: string };
    return (
      booking.type === "smart-planner" ||
      record.service === "smart-planner" ||
      record.serviceType === "smart-planner"
    );
  });

  return (
    plannerBookings.sort((a, b) => {
      const bDate = new Date(b.bookingDate || b.travelDate || 0).getTime();
      const aDate = new Date(a.bookingDate || a.travelDate || 0).getTime();
      return bDate - aDate;
    })[0] || null
  );
}

function manifestForBooking(booking: BookingItem | null) {
  if (!booking) return "";
  const record = booking as BookingItem & {
    detailPayloadStorageKey?: string;
    detailStorageKey?: string;
  };
  return (
    text(record.detailStorageKey) ||
    text(record.detailPayloadStorageKey) ||
    text(booking.payloadStorageKey) ||
    booking.id
  );
}

function readChunkedManifest(key: string): BookingDetailManifest | null {
  if (!key) return null;
  const manifestKey = key.startsWith(BOOKING_MANIFEST_PREFIX)
    ? key
    : `${BOOKING_MANIFEST_PREFIX}${key}`;
  return (
    safeParse(getStore("localStorage")?.getItem(manifestKey) || null) as BookingDetailManifest | null
  ) || (
    safeParse(getStore("sessionStorage")?.getItem(manifestKey) || null) as BookingDetailManifest | null
  );
}

function stageSnapshot(stage: PlannerSnapshotStage, label: string, payload: unknown, sourceKeys: string[]): PlannerStageSnapshot {
  return {
    bookingId: bookingIdFromPayload(payload),
    label,
    payload,
    size: getPlannerPayloadSize(payload),
    sourceKeys,
    stage,
  };
}

function emptyStage(stage: PlannerSnapshotStage, label: string): PlannerStageSnapshot {
  return stageSnapshot(stage, label, null, []);
}

export function getPlannerFieldValue(payload: unknown, paths: string[] | string): unknown {
  const candidatePaths = Array.isArray(paths) ? paths : [paths];
  for (const path of candidatePaths) {
    const value = valueAtPath(payload, path);
    if (hasMeaningfulValue(value)) return value;
  }
  return undefined;
}

export function getPlannerPayloadSize(payload: unknown) {
  if (payload === undefined || payload === null) return 0;
  try {
    return JSON.stringify(payload).length;
  } catch {
    return 0;
  }
}

export function collectSmartPlannerFlowSnapshots(): SmartPlannerFlowSnapshots {
  const storageSnapshots: PlannerStorageSnapshot[] = [];
  if (typeof window === "undefined") {
    const empty = {
      bookingIds: {},
      latestBooking: null,
      snapshots: {
        workspace: emptyStage("workspace", "Workspace"),
        review: emptyStage("review", "Review"),
        payment: emptyStage("payment", "Payment"),
        confirmation: emptyStage("confirmation", "Confirmation"),
        myBookingCard: emptyStage("myBookingCard", "My Booking Card"),
        chunkedDetail: emptyStage("chunkedDetail", "Chunked Detail"),
        viewDetailResolver: emptyStage("viewDetailResolver", "View Detail Resolver"),
        manageResolver: emptyStage("manageResolver", "Manage Resolver"),
      },
      storageSnapshots,
    };
    return empty;
  }

  for (const key of SMART_PLANNER_STORAGE_KEYS) {
    for (const storage of ["sessionStorage", "localStorage"] as const) {
      const size = rawStorageSize(key, storage);
      const parsed = readStorageJSON(key, storage);
      storageSnapshots.push({
        exists: size > 0,
        importantFieldsFound: importantFieldsFound(parsed),
        key,
        parsed,
        problem: size > 0 && parsed === null ? "Malformed JSON or unresolved compact payload" : "",
        size,
        storage,
      });
    }
  }

  for (const storage of ["sessionStorage", "localStorage"] as const) {
    const store = getStore(storage);
    if (!store) continue;
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index) || "";
      if (!key.startsWith(BOOKING_MANIFEST_PREFIX)) continue;
      const parsed = safeParse(store.getItem(key));
      storageSnapshots.push({
        exists: true,
        importantFieldsFound: importantFieldsFound(parsed),
        key,
        parsed,
        problem: "",
        size: store.getItem(key)?.length || 0,
        storage,
      });
    }
  }

  const bookings = getAllBookings();
  const latestBooking = getLatestSmartPlannerBooking(bookings);
  const bookingId = latestBooking?.id || "";
  const resolver = bookingId ? resolveSmartPlannerBooking(bookingId) : null;
  const manifestKey = manifestForBooking(latestBooking);
  const manifest = readChunkedManifest(manifestKey);
  const chunkedPayload = manifestKey
    ? readChunkedBookingDetail<RecordValue>(manifestKey) ||
      readChunkedBookingDetail<RecordValue>(bookingId)
    : null;
  const reviewPayload =
    readStorageJSON("tpl_tiya_workspace_review_payload_v1") ||
    readStorageJSON("tpl_tiya_review_draft_v1") ||
    readStorageJSON("tpl_tiya_checkout_v1");
  const paymentPayload = readStorageJSON("tpl_tiya_planner_payment_v1");
  const confirmationPayload = readStorageJSON("tpl_tiya_planner_confirmation_v1");
  const workspacePayload =
    readStorageJSON("tpl_smart_planner_workspace_draft_v1") ||
    readStorageJSON("tpl_tiya_workspace_draft") ||
    readStorageJSON("tpl_tiya_selected_route_preview");
  const myBookingCardPayload = latestBooking
    ? {
        ...latestBooking,
        chunkCount: manifest?.chunkCount,
        manifestKey,
        payloadSize: getPlannerPayloadSize(latestBooking),
      }
    : null;
  const chunkedDetailPayload = chunkedPayload
    ? {
        ...asRecord(chunkedPayload),
        chunkCount: manifest?.chunkCount,
        manifestKey,
        payloadSize: getPlannerPayloadSize(chunkedPayload),
      }
    : null;
  const resolverPayload = resolver?.payload
    ? {
        ...resolver.payload,
        payloadSize: getPlannerPayloadSize(resolver.fullPayload || resolver.payload),
      }
    : null;

  return {
    bookingIds: {
      chunkedDetail: bookingIdFromPayload(chunkedPayload) || text(asRecord(chunkedPayload).bookingId),
      confirmation: bookingIdFromPayload(confirmationPayload),
      latest: bookingId,
      myBookingCard: latestBooking?.id,
      payment: bookingIdFromPayload(paymentPayload),
      resolver: resolver?.payload ? bookingIdFromPayload(resolver.payload) : "",
    },
    latestBooking,
    snapshots: {
      workspace: stageSnapshot("workspace", "Workspace", workspacePayload, [
        "tpl_smart_planner_workspace_draft_v1",
        "tpl_tiya_workspace_draft",
        "tpl_tiya_selected_route_preview",
      ]),
      review: stageSnapshot("review", "Review", reviewPayload, [
        "tpl_tiya_workspace_review_payload_v1",
        "tpl_tiya_review_draft_v1",
        "tpl_tiya_checkout_v1",
      ]),
      payment: stageSnapshot("payment", "Payment", paymentPayload, [
        "tpl_tiya_planner_payment_v1",
      ]),
      confirmation: stageSnapshot("confirmation", "Confirmation", confirmationPayload, [
        "tpl_tiya_planner_confirmation_v1",
      ]),
      myBookingCard: stageSnapshot("myBookingCard", "My Booking Card", myBookingCardPayload, [
        BOOKING_STORAGE_KEY,
      ]),
      chunkedDetail: stageSnapshot("chunkedDetail", "Chunked Detail", chunkedDetailPayload, [
        manifestKey,
      ].filter(Boolean)),
      viewDetailResolver: stageSnapshot("viewDetailResolver", "View Detail Resolver", resolverPayload, [
        ...(resolver?.checkedStorageKeys || []),
      ]),
      manageResolver: stageSnapshot("manageResolver", "Manage Resolver", resolverPayload, [
        ...(resolver?.checkedStorageKeys || []),
      ]),
    },
    storageSnapshots,
  };
}

export function compareSmartPlannerFlowSnapshots(
  snapshots: SmartPlannerFlowSnapshots
): {
  fieldComparisons: PlannerFieldComparison[];
  issues: PlannerFlowIssue[];
} {
  const stages = Object.keys(snapshots.snapshots) as PlannerSnapshotStage[];
  const fieldComparisons = FIELD_MATRIX.map((field): PlannerFieldComparison => {
    const stageValues = stages.reduce<Record<PlannerSnapshotStage, string>>((acc, stage) => {
      acc[stage] = summarizeValue(getPlannerFieldValue(snapshots.snapshots[stage].payload, field.paths));
      return acc;
    }, {} as Record<PlannerSnapshotStage, string>);
    const values = stages
      .map((stage) => ({
        stage,
        comparable: normalizeComparable(getPlannerFieldValue(snapshots.snapshots[stage].payload, field.paths)),
        display: stageValues[stage],
      }))
      .filter((item) => item.comparable);
    const source = values[0];
    const destination = values[values.length - 1];
    const nonEmptyComparable = Array.from(new Set(values.map((item) => item.comparable)));
    const lostIndex = stages.findIndex((stage, index) => {
      if (index === 0) return false;
      const previous = stageValues[stages[index - 1]];
      const current = stageValues[stage];
      return Boolean(previous && !current);
    });
    const status =
      values.length === 0
        ? "missing"
        : values.some((item) => item.display === "")
          ? "empty"
          : nonEmptyComparable.length > 1
            ? "mismatched"
            : "present";

    return {
      destinationValue: destination?.display || "",
      field: field.field,
      lostBetween:
        lostIndex > 0 ? `${snapshots.snapshots[stages[lostIndex - 1]].label} → ${snapshots.snapshots[stages[lostIndex]].label}` : "",
      sourceValue: source?.display || "",
      stageValues,
      status,
    };
  });

  const issues = fieldComparisons
    .filter((item) => item.status !== "present")
    .map((item): PlannerFlowIssue => {
      const definition = FIELD_MATRIX.find((field) => field.field === item.field);
      const highPriorityFields = [
        "bookingId",
        "selectedBasketItems",
        "itinerary",
        "travellers",
        "totalPaid",
        "fareSummary",
        "payloadStorageKey",
        "chunk count",
      ];
      return {
        field: item.field,
        lostBetween: item.lostBetween || "Not enough data to locate exact transition",
        priority: highPriorityFields.includes(item.field) ? "high" : item.status === "mismatched" ? "medium" : "low",
        reason:
          item.status === "mismatched"
            ? "Field exists in multiple stages but values differ."
            : item.status === "missing"
              ? "Field is missing across all inspected stages."
              : "Field is present earlier but empty in at least one inspected stage.",
        suggestedFixFile: definition?.suggestedFixFile || "Smart Planner storage/resolver layer",
      };
    });

  return { fieldComparisons, issues };
}

export function diagnoseSmartPlannerBookingFlow(): SmartPlannerFlowDiagnostic {
  const snapshots = collectSmartPlannerFlowSnapshots();
  const { fieldComparisons, issues } = compareSmartPlannerFlowSnapshots(snapshots);
  const chunkedDetailAvailable = Boolean(
    snapshots.snapshots.chunkedDetail.payload &&
      Object.keys(asRecord(snapshots.snapshots.chunkedDetail.payload)).length
  );
  const viewDetailResolverHasFullPayload = Boolean(
    snapshots.snapshots.viewDetailResolver.payload &&
      hasMeaningfulValue(getPlannerFieldValue(snapshots.snapshots.viewDetailResolver.payload, [
        "selectedBasketItems",
        "itinerary",
        "dayPlans",
        "plannerIntelligence",
      ]))
  );
  const manageResolverHasFullPayload = Boolean(
    snapshots.snapshots.manageResolver.payload &&
      hasMeaningfulValue(getPlannerFieldValue(snapshots.snapshots.manageResolver.payload, [
        "selectedBasketItems",
        "itinerary",
        "dayPlans",
        "plannerIntelligence",
      ]))
  );

  return {
    bookingIdComparison: snapshots.bookingIds,
    fieldComparisons,
    issues,
    snapshotSummary: {
      chunkedDetailAvailable,
      confirmationPayloadAvailable: Boolean(snapshots.snapshots.confirmation.payload),
      latestSmartPlannerBookingId: snapshots.bookingIds.latest || "",
      manageResolverHasFullPayload,
      myBookingCardAvailable: Boolean(snapshots.latestBooking),
      viewDetailResolverHasFullPayload,
    },
    snapshots,
    storageSnapshots: snapshots.storageSnapshots,
  };
}

export function clearSmartPlannerDiagnosticTempStorage() {
  resetSmartPlannerWorkingSession();
}
