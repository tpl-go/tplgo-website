"use client";

import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import { logSmartPlannerStorageWrite } from "@/app/lib/ecosystem/planner/booking/smartPlannerStorageWriteAudit";

const MANIFEST_PREFIX = "tpl_tiya_detail_manifest_";
const CHUNK_PREFIX = "tpl_tiya_detail_chunk_";
const DEFAULT_CHUNK_SIZE = 240_000;

type PlannerDetailManifest = {
  chunkCount: number;
  chunkSize: number;
  createdAt: string;
  detailId: string;
  storage: "localStorage" | "sessionStorage";
  version: 1;
};

export type CompactPlannerPayloadRecord = {
  __compactPlannerPayload: true;
  detailStorageKey?: string;
  source: "smart-planner";
  summary: {
    destination?: string;
    origin?: string;
    selectedBasketItemsCount: number;
    selectedBasketValue?: number;
    startDate?: string;
    title?: string;
    totalDays?: number;
    updatedAt?: string;
  };
};

export type CompactPlannerDetailRecord = {
  __plannerDetailRecord: true;
  detailStorageKey?: string;
  source: "smart-planner";
  summary?: Record<string, unknown>;
};

const SMART_PLANNER_WORKING_STORAGE_KEYS = [
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
] as const;

function manifestKey(detailIdOrKey: string) {
  return detailIdOrKey.startsWith(MANIFEST_PREFIX)
    ? detailIdOrKey
    : `${MANIFEST_PREFIX}${detailIdOrKey}`;
}

function detailIdFromKey(detailIdOrKey: string) {
  return detailIdOrKey.startsWith(MANIFEST_PREFIX)
    ? detailIdOrKey.slice(MANIFEST_PREFIX.length)
    : detailIdOrKey;
}

function chunkKey(detailId: string, index: number) {
  return `${CHUNK_PREFIX}${detailId}_${index}`;
}

function storeFor(storage: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") return null;
  return storage === "localStorage" ? window.localStorage : window.sessionStorage;
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function split(serialized: string, chunkSize: number) {
  const chunks: string[] = [];
  for (let index = 0; index < serialized.length; index += chunkSize) {
    chunks.push(serialized.slice(index, index + chunkSize));
  }
  return chunks.length ? chunks : [""];
}

function removeDetail(storage: "localStorage" | "sessionStorage", detailIdOrKey: string) {
  const store = storeFor(storage);
  if (!store) return;
  const id = detailIdFromKey(detailIdOrKey);
  const key = manifestKey(id);
  const manifest = safeParse<PlannerDetailManifest>(store.getItem(key));
  for (let index = 0; index < (manifest?.chunkCount || 0); index += 1) {
    store.removeItem(chunkKey(id, index));
  }
  store.removeItem(key);
}

function writeDetail(
  storage: "localStorage" | "sessionStorage",
  detailId: string,
  serialized: string,
  chunkSize: number
) {
  const store = storeFor(storage);
  if (!store) throw new Error("Storage unavailable");
  const chunks = split(serialized, chunkSize);
  removeDetail(storage, detailId);
  chunks.forEach((chunk, index) => {
    const key = chunkKey(detailId, index);
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
      functionName: "writeDetail:chunk",
      key,
      serialized: chunk,
      storageType: storage,
      successOrFailed: "attempt",
    });
    try {
      store.setItem(key, chunk);
      logSmartPlannerStorageWrite({
        file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
        functionName: "writeDetail:chunk",
        key,
        serialized: chunk,
        storageType: storage,
        successOrFailed: "success",
      });
    } catch (error) {
      logSmartPlannerStorageWrite({
        error,
        file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
        functionName: "writeDetail:chunk",
        key,
        serialized: chunk,
        storageType: storage,
        successOrFailed: "failed",
      });
      throw error;
    }
  });
  const manifest: PlannerDetailManifest = {
    chunkCount: chunks.length,
    chunkSize,
    createdAt: new Date().toISOString(),
    detailId,
    storage,
    version: 1,
  };
  const manifestStorageKey = manifestKey(detailId);
  const manifestPayload = JSON.stringify(manifest);
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
    functionName: "writeDetail:manifest",
    key: manifestStorageKey,
    payload: manifest,
    serialized: manifestPayload,
    storageType: storage,
    successOrFailed: "attempt",
  });
  try {
    store.setItem(manifestStorageKey, manifestPayload);
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
      functionName: "writeDetail:manifest",
      key: manifestStorageKey,
      payload: manifest,
      serialized: manifestPayload,
      storageType: storage,
      successOrFailed: "success",
    });
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
      functionName: "writeDetail:manifest",
      key: manifestStorageKey,
      payload: manifest,
      serialized: manifestPayload,
      storageType: storage,
      successOrFailed: "failed",
    });
    throw error;
  }
  return manifestKey(detailId);
}

export function buildPlannerDetailId(prefix: string, payload: { updatedAt?: string; trip?: { title?: string } }) {
  const base = `${prefix}_${payload.updatedAt || Date.now()}_${payload.trip?.title || "smart-planner"}`;
  return base.replace(/\s+/g, "_").replace(/[^\w-]/g, "").slice(0, 140);
}

export function compactPlannerPayload(
  payload: TiyaSmartPlannerReviewPayload,
  detailStorageKey?: string
): CompactPlannerPayloadRecord {
  return {
    __compactPlannerPayload: true,
    detailStorageKey,
    source: "smart-planner",
    summary: {
      destination: payload.trip?.destination,
      origin: payload.trip?.origin,
      selectedBasketItemsCount: Array.isArray(payload.selectedBasketItems)
        ? payload.selectedBasketItems.length
        : 0,
      selectedBasketValue: payload.selectedBasketValue,
      startDate: payload.trip?.startDate,
      title: payload.trip?.title,
      totalDays: Array.isArray(payload.itinerary) ? payload.itinerary.length : payload.trip?.totalDays,
      updatedAt: payload.updatedAt,
    },
  };
}

export function savePlannerDetailPayload(
  detailId: string,
  payload: unknown,
  options?: { chunkSize?: number }
) {
  const serialized = JSON.stringify(payload);
  const chunkSize = options?.chunkSize || DEFAULT_CHUNK_SIZE;
  logSmartPlannerStorageWrite({
    file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
    functionName: "savePlannerDetailPayload",
    key: manifestKey(detailId),
    payload,
    serialized,
    storageType: "localStorage",
    successOrFailed: "attempt",
  });
  try {
    const result = {
      key: writeDetail("localStorage", detailId, serialized, chunkSize),
      storage: "localStorage" as const,
      warning: "",
    };
    logSmartPlannerStorageWrite({
      file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
      functionName: "savePlannerDetailPayload",
      key: result.key,
      payload,
      serialized,
      storageType: "localStorage",
      successOrFailed: "success",
    });
    return result;
  } catch (error) {
    logSmartPlannerStorageWrite({
      error,
      file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
      functionName: "savePlannerDetailPayload",
      key: manifestKey(detailId),
      payload,
      serialized,
      storageType: "localStorage",
      successOrFailed: "failed",
    });
    removeDetail("localStorage", detailId);
    try {
      const result = {
        key: writeDetail("sessionStorage", detailId, serialized, chunkSize),
        storage: "sessionStorage" as const,
        warning: error instanceof Error ? error.message : "Local storage failed",
      };
      logSmartPlannerStorageWrite({
        file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
        functionName: "savePlannerDetailPayload:fallback",
        key: result.key,
        payload,
        serialized,
        storageType: "sessionStorage",
        successOrFailed: "success",
      });
      return result;
    } catch (sessionError) {
      logSmartPlannerStorageWrite({
        error: sessionError,
        file: "app/lib/ecosystem/planner/plannerPayloadStorage.ts",
        functionName: "savePlannerDetailPayload:fallback",
        key: manifestKey(detailId),
        payload,
        serialized,
        storageType: "sessionStorage",
        successOrFailed: "failed",
      });
      removeDetail("sessionStorage", detailId);
      return {
        key: "",
        storage: "sessionStorage" as const,
        warning:
          sessionError instanceof Error
            ? sessionError.message
            : "Unable to save planner detail",
      };
    }
  }
}

export function readPlannerDetailPayload<T = unknown>(detailIdOrKey?: string | null): T | null {
  if (!detailIdOrKey) return null;
  const key = manifestKey(detailIdOrKey);
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    const store = storeFor(storage);
    const manifest = safeParse<PlannerDetailManifest>(store?.getItem(key) || null);
    if (!store || !manifest) continue;
    try {
      const chunks: string[] = [];
      for (let index = 0; index < manifest.chunkCount; index += 1) {
        const chunk = store.getItem(chunkKey(manifest.detailId, index));
        if (chunk === null) throw new Error("Missing planner detail chunk");
        chunks.push(chunk);
      }
      return JSON.parse(chunks.join("")) as T;
    } catch {
      // Try next storage.
    }
  }
  return null;
}

export function compactPlannerDetailRecord(
  detailStorageKey?: string,
  summary?: Record<string, unknown>
): CompactPlannerDetailRecord {
  return {
    __plannerDetailRecord: true,
    detailStorageKey,
    source: "smart-planner",
    summary,
  };
}

export function resolvePlannerPayloadRecord<T = unknown>(value: unknown): T | null {
  if (typeof value !== "object" || value === null) return value as T | null;
  const record = value as Partial<CompactPlannerPayloadRecord> & Record<string, unknown>;
  if (record.__compactPlannerPayload || record.__plannerDetailRecord) {
    return typeof record.detailStorageKey === "string"
      ? readPlannerDetailPayload<T>(record.detailStorageKey)
      : null;
  }
  if (typeof record.detailStorageKey === "string") {
    return readPlannerDetailPayload<T>(record.detailStorageKey) || (value as T);
  }
  return value as T;
}

export function cleanupPlannerTempStorage() {
  if (typeof window === "undefined") return;
  [
    "tpl_tiya_checkout_draft",
    "tpl_tiya_checkout_draft_v1",
    "tpl_tiya_review_draft_v1",
    "tpl_tiya_workspace_review_payload_v1",
    "tpl_tiya_custom_package_draft",
    "tpl_tiya_smart_basket_draft",
  ].forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best effort cleanup.
    }
  });
}

export function resetSmartPlannerWorkingSession(options?: {
  preserveConfirmation?: boolean;
}) {
  if (typeof window === "undefined") return;

  SMART_PLANNER_WORKING_STORAGE_KEYS.forEach((key) => {
    if (options?.preserveConfirmation && key === "tpl_tiya_planner_confirmation_v1") {
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Best effort cleanup.
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best effort cleanup.
    }
  });

  try {
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_my_trips_updated"));
  } catch {
    // Event dispatch can fail in non-browser test environments.
  }
}
