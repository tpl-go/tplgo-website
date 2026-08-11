const { readFileSync } = require("fs");
const assert = require("assert");

const source = readFileSync("app/lib/api/bookingApi.ts", "utf8");

assert(
  source.includes("const path = \"/api/v1/bookings\";"),
  "Authenticated My Booking list must use the backend user's booking authority without a mobile query filter."
);

assert(
  !/const path = mobile\?\.trim\(\)\s*\?\s*`\/api\/v1\/bookings\?mobile=/.test(source),
  "Authenticated My Booking list must not be over-constrained by account mobile."
);

assert(
  source.includes("const localBookings = mobile"),
  "Mobile filtering should remain available for local fallback data."
);

console.log("D26S My Booking authenticated list regression passed.");
