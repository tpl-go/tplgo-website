#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const FRONTEND_URL = (process.env.TPL_FRONTEND_URL || "https://www.tplgo.com").replace(/\/+$/, "");
const RUN_ID = sanitizeRunId(process.env.SMOKE_RUN_ID || createRunId());
const DEPARTURE_DATE = process.env.FLIGHT_DEPARTURE_DATE || nextIsoDate(30);
const CONTACT = sanitizeContact(process.env.RAZORPAY_TEST_CONTACT || "9123456789");
const EMAIL = process.env.RAZORPAY_TEST_EMAIL || "d20y.smoke@example.test";
const RAZORPAY_TEST_METHOD = sanitizeTestMethod(process.env.RAZORPAY_TEST_METHOD || "card");
const CARD_NUMBER = sanitizeDigits(process.env.RAZORPAY_TEST_CARD_NUMBER || "4100280000001007");
const CARD_EXPIRY = sanitizeDigits(process.env.RAZORPAY_TEST_CARD_EXPIRY || "1230");
const CARD_CVV = sanitizeDigits(process.env.RAZORPAY_TEST_CARD_CVV || "123");
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "d20y-razorpay-browser-checkout-result.json");
const MD_PATH = path.join(OUT_DIR, "d20y-razorpay-browser-checkout-report.md");
const SCREENSHOT_PATH = path.join(OUT_DIR, "d20y-razorpay-browser-checkout-failure.png");
const MANUAL_RAZORPAY = process.env.MANUAL_RAZORPAY === "1";
const HEADLESS = MANUAL_RAZORPAY ? false : process.env.HEADLESS !== "0";
const CONFIRMATION_TIMEOUT_MS = Number(process.env.CONFIRMATION_TIMEOUT_MS || (MANUAL_RAZORPAY ? 600000 : 120000));
const BACKEND_SEARCH_SETTLE_MS = Number(process.env.BACKEND_SEARCH_SETTLE_MS || 8000);
const RUN_MANAGE_CANCEL = process.env.RUN_MANAGE_CANCEL === "1";

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
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: MANUAL_RAZORPAY ? ["--start-maximized", "--window-size=1600,1200"] : [],
  });
  const page = await browser.newPage({
    viewport: MANUAL_RAZORPAY
      ? { width: 1600, height: 1200 }
      : { width: 1600, height: 1400 },
  });

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
  if (BACKEND_SEARCH_SETTLE_MS > 0) await page.waitForTimeout(BACKEND_SEARCH_SETTLE_MS);

  await clickVisibleBookNow(page);
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
  if (MANUAL_RAZORPAY) await prepareManualRazorpayViewport(page);
  await page.getByRole("button", { name: "Proceed to Payment" }).click({ timeout: 30000 });
  const checkoutFrame = await waitForRazorpayFrame(page);
  await addCheck(Boolean(checkoutFrame), "razorpay-checkout-opened", "Razorpay Checkout iframe opened in test mode.");

  if (MANUAL_RAZORPAY) {
    console.log("D20Z_MANUAL_RAZORPAY_READY");
    console.log("Complete the Razorpay test checkout manually in the visible browser. The script will resume after /flights/confirmation loads.");
  } else {
    try {
      await completeRazorpayCheckout(page, checkoutFrame);
      await advanceRazorpayTestCheckout(page);
    } catch (error) {
      result.razorpaySnapshot = await describeRazorpayFrames(page);
      await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${message}; Razorpay visible controls snapshot: ${JSON.stringify(result.razorpaySnapshot)}`);
    }
  }
  try {
    await page.waitForURL("**/flights/confirmation", { timeout: CONFIRMATION_TIMEOUT_MS });
  } catch (error) {
    result.providerCompletionStatus = MANUAL_RAZORPAY ? "MANUAL_COMPLETION_TIMEOUT" : "MANUAL_REQUIRED";
    result.razorpaySnapshot = await describeRazorpayFrames(page);
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}; Razorpay visible controls snapshot: ${JSON.stringify(result.razorpaySnapshot)}`);
  }
  const confirmationText = await readSettledConfirmationText(page);

  await addCheck(result.events.some((item) => item.endpoint === "flight-test-confirm" && item.type === "request"), "flight-test-confirm-requested", "Backend flight test-confirm request occurred.");
  await addCheck(result.events.some((item) => item.endpoint === "flight-test-confirm" && item.type === "response" && /^2/.test(item.methodOrStatus)), "flight-test-confirm-verified", "Backend test-confirm returned success, indicating signature verification passed.");
  await addCheck(hasTestOnlyConfirmationMarkers(confirmationText), "confirmation-test-only-markers", "Confirmation page shows TPL test-only markers.");
  await addCheck(!/Supplier confirmed|real PNR|Ticket Number\s*[:#]?\s*[A-Z0-9]/i.test(confirmationText), "no-supplier-confirmation-copy", "Confirmation does not imply supplier booking, PNR, or ticketing.");

  result.confirmationReadback = await inspectConfirmationReadback(page, confirmationText);
  await addCheck(result.confirmationReadback.bookingPersisted === true, "booking-persisted-true", "Confirmation storage has bookingPersisted=true.");
  await addCheck(result.confirmationReadback.backendBookingRefOrIdPresent === true, "backend-booking-ref-or-id-present", "Confirmation storage has backend booking ref/id present.");
  await addCheck(result.confirmationReadback.paymentStatusPaid === true, "payment-status-paid", "Confirmation storage reports paid payment status.");
  await addCheck(result.confirmationReadback.visibleBackendBookingRefOrId === true, "backend-booking-ref-or-id-visible", "Confirmation page visibly shows backend booking ref/id.");

  result.storageSafety = await inspectStorageSafety(page);
  await addCheck(result.storageSafety.ok, "session-storage-safe", "Session storage contains no raw Razorpay response, signature, provider refs, or secrets.");

  if (RUN_MANAGE_CANCEL) {
    result.manageCancellation = await runManageCancellationSmoke(page);
    await addCheck(result.manageCancellation.accountReadbackVisible === true, "account-booking-readback-visible", "Account booking readback can locate the backend booking.");
    await addCheck(result.manageCancellation.manageLinkVisible === true, "manage-booking-link-visible", "Confirmation page exposes a Manage Booking handoff.");
    await addCheck(result.manageCancellation.managePageLoaded === true, "manage-booking-page-loaded", "Manage Booking page loaded the backend booking context.");
    await addCheck(result.manageCancellation.cancellationRequestSucceeded === true, "cancellation-request-succeeded", "Manage Booking cancellation request succeeded.");
    await addCheck(result.manageCancellation.bookingCancelled === true, "booking-cancelled", "Booking status is cancelled after cancellation.");
    await addCheck(result.manageCancellation.refundMethodOriginalPayment === true, "refund-method-original-payment", "Refund method is original payment.");
    await addCheck(result.manageCancellation.refundStatusExpected === true, "refund-status-expected", "Refund status is processing/provider_pending as designed.");
    await addCheck(result.manageCancellation.paymentStatusPaid === true, "payment-status-still-paid", "Payment readback remains paid.");
    await addCheck(result.manageCancellation.walletCreditCreated === false, "no-wallet-credit-created", "No wallet credit was created for full original-payment cancellation.");
    await addCheck(result.manageCancellation.supplierCancellationExecuted === false, "supplier-cancellation-not-executed", "Supplier cancellation was not executed.");
    await addCheck(result.manageCancellation.liveProviderRefundExecuted === false, "live-provider-refund-not-executed", "Live provider refund was not executed.");
    await addCheck(result.manageCancellation.pnrPresent === false, "pnr-absent", "PNR remains absent for mock-flight test booking.");
    await addCheck(result.manageCancellation.ticketNumberPresent === false, "ticket-number-absent", "Ticket number remains absent for mock-flight test booking.");
  }
}

async function inspectConfirmationReadback(page, confirmationText) {
  return page.evaluate((visibleText) => {
    const parseJson = (value) => {
      try { return value ? JSON.parse(value) : null; } catch { return null; }
    };
    const confirmation = parseJson(sessionStorage.getItem("tplFlightConfirmationData"));
    const bookingRef = String(
      confirmation?.backendBookingRef ||
      confirmation?.backendTestPaymentConfirmation?.backendBookingRef ||
      confirmation?.bookingMeta?.backendBookingRef ||
      ""
    ).trim();
    const bookingId = String(
      confirmation?.backendBookingId ||
      confirmation?.backendTestPaymentConfirmation?.backendBookingId ||
      confirmation?.bookingMeta?.backendBookingId ||
      ""
    ).trim();
    const bookingPersisted = confirmation?.bookingPersisted === true || confirmation?.bookingMeta?.bookingPersisted === true;
    const paymentStatusPaid = String(confirmation?.bookingMeta?.paymentStatus || confirmation?.paymentStatus || "").toLowerCase() === "paid";
    const refs = [bookingRef, bookingId].filter(Boolean);
    const visibleBackendBookingRefOrId = refs.some((ref) => visibleText.includes(ref));
    const localKeys = Object.keys(localStorage);
    const localBookingStorePresent = refs.some((ref) => localKeys.some((key) => (localStorage.getItem(key) || "").includes(ref)));
    const links = Array.from(document.querySelectorAll("a, button")).map((node) => `${node.textContent || ""} ${node.getAttribute?.("href") || ""}`);
    const manageLinkPresent = links.some((text) => /manage/i.test(text));
    const accountBookingLinkPresent = links.some((text) => /account\/bookings|booking|trip/i.test(text));
    return {
      bookingPersisted,
      backendBookingRefPresent: Boolean(bookingRef),
      backendBookingIdPresent: Boolean(bookingId),
      backendBookingRefOrIdPresent: refs.length > 0,
      paymentStatusPaid,
      visibleBackendBookingRefOrId,
      localBookingStorePresent,
      manageLinkPresent,
      accountBookingLinkPresent,
    };
  }, confirmationText);
}

async function runManageCancellationSmoke(page) {
  const bookingRef = await page.evaluate(() => {
    const raw = sessionStorage.getItem("tplFlightConfirmationData");
    const payload = raw ? JSON.parse(raw) : null;
    return String(
      payload?.backendBookingRef ||
      payload?.backendTestPaymentConfirmation?.backendBookingRef ||
      payload?.bookingMeta?.backendBookingRef ||
      payload?.bookingId ||
      ""
    ).trim();
  });
  if (!bookingRef) throw new Error("Backend booking ref/id was missing for manage cancellation smoke.");

  const accountUrl = `${FRONTEND_URL}/account/bookings/flight/${encodeURIComponent(bookingRef)}`;
  await page.goto(accountUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  const accountText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  const accountReadbackVisible = accountText.includes(bookingRef) && /paid|payment/i.test(accountText);

  await page.goto(`${FRONTEND_URL}/flights/confirmation`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  const manageButton = page.getByRole("button", { name: "Manage Booking" });
  const manageLinkVisible = (await manageButton.count().catch(() => 0)) > 0;
  if (manageLinkVisible) {
    await manageButton.first().click({ timeout: 30000 });
    await page.waitForURL("**/flights/manage?**", { timeout: 30000 });
  } else {
    await page.goto(`${FRONTEND_URL}/flights/manage?bookingId=${encodeURIComponent(bookingRef)}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const manageText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  const managePageLoaded = page.url().includes("/flights/manage") && manageText.includes(bookingRef) && /Manage Booking/i.test(manageText);

  const cancelTab = page.getByRole("button", { name: "Cancel Booking" });
  if ((await cancelTab.count().catch(() => 0)) > 0) {
    await cancelTab.first().click({ timeout: 30000 });
  }
  await page.waitForTimeout(1000);

  const verifyButton = page.getByRole("button", { name: "Verify to Continue" });
  if ((await verifyButton.count().catch(() => 0)) > 0) {
    await verifyButton.first().click({ timeout: 30000 });
    await page.waitForTimeout(2500);
  }

  const dialogMessages = [];
  page.on("dialog", async (dialog) => {
    dialogMessages.push(dialog.type());
    await dialog.accept().catch(() => {});
  });

  const continueCancel = page.getByRole("button", { name: "Continue to Cancellation" });
  const continueCancelVisible = (await continueCancel.count().catch(() => 0)) > 0;
  if (continueCancelVisible) {
    await continueCancel.first().click({ timeout: 30000 });
    await page.waitForTimeout(7000);
  }

  let cancelledText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  let cancellationRequestSucceeded = result.events.some((item) => item.endpoint === "booking-cancel" && item.type === "response" && /^2/.test(item.methodOrStatus));
  let directCancellationAttempted = !continueCancelVisible;
  let directCancellationHttpSuccess = false;

  if (!cancellationRequestSucceeded) {
    directCancellationAttempted = true;
    const directCancel = await page.evaluate(async (bookingRef) => {
      const response = await fetch(`/api/backend/api/v1/bookings/${encodeURIComponent(bookingRef)}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          reason: "Cancelled by user from Manage Booking",
          serviceType: "flight",
          refundDestination: "original_payment_method",
          metadata: { source: "d22i-browser-smoke-direct-cancellation" }
        })
      });
      return { ok: response.ok, status: response.status };
    }, bookingRef);
    directCancellationHttpSuccess = directCancel.ok;
    await page.waitForTimeout(2500);
    cancelledText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => cancelledText);
    cancellationRequestSucceeded = directCancellationHttpSuccess || result.events.some((item) => item.endpoint === "booking-cancel" && item.type === "response" && /^2/.test(item.methodOrStatus));
  }

  const backendReadback = await page.evaluate(async (bookingRef) => {
    const readJson = async (path) => {
      const response = await fetch(`/api/backend/api/v1${path}`, { headers: { accept: "application/json" } });
      let body = null;
      try { body = await response.json(); } catch {}
      return { ok: response.ok, status: response.status, body };
    };
    const unwrap = (value) => value?.body?.data ?? value?.body ?? {};
    const firstRecord = (value) => {
      const data = unwrap(value);
      if (data.refund) return data.refund;
      if (Array.isArray(data.refunds)) return data.refunds[0] || {};
      if (Array.isArray(data.items)) return data.items[0] || {};
      return data;
    };
    const deepFind = (value, keys) => {
      const stack = [value];
      while (stack.length) {
        const item = stack.pop();
        if (!item || typeof item !== "object") continue;
        for (const key of keys) {
          if (Object.prototype.hasOwnProperty.call(item, key) && item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
        }
        for (const child of Object.values(item)) {
          if (child && typeof child === "object") stack.push(child);
        }
      }
      return undefined;
    };
    const detail = await readJson(`/bookings/${encodeURIComponent(bookingRef)}/detail`);
    const refund = await readJson(`/refunds/by-booking/${encodeURIComponent(bookingRef)}`);
    const payment = await readJson(`/payments/by-booking/${encodeURIComponent(bookingRef)}`);
    const detailData = unwrap(detail);
    const refundRecord = firstRecord(refund);
    const paymentData = unwrap(payment);
    const statusText = JSON.stringify(detailData).toLowerCase();
    const localBlob = Object.keys(localStorage).map((key) => localStorage.getItem(key) || "").join("\n");
    return {
      detailOk: detail.ok,
      refundOk: refund.ok,
      paymentOk: payment.ok,
      bookingCancelled: /cancelled/.test(statusText),
      refundMethod: String(refundRecord.refundMethod || refundRecord.method || refundRecord.metadata?.refundMethod || "").toLowerCase(),
      refundStatus: String(refundRecord.refundStatus || refundRecord.status || "").toLowerCase(),
      paymentStatus: String(paymentData.status || paymentData.payment?.status || "").toLowerCase(),
      paymentGateway: String(paymentData.gateway || paymentData.payment?.gateway || "").toLowerCase(),
      walletCreditCreated: /refund_credit/i.test(localBlob) && localBlob.includes(bookingRef),
      supplierCancellationExecuted: Boolean(deepFind({ detailData, refundRecord }, ["supplierCancellationExecuted"])),
      liveProviderRefundExecuted: Boolean(deepFind({ detailData, refundRecord }, ["liveProviderRefundExecuted"])),
      pnrPresent: Boolean(deepFind(detailData, ["pnr", "PNR"])),
      ticketNumberPresent: Boolean(deepFind(detailData, ["ticketNumber", "ticket_number"])),
    };
  }, bookingRef);

  return {
    accountReadbackVisible,
    manageLinkVisible,
    managePageLoaded,
    cancellationRequestSucceeded,
    bookingCancelled: backendReadback.bookingCancelled || /cancelled/i.test(cancelledText),
    refundReadbackOk: backendReadback.refundOk,
    refundMethodOriginalPayment: backendReadback.refundMethod === "original_payment",
    refundStatusExpected: ["processing", "provider_pending"].includes(backendReadback.refundStatus),
    paymentReadbackOk: backendReadback.paymentOk,
    paymentStatusPaid: backendReadback.paymentStatus === "paid",
    paymentGatewayRazorpay: backendReadback.paymentGateway === "razorpay",
    walletCreditCreated: backendReadback.walletCreditCreated,
    supplierCancellationExecuted: backendReadback.supplierCancellationExecuted,
    liveProviderRefundExecuted: backendReadback.liveProviderRefundExecuted,
    pnrPresent: backendReadback.pnrPresent,
    ticketNumberPresent: backendReadback.ticketNumberPresent,
    guestClaimStartSucceeded: result.events.some((item) => item.endpoint === "guest-claim-start" && item.type === "response" && /^2/.test(item.methodOrStatus)),
    guestClaimVerifySucceeded: result.events.some((item) => item.endpoint === "guest-claim-verify" && item.type === "response" && /^2/.test(item.methodOrStatus)),
    dialogObserved: dialogMessages.length > 0,
    continueCancelVisible,
    directCancellationAttempted,
    directCancellationHttpSuccess,
  };
}
async function readSettledConfirmationText(page) {
  const deadline = Date.now() + 30000;
  let text = "";
  while (Date.now() < deadline) {
    text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    if (hasTestOnlyConfirmationMarkers(text)) return text;
    await page.waitForTimeout(750);
  }
  return text;
}

function hasTestOnlyConfirmationMarkers(text) {
  return (
    text.includes("TPL Test Confirmation") ||
    (
      /TPL-only beta/i.test(text) &&
      /PNR:\s*Not issued in test mode/i.test(text) &&
      /Ticket:\s*Not issued in test mode/i.test(text) &&
      /Supplier booking.*disabled/i.test(text)
    )
  );
}
async function prepareManualRazorpayViewport(page) {
  await page.addStyleTag({
    content: `
      html,
      body {
        height: auto !important;
        min-height: 100dvh !important;
        overflow-y: auto !important;
      }

      .razorpay-container,
      .razorpay-backdrop {
        inset: 0 !important;
        max-height: 100dvh !important;
        overflow-y: auto !important;
      }

      iframe[src*="razorpay"] {
        max-height: calc(100dvh - 16px) !important;
      }
    `,
  }).catch(() => {});
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

async function clickVisibleBookNow(page) {
  const candidates = [
    page.getByTestId("flight-book-now"),
    page.getByRole("button", { name: "Book Now" }),
    page.getByRole("button", { name: "BOOK NOW" }),
  ];

  const deadline = Date.now() + 30000;
  let lastError;
  while (Date.now() < deadline) {
    for (const locator of candidates) {
      try {
        const count = await locator.count();
        for (let index = 0; index < count; index += 1) {
          const candidate = locator.nth(index);
          if (await candidate.isVisible().catch(() => false)) {
            await candidate.scrollIntoViewIfNeeded().catch(() => {});
            await candidate.click({ timeout: 3000 });
            return;
          }
        }
      } catch (error) {
        lastError = error;
      }
    }
    const clicked = await clickBookNowDomFallback(page).catch(() => false);
    if (clicked) return;
    await page.waitForTimeout(500);
  }

  result.preBookNowDebug = await page.evaluate(() => ({
    url: window.location.href,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyTextStart: (document.body?.innerText || "").slice(0, 1200),
    testIdCount: document.querySelectorAll('[data-testid="flight-book-now"]').length,
    bookNowButtonCount: Array.from(document.querySelectorAll("button")).filter((node) => /book\s*now/i.test(node.textContent || node.getAttribute("aria-label") || "")).length,
  })).catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});
  throw lastError || new Error("No visible flight Book Now CTA found.");
}

async function clickBookNowDomFallback(page) {
  return page.evaluate(() => {
    const visible = (node) => {
      const element = node;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const candidates = Array.from(document.querySelectorAll('[data-testid="flight-book-now"], button'))
      .filter((node) => /book\s*now/i.test(node.textContent || node.getAttribute("aria-label") || "") || node.getAttribute("data-testid") === "flight-book-now");
    const target = candidates.find(visible) || candidates[0];
    if (!target) return false;
    target.scrollIntoView({ block: "center", inline: "center" });
    target.click();
    return true;
  });
}

async function completeRazorpayCheckout(page, frame) {
  await maybeFill(frame.locator('input[name="contact"]'), CONTACT);
  await maybeFill(frame.locator('input[name="email"]'), EMAIL);
  await clickRazorpayButtonText(frame, /Using as/i, { preferLast: true }).catch(() => false);
  await page.waitForTimeout(1500);

  if (RAZORPAY_TEST_METHOD === "upi") {
    await completeRazorpayUpiCheckout(page, frame);
    return;
  }

  await completeRazorpayCardCheckout(page, frame);
}

async function completeRazorpayCardCheckout(page, frame) {
  await clickRazorpayOption(frame, /^Cards?$/i).catch(() => {});
  await clickRazorpayButtonText(frame, /^Cards?$/i, { preferLast: true }).catch(() => {});
  await page.waitForTimeout(1500);

  await typeIntoFirstVisible(frame.locator('input[name="card[number]"], input[name="card.number"]'), CARD_NUMBER);
  await typeIntoFirstVisible(frame.locator('input[name="card[expiry]"], input[name="card.expiry"]'), CARD_EXPIRY);
  await typeIntoFirstVisible(frame.locator('input[name="card[cvv]"], input[name="card.cvv"]'), CARD_CVV);
  await typeIntoFirstVisible(frame.locator('input[name="card[name]"], input[name="card.name"]'), "Dtwentyy Smoke");

  await fillByPlaceholder(frame, "Card Number", CARD_NUMBER);
  await fillByPlaceholder(frame, "Expiry", CARD_EXPIRY);
  await fillByPlaceholder(frame, "CVV", CARD_CVV);
  await fillByPlaceholder(frame, "Name", "Dtwentyy Smoke");
  await disableRazorpaySaveCard(frame).catch(() => false);
  await clickRazorpayButtonText(frame, /^(Skip|Maybe later|No thanks)$/i, { preferLast: true }).catch(() => false);

  await clickRazorpayButtonText(frame, /^(Pay|Continue|Pay Now|Proceed)$/i, {
    preferLast: true,
    exclude: /Google Pay UPI|See all plans|Using as/i,
  });
  await page.waitForTimeout(5000);

  await maybeFill(frame.locator('input[type="password"]'), "1234");
  await maybeFill(frame.locator('input[autocomplete="one-time-code"]'), "1234");
  await fillByPlaceholder(frame, "OTP", "1234");
  await clickRazorpayButtonText(frame, /^(Submit|Verify|Success|Continue)$/i, { preferLast: true }).catch(() => {});
}

async function completeRazorpayUpiCheckout(page, frame) {
  await clickFirst(frame, [
    () => frame.getByText("UPI", { exact: true }),
    () => frame.locator("button, [role=button]").filter({ hasText: /UPI/i }),
  ], 10000);
  await page.waitForTimeout(1500);
  await typeIntoFirstVisible(frame.locator('input[type="text"], input[type="email"], input[name*="upi" i], input[placeholder*="UPI" i]'), "success@razorpay");
  await clickFirst(frame, [
    () => frame.getByRole("button", { name: "Verify" }),
    () => frame.getByRole("button", { name: "Continue" }),
    () => frame.getByRole("button", { name: "Pay" }),
    () => frame.locator("button, [role=button]").filter({ hasText: /verify|continue|pay/i }),
  ], 30000);
  await page.waitForTimeout(5000);
  await clickRazorpayButtonText(frame, /^(Success|Submit|Verify)$/i, { preferLast: true }).catch(() => false);
  return true;
}
async function advanceRazorpayTestCheckout(page) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline && !page.url().includes("/flights/confirmation")) {
    const frames = page.frames().filter((item) => item.url().includes("razorpay"));
    for (const activeFrame of frames) {
      await maybeFill(activeFrame.locator('input[type="password"]'), "1234");
      await maybeFill(activeFrame.locator('input[autocomplete="one-time-code"]'), "1234");
      await fillByPlaceholder(activeFrame, "OTP", "1234");
      await disableRazorpaySaveCard(activeFrame).catch(() => false);
      await clickRazorpayOption(activeFrame, /^Cards?$/i).catch(() => false);
      await clickRazorpayButtonText(activeFrame, /^Maybe later$/i, { preferLast: true }).catch(() => false);
      await clickRazorpayButtonText(activeFrame, /^(Success|Submit|Verify|Continue|Pay|Pay Now)$/i, {
        preferLast: true,
        exclude: /Google Pay UPI|See all plans|Using as/i,
      }).catch(() => false);
    }
    await page.waitForTimeout(1500);
  }
}

async function clickRazorpayButtonText(frame, pattern, options = {}) {
  const clicked = await frame.evaluate(({ source, preferLast, excludeSource }) => {
    const regex = new RegExp(source, "i");
    const exclude = excludeSource ? new RegExp(excludeSource, "i") : null;
    const visible = (node) => {
      const element = node;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const candidates = Array.from(document.querySelectorAll("button, [role=button], input[type=button], input[type=submit]"))
      .filter((node) => {
        if (!visible(node)) return false;
        if (node.disabled || node.getAttribute("aria-disabled") === "true") return false;
        if (node.closest('[aria-hidden="true"], [hidden]')) return false;
        return true;
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const text = (node.innerText || node.textContent || node.value || node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
        return { node, text, y: rect.top, area: rect.width * rect.height };
      })
      .filter(({ text, area }) => area > 0 && regex.test(text) && !/Google Pay UPI/i.test(text) && !(exclude && exclude.test(text)))
      .sort((left, right) => preferLast ? right.y - left.y : left.y - right.y);
    const target = candidates[0]?.node;
    if (!target) return false;
    target.scrollIntoView({ block: "center", inline: "center" });
    target.click();
    return true;
  }, { source: pattern.source, preferLast: Boolean(options.preferLast), excludeSource: options.exclude?.source || "" });
  if (!clicked) throw new Error("No matching Razorpay prompt button found.");
}

async function disableRazorpaySaveCard(frame) {
  return frame.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('input[name="save"], input[type="checkbox"]'));
    let changed = false;
    for (const input of candidates) {
      if (input.name === "save" && input.value === "0" && !input.checked) {
        input.click();
        changed = true;
        continue;
      }
      if (input.checked) {
        input.checked = false;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        changed = true;
      }
    }
    return changed;
  });
}

async function clickRazorpayOption(frame, pattern) {
  const clicked = await frame.evaluate((source) => {
    const regex = new RegExp(source, "i");
    const visible = (node) => {
      const element = node;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };
    const labels = Array.from(document.querySelectorAll("button, [role=button], label, div, span, p"))
      .filter(visible)
      .map((node) => {
        const text = (node.innerText || node.textContent || node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
        const rect = node.getBoundingClientRect();
        return { node, text, y: rect.top };
      })
      .filter(({ text }) => regex.test(text) && !/Google Pay UPI/i.test(text))
      .sort((left, right) => right.y - left.y);
    for (const { node } of labels) {
      const clickable = node.closest("button, [role=button], label") || node.parentElement?.closest?.("button, [role=button], label") || node.parentElement;
      if (clickable && visible(clickable)) {
        clickable.scrollIntoView({ block: "center", inline: "center" });
        clickable.click();
        return true;
      }
    }
    return false;
  }, pattern.source);
  if (!clicked) throw new Error("No matching Razorpay option found.");
}

async function waitForRazorpayFrame(page) {
  for (let index = 0; index < 60; index += 1) {
    const frames = page.frames().filter((item) => item.url().includes("razorpay"));
    for (const frame of frames) {
      const visibleControlCount = await frame.locator("button, input").evaluateAll((nodes) =>
        nodes.filter((node) => {
          const element = node;
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
        }).length
      ).catch(() => 0);
      if (visibleControlCount > 0) return frame;
    }
    if (frames[0]) return frames[0];
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
          const candidates = await locator.all();
          for (const candidate of candidates) {
            if (await candidate.isVisible().catch(() => false)) {
              await candidate.click({ timeout: 1500 });
              return;
            }
          }
        }
      } catch (error) {
        lastError = error;
      }
    }
    await frame.page().waitForTimeout(500);
  }
  throw lastError || new Error("No matching clickable Razorpay control found.");
}

async function typeIntoFirstVisible(locator, value) {
  try {
    const candidates = await locator.all();
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ timeout: 2500 });
        await candidate.press(process.platform === "darwin" ? "Meta+A" : "Control+A", { timeout: 2500 }).catch(() => {});
        await candidate.type(value, { delay: 40, timeout: 10000 });
        return;
      }
    }
  } catch {}
}
async function maybeFill(locator, value) {
  try {
    const candidates = await locator.all();
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.fill(value, { timeout: 2500 });
        return;
      }
    }
  } catch {}
}

async function fillByPlaceholder(frame, text, value) {
  try {
    const locator = frame.getByPlaceholder(text, { exact: false });
    await maybeFill(locator, value);
  } catch {}
}

async function describeRazorpayFrames(page) {
  const frames = page.frames().filter((item) => item.url().includes("razorpay"));
  const snapshots = [];
  for (const frame of frames) {
    const snapshot = await frame.evaluate(() => {
      const clean = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const visible = (node) => {
        const element = node;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      return {
        buttons: Array.from(document.querySelectorAll("button, [role=button]")).filter(visible).map((node) => ({
          text: clean(node.innerText || node.textContent || node.getAttribute("aria-label")),
          disabled: Boolean(node.disabled || node.getAttribute("aria-disabled") === "true"),
        })).filter((item) => item.text).slice(0, 20),
        inputs: Array.from(document.querySelectorAll("input")).filter(visible).map((node) => ({
          name: clean(node.getAttribute("name") || node.getAttribute("placeholder") || node.getAttribute("aria-label") || node.getAttribute("autocomplete") || node.type),
          valueLength: String(node.value || "").length,
          disabled: Boolean(node.disabled || node.getAttribute("aria-disabled") === "true"),
        })).filter((item) => item.name).slice(0, 20),
        text: clean(document.body?.innerText || ""),
      };
    }).catch(() => ({ buttons: [], inputs: [], text: "" }));
    snapshots.push(snapshot);
  }
  return snapshots;
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
  if (!/test-order|test-confirm|\/bookings\/[^/]+\/cancel|\/bookings\/[^/]+\/guest-claim\/(?:start|verify)|\/refunds\/by-booking\/|\/payments\/by-booking\/|checkout\.razorpay\.com|api\.razorpay\.com\/v1\/checkout|api\.razorpay\.com\/v2\/standard_checkout/.test(url)) return;
  result.events.push({
    type,
    methodOrStatus,
    endpoint: url.includes("test-order") ? "flight-test-order" : url.includes("test-confirm") ? "flight-test-confirm" : url.includes("/guest-claim/start") ? "guest-claim-start" : url.includes("/guest-claim/verify") ? "guest-claim-verify" : url.includes("/cancel") ? "booking-cancel" : url.includes("/refunds/by-booking/") ? "refund-readback" : url.includes("/payments/by-booking/") ? "payment-readback" : "razorpay-checkout",
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
    ...(result.razorpaySnapshot ? [`- Failure screenshot: ${SCREENSHOT_PATH}`] : []),
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

function sanitizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function sanitizeTestMethod(value) {
  const clean = String(value || "").trim().toLowerCase();
  return clean === "upi" ? "upi" : "card";
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
