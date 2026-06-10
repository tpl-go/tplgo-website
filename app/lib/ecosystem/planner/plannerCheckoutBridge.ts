import { getPlannerBudgetTotal } from "./plannerBudgetEngine";
import {
  generateSmartBundles,
  type TiyaSmartBundle,
} from "./plannerBundleEngine";
import {
  generateQuoteBreakup,
  generateQuoteVersions,
  type TiyaQuoteBreakup,
} from "./plannerQuoteEngine";
import type {
  TiyaBookingModule,
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "./plannerTypes";

export const TIYA_CHECKOUT_DRAFT_KEY = "tpl_tiya_checkout_draft";
export const TIYA_SELECTED_BUNDLE_KEY = "tpl_tiya_selected_bundle";
export const TIYA_QUOTE_PREVIEW_KEY = "tpl_tiya_quote_preview";

export type TiyaCheckoutChecklistItem = {
  id: string;
  label: string;
  status: "Ready" | "Required" | "Optional" | "Not started";
  detail: string;
};

export type TiyaCheckoutDraft = {
  plannerTripId: string;
  route: string;
  dates: {
    startDate: string;
    endDate: string;
  };
  travellers: {
    adults: number;
    children: number;
    seniors: number;
    pets: boolean;
    total: number;
  };
  selectedBundle: {
    id: string;
    name: string;
    includedItems: string[];
  };
  packageEstimate: number;
  quotePreview: TiyaQuoteBreakup;
  bookingModules: Array<{
    id: TiyaBookingModule["id"];
    serviceName: string;
    readiness: TiyaBookingModule["readiness"];
    href: string;
  }>;
  addOns: string[];
  paymentStarted: false;
  createdAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function writeStorage(key: string, value: unknown, storage: "session" | "local") {
  if (!canUseStorage()) return;

  try {
    const target =
      storage === "session" ? window.sessionStorage : window.localStorage;
    target.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode, quota limits, or locked-down browsers.
  }
}

function travellerTotal(intent: TiyaTripIntent) {
  return intent.adults + intent.children + intent.seniors;
}

function buildPlannerTripId(intent: TiyaTripIntent) {
  return `tiya_checkout_${intent.fromCity}_${intent.toCity}_${intent.startDate}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

export function getCheckoutSelectedBundle({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaSmartBundle {
  const bundles = generateSmartBundles({ intent, plan });
  return bundles.find((bundle) => bundle.isRecommended) ?? bundles[0];
}

export function generateCheckoutDraft({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaCheckoutDraft {
  const selectedBundle = getCheckoutSelectedBundle({ intent, plan });
  const quoteVersions = generateQuoteVersions(intent);
  const quoteVersion =
    quoteVersions.find((version) => version.isRecommended) ?? quoteVersions[1];
  const quotePreview = generateQuoteBreakup({
    intent,
    plan,
    versionId: quoteVersion.id,
  });
  const bookingModules = Array.isArray(plan.bookingModules)
    ? plan.bookingModules
    : [];
  const selectedBookingModules = bookingModules
    .filter((module) => module.isHighlighted || module.readiness === "Ready")
    .map((module) => ({
      id: module.id,
      serviceName: module.serviceName,
      readiness: module.readiness,
      href: module.href,
    }));
  const addOns = [
    intent.smartPreferences.includeInsurance ? "Insurance" : "",
    intent.smartPreferences.includeCreatorSpots ? "Creator experiences" : "",
    intent.smartPreferences.includeLocalMarket ? "Local market add-ons" : "",
    intent.pets ? "Pet-friendly planning" : "",
  ].filter(Boolean);

  return {
    plannerTripId: buildPlannerTripId(intent),
    route: `${intent.fromCity} to ${intent.toCity}`,
    dates: {
      startDate: intent.startDate,
      endDate: intent.endDate,
    },
    travellers: {
      adults: intent.adults,
      children: intent.children,
      seniors: intent.seniors,
      pets: intent.pets,
      total: travellerTotal(intent),
    },
    selectedBundle: {
      id: selectedBundle.id,
      name: selectedBundle.name,
      includedItems: selectedBundle.includedItems,
    },
    packageEstimate: Math.max(getPlannerBudgetTotal(intent), quotePreview.totalQuoteEstimate),
    quotePreview,
    bookingModules: selectedBookingModules,
    addOns,
    paymentStarted: false,
    createdAt: new Date().toISOString(),
  };
}

export function generateCheckoutChecklist({
  intent,
  draft,
}: {
  intent: TiyaTripIntent;
  draft: TiyaCheckoutDraft;
}): TiyaCheckoutChecklistItem[] {
  const hasStay = intent.smartPreferences.includeStays && intent.stayPreference !== "No Stay Needed";

  return [
    {
      id: "travellers",
      label: "Traveller details required",
      status: draft.travellers.total > 0 ? "Required" : "Not started",
      detail: `${draft.travellers.total} traveller profile${draft.travellers.total === 1 ? "" : "s"} need final details before booking.`,
    },
    {
      id: "transport",
      label: "Transport selected",
      status: intent.transportMode ? "Ready" : "Required",
      detail: intent.transportMode || "Select transport mode before checkout.",
    },
    {
      id: "stay",
      label: "Stay selected",
      status: hasStay ? "Ready" : "Optional",
      detail: hasStay ? intent.stayPreference : "Stay can remain optional for no-stay plans.",
    },
    {
      id: "insurance",
      label: "Insurance optional/selected",
      status: intent.smartPreferences.includeInsurance ? "Ready" : "Optional",
      detail: intent.smartPreferences.includeInsurance
        ? "Insurance selected in smart preferences."
        : "Insurance can be added before payment.",
    },
    {
      id: "bundle",
      label: "Bundle selected",
      status: draft.selectedBundle.name ? "Ready" : "Required",
      detail: draft.selectedBundle.name,
    },
    {
      id: "quote",
      label: "Quote generated",
      status: draft.quotePreview.totalQuoteEstimate > 0 ? "Ready" : "Required",
      detail: `Quote estimate ₹${draft.quotePreview.totalQuoteEstimate.toLocaleString("en-IN")}.`,
    },
    {
      id: "payment",
      label: "Payment not started",
      status: "Not started",
      detail: "No payment flow is initiated from Smart Planner yet.",
    },
  ];
}

export function saveCheckoutDraft(draft: TiyaCheckoutDraft) {
  writeStorage(TIYA_CHECKOUT_DRAFT_KEY, draft, "session");
  writeStorage(TIYA_SELECTED_BUNDLE_KEY, draft.selectedBundle, "local");
  writeStorage(TIYA_QUOTE_PREVIEW_KEY, draft.quotePreview, "local");
}
