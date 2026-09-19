# TPL Partner Unified Foundation — Direction Lock and Delivery Plan

Recorded: 2026-09-19. User-authorized planning direction.

This is a supporting decision/implementation document, not another project master. The sole execution tracker remains `C:\Users\Admin\tpl-api\reports\TPL_MASTER_REMAINING_WORK_LOG.md`.

Provenance: saved from the direction supplied by the operator for UF0. Its original statement that the conversation had prepared a plan only, without inspecting Windows repositories or updating the Windows master, describes the input document's preparation. Actual local audit/update evidence belongs in `TPL_PARTNER_UF0_UNIFIED_FOUNDATION_GAP_AUDIT_REPORT.md`. This specification is not an execution receipt.

## 1. Locked objective

Complete the Partner-related foundation spanning Phase 1 Step 1 and Step 2 through one coordinated program: Backend + Partner Website + Native Mobile + Admin + configuration + QA + staging delivery. Preserve completed Personal User work. Creator, Marketplace and Medical full customer products remain later Phase 1 steps; their Partner capability interfaces belong in this foundation.

Use Partner Operating System Master Architecture v2 as the architecture baseline, reconciled with existing code. Preserve working implementations; no replacement architecture or repeated onboarding rebuild. Deliver a functional shared foundation now, with provider-specific adapters connected later. An interface stub alone is not a completed workflow.

Scope, architecture authority, approval policy and major navigation changes require the user's approval BEFORE implementation. Routine fixes and implementation choices within the locked scope should proceed without repeated permission requests. Record any proposed deviation, reason, alternatives and impact in the single master. Never silently expand the denominator or remove failed requirements.

## 2. Product and configuration invariants

UF2 operator addition (2026-09-19): Admin Partners and the future Partner Desk require Print and PDF/XLSX/CSV exports for applicable lists, records and reports. UF2 delivers bounded, permissioned filtered application-list CSV/XLSX and safe application review-summary PDF/print. Future operational reports implement their own permitted exports alongside their flows; no duplicate reporting authority. Map this to existing UF39 (5 units), preserving the 213-unit program denominator.

UF2 correction-cycle decision (explicit operator approval, 2026-09-19): every resubmitted evidence revision restarts at Level 1, then Level 2, then Level 3. Prior decisions and snapshots remain immutable history and cannot approve the new revision. No conditional approval, substitute, escalation or exception policy is implied.

One canonical backend supplies Website, Mobile and Admin. No duplicate identities, catalogue, booking truth or financial truth.

Website & Experience remains the configuration authority for Partner domains/services and supported onboarding content/rules. Preserve current domain/service identifiers, names, mappings, published configuration and eligibility. Do not assume PDF counts are the live inventory.

Map which current settings actually propagate; future settings must declare their consumers and compatibility behavior. Do not assume every arbitrary content change needs an operational state change.

Draft -> preview -> approved publication -> versioned snapshot -> all affected consumers refresh/invalidate. Define and test propagation time, stale-cache behavior and failure recovery. Never show unpublished changes as live.

New service publication does not grant a Partner entitlement. Removal of a referenced service means controlled deactivation/archive; historical applications, bookings and reports remain readable.

Submitted applications retain their evidence/configuration version. New required fields/documents apply through explicit version/migration or rework policy, not silent retrospective invalidation.

Application approval, organization activation, service activation and payout eligibility are separate gates. Preserve the existing boundary until an explicit policy change.

Admin retains Overview / Applications / All Partners / Reports. Website & Experience configures; Partners manages applications and operations. Deep functions open inside Partner 360 or existing dedicated centers. Avoid duplicated configuration pages and walls of cards.

Short customer-facing labels, progressive disclosure, compact filters/tables, accessible responsive controls; native mobile presentation with equivalent permitted actions.

## 3. Evidence baseline and gaps

Input-plan sources: supplied Partner OS v2 PDF; `TPL_ADMIN_PARTNERS_OVERVIEW_THROUGH_SERVICES_CHECKPOINT.md`; supplied `TPL_MASTER_REMAINING_WORK_LOG(2).md`. These are report evidence, not a fresh repository/runtime audit. UF0 must use the actual single master, not create a copy with that supplied filename.

| Area | Evidence at hand | Remaining proof/work |
|---|---|---|
| Personal User | Mobile User parity COMPLETE in master | Preserve regression boundary; not all future customer modules complete |
| Partner onboarding | Steps 1–8 implemented; same synthetic application SUBMITTED; scoped Web/Mobile evidence | Full bidirectional corrections, Admin lifecycle and combined certification |
| Admin Overview | Summary, Performance, Revenue, Services implemented at stated scopes | Services authenticated review; missing financial/booking attribution; remaining shells/workflows |
| Published catalogue | Shared authority and Services publication refresh recorded | All-consumer version propagation, changes/removal/history tests and future configuration coverage |
| Approval | Submitted/Start review visible; document review policies exist | Whole-application L1/L2/L3, reviewer separation, send-back/resubmit, decision audit and activation contract |
| Operations/finance/integrations | Blueprint requirements and some existing primitives | Repository evidence map; classify reuse, extension, missing implementation and external dependencies |
| Platform quality | Scoped automated and synthetic UI checks exist | Full journey, tenant isolation, reliability, restoration, load and production release evidence |

Do not restart historical resolved blockers. Label superseded checkpoints clearly, preserving history. Do not treat unavailable data as zero or implementation tests as live certification.

## 4. Delivery sequence — complete business flows across surfaces

### A. One bounded current-system audit

Run locally in the existing Website, API and Mobile repositories. Read AGENTS.md and the actual single master. Inventory branches/HEAD/dirty worktrees, staging revisions, schema, API routes, permissions, configuration consumers and existing tests. Preserve unrelated edits. No reset/clean or broad deployment.

Create one requirement/evidence matrix: requirement ID, existing source/API/schema, Website, Mobile, Admin, permission, event, test evidence, gap, dependency, acceptance criterion and estimate. Every PDF section maps into this matrix; no duplicate tracker. Record external provider and business decisions separately. Produce the dependency-ordered backlog and the first percentage baseline before coding.

### B. Shared configuration and lifecycle foundation

Close versioned publish/consumer propagation and canonical onboarding mappings. Reuse existing identities and catalogue. Establish compatible API contracts, workflow states, roles, audit, reliable events, idempotency and scoped activation. Put central configuration in the existing authority rather than new disconnected lists.

### C. Finish onboarding-to-activation end to end

Use the existing synthetic Partner when safe. Complete Admin review -> request changes -> Website/Mobile correction -> resubmission -> ordered approval -> conditional activation. Include status/pending-with/action/communication views and evidence history. Preserve existing explicit confirmation gates for the consequential case actions. Do not perform a real payout or send external messages without applicable authorization.

### D. Operational Partner foundation

Deliver service capabilities, supply/rates/availability and transaction lifecycle, CRM/support, commercial/finance/settlement, integration controls, communication, privacy and domain controls in dependency order. Each slice includes its backend, required Web/Mobile actions, Admin control and report evidence. Admin and reporting are NOT deferred to a final isolated stage.

Use approved synthetic fixtures or contract simulators for unavailable providers, isolated from live truth. Certify failure/timeout/retry/reconciliation behavior. Real vendor connectivity stays explicitly NOT CONNECTED until tested; no fabricated verification or finance metrics.

### E. Combined certification and staging delivery

Per slice: meaningful focused tests -> build -> staging deployment of exact tested revisions -> affected live journey checks -> report/master update. Do not rerun the entire platform on every copy change. Run full combined regression at integration milestones and final acceptance.

Final coverage includes both-direction writes, Admin consistency, publish propagation, reviewer/tenant isolation, retries/duplicate submission, restore/logout, responsive/native UX, failure recovery, backup restoration and measured performance targets. API evidence does not replace visible UI certification. Clearly separate required human OTP/secure-device actions from automatable form filling.

Production promotion remains a separate approval after a concrete release manifest, rollback/forward-repair procedure and evidence. Staging authorization does not authorize production changes.

## 5. Future API connection contract

Internal APIs and state machines remain stable; providers implement adapters for declared capabilities. Include configuration/secret references, environment separation, validation/mapping, idempotency, bounded retries, webhook signature/replay protection, reconciliation, observability and per-connector enable/disable controls. Never accept third-party direct database writes.

Before enabling a connector: contract tests, sandbox evidence, staged rollout, kill switch and compatibility checks. New vendor-specific capabilities may require bounded UI/schema additions; promise minimized disruption, not zero future changes. PDF legal/regulatory statements are not certified by this planning review; current role-specific validation is required before activation.

## 6. Test data policy

The supplied planning direction permits removal of genuine staging test data only after inventory, exact dependency identification and a recoverable backup, through supported cleanup/archive limited to those records. Do not wipe tables or delete unspecified accounts. Preserve domains/services/configuration, shared identity authority, unrelated organizations and required audit history. No deletion is performed by this document. **UF0 expressly authorizes inventory/planning only and prohibits deletion or new fixtures.**

Maintain one primary end-to-end synthetic Partner with marked fictional documents and stable fixture identity. Additional minimal isolated actors/fixtures are required for cross-tenant denial, separate approval roles and conflicting-owner tests. Seed/reuse deterministically; no repeated duplicate organizations.

## 7. Percentage and efficiency contract

Input-plan overall implementation/remaining percentages: NOT YET MEASURABLE from the supplied reports; denominator and source coverage had not been audited. This is not 0% complete. Do not invent an overall 70/80/90% estimate.

After audit, assign fixed effort weights to acceptance-level requirements and freeze the denominator. Report:

- Implementation % = weight of requirements with implemented, tested behavior / total foundation weight.
- Certified % = weight satisfying ALL applicable deployed end-to-end acceptance evidence / total foundation weight.
- Remaining % = 100 - corresponding percentage.
- External connectors: connected/tested X of named required Y, separately from foundation %.

Partial requirements must be decomposed into measurable criteria, not given arbitrary half-credit. Keep external credentials/contracts as launch dependencies even when foundation is complete. Display completed, in-progress, blocked and unknown counts, estimate confidence and evidence dates. Report forecast ranges only after code/dependency audit; distinguish engineering time from waiting on user/providers.

Use Astra for bounded architecture reconciliation, difficult cross-module diagnosis and milestone risk review when available and explicitly selected. Use a suitable lower-cost coding model for well-defined implementation and routine checks. Do not promise automatic model switching or lower cost without actual capability/usage evidence. No subagent delegation is authorized solely by model choice.

Reuse source inventory and passing evidence. Avoid repeated full scans, historical re-testing and duplicate reports. Batch related changes into reviewable slices; generate a new APK only for native changes. Stop optional testing when the actual risk is resolved. Report usage only when telemetry is available, never estimated token charges as actual spend.

## 8. Required batch return and handoff

Each batch updates the real master even if OPEN/HOLD: previous -> new status, changed requirements, measured implementation/certified/remaining percentages, evidence, blocker and exact next action. Verify the actual master diff and unique checkpoint; no duplicate master.

Local paths:

- Website: `C:\Users\Admin\tpl-project-d28e1a-integration`
- API/master: `C:\Users\Admin\tpl-api`
- Mobile: `C:\Users\Admin\tplgo-mobile`
- Supporting plan: Website `reports\TPL_PARTNER_UNIFIED_FOUNDATION_DIRECTION_LOCK.md`

First executable task: read this lock plus PDF and actual master; complete Stage A read-only inventory and reconcile this plan against code; update only planning/report/master files, marking this lock as adopted and historical statuses as superseded. Return the measurable backlog, reused assets, gaps, fixed percentage denominator, model-use plan, estimate range and first bounded implementation slice. Do not clean fixtures, change application status, migrate or deploy during the audit itself. Existing published domains/services remain intact.

The authoritative PDF for this local audit is `reports\TPL_PARTNER_OS_MASTER_ARCHITECTURE_V2.pdf` (case-insensitive Windows path). The original plan alone claimed no Windows master update, repository audit, code change, data cleanup or deployment. Consult the UF0 report for work actually performed after adoption.
