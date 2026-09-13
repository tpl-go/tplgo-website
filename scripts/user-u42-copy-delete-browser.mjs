import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:3130";
const user = { id: "u42-owner", mobile: "", email: "", fullName: "Operator", accountType: "personal" };
const session = { token: "u42-synthetic-session", expiresAt: "2027-01-01T00:00:00Z" };
const traveller = { id: "00000000-0000-4000-8000-000000000042", userId: user.id, version: 1, firstName: "Asha", lastName: "Sharma", gender: "", dateOfBirth: null, email: null, mobile: null, metadata: { personal: {}, frequentFlyers: [] } };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1363, height: 950 } });
const state = { profile: { id: "00000000-0000-4000-8000-000000000041", userId: user.id, version: 1, updatedAt: new Date().toISOString(), firstName: "Operator", lastName: "", gender: null, dateOfBirth: null, email: null, mobile: null, address: {}, preferences: {} }, travellers: [traveller], mutations: [] };
await context.addInitScript(({ user, session }) => localStorage.setItem("tpl_auth_session_v1", JSON.stringify({ user, session, token: session.token })), { user, session });
await context.route("**/*", async route => {
  const url = new URL(route.request().url()), path = url.pathname, method = route.request().method();
  if (!path.includes("/api/")) return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
  const response = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status < 400 ? { ok: true, data } : { ok: false, error: { code: "UNAVAILABLE", message: "Unavailable" } }) });
  if (path === "/api/v1/auth/session") return response({ user, session });
  if (path === "/api/v1/me") return response({ user });
  if (path === "/api/v1/me/login-methods") return response({ ownerId: user.id, methods: [], googleConnected: false });
  if (path === "/api/v1/me/profile") {
    if (method === "GET") return response({ profile: state.profile });
    state.mutations.push({ path, method, body: route.request().postDataJSON() });
    state.profile = { ...state.profile, ...route.request().postDataJSON(), email: route.request().postDataJSON().email ?? null, version: 2 };
    return response({ profile: state.profile });
  }
  if (path === "/api/v1/me/travellers") {
    if (method === "GET") return response({ travellers: state.travellers });
    state.mutations.push({ path, method }); return response({ traveller });
  }
  if (path.startsWith("/api/v1/me/travellers/")) {
    if (method === "DELETE") { state.mutations.push({ path, method }); state.travellers = []; return response({ deleted: true, id: traveller.id }); }
  }
  return response({});
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
await page.goto(`${base}/account/profile`);
await page.getByText("Personal email", { exact: true }).waitFor();
assert.equal(await page.getByText("No personal email added", { exact: true }).count(), 1);
assert.equal(await page.getByText("Profile email · this browser", { exact: true }).count(), 0);
const firstName = page.locator('label').filter({ hasText: /^FIRST & MIDDLE NAME$/ }).locator("..").locator("input");
await firstName.waitFor();
assert.equal(await page.locator('label').filter({ hasText: /^PERSONAL EMAIL$/ }).getAttribute("for"), await page.locator('label').filter({ hasText: /^PERSONAL EMAIL$/ }).locator("..").locator("input").getAttribute("id"));
await page.locator('label').filter({ hasText: /^PERSONAL EMAIL$/ }).locator("..").locator("input").fill("personal@example.test");
await page.getByRole("button", { name: "SAVE BASIC DETAILS", exact: true }).click();
await page.getByText("Basic profile details saved to your account.", { exact: true }).waitFor();
assert.equal(state.profile.email, "personal@example.test");
assert.equal(await page.getByText("personal@example.test", { exact: true }).count(), 1);
assert.equal(await page.getByText("Verified", { exact: true }).count(), 0);
await page.getByRole("button", { name: /Co Traveller/ }).click();
await page.getByText("Asha Sharma", { exact: true }).waitFor();
await page.getByRole("button", { name: "Delete traveller" }).click();
await page.getByRole("dialog", { name: "Remove saved traveller?" }).waitFor();
assert.equal(state.mutations.length, 1); // the profile save only
assert.equal(await page.getByRole("dialog").getByText("Asha Sharma", { exact: true }).count(), 1);
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog").count(), 0);
assert.equal(state.mutations.length, 1);
await page.getByRole("button", { name: "Delete traveller" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
assert.equal(state.mutations.length, 1);
await page.getByRole("button", { name: "Delete traveller" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Remove traveller", exact: true }).click();
await page.getByText("Removed from saved travellers. Existing bookings are unchanged.", { exact: true }).waitFor();
assert.equal(state.mutations.filter(m => m.method === "DELETE").length, 1);
console.log(JSON.stringify({ result: "PASS", scenarios: ["personal-email-empty-and-update", "login-method-separation", "dialog-escape-cancel", "confirmed-versioned-delete"], liveProof: false }));
await browser.close();
