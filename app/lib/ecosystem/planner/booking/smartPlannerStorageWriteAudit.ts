"use client";

type StorageWriteAuditInput = {
  error?: unknown;
  file: string;
  functionName: string;
  key: string;
  payload?: unknown;
  serialized?: string;
  storageType: "localStorage" | "sessionStorage";
  successOrFailed: "success" | "failed" | "attempt";
};

type StorageKeySummary = {
  key: string;
  sizeKB: number;
  storageType: "localStorage" | "sessionStorage";
};

function isEnabled() {
  if (typeof window === "undefined") return false;
  return (
    process.env.NODE_ENV !== "production" ||
    window.localStorage.getItem("tpl_sp_storage_debug") === "1"
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function safeStringify(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function includesKey(record: Record<string, unknown>, patterns: RegExp[]) {
  const keys = Object.keys(record);
  return keys.some((key) => patterns.some((pattern) => pattern.test(key)));
}

function deepContains(value: unknown, patterns: RegExp[], depth = 0): boolean {
  if (!value || depth > 4) return false;
  if (Array.isArray(value)) {
    return value.some((item) => deepContains(item, patterns, depth + 1));
  }
  const record = asRecord(value);
  if (!Object.keys(record).length) return false;
  if (includesKey(record, patterns)) return true;
  return Object.values(record).some((item) => deepContains(item, patterns, depth + 1));
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) return text;
    }
  }
  return "";
}

function readStoreKeys(storage: Storage): StorageKeySummary[] {
  const rows: StorageKeySummary[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index) || "";
    if (!key) continue;
    const isSmartPlannerKey =
      key.includes("tpl_tiya") ||
      key.includes("smart_planner") ||
      key.includes("smart-planner") ||
      key.includes("planner") ||
      key.includes("tpl_my_trips");
    if (!isSmartPlannerKey) continue;
    const value = storage.getItem(key) || "";
    rows.push({
      key,
      sizeKB: Number((value.length / 1024).toFixed(2)),
      storageType: storage === window.localStorage ? "localStorage" : "sessionStorage",
    });
  }
  return rows.sort((a, b) => b.sizeKB - a.sizeKB);
}

export function logSmartPlannerStorageWrite(input: StorageWriteAuditInput) {
  if (!isEnabled()) return;

  const serialized = input.serialized ?? safeStringify(input.payload);
  const payload =
    input.payload !== undefined
      ? input.payload
      : serialized
        ? (() => {
            try {
              return JSON.parse(serialized);
            } catch {
              return serialized;
            }
          })()
        : null;
  const record = asRecord(payload);
  const smartPlannerPayload = asRecord(record.smartPlannerPayload);
  const selectedServices = asRecord(record.selectedServices);
  const itinerary = asRecord(record.itinerary || smartPlannerPayload.itinerary);
  const selectedBasketItems =
    safeArray(record.selectedBasketItems).length
      ? safeArray(record.selectedBasketItems)
      : safeArray(smartPlannerPayload.selectedBasketItems);
  const serviceType = firstText(
    record.serviceType,
    record.service,
    smartPlannerPayload.serviceType,
    asRecord(record.bookingMeta).serviceType
  );

  console.log("[SP STORAGE WRITE]", {
    containsDayPlans:
      safeArray(record.dayPlans).length > 0 ||
      safeArray(itinerary.dayPlans).length > 0 ||
      safeArray(itinerary.days).length > 0,
    containsItinerary: Object.keys(itinerary).length > 0 || safeArray(record.itinerary).length > 0,
    containsPackageSemantics:
      Boolean(record.isCustomPackage) ||
      serviceType === "package" ||
      includesKey(record, [/package/i]) ||
      includesKey(smartPlannerPayload, [/package/i]),
    containsPlannerIntelligence: deepContains(payload, [/plannerIntelligence/i]),
    containsRawPayload: deepContains(payload, [/raw.*payload/i, /fullPlannerPayload/i]),
    containsRouteVariants: deepContains(payload, [/routeVariants/i]),
    containsSelectedBasketItems: selectedBasketItems.length > 0,
    containsSelectedServices:
      Object.keys(selectedServices).length > 0 || deepContains(payload, [/selectedServices/i]),
    errorMessage:
      input.error instanceof Error
        ? `${input.error.name}: ${input.error.message}`
        : input.error
          ? String(input.error)
          : "",
    file: input.file,
    function: input.functionName,
    isCustomPackage: Boolean(record.isCustomPackage),
    itemCount: selectedBasketItems.length,
    key: input.key,
    serviceType,
    sizeKB: Number((serialized.length / 1024).toFixed(2)),
    storageType: input.storageType,
    successOrFailed: input.successOrFailed,
  });
}

export function logSmartPlannerProceedStorageSummary() {
  if (!isEnabled() || typeof window === "undefined") return;
  console.log("[SP PROCEED STORAGE SUMMARY]", [
    ...readStoreKeys(window.sessionStorage),
    ...readStoreKeys(window.localStorage),
  ]);
}
