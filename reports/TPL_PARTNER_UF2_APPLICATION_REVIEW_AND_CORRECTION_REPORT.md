# TPL Partner UF2 — Application review and cross-client correction

Recorded: 2026-09-19. **IMPLEMENTED AT THE BOUNDED SCOPE / STAGING DELIVERED / LIVE WORKFLOW CERTIFICATION OPEN**.

Sole master: `C:\Users\Admin\tpl-api\reports\TPL_MASTER_REMAINING_WORK_LOG.md`.

## Current checkpoint

- Admin Applications is a real permissioned, server-paginated list/detail. The operator opened staging Applications and the same synthetic record and confirmed **list and saved details visible, no error**. This is authenticated operator evidence for read visibility only.
- Employee → employee's senior → next senior is enforced through explicit, versioned organization-specific reviewer mapping. Three distinct active eligible reviewers are required. No real reporting relationship has been inferred or assigned.
- Approved policy: **every resubmission restarts all three review levels at Level 1**. Earlier decisions remain immutable history and cannot approve the new revision.
- Brand-name/description corrections use the same requested-field contract on Website and Mobile. Backend blocks other field changes and preserves prior submission snapshots, evidence and UF1 material-rework restrictions.
- CSV/XLSX application-list export is bounded to 500 filtered rows. PDF/print is an allowlisted review summary. Private notes, contact values, bank/tax details and private document URLs are excluded.
- Backend, Website and Mobile scoped changes are committed/pushed. Staging Website alias and backend revision are verified. Production unchanged. No application lifecycle action, reviewer assignment, upload, cleanup, external notification or new APK occurred.
- Actual fixture remains one SUBMITTED application. Nine preservation groups match the UF1 baseline. Catalogue published version 10, content 0, policy 1 remain unchanged. Recovery execution remains disabled.
- `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.

## Operator follow-up — Mobile login and organization choices

The operator confirmed secure Partner login succeeded and reported both Website and Mobile show Under review and Active Partner choices. Opening the review choice shows application status; the other choice shows active status. This closes the limited operator-controlled Mobile login/status visibility gate, not correction/resubmission or full session certification.

A fresh staging read-only query found **two distinct organization records linked to the fixture owner**, both with active membership and the same displayed legal name:

- **PARTNER_QA_FIXTURE**: organization draft; exactly one submission, lifecycle **SUBMITTED**; not approved/activated.
- **EXISTING_OTHER_ORGANIZATION**: organization active; zero application submissions. This is the pre-existing active organization protected by the UF1/UF2 preservation baseline, not a new approval of the QA application.

Source inspection confirms the chooser uses separate canonical organization records. Mobile groups SUBMITTED/UNDER_REVIEW/RESUBMITTED under the customer label “Under review”; Website resolves the same canonical selection/status contract. The label does not prove an employee has started review. Same-name presentation explains the ambiguity; no same-record activation defect was established. No organization, membership, application, session or status was changed by this investigation. No cleanup, new fixture, code change or deployment.

Masked evidence: `artifacts/uf2/organization-choice-read.json`. Continue the submitted QA application only; leave the separate active organization untouched. Reviewer mapping and retained case-action approvals still block the live ordered-review/correction cycle.

## Exact delivery

| Surface | Source / delivery | Evidence |
|---|---|---|
| Website | `25606679632bc43c36b9acbb0f7884f8a67a8f6a` | Scoped commit pushed; clean Git archive matches nine production-built application files. |
| Website Preview | `dpl_4avbsmrWxafbSdaEnHLWF3hRteFY` / `https://tplgo-website-84ibmesfg-tplgo.vercel.app` | READY, Preview target, source SHA and 13 uploaded source/navigation hashes matched authoritative Vercel metadata. Preview Applications route HTTP 200 before alias change. |
| Website alias | `https://staging.tplgo.com` | Authoritative alias metadata points to that exact deployment. No production alias operation. |
| Backend | `36593a3a2e7ee0b7eeb3f6d3d2a2d793c4f0f6a3` | `/home/tpladmin/tpl-api-releases/partner-uf2-36593a3a2e7ee0b7eeb3f6d3d2a2d793c4f0f6a3`; only `tpl-api-partner-staging`, port 4100 restarted. Local/public staging health 200; unauthenticated application list/export 401. |
| Mobile | `09988baac40c0fdd5b75c16b540a14626ebd8160` | Five scoped Partner files committed/pushed. JS-only, same installed Development APK and app data. Metro/export includes pre-existing unrelated working-tree changes; not a clean commit-only runtime. |

Hermes artifact: `_expo/static/js/android/entry-9484c0f55ff618a099f282876151dc08.hbc`; SHA-256 `aedb83bec2beedbcddd750fc2d413b12cbe13bf8eeb12d239e395429c4ba15d1`. Existing owner/project/package/native configuration preserved.

## Scope and contracts

| Acceptance group | Implementation and automated evidence | Actual fixture live evidence |
|---|---|---|
| Applications queue | Database keyset pagination, stable date/ID ordering, indexed business/reference search, status/country/service/type filters; no whole-dataset browser pagination. Existing view names and four main sections preserved. | Operator list/detail visibility PASS. Search/pagination not independently live-certified. |
| Application detail | Reuses submitted snapshot, masked contact summary, specialist evidence links, readiness/blockers, history and permissioned actions. | Same submitted record visible; no decision taken. |
| Reviewer assignment/order | Explicit mapping, distinct reviewers, current-level authority, specialist readiness, stale/version checks, actor-bound idempotency, older-route bypass denial. | OPEN: only one eligible existing Admin reviewer found; zero assignment rows. Three approved eligible actors and their reporting order are required. |
| Correction cycle | Only requested `brandName` / `description` editable, canonical owner/admin authority, omitted fields preserved, material-change denial. New immutable revision links history and resets all levels. | OPEN: Request Changes and resubmission not performed. |
| Website/Mobile contract | Both clients show canonical pending-with/action/timeline; minimal correction payloads, requested controls only. | Live write/read/write comparison and resubmission OPEN. |
| Snapshot/UF1 compatibility | Advisory transaction lock, original snapshot/hash retained, no read-driven rewrite of submitted records, old review cannot approve new revision. | Nine staging preservation hashes PASS. Approved publication timing still OPEN. |
| Durable communication intent | Decision, actor/time/reason/evidence version and internal event committed atomically; retry deduplication. CEO intent after final approval only. | No external email/WhatsApp/SMS/push sent or certified. |
| CSV/XLSX | Same filtered/sorted server query, max 500 matching applications; larger scope returns explicit refine-filter error. Formula escaping, allowed columns, no-store private direct response, audit digest. | Authenticated download not live-certified. |
| PDF/print | Safe summary, repeated headers/page breaks/date context; private notes and action controls excluded. PDF rendered and inspected. | Authenticated download/print not live-certified. |
| Authorization/isolation | Wrong reviewer, same reviewer, stale/concurrent actions, old route bypass, owner/read-only correction denial, private export boundary tested. | Full actual multi-actor security journey OPEN. |

Unsupported exceptional overrides, substitutes and conditional approval remain unavailable. Approval does not activate organization, services, payouts or operational Partner Desk. Reviewer assignments are administrative assertions of approved reporting order, not automatic HR hierarchy inference. Eligible-reviewer options are currently bounded to 100; a future larger staff directory needs its own paginated search.

## Automated verification

- Backend: service **61/61**, HTTP routes **36/36**, export format/layout **8/8**; total **105/105**. Isolated local PostgreSQL UF2 **2/2**, UF1 transaction **3/3**. Local and release TypeScript/build PASS.
- Website: **67/67 affected tests** after updating the historical empty-shell and unassigned-review assumptions. Scoped application typecheck and ESLint PASS. Clean isolated production build and Vercel production build PASS. The project's broad typecheck retains existing test-library declaration errors; it is not claimed as a full typecheck PASS.
- Synthetic rendered production-browser checks PASS at **1365×1000**, **768×1024**, **390×844**: bounded queries, pagination, applied search, export request, actual detail/actions, correction field controls, confirmation cancel/confirm, no horizontal overflow, print privacy, permission removal and delayed-response exclusion after logout. Fixtures are local harness-only; this is not authenticated staging certification.
- Mobile: **56/56 focused rendered/API/model tests**, TypeScript, scoped lint, Android Hermes export, public config PASS. Full unrelated Jest suite not rerun. No native dependency/config change.
- Scoped diff checks and pattern-based secret checks PASS across 13 Website, 18 Backend and 5 Mobile committed files. Pattern checks are not an exhaustive security audit.
- Existing supported in-app browser runtime remained unavailable (`Cannot redefine property: process`); no bootstrap/reset/install loop. Authenticated browser observation used the operator's normal session.
- A mistakenly started dirty-root Website build was stopped; it was not used as release evidence. The tested/released Website source came from the isolated clean archive.

## Mobile runtime evidence

The phone remained connected through existing wireless ADB. The operator reported Expo's scan/development launcher rather than a TPL application error. Metro had stopped. Its first restart bound IPv6 `::1`; IPv4 `127.0.0.1:8081` returned ECONNREFUSED, while `::1` returned `packager-status:running`. The existing ADB reverse route requires the IPv4 listener. Correcting Metro bind mode restored IPv4 HTTP 200; the existing Development Client was reopened and requested its JS bundle. No APK rebuild/reinstall, app-data clearing, session bypass or fixture mutation occurred.

Metro completed the Android bundle (1,908 modules). ADB then detected the installed TPL package and normal Login screen, not a development launcher or configuration error. The operator subsequently confirmed secure Partner login and application-status visibility on both clients. Limited Mobile login/status visibility: **PASS — OPERATOR OBSERVED**. Connection recovery is not correction/resubmission certification.

## Migration, backup and isolation

Additive `0054_partner_application_review.sql`: organization-scoped reviewer-assignment table, queue/latest/search/reference indexes. Scope/compatibility/rollback were documented before applying it. Ledger baseline was 43 migrations through 0053; only 0054 was applied transactionally. Committed migration hash matches the applied hash `10799b4424014de034b7b1b4dc03227e65c2de5a05c286bec2daa4415ef5b5a5`.

Fresh staging backup: `/home/tpladmin/backups/partner-uf2-2026-09-19T17-58-11-187Z/staging-before-0054.dump`.
SHA-256: `6b98bf903ca216a4c21cb0ec3dc07d242b216890099c809a20e677efe36851a4`.
Archive readability verified; a restore drill was NOT performed. Protected backup permissions were applied. Existing records were not rewritten; assignment rows remain zero.

Rollback: restore the previous staging process launcher `/home/tpladmin/start-partner-staging-uf1-67f4a4dc16c83a582cd5cea8be9b7693d827d11e.sh`; Website may reassign staging only to UF1 deployment `dpl_cu1W5WtLif28pCqLwsYuktuw6RpX`. Retain additive schema and all audit/history. Use bounded forward repair for post-commit data issues, not database rewind. No rollback was needed.

Production databases, processes, aliases and ports 4000/4200 were not operated on. Production health was not inferred from staging health. No catalogue publication or eligibility change occurred.

## Progress accounting and remaining scope

The fixed program remains **46 requirements / 213 effort units**. UF17 (8 units): ordered reviewer implementation/test evidence advanced. UF18 (5): requested-field correction/reset evidence advanced; live cross-client acceptance remains open. UF39 (5): bounded first exports implemented; asynchronous jobs, saved reports, schedules and later operational exports remain open. UF40 (5): scoped transaction/event/retry evidence advanced; broader recovery/observability acceptance remains open.

No entire row or arbitrary half-credit is awarded from these subcriteria. Whole-program implemented/tested, certified and remaining percentages remain **NOT YET MEASURABLE** because the complete weighted numerator, including the prior 45 unknown units, has not been resolved. The UF0 **41 corroborated / 127 open / 45 unknown** split is historical evidence classification, not today's certified completion score. Denominator unchanged; no external connector connected in UF2.

First export scope is mapped to existing UF39; no duplicate reporting system/master. Global Unicode PDF font coverage, very large asynchronous exports and load certification are not claimed. Existing package audit findings were not silently changed or relabelled as UF2 regressions.

## Exact remaining gates and next action

1. Mobile secure login/status visibility is operator-confirmed. Continue only the Under review choice belonging to the submitted QA application; leave the separate existing active organization untouched.
2. Provide three distinct authorized staging reviewers with the approved employee → senior → next-senior mapping. No staff hierarchy/account is created automatically; current single eligible reviewer cannot certify separation of duties.
3. Present the actual same-fixture action summary and obtain the retained action authorization before Start Review/Request Changes as applicable. Then perform Website → Mobile and Mobile → Website permitted brand/description correction, resubmit once with confirmation, and review the new revision from Level 1.
4. Complete required specialist review prerequisites, L1/L2/final decision gates, safe exports and combined live regressions without activation or external sends. Final application approval still requires its separate confirmation.
5. UF1 genuine approved publication-to-all-consumers timing remains OPEN. No existing draft is published solely to manufacture evidence.

UF3 activation/post-approval workspace is the next implementation slice only after the applicable UF2 gates/policy prerequisites; it was not started here. Personal User COMPLETE preserved. Partner Mobile and Phase 1 Step 1 stay OPEN.

## Evidence files

`reports/artifacts/uf2/`: scoped commit receipts, deployment source/alias receipt, migration/backup receipt, public staging health, nine-group preservation comparison, validation summary, synthetic browser screenshots/print PDF and actual master-update verification. None contains real contacts, tokens, raw fixture IDs or private documents.


## Historical in-progress checkpoint (superseded by current delivery above)

# TPL Partner UF2 — Application review and correction

Recorded: 2026-09-19. Current status: **IMPLEMENTATION / VALIDATION IN PROGRESS — NOT YET DEPLOYED**.

This is a supporting report. The only master is `C:\Users\Admin\tpl-api\reports\TPL_MASTER_REMAINING_WORK_LOG.md`.

## Current checkpoint

- Operator approved: every resubmission starts again at Level 1. Previous decisions remain history and do not approve a new revision.
- Implemented locally: bounded Admin Applications queue/detail, explicit three-reviewer mapping, ordered transitions, atomic decision/event writes, owner-authorized requested-field correction, canonical public review progress, bounded private CSV/XLSX and summary PDF/print.
- Automated so far: Partner service 61/61; export format 8/8; isolated PostgreSQL UF2 2/2 and UF1 3/3; focused Mobile rendered/API/model 56/56; scoped Website typecheck PASS; isolated Website production build PASS; synthetic production-browser 1365x1000, 768x1024, 390x844 PASS. Final source/diff checks and staging delivery remain in progress.
- Unfiltered Website typecheck has existing test-declaration errors outside the UF2 scope; scoped application typecheck passes. No affected errors are treated as unrelated without inspection.
- Staging preservation inventory: nine record-group hashes match UF1, including the one submitted fixture, catalogue, linked documents, agreement and unrelated active organization. Recovery execution remains disabled; staging health HTTP 200.
- Actual submitted fixture has not been reviewed, corrected, resubmitted or approved. Staff mapping and retained case-action confirmations remain outstanding. No external CEO delivery claimed.
- `MOBILE_USER_PARITY=COMPLETE`; `PARTNER_MOBILE_PARITY=OPEN`; `PHASE_1_STEP_1=OPEN`.
- No production change, catalogue publication, cleanup, identity change or new APK.

## Evidence boundaries

Local test actors are isolated synthetic fixtures. Browser tests use the actual production-built components with API/session fixtures confined to the test harness. They do not certify an authenticated staging Admin session. ADB detects a device but its initial screen dump did not establish a visible app screen. Existing browser runtime limitation is not being looped.

UF1 actual approved publication-to-all-consumers timing remains OPEN. The Applications shell is replaced in local source; no deleted data is inferred from the former empty shell.

## Scope and safety

The existing navigation remains Overview / Applications / All Partners / Reports. Specialist evidence views are reused. Submitted snapshot/hash and preceding reviews are preserved; legal/business type/country/service material rework remains prohibited by UF1. Approval does not activate an organization, service or payout.

Reviewer assignment is explicit, permissioned and versioned, with distinct employee/senior/next-senior IDs. No real staff reporting relationship is inferred or assigned. Missing mapping fails closed. CEO intent is a durable internal event only; external channels remain unconfigured/unclaimed.

Correction scope in this slice is Business Identity `brandName` and `description`. Other correction fields are unavailable rather than silently editable. Both clients submit only requested values; backend preserves omitted canonical values and checks existing owner/admin authority. A rendered/typechecked UI is not cross-client live certification.

Exports use role-authorized generation/download in one request, private no-store responses and allowlisted fields. No private object/public URL or retained file cache is introduced. Filtered CSV/XLSX are capped at 500 matching rows; larger requests must narrow filters. Large async jobs, scheduled exports and future Partner Desk report exports remain later UF39 subcriteria. PDF/print exclude contact values, bank/tax details, private notes and document URLs. Formula injection is escaped.

## Additive migration plan — before staging application

`0054_partner_application_review.sql`: new organization-scoped reviewer-assignment table plus queue/latest/name/reference indexes on submissions. No existing submission, snapshot, document, agreement, catalogue or ownership rows are rewritten. Existing code remains compatible with the added table/indexes.

Before application: take a fresh staging-only PostgreSQL custom-format backup, verify database identity and archive readability, record checksum without secrets; confirm current migration ledger is through 0053. Apply only 0054 transactionally and record its journal hash/timestamp. No bulk migration runner against other databases.

Rollback: restore the prior staging process release if new health/permission checks fail. Retain additive schema/indexes and audit history; do not delete reviewer decisions or rewind a live database. Any post-commit data issue requires bounded forward repair. Production and port 4000 are outside the deployment target.

## Progress accounting

Fixed UF0 denominator remains 46 requirements / 213 units. UF17 ordered review, UF18 correction, UF39 export and UF40 atomic event work are mapped here without expanding weights. No complete program percentage is claimed: whole-program implementation/live numerator and 45 unknown units have not become fully auditable from this bounded slice. Preserve prior 41 corroborated / 127 open / 45 unknown evidence classification as historical baseline, not completion percentages. Final acceptance subcriteria and delivery receipts will replace this in-progress checkpoint.
