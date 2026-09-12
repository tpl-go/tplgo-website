import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.TPL_PARTNER_TRANSITION_BROWSER_URL || "http://127.0.0.1:3119";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("This transition harness is local-only.");

const organizationId = "11111111-1111-4111-8111-111111111111";
const profiles = [
  { organizationId, displayName: "Test Only Partner", reference: "APP-1-12345678", status: "DRAFT_INCOMPLETE", destinationType: "APPLICATION", updatedAt: "2026-09-12T10:00:00.000Z", selectable: true, restrictedReason: null },
  { organizationId: "22222222-2222-4222-8222-222222222222", displayName: "Test Only Active", reference: "APP-2-12345678", status: "ACTIVE", destinationType: "ACTIVE", updatedAt: "2026-09-11T10:00:00.000Z", selectable: true, restrictedReason: null },
];
const steps = ["account_contact", "business_identity", "business_location", "services", "verification_compliance", "payout_tax", "partner_agreement"];

const draftBundle = {
  organization: { id: organizationId, legalName: "Test Only Partner", brandName: "Test Only Partner", organizationType: "Private Limited", status: "draft", country: "India", updatedAt: "2026-09-12T10:00:00.000Z" },
  members: [], contacts: [], serviceScopes: [], requirements: [], documents: [], review: null, events: [],
  readiness: { contactVerified: false, organizationVerified: false, identityVerified: false, overallVerificationStatus: "NOT_SUBMITTED", blockingRequirements: [], expiringCredentials: [], serviceComplianceStatus: [] },
};

function readiness(applicationStatus = "DRAFT_INCOMPLETE") {
  const locked = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(applicationStatus);
  return {
    organizationId,
    applicationId: organizationId,
    organizationName: "Test Only Partner",
    organizationStatus: locked ? "submitted" : "draft",
    applicationStatus,
    applicationRevision: 4,
    submissionReady: false,
    approvalReady: applicationStatus === "APPROVED",
    steps: steps.map((step, index) => ({ step, label: step, status: locked || index === 0 ? "COMPLETE" : "NEEDS_ATTENTION", reason: locked ? "Submitted." : "Continue this section.", blockerCodes: [], warningCodes: [], correctionRoute: `/partner-preview?step=${step}` })),
    submissionBlockers: locked ? [] : ["APPLICATION_INCOMPLETE"],
    approvalBlockers: locked ? [] : ["REVIEW_PENDING"],
    warnings: [], activeDeclarations: [], latestSubmission: locked ? { id: "safe-fixture-submission", submissionRevision: 1, workflowStatus: applicationStatus, snapshotHash: "hidden", submittedAt: "2026-09-10T10:00:00.000Z", submittedByUserId: "hidden" } : null,
  };
}

function installSession() {
  localStorage.setItem("tpl_auth_session_v1", JSON.stringify({ user: { id: "test-only-user", accountType: "partner", fullName: "Test Partner Operator" }, token: "local-fixture-not-a-real-session" }));
  sessionStorage.setItem("tpl_partner_profile_preference_v1", "11111111-1111-4111-8111-111111111111");
}

function installInitialSessionOnce() {
  if (sessionStorage.getItem("s8e7141_fixture_initialized") === "true") return;
  localStorage.setItem("tpl_auth_session_v1", JSON.stringify({ user: { id: "test-only-user", accountType: "partner", fullName: "Test Partner Operator" }, token: "local-fixture-not-a-real-session" }));
  sessionStorage.setItem("tpl_partner_profile_preference_v1", "11111111-1111-4111-8111-111111111111");
  sessionStorage.setItem("s8e7141_fixture_initialized", "true");
}

await mkdir("tmp/s8e7141-artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const width of [1363, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 936 } });
    await context.addInitScript(installInitialSessionOnce);
    const page = await context.newPage();
    let accessRequests = 0;
    let logoutRequests = 0;
    let applicationMutations = 0;
    let submittedMode = false;
    const pageErrors = [];
    page.on("pageerror", () => pageErrors.push("uncaught page exception"));

    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== "GET" && url.pathname.includes("/api/v1/partner/application/")) applicationMutations += 1;
      if (url.pathname === "/api/v1/partner/access" && request.method() === "GET") {
        accessRequests += 1;
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles }, meta: { requestId: "fixture-access", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/auth/logout" && request.method() === "POST") {
        logoutRequests += 1;
        await new Promise((resolve) => setTimeout(resolve, 80));
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: {} }) });
      }
      if (url.pathname === "/api/v1/partner/application/draft" && request.method() === "GET") {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: draftBundle, meta: { requestId: "fixture-draft", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/application/submission" && request.method() === "GET") {
        await new Promise((resolve) => setTimeout(resolve, 550));
        const state = readiness(submittedMode ? "UNDER_REVIEW" : "DRAFT_INCOMPLETE");
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { latestSubmission: state.latestSubmission, readiness: state }, meta: { requestId: "fixture-readiness", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/service-catalogue") {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { version: 1, updatedAt: "2026-09-12T10:00:00.000Z", source: "published_config", domains: [], items: [] }, meta: { requestId: "fixture-catalogue", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/content/website-experience/partner-application") {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { contexts: {}, version: "fixture" }, meta: { requestId: "fixture-content", apiVersion: "v1" } }) });
      }
      if (url.pathname.includes("/api/v1/")) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "AUTH_UNAUTHORIZED", message: "Sign in required" } }) });
      if (url.hostname !== "127.0.0.1") return route.abort();
      return route.continue();
    });

    await page.goto(`${base}/partner-preview?qa=1&state=incomplete`);
    await page.getByRole("link", { name: "Exit", exact: true }).waitFor();
    const preferenceBeforeExit = await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1"));
    await page.getByRole("link", { name: "Exit", exact: true }).click();
    await page.getByRole("heading", { name: "Partner Desk" }).waitFor();
    assert.equal(accessRequests, 0);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1")), preferenceBeforeExit);
    assert.notEqual(await page.evaluate(() => localStorage.getItem("tpl_auth_session_v1")), null);
    assert.equal(new URL(page.url()).pathname, "/partner-access");
    assert.equal(new URL(page.url()).searchParams.get("intent"), "exit");
    await page.screenshot({ path: `tmp/s8e7141-artifacts/exit-landing-${width}.png`, fullPage: true });

    await page.getByRole("button", { name: "Continue to Partner account" }).click();
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();
    assert.equal(accessRequests, 1);
    assert.equal(new URL(page.url()).search, "");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);

    const logout = page.getByRole("button", { name: "Logout" });
    await logout.dblclick();
    await page.waitForURL(`${base}/`);
    assert.equal(logoutRequests, 1);
    assert.equal(await page.evaluate(() => localStorage.getItem("tpl_auth_session_v1")), null);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1")), null);
    assert.equal(await page.getByText("Partner Login", { exact: true }).count(), 0);

    await page.evaluate(installSession);
    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();
    const alternateLogin = page.getByRole("button", { name: "Use another Partner login" });
    await alternateLogin.dblclick();
    await page.getByRole("dialog").waitFor();
    assert.equal(logoutRequests, 2);
    assert.equal(await page.getByText("Partner Login", { exact: true }).count() >= 1, true);
    for (const method of ["Continue with Mobile", "Continue with Google", "Continue with Email"]) assert.equal(await page.getByRole("button", { name: method, exact: true }).count(), 1);
    assert.equal(await page.getByRole("tab", { name: "Partner Desk", exact: true }).getAttribute("aria-selected"), "true");
    assert.equal(await page.getByRole("tab", { name: "User Login", exact: true }).getAttribute("aria-selected"), "false");

    await page.evaluate(installSession);
    await page.goto(`${base}/partner-preview?organizationId=${organizationId}`);
    const opening = page.getByText("Opening your Partner application…", { exact: true });
    await opening.waitFor();
    assert.equal(await page.getByText(/Editing is locked while the application status is/).count(), 0);
    try {
      await page.locator("[data-application-active-step]").waitFor({ timeout: 8_000 });
    } catch {
      throw new Error(`Draft hydration did not finish: ${(await page.locator("body").innerText()).slice(0, 400)}`);
    }
    assert.equal(await page.getByText(/Editing is locked while the application status is/).count(), 0);
    assert.equal(applicationMutations, 0);
    await page.screenshot({ path: `tmp/s8e7141-artifacts/draft-ready-${width}.png`, fullPage: true });

    submittedMode = true;
    await page.goto(`${base}/partner-preview?organizationId=${organizationId}&step=account_contact`);
    try {
      await page.getByText(/This section is read-only while the application status is/).waitFor({ timeout: 8_000 });
    } catch {
      throw new Error(`Submitted lock did not render: ${(await page.locator("body").innerText()).slice(0, 500)}`);
    }
    assert.equal(applicationMutations, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    assert.deepEqual(pageErrors, []);

    results.push({ width, exitAccessRequests: 0, preferencePreservedOnExit: true, logoutRequests, applicationMutations, falseLockDuringHydration: false, submittedReadOnly: true, overflow: false });
    await context.close();
  }
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
