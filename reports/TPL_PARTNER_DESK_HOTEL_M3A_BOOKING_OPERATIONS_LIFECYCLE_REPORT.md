# TPL Partner Desk — HOTEL-M3A Booking Operations and Stay Lifecycle

**Checkpoint:** `TPL-PARTNER-HOTEL-M3A-20260924-E2E-PASS-01`  
**Date:** 2026-09-24 (Asia/Calcutta)  
**Batch:** `PARTNER_DESK_HOTEL_M3A_BOOKING_OPERATIONS_LIFECYCLE`  
**Previous status:** `M2_7B_G_ADMIN_POLICY_INCLUSION_EXCLUSION_GOVERNANCE_STAGING_END_TO_END_PASS`  
**Current status:** `HOTEL_M3A_BOOKING_INBOX_STAY_LIFECYCLE_STAGING_END_TO_END_PASS`

## Delivered boundary

HOTEL-M3A adds the first bounded Hotel booking-operations vertical while retaining the existing canonical `booking.bookings` aggregate. The Partner operations model is an adjunct projection and command layer; it does not create a second booking truth. The permitted staging lifecycle is:

```text
CONFIRMED
  -> PARTNER_ACKNOWLEDGED
  -> READY_FOR_CHECK_IN
  -> CHECKED_IN
  -> CHECKED_OUT

PARTNER_ACKNOWLEDGED or READY_FOR_CHECK_IN -> NO_SHOW
```

Partner acknowledgement is operational and does not downgrade customer confirmation. Payment remains separate and read-only. Cancellation, modification, repricing, refunds, settlement and payout are outside this batch.

## Synthetic booking and allocation

The guarded staging fixture created exactly one booking through production service contracts:

| Field | Controlled value |
|---|---|
| Booking reference | `TPL-QA-HOTEL-M3A-001` |
| Hotel | Retained staging-only synthetic Hotel organization |
| Room | `Synthetic Deluxe Room — QA Only` |
| Stay | 2026-10-01 through 2026-10-03 |
| Quantity / guests | 1 room / 2 adults |
| Rate snapshot | INR 1,275.00 (`127500` minor units) |
| Payment disclosure | `TEST_NO_PAYMENT` |
| Provenance | Staging-only HOTEL-M3A synthetic fixture |

Pre-booking availability was 5 of 8, version 2. The booking committed one allocation and changed availability once to 4 of 8, version 3. A fixture replay returned the same booking and did not allocate twice. Check-in and check-out did not change capacity or allocate again.

Protected pre-mutation backup: `/home/tpladmin/backups/hotel-m3a-pre-0063-c2ce990.dump`; SHA-256 `1996968837db8b218e4866036d3ba94d46905e9be1d4361279e73ab755ce7a83`; `pg_restore --list` returned 1,425 entries.

## Live staging parity

The normal Partner Website showed the booking inbox, bounded detail, action eligibility and timeline. The operator acknowledged the booking on Website and received the expected success message. Native Mobile read the identical acknowledged booking/version, marked it ready for check-in, later read the Website check-in, and completed check-out. Android Back returned to the same scoped Partner Command Center/list; background and foreground restoration retained the organization and booking state.

The operator confirmed the refreshed Partner Website, Admin booking detail, customer booking detail and bounded exports all showed the same completed booking. Admin remained a safe read model. Customer detail used the canonical reference, Hotel, room, dates, guest summary and lifecycle without Partner notes, allocation internals or version metadata.

Final canonical state:

| Evidence | Result |
|---|---|
| Operation state | `CHECKED_OUT`, version 5 |
| Aggregate state | completed / checked out |
| Payment | `TEST_NO_PAYMENT`, unchanged |
| Allocation rows | exactly 1 |
| Availability | 4 of 8, version 3 |
| Event order | received → acknowledged → ready → checked in → checked out |
| Client provenance | API → Website → Mobile → Website → Mobile |
| Outbox | 5 internal events; zero external delivery |

## Authorization, concurrency and transaction evidence

Actual disposable PostgreSQL coverage passed 6/6. It proves atomic booking/allocation/audit behavior, injected-failure rollback, idempotent fixture replay, same-version transition concurrency with one winner and one stale rejection, duplicate acknowledgement/check-in/check-out protection, ordered immutable history, read-only denial, foreign-tenant denial, wrong-owner denial, customer lookup by UUID or public reference, and unchanged payment state. Mocked tests are not presented as PostgreSQL certification.

Narrow booking read/operate authority is required independently of supply, media, content and finance permissions. The fixture control used the exact active scoped member and transactionally added only the required booking permissions. Customer routes enforce customer ownership; Partner commands enforce organization, service and booking ownership. No client-calculated state transition is trusted.

## Events, exports and presentation

Five committed lifecycle events and five unique idempotency keys match the five canonical versions. Four Partner transition audit records match the Website/Mobile action sequence. No SMS, WhatsApp, email, CRM, provider or paid delivery was invoked.

CSV and XLSX retain formula protection and allowlisted operational fields. Print is bounded. The first PDF was technically correct but visually overmeshed. Backend `03c1bfc` rebuilt it as a clear one-page booking summary with an emerald header, wrapped Hotel text, a fact grid, distinct gold lifecycle status, a five-row timeline and bounded footer/page number. It was rendered and visually inspected before staging deployment; the operator then re-downloaded it and confirmed it is clear. This clear, bounded, non-overlapping layout is the accepted standard for later Partner PDFs; broad unrelated PDF redesign is outside HOTEL-M3A.

## Defects and corrections

1. The retained inventory lifecycle is configurable `draft`, while the first fixture query accepted only `active`; the query now accepts established configurable `draft`/`active` rows and still excludes inactive inventory.
2. The first fixture membership query assumed an OWNER role. It now resolves the exact active scoped manager/member and grants only booking read/operate inside the guarded fixture transaction.
3. Customer booking detail forced a UUID and could not open the public booking reference. It now accepts a UUID or canonical public reference while preserving customer ownership checks.
4. Mobile generated a random idempotency key for repeat taps. It now derives a deterministic command key.
5. The first live inbox request returned an unexpected server error because the query referenced nonexistent `partner.organizations.display_name`. It now uses the canonical `brand_name` with `legal_name` fallback; the PostgreSQL test schema was corrected to production parity.
6. Customer Hotel detail labelled the synthetic booking as Paid. It now shows canonical `TEST_NO_PAYMENT` disclosure.
7. The booking PDF layout was overmeshed. The final bounded layout was rebuilt, rendered, deployed and operator-confirmed readable.

## Automated verification

Backend TypeScript and production build pass. Focused PostgreSQL tests pass 6/6 and PDF/CSV export tests pass 2/2. Website focused tests pass 2/2, scoped lint/diff and the production Webpack/Vercel build pass. Mobile focused tests pass 2/2, TypeScript, scoped lint, Hermes/public-config and diff checks pass. Scoped secret scans found no credential. Automated evidence is recorded separately from the operator-observed live flow.

## Source and staging delivery

| Surface | Revision / release |
|---|---|
| Backend | `03c1bfc` (feature base `c2ce990` plus scoped corrections); `/home/tpladmin/tpl-api-releases/partner-hotel-m3a-03c1bfc`; PDF overlay SHA-256 `193D4053827700655094F8D18AB12BD8CF76A14C26EBED52FC07CEA8388C4F23` |
| Website | `e043bf8`; READY deployment `dpl_3qxkbN4mMWWQnCr14zHF8E1ftFMZ`; assigned only to `staging.tplgo.com` |
| Mobile | `9e89f09`; existing Development APK/app data and Metro/JS delivery reused |

Migration `0063_partner_hotel_booking_operations` was applied only to staging. `tpl-api-partner-staging` on port 4100 and production port 4000 both returned health 200. Production retained PID `972721`; production database, aliases, data and storage were untouched.

## Preservation and next boundary

Existing Hotel content, amenities, policies, inclusions/exclusions, three approved media records, room capacity 8/version 2 and INR 1,275 base rate/version 2 remain unchanged. The expected availability change is only the single booking allocation from 5 to 4/version 3. No real Partner, submitted application, notification, payment, refund, settlement, payout, finance ledger or provider state changed, and provider cost is zero.

The fixed **46 requirements / 213 units** denominator remains unchanged. `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` are preserved.

Exact next separate Hotel step: **HOTEL-M3B — booking modification and cancellation request orchestration**. It must preserve non-financial boundaries and is not started by this checkpoint.
