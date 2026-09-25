# TPL Partner Desk — HOTEL-M3B Modification and Cancellation Request Orchestration
## Live modification approval and atomic application — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-MODIFICATION-APPLIED-11`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

The operator completed the repaired Admin **Approve & apply → Confirm approve & apply** flow for request `TPL-MOD-F1658BA6`. Read-only canonical PostgreSQL reconciliation proves the request is `APPROVED` version 3 and the same booking `TPL-QA-HOTEL-M3B-MOD-001` is `CONFIRMED` version 3 with revised acknowledgement pending.

The approved change was applied once: check-in changed from 2026-10-01 to 2026-10-02, check-out remains 2026-10-03, adults changed from 2 to 1, children remain 0, and the fictional guest label is unchanged. The allocation is still one `ALLOCATED` room and now carries 2026-10-02 through 2026-10-03. Availability remains 4 of 8/version 6 because the allocation stayed inside the same canonical availability record. Payment disclosure remains `TEST_NO_PAYMENT`; financial impact is `PRICE_REVIEW_REQUIRED`, with no amount, payment, refund or settlement applied.

The immutable stay timeline now contains received v1, Partner acknowledgement v2 and Admin modification application v3 in order. The request contains the bounded decision reason and applied snapshot, and four related internal outbox rows exist with zero external-delivery rows. Staging and production APIs remain 200. Production, providers, real notifications and unrelated data remain untouched.

Delivery remains Backend `f8d0e8d99edf4ddb2f437fec59f404ddb67acc35`, Website functional fix `2cb7113e1db5398e9e16cafa5bfb2df10980eda4` in READY deployment `dpl_9hASsLsMaTFT1k9F8G59mkcufnaQ`, and Mobile `ac53811f033e29fd51cefcd494d41d92634cd3bc` through the existing APK/Metro. No new code or deployment followed the live decision.

**Exact next action:** on Partner Website refresh booking `TPL-QA-HOTEL-M3B-MOD-001`, verify the revised dates and one adult, then click only **Acknowledge revised booking**. Do not mark Ready for check-in in the same step. HOTEL-M3C is not started.

Completed statuses and fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.
## Admin inline decision control — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-ADMIN-INLINE-DECISION-10`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

Authenticated Partner actions completed the original-booking acknowledgement and advanced request `TPL-MOD-F1658BA6` to `UNDER_REVIEW` version 2. The operator then found that Admin **Approve & apply** did not perform a decision. Backend access evidence contained no decision POST, locating the defect in the Admin interaction before the API boundary: the reason field was detached from the request card and the final action depended on a browser-native confirmation.

Website `2cb7113e1db5398e9e16cafa5bfb2df10980eda4` replaces that path with a per-request decision box and an explicit two-step inline confirmation. Admin enters the bounded reason, chooses Approve or Reject, reviews the exact action, and then uses **Confirm approve & apply** or **Confirm reject**. Buttons have explicit non-submit semantics; the final confirmation remains disabled until the reason is valid, and fields clear only after a successful server response. Backend authorization, optimistic versioning, idempotency, allocation and audit behavior are unchanged.

Focused request contracts pass 5/5, scoped ESLint has zero errors with one pre-existing hook warning, `git diff --check` passes, and the clean Webpack build exits 0 after generating 244/244 pages. Repository-wide standalone `tsc --noEmit` remains blocked by pre-existing Vitest declaration and lower-target BigInt errors outside this change; the production build compiled the changed component successfully. READY Preview `dpl_9hASsLsMaTFT1k9F8G59mkcufnaQ` is assigned only to `staging.tplgo.com`. Backend and Mobile revisions remain `f8d0e8d99edf4ddb2f437fec59f404ddb67acc35` and `ac53811f033e29fd51cefcd494d41d92634cd3bc`; the existing APK/Metro is reused.

Post-deploy canonical readback remains one `PARTNER_ACKNOWLEDGED` booking/version 2, one `UNDER_REVIEW` request/version 2, one allocation and availability 4/8/version 6. No decision, booking, allocation, finance, provider or external-delivery mutation occurred during diagnosis/deployment. Staging and production APIs return 200; production remains untouched.

**Exact next action:** refresh Admin → retained synthetic Partner → Bookings → `TPL-QA-HOTEL-M3B-MOD-001`; on request `TPL-MOD-F1658BA6`, enter `Synthetic QA modification verified`, choose **Approve & apply**, then click **Confirm approve & apply**. Do not acknowledge the revised booking in the same step. HOTEL-M3C is not started.

Completed statuses and fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.
## Single-booking drill-down and revised-booking acknowledgement — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-SINGLE-BOOKING-DRILLDOWN-09`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

Operator direction is now implemented as one canonical row per booking and one selected-booking drill-down containing the stay lifecycle, modification/cancellation request, comparison, next action and request history. A Partner-created change request cannot advance to Admin review while the current confirmed booking receipt is unacknowledged. The same server rule applies to Website, Mobile and direct API calls. While a request remains Draft, Submitted or Under Review, acknowledgement is the only permitted stay action; Ready/Check-in/Check-out are suppressed until the request is resolved.

Admin-approved modification now atomically applies the requested booking/allocation change and returns that same booking to `CONFIRMED`, clears earlier acknowledgement/readiness timestamps and requires **Acknowledge revised booking**. Admin-approved cancellation remains terminal `CANCELLED` and never asks for acknowledgement. The clients distinguish **Acknowledge original booking once** from **Acknowledge revised booking** without fixture-name or service-name logic. Website retains orange actions; native Mobile retains emerald/gold/white.

Actual isolated PostgreSQL evidence passes 15/15: operations 6/6 and request orchestration 9/9, covering premature review denial, original acknowledgement, open-request stay-action blocking, atomic modification application, revised acknowledgement, terminal cancellation, idempotency, optimistic concurrency, rollback, RBAC and tenant isolation. Backend TypeScript/build, Website focused 4/4/lint/244-page build and Mobile focused 3/3/type/lint/Hermes export pass. No native dependency changed, so the existing Development APK is retained.

Delivery is Backend `f8d0e8d99edf4ddb2f437fec59f404ddb67acc35` in immutable release `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-drilldown-f8d0e8d99edf4ddb2f437fec59f404ddb67acc35` on `tpl-api-partner-staging`/4100 only; archive SHA-256 `9120a85310eec8e71b2afd376fbbdd567cdd3c6d1da20cb8f1d432a9b759812d`. Website `90dbb81d317f371ac69da667a81d3bf508f1e607` is READY deployment `dpl_5RPWFkmweaXeyyBNDPSXX8ov4ZmD` assigned only to `staging.tplgo.com`. Mobile `ac53811f033e29fd51cefcd494d41d92634cd3bc` is delivered through the existing Development Client/Metro; no APK reinstall or data clear occurred.

Fresh protected backup `/home/tpladmin/backups/tpl-partner-hotel-m3b-drilldown-pre-20260925T021532Z.dump`, SHA-256 `953ccbd20031ac901cbbba32ec1c0d909c3556bd1b62d6fbfc44c1f2e8de6319`, passed `pg_restore --list` with 1,475 entries. Post-deploy canonical readback shows exactly one booking, `TPL-QA-HOTEL-M3B-MOD-001`, still `CONFIRMED` version 1, unacknowledged and allocated once; exactly one open request, `TPL-MOD-F1658BA6`, remains `SUBMITTED` version 1; availability remains 4/8 version 6. The request was submitted before this acknowledgement-first correction and is preserved rather than recreated. No booking/request/allocation/payment mutation occurred during deployment. Staging and production API health are 200, the production PM2 process is unchanged, provider/external delivery remains zero and HOTEL-M3C is not started.

**Exact next action:** on staging Partner Website open Bookings → `TPL-QA-HOTEL-M3B-MOD-001` and click only **Acknowledge original booking once**. Do not send the request to Admin in the same step. After canonical readback, the request review action will be the next separate gate.

Completed M2.6–M2.7B-G and HOTEL-M3A evidence, fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.
## One-by-one synthetic booking reset — 2026-09-24

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260924-ONE-BY-ONE-RESET-08`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

The operator explicitly authorized deletion of the four confusing staging-only synthetic booking fixtures and requested that HOTEL-M3B be exercised one scenario at a time. The exact removed references were `TPL-QA-HOTEL-M3A-001`, `TPL-QA-HOTEL-M3B-MOD-001`, `TPL-QA-HOTEL-M3B-CAN-001` and `TPL-QA-HOTEL-M3B-WD-001`. A supported control was added instead of using ad-hoc SQL. It requires `TPL_ENVIRONMENT=staging`, port 4100, a process-local explicit cleanup flag, a non-production process mode, exact fixture keys, synthetic organization/source markers, a transaction and advisory lock. Missing guards fail closed. Cleanup retains immutable provenance in `ops.audit_events`, removes only fixture-owned internal outbox rows, restores only still-allocated capacity, and has no payment, provider or external-notification path.

Before cleanup, canonical readback showed all four exact bookings and four `ALLOCATED` rows, one submitted modification request and availability 1 of 8. Protected backup `/home/tpladmin/backups/tpl-partner-hotel-m3-reset-pre-20260924T172833Z.dump`, SHA-256 `cd8510079531afc944e15d684edf13053a41e5f62b2a981506b83bcc440aaa29`, passed `pg_restore --list` with 1,490 entries. Cleanup deleted exactly four bookings and one request, restored four allocated units to 5 of 8, and its immediate replay returned a no-op. Cleanup audit records `deletedBookings=4` and `restoredAllocation=4`.

Only the modification scenario was then provisioned through the guarded service contract. Canonical post-check shows exactly one retained fixture: `TPL-QA-HOTEL-M3B-MOD-001`, `CONFIRMED`, version 1, `ALLOCATED` quantity 1, `TEST_NO_PAYMENT`, zero requests; availability is 4 of 8/version 6. Cancellation and withdrawal fixtures do not exist. External-delivery-true outbox count is zero. Both cleanup and provisioning flags are absent from the running PM2 environment.

Backend source `bd21463e99ed48baf37c115da826af54a0b94948` was committed and pushed. It runs only on `tpl-api-partner-staging`/4100 from `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-reset-bd21463e99ed48baf37c115da826af54a0b94948`; archive SHA-256 is `0b43798181c31119ee93ad32669641c65013224a91b3d9468c3380dc1f2d4f08`. No migration, Website source, Mobile source or APK changed. Actual isolated PostgreSQL plus fail-closed guard coverage passes 12/12; focused exports pass 4/4; TypeScript and production build pass; scoped diff and secret checks pass. The PostgreSQL suite caught and corrected an invalid aggregate `FOR UPDATE` clause before deployment. Staging and production API health are 200; production PID/process/database/aliases/data and unrelated staging records remain untouched.

**Exact next action:** refresh Partner Website → Bookings and confirm only `TPL-QA-HOTEL-M3B-MOD-001` is visible. Open its optional change-request form and submit the bounded modification for check-in `2026-10-02`, check-out `2026-10-03`, adults `3`, children `0`, reason **Date change**. Do not acknowledge the stay lifecycle or approve the request in the same step. Cancellation and withdrawal will be provisioned separately only after the modification flow is reconciled.

Completed M2.6–M2.7B-G and HOTEL-M3A historical evidence remains preserved. Fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain unchanged. HOTEL-M3C is not started.
## Authenticated close-control confirmation — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-FORM-CLOSE-LIVE-07
**Status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

The operator authenticated to staging and confirmed the optional modification/cancellation form now closes correctly. This closes the narrow Website presentation gate for revision **6603c65** / deployment **dpl_AkyejkGbmVpTWJMn2yxjiX34utWc**. No request, booking, allocation, payment/refund, provider or production record changed during this read-only control check.

**Exact next action:** on Partner Website select `TPL-QA-HOTEL-M3B-MOD-001`, open the optional form, submit a Modification request for check-in `2026-10-02`, check-out `2026-10-03`, adults `3`, children `0`, reason **Date change**, then report only the success message and visible request state. Do not approve it or perform any payment action.

## Request-form close and authority clarification — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-FORM-CLOSE-06
**Status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

Authenticated operator review accepted the per-booking presentation and identified one remaining usability defect: after opening optional modification/cancellation creation, Website had no explicit close action. Website **6603c65** adds **Close request form**, keeps the form collapsed by default, and resets it closed when another booking is selected. The control is presentation-only and performs no request, booking, allocation or financial mutation.

The existing canonical authority was rechecked. Customer-origin requests are submitted to the Hotel for operational acknowledgement/recommendation and then require authorized Admin final approval. Hotel/Partner may also originate a modification or cancellation request directly; it proceeds to Admin review and the Hotel cannot final-approve its own request. The confirmed booking changes only after Admin approval applies successfully. Payment/refund/provider execution remains outside HOTEL-M3B.

Verification: Website request/booking contracts 4/4, scoped ESLint, `git diff --check`, and Webpack production build with 244/244 pages pass. The default Turbopack attempt timed out in the unrelated `globals.css` PostCSS worker; Vercel's clean Turbopack build passed 243/243 routes. READY Preview **dpl_AkyejkGbmVpTWJMn2yxjiX34utWc** is assigned only to `staging.tplgo.com`; staging and production Website health are HTTP 200. Backend, Mobile, APK, database and production state are unchanged.

**Exact next action:** refresh the authenticated Partner Website, open the optional request form and confirm **Close request form** collapses it without submitting or changing the selected booking. Full HOTEL-M3B PASS still requires the remaining authenticated modification/cancellation lifecycle evidence.


## Per-booking next-action hierarchy — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-ACTION-HIERARCHY-05
**Status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

The operator identified the remaining usability cause precisely: the four staging rows looked like four stages of one process, while each row is a separate synthetic booking. Eligible stay actions and an always-open optional modification form further made every enabled control appear immediately due.

Website **6c68d03** and Mobile **7784a46** now state that each row is a separate booking and show one status-derived **Recommended next stay step**. CONFIRMED requires a one-time original-booking acknowledgement; PARTNER_ACKNOWLEDGED requires no immediate action and exposes Ready only for actual room/guest preparation; READY_FOR_CHECK_IN waits for guest arrival; CHECKED_IN waits for actual stay completion; terminal states expose no further stay action. The modification/cancellation composer is now a collapsed optional request disclosure and auto-opens only when an active request exists. It explicitly says it is separate from acknowledgement/check-in.

No fixture-name or service-name switch was added; guidance derives from the canonical stay status. The four synthetic bookings and their current canonical states were not mutated. Website actions remain orange. Native Mobile retains emerald/gold/white.

Verification: Website request contracts 4/4, scoped lint zero errors with one pre-existing warning, and Webpack build 244/244 pages pass. Mobile request contract 1/1, TypeScript, scoped lint and Android Hermes/public-config export pass; bundle entry-08bc09af30438e5c39e978bfe81c9bf3.hbc was produced. Preview **dpl_Dgaa3CKAXQAwtJ4KGSnRaueQhycf** is READY and assigned only to staging.tplgo.com. Existing Development APK/app data and Metro are reused. Staging and production Website health are HTTP 200. Backend, schema, booking/allocation, finance, provider and production state are unchanged.

**Exact next action:** refresh the authenticated Partner Bookings screen and confirm each row says it is separate, each selected booking shows one recommended next stay step, and the optional modification/cancellation form is collapsed unless that booking has an open request. Do not click a stay or request action during this read-only check.

## Booking receipt and change-request action separation — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-ACTION-SEPARATION-04
**Status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

Authenticated operator feedback confirmed the guided card was improved, but two independent actions were still visually ambiguous: M3A acknowledgement of the original confirmed booking and M3B Partner review of a later modification/cancellation request. Website also incorrectly reused the native emerald primary-button treatment; the established Website action color is orange.

Website revision **a2f0f15** now labels the first stream **Original booking receipt / Stay lifecycle** and the second **Change request**. A confirmed booking shows a one-time acknowledgement as pending; after the canonical status advances it is labelled completed and is not presented as another acknowledgement. The open request card displays Current confirmed booking and Requested change side by side, explains that nothing has changed, and uses **Send my request to TPL Admin review** for Partner-origin requests or **Send Partner review to TPL Admin** for customer-origin requests. Final application remains an authorized Admin decision. Website primary actions are orange; native Mobile revision **bdcec57** retains the approved emerald/gold/white palette while using the same action semantics.

No Backend contract or data changed. SUBMITTED to UNDER_REVIEW remains Partner review only, while booking acknowledgement remains the separate M3A transition. The retained request/booking are not mutated by this presentation deployment.

Verification: Website request contracts pass 4/4, scoped ESLint has zero errors with one pre-existing hook warning, Webpack production build passes 244/244 pages, scoped diff and secret checks pass. Mobile request contract passes 1/1; TypeScript and scoped lint pass; Android Hermes/public-config export produced _expo/static/js/android/entry-19481ea603dd06e966127910466b5aa2.hbc. Existing Development APK/app data and Metro are reused. Website Preview **dpl_5SHP7qpjr6m8iaEHonbbp184gHNf** is READY and assigned only to staging.tplgo.com; staging and production Website health are HTTP 200. Backend, schema, booking/allocation, payment/refund/provider behavior and production are untouched.

**Exact next action:** refresh the authenticated Partner Website booking and confirm orange actions, the separate Booking receipt and Change request cards, and the visible Current confirmed booking versus Requested change comparison. Do not click either action during this read-only check. After confirmation, acknowledge the original booking once only if its card remains Pending, then treat the change request separately.
 TPL Partner Desk — HOTEL-M3B Modification and Cancellation Request Orchestration

## Guided request-flow presentation correction — 2026-09-24

**Checkpoint:** TPL-PARTNER-HOTEL-M3B-20260924-GUIDED-FLOW-03
**Status:** HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING

The authenticated Partner screen correctly blocked a duplicate submission, but booking state, stay-lifecycle acknowledgement, request form, request state and history had equal visual priority. The operator could not quickly tell what happened, what remained unchanged or which action came next.

Website revision **6b72e4b** and Mobile revision **4456512** add one guided flow. When an open request exists, the new-request form is hidden. A four-step tracker shows Prepare → Submitted → Admin review → Booking updated; a dedicated open-request card shows the request reference/state, confirms that the canonical booking is unchanged, states the exact next action, and exposes only eligible Acknowledge-request and Withdraw-request controls. The M3A action is isolated in a separate **Stay lifecycle** panel. Request history and both immutable timelines are secondary reference content instead of competing primary actions. Mobile uses the approved emerald/gold/white palette and the same information order. The existing server eligibility, optimistic version and one-open-request guard remain authoritative.

The existing Partner withdraw endpoint is now available from Website and Mobile with confirmation, current request version and deterministic surface/version idempotency key. Withdrawing closes only the request; it does not change the confirmed booking or allocation. No Backend, schema, finance, payment, refund, provider or external-notification behavior changed.

Verification: Website scoped ESLint has 0 errors (one pre-existing form-reset hook dependency warning), `git diff --check` passes, and the production Webpack build compiled and generated 244/244 pages. Mobile TypeScript, scoped ESLint, focused Jest 1/1 and Android Hermes export pass; bundle `_expo/static/js/android/entry-cd2310b1089594087bde46e550972636.hbc` was produced. Scoped secret checks found no credential material. Website Preview **dpl_8Wmp8sG2broqWo4YxZMhh7SFt97N** is READY and assigned only to `staging.tplgo.com`; final staging and production Website health are 200. The existing Development APK/app data is reused through Metro.

**Exact next action:** refresh the selected staging Partner booking and confirm the open-request card clearly shows **Confirmed booking is unchanged**, request **TPL-MOD-D9853CDA / SUBMITTED**, and **What to do next**, with no duplicate new-request form. Do not click the separate stay-lifecycle acknowledgement. After that read-only confirmation, withdraw the unintended request through **Withdraw this request** as the separate authenticated mutation gate.
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
