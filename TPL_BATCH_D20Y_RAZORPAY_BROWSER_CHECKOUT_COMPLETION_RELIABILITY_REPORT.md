# TPL Batch D20Y Razorpay Browser Checkout Completion Reliability Report

Date: 2026-07-21
Frontend repo: C:\Users\Admin\tpl-project
Frontend deployed smoke commit: 45bca16 fix(flights): make razorpay browser smoke repeatable
Vercel project: tplgo-website
Backend repo: /home/tpladmin/apps/tpl-api-git

## Scope

D20Y targeted repeatability and completion reliability for the Razorpay browser checkout smoke without weakening production safety. Razorpay live mode was not enabled. OTP/MSG91 and Amadeus were not touched. No supplier booking, PNR, ticketing, refund, cancellation, or live capture flow was run.

## Code Changes

- Added a smoke-only `tplSmokeRunId` path from `/flights` search params into the backend offer metadata, gated by both frontend Razorpay test flags.
- Appended the smoke run id only to flight simulation, test-order, and test-confirm idempotency keys when both test checkout flags are enabled.
- Preserved normal production idempotency behavior when smoke flags are disabled.
- Sanitized Razorpay checkout contact values to a 10-digit contact before prefill.
- Added and hardened `scripts/smoke-flight-razorpay-browser-checkout.mjs` to use fresh browser run ids, clear relevant sessionStorage keys, use Razorpay-valid test contact/email, avoid raw signature storage checks, and record only redacted gateway event metadata.

## Validation

- `npx tsc --noEmit`: passed after app code changes.
- `npm run build`: passed before temporary production deploy.
- `node --check scripts/smoke-flight-razorpay-browser-checkout.mjs`: passed after final smoke automation updates.

## Preflight

- Required prior commits present in local history:
  - 9954f82 fix(flights): use backend offer total for price confirm
  - 224ef6e feat(flights): add flagged razorpay test checkout
- Vercel project link verified as `tplgo-website`.
- Initial preflight found backend PM2 unexpectedly still on `PAYMENT_GATEWAY=razorpay-test`; backend was restored to `mock/test/mock-flight` before continuing.
- Public API health then reported `mock-payment` and `mock-flight`.

## Temporary Smoke Configuration

Frontend production env flags were temporarily set and production deployed with explicit env/build-env overrides:

- `NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED=false`
- `NEXT_PUBLIC_TPL_API_BASE_URL=https://api.tplgo.com`
- `NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH=true`
- `NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL=true`
- `NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED=true`
- `NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED=true`

Backend PM2 was temporarily switched to:

- `PAYMENT_GATEWAY=razorpay-test`
- `RAZORPAY_MODE=test`
- `FLIGHT_PROVIDER=mock-flight`

## Smoke Results

Repeated browser attempts used fresh `tplSmokeRunId` values. The idempotency conflict from D20X did not recur.

Confirmed in browser smoke attempts:

- `/flights` opened with explicit DEL -> BOM params and fresh run id.
- Backend-sourced result was selected.
- Review/traveller flow completed.
- `backendSimulation` was created.
- Flight test-order was created.
- Razorpay Checkout opened in test mode.
- Session payload retained the smoke run id for unique idempotency keys.
- Razorpay contact prefill used `9123456789`; the previous invalid contact blocker did not recur.

Not completed:

- Razorpay hosted card form did not advance to payment completion/OTP/confirmation under automated Playwright control.
- Backend signature verification endpoint was not reached.
- `/flights/confirmation` was not reached.

Observed non-sensitive Razorpay iframe state at the blocker:

- Visible controls included `Using as +91 91234 56789` and `Continue`.
- Card fields were populated by value length only: card number, expiry, CVV, and name all non-empty.
- The visible `Continue` control was not disabled, but click/DOM-click fallbacks did not advance the hosted Razorpay iframe.
- No `flight-test-confirm` request was recorded.

## Safety Verification

- No supplier booking was run.
- No PNR was created.
- No ticket number was created.
- No refund/cancel/ticket/live capture flow was run.
- No secrets or Razorpay signatures were printed.
- Raw Razorpay response/signature was not stored by the frontend flow. Final sessionStorage inspection could not run because confirmation was not reached; pre-confirmation smoke artifacts did not include raw signatures.

## Restore

Backend was restored and verified via PM2:

- `PAYMENT_GATEWAY=mock`
- `RAZORPAY_MODE=test`
- `FLIGHT_PROVIDER=mock-flight`

Frontend production env flags were restored and redeployed:

- `NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED=true`
- `NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED=false`
- `NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED=false`

Final public verification:

- Public API health: OK.
- Public API providers: `mock-payment` and `mock-flight`.
- `/flights` renders the Coming Soon page.
- Restored `/flights` HTML did not include Razorpay checkout text.

## Artifacts

- Redacted browser smoke artifact: `artifacts/browser-smoke/d20y-razorpay-browser-checkout-report.md`
- Redacted browser smoke JSON: `artifacts/browser-smoke/d20y-razorpay-browser-checkout-result.json`
- Local failure screenshot path: `artifacts/browser-smoke/d20y-razorpay-browser-checkout-failure.png`

## Conclusion

D20Y fixed the repeatability issues under frontend control: unique smoke run ids now prevent simulation/test-order/test-confirm idempotency reuse, and Razorpay contact prefill is sanitized. The remaining blocker is Razorpay's hosted checkout iframe not advancing from its populated card form under automation, so the end-to-end browser confirmation and backend signature verification remain incomplete. Production safety was restored and verified.