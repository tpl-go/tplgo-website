import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "vitest";

const rulesPage = readFileSync("app/admin/partner-verification/rules/page.tsx", "utf8");
const reviewPage = readFileSync("app/admin/partner-verification/page.tsx", "utf8");
const shell = readFileSync("app/admin/_components/AdminShell.tsx", "utf8");
const websiteExperienceHome = readFileSync("app/admin/_components/AdminWebsiteExperienceLanding.tsx", "utf8");
const adminApiClient = readFileSync("app/lib/admin/adminApiClient.ts", "utf8");
const partnerStep = readFileSync("app/partner-preview/PartnerApplicationWorkspaceClient.tsx", "utf8");
const visibleText = rulesPage.replace(/<[^>]+>/g, " ");

test("Verification Rules lives under Partner Verification navigation", () => {
  assert.match(shell, /Verification Rules/);
  assert.match(shell, /partner_verification_policy\.read/);
  assert.match(reviewPage, /href="\/admin\/partner-verification\/rules"/);
  assert.match(rulesPage, /Admin/);
  assert.match(rulesPage, /Partners/);
  assert.match(rulesPage, /Verification & Compliance/);
  assert.match(rulesPage, /Verification Rules/);
});

test("Verification Rules uses human workflow language and no developer policy keys in visible copy", () => {
  assert.match(rulesPage, /Manage which checks and documents Partners must complete\./);
  assert.match(rulesPage, /Published policy version/);
  assert.match(rulesPage, /Draft changes do not affect Partner Step 5 until approved and published\./);
  assert.match(rulesPage, /Preview requirements/);
  assert.match(rulesPage, /Send for approval/);
  assert.match(rulesPage, /Publish now/);
  assert.doesNotMatch(visibleText, /runtime catalogue|policy keys|stable IDs/);
});

test("policy preview simulator is staging safe and does not create Partner data", () => {
  assert.match(rulesPage, /data-policy-preview="true"/);
  assert.match(rulesPage, /Preview creates no Partner records, document uploads or external verification\./);
  assert.match(rulesPage, /writesPartnerData/);
  assert.match(rulesPage, /uploadsDocuments/);
});

test("policy groups and requirement details are vertical and action gated", () => {
  assert.match(rulesPage, /data-policy-groups="true"/);
  assert.match(rulesPage, /data-requirement-list="true"/);
  assert.match(rulesPage, /policy\.permissions\.canManage/);
  assert.match(rulesPage, /policy\.permissions\.canApprove/);
  assert.match(rulesPage, /policy\.permissions\.canPublish/);
  assert.match(rulesPage, /Only if applicable/);
  assert.match(rulesPage, /Two-level review/);
  assert.match(rulesPage, /Three-level review/);
});

test("Partner Step 5 approved layout remains present", () => {
  assert.match(partnerStep, /data-verification-status-rail=\{railState\}/);
  assert.match(partnerStep, /data-document-state-flow="true"/);
  assert.match(partnerStep, /Your selected services/);
  assert.match(partnerStep, /Your progress/);
});

test("Verification Rules appears in the central Website Experience work queue through guarded policy API", () => {
  assert.match(adminApiClient, /AdminVerificationPolicyWorkflowView/);
  assert.match(adminApiClient, /getAdminVerificationPolicyWorkflow/);
  assert.match(websiteExperienceHome, /getAdminVerificationPolicyWorkflow/);
  assert.match(websiteExperienceHome, /Central policy work item for Partner verification requirements\./);
  assert.match(websiteExperienceHome, /policyWorkflowState\.status !== "denied"/);
  assert.match(websiteExperienceHome, /policyState === "PENDING_APPROVAL"/);
  assert.match(websiteExperienceHome, /policyState === "APPROVED"/);
  assert.match(websiteExperienceHome, /policyState === "SCHEDULED"/);
});




