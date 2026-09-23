# TPL Partner Desk M2.7A — Hotel Content and Property/Room Amenities

## Governance addendum — 2026-09-23

Checkpoint `TPL-PARTNER-M2.7A-G-20260923-01` adds a reusable Admin Content Governance engine without reopening this report's completed **`M2_7A_HOTEL_CONTENT_AND_AMENITIES_STAGING_END_TO_END_PASS`** result. The original Hotel V1 catalogue is now represented by 27 immutable governed PUBLISHED v1 snapshots (15 PROPERTY, 12 ROOM), with the same stable codes, labels, categories, scopes and order. Existing approved property/room content, 14/8 selections, customer projection, media and supply evidence remain unchanged.

Website & Experience now separates Pages, Service Catalogue and Content & Attribute Catalogue. Drafts, review, approval, publication, history and deactivation are server-authorized; drafts and approved-but-unpublished options cannot reach Partner/customer projections, and inactive options cannot be selected anew while historical selections remain reproducible. Backend `4bd6dc6`, Website `61d722f` and Mobile `e6c18c0` are delivered to staging/existing Development Client compatibility. The detailed governance report is `reports/TPL_PARTNER_DESK_M2_7A_G_ADMIN_CONTENT_GOVERNANCE_DYNAMIC_CATALOGUE_REPORT.md`.

Governance status is PARTIAL only for authenticated Admin lifecycle and Website/Mobile/export live observation. No Jacuzzi QA amenity exists yet. The next exact action is a normal staging Admin **Save draft only** for `HOTEL_PROPERTY_JACUZZI_QA`; M2.7B must wait for the complete governed publication/parity gate.

Recorded: 2026-09-23

Checkpoint: `PARTNER_DESK_M2_7A_HOTEL_CONTENT_AMENITIES_E2E_PASS_20260923`

Status: **`M2_7A_HOTEL_CONTENT_AND_AMENITIES_STAGING_END_TO_END_PASS`**

## Scope and preserved baseline

This bounded Hotel-family slice adds descriptive Hotel content and standardized property/room amenities to the retained staging-only synthetic Partner. It reuses the existing Hotel identity, one inventory item, supply state, approved media, review/audit infrastructure and customer Hotel detail projection. It does not implement policies, inclusions/exclusions, meal plans, taxes, commission, markup, offers, final customer pricing, bookings, payments or another capability family.

The completed statuses `M2_6_HOTEL_MEDIA_STAGING_END_TO_END_PASS` and `M2_6A_MEDIA_MODERATION_AUTOMATION_FOUNDATION_STAGING_READY_MANUAL_MODE` remain preserved. Production, real Partners, the submitted application, unrelated organizations, published catalogue entries, inventory capacity, availability, rate and approved media were not changed.

## Canonical content foundation

Migration `0060_partner_hotel_content_amenities` adds a reusable capability-family content model rather than a Hotel-name switch or a separate client store:

`Domain/service capability -> versioned content profile -> standardized amenity catalogue -> Partner selection -> review -> customer-safe projection`.

Only `HOTEL_CONTENT_PROFILE_V1` version 1 is active and tested. Unknown or unconfigured families fail closed. Property and room records use stable organization/service/inventory references, optimistic versions, immutable revisions and audit events. Partner writes use the existing scoped `supply.write` authority; `media.write` alone does not grant content access. A narrow `partner_content.review` permission and `partner_content_reviewer` role separate content review from media review, catalogue publication, Partner activation and finance authority.

Partner text and selections are saved as `pending_review`. The Partner cannot approve its own submission. Approved-only projections feed the existing staging Hotel detail view. A material edit to approved text or amenities returns only that content record to review. Server checks keep property and room scope separate and deny inactive, duplicate, foreign-service and cross-tenant selections.

## Hotel V1 amenity catalogue

The versioned Hotel catalogue contains **27 amenities: 15 PROPERTY and 12 ROOM**.

| Scope | Category | Count |
|---|---|---:|
| Property | Internet | 1 |
| Property | Parking and transport | 1 |
| Property | Food and drink | 1 |
| Property | Wellness and recreation | 1 |
| Property | Business and events | 1 |
| Property | Family services | 1 |
| Property | Accessibility | 2 |
| Property | Safety and security | 2 |
| Property | Cleaning and housekeeping | 1 |
| Property | Reception and guest services | 2 |
| Property | Sustainability | 1 |
| Property | General property features | 1 |
| Room | Bed and sleeping | 2 |
| Room | Bathroom | 1 |
| Room | Climate control | 1 |
| Room | Entertainment | 1 |
| Room | Internet and workspace | 2 |
| Room | Food and beverage equipment | 1 |
| Room | Storage and safety | 1 |
| Room | View and outdoor space | 1 |
| Room | Accessibility | 1 |
| Room | Housekeeping and toiletries | 1 |

Labels are customer-facing, ordered and translation-ready. Selections use stable codes and defined scopes. This slice does not infer free amenities, certification, star rating, charges or custom public amenities.

## Live staging parity

| Flow | Observed result |
|---|---|
| Website property write | The retained synthetic Hotel saved the bounded property description and 14 standardized property amenities through the normal Partner Website flow. The UI showed `Saved and sent for TPL content review`; canonical state became pending review, version 1, Website provenance. |
| Mobile property read | The existing Development Client showed the identical property description, 14 selections, pending status and version 1. |
| Admin property review | Admin provided submitted/approved detail views and an exact-content confirmation. The operator reviewed the property submission and approved it normally. Canonical state became approved, version 2. |
| Customer property projection | The staging Hotel page displayed the approved property description and 14 amenities. Pending content was not used as customer content. |
| Mobile room write | For `Synthetic Deluxe Room — QA Only`, Mobile saved the controlled room description, Queen bed count 1, City view and eight standardized room amenities through the normal native flow. The success message confirmed submission for TPL content review. Canonical state became pending review, version 1, Mobile provenance. |
| Website room read | Website displayed the same room description, structured bed/view values, eight room amenities, linked inventory item and pending state. |
| Admin room review | The operator viewed the exact submitted room details, approved them normally and confirmed the staging Website display. Canonical state became approved, version 2. |
| Customer room projection | The staging Hotel room section displayed only the approved room description and eight linked room amenities. Property amenities did not become room amenities, and room amenities did not become property amenities. |
| Mobile navigation/session | Android Back returned to the scoped Partner Command Center. Background/foreground retained the synthetic organization and approved room state. No new APK was needed. |

Final canonical readback is two active approved content records, 22 amenity selections, four immutable revisions and four content/supply events. The customer projection contains property version 2 with 14 amenities and one room record at version 2 with eight amenities.

## Reports and exports

The bounded supply/content/media reporting path now includes the allowlisted Hotel content fields for property and room scope, safe description status/version, standardized amenity code/label/category/value and safe provenance. CSV/XLSX formula protection and server authorization remain in place. Private contact, identity, document, bank, provider-secret and unrelated Partner data are excluded.

The Website bounded Print view was corrected to print the Hotel content and amenities report rather than the surrounding Admin page. The operator confirmed **CSV, XLSX, PDF and bounded Print are all correct and readable**, including both property and room scope.

## Defects found and fixed

1. The initial content editor inherited a broad `.actions` style, causing overlapping fields, weak checkbox presentation and unreliable submit interaction. The editor now has isolated premium navy/orange/white styles, grouped amenity disclosure, accessible controls, inline validation and an explicit submit form.
2. Selecting the tenth amenity exposed an explicit logout navigation path rather than a content API failure. Dirty-state navigation and logout confirmations were added, navigation controls were made non-submit, and the content values survive safe retry. The operator subsequently completed both submissions.
3. Admin initially offered approval without a useful before/after view. Persistent `View submitted details` and `View approved details` now show descriptions, structured values, scope, amenity labels and version; approval confirms the exact submitted content.
4. The bounded Print report initially omitted Hotel content. It now includes property and room content/amenity sections with readable status/version and no whole-page print.

## Automated evidence

- Actual isolated PostgreSQL 17 content suite: **7/7 PASS**.
- Combined Backend RBAC/export/PostgreSQL evidence: **14/14 PASS**.
- Verified one-winner/stale-loser optimistic concurrency, idempotent selections, scope and tenant denial, atomic mutation/audit rollback, stale review denial, approved-only projection and material-edit return to review.
- Backend TypeScript and production build: PASS.
- Website focused editor/Admin/customer projection/Print tests: PASS; scoped ESLint and Webpack production build: PASS.
- Mobile focused content/API/navigation tests, TypeScript and scoped lint: PASS.
- Android Hermes export/public configuration check: PASS.
- Scoped secret scans and `git diff --check`: PASS; only line-ending notices were observed.

Automated evidence is separate from the operator-observed staging flows above. Mocks were not used as the PostgreSQL concurrency/rollback claim.

## Source and staging delivery

| Surface | Exact evidence |
|---|---|
| Backend | Source `021977a3cdaa0b8148cf3430f74f69485a244d46`; immutable staging release `/home/tpladmin/tpl-api-releases/partner-m2.7a-content-021977a`; only `tpl-api-partner-staging`/4100 changed. Archive SHA-256 `E9F97165EFE6E0D398CBFB6FDAF9E5E951C012C774F4EC8FE381BE73CD8E0C59`. |
| Website/Admin | Runtime source `c0fe85eb00a6b1624d6b3dd7f7fc7880be0c1b9f`; READY deployment `dpl_AV58iLYvRAJe53jPG9ke6AWBBnkh`, assigned only to `staging.tplgo.com`. Earlier scoped deployments are retained as historical evidence. |
| Mobile | Source `9d0b5d5bf9ff34f5ece5a7f7b5e75fed6c9f997a`; existing Development APK/app data and Metro/JS delivery reused. No native dependency or new APK. |

Before migration/mutation, protected backup `/home/tpladmin/backups/partner-m2.7a-pre-0060-021977a.dump` was created. SHA-256 is `66796d48e058878a07f58aa5e4b6fbae9a563b81c5b1bf9a43e7c1fc74c032fd`; `pg_restore --list` returned 1,332 readable entries. Staging health passed. Production port 4000, database, process, aliases and storage remained untouched.

## Program boundary and next step

This PASS closes M2.7A only. Hotel policies, check-in/check-out, guest/child/pet/smoking/party rules, structured inclusions/exclusions, meal plans, cancellation/refund, tax, commission, markup, offers and final customer price remain unavailable and were not inferred.

The fixed denominator remains **46 requirements / 213 units**; no whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain unchanged.

Exact next separate Hotel-only step: **M2.7B — Hotel Policies and Structured Inclusions/Exclusions**. Its entry condition is this retained synthetic Hotel/content state, unchanged approved media and supply state, and a separately bounded policy schema/review decision. M2.7B was not started.
