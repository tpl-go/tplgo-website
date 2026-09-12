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
  partnerStep8HeaderMetadata,
  partnerStep8IssuesTitle,
  partnerStep8NavigationLabel,
  partnerStep8NavigationStatusOverrides,
  partnerStep8ReadOnlyStepOverrides,
  partnerStep8ShowsPreSubmissionIssues,
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
    expect(readiness.steps.map((step) => partnerStep8StepStatusLabel(step.status))).toEqual(Array(7).fill("Completed"));
});

test("blockers and warnings are separate, and raw identifiers are not normal UI fields", () => {
    expect(partnerStep8IssuesTitle(readyReadiness())).toBe("Must fix before submission");
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
    expect(partnerStep8StateLabel("UNDER_REVIEW", false)).toBe("Application submitted");
    expect(partnerStep8StateLabel("CHANGES_REQUESTED", false)).toBe("Updates required");
    expect(partnerStep8StateLabel("NOT_APPROVED", false)).toBe("Application status available");
    expect(partnerStep8StateLabel("APPROVED", false)).toBe("Account setup pending");
    expect(workspaceSource).toContain("Service activation, payout activation and Partner Desk access are handled separately.");
    expect(visibleSubmissionReference(buildPartnerQaPreviewSubmission("under-review"))).toBe("Submission 1");
});

test("sidebar and progress statuses use the Step 8 readiness contract in every QA state", () => {
    for (const state of partnerQaPreviewStates) {
      const readiness = buildPartnerQaPreviewReadiness(state.id);
      const overrides = partnerStep8NavigationStatusOverrides(readiness);
      let foundCurrentIncomplete = false;
      for (const step of readiness.steps) {
        const workspaceStep = step.step === "verification_compliance" ? "documents_compliance" : step.step;
        let expected: "completed" | "under-review" | "needs-attention" | "in-progress" | "not-started";
        if (step.status === "COMPLETE") expected = "completed";
        else if (step.status === "UNDER_REVIEW") expected = "under-review";
        else if (readiness.applicationStatus === "CHANGES_REQUESTED" && readiness.latestSubmission?.correctionSections?.includes(step.step)) expected = "needs-attention";
        else if (!foundCurrentIncomplete && step.status !== "UNAVAILABLE") {
          expected = "in-progress";
          foundCurrentIncomplete = true;
        } else expected = "not-started";
        expect(overrides[workspaceStep]).toBe(
          expected,
        );
      }
    }
    expect(partnerStep8NavigationStatusOverrides(buildPartnerQaPreviewReadiness("ready")).partner_agreement).toBe("completed");
});

test("Ready to Submit marks all prerequisite steps complete across navigation", () => {
    const overrides = partnerStep8NavigationStatusOverrides(buildPartnerQaPreviewReadiness("ready"));
    expect(overrides.account_contact).toBe("completed");
    expect(overrides.business_identity).toBe("completed");
    expect(overrides.business_location).toBe("completed");
    expect(overrides.services).toBe("completed");
    expect(overrides.documents_compliance).toBe("completed");
    expect(overrides.payout_tax).toBe("completed");
    expect(overrides.partner_agreement).toBe("completed");
});

test("Ready header never says Not saved yet and uses revision metadata", () => {
    const readiness = buildPartnerQaPreviewReadiness("ready");
    const metadata = partnerStep8HeaderMetadata(readiness, null, "Not saved yet");
    expect(metadata).toBe("Ready to submit · Revision 7");
    expect(metadata).not.toBe("Not saved yet");
});

test("canonical navigation labels preserve ready editing and suppress terminal Edit labels", () => {
    const ready = buildPartnerQaPreviewReadiness("ready");
    const readyStatus = partnerStep8NavigationStatusOverrides(ready);
    expect(partnerStep8NavigationLabel(ready, "account_contact", readyStatus.account_contact ?? "locked")).toBe("Completed");
    expect(partnerStep8NavigationLabel(ready, "review_submit", readyStatus.review_submit ?? "locked")).toBe("In progress");

    for (const state of ["under-review", "rejected", "approved"] as const) {
      const readiness = buildPartnerQaPreviewReadiness(state);
      const status = partnerStep8NavigationStatusOverrides(readiness);
      expect(partnerStep8NavigationLabel(readiness, "account_contact", status.account_contact ?? "locked")).not.toContain("Edit");
      expect(partnerStep8NavigationLabel(readiness, "partner_agreement", status.partner_agreement ?? "locked")).not.toContain("Edit");
    }
});

test("Not Approved and Approved Step 8 navigation labels match terminal states", () => {
    const rejected = buildPartnerQaPreviewReadiness("rejected");
    const approved = buildPartnerQaPreviewReadiness("approved");
    expect(partnerStep8NavigationLabel(rejected, "review_submit", partnerStep8NavigationStatusOverrides(rejected).review_submit ?? "locked")).toBe("Not approved");
    expect(partnerStep8NavigationLabel(approved, "review_submit", partnerStep8NavigationStatusOverrides(approved).review_submit ?? "locked")).toBe("Approved");
});

test("submitted and terminal states lock prior steps and suppress draft footer actions", () => {
    for (const state of ["under-review", "rejected", "approved"] as const) {
      const locks = partnerStep8ReadOnlyStepOverrides(buildPartnerQaPreviewReadiness(state));
      expect(locks.account_contact).toBe(true);
      expect(locks.business_identity).toBe(true);
      expect(locks.documents_compliance).toBe(true);
      expect(locks.partner_agreement).toBe(true);
    }
    expect(workspaceSource).toContain("activeStepReadOnly ? (");
    const readOnlyFooterSlice = workspaceSource.slice(workspaceSource.indexOf("function ReadOnlyStepFooter"), workspaceSource.indexOf("function StateCard"));
    expect(readOnlyFooterSlice).not.toContain("Save as Draft");
    expect(readOnlyFooterSlice).not.toContain("Save & Continue");
});

test("Changes Required unlocks only requested sections", () => {
    const locks = partnerStep8ReadOnlyStepOverrides(buildPartnerQaPreviewReadiness("changes-required"));
    const readiness = buildPartnerQaPreviewReadiness("changes-required");
    const status = partnerStep8NavigationStatusOverrides(readiness);
    expect(locks.documents_compliance).toBe(false);
    expect(locks.account_contact).toBe(true);
    expect(locks.business_identity).toBe(true);
    expect(locks.services).toBe(true);
    expect(locks.partner_agreement).toBe(true);
    expect(partnerStep8NavigationLabel(readiness, "documents_compliance", status.documents_compliance ?? "locked")).toBe("Action needed");
    expect(partnerStep8NavigationLabel(readiness, "account_contact", status.account_contact ?? "locked")).toBe("Completed");
});

test("S8E corrections use exact server sections even when readiness considers the section complete", () => {
    const readiness = buildPartnerQaPreviewReadiness("changes-required");
    readiness.latestSubmission = { ...readiness.latestSubmission!, correctionSections: ["services"], partnerVisibleMessage: "Please correct services." };
    const locks = partnerStep8ReadOnlyStepOverrides(readiness);
    expect(locks.services).toBe(false);
    expect(locks.documents_compliance).toBe(true);
    expect(locks.business_identity).toBe(true);
    expect(workspaceSource).toContain("{latestSubmission.partnerVisibleMessage}");
    readiness.latestSubmission = { ...readiness.latestSubmission, correctionSections: [] };
    expect(partnerStep8ReadOnlyStepOverrides(readiness).services).toBe(true);
});

test("S8E submitted and resubmitted server statuses stay locked after reopen", () => {
    for (const status of ["SUBMITTED", "RESUBMITTED"] as const) {
      const readiness = { ...readyReadiness(), applicationStatus: status, submissionReady: false };
      const locks = partnerStep8ReadOnlyStepOverrides(readiness);
      expect(Object.values(locks).every(Boolean)).toBe(true);
      expect(canSubmitPartnerStep8(readiness, {})).toBe(false);
      expect(partnerStep8NavigationLabel(readiness, "review_submit", "under-review")).toBe("Under review");
    }
});

test("Steps 1-7 remain editable before submitted review states", () => {
    for (const state of ["new", "incomplete", "ready"] as const) {
      const locks = partnerStep8ReadOnlyStepOverrides(buildPartnerQaPreviewReadiness(state));
      expect(locks.account_contact).toBe(false);
      expect(locks.business_identity).toBe(false);
      expect(locks.documents_compliance).toBe(false);
      expect(locks.partner_agreement).toBe(false);
    }
});

test("submitted states never use draft-only Not saved yet metadata", () => {
    for (const state of ["under-review", "changes-required", "rejected", "approved"] as const) {
      const readiness = buildPartnerQaPreviewReadiness(state);
      const submission = buildPartnerQaPreviewSubmission(state);
      const metadata = partnerStep8HeaderMetadata(readiness, submission, "Not saved yet");
      expect(metadata).not.toBe("Not saved yet");
      expect(metadata).toContain(visibleSubmissionReference(submission));
    }
});

test("submitted and terminal Step 8 states do not show pre-submission blocker language", () => {
    expect(partnerStep8ShowsPreSubmissionIssues(buildPartnerQaPreviewReadiness("under-review"))).toBe(false);
    expect(partnerStep8ShowsPreSubmissionIssues(buildPartnerQaPreviewReadiness("rejected"))).toBe(false);
    expect(partnerStep8ShowsPreSubmissionIssues(buildPartnerQaPreviewReadiness("approved"))).toBe(false);
    expect(partnerStep8ShowsPreSubmissionIssues(buildPartnerQaPreviewReadiness("ready"))).toBe(true);
    const reviewStepSlice = workspaceSource.slice(workspaceSource.indexOf("function ReviewSubmitStep"), workspaceSource.indexOf("function Step8Issues"));
    expect(reviewStepSlice).toContain("partnerStep8ShowsPreSubmissionIssues(readiness)");
});
