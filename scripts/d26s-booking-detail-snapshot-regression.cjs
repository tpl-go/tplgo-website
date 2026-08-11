const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const detailPath = path.join(root, 'app/account/bookings/flight/[bookingId]/page.tsx');
const detail = fs.readFileSync(detailPath, 'utf8');
const resolverPath = path.join(root, 'app/lib/booking/resolvers/flightResolver.ts');
const resolver = fs.readFileSync(resolverPath, 'utf8');

assert.match(
  resolver,
  /if \(!fareLineTotal && priceBreakup\.totalAmount > 0\) \{\s*priceBreakup\.baseFare = priceBreakup\.totalAmount;/,
  'Booking resolver must not show Gross Amount ₹0 when a backend-paid flight snapshot has only total amount'
);
assert.match(
  detail,
  /resolveFlightBookingSource/,
  'Booking Detail must use the backend-first flight resolver'
);
assert.match(
  detail,
  /const resolvedSource = useMemo\(\(\) => \{/,
  'Booking Detail must build a resolved source from backend booking payload'
);
assert.match(
  detail,
  /resolvedSource\?\.journeys \|\| reviewData\?\.journeys \|\| \[\]/,
  'Booking Detail journey card must prefer resolved backend itinerary snapshot'
);
assert.match(
  detail,
  /if \(resolvedSource\?\.priceBreakup\) return resolvedSource\.priceBreakup;/,
  'Booking Detail fare card must prefer resolved backend price snapshot'
);
assert.doesNotMatch(
  detail,
  /journeys=\{reviewData\?\.journeys \|\| \[\]\}/,
  'Booking Detail must not render only reviewData journeys and lose backend itinerary snapshots'
);

console.log('D26S booking detail backend snapshot regression PASS');
