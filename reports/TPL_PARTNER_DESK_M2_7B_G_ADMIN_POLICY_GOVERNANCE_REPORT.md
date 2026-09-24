# TPL Partner Desk M2.7B-G — Admin Policy, Inclusion and Exclusion Governance

Recorded: 2026-09-24

Checkpoint: `TPL-PARTNER-M2.7B-G-20260924-01`

Previous status: `M2_7B_HOTEL_POLICIES_INCLUSIONS_EXCLUSIONS_STAGING_END_TO_END_PASS`; the separate visible canonical catalogue-management gap was OPEN.

Current status: **`M2_7B_G_ADMIN_POLICY_INCLUSION_EXCLUSION_GOVERNANCE_STAGING_END_TO_END_PASS`**

## Scope and diagnosed gap

M2.7B remains PASS for Hotel-specific Partner policy configuration, review and customer projection. Its prior evidence did not prove visible canonical `POLICY_TEMPLATE`, `INCLUSION` and `EXCLUSION` management. Backend entities and Partner forms existed, but Admin exposed the common editor mainly through an amenity-oriented list/filter and did not present those entity types as first-class modules. New non-core policy templates also lacked a dynamic Partner configuration/read projection.

M2.7B-G closes that separate gap by reusing the M2.7A-G Content Governance engine. It creates no second catalogue, policy store, review system or customer page.

## Admin location and authority separation

At `Admin → Website & Experience → Content & Attribute Catalogue`, Admin now visibly provides Amenities, Policy Templates, Inclusions, Exclusions, Review & Publishing and Version History.

Service Catalogue remains the Domain/Service authority. Content & Attribute Catalogue governs reusable structured options. Pages remains editorial/SEO authority. Publishing makes an option selectable; it neither selects it for a Hotel nor creates a customer claim.

The common page retains URL query state, filters, bounded pagination, sorting, counts, history, draft-versus-published comparison and impact summaries. The final label repair keeps **Policy Templates** as the module name and changes its creation action to **New policy**.

## Existing adoption and QA lifecycle

The retained Hotel V1 catalogue was adopted without changing codes, labels, schemas, order, scope, meaning or publication state:

| Type | Retained | QA proof | Current active/published | QA usage |
|---|---:|---:|---:|---:|
| Policy Template | 10 | 1 | 11/11 | 0 |
| Inclusion | 7 | 1 | 8/8 | 0 |
| Exclusion | 6 | 1 | 7/7 | 0 |

The staging-only proofs are:

- `HOTEL_POLICY_LUGGAGE_STORAGE_QA` — Luggage storage policy — QA
- `HOTEL_INCLUSION_DRINKING_WATER_QA` — Drinking water inclusion — QA
- `HOTEL_EXCLUSION_LAUNDRY_QA` — Laundry not included — QA

Each completed **Save Draft → Submit for Review → Approve → Publish** through normal Admin UI. Canonical readback shows version 1, `PUBLISHED`, `ACTIVE`, usage 0. Automated tests separately prove Draft, In Review and Approved-but-unpublished states stay out of Partner catalogues.

Backend enforces `HOTEL_POLICY_`, `HOTEL_INCLUSION_` and `HOTEL_EXCLUSION_` prefixes. Policies support bounded BOOLEAN/ENUM; inclusions/exclusions are BOOLEAN. Family/service/scope are stable-code validated. Arbitrary HTML, executable rules, URLs, pricing, payments and unsupported behaviour are rejected.

## Cross-surface and customer safety

Website and native Mobile read the same published contract. The operator confirmed the same three QA options were visible and unselected on both. Customer Hotel detail showed none.

The retained Hotel stays Approved version 4 with two inclusions, two exclusions and zero configured QA policies. Existing check-in/out, 14 property and eight room amenities, three approved media, capacity 8/version 2, availability 5 of 8/version 2 and INR 1,275 base rate/version 2 are unchanged.

The enforced gate remains: `published option → Partner configuration → Partner content review → approved customer projection`.

## Lifecycle, RBAC and PostgreSQL evidence

Published entries cannot be hard-deleted. Immutable snapshots/new versions preserve history. Deprecation/inactivation prevents new selection while historical references remain resolvable. Impact counts use bounded indexed queries. Shared-engine PostgreSQL tests prove this with isolated entries; the three live QA proofs remain Active and unselected.

Narrow server permissions remain `website_experience.catalogue.read`, `.write`, `.review` and `.publish`. Partner, content-review, media, finance and settlement authority cannot mutate the canonical catalogue. Direct API, stale/self-review where separation applies, unapproved publish, cross-tenant and cross-environment attempts fail closed. No account or unrelated role was widened.

Actual disposable PostgreSQL suite: **17/17 PASS**, covering 10/7/6 adoption, all three lifecycles, uniqueness/validation, RBAC denial, one-winner concurrency, stale rejection, immutable snapshots, atomic publish/audit rollback, deactivation history, customer selection gate and M2.7B version-4 regression.

Backend TypeScript/build, secret and diff checks pass. Website governance/dynamic/customer/export suite passes **17/17**; final label tests pass **7/7**, scoped ESLint and diff checks pass. Exact Vercel Turbopack build passes with 243 static pages and 244 routes. Mobile dynamic-catalogue test passes **1/1** with TypeScript, scoped ESLint, Hermes and public-config checks passing. No native dependency changed.

## Live staging evidence

Operator-observed evidence, separate from automation:

- all three Admin modules and counts were visible;
- normal Publish confirmation appeared for each QA entry;
- the Policy action showed **New policy** after deployment;
- Website and Mobile showed all three options unselected;
- customer Hotel detail showed none;
- CSV, XLSX, PDF and bounded Print were readable;
- no Hotel selection or customer/supply/media/booking/finance record changed.

Canonical reconciliation returned all three QA entries at version 1, `PUBLISHED/ACTIVE`, usage 0; counts 11/11, 8/8 and 7/7; Hotel version 4 Approved with 2/2 selections and zero extra QA policies. Staging and production API health were 200.

## Defects and fixes

1. Policy/Inclusion/Exclusion were not first-class Admin modules: added visible modules, counts and persistent URL/filter state.
2. Editor defaults/validation were amenity-oriented: added entity-specific code/schema defaults and indexed usage.
3. Non-core policies were not dynamic in Partner clients: added validated published values inside the existing versioned record; customer projection remains selection/review gated.
4. Creation action read “New policy templates”: Website `6a60c36` changes it to **New policy**, retaining **Policy Templates** as the module title.

## Delivery and safety

- Backend source `1bd0b5c`; release `/home/tpladmin/tpl-api-releases/partner-m2.7bg-1bd0b5c`; archive SHA-256 `10a16f156f1977defcf93b8035016ee59544827049a6ed134ff3fe9f189b365e`; staging only.
- Website feature `30d5f36`; label fix `6a60c36`; READY deployment `dpl_3c9fLrXfQvVE33h6wA82R5M18CJq`, aliased only to `staging.tplgo.com`.
- Mobile `59a2587`; existing Development APK/app data and Metro; no new APK.
- Backup `/home/tpladmin/backups/partner-m2.7bg-pre-1bd0b5c.dump`; SHA-256 `8cf257203036462c2389d1964dd73d6be006f8e419a04807453feffb9204b75a`; `pg_restore --list` 1,425 entries.

Production and real/unrelated Partner data stayed untouched.

## Boundary

M2.7B and M2.7B-G are PASS. The denominator stays **46 requirements / 213 units**. `PARTNER_PROGRESS_PERCENTAGE_NOT_YET_AUDITABLE`, `MOBILE_USER_PARITY=COMPLETE`, `PARTNER_MOBILE_PARITY=OPEN` and `PHASE_1_STEP_1=OPEN` remain unchanged.

Next separate Hotel-only step: **M3 — Hotel Booking Operations and Lifecycle**. It may begin as a new bounded batch; it was not started. Taxes, commission, markup, final pricing, payments, settlements and other families remain outside this checkpoint.
