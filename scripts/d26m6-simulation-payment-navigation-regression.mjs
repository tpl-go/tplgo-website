import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPage = readFileSync("app/flights/payment/page.tsx", "utf8");
const backendIntegration = readFileSync("app/lib/flights/flightBackendIntegration.ts", "utf8");

assert.match(
  reviewPage,
  /function saveFlightPaymentPayloadForNavigation\(payload: unknown\)/,
  "Review must persist payment navigation state through a dedicated helper."
);
assert.match(
  reviewPage,
  /sanitizeFlightStoragePayload\(payload\)/,
  "Payment navigation payload must be sanitized before session storage."
);
assert.match(
  reviewPage,
  /sessionStorage\.setItem\(\s*"tplFlightBookingReviewData"/s,
  "Review must write the payment route storage key before navigation."
);
assert.match(
  reviewPage,
  /const paymentPayloadSaved = saveFlightPaymentPayloadForNavigation\(payload\);[\s\S]*if \(!paymentPayloadSaved\.ok\) \{[\s\S]*setBackendSimulationState\("failed"\);[\s\S]*setBackendBlockerMessage\(paymentPayloadSaved\.message\);[\s\S]*return;/,
  "Storage failure must produce a visible blocker instead of silently skipping navigation."
);
assert.match(
  reviewPage,
  /try \{[\s\S]*router\.push\(PAYMENT_ROUTE\);[\s\S]*\} catch \{/,
  "Payment route navigation must be attempted after state persistence and guarded against thrown navigation failures."
);
assert.match(
  reviewPage,
  /setBackendBlockerMessage\("Could not open payment page\. Please retry\."\)/,
  "Router failures must be surfaced to the operator."
);
assert.match(
  reviewPage,
  /window\.location\.assign\(PAYMENT_ROUTE\)/,
  "A non-committed client navigation must fall back to document navigation after state persistence."
);

assert.match(
  paymentPage,
  /sessionStorage\.getItem\("tplFlightBookingReviewData"\)/,
  "Payment page must read the same persisted payment route storage key."
);
assert.match(
  paymentPage,
  /payload\?\.backendSimulation\?\.bookingDraftId/,
  "Payment page must use the persisted backend booking draft metadata."
);
assert.match(
  backendIntegration,
  /payload\.reviewData\?\.backendOffer\?\.paymentQuote\?\.payableAmount/,
  "Payment amount authority must remain the backend payment quote."
);
assert.match(
  backendIntegration,
  /function assertSafeFlightSimulationFlags/,
  "Simulation response safety flags must remain enforced."
);
assert.match(
  backendIntegration,
  /if \(!data\.bookingDraftId\) errors\.push\("Backend booking draft was missing\."\)/,
  "Simulation response must still require a bookingDraftId."
);

console.log("D26M.6 simulation to payment navigation regression PASS");
