import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const client = readFileSync("app/admin/partners/applications/AdminPartnerApplicationsClient.tsx", "utf8");
const page = readFileSync("app/admin/partners/applications/page.tsx", "utf8");
const detailPage = readFileSync("app/admin/partners/applications/[submissionId]/page.tsx", "utf8");
const adminClient = readFileSync("app/lib/admin/adminApiClient.ts", "utf8");
const step8 = readFileSync("app/partner-preview/PartnerApplicationWorkspaceClient.tsx", "utf8");
const partnerClient = readFileSync("app/lib/partner/partnerApiClient.ts", "utf8");

test("Admin Partner Applications route uses the final-review workspace", () => {
  expect(page).toContain("AdminPartnerApplicationsClient");
  expect(page).not.toContain("PartnerAdminReadModel");
  expect(detailPage).toContain("initialSubmissionId");
});

test("queue states, actionable counts, filters and search are operator-facing", () => {
  for (const label of ["Actionable", "Submitted", "Resubmitted", "Under Review", "Changes Requested", "Not Approved", "Approved"]) {
    expect(client).toContain(label);
  }
  expect(client).toContain("Business or application reference");
  for (const filter of ["Service", "Country", "Entity type", "Verification", "Payout & Tax", "Agreement", "Assigned reviewer"]) {
    expect(client).toContain(filter);
  }
  expect(client).toContain("Open review");
});

test("detail renders submitted snapshot, specialist links and declaration evidence", () => {
  expect(client).toContain("Submitted Snapshot");
  expect(client).toContain("Open specialist evidence");
  expect(client).toContain("Declarations");
  expect(client).toContain("activationAllowed");
  expect(client).not.toContain("storageReference");
  expect(client).not.toContain("bankAccount");
});

test("decision controls separate Partner message from private Admin notes", () => {
  expect(client).toContain("Partner-visible message");
  expect(client).toContain("Private Admin note");
  expect(client).toContain("Private Admin Notes");
  expect(client).toContain("messages.partnerVisible");
  expect(client).toContain("privateAdminNotes");
});

test("approve action includes activation-separation confirmation", () => {
  expect(client).toContain("Approval does not activate the organization, services, payouts or Partner Desk access.");
  expect(client).toContain("Not changed by final approval");
});

test("QA preview is local-only and exposes every final-review state", () => {
  expect(client).toContain("QA preview only. No application record was changed.");
  for (const status of ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "RESUBMITTED", "NOT_APPROVED", "APPROVED"]) {
    expect(client).toContain(status);
  }
  for (const fixture of ["APPROVAL_BLOCKED", "STALE_CONFLICT", "READ_ONLY"]) {
    expect(client).toContain(fixture);
  }
  expect(client).toContain('if (qa) {\n      onNotice("QA preview only. No application record was changed.");\n      return;\n    }');
});

test("normal mode calls the S8D Admin endpoints with idempotency support", () => {
  expect(client).toContain("/api/v1/admin/partner-applications");
  expect(client).toContain("Idempotency-Key");
  expect(adminClient).toContain("headers?: Record<string, string>");
  expect(adminClient).toContain("Object.assign(headers, options.headers ?? {})");
});

test("read-only and disabled action reasons are visible", () => {
  expect(client).toContain("disabledReasons");
  expect(client).toContain("Specialist approval blockers remain.");
  expect(client).toContain("This application review changed. Refresh before continuing.");
  expect(client).toContain("Read-only Admins can view but cannot approve applications.");
  expect(client).toContain("reason={detail.actions.disabledReasons.startReview}");
});

test("Partner S8C Step 8 remains separate from Admin final review", () => {
  expect(partnerClient).toContain("/api/v1/partner/application/readiness");
  expect(partnerClient).toContain("/api/v1/partner/application/submissions");
  expect(step8).not.toContain("/api/v1/admin/partner-applications");
});
