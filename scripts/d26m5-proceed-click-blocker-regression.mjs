import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const fareSummary = readFileSync("app/components/booking/flight/FlightFareSummaryCard.tsx", "utf8");
const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");

assert.match(fareSummary, /aria-disabled=\{!canProceed\}/, "Proceed CTA must expose blocked state with aria-disabled.");
assert.doesNotMatch(fareSummary, /(^|[^A-Za-z-])disabled=\{!canProceed\}/, "Proceed CTA must not be native-disabled because that creates a silent no-op.");
assert.match(fareSummary, /onClick=\{onProceed\}/, "Proceed CTA click handler must remain attached.");

assert.match(reviewPage, /function handleProceedClick\(\)/, "Review page must route Proceed clicks through a blocker-aware handler.");
assert.match(reviewPage, /if \(!canProceed\)/, "Blocked Proceed clicks must be handled explicitly.");
assert.match(reviewPage, /setBackendBlockerMessage\(message\)/, "Blocked Proceed clicks must surface a visible message.");
assert.match(reviewPage, /scrollIntoView\(\{ block: "start", behavior: "smooth" \}\)/, "Traveller blockers must scroll the user to the relevant section.");
assert.match(reviewPage, /Please complete all required traveller details\./, "Missing traveller details must produce an actionable blocker message.");
assert.match(reviewPage, /Please enter a valid contact mobile number and email\./, "Invalid contact details must produce an actionable blocker message.");
assert.match(reviewPage, /void proceedToPayment\(\)/, "Valid Proceed clicks must still enter the backend simulation path.");

console.log("D26M.5 proceed click blocker regression PASS");
