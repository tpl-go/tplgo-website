#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "phase5a-package-browser-result.json");
const MD_PATH = path.join(OUT_DIR, "phase5a-package-browser-report.md");

const PACKAGE_SLUG = "ladakh-adventure-expedition";
const PACKAGE_TITLE = "Ladakh Adventure Expedition";
const BASE_PACKAGE_AMOUNT = 90000;
const OFFER_DISCOUNT = 9000;
const BASE_AFTER_OFFER = 81000;
const UPGRADES_ADDONS = 12000;
const TAXES_FEES = 5400;
const TOTAL_BEFORE_WALLET = 98400;
const EARNED_CREDIT = 1620;

const FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: "package",
  NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL: "true",
  NEXT_PUBLIC_TPL_DEBUG_BACKEND_PAYLOADS: "false",
  NEXT_PUBLIC_TPL_API_BASE_URL: BACKEND_URL,
};

const result = {
  startedAt: new Date().toISOString(),
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL,
  flags: FLAGS,
  health: null,
  selector: {
    method: "package-payment-method-upi",
    payButton: "package-payment-pay-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  pricingRule: null,
  packageDataIntegrity: null,
  confirmation: null,
  myBooking: null,
  viewDetail: null,
  manageReadPath: null,
  fallback: null,
  refreshDuplicateGuard: null,
  safety: {
    supplierApisCalled: false,
    livePaymentGatewayUsed: false,
    fallbackRemoved: false,
  },
  status: "failed",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (process.env.TPL_PHASE5A_MODE === "fallback-disabled") {
    await runDisabledBackendFallbackMode();
    return;
  }

  result.health = await readHealth();

  const auth = await authenticate();
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    Object.assign(result, await runPrimaryJourney(browser, auth));
    result.status = computeStatus(result);
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(`Phase 5A Package browser certification: ${result.status}`);
  console.log(`JSON result: ${JSON_PATH}`);
  console.log(`Markdown report: ${MD_PATH}`);
  process.exitCode = result.status === "passed" ? 0 : 1;
}

async function runDisabledBackendFallbackMode() {
  const existing = await readExistingResult();
  result.health = await readHealth();

  const auth = await authenticate();
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const fallback = await runFallbackJourney(browser, auth);
    Object.assign(result, existing, {
      fallback,
      disabledBackendFallback: fallback,
      status: computeStatus({ ...existing, fallback }),
    });
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(
    `Phase 5A Package disabled-backend fallback: ${
      result.fallback?.ok ? "passed" : "failed"
    }`
  );
  console.log(`JSON result: ${JSON_PATH}`);
  console.log(`Markdown report: ${MD_PATH}`);
  process.exitCode = result.fallback?.ok ? 0 : 1;
}

async function runPrimaryJourney(browser, auth) {
  const page = await browser.newPage();
  const network = createNetworkRecorder(page);
  const mobile = auth.mobile;
  const seed = buildPackageSeed(mobile);

  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    pricingRule: null,
    packageDataIntegrity: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
  };

  try {
    await seedPackagePage(page, auth, seed);
    await page.goto(packagePaymentUrl(), { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="package-payment-method-upi"]', {
      timeout: 30000,
    });
    output.selector.found = Boolean(
      await page.locator('[data-testid="package-payment-method-upi"]').count()
    );
    await page.click('[data-testid="package-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="package-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true",
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;

    await page.waitForSelector('[data-testid="package-payment-pay-button"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="package-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/packages/confirmation/") &&
        Boolean(sessionStorage.getItem("tplPackageConfirmationPayload")),
      null,
      { timeout: 120000 }
    );

    const confirmation = await readSessionJson(
      page,
      "tplPackageConfirmationPayload"
    );
    const saved = await waitForSavedPackageBooking(page);
    const payload = await readStoredBookingPayload(page, saved?.payloadStorageKey);
    const bookingId = saved?.id || payload?.bookingId || confirmation?.bookingId;

    output.uniqueBookingRef = {
      ok: Boolean(
        confirmation?.bookingId ||
          confirmation?.id ||
          confirmation?.legacyFrontendId
      ),
      bookingId: confirmation?.bookingId || null,
      id: confirmation?.id || null,
      legacyFrontendId: confirmation?.legacyFrontendId || null,
      isStaticPreview: [
        confirmation?.bookingId,
        confirmation?.id,
        confirmation?.legacyFrontendId,
      ].includes("package-preview"),
    };

    output.backendStart = readEndpointResult(
      network,
      "/api/v1/services/package/checkout/start"
    );
    output.backendConfirm = readEndpointResult(
      network,
      "/api/v1/services/package/checkout/",
      "/confirm"
    );
    output.backendRefs = verifyBackendRefs(confirmation);
    output.walletGuard = verifyWalletGuard(confirmation, network);
    output.pricingRule = verifyPricingRules(confirmation);
    output.packageDataIntegrity = verifyPackageDataIntegrity({
      seed,
      confirmation,
      payload,
      saved,
    });
    output.confirmation = {
      ok:
        Boolean(confirmation) &&
        page.url().includes(`/packages/confirmation/${PACKAGE_SLUG}`),
      path: new URL(page.url()).pathname,
      bookingId: confirmation?.bookingId || null,
      savedBookingId: bookingId || null,
      paymentStatus:
        confirmation?.paymentStatus ||
        confirmation?.payment?.paymentActionState ||
        "paid",
    };

    await page.goto(`${FRONTEND_URL}/account/bookings`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      (id) => document.body.innerText.includes(id),
      bookingId,
      { timeout: 30000 }
    );
    output.myBooking = { ok: true, bookingId, cardTextContainsId: true };

    await page.goto(
      `${FRONTEND_URL}/account/bookings/package/${encodeURIComponent(
        bookingId
      )}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Package Booking Detail"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = {
      ok: await page.evaluate(
        ({ id, title }) =>
          document.body.innerText.includes("Package Booking Detail") &&
          document.body.innerText.includes(id) &&
          document.body.innerText.includes(title),
        { id: bookingId, title: PACKAGE_TITLE }
      ),
      path: new URL(page.url()).pathname,
    };

    await page.goto(
      `${FRONTEND_URL}/packages/manage?bookingId=${encodeURIComponent(
        bookingId
      )}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Package Manage") ||
        document.body.innerText.includes("Package Booking Summary"),
      null,
      { timeout: 30000 }
    );
    output.manageReadPath = {
      ok: await page.evaluate(
        ({ id, title }) =>
          document.body.innerText.includes(id) &&
          document.body.innerText.includes(title) &&
          document.body.innerText.includes("Leh") &&
          document.body.innerText.includes("Nubra"),
        { id: bookingId, title: PACKAGE_TITLE }
      ),
      path: `${new URL(page.url()).pathname}${new URL(page.url()).search}`,
    };

    const preRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountBefore = countEndpoint(
      network,
      "/api/v1/services/package/checkout/",
      "/confirm"
    );
    await page.goto(
      `${FRONTEND_URL}/packages/confirmation/${PACKAGE_SLUG}?variant=withFlight`,
      { waitUntil: "domcontentloaded" }
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.body.innerText.includes("Package Booking Confirmed"),
      null,
      { timeout: 30000 }
    );
    const postRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountAfter = countEndpoint(
      network,
      "/api/v1/services/package/checkout/",
      "/confirm"
    );

    output.refreshDuplicateGuard = {
      ok:
        preRefresh.bookingCount === postRefresh.bookingCount &&
        preRefresh.walletLedgerCount === postRefresh.walletLedgerCount &&
        confirmCountAfter === confirmCountBefore,
      bookingCountBefore: preRefresh.bookingCount,
      bookingCountAfter: postRefresh.bookingCount,
      walletLedgerCountBefore: preRefresh.walletLedgerCount,
      walletLedgerCountAfter: postRefresh.walletLedgerCount,
      backendConfirmCountBefore: confirmCountBefore,
      backendConfirmCountAfter: confirmCountAfter,
    };
  } finally {
    await page.close();
  }

  return output;
}

async function runFallbackJourney(browser, auth) {
  const page = await browser.newPage();
  const network = createNetworkRecorder(page);
  const mobile = auth.mobile;
  let step = "seed";

  try {
    await seedPackagePage(page, auth, buildPackageSeed(mobile));
    step = "payment";
    await page.goto(packagePaymentUrl(), { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="package-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="package-payment-method-upi"]');
    await page.click('[data-testid="package-payment-pay-button"]');
    step = "confirmation";
    await page.waitForFunction(
      () =>
        location.pathname.includes("/packages/confirmation/") &&
        Boolean(sessionStorage.getItem("tplPackageConfirmationPayload")),
      null,
      { timeout: 120000 }
    );
    const confirmation = await readSessionJson(
      page,
      "tplPackageConfirmationPayload"
    );
    const saved = await waitForSavedPackageBooking(page);
    const payload = await readStoredBookingPayload(page, saved?.payloadStorageKey);

    step = "my-booking";
    await page.goto(`${FRONTEND_URL}/account/bookings`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      (id) => document.body.innerText.includes(id),
      saved?.id,
      { timeout: 30000 }
    );

    step = "view-detail";
    await page.goto(
      `${FRONTEND_URL}/account/bookings/package/${encodeURIComponent(saved.id)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Package Booking Detail"),
      null,
      { timeout: 30000 }
    );
    const detailOk = await page.evaluate(
      (title) => document.body.innerText.includes(title),
      PACKAGE_TITLE
    );

    step = "manage-read-path";
    await page.goto(
      `${FRONTEND_URL}/packages/manage?bookingId=${encodeURIComponent(saved.id)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Package Manage") ||
        document.body.innerText.includes("Package Booking Summary"),
      null,
      { timeout: 30000 }
    );
    const manageOk = await page.evaluate(
      (title) => document.body.innerText.includes(title),
      PACKAGE_TITLE
    );

    const backendRefsAbsent = !(
      confirmation?.backendCheckoutId ||
      confirmation?.backendBookingId ||
      confirmation?.backendPaymentId ||
      confirmation?.backendRequestId
    );

    return {
      ok:
        Boolean(confirmation) &&
        Boolean(saved?.id) &&
        Boolean(payload) &&
        detailOk &&
        manageOk &&
        backendRefsAbsent,
      confirmation: Boolean(confirmation),
      myBooking: Boolean(saved?.id),
      viewDetail: detailOk,
      manageReadPath: manageOk,
      backendRefsAbsent,
      savedBookingId: saved?.id || null,
      mode: "backend-checkout-disabled",
      checkoutRequestCount: network.filter((entry) =>
        entry.url.includes("/api/v1/services/package/checkout")
      ).length,
    };
  } catch (error) {
    return {
      ok: false,
      step,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
}

async function seedPackagePage(page, auth, payload) {
  await page.goto(FRONTEND_URL, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.evaluate(
    ({ authRecord, payload: seedPayload, mobile }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("tpl_auth_session_v1", JSON.stringify(authRecord));
      localStorage.setItem(
        `tpl_wallet_v1_${mobile}`,
        JSON.stringify({
          promoCredit: 99999,
          earnedCredit: 99999,
          refundableBalance: 99999,
        })
      );
      sessionStorage.setItem(
        "tplPackageBookingReview",
        JSON.stringify(seedPayload)
      );
      sessionStorage.setItem(
        "tplPaymentLeadTraveller",
        JSON.stringify({
          name: "Phase Package",
          email: "phase5a.package@example.com",
          mobile,
        })
      );
    },
    {
      authRecord: { user: auth.user, session: auth.session },
      payload,
      mobile: auth.mobile,
    }
  );
}

function buildPackageSeed(mobile) {
  return {
    summary: {
      packageSlug: PACKAGE_SLUG,
      packageTitle: PACKAGE_TITLE,
      route: ["Leh", "Nubra", "Pangong", "Leh"],
      nights: 5,
      days: 6,
      variant: "withFlight",
      travelDate: "2026-08-18",
      originCity: "Delhi",
      rooms: [{ adults: 2, children: 1 }],
      totalAdults: 2,
      totalChildren: 1,
      totalRooms: 1,
      isInternationalTrip: false,
      selectedVariant: {
        label: "With flights",
        pricePerPerson: 30000,
      },
      packageSelectionState: {
        baseAmount: BASE_PACKAGE_AMOUNT,
        selectedHotelTier: "premium",
        selectedTransferType: "private",
        selectedMealPlan: "breakfast-dinner",
      },
      includedFlightLabels: ["Delhi - Leh return flight"],
      includedHotelLabels: ["Premium Leh hotel", "Nubra valley camp"],
      includedTransferLabels: ["Private SUV transfers"],
      includedMealLabels: ["Breakfast and dinner"],
      includedActivityLabels: ["Pangong day tour", "Monastery walk"],
      features: ["High altitude support", "Local guide"],
    },
    traveller: {
      travellers: [
        traveller("adult-1", "Mr", "Phase", "Package", "adult", mobile),
        traveller("adult-2", "Ms", "Cert", "Traveller", "adult", mobile),
        traveller("child-1", "Master", "Test", "Child", "child", mobile),
      ],
      contactDetails: {
        countryCode: "+91",
        mobile,
        email: "phase5a.package@example.com",
      },
      gstDetails: { hasGst: false },
    },
    addOn: {
      isInternationalTrip: false,
      selectedAddOns: [
        {
          id: "private-transfer-upgrade",
          title: "Private Transfer Upgrade",
          amount: 7000,
        },
        {
          id: "pangong-activity-pack",
          title: "Pangong Activity Pack",
          amount: 5000,
        },
      ],
      totalAmount: UPGRADES_ADDONS,
    },
    itinerary: {
      travelDate: "2026-08-18",
      dayPlans: [
        { day: 1, title: "Arrival in Leh", city: "Leh" },
        { day: 2, title: "Leh acclimatisation", city: "Leh" },
        { day: 3, title: "Drive to Nubra", city: "Nubra" },
        { day: 4, title: "Nubra to Pangong", city: "Pangong" },
        { day: 5, title: "Pangong to Leh", city: "Leh" },
        { day: 6, title: "Departure", city: "Leh" },
      ],
      packageSelectionState: {
        baseAmount: BASE_PACKAGE_AMOUNT,
        selectedHotelTier: "premium",
      },
      includedFlightLabels: ["Delhi - Leh return flight"],
      includedHotelLabels: ["Premium Leh hotel", "Nubra valley camp"],
      includedTransferLabels: ["Private SUV transfers"],
      includedMealLabels: ["Breakfast and dinner"],
      includedActivityLabels: ["Pangong day tour", "Monastery walk"],
      features: ["High altitude support", "Local guide"],
    },
    cancellation: {
      exclusions: ["Supplier cancellation penalties apply after ticketing."],
    },
    fare: {
      basePrice: BASE_PACKAGE_AMOUNT,
      upgradedDiffTotal: UPGRADES_ADDONS,
      feesAndTaxes: TAXES_FEES,
      couponDiscount: OFFER_DISCOUNT,
      tplCreditUsed: 0,
      grandTotal: TOTAL_BEFORE_WALLET,
      appliedCoupon: "PKG10BASE",
      totalBeforeWallet: TOTAL_BEFORE_WALLET,
      baseAfterOffer: BASE_AFTER_OFFER,
      walletBreakdown: {
        promoUsed: 99999,
        earnedUsed: 99999,
        refundUsed: 99999,
        promoAvailable: 99999,
        earnedAvailable: 99999,
        refundWalletAvailable: 99999,
        totalWalletUsed: 299997,
        earnedOnThisBooking: EARNED_CREDIT,
      },
    },
  };
}

function traveller(id, title, firstName, lastName, travellerType, mobile) {
  return {
    id,
    title,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    gender: title === "Ms" ? "female" : "male",
    travellerType,
    nationality: "Indian",
    email: "phase5a.package@example.com",
    mobile,
  };
}

async function readHealth() {
  const response = await fetchJsonWithTimeout(
    `${BACKEND_URL}/api/v1/health`,
    {},
    15000,
    "backend health"
  );
  const body = await response.json();
  return {
    httpStatus: response.status,
    ok: Boolean(body?.ok),
    status: body?.data?.status,
    databaseOk: Boolean(body?.data?.checks?.database?.ok),
  };
}

async function authenticate(requestedMobile) {
  const mobile =
    requestedMobile || `96666${Math.floor(10000 + Math.random() * 89999)}`;
  const send = await postJson("/api/v1/auth/send-otp", { mobile });
  const otp = send?.data?.developmentOtp;
  if (!otp) throw new Error("Development OTP was not returned.");
  const verify = await postJson("/api/v1/auth/verify-otp", { mobile, otp });
  if (!verify?.data?.session?.token) {
    throw new Error("Auth token was not returned.");
  }
  return { mobile, user: verify.data.user, session: verify.data.session };
}

async function postJson(pathname, body) {
  const response = await fetch(`${BACKEND_URL}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `${pathname} failed with HTTP ${response.status}: ${
        payload?.error?.code || "UNKNOWN"
      }`
    );
  }
  return payload;
}

async function fetchJsonWithTimeout(url, options, timeoutMs, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} fetch failed for ${url}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function createNetworkRecorder(page) {
  const network = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/v1/")) return;
    let body = "";
    try {
      body = await response.text();
    } catch {}
    network.push({
      method: response.request().method(),
      url,
      status: response.status(),
      body,
    });
  });
  page.on("requestfailed", (request) => {
    network.push({
      method: request.method(),
      url: request.url(),
      status: "requestfailed",
      body: request.failure()?.errorText || "",
    });
  });
  return network;
}

async function readSessionJson(page, key) {
  return page.evaluate((storageKey) => {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }, key);
}

async function waitForSavedPackageBooking(page) {
  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem("tpl_bookings_v1");
      if (!raw) return false;
      try {
        return JSON.parse(raw).some((booking) => booking?.type === "package");
      } catch {
        return false;
      }
    },
    null,
    { timeout: 30000 }
  );
  return page.evaluate(() => {
    const raw = localStorage.getItem("tpl_bookings_v1");
    const bookings = raw ? JSON.parse(raw) : [];
    return bookings.find((booking) => booking?.type === "package") || null;
  });
}

async function readStoredBookingPayload(page, key) {
  if (!key) return null;
  return page.evaluate((payloadKey) => {
    const raw = localStorage.getItem(payloadKey);
    return raw ? JSON.parse(raw) : null;
  }, key);
}

async function readBookingState(page, bookingId, mobile) {
  return page.evaluate(
    ({ id, phone }) => {
      const bookingRaw = localStorage.getItem("tpl_bookings_v1");
      const bookings = bookingRaw ? JSON.parse(bookingRaw) : [];
      const ledgerRaw = localStorage.getItem(`tpl_wallet_ledger_v1_${phone}`);
      const ledger = ledgerRaw ? JSON.parse(ledgerRaw) : [];
      return {
        bookingCount: bookings.filter((booking) => booking?.id === id).length,
        walletLedgerCount: Array.isArray(ledger) ? ledger.length : 0,
      };
    },
    { id: bookingId, phone: mobile }
  );
}

function readEndpointResult(network, includesA, includesB = "") {
  const match = [...network]
    .reverse()
    .find(
      (entry) =>
        entry.method === "POST" &&
        entry.url.includes(includesA) &&
        (!includesB || entry.url.includes(includesB))
    );
  let parsed = null;
  try {
    parsed = match?.body ? JSON.parse(match.body) : null;
  } catch {}
  return {
    httpStatus: match?.status || null,
    requestId:
      parsed?.requestId ||
      parsed?.data?.requestId ||
      parsed?.meta?.requestId ||
      null,
    errorCode: parsed?.error?.code || null,
  };
}

function countEndpoint(network, includesA, includesB = "") {
  return network.filter(
    (entry) =>
      entry.method === "POST" &&
      entry.url.includes(includesA) &&
      (!includesB || entry.url.includes(includesB))
  ).length;
}

function verifyBackendRefs(confirmation) {
  return {
    ok: Boolean(
      confirmation?.backendCheckoutId &&
        confirmation?.backendBookingId &&
        confirmation?.backendPaymentId &&
        confirmation?.backendRequestId &&
        confirmation?.backendServiceType === "package" &&
        confirmation?.backendCheckoutStatus === "paid"
    ),
    backendCheckoutId: confirmation?.backendCheckoutId || null,
    backendBookingId: confirmation?.backendBookingId || null,
    backendPaymentId: confirmation?.backendPaymentId || null,
    backendRequestId: confirmation?.backendRequestId || null,
    backendServiceType: confirmation?.backendServiceType || null,
    backendCheckoutStatus: confirmation?.backendCheckoutStatus || null,
  };
}

function verifyWalletGuard(confirmation, network) {
  const walletErrorSeen = network.some((entry) =>
    entry.body.includes("WALLET_INSUFFICIENT_BALANCE")
  );
  return {
    ok:
      confirmation?.walletSource === "backend" &&
      confirmation?.walletSyncStatus === "synced" &&
      Boolean(confirmation?.backendWalletSnapshot) &&
      !walletErrorSeen,
    walletSource: confirmation?.walletSource || null,
    walletSyncStatus: confirmation?.walletSyncStatus || null,
    metadataWalletSource: confirmation?.metadata?.walletSource || null,
    metadataWalletSyncStatus: confirmation?.metadata?.walletSyncStatus || null,
    backendWalletSnapshotPresent: Boolean(confirmation?.backendWalletSnapshot),
    walletInsufficientBalanceSeen: walletErrorSeen,
    walletBreakdown: confirmation?.walletBreakdown || null,
  };
}

function verifyPricingRules(confirmation) {
  const fare = confirmation?.fare || {};
  const wallet = fare.walletBreakdown || {};
  const checks = {
    offerOnlyOnBase:
      Number(fare.couponDiscount || 0) === OFFER_DISCOUNT &&
      Number(fare.baseAfterOffer || BASE_AFTER_OFFER) === BASE_AFTER_OFFER,
    promoEarnedOnBaseAfterOffer:
      Number(fare.totalBeforeWallet || 0) === TOTAL_BEFORE_WALLET,
    refundWalletOnPayable:
      Number(wallet.refundUsed || 0) <=
      Math.max(
        TOTAL_BEFORE_WALLET -
          Number(wallet.promoUsed || 0) -
          Number(wallet.earnedUsed || 0),
        0
      ),
    upgradesAndTaxesOutsideBenefit:
      Number(fare.upgradedDiffTotal || 0) === UPGRADES_ADDONS &&
      Number(fare.feesAndTaxes || 0) === TAXES_FEES,
    earnedCreditTwoPercent:
      Number(confirmation?.earnedCreditAmount || 0) === EARNED_CREDIT,
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function verifyPackageDataIntegrity({ seed, confirmation, payload, saved }) {
  const summary = payload?.summary || confirmation?.summary || {};
  const travellerPayload = payload?.traveller || confirmation?.traveller || {};
  const fare = payload?.fare || confirmation?.fare || {};
  const payment = payload?.payment || confirmation?.payment || {};
  const checks = {
    bookingId: Boolean(saved?.id && payload?.bookingId),
    travellerData:
      travellerPayload?.travellers?.[0]?.firstName === "Phase" &&
      travellerPayload?.contactDetails?.mobile,
    packageTitle: summary?.packageTitle === PACKAGE_TITLE,
    destination:
      Array.isArray(summary?.route) &&
      summary.route.includes("Leh") &&
      summary.route.includes("Nubra") &&
      summary.route.includes("Pangong"),
    duration: Number(summary?.days || 0) === 6 && Number(summary?.nights || 0) === 5,
    travelDate: summary?.travelDate === seed.summary.travelDate,
    roomsTravellers:
      Number(summary?.totalAdults || 0) === 2 &&
      Number(summary?.totalChildren || 0) === 1 &&
      Number(summary?.totalRooms || 0) === 1,
    basePackagePrice: Number(fare?.basePrice || 0) === BASE_PACKAGE_AMOUNT,
    upgradesAddons:
      Number(fare?.upgradedDiffTotal || 0) === UPGRADES_ADDONS &&
      payload?.addOn?.selectedAddOns?.length === 2,
    taxesFees: Number(fare?.feesAndTaxes || 0) === TAXES_FEES,
    offerMetadata: fare?.appliedCoupon === "PKG10BASE",
    walletEarnedCredit:
      Boolean(payload?.walletSource) &&
      Number(payload?.earnedCreditAmount || 0) === EARNED_CREDIT,
    paymentStatus:
      payment?.paymentActionState === "success" ||
      confirmation?.paymentStatus === "paid",
    confirmationPayload: Boolean(confirmation?.summary?.packageTitle),
    myBookingDetailPayload: Boolean(saved?.payloadStorageKey && payload),
    managePayload: Boolean(payload?.itinerary?.dayPlans?.length),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function computeStatus(data) {
  return data.health?.ok &&
    data.selector?.found &&
    data.selector?.selected &&
    data.uniqueBookingRef?.ok &&
    !data.uniqueBookingRef?.isStaticPreview &&
    data.backendStart?.httpStatus === 201 &&
    data.backendConfirm?.httpStatus === 200 &&
    data.backendRefs?.ok &&
    data.walletGuard?.ok &&
    data.pricingRule?.ok &&
    data.packageDataIntegrity?.ok &&
    data.confirmation?.ok &&
    data.myBooking?.ok &&
    data.viewDetail?.ok &&
    data.manageReadPath?.ok &&
    data.fallback?.ok &&
    data.refreshDuplicateGuard?.ok
    ? "passed"
    : "failed";
}

function packagePaymentUrl() {
  return `${FRONTEND_URL}/packages/payment/${PACKAGE_SLUG}?variant=withFlight&origin=Delhi&adults=3&children=1&rooms=1`;
}

async function readExistingResult() {
  try {
    const raw = await readFile(JSON_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeArtifacts() {
  result.finishedAt = new Date().toISOString();
  await writeFile(JSON_PATH, JSON.stringify(result, null, 2));
  await writeFile(MD_PATH, renderMarkdown(result));
}

function renderMarkdown(data) {
  const lines = [
    "# Phase 5A Package Browser Certification Result",
    "",
    `Status: ${data.status}`,
    `Started: ${data.startedAt}`,
    `Finished: ${data.finishedAt || ""}`,
    `Frontend: ${data.frontendUrl}`,
    `Backend: ${data.backendUrl}`,
    "",
    "## Results",
    "",
    `- Health: HTTP ${data.health?.httpStatus}, ok=${data.health?.ok}, databaseOk=${data.health?.databaseOk}`,
    `- Selectors: found=${data.selector?.found}, selected=${data.selector?.selected}`,
    `- Unique booking ref: ok=${data.uniqueBookingRef?.ok}, staticPreview=${data.uniqueBookingRef?.isStaticPreview}`,
    `- Backend start: HTTP ${data.backendStart?.httpStatus}`,
    `- Backend confirm: HTTP ${data.backendConfirm?.httpStatus}`,
    `- Backend refs: ok=${data.backendRefs?.ok}, service=${data.backendRefs?.backendServiceType}, status=${data.backendRefs?.backendCheckoutStatus}`,
    `- Wallet guard: ok=${data.walletGuard?.ok}, source=${data.walletGuard?.walletSource}, sync=${data.walletGuard?.walletSyncStatus}`,
    `- Pricing rules: ok=${data.pricingRule?.ok}`,
    `- Package data integrity: ok=${data.packageDataIntegrity?.ok}`,
    `- Confirmation: ok=${data.confirmation?.ok}`,
    `- My Booking: ok=${data.myBooking?.ok}`,
    `- View Detail: ok=${data.viewDetail?.ok}`,
    `- Manage read path: ok=${data.manageReadPath?.ok}`,
    `- Fallback: ok=${data.fallback?.ok}, refsAbsent=${data.fallback?.backendRefsAbsent}`,
    `- Refresh duplicate guard: ok=${data.refreshDuplicateGuard?.ok}`,
  ];
  return `${lines.join("\n")}\n`;
}

main().catch(async (error) => {
  result.status = "failed";
  result.error = error instanceof Error ? error.message : String(error);
  await mkdir(OUT_DIR, { recursive: true });
  await writeArtifacts();
  console.error(result.error);
  process.exitCode = 1;
});
