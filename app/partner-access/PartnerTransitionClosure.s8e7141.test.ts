import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const accessPage = source("app/partner-access/page.tsx");
const loginModal = source("app/components/common/LoginModal.tsx");
const authProvider = source("app/providers/AuthProvider.tsx");
const workspace = source("app/partner-preview/PartnerApplicationWorkspaceClient.tsx");

test("application Exit is a one-navigation Partner landing intent", () => {
  expect(workspace).toContain('<Link href="/partner-access?intent=exit" replace');
  expect(accessPage).toContain('get("intent") === "exit"');
  expect(accessPage).toContain('setView("landing")');
  expect(accessPage).toContain('window.history.replaceState(window.history.state, "", "/partner-access")');
  expect(accessPage).toContain("void refresh(false)");
  expect(accessPage).not.toContain("clearPartnerProfilePreference");
});

test("logout and alternate login have distinct guarded destinations", () => {
  expect(accessPage).toContain('resetSession("home")');
  expect(accessPage).toContain('window.location.replace("/")');
  expect(accessPage).toContain('resetSession("partner-login")');
  expect(accessPage).toContain('openLoginModal({ accountType: "partner", intent: "partner" })');
  expect(accessPage).toContain("if (sessionResetInFlight.current) return sessionResetInFlight.current");
  expect(authProvider).toContain("clearPartnerProfilePreference()");
  expect(authProvider).toContain("setIsLoginModalOpen(false)");
});

test("Partner OTP success keeps the opaque modal open and enters the single resolver route", () => {
  const mobilePartnerBranch = loginModal.slice(loginModal.indexOf('if (activeTab === "partner")'), loginModal.indexOf('setSuccessText("Login successful. Welcome to TPL GO.")'));
  const emailPartnerBranchStart = loginModal.indexOf('if (activeTab === "partner")', loginModal.indexOf("const handleVerifyEmailOtp"));
  const emailPartnerBranch = loginModal.slice(emailPartnerBranchStart, loginModal.indexOf('setSuccessText("Login successful. Welcome to TPL GO.")', emailPartnerBranchStart));
  for (const branch of [mobilePartnerBranch, emailPartnerBranch]) {
    expect(branch).toContain("ForSession");
    expect(branch).toContain("Opening your Partner account…");
    expect(branch).toContain('window.location.replace("/partner-access")');
    expect(branch).not.toContain("readPartnerAccess");
    expect(branch).not.toContain("window.setTimeout");
    expect(branch).not.toContain("onClose()");
  }
  expect(loginModal).not.toContain("partnerAccessDestination");
  expect(loginModal).toContain('activeTab === "partner"\n        ? `${window.location.origin}/partner-access`');
});

test("personal login keeps its existing verification and close behavior", () => {
  expect(loginModal).toContain("await verifyOtp(toBackendMobile(cleanedMobile, selectedCountry), cleanedOtp, activeTab)");
  expect(loginModal).toContain("await verifyEmailOtp(normalizedEmail, cleanedEmailOtp, activeTab)");
  expect(loginModal).toContain("Login successful. Welcome to TPL GO.");
  expect(loginModal).toContain("onClose()");
});

test("application hydration cannot render a speculative edit lock", () => {
  expect(workspace).toContain('loadStatus !== "ready" || loadedApplicationScope !== applicationScope || !step8Readiness');
  expect(workspace.match(/Opening your Partner application…/g)?.length).toBeGreaterThanOrEqual(2);
  expect(workspace).toContain('{activeStepReadOnly ? <ReadOnlyStepNotice stateLabel={step8StateLabel} /> : null}');
  expect(workspace.indexOf('loadStatus !== "ready" || loadedApplicationScope !== applicationScope || !step8Readiness')).toBeLessThan(workspace.indexOf("{activeStepReadOnly ? <ReadOnlyStepNotice"));
});

test("confirmed submitted and review states remain locked", () => {
  expect(workspace).toContain('status === "SUBMITTED"');
  expect(workspace).toContain('status === "UNDER_REVIEW"');
  expect(workspace).toContain('status === "APPROVED"');
  expect(workspace).toContain("<fieldset disabled={activeStepReadOnly}");
  expect(workspace).toContain("<ReadOnlyStepFooter");
});

test("Step 1-8 persistence and duplicate-start guard remain intact", () => {
  for (const step of ["account_contact", "business_identity", "business_location", "services", "documents_compliance", "payout_tax", "partner_agreement", "review_submit"]) {
    expect(workspace).toContain(step);
  }
  expect(workspace).toContain("savePartnerAccountContactDraft");
  expect(workspace).toContain("submitPartnerApplication");
  expect(accessPage).toContain("if (startBusy.current || access?.outcome !== \"NO_LINKED_PROFILE\") return");
  expect(accessPage).toContain("if (resolveInFlight.current) return resolveInFlight.current");
});
