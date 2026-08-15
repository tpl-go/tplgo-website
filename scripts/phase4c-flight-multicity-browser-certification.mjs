#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "phase4c-flight-multicity-browser-result.json");
const MD_PATH = path.join(OUT_DIR, "phase4c-flight-multicity-browser-report.md");

const FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: "flight",
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
    method: "flight-payment-method-upi",
    payButton: "flight-payment-pay-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  confirmation: null,
  myBooking: null,
  viewDetail: null,
  manageReadPath: null,
  fallback: null,
  refreshDuplicateGuard: null,
  dataIntegrity: null,
  safety: {
    supplierApisCalled: false,
    livePaymentGatewayUsed: false,
    fallbackRemoved: false,
  },
  status: "failed",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (process.env.TPL_PHASE4C_MODE === "fallback-disabled") {
    await runDisabledBackendFallbackMode();
    return;
  }

  result.health = await readHealth();

  const auth = await authenticate();
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const primary = await runPrimaryJourney(browser, auth);
    Object.assign(result, primary);
    result.fallback = await runFallbackJourney(browser, auth, {
      interceptCheckout: true,
      mode: "backend-unavailable",
    });

    result.status = computeStatus(result);
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(`Phase 4C Flight Multi City browser certification: ${result.status}`);
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
    const fallback = await runFallbackJourney(browser, auth, {
      interceptCheckout: false,
      mode: "backend-checkout-disabled",
    });
    Object.assign(result, existing, {
      fallback,
      disabledBackendFallback: fallback,
      status: computeStatus({ ...existing, fallback }),
    });
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(`Phase 4C Flight Multi City disabled-backend fallback: ${result.fallback?.ok ? "passed" : "failed"}`);
  console.log(`JSON result: ${JSON_PATH}`);
  console.log(`Markdown report: ${MD_PATH}`);
  process.exitCode = result.fallback?.ok ? 0 : 1;
}

async function runPrimaryJourney(browser, auth) {
  const page = await browser.newPage();
  const network = createNetworkRecorder(page);
  const mobile = auth.mobile;
  const reviewData = buildReviewData();

  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
    dataIntegrity: null,
  };

  try {
    await seedFlightPage(page, auth, buildPaymentPayload(reviewData, mobile));
    await page.goto(`${FRONTEND_URL}/flights/review`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.body.innerText.includes("DEL") || document.body.innerText.length > 100,
      null,
      { timeout: 30000 }
    );

    await page.goto(`${FRONTEND_URL}/flights/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="flight-payment-method-upi"]', {
      timeout: 30000,
    });
    output.selector.found = Boolean(
      await page.locator('[data-testid="flight-payment-method-upi"]').count()
    );
    await page.click('[data-testid="flight-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="flight-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true",
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;

    await page.waitForSelector('[data-testid="flight-payment-pay-button"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="flight-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/flights/confirmation") &&
        Boolean(sessionStorage.getItem("tplFlightConfirmationData")),
      null,
      { timeout: 120000 }
    );

    const confirmation = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("tplFlightConfirmationData") || "null")
    );

    const saved = await waitForSavedFlightBooking(page);
    const payload = await readStoredBookingPayload(page, saved?.payloadStorageKey);
    const bookingId = saved?.id || payload?.bookingId || confirmation?.bookingId;

    output.uniqueBookingRef = {
      ok: Boolean(
        confirmation?.bookingId ||
          confirmation?.id ||
          confirmation?.legacyFrontendId ||
          confirmation?.bookingMeta?.bookingId
      ),
      bookingId: confirmation?.bookingId || null,
      id: confirmation?.id || null,
      legacyFrontendId: confirmation?.legacyFrontendId || null,
      bookingMetaBookingId: confirmation?.bookingMeta?.bookingId || null,
      isStaticPreview: [
        confirmation?.bookingId,
        confirmation?.id,
        confirmation?.legacyFrontendId,
      ].includes("flight-preview"),
    };

    output.backendStart = readEndpointResult(
      network,
      "/api/v1/services/flight/checkout/start"
    );
    output.backendConfirm = readEndpointResult(
      network,
      "/api/v1/services/flight/checkout/",
      "/confirm"
    );
    output.backendRefs = {
      ok: Boolean(
        confirmation?.backendCheckoutId &&
          confirmation?.backendBookingId &&
          confirmation?.backendPaymentId &&
          confirmation?.backendRequestId &&
          confirmation?.backendServiceType === "flight" &&
          confirmation?.backendCheckoutStatus === "paid"
      ),
      backendCheckoutId: confirmation?.backendCheckoutId || null,
      backendBookingId: confirmation?.backendBookingId || null,
      backendPaymentId: confirmation?.backendPaymentId || null,
      backendRequestId: confirmation?.backendRequestId || null,
      backendServiceType: confirmation?.backendServiceType || null,
      backendCheckoutStatus: confirmation?.backendCheckoutStatus || null,
    };
    output.walletGuard = {
      ok:
        confirmation?.walletSource === "backend" &&
        confirmation?.walletSyncStatus === "synced" &&
        Boolean(confirmation?.backendWalletSnapshot) &&
        !network.some((entry) => entry.body.includes("WALLET_INSUFFICIENT_BALANCE")),
      walletSource: confirmation?.walletSource || null,
      walletSyncStatus: confirmation?.walletSyncStatus || null,
      metadataWalletSource: confirmation?.metadata?.walletSource || null,
      metadataWalletSyncStatus: confirmation?.metadata?.walletSyncStatus || null,
      backendWalletSnapshotPresent: Boolean(confirmation?.backendWalletSnapshot),
      walletInsufficientBalanceSeen: network.some((entry) =>
        entry.body.includes("WALLET_INSUFFICIENT_BALANCE")
      ),
      walletBreakdown: confirmation?.walletBreakdown || null,
    };

    output.confirmation = {
      ok: Boolean(confirmation && page.url().includes("/flights/confirmation")),
      path: new URL(page.url()).pathname,
      bookingId: confirmation?.bookingId || null,
      savedBookingId: bookingId || null,
      paymentStatus:
        confirmation?.paymentStatus ||
        confirmation?.bookingMeta?.paymentStatus ||
        confirmation?.paymentData?.paymentStatus ||
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
    output.myBooking = {
      ok: true,
      bookingId,
      cardTextContainsId: true,
    };

    await page.goto(
      `${FRONTEND_URL}/account/bookings/flight/${encodeURIComponent(bookingId)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Flight Booking Detail"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = {
      ok: await page.evaluate(
        (id) =>
          document.body.innerText.includes("Flight Booking Detail") &&
          document.body.innerText.includes(id),
        bookingId
      ),
      path: new URL(page.url()).pathname,
    };

    await page.goto(
      `${FRONTEND_URL}/flights/manage?bookingId=${encodeURIComponent(bookingId)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Booking Summary") ||
        document.body.innerText.includes("Traveller Details"),
      null,
      { timeout: 30000 }
    );
    output.manageReadPath = {
      ok: await page.evaluate(
        (id) =>
          document.body.innerText.includes(id) &&
          document.body.innerText.includes("Traveller Details") &&
          document.body.innerText.includes("Multi City") &&
          document.body.innerText.includes("DEL") &&
          document.body.innerText.includes("CCU"),
        bookingId
      ),
      path: `${new URL(page.url()).pathname}${new URL(page.url()).search}`,
    };

    const preRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountBefore = countEndpoint(
      network,
      "/api/v1/services/flight/checkout/",
      "/confirm"
    );
    await page.goto(`${FRONTEND_URL}/flights/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.body.innerText.includes("Flight Booking Confirmed"),
      null,
      { timeout: 30000 }
    );
    const postRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountAfter = countEndpoint(
      network,
      "/api/v1/services/flight/checkout/",
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

    output.dataIntegrity = verifyDataIntegrity({
      reviewData,
      confirmation,
      payload,
      saved,
    });
  } finally {
    await page.close();
  }

  return output;
}

async function runFallbackJourney(browser, auth, options = {}) {
  const page = await browser.newPage();
  const mobile = `98888${Math.floor(10000 + Math.random() * 89999)}`;
  const fallbackAuth = await authenticate(mobile);
  const network = createNetworkRecorder(page);

  try {
    const reviewData = buildReviewData({
      sectorFlightNumbers: ["PA-499", "PA-594", "PA-695"],
    });
    await seedFlightPage(page, fallbackAuth, buildPaymentPayload(reviewData, mobile));
    await page.goto(`${FRONTEND_URL}/flights/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="flight-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="flight-payment-method-upi"]');
    if (options.interceptCheckout) {
      await page.evaluate(() => {
        const originalFetch = window.fetch.bind(window);
        window.fetch = (input, init) => {
          const url =
            typeof input === "string"
              ? input
              : input instanceof Request
                ? input.url
                : String(input);
          if (url.includes("/api/v1/services/flight/checkout")) {
            return Promise.reject(new TypeError("fetch failed"));
          }
          return originalFetch(input, init);
        };
      });
    }
    await page.click('[data-testid="flight-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/flights/confirmation") &&
        Boolean(sessionStorage.getItem("tplFlightConfirmationData")),
      null,
      { timeout: 120000 }
    );
    const confirmation = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("tplFlightConfirmationData") || "null")
    );
    const saved = await waitForSavedFlightBooking(page);
    await page.goto(`${FRONTEND_URL}/account/bookings`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      (id) => document.body.innerText.includes(id),
      saved?.id,
      { timeout: 30000 }
    );

    return {
      ok:
        Boolean(confirmation) &&
        Boolean(saved?.id) &&
        !confirmation?.backendCheckoutId &&
        !confirmation?.backendBookingId &&
        !confirmation?.backendPaymentId,
      confirmation: Boolean(confirmation),
      myBooking: Boolean(saved?.id),
      backendRefsAbsent: !(
        confirmation?.backendCheckoutId ||
        confirmation?.backendBookingId ||
        confirmation?.backendPaymentId
      ),
      savedBookingId: saved?.id || null,
      mode: options.mode || "backend-unavailable",
      checkoutRequestsIntercepted: network.filter((entry) =>
        entry.url.includes("/api/v1/services/flight/checkout")
      ).length,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
}

async function readExistingResult() {
  try {
    const raw = await readFile(JSON_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function computeStatus(data) {
  return data.health?.ok &&
    data.selector?.found &&
    data.selector?.selected &&
    data.uniqueBookingRef?.ok &&
    data.backendStart?.httpStatus === 201 &&
    data.backendConfirm?.httpStatus === 200 &&
    data.backendRefs?.ok &&
    data.walletGuard?.ok &&
    data.confirmation?.ok &&
    data.myBooking?.ok &&
    data.viewDetail?.ok &&
    data.manageReadPath?.ok &&
    data.fallback?.ok &&
    data.refreshDuplicateGuard?.ok &&
    data.dataIntegrity?.ok
    ? "passed"
    : "failed";
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

async function seedFlightPage(page, auth, payload) {
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
        "tplFlightReviewPayload",
        JSON.stringify(seedPayload.reviewData)
      );
      sessionStorage.setItem(
        "tplFlightBookingReviewData",
        JSON.stringify(seedPayload)
      );
    },
    {
      authRecord: { user: auth.user, session: auth.session },
      payload,
      mobile: auth.mobile,
    }
  );
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
    requestedMobile || `97777${Math.floor(10000 + Math.random() * 89999)}`;
  const send = await postJson("/api/v1/auth/send-otp", { mobile });
  const otp = send?.data?.developmentOtp;
  if (!otp) throw new Error("Development OTP was not returned.");
  const verify = await postJson("/api/v1/auth/verify-otp", { mobile, otp });
  if (!verify?.data?.session?.token) {
    throw new Error("Auth token was not returned.");
  }
  return {
    mobile,
    user: verify.data.user,
    session: verify.data.session,
  };
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

async function waitForSavedFlightBooking(page) {
  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem("tpl_bookings_v1");
      if (!raw) return false;
      try {
        return JSON.parse(raw).some((booking) => booking?.type === "flight");
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
    return bookings.find((booking) => booking?.type === "flight") || null;
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

function verifyDataIntegrity({ reviewData, confirmation, payload, saved }) {
  const expectedSegments = (reviewData?.journeys || []).map(
    (journey) => journey?.segments?.[0] || {}
  );
  const savedSegments = (payload?.reviewData?.journeys || []).map(
    (journey) => journey?.segments?.[0] || {}
  );
  const sectorIntegrity = expectedSegments.every((segment, index) => {
    const savedSegment = savedSegments[index] || {};
    return (
      savedSegment.fromCode === segment.fromCode &&
      savedSegment.toCode === segment.toCode &&
      savedSegment.airline === segment.airline &&
      savedSegment.flightNumber === segment.flightNumber &&
      savedSegment.departureTime === segment.departureTime &&
      savedSegment.arrivalTime === segment.arrivalTime &&
      savedSegment.departureDate === segment.departureDate &&
      savedSegment.arrivalDate === segment.arrivalDate
    );
  });
  const checks = {
    bookingId: Boolean(saved?.id && payload?.bookingId),
    travellerData:
      payload?.travellerValidation?.travellers?.[0]?.firstName === "Phase" &&
      payload?.travellerValidation?.contactDetails?.mobile,
    bookingType: payload?.reviewData?.bookingType === "multiCity",
    journeyCount: payload?.reviewData?.journeys?.length === 3,
    multipleSectors: savedSegments.length === 3,
    sectorIntegrity,
    pricing:
      Number(payload?.pricingSnapshot?.baseFare || 0) > 0 &&
      Number(payload?.pricingSnapshot?.finalPayable || 0) >= 0 &&
      Number(payload?.paymentData?.totalPaid || 0) >= 0,
    offer:
      payload?.offerData?.code === "FLIGHT250" ||
      payload?.reviewData?.pricing?.appliedOfferCode === "FLIGHT250",
    walletEarnedCredit:
      Boolean(payload?.walletSource) && Number(payload?.earnedCreditAmount || 0) > 0,
    paymentStatus:
      payload?.bookingMeta?.paymentStatus === "paid" ||
      payload?.paymentStatus === "paid",
    confirmationPayload: Boolean(confirmation?.bookingMeta?.bookingId),
    myBookingDetailPayload: Boolean(saved?.payloadStorageKey && payload),
  };

  return {
    ok: Object.values(checks).every(Boolean),
    checks,
  };
}

function buildReviewData(overrides = {}) {
  const sectorFlightNumbers = overrides.sectorFlightNumbers || [
    "PA-431",
    "PA-532",
    "PA-633",
  ];
  return {
    bookingType: "multiCity",
    tripMode: "domestic",
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: "Economy",
    pricing: {
      perAdultBaseFare: 12600,
      baseFareTotal: 12600,
      tax: 1740,
      surcharge: 510,
      appliedOffer: 700,
      appliedOfferCode: "FLIGHT250",
      appliedOfferTitle: "Flight Phase 4C Multi City Offer",
      discount: 0,
      tplCredit: 0,
      totalAmount: 14150,
    },
    journeys: [
      {
        journeyLabel: "Sector 1",
        segments: [
          {
            airline: "Phase Air",
            flightNumber: sectorFlightNumbers[0],
            from: "Delhi",
            to: "Mumbai",
            fromCode: "DEL",
            toCode: "BOM",
            departureTime: "09:10",
            arrivalTime: "11:20",
            departureDate: "2026-07-10",
            arrivalDate: "2026-07-10",
            duration: "2h 10m",
            cabinBaggage: "7 Kg",
            checkinBaggage: "15 Kg",
            aircraft: "A320",
            terminalFrom: "T3",
            terminalTo: "T2",
          },
        ],
      },
      {
        journeyLabel: "Sector 2",
        segments: [
          {
            airline: "Phase Air",
            flightNumber: sectorFlightNumbers[1],
            from: "Mumbai",
            to: "Bengaluru",
            fromCode: "BOM",
            toCode: "BLR",
            departureTime: "18:45",
            arrivalTime: "20:35",
            departureDate: "2026-07-15",
            arrivalDate: "2026-07-15",
            duration: "1h 50m",
            cabinBaggage: "7 Kg",
            checkinBaggage: "15 Kg",
            aircraft: "A320",
            terminalFrom: "T2",
            terminalTo: "T1",
          },
        ],
      },
      {
        journeyLabel: "Sector 3",
        segments: [
          {
            airline: "Phase Air",
            flightNumber: sectorFlightNumbers[2],
            from: "Bengaluru",
            to: "Kolkata",
            fromCode: "BLR",
            toCode: "CCU",
            departureTime: "07:30",
            arrivalTime: "10:05",
            departureDate: "2026-07-18",
            arrivalDate: "2026-07-18",
            duration: "2h 35m",
            cabinBaggage: "7 Kg",
            checkinBaggage: "15 Kg",
            aircraft: "A321",
            terminalFrom: "T1",
            terminalTo: "T2",
          },
        ],
      },
    ],
  };
}

function buildPaymentPayload(reviewData, mobile) {
  return {
    reviewData,
    travellerValidation: {
      travellers: [
        {
          id: "adult-1",
          title: "Mr",
          firstName: "Phase",
          lastName: "Tester",
          gender: "male",
          travellerType: "adult",
          email: "phase4c@example.com",
          mobile,
        },
      ],
      contactDetails: {
        countryCode: "+91",
        mobile,
        email: "phase4c@example.com",
      },
      gstDetails: {
        hasGst: false,
        state: "Delhi",
        saveBillingToProfile: false,
      },
      allRequiredTravellersCompleted: true,
      contactValid: true,
      canProceed: true,
    },
    seatMealData: {
      seats: [],
      meals: [],
      seatTotal: 0,
      mealTotal: 0,
      seatStatus: "skipped",
      mealStatus: "skipped",
    },
    cabData: {
      cabType: "none",
      cabStatus: "skipped",
      cabLabel: "No cab selected",
      cabPrice: 0,
    },
    insuranceData: {
      insuranceStatus: "skipped",
      insuranceLabel: "Travel Insurance Skipped",
      insurancePrice: 0,
    },
    addonsData: {
      addonsStatus: "skipped",
      addonsLabel: "No add-on selected",
      addonsPrice: 0,
      selectedItems: [],
    },
    offerData: {
      code: "FLIGHT250",
      title: "Flight Phase 4C Multi City Offer",
      description: "Multi City smoke offer",
      discountAmount: 700,
    },
    walletData: {
      promoUsed: 99999,
      earnedUsed: 99999,
      refundUsed: 99999,
      refundCredit: 0,
      finalPayable: 14150,
      settlementMode: "payment",
    },
    walletBreakdown: {
      promoUsed: 99999,
      earnedUsed: 99999,
      refundUsed: 99999,
      totalWalletUsed: 299997,
    },
    earnedCreditAmount: 240,
    timerLeft: 600,
  };
}

async function writeArtifacts() {
  result.finishedAt = new Date().toISOString();
  await writeFile(JSON_PATH, JSON.stringify(result, null, 2));
  await writeFile(MD_PATH, renderMarkdown(result));
}

function renderMarkdown(data) {
  const lines = [
    "# Phase 4C Flight Multi City Browser Certification Result",
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
    `- Confirmation: ok=${data.confirmation?.ok}`,
    `- My Booking: ok=${data.myBooking?.ok}`,
    `- View Detail: ok=${data.viewDetail?.ok}`,
    `- Manage read path: ok=${data.manageReadPath?.ok}`,
    `- Fallback: ok=${data.fallback?.ok}, refsAbsent=${data.fallback?.backendRefsAbsent}`,
    `- Refresh duplicate guard: ok=${data.refreshDuplicateGuard?.ok}`,
    `- Data integrity: ok=${data.dataIntegrity?.ok}`,
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
