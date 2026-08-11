import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertCheck(name, ok, details = "") {
  if (!ok) {
    console.error(`FAIL ${name}${details ? `: ${details}` : ""}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

const files = {
  review: read("app/flights/review/page.tsx"),
  payment: read("app/flights/payment/page.tsx"),
  simulationApi: read("app/lib/api/flightBookingSimulationApi.ts"),
  managePage: read("app/flights/manage/page.tsx"),
  manageMeals: read("app/components/manage/flight/actions/ManageMealsSection.tsx"),
  manageBaggage: read("app/components/manage/flight/actions/ManageBaggageSection.tsx"),
  managePaymentResolver: read("app/lib/manage/paymentResolvers/flightPaymentResolver.ts"),
  bookingResolver: read("app/lib/booking/resolvers/flightResolver.ts"),
};

const productionFlightFiles = [
  "app/flights/review/page.tsx",
  "app/flights/payment/page.tsx",
  "app/flights/confirmation/page.tsx",
  "app/flights/manage/page.tsx",
  "app/account/bookings/flight/[bookingId]/page.tsx",
  "app/components/booking/flight/FlightSeatMealSection.tsx",
  "app/components/manage/flight/actions/ManageMealsSection.tsx",
  "app/components/manage/flight/actions/ManageBaggageSection.tsx",
  "app/lib/manage/paymentResolvers/flightPaymentResolver.ts",
  "app/lib/booking/resolvers/flightResolver.ts",
];

const productionSources = productionFlightFiles.map((file) => [file, read(file)]);

assertCheck(
  "no production import of static flight ancillary catalog",
  productionSources.every(([, source]) => !source.includes("FLIGHT_ANCILLARY_CATALOG")),
  "static catalog must not be imported by production flight pages/resolvers"
);

assertCheck(
  "review sends backend ancillary quote to simulation",
  files.review.includes("ancillaries: {") &&
    files.review.includes("selectedAncillaryIds") &&
    files.review.includes("selectedAncillarySelections") &&
    files.review.includes("payableQuote"),
  "selected provider ancillaries must reach backend booking draft"
);

assertCheck(
  "review idempotency changes when ancillary quote changes",
  files.review.includes("ancillaryQuote?.quoteId || \"no-ancillaries\""),
  "material ancillary selections must not replay stale draft"
);

assertCheck(
  "payment fetches authoritative booking draft",
  files.payment.includes("fetchBackendFlightBookingDraft") &&
    files.payment.includes("mergeBackendDraftIntoPayload") &&
    files.payment.includes("backendDraft?.ancillarySnapshot"),
  "Payment must hydrate by bookingDraftId/backend draft"
);

assertCheck(
  "payment renders ancillary totals from backend snapshot",
  files.payment.includes("buildSeatMealDataFromBackend") &&
    files.payment.includes("backendBaggageTotal") &&
    files.payment.includes("baggageTotal"),
  "Payment cannot show stale skipped seat/meal/baggage values"
);

assertCheck(
  "manage meals are provider-quote unavailable instead of static catalog",
  files.manageMeals.includes("Provider meal-change quote unavailable") &&
    files.manageMeals.includes("static catalog") &&
    !files.manageMeals.includes("assignMealToTraveller"),
  "Manage meals must not offer static replacement meals"
);

assertCheck(
  "manage baggage is provider-quote unavailable instead of static pricing",
  files.manageBaggage.includes("Baggage changes unavailable") &&
    files.manageBaggage.includes("No static baggage catalog") &&
    !files.manageBaggage.includes("DEFAULT_BAGGAGE_OPTIONS"),
  "Manage baggage must not offer static baggage prices"
);

assertCheck(
  "flight manage payment resolver blocks local ancillary finalization",
  files.managePaymentResolver.includes("backend/provider quote") &&
    files.managePaymentResolver.includes("throw new Error") &&
    !files.managePaymentResolver.includes("saveFlightMealChanges") &&
    !files.managePaymentResolver.includes("saveFlightBaggageChanges"),
  "Flight manage payment must not finalize local static ancillary changes"
);

assertCheck(
  "booking resolver keeps backend first source available",
  files.bookingResolver.includes("backend") || files.bookingResolver.includes("Backend"),
  "My Booking/Detail must prefer persisted backend/test booking payload when available"
);

if (process.exitCode) process.exit(process.exitCode);
