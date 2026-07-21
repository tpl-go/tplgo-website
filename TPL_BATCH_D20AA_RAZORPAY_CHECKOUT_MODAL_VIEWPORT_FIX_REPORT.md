# TPL Batch D20AA Razorpay Checkout Modal Viewport Fix Report

Date: 2026-07-21
Frontend repo: C:\Users\Admin\tpl-project

## Trigger

D20Z manual-assisted Razorpay checkout was stopped because Razorpay Checkout opened, but the hosted modal was cut off at the bottom even after browser zoom was reduced to 25%. Manual completion was not usable.

## Immediate Restore

Backend was restored via PM2 restart and reported:

- `PAYMENT_GATEWAY=mock`
- `RAZORPAY_MODE=test`
- `FLIGHT_PROVIDER=mock-flight`

Frontend production env was restored and redeployed with:

- `NEXT_PUBLIC_TPL_COMING_SOON_GATE_ENABLED=true`
- `NEXT_PUBLIC_PAYMENT_GATEWAY_TEST_ENABLED=false`
- `NEXT_PUBLIC_RAZORPAY_CHECKOUT_ENABLED=false`

Public verification after restore:

- API health OK.
- Public providers: `mock-payment`, `mock-flight`.
- `/flights` renders the Coming Soon page.
- Restored `/flights` HTML has no Razorpay checkout text.

## Diagnosis

Inspected areas:

- `app/flights/payment/page.tsx`
- `app/globals.css`
- `app/lib/api/razorpayCheckoutClient.ts`
- `scripts/smoke-flight-razorpay-browser-checkout.mjs`

Findings:

- Payment page uses ordinary static/sticky layout. No parent transform, perspective, vertical clipping container, or app-owned Razorpay wrapper was found around the hosted iframe.
- Global CSS only forces horizontal overflow hidden on `html`, `body`, and mobile `main`; it does not force vertical clipping on desktop.
- Razorpay is opened through the standard `window.Razorpay(...).open()` flow. The app does not manually position or wrap the Razorpay iframe.
- The manual runner launched headed Chromium with an emulated viewport of `1600x1400`. In headed Playwright, that can create a mismatch between the emulated page viewport and the actual OS browser window. A hosted fixed-position payment modal can then render below the visible browser chrome/window area even when page zoom is reduced.

## Fix Applied

Updated `scripts/smoke-flight-razorpay-browser-checkout.mjs` manual mode:

- Manual mode now launches visible Chromium with `--start-maximized` and `--window-size=1600,1200`.
- Manual mode uses `viewport: null`, so Chromium uses the real native window viewport instead of an oversized emulated viewport.
- Before opening Razorpay in manual mode, the runner injects a smoke-only scroll safety style to keep `html`, `body`, Razorpay container/backdrop, and Razorpay iframe within `100dvh` with vertical scrolling available.
- Manual mode skips automated Razorpay card submission and waits up to `CONFIRMATION_TIMEOUT_MS` for `/flights/confirmation`.
- Confirmation checks now explicitly require a `flight-test-confirm` request and a 2xx `flight-test-confirm` response before marking backend signature verification as passed.

## Validation

- `node --check scripts/smoke-flight-razorpay-browser-checkout.mjs`: passed.
- No production Razorpay live mode was enabled.
- No OTP/MSG91, Amadeus, supplier booking, PNR, ticketing, refund, cancellation, or live capture flow was touched.

## Notes

The fix is local to the smoke runner/manual test harness. No deployed frontend code change was required for D20AA because the inspected app layout did not show a page-level Razorpay modal clipping cause.

Next manual-assisted smoke should run with:

`MANUAL_RAZORPAY=1 CONFIRMATION_TIMEOUT_MS=600000 node scripts/smoke-flight-razorpay-browser-checkout.mjs`

The backend/frontend temporary production switch still requires approval before any future smoke run.