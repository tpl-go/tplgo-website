import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.TPL_PARTNER_SHELL_BROWSER_URL || "http://127.0.0.1:3119";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("This fixture harness is local-only.");

const ids = {
  draft: "11111111-1111-4111-8111-111111111111",
  submitted: "22222222-2222-4222-8222-222222222222",
  active: "33333333-3333-4333-8333-333333333333",
};
const profiles = [
  { organizationId: ids.draft, displayName: "Test Only Hotel", reference: null, status: "DRAFT_INCOMPLETE", destinationType: "APPLICATION", updatedAt: "2026-09-12T10:00:00.000Z", selectable: true, restrictedReason: null },
  { organizationId: ids.submitted, displayName: "Test Only Cab", reference: "APP-2-12345678", status: "UNDER_REVIEW", destinationType: "APPLICATION_STATUS", updatedAt: "2026-09-11T10:00:00.000Z", selectable: true, restrictedReason: null },
  { organizationId: ids.active, displayName: "Test Only Active", reference: "APP-3-12345678", status: "ACTIVE", destinationType: "ACTIVE", updatedAt: "2026-09-10T10:00:00.000Z", selectable: true, restrictedReason: null },
];

await mkdir("tmp/s8e714-artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const width of [1363, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 936 } });
    await context.addInitScript(() => {
      localStorage.setItem("tpl_auth_session_v1", JSON.stringify({
        user: { id: "test-only-user", accountType: "partner", fullName: "Test Partner Operator" },
        token: "local-fixture-not-a-real-session",
      }));
    });
    const page = await context.newPage();
    let mode = "multiple";
    let accessRequests = 0;
    let selectRequests = 0;
    let startRequests = 0;
    const pageErrors = [];
    page.on("pageerror", () => pageErrors.push("uncaught page exception"));

    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname === "/api/v1/partner/access" && request.method() === "GET") {
        accessRequests += 1;
        const data = mode === "no-linked"
          ? { outcome: "NO_LINKED_PROFILE", organizationId: null, step: null }
          : { outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles };
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data, meta: { requestId: "fixture-access", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/access/select" && request.method() === "POST") {
        selectRequests += 1;
        const input = request.postDataJSON();
        assert.deepEqual(Object.keys(input), ["organizationId"]);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const data = input.organizationId === ids.active
          ? { outcome: "ACTIVE", organizationId: ids.active, step: null }
          : input.organizationId === ids.submitted
            ? { outcome: "APPLICATION_STATUS", organizationId: ids.submitted, step: "review_submit" }
            : { outcome: "APPLICATION", organizationId: ids.draft, step: "business_identity" };
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data, meta: { requestId: "fixture-select", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/application/submission" && request.method() === "GET") {
        const organizationId = url.searchParams.get("organizationId");
        const active = organizationId === ids.active;
        const data = {
          latestSubmission: { id: "hidden-fixture-id", submissionRevision: active ? 3 : 2, workflowStatus: active ? "APPROVED" : "UNDER_REVIEW", snapshotHash: "hidden", submittedAt: "2026-09-09T10:00:00.000Z", submittedByUserId: "hidden" },
          readiness: { organizationId, applicationId: organizationId, organizationName: active ? "Test Only Active" : "Test Only Cab", organizationStatus: active ? "active" : "draft", applicationStatus: active ? "APPROVED" : "UNDER_REVIEW", applicationRevision: active ? 3 : 2, submissionReady: false, approvalReady: active, steps: [], submissionBlockers: [], approvalBlockers: [], warnings: [], activeDeclarations: [], latestSubmission: null },
        };
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data, meta: { requestId: "fixture-summary", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/application/start" && request.method() === "POST") {
        startRequests += 1;
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { access: { outcome: "APPLICATION", organizationId: ids.draft, step: "account_contact" } } }) });
      }
      if (url.pathname === "/api/v1/auth/logout") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: {} }) });
      if (url.pathname.includes("/api/v1/")) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "AUTH_UNAUTHORIZED", message: "Sign in required" } }) });
      if (url.hostname !== "127.0.0.1") return route.abort();
      if (url.pathname === "/partner-preview" && !url.searchParams.has("qa")) return route.fulfill({ contentType: "text/html", body: "<h1>Partner application route</h1>" });
      return route.continue();
    });

    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();
    const chooserText = await page.locator("body").innerText();
    for (const consumerText of ["My Account", "My Bookings", "My Trips", "Wishlist", "Wallet", "Creator Mode", "Smart Planner", "Flight Tracking", "Web Check-in"]) assert.equal(chooserText.includes(consumerText), false);
    assert.equal(await page.getByText("TPL GO Partner", { exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: `tmp/s8e714-artifacts/chooser-${width}.png`, fullPage: true });

    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("heading", { name: "Partner Desk" }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/partner-access");
    await page.getByRole("button", { name: "Continue to Partner account" }).click();
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();

    const activeButton = page.getByRole("button", { name: "View account status: Test Only Active" });
    await activeButton.dblclick();
    await page.getByRole("heading", { name: "Your Partner account is active" }).waitFor();
    assert.equal(selectRequests, 1);
    assert.equal(new URL(page.url()).pathname, "/partner-access");
    assert.equal(await page.getByText("Your Partner Desk is being prepared for the next activation phase.", { exact: true }).count(), 1);
    assert.equal(await page.getByText("Active Partner account", { exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: `tmp/s8e714-artifacts/active-${width}.png`, fullPage: true });

    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();
    const submittedButton = page.getByRole("button", { name: "View application status: Test Only Cab" });
    await submittedButton.click();
    await page.getByRole("heading", { name: "Application submitted" }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/partner-access");
    assert.equal(await page.getByText("Under review", { exact: true }).count(), 1);
    assert.equal(await page.getByText("APP-2-12345678", { exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: `tmp/s8e714-artifacts/submitted-${width}.png`, fullPage: true });

    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("heading", { name: "Choose a business to continue" }).waitFor();
    await page.getByRole("button", { name: "Continue application: Test Only Hotel" }).click();
    await page.waitForURL(`**/partner-preview?step=business_identity&organizationId=${ids.draft}`);

    mode = "no-linked";
    await page.evaluate(() => sessionStorage.removeItem("tpl_partner_profile_preference_v1"));
    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "No Partner application found" }).waitFor();
    assert.equal(await page.getByText("We could not find a Partner application or account linked to this login. Check the mobile number, email or Google account you used earlier.", { exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Use another Partner login" }).count() >= 1, true);
    assert.equal(await page.getByRole("button", { name: "Recover existing application" }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Start a new Partner application" }).count(), 1);
    assert.equal(startRequests, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: `tmp/s8e714-artifacts/no-linked-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("heading", { name: "Partner Login" }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem("tpl_auth_session_v1")), null);

    assert.deepEqual(pageErrors, []);
    results.push({ width, accessRequests, selectRequests, startRequests, consumerChrome: false, activeStayedInPartnerContext: true, submittedStayedInPartnerContext: true, overflow: false });
    await context.close();
  }
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
