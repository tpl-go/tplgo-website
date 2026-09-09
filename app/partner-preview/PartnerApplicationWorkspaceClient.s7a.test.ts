import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const workspaceSource = readFileSync(join(process.cwd(), "app/partner-preview/PartnerApplicationWorkspaceClient.tsx"), "utf8");
const apiSource = readFileSync(join(process.cwd(), "app/lib/partner/partnerApiClient.ts"), "utf8");
const adminAgreementSource = readFileSync(join(process.cwd(), "app/admin/partners/agreements/page.tsx"), "utf8");
const adminShellSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminShell.tsx"), "utf8");
const websiteExperienceSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");
const stepSevenNodeRoute = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/application/[node]/page.tsx"), "utf8");
const stepSevenUnitRoute = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/application/[node]/[unit]/page.tsx"), "utf8");
const stepSevenTemplateRoute = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/application/[node]/[unit]/[templateId]/page.tsx"), "utf8");

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
  expect(workspaceSource).toContain('data-save-draft-toast-position="content-top-center"');
  expect(workspaceSource).toContain("z-[120]");
  expect(workspaceSource).toContain("pointer-events-none fixed inset-x-0 top-20");
  expect(workspaceSource).not.toContain("data-save-draft-modal-layer");
  expect(workspaceSource).not.toContain('aria-modal="true"');
  expect(workspaceSource).not.toContain('document.body.style.overflow = "hidden"');
});

test("Website Experience Partner Application removes local workflow controls and keeps central drafting", () => {
  expect(websiteExperienceSource).toContain("Open one Partner Application section.");
  expect(websiteExperienceSource).toContain("function LocalStepEditorActions");
  expect(websiteExperienceSource).toContain("Approval, publishing, scheduling and history are handled from the central Website Experience workflow.");
  expect(websiteExperienceSource).toContain('href="#website-experience-preview"');
  expect(websiteExperienceSource).toContain("Save as Draft");
  const partnerEditorSlice = websiteExperienceSource.slice(websiteExperienceSource.indexOf("function PartnerApplicationTreeEditor"), websiteExperienceSource.indexOf("function partnerApplicationSectionDescription"));
  expect(partnerEditorSlice).not.toContain("<WorkflowActions");
  expect(partnerEditorSlice).not.toContain("<CentralSchedulePanel");
});

test("Website Experience Step 7 content units expose Agreement Templates under the Partner hierarchy", () => {
  const stepSevenSlice = websiteExperienceSource.slice(websiteExperienceSource.indexOf("const stepSevenUnits"), websiteExperienceSource.indexOf("type AgreementTemplateDraftState"));
  expect(websiteExperienceSource).toContain('data-step7-content-unit-list="vertical"');
  expect(websiteExperienceSource).toContain('data-step7-overview-page="true"');
  expect(websiteExperienceSource).toContain("Page Content");
  expect(websiteExperienceSource).toContain("Agreement Templates");
  expect(websiteExperienceSource).toContain("Signer Instructions");
  expect(websiteExperienceSource).toContain("Signing Methods");
  expect(websiteExperienceSource).toContain("Signed Document Instructions");
  expect(websiteExperienceSource).toContain("Declarations");
  expect(websiteExperienceSource).toContain("Agreement Status Messages");
  expect(websiteExperienceSource).toContain("Summary Guidance");
  expect(stepSevenSlice).toContain("stepSevenUnitHref(id)");
  expect(stepSevenSlice).not.toContain("onActiveUnitChange");
  expect(stepSevenSlice).not.toContain("window.history.replaceState");
  expect(stepSevenSlice).not.toContain("url.searchParams.set");
  expect(websiteExperienceSource).toContain("data-agreement-template-manager=\"functional\"");
  expect(websiteExperienceSource).toContain("getAdminAgreementTemplates");
  expect(websiteExperienceSource).toContain("saveAdminAgreementTemplateDraft");
  expect(websiteExperienceSource).toContain("uploadAdminAgreementTemplateDocument");
  expect(websiteExperienceSource).toContain("mappedServices");
  expect(websiteExperienceSource).toContain("renderTemplatePreview");
  expect(websiteExperienceSource).toContain("Missing insert option");
  expect(websiteExperienceSource).toContain("Back to Step 7");
  expect(websiteExperienceSource).toContain("stepSevenUnitIds");
  expect(websiteExperienceSource).toContain("Company details added automatically");
  expect(websiteExperienceSource).toContain("approval, publishing, scheduling and history stay there");
  expect(websiteExperienceSource).toContain('Website Experience &gt; Pages &gt; Partner &gt; Partner Application &gt; {selectedNode.label}');
  expect(websiteExperienceSource).toContain('label="Back to Partner Application"');
});

test("Website Experience Step 7 uses dedicated path-based content pages", () => {
  expect(stepSevenNodeRoute).toContain("searchParams");
  expect(stepSevenNodeRoute).toContain("redirect(`/admin/website-experience/pages/partner/application/${node}/${unit}`)");
  expect(stepSevenUnitRoute).toContain("partnerApplicationUnitId={unit}");
  expect(stepSevenUnitRoute).toContain("agreement-status-messages");
  expect(stepSevenTemplateRoute).toContain("partnerAgreementTemplateId={templateId}");
  expect(websiteExperienceSource).toContain('data-step7-dedicated-page={activeUnit}');
  expect(websiteExperienceSource).toContain('data-step7-content-unit-editor={activeUnit}');
  expect(websiteExperienceSource).toContain('${stepSevenUnitHref("agreement-templates")}/new');
  expect(websiteExperienceSource).toContain('${stepSevenUnitHref("agreement-templates")}/${template.id}');
  expect(websiteExperienceSource).toContain('label="Back to Agreement Templates"');
  expect(websiteExperienceSource).toContain("partnerApplicationBackHref");
  expect(websiteExperienceSource).toContain("partnerApplicationBackLabel");
});

test("Agreement template upload uses verified backend upload before showing Uploaded", () => {
  const apiClientSource = readFileSync(join(process.cwd(), "app/lib/admin/adminApiClient.ts"), "utf8");
  expect(apiClientSource).toContain("/api/v1/admin/partners/agreement-templates/upload?");
  expect(apiClientSource).toContain("body: input.file");
  expect(apiClientSource).toContain('uploadStatus: "UPLOADED"');
  expect(websiteExperienceSource).toContain('type TemplateUploadState = "idle" | "selected" | "preparing" | "uploading" | "verifying" | "uploaded" | "failed"');
  expect(websiteExperienceSource).toContain('data-agreement-template-upload-state={uploadState}');
  expect(websiteExperienceSource).toContain('result.data.uploadStatus !== "UPLOADED"');
  expect(websiteExperienceSource).toContain("The upload reached storage but could not be verified.");
  expect(websiteExperienceSource).toContain("Wait for the selected file to finish uploading before saving this draft.");
  expect(websiteExperienceSource).toContain("Document upload needs attention. Retry the upload or remove the file and use agreement text.");
  expect(websiteExperienceSource).toContain('uploadState === "failed"');
  expect(websiteExperienceSource).toContain("formatAgreementTemplateUploadError");
});

test("Agreement template Save Draft hands off to the central Draft queue exactly once", () => {
  const apiClientSource = readFileSync(join(process.cwd(), "app/lib/admin/adminApiClient.ts"), "utf8");
  expect(apiClientSource).toContain("AdminAgreementTemplateCentralDraft");
  expect(apiClientSource).toContain("draftId?: string");
  expect(apiClientSource).toContain("centralDraft:");
  expect(websiteExperienceSource).toContain('data-agreement-template-central-draft-handoff="ready"');
  expect(websiteExperienceSource).toContain("Open Draft");
  expect(websiteExperienceSource).toContain("Open saved draft");
  expect(websiteExperienceSource).toContain("result.data.centralDraft?.route");
  expect(websiteExperienceSource).toContain("centralDraftRouteFromTemplate(selected)");
  expect(websiteExperienceSource).toContain("agreementTemplateCentralDraftRoute(template.id)");
  expect(websiteExperienceSource).toContain("useSearchParams");
  expect(websiteExperienceSource).toContain("routeWorkflowDraftId");
  expect(websiteExperienceSource).toContain("workflowView === \"drafts\" && routeWorkflowDraftId");
  expect(websiteExperienceSource).toContain("workflowViewFromValue(searchParams.get(\"workflow\"))");
  expect(websiteExperienceSource).toContain("contextFromValue(searchParams.get(\"context\"), mode)");
  expect(websiteExperienceSource).toContain("centralDraftHrefForRow");
  expect(websiteExperienceSource).toContain("marker.centralDraftRoute?.startsWith(\"/admin/\")");
  expect(websiteExperienceSource).toContain("marker.centralDraftId");
  expect(websiteExperienceSource).not.toContain("setMessage(result.data.safeMessage);\\n    onSaveDraft();");
});

test("Central Draft queue exposes draft actions and hides editor audit clutter", () => {
  expect(websiteExperienceSource).toContain("WorkflowDraftDetailView");
  expect(websiteExperienceSource).toContain('data-central-draft-detail={draftId}');
  expect(websiteExperienceSource).toContain('label="Draft version"');
  expect(websiteExperienceSource).toContain('label="Saved"');
  expect(websiteExperienceSource).toContain('label="Readiness"');
  expect(websiteExperienceSource).toContain('backHref="/admin/website-experience?view=drafts"');
  expect(websiteExperienceSource).not.toContain("Human-readable target");
  expect(websiteExperienceSource).not.toContain("Last editor recorded in audit");
  expect(websiteExperienceSource).toContain("Missing before approval:");
  expect(websiteExperienceSource).toContain("Not ready for approval yet:");
  expect(websiteExperienceSource).toContain("row.draftContent.agreementTemplateDraft.readinessMissing");
  expect(websiteExperienceSource).toContain("Send for Approval");
  expect(websiteExperienceSource).toContain("Full activity remains in central History.");
  expect(websiteExperienceSource).toContain("CompactEditorMetadata");
  expect(websiteExperienceSource).toContain('mode === "partner-application" ? <CompactEditorMetadata activeRow={activeRow} /> : <AuditList rows={state.data.recentAudit} />');
  expect(websiteExperienceSource).toContain("WorkflowQueueRow");
  expect(websiteExperienceSource).toContain("data-central-draft-open-edit={workflowDraftIdForContext(row)}");
  expect(websiteExperienceSource).toContain("This saved Draft is missing its direct agreement-template link.");
  expect(websiteExperienceSource).not.toContain('row.draftContent.agreementTemplateDraft?.templateId ? (');
  const templatePanel = websiteExperienceSource.slice(websiteExperienceSource.indexOf("function AgreementTemplateDraftPanel"), websiteExperienceSource.indexOf("const defaultAgreementPlaceholders"));
  expect(templatePanel).not.toContain("Recent Audit Log");
  expect(templatePanel).not.toContain("Version History");
});

test("Step 7 Admin copy hides developer language on normal pages", () => {
  const visibleCopy = websiteExperienceSource
    .replace(/type AgreementTemplateDraftState[\s\S]*?function AgreementTemplateDraftPanel/, "function AgreementTemplateDraftPanel")
    .replace(/metadata:\s*\{[\s\S]*?\}\s*,\n\s*\}\);/g, "");
  expect(visibleCopy).not.toContain("Mapped stable service IDs");
  expect(visibleCopy).not.toContain("Supported autofill placeholders");
  expect(visibleCopy).not.toContain("Unsupported placeholder");
  expect(visibleCopy).not.toContain("structured content/autofill");
  expect(visibleCopy).toContain("Services covered");
  expect(visibleCopy).toContain("Where this agreement applies");
  expect(visibleCopy).toContain("Company details added automatically");
  expect(visibleCopy).toContain("Source document");
});

test("Admin Agreements area is protected and uses Partner agreement routes", () => {
  expect(adminAgreementSource).toContain('requiredPermissions={["partner_agreement.read"]}');
  expect(adminAgreementSource).toContain("/api/v1/admin/partners/agreements");
  expect(adminAgreementSource).toContain("Record countersign");
  expect(adminAgreementSource).toContain("Agreement completion does not approve the Partner");
  expect(adminShellSource).toContain("/admin/partners/agreements");
});
