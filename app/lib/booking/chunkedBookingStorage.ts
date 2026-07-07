"use client";

const MANIFEST_PREFIX = "tpl_booking_detail_manifest_";
const CHUNK_PREFIX = "tpl_booking_detail_chunk_";
const INDEX_KEY = "tpl_booking_index_v1";
const DEFAULT_CHUNK_SIZE = 240_000;

export type BookingDetailManifest = {
  bookingId: string;
  chunkCount: number;
  chunkSize: number;
  createdAt: string;
  service: string;
  storage: "localStorage" | "sessionStorage";
  version: 1;
};

export type ChunkedBookingSaveResult = {
  manifest: BookingDetailManifest;
  manifestKey: string;
  ok: boolean;
  storage: "localStorage" | "sessionStorage";
  warning?: string;
};

function manifestKeyFor(bookingIdOrManifestKey: string) {
  return bookingIdOrManifestKey.startsWith(MANIFEST_PREFIX)
    ? bookingIdOrManifestKey
    : `${MANIFEST_PREFIX}${bookingIdOrManifestKey}`;
}

function bookingIdFromManifestKey(bookingIdOrManifestKey: string) {
  return bookingIdOrManifestKey.startsWith(MANIFEST_PREFIX)
    ? bookingIdOrManifestKey.slice(MANIFEST_PREFIX.length)
    : bookingIdOrManifestKey;
}

function chunkKey(bookingId: string, index: number) {
  return `${CHUNK_PREFIX}${bookingId}_${index}`;
}

function getStore(storage: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") return null;
  return storage === "localStorage" ? window.localStorage : window.sessionStorage;
}

function splitIntoChunks(serialized: string, chunkSize: number) {
  const chunks: string[] = [];
  for (let index = 0; index < serialized.length; index += chunkSize) {
    chunks.push(serialized.slice(index, index + chunkSize));
  }
  return chunks.length ? chunks : [""];
}

function safeParse<T = unknown>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function buildBookingDetailManifest(params: {
  bookingId: string;
  chunkCount: number;
  chunkSize?: number;
  service?: string;
  storage: "localStorage" | "sessionStorage";
}): BookingDetailManifest {
  return {
    bookingId: params.bookingId,
    chunkCount: params.chunkCount,
    chunkSize: params.chunkSize || DEFAULT_CHUNK_SIZE,
    createdAt: new Date().toISOString(),
    service: params.service || "booking",
    storage: params.storage,
    version: 1,
  };
}

function deleteFromStore(
  store: Storage | null,
  bookingIdOrManifestKey: string
) {
  if (!store) return;

  const bookingId = bookingIdFromManifestKey(bookingIdOrManifestKey);
  const manifestKey = manifestKeyFor(bookingId);
  const manifest = safeParse<BookingDetailManifest>(store.getItem(manifestKey));
  const chunkCount = manifest?.chunkCount || 0;

  for (let index = 0; index < chunkCount; index += 1) {
    store.removeItem(chunkKey(bookingId, index));
  }

  store.removeItem(manifestKey);
}

function writeChunks(params: {
  bookingId: string;
  chunks: string[];
  chunkSize: number;
  payload: unknown;
  service?: string;
  storage: "localStorage" | "sessionStorage";
}) {
  const store = getStore(params.storage);
  if (!store) throw new Error("Storage is not available.");

  deleteFromStore(store, params.bookingId);

  const manifest = buildBookingDetailManifest({
    bookingId: params.bookingId,
    chunkCount: params.chunks.length,
    chunkSize: params.chunkSize,
    service: params.service,
    storage: params.storage,
  });

  params.chunks.forEach((chunk, index) => {
    store.setItem(chunkKey(params.bookingId, index), chunk);
  });
  store.setItem(manifestKeyFor(params.bookingId), JSON.stringify(manifest));

  return manifest;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value ?? 0);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }

  return 0;
}

function textValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) return text;
    }
  }

  return "";
}

function routeLabel(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item)).filter(Boolean).join(" → ");
  }

  return textValue(value);
}

function upsertIndexRecord(
  bookingId: string,
  payload: unknown,
  manifestKey: string,
  service?: string
) {
  const store = getStore("localStorage");
  if (!store) return;

  try {
    const record = asRecord(payload);
    const summary = asRecord(record.summary);
    const payment = asRecord(record.payment);
    const paymentSummary = asRecord(record.paymentSummary);
    const fare = asRecord(record.fare);
    const fareSummary = asRecord(record.fareSummary);
    const pricing = asRecord(record.pricing);
    const trip = asRecord(record.trip);
    const smartPlannerPayload = asRecord(record.smartPlannerPayload);
    const smartTrip = asRecord(smartPlannerPayload.trip);
    const existing = safeParse<Array<Record<string, unknown>>>(store.getItem(INDEX_KEY)) || [];
    const nextRecord = {
      amount: numberValue(
        payment.amountPaid,
        paymentSummary.amountPaid,
        paymentSummary.finalPayable,
        fareSummary.finalPayable,
        fareSummary.finalPayableAmount,
        fare.finalPayableAmount,
        fare.grandTotal,
        pricing.finalPayable,
        pricing.totalAmount
      ),
      bookingId,
      createdAt: new Date().toISOString(),
      manifestKey,
      route:
        routeLabel(summary.route) ||
        textValue(trip.routeLabel, smartTrip.routeLabel) ||
        [trip.origin || smartTrip.origin, trip.destination || smartTrip.destination]
          .map(textValue)
          .filter(Boolean)
          .join(" → "),
      service: service || textValue(record.serviceType, record.service) || "booking",
      title:
        textValue(summary.packageTitle, trip.title, trip.name, smartTrip.title, smartTrip.name) ||
        "Smart Planner Trip",
      travelDate: textValue(summary.travelDate, trip.startDate, smartTrip.startDate),
    };
    const next = [
      nextRecord,
      ...existing.filter((item) => item.bookingId !== bookingId),
    ];
    store.setItem(INDEX_KEY, JSON.stringify(next.slice(0, 100)));
  } catch {
    // Index is best effort; My Bookings continues to use tpl_bookings_v1.
  }
}

export function saveChunkedBookingDetail(
  bookingId: string,
  payload: unknown,
  options?: {
    chunkSize?: number;
    service?: string;
  }
): ChunkedBookingSaveResult {
  const chunkSize = options?.chunkSize || DEFAULT_CHUNK_SIZE;
  const serialized = JSON.stringify(payload);
  const chunks = splitIntoChunks(serialized, chunkSize);

  try {
    const manifest = writeChunks({
      bookingId,
      chunks,
      chunkSize,
      payload,
      service: options?.service,
      storage: "localStorage",
    });
    const manifestKey = manifestKeyFor(bookingId);
    upsertIndexRecord(bookingId, payload, manifestKey, options?.service);

    return {
      manifest,
      manifestKey,
      ok: true,
      storage: "localStorage",
    };
  } catch (error) {
    deleteFromStore(getStore("localStorage"), bookingId);

    try {
      const manifest = writeChunks({
        bookingId,
        chunks,
        chunkSize,
        payload,
        service: options?.service,
        storage: "sessionStorage",
      });

      return {
        manifest,
        manifestKey: manifestKeyFor(bookingId),
        ok: true,
        storage: "sessionStorage",
        warning:
          error instanceof Error
            ? error.message
            : "Local storage failed; saved detail in session storage.",
      };
    } catch (sessionError) {
      deleteFromStore(getStore("sessionStorage"), bookingId);
      return {
        manifest: buildBookingDetailManifest({
          bookingId,
          chunkCount: 0,
          chunkSize,
          service: options?.service,
          storage: "sessionStorage",
        }),
        manifestKey: manifestKeyFor(bookingId),
        ok: false,
        storage: "sessionStorage",
        warning:
          sessionError instanceof Error
            ? sessionError.message
            : "Unable to save chunked booking detail.",
      };
    }
  }
}

export function readChunkedBookingDetail<T = unknown>(
  bookingIdOrManifestKey: string
): T | null {
  if (typeof window === "undefined" || !bookingIdOrManifestKey) return null;

  const manifestKey = manifestKeyFor(bookingIdOrManifestKey);

  for (const storage of ["localStorage", "sessionStorage"] as const) {
    const store = getStore(storage);
    const manifest = safeParse<BookingDetailManifest>(
      store?.getItem(manifestKey) || null
    );
    if (!manifest || manifest.chunkCount <= 0) continue;

    try {
      const chunks: string[] = [];
      for (let index = 0; index < manifest.chunkCount; index += 1) {
        const chunk = store?.getItem(chunkKey(manifest.bookingId, index));
        if (chunk === null || chunk === undefined) throw new Error("Missing chunk");
        chunks.push(chunk);
      }

      return JSON.parse(chunks.join("")) as T;
    } catch {
      // Try the next storage backend.
    }
  }

  return null;
}

export function deleteChunkedBookingDetail(bookingIdOrManifestKey: string) {
  deleteFromStore(getStore("localStorage"), bookingIdOrManifestKey);
  deleteFromStore(getStore("sessionStorage"), bookingIdOrManifestKey);
}

export function isChunkedBookingDetailKey(value?: string) {
  return Boolean(value?.startsWith(MANIFEST_PREFIX));
}
