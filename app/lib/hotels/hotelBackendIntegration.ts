import type { Hotel, RoomVariant } from "@/app/data/stays/types";
import {
  createTplRequestId,
  tplApiRequest,
  type TplApiFailure,
  type TplApiResult,
} from "@/app/lib/api/tplApiClient";

export type HotelBackendMoney = {
  base: string;
  taxes: string;
  fees: string;
  total: string;
  currency: string;
};

export type HotelBackendOccupancy = {
  adults: number;
  children: number;
  childAges?: number[];
};

export type HotelBackendSearchRequest = {
  destination: string;
  destinationType: "city";
  checkIn: string;
  checkOut: string;
  rooms: HotelBackendOccupancy[];
  currency: "INR";
  filters?: {
    minPrice?: string;
    maxPrice?: string;
    starRating?: number[];
    amenities?: string[];
    refundableOnly?: boolean;
  };
  pagination?: {
    limit?: number;
    cursor?: string;
  };
};

export type HotelBackendSearchResponse = {
  searchId: string;
  providerId: string;
  source: string;
  hotels: HotelBackendSummary[];
  warnings: string[];
  expiresAt: string;
};

export type HotelBackendSummary = {
  hotelId: string;
  name: string;
  location: {
    city: string;
    country: string;
    geo?: { lat: number; lng: number };
    landmark?: string;
  };
  address: {
    line1: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  geo?: { lat: number; lng: number };
  rating?: number;
  starRating?: number;
  reviewCount?: number;
  images: Array<{ url: string; alt?: string }>;
  amenities: string[];
  minimumPrice: HotelBackendMoney;
  taxesAndFeesIncluded: boolean;
  available: boolean;
  description?: string;
  policies?: Array<{ type: string; title: string; description: string }>;
  checkInTime?: string;
  checkOutTime?: string;
  expiresAt?: string;
};

export type HotelBackendRate = {
  roomId: string;
  rateId: string;
  roomName: string;
  roomDescription: string;
  occupancy: HotelBackendOccupancy;
  mealPlan: "room_only" | "breakfast" | "half_board" | "full_board" | "all_inclusive";
  includedServices: string[];
  cancellationPolicy: {
    type: "free_cancellation" | "partial_refund" | "non_refundable";
    description: string;
  };
  price: HotelBackendMoney;
  expiresAt: string;
  remainingRooms: number;
  bookingAllowed: false;
  supplierBookingDisabled: true;
};

export type HotelBackendRatesResponse = {
  searchId: string;
  hotelId: string;
  providerId: string;
  source: string;
  rates: HotelBackendRate[];
  warnings: string[];
  expiresAt: string;
};

export type HotelBackendQuoteResponse = {
  quoteId: string;
  searchId: string;
  hotelId: string;
  roomId: string;
  rateId: string;
  providerId: string;
  source: string;
  status: "confirmed" | "price_changed" | "unavailable" | "expired" | "provider_pending";
  previousTotal?: string;
  price: HotelBackendMoney;
  currency: string;
  expiresAt: string;
  bookingAllowed: false;
  supplierBookingDisabled: true;
  warnings: string[];
};

export type HotelPrimaryGuestInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type HotelBackendSimulationRequest = {
  searchId: string;
  hotelId: string;
  roomId: string;
  rateId: string;
  quoteId: string;
  expectedTotal: string;
  expectedCurrency: string;
  occupancy: HotelBackendOccupancy;
  primaryGuest: HotelPrimaryGuestInput;
  acceptedPriceChange?: boolean;
  idempotencyKey?: string;
};

export type HotelBackendDraft = {
  bookingDraftId: string;
  bookingRef: string;
  searchId: string;
  hotelId: string;
  roomId: string;
  rateId: string;
  quoteId: string;
  providerId: string;
  status: "SIMULATION_CREATED" | "PAYMENT_PENDING" | "PAYMENT_CONFIRMED" | "TPL_CONFIRMED" | "PAYMENT_FAILED" | "EXPIRED";
  simulationMode: true;
  supplierBookingDisabled: true;
  bookingAllowed: false;
  paymentAllowed: boolean;
  paymentStatus: "not_started" | "pending" | "paid" | "failed";
  supplierReservationId: null;
  supplierConfirmationNumber: null;
  quoteSnapshot: Pick<HotelBackendQuoteResponse, "quoteId" | "status" | "expiresAt" | "price" | "currency">;
  priceSnapshot: HotelBackendMoney;
  cancellationPolicySnapshot: HotelBackendRate["cancellationPolicy"];
  occupancySnapshot: HotelBackendOccupancy;
  staySnapshot: { checkIn: string; checkOut: string; nights: number };
  primaryGuestSafeSnapshot: HotelPrimaryGuestInput;
  hotelSnapshot: Pick<HotelBackendSummary, "hotelId" | "name" | "location" | "address">;
  roomSnapshot: Pick<HotelBackendRate, "roomId" | "rateId" | "roomName" | "roomDescription" | "mealPlan">;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  warnings: string[];
  nextAction: "test_payment_pending" | "payment_confirmation_pending" | "readback_available";
};

export type HotelBackendPaymentStartResponse = {
  bookingDraftId: string;
  bookingRef: string;
  paymentId: string;
  paymentRef: string;
  attemptId: string;
  gateway: "mock" | "razorpay" | "cashfree";
  amount: string;
  currency: "INR";
  status: "PAYMENT_PENDING";
  supplierBookingDisabled: true;
  bookingAllowed: false;
  supplierReservationId: null;
  supplierConfirmationNumber: null;
  checkout?: {
    provider: "razorpay";
    mode: "test";
    keyId: string;
    orderId: string;
    amountMinor: number;
    currency: "INR";
    name: string;
    description: string;
    prefill: { name?: string; email?: string; contact?: string };
    testOnly: true;
  };
  warnings: string[];
};

export type HotelBackendConfirmation = {
  bookingId: string;
  bookingRef: string;
  serviceType: "hotel";
  status: "TPL_CONFIRMED";
  simulationMode: true;
  paymentStatus: "paid";
  paymentReferenceSafe: {
    paymentId: string;
    paymentRef: string;
    gateway: "mock" | "razorpay" | "cashfree";
  };
  hotel: HotelBackendDraft["hotelSnapshot"];
  room: HotelBackendDraft["roomSnapshot"];
  stay: HotelBackendDraft["staySnapshot"];
  occupancy: HotelBackendOccupancy;
  guestSafe: HotelPrimaryGuestInput;
  pricing: HotelBackendMoney;
  cancellationPolicySnapshot: HotelBackendRate["cancellationPolicy"];
  providerId: string;
  supplierBookingDisabled: true;
  supplierReservationId: null;
  supplierConfirmationNumber: null;
  message: string;
  createdAt: string;
};

export type HotelBackendPaymentConfirmResponse = {
  bookingDraftId: string;
  bookingRef: string;
  paymentId: string;
  paymentRef: string;
  attemptId: string;
  status: "PAYMENT_CONFIRMED" | "TPL_CONFIRMED" | "PAYMENT_FAILED";
  supplierBookingDisabled: true;
  bookingAllowed: false;
  supplierReservationId: null;
  supplierConfirmationNumber: null;
  confirmation?: HotelBackendConfirmation;
  warnings: string[];
};

export type HotelBackendReadbackResponse = {
  booking: HotelBackendDraft;
  confirmation?: HotelBackendConfirmation;
};

export type HotelSafeError = {
  code: string;
  message: string;
  retryable: boolean;
};

export type HotelSelectionPayload = {
  searchId: string;
  hotelId: string;
  roomId: string;
  rateId: string;
  hotel: Hotel;
  selectedVariant: RoomVariant;
  searchMeta: {
    city: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
    roomOccupancies: HotelBackendOccupancy[];
  };
  backendSnapshot: {
    amount: string;
    currency: string;
    expiresAt: string;
    bookingAllowed: false;
    supplierBookingDisabled: true;
    sourceLabel: string;
    warnings: string[];
  };
  timestamp: number;
};

export function normalizeHotelBackendError(code = "TPL_API_ERROR", message?: string): string {
  const safeMessages: Record<string, string> = {
    TPL_API_NOT_CONFIGURED: "Hotel backend is not configured for this environment.",
    TPL_API_NETWORK_ERROR: "Hotel backend is currently unreachable. Please retry.",
    TPL_API_INVALID_RESPONSE: "Hotel backend returned an unexpected response. Please retry.",
    HOTEL_PROVIDER_NOT_CONFIGURED: "Hotel provider is not configured.",
    HOTEL_PROVIDER_TIMEOUT: "Hotel provider timed out. Please retry.",
    HOTEL_RATE_LIMITED: "Hotel search is temporarily rate limited. Please retry shortly.",
    HOTEL_PROVIDER_SEARCH_FAILED: "Hotel search failed. Please check the details and retry.",
    HOTEL_HOTEL_NOT_FOUND: "Hotel details are unavailable or expired. Please search again.",
    HOTEL_RATE_NOT_FOUND: "Selected room rate is unavailable. Please choose another rate.",
    HOTEL_RATE_EXPIRED: "Selected room rate has expired. Please refresh rates.",
    HOTEL_QUOTE_EXPIRED_OR_NOT_FOUND: "Hotel quote has expired. Please request a fresh quote.",
    HOTEL_RATE_UNAVAILABLE: "Selected room rate is no longer available.",
    HOTEL_PRICE_CHANGED: "Hotel price has changed. Please review and accept the updated price.",
    HOTEL_PAYMENT_CURRENCY_UNSUPPORTED: "Hotel payment is currently available only for INR quotes.",
    HOTEL_BOOKING_DRAFT_NOT_FOUND: "Hotel booking draft was not found or has expired.",
    HOTEL_PAYMENT_AMOUNT_MISMATCH: "Backend payment amount did not match the hotel draft.",
    HOTEL_PAYMENT_CURRENCY_MISMATCH: "Backend payment currency did not match the hotel draft.",
    HOTEL_PAYMENT_CONFIRMATION_FAILED: "Hotel payment confirmation failed. Please retry.",
    HOTEL_PAYMENT_ATTEMPT_NOT_FOUND: "Hotel payment attempt was not found.",
  };
  return safeMessages[code] || message || "Hotel request failed. Please retry.";
}

export function toHotelSafeError(error: TplApiFailure["error"] | Error | unknown): HotelSafeError {
  const code = error && typeof error === "object" && "code" in error
    ? String((error as { code?: string }).code || "TPL_API_ERROR")
    : "TPL_API_ERROR";
  const message = error && typeof error === "object" && "message" in error
    ? String((error as { message?: string }).message || "")
    : "";
  return {
    code,
    message: normalizeHotelBackendError(code, message),
    retryable: !["HOTEL_PAYMENT_AMOUNT_MISMATCH", "HOTEL_PAYMENT_CURRENCY_MISMATCH"].includes(code),
  };
}

export function validateHotelSearchInput(input: {
  destination?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  rooms?: Array<{ adults?: number; children?: number; childAges?: number[] }>;
  minPrice?: string | null;
  maxPrice?: string | null;
}): { ok: true; request: HotelBackendSearchRequest } | { ok: false; error: string } {
  const destination = String(input.destination || "").trim();
  if (!destination) return { ok: false, error: "Destination is required." };

  const checkIn = String(input.checkIn || "");
  const checkOut = String(input.checkOut || "");
  if (!checkIn) return { ok: false, error: "Check-in date is required." };
  if (!checkOut) return { ok: false, error: "Check-out date is required." };

  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!start || start < today) return { ok: false, error: "Check-in must be today or a future date." };
  if (!end || end <= start) return { ok: false, error: "Check-out must be after check-in." };

  const rooms = Array.isArray(input.rooms) ? input.rooms : [];
  if (!rooms.length || rooms.length > 4) return { ok: false, error: "Please select between 1 and 4 rooms." };

  const normalizedRooms: HotelBackendOccupancy[] = [];
  for (const room of rooms) {
    const adults = Number(room.adults || 0);
    const children = Number(room.children || 0);
    if (!Number.isInteger(adults) || adults < 1 || adults > 3) {
      return { ok: false, error: "Each room must have 1 to 3 adults." };
    }
    if (!Number.isInteger(children) || children < 0 || children > 3 || adults + children > 4) {
      return { ok: false, error: "Each room can have up to 4 guests." };
    }
    const childAges = Array.isArray(room.childAges) && room.childAges.length === children
      ? room.childAges.map((age) => Math.min(Math.max(Number(age || 7), 0), 17))
      : Array.from({ length: children }, () => 7);
    if (childAges.length !== children) return { ok: false, error: "Child ages must match child count." };
    normalizedRooms.push({ adults, children, ...(children ? { childAges } : {}) });
  }

  const minPrice = input.minPrice ? Number(input.minPrice) : undefined;
  const maxPrice = input.maxPrice ? Number(input.maxPrice) : undefined;
  if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) {
    return { ok: false, error: "Price filters are invalid." };
  }

  return {
    ok: true,
    request: {
      destination,
      destinationType: "city",
      checkIn,
      checkOut,
      rooms: normalizedRooms,
      currency: "INR",
      filters: {
        ...(minPrice !== undefined ? { minPrice: minPrice.toFixed(2) } : {}),
        ...(maxPrice !== undefined ? { maxPrice: maxPrice.toFixed(2) } : {}),
      },
      pagination: { limit: 20 },
    },
  };
}

export function validateHotelGuestInput(input: {
  guests?: Array<{ firstName?: string; lastName?: string }>;
  contactDetails?: { mobile?: string; email?: string };
  occupancy?: HotelBackendOccupancy;
}): { ok: true; primaryGuest: HotelPrimaryGuestInput } | { ok: false; error: string } {
  const guest = input.guests?.[0];
  const firstName = String(guest?.firstName || "").trim();
  const lastName = String(guest?.lastName || "").trim();
  const email = String(input.contactDetails?.email || "").trim();
  const phone = String(input.contactDetails?.mobile || "").replace(/\D/g, "").slice(-10);
  if (!firstName) return { ok: false, error: "Primary guest first name is required." };
  if (!lastName) return { ok: false, error: "Primary guest last name is required." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Valid guest email is required." };
  if (!/^[0-9]{10}$/.test(phone)) return { ok: false, error: "Valid 10 digit phone number is required." };
  const expectedGuests = Number(input.occupancy?.adults || 0) + Number(input.occupancy?.children || 0);
  if (expectedGuests > 0 && (input.guests?.length || 0) < expectedGuests) {
    return { ok: false, error: "Guest count must match the selected room occupancy." };
  }
  return { ok: true, primaryGuest: { firstName, lastName, email, phone } };
}

export async function getHotelProviderHealth(): Promise<TplApiResult<unknown>> {
  return tplApiRequest<unknown>("/api/v1/hotels/providers/health", { fallbackOnError: false });
}

export async function searchHotels(input: HotelBackendSearchRequest): Promise<TplApiResult<HotelBackendSearchResponse>> {
  return tplApiRequest<HotelBackendSearchResponse>("/api/v1/hotels/search", {
    method: "POST",
    body: input,
    fallbackOnError: false,
    requestId: createTplRequestId("tpl_hotel_search"),
  });
}

export async function getHotelDetails(hotelId: string, searchId: string): Promise<TplApiResult<HotelBackendSummary>> {
  return tplApiRequest<HotelBackendSummary>(
    `/api/v1/hotels/${encodeURIComponent(hotelId)}?searchId=${encodeURIComponent(searchId)}`,
    { fallbackOnError: false }
  );
}

export async function getHotelRates(hotelId: string, searchId: string): Promise<TplApiResult<HotelBackendRatesResponse>> {
  return tplApiRequest<HotelBackendRatesResponse>(
    `/api/v1/hotels/${encodeURIComponent(hotelId)}/rates?searchId=${encodeURIComponent(searchId)}`,
    { fallbackOnError: false }
  );
}

export async function createHotelQuote(input: {
  searchId: string;
  hotelId: string;
  roomId: string;
  rateId: string;
  clientPriceSnapshot?: { total: string; currency: string };
  scenario?: "confirmed" | "price_changed" | "expired" | "unavailable";
}): Promise<TplApiResult<HotelBackendQuoteResponse>> {
  return tplApiRequest<HotelBackendQuoteResponse>("/api/v1/hotels/quote", {
    method: "POST",
    body: input,
    idempotencyKey: createTplRequestId("tpl_hotel_quote"),
    fallbackOnError: false,
  });
}

export async function simulateHotelBooking(input: HotelBackendSimulationRequest): Promise<TplApiResult<HotelBackendDraft>> {
  const idempotencyKey = input.idempotencyKey || createTplRequestId("tpl_hotel_draft");
  return tplApiRequest<HotelBackendDraft>("/api/v1/hotels/bookings/simulate", {
    method: "POST",
    body: { ...input, idempotencyKey },
    idempotencyKey,
    fallbackOnError: false,
  });
}

export async function startHotelTestPayment(
  bookingDraftId: string,
  input: {
    amount: string;
    currency: "INR";
    paymentMethod?: string;
    contactDetails?: { mobile?: string; email?: string };
    idempotencyKey?: string;
  }
): Promise<TplApiResult<HotelBackendPaymentStartResponse>> {
  const idempotencyKey = input.idempotencyKey || createTplRequestId("tpl_hotel_payment_start");
  return tplApiRequest<HotelBackendPaymentStartResponse>(
    `/api/v1/hotels/bookings/${encodeURIComponent(bookingDraftId)}/payment/start`,
    {
      method: "POST",
      body: { ...input, idempotencyKey },
      idempotencyKey,
      fallbackOnError: false,
    }
  );
}

export async function confirmHotelTestPayment(
  bookingDraftId: string,
  input: {
    paymentId: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    testOutcome?: "success" | "failure";
    idempotencyKey?: string;
  }
): Promise<TplApiResult<HotelBackendPaymentConfirmResponse>> {
  const idempotencyKey = input.idempotencyKey || createTplRequestId("tpl_hotel_payment_confirm");
  return tplApiRequest<HotelBackendPaymentConfirmResponse>(
    `/api/v1/hotels/bookings/${encodeURIComponent(bookingDraftId)}/payment/confirm`,
    {
      method: "POST",
      body: { ...input, idempotencyKey },
      idempotencyKey,
      fallbackOnError: false,
    }
  );
}

export async function getHotelBookingDraft(bookingDraftId: string): Promise<TplApiResult<HotelBackendReadbackResponse>> {
  return tplApiRequest<HotelBackendReadbackResponse>(
    `/api/v1/hotels/bookings/${encodeURIComponent(bookingDraftId)}`,
    { fallbackOnError: false }
  );
}

export function mapBackendHotelToUiHotel(
  hotel: HotelBackendSummary,
  context: {
    searchId: string;
    source: string;
    expiresAt: string;
    warnings?: string[];
    rates?: HotelBackendRate[];
  }
): Hotel {
  const city = hotel.location?.city || hotel.address?.city || "City";
  const sourceLabel = safeProviderLabel(context.source);
  const minimumTotal = moneyToNumber(hotel.minimumPrice?.total);
  const minimumTaxes = moneyToNumber(hotel.minimumPrice?.taxes);
  const variants = (context.rates || []).map(mapBackendRateToRoomVariant);
  return {
    id: hotel.hotelId,
    slug: hotel.hotelId,
    type: "hotel",
    city,
    area: [hotel.address?.line1, hotel.location?.landmark].filter(Boolean).join(", ") || city,
    title: hotel.name || "TPL Hotel",
    description: hotel.description || "",
    images: (hotel.images || []).map((image) => image.url).filter(Boolean),
    rating: Number(hotel.rating || 4),
    reviews: Number(hotel.reviewCount || 0),
    pricePerNight: minimumTotal,
    taxes: minimumTaxes,
    tags: [sourceLabel, hotel.available ? "Available" : "Unavailable", "TPL test inventory"],
    amenities: hotel.amenities || [],
    locationHighlights: [city, hotel.address?.country, hotel.location?.landmark].filter(Boolean) as string[],
    variants,
    lat: hotel.geo?.lat || hotel.location?.geo?.lat,
    lng: hotel.geo?.lng || hotel.location?.geo?.lng,
    propertyType: "Hotel",
    topLocation: [city].filter(Boolean),
    roomViews: [],
    roomAmenities: hotel.amenities || [],
    houseRules: (hotel.policies || []).map((policy) => policy.title),
    bookingPreference: ["TPL test payment only"],
    luxuryTag: Number(hotel.starRating || 0) >= 5,
    guaranteed: false,
    searchableAmenities: hotel.amenities || [],
    starRating: Math.max(0, Math.min(5, Math.round(Number(hotel.starRating || 0)))),
    brand: sourceLabel,
    chain: sourceLabel,
    checkInTime: hotel.checkInTime || "As per hotel policy",
    checkOutTime: hotel.checkOutTime || "As per hotel policy",
    coupleFriendly: true,
    backendHotel: {
      searchId: context.searchId,
      hotelId: hotel.hotelId,
      sourceLabel,
      currency: hotel.minimumPrice?.currency || "INR",
      expiresAt: hotel.expiresAt || context.expiresAt,
      warnings: context.warnings || [],
      available: hotel.available === true,
      bookingAllowed: false,
      supplierBookingDisabled: true,
      description: hotel.description,
      policies: hotel.policies,
    },
  };
}

export function mapBackendRateToRoomVariant(rate: HotelBackendRate): RoomVariant {
  return {
    id: rate.rateId,
    name: rate.roomName || "Selected Room",
    title: rate.roomName || "Selected Room",
    maxAdults: Number(rate.occupancy?.adults || 1),
    maxChildren: Number(rate.occupancy?.children || 0),
    price: moneyToNumber(rate.price.total),
    taxes: moneyToNumber(rate.price.taxes),
    mealPlan: mealPlanLabel(rate.mealPlan),
    cancellation: rate.cancellationPolicy?.type === "non_refundable" ? "Non Refundable" : "Free Cancellation",
    availableRooms: Math.max(Number(rate.remainingRooms || 0), 0),
    amenities: rate.includedServices || [],
    backendRoomId: rate.roomId,
    backendRateId: rate.rateId,
    currency: rate.price.currency,
    expiresAt: rate.expiresAt,
    bookingAllowed: rate.bookingAllowed,
    supplierBookingDisabled: rate.supplierBookingDisabled,
  };
}

export function isExpired(value?: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
}

export function moneyToNumber(value?: string | number): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyToDecimal(value: number | string): string {
  const parsed = Number(value || 0);
  return (Number.isFinite(parsed) ? parsed : 0).toFixed(2);
}

export function safeProviderLabel(value: unknown): string {
  const raw = String(value || "TPL backend").toLowerCase();
  if (raw.includes("mock")) return "TPL test hotel inventory";
  return String(value || "TPL backend").replace(/[^a-zA-Z0-9 _.-]/g, "").trim().slice(0, 80) || "TPL backend";
}

export function parseLocalDate(value?: string | null): Date | null {
  if (!value) return null;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateNights(checkIn?: string, checkOut?: string): number {
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  if (!start || !end) return 1;
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / 86_400_000), 1);
}

function mealPlanLabel(value: HotelBackendRate["mealPlan"]): RoomVariant["mealPlan"] {
  if (value === "breakfast") return "CP";
  if (value === "half_board") return "MAP";
  if (value === "full_board" || value === "all_inclusive") return "AP";
  return "EP";
}
