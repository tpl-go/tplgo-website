const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const hooks = fs.readFileSync(path.join(root, 'app/components/flight/hooks.ts'), 'utf8');
const resultsPage = fs.readFileSync(path.join(root, 'app/components/flight/results/FlightsPageClient.tsx'), 'utf8');
const oneWayCard = fs.readFileSync(path.join(root, 'app/components/flight/results/oneway/OneWayFlightResultCard.tsx'), 'utf8');
const fareSummary = fs.readFileSync(path.join(root, 'app/components/booking/flight/FlightFareSummaryCard.tsx'), 'utf8');

assert.match(
  hooks,
  /SEARCH_QUERY_DATE_TIME_ZONE\s*=\s*"Asia\/Kolkata"/,
  'query date parsing must use an explicit timezone so SSR and client agree on calendar day'
);
assert.match(
  hooks,
  /formatToParts\(parsed\)/,
  'query date parsing must extract calendar parts instead of rendering the raw instant with host timezone'
);
assert.match(
  hooks,
  /return new Date\(year, month - 1, day\)/,
  'query date parsing must return a date-only value for stable first render'
);
assert.doesNotMatch(
  hooks,
  /function parseDate\(dateStr: string \| null\) \{\s*if \(!dateStr\) return null;\s*const parsed = new Date\(dateStr\);\s*return Number\.isNaN\(parsed\.getTime\(\)\) \? null : parsed;\s*\}/s,
  'raw query Date parsing reintroduces production SSR/client timezone hydration mismatch'
);

assert.match(resultsPage, /Provider fare is confirmed at Review/, 'D26R.1 Results provider authority copy must remain');
assert.doesNotMatch(resultsPage, /DOM1500|INTL4500|OFFER APPLIED|Save ₹1,500|Save ₹4,500/, 'Flight Results must not advertise unhonored payable Smart Offers');
assert.match(oneWayCard, /selectedCurrency === "INR" && !providerBackedPricing/, 'provider-backed one-way cards must not apply browser Smart Offer discounts');
assert.match(fareSummary, /Applied Offer/, 'Review fare summary must retain backend-applied offer row');
assert.doesNotMatch(fareSummary, /getSmartActiveOfferItem|calculateSmartOfferDiscount|TPL_SMART_OFFER_UPDATED/, 'Review must not reintroduce browser Smart Offer authority');

console.log('D26R.2 React 418 hydration regression PASS');
