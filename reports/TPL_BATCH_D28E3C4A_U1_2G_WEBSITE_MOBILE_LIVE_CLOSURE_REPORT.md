# TPL Batch D28E3C.4A U1.2G — Website ↔ Mobile Live Closure Gate

Date: 2026-09-18 IST

Status: **OPERATOR-CONTROLLED QA HOLD — NO PRODUCT CODE CHANGED**

## Purpose

This continuation is the operator-controlled live gate for the U1.2F staging repair. It does not repeat implementation or automated tests. It preserves the U1.2F Website source, backend source, installed Development APK, GOLD_QA_USER data, verified login ownership, Partner Steps 1–8 and production.

## Safe precheck

| Check | Result | Evidence |
|---|---|---|
| Website staging loads | PASS | Final redirected response HTTP 200 |
| Staging Website deployment | PASS | `staging.tplgo.com` resolves to READY deployment `dpl_HB5wvC4LBhv8DMLDUej5E2vSvCAq`, built from U1.2F source `c28a5fa190a20e53bd8ef06e6767827f1aa31b57` |
| Staging API | PASS | Public health HTTP 200 |
| backend4100 source | PASS | Running directory `/home/tpladmin/tpl-api-releases/user-u12f-eede155404c`; local health HTTP 200 |
| Production separation | PASS | Production frontend and port4000 health remained HTTP 200; no production write, restart, alias or deployment occurred |
| Metro | PASS | Existing local listener returned HTTP 200 |
| Installed APK/device connection | NEEDS OPERATOR VERIFICATION | The existing Android debugging executable is not available from this shell or its focused standard locations. No SDK was installed and no device/app state was changed. The authoritative supplied installed build remains EAS `39c750eb-3a0e-47ea-84d4-dab3257e10cb`, source `50c43904d17783da7e9abbac1ebef354543fc3ea`. |
| GOLD_QA_USER session | NEEDS OPERATOR VERIFICATION | The supported browser connection failed at startup before a tab/session was accessible. The known setup path was attempted once and was not reset or looped. |

Unrelated dirty and untracked files in Website, backend and Mobile workspaces remain untouched.

## Verified-contact parity assessment

Read-only current-source inspection establishes:

- Website `app/components/account/LoginMethods.tsx` implements the certified explicit Add Mobile/Add Email sensitive-action flow, including existing-method reauthentication, target verification, safe already-added handling and refreshed session adoption.
- Mobile `src/components/user-account/profile-module.tsx` displays verified methods but explicitly tells the customer to use Website My Account to add another sign-in method.

Therefore:

- Website verified Mobile change flow: **PRESENT**.
- Website verified Email change flow: **PRESENT**.
- Mobile verified Mobile change flow: **MISSING**.
- Mobile verified Email change flow: **MISSING**.
- `MOBILE_VERIFIED_CONTACT_PARITY_REQUIRED`: **YES**.

No real login-method change is needed or authorized in this live gate. The source result alone keeps `MOBILE_USER_PARITY` OPEN even if all remaining operator observations pass.

## Operator-controlled live checklist status

Browser automation is unavailable, so the batch is paused for normal operator-controlled browser/device actions as required. No actual location, date, contact, image, identifier, token or private URL is recorded.

| Gate | Status |
|---|---|
| Country selector behavior and save/reload | NOT RUN |
| State/Region dependent selector | NOT RUN |
| City dependent selector | NOT RUN |
| Website/Mobile location equality | NOT RUN |
| DOB exact date across reloads/clients | NOT RUN |
| Anniversary exact date, if applicable | NOT RUN |
| Website synthetic photo upload/persistence | NOT RUN |
| Website → Mobile photo | NOT RUN |
| Mobile photo replacement | NOT RUN |
| Mobile → Website photo | NOT RUN |
| Personal profile contact parity | NOT RUN |
| Verified login methods unchanged | YES — no identity action occurred in this checkpoint |
| `/partner-entry` and workspace separation | NOT RUN |
| Creator/User/Partner separation | NOT RUN |
| Website/Mobile cold restore | NOT RUN |
| Logout and signed-out deep-link guards | NOT RUN |

The operator should stop on the first reproducible defect and report only the failed stage and safe visible result, without actual personal values. Profile mutations require explicit operator approval at the point of action. Photo work must use a synthetic QA image; removal needs separate approval.

## Current status and next action

- Code changed: **NO**.
- APK built/installed/cleared: **NO**.
- Verified login identity changed: **NO**.
- Partner Steps 1–8 started: **NO**.
- Production changed: **NO**.
- `MOBILE_USER_PARITY`: **OPEN**.
- `PHASE_1_STEP_1`: **OPEN**.

Exact next action: the operator uses the normal authenticated staging browser and existing Development APK to run the live checklist in order, beginning with Country → State/Region → City save/reload and cross-client equality. Stop and return the first defect, or return PASS/FAIL for each gate without disclosing values. After the non-contact live gate, implement and certify the separate **Mobile verified login-contact Add/Change parity** batch before Mobile User parity can close. Do not start Partner Steps 1–8.
