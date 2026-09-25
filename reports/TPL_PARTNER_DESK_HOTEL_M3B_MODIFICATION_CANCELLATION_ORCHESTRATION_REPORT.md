## HOTEL-M3B Admin request/booking state separation — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-ADMIN-STATE-SEPARATION-20260925-09`

**Status remains:** `HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`

Authenticated Admin feedback showed that raw `SUBMITTED` request state and `PARTNER_ACKNOWLEDGED` booking state appeared together and implied the wrong workflow order. These states are valid but belong to separate aggregates: `SUBMITTED` means TPL received the customer request; `PARTNER_ACKNOWLEDGED` means the Hotel had previously acknowledged the original booking receipt. It does not mean the new request was reviewed.

Website/Admin `9e5bb3f` replaces raw workflow labels with explicit stages: **Customer request received**, **Automatically routed · Hotel response pending** (or overdue/Admin monitoring), and **Original booking receipt acknowledged — separate from this request**. The request card explains that the Admin final decision remains locked until Hotel response. The final decision controls remain server-gated and absent while the request is Submitted. Backend workflow, routing, booking/request state and data are unchanged.

Focused contracts pass 10/10, scoped ESLint and diff checks pass. READY Preview `dpl_9zX8ctuNcjuCwHhjEG6ySDnEURBe` is assigned only to staging; staging and production APIs return 200. No production, finance, allocation, provider or external-delivery change occurred.

**Exact next action:** refresh Admin → synthetic Partner → Bookings → select `TPL-MOD-830F5568`. Confirm the queue/card reads **Customer request received** and **Hotel response pending/overdue**, while booking detail explicitly labels the earlier receipt acknowledgement as separate. Confirm Approve/Reject is unavailable. Do not mutate the request yet.
## HOTEL-M3B immediate Admin intake visibility — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-ADMIN-INTAKE-VISIBILITY-20260925-08`

**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`

Authenticated feedback showed that customer request `TPL-MOD-830F5568` was present in the canonical Backend but not visibly discoverable in Admin; Admin continued to show the previously selected booking/request. The exact cause was presentation filtering: Request history was scoped only to the currently selected booking, with no organization-level open-request intake queue. Backend intake/routing was intact and no request was recreated.

Website/Admin `3874875` adds a bounded **TPL Intake · Immediate Admin Visibility** queue above the booking drill-down. It lists every authorized open `DRAFT`, `SUBMITTED` or `UNDER_REVIEW` request with request reference, booking reference, request type, internal/routing status and the current authority step. Selecting a queue row opens that canonical booking and its scoped detail/history. Customer requests are visible before Hotel response, automatic routing remains server-owned, and only TPL Admin can make the final decision after the required Hotel response.

Focused Website contracts pass 10/10, scoped ESLint and diff checks pass. READY Preview `dpl_B4VYQmML4hVh3Xxqg5x34g6684H2` is assigned only to `staging.tplgo.com`; staging/production APIs return 200 and production code/data remain untouched. Backend, schema, request state, allocation, payment/refund/settlement, provider and external delivery were not changed.

Live Admin readback remains required. **Exact next action:** refresh Admin → selected synthetic Partner → Bookings. In **Open modification & cancellation requests**, confirm `TPL-MOD-830F5568` is visible as a Modification request for `TPL-QA-HOTEL-M3B-MOD-001`, with `SUBMITTED / ESCALATED` and Hotel response pending. Select it to confirm its canonical detail. Do not approve/reject or mutate it yet.

Preserved: completed M2.6–M2.7B-G and HOTEL-M3A statuses; fixed **46 requirements / 213 units**; `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`; `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`. HOTEL-M3C is not started.
## HOTEL-M3B cross-type open-request clarity — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-CROSS-TYPE-REQUEST-CLARITY-20260925-07`

**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`

The operator confirmed the distinct Website Manage Booking and Cancel Booking presentation, then found one remaining ambiguity: while a modification request was open, Cancel Booking correctly blocked a conflicting request but used a generic **open request** message. Because cancellation history is intentionally type-filtered, the wording could make the existing modification appear to be a cancellation.

Website `b9e169b` and Mobile `6e5e5e7` retain the canonical one-open-conflicting-request guard and now name the actual open request type, public reference and customer status. When the opposite flow is opened, the message explains that the new request is blocked to prevent conflicting changes and points to **Manage Booking** or **Cancel Booking** for the matching request. Same-type history remains in its own flow; opposite-type details are not rendered as current-flow history, and the misleading empty-state line is suppressed while a conflict exists. No Backend, booking, request, allocation or financial data changed.

Focused evidence passes: Website request contracts 9/9 plus scoped ESLint and diff check; Mobile request tests 2/2 plus TypeScript, scoped ESLint and diff check. READY Preview `dpl_FBPriXdTArqyjR5q3RSJ7WHwsqva` is assigned only to `staging.tplgo.com`; staging and production Website/API health are 200. Mobile reuses the existing Development APK and healthy Metro; no native dependency/configuration changed. Production, payment/refund/settlement, provider calls and external delivery remain untouched.

Authenticated Website and native Mobile confirmation passed: Customer My Booking → Upcoming → Cancel Booking identifies the existing modification request correctly, keeps modification details out of cancellation history, explains the conflict guard and directs the customer to Manage Booking. No new customer request was submitted during these read-only checks. Canonical readback shows customer request `TPL-MOD-830F5568` remains `SUBMITTED` with routing `ESCALATED`, no Hotel recommendation yet; the same booking remains `PARTNER_ACKNOWLEDGED`, version 4, with its allocation active. The cancellation block is therefore expected. **Exact next action:** Partner Website → Command Center → Bookings → `TPL-QA-HOTEL-M3B-MOD-001` → request `TPL-MOD-830F5568`; choose **Yes · Hotel can support request**, enter the bounded synthetic reason and submit the Hotel response once. Do not acknowledge the booking again and do not make the TPL final decision from Partner. Full cancellation, withdrawal/rejection and export live gates remain pending; HOTEL-M3C is not started.

Preserved: all completed M2.6–M2.7B-G and HOTEL-M3A statuses; fixed **46 requirements / 213 units**; `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`; `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.
## HOTEL-M3B distinct Manage/Cancel presentation and Mobile drill-down — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-DISTINCT-ACTIONS-DRILLDOWN-20260925-06`

**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`

The operator confirmed the preceding Website backend lookup repair: Manage Booking no longer returned **Hotel booking not found**. The next authenticated observation exposed presentation ambiguity: Manage Booking and Cancel Booking opened the same mixed shell/history, while native Mobile rendered the selected request composer below the complete booking list. With several bookings, the active booking and required action were not sufficiently isolated.

Website `cb2da4598a7391dd856e60dbbaa60d0463afe8d8` now uses distinct customer routes and presentations. **Manage Booking** remains `/hotels/manage` and exposes modification-only copy, fields, history and submission. **Cancel Booking** opens the dedicated `/hotels/cancel` route and exposes cancellation-only copy, reason/history and submission. Both surfaces show the same three-stage authority order—customer request, Hotel response, TPL final decision—while retaining the accepted orange Website design. The canonical request API and TPL-final authority are unchanged.

Mobile `d00e61c` replaces the below-list inline forms with a focused selected-booking drill-down. The booking list is hidden while View Detail, Manage Booking or Cancel Booking is open; the selected booking reference, Hotel and current stay remain visible. Manage and Cancel show separate labels, fields, histories and submit actions. **Back to My Bookings** and Android hardware Back restore the booking list. The established emerald/teal, gold and white native palette is preserved.

Automated evidence: Website HOTEL-M3B contracts pass 9/9, changed reusable UI/routes pass scoped ESLint, and the Webpack production build compiles and generates 245/245 pages including `/hotels/cancel`. The legacy manage page retains its pre-existing `any`/effect lint debt and was validated by focused contracts plus the production build; no new lint waiver was added. Mobile booking/API suites pass 21/21, TypeScript, scoped ESLint and diff checks pass. Website Preview `dpl_89UsXqv6tEyXZNH8qTX7kKjd3ytY` is READY and assigned only to `staging.tplgo.com`; existing Development APK/Metro is reused. Staging and production Website/API health are 200.

No Backend, schema, canonical booking/request/allocation, payment, refund, settlement, provider, external-delivery or production mutation occurred. Authenticated visual verification of the new presentation remains pending. **Exact next action:** Customer Website My Booking → Upcoming; open **Manage Booking** and confirm it shows only the modification flow, then return and open **Cancel Booking** and confirm it shows only the cancellation flow. Do not submit either request. Mobile dedicated drill-down is the following read-only gate. Separate cancellation, withdrawal/rejection and export live gates still prevent full HOTEL-M3B PASS. HOTEL-M3C is not started.

Preserved: completed M2.6–M2.7B-G and HOTEL-M3A statuses; fixed **46 requirements / 213 units**; `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`; `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.
## HOTEL-M3B My Booking backend lookup and Mobile action parity — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-MY-BOOKING-ACTION-RECOVERY-20260925-05`

**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`

Authenticated feedback exposed two narrow customer-surface gaps. Website **Manage Booking** and **Cancel Booking** opened the correct routes but resolved the selected booking only from browser-local compatibility storage, so the backend-authoritative synthetic booking produced **Hotel booking not found**. Native Mobile still exposed only **View Booking Detail** and lacked the accepted five booking-card actions.

Website `7a13561d97f6003ad8e7b271fbb7e09e51a31050` now resolves the selected Hotel booking from the authenticated canonical Backend before using the local compatibility fallback. The Manage route uses canonical stay dates and traveller count, and it renders the modification or cancellation request composer even when no legacy rich checkout payload exists. The accepted My Booking information architecture is unchanged: **Download Voucher**, **Share Voucher**, **View Booking Detail**, **Manage Booking** and **Cancel Booking** remain row-level actions; View Booking Detail remains facts/history only.

Mobile `3d7610d` adds the same five actions to Upcoming Hotel booking cards. **Manage Booking** opens only the modification request flow, **Cancel Booking** opens only the cancellation request flow, and **View Booking Detail** remains read-only facts/history. Both request flows use the canonical customer HOTEL-M3B endpoints, server eligibility, duplicate/open-request guards, five-second status refresh and customer withdrawal only where the Backend allows it. The native palette remains emerald/teal with gold accents. No native dependency or configuration changed; the connected Development APK and Metro are reused.

Focused Website tests pass 9/9, scoped ESLint and the 244/244-page production build pass. Focused Mobile suites pass 21/21, with TypeScript, scoped ESLint and diff checks passing. Website Preview `dpl_22FjaKNUsb5cbyWCXdMhxUTKCHfN` is READY and assigned only to `staging.tplgo.com`; staging and production Website/API health are 200. Backend source/release and canonical booking/request/allocation data were not changed by this repair. Production, payment/refund execution, settlement, provider calls and external delivery remain untouched/zero.

Authenticated visual verification of this new delivery remains pending; automated checks are not recorded as UI observation. **Exact next action:** on Customer Website My Booking → Upcoming, open the retained Hotel row and confirm **Manage Booking** opens the modification form and **Cancel Booking** opens the cancellation form without **Hotel booking not found**; do not submit either request. The connected Mobile five-action readback follows as the next read-only check. Separate cancellation, withdrawal/rejection and final export live gates still prevent full HOTEL-M3B PASS. HOTEL-M3C is not started.

Preserved: all completed M2.6–M2.7B-G and HOTEL-M3A statuses; fixed **46 requirements / 213 units**; `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`; `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.
## HOTEL-M3B canonical My Booking lifecycle projection — 2026-09-25

Checkpoint ID: `TPL-PARTNER-HOTEL-M3B-MY-BOOKING-CANONICAL-PROJECTION-20260925-04`

Previous/current status: **`HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`**.

Operator direction is now frozen around the existing customer My Booking information architecture. An active Hotel booking appears once under **Upcoming** with the five existing row actions: **Download Voucher**, **Share Voucher**, **View Detail**, **Manage Booking** and **Cancel Booking**. View Detail is read-only booking facts plus immutable request/lifecycle history. Manage Booking owns only the modification-request composer. Cancel Booking owns only the cancellation-request composer. A final approved modification updates the same canonical booking identity and retains it under Upcoming with revised room/date/guest facts; it does not create a second booking card. A final approved cancellation removes the same booking from Upcoming, places it under Cancelled, and exposes a separate truthful Refund Status. Because HOTEL-M3B executes no refund, that status is **Financial review required/Review pending**, never a fabricated zero refund or completed refund.

The exact defect was a stale `compat_booking_item` account projection after TPL final application. Backend `9093ea24d56a9c4530587958b5889d51af81298b` now overlays canonical booking status, stay dates, travellers, lead guest, cancellation and refund-review metadata when serving My Booking. The final modification transaction also keeps the compatibility snapshot aligned; the cancellation transaction records cancelled account placement and non-financial refund-review state atomically. Website `4eb8c9f` silently refreshes My Booking every five seconds and on focus/visibility/account refresh, preserves the five card actions, keeps View Detail read-only, and renders cancellation/refund review without a misleading INR 0. Mobile `8a8d215` applies the same foreground/five-second canonical readback and safe refund-review presentation through the existing Development Client; no native dependency, APK reinstall or app-data clear is required.

Actual isolated PostgreSQL request-orchestration evidence passes 10/10, including canonical modified-booking projection, cancellation and exactly-once allocation release, concurrent/idempotent decisions, maker-checker/ownership/tenant denial, rollback on injected failure, timeout/reminder/escalation/dead-letter behavior, zero external delivery and unchanged payment state. Website focused tests pass 9/9, scoped ESLint, diff check and the 244-page Webpack production build pass. Mobile focused account API tests pass 19/19 with TypeScript, scoped ESLint and diff checks. Backend TypeScript/build/diff checks pass. No migration or staging data mutation was required for this projection correction, so the existing protected automation checkpoint backup remains applicable.

Staging delivery is Backend release `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-projection-9093ea24d56a9c4530587958b5889d51af81298b` on `tpl-api-partner-staging`/4100 only, archive SHA-256 `94aa05128e773fd814eb487cfa70d93c26e1d07d2469f08bfa684e081bec3fc6`. Website READY deployment `dpl_4KXS1WH5G77hbtRqVYtFTsFWsnGb` is assigned only to `staging.tplgo.com`. Staging API/Website and production API/Website return 200; production process, data, aliases and storage remain untouched. Payment, refund execution, settlement, provider calls and external notifications remain zero/off.

Authenticated visual readback could not be performed by the agent because the supported browser connection failed during setup; no UI PASS is inferred from automated or API evidence. The existing corrected modification must be checked read-only in Upcoming/View Detail, and a separate customer-origin cancellation still must complete TPL intake, automatic Hotel routing, Hotel recommendation and TPL final decision before Cancelled/Refund Status, withdrawal/rejection and final CSV/XLSX/PDF/Print parity can be certified. **Exact next action:** refresh Customer My Booking → Upcoming and confirm the revised booking appears once with the five card actions, revised details and history; do not submit another request. HOTEL-M3C is not started.

Completed M2.6–M2.7B-G and HOTEL-M3A statuses, fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.
## HOTEL-M3B My Booking card action routing — 2026-09-25

Checkpoint ID: `TPL-PARTNER-HOTEL-M3B-CARD-ACTION-ROUTING-20260925-03`

Current status remains **`HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`**. This checkpoint supersedes only the preceding proposal to expose **Open Manage Booking** inside View Details; its polling/duplicate-action correction remains valid.

The authoritative customer entry points are the existing actions beside each My Booking row. **View Detail** now contains request status/history only and no Manage action. **Manage Booking** opens the fixed Modification request flow. **Cancel Booking** opens the fixed Cancellation request flow. Hotel cancellation no longer invokes the legacy immediate-cancel/refund-estimate modal; other service types retain their existing behavior. The request-type selector is removed so each card action has one unambiguous purpose. TPL remains final authority and the confirmed booking is unchanged until the request is approved and applied.

Website `a63d1dca5b642c048d9afdde7525657c024d161d` passes the focused routing/request contract 5/5, scoped changed-component lint, diff/secret checks and the 244-page production build. READY deployment `dpl_mCjW5V1VcQvC8kmp8Y3QNYurT22s` is assigned only to `staging.tplgo.com`. No request was resubmitted; Backend, Mobile, APK, booking/request/allocation data, payment/refund/provider delivery and production are unchanged.

Authenticated read-only routing confirmation remains pending. Exact next action: refresh My Booking for the existing Hotel row; confirm View Detail has no Manage button, Manage Booking opens Modification request, and Cancel Booking opens Cancellation request. Do not submit either request during this routing check. HOTEL-M3C is not started.
## HOTEL-M3B customer Manage Booking placement and single-action state — 2026-09-25

Checkpoint ID: `TPL-PARTNER-HOTEL-M3B-CUSTOMER-MANAGE-ROUTING-20260925-02`

Current status remains **`HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`**.

Authenticated customer feedback identified two narrow presentation defects after the corrected customer-origin submission: the five-second status poll reused the mutation busy state, so the button repeatedly showed **Working** while the retained success notice still showed **Request submitted**; and the modification/cancellation composer appeared inside My Booking **View Details** instead of the established **Manage Booking** flow.

Website `c20056748a9ca0dc5038a2f8a4ce722883dce9fd` separates initial/background loading from submit/withdraw mutation state. Silent polling no longer changes the action button, an open request suppresses the second composer/submit action, and submission success is shown once. My Booking View Details is now read-only request status/history with an orange **Open Manage Booking** action. The composer and eligible withdraw control are located under Manage Booking → **Change / Cancel Request**. The already-submitted customer request was neither recreated nor mutated.

Focused request contracts pass 5/5, scoped lint for the changed reusable component/layout/test passes, scoped secret and diff checks pass, and the production Webpack build compiles and generates 244/244 pages. Repository-wide standalone TypeScript remains affected only by the recorded pre-existing Vitest declaration/lower-target BigInt errors; the production build validates the changed routes. READY Preview `dpl_HfGqrUFx66NAZoYbkPxzUS3CW6Fa` is assigned only to `staging.tplgo.com`. Staging and production Websites return HTTP 200; production alias/code/data are untouched. Backend `9297fc3`, Mobile `1103877`, database, allocation, payment/refund/provider/external delivery and APK are unchanged.

Authenticated visual confirmation remains pending. Exact next action: refresh the existing submitted booking, confirm **View Details** shows only request status/history plus **Open Manage Booking**, then open Manage Booking → **Change / Cancel Request** and confirm the submitted request appears once without periodic **Working** flashes or a second submit action. Do not submit again. HOTEL-M3C is not started.
## HOTEL-M3B corrected routing automation checkpoint — 2026-09-25

Checkpoint ID: `TPL-PARTNER-HOTEL-M3B-AUTOMATION-READY-20260925-01`

Previous status: `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_CUSTOMER_CANCELLATION_WITHDRAWAL_LIVE_PENDING`

Current status: **`HOTEL_M3B_MODIFICATION_CANCELLATION_AUTOMATION_READY_STAGING_PARTIAL_CORRECTED_LIVE_FLOWS_PENDING`**

This narrow delta preserves the accepted M3B screens and enforces the corrected authority order: Customer submission -> TPL eligibility/intake and immediate Admin visibility -> automatic Hotel routing -> bounded Hotel Yes/No recommendation -> TPL-only final decision/application -> customer status. Partner create/withdraw/final-decision routes remain denied. Historical request `TPL-MOD-F1658BA6`, whose requester type is PARTNER, is retained as **pre-policy historical QA evidence** and was not rewritten.

Backend commit `9297fc39622183a22188f3a8b72f6e3a6de31f28` adds migration `0065`, correlation/routing timestamps, a durable idempotent job table, retry/backoff, dead-letter state, reminder/SLA escalation, manual/assisted/auto guard seams, provider `NONE`, auto decision Off, safe polling-driven queue advancement, TPL-final decision enforcement, customer status mapping and guarded cleanup preview. Existing 0063/0064 schemas were verified by exact table/index/RLS/file-hash parity before their previously missing migration-journal entries were reconciled atomically; 0065 then applied. Runtime is `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-automation-9297fc3-r2` on staging port 4100 only. Archive SHA-256 is `bae896c32988458c7534fbc9b0691a24f4c7fb075224cbb1f0199fe4dfa39d13`.

Protected backup `/home/tpladmin/backups/partner-hotel-m3b-automation-9297fc3-r2-pre-0065.dump` has SHA-256 `451b91b7daf00da22273f2281684b371e1a4bea2099e09b48f11a508d7b6b5b1`; `pg_restore --list` returned 1,475 entries. Staging and production Website/API health are 200. Production PID/restarts and production data/configuration/aliases remain unchanged.

Website commit `a7ca44041e440eb02de3b22a96e457f91d6f257e` is READY deployment `dpl_CQkzPQHUKJiS8SpU56VDT9uGCdP2`, assigned only to `staging.tplgo.com`. Mobile commit `1103877` uses the connected existing Development APK and Metro 8081; no native dependency/configuration or APK change occurred. Website styling remains the accepted orange treatment; Mobile retains emerald/gold.

Automated evidence is separate from live evidence: actual isolated PostgreSQL passes 10/10, including immediate routing under five seconds, Admin-visible committed state, concurrent final decision, exactly-once allocation/release, rollback, retry, duplicate-event prevention, reminder/escalation, dead-letter and cleanup guards. Backend export passes 2/2, typecheck/build/diff/secret checks pass; Website focused tests pass 7/7 with scoped lint and 244-page Webpack build; Mobile focused tests pass 3/3 with TypeScript/scoped lint/Hermes-public-config unchanged. External provider, SMS, WhatsApp, email, CRM, payment, refund and settlement execution remain zero/off.

Guarded fixture service created only the missing fictional `TPL-QA-HOTEL-M3B-CAN-001` and `TPL-QA-HOTEL-M3B-WD-001`; retained `TPL-QA-HOTEL-M3B-MOD-001` was not recreated. Availability is now 2/8, version 7, reflecting exactly the two new allocations. Cleanup remains preview-only by default, refuses production/non-synthetic data and requires a fresh verified backup plus explicit execute flag. Final cleanup was not run.

Authenticated corrected live flows, measured cross-surface propagation, customer withdrawal, rejection, timeout/escalation observation and post-flow CSV/XLSX/PDF/Print reconciliation remain pending. Exact next action: Customer Website -> My Booking -> `TPL-QA-HOTEL-M3B-MOD-001` -> submit one bounded modification request. Do not use Partner Desk to create it and do not approve it yet.
# TPL Partner Desk — HOTEL-M3B Modification and Cancellation Request Orchestration
## Customer-only Website/Mobile presentation pass — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-CUSTOMER-ONLY-PRESENTATION-PASS-16`
**Previous status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_MOBILE_UPDATED_RECHECK_PENDING`
**New status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_CUSTOMER_CANCELLATION_WITHDRAWAL_LIVE_PENDING`

The operator confirmed the connected native Mobile app now shows the terminal approved request correctly: Customer sent, Hotel review, Admin decision and Updated are complete, and the approved summary is current. The earlier authenticated Website customer-only presentation also passed. Partner Website and Mobile expose no request Submit or Withdraw authority; the Hotel retains read/review only.

This closes the Mobile refresh/progress presentation defect at source `baff777252a5a3cdd358876623e2d9a50922d936` without a new APK. Existing Backend and Website releases, canonical booking/request/allocation data, payment state, external delivery and production remain unchanged. HOTEL-M3B is not marked full PASS because separate customer-origin cancellation and withdrawn/rejected live scenarios plus their final cross-surface/export reconciliation remain outstanding.

**Exact next bounded HOTEL-M3B step:** prepare one separate guarded cancellation fixture, then create its request only from customer My Booking and progress it Hotel review → Admin decision. Keep the Partner request composer unavailable. Do not start HOTEL-M3C.

## Mobile final Updated-step completion repair — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-MOBILE-UPDATED-COMPLETION-15`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_MOBILE_UPDATED_RECHECK_PENDING`

Authenticated operator feedback showed that Mobile request progress was correct through **Admin decision**, while the fourth **Updated** step still looked unchanged. The request endpoint already returns `Cache-Control: private, no-store`; the remaining defect was the progress renderer: terminal `APPROVED` selected the fourth step as current rather than marking all four steps complete.

Mobile `baff777252a5a3cdd358876623e2d9a50922d936` maps terminal `APPROVED` beyond the fourth index so Customer sent, Hotel review, Admin decision and Updated all render completed. Completed labels now use the established emerald emphasis. Focused Jest passes 3/3; TypeScript, scoped ESLint and diff checks pass. Existing APK/app data and Metro are reused; no Backend, Website, database, finance, provider, external-delivery or production change occurred.

**Exact next action:** refresh the connected app once and confirm the fourth **Updated** step is also completed/emerald and the terminal summary remains **Latest customer request: APPROVED**. Do not perform another stay action. HOTEL-M3C is not started.

## Mobile approved-request status refresh repair — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-MOBILE-REQUEST-STATUS-REFRESH-14`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_MOBILE_STATUS_RECHECK_PENDING`

The operator authenticated Website check passed: the Partner Website correctly shows the customer-only request boundary and does not expose Partner modification/cancellation submission or withdrawal. On native Mobile, the canonical booking update was visible after Admin approval, but the request panel did not advance its displayed status.

The defect was isolated to Mobile presentation and refresh behavior. The request panel loaded its request snapshot only when mounted, and its progress mapper treated the absence of an open request as the Admin-decision stage even when the newest retained request was terminal `APPROVED`. Mobile commit `bb942014db12fcf74494006867def5cde146e031` now reloads request status on foreground, every 15 seconds while active, and through an explicit **Refresh request status** action. It selects the newest canonical request, maps `SUBMITTED → Hotel review`, `UNDER_REVIEW → Admin decision`, and `APPROVED → Updated`, and shows a terminal summary stating that Admin approved and applied the request.

Focused Jest passes 3/3, including terminal-stage mapping and newest-request selection; TypeScript, scoped ESLint and `git diff --check` pass. The existing Development APK/app data are retained. Metro is running and serves this JS update; no native dependency/configuration changed. Backend `e46336f`, Website `189921f`, their staging deployments, canonical data, allocation, finance and production were not changed by this repair.

**Exact next action:** in the connected Mobile app open `TPL-QA-HOTEL-M3B-MOD-001` → Modification & cancellation, tap **Refresh request status** once, and confirm **Latest customer request: APPROVED** with the progress tracker on **Updated**. Confirm that no Partner Submit modification, Submit cancellation or Withdraw control is present. Do not perform another stay action. HOTEL-M3C is not started.

Completed M2.6–M2.7B-G and HOTEL-M3A statuses, fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.

## Customer-only modification/cancellation request authority — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-CUSTOMER-ONLY-REQUEST-AUTHORITY-13`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

Operator direction is now enforced as a server-authoritative boundary: only the owning customer may create, submit or withdraw a Hotel modification/cancellation request through My Booking. The Hotel Partner may read an incoming customer request and send its operational review to TPL Admin; Admin remains the final decision authority. Partner Website and native Mobile no longer expose request creation or withdrawal controls. Direct Partner create, submit and withdraw routes return HTTP 403 `HOTEL_REQUEST_CUSTOMER_ONLY`, even if legacy staging metadata still contains the old submit grant.

The retained approved request `TPL-MOD-F1658BA6` is immutable pre-policy history and remains labelled with its historical requester provenance; it was not recreated, deleted or rewritten. Canonical readback remains booking `TPL-QA-HOTEL-M3B-MOD-001` at `PARTNER_ACKNOWLEDGED` version 4, request `APPROVED` version 3, one allocated room and availability 4/8/version 6. The duplicate acknowledgement guard remains canonical: this booking version exposes Ready for check-in, not Acknowledge.

Actual isolated PostgreSQL request-orchestration tests pass 9/9, including customer ownership, Partner create/submit/withdraw denial, Hotel review, maker-checker decision, optimistic concurrency, idempotency, audit rollback, allocation safety, unchanged payment and internal-only outbox. Backend export tests pass 2/2, TypeScript/build/diff/secret checks pass. Website focused contracts pass 7/7, scoped ESLint, 244-page production build and diff pass. Mobile focused tests pass 2/2, TypeScript, scoped ESLint, Hermes/public-config and diff checks pass. Repository-wide Website `tsc --noEmit` remains affected by pre-existing test-declaration/BigInt target errors outside this scoped change; the production build compiles the changed surface.

Backend source commits are `12619782c2600e80e96ff0915ab6cf3659c5238d` and final tightening `e46336f9d9dfac7f46fff87fd95891bb48d4627c`. Staging release `/home/tpladmin/tpl-api-releases/partner-hotel-m3b-drilldown-e46336f9d9dfac7f46fff87fd95891bb48d4627c`, archive SHA-256 `8e068257c258f365849a5f2663a51f26d74a77c46b402845dbadc72b663fb4d8`, runs only as `tpl-api-partner-staging` on port 4100. Website `189921f` is READY deployment `dpl_6yTBsFxMqmstQZ93decuEo8Y7tHg` assigned only to `staging.tplgo.com`. Mobile `f6b24e0` uses the existing Development APK and Metro; no rebuild, reinstall or app-data clear occurred.

Fresh protected staging backup `/home/tpladmin/backups/tpl-partner-hotel-m3b-drilldown-pre-20260925T034844Z.dump`, SHA-256 `692bf1d959968552842a3283cdfd5fc65794dd4056845d7150121b7b244395cf`, passed `pg_restore --list` with 1,475 entries. A deployment-helper compatibility defect reported a false post-switch failure because programmatic PM2 did not support `call('save')`; the staging helper was narrowed to the PM2 CLI save path and the final deployment completed cleanly. Staging and production APIs return 200, the production PID remains unchanged, and no payment, refund, settlement, provider or external notification action occurred.

Authenticated Website and Mobile presentation remains the only open gate. The in-app browser could not initialize in this environment and local ADB is unavailable, so no visual PASS is inferred from API/source evidence. **Exact next action:** on staging Partner Website and the connected Mobile app, open `TPL-QA-HOTEL-M3B-MOD-001` → Modification & cancellation and confirm that it says no customer request is open/customer must use My Booking, with no Partner Submit modification, Submit cancellation or Withdraw action. Do not click a stay action during this read-only check. HOTEL-M3C is not started.

Completed M2.6–M2.7B-G and HOTEL-M3A statuses, fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.

## Revised-booking acknowledgement completed — 2026-09-25

**Checkpoint:** `TPL-PARTNER-HOTEL-M3B-20260925-REVISED-ACKNOWLEDGED-12`
**Previous/current status:** `HOTEL_M3B_MODIFICATION_CANCELLATION_ORCHESTRATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_FLOW_PENDING`

The operator used **Acknowledge revised booking** once. Canonical PostgreSQL readback shows booking `TPL-QA-HOTEL-M3B-MOD-001` is now `PARTNER_ACKNOWLEDGED` version 4 with `acknowledged=true`; request `TPL-MOD-F1658BA6` remains terminal `APPROVED` version 3. Revised dates 2026-10-02 through 2026-10-03, one adult, zero children, one allocated room and availability 4/8/version 6 remain unchanged.

The immutable timeline contains exactly two acknowledgement events for two different confirmed booking versions: original receipt at version 2, then revised receipt at version 4 after Admin applied the modification at version 3. This is intentional version receipt, not repeated acknowledgement of one version. The server transition matrix exposes `ACKNOWLEDGE` only from `CONFIRMED`; from `PARTNER_ACKNOWLEDGED` it exposes `MARK_READY` (and time-gated no-show), so a duplicate acknowledgement is rejected even if a stale client button were replayed. The Website labels the second receipt as revised and derives the next guidance from canonical status.

Five related internal outbox rows exist with zero external delivery. Allocation, payment `TEST_NO_PAYMENT`, finance, provider and production state are unchanged; staging and production APIs remain 200. No source, deployment or APK changed after the prior Website `2cb7113` / READY `dpl_9hASsLsMaTFT1k9F8G59mkcufnaQ`.

**Exact next action:** refresh the Partner Website booking once and confirm the acknowledgement action is absent and **Mark ready for check-in** is the only primary stay action. Do not click Mark ready in this read-only confirmation. HOTEL-M3C is not started.

Completed statuses and fixed **46 requirements / 213 units**, `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.
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
