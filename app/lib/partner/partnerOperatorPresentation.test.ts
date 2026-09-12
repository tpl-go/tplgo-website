import { expect, test } from "vitest";
import {
  cleanPartnerApplicationName,
  partnerApplicationLifecycleLabel,
  partnerProfileActionLabel,
  partnerProfileLifecycleLabel,
} from "./partnerOperatorPresentation";

test("application titles remove repeated Partner and generated suffixes", () => {
  expect(cleanPartnerApplicationName("TPL Operator QA Partner Partner Application Draft")).toBe("TPL Operator QA Partner");
  expect(cleanPartnerApplicationName("Example Example Partner Application")).toBe("Example");
  expect(cleanPartnerApplicationName("  Acme   Travel  ")).toBe("Acme Travel");
  expect(cleanPartnerApplicationName("Test Only Restricted")).toBe("Test Only Restricted");
});

test("application titles fail safely when source text is unusable", () => {
  expect(cleanPartnerApplicationName("DRAFT_INCOMPLETE")).toBe("Partner application");
  expect(cleanPartnerApplicationName(null)).toBe("Partner application");
});

test("profile lifecycle enums map to operator language", () => {
  expect(partnerProfileLifecycleLabel("DRAFT_INCOMPLETE")).toBe("Application in progress");
  expect(partnerProfileLifecycleLabel("SUBMITTED")).toBe("Application submitted");
  expect(partnerProfileLifecycleLabel("CHANGES_REQUESTED")).toBe("Updates required");
  expect(partnerProfileLifecycleLabel("APPROVED")).toBe("Account setup pending");
  expect(partnerProfileLifecycleLabel("ACTIVE")).toBe("Active Partner account");
  expect(partnerProfileLifecycleLabel("RESTRICTED")).toBe("Please contact support");
  expect(partnerProfileLifecycleLabel("UNEXPECTED_INTERNAL_VALUE")).toBe("Account status available");
});

test("profile actions remain destination-specific without promising a dashboard", () => {
  expect(partnerProfileActionLabel("APPLICATION", true)).toBe("Continue application");
  expect(partnerProfileActionLabel("APPLICATION_STATUS", true)).toBe("View application status");
  expect(partnerProfileActionLabel("CORRECTIONS", true)).toBe("Update application");
  expect(partnerProfileActionLabel("SETUP_PENDING", true)).toBe("Continue account setup");
  expect(partnerProfileActionLabel("ACTIVE", true)).toBe("View account status");
  expect(partnerProfileActionLabel("ACTIVE", false)).toBe("Contact support");
  expect(partnerProfileActionLabel("UNEXPECTED", true)).toBe("Contact support");
});

test("application lifecycle enums map to safe status text", () => {
  expect(partnerApplicationLifecycleLabel("DRAFT_INCOMPLETE")).toBe("Application in progress");
  expect(partnerApplicationLifecycleLabel("UNDER_REVIEW")).toBe("Application submitted");
  expect(partnerApplicationLifecycleLabel("CHANGES_REQUESTED")).toBe("Updates required");
  expect(partnerApplicationLifecycleLabel("APPROVED")).toBe("Account setup pending");
});
