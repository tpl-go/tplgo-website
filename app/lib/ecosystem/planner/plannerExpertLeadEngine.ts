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
  status: "draft" | "submitted";
  source: "Tiya Smart Planner";
  plannerTripId: string;
  userId?: string;
  tripSummary: string;
  routeScenario: string;
  quoteEstimate: number;
  selectedBundle: string;
  travellers: number;
  travelDates: {
    startDate: string;
    endDate: string;
  };
  selectedServices: string[];
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
  contact: TiyaExpertContact;
  userContactData: TiyaExpertContact;
  message: string;
  communicationMode: TiyaExpertContact["communicationMode"];
  priorityScore: number;
  priorityReasons: string[];
  leadSource: "Tiya Smart Planner";
  createdAt: string;
  updatedAt: string;
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

  const now = new Date().toISOString();

  return {
    leadId: leadId(),
    status: "submitted",
    source: "Tiya Smart Planner",
    plannerTripId: checkoutDraft.plannerTripId,
    tripSummary: `${intent.fromCity} to ${intent.toCity} · ${intent.travelStyle} · ${intent.pace}`,
    routeScenario: selectedRoute?.name || checkoutDraft.route,
    quoteEstimate: checkoutDraft.quotePreview.totalQuoteEstimate,
    selectedBundle: checkoutDraft.selectedBundle.name,
    travellers: checkoutDraft.travellers.total,
    travelDates: {
      startDate: checkoutDraft.dates.startDate,
      endDate: checkoutDraft.dates.endDate,
    },
    selectedServices: checkoutDraft.bookingModules.map(
      (module) => module.serviceName
    ),
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
    contact,
    userContactData: contact,
    message: contact.specialRequest,
    communicationMode: contact.communicationMode,
    priorityScore: priority.priorityScore,
    priorityReasons: priority.priorityReasons,
    leadSource: "Tiya Smart Planner",
    createdAt: now,
    updatedAt: now,
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

export function saveExpertLeadDraftPayload(payload: TiyaExpertLeadPayload) {
  writeJson(TIYA_LAST_EXPERT_REQUEST_KEY, payload);
  return payload;
}

export function buildLeadSummaryText(payload: TiyaExpertLeadPayload) {
  return [
    `TPL Expert Lead: ${payload.leadId}`,
    `Status: ${payload.status}`,
    `Trip: ${payload.tripSummary}`,
    `Route: ${payload.routeScenario}`,
    `Dates: ${payload.travelDates.startDate} to ${payload.travelDates.endDate}`,
    `Quote: ₹${payload.quoteEstimate.toLocaleString("en-IN")}`,
    `Travellers: ${payload.travellers}`,
    `Bundle: ${payload.selectedBundle}`,
    `Services: ${payload.selectedServices.join(", ") || "Review pending"}`,
    `Contact: ${payload.contact.name} · ${payload.contact.mobile} · ${payload.contact.email || "No email"} · ${payload.contact.communicationMode}`,
    `Message: ${payload.message || "No special message"}`,
    `Priority: ${payload.priorityScore}/100 (${payload.priorityReasons.join(", ")})`,
  ].join("\n");
}

export function buildWhatsAppPreview(payload: TiyaExpertLeadPayload) {
  return [
    "Hi TPL Expert, I want help reviewing my Smart Planner trip.",
    `Route: ${payload.routeScenario}`,
    `Dates: ${payload.travelDates.startDate} to ${payload.travelDates.endDate}`,
    `Quote estimate: ₹${payload.quoteEstimate.toLocaleString("en-IN")}`,
    `Travellers: ${payload.travellers}`,
    `Bundle: ${payload.selectedBundle}`,
    `Preferred contact: ${payload.contact.communicationMode}${payload.contact.preferredContactTime ? ` at ${payload.contact.preferredContactTime}` : ""}`,
    `Contact: ${payload.contact.name || "Name pending"} · ${payload.contact.mobile || "Mobile pending"}`,
    payload.message ? `Request: ${payload.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
