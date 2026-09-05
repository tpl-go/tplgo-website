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
  assert.match(workspaceSource, /Edit services/);
  assert.match(workspaceSource, /Verification checklist/);
  assert.match(workspaceSource, /Start verification|Continue verification|Continue to Payout & Tax/);
  assert.match(workspaceSource, /Previous check/);
  assert.match(workspaceSource, /Next check/);
  assert.match(workspaceSource, /selectedVerificationServices/);
  assert.match(workspaceSource, /View selected services/);
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
  assert.match(workspaceSource, /mobile-verification-summary-heading/);
  assert.match(workspaceSource, /Required now/);
  assert.match(workspaceSource, /Before services go live/);
  assert.doesNotMatch(workspaceSource, /VerificationMetric/);
  assert.match(workspaceSource, /onSelectSection/);
  assert.match(workspaceSource, /Your progress/);
  assert.match(workspaceSource, /Continue to Payout & Tax/);
});

test("Save Draft message layer uses a portal modal above sticky UI", () => {
  assert.match(workspaceSource, /createPortal/);
  assert.match(workspaceSource, /data-save-draft-modal-layer/);
  assert.match(workspaceSource, /aria-modal="true"/);
  assert.match(workspaceSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(workspaceSource, /z-\[80\]/);
  assert.match(workspaceSource, /Escape/);
});
