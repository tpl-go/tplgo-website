# TPL Partner UF1 — Configuration compatibility and submitted history

Recorded: 2026-09-19. Status: **IMPLEMENTED / STAGING DELIVERED / LIVE CERTIFICATION OPEN**. This report is supporting evidence; the sole master remains `C:\Users\Admin\tpl-api\reports\TPL_MASTER_REMAINING_WORK_LOG.md`.

## Current checkpoint

UF1 extends the existing configuration authority and Partner application, without another catalogue, new navigation or infrastructure. Backend, Website and Mobile scoped changes are committed and pushed. Backend staging health and clean Website Preview health are HTTP 200. Only `staging.tplgo.com` was repointed. No migration, production action, catalogue publication, application decision, upload, identity change, cleanup or APK build occurred.

The operator confirmed the existing Mobile **Submitted/status screen** after the Development Client connection was restored. ADB subsequently detected the submitted application after background/foreground return. The operator also refreshed staging Admin Partners → Overview → Services and confirmed configured names remained visible with no new error, then confirmed the normal Partner Website **Submitted status and saved preview**. These are limited runtime observations, not all-consumer publication certification. Detailed Admin same-fixture read review and a real publication timing cycle remain separately tracked below.

Preserved program: `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`. Historical onboarding/upload/signer blockers are not reopened. No UF2 implementation started.

## Authority, baseline and isolation

Read the UF1 execution handoff, UF0 audit, adopted direction lock and actual master. UF0 remains the architecture/evidence baseline; no whole-system re-audit. No applicable AGENTS.md was found during repository/ancestor discovery. No subagents used.

| Repository | Branch | Before | Delivered scoped source |
|---|---|---|---|
| Website | d28e1a-integration-preview | `4fd2b7b47cdce81d0450ebc0b0b035f61d90ed00` | `8db0b554118eebd0e3ea6b60a4b40c218a2aeffe` (includes UF1 `39dd7ff6c37b461cb7a33516a278aa21bacaeb9a`) |
| Backend | d28e3c3a-qa2b-provider-partner-integration | `11f8e7738a348c1172b9fd80ccf90bb44c643f3b` | `67f4a4dc16c83a582cd5cea8be9b7693d827d11e` |
| Mobile | codex/mobile-m2-authentication | `ccfc27d1fe8c7a404adcfb80f70a4a050670b505` | `a75879b9bd8052c47409d060fc357fde3ef180b1` |

Existing dirty/untracked Website account/wallet/package/type/report work, Backend report/master edits and Mobile auth/UI/assets work were preserved. No reset, clean, stash or branch switch. Website deployment came from a clean Git archive, not the dirty working tree. The isolated local build matched all eight affected application source files after normalizing Git line endings. Mobile Metro/export uses the existing working tree, including pre-existing unrelated edits; its whole working tree is not certified as a clean-release commit. Scoped committed file hashes are recorded in `artifacts/uf1/source-checks.json`.

## Repaired causes and contracts

1. **Mount-only configuration reads and inconsistent caches:** added shared independent version envelope and bounded visible/foreground refresh, without hydrating application forms over edits.
2. **Native content consumer gap:** native application now consumes the permitted published step title/subtitle/helper text. It does not execute configuration as code or duplicate business enums.
3. **Read-time history mutation:** submitted bundle/readiness/requirement reads no longer refresh requirements or backfill authority using the latest configuration. Specialist changes still require explicit authorized writes.
4. **Missing configuration could initialize defaults during GET:** published catalogue reads now fail safely with 503; they never bootstrap or overwrite configuration.
5. **Publication multi-write race/partial commit:** existing catalogue and Partner application-content mutations run within a transaction with advisory/row locking. Existing expected-version checks reject stale writers. Configuration/state/history/activity/internal notification records commit or roll back together; this does not certify a platform-wide event bus or external notifications.
6. **Actual default-content compatibility:** staging has never published Partner application copy (`content=0`, existing content response suffix `:default`). Website now maps this explicit default to version zero instead of showing a false refresh error. No content was published to hide or test this state.

### Published envelope and consumers

`GET /api/v1/partner/configuration` is a public, read-only, no-store endpoint. A repeatable-read transaction supplies `contractVersion:1`, independent `{catalogue,content,policy}` versions, the existing published catalogue, bounded allowlisted step copy, `refreshAfterSeconds:30` and history policy. It exposes no draft, secret, owner record, executable rule or entitlement. Existing catalogue/content APIs remain compatible and have no-store headers.

| Setting / reader | Website | Mobile | Admin | Limit |
|---|---|---|---|---|
| Published domains/services, names, IDs, eligibility | Existing canonical catalogue + envelope refresh | Same catalogue + envelope refresh | Existing Summary/Performance/Revenue/Services APIs refresh | Publishing does not activate Partner/service/payout capability |
| Step title/subtitle/helper text | Steps 1–5 added; existing extended 6–8 content mapping retained | Eight supported step headings/guidance | W&E remains authoring/review/publish authority | Only bounded text; not arbitrary form-definition execution |
| Policy version | Independent version signal | Same signal | Existing policy controls/read models | Server remains readiness/rule authority; no automatic submitted rework |
| Rich field copy, complex choices and future configuration | Existing supported Website mappings retained | Not generalized by UF1 | Existing authoring scope retained | All arbitrary W&E properties are not claimed to have native parity |

Web/foreground native refresh interval is 30 seconds; Web focus/visibility and native foreground also refresh. Requests do not overlap. Hidden/background clients do not poll. Admin aggregate cache TTL is at most 15 seconds for affected cached readers: healthy reads target visibility within 60 seconds, allowing the poll/cache cycle and normal response time. This is not an outage latency guarantee or a measured production SLO. Stale/out-of-order version vectors are rejected. Errors preserve known data with an update/retry notice. Scoped effects cancel stale results on cleanup; Admin owner/permission changes clear private results. Polling does not reload the whole application, dispatch OTP, reset dirty forms, navigate or dismiss an open challenge.

### Save compatibility and submitted evidence

- `saveServices` accepts optional `expectedCatalogueVersion`; new clients send it, older clients may omit it. Stale versions return recoverable 409 before selected scope mutation. Canonical published eligibility still validates all clients.
- Unavailable saved services remain in form state with guidance; there is no silent deletion. Backend rejects an invalid new selection. Historical service references remain readable.
- Prospective submission snapshot schema version 2 records saved catalogue version where known, applicable requirement policy versions and explicit provenance. `contentVersion:null` is deliberate: the backend cannot prove which copy a legacy client saw. Missing provenance is unknown, never inferred from today's publication.
- Existing snapshots/hashes/agreement/declaration evidence are not rewritten. New policy requirements do not get upserted into submitted history during reads, including correction windows.
- Changing country, business type or the selected service set after submission returns `PARTNER_CONFIGURATION_REWORK_REQUIRED`. Same-scope harmless corrections retain the existing permitted path. A full explicit material-rework/migration workflow remains later; UF1 does not silently reinterpret submitted rules or grant an approval.

## Scoped files

Backend (15): `partner.configuration.ts`, `partner.routes.ts`, `partner.service-catalogue.ts`, `partner.service.ts`, `partner.service.test.ts`, `partner.types.ts`, `partner.validation.ts`; Admin `admin.routes.ts`, `partner-configuration-transaction.ts`, its test, `partner-service-catalogue.ts`, `website-experience.ts`, `partner-summary.ts`, `partner-performance.ts`, `partner-revenue.ts`.

Website (11 unique): `app/lib/partner/publishedRefresh.ts`, its test, `partnerApiClient.ts`; `app/partner-preview/PartnerApplicationWorkspaceClient.tsx`; Admin `usePartnerPublishedRead.ts` and the four existing Overview dashboard consumers; two `scripts/uf1-*-configuration-browser.mjs` harnesses. Existing four-tab/sub-view design is unchanged.

Mobile (4): `partnerConfiguration.ts`, `partnerApplicationApi.ts`, `partner-application-workspace.tsx`, `partner-review-lock.rendered.test.js`. No native dependency/configuration changes.

## Automated evidence and limits

| Check | Result / scope |
|---|---|
| Backend service, catalogue, Services and publication transaction tests | PASS: 91 distinct tests across final relevant runs (57 + 15 + 16 + 3); provider dispatch not used |
| Publication integration | PASS on isolated PostgreSQL 54339: rollback on later audit failure, concurrent writer serialization/stale rejection; actual envelope preserves published-only data and missing-config read remains non-mutating |
| Verification policy regression | 15 focused tests passed earlier in the scoped verification; not a whole backend-suite claim |
| Backend TypeScript/build | PASS, including staging release build |
| Website contracts/version tests | PASS: 11 focused tests across final runs; pinned existing Vitest runner |
| Website scoped TypeScript/ESLint | PASS |
| Website unrestricted TypeScript | NOT PASS: pre-existing test typing/shim errors in unrelated contract tests and implicit-any in submitted-destination test. Not changed or hidden by UF1 |
| Website production build | PASS locally and Vercel. Existing Next `ignoreBuildErrors` remains unchanged; separate scoped TypeScript proof is required and passed |
| Website actual workspace rendered tests | PASS at 1363×950, 768×950, 390×950: dirty input/focus/challenge/mount retained, newer copy appears, older response rejected, failed refresh/retry, no extra OTP/application hydration, no page overflow |
| Admin Services rendered tests | PASS at 1365×1000, 768×1024, 390×844: exact configured names, filters/pagination/drilldown, refresh/retry, keyboard, permission denial, delayed-response/logout isolation, no overflow |
| Native actual-workspace focused tests | PASS: 34 tests across four relevant suites, including foreground publication/error/out-of-order/dirty-form handling and existing Step 1/2/session contract regressions |
| Mobile TypeScript/lint | PASS. Initial three UF1 lint warnings corrected; final scoped ESLint clean. Full Jest not rerun under the focused UF1 instructions |
| Android Hermes export | PASS: final JS bundle `entry-751cc05d43fcfc05345d2d205ba35112.hbc`, existing Development APK retained |
| Scoped diff/secret checks | PASS: affected source and documentation diff checks; bounded private-key/access-token pattern scan. Not a comprehensive security certification |

Rendered browser checks used the existing supported Playwright production-build harness with explicitly synthetic sessions/API fixtures restricted to local loopback. Those fixtures do not enter deployed authentication. Screenshots under `artifacts/uf1/` are synthetic. Live in-app browser bootstrap failed with `Cannot redefine property: process`; no reset loop or unsupported workaround was used. Initial local build harness missing Preview/API environment and sandbox subprocess restrictions were resolved before successful runs; they are not Partner product defects.

## Staging delivery and runtime evidence

- Backend exact release: `/home/tpladmin/tpl-api-releases/partner-uf1-67f4a4dc16c83a582cd5cea8be9b7693d827d11e`; only `tpl-api-partner-staging`/4100 restarted. Local/public health 200; unauthenticated Admin Services 401; public configuration 200/no-store. Recovery execution remains false. No migration. Production process/ports/configuration untouched.
- Website Preview: `https://tplgo-website-bklxjkqeb-tplgo.vercel.app`, ID `dpl_cu1W5WtLif28pCqLwsYuktuw6RpX`, READY, target not production. Supported authenticated Vercel CLI Preview GET returned 200 before alias change. Authoritative file metadata matches all eight affected application files plus four unchanged navigation files. Staging alias verification is recorded separately in `artifacts/uf1/website-deployment.json`.
- The CLI beta initially forwarded its global scope argument to curl; using the linked project without that argument produced the successful health check. No protection policy was disabled. HTTP/API evidence is not authenticated browser UI proof.
- Live configuration reports `{catalogue:10,content:0,policy:1}`. Catalogue remains 246 entries, 15 distinct domain keys, 239 active selectable entries, zero duplicate codes; published v10/draft v14. Currency Exchange and eSIM Provider retain their exact names and existing inactive/non-selectable flags. Existing archived QA entries remain preserved.
- Existing installed package is `com.tplgo.mobile`, version 1.0.0/code 1; APK was not rebuilt/reinstalled and app data was not cleared. Metro on 8081 was running. Device initially could not reach its development server (no reverse mapping); one ADB reverse mapping and existing Development Client deep-link restored connectivity. Operator reported **Submitted/status screen**; subsequent ADB background/foreground read detected submitted state and no stale-configuration notice. This is a connection recovery, not an auth bypass or new app build.
- Real publication changes were not made merely for testing. There were no new submissions, approvals, application edits, provider requests or fixture uploads.

### Preservation proof

Read-only staging inventory was guarded to the staging database/release and existing canonical fixture. A name-only lookup was insufficient (two matches); the existing fixture was disambiguated with canonical lifecycle/submission evidence. Raw identifiers, contact values and document contents were not recorded.

All nine baseline/after groups match byte-derived SHA-256 digests: catalogue configuration; Partner application content; one submitted snapshot; fixture organization; nine requirements; five documents; two document links; one agreement; unrelated active organization. The final read occurred after the Mobile resume and Website deployment. Full masked digests/counts are in `artifacts/uf1/staging-preservation.json`. No catalog cleanup, direct database write or lifecycle forcing.

## UF1 acceptance and fixed program progress

The following is a UF1 validation checklist, not a replacement weighted foundation denominator:

| Gate | Result |
|---|---|
| 1. Independent published-only version envelope; no GET bootstrap | Automated + deployed PASS |
| 2. Website refresh preserves dirty state/challenges; stale/error behavior | Rendered synthetic PASS |
| 3. Native foreground refresh and supported published copy | Rendered synthetic PASS; current submitted-screen live observation only |
| 4. Existing Admin reader refresh and role/isolation behavior | Rendered synthetic PASS; live observation tracked separately |
| 5. Version-aware save, old-client compatibility and unavailable selection safety | Focused contract PASS |
| 6. Submitted reads preserve requirements/authority/history; prospective evidence | Focused tests + unchanged staging digests PASS |
| 7. Publication transaction rollback/concurrency | Isolated PostgreSQL PASS; not all platform event flows |
| 8. Scoped build/type/lint/release/source verification and preservation | PASS at stated scope; unrestricted Website typing limitation retained |
| 9. Authenticated Website/Mobile/Admin same-fixture visible read/refresh review | PARTIAL: operator Mobile submitted, Website submitted/saved preview, Admin Services names/no-error observations PASS at their scope; detailed Admin same-fixture read remains unverified |
| 10. Actual all-consumer published-change timing/recovery cycle | NOT RUN on staging; preserved catalogue/content not mutated without specific authorization |

**8/10 scoped gates satisfied at their declared automated/deployment evidence level; 2/10 remain partial/pending.** This is not 80% of the Partner program or 80% live certification. It excludes arbitrary future configuration features and does not convert synthetic tests into live evidence.

Fixed UF0 denominator stays **46 acceptance requirements / 213 units**: evidence-corroborated **41/213 = 19.25%**; known open **127/213 = 59.62%**; unknown **45/213 = 21.13%**. UF14/UF15/UF16 have new implementation/test evidence, but their broader all-consumer/material-rework criteria are not all certified, so no whole-row weight was moved and no arbitrary half-credit assigned. UF40 only gains scoped publication atomicity evidence, not a completed critical-event foundation. Overall implemented-and-tested, end-to-end certified and remaining completion percentages remain **not yet measurable with the full unknown numerator**. External adapter denominator/status is unchanged from UF0; no connector was enabled.

## Remaining limits, rollback and next action

Operator reported a blank area under **Admin → Partners → Applications**. Clarification established this was not the normal Partner application/status page. Read-only source comparison shows the unchanged `applications/page.tsx` mounts `PartnerModuleSection`, whose Applications views intentionally render the existing “This view will be set up next” shell. The same code exists at the pre-UF1 baseline; this is an existing application-management gap, not evidence that UF1 erased application records. No Applications implementation/redesign was performed. The earlier UF0/Services reports already retain this gap. A fully blank/crashed page, if separately observed, would require separate runtime evidence; current operator wording alone does not establish a new crash.

1. Mobile submitted status, Website same-fixture submitted/saved preview and Admin Services configured names/no-new-error are now operator-confirmed. Complete the remaining detailed Admin same-fixture read through an existing supported review surface; the new Applications navigation tab is still a shell. No OTP/contact/token is requested in chat. Live browser automation remains unavailable; API results must not substitute.
2. Real publish-to-all-consumers timing remains unobserved. Use the next genuine approved publication, or prepare a precise reversible canary for separate action approval. Do not publish the entire existing content draft simply to close a test.
3. Explicit material submitted-application rework/version migration, arbitrary configuration-driven field/enum behavior, broader ordered review/event/outbox and activation remain future bounded work. No implicit service entitlement or historical mutation is introduced.
4. Rollback: repoint staging only to previous READY `dpl_7PWD2fCc4Uh5uQmH1nMZACZ7YuXH`; backend named staging process may use retained prior `partner-services-11f8e7738a348c1172b9fd80ccf90bb44c643f3b` release/launcher. No DB rollback needed. Reverting backend reintroduces its old read-time history risk, so gate reads during rollback and prefer a scoped forward fix. Mobile JS rollback requires a reviewed scoped revision/overlay through the same APK; never reset the user's dirty worktree. None of these rollback actions were performed.

After actual UF1 validation, the next implementation action is UF2: contract tests for existing submitted-fixture ordered employee → senior → next-senior review, explicit correction/resubmission and actor separation across Backend/Admin/Website/Mobile, retaining each consequential action's approval gate. No UF2 code or application decision is authorized by this report itself. Partner-only delivery order remains configuration/history → ordered review/corrections → separate activation/Partner workspace → operational slices with Admin/reporting → combined QA. The 48-hour/maximum-target-72-hour planning aim is not a completion guarantee.

All existing notification/SMS approval, CEO delivery, provider/legal/privacy/deletion-before-launch, credentials, dependency, security, restore/load, operational finance and separate production-approval gates remain OPEN. Personal User completion is preserved; Creator/Marketplace/Medical customer completion was not started.

## Actual master update evidence

The final unique UF1 checkpoint and before/after/diff verification are recorded in `artifacts/uf1/master-update-verification.json`. Exact master heading: **Partner Unified Foundation UF1 checkpoint — 2026-09-19**. Heading/checkpoint/new-status counts are each 1; exact canonical master filename count across the three report roots is 1. Scoped `git diff --check` PASS and the actual backend Git diff contains the new checkpoint. The preserved pre-UF1 body SHA-256 is `275a0cb6d4b651fba5a1afaf5ebe8665128d9ce2d0ccdc9e90099df054d1546a`. Existing prior dirty master changes were not broadly staged or committed. The master retains all pre-existing bytes/history, adds one current section and explicitly identifies superseded sequencing as historical. No second master is created.
