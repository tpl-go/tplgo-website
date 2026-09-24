# TPL Partner Desk — HOTEL-M3B Modification and Cancellation Request Orchestration

## Open-request eligibility correction — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-OPEN-REQUEST-GUARD-02
**Previous/current status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

The first authenticated Partner submission created canonical request **TPL-MOD-D9853CDA** in SUBMITTED version 1 for TPL-QA-HOTEL-M3B-MOD-001. The booking correctly remains CONFIRMED version 1, allocated and TEST_NO_PAYMENT. The request recorded the current dates/guest counts and Date Change as a non-guaranteed special request; it has not been acknowledged, decided or applied.

Live observation exposed a presentation/read-contract defect: the API enforced one open request transactionally, but Partner Website and Mobile used the membership-level canSubmit grant as booking eligibility, leaving **Submit request for review** enabled. Backend **d9da3cb** now returns bounded server-authoritative eligibility per visible booking and reports OPEN_REQUEST_EXISTS while a Draft/Submitted/Under Review request exists. Website **df81142** and Mobile **56ad638** consume that result, disable duplicate submission and explain that the open request must be resolved or withdrawn first. The older HOTEL-M3A action is now labelled **Acknowledge confirmed booking · stay lifecycle** so it cannot be confused with **Acknowledge request**; confirmed booking state remains intentionally unchanged before approval.

Fresh verification: actual isolated PostgreSQL HOTEL-M3B suite 8/8 (including the open-request snapshot assertion), Backend export 2/2, Backend type/build, Website request contract 2/2 plus scoped ESLint and 244-page production Webpack build, and Mobile 2 suites/3 tests, TypeScript, scoped ESLint and Android Hermes export. git diff --check and scoped secret checks passed. A broad Website TypeScript run still reports the repository’s pre-existing Vitest shim/test-declaration and ES-target issues; it is not represented as a new M3B failure or as a broad typecheck pass.

Delivery is Backend d9da3cb in immutable staging release /home/tpladmin/tpl-api-releases/partner-hotel-m3b-d9da3cb-r2, archive SHA-256 2ca0d3040e52f204951c7c9164e6694019dc42259eeead40caf38d01cdabe2ed; Website df81142 in READY Preview dpl_HzSd6FB4dFScpcobtHqZBHhfPqJK assigned only to staging.tplgo.com; Mobile 56ad638 through the existing Development APK/Metro. Staging and production Website/API final health are 200. The fixture flag is absent; production remains untouched.

**Exact next action:** refresh the staging Partner Website on TPL-QA-HOTEL-M3B-MOD-001 and confirm **Submit request for review** is disabled with **Resolve or withdraw the open request first.** Do not click the separate stay-lifecycle acknowledgement. After that confirmation, withdraw TPL-MOD-D9853CDA through the normal request action so it becomes the required no-mutation withdrawal proof, then submit the intended bounded modification as a separate operator step.


**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260924-LIVE-GATE-01`
**Date:** 2026-09-24 (Asia/Calcutta)
**Batch:** `PARTNER_DESK_HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION`
**Previous status:** `HOTEL_M3A_BOOKING_INBOX_STAY_LIFECYCLE_STAGING_END_TO_END_PASS`
**Current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

## Delivered boundary

HOTEL-M3B extends the canonical booking aggregate and HOTEL-M3A operations layer with a separate, versioned request aggregate:

```text
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED / WITHDRAWN / EXPIRED
```

The confirmed booking remains unchanged until an authorized Admin applies an approved request inside the same transaction as allocation, audit and outbox changes. Partner acknowledgement remains distinct from the final decision. Supported bounded modification fields are stay dates, guest counts, guest-name correction and a non-guaranteed special request. Cancellation releases allocation exactly once and records `REFUND_REVIEW_REQUIRED`; it never claims refund completion. Payment, settlement, payout, provider calls and external delivery remain outside scope.

Migration `0064_partner_hotel_booking_requests` adds indexed request/event storage, one-open-request protection and the established `CANCELLED` stay state. Narrow permissions separate request read, submit, Partner review and Admin decision. Customer ownership and Partner organization/service/booking ownership are server-enforced. Client eligibility/lifecycle values are never authoritative.

## Backup, deployment and fixture

The protected pre-mutation backup is `/home/tpladmin/backups/tpl-partner-hotel-m3b-pre-0064-20260924T122357Z.dump`, SHA-256 `42698a2f72d8fdec8ad8b60b1d8b89da01c25f3f8ac2f5059717b5dc13098747`; `pg_restore --list` returned 1,463 entries.

| Surface | Revision / staging delivery |
|---|---|
| Backend | Feature `524b45f`, final `96501f0`; release `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-96501f0`; archive SHA-256 `8a23a695d062ad2637ae75cbaf0e04eab1f2ffbc889ee2366e489f4fa73b5b7d` |
| Website/Admin/customer | `3ae6f95`; READY `dpl_Fu69KqkZnGjmfWBfcpbFzcCG1otG`; only `staging.tplgo.com` |
| Mobile | `d6c540b`; existing Development APK/app data and Metro 8081 |

Only `tpl-api-partner-staging`/4100 changed. The fixture flag is absent from the running PM2 environment. Staging and production API/Website health are 200. Production port 4000, database, aliases, process and data remain untouched.

The completed `TPL-QA-HOTEL-M3A-001` remains `CHECKED_OUT`, version 5, as the terminal/ineligible proof. The guarded service command created exactly three fictional bookings:

* `TPL-QA-HOTEL-M3B-MOD-001`
* `TPL-QA-HOTEL-M3B-CAN-001`
* `TPL-QA-HOTEL-M3B-WD-001`

All are `CONFIRMED` version 1, `ALLOCATED`, and `TEST_NO_PAYMENT`. Three canonical allocations moved availability from 4/version 3 to 1/version 4. Replay returned `replayed=true`; counts remained three operations, three allocations and zero requests. Three internal outbox rows have `externalDelivery=false`.

## Verification

Actual isolated PostgreSQL tests pass 8/8: terminal-state denial; fixture idempotency/rollback; modification allocation and unchanged payment; maker-checker/read-only/foreign-tenant/customer-ownership denials; concurrent cancellation with one winner and exactly-once release; withdrawal/rejection without booking mutation; injected audit rollback; ordered events and internal-only outbox. These are real PostgreSQL tests.

Backend export tests pass 2/2; type/build pass locally and on the staged release. The remote build exposed a test-only Buffer narrowing defect, fixed in `96501f0`. Website focused tests pass 4/4, scoped lint/diff pass, and production Webpack/Vercel build passes 244 pages. Mobile passes 2 suites/3 tests plus TypeScript, scoped lint and Android Hermes/public-config export. Mobile uses server-returned `canSubmit`; it does not decide eligibility locally. Unauthenticated Partner, Admin and customer request routes each return 401.

CSV/XLSX formula protection and bounded PDF generation are implemented. Authenticated PDF download and visual readability remain live gates; a black headless PDF canvas is not presented as visual certification.

## Live gate

No request has been created yet, preserving the clean before-state. Website/Mobile/Admin/customer parity, approved modification, approved cancellation, one withdrawn/rejected request, allocation reconciliation, timeline/export equality and clear PDF observation remain pending.

**Exact next action:** on the staging Partner Website, select the retained synthetic Hotel, open **Bookings**, select `TPL-QA-HOTEL-M3B-MOD-001`, and submit a **Modification request** with check-in `2026-10-02`, check-out `2026-10-03`, adults `3`, children `0`, reason **Date change**. Do not approve it or perform a payment action. Report only the success/error message and visible request status.

All completed M2.6–M2.7B-G and HOTEL-M3A statuses are preserved. The fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain unchanged. HOTEL-M3C is not started.
