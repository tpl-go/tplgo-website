import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPage = readFileSync("app/flights/payment/page.tsx", "utf8");

for (const marker of [
  "T01_CLICK",
  "T02_CAN_PROCEED_PASS",
  "T03_TRAVELLER_READY",
  "T04_CONTACT_READY",
  "T05_RECHECK_START",
  "T06_RECHECK_PASS",
  "T07_TRAVELLER_MAP_PASS",
  "T08_SIMULATION_REQUEST_START",
  "T09_SIMULATION_HTTP_RESPONSE",
  "T10_SIMULATION_JSON_PARSED",
  "T11_SIMULATION_OK",
  "T12_SAFETY_ASSERT_PASS",
  "T13_BOOKING_DRAFT_PRESENT",
  "T14_PAYMENT_QUOTE_PRESENT",
  "T15_NEXT_REVIEW_DATA_READY",
  "T16_SANITIZER_PASS",
  "T17_STORAGE_WRITE_PASS",
  "T18_STORAGE_READBACK_PASS",
  "T19_ROUTER_PUSH_CALLED",
]) {
  assert.match(reviewPage, new RegExp(marker), `Review debug trace must include ${marker}.`);
}

for (const marker of [
  "T20_PAYMENT_PAGE_MOUNT",
  "T21_PAYMENT_STORAGE_READ_PASS",
  "T22_PAYMENT_GUARD_PASS",
  "T23_PAYMENT_BOUNDARY_VISIBLE",
]) {
  assert.match(paymentPage, new RegExp(marker), `Payment debug trace must include ${marker}.`);
}

assert.match(reviewPage, /debugProceed"\) === "1"/, "Review debug UI must be gated by ?debugProceed=1.");
assert.match(reviewPage, /ProceedDebugPanel/, "Review must render a collapsible debug panel only when debug mode is enabled.");
assert.match(reviewPage, /Copy safe debug/, "Debug mode must provide a safe copy action.");
assert.match(reviewPage, /tplFlightProceedDebug/, "Review must persist cross-route safe debug trace.");
assert.match(paymentPage, /tplFlightProceedDebug/, "Payment must update the cross-route safe debug trace.");
assert.match(reviewPage, /simulationHttpStatus: simulation\.status/, "Simulation trace must record safe HTTP status.");
assert.match(reviewPage, /bookingDraftIdPresent: Boolean/, "Trace must record bookingDraftId presence as a boolean only.");
assert.match(reviewPage, /paymentQuotePresent: Boolean/, "Trace must record paymentQuote presence as a boolean only.");
assert.match(reviewPage, /safeErrorCode/, "Trace must record safe error code.");
assert.match(reviewPage, /safeErrorMessage/, "Trace must record safe normalized error message.");
assert.match(reviewPage, /failedAt/, "Trace must record FAILED_AT markers.");
assert.match(reviewPage, /safeReason/, "Trace must record SAFE_REASON.");

const safeTraceBlock = reviewPage.slice(
  reviewPage.indexOf("const safeTrace = {"),
  reviewPage.indexOf("return (", reviewPage.indexOf("const safeTrace = {"))
);
for (const forbidden of ["passport", "firstName", "lastName", "mobile", "email", "providerRef", "rawProviderResponse"]) {
  assert.ok(!safeTraceBlock.includes(forbidden), `Safe debug panel must not expose ${forbidden}.`);
}

console.log("D26N.1 proceed debug trace regression PASS");
