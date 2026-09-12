import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.TPL_PROFILE_BROWSER_URL || "http://127.0.0.1:3118";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("This fixture harness is local-only.");
const ids = { draft: "11111111-1111-4111-8111-111111111111", review: "22222222-2222-4222-8222-222222222222", restricted: "33333333-3333-4333-8333-333333333333", invalid: "44444444-4444-4444-8444-444444444444" };
const profiles = [
  { organizationId: ids.draft, displayName: "Test Only Hotel", reference: null, status: "DRAFT_INCOMPLETE", destinationType: "APPLICATION", updatedAt: "2026-09-12T10:00:00.000Z", selectable: true, restrictedReason: null },
  { organizationId: ids.review, displayName: "Test Only Cab", reference: "APP-2-12345678", status: "UNDER_REVIEW", destinationType: "APPLICATION_STATUS", updatedAt: "2026-09-11T10:00:00.000Z", selectable: true, restrictedReason: null },
  { organizationId: ids.restricted, displayName: "Test Only Restricted", reference: null, status: "RESTRICTED", destinationType: "RESTRICTED", updatedAt: "2026-09-10T10:00:00.000Z", selectable: false, restrictedReason: "ACCESS_RESTRICTED" },
];
const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir("tmp/s8e712-artifacts", { recursive: true });
try {
  for (const width of [1363, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 936 } });
    await context.addInitScript(() => {
      if (sessionStorage.getItem("tpl_profile_fixture_seeded")) return;
      sessionStorage.setItem("tpl_profile_fixture_seeded", "true");
      localStorage.setItem("tpl_auth_session_v1", JSON.stringify({ user: { id: "test-only-user", accountType: "partner", fullName: "Test Only" }, token: "local-fixture-not-a-real-session" }));
    });
    const page = await context.newPage();
    let selectRequests = 0;
    let failDraftOnce = true;
    const errors = [];
    page.on("pageerror", () => errors.push("uncaught page exception"));
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/api/v1/partner/access" && route.request().method() === "GET") {
        if (!route.request().headers().authorization) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "AUTH_UNAUTHORIZED", message: "Sign in required" } }) });
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles }, meta: { requestId: "fixture-list", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/partner/access/select") {
        selectRequests++;
        const input = route.request().postDataJSON();
        assert.deepEqual(Object.keys(input), ["organizationId"]);
        assert.ok([ids.draft, ids.review].includes(input.organizationId));
        await new Promise((resolve) => setTimeout(resolve, 120));
        if (input.organizationId === ids.draft && failDraftOnce) {
          failDraftOnce = false;
          return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "PARTNER_ACCESS_UNAVAILABLE", message: "Temporarily unavailable" }, meta: { requestId: "fixture-error", apiVersion: "v1" } }) });
        }
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { outcome: "APPLICATION_STATUS", organizationId: input.organizationId, step: "review_submit" }, meta: { requestId: "fixture-select", apiVersion: "v1" } }) });
      }
      if (url.pathname === "/api/v1/auth/logout") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: {} }) });
      if (url.pathname.includes("/api/v1/")) return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "AUTH_UNAUTHORIZED", message: "Sign in required" } }) });
      if (url.hostname !== "127.0.0.1") return route.abort();
      if (url.pathname === "/partner-preview") return route.fulfill({ contentType: "text/html", body: "<h1>Selected profile navigation target</h1>" });
      return route.continue();
    });
    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "Choose your Partner profile" }).waitFor();
    assert.equal(await page.getByText("Contact Support", { exact: true }).count(), 1);
    assert.equal(await page.getByText(/@|mobile|organizationId|membership|resolver/i).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: `tmp/s8e712-artifacts/chooser-${width}.png` });
    const continueButton = page.getByRole("button", { name: "Continue Application: Test Only Hotel" });
    await continueButton.focus();
    await continueButton.press("Enter");
    await page.getByRole("alert").waitFor();
    assert.equal(selectRequests, 1);
    await continueButton.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.querySelector('button[aria-label="Continue Application: Test Only Hotel"]')?.hasAttribute("disabled"));
    assert.equal(await continueButton.isEnabled(), true);
    await continueButton.dblclick();
    await page.waitForURL(`**/partner-preview?step=review_submit&organizationId=${ids.draft}`);
    assert.equal(selectRequests, 2);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1")), ids.draft);
    await page.goto(`${base}/partner-access`);
    await page.waitForURL(`**/partner-preview?step=review_submit&organizationId=${ids.draft}`);
    assert.equal(selectRequests, 3);
    await page.evaluate((id) => sessionStorage.setItem("tpl_partner_profile_preference_v1", id), ids.invalid);
    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "Choose your Partner profile" }).waitFor();
    assert.equal(selectRequests, 3);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1")), null);
    await page.getByRole("button", { name: "View Status: Test Only Cab" }).dblclick();
    await page.waitForURL(`**/partner-preview?step=review_submit&organizationId=${ids.review}`);
    assert.equal(selectRequests, 4);
    await page.evaluate((id) => sessionStorage.setItem("tpl_partner_profile_preference_v1", id), ids.invalid);
    await page.goto(`${base}/partner-access`);
    await page.getByRole("heading", { name: "Choose your Partner profile" }).waitFor();
    await page.getByRole("button", { name: "Switch login" }).click();
    await page.getByText("Partner access could not be confirmed. Sign in or retry.", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem("tpl_partner_profile_preference_v1")), null);
    assert.equal(await page.evaluate(() => localStorage.getItem("tpl_auth_session_v1")), null);
    assert.deepEqual(errors, []);
    results.push({ width, profiles: 3, selectRequests, rememberedRevalidated: true, invalidPreferenceCleared: true, overflow: false });
    await context.close();
  }
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
