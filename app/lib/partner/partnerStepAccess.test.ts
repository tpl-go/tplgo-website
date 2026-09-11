import { expect, test } from "vitest";
import type { PartnerApplicationReadiness } from "./partnerApiClient";
import { buildPartnerQaPreviewReadiness } from "./partnerQaPreviewFixtures";
import { applicationStepOrder, canEditPartnerStep, partnerStepAccess, resolvePartnerStep } from "./partnerStepAccess";

function draft(completed: number) {
  const readiness = buildPartnerQaPreviewReadiness("new");
  readiness.applicationStatus = "DRAFT_INCOMPLETE";
  readiness.latestSubmission = null;
  readiness.steps = readiness.steps.map((step, index) => ({ ...step, status: index < completed ? "COMPLETE" : "NEEDS_ATTENTION", blockerCodes: index < completed ? [] : ["INCOMPLETE"] }));
  return readiness;
}

  test.each([0, 1, 2, 3, 4, 5, 6, 7])("%i persisted steps unlock exactly the next step", (completed: number) => {
    const readiness = draft(completed);
    expect(partnerStepAccess(readiness).steps.filter((step) => step.accessible).map((step) => step.id)).toEqual(applicationStepOrder.slice(0, completed + 1));
    expect(resolvePartnerStep(undefined, readiness)).toBe(applicationStepOrder[completed]);
    expect(resolvePartnerStep("review_submit", readiness)).toBe(applicationStepOrder[completed]);
    expect(resolvePartnerStep(undefined, structuredClone(readiness))).toBe(applicationStepOrder[completed]);
    expect(applicationStepOrder.slice(0, Math.min(completed + 1, 7)).every((step) => canEditPartnerStep(readiness, step))).toBe(true);
  });
  test.each([0, 1, 2, 3])("Step 5 fails closed for missing prerequisite %i", (missing: number) => {
    const readiness = draft(7);
    readiness.steps[missing].status = "NEEDS_ATTENTION";
    readiness.steps[missing].blockerCodes = ["INCOMPLETE"];
    expect(canEditPartnerStep(readiness, "documents_compliance")).toBe(false);
    expect(resolvePartnerStep("documents_compliance", readiness)).toBe(applicationStepOrder[missing]);
  });
  test("specialist warnings do not block submission progression", () => {
    const readiness = draft(4);
    readiness.steps[1] = { ...readiness.steps[1], status: "UNDER_REVIEW", warningCodes: ["MANUAL_REVIEW"] };
    expect(canEditPartnerStep(readiness, "documents_compliance")).toBe(true);
  });
  test.each(["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "NOT_APPROVED", "APPROVED"] as const)("%s preserves read-only inspection", (status: PartnerApplicationReadiness["applicationStatus"]) => {
    const readiness = draft(7);
    readiness.applicationStatus = status;
    expect(partnerStepAccess(readiness).steps.every((step) => step.accessible && !step.editable)).toBe(true);
    expect(resolvePartnerStep(undefined, readiness)).toBe("review_submit");
  });
  test("corrections reopen only explicit sections even when Complete", () => {
    const readiness = buildPartnerQaPreviewReadiness("changes-required");
    readiness.latestSubmission = { ...readiness.latestSubmission!, correctionSections: ["services"] };
    expect(partnerStepAccess(readiness).steps.filter((step) => step.editable).map((step) => step.id)).toEqual(["services"]);
    readiness.latestSubmission.correctionSections = [];
    expect(partnerStepAccess(readiness).steps.every((step) => !step.editable)).toBe(true);
    readiness.latestSubmission = null;
    expect(partnerStepAccess(readiness).steps.every((step) => !step.editable)).toBe(true);
  });
  test("unresolved authority grants no mutation", () => {
    expect(partnerStepAccess(null).steps.every((step) => !step.editable)).toBe(true);
    expect(resolvePartnerStep("documents_compliance", null)).toBe("account_contact");
  });
