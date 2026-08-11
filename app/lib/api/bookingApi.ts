"use client";

import {
  getStoredAuthToken,
  tplApiRequest,
  type TplApiResult,
} from "@/app/lib/api/tplApiClient";
import {
  getAllBookings,
  type BookingItem,
  type BookingStatus,
  type BookingType,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

export type BackendFirstBookingsResult = {
  bookings: BookingItem[];
  source: "backend" | "local_fallback";
  requestId?: string;
  error?: {
    status?: number;
    code: string;
    message: string;
  };
};

export type BackendBookingDetailResult = {
  booking: BookingItem;
  detail?: {
    serviceType?: string;
    rawPayload?: Record<string, unknown>;
    rawPayloadHash?: string;
    rawPayloadSizeBytes?: number;
    rawPayloadSchema?: string | null;
    mapperVersion?: string;
    normalizedSummary?: Record<string, unknown>;
  };
};

export type BackendFirstBookingPayloadResult<T = unknown> = {
  booking: BookingItem | null;
  payload: T | null;
  source: "backend" | "local_fallback";
  requestId?: string;
  error?: {
    status?: number;
    code: string;
    message: string;
  };
};

const bookingTypes = new Set<BookingType>([
  "flight",
  "hotel",
  "homestay",
  "package",
  "bus",
  "train",
  "cab",
  "cruise",
  "visa",
  "insurance",
  "smart-planner",
]);

const bookingStatuses = new Set<BookingStatus>([
  "upcoming",
  "completed",
  "cancelled",
]);

export async function getBackendFirstBookings(
  mobile?: string
): Promise<BackendFirstBookingsResult> {
  const localBookings = mobile
    ? getAllBookings().filter((booking) => booking.mobile === mobile)
    : getAllBookings();

  const authToken = getStoredAuthToken();

  if (!authToken) {
    return {
      bookings: localBookings,
      source: "local_fallback",
    };
  }

  const path = "/api/v1/bookings";
  const result = await tplApiRequest<unknown>(path);

  if (!result.ok) {
    return {
      bookings: localBookings,
      source: "local_fallback",
      requestId: result.requestId,
      error: {
        status: result.status,
        code: result.error.code,
        message: result.error.message,
      },
    };
  }

  const backendBookings = normalizeBookingList(result.data);
  const bookings = mergeBackendAndLocalBookings(backendBookings, localBookings);
  cacheMergedBookings(bookings);

  return {
    bookings,
    source: "backend",
    requestId: result.requestId,
  };
}

export async function getBackendFirstBookingById(
  bookingId: string
): Promise<BackendFirstBookingsResult> {
  const localBooking = getAllBookings().find((booking) => booking.id === bookingId);

  if (!getStoredAuthToken()) {
    return {
      bookings: localBooking ? [localBooking] : [],
      source: "local_fallback",
    };
  }

  const result = await tplApiRequest<unknown>(`/api/v1/bookings/${encodeURIComponent(bookingId)}`);
  if (!result.ok) {
    return {
      bookings: localBooking ? [localBooking] : [],
      source: "local_fallback",
      requestId: result.requestId,
      error: {
        status: result.status,
        code: result.error.code,
        message: result.error.message,
      },
    };
  }

  const booking = normalizeBookingItem(result.data);
  return {
    bookings: booking ? [booking] : localBooking ? [localBooking] : [],
    source: "backend",
    requestId: result.requestId,
  };
}

export async function getBackendFirstBookingDetail(
  bookingId: string
): Promise<{
  ok: true;
  data: BackendBookingDetailResult;
  source: "backend";
  requestId: string;
} | {
  ok: false;
  source: "local_fallback";
  requestId?: string;
  error?: {
    status?: number;
    code: string;
    message: string;
  };
}> {
  if (!getStoredAuthToken() && !looksLikeBackendBookingRef(bookingId)) {
    return { ok: false, source: "local_fallback" };
  }

  const result = await tplApiRequest<unknown>(`/api/v1/bookings/${encodeURIComponent(bookingId)}/detail`, {
    authToken: getStoredAuthToken(),
  });
  if (!result.ok) {
    return {
      ok: false,
      source: "local_fallback",
      requestId: result.requestId,
      error: {
        status: result.status,
        code: result.error.code,
        message: result.error.message,
      },
    };
  }

  const normalized = normalizeBookingDetail(result);
  if (!normalized) {
    return {
      ok: false,
      source: "local_fallback",
      requestId: result.requestId,
      error: {
        status: result.status,
        code: "BOOKING_DETAIL_INVALID",
        message: "Booking detail response was not compatible.",
      },
    };
  }

  return {
    ok: true,
    data: normalized,
    source: "backend",
    requestId: result.requestId,
  };
}

export async function getBackendFirstBookingPayload<T = unknown>(
  bookingId: string,
  expectedType?: BookingType
): Promise<BackendFirstBookingPayloadResult<T>> {
  const local = getLocalBookingPayload<T>(bookingId, expectedType);

  const backendDetail = await getBackendFirstBookingDetail(bookingId);
  if (!backendDetail.ok) {
    return {
      ...local,
      source: "local_fallback",
      requestId: backendDetail.requestId,
      error: backendDetail.error,
    };
  }

  if (expectedType && backendDetail.data.booking.type !== expectedType) {
    return local;
  }

  const rawPayload = backendDetail.data.detail?.rawPayload;
  if (rawPayload && Object.keys(rawPayload).length) {
    return {
      booking: backendDetail.data.booking,
      payload: rawPayload as T,
      source: "backend",
      requestId: backendDetail.requestId,
    };
  }

  return {
    ...local,
    source: "local_fallback",
    requestId: backendDetail.requestId,
  };
}

export function mergeBackendAndLocalBookings(
  backendBookings: BookingItem[],
  localBookings: BookingItem[]
): BookingItem[] {
  const merged = new Map<string, BookingItem>();

  localBookings.forEach((booking) => {
    merged.set(dedupeKey(booking), booking);
  });

  backendBookings.forEach((booking) => {
    merged.set(dedupeKey(booking), booking);
  });

  return Array.from(merged.values()).sort((a, b) => {
    return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
  });
}

function normalizeBookingDetail(result: TplApiResult<unknown>): BackendBookingDetailResult | null {
  if (!result.ok) return null;
  const record = asRecord(result.data);
  const booking = normalizeBookingItem(record.booking);
  if (!booking) return null;
  const detail = asRecord(record.detail);

  return {
    booking,
    detail: {
      serviceType: stringValue(detail.serviceType),
      rawPayload: asRecord(detail.rawPayload),
      rawPayloadHash: stringValue(detail.rawPayloadHash),
      rawPayloadSizeBytes: numberValue(detail.rawPayloadSizeBytes),
      rawPayloadSchema: stringValue(detail.rawPayloadSchema) || null,
      mapperVersion: stringValue(detail.mapperVersion),
      normalizedSummary: asRecord(detail.normalizedSummary),
    },
  };
}

function getLocalBookingPayload<T = unknown>(
  bookingId: string,
  expectedType?: BookingType
): BackendFirstBookingPayloadResult<T> {
  const booking =
    getAllBookings().find((item) => {
      if (expectedType && item.type !== expectedType) return false;
      return matchesBookingId(item, bookingId);
    }) || null;

  if (!booking?.payloadStorageKey) {
    return {
      booking,
      payload: null,
      source: "local_fallback",
    };
  }

  const payload = getBookingPayload<T>(booking.payloadStorageKey);
  return {
    booking,
    payload: payload ? { ...(payload as Record<string, unknown>) } as T : null,
    source: "local_fallback",
  };
}

function normalizeBookingList(value: unknown): BookingItem[] {
  const items = Array.isArray(value) ? value : [];
  return items.map(normalizeBookingItem).filter(Boolean) as BookingItem[];
}

function normalizeBookingItem(value: unknown): BookingItem | null {
  const record = asRecord(value);
  const id = stringValue(record.id) || stringValue(record.bookingId) || stringValue(record.bookingRef);
  const type = normalizeBookingType(record.type || record.serviceType);
  const mobile = stringValue(record.mobile) || stringValue(asRecord(record.leadTraveller).mobile);

  if (!id || !type) return null;

  return {
    ...(record as Partial<BookingItem>),
    id,
    type,
    title: stringValue(record.title) || labelForType(type),
    bookingDate: stringValue(record.bookingDate) || stringValue(record.createdAt) || new Date().toISOString(),
    travelDate: stringValue(record.travelDate) || stringValue(record.startDate) || stringValue(record.bookingDate) || "",
    travellers: stringValue(record.travellers) || stringValue(record.travellersLabel) || "1 Traveller",
    amount: numberValue(record.amount || record.totalAmount || record.paidAmount),
    status: normalizeBookingStatus(record.status),
    mobile,
    leadTraveller: {
      name: stringValue(asRecord(record.leadTraveller).name) || stringValue(record.leadTravellerName) || "Guest",
      mobile,
      ...(stringValue(asRecord(record.leadTraveller).email) ? { email: stringValue(asRecord(record.leadTraveller).email) } : {}),
    },
  };
}

function matchesBookingId(booking: BookingItem, bookingId: string): boolean {
  const record = booking as BookingItem & {
    backendBookingId?: string;
    backendBookingRef?: string;
    legacyFrontendId?: string;
  };

  return [record.id, record.bookingId, record.backendBookingId, record.backendBookingRef, record.legacyFrontendId]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .includes(bookingId);
}

function looksLikeBackendBookingRef(value: string): boolean {
  return /^TPL-SIM-FLT-[A-Z0-9-]+$/i.test(String(value || "").trim());
}

function dedupeKey(booking: BookingItem): string {
  const record = booking as BookingItem & {
    bookingRef?: string;
    backendBookingId?: string;
    backendBookingRef?: string;
    legacyFrontendId?: string;
  };

  return [
    record.id,
    record.bookingId,
    record.bookingRef,
    record.backendBookingId,
    record.backendBookingRef,
    record.legacyFrontendId,
  ]
    .map((value) => String(value || "").trim())
    .find(Boolean) || `${booking.type}:${booking.mobile}:${booking.title}:${booking.travelDate}:${booking.amount}`;
}

function cacheMergedBookings(bookings: BookingItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("tpl_bookings_v1", JSON.stringify(bookings));
  } catch {
    // Cache is best effort. Local fallback remains available.
  }
}

function normalizeBookingType(value: unknown): BookingType | null {
  if (typeof value !== "string") return null;
  return bookingTypes.has(value as BookingType) ? (value as BookingType) : null;
}

function normalizeBookingStatus(value: unknown): BookingStatus {
  if (typeof value === "string" && bookingStatuses.has(value as BookingStatus)) {
    return value as BookingStatus;
  }
  return "upcoming";
}

function labelForType(type: BookingType): string {
  return type
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function numberValue(value: unknown): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
