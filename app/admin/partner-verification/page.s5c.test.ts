import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "vitest";

const pageSource = readFileSync("app/admin/partner-verification/page.tsx", "utf8");
const shellSource = readFileSync("app/admin/_components/AdminShell.tsx", "utf8");
const partnerStepSource = readFileSync("app/partner-preview/PartnerApplicationWorkspaceClient.tsx", "utf8");

test("Admin verification review lives under Partners and not Website Experience", () => {
  assert.match(shellSource, /label: "Verification & Compliance"/);
  assert.match(pageSource, /AdminProtected/);
  assert.match(pageSource, /AdminShell title="Partner Verification & Compliance"/);
  assert.ok(pageSource.includes("Admin"));
  assert.ok(pageSource.includes("Partners"));
  assert.ok(pageSource.includes("Verification & Compliance"));
  assert.doesNotMatch(pageSource, /Website Experience/);
});

test("Admin verification queue exposes operational tabs and filters", () => {
  for (const label of ["Ready for Review", "Under Review", "Changes Required", "Approved", "Rejected", "Expired / Renewal Required", "All"]) {
    assert.match(pageSource, new RegExp(label.replace("/", "\\/")));
  }
  assert.match(pageSource, /data-admin-verification-queue="true"/);
  assert.match(pageSource, /Search Partner or business/);
  assert.match(pageSource, /serviceFilter/);
  assert.match(pageSource, /countryFilter/);
  assert.match(pageSource, /stateFilter/);
  assert.match(pageSource, /submittedAfter/);
});

test("Admin verification access denial hides queue data behind a clean state", () => {
  assert.match(pageSource, /data-admin-verification-denied="true"/);
  assert.match(pageSource, /You don&apos;t have access to Partner verification reviews\./);
  assert.match(pageSource, /Back to Partners/);
  assert.match(pageSource, /accessDenied \? null :/);
  assert.doesNotMatch(pageSource, /partner_verification\.read/);
});

test("Admin verification page uses human copy and authorized empty queue language", () => {
  assert.match(pageSource, /Review Partner documents and complete verification checks\./);
  assert.match(pageSource, /No Partner verification submissions are ready for review\./);
  assert.doesNotMatch(pageSource, /Review submitted Partner checks, inspect private documents through authorized access, and record check-level decisions\./);
});

test("Admin verification record is check scoped with secure document access", () => {
  assert.match(pageSource, /data-admin-verification-record="true"/);
  assert.match(pageSource, /Partner summary/);
  assert.match(pageSource, /Verification progress/);
  assert.match(pageSource, /Submitted checks/);
  assert.match(pageSource, /Business details/);
  assert.match(pageSource, /Your identity\/representative/);
  assert.match(pageSource, /Service-specific checks/);
  assert.match(pageSource, /Additional\/conditional checks/);
  assert.match(pageSource, /Secure document access/);
  assert.match(pageSource, /Temporary document access expires/);
});

test("Admin review actions require confirmation or Partner-facing reasons", () => {
  assert.match(pageSource, /Start review/);
  assert.match(pageSource, /Approve check/);
  assert.match(pageSource, /Request changes/);
  assert.match(pageSource, /Reject check/);
  assert.match(pageSource, /Renewal required/);
  assert.match(pageSource, /window\.confirm/);
  assert.match(pageSource, /Add a Partner-facing reason before saving this decision\./);
  assert.match(pageSource, /internalNote/);
});

test("Partner Step 5 renders safe reviewer feedback without changing S5B layout", () => {
  assert.match(partnerStepSource, /data-partner-review-feedback="true"/);
  assert.match(partnerStepSource, /TPL needs an updated document\./);
  assert.match(partnerStepSource, /Check rejected/);
  assert.match(partnerStepSource, /Renewal required/);
  assert.match(partnerStepSource, /data-document-state-flow="true"/);
  assert.match(partnerStepSource, /data-verification-status-rail=\{railState\}/);
});
