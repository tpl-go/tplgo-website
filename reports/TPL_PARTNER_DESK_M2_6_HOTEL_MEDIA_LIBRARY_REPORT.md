# TPL Partner Desk M2.6 — Hotel Media Library

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
