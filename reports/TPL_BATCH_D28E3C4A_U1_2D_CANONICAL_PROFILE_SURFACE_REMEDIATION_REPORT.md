# TPL Batch D28E3C.4A — User U1.2D Canonical Profile Surface Remediation

Date: 2026-09-18 (IST)  
Status: **STAGING IMPLEMENTATION DELIVERED; MOBILE USER PARITY OPEN — OPERATOR QA AND A NEW APK REMAIN REQUIRED**

## Scope and safety checkpoint

This batch repaired the canonical Personal User profile surfaces across Website, Mobile and the shared staging backend. Work was limited to `staging.tplgo.com`, `api-staging.tplgo.com` and backend4100 (`tpl-api-partner-staging`). Production, ports4000/4200, Partner Steps 1–8, identity ownership, recovery execution and real operator data were not changed.

Repository checkpoints:

| Repository | Branch | Delivered commits |
|---|---|---|
| Website | `d28e1a-integration-preview` | `03507210c7f3bce917659adf4480cbbbc10abd74` and test-only follow-up `cac5aef19064d4a47fe00db4ff6366323ff30c51` |
| Backend | `d28e3c3a-qa2b-provider-partner-integration` | `e252870f1ad590ada8e843628acaec66e4d42111` |
| Mobile | `codex/mobile-m2-authentication` | `9f9a0a28f59cd196d1b916cea935d4afac64c6c9` and recovered prerequisite `65d1770` |

All commits were pushed. Unrelated dirty and untracked work in all three repositories was preserved. Recovery execution remains disabled.

Before the additive staging migration, the existing staging backup process created:

- backup: `/home/tpladmin/tpl-api-releases/identity-r1e-e760e02/backups/tpl-backup-2026-09-17T19-37-17-699Z.dump`
- SHA-256: `1993772589a3c50759cbced8dd350aa78d6a6e659bc2cbfa8358adc3dd2aa37a`

No production database or configuration was inspected or changed. Production port4000 remained on `/home/tpladmin/apps/tpl-api-git` and returned HTTP 200 after the backend4100 cutover.

## Confirmed causes

### Location controls

The Website used a ten-entry country datalist and plain-text State/Region and City fields. No approved shared location authority existed. The backend now exposes a versioned, read-only global reference contract backed by the static `country-state-city@3.2.1` dataset. Website and Mobile consume the same contract; no remote location service receives profile data.

`country-state-city` is GPL-3.0. Its use is suitable for the staging implementation, but license/legal review remains an explicit production-readiness gate.

### Calendar-date shift

The defect came from treating PostgreSQL `DATE` values and form dates as instants. In particular, the backend projected date values with `toISOString().slice(0, 10)` and validation used `Date.parse`/`new Date(...).toISOString()`. A local-midnight date could therefore cross a UTC boundary and be returned one day earlier.

DOB and anniversary now remain validated Gregorian `YYYY-MM-DD` strings from client selection through request, PostgreSQL `DATE`, response and display. PostgreSQL OID 1082 is parsed as a string. Neither field is converted through a timezone-bearing instant.

The existing incorrectly shifted GOLD_QA_USER value was not guessed or changed. The operator must explicitly select and save the intended DOB once during live QA.

### Profile photo

The existing private S3-compatible object storage, signed-upload infrastructure and Sharp image processing were reusable. The new canonical photo contract stores only owner-scoped asset references in additive nullable tables. It does not store base64 data in the profile row, expose filesystem paths or use a Google photo as profile authority.

### `/partner-entry`

The Mobile route guard used a broad `/partner` prefix, so it incorrectly classified the Personal informational route `/partner-entry` as the Partner workspace. The guard now recognizes only `/partner` and its real descendants as Partner workspace routes. The separate Partner login journey remains available and no Partner authority is granted by the informational entry.

### Interrupted Mobile commit recovery

Clean-commit validation found that `9f9a0a2` depended on shared API-authority changes that were still dirty and omitted the Creator route already referenced by its customer-copy test. The clean commit failed TypeScript and one Jest suite. Commit `65d1770` recovered only those prerequisites: canonical staging for auth/identity calls, isolated app-development for non-auth service calls, their fail-closed resolver/client tests, the existing Creator route, and the corresponding EAS environment names. Broader concurrent branding/login UI changes remain unstaged.

## Implemented contracts and behavior

### Backend

- `GET /api/v1/reference/profile-locations?level=countries|regions|cities&country=&region=`: global versioned location options.
- `GET /api/v1/me/profile/photo`: owner-scoped, no-store canonical photo read.
- `POST /api/v1/me/profile/photo/upload-session`: owner/session-bound signed upload session.
- `POST /api/v1/me/profile/photo/upload-session/:uploadId/complete`: single-use completion after provider acceptance and safe image decoding.
- `DELETE /api/v1/me/profile/photo`: owner-scoped removal.
- JPEG, PNG and WebP only; 5 MB source limit; decoded-pixel limit; content/format verification; metadata-stripped 128 px and 512 px WebP variants; versioned object keys and URLs.
- Additive migration `0053_user_profile_photo.sql` creates canonical photo and upload-session records without changing existing profile rows.
- Profile and traveller writes remain independent from login identities, sessions, Partner contacts and organization ownership.

### Website

- Searchable, keyboard-accessible Country selector with readable global names and secondary ISO-2 text.
- Dependent searchable State/Region and City selectors with manual fallback where the authority has no suitable item.
- Country changes clear only incompatible region/city values; region changes clear only incompatible city values.
- Existing saved values remain readable; canonical country storage remains uppercase ISO-2 and region/city remain compatible canonical strings.
- Canonical photo add/replace/remove, progress/error states and fallback avatar in My Profile and the account banner.
- Personal Mobile and Personal Email remain editable profile contacts with clear sign-in separation.
- Passport/PAN editing remains unavailable with truthful copy.

### Mobile

- The same canonical profile, location and photo APIs back Personal Details.
- Personal Mobile and Personal Email are visible and editable as profile contacts without changing verified login methods.
- Date-only validation/display avoids JavaScript instant conversion.
- Canonical photo appears in Personal Home, My Account and Personal Details; add/replace/remove uses `expo-image-picker` and the signed-upload contract.
- The `/partner-entry` prefix collision is corrected while the actual Partner workspace remains protected.
- `expo-image-picker` is a native dependency, so the installed development client cannot receive this feature through JavaScript alone. A new APK is required.

## Source files

Backend scope includes `drizzle/0053_user_profile_photo.sql`, the identity schema, DB DATE parser, profile validation/persistence, location authority, profile-photo service/routes, dependency lockfiles and scoped tests.

Website scope includes the account layout, `MyProfileSection`, `ProfileLocationFields`, location/photo clients and the rendered profile-surface browser test.

Mobile scope includes the existing account modules and routes, canonical profile model/client, location/date/photo UI, workspace-route guard/test, `expo-image-picker`, and the recovered shared authority prerequisites listed above.

## Verification

| Check | Result |
|---|---|
| Backend focused Vitest | PASS — 14 passed, 11 isolated-PostgreSQL cases skipped by their explicit harness gate |
| Actual local isolated PostgreSQL attempt | BLOCKED — no test PostgreSQL listener at `127.0.0.1:54329` (`ECONNREFUSED`); this is not reported as a pass |
| Backend TypeScript/build | PASS |
| Additive staging migration | PASS — Drizzle applied; both photo tables verified present |
| Backend public staging health | PASS — HTTP 200 |
| Location reference endpoint | PASS — HTTP 200 |
| Unauthenticated photo read | PASS — HTTP 401 |
| Website TypeScript | PASS |
| Website scoped ESLint | PASS |
| Website customer-copy guard | PASS |
| Website isolated production build | PASS — 241 routes from exact committed source |
| Website rendered profile test | PASS at 390×844 and 768×1024 — exact DOB/anniversary strings, canonical personal contacts, searchable country selection, photo action and no page-wide horizontal overflow |
| In-app browser setup | BLOCKED after one supported attempt — `Cannot redefine property: process`; no retry loop or workaround was used |
| Mobile clean-commit TypeScript | PASS after prerequisite recovery |
| Mobile full Jest | PASS — 19 suites, 129 tests |
| Mobile Expo lint | PASS |
| Mobile Android JS export | PASS — 1,702 modules and Hermes bundle |
| Commit whitespace checks | PASS for all four implementation commits and the Website test follow-up |
| Scoped secret checks | PASS; no values were printed or added |

The date tests cover UTC, India, positive and negative offsets, day/month/year boundaries and leap day. Automated profile/client tests cover exact date/contact wire values, photo validation/variants/authorization, canonical identity separation and Partner workspace routing. The rendered Website test uses synthetic intercepted APIs and is not authenticated live QA.

## Staging delivery

### Backend

- Exact release: `/home/tpladmin/tpl-api-releases/user-u12d-e252870f1ad590ada8e843628acaec66e4d42111`
- PM2 process: `tpl-api-partner-staging`
- Local backend4100 health: HTTP 200
- Public `api-staging.tplgo.com` health: HTTP 200
- Deployment archive SHA-256: `9565389d295c0f8c5171792f56cfcbf76a5c93d362bdb1becdf1cb6c4aa93bc1`

### Website

- READY preview/deployment: `dpl_93SShJn97RNF864YMgwC81Nqs3K8`
- Deployment URL: `tplgo-website-o26xl1o03-tplgo.vercel.app`
- `staging.tplgo.com` points to that exact deployment.
- Vercel SSO protects both preview and staging aliases, so an unauthenticated probe receives the expected SSO 302 rather than an application HTTP 200. Build metadata is READY; authenticated visual proof remains pending.
- No production alias was moved.

### Mobile APK

The exact clean Mobile source passed TypeScript, all tests, lint and Android export. EAS then accepted the existing project and remote Android credentials and uploaded the 9.6 MB build archive, but rejected build creation because the `tplgo` account has exhausted its monthly Android build allocation. The quota is reported to reset on 2026-10-01. No APK/build ID was produced.

This is the precise live-Mobile blocker. Do not use the old installed development client to claim photo parity: it does not contain `expo-image-picker`.

## Operator QA still required

No real profile value or photo was changed in this batch. The following require GOLD_QA_USER and explicit operator confirmation immediately before the mutation:

1. Select the intended DOB again and save it once; verify exact persistence on Website and Mobile, including cold reload.
2. Verify anniversary exact-date persistence without a timezone shift.
3. Save controlled Personal Mobile/Email changes in each direction and confirm identical canonical values, while verified login methods remain unchanged.
4. Upload one approved synthetic QA photo from Website and confirm it on Mobile; replace/upload from Mobile and confirm it on Website; remove only with separate explicit confirmation.
5. Verify Website and Mobile Country/State/City compatibility.
6. Verify `/partner-entry`, separate Partner login, actual Partner workspace isolation, cold session restore, logout and signed-out Profile/Bookings/Wallet/Partner guards.

The Mobile portion cannot run until a development APK containing `expo-image-picker` is built and installed. The supported in-app browser is also unavailable in this session, so Website authenticated checks must be completed through the operator-controlled browser. No credentials, OTPs, actual values or photo contents belong in chat or this report.

## Final status and remaining gates

- Website selectors and canonical profile/photo presentation: **implemented, tested and deployed to staging; authenticated operator QA pending**.
- Backend date/location/photo contracts: **implemented, migrated and healthy on backend4100; controlled live date/photo round trips pending**.
- Mobile Personal contacts, location/date/photo parity and Partner-entry routing: **implemented and automated checks pass; new APK and device QA pending**.
- Website → Mobile and Mobile → Website photo parity: **NOT RUN**.
- Contact-value equality across clients after this remediation: **NOT VERIFIED**.
- Login identity/method ownership changed: **NO**.
- Partner Steps 1–8 started: **NO**.
- Production changed: **NO**.
- `MOBILE_USER_PARITY`: **OPEN**.
- `PHASE_1_STEP_1`: **OPEN** because Mobile Partner pre-approval Steps 1–8 parity remains pending after Mobile User parity closes.
- Master updated: **NO**, per the locked instruction to update it only after complete operator PASS.

Open launch gates remain unchanged, including security-notification provider/template configuration, credential-incident remediation, dependency/license advisories, authenticated responsive/security/provider/legal checks and account deletion before launch.

Exact next action: obtain an available EAS Android build allocation (quota reset or separately approved plan), build and install the development APK from Mobile commit `65d1770`, then perform the explicit GOLD_QA_USER checklist above. Only after every live observation passes may `MOBILE_USER_PARITY` be marked complete and the master be updated. Do not begin Partner Steps 1–8 before that closure.
