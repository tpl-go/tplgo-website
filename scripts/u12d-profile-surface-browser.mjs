import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.U12D_BASE_URL ?? "http://127.0.0.1:3100";
const out = "reports/artifacts/u1-2d";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => localStorage.setItem("tpl_auth_session_v1", JSON.stringify({ token: "synthetic-profile-session", session: { token: "synthetic-profile-session", expiresAt: "2099-01-01T00:00:00.000Z" }, user: { id: "00000000-0000-4000-8000-000000000111", accountType: "personal" } })));
    await context.route(/\/api\/v1\//, async route => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname;
      const success = data => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data, meta: { requestId: "synthetic-u12d", apiVersion: "v1" } }) });
      if (path.endsWith("/api/v1/auth/session")) return success({ user: { id: "00000000-0000-4000-8000-000000000111", accountType: "personal", mobile: "synthetic" }, session: { token: "synthetic-profile-session", expiresAt: "2099-01-01T00:00:00.000Z" } });
      if (path.endsWith("/api/v1/auth/me")) return success({ user: { id: "00000000-0000-4000-8000-000000000111", accountType: "personal", mobile: "synthetic" } });
      if (path.endsWith("/api/v1/me/profile")) return success({ profile: { id: "00000000-0000-4000-8000-000000000222", userId: "00000000-0000-4000-8000-000000000111", version: 3, firstName: "Synthetic", lastName: "Profile", gender: "Other", dateOfBirth: "2000-02-29", email: "profile@example.test", mobile: "+442079460123", address: { countryCode: "IN", region: "Delhi", city: "New Delhi" }, preferences: { personal: { nationality: "Indian", maritalStatus: "Married", anniversary: "2024-03-01" }, frequentFlyers: [] }, updatedAt: "2026-09-18T00:00:00.000Z" } });
      if (path.endsWith("/api/v1/me/travellers")) return success({ travellers: [] });
      if (path.endsWith("/api/v1/me/profile/photo")) return success({ photo: null });
      if (path.endsWith("/api/v1/me/login-methods")) return success({ methods: [] });
      if (path.endsWith("/api/v1/me/device-sessions")) return success({ deviceSessions: [] });
      if (path.endsWith("/api/v1/reference/profile-locations")) {
        const level = url.searchParams.get("level");
        if (level === "countries") return success({ version: "country-state-city@3.2.1", level, options: [{ value: "IN", label: "India", detail: "IN" }, { value: "US", label: "United States", detail: "US" }] });
        if (level === "regions") return success({ version: "country-state-city@3.2.1", level, options: [{ value: "Delhi", label: "Delhi", detail: "DL" }] });
        return success({ version: "country-state-city@3.2.1", level, options: [{ value: "New Delhi", label: "New Delhi" }] });
      }
      if (path.includes("/api/v1/wallet")) return success({ promoCredit: 0, earnedCredit: 0, refundableBalance: 0 });
      return success({});
    });
    const page = await context.newPage();
    await page.goto(`${base}/account/profile`, { waitUntil: "networkidle" });
    try { await page.getByRole("heading", { name: "General Information" }).waitFor({ timeout: 30000 }); }
    catch (error) { await page.screenshot({ path: `${out}/profile-${viewport.width}x${viewport.height}-failure.png`, fullPage: true }); throw new Error(`Profile did not render at ${page.url()}: ${(await page.locator("body").innerText()).slice(0, 1200)}`, { cause: error }); }
    const dob = await page.getByLabel("DATE OF BIRTH").inputValue();
    const anniversary = await page.getByLabel("ANNIVERSARY").inputValue();
    const country = page.getByRole("button", { name: "COUNTRY" });
    await country.click();
    await page.getByLabel("Search COUNTRY").fill("United");
    await page.getByRole("button", { name: /United States/ }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    await page.screenshot({ path: `${out}/profile-${viewport.width}x${viewport.height}.png`, fullPage: true });
    results.push({ viewport, dob, anniversary, personalMobile: await page.getByLabel("MOBILE NUMBER").inputValue(), personalEmail: await page.getByLabel("PERSONAL EMAIL").inputValue(), countryAfterSelection: await country.textContent(), overflow, photoAction: await page.getByRole("button", { name: "Add photo" }).isVisible() });
    await context.close();
  }
  if (results.some(result => result.dob !== "2000-02-29" || result.anniversary !== "2024-03-01" || result.overflow || !result.photoAction || !result.countryAfterSelection?.includes("United States"))) throw new Error(`Profile surface assertion failed: ${JSON.stringify(results)}`);
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally { await browser.close(); }
