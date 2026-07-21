# TPL Batch D20Z Manual-Assisted Razorpay Checkout Completion Report

Date: 2026-07-21
Frontend repo: C:\Users\Admin\tpl-project
Frontend smoke deployment commit: 45bca16
Local smoke runner revision used: e4f9063 plus D20Z manual-mode working-tree changes
Run ID: d20z_20260721124650
Route: DEL -> BOM
Departure date: 2026-08-20

## Scope

D20Z ran a controlled manual-assisted Razorpay test checkout smoke. Automation drove the TPL flight flow to Razorpay Checkout, then paused for human interaction inside the hosted Razorpay iframe. Razorpay live mode was not enabled.

## Safety Rules Followed

- Razorpay live mode was not enabled.
- OTP/MSG91 was not touched.
- Amadeus was not touched.
- Supplier booking, PNR, ticketing, refund, cancellation, and live capture were not run.
- Secrets and Razorpay signatures were not printed.
- Raw Razorpay response/signature was not stored in sessionStorage.

## Preflight

Verified before temporary switch:

- Backend PM2: `PAYMENT_GATEWAY=mock`, `RAZORPAY_MODE=test`, `FLIGHT_PROVIDER=mock-flight`.
- Public API health: OK.
- Public providers: `mock-payment`, `mock-flight`.
- Frontend `/flights`: Coming Soon gate enabled and no Razorpay checkout text.

## Temporary Configuration

Frontend production env flags were temporarily set and deployed:

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

## Manual-Assisted Smoke Result

Automation reached Razorpay Checkout and paused for manual interaction.

Passed checks from the redacted smoke artifact:

- Backend-sourced flight result selected.
- Review page reached.
- `tplSmokeRunId` preserved in review payload.
- Backend booking simulation created.
- Payment payload retained smoke run id.
- Razorpay Checkout iframe opened in test mode.
- `flight-test-confirm` request occurred.
- `flight-test-confirm` returned HTTP 200, indicating backend signature verification passed.
- Session storage safety passed: no raw Razorpay signature, raw Razorpay response, provider refs, secrets, or token-like keys were found.
- Confirmation page did not imply supplier booking, PNR, or ticketing.

Failed check:

- The script did not find the exact visible text `TPL Test Confirmation` in the rendered body at assertion time, so the smoke runner exited with status `failed`.

Follow-up inspection:

- `app/flights/confirmation/page.tsx` contains the expected test-only confirmation copy, including `TPL Test Confirmation`, `PNR: Not issued in test mode`, `Ticket: Not issued in test mode`, and supplier-booking-disabled wording.
- Because `/flights/confirmation` had to load before this assertion ran, and because `flight-test-confirm` returned 200, this is best classified as a confirmation-copy assertion/render timing gap rather than a payment/signature failure.

## Gateway Signals

The smoke artifact recorded redacted gateway events only:

- `flight-test-order` request and `201` response.
- Razorpay Checkout network activity.
- `flight-test-confirm` request and `200` response.

No secrets, Razorpay key values, session tokens, or signatures are included in the report artifacts.

## Restore

Backend was restored and PM2 reported:

- `PAYMENT_GATEWAY=mock`
- `RAZORPAY_MODE=test`
- `FLIGHT_PROVIDER=mock-flight`

Frontend production env flags were restored and redeployed:

- `NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED=true`
- `NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED=false`
- `NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED=false`

Final public verification:

- Public API health: OK.
- Public providers: `mock-payment`, `mock-flight`.
- `/flights` renders Coming Soon.
- Restored `/flights` HTML contains no Razorpay checkout text.

## Artifacts

- Redacted smoke markdown: `artifacts/browser-smoke/d20y-razorpay-browser-checkout-report.md`
- Redacted smoke JSON: `artifacts/browser-smoke/d20y-razorpay-browser-checkout-result.json`
- This report: `TPL_BATCH_D20Z_MANUAL_ASSISTED_RAZORPAY_CHECKOUT_COMPLETION_REPORT.md`

## Conclusion

D20Z completed the critical backend payment confirmation path: manual Razorpay checkout led to a `flight-test-confirm` request and HTTP 200 response, which verifies the backend signature-confirm path in Razorpay test mode. The remaining issue is the smoke runner's exact confirmation-copy assertion, which failed despite the confirmation page source containing the expected TPL test-only copy.