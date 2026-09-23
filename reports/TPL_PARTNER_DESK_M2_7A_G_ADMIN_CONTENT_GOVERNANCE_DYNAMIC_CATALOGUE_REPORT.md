# TPL Partner Desk M2.7A-G — Admin Content Governance and Dynamic Catalogue

Recorded: 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-11`

Status: **`M2_7A_G_ADMIN_CONTENT_GOVERNANCE_DYNAMIC_CATALOGUE_STAGING_END_TO_END_PASS`**

Previous status: `M2_7A_HOTEL_CONTENT_AND_AMENITIES_STAGING_END_TO_END_PASS`

## Documentation status boundary — 2026-09-23

The PASS checkpoint above is authoritative. Checkpoints `TPL-PARTNER-M2.7A-G-20260923-01` through `-10`, including every PARTIAL, pending, blocker and next-action statement inside those checkpoint sections, are **Historical/Superseded**. They remain below as genuine chronological evidence and must not be read as current blockers. M2.7B reuses the completed governance engine; it does not reopen M2.7A-G.

M2.7B reused this engine for governed Hotel policy templates, inclusions and exclusions and closed at `TPL-PARTNER-M2.7B-20260924-05` with `M2_7B_HOTEL_POLICIES_INCLUSIONS_EXCLUSIONS_STAGING_END_TO_END_PASS`. This completed M2.7A-G status and its retained catalogue evidence remain unchanged.

## End-to-end staging closure — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-11`

The operator re-downloaded the repaired authenticated governance PDF and confirmed that it is now clear and readable. This closes the final M2.7A-G live gate and advances the slice to **`M2_7A_G_ADMIN_CONTENT_GOVERNANCE_DYNAMIC_CATALOGUE_STAGING_END_TO_END_PASS`**.

The complete authenticated lifecycle is observed through normal staging UI: draft save, private-draft exclusion, submit for review, explicit approval without publication, explicit publication, Website/Mobile dynamic catalogue read, unselected state on both Partner clients, and customer Hotel non-appearance. The separately identified QA proof is `HOTEL_PROPERTY_JACUZZI_QA`; current catalogue version 2 contains 28 published options (16 PROPERTY / 12 ROOM), while the retained original baseline remains 27 (15 PROPERTY / 12 ROOM). Publishing the option did not claim that the Hotel offers it.

Governance CSV, XLSX, repaired PDF and bounded Print are operator-confirmed readable. Actual PostgreSQL governance tests remain 6/6, including optimistic-concurrency winner/stale loser, publication rollback, immutable history, safe deactivation and deterministic scoped outbox behavior. Focused PDF pagination passes 1/1; Backend typecheck/build and scoped diff checks pass. Narrow catalogue read/write/review/publish RBAC remains separate from Partner, media, content, finance and lifecycle authority.

Final staging delivery is Backend runtime source `779f701` in `/home/tpladmin/tpl-api-releases/partner-m2.7ag-pdf-779f701`; Website feature source `177929f` in READY deployment `dpl_9kHN7BWMcEv4V5NvPwqK3AxB3L67` assigned only to `staging.tplgo.com`; Mobile `e6c18c099c54cc299d12748e0c41495da929fcdd` uses the existing Development APK. No new APK was required. Staging and untouched production health are 200. M2.7A, M2.6 and M2.6A completed statuses remain preserved.

The next separate Hotel-only step, **M2.7B — Hotel Policies and Structured Inclusions/Exclusions**, can begin using this governance engine. It was not started here. Taxes, commission, markup, discounts, final pricing, bookings and other capability families remain outside this closure.

## Customer exclusion and PDF readability repair — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-10`

The operator refreshed the customer-facing staging Hotel detail and confirmed that Jacuzzi is not shown. This closes the critical catalogue-availability versus Hotel-selection boundary: the option is published for Partner selection, remains unselected, and does not automatically become a customer facility. The operator also confirmed the governed CSV, XLSX and bounded Print outputs are correct and readable.

The downloaded PDF was not acceptable: all fields were compressed into pipe-separated lines, making the report appear overmeshed and difficult to understand. Backend `779f701` replaces that dense rendering with a three-page landscape report containing a repeated navy title/context header, explicit Amenity, Applicability, Classification, Lifecycle/Workflow and Version/Usage columns, wrapped labels and stable codes, alternating row backgrounds, page-safe breaks and a bounded footer. No exported field scope or authorization changed.

Focused PDF pagination coverage passes 1/1, Backend typecheck and production build pass, and `git diff --check` passes. The generated 28-option QA report was visually rendered in the local Chrome PDF viewer: pages 1 and 3 and all page thumbnails show aligned columns, readable wrapping, consistent repeated headers, no overlap/clipping and page 1-of-3 through 3-of-3 footers. Exact archive SHA-256 is `ada869b15ead8ffb1267a8bf67b33fcfbb61a10939efc49427de3ad0da133757`.

Staging-only Backend release is `/home/tpladmin/tpl-api-releases/partner-m2.7ag-pdf-779f701`, running as `tpl-api-partner-staging` on port 4100. Staging and untouched production health are 200; canonical catalogue remains version 2 with 28 published entries and one active QA option. Website, Mobile and APK did not change. The only remaining M2.7A-G live gate is operator re-download and readability confirmation for the repaired authenticated PDF.

## Partner Website and Mobile catalogue parity continuation — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-09`

After publication, the operator refreshed the retained synthetic Hotel on both staging Partner Website and the existing native Mobile app. Both surfaces displayed **Jacuzzi — QA catalogue option** in the Property amenity selector and both showed it unselected. No Save or content submission occurred. This is observed cross-client proof that both clients consume the canonical published catalogue rather than separate hardcoded option lists.

Canonical readback remains published catalogue version 2 with 28 PUBLISHED governed entries, one active QA amenity row and 16 PROPERTY / 12 ROOM options. Staging and untouched production health remain 200. Existing approved Hotel selection and customer projection were not mutated by this read-only check. Remaining live gates are explicit customer-page non-appearance and bounded CSV/XLSX/PDF/Print reconciliation.

## Authenticated publication continuation — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-08`

The authorized staging publisher selected **Publish approved version** for `HOTEL_PROPERTY_JACUZZI_QA` through the normal governance UI. The UI confirmed that Partner clients can now read the catalogue option. Canonical readback confirms active published catalogue version 2, 28 governed PUBLISHED versions, one active QA amenity row, and the current selectable split of 16 PROPERTY / 12 ROOM. The retained original baseline remains separately identified as 27 entries (15 PROPERTY / 12 ROOM); no original stable code, scope or meaning was replaced.

Publication makes the standardized option available for Partner selection; it does not assert that the retained synthetic Hotel offers Jacuzzi and does not itself alter approved Hotel selections or customer content. Staging and untouched production API health remain 200. Source, deployment, Mobile bundle and APK are unchanged. Remaining live gates are Website/Mobile catalogue-version and option parity, explicit unselected state, customer non-appearance, and bounded export/readability checks.

## Authenticated approval continuation — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-07`

The authorized staging Admin approved `HOTEL_PROPERTY_JACUZZI_QA` through the normal review panel. The UI explicitly confirmed that the item is approved but still not published. Canonical readback agrees: workflow `APPROVED`, entity version 1, row version 3, no published entity version, published catalogue version 1 and zero active QA amenity rows.

This live observation proves that review approval does not implicitly publish catalogue content. The original selectable catalogue remains 27 amenities (15 PROPERTY / 12 ROOM), so the approved-but-unpublished Jacuzzi option remains absent from Partner Website, native Mobile and customer Hotel projections. Staging and untouched production API health remain 200. No source, deployment, Mobile bundle, APK or schema changed. The exact next governed action is one explicit **Publish approved version** action followed by canonical and cross-client reconciliation.

## Authenticated submit-for-review continuation — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-06`

The operator opened the retained `HOTEL_PROPERTY_JACUZZI_QA` draft in the normal staging Admin governance flow and selected **Submit for approval**. The UI reported that submission for approval review succeeded. Read-only canonical reconciliation confirms version 1 moved from `DRAFT` to `IN_REVIEW` and row version advanced from 1 to 2. No API, SQL or test-only shortcut performed the transition.

Publication boundaries remain intact: the entity has no published version, the active published catalogue remains version 1, the QA amenity has zero active canonical rows, and the selectable baseline remains exactly 27 original amenities (15 PROPERTY / 12 ROOM). Staging and untouched production API health both return 200. Approval and publication have not occurred; Jacuzzi therefore remains absent from Partner Website, Mobile and customer Hotel projections.

No source, deployment, Mobile bundle, APK or database schema changed in this continuation. Current delivery remains Backend `4bd6dc68f816bd4d26562f52dd0068ba9c30d4dd`, Website feature source `177929f` in READY deployment `dpl_9kHN7BWMcEv4V5NvPwqK3AxB3L67` on staging only, and Mobile `e6c18c099c54cc299d12748e0c41495da929fcdd` with the existing APK. The next governed action is one authorized approval through the existing review panel; publication remains a separate subsequent action.

## Draft-exclusion pass and second contrast correction — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-03`

The operator completed the requested read-only selector check and reported that Jacuzzi is not present while the governance entry remains a private draft. This matches canonical state: catalogue version 1, zero active QA amenity rows and no Hotel selection mutation. Draft exclusion is therefore observed without claiming publication or customer offering.

The first count-card contrast correction did not solve the live presentation and made the text appear more faded. The narrow second correction removes the white/light card treatment and uses explicit inline colors that are not dependent on theme utility resolution: solid navy `#071426`, two-pixel orange `#f59e0b` border, opaque orange 16px labels and opaque pure-white 30px bold values. Website source is `f07dd05`. Focused tests remain 6/6, scoped ESLint and `git diff --check` pass, and the clean 244-route Webpack build passes.

The exact Vercel Git build for `f07dd05` passed and READY Preview `dpl_C7QqPR2uwHLCWM7dMCzaMUycBusZ` (`tplgo-website-41fc4b1wo-tplgo.vercel.app`) is assigned only to `staging.tplgo.com`. Backend, Mobile, APK and catalogue/database state did not change. The only immediate live gate is a refreshed Admin readability observation; review/approval/publication remain unrun.

### Compact typography continuation

Checkpoint `TPL-PARTNER-M2.7A-G-20260923-04` records that the operator accepted the contrast/readability but found the metric typography oversized. Website `d27d3eb` retains the opaque navy/orange/white treatment while reducing labels from 16px to 14px and values from 30px to 24px. Focused tests remain 6/6, scoped lint/diff and the 244-route Webpack build pass. Exact READY Preview `dpl_6hi9JXKX3UGLJuFCwF1EVMcwhwEy` is assigned only to staging. No governance or Partner data changed; compact-size live recheck remains pending.

### Saved-draft workflow continuation

Checkpoint `TPL-PARTNER-M2.7A-G-20260923-05` adds the requested same-screen continuation. Website `177929f` loads up to 20 private DRAFT items independently from catalogue search/filter state, presents them in a dedicated **Saved drafts** section and opens a selected draft in the existing detail-first workflow. The panel shows the Draft → Review → Approve → Publish sequence and exposes **Edit draft** plus **Submit for approval** according to existing server permissions. It reuses the same canonical entity and endpoints; no second workflow or data copy was added.

Focused governance tests pass 7/7, scoped lint/diff and the 244-route Webpack build pass. Exact Vercel Git build is READY in `dpl_9kHN7BWMcEv4V5NvPwqK3AxB3L67`, assigned only to staging. The retained QA draft remains DRAFT; this UI delivery did not submit, approve or publish it. Operator live recheck is pending.

## Draft-save and contrast continuation — 2026-09-23

Checkpoint: `TPL-PARTNER-M2.7A-G-20260923-02`

The operator used the normal authenticated staging Admin UI and saved the prepared `HOTEL_PROPERTY_JACUZZI_QA` entry as a draft. Read-only canonical reconciliation confirms entity version 1, workflow `DRAFT`, row version 1, no published entity version and zero active canonical amenity rows for that stable code. The active catalogue remains version 1. Governed version totals are now 28 = 27 retained PUBLISHED snapshots + 1 private DRAFT; the canonical selectable Hotel catalogue remains exactly 27 options, 15 PROPERTY and 12 ROOM. Staging and untouched production API health returned 200.

The operator also identified a genuine presentation defect: the four catalogue summary cards used small, low-contrast labels and values that appeared faded. Website commit `a160406` changes those cards to explicit high-contrast slate labels, larger bold navy values, a visible border and a clean white surface. Focused governance tests now pass 6/6, scoped ESLint passes, `git diff --check` passes and the 244-route Webpack production build passes. The first local Turbopack attempt produced no progress after its compile start and was boundedly stopped; the exact Vercel Git build for `a160406` passed in 22 seconds.

The correction is deployed only to staging in READY Preview `dpl_8N4T9prSXosiZiYw657HFF5S9nyx` (`tplgo-website-2tdlrwd78-tplgo.vercel.app`), and `staging.tplgo.com` resolves to that exact deployment. No Backend/Mobile/native dependency or APK change was required. Exact live gates now pending are: operator confirmation that the refreshed summary counts are clearly readable, and read-only Website/Mobile confirmation that the private draft is absent from Partner selectors. Submit for Review, approval and publication have not occurred.

## Outcome and evidence boundary

The reusable Content Governance engine is implemented, tested, committed, pushed and deployed to staging. It adopts the existing Hotel amenity catalogue without changing its stable codes, meanings, scopes, labels or ordering. The Admin interface is delivered under **Website & Experience → Content & Attribute Catalogue** and provides bounded list/filter, draft editing, review, publication, lifecycle, impact, history and export controls.

This checkpoint remains PARTIAL because the authenticated staging Admin Review → Approve → Publish flow and cross-client catalogue visibility have not yet been observed. The initial draft creation has now passed through the normal Admin UI. No API or database shortcut was used to create or publish it. M2.7A remains PASS and its retained Hotel selections remain unchanged.

## Reused architecture and information boundaries

The implementation reuses the established Admin authentication, RBAC, audit/event patterns, Website & Experience shell, canonical Hotel content tables, capability-family mapping, Partner catalogue reads, customer-safe projection and export utilities.

The Admin information architecture now makes the authority boundary explicit:

- **Pages** remains the editorial/SEO page-content workflow.
- **Service Catalogue** remains the Domain/Service lifecycle and capability authority.
- **Content & Attribute Catalogue** governs amenities and structured options.
- **Review & Publishing** exposes the governed approval/publication queue inside the same engine.
- **Version History** exposes immutable governed versions and event history.
- Future Policy Templates, Inclusions and Exclusions are represented only as truthful `Not configured` capability boundaries. They are not active modules.

An amenity cannot create or mutate a Service, and it is not stored as page JSON. Stable codes and server-side entity types drive behavior; clients do not switch on Hotel display names.

## Canonical governance model

Additive migration `0061_partner_content_governance` adds:

- `partner.content_governance_catalogues`
- `partner.content_governance_entities`
- `partner.content_governance_versions`
- `partner.content_governance_events`
- `partner.content_governance_outbox`
- governed lifecycle/version references on the existing `partner.amenity_catalogue`

The model supports stable entity codes, versioned draft payloads, family/service applicability, strict PROPERTY/ROOM scope, category, value type/options, translation state, display order, icon reference, effective dates, lifecycle, actor provenance, optimistic versions and bounded usage counts. Published snapshots are immutable. A published stable code cannot be silently repurposed; later changes use a new governed version.

The implemented lifecycle is:

`DRAFT → IN_REVIEW → APPROVED → PUBLISHED`

with bounded `CHANGES_REQUESTED`, `REJECTED`, new-version, `DEPRECATED` and `INACTIVE` paths. Approval alone does not expose the option. Publication atomically activates the intended version, updates the canonical amenity projection, increments the published catalogue version, appends audit/history and emits a deterministic scoped outbox event. Draft and approved-but-unpublished versions remain absent from Partner and customer projections.

Deactivation is not deletion. Inactive entries cannot be newly selected, while historical approved selections remain resolvable through their retained published meaning. Admin sees bounded usage and impact before lifecycle changes. No all-Partner scan or hard delete is used.

## RBAC and authorization

The narrow permissions are:

- `website_experience.catalogue.read`
- `website_experience.catalogue.write`
- `website_experience.catalogue.review`
- `website_experience.catalogue.publish`

Narrow editor, reviewer and publisher role mappings were added without creating an employee account. Partner membership, `partner_content.review`, `partner_media.review`, finance and settlement permissions do not grant catalogue authority. Server routes enforce the permission at every read/write/review/publish boundary; hidden controls are not the security boundary. Submitted drafts require reviewer separation under the existing policy, with the bounded staging super-admin exception requiring an explicit separation reason. Cross-tenant, Partner and unauthorized Admin mutation paths fail closed.

## Existing 27-amenity adoption

Migration adoption is idempotent and retains the M2.7A Hotel V1 baseline:

| Measure | Before | After staging migration |
|---|---:|---:|
| Original Hotel amenities | 27 | 27 |
| PROPERTY | 15 | 15 |
| ROOM | 12 | 12 |
| Governed published v1 snapshots | 0 | 27 |
| Duplicate stable codes | 0 | 0 |
| Approved Hotel content records | 2 | 2 |
| Approved amenity selections | 22 | 22 |
| Approved media | 3 | 3 |

The 14 property and 8 room selections, Queen bed × 1, City view, property/room scopes and customer projection are unchanged. Inventory remains capacity 8/version 2; availability remains 5 of 8 for the retained dates/version 2; base rate remains INR 1,275/version 2. No content or media record returned to review.

The active Hotel catalogue is version 1. Partner Website and Mobile now expose the same server-published `contentCatalogueVersion`; neither client owns a separate canonical list. New saves reject inactive options, while historical approved selections remain readable.

## Admin UX and bounded QA proof

The delivered Admin screen provides:

- search plus family, service, scope, category and lifecycle filters;
- deterministic bounded/keyset pagination;
- original/current/published counts and active published version;
- grouped, accessible draft editor and inline validation;
- draft-versus-published state and immutable version/event history;
- translation readiness, applicability, scope, value type/options and effective dates;
- usage/impact summary before lifecycle changes;
- stale/conflict handling, unsaved-change warning and explicit confirmations;
- CSV, XLSX, PDF and bounded Print actions.

The prepared normal-UI QA draft defaults are:

- stable code `HOTEL_PROPERTY_JACUZZI_QA`;
- label `Jacuzzi — QA catalogue option`;
- Hotel/stay capability family and Hotel service applicability;
- PROPERTY scope;
- Wellness and recreation category;
- BOOLEAN value type;
- translation-ready state and display order 45;
- explicit synthetic staging-only help text, with no price, `Free` claim or real-Hotel assertion.

One governed private QA draft now exists; no active/selectable QA amenity row exists. It must remain absent from Partner Website, Mobile and customer Hotel projections until separately submitted, reviewed, approved and published. Even after catalogue publication it only becomes an available Partner selector option; it cannot claim the retained Hotel offers a Jacuzzi unless a later Partner selection passes the existing Hotel content review/publication flow. The retained 14-property/8-room selection baseline will not be changed for this catalogue proof.

## APIs, distribution and scale structure

The permissioned Admin API provides bounded catalogue list/export, draft create/update, submit, review, publish and history routes. Publication uses an advisory lock, transaction, optimistic version, one-active-version constraint and idempotent scoped outbox event. Cache/version invalidation is limited to the affected catalogue/profile boundary; it does not flush all Partner data or scan all Partners.

Queries use stable identifiers and indexed code/status/family/service/scope/version boundaries. Lists are bounded and keyset-ready. The model uses one engine for future governed entity types instead of per-service tables or client catalogues. This is structural readiness only; measured million-Partner load, queue, recovery and query-plan certification remains M7.

## Verification

Automated and database evidence:

- Actual isolated PostgreSQL 17 governance tests: **6/6 PASS**.
- Covered exact 27-row adoption, no scope/code drift, draft/approved-unpublished exclusion, publish visibility and version increment, unapproved-publish denial, concurrent same-version edit winner/stale loser, audit-failure rollback, immutable history, one scoped publication event, and safe governed deactivation with historical selection preservation.
- Backend TypeScript and production build: **PASS**.
- Website focused governance tests: **5/5 PASS**.
- Website scoped ESLint: **PASS**.
- Website clean Webpack production build: **PASS**, 244 routes.
- Exact Vercel Git/Turbopack production build: **PASS**.
- Mobile TypeScript: **PASS**.
- Scoped secret-pattern and `git diff --check`: **PASS** for the delivered files.

An initial local Turbopack worker timed out while reading an unrelated global stylesheet; the clean Webpack build and exact Vercel Git build both passed. The locking/history implementation was corrected before delivery to avoid unsafe joined-row locking and to return complete immutable version history.

Observed staging evidence:

- Migration 0061 applied only to `tpl-api-partner-staging`/4100.
- Canonical post-migration counts remain 27/15/12, two approved content records, 22 selections and three approved media.
- Staging API health 200 and untouched production API health 200.
- Anonymous Admin governance request denied with 401.
- Exact Website deployment is READY and assigned only to `staging.tplgo.com`.
- Authenticated Admin draft/review/publish, Partner Website read, native Mobile read and governance export downloads are **PENDING**, not inferred from API/build evidence.

## Backup, delivery and preservation

Before migration, the protected staging backup was created at:

`/home/tpladmin/backups/partner-m2.7ag-pre-0061-4bd6dc6.dump`

SHA-256: `87ef808fc6daefbfebc9572cab160393a0cb3bb550befa82632312ebedfe6a3d`

`pg_restore --list` reported 1,366 entries and passed readability inspection. The additive migration is backward compatible; rollback uses the prior application release while preserving governed history for forward repair rather than dropping tables.

Delivered revisions:

| Surface | Source / staging delivery |
|---|---|
| Backend | `4bd6dc68f816bd4d26562f52dd0068ba9c30d4dd`; release `/home/tpladmin/tpl-api-releases/partner-m2.7ag-governance-4bd6dc6`; archive SHA-256 `2d25375d5965be9c3813692e1fc5adfed44b99673cb6b87c563d0b0b87163ee0`; only staging 4100 switched. |
| Website/Admin | `61d722fc3d6bb953d0c5f34bdd91871f160b094b`; READY deployment `dpl_J47CFFmco8pJwdv7agcyRcn5ifME`, URL `tplgo-website-7x0xunf8g-tplgo.vercel.app`, assigned only to `staging.tplgo.com`. |
| Mobile | `e6c18c099c54cc299d12748e0c41495da929fcdd`; JS/Metro-compatible contract presentation; existing Development APK and app data retained. |

Production port 4000, database, aliases, storage and configuration were not modified. No real Partner, submitted application, unrelated organization, published service, supply, media, booking, finance, settlement, payout or notification data changed. Unrelated dirty and untracked work remained excluded from scoped commits.

## Current blocker and exact next action

The only current gate is authenticated staging lifecycle observation. The operator should open **Admin → Website & Experience → Content & Attribute Catalogue**, verify published version 1 and the retained 27/15/12 counts, select **New amenity**, keep the prepared `HOTEL_PROPERTY_JACUZZI_QA` values, and click **Save draft** only. No review or publication action is required in that first step.

After the draft is observed absent from Partner Website/Mobile, the same normal workflow can proceed through Submit for Review, authorized approval and publication, followed by Website/Mobile version parity, customer non-appearance without Partner selection and bounded export checks. Until those authenticated gates pass, M2.7B cannot start.

The fixed denominator remains **46 requirements / 213 units**. No whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN`, and `PHASE_1_STEP_1=OPEN` remain unchanged. M2.6, M2.6A and M2.7A completed statuses remain preserved.
