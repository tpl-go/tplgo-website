# TPL Partner Desk M2.6 — Hotel Media Library

## Continuation — 2026-09-22 — YouTube preview, approval and gallery closure

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_I`

**Previous status:** `M2_6_HOTEL_YOUTUBE_SUBMITTED_ADMIN_REVIEW_PENDING`

**Current status:** `M2_6_HOTEL_MEDIA_STAGING_END_TO_END_PASS`

The operator approved the retained structured YouTube record through the normal staging Admin review confirmation and confirmed the current approved row in the bounded report/export surface. Native Mobile canonical refresh now shows `TPL Hotel Video - QA Only` as **approved · version 5**, property scope, display order 2 and not a gallery cover. A separate read-only staging reconciliation returned HTTP 200 from the approved-only customer projection and exactly two property entries (one image and one YouTube video) plus one room image; the YouTube entry is not a cover. The operator had already observed the approved video in the customer gallery. The raw submitted URL, iframe markup and private storage data are not retained in this report or projection.

Two defects were closed before the final approval. First, pending YouTube records had no useful visual preview. Website/Admin now render a TPL-controlled click-to-load review card using the canonical video ID, `youtube-nocookie.com`, lazy loading, a restricted iframe sandbox and no stored iframe HTML. Mobile renders the same structured video/status card. Second, clients exposed **Set cover** for YouTube and the Backend accepted it. The resulting material edit correctly returned the first approved record to review, but left an invalid video-cover state. Website `0d4fc8a`, Mobile `0fd2f8e` and Backend `20af18f` now restrict covers to images; the server remains authoritative. The normal Mobile **Remove invalid cover** action corrected the retained record without SQL or history rewriting, moving it to pending version 4, and the operator approved that current revision to version 5.

The immutable event sequence is `created` v1 → `approved` v2 → `updated` v3 → `updated` v4 → `approved` v5. It preserves the first decision and correction rather than rewriting history. Exactly three active canonical media rows remain: approved property image, approved room image and approved property YouTube record. Two earlier failed room attempts remain removed audit history and are not active duplicates. Property and room covers remain independent; only the room image is a room cover.

Live parity is complete within M2.6 scope. Website/Admin provide a pre-approval thumbnail-style review card; Mobile refreshes media explicitly and on foreground; Mobile shows the final Approved state; the customer-safe staging Hotel gallery exposes the approved property image/video and linked room image only; and the operator confirmed readable bounded CSV/XLSX/PDF/Print output with the approved status. Pending/rejected/private media remains excluded. Existing least-privilege `partner_media.review` server checks, Partner self-review denial, read-only Admin denial, cross-tenant denial, safe YouTube normalization and moderation audit boundaries remain unchanged.

Automated evidence is separate from live evidence. Backend TypeScript and production build passed. A fresh disposable PostgreSQL 17 run passed the focused media suite **7/7**, including image-only cover enforcement, version/conflict behavior and transaction/audit rollback coverage; the disposable cluster was stopped afterward. Website focused media guidance tests, scoped ESLint and the production Webpack build passed, and the exact Vercel Turbopack deployment completed successfully. Mobile focused Jest, TypeScript and scoped ESLint passed. The installed Development APK and app data were reused; only the Metro/JS bundle changed.

Delivery is staging-only: Backend `20af18f0bdb40534c7fe22c3c1187da6eb0463b1` runs as `/home/tpladmin/tpl-api-releases/partner-m2.6-youtube-cover-20af18f` on `tpl-api-partner-staging`/4100; scoped archive SHA-256 is `8771fecb47ec7f30b7a5d1d3b94ab74b45a05809e07b2f00630db8724501c1d2`. Website `0d4fc8a442207f0b03f259f2b1c9895ee97bf2bc` is READY in deployment `dpl_DCwyPqnwEbYWbjoQx5gcRjwP5fyn` and assigned only to `staging.tplgo.com`. Mobile `0fd2f8e72ec1b0e79a30f118465d3c5076192732` is served through the existing Development Client. Final Website, staging API and untouched production API health each returned 200.

No real Partner, submitted application, catalogue entry, inventory, availability, rate, booking, finance, settlement, payout, notification or production state changed. The retained synthetic fixture and three active media records remain available for combined certification. No new APK was built.

M2.6 is closed at **`M2_6_HOTEL_MEDIA_STAGING_END_TO_END_PASS`**. This does not complete the whole Hotel family or Partner foundation. The fixed **46 requirements / 213 units** denominator is unchanged; no whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN`, and `PHASE_1_STEP_1=OPEN` remain preserved. The next separate Hotel-only step may begin: **Hotel content, property/room amenities, policies and structured inclusions**. It was not started in this run.

## Continuation — 2026-09-22 — approved YouTube submitted, Admin review pending

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_H`

**Previous status:** `M2_6_HOTEL_IMAGE_MODERATION_GALLERY_PASS_YOUTUBE_LIVE_PENDING`

**Current status:** `M2_6_HOTEL_YOUTUBE_SUBMITTED_ADMIN_REVIEW_PENDING`

The operator supplied and authorized one safe single-video YouTube URL. Through the normal authenticated native Partner Media Library, the retained staging-only synthetic Hotel submitted exactly one property-scope structured YouTube record with the synthetic caption `TPL Hotel Video - QA Only`, a synthetic accessibility description and display order 2. The Mobile UI refreshed to show **Property · youtube · order 2**, **pending review · version 1**. The normal form reset confirms the submission completed; the raw URL/iframe/HTML was not retained in the report.

The existing two approved images and their independent property/room cover states were not changed. No new image, organization, service, inventory, availability, rate, booking, finance or payout record was created. The existing Development APK and app data were preserved; Metro was reconnected to the already-running LAN server and the same authenticated synthetic organization context was retained. Production and unrelated Partner data remain untouched.

Automated parser, allowlist, pending-publication gating and PostgreSQL structured-YouTube coverage remain the prior passing evidence. Live Admin approval, Partner Website/App Approved readback, approved-only gallery rendering and post-approval bounded export reconciliation remain pending. Exact next action: in staging Admin, open the retained synthetic Partner's Media Library and approve only `TPL Hotel Video - QA Only` once through the normal review confirmation.

The fixed **46 requirements / 213 units** denominator is unchanged. No whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN`, and `PHASE_1_STEP_1=OPEN` remain preserved.

## Continuation — 2026-09-22 — moderation and approved-gallery live closure

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_G`

**Previous status:** `M2_6_IMAGE_CORE_STAGING_END_TO_END_PASS_MODERATION_YOUTUBE_GALLERY_PENDING`

**Current status:** `M2_6_HOTEL_IMAGE_MODERATION_GALLERY_PASS_YOUTUBE_LIVE_PENDING`

The operator authorized the bounded media-review authority and approved the two retained synthetic images through the normal staging Admin UI. The dedicated permission is `partner_media.review`; the dedicated `partner_media_reviewer` role contains only `partner_verification.read` and `partner_media.review`. It does not grant Partner application approval, activation, catalogue publication, inventory/rate/availability writes, finance, settlement or payout authority. No permanent employee account was created. The only active staging Admin was already `super_admin`; a discovered mapping omission initially hid the review controls. Backend `fb0d244` adds only the new review permission to that existing super-admin permission set, while preserving the narrow reviewer role for future least-privilege assignment. No direct SQL role assignment or broad new role was used.

The moderation contract is server-authoritative and versioned. Pending active media can be approved or returned for changes; stale and opposing concurrent decisions fail safely, identical retry is idempotent, and decision plus immutable supply/audit/admin activity records commit atomically. Partner self-review, read-only Admin review, missing permission and cross-tenant review are denied. A material Partner metadata/cover edit resets an approved record to `pending_review`; rejected, removed and archived media cannot remain customer-public. The review reason is bounded, while storage references, signed URLs and private provider details are excluded from audit, public DTOs and exports.

Fresh protected staging backup `/home/tpladmin/tpl-api-releases/partner-m2.6-final-71f1abc/backups/tpl-m26-final-preapproval-20260922.dump` has SHA-256 `8823d785c5654774784438a6c9518ede22c19f333b13b8261d9ff6b94d25e47d`; its 1,312-entry `pg_restore --list` passed. Pre-mutation canonical validation found exactly two active `pending_review` rows, zero approved rows, one property cover, one independent room cover and no public gallery media. After the two normal Admin approvals, canonical readback found exactly two active `approved` rows, zero pending rows, two approval events and two moderation audit events. No duplicate active media was created; property and room covers remain independent.

The staging-only customer projection is separate from Partner-private preview access. Before approval it returned zero media. After approval it returned exactly one property image and one room image attached to `Synthetic Deluxe Room — QA Only`, in deterministic cover/order, with no storage reference, signed URL, bucket or credential field. Both image content paths streamed successfully through the Backend with approved/active revalidation. Actual isolated-PostgreSQL tests passed for approval, rejection, permission denials, cross-tenant isolation, one-winner concurrent decisions, stale rejection, idempotent replay, injected audit rollback, material-edit review reset and archived-media exclusion. Automated rejection evidence did not mutate the two retained live gallery records.

Operator-observed staging evidence is PASS for the approved property/room gallery, Partner Website Approved state, native Mobile Approved state and readable bounded exports. The existing report/export tests also verify safe field allowlisting and spreadsheet formula protection. The operator's combined export confirmation covers the requested CSV/XLSX/PDF/Print check; no full-screen Admin print defect was reported. Admin history and canonical audit counts agree with the two decisions.

Automated verification remained focused: Backend moderation/RBAC/media/export/YouTube suites passed 23/23, the corrective super-admin mapping regression plus supply snapshot suite passed 14/14, TypeScript and production build passed; Website moderation/gallery tests passed 2/2, scoped ESLint and the Webpack production build passed. The Website Git/Vercel build is also READY. Mobile source did not change and the existing Development APK/app data were reused.

Delivery: Backend source `71f1abc` introduced moderation/gallery and migration 0058; corrective source `fb0d244` fixed the existing super-admin mapping. Current immutable staging release is `/home/tpladmin/tpl-api-releases/partner-m2.6-final-rbac-fb0d244`, only `tpl-api-partner-staging`/4100 changed. Website source `4f2f449` is READY as deployment `dpl_6NHXJPukEv3jPMgXj3KunPJ5Lqaa` (`tplgo-website-g0e19qnrq-tplgo.vercel.app`) and assigned only to `staging.tplgo.com`. Mobile remains `9557175`; no new APK. Staging 4100 and untouched production 4000 health returned 200 after each switch.

M2.6 remains OPEN only for one operator-approved safe YouTube live-link submission, Admin approval and approved-gallery readback. Parser/allowlist/publication-gating tests pass, but they are not mislabeled as a live YouTube test. No random third-party video was selected. The next Hotel-only content/amenities/policies slice must not start until this URL is supplied or the operator explicitly defers the live-video gate to a later named milestone.

The fixed **46 requirements / 213 units** denominator is unchanged. No whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN`, and `PHASE_1_STEP_1=OPEN` remain preserved.

## Continuation — 2026-09-22 — image-core cross-surface live closure

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_F`

**Previous status:** `M2_6_IMAGE_CORE_MOBILE_LIVE_PASS_WEBSITE_ADMIN_PREVIEW_PENDING`

**Current status:** `M2_6_IMAGE_CORE_STAGING_END_TO_END_PASS_MODERATION_YOUTUBE_GALLERY_PENDING`

The operator completed the remaining authenticated read-only checks. On staging Partner Website, both existing property and room images rendered through **Show preview**, and the room record showed **Cover · version 2**. On staging Admin → Partners → All Partners → the retained synthetic Partner → Media Library, both private previews rendered, the same room cover/version appeared, the view remained read-only and no error occurred. No upload, archive, moderation or other mutation was performed during these checks.

Image-core parity is therefore live across all required surfaces: Website created the property image; native Mobile reads it and created the room image; Mobile set the room image as that room gallery's cover; Website and Admin read the identical canonical property/room scopes, private pending-review state, independent covers and version. Canonical Backend readback remains two active rows, with one Website property cover/version 1 and one Mobile room cover/version 2. The event ledger contains the committed Website/Mobile creates and one Mobile cover update; earlier attempts remain removed history only.

The feedback/preview repair is also live at the safe boundary. Mobile private preview and **Gallery cover updated.** were observed after canonical refresh. The exact post-upload success banner is covered by the focused regression but was not manufactured through a third upload. Website and Admin authorized inline previews are now operator-observed. Signed URLs remained transient and were not printed, exported or made public.

No further source or staging deployment was required. Current revisions remain Backend `a5f6f0e` on `partner-m2.6-preview-a5f6f0e`, Website `4b3de22` on READY deployment `dpl_BH8eNt1wARr2nX6rY6wSxYtYcg6W`, and Mobile `9557175` through the existing APK/Metro. Production and unrelated Partner records remained untouched.

This closes the M2.6 **image core**, not the complete M2.6 product slice. Full M2.6 remains PARTIAL because no Admin media reviewer authority/Approve-or-Reject workflow is configured, no operator-approved safe YouTube URL has been live-tested, and the customer Hotel gallery has canonical readiness rather than an approved-media staging display. Bounded media export tests remain automated evidence; a post-cover operator download was not repeated. The unavailable fresh isolated-PostgreSQL rerun remains NOT RUN; earlier M2.6 transaction/concurrency evidence is historical.

Exact next action: decide and authorize the minimum media-reviewer role and audited Approve/Reject transition for staging, then verify approved-only Hotel gallery projection. The separate live YouTube record still requires an operator-approved safe single-video URL. Do not start the next Hotel content/amenities/policies slice until these M2.6 gates are resolved or explicitly moved to a later approved milestone.

## Continuation — 2026-09-22 — native preview, cover and restore live PASS

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_E`

**Previous status:** `M2_6_PROPERTY_ROOM_CANONICAL_PASS_PREVIEW_FEEDBACK_DEPLOYED_LIVE_RECHECK_PENDING`

**Current status:** `M2_6_IMAGE_CORE_MOBILE_LIVE_PASS_WEBSITE_ADMIN_PREVIEW_PENDING`

The reconnected existing Development Client loaded the retained staging-only Hotel context without reinstalling the APK or clearing app data. The operator observed the inline private preview for the existing active room image. No image was uploaded again. ADB then used the normal Mobile **Set cover** action once; the UI showed **Gallery cover updated.**, the room record changed to `cover` / version 2, and the success notice remained visible after the canonical refresh.

Read-only canonical staging reconciliation now shows two active media records: the Website-origin property image is the property cover at version 1 and the Mobile-origin room image is the independent room cover at version 2. Both remain private `pending_review`. The two earlier failed-feedback attempts remain `removed` history only. The committed event sequence contains one Mobile `updated` event for the cover change; no duplicate active record, direct database write or deletion occurred.

Native navigation evidence is live: Android Back returned from Media Library to the same synthetic Partner Command Center; background → foreground restored the same organization, Media Library state, private preview and post-action confirmation. The existing APK/app data and Metro bundle were reused. Mobile source remains `9557175`.

Automated and delivery evidence remains the tested D checkpoint: Backend `a5f6f0e` on staging release `partner-m2.6-preview-a5f6f0e`; Website `4b3de22` on READY Vercel deployment `dpl_BH8eNt1wARr2nX6rY6wSxYtYcg6W`; Mobile `9557175` through the existing Development Client. No source or deployment changed for this live continuation. Staging and production health evidence from the deployment remains 200; production and unrelated Partner data were untouched.

M2.6 remains PARTIAL. Authenticated Website and Admin inline-preview observation is the next live gate. Moderation Approve/Reject authority is still not configured, so pending media remains private; an operator-approved YouTube URL and approved customer-gallery projection also remain OPEN. The fresh isolated-PostgreSQL rerun remains NOT RUN because the local harness at `127.0.0.1:54339` was unavailable; earlier M2.6 database evidence remains historical.

Exact next action: on staging Website, refresh the same synthetic Hotel **Media Library**, use **Show preview** on both existing records, and confirm that the property and room previews render and the room record shows **Cover · version 2**. No upload or moderation action is required.

## Continuation — 2026-09-22 — room image canonical PASS; feedback/preview repair staged

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_D`
**Previous status:** `M2_6_PROPERTY_IMAGE_CANONICAL_PASS_REVIEW_UI_CLARIFIED_ROOM_MOBILE_PENDING`
**Current status:** `M2_6_PROPERTY_ROOM_CANONICAL_PASS_PREVIEW_FEEDBACK_DEPLOYED_LIVE_RECHECK_PENDING`

The operator completed the bounded native room-image flow using the prepared repository-owned QA PNG. The screen showed the room record at the top as **Pending TPL review**, but no upload-success banner or saved-image preview appeared. Read-only canonical staging reconciliation confirmed that persistence succeeded: one active Website-origin property image and one active Mobile-origin room image exist, both `pending_review`, with correct property/room ownership. Two earlier Mobile room attempts are retained as `removed` audit history; they are not active duplicates. No third upload or direct database write was performed.

The exact feedback defect was a client ordering error: native `pick()` set the success notice and then called `load()`; successful `load()` immediately cleared that notice. The same ordering affected YouTube, cover and archive confirmations. Mobile `9557175` now refreshes canonical data first and then announces **Upload successful. The image is private and Pending TPL review.** in a top live region.

Saved media previously exposed metadata only on Mobile and opened Website previews outside the record; Admin had no preview endpoint. The repair keeps pending objects private. Partner Website/Mobile request the existing authenticated, tenant-scoped five-minute signed read access; Backend `a5f6f0e` adds an Admin read-only route requiring `partner_verification.read` and exact organization/media scoping. Website `4b3de22` and Mobile `9557175` render the authorized image inline and expose **Show preview / Refresh preview**. Signed URLs remain in transient UI state and are not stored, exported or made customer-public.

Delivery:

- Backend source `a5f6f0ef`; immutable staging release `/home/tpladmin/tpl-api-releases/partner-m2.6-preview-a5f6f0e`; only `tpl-api-partner-staging`/4100 restarted. Staging and untouched production health returned 200.
- Website source `4b3de22`; Vercel Preview `dpl_BH8eNt1wARr2nX6rY6wSxYtYcg6W` READY at `tplgo-website-5qnrb5a8p-tplgo.vercel.app` and assigned only to `staging.tplgo.com`.
- Mobile source `9557175`; JS-only delivery through the existing Development Client/Metro; APK and app data preserved.

Automated evidence: Website focused regression 1/1 PASS, scoped ESLint PASS and Webpack production build PASS; the first local Turbopack build timed out in unrelated `globals.css`, while the exact committed Vercel Turbopack build passed. Backend media unit tests 6/6, TypeScript and production build PASS. Mobile focused tests 16/16, TypeScript, scoped lint and Hermes Android export PASS. The optional fresh isolated-PostgreSQL rerun was **NOT RUN** because the established local harness at `127.0.0.1:54339` was unavailable; earlier M2.6 PostgreSQL concurrency/rollback evidence remains historical and is not relabelled as a new run.

Live closure remains bounded: the operator already observed the canonical pending room record before this repair. Post-deployment inline preview and persistent success/cover feedback still require the existing wireless device to reconnect; ADB currently reports no device. Authenticated Website/Admin inline-preview observation also remains OPEN. Moderation Approve/Reject authority, an operator-approved YouTube URL and approved customer-gallery projection remain separate M2.6 gates. Production, catalogue, application, activation, finance, payout and unrelated Partner data remain untouched.

Exact next action: reconnect the existing wireless Development Client, use **Show preview** on the existing room image and **Set cover** once (no re-upload), then confirm the same room preview/read-only status on Website and Admin.

## Continuation — 2026-09-22 — property image canonical PASS and review guidance live

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_C`
**Previous status:** `M2_6_HOTEL_MEDIA_CAPABILITY_PUBLISHED_UPLOAD_TRANSPORT_REPAIRED_LIVE_PROPERTY_RETRY_PENDING`
**Current status:** `M2_6_PROPERTY_IMAGE_CANONICAL_PASS_REVIEW_UI_CLARIFIED_ROOM_MOBILE_PENDING`

The operator retried the repository-owned property fixture once after the transport repair and received **Image uploaded for review**. Independent read-only staging reconciliation confirms exactly one active canonical media row: property scope, image kind, exterior category, cover=true, display order 0, `pending_review`, version 1, Website provenance and 1200×800 inspected dimensions. Room media remains zero; no duplicate media row exists.

The follow-up exposed a UX ambiguity rather than a persistence defect: the Partner saw a review message but the screen did not clearly explain where review status is visible or how to build a multi-image gallery. Website `ce842a4` now shows Total/Pending TPL review/Approved/Needs changes counts; uses readable review labels; states that status is visible in Partner Media Library and **Admin → Partners → All Partners → selected Partner → Media Library**; and explicitly discloses that M2.6 has no configured Approve/Reject authority, so pending media remains private.

Gallery creation is now explained as a deliberate one-image-at-a-time flow because each image requires its own property/room scope, caption, accessibility description, cover choice and display order. After a successful upload the form resets and becomes **Add another image or video**. The current bounded quota is 100 active media records; after the first record, 99 slots remain. This does not create bulk metadata shortcuts or apply one description to unrelated images.

Verification: focused guidance/upload tests 2/2 PASS; scoped ESLint and `git diff --check` PASS; local production Webpack build PASS with 243 routes. Exact committed Vercel build `dpl_DXEYkJqDJC6xch1LAaVio4gezTh9` is READY at `tplgo-website-d07id4fmm-tplgo.vercel.app` and assigned to `staging.tplgo.com`. Backend remains `018de5c693b5eb468338910addeccf2741f9a229` on staging release `partner-m2.6-media-018de5c`; Mobile remains `0ce38b6` with the existing APK/app data.

M2.6 remains PARTIAL. The next gate is read-only Website/Admin confirmation of the clarified status presentation, then Mobile readback of this property image and the single authorized room-image upload. No moderation decision, second image, YouTube link or public customer-gallery publication was performed in this continuation.

## Continuation — 2026-09-22 — upload transport repair deployed

**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260922_B`
**Previous status:** `M2_6_HOTEL_MEDIA_IMPLEMENTED_STAGING_DEPLOYED_CAPABILITY_PUBLICATION_LIVE_QA_HOLD`
**Current status:** `M2_6_HOTEL_MEDIA_CAPABILITY_PUBLISHED_UPLOAD_TRANSPORT_REPAIRED_LIVE_PROPERTY_RETRY_PENDING`

The operator completed the normal staging Website & Experience publication for the existing **Stay & Accommodation → Hotel** service. The guarded retained-fixture reconciler then returned the existing deterministic fixture, `mediaApplicable=true`, `mediaWrite=true`, the same Hotel service, and zero media rows. No Domain, Service, organization, inventory item, application, approval, payout or production record was created or changed.

The first Website property-image attempt failed after a successful upload-session request. Sanitized staging evidence established the exact stage: the browser's signed binary PUT was blocked by the object provider's CORS preflight. The provider returned HTTP 403 with no allow-origin/method/header response, so confirmation never ran and no canonical media record was created. A guarded staging-only bucket-CORS command was added and tested fail-closed, but the existing least-privilege object credential correctly received `AccessDenied` for bucket-policy administration. No provider policy, credential scope or production storage was changed.

The narrow repair keeps the existing private-storage architecture. Website image bytes now travel through a new authenticated, tenant-scoped Backend upload route, using the original server-issued upload session and private storage reference; the existing confirm/content-inspection/link/audit contract remains unchanged. The upload session is carried in an allowlisted protected header rather than the URL. The server verifies actor, membership, `media.write`, organization/service/item ownership, pending/unexpired session, MIME, exact size and checksum before writing through the existing private storage abstraction. Confirmation still performs object verification, Sharp magic/dimension checks and the canonical transaction.

Delivery:

- Backend operational guard commit `4d9ee6a`; upload fallback `b693e57c137f3acd53bb363e737b42e20c1aea62`; final CORS-preflight correction `018de5c693b5eb468338910addeccf2741f9a229`.
- Backend staging release: `/home/tpladmin/tpl-api-releases/partner-m2.6-media-018de5c`; only `tpl-api-partner-staging`/4100 changed. Local staging and untouched production health both returned HTTP 200.
- Website capability-editor normalization commit `c5961505e100884330161daeaf635dfc0d0b2999`; upload fallback `e0bca9d`. READY deployment `dpl_ADFYHV7xgK7LtBvRaDw5wzvWvEnk` at `tplgo-website-hc3f2l233-tplgo.vercel.app` is assigned to `staging.tplgo.com`.
- Mobile remains `0ce38b6`; existing Development APK and app data are preserved.

Verification:

- Capability-editor suite: 54 files / 379 tests PASS; scoped lint and diff check PASS.
- Backend focused storage/media tests: 12/12 PASS; actual isolated PostgreSQL media suite: 6/6 PASS, including the authenticated server-upload path plus existing idempotency/concurrency/rollback/authorization coverage.
- Backend protected-upload CORS regression: 1/1 PASS; TypeScript and production build PASS.
- Website authenticated-upload regression: 1/1 PASS; scoped ESLint and production Webpack build PASS.
- Live staging preflight: HTTP 204, exact staging origin allowed, and `X-TPL-Media-Upload-Session` present in allowed headers.
- Read-only canonical staging count after the failed attempt: media rows 0, confirmed sessions 0, pending sessions 3. These old pending sessions will not be reused or deleted in this batch; the next normal retry will create one controlled fresh session.

Remaining gate: retry the one property-level synthetic PNG once through the refreshed staging Website. A successful result must then be reconciled to canonical Backend, Mobile, read-only Admin, audit and bounded exports before the room-level Mobile flow begins. M2.6 remains PARTIAL; YouTube live-link and customer gallery projection boundaries remain unchanged.

The earlier 2026-09-21 checkpoint below is preserved as historical evidence and its publication HOLD is superseded.

**Date:** 2026-09-21  
**Checkpoint ID:** `PARTNER_DESK_M2_6_HOTEL_MEDIA_20260921_A`  
**Previous status:** `M2_5_RATES_STAGING_END_TO_END_PASS`  
**Current status:** `M2_6_HOTEL_MEDIA_IMPLEMENTED_STAGING_DEPLOYED_CAPABILITY_PUBLICATION_LIVE_QA_HOLD`

## Current outcome

The reusable Media Engine is implemented, tested, committed and delivered to staging. It extends the existing private Partner storage contract; it does not create a second upload or media database. The retained **Stay & Accommodation → Hotel** fixture and its existing `Synthetic Deluxe Room — QA Only` item remain unchanged. No live media record has been created yet.

The exact live gate is now established. Published catalogue version 10 still resolves Hotel to `inventory`, `rates`, `availability`, and `bookings`; it does not yet include `media`. The retained fixture membership therefore has no media grant and canonical media count remains zero. The Website & Experience publication action must add the existing supported `media` capability to the existing Hotel service, then the guarded fixture reconciler can add only `media.read`/`media.write`. Direct database editing was not used.

## Delivered contract

- Migration `0057_partner_media_engine.sql` adds durable upload sessions and safe media metadata to the existing `partner.media_assets` table.
- Property gallery and each inventory-item/room gallery have independent scope and cover uniqueness.
- JPEG, PNG and WebP uploads use the existing signed private-storage session, server-issued storage reference, same-actor confirmation, checksum, downloaded-object inspection, Sharp magic/metadata validation, byte/dimension/pixel bounds and tenant-scoped object references.
- Media metadata includes kind, category, safe filename, caption, alt text, cover, deterministic order, moderation state, version, client surface and immutable audit history.
- Structured YouTube records accept allowlisted single-video URL forms and store only a canonical video ID. Raw iframe/HTML and non-YouTube/look-alike domains are rejected.
- Upload does not equal publication. New images and YouTube links are `pending_review`; gallery readiness returns only approved/active records to a later customer Hotel gallery resolver. No public/private endpoint crossover or duplicate customer media store was introduced.
- Website and native Mobile use the same canonical DTO and protected routes. Admin remains read-only. CSV/XLSX/PDF/Print receive safe media metadata only; storage references, signed URLs and private/provider fields are excluded.
- Hotel capability is added only to the canonical static baseline for future initialization. The live published configuration remains authoritative and has not been bypassed.

## Synthetic assets

Two repository-owned, non-photographic staging PNG fixtures were created:

- `reports/fixtures/TPL_SYNTHETIC_HOTEL_PROPERTY_QA.png`, SHA-256 `FB9A8FD47693A79088A328AAAAE846426610F827E839AEBCA6917B407AC53EC9`.
- `reports/fixtures/TPL_SYNTHETIC_HOTEL_ROOM_QA.png`, SHA-256 `06A168FE848A11A898914C5E6F9958271BF76308E289EDC5EE0D03E88F511589`.

They are clearly marked `STAGING ONLY · NOT CUSTOMER CONTENT`. No real hotel, customer, Partner, reference image, external copyrighted asset or AI-generated image is used.

## Automated evidence

- Backend focused media/supply/export/fixture regression: **26/26 PASS**.
- Actual disposable PostgreSQL media transaction suite: **5/5 PASS**. This covers idempotent confirmation, property/room cover independence, concurrent cover selection, one-winner/one-stale metadata edits, atomic audit rollback, read-only/supply-only/cross-tenant denial, and structured YouTube persistence.
- Backend TypeScript and production build: **PASS**.
- Website scoped ESLint: **PASS after ref-state correction**. Webpack production build: **PASS**. The first local Turbopack build timed out in an unrelated `globals.css` worker; the exact committed source subsequently built successfully in Vercel Turbopack.
- Mobile TypeScript: **PASS**. Focused Partner API contract: **14/14 PASS**. Scoped lint has zero errors and six existing `Array<T>` style warnings in the touched legacy type file.
- Android Hermes/public-config export: **PASS**, `entry-197ee51fef2bad1e1d51bd5f3a08f32d.hbc`, SHA-256 `59AB493C6ECFFC63A990D5D1CF656E899EFCF2C709F4FFE4FE6A99818F6D3252`.
- Scoped secret-pattern scans and `git diff --check`: **PASS**.

Automated tests do not certify a live object upload, moderation decision, customer gallery rendering, or live YouTube link.

## Delivery and safety

- Backend source: `ab3331c3cc9b5b13aba26ae3738f84e7647a82c9`; staging release `/home/tpladmin/tpl-api-releases/partner-m2.6-media-ab3331c`; only `tpl-api-partner-staging`/4100 switched.
- Protected pre-write backup: `/home/tpladmin/tpl-api-releases/partner-m2.6-media-ab3331c/backups/tpl-m26-prewrite-20260921.dump`; SHA-256 `d1c4ac98b6029a159ec2c5aa72d0dc6f8f3ecd92ae1b2f93d332775771a333d9`; `pg_restore --list` passed.
- The eight transferred compiled/migration artifacts matched local SHA-256 values before switch. Migration 0057 completed and staging health returned HTTP 200.
- Website source: `b63ee9155d6f405e3e90c6057cf0c828c8a581f8`; READY deployment `dpl_DNj7uPbwtLTbFH6eQNgjMfVPL5Yg`; `staging.tplgo.com` points to `tplgo-website-quz0ct2y2-tplgo.vercel.app`.
- Mobile source: `0ce38b6`; JS-only delivery, existing Development APK and app data retained; no native dependency or permission change.
- Production API port 4000 health remained HTTP 200. Production database, process, alias, storage and data were not changed.

## Remaining live gates

1. Through staging Admin → Website & Experience → Partner → Service Catalogue, add `Media` to the existing Hotel service and complete the existing Save Draft → Send for Approval → Approve → Publish workflow. No other service or field should change.
2. Run the guarded retained-fixture reconciliation once, then disable its flag; verify only `media.read` and `media.write` were added.
3. Website uploads the property PNG, Mobile reads it; Mobile uploads the room PNG, Website reads it; Admin, history and safe exports agree.
4. Verify invalid file/link and unauthorized/cross-tenant denial against staging without creating extra records.
5. An operator-approved safe YouTube single-video URL is still required for the one live link record. Parser/allowlist tests are not live-link certification.
6. The current Hotel customer page linkage is **canonical readiness only** until an approved media record and the existing customer listing/provider resolver are available. Static/mock customer imagery was not removed.

The fixed denominator remains **46 requirements / 213 units**. No new whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.

## Exact next action

Publish only the existing Hotel service’s `Media` capability through the established staging Website & Experience flow. Then resume the same batch with guarded fixture permission reconciliation and the two bounded synthetic image parity flows. The next Hotel-family slice remains **Hotel content, property/room amenities, policies and structured inclusions** and must not start until M2.6 closes.
