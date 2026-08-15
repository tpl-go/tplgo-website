const API = process.env.TPL_API_BASE_URL || "https://api.tplgo.com";
const runId = `d21d-resume-${Date.now()}`;

const forbiddenMarker = /(gatewaySignature|razorpay_signature|rawRazorpay|keySecret|secret|password)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { parseError: true, text };
  }
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed ${response.status}: ${text.slice(0, 600)}`);
  }
  const serialized = JSON.stringify(body);
  assert(!forbiddenMarker.test(serialized), `${path} response contains forbidden marker`);
  return { envelopeOk: body.ok === true, data: body.data ?? body };
}

const searchPayload = {
  origin: "DEL",
  destination: "BOM",
  departureDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
  tripType: "one-way",
  currency: "INR",
};

const searchResponse = await request("/api/v1/flights/search", {
  method: "POST",
  body: JSON.stringify(searchPayload),
});
const search = searchResponse.data;
const offer = search.offers?.[0];
assert(offer, "search returned no offers");

const fare = offer.fareOptions?.[0];
const priceResponse = await request(`/api/v1/flights/offers/${encodeURIComponent(offer.offerId)}/price`, {
  method: "POST",
  body: JSON.stringify({
    searchId: search.searchId,
    fareId: fare?.fareId,
    passengers: { adults: 1, children: 0, infants: 0 },
    currency: "INR",
    clientOfferSnapshot: { total: offer.price.total, currency: "INR" },
  }),
});
const price = priceResponse.data;

const simulationResponse = await request("/api/v1/flights/bookings/simulate", {
  method: "POST",
  headers: { "idempotency-key": `flight-sim-${runId}` },
  body: JSON.stringify({
    searchId: search.searchId,
    offerId: offer.offerId,
    fareId: fare?.fareId,
    priceConfirmationId: price.priceConfirmationId,
    passengers: { adults: 1, children: 0, infants: 0 },
    travellers: [
      {
        type: "adult",
        title: "Mr",
        firstName: "Test",
        lastName: "Traveller",
      },
    ],
    contactDetails: {
      countryCode: "+91",
      mobile: "9876543210",
      email: "traveller@example.com",
    },
    clientPricingSnapshot: { total: price.price.total, currency: "INR" },
  }),
});
const simulation = simulationResponse.data;

const orderResponse = await request(`/api/v1/flights/bookings/${encodeURIComponent(simulation.bookingDraftId)}/payment/test-order`, {
  method: "POST",
  headers: { "idempotency-key": `flight-test-order-${runId}` },
  body: JSON.stringify({
    amount: simulation.priceSnapshot.total,
    currency: "INR",
    paymentMethod: "mock",
    contactDetails: { mobile: "9876543210", email: "traveller@example.com" },
  }),
});
const order = orderResponse.data;

const confirmationResponse = await request(`/api/v1/flights/bookings/${encodeURIComponent(simulation.bookingDraftId)}/payment/test-confirm`, {
  method: "POST",
  headers: { "idempotency-key": `flight-test-confirm-${runId}` },
  body: JSON.stringify({
    paymentId: order.paymentId,
    gatewayPaymentId: `mock_payment_${runId}`,
    testOutcome: "success",
  }),
});
const confirmation = confirmationResponse.data;

assert(confirmationResponse.envelopeOk === true, "confirmation envelope ok was not true");
assert(confirmation.status === "TPL_TEST_BOOKING_CONFIRMED", "unexpected confirmation status");
assert(confirmation.bookingPersisted === true, "bookingPersisted was not true");
assert(confirmation.backendBookingId, "backendBookingId missing");
assert(confirmation.backendBookingRef, "backendBookingRef missing");
assert(confirmation.pnr === null, "pnr was not null");
assert(confirmation.ticketNumber === null, "ticketNumber was not null");
assert(confirmation.supplierBookingDisabled === true, "supplierBookingDisabled was not true");
assert(confirmation.bookingAllowed === false, "bookingAllowed was not false");
assert(confirmation.ticketingAllowed === false, "ticketingAllowed was not false");
assert(confirmation.paymentCaptureAllowed === false, "paymentCaptureAllowed was not false");

const detailResponse = await request(`/api/v1/bookings/${encodeURIComponent(confirmation.backendBookingRef)}/detail`);
const detail = detailResponse.data;
const normalized = detail.detail?.normalizedSummary;
const rawPayload = detail.detail?.rawPayload;
assert(rawPayload && typeof rawPayload === "object", "rawPayload missing");
assert(normalized && typeof normalized === "object", "normalizedSummary missing");
assert(normalized.supplierBookingDisabled === true, "detail supplierBookingDisabled was not true");
assert(normalized.bookingAllowed === false, "detail bookingAllowed was not false");
assert(normalized.ticketingAllowed === false, "detail ticketingAllowed was not false");
assert(normalized.paymentCaptureAllowed === false, "detail paymentCaptureAllowed was not false");
assert(normalized.pnr === null, "detail pnr was not null");
assert(normalized.ticketNumber === null, "detail ticketNumber was not null");

let paymentLinkage = { available: false };
try {
  const paymentResponse = await request(`/api/v1/payments/by-booking/${encodeURIComponent(confirmation.backendBookingRef)}`);
  const payment = paymentResponse.data;
  paymentLinkage = {
    available: true,
    idPresent: Boolean(payment.id),
    bookingIdPresent: Boolean(payment.bookingId),
    status: payment.status,
    gateway: payment.gateway,
  };
} catch (error) {
  paymentLinkage = { available: false, error: error.message.replace(/\s+/g, " ").slice(0, 240) };
}

console.log(JSON.stringify({
  runId,
  searchOk: Boolean(search.searchId),
  priceConfirmOk: Boolean(price.priceConfirmationId),
  simulationOk: Boolean(simulation.bookingDraftId),
  testOrderOk: Boolean(order.paymentId),
  confirmation: {
    envelopeOk: confirmationResponse.envelopeOk,
    status: confirmation.status,
    bookingPersisted: confirmation.bookingPersisted,
    backendBookingIdPresent: Boolean(confirmation.backendBookingId),
    backendBookingRef: confirmation.backendBookingRef,
    pnr: confirmation.pnr,
    ticketNumber: confirmation.ticketNumber,
    supplierBookingDisabled: confirmation.supplierBookingDisabled,
    bookingAllowed: confirmation.bookingAllowed,
    ticketingAllowed: confirmation.ticketingAllowed,
    paymentCaptureAllowed: confirmation.paymentCaptureAllowed,
  },
  readback: {
    rawPayloadExists: Boolean(rawPayload),
    normalizedSummaryExists: Boolean(normalized),
    bookingRef: detail.booking?.bookingRef,
    bookingStatus: detail.booking?.bookingStatus,
    paymentStatus: detail.booking?.paymentStatus,
    normalizedSafetyFlags: {
      supplierBookingDisabled: normalized.supplierBookingDisabled,
      bookingAllowed: normalized.bookingAllowed,
      ticketingAllowed: normalized.ticketingAllowed,
      paymentCaptureAllowed: normalized.paymentCaptureAllowed,
      pnr: normalized.pnr,
      ticketNumber: normalized.ticketNumber,
    },
  },
  paymentLinkage,
}, null, 2));
