export type BackendCheckoutService =
  | "flight"
  | "hotel"
  | "homestay"
  | "package"
  | "bus"
  | "train"
  | "cab"
  | "cruise"
  | "visa"
  | "insurance"
  | "smart-planner";

export type BackendFeatureFlags = {
  useBackendCheckout: boolean;
  enabledServices: BackendCheckoutService[];
  fallbackToLocalFlow: boolean;
  debugBackendPayloads: boolean;
};

export const ALL_BACKEND_CHECKOUT_SERVICES: BackendCheckoutService[] = [
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
];

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") return fallback;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function readEnabledServices(value: string | undefined): BackendCheckoutService[] {
  if (!value?.trim()) return [];
  const requested = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (requested.includes("all")) return [...ALL_BACKEND_CHECKOUT_SERVICES];

  return requested.filter((service): service is BackendCheckoutService =>
    ALL_BACKEND_CHECKOUT_SERVICES.includes(service as BackendCheckoutService)
  );
}

export const backendFeatureFlags: BackendFeatureFlags = {
  useBackendCheckout: readBoolean(process.env.NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT, false),
  enabledServices: readEnabledServices(process.env.NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES),
  fallbackToLocalFlow: readBoolean(process.env.NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL, true),
  debugBackendPayloads: readBoolean(process.env.NEXT_PUBLIC_TPL_DEBUG_BACKEND_PAYLOADS, false),
};

export function isBackendCheckoutEnabled(serviceType: string): serviceType is BackendCheckoutService {
  if (!backendFeatureFlags.useBackendCheckout) return false;
  return backendFeatureFlags.enabledServices.includes(serviceType as BackendCheckoutService);
}

