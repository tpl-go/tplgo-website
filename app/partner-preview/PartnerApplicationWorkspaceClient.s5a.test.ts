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
