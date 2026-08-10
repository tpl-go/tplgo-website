import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPage = readFileSync("app/flights/payment/page.tsx", "utf8");
const fareSummary = readFileSync("app/components/booking/flight/FlightFareSummaryCard.tsx", "utf8");
const backendIntegration = readFileSync("app/lib/flights/flightBackendIntegration.ts", "utf8");
const simulationApi = readFileSync("app/lib/api/flightBookingSimulationApi.ts", "utf8");

assert.match(fareSummary, /type="button"/, "Proceed CTA must not submit or reload the Review route.");
assert.match(fareSummary, /aria-disabled=\{!canProceed\}/, "Blocked Proceed state must remain visible without suppressing clicks.");
assert.doesNotMatch(fareSummary, /(^|[^A-Za-z-])disabled=\{!canProceed\}/, "Proceed CTA must not use native disabled.");

assert.match(reviewPage, /function handleProceedClick\(\)/, "Review must route Proceed through an explicit click handler.");
assert.match(reviewPage, /void proceedToPayment\(\)/, "Valid Review Proceed clicks must enter the async payment transition.");
assert.match(reviewPage, /setBackendSimulationState\("creating"\)/, "Simulation-start loading state must be visible.");
assert.match(reviewPage, /const simulation = await simulateBackendFlightBooking/, "Review must send the backend booking simulation request.");
assert.match(reviewPage, /assertSafeFlightSimulationFlags\(simulation\.data\)/, "Review must enforce backend supplier-disabled simulation flags.");
assert.match(reviewPage, /bookingDraftId: simulation\.data\.bookingDraftId/, "Review must retain bookingDraftId from simulation response.");
assert.match(reviewPage, /paymentQuote: simulation\.data\.paymentQuote \|\| priceReady\.backendOffer\.paymentQuote/, "Review must retain the backend payment quote from simulation or price confirmation.");

assert.match(
  reviewPage,
  /try \{\s*saveFlightReviewPayload\(nextReviewData\);\s*\} catch \{/s,
  "Back-navigation Review cache writes must not silently abort the payment transition."
);
assert.doesNotMatch(
  reviewPage,
  /setBackendSimulationState\("idle"\);\s*backendSimulationMetadata = \{/,
  "Review must not clear the simulation loader before payment state is built and persisted."
);
assert.match(
  reviewPage,
  /const serialized = JSON\.stringify\(sanitizeFlightStoragePayload\(payload\)\);/,
  "Payment navigation payload must be sanitized before storage."
);
assert.match(
  reviewPage,
  /const raw = sessionStorage\.getItem\("tplFlightBookingReviewData"\);/,
  "Payment navigation payload must be read back before navigation."
);
assert.match(
  reviewPage,
  /if \(!parsed\.backendSimulation\?\.bookingDraftId\)/,
  "Payment navigation must fail visibly when bookingDraftId is not retained."
);
assert.match(
  reviewPage,
  /if \(!parsed\.reviewData\.backendOffer\.paymentQuote\)/,
  "Payment navigation must fail visibly when paymentQuote is not retained."
);
assert.match(
  reviewPage,
  /router\.push\("\/flights\/payment"\);/,
  "Review must navigate to the Payment route after persistence succeeds."
);
assert.match(
  reviewPage,
  /message: "Backend payment quote was missing\. Please refresh the fare and try again\."/,
  "Missing payment quote must surface a visible failure."
);

assert.match(paymentPage, /sessionStorage\.getItem\("tplFlightBookingReviewData"\)/, "Payment page must read the Review payment payload.");
assert.match(paymentPage, /if \(!reviewData\)/, "Payment page must guard missing payment state.");
assert.match(paymentPage, /storedPayload\?\.backendSimulation/, "Payment page must render backend simulation context when present.");
assert.match(backendIntegration, /payload\.reviewData\?\.backendOffer\?\.paymentQuote\?\.payableAmount/, "Payment amount authority must remain backend paymentQuote.");
assert.match(simulationApi, /bookingDraftId: string;/, "Simulation response contract must include bookingDraftId.");
assert.match(simulationApi, /paymentQuote\?: FlightPaymentQuoteSnapshot;/, "Simulation response contract must include paymentQuote support.");

console.log("D26N review to payment transition regression PASS");
