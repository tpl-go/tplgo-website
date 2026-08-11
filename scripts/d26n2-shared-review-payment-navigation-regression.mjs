import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const reviewPage = readFileSync("app/flights/review/page.tsx", "utf8");
const paymentPagePath = "app/flights/payment/page.tsx";
const paymentPage = readFileSync(paymentPagePath, "utf8");
const nextConfig = existsSync("next.config.ts") ? readFileSync("next.config.ts", "utf8") : "";

assert.ok(existsSync(paymentPagePath), "/flights/payment route file must exist.");
assert.match(paymentPage, /export default function FlightPaymentPage/, "Payment page must export the client route component.");
assert.doesNotMatch(paymentPage, /\bredirect\s*\(/, "Payment page must not server-redirect before client mount.");
assert.doesNotMatch(nextConfig, /flights\/payment[^]*redirects\s*\(/, "Next config must not redirect /flights/payment.");

for (const marker of [
  "N01_BEFORE_PUSH",
  "N02_PUSH_RETURNED",
  "N03_ROUTE_CHANGE_DETECTED",
  "N04_PATHNAME_CHANGED",
  "N02_NAVIGATION_NOT_COMMITTED",
]) {
  assert.match(reviewPage, new RegExp(marker), `Review navigation trace must include ${marker}.`);
}

assert.match(reviewPage, /const PAYMENT_ROUTE = "\/flights\/payment"/, "Review must use one canonical Payment route.");
assert.match(reviewPage, /router\.push\(PAYMENT_ROUTE\)/, "Review must attempt Next router navigation first.");
assert.match(reviewPage, /window\.location\.assign\(PAYMENT_ROUTE\)/, "Review must use hard navigation only if router navigation does not commit.");
assert.match(reviewPage, /PAYMENT_NAVIGATION_COMMIT_TIMEOUT_MS/, "Review must use a bounded navigation commit watchdog.");
assert.match(reviewPage, /Could not open payment page\. Please retry\./, "Navigation failure must be visible to the user.");
assert.match(reviewPage, /currentPathname === PAYMENT_ROUTE/, "Review must verify the pathname before treating navigation as committed.");
assert.match(reviewPage, /currentPathname !== beforePathname/, "Review must record route-change detection separately from router.push returning.");

console.log("D26N.2 shared review payment navigation regression PASS");
