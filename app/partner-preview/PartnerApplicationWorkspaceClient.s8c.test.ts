import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import type { PartnerApplicationReadiness } from "../lib/partner/partnerApiClient";
import {
  buildPartnerQaPreviewReadiness,
  buildPartnerQaPreviewSubmission,
  partnerQaPreviewStates,
  qaFinalSubmissionDeclaration,
} from "../lib/partner/partnerQaPreviewFixtures";
import {
  buildPartnerStep8SubmitInput,
  canSubmitPartnerStep8,
  declarationAcceptanceKey,
  normalizeStep8ErrorCode,
  partnerStep8StateLabel,
  partnerStep8StepStatusLabel,
  requiredFinalDeclarations,
  step8SafeErrorMessage,
  visibleSubmissionReference,
} from "../lib/partner/partnerStep8Review";

const workspaceSource = readFileSync(join(process.cwd(), "app/partner-preview/PartnerApplicationWorkspaceClient.tsx"), "utf8");
const apiSource = readFileSync(join(process.cwd(), "app/lib/partner/partnerApiClient.ts"), "utf8");
const step8Source = readFileSync(join(process.cwd(), "app/lib/partner/partnerStep8Review.ts"), "utf8");

function readyReadiness(): PartnerApplicationReadiness {
  return buildPartnerQaPreviewReadiness("ready");
}

test("placeholder and Coming next copy are removed from Step 8", () => {
    expect(workspaceSource).toContain("function ReviewSubmitStep");
    expect(workspaceSource).not.toContain("This step is reserved in the approved 8-step Partner application flow.");
    expect(workspaceSource).not.toContain("This step opens in the next approved development batch.");
    expect(workspaceSource).not.toContain(">Coming next<");
});

test("Step 8 renders seven authoritative review rows with human labels and reasons", () => {
    expect(step8Source).toContain("account_contact");
    expect(step8Source).toContain("business_identity");
    expect(step8Source).toContain("business_location");
    expect(step8Source).toContain("services");
    expect(step8Source).toContain("verification_compliance");
    expect(step8Source).toContain("payout_tax");
    expect(step8Source).toContain("partner_agreement");
    const readiness = readyReadiness();
    expect(readiness.steps).toHaveLength(7);
    expect(readiness.steps.map((step) => partnerStep8StepStatusLabel(step.status))).toEqual(Array(7).fill("Complete"));
});

test("blockers and warnings are separate, and raw identifiers are not normal UI fields", () => {
    expect(workspaceSource).toContain("Must fix before submission");
    expect(workspaceSource).toContain("Warnings");
    expect(workspaceSource).not.toContain("{latestSubmission.snapshotHash}");
    expect(workspaceSource).not.toContain("{latestSubmission.submittedByUserId}");
});

test("Website Experience Step 8 title and subtitle are presentation-only", () => {
    expect(apiSource).toContain("/api/v1/content/website-experience/partner-application");
    expect(workspaceSource).toContain('node.id === "step-8-review-submit"');
    expect(workspaceSource).toContain("setReviewSubmitContent");
    expect(workspaceSource).toContain("fetchPartnerApplicationSubmission");
    expect(workspaceSource).toContain("submitPartnerApplication");
});

test("Step 8 owns its footer and never renders Save & Continue while active", () => {
    expect(workspaceSource).toContain('activeStep === "review_submit" ? (');
    expect(workspaceSource).toContain("<ReviewSubmitFooter");
    const reviewFooterSlice = workspaceSource.slice(workspaceSource.indexOf("function ReviewSubmitFooter"), workspaceSource.indexOf("function SubmitConfirmationDialog"));
    expect(reviewFooterSlice).not.toContain("Save & Continue");
    expect(reviewFooterSlice).not.toContain("Save as Draft");
    expect(reviewFooterSlice).toContain("Submit for review");
    expect(reviewFooterSlice).toContain("Resubmit for review");
});

test("server-issued active declarations render unchecked by default and gate submit", () => {
    const readiness = readyReadiness();
    const declarations = requiredFinalDeclarations(readiness);
    expect(declarations).toEqual([qaFinalSubmissionDeclaration]);
    expect(canSubmitPartnerStep8(readiness, {})).toBe(false);
    expect(canSubmitPartnerStep8(readiness, { [declarationAcceptanceKey(qaFinalSubmissionDeclaration)]: true })).toBe(true);
});

test("submit payload contains only revision, declaration IDs/versions and idempotency key", () => {
    const readiness = readyReadiness();
    const payload = buildPartnerStep8SubmitInput(
      readiness,
      { [declarationAcceptanceKey(qaFinalSubmissionDeclaration)]: true },
      "attempt-1",
    );
    expect(payload).toEqual({
      expectedApplicationRevision: readiness.applicationRevision,
      idempotencyKey: "attempt-1",
      declarationAcceptances: [{ declarationId: qaFinalSubmissionDeclaration.id, version: qaFinalSubmissionDeclaration.version, accepted: true }],
    });
    expect(JSON.stringify(payload)).not.toContain(qaFinalSubmissionDeclaration.title);
});

test("no-declaration configuration blocks submission with the backend code presentation", () => {
    const readiness = { ...readyReadiness(), activeDeclarations: [], submissionBlockers: ["FINAL_DECLARATIONS_NOT_CONFIGURED"] };
    expect(canSubmitPartnerStep8(readiness, {})).toBe(false);
    expect(step8SafeErrorMessage("FINAL_DECLARATIONS_NOT_CONFIGURED")).toContain("declaration is being prepared");
    expect(step8Source).toContain("FINAL_DECLARATIONS_NOT_CONFIGURED");
});

test("stale revision and idempotency conflicts use refresh-safe messages", () => {
    expect(normalizeStep8ErrorCode(409, "STALE_APPLICATION_REVISION")).toBe("STALE_APPLICATION_REVISION");
    expect(normalizeStep8ErrorCode(409, "IDEMPOTENCY_CONFLICT")).toBe("IDEMPOTENCY_CONFLICT");
    expect(step8SafeErrorMessage("STALE_APPLICATION_REVISION")).toContain("Refresh");
    expect(workspaceSource).toContain("Refresh application");
    expect(workspaceSource).toContain("submitAttemptKeyRef.current ?? createPartnerStep8AttemptKey()");
});

test("every QA preview state has a Step 8 presentation fixture", () => {
    expect(partnerQaPreviewStates.map((state) => state.id)).toEqual([
      "new",
      "incomplete",
      "ready",
      "under-review",
      "changes-required",
      "rejected",
      "approved",
    ]);
    for (const state of partnerQaPreviewStates) {
      expect(buildPartnerQaPreviewReadiness(state.id).steps).toHaveLength(7);
    }
});

test("Ready to Submit QA preview uses a QA-only declaration fixture", () => {
    const readiness = buildPartnerQaPreviewReadiness("ready");
    expect(readiness.submissionReady).toBe(true);
    expect(readiness.activeDeclarations[0]?.id).toBe("qa-final-submission-test-declaration");
    expect(readiness.activeDeclarations[0]?.title).toContain("QA-only");
});

test("QA submit performs no API mutation and only moves local preview state", () => {
    expect(workspaceSource).toContain('qaPreviewEnabled) {');
    expect(workspaceSource).toContain("QA preview moved to Under Review. No backend submission was made.");
    const qaSubmitSlice = workspaceSource.slice(workspaceSource.indexOf("async function submitStep8ForReview"), workspaceSource.indexOf("if (!step8CanSubmit"));
    expect(qaSubmitSlice).not.toContain("submitPartnerApplication");
});

test("normal authenticated mode uses S8B endpoints", () => {
    expect(apiSource).toContain("/api/v1/partner/application/readiness");
    expect(apiSource).toContain("/api/v1/partner/application/submission");
    expect(apiSource).toContain("/api/v1/partner/application/submissions");
    expect(workspaceSource).toContain("fetchPartnerApplicationSubmission()");
    expect(workspaceSource).toContain("submitPartnerApplication(buildPartnerStep8SubmitInput");
});

test("submitted, changes requested, not approved and approved states are locked or scoped", () => {
    expect(partnerStep8StateLabel("UNDER_REVIEW", false)).toBe("Under review");
    expect(partnerStep8StateLabel("CHANGES_REQUESTED", false)).toBe("Changes requested");
    expect(partnerStep8StateLabel("NOT_APPROVED", false)).toBe("Not approved");
    expect(partnerStep8StateLabel("APPROVED", false)).toBe("Approved");
    expect(workspaceSource).toContain("Service activation, payout activation and Partner Desk access are handled separately.");
    expect(visibleSubmissionReference(buildPartnerQaPreviewSubmission("under-review"))).toBe("Submission 1");
});
