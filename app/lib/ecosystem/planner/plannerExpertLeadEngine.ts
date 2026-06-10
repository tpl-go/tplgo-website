import {
  generateCheckoutDraft,
  type TiyaCheckoutDraft,
} from "./plannerCheckoutBridge";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export const TIYA_EXPERT_LEADS_KEY = "tpl_tiya_expert_leads";
export const TIYA_LAST_EXPERT_REQUEST_KEY = "tpl_tiya_last_expert_request";

export type TiyaExpertContact = {
  name: string;
  mobile: string;
  email: string;
  preferredContactTime: string;
  communicationMode: "Call" | "WhatsApp" | "Email";
  specialRequest: string;
};

export type TiyaExpertLeadPayload = {
  leadId: string;
  plannerTripId: string;
  tripIntent: TiyaTripIntent;
  packageQuoteBundleSummary: {
    route: string;
    selectedBundle: string;
    quoteEstimate: number;
    packageEstimate: number;
    selectedRoute: string;
    bookingModules: string[];
  };
  customerContact: TiyaExpertContact;
  priorityScore: number;
  priorityReasons: string[];
  leadSource: "Tiya Smart Planner";
  createdAt: string;
};

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode, quota limits, or locked-down browsers.
  }
}

function leadId() {
  return `tiya_lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function isMultiCity(intent: TiyaTripIntent) {
  return (
    intent.tripType === "Multi-city" ||
    intent.tripType === "Road trip loop" ||
    intent.toCity.toLowerCase().includes("europe") ||
    intent.toCity.toLowerCase().includes("international")
  );
}

export function generateLeadPriority({
  intent,
  checkoutDraft,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  checkoutDraft: TiyaCheckoutDraft;
  selectedRoute?: TiyaRouteOption;
}) {
  const reasons: string[] = [];
  let score = 42;

  if (checkoutDraft.quotePreview.totalQuoteEstimate >= 150000) {
    score += 18;
    reasons.push("High value trip");
  }

  if (isMultiCity(intent)) {
    score += 14;
    reasons.push("International or multi-city style planning");
  }

  if (intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury") {
    score += 14;
    reasons.push("Luxury budget or travel style");
  }

  if (intent.travelStyle === "Family" || intent.children > 0 || intent.seniors > 0) {
    score += 12;
    reasons.push("Family or senior traveller comfort needs");
  }

  if (selectedRoute?.riskLevel === "High") {
    score += 10;
    reasons.push("High risk route review needed");
  }

  if (
    intent.smartPreferences.includeCreatorSpots ||
    intent.smartPreferences.includeLocalMarket ||
    intent.customBudgetAmount
  ) {
    score += 8;
    reasons.push("Custom package request signals");
  }

  if (!reasons.length) {
    reasons.push("Standard planner handoff");
  }

  return {
    priorityScore: Math.min(98, score),
    priorityReasons: reasons,
  };
}

export function generateExpertLeadPayload({
  intent,
  plan,
  selectedRoute,
  contact,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  contact: TiyaExpertContact;
}): TiyaExpertLeadPayload {
  const checkoutDraft = generateCheckoutDraft({ intent, plan });
  const priority = generateLeadPriority({
    intent,
    checkoutDraft,
    selectedRoute,
  });

  return {
    leadId: leadId(),
    plannerTripId: checkoutDraft.plannerTripId,
    tripIntent: intent,
    packageQuoteBundleSummary: {
      route: checkoutDraft.route,
      selectedBundle: checkoutDraft.selectedBundle.name,
      quoteEstimate: checkoutDraft.quotePreview.totalQuoteEstimate,
      packageEstimate: checkoutDraft.packageEstimate,
      selectedRoute: selectedRoute?.name || checkoutDraft.route,
      bookingModules: checkoutDraft.bookingModules.map(
        (module) => module.serviceName
      ),
    },
    customerContact: contact,
    priorityScore: priority.priorityScore,
    priorityReasons: priority.priorityReasons,
    leadSource: "Tiya Smart Planner",
    createdAt: new Date().toISOString(),
  };
}

export function saveExpertLeadPayload(payload: TiyaExpertLeadPayload) {
  const leads = readJson<TiyaExpertLeadPayload[]>(TIYA_EXPERT_LEADS_KEY, []);
  const safeLeads = Array.isArray(leads) ? leads : [];
  const nextLeads = [payload, ...safeLeads].slice(0, 20);

  writeJson(TIYA_EXPERT_LEADS_KEY, nextLeads);
  writeJson(TIYA_LAST_EXPERT_REQUEST_KEY, payload);

  return nextLeads;
}

export function buildLeadSummaryText(payload: TiyaExpertLeadPayload) {
  return [
    `TPL Expert Lead: ${payload.leadId}`,
    `Route: ${payload.packageQuoteBundleSummary.route}`,
    `Bundle: ${payload.packageQuoteBundleSummary.selectedBundle}`,
    `Quote: ₹${payload.packageQuoteBundleSummary.quoteEstimate.toLocaleString("en-IN")}`,
    `Travellers: ${payload.tripIntent.adults + payload.tripIntent.children + payload.tripIntent.seniors}`,
    `Dates: ${payload.tripIntent.startDate} to ${payload.tripIntent.endDate}`,
    `Contact: ${payload.customerContact.name} · ${payload.customerContact.mobile} · ${payload.customerContact.communicationMode}`,
    `Priority: ${payload.priorityScore}/100 (${payload.priorityReasons.join(", ")})`,
  ].join("\n");
}

export function buildWhatsAppPreview(payload: TiyaExpertLeadPayload) {
  return `Hi TPL Expert, I want help reviewing my ${payload.packageQuoteBundleSummary.route} trip. Quote estimate is ₹${payload.packageQuoteBundleSummary.quoteEstimate.toLocaleString("en-IN")} with ${payload.packageQuoteBundleSummary.selectedBundle}. Preferred contact: ${payload.customerContact.communicationMode} at ${payload.customerContact.preferredContactTime}.`;
}
