import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assertIncludes(path, needle, label) {
  const content = read(path);
  if (!content.includes(needle)) {
    throw new Error(`${label}: missing ${needle} in ${path}`);
  }
}

function assertNotIncludes(path, needle, label) {
  const content = read(path);
  if (content.includes(needle)) {
    throw new Error(`${label}: forbidden ${needle} in ${path}`);
  }
}

const checks = [
  () =>
    assertIncludes(
      "app/lib/flights/flightBackendIntegration.ts",
      "validateFlightSearchState",
      "search validation helper"
    ),
  () =>
    assertIncludes(
      "app/components/flight/search/SearchButton.tsx",
      "Infants cannot exceed adult travellers.",
      "invalid search blocked"
    ),
  () =>
    assertIncludes(
      "app/components/flight/results/oneway/OneWayResultsLayout.tsx",
      "Backend search failed",
      "backend search error state"
    ),
  () =>
    assertIncludes(
      "app/lib/api/flightSearchApi.ts",
      "isUsableBackendFlightOffer",
      "malformed backend offers filtered"
    ),
  () =>
    assertIncludes(
      "app/flights/review/page.tsx",
      "Accept Latest Fare",
      "price change acceptance"
    ),
  () =>
    assertIncludes(
      "app/flights/review/page.tsx",
      "assertSafeFlightSimulationFlags",
      "simulation flags enforced"
    ),
  () =>
    assertIncludes(
      "app/flights/payment/page.tsx",
      "getBackendAmountAuthority",
      "backend amount authority"
    ),
  () =>
    assertIncludes(
      "app/flights/payment/page.tsx",
      "isFlightBackendStateExpired(paymentPayload.backendSimulation.expiresAt)",
      "draft expiry guard"
    ),
  () =>
    assertIncludes(
      "app/flights/payment/page.tsx",
      "FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE",
      "non-INR pre-payment guard"
    ),
  () =>
    assertIncludes(
      "app/flights/payment/page.tsx",
      "backendPaymentStep === \"verifying_payment\"",
      "duplicate confirmation lock"
    ),
  () =>
    assertIncludes(
      "app/flights/confirmation/page.tsx",
      "TPL will not create supplier PNR",
      "confirmation recovery"
    ),
  () =>
    assertIncludes(
      "app/flights/confirmation/page.tsx",
      "Ticket: Not issued in test mode",
      "confirmation no fake ticket"
    ),
  () =>
    assertIncludes(
      "app/flights/confirmation/page.tsx",
      "Supplier PNR and ticket are not issued in test mode.",
      "backend confirmation fake ticket copy suppressed"
    ),
  () =>
    assertIncludes(
      "app/flights/manage/page.tsx",
      "Not issued in test mode",
      "manage no PNR"
    ),
  () =>
    assertIncludes(
      "app/lib/api/flightCheckoutIntegration.ts",
      "readOrCreateSessionKey",
      "generic checkout idempotency"
    ),
  () =>
    assertIncludes(
      "app/lib/api/flightCheckoutIntegration.ts",
      "flight:start:",
      "generic checkout start shape"
    ),
  () =>
    assertIncludes(
      "app/lib/api/flightCheckoutIntegration.ts",
      "flight:confirm:",
      "generic checkout confirm shape"
    ),
];

for (const check of checks) {
  check();
}

console.log(`D25B.2 flight deterministic contract smoke PASS (${checks.length} checks)`);
