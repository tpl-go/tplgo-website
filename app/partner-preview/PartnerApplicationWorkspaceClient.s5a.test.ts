import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "vitest";

const workspaceSource = readFileSync("app/partner-preview/PartnerApplicationWorkspaceClient.tsx", "utf8");
const apiClientSource = readFileSync("app/lib/partner/partnerApiClient.ts", "utf8");

test("Step 5 renders a real workspace instead of the development placeholder", () => {
  assert.match(workspaceSource, /Verification & Compliance/);
  assert.match(workspaceSource, /Complete the checks needed for your business and selected services\./);
  assert.match(workspaceSource, /VerificationComplianceStep/);
  assert.doesNotMatch(workspaceSource, /Detailed verification form comes in the next development step\./);
  assert.doesNotMatch(workspaceSource, /Preparing your verification checklist\.\.\./);
});

test("Step 5 uses server-side draft persistence for save and continue", () => {
  assert.match(apiClientSource, /\/api\/v1\/partner\/application\/draft\/verification-compliance/);
  assert.match(workspaceSource, /if \(activeStep === "documents_compliance"\) return saveVerificationDraft\(options\);/);
  assert.match(workspaceSource, /savePartnerVerificationComplianceDraft/);
  assert.match(workspaceSource, /if \(activeStep === "documents_compliance"\)/);
  assert.match(workspaceSource, /setActiveStep\("payout_tax"\)/);
  assert.match(workspaceSource, /Complete this required check before continuing\./);
});

test("Step 5 completion can move to Step 6 while Admin verification remains pending", () => {
  assert.match(workspaceSource, /Submitted for Verification|Submitted for verification|Evidence uploaded and ready for review\./);
  assert.match(workspaceSource, /setActiveStep\("payout_tax"\)/);
  assert.match(workspaceSource, /Verified/);
  assert.doesNotMatch(workspaceSource, /final Admin approval required to continue/i);
});

test("Step 5 keeps Uploaded distinct from Verified and exposes Step 6 only as a placeholder", () => {
  assert.match(workspaceSource, /Evidence uploaded and ready for review\./);
  assert.match(workspaceSource, /Your documents are ready for review\. Additional documents may still be needed before individual services go live\./);
  assert.match(workspaceSource, /Add the payout and tax details required for your Partner account\./);
  assert.match(workspaceSource, /function verificationStatusLabel\(/);
  assert.doesNotMatch(workspaceSource, /automatic verification/);
});

test("Step 5 uses the existing secure upload API and avoids permanent frontend storage", () => {
  assert.match(workspaceSource, /createPartnerDocumentUploadSession/);
  assert.match(workspaceSource, /confirmPartnerDocument/);
  assert.match(workspaceSource, /linkPartnerDocumentToRequirement/);
  assert.match(workspaceSource, /Secure upload is not available for this staging environment\./);
  assert.doesNotMatch(workspaceSource, /localStorage\.setItem\("partnerDocument/);
  assert.match(workspaceSource, /Document upload failed\. Please try again\./);
});

test("Step 5 keeps QA preview clearly isolated from normal runtime behavior", () => {
  assert.match(workspaceSource, /Preview example — Fictional data only\. No documents are uploaded or verified\./);
  assert.match(workspaceSource, /qaPreviewEnabled/);
  assert.match(workspaceSource, /We&apos;re confirming what is needed for this service\./);
});

test("Step 5 guides verification by selected services and section navigation", () => {
  assert.match(workspaceSource, /Your selected services/);
  assert.match(workspaceSource, /Complete the checks needed for your business and selected services\./);
  assert.match(workspaceSource, /View services/);
  assert.match(workspaceSource, />\s*Edit\s*</);
  assert.match(workspaceSource, /Verification checklist/);
  assert.match(workspaceSource, /Start verification|Continue verification|Continue to Payout & Tax/);
  assert.match(workspaceSource, /Previous check/);
  assert.match(workspaceSource, /Next check/);
  assert.match(workspaceSource, /selectedVerificationServices/);
  assert.doesNotMatch(workspaceSource, /View selected services/);
});

test("Step 5 exposes minimum-onboarding stage labels and shared evidence presentation", () => {
  assert.match(workspaceSource, /Required now/);
  assert.match(workspaceSource, /Required before this service goes live/);
  assert.match(workspaceSource, /We'll ask only if needed/);
  assert.match(workspaceSource, /Used for/);
  assert.match(workspaceSource, /Collected once for this requirement\./);
  assert.match(workspaceSource, /requirementStage/);
  assert.match(workspaceSource, /Changes requested: TPL needs an updated document\./);
});

test("Step 5 renders desktop and mobile verification summaries", () => {
  assert.match(workspaceSource, /VerificationSummaryBody/);
  assert.match(workspaceSource, /verificationSummary=\{activeStep === "documents_compliance"/);
  assert.match(workspaceSource, /activeStep === "documents_compliance" && verificationSummary/);
  assert.match(workspaceSource, /data-step5-progress-summary="true"/);
  assert.match(workspaceSource, /mobile-verification-summary-heading/);
  assert.match(workspaceSource, /Required now/);
  assert.match(workspaceSource, /Before services go live/);
  assert.match(workspaceSource, /Next action/);
  assert.doesNotMatch(workspaceSource, /VerificationMetric/);
  assert.match(workspaceSource, /Your progress/);
  assert.match(workspaceSource, /Continue to Payout & Tax/);
});

test("Step 5 width optimization removes the internal desktop summary grid", () => {
  assert.doesNotMatch(workspaceSource, /xl:grid-cols-\[minmax\(0,1fr\)_300px\]/);
  assert.match(workspaceSource, /<div className="p-5">\s*<div className="grid gap-4">/);
  assert.doesNotMatch(workspaceSource, /<h2 className="text-sm font-black text-white">Your progress<\/h2>\s*<VerificationSummaryBody[\s\S]*?groups=\{requirementGroups\}/);
  assert.doesNotMatch(workspaceSource, /Checks for selected services\./);
});

test("Steps 1 through 4 keep their right-panel guidance behavior", () => {
  assert.match(workspaceSource, /activeStep === "services" && servicesSummary/);
  assert.match(workspaceSource, /activeStep === "account_contact"/);
  assert.match(workspaceSource, /activeStep === "business_identity"/);
  assert.match(workspaceSource, /activeStep === "business_location"/);
  assert.match(workspaceSource, /Why we need this/);
});

test("S5B.3 uses the existing application stepper as compact arrows with accessible states", () => {
  assert.match(workspaceSource, /aria-label="Application progress"/);
  assert.match(workspaceSource, /data-application-progress-step=\{step\.id\}/);
  assert.match(workspaceSource, /aria-current=\{current \? "step" : undefined\}/);
  assert.match(workspaceSource, /<ArrowRight className=\{`shrink-0 \$\{visual\.connector\}`\}/);
  assert.match(workspaceSource, /Step \{activeStepMeta\.number\} of \{workspaceSteps\.length\}/);
  assert.match(workspaceSource, /View all steps/);
  assert.match(workspaceSource, /data-mobile-application-progress-step=\{step\.id\}/);
  assert.doesNotMatch(workspaceSource, /onClick=\{\(\) => onSelect\(step\.id\)\}[\s\S]*data-application-progress-step/);
});

test("S5B.3 adds a secondary vertical verification rail without replacing compact rows", () => {
  assert.match(workspaceSource, /data-verification-status-rail=\{railState\}/);
  assert.match(workspaceSource, /verificationGroupRailState/);
  assert.match(workspaceSource, /verificationGroupStatusLabel/);
  assert.match(workspaceSource, /nextActionGroupId/);
  assert.match(workspaceSource, /Changes required/);
  assert.match(workspaceSource, /TPL review/);
  assert.match(workspaceSource, /Not started/);
  assert.match(workspaceSource, /className="flex min-h-14 w-full items-stretch justify-between gap-3 p-3 text-left/);
});

test("S5B.3 maps active document states truthfully and keeps uploaded distinct from completed", () => {
  assert.match(workspaceSource, /data-document-state-flow="true"/);
  assert.match(workspaceSource, /Document needed/);
  assert.match(workspaceSource, /Uploaded/);
  assert.match(workspaceSource, /TPL review/);
  assert.match(workspaceSource, /Completed/);
  assert.match(workspaceSource, /Uploading/);
  assert.match(workspaceSource, /Changes required/);
  assert.match(workspaceSource, /Renewal required/);
  assert.match(workspaceSource, /if \(requirement\.status === "VERIFIED"\) return "completed";/);
  assert.match(workspaceSource, /if \(requirement\.status === "UNDER_REVIEW"\) return "review";/);
  assert.match(workspaceSource, /if \(requirement\.status === "SUBMITTED"\) return "uploaded";/);
  assert.doesNotMatch(workspaceSource, /requirement\.status === "SUBMITTED"[\s\S]{0,80}return "completed"/);
  assert.doesNotMatch(workspaceSource, /requirement\.status === "UNDER_REVIEW"[\s\S]{0,80}return "completed"/);
});

test("Save Draft message layer uses a portal modal above sticky UI", () => {
  assert.match(workspaceSource, /createPortal/);
  assert.match(workspaceSource, /data-save-draft-modal-layer/);
  assert.match(workspaceSource, /aria-modal="true"/);
  assert.match(workspaceSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(workspaceSource, /z-\[80\]/);
  assert.match(workspaceSource, /Escape/);
});
