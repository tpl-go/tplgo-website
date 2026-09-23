# TPL Partner Desk M2.6A — Common Media Moderation Automation Foundation

## Authenticated live closure — 2026-09-23

Checkpoint ID: `PARTNER_DESK_M2_6A_AUTHENTICATED_LIVE_CLOSURE_20260923_B`

Previous status: `M2_6A_MEDIA_MODERATION_AUTOMATION_FOUNDATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_PENDING`.

Current status: **`M2_6A_MEDIA_MODERATION_AUTOMATION_FOUNDATION_STAGING_READY_MANUAL_MODE`**.

The operator opened the existing authenticated staging Admin session at Partners → All Partners → retained synthetic Partner → Media Library and observed **Moderation mode: MANUAL** with **No automated provider configured**. This authenticated observation agrees with the server-authoritative `HOTEL_MEDIA_POLICY_V1` version 1 policy: provider `NONE`, human review required, automatic approval Off and automatic rejection Off. No fabricated risk score, confidence, AI result or assessment is present.

The existing Development Client and app data were reused after wireless ADB reconnect; no APK, reinstall, storage clear or API-target change occurred. Read-only native observation showed the retained synthetic organization and all three media in the canonical Partner Media Library: property image approved/version 3/non-cover, property YouTube approved/version 5/non-cover, and room image approved/version 3/room cover. Mobile exposed no provider, risk or assessment internals. Refresh retained three active records without a duplicate or mutation. Android Back returned from Media Library to the same scoped Partner Command Center. Home/background then foreground restoration returned to `com.tplgo.mobile/.MainActivity` with the same synthetic organization and `3 of 100 active` media state.

Final read-only staging reconciliation returned exactly one active `HOTEL_MEDIA_POLICY_V1` policy in MANUAL/NONE mode, human review required and both auto-eligibility flags false; assessment/risk/confidence counts were `0/0/0`; approved/pending counts were `3/0`. The exact active rows remain property image v3/non-cover, property YouTube v5/non-cover and linked room image v3/cover. The approved-only property/room/video composition is unchanged. Staging port 4100 and untouched production port 4000 health both returned HTTP 200.

No product defect was found and no code, deployment, database/media state, policy, permission or APK changed during closure. Backend remains source `4016795d6407c2cb9fa7e7283b2c0fb70f419932` on staging release `partner-m2.6a-manual-4016795`; Website/Admin remains source `402851ebfad60ec6221b7aa88a4c4dfe04b6cf95` in READY deployment `dpl_C9tdnSGbw1jaC5gmJw73GkAs2b5Q`; Mobile remains `0fd2f8e72ec1b0e79a30f118465d3c5076192732`. Documentation-only commits are recorded separately and require no staging deployment.

Completed M2.6 remains `M2_6_HOTEL_MEDIA_STAGING_END_TO_END_PASS`. The fixed **46 requirements / 213 units** denominator and `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN`, `PHASE_1_STEP_1=OPEN` remain unchanged. The next separate Hotel-only step is **Hotel content, property/room amenities, policies and structured inclusions**; it may begin as a new bounded batch and was not started here.

Recorded: 2026-09-23

Checkpoint ID: `PARTNER_DESK_M2_6A_MEDIA_AUTOMATION_20260923_A`

Previous status: `M2_6_HOTEL_MEDIA_STAGING_END_TO_END_PASS`.

Current status: **`M2_6A_MEDIA_MODERATION_AUTOMATION_FOUNDATION_STAGING_PARTIAL_AUTHENTICATED_LIVE_PENDING`**.

The completed M2.6 Hotel Media status remains preserved. M2.6A adds a provider-neutral foundation and does not reopen or alter the verified upload, manual review, approved-gallery or export flows. Implementation, actual-PostgreSQL verification and staging delivery are complete. Authenticated Admin visual observation and native Mobile read-only regression remain pending because the supported browser connection failed during initialization, the headless staging URL stopped at Vercel secure login, and ADB discovered no device. These access limits are not relabelled as product failures or live PASS.

## Delivered common foundation

One common moderation layer now sits above the existing canonical Media Engine. It is selected by stable service/capability-family configuration and does not branch on the Hotel display name. No second media store, upload pipeline, review system or family-specific worker was created.

Migration `0059_partner_media_moderation_automation_foundation.sql` adds:

- Versioned `partner.media_moderation_policy_profiles` with active/effective versions, family and stable service codes, allowed media types, limits, required checks, optional future checks, risk thresholds, human-review requirements and provenance.
- Durable `partner.media_moderation_assessments`, bound to organization, service scope, media ID, media version and policy version. It supports bounded structured checks/reasons, status, recommendation, final decision source, correlation/idempotency, attempts and timestamps. It has no raw provider-response field.
- Indexed service-policy and organization/service/media assessment lookups. Responses remain bounded to 100 service scopes/assessments.

Only `HOTEL_MEDIA_POLICY_V1` is active:

- Capability family: `stay_unit_inventory`.
- Stable service code: `hotel`.
- Kinds: property/room images and structured YouTube.
- Existing JPEG/PNG/WebP and structured-video boundaries.
- Existing size/dimension, scope, caption/alt text, display-order and images-only-cover behavior.
- Default submission state remains pending review; approved-active-only gallery projection remains authoritative.
- Mode `MANUAL`; provider `NONE`; auto approval/rejection ineligible; human review required.

Unknown or unconfigured services resolve to an inactive `UNCONFIGURED_MANUAL_FALLBACK`. No other capability family is active or certified.

## Runtime and provider safety

The shared runtime contract supports `MANUAL`, `ASSISTED` and `AUTO`, but the deployed staging launcher explicitly sets:

```text
MEDIA_MODERATION_MODE=MANUAL
MEDIA_MODERATION_PROVIDER=NONE
MEDIA_AUTO_APPROVAL_ENABLED=false
MEDIA_AUTO_REJECTION_ENABLED=false
MEDIA_MODERATION_AUTO_ENVIRONMENT_AUTHORIZED=false
```

Malformed or missing mode resolves to MANUAL. ASSISTED/AUTO without a provider resolves to MANUAL. AUTO also requires an explicit environment authorization flag, an approved provider, active AUTO policy, thresholds, family/profile eligibility, an auto-decision flag and a complete audit path. Hotel V1 itself remains MANUAL and human-required, so it cannot authorize automation even if runtime flags are changed independently.

`NoMediaModerationProvider` is the only provider adapter. Its health state truthfully says no provider is configured; assessment execution fails closed. No SDK, API call, credential, provider account or cost was added. Queue seams produce a version-bound, policy-bound SHA-256 idempotency key, bounded retry/timeout/dead-letter contract and `enqueue=false` in MANUAL mode. No fake moderation job or AI score is produced.

The common versioned reason/check taxonomy separates technical file rejection, future recommendations and the final publication decision. A no-provider assessment can record only deterministic/not-run results with `NOT_RUN_NO_PROVIDER`, null risk/confidence and `MANUAL_REVIEW_REQUIRED`. It cannot change media publication. A stale assessment cannot bind to a newer media version.

## Human authority and Admin visibility

Existing `partner_media.review` remains the final authority. The normal moderation transaction now binds a matching assessment, if one exists, to `decision_source=HUMAN` and the authorized reviewer. Partner surfaces do not receive internal provider, risk or assessment data.

The existing Admin Media Library now shows, without redesigning the page:

- Moderation mode.
- Final authority: authorized Admin reviewer.
- Hotel policy code/version.
- Provider state: no automated provider configured.
- Automatic approval and rejection Off.
- Per-media assessment state, or the truthful `Not run · no provider` state.

There is no Admin policy-write endpoint in this slice. Policy activation remains an audited source/migration release, so an unauthorized Admin cannot change mode/profile through a hidden or direct client route.

## PostgreSQL and automated evidence

The exact committed migration and runtime code passed a fresh disposable PostgreSQL 17 run on `127.0.0.1:54339`; the cluster was stopped immediately after verification.

- Actual PostgreSQL: **12/12 PASS** across common automation and existing moderation transaction suites.
- Foundation unit/regression assertions: **29 PASS** across the scoped runs (final automation guard file 6/6, plus unchanged RBAC/media/supply/export assertions from the combined run).
- Website/Admin guidance test: **1/1 PASS** with `.tmp` deployment snapshots excluded from test discovery.
- Backend TypeScript and production build: PASS.
- Website scoped ESLint: PASS.
- Website production Webpack build: PASS, 243 routes. The first local Turbopack run was stopped after old `.tmp` deployment snapshots caused an excessive scan; the clean Vercel Git build compiled with Turbopack in 14.6 seconds and completed READY.
- Scoped secret patterns and `git diff --check`: PASS; only line-ending notices were emitted.

The PostgreSQL evidence covers Hotel profile persistence/resolution, unknown-family MANUAL fallback, truthful no-provider state, idempotent assessment recording, human-decision binding, stale-version isolation, cross-tenant denial, assessment/audit atomic rollback and AUTO fail-closed behavior. Existing moderation tests preserve reviewer permission, Partner self-review denial, read-only Admin denial, one-winner concurrency, stale rejection, idempotent replay, approval/rejection projection safety and injected-audit rollback.

## Staging delivery and protected migration

Backend source: `4016795d6407c2cb9fa7e7283b2c0fb70f419932`.

- Scoped release artifact SHA-256: `15e859d87dd043dc57b4f3fc66e08e39b4b6451852b99e9a279d7fc76566e179`.
- Protected pre-migration backup: `/home/tpladmin/backups/partner-m2.6a-pre-0059-4016795.dump`.
- Backup SHA-256: `230dd78fbbe724c57373c52fec96df65101740661d44dac747fd92a2b55823cc`.
- `pg_restore --list`: readable, 1,314 entries.
- Immutable staging release: `/home/tpladmin/tpl-api-releases/partner-m2.6a-manual-4016795`.
- Process: only `tpl-api-partner-staging` / port 4100.

The first process switch used a three-second readiness gate; the new Node process started immediately after that narrow window, so the script safely restored the previous launcher. A bounded retry with a 20-second readiness loop switched to the new release successfully. This was a startup-timing defect in the release script, not an application crash or data rollback. Staging and untouched production API health returned HTTP 200 after the final switch.

Website/Admin source: `402851ebfad60ec6221b7aa88a4c4dfe04b6cf95`.

- Vercel deployment: `dpl_C9tdnSGbw1jaC5gmJw73GkAs2b5Q`.
- Preview: `tplgo-website-8vher1kxv-tplgo.vercel.app`.
- Build log confirms branch `d28e1a-integration-preview`, commit `402851e`, successful Turbopack build and READY deployment.
- Only `staging.tplgo.com` was assigned to this preview.

Mobile source remains `0fd2f8e72ec1b0e79a30f118465d3c5076192732`. No Mobile source or native dependency changed, and no new APK was built. The installed Development Client/app data were not cleared or reinstalled.

## Read-only staging regression

Canonical post-deployment readback proves:

- One active Hotel policy: `HOTEL_MEDIA_POLICY_V1` version 1, MANUAL, NONE, human required, both auto eligibility flags false.
- Zero assessment rows. Existing media did not receive fabricated AI/no-provider results.
- Exactly three active media rows remain, all approved: property image version 3/non-cover, room image version 3/cover, property YouTube version 5/non-cover.
- Zero pending active media.
- Approved-active-only gallery projection remains unchanged: two property entries (image + YouTube) and one room image.
- Staging API and untouched production API health: 200.

The deployed Website preview is protected by Vercel login for a new headless session. The supported in-app browser also failed during its existing environment initialization, so no authenticated Admin visual PASS is claimed. ADB returned no connected device and no wireless service; no reset/reinstall/app-data clear loop was attempted. Prior M2.6 operator-observed Website/Mobile/Admin/gallery evidence remains historical PASS and was not invalidated by source or data mutation.

## Safety and remaining gate

No external moderation provider request occurred. No API key, credential, provider SDK or spend was introduced. No media, catalogue, inventory, availability, rate, booking, application, activation, finance, payout, notification, real Partner or production record changed. The existing three approved synthetic media and their audit history remain immutable.

The fixed **46 requirements / 213 units** denominator is preserved. No whole-program percentage is invented. `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain unchanged.

Exact remaining action: in the existing authenticated staging Admin session, open the retained synthetic Partner → Media Library and confirm `Moderation mode: MANUAL`, `HOTEL_MEDIA_POLICY_V1 · version 1`, `No automated provider configured`, and both automatic decisions Off while all three records remain Approved. Then reconnect the existing Development Client and confirm the three approved records/gallery remain unchanged. These are strictly read-only checks; no review or media mutation is needed.

After those observations, M2.6A may advance to `M2_6A_MEDIA_MODERATION_AUTOMATION_FOUNDATION_STAGING_READY_MANUAL_MODE`. The next separate Hotel-only step is **Hotel content, property/room amenities, policies and structured inclusions**. It was not started.
