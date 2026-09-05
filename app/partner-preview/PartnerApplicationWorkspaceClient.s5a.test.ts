import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "vitest";

const workspaceSource = readFileSync("app/partner-preview/PartnerApplicationWorkspaceClient.tsx", "utf8");
const apiClientSource = readFileSync("app/lib/partner/partnerApiClient.ts", "utf8");

test("Step 5 renders a real workspace instead of the development placeholder", () => {
  assert.match(workspaceSource, /Verification & Compliance/);
  assert.match(workspaceSource, /Complete the checks required for your business and selected services\./);
  assert.match(workspaceSource, /VerificationComplianceStep/);
  assert.doesNotMatch(workspaceSource, /Detailed verification form comes in the next development step\./);
});

test("Step 5 uses server-side draft persistence for save and continue", () => {
  assert.match(apiClientSource, /\/api\/v1\/partner\/application\/draft\/verification-compliance/);
  assert.match(workspaceSource, /if \(activeStep === "documents_compliance"\) return saveVerificationDraft\(options\);/);
  assert.match(workspaceSource, /savePartnerVerificationComplianceDraft/);
  assert.match(workspaceSource, /if \(activeStep === "documents_compliance"\)/);
  assert.match(workspaceSource, /setActiveStep\("payout_tax"\)/);
});

test("Step 5 keeps Uploaded distinct from Verified and exposes Step 6 only as a placeholder", () => {
  assert.match(workspaceSource, /Uploaded does not mean verified\./);
  assert.match(workspaceSource, /Evidence uploaded and ready for review\./);
  assert.match(workspaceSource, /Add the payout and tax details required for your Partner account\./);
  assert.doesNotMatch(workspaceSource, /automatic verification/);
});

test("Step 5 uses the existing secure upload API and avoids permanent frontend storage", () => {
  assert.match(workspaceSource, /createPartnerDocumentUploadSession/);
  assert.match(workspaceSource, /confirmPartnerDocument/);
  assert.match(workspaceSource, /linkPartnerDocumentToRequirement/);
  assert.match(workspaceSource, /Secure upload is not available for this staging environment\./);
  assert.doesNotMatch(workspaceSource, /localStorage\.setItem\("partnerDocument/);
});

test("Step 5 keeps QA preview clearly isolated from normal runtime behavior", () => {
  assert.match(workspaceSource, /Preview Example uses fictional requirement data only\./);
  assert.match(workspaceSource, /It does not upload documents or verify identity\./);
  assert.match(workspaceSource, /qaPreviewEnabled/);
});

test("Step 5 guides verification by selected services and section navigation", () => {
  assert.match(workspaceSource, /Verification for your selected services/);
  assert.match(workspaceSource, /Complete the minimum checks needed for your business and services\./);
  assert.match(workspaceSource, /Edit selected services/);
  assert.match(workspaceSource, /Select a verification section/);
  assert.match(workspaceSource, /Previous Section/);
  assert.match(workspaceSource, /Next Section/);
  assert.match(workspaceSource, /selectedVerificationServices/);
});

test("Step 5 exposes minimum-onboarding stage labels and shared evidence presentation", () => {
  assert.match(workspaceSource, /Required now/);
  assert.match(workspaceSource, /Required before activation/);
  assert.match(workspaceSource, /Only if applicable/);
  assert.match(workspaceSource, /Used for/);
  assert.match(workspaceSource, /Collected once for this requirement\./);
  assert.match(workspaceSource, /requirementStage/);
});

test("Step 5 renders desktop and mobile verification summaries", () => {
  assert.match(workspaceSource, /Verification Summary/);
  assert.match(workspaceSource, /mobile-verification-summary-heading/);
  assert.match(workspaceSource, /Required now/);
  assert.match(workspaceSource, /Before activation/);
  assert.match(workspaceSource, /If applicable/);
  assert.match(workspaceSource, /onSelectSection/);
});

test("Save Draft message layer uses a portal modal above sticky UI", () => {
  assert.match(workspaceSource, /createPortal/);
  assert.match(workspaceSource, /data-save-draft-modal-layer/);
  assert.match(workspaceSource, /aria-modal="true"/);
  assert.match(workspaceSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(workspaceSource, /z-\[80\]/);
  assert.match(workspaceSource, /Escape/);
});
