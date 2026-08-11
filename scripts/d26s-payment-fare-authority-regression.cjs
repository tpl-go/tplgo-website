const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const paymentPath = path.join(root, 'app/flights/payment/page.tsx');
const source = fs.readFileSync(paymentPath, 'utf8');

assert.match(
  source,
  /function getDisplayFareLines\(/,
  'Payment must centralize backend-authoritative display fare line derivation'
);
assert.match(
  source,
  /draftPriceCurrency === displayCurrency[\s\S]*sameFlightMoneyAmount\(draftPrice\.total, displayTotal\)/,
  'Payment may use backend draft base/taxes only when draft price currency matches the displayed payable currency'
);
assert.match(
  source,
  /reviewPricingCurrency === displayCurrency[\s\S]*sameFlightMoneyAmount\(reviewLineTotal, displayTotal\)/,
  'Payment must preserve the Review display-fare snapshot when it reconciles with backend payable total'
);
assert.match(
  source,
  /baseFare: Math\.max\(displayTotal - ancillaryTotal, 0\)/,
  'Payment must fall back to backend display total, not supplier-original fare lines, when no display-currency breakdown exists'
);

const backendAuthorityBlock = source.match(/if \(backendAuthority\) \{[\s\S]*?totalAmount: displayTotal,[\s\S]*?\n    \}/);
assert.ok(backendAuthorityBlock, 'Payment backend-authority price block must exist');
assert.doesNotMatch(
  backendAuthorityBlock[0],
  /supplierPrice\?\.(baseFare|taxes|fees)/,
  'Payment backend-authority customer display must not render supplier-original fare components as payable-currency line items'
);

console.log('D26S payment fare authority regression PASS');