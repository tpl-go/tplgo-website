#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const FRONTEND_URL = (process.env.TPL_FRONTEND_URL || "https://www.tplgo.com").replace(/\/+$/, "");
const RUN_ID = sanitizeRunId(process.env.SMOKE_RUN_ID || createRunId());
const DEPARTURE_DATE = process.env.FLIGHT_DEPARTURE_DATE || nextIsoDate(30);
const CONTACT = sanitizeContact(process.env.RAZORPAY_TEST_CONTACT || "9123456789");
const EMAIL = process.env.RAZORPAY_TEST_EMAIL || "d20y.smoke@example.test";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "d20y-razorpay-browser-checkout-result.json");
const MD_PATH = path.join(OUT_DIR, "d20y-razorpay-browser-checkout-report.md");
const HEADLESS = process.env.HEADLESS !== "0";

const result = {
  startedAt: new Date().toISOString(),
  frontendUrl: FRONTEND_URL,
  runId: RUN_ID,
  departureDate: DEPARTURE_DATE,
  checks: [],
  events: [],
  storageSafety: null,
  status: "failed",
};

main().catch(async (error) => {
  result.error = redactMessage(error instanceof Error ? error.message : String(error));
  result.status = "failed";
  await writeArtifacts();
  console.error("D20Y_RAZORPAY_BROWSER_SMOKE_FAILED");
  console.error(result.error);
  process.exit(1);
});

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });

  page.on("request", (request) => recordGatewayEvent("request", request.method(), request.url()));
  page.on("response", (response) => recordGatewayEvent("response", String(response.status()), response.url()));

  try {
    await runFlow(page);
    result.status = result.checks.every((item) => item.ok) ? "passed" : "failed";
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(`D20Y Razorpay browser checkout smoke: ${result.status}`);
  console.log(`JSON result: ${JSON_PATH}`);
  console.log(`Markdown report: ${MD_PATH}`);
  process.exitCode = result.status === "passed" ? 0 : 1;
}

async function runFlow(page) {
  const route = `${FRONTEND_URL}/flights?from=DEL&to=BOM&departure=${DEPARTURE_DATE}&adults=1&children=0&infants=0&tripType=oneway&cabin=Economy&tplSmokeRunId=${RUN_ID}`;
  await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    [
      "tplFlightReviewPayload",
      "tplFlightBookingReviewData",
      "tplFlightConfirmationData",
      "tplActiveOfferPayload",
      "tplActiveOfferActivation",
      "tpl_smart_offer_source_v1",
      "tpl_smart_active_offer_v1",
    ].forEach((key) => sessionStorage.removeItem(key));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  await page.getByRole("button", { name: "BOOK NOW" }).first().click({ timeout: 30000 });
  await page.waitForURL("**/flights/review", { timeout: 30000 });
  await addCheck(page.url().includes("/flights/review"), "review-page-reached", "Selected a flight result and reached review.");

  const reviewPayload = await readJsonStorage(page, "tplFlightReviewPayload");
  await addCheck(Boolean(reviewPayload?.backendOffer), "backend-offer-present", "Review payload is backend-sourced.");
  await addCheck(reviewPayload?.backendOffer?.smokeRunId === RUN_ID, "smoke-run-id-preserved", "Smoke run id was preserved on backendOffer metadata.");

  await completeReview(page);
  await page.getByRole("button", { name: "Proceed to Book" }).click({ timeout: 30000 });
  await page.waitForURL("**/flights/payment", { timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const paymentPayload = await readJsonStorage(page, "tplFlightBookingReviewData");
  await addCheck(Boolean(paymentPayload?.backendSimulation?.bookingDraftId), "backend-simulation-created", "Backend booking simulation was created.");
  await addCheck(paymentPayload?.reviewData?.backendOffer?.smokeRunId === RUN_ID, "payment-smoke-run-id-present", "Payment payload retained smoke run id.");

  await page.getByText("Credit & Debit Cards", { exact: true }).click({ timeout: 30000 });
  await page.getByRole("button", { name: "Proceed to Payment" }).click({ timeout: 30000 });
  const checkoutFrame = await waitForRazorpayFrame(page);
  await addCheck(Boolean(checkoutFrame), "razorpay-checkout-opened", "Razorpay Checkout iframe opened in test mode.");

  await completeRazorpayCheckout(page, checkoutFrame);
  await page.waitForURL("**/flights/confirmation", { timeout: 120000 });
  const confirmationText = await page.locator("body").innerText({ timeout: 30000 });

  await addCheck(confirmationText.includes("TPL Test Confirmation"), "confirmation-test-copy", "Confirmation page shows TPL test confirmation.");
  await addCheck(!/Supplier confirmed|real PNR|Ticket Number\s*[:#]?\s*[A-Z0-9]/i.test(confirmationText), "no-supplier-confirmation-copy", "Confirmation does not imply supplier booking, PNR, or ticketing.");

  result.storageSafety = await inspectStorageSafety(page);
  await addCheck(result.storageSafety.ok, "session-storage-safe", "Session storage contains no raw Razorpay response, signature, provider refs, or secrets.");
}

async function completeReview(page) {
  await page.getByRole("button", { name: "Add ADULT 1" }).click({ timeout: 30000 });
  await page.getByPlaceholder("First & Middle Name").fill("Dtwentyy");
  await page.getByPlaceholder("Last Name").fill("Smoke");
  await page.getByRole("button", { name: "MALE", exact: true }).click();
  await page.getByPlaceholder("Mobile No").fill(CONTACT);
  await page.getByPlaceholder("Email (Optional)").fill(EMAIL);
  await page.getByRole("button", { name: "Save Travellers" }).click({ timeout: 30000 });
  await page.waitForTimeout(800);
  await page.getByPlaceholder("Enter mobile number").fill(CONTACT);
  await page.getByPlaceholder("Enter email").fill(EMAIL);

  await page.locator("button").filter({ hasText: "Add Seats" }).click({ timeout: 30000 });
  await page.locator("button").filter({ hasText: "Skip This Traveller" }).click({ timeout: 30000 });
  await page.locator("button").filter({ hasText: "Continue Without Seat" }).click({ timeout: 30000 });
  await page.locator("button").filter({ hasText: "Add Meals" }).click({ timeout: 30000 });
  await page.locator("button").filter({ hasText: "Skip Meals" }).click({ timeout: 30000 });
  await page.getByText("Skip", { exact: true }).click({ timeout: 30000 });
  await page.getByText("No, I will book without trip secure.", { exact: true }).click({ timeout: 30000 });
  await page.waitForTimeout(1000);

  const proceed = page.getByRole("button", { name: "Proceed to Book" });
  if (!(await proceed.isEnabled())) {
    const tail = (await page.locator("body").innerText()).slice(-700);
    throw new Error(`Proceed to Book disabled: ${tail}`);
  }
}

async function completeRazorpayCheckout(page, frame) {
  await maybeFill(frame.locator('input[name="contact"]'), CONTACT);
  await maybeFill(frame.locator('input[name="email"]'), EMAIL);
  await clickFirst(frame, [
    () => frame.getByRole("button", { name: "Continue" }),
    () => frame.locator("button").filter({ hasText: "Continue" }),
  ], 5000).catch(() => {});
  await page.waitForTimeout(2500);

  await clickFirst(frame, [
    () => frame.getByText("Cards", { exact: true }),
    () => frame.locator('input[type="radio"]').nth(1),
  ], 10000);
  await page.waitForTimeout(1500);

  await maybeFill(frame.locator('input[name="card[number]"]'), "4111111111111111");
  await maybeFill(frame.locator('input[name="card[expiry]"]'), "1230");
  await maybeFill(frame.locator('input[name="card[cvv]"]'), "123");
  await maybeFill(frame.locator('input[name="card[name]"]'), "Dtwentyy Smoke");

  await fillByPlaceholder(frame, "Card Number", "4111111111111111");
  await fillByPlaceholder(frame, "Expiry", "1230");
  await fillByPlaceholder(frame, "CVV", "123");
  await fillByPlaceholder(frame, "Name", "Dtwentyy Smoke");

  await clickFirst(frame, [
    () => frame.getByRole("button", { name: "Pay" }),
    () => frame.locator("button").filter({ hasText: "Pay" }),
    () => frame.locator('button[type="submit"]'),
  ], 30000);
  await page.waitForTimeout(5000);

  await maybeFill(frame.locator('input[type="password"]'), "1234");
  await maybeFill(frame.locator('input[autocomplete="one-time-code"]'), "1234");
  await fillByPlaceholder(frame, "OTP", "1234");
  await clickFirst(frame, [
    () => frame.getByRole("button", { name: "Submit" }),
    () => frame.getByRole("button", { name: "Verify" }),
    () => frame.locator("button").filter({ hasText: "Success" }),
    () => frame.locator('button[type="submit"]'),
  ], 30000).catch(() => {});
}

async function waitForRazorpayFrame(page) {
  for (let index = 0; index < 60; index += 1) {
    const frame = page.frames().find((item) => item.url().includes("razorpay"));
    if (frame) return frame;
    await page.waitForTimeout(500);
  }
  throw new Error("Razorpay Checkout frame did not open.");
}

async function clickFirst(frame, locators, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    for (const build of locators) {
      try {
        const locator = build();
        if ((await locator.count()) > 0) {
          await locator.first().click({ timeout: 1500, force: true });
          return;
        }
      } catch (error) {
        lastError = error;
      }
    }
    await frame.page().waitForTimeout(500);
  }
  throw lastError || new Error("No matching clickable Razorpay control found.");
}

async function maybeFill(locator, value) {
  try {
    if ((await locator.count()) > 0) {
      await locator.first().fill(value, { timeout: 2500 });
    }
  } catch {}
}

async function fillByPlaceholder(frame, text, value) {
  try {
    const locator = frame.getByPlaceholder(text, { exact: false });
    if ((await locator.count()) > 0) await locator.first().fill(value, { timeout: 2500 });
  } catch {}
}

async function readJsonStorage(page, key) {
  return page.evaluate((storageKey) => {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, key);
}

async function inspectStorageSafety(page) {
  return page.evaluate(() => {
    const forbidden = /razorpay_signature|gatewaySignature|rawRazorpay|rawResponse|providerOfferRef|secret|token/i;
    const hits = [];
    for (const key of Object.keys(sessionStorage)) {
      const value = sessionStorage.getItem(key) || "";
      if (forbidden.test(key) || forbidden.test(value)) hits.push(key);
    }
    return { ok: hits.length === 0, hitKeys: hits };
  });
}

async function addCheck(ok, id, details) {
  result.checks.push({ id, ok: Boolean(ok), details });
}

function recordGatewayEvent(type, methodOrStatus, url) {
  if (!/test-order|test-confirm|checkout\.razorpay\.com|api\.razorpay\.com\/v1\/checkout|api\.razorpay\.com\/v2\/standard_checkout/.test(url)) return;
  result.events.push({
    type,
    methodOrStatus,
    endpoint: url.includes("test-order") ? "flight-test-order" : url.includes("test-confirm") ? "flight-test-confirm" : "razorpay-checkout",
  });
}

async function writeArtifacts() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await writeFile(MD_PATH, buildMarkdown(), "utf8");
}

function buildMarkdown() {
  return [
    "# D20Y Razorpay Browser Checkout Smoke Result",
    "",
    `- Status: ${result.status}`,
    `- Frontend URL: ${result.frontendUrl}`,
    `- Run ID: ${result.runId}`,
    `- Departure Date: ${result.departureDate}`,
    "",
    "## Checks",
    "",
    ...(result.checks.length ? result.checks.map((item) => `- ${item.ok ? "PASS" : "FAIL"} ${item.id}: ${item.details}`) : ["- None"]),
    "",
    "## Gateway Events",
    "",
    ...(result.events.length ? result.events.map((item) => `- ${item.type} ${item.methodOrStatus} ${item.endpoint}`) : ["- None"]),
    "",
    "## Storage Safety",
    "",
    result.storageSafety ? `- Safe: ${result.storageSafety.ok ? "yes" : "no"}` : "- Not inspected",
    result.storageSafety?.hitKeys?.length ? `- Hit keys: ${result.storageSafety.hitKeys.join(", ")}` : "- Hit keys: none",
    result.error ? `\n## Error\n\n${result.error}\n` : "",
  ].join("\n");
}

function sanitizeContact(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(-10) : digits.slice(0, 10);
}

function sanitizeRunId(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || createRunId();
}

function createRunId() {
  return `d20y_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function nextIsoDate(daysFromNow) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function redactMessage(message) {
  return message
    .replace(/rzp_(?:live|test)_[A-Za-z0-9]+/g, "[razorpay-key-redacted]")
    .replace(/razorpay_signature[^\s,}]+/gi, "razorpay_signature[redacted]")
    .replace(/gatewaySignature[^\s,}]+/gi, "gatewaySignature[redacted]")
    .replace(/session_token=[^&\s]+/gi, "session_token=[redacted]");
}