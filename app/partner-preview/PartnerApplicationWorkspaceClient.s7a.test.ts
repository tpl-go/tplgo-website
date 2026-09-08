import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const workspaceSource = readFileSync(join(process.cwd(), "app/partner-preview/PartnerApplicationWorkspaceClient.tsx"), "utf8");
const apiSource = readFileSync(join(process.cwd(), "app/lib/partner/partnerApiClient.ts"), "utf8");
const adminAgreementSource = readFileSync(join(process.cwd(), "app/admin/partners/agreements/page.tsx"), "utf8");
const adminShellSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminShell.tsx"), "utf8");
const websiteExperienceSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");

test("Step 7 renders a guided six-section Partner agreement flow", () => {
  expect(workspaceSource).toContain("function AgreementStep");
  expect(workspaceSource).toContain("Confirm Partner and signer");
  expect(workspaceSource).toContain("Review agreement");
  expect(workspaceSource).toContain("Review service schedules");
  expect(workspaceSource).toContain("Select permitted signing method");
  expect(workspaceSource).toContain("Accept declarations/sign or upload");
  expect(workspaceSource).toContain("Review agreement status");
});

test("Step 7 uses one-field-per-row stacks and the approved right summary panel", () => {
  expect(workspaceSource).toContain('data-step7-field-stack="signer"');
  expect(workspaceSource).toContain('data-step7-field-stack="agreement"');
  expect(workspaceSource).toContain('data-step7-field-stack="schedules"');
  expect(workspaceSource).toContain('data-step7-field-stack="method"');
  expect(workspaceSource).toContain('data-step7-field-stack="accept"');
  expect(workspaceSource).toContain('data-step7-summary-panel="right-shell"');
  expect((workspaceSource.match(/Step 7 summary/g) ?? []).length).toBe(1);
  expect(workspaceSource).toContain('agreementSummary={activeStep === "partner_agreement"');
  expect(workspaceSource).not.toMatch(/activeStep === "partner_agreement"[\s\S]{0,900}Coming next/);
});

test("Step 7 persists through backend agreement endpoints and downloads private PDFs", () => {
  expect(apiSource).toContain("/api/v1/partner/application/draft/agreement");
  expect(apiSource).toContain("/api/v1/partner/organizations/");
  expect(apiSource).toContain("contentBase64");
  expect(workspaceSource).toContain("savePartnerAgreementDraft");
  expect(workspaceSource).toContain("fetchPartnerAgreementDownload");
  expect(workspaceSource).toContain("Download agreement PDF");
  expect(workspaceSource).toContain("agreementPayload");
  expect(workspaceSource).toContain("agreementFormFromBundle(result.data)");
});

test("Step 7 disables eSign provider and preserves activation separation", () => {
  expect(workspaceSource).toContain("eSign provider disabled");
  expect(workspaceSource).toContain("eSign provider setup pending");
  expect(workspaceSource).toContain("Completing this step does not approve the Partner, activate services, activate payouts or open the Partner Desk.");
  expect(workspaceSource).not.toMatch(/fake signed/i);
});

test("Step 7 loads editable copy from published Partner Application Website Experience content", () => {
  expect(workspaceSource).toContain('node.id === "step-7-partner-agreement"');
  expect(workspaceSource).toContain("agreementContentFromNode");
  expect(workspaceSource).toContain("fallbackAgreementContent");
});

test("Step 7 blocks unsigned continuation while preserving draft save", () => {
  expect(workspaceSource).toContain("function isAgreementReadyForPartnerAction");
  expect(workspaceSource).toContain("function isAgreementPartnerSigningComplete");
  expect(workspaceSource).toContain('Wait for Admin to issue the agreement before continuing.');
  expect(workspaceSource).toContain('disabled={saveStatus === "saving"}');
  expect(workspaceSource).toContain("disabled={saveContinueDisabled}");
  expect(workspaceSource).toContain('Preview agreement saved. Acceptance is required before Review & Submit.');
});

test("Step 7 save feedback uses one non-blocking top-layer toast", () => {
  expect(workspaceSource).toContain("data-save-draft-toast-layer");
  expect(workspaceSource).toContain("z-[120]");
  expect(workspaceSource).toContain("pointer-events-none fixed inset-x-0 top-4");
  expect(workspaceSource).not.toContain("data-save-draft-modal-layer");
  expect(workspaceSource).not.toContain('aria-modal="true"');
  expect(workspaceSource).not.toContain('document.body.style.overflow = "hidden"');
});

test("Website Experience Partner Application removes local workflow controls and keeps central drafting", () => {
  expect(websiteExperienceSource).toContain("Open one Partner Application section. Save changes as a draft here; approval, publishing, scheduling and history stay in the central workflow.");
  expect(websiteExperienceSource).toContain("function LocalStepEditorActions");
  expect(websiteExperienceSource).toContain("Approval, publishing, scheduling and history are handled from the central Website Experience workflow.");
  expect(websiteExperienceSource).toContain('href="#website-experience-preview"');
  expect(websiteExperienceSource).toContain("Save as Draft");
  const partnerEditorSlice = websiteExperienceSource.slice(websiteExperienceSource.indexOf("function PartnerApplicationTreeEditor"), websiteExperienceSource.indexOf("function partnerApplicationSectionDescription"));
  expect(partnerEditorSlice).not.toContain("<WorkflowActions");
  expect(partnerEditorSlice).not.toContain("<CentralSchedulePanel");
});

test("Website Experience Step 7 content units expose Agreement Templates under the Partner hierarchy", () => {
  expect(websiteExperienceSource).toContain('data-step7-content-unit-list="vertical"');
  expect(websiteExperienceSource).toContain("Page Content");
  expect(websiteExperienceSource).toContain("Agreement Templates");
  expect(websiteExperienceSource).toContain("Signer Instructions");
  expect(websiteExperienceSource).toContain("Signing Methods");
  expect(websiteExperienceSource).toContain("Signed Document Instructions");
  expect(websiteExperienceSource).toContain("Declarations");
  expect(websiteExperienceSource).toContain("Agreement Status Messages");
  expect(websiteExperienceSource).toContain("Summary Guidance");
  expect(websiteExperienceSource).toContain("Supported autofill placeholders");
  expect(websiteExperienceSource).toContain("Publishing, scheduling, superseding and history happen only through the central workflow");
  expect(websiteExperienceSource).toContain('Website Experience &gt; Pages &gt; Partner &gt; Partner Application &gt; {selectedNode.label}');
  expect(websiteExperienceSource).toContain('label="Back to Partner Application"');
});

test("Admin Agreements area is protected and uses Partner agreement routes", () => {
  expect(adminAgreementSource).toContain('requiredPermissions={["partner_agreement.read"]}');
  expect(adminAgreementSource).toContain("/api/v1/admin/partners/agreements");
  expect(adminAgreementSource).toContain("Record countersign");
  expect(adminAgreementSource).toContain("Agreement completion does not approve the Partner");
  expect(adminShellSource).toContain("/admin/partners/agreements");
});
