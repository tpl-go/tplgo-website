# TPL Partner Desk M2.7B — Hotel Policies and Structured Inclusions/Exclusions

Recorded: 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7B-20260923-01`

Previous status: `M2_7A_G_ADMIN_CONTENT_GOVERNANCE_DYNAMIC_CATALOGUE_STAGING_END_TO_END_PASS`

Current status: **`M2_7B_HOTEL_POLICIES_INCLUSIONS_EXCLUSIONS_STAGING_PARTIAL_ADMIN_REVIEW_PENDING`**

## Authenticated Website create and Mobile read parity — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7B-20260923-02`

Previous status: `M2_7B_HOTEL_POLICIES_INCLUSIONS_EXCLUSIONS_STAGING_PARTIAL_WEBSITE_SAVE_RECHECK_PENDING`

The operator refreshed the corrected Website form, confirmed that it is clean/readable, and used the normal **Save and send for review** action. The UI returned “Saved and sent for TPL content review.” Canonical staging readback is one `pending_review` Hotel policy record, version 1, client surface `website`, check-in 14:00, check-out 11:00, maximum guests per room 2, and zero optional inclusion/exclusion selections. This is consistent with the controlled first flow and with the canonical capacity 8.

The connected existing Development Client then read the same retained synthetic Hotel without a Mobile mutation. Native Services showed `HOTEL_POLICY_PROFILE_V1`, catalogue version 3, Check-in 14:00 / check-out 11:00, 0 included / 0 not included, `Pending Review`, version 1. Android Back returned from the editor to the same scoped synthetic Partner Command Center. Existing APK/app data and API target were preserved.

The capacity/status and policy-form presentation defects are therefore live-closed. Exact next action is normal authorized Admin review of this one pending Hotel policy record. Mobile inclusion/exclusion edit, second review, customer projection and bounded export reconciliation remain open, so M2.7B is not yet PASS.

## Delivered boundary

The completed Content Governance engine now governs the Hotel V1 policy catalogue instead of a separate policy administration system. `HOTEL_POLICY_PROFILE_V1` resolves from stable service/capability metadata. The published bounded catalogue contains 10 policy templates, seven inclusions and six exclusions. Admin publishing makes an option available; it does not apply the option to a Hotel. Partner Hotel configuration remains separately versioned, review-gated and approved-only in the customer projection.

Backend migration `0062_partner_hotel_policies_inclusions.sql` adds the versioned Hotel profile, Partner policy records, structured selections and immutable revisions. Partner Website and native Mobile use the same canonical snapshot/save contract. Admin reuses `partner_content.review` for exact submitted-value review. Customer staging preview and bounded CSV/XLSX/PDF/Print read the approved safe projection only. No price, tax, commission, markup, booking, payment or refund behavior was added.

The controlled Website-first configuration contains check-in/check-out, guest/ID, children/extra guest, pets, smoking, parties, visitors, quiet-hours, deposit disclosure, accessibility assistance and bounded other-rule fields. The inclusion/exclusion catalogue is structured and contradiction-checked. The retained synthetic Hotel, room, inventory capacity 8/version 2, availability 5 of 8/version 2, INR 1,275 base rate/version 2, 14/8 approved amenities, three approved media and unselected Jacuzzi QA option are preserved.

## Staging defect and narrow repair

The first authenticated Website Save returned “Add active room capacity before configuring guest policies.” Read-only canonical staging evidence showed the existing room has capacity 8, service status `active`, and inventory lifecycle `draft`. The policy service incorrectly counted only `active` inventory even though the established inventory contract permits configurable `draft` and `active` rows and rejects `inactive` rows. Backend `88402a6` now uses capacity from `draft` or `active` inventory and continues to reject inactive/missing capacity. The actual-PostgreSQL fixture now reproduces the retained staging lifecycle and passes.

The same live pass exposed overlapping labels/values, weak input borders and undersized typography. Website `501ffd6` adds policy-form-only responsive styling: one-column section flow, two-column desktop control grids, single-column narrow layout, visible 46px controls, explicit borders/focus rings, 14–16px text, clearer grouped cards and touch-friendly checkbox rows. The scoped class prevents unrelated Partner forms from being redesigned.

## Automated evidence

- Actual isolated PostgreSQL Hotel policy suite: **7/7 PASS**, including draft-capacity save, over-capacity denial, read-only/cross-tenant denial, optimistic concurrency, duplicate prevention, mutation/audit rollback, review authority and approved-only projection.
- Website Hotel policy tests: **2/2 PASS**. Scoped TSX ESLint: PASS. Production Webpack build: PASS with 244 static pages.
- Backend TypeScript and production build: PASS. Scoped secret/diff hygiene: PASS.
- Repository-wide Website `tsc --noEmit` remains blocked by previously recorded unrelated Vitest declaration, implicit-any and pre-ES2020 test issues; the scoped tests, lint and production build are authoritative for this repair.
- Mobile policy tests/type/lint/Hermes evidence from the implementation checkpoint remains valid; this repair changed no Mobile source or native dependency.

## Delivery and preservation

Backend commits are `7fb0ff4`, `890d6da` and repair `88402a6`; the active immutable staging release is `/home/tpladmin/tpl-api-releases/partner-m2.7b-capacity-88402a6` on `tpl-api-partner-staging`/4100. Release archive SHA-256 is `be848ddf50b0b607fad841f6cabb26e8e82b47a6322e2d8dd7d15a79519fb6fc`. Staging health is 200.

Website commits are `0dbebaf` and repair `501ffd6`; READY Preview `dpl_2MgPsbqtd2wGAyrnM6Fmzt8s2zFo` (`tplgo-website-5egrfk7ay-tplgo.vercel.app`) is assigned only to `staging.tplgo.com`. Mobile source is `0e9b720`; the existing Development APK/app data and Metro delivery remain in use. No new APK was required.

Protected pre-migration staging backup is `/home/tpladmin/backups/partner-m2.7b-pre-0062-7fb0ff4.dump`, SHA-256 `7c80f803da3c572f6a0dc6f3d59f806826e6dd2060bbc1e8d8cb6e957a4d4c6e`; `pg_restore --list` returned 1,398 entries. Migration 0062 applied only to the staging Partner database. Production PID remained `972721`; production health remained 200. No real Partner, submitted application, unrelated organization, supply/media row, booking, finance, payout, notification or production record changed.

## Live status and exact next action

Authenticated pre-write Mobile observation confirms `HOTEL_POLICY_PROFILE_V1`, catalogue version 3, “No Hotel policies saved yet” and the Add policies destination in the retained synthetic organization. The failed Website request did not create a policy record or selection. The corrected Website layout and corrected Save must now be observed once through the normal authenticated Partner flow. After that, the same pending record must be reconciled on Mobile and Admin, approved through normal Admin review, followed by the Mobile inclusion/exclusion edit, Website/Admin/customer readback and bounded export checks.

The fixed **46 requirements / 213 units** denominator remains unchanged. The register does not yet map every status unit-by-unit without double-counting, so `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain preserved.

M2.7B is not PASS at this checkpoint. Exact next action: refresh the authenticated synthetic Hotel policy screen, confirm the cleaned controls, and retry **Save and send for review** once without changing supply data.
