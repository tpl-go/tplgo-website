import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const resultsPage = readFileSync("app/components/flight/results/FlightsPageClient.tsx", "utf8");
const oneWayCard = readFileSync("app/components/flight/results/oneway/OneWayFlightResultCard.tsx", "utf8");
const reviewFare = readFileSync("app/components/booking/flight/FlightFareSummaryCard.tsx", "utf8");

assert.match(
  resultsPage,
  /offers=\{\[/,
  "Flight Results must pass explicit backend-safe offer cards instead of letting SmartResultsOfferStrip auto-activate payable-looking Smart Offers."
);
assert.match(
  resultsPage,
  /Provider fare is confirmed at Review/,
  "Flight Results offer strip must identify provider/backend fare authority."
);
assert.match(
  resultsPage,
  /Flight offers are informational until backend fare recheck applies them\./,
  "Flight Results offer strip must not promise unhonored payable Smart Offer savings."
);
assert.doesNotMatch(
  resultsPage,
  /DOM1500|INTL4500|Save ₹1,500|Save ₹4,500|OFFER APPLIED/,
  "Flight Results page wiring must not hardcode payable-looking DOM1500/INTL4500 savings."
);

assert.match(
  oneWayCard,
  /const providerBackedPricing = Boolean\(backendOffer\);/,
  "One-way provider-backed result cards must detect backend/provider pricing authority."
);
assert.match(
  oneWayCard,
  /selectedCurrency === "INR" && !providerBackedPricing[\s\S]*\? calculateOfferDiscount\(selectedBaseFare, activeOffer\)/,
  "One-way result cards must not calculate local Smart Offer discount for provider-backed fares."
);
assert.match(
  oneWayCard,
  /const appliedOffer = backendOffer \? 0 : calculateOfferDiscount\(baseFareTotal, activeOffer\);/,
  "Book Now payload must carry zero appliedOffer for backend/provider-backed fares unless backend quote applies it."
);

assert.doesNotMatch(
  reviewFare,
  /getSmartActiveOfferItem|calculateSmartOfferDiscount|TPL_SMART_OFFER_UPDATED/,
  "D26R Review fare reconciliation fix must remain preserved."
);

console.log("D26R.1 Results commercial authority regression PASS");