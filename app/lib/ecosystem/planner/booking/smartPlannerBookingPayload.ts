export type PlannerRecord = Record<string, unknown>;

export type SmartPlannerRawPayloads = {
  rawBookingDraftPayload?: PlannerRecord;
  rawCheckoutPayload?: PlannerRecord;
  rawConfirmationPayload?: PlannerRecord;
  rawPaymentPayload?: PlannerRecord;
};

export type SmartPlannerSelectedServices = {
  selectedActivities: PlannerRecord[];
  selectedCabs: PlannerRecord[];
  selectedCreatorSpots: PlannerRecord[];
  selectedHotels: PlannerRecord[];
  selectedHomestays: PlannerRecord[];
  selectedInsurance: PlannerRecord[];
  selectedLocalLifeItems: PlannerRecord[];
  selectedLocalMarketItems: PlannerRecord[];
  selectedMeals: PlannerRecord[];
  selectedTransfers: PlannerRecord[];
  selectedVisa: PlannerRecord[];
  transportItems: PlannerRecord[];
  otherItems: PlannerRecord[];
};

export type SmartPlannerBookingMeta = {
  bookingId: string;
  createdAt: string;
  serviceType: "smart-planner";
  smartPlannerBookingId: string;
  sourceKeys: string[];
  updatedAt: string;
};

export type SmartPlannerBookingPayload = {
  backendBookingId?: string;
  backendCheckoutId?: string;
  backendCheckoutStatus?: string;
  backendPaymentId?: string;
  backendRequestId?: string;
  backendServiceType?: string;
  backendWalletSnapshot?: unknown;
  bookingId: string;
  bookingMeta: SmartPlannerBookingMeta;
  createdAt: string;
  dayPlans: PlannerRecord[];
  dayStatus?: unknown;
  earnedCreditAmount: number;
  fareSummary: PlannerRecord;
  itinerary: unknown;
  normalizedConfirmationData: PlannerRecord;
  notes?: unknown;
  offerSummary: PlannerRecord;
  paymentSummary: PlannerRecord;
  plannerAudit?: unknown;
  plannerIntelligence?: unknown;
  pricing: PlannerRecord;
  rawBookingDraftPayload?: PlannerRecord;
  rawCheckoutPayload?: PlannerRecord;
  rawConfirmationPayload?: PlannerRecord;
  rawPayloads: SmartPlannerRawPayloads;
  rawPaymentPayload?: PlannerRecord;
  rawPayloadSummary: PlannerRecord;
  readinessStatus?: unknown;
  routeData?: unknown;
  routeVariants?: unknown;
  selectedBasketItems: PlannerRecord[];
  selectedRoute?: unknown;
  selectedRouteVariant?: unknown;
  selectedServices: SmartPlannerSelectedServices;
  serviceType: "smart-planner";
  smartPlannerBookingId: string;
  smartPlannerPayload: PlannerRecord;
  travellers: unknown;
  updatedAt: string;
  walletSource?: string;
  walletSummary: PlannerRecord;
  walletSyncStatus?: string;
  walletSyncedAt?: string;
};

export type BuildSmartPlannerBookingPayloadInput = {
  bookingId: string;
  parsed: Record<string, any>;
  rawBookingDraftPayload?: unknown;
  rawCheckoutPayload?: unknown;
  rawConfirmationPayload?: unknown;
  rawPaymentPayload?: unknown;
  earnedCreditAmount?: number;
  now?: string;
};

export type SmartPlannerPayloadCompleteness = {
  missingRequiredSections: string[];
  presentSections: string[];
  warnings: string[];
};

export function safePlannerRecord(value: unknown): PlannerRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as PlannerRecord)
    : {};
}

export function safePlannerArray(value: unknown): PlannerRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is PlannerRecord =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    : [];
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export function firstNonEmptyRecord(...values: unknown[]): PlannerRecord {
  for (const value of values) {
    const record = safePlannerRecord(value);
    if (Object.keys(record).length > 0) return record;
  }

  return {};
}

export function firstNonEmptyArray(...values: unknown[]): PlannerRecord[] {
  for (const value of values) {
    const array = safePlannerArray(value);
    if (array.length > 0) return array;
  }

  return [];
}

export function mergePlannerPayloadSources(
  ...sources: Array<PlannerRecord | unknown>
): PlannerRecord {
  return sources.reduce<PlannerRecord>((merged, source) => {
    const record = safePlannerRecord(source);

    Object.entries(record).forEach(([key, value]) => {
      if (!hasMeaningfulValue(merged[key]) && hasMeaningfulValue(value)) {
        merged[key] = value;
      }
    });

    return merged;
  }, {});
}

function nestedSmartPlannerPayloads(...sources: unknown[]): PlannerRecord[] {
  return sources
    .map((source) => safePlannerRecord(source).smartPlannerPayload)
    .map(safePlannerRecord)
    .filter((record) => Object.keys(record).length > 0);
}

function firstNonEmptyValue(...values: unknown[]): unknown {
  return values.find(hasMeaningfulValue);
}

function payloadSize(value: unknown): number {
  if (!hasMeaningfulValue(value)) return 0;
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

function rawPayloadSummary(key: string, value: unknown): PlannerRecord {
  const record = safePlannerRecord(value);
  return {
    hasPayload: hasMeaningfulValue(value),
    key,
    size: payloadSize(value),
    topLevelFields: Object.keys(record).slice(0, 40),
  };
}

function compactConfirmationData(value: unknown): PlannerRecord {
  const record = safePlannerRecord(value);
  return {
    bookingId: record.bookingId,
    bookingMeta: record.bookingMeta,
    bookingStatus: record.bookingStatus,
    earnedCreditAmount: record.earnedCreditAmount,
    invoiceNumber: record.invoiceNumber,
    leadTraveller: record.leadTraveller,
    paymentId: record.paymentId,
    source: record.source,
    summary: record.summary,
  };
}

function curatedSmartPlannerPayload(value: unknown): PlannerRecord {
  const record = safePlannerRecord(value);
  const trip = safePlannerRecord(record.trip);
  const route = firstNonEmptyValue(record.routeData, record.route);

  return {
    bookingMode: record.bookingMode,
    budgetEstimate: record.budgetEstimate,
    contactDetails: record.contactDetails,
    dayPlans: firstNonEmptyArray(record.dayPlans, safePlannerRecord(record.itinerary).dayPlans),
    dayStatus: record.dayStatus,
    dayStatuses: record.dayStatuses,
    itinerary: record.itinerary,
    notes: record.notes,
    plannerAudit: record.plannerAudit,
    plannerIntelligence: record.plannerIntelligence,
    preferences: record.preferences,
    quoteEstimate: record.quoteEstimate,
    readinessStatus: record.readinessStatus,
    route,
    routeData: record.routeData || route,
    routeVariants: record.routeVariants || record.routeOptions,
    selectedActivities: record.selectedActivities,
    selectedBasketItems: record.selectedBasketItems,
    selectedBasketValue: record.selectedBasketValue,
    selectedCabs: record.selectedCabs,
    selectedCreatorSpots: record.selectedCreatorSpots,
    selectedHotels: record.selectedHotels,
    selectedHomestays: record.selectedHomestays,
    selectedInsurance: record.selectedInsurance,
    selectedLocalLifeItems: record.selectedLocalLifeItems,
    selectedLocalMarketItems: record.selectedLocalMarketItems,
    selectedMeals: record.selectedMeals,
    selectedRoute: record.selectedRoute,
    selectedRouteVariant: record.selectedRouteVariant,
    selectedServices: record.selectedServices,
    selectedTransfers: record.selectedTransfers,
    selectedVisa: record.selectedVisa,
    travellerDetails: record.travellerDetails,
    travellers: record.travellers,
    trip: {
      dateRange: trip.dateRange,
      destination: trip.destination,
      duration: trip.duration,
      durationDays: trip.durationDays,
      durationLabel: trip.durationLabel,
      endDate: trip.endDate,
      name: trip.name,
      nights: trip.nights,
      origin: trip.origin,
      startDate: trip.startDate,
      title: trip.title,
      totalDays: trip.totalDays,
      travelStyle: trip.travelStyle,
      tripType: trip.tripType,
    },
    tripMode: record.tripMode,
  };
}

function normalizeDayStatusValue(status: unknown): unknown {
  const value = typeof status === "string" ? status.toUpperCase() : "";
  if (value === "FINALIZED") return "FINALIZED";
  if (value === "EDITING") return "EDITING";
  if (value === "READY_TO_FINALIZE") return "READY_TO_FINALIZE";
  if (value === "PLANNING" || value === "PENDING" || value === "DRAFT") return "PLANNING";
  if (typeof status === "boolean") return status ? "FINALIZED" : "PLANNING";
  return undefined;
}

function normalizeDayStatuses(...sources: unknown[]): PlannerRecord {
  const merged: PlannerRecord = {};

  sources.forEach((source) => {
    const record = safePlannerRecord(source);
    const candidates = [
      record.dayStatus,
      record.dayStatuses,
      safePlannerRecord(record.smartPlannerPayload).dayStatus,
      safePlannerRecord(record.smartPlannerPayload).dayStatuses,
    ];

    candidates.forEach((candidate) => {
      const statuses = safePlannerRecord(candidate);
      Object.entries(statuses).forEach(([dayId, status]) => {
        const normalized = normalizeDayStatusValue(status);
        if (normalized) merged[dayId] = normalized;
      });
    });
  });

  return merged;
}

function firstNonEmptyNumber(...values: unknown[]): number {
  for (const value of values) {
    const number = Number(value ?? 0);
    if (Number.isFinite(number) && number > 0) return number;
  }

  return 0;
}

function resolveDayPlans(...sources: unknown[]): PlannerRecord[] {
  for (const source of sources) {
    const record = safePlannerRecord(source);
    const itinerary = record.itinerary;
    const itineraryRecord = safePlannerRecord(itinerary);
    const candidate = firstNonEmptyArray(
      record.dayPlans,
      itinerary,
      itineraryRecord.dayPlans,
      itineraryRecord.days,
      itineraryRecord.itineraryDays,
      itineraryRecord.generatedDays,
      safePlannerRecord(itineraryRecord.plan).days
    );

    if (candidate.length > 0) return candidate;
  }

  return [];
}

function resolveFareSummary(...sources: unknown[]): PlannerRecord {
  for (const source of sources) {
    const record = safePlannerRecord(source);
    const fare = firstNonEmptyRecord(
      record.plannerFareSummary,
      record.fareSummary,
      record.priceSummary,
      record.pricing,
      record.fare,
      safePlannerRecord(record.payment).fareSummary
    );

    if (Object.keys(fare).length > 0) return fare;
  }

  return {};
}

function buildSelectedServices(...sources: unknown[]): SmartPlannerSelectedServices {
  return {
    otherItems: firstNonEmptyArray(...sources.map((source) => safePlannerRecord(source).otherItems)),
    selectedActivities: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedActivities)
    ),
    selectedCabs: firstNonEmptyArray(...sources.map((source) => safePlannerRecord(source).selectedCabs)),
    selectedCreatorSpots: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedCreatorSpots)
    ),
    selectedHotels: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedHotels)
    ),
    selectedHomestays: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedHomestays)
    ),
    selectedInsurance: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedInsurance)
    ),
    selectedLocalLifeItems: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedLocalLifeItems)
    ),
    selectedLocalMarketItems: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedLocalMarketItems)
    ),
    selectedMeals: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedMeals)
    ),
    selectedTransfers: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).selectedTransfers)
    ),
    selectedVisa: firstNonEmptyArray(...sources.map((source) => safePlannerRecord(source).selectedVisa)),
    transportItems: firstNonEmptyArray(
      ...sources.map((source) => safePlannerRecord(source).transportItems)
    ),
  };
}

function sourceKeys(input: BuildSmartPlannerBookingPayloadInput): string[] {
  return [
    input.rawConfirmationPayload ? "rawConfirmationPayload" : "",
    input.rawPaymentPayload ? "rawPaymentPayload" : "",
    input.rawBookingDraftPayload ? "rawBookingDraftPayload" : "",
    input.rawCheckoutPayload ? "rawCheckoutPayload" : "",
  ].filter(Boolean);
}

export function buildSmartPlannerBookingPayload(
  input: BuildSmartPlannerBookingPayloadInput
): SmartPlannerBookingPayload {
  const now = input.now || new Date().toISOString();
  const parsed = safePlannerRecord(input.parsed);
  const confirmation = safePlannerRecord(input.rawConfirmationPayload);
  const payment = safePlannerRecord(input.rawPaymentPayload);
  const bookingDraft = safePlannerRecord(input.rawBookingDraftPayload);
  const checkout = safePlannerRecord(input.rawCheckoutPayload);
  const smartPayloadSources = nestedSmartPlannerPayloads(
    parsed,
    confirmation,
    payment,
    bookingDraft,
    checkout
  );
  const prioritySources = [
    parsed,
    confirmation,
    payment,
    bookingDraft,
    checkout,
    ...smartPayloadSources,
  ];
  const merged = mergePlannerPayloadSources(...prioritySources);
  const smartPlannerPayload = mergePlannerPayloadSources(
    curatedSmartPlannerPayload(mergePlannerPayloadSources(...smartPayloadSources, merged))
  );
  const summary = safePlannerRecord(merged.summary);
  const paymentRecord = safePlannerRecord(merged.payment);
  const bookingMeta = safePlannerRecord(merged.bookingMeta);
  const fareSummary = resolveFareSummary(...prioritySources);
  const selectedServices = buildSelectedServices(...prioritySources);
  const selectedBasketItems = firstNonEmptyArray(
    ...prioritySources.map((source) => safePlannerRecord(source).selectedBasketItems),
    summary.selectedBasketItems,
    ...smartPayloadSources.map((source) => source.selectedBasketItems)
  );
  const dayPlans = resolveDayPlans(...prioritySources, smartPlannerPayload);
  const route = firstNonEmptyRecord(
    merged.route,
    smartPlannerPayload.route,
    summary.routeData
  );
  const routeData = firstNonEmptyValue(
    merged.routeData,
    route,
    smartPlannerPayload.routeData,
    smartPlannerPayload.route
  );
  const selectedRouteVariant = firstNonEmptyValue(
    merged.selectedRouteVariant,
    route.selectedRouteVariant,
    smartPlannerPayload.selectedRouteVariant,
    safePlannerRecord(smartPlannerPayload.route).selectedRouteVariant
  );
  const earnedCreditAmount = firstNonEmptyNumber(
    input.earnedCreditAmount,
    merged.earnedCreditAmount,
    fareSummary.earnedCreditAmount,
    safePlannerRecord(fareSummary.walletBreakdown).earnedOnThisBooking
  );
  const dayStatus = normalizeDayStatuses(...prioritySources, smartPlannerPayload);
  const rawPayloads = {
    rawBookingDraftPayload: rawPayloadSummary("tpl_tiya_planner_booking_draft_v1", input.rawBookingDraftPayload),
    rawCheckoutPayload: rawPayloadSummary("tpl_tiya_checkout_v1", input.rawCheckoutPayload),
    rawConfirmationPayload: rawPayloadSummary("tpl_tiya_planner_confirmation_v1", input.rawConfirmationPayload),
    rawPaymentPayload: rawPayloadSummary("tpl_tiya_planner_payment_v1", input.rawPaymentPayload),
  };
  const backendRefs = {
    backendBookingId: firstNonEmptyValue(merged.backendBookingId),
    backendCheckoutId: firstNonEmptyValue(merged.backendCheckoutId),
    backendCheckoutStatus: firstNonEmptyValue(merged.backendCheckoutStatus),
    backendPaymentId: firstNonEmptyValue(merged.backendPaymentId),
    backendRequestId: firstNonEmptyValue(merged.backendRequestId),
    backendServiceType: firstNonEmptyValue(merged.backendServiceType),
  };
  const walletMetadata = {
    backendWalletSnapshot: firstNonEmptyValue(merged.backendWalletSnapshot),
    walletSource: firstNonEmptyValue(merged.walletSource),
    walletSyncStatus: firstNonEmptyValue(merged.walletSyncStatus),
    walletSyncedAt: firstNonEmptyValue(merged.walletSyncedAt),
  };

  return {
    ...(backendRefs.backendBookingId ? { backendBookingId: String(backendRefs.backendBookingId) } : {}),
    ...(backendRefs.backendCheckoutId ? { backendCheckoutId: String(backendRefs.backendCheckoutId) } : {}),
    ...(backendRefs.backendCheckoutStatus ? { backendCheckoutStatus: String(backendRefs.backendCheckoutStatus) } : {}),
    ...(backendRefs.backendPaymentId ? { backendPaymentId: String(backendRefs.backendPaymentId) } : {}),
    ...(backendRefs.backendRequestId ? { backendRequestId: String(backendRefs.backendRequestId) } : {}),
    ...(backendRefs.backendServiceType ? { backendServiceType: String(backendRefs.backendServiceType) } : {}),
    ...(walletMetadata.backendWalletSnapshot
      ? { backendWalletSnapshot: walletMetadata.backendWalletSnapshot }
      : {}),
    bookingId: input.bookingId,
    bookingMeta: {
      ...bookingMeta,
      bookingId: input.bookingId,
      createdAt: String(bookingMeta.createdAt || merged.createdAt || now),
      serviceType: "smart-planner",
      smartPlannerBookingId: input.bookingId,
      sourceKeys: sourceKeys(input),
      updatedAt: String(bookingMeta.updatedAt || merged.updatedAt || now),
      ...(backendRefs.backendCheckoutId
        ? {
            backendCheckoutId: String(backendRefs.backendCheckoutId),
            backendServiceType: String(backendRefs.backendServiceType || "smart-planner"),
            backendCheckoutStatus: String(backendRefs.backendCheckoutStatus || ""),
          }
        : {}),
    },
    createdAt: String(merged.createdAt || now),
    dayPlans,
    dayStatus,
    earnedCreditAmount,
    fareSummary,
    itinerary: firstNonEmptyValue(merged.itinerary, smartPlannerPayload.itinerary, { dayPlans }),
    normalizedConfirmationData: compactConfirmationData(parsed),
    notes: firstNonEmptyValue(merged.notes, smartPlannerPayload.notes),
    offerSummary: firstNonEmptyRecord(
      merged.offerSummary,
      merged.offerData,
      fareSummary.offerData
    ),
    paymentSummary: firstNonEmptyRecord(merged.paymentSummary, paymentRecord),
    plannerAudit: firstNonEmptyValue(merged.plannerAudit, smartPlannerPayload.plannerAudit),
    plannerIntelligence: firstNonEmptyValue(
      merged.plannerIntelligence,
      smartPlannerPayload.plannerIntelligence
    ),
    pricing: firstNonEmptyRecord(merged.pricing, fareSummary),
    rawBookingDraftPayload: rawPayloads.rawBookingDraftPayload,
    rawCheckoutPayload: rawPayloads.rawCheckoutPayload,
    rawConfirmationPayload: rawPayloads.rawConfirmationPayload,
    rawPayloads,
    rawPaymentPayload: rawPayloads.rawPaymentPayload,
    rawPayloadSummary: rawPayloads,
    readinessStatus: firstNonEmptyValue(
      merged.readinessStatus,
      smartPlannerPayload.readinessStatus
    ),
    routeData,
    routeVariants: firstNonEmptyValue(
      merged.routeVariants,
      smartPlannerPayload.routeVariants
    ),
    selectedBasketItems,
    selectedRoute: firstNonEmptyValue(
      merged.selectedRoute,
      smartPlannerPayload.selectedRoute,
      selectedRouteVariant
    ),
    selectedRouteVariant,
    selectedServices,
    serviceType: "smart-planner",
    smartPlannerBookingId: input.bookingId,
    smartPlannerPayload,
    travellers: firstNonEmptyValue(
      merged.travellers,
      merged.traveller,
      smartPlannerPayload.travellers
    ),
    updatedAt: String(merged.updatedAt || now),
    ...(walletMetadata.walletSource ? { walletSource: String(walletMetadata.walletSource) } : {}),
    ...(walletMetadata.walletSyncStatus
      ? { walletSyncStatus: String(walletMetadata.walletSyncStatus) }
      : {}),
    ...(walletMetadata.walletSyncedAt ? { walletSyncedAt: String(walletMetadata.walletSyncedAt) } : {}),
    walletSummary: firstNonEmptyRecord(
      merged.walletSummary,
      walletMetadata.walletSource || walletMetadata.walletSyncStatus
        ? {
            walletSource: walletMetadata.walletSource,
            walletSyncStatus: walletMetadata.walletSyncStatus,
          }
        : {},
      safePlannerRecord(fareSummary.walletBreakdown),
      safePlannerRecord(paymentRecord.walletBreakdown)
    ),
  };
}

export function getSmartPlannerPayloadCompleteness(
  payload: SmartPlannerBookingPayload
): SmartPlannerPayloadCompleteness {
  const checks: Array<[string, boolean]> = [
    ["selectedBasketItems", payload.selectedBasketItems.length > 0],
    ["itinerary/dayPlans", payload.dayPlans.length > 0 || hasMeaningfulValue(payload.itinerary)],
    [
      "selected services",
      Object.values(payload.selectedServices).some((items) => items.length > 0),
    ],
    ["route data", hasMeaningfulValue(payload.routeData) || hasMeaningfulValue(payload.selectedRoute)],
    ["pricing/fare summary", Object.keys(payload.fareSummary).length > 0],
    ["payment summary", Object.keys(payload.paymentSummary).length > 0],
    ["travellers", hasMeaningfulValue(payload.travellers)],
    [
      "raw payloads",
      Boolean(
        payload.rawPayloads.rawConfirmationPayload?.hasPayload ||
          payload.rawPayloads.rawPaymentPayload?.hasPayload ||
          payload.rawPayloads.rawBookingDraftPayload?.hasPayload ||
          payload.rawPayloads.rawCheckoutPayload?.hasPayload
      ),
    ],
  ];
  const missingRequiredSections = checks
    .filter(([, present]) => !present)
    .map(([section]) => section);
  const presentSections = checks
    .filter(([, present]) => present)
    .map(([section]) => section);
  const warnings = [
    payload.selectedBasketItems.length === 0
      ? "No selected basket items are present in the master payload."
      : "",
    payload.dayPlans.length === 0
      ? "No day-wise itinerary/dayPlans were found in the merged sources."
      : "",
    !hasMeaningfulValue(payload.routeData)
      ? "Route data is missing or empty."
      : "",
    Object.keys(payload.fareSummary).length === 0
      ? "Fare summary is missing; downstream pages should avoid recalculation."
      : "",
  ].filter(Boolean);

  return {
    missingRequiredSections,
    presentSections,
    warnings,
  };
}
