import { readFileSync } from "node:fs";
import { expect, test, vi } from "vitest";
vi.mock("@/app/lib/admin/adminApiClient", () => ({ adminApiRequest: vi.fn() }));
import { adminApiRequest } from "@/app/lib/admin/adminApiClient";
import { actionDisabledReason, createQaState, simulateQaAction } from "./AdminPartnerApplicationsClient";

const input = { partnerMessage: "Please correct the service details.", privateNote: "Internal evidence check", reasonCategory: "specialist_readiness", correctionSections: ["services" as const] };
const source = readFileSync("app/admin/partners/applications/AdminPartnerApplicationsClient.tsx", "utf8");
type ReviewAction = Parameters<typeof simulateQaAction>[2];

test("Start Review updates one QA source with reviewer, version, timeline and counts", () => {
  const before = createQaState();
  const result = simulateQaAction(before, "qa-submitted", "start-review", input);
  expect(result.state.details["qa-submitted"].submission).toMatchObject({ workflowStatus: "UNDER_REVIEW", transitionVersion: 2 });
  expect(result.state.queue.rows[0]).toMatchObject({ workflowStatus: "UNDER_REVIEW", transitionVersion: 2, assignedReviewer: "QA Reviewer" });
  expect(result.state.details["qa-submitted"].timeline.at(-1)).toMatchObject({ fromStatus: "SUBMITTED", toStatus: "UNDER_REVIEW", actor: "QA Reviewer" });
  expect(result.state.queue.counts.SUBMITTED ?? 0).toBe(0);
  expect(result.state.queue.counts.UNDER_REVIEW).toBe(5);
  expect(before.details["qa-submitted"].submission.transitionVersion).toBe(1);
  expect(result.notice).toContain("Start Review was simulated");
});

test("required fields disable decisions and private notes", () => {
  const detail = createQaState().details["qa-under-review"];
  expect(actionDisabledReason(detail, "request-changes", { ...input, partnerMessage: "  " })).toBe("Partner-visible message is required.");
  expect(actionDisabledReason(detail, "request-changes", { ...input, correctionSections: [] })).toBe("Select at least one correction section.");
  expect(actionDisabledReason(detail, "not-approve", { ...input, reasonCategory: " " })).toBe("Reason category is required.");
  expect(actionDisabledReason(detail, "not-approve", { ...input, partnerMessage: " " })).toBe("Partner-visible message is required.");
  expect(actionDisabledReason(detail, "notes", { ...input, privateNote: " " })).toBe("Private Admin note is required.");
  expect(actionDisabledReason(detail, "approve", input)).toContain("blockers");
});

test("changes preserve corrections and keep private note out of Partner message and timeline", () => {
  const result = simulateQaAction(createQaState(), "qa-under-review", "request-changes", input);
  const detail = result.state.details["qa-under-review"];
  expect(detail.submission.workflowStatus).toBe("CHANGES_REQUESTED");
  expect(detail.messages.partnerVisible).toBe(input.partnerMessage);
  expect(detail.messages.privateAdminNotes[0].note).toBe(input.privateNote);
  expect(detail.timeline.at(-1)?.correctionSections).toEqual(["services"]);
  expect(JSON.stringify(detail.timeline)).not.toContain(input.privateNote);
});

test("private note only appends to private notes", () => {
  const before = createQaState();
  const result = simulateQaAction(before, "qa-under-review", "notes", input);
  expect(result.state.details["qa-under-review"].submission).toEqual(before.details["qa-under-review"].submission);
  expect(result.state.details["qa-under-review"].timeline).toEqual(before.details["qa-under-review"].timeline);
  expect(result.state.details["qa-under-review"].messages.partnerVisible).toBeNull();
  expect(result.state.details["qa-under-review"].messages.privateAdminNotes).toHaveLength(1);
});

test.each(["start-review", "request-changes", "not-approve", "approve", "notes"] as const)("QA %s makes zero API calls, with action-specific feedback", (action: ReviewAction) => {
  vi.mocked(adminApiRequest).mockClear();
  const result = simulateQaAction(createQaState(), "qa-resubmitted", action, input);
  expect(result.notice).toContain("was simulated. No application record was changed.");
  expect(adminApiRequest).not.toHaveBeenCalled();
  if (action === "not-approve") expect(result.state.details["qa-resubmitted"].submission.workflowStatus).toBe("NOT_APPROVED");
  if (action === "approve") {
    const detail = result.state.details["qa-resubmitted"];
    expect(detail.submission.workflowStatus).toBe("APPROVED");
    expect(detail.organization.status).toBe("draft");
    expect(detail.snapshot).toEqual(createQaState().details["qa-resubmitted"].snapshot);
    expect(detail.snapshot.payoutTax?.activationAllowed).toBe(false);
    expect(detail.snapshot.agreement?.activationAllowed).toBe(false);
  }
});

test.each(["start-review", "request-changes", "not-approve", "approve", "notes"] as const)("read-only rejects %s without mutation", (action: ReviewAction) => {
  const state = createQaState();
  expect(simulateQaAction(state, "qa-read-only", action, input).state).toBe(state);
  expect(actionDisabledReason(state.details["qa-read-only"], action, input)).toContain("Read-only");
});

test.each(["request-changes", "not-approve", "approve", "notes"] as const)("stale %s gives refresh guidance without transition", (action: ReviewAction) => {
  const state = createQaState();
  const result = simulateQaAction(state, "qa-stale-conflict", action, input);
  expect(result.state).toBe(state);
  expect(result.notice).toContain("Refresh before continuing");
});

test("confirmation is an accessible in-app modal with cancel and focus restoration, never browser dialogs", () => {
  expect(source).toContain("<dialog");
  expect(source).toContain('aria-modal="true"');
  expect(source).toContain('aria-labelledby="review-confirm-title"');
  expect(source).toContain('aria-describedby="review-confirm-description"');
  expect(source).toContain("trigger?.focus()");
  expect(source).toContain("onCancel=");
  expect(source).not.toMatch(/window\.(confirm|alert|prompt)\s*\(/);
});

test("normal mode retains POST payload, expected version, idempotency and stale handling", () => {
  expect(source).toContain("expectedTransitionVersion: detail.submission.transitionVersion");
  expect(source).toContain('method: "POST"');
  expect(source).toContain('"Idempotency-Key": `admin-final-${action}-${detail.submission.id}-${detail.submission.transitionVersion}`');
  expect(source).toContain("result.status === 409");
  expect(source.indexOf("if (qa) {", source.indexOf("const doAction"))).toBeLessThan(source.indexOf("const body ="));
});
