import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const accessPage = source("app/partner-access/page.tsx");
const shell = source("app/partner-access/PartnerAccessShell.tsx");
const chooser = source("app/partner-access/PartnerProfileChooser.tsx");
const stickyHeader = source("app/components/layout/StickyHeaderWrapper.tsx");
const loginModal = source("app/components/common/LoginModal.tsx");
const workspace = source("app/partner-preview/PartnerApplicationWorkspaceClient.tsx");
const accessAuthority = source("app/lib/partner/partnerAccess.ts");

test("Partner routes use a dedicated shell and suppress the consumer header", () => {
  expect(accessPage).toContain("PartnerAccessShell");
  expect(shell).toContain("TPL GO Partner");
  expect(shell).toContain("Use another Partner login");
  expect(shell).toContain("Logout");
  expect(stickyHeader).toContain('pathname.startsWith("/partner-access")');
  for (const consumerItem of ["My Account", "My Bookings", "My Trips", "Wishlist", "Wallet", "Creator Mode", "Smart Planner", "Flight Tracking", "Web Check-in", "currency"]) {
    expect(shell).not.toContain(consumerItem);
    expect(accessPage).not.toContain(consumerItem);
  }
});

test("Partner login and application exit remain inside Partner context", () => {
  expect(loginModal).toContain('window.location.replace("/partner-access")');
  expect(loginModal).not.toContain("window.location.assign(destination)");
  expect(workspace).toContain('<Link href="/partner-access?intent=exit" replace');
  expect(chooser).not.toContain('href="/"');
  expect(accessPage).not.toContain('href="/"');
});

test("authoritative destination matrix keeps status and active states in the shell", () => {
  expect(accessAuthority).toContain('if (access.outcome === "APPLICATION")');
  expect(accessAuthority).toContain('if (access.outcome === "CORRECTIONS")');
  expect(accessAuthority).not.toContain('access.outcome === "APPLICATION_STATUS" || access.outcome === "CORRECTIONS"');
  expect(accessPage).toContain('access?.outcome === "SELECTION_REQUIRED"');
  expect(accessPage).toContain('access?.outcome === "APPLICATION_STATUS"');
  expect(accessPage).toContain('access?.outcome === "ACTIVE"');
  expect(accessPage).toContain('access?.outcome === "SETUP_PENDING"');
});

test("active accounts receive the premium holding view and never fall through to generic Support", () => {
  expect(accessPage).toContain("Your Partner account is active");
  expect(accessPage).toContain("Your Partner Desk is being prepared for the next activation phase.");
  expect(accessPage).toContain("Active Partner account");
  expect(accessPage).toContain("Contact Partner Support");
  expect(accessPage).not.toContain("Operational workspace access must be confirmed before continuing. Contact Support.");
});

test("submitted applications receive a safe read-only status view", () => {
  expect(accessPage).toContain("Application submitted");
  expect(accessPage).toContain("Current status");
  expect(accessPage).toContain("TPL GO is reviewing your application.");
  expect(accessPage).toContain("fetchPartnerApplicationSubmissionForOrganization");
  expect(accessPage).not.toContain("partnerVisibleMessage");
  expect(accessPage).not.toContain("correctionSections");
});

test("no-linked guidance is explicit and does not auto-create a draft", () => {
  expect(accessPage).toContain("We could not find a Partner application or account linked to this login. Check the mobile number, email or Google account you used earlier.");
  expect(accessPage).toContain("Use another Partner login");
  expect(accessPage).toContain("Recover existing application");
  expect(accessPage).toContain("Start a new Partner application");
  expect(accessPage).toContain('if (startBusy.current || access?.outcome !== "NO_LINKED_PROFILE") return');
  expect(accessPage).toContain("startKey.current ??= crypto.randomUUID()");
  expect(accessPage.indexOf("startPartnerApplication(startKey.current)")).toBeGreaterThan(accessPage.indexOf("async function start()"));
});

test("resolver and back navigation are guarded without consumer fallbacks", () => {
  expect(accessPage).toContain("if (resolveInFlight.current) return resolveInFlight.current");
  expect(accessPage).toContain("readPartnerAccess({ revalidateRememberedSelection })");
  expect(accessPage).toContain("void refresh(false)");
  expect(chooser).toContain("if (busy.current || !profile.selectable) return");
  expect(accessPage).not.toContain('window.location.assign("/")');
  expect(accessPage).toContain('window.location.replace("/")');
});

test("operator surfaces do not render lifecycle enums or internal identifiers", () => {
  expect(chooser).not.toContain("{profile.status}");
  expect(accessPage).not.toContain("{access.outcome}");
  expect(accessPage).not.toContain("organizationId}</");
  expect(chooser).not.toContain("organizationId}</");
});

test("accepted Step 1-8 structure and Partner Login methods remain present", () => {
  for (const step of ["account_contact", "business_identity", "business_location", "services", "documents_compliance", "payout_tax", "partner_agreement", "review_submit"]) expect(workspace).toContain(step);
  expect(workspace).toContain("savePartnerAccountContactDraft");
  expect(workspace).toContain("submitPartnerApplication");
  for (const method of ["Mobile", "Google", "Email"]) expect(loginModal).toContain(method);
});
