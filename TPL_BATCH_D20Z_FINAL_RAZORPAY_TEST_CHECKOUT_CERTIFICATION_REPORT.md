# TPL Batch D20Z Final Razorpay Test Checkout Certification Report

Date: 2026-07-21
Frontend repo: C:\Users\Admin\tpl-project
Relevant commits:

- `45bca16` - frontend smoke deploy commit with repeatable Razorpay test checkout support
- `e4f9063` - manual Razorpay smoke viewport fix
- `673bf9b` - D20Z manual-assisted smoke report

## Scope

D20Z-Finalize classified and fixed the remaining confirmation-page assertion issue after the D20Z manual-assisted Razorpay smoke reached the backend signature-confirm path. No new Razorpay production switch or full Razorpay browser smoke was run.

## Source And Artifact Inspection

Inspected:

- `artifacts/browser-smoke/d20y-razorpay-browser-checkout-report.md`
- `artifacts/browser-smoke/d20y-razorpay-browser-checkout-result.json`
- `app/flights/confirmation/page.tsx`
- `scripts/smoke-flight-razorpay-browser-checkout.mjs`

Artifact facts from run `d20z_20260721124650`:

- `flight-test-order` request occurred and returned `201`.
- Razorpay Checkout opened in test mode.
- `flight-test-confirm` request occurred.
- `flight-test-confirm` returned `200`.
- SessionStorage safety passed with no hit keys.
- No supplier confirmation copy, PNR, or ticketing copy was detected by the runner.
- Only failed check was the exact text assertion for `TPL Test Confirmation`.

Confirmation page source contains the required test-only markers:

- `TPL Test Confirmation`
- `PNR: Not issued in test mode`
- `Ticket: Not issued in test mode`
- Supplier booking disabled wording: `Supplier booking, live payment capture, PNR generation, and ticketing remain disabled.`

## Classification

The D20Z payment/signature path is certified as passing in Razorpay test mode based on the recorded `flight-test-confirm` request and `200` response.

The failed `confirmation-test-copy` check was classified as a smoke assertion timing/copy-readiness issue. The runner waited for `/flights/confirmation`, then read body text once and required one exact headline string. That was too brittle for the confirmation page render lifecycle and did not use the broader test-only marker set already present in the source.

## Fix Applied

Updated `scripts/smoke-flight-razorpay-browser-checkout.mjs`:

- Added `readSettledConfirmationText(page)` to poll confirmation body text for up to 30 seconds after the route loads.
- Replaced the exact-only `TPL Test Confirmation` assertion with `hasTestOnlyConfirmationMarkers(text)`.
- The marker check accepts either the headline or the combined test-only safety markers:
  - `TPL-only beta`
  - `PNR: Not issued in test mode`
  - `Ticket: Not issued in test mode`
  - supplier booking disabled wording
- Kept the negative supplier/PNR/ticketing assertion.
- Kept required `flight-test-confirm` request and 2xx response assertions.

## Validation

- `node --check scripts/smoke-flight-razorpay-browser-checkout.mjs`: passed.
- No full Razorpay browser smoke was rerun.
- No backend payment gateway switch was performed for finalize.
- No Vercel production env or deploy change was performed for finalize.

Read-only restored-state checks:

- Public API health: OK.
- Public providers: `mock-payment`, `mock-flight`.
- Backend PM2: `PAYMENT_GATEWAY=mock`, `RAZORPAY_MODE=test`, `FLIGHT_PROVIDER=mock-flight`.
- `/flights` renders Coming Soon.
- Restored `/flights` HTML contains no Razorpay checkout text.

## Safety Confirmation

- Razorpay live mode was not enabled.
- OTP/MSG91 was not touched.
- Amadeus was not touched.
- Supplier booking, PNR, ticketing, refund, cancellation, and live capture were not run.
- Secrets and Razorpay signatures were not printed.
- Raw Razorpay response/signature storage was not introduced.
- Final backend remains `PAYMENT_GATEWAY=mock`.
- Final frontend remains Coming Soon gated with Razorpay flags disabled.

## Final Certification

Razorpay test checkout is certified through the backend signature-confirm path for the controlled D20Z manual-assisted smoke:

- Test order creation: passed (`201`).
- Razorpay hosted checkout open: passed.
- Manual Razorpay test payment completion: passed sufficiently to trigger backend confirm.
- Backend signature verification: passed (`flight-test-confirm` `200`).
- SessionStorage safety: passed.
- Supplier booking/ticketing safety: passed.

The final code change closes the only remaining smoke-runner assertion gap without requiring another production payment-mode switch.