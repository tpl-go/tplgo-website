import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

const oneWayResults = read("app/components/flight/results/oneway/OneWayResultsLayout.tsx");
const dateFareStrip = read("app/components/flight/results/common/FlightsDateFareStrip.tsx");
const airportSelect = read("app/components/flight/search/AirportSelect.tsx");
const paymentPage = read("app/flights/payment/page.tsx");
const paymentPriceCard = read("app/components/payment/flight/FlightPaymentPriceCard.tsx");

assert.doesNotMatch(
  oneWayResults,
  /generateDummyFlights/,
  "One-way production results must not generate dummy fallback flights."
);
assert.match(
  oneWayResults,
  /const baseFlights = backendFlights \?\? \[\]/,
  "One-way results must render backend/provider results only."
);

assert.doesNotMatch(
  dateFareStrip,
  /flightDummyData|generateDummyFlights|getDynamicFareForDate|routeSeed|seasonalOffset/,
  "Date fare strip must not fabricate adjacent-date fares."
);
assert.match(
  dateFareStrip,
  /Fare unavailable/,
  "Date fare strip must show a truthful unavailable fare state when backend adjacent fares are absent."
);

assert.doesNotMatch(
  airportSelect,
  /filterLocalAirports/,
  "Airport autocomplete must not fall back to a fixed local airport list."
);
assert.match(
  airportSelect,
  /searchBackendAirports/,
  "Airport autocomplete must use backend airport search."
);

assert.doesNotMatch(
  paymentPage,
  /FlightPaymentOptionSection/,
  "Payment page must not render duplicate card/UPI/netbanking controls before Razorpay."
);
assert.match(
  paymentPage,
  /Razorpay TEST Checkout/,
  "Payment page must expose Razorpay TEST Checkout as the payment boundary."
);
assert.match(
  paymentPriceCard,
  /Proceed to Book/,
  "Payment CTA must proceed directly to the Razorpay TEST booking boundary."
);
assert.doesNotMatch(
  paymentPriceCard,
  /Please select a payment method first/,
  "Payment CTA must not be blocked by a duplicate frontend payment-method selector."
);

console.log("D26Q OTA journey authority regression PASS");
