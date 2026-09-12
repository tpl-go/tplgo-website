import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { buildPartnerQaPreviewReadiness } from "../lib/partner/partnerQaPreviewFixtures";
import {
  partnerStep8NavigationLabel,
  partnerStep8NavigationStatusOverrides,
  partnerStep8StepStatusLabel,
} from "../lib/partner/partnerStep8Review";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const accessPage = source("app/partner-access/page.tsx");
const chooser = source("app/partner-access/PartnerProfileChooser.tsx");
const workspace = source("app/partner-preview/PartnerApplicationWorkspaceClient.tsx");
const authProvider = source("app/providers/AuthProvider.tsx");
const accessAuthority = source("app/lib/partner/partnerAccess.ts");

test("chooser uses concise business language and never promises an unavailable dashboard", () => {
  expect(chooser).toContain("Choose a business to continue");
  expect(chooser).toContain("Select the application or Partner account you want to open.");
  expect(chooser).not.toContain("Open Partner Dashboard");
  expect(chooser).not.toContain("Choose your Partner profile");
});

test("new application navigation distinguishes current and future steps", () => {
  const readiness = buildPartnerQaPreviewReadiness("new");
  const statuses = partnerStep8NavigationStatusOverrides(readiness);
  expect(statuses.account_contact).toBe("in-progress");
  expect(partnerStep8NavigationLabel(readiness, "account_contact", statuses.account_contact!)).toBe("In progress");
  for (const step of ["business_identity", "business_location", "services", "documents_compliance", "payout_tax", "partner_agreement"] as const) {
    expect(statuses[step]).toBe("not-started");
    expect(partnerStep8NavigationLabel(readiness, step, statuses[step]!)).toBe("Not started");
  }
});

test("future steps use neutral presentation rather than failure presentation", () => {
  expect(workspace).toContain('if (status === "not-started") return { node: "bg-white/10 text-slate-400"');
  expect(partnerStep8StepStatusLabel("UNAVAILABLE")).toBe("Not started");
});

test("real correction sections alone receive Action needed", () => {
  const readiness = buildPartnerQaPreviewReadiness("changes-required");
  const statuses = partnerStep8NavigationStatusOverrides(readiness);
  expect(statuses.documents_compliance).toBe("needs-attention");
  expect(partnerStep8NavigationLabel(readiness, "documents_compliance", statuses.documents_compliance!)).toBe("Action needed");
  expect(partnerStep8StepStatusLabel("NEEDS_ATTENTION")).toBe("Action needed");
});

test("completed steps use Completed", () => {
  expect(partnerStep8NavigationLabel(buildPartnerQaPreviewReadiness("ready"), "account_contact", "completed")).toBe("Completed");
  expect(partnerStep8StepStatusLabel("COMPLETE")).toBe("Completed");
});

test("auth loading is explicit and cannot render the unauthenticated branch", () => {
  expect(authProvider).toContain("const [isAuthLoading, setIsAuthLoading] = useState(true)");
  expect(workspace.indexOf("if (!qaPreviewEnabled && isAuthLoading)")).toBeLessThan(workspace.indexOf("if (!qaPreviewEnabled && !isAuthenticated)"));
  expect(workspace).toContain("Opening your Partner application…");
  expect(workspace).toContain("Sign in to continue");
});

test("expired draft sessions clear local authority and return to sign-in", () => {
  expect(workspace).toContain("if (result.status === 401)");
  expect(workspace).toContain("void logout();");
});

test("resolver, selection, and start requests retain duplicate guards", () => {
  expect(accessPage).toContain("resolveInFlight.current");
  expect(accessPage).toContain("if (startBusy.current || access?.outcome !== \"NO_LINKED_PROFILE\") return");
  expect(chooser).toContain("if (busy.current || !profile.selectable) return");
});

test("remembered selection remains a backend-revalidated preference", () => {
  expect(accessAuthority).toContain("return await selectPartnerProfile(preference)");
  expect(accessAuthority).toContain("clearPartnerProfilePreference()");
});

test("no-linked state explains safe choices while recovery remains holding", () => {
  expect(accessPage).toContain("We could not find a Partner application or account linked to this login. Check the mobile number, email or Google account you used earlier.");
  expect(accessPage).toContain("Use another Partner login");
  expect(accessPage).toContain("Start a new Partner application");
  expect(accessPage).toContain("Recover existing application");
  expect(accessPage).toContain("Secure account recovery is not available yet. No application or identity has been linked.");
});

test("accepted application and Partner login structures remain present", () => {
  for (const step of ["account_contact", "business_identity", "business_location", "services", "documents_compliance", "payout_tax", "partner_agreement", "review_submit"]) expect(workspace).toContain(step);
  expect(workspace).toContain("savePartnerAccountContactDraft");
  expect(workspace).toContain("submitPartnerApplication");
  const loginModal = source("app/components/common/LoginModal.tsx");
  expect(loginModal).toContain("Mobile");
  expect(loginModal).toContain("Google");
  expect(loginModal).toContain("Email");
});
