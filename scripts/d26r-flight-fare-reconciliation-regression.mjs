import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const fareSummary = readFileSync("app/components/booking/flight/FlightFareSummaryCard.tsx", "utf8");
const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPage = readFileSync("app/flights/payment/page.tsx", "utf8");

assert.doesNotMatch(
  fareSummary,
  /@\/app\/lib\/smartOffers|getSmartActiveOfferItem|calculateSmartOfferDiscount|TPL_SMART_OFFER_UPDATED/,
  "Flight fare summary must not read Smart Offer session/browser state independently of backend-authoritative props."
);

assert.match(
  fareSummary,
  /const finalAppliedOffer = Number\(appliedOffer \|\| 0\);/,
  "Flight fare summary must render the applied offer amount supplied by its parent."
);

assert.doesNotMatch(
  fareSummary,
  /Smart Offer \(\$\{smartOffer\.couponCode\}\)|shouldUseSmartOffer|smartOfferAmount/,
  "Flight fare summary must not synthesize Smart Offer rows when the backend quote did not include an offer."
);

assert.match(
  reviewPage,
  /const supplierBackedReview = Boolean\(reviewData\.backendOffer\);/,
  "Review must detect provider/backend-backed flight pricing."
);

assert.match(
  reviewPage,
  /const appliedOfferAmount = supplierBackedReview\s*\? 0\s*:/,
  "Provider-backed Review pricing must not apply frontend Smart Offer discounts outside backend authority."
);

assert.match(
  reviewPage,
  /totalAmount=\{finalTotalAmount\}/,
  "Review fare card total must come from the computed authoritative Review total prop."
);

assert.match(
  paymentPage,
  /appliedOffer: 0,\s*discount: 0,/s,
  "Provider-backed Payment pricing must not invent frontend Smart Offer discounts."
);

assert.match(
  paymentPage,
  /paymentQuote: draft\.paymentQuote \|\| payload\.reviewData\?\.backendOffer\?\.paymentQuote/,
  "Payment must retain backend paymentQuote authority for provider-backed flights."
);

console.log("D26R flight fare reconciliation regression PASS");