import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.TPL_ACCESS_BROWSER_URL || "http://127.0.0.1:3117";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("This fixture harness is local-only.");
const browser = await chromium.launch({ headless: true });
const results = [];
await mkdir("tmp/s8e71-artifacts", { recursive: true });
try {
  for (const width of [1363, 768, 390]) {
    for (const method of ["email", "mobile"]) {
      const context = await browser.newContext({ viewport: { width, height: 936 } });
      let verified = false, sends = 0, verifies = 0, starts = 0, recoveries = 0;
      const errors = [];
      const page = await context.newPage();
      page.on("pageerror", () => errors.push("uncaught page exception"));
      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.includes("/api/v1/")) {
          let data = {};
          let status = 200;
          if (url.pathname.endsWith("/send-otp")) { sends++; data = { accepted: true, resendAvailableAt: new Date(Date.now()+60000).toISOString() }; }
          else if (url.pathname.endsWith("/verify-otp")) { verifies++; verified = true; data = { user: { id: "fixture-user", mobile: "", email: "qa@example.test", fullName: "Test only", accountType: "partner", leadTraveller: { phone: "" } }, session: { token: "local-fixture-not-a-real-session", tokenType: "Bearer", expiresAt: new Date(Date.now()+600000).toISOString() } }; }
          else if (url.pathname.endsWith("/partner/access")) { if (!verified) status = 401; else data = { outcome: "NO_LINKED_PROFILE", organizationId: null, step: null }; }
          else if (url.pathname.endsWith("/application/start")) { starts++; await new Promise((resolve) => setTimeout(resolve, 150)); data = { access: { outcome: "APPLICATION", organizationId: "test-org", step: "account_contact" } }; }
          else if (url.pathname.includes("recovery")) recoveries++;
          else if (url.pathname.endsWith("/auth/session")) status = 401;
          else if (url.pathname.endsWith("/me")) data = { user: { id: "fixture-user", accountType: "partner", email: "qa@example.test", mobile: "", fullName: "Test only" } };
          return route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ ok: status === 200, data, error: status === 401 ? { code: "AUTH_UNAUTHORIZED", message: "Sign in required" } : undefined, meta: { requestId: "fixture-request", apiVersion: "v1" } }) });
        }
        if (url.hostname !== "127.0.0.1") return route.abort();
        if (url.pathname === "/partner-preview") return route.fulfill({ contentType: "text/html", body: "<h1>Navigation assertion target</h1>" });
        return route.continue();
      });
      await page.goto(`${base}/partner-access`);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("heading", { name: "Sign in or start your Partner application" }).waitFor();
      assert.equal(await dialog.getByText("Become a TPL Partner", { exact: true }).count(), 0);
      await page.screenshot({ path: `tmp/s8e71-artifacts/login-${width}-${method}.png` });
      if (method === "email") await dialog.getByRole("button", { name: "email login" }).click();
      await dialog.getByLabel(method === "email" ? "Email address" : "Mobile number (+91)").fill(method === "email" ? "qa@example.test" : "1111111111");
      await dialog.getByRole("button", { name: "Continue with OTP" }).click();
      await dialog.getByLabel("Verification code").fill("000000");
      await dialog.getByLabel("Verification code").press("Enter");
      await page.getByRole("heading", { name: "No Partner profile is linked to this login" }).waitFor();
      assert.equal(starts, 0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false);
      await page.screenshot({ path: `tmp/s8e71-artifacts/decision-${width}-${method}.png` });
      await page.getByRole("button", { name: "Recover Existing Partner Access" }).click();
      await page.getByText("Secure recovery is not yet available on staging.").waitFor();
      assert.equal(recoveries, 0); assert.equal(starts, 0);
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByRole("button", { name: "Start New Partner Application" }).dblclick();
      await page.waitForURL("**/partner-preview?step=account_contact");
      assert.equal(starts, 1); assert.equal(sends, 1); assert.equal(verifies, 1);
      assert.deepEqual(errors, []);
      results.push({ width, method, sends, verifies, starts, recoveries, overflow, navigation: "account_contact", proof: "mocked API UI only" });
      await context.close();
    }
  }
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
