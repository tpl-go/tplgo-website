# TPL Batch D28E3C.4A U1.2F — Website Profile Surface Remediation

Date: 2026-09-18 IST
Status: **STAGING IMPLEMENTATION DEPLOYED; AUTHENTICATED GOLD_QA_USER CLOSURE OPEN**

## Scope and checkpoint

This batch repaired the exact Website blockers recorded in U1.2E: profile-photo upload, photo-action placement, and the Country → State/Region → City controls. It did not change verified login ownership, Partner Steps 1–8, production, the Mobile package/project, or operator profile data.

The interrupted checkpoint was recovered before continuing. Website source commit `c28a5fa190a20e53bd8ef06e6767827f1aa31b57` and backend source commit `eede155404c` were already pushed. Backend4100 was already running the new release; the Website Vercel Preview was still completing. The Preview was subsequently verified READY before only `staging.tplgo.com` was repointed.

Unrelated dirty and untracked work in all three repositories was preserved. No reset, clean, stash, broad stage, app uninstall, app-data clear, Expo project/package change, or production deployment occurred.

## Baseline safety

| Surface | Evidenced checkpoint |
|---|---|
| Website branch/source | `d28e1a-integration-preview`; deployed source `c28a5fa190a20e53bd8ef06e6767827f1aa31b57` |
| Backend branch/source | `d28e3c3a-qa2b-provider-partner-integration`; deployed source `eede155404c` |
| Backend4100 release | `/home/tpladmin/tpl-api-releases/user-u12f-eede155404c`; PM2 process `tpl-api-partner-staging` |
| Mobile source/install | Unchanged source `50c43904d17783da7e9abbac1ebef354543fc3ea`; existing installed development APK/EAS build `39c750eb-3a0e-47ea-84d4-dab3257e10cb` retained |
| Staging health | backend4100 HTTP 200; public staging API HTTP 200; Website deployment READY and final redirected staging response HTTP 200 |
| Production isolation | Production frontend and port4000 remained healthy; no production alias, release, process, migration, configuration or data was changed |
| Recovery execution | Remains disabled; this batch did not enable or invoke recovery execution |

## Confirmed photo failure cause

Root-cause classification: **C. CORS_OR_STAGING_ORIGIN**.

The original Website flow was:

1. authenticated JSON `POST /api/v1/me/profile/photo/upload-session`;
2. direct browser `PUT` to a short-lived signed private-object URL;
3. authenticated `POST /api/v1/me/profile/photo/upload-session/:uploadId/complete`.

It was not multipart, so there was no multipart field name. It accepted JPEG, PNG and WebP under the existing five-million-byte profile-photo policy.

Safe staging evidence established that the storage provider was enabled and configured, but the provider preflight for the signed browser upload returned HTTP 403 with no allowed-origin, method or header response. A read-only bucket CORS metadata request was also denied to the current credential. Staging metadata showed two recent pending JPEG upload sessions and no completion. This is consistent with the Website successfully creating sessions while the browser could not perform the provider PUT; it is not presented as provider delivery evidence. No signed URL, token, storage credential, user identifier, contact or private image content was recorded.

## Repair

### Canonical photo upload

The established canonical media service remains authoritative. A backward-compatible API-proxied route was added for the Website:

- `PUT /api/v1/me/profile/photo`
- raw image body; no multipart wrapper
- owner derived only from the authenticated canonical session
- existing staging-origin/CSRF protection
- `image/jpeg`, `image/png` or `image/webp`
- maximum `5,000,000` bytes and the existing pixel limit
- Sharp decode validation, orientation handling, metadata-stripping WebP re-encode and private 128/512 variants
- owner-hashed, revisioned object keys
- advisory-locked canonical replacement and version increment
- cleanup of failed and superseded objects
- `Cache-Control: no-store` canonical response

The older signed-upload endpoints remain intact for Mobile/native compatibility. The Website now sends the selected `File` as the request body through the authenticated API client, exposes real upload progress, waits for the canonical response before reporting success, and surfaces a customer-safe error. The photo read hook rejects stale results after account/session changes.

The raw-body parser moved into application bootstrap with the profile-photo limit. Admin media retains its own three-million-byte route limit; this change does not widen that contract.

The deployed public contract returned HTTP 401 to an unauthenticated photo PUT. Its staging-origin preflight returned HTTP 204 and explicitly allowed the staging origin, PUT and Content-Type. A real authenticated upload was not attempted without operator confirmation.

### Hero photo action

The canonical photo and camera action now appear on the avatar in the existing account hero on desktop and small screens. My Profile provides Add/Replace, progress and error text, plus the existing approved Remove action behind a confirmation. The duplicate lower-page upload block was removed. Other account pages retain an accessible link to My Profile rather than exposing an edit action.

### Location controls

The Website now uses compact anchored portals below each location field. The controls:

- use the shared `country-state-city@3.2.1` authority;
- show readable names as the primary label and ISO-2 only as secondary Country text;
- retain the canonical uppercase ISO-2 Country value and compatible State/City strings;
- expose the full result set with internal scrolling and search, without a hard slice;
- match the input width, set a bounded height, and avoid profile-card clipping;
- support keyboard movement/selection, Escape, outside dismissal and focus restoration;
- load State/Region only for the selected Country and City only for the selected State/Region;
- show independent loading, unavailable/retry and Not listed/manual-entry states;
- clear dependent values only after the operator explicitly selects a different parent.

The deployed reference endpoint returned HTTP 200 with authority `country-state-city@3.2.1` and 250 Country options. Existing saved values remain readable while the relevant authority loads or when manual fallback is used.

## Files changed

Website commit `c28a5fa190a20e53bd8ef06e6767827f1aa31b57`:

- `app/account/layout.tsx`
- `app/components/account/profile/ProfileLocationFields.tsx`
- `app/components/account/profile/sections/MyProfileSection.tsx`
- `app/lib/account/profilePhoto.ts`
- `scripts/u12f-profile-surface-browser.mjs`

Backend commit `eede155404c`:

- `src/app.ts`
- `src/modules/admin/admin.routes.ts`
- `src/modules/users/user.profile-photo.ts`
- `src/modules/users/user.profile-surface.test.ts`
- `src/modules/users/user.routes.ts`

No Mobile source file, schema migration or dependency changed.

## Verification

| Check | Result |
|---|---|
| Backend focused profile-surface test | PASS — 10/10 |
| Backend TypeScript/build | PASS |
| Backend scoped diff/secret checks | PASS |
| Website TypeScript | PASS |
| Website scoped ESLint | PASS after correcting one effect-state lint finding |
| Website customer-copy guard | PASS |
| Website production build against staging API | PASS |
| Website scoped diff/secret checks | PASS |
| Mobile unchanged Partner route regressions | PASS — 2 suites/6 tests |
| Deployed location authority | PASS — HTTP 200, version `country-state-city@3.2.1`, 250 Countries |
| Deployed photo authorization boundary | PASS — unauthenticated PUT HTTP 401 |
| Deployed Website photo-route preflight | PASS — HTTP 204 for staging origin with PUT/Content-Type allowed |

The production-build rendered-browser harness passed at exact viewports 390×844, 768×1024 and 1365×900. It covered the complete Country list, search, Country → State → City loading, anchored geometry, internal scrolling, Escape/focus restoration, outside dismissal, no page-wide horizontal overflow, hero photo action, synthetic successful API-proxy photo mapping, confirmed removal, upload error presentation, and absence of the old lower photo block. It also proved exact date-only strings `2000-02-29` and `2024-03-01` in the input and request body. These are synthetic intercepted-API results, not authenticated staging mutations.

Screenshots from the rendered harness are retained under `reports/artifacts/u1-2f/` for 390×844, 768×1024 and 1365×900.

The older standalone Node test entry could not run because the Website workspace does not install `vitest`; this is a harness dependency limitation, not a product failure. The production-build rendered suite covered the changed behavior.

## Staging delivery

### Backend

- source revision: `eede155404c`
- release: `/home/tpladmin/tpl-api-releases/user-u12f-eede155404c`
- PM2: `tpl-api-partner-staging`, online on backend4100
- local backend4100 health: HTTP 200
- public staging API health: HTTP 200
- production port4000 health check remained HTTP 200 and was not restarted

### Website

- source revision: `c28a5fa190a20e53bd8ef06e6767827f1aa31b57`
- deployment: `dpl_HB5wvC4LBhv8DMLDUej5E2vSvCAq`
- Preview: `tplgo-website-lceoha267-tplgo.vercel.app`
- Vercel state: READY
- `staging.tplgo.com` authoritatively resolves to that exact Preview deployment
- final redirected staging response: HTTP 200
- no production alias moved

## Held operator QA

The supported in-app browser had already failed once with the known `Cannot redefine property: process` runtime error during the parent batch. It was not reset or looped. This session therefore could not securely operate the authenticated GOLD_QA_USER browser, and no operator mutation was attempted.

The following remain open and must be performed through the operator-controlled Website browser and the existing installed Development APK:

1. live Country, State/Region and City interaction, save and reload;
2. identical saved location on Mobile;
3. operator-confirmed intended DOB save and exact Website/Mobile calendar-date persistence;
4. anniversary exact-date persistence;
5. explicitly approved synthetic Website hero photo upload and Website → Mobile parity;
6. explicitly approved Mobile replacement and Mobile → Website parity;
7. controlled Personal Mobile and Personal Email contact round trips;
8. proof that verified login methods remain unchanged;
9. `/partner-entry` separation and actual Partner-workspace isolation;
10. cold session restore, Logout, signed-out relaunch and signed-out deep-link guards.

No actual date/contact value, identifier or photo content should be entered into chat or a report. Provider acceptance is not inferred from the synthetic harness.

## Exact status

- Website profile-photo and location remediation: **implemented, tested and deployed to staging**.
- Authenticated Website photo upload and location live QA: **OPEN**.
- DOB/anniversary live exact-date proof: **OPEN**.
- Website ↔ Mobile photo/location/contact parity: **OPEN**.
- Verified login identity changed by this batch: **NO**.
- New APK required by U1.2F: **NO**; reuse the installed U1.2E Development APK.
- Mobile verified Add/Change Mobile and Add/Change Email flows: **not certified complete; remain a separate required narrow batch if the held operator gate confirms they are incomplete**.
- `MOBILE_USER_PARITY`: **OPEN**.
- `PHASE_1_STEP_1`: **OPEN**.
- Partner Steps 1–8 started: **NO**.
- Production changed: **NO**.

Exact next action: complete the ten-item GOLD_QA_USER checklist above with secure operator confirmations. If the native verified contact actions are incomplete, the next narrow implementation batch is **Mobile verified login-contact Add/Change parity**, reusing the canonical sensitive-action APIs, OTP/reauthentication rules and duplicate-owner protection. Do not start Partner Steps 1–8 until Mobile User parity closes.

## U1.2G live-closure gate reference — 2026-09-18

Detailed continuation: `C:\Users\Admin\tpl-project-d28e1a-integration\reports\TPL_BATCH_D28E3C4A_U1_2G_WEBSITE_MOBILE_LIVE_CLOSURE_REPORT.md`.

The U1.2G precheck preserved the exact U1.2F deployment and confirmed Website staging, backend4100, the public staging API, Metro and production-isolation health. The supported browser remained unavailable after one startup attempt, and Android debugging was unavailable from the current shell, so authenticated GOLD_QA_USER browser/device observations remain operator-controlled and unrun. No profile, identity, app or production data changed.

Current source also confirms Website Add Mobile/Add Email is present while Mobile verified methods are view-only. `MOBILE_VERIFIED_CONTACT_PARITY_REQUIRED` is therefore open independently of the remaining live profile checks. `MOBILE_USER_PARITY` and `PHASE_1_STEP_1` remain **OPEN**; Partner Steps 1–8 remain **NOT STARTED**.
