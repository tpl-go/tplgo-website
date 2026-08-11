import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPage = readFileSync("app/flights/payment/page.tsx", "utf8");
const simulationApi = readFileSync("app/lib/api/flightBookingSimulationApi.ts", "utf8");
const paymentPriceCard = readFileSync("app/components/payment/flight/FlightPaymentPriceCard.tsx", "utf8");

assert.match(
  reviewPage,
  /ancillaries:\s*\{[\s\S]*quoteId: ancillaryQuote\.quoteId[\s\S]*selectedAncillarySelections: selectedSeatAssignments[\s\S]*selectedAncillaries: ancillaryQuote\.selectedAncillaries[\s\S]*payableQuote: ancillaryQuote\.payableQuote/,
  "Review simulation payload must send the backend ancillary quote and traveller/segment selections."
);
assert.match(
  reviewPage,
  /flight-sim:\$\{priceReady\.backendOffer\.priceConfirmationId\}:\$\{ancillaryQuote\?\.quoteId \|\| "no-ancillaries"\}/,
  "Review simulation idempotency key must include ancillary quote identity."
);

assert.match(
  simulationApi,
  /fetchBackendFlightBookingDraft/,
  "Frontend must expose a read-only booking draft lookup by bookingDraftId."
);
assert.match(
  paymentPage,
  /fetchBackendFlightBookingDraft\(bookingDraftId\)/,
  "Payment must hydrate from the backend booking draft when bookingDraftId is present."
);
assert.match(
  paymentPage,
  /mergeBackendDraftIntoPayload/,
  "Payment must merge backend draft authority into the payment payload."
);
assert.match(
  paymentPage,
  /backendDraft:\s*draft/,
  "Payment must retain the backend draft snapshot."
);
assert.match(
  paymentPage,
  /backendAncillaryQuote:\s*draft\.ancillarySnapshot/,
  "Payment must prefer backend draft ancillarySnapshot."
);
assert.match(
  paymentPage,
  /buildSeatMealDataFromBackend/,
  "Payment must derive seat and meal display from backend ancillary authority."
);
assert.match(
  paymentPage,
  /backendBaggageTotal/,
  "Payment must derive baggage display from backend ancillary authority."
);
assert.match(
  paymentPage,
  /seatTotal: safeSeatMealData\.seatTotal/,
  "Payment price summary must include backend-derived seat total."
);
assert.match(
  paymentPage,
  /baggageTotal: backendBaggage/,
  "Payment price summary must include backend-derived baggage total."
);
assert.match(
  paymentPriceCard,
  /label="Extra Baggage"/,
  "Payment price card must show backend-derived extra baggage when selected."
);

console.log("D26O review payment snapshot reconciliation regression PASS");
