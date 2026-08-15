#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "phase7a-cab-browser-result.json");
const MD_PATH = path.join(OUT_DIR, "phase7a-cab-browser-report.md");
const SERVICE = "cab";

const FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: SERVICE,
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
    method: "cab-payment-method-upi",
    payButton: "cab-payment-pay-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  cabPayloadIntegrity: null,
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

  if (process.env.TPL_PHASE7A_MODE === "fallback-disabled") {
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
    delete result.error;
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(`Phase 7A Cab browser certification: ${result.status}`);
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
    delete result.error;
  } finally {
    await browser.close();
    await writeArtifacts();
  }

  console.log(
    `Phase 7A Cab disabled-backend fallback: ${
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
  const seed = buildCabSeed(auth.mobile);
  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    cabPayloadIntegrity: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
  };

  try {
    await seedCabPage(page, auth, seed);

    await page.goto(`${FRONTEND_URL}/cab`, { waitUntil: "domcontentloaded" });
    await waitForUsefulPage(page);
    await page.goto(`${FRONTEND_URL}/cab/result?rideType=outstationOneWay&from=Delhi&to=Agra&pickupDate=2026-08-14&pickupTime=09%3A30`, {
      waitUntil: "domcontentloaded",
    });
    await waitForUsefulPage(page);
    await page.goto(`${FRONTEND_URL}/cab/booking?cabId=cab-2&rideType=outstationOneWay&from=Delhi&to=Agra&pickupDate=2026-08-14&pickupTime=09%3A30`, {
      waitUntil: "domcontentloaded",
    });
    await waitForUsefulPage(page);

    await page.goto(`${FRONTEND_URL}/cab/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="cab-payment-method-upi"]', {
      timeout: 30000,
    });
    output.selector.found = true;
    await page.click('[data-testid="cab-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="cab-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true" ||
        !document
          .querySelector('[data-testid="cab-payment-pay-button"]')
          ?.hasAttribute("disabled"),
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;

    await page.waitForSelector('[data-testid="cab-payment-pay-button"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="cab-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/cab/confirmation") &&
        Boolean(sessionStorage.getItem("cabConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readCabSnapshot(page, auth.mobile);
    output.confirmation = verifyConfirmation(snapshot.confirmation);
    output.myBooking = verifyMyBooking(snapshot.booking, snapshot.payload);
    output.backendRefs = verifyBackendRefs(snapshot.confirmation);
    output.walletGuard = verifyWalletGuard(snapshot.confirmation, network);
    output.cabPayloadIntegrity = verifyCabPayload(snapshot.confirmation, seed);
    output.uniqueBookingRef = verifyUniqueBookingRef(network);
    output.backendStart = summarizeBackendCall(network, "/services/cab/checkout/start", 201);
    output.backendConfirm = summarizeConfirmCall(network);

    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;
    await page.goto(`${FRONTEND_URL}/account/bookings/cab/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Cab Booking Detail") &&
        document.body.innerText.includes("Delhi") &&
        document.body.innerText.includes("Agra"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = { ok: true, bookingId };

    await page.goto(`${FRONTEND_URL}/cab/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readCabSnapshot(page, auth.mobile);
    const manageBodyText = await page.locator("body").innerText().catch(() => "");
    output.manageReadPath = {
      ok:
        manageSnapshot.payload?.bookingId === bookingId &&
        manageSnapshot.payload?.searchMeta?.from === seed.searchMeta.from &&
        manageSnapshot.payload?.searchMeta?.to === seed.searchMeta.to &&
        !manageBodyText.includes("Cab booking not found"),
      bookingId,
      payloadFound: Boolean(manageSnapshot.payload),
      rendered: manageBodyText.length > 0,
    };

    output.refreshDuplicateGuard = await verifyRefreshDuplicateGuard(
      page,
      network,
      auth.mobile
    );
  } finally {
    await page.close();
  }

  return output;
}

async function runFallbackJourney(browser, auth) {
  const page = await browser.newPage();
  const network = createNetworkRecorder(page);
  const seed = buildCabSeed(auth.mobile, "fallback");

  try {
    await seedCabPage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/cab/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="cab-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="cab-payment-method-upi"]');
    await page.click('[data-testid="cab-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/cab/confirmation") &&
        Boolean(sessionStorage.getItem("cabConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readCabSnapshot(page, auth.mobile);
    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;
    await page.goto(`${FRONTEND_URL}/account/bookings/cab/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.body.innerText.includes("Cab Booking Detail"),
      null,
      { timeout: 30000 }
    );
    await page.goto(`${FRONTEND_URL}/cab/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readCabSnapshot(page, auth.mobile);
    const manageBodyText = await page.locator("body").innerText().catch(() => "");

    const checkoutRequestCount = network.filter((entry) =>
      entry.url.includes("/services/cab/checkout")
    ).length;
    const refsAbsent = !hasBackendRefs(snapshot.confirmation);

    return {
      ok:
        Boolean(snapshot.confirmation?.bookingId) &&
        Boolean(snapshot.booking?.id) &&
        refsAbsent &&
        checkoutRequestCount === 0,
      localConfirmation: Boolean(snapshot.confirmation?.bookingId),
      myBooking: Boolean(snapshot.booking?.id),
      viewDetail: true,
      manageReadPath:
        manageSnapshot.payload?.bookingId === bookingId &&
        !manageBodyText.includes("Cab booking not found"),
      backendRefsAbsent: refsAbsent,
      checkoutRequestCount,
    };
  } finally {
    await page.close();
  }
}

function buildCabSeed(mobile, variant = "primary") {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const baseFare = variant === "fallback" ? 2149 : 2449;
  const taxesAndFees = 236;
  const addons = 350;
  const offerDiscount = 250;
  const totalBeforeWallet = baseFare + taxesAndFees + addons - offerDiscount;
  const walletBreakdown = {
    promoUsed: 900,
    earnedUsed: 700,
    refundUsed: 600,
    promoAvailable: 99999,
    earnedAvailable: 99999,
    refundWalletAvailable: 99999,
    totalWalletUsed: 2200,
    earnedOnThisBooking: Math.floor(totalBeforeWallet * 0.02),
  };
  const payable = totalBeforeWallet - walletBreakdown.totalWalletUsed;

  return {
    bookingId: `CAB-PHASE7A-${suffix}`,
    id: `CAB-PHASE7A-ID-${suffix}`,
    legacyFrontendId: `cab-phase7a-${suffix}`,
    cab: {
      id: "cab-2",
      name: "Dzire",
      brand: "Maruti",
      rideType: "outstationOneWay",
      vehicleType: "sedan",
      fuelType: "cng",
      transmission: "manual",
      seats: 4,
      luggage: 3,
      finalPrice: baseFare,
      kmsIncluded: 148,
      extraKmFare: 13,
    },
    searchMeta: {
      rideType: "outstationOneWay",
      from: "Delhi",
      to: "Agra",
      pickup: "Delhi",
      drop: "Agra",
      pickupDate: "2026-08-14",
      departureDate: "2026-08-14",
      pickupTime: "09:30",
      dropTime: "13:30",
    },
    traveller: {
      pickupLocation: "Connaught Place, Delhi",
      fullName: "Phase Seven Cab Traveller",
      gender: "Male",
      mobile,
      email: `phase7a.cab.${suffix}@example.com`,
      usePickupAsBillingAddress: true,
    },
    selectedAddons: [
      {
        id: "addon-driver-mask",
        title: "Sanitized Cab Kit",
        description: "Sanitized cabin and sealed water bottle",
        price: addons,
      },
    ],
    appliedOffer: {
      id: "CABCERT250",
      code: "CABCERT250",
      title: "Cab certification offer",
      description: "Certification-only cab offer metadata",
      discountAmount: offerDiscount,
    },
    fare: {
      baseFare,
      taxesAndFees,
      specialRequestTotal: addons,
      offerDiscount,
      tplCredit: walletBreakdown.totalWalletUsed,
      totalPayable: payable,
    },
    walletBreakdown,
    originalBookingBaseline: {
      amount: baseFare + taxesAndFees + addons,
      payableAmount: payable,
      totalBeforeWallet,
      baseFare,
      taxesAndFees,
      specialRequestTotal: addons,
    },
    bookingData: {
      source: "phase7a-cab-browser-certification",
      expectedPickup: "Delhi",
      expectedDrop: "Agra",
    },
    timerLeft: 600,
  };
}

async function seedCabPage(page, auth, seed) {
  await page.goto(`${FRONTEND_URL}/cab/payment`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.evaluate(
    ({ auth, seed }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        "tpl_auth_session_v1",
        JSON.stringify({ user: auth.user, session: auth.session })
      );
      localStorage.setItem(
        `tpl_wallet_v1_${auth.mobile}`,
        JSON.stringify({
          promoCredit: 99999,
          earnedCredit: 99999,
          refundableBalance: 99999,
        })
      );
      localStorage.setItem(`tpl_wallet_ledger_v1_${auth.mobile}`, JSON.stringify([]));
      sessionStorage.setItem("tplCabPaymentData", JSON.stringify(seed));
    },
    { auth, seed }
  );
}

async function readCabSnapshot(page, mobile) {
  return page.evaluate((mobile) => {
    const parse = (value) => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };
    const confirmation =
      parse(sessionStorage.getItem("cabConfirmationData")) ||
      parse(sessionStorage.getItem("cabPaymentSuccessData")) ||
      parse(sessionStorage.getItem("tplCabConfirmationData"));
    const bookings = parse(localStorage.getItem("tpl_bookings_v1")) || [];
    const booking =
      bookings.find(
        (item) =>
          item.type === "cab" &&
          item.mobile === mobile &&
          item.id === confirmation?.bookingId
      ) ||
      bookings.find((item) => item.type === "cab" && item.mobile === mobile) ||
      null;
    const payload = booking?.payloadStorageKey
      ? parse(localStorage.getItem(booking.payloadStorageKey))
      : null;
    const ledger = parse(localStorage.getItem(`tpl_wallet_ledger_v1_${mobile}`)) || [];

    return { confirmation, bookings, booking, payload, ledger };
  }, mobile);
}

async function verifyRefreshDuplicateGuard(page, network, mobile) {
  const before = await readCabSnapshot(page, mobile);
  const beforeCabCount = before.bookings.filter(
    (item) => item.type === "cab" && item.mobile === mobile
  ).length;
  const beforeLedgerCount = before.ledger.length;
  const beforeConfirmCalls = countConfirmCalls(network);

  for (let index = 0; index < 3; index += 1) {
    await page.goto(`${FRONTEND_URL}/cab/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.body.innerText.includes("Booking") || document.body.innerText.length > 100,
      null,
      { timeout: 30000 }
    );
    await page.waitForTimeout(1000);
  }

  const after = await readCabSnapshot(page, mobile);
  const afterCabCount = after.bookings.filter(
    (item) => item.type === "cab" && item.mobile === mobile
  ).length;
  const afterLedgerCount = after.ledger.length;
  const afterConfirmCalls = countConfirmCalls(network);

  return {
    ok:
      afterCabCount === beforeCabCount &&
      afterLedgerCount === beforeLedgerCount &&
      afterConfirmCalls === beforeConfirmCalls,
    bookingCountBefore: beforeCabCount,
    bookingCountAfter: afterCabCount,
    ledgerCountBefore: beforeLedgerCount,
    ledgerCountAfter: afterLedgerCount,
    backendConfirmCountBefore: beforeConfirmCalls,
    backendConfirmCountAfter: afterConfirmCalls,
  };
}

function verifyConfirmation(confirmation) {
  return {
    ok:
      Boolean(confirmation?.bookingId) &&
      confirmation?.paymentStatus === "paid" &&
      confirmation?.bookingStatus === "confirmed",
    bookingId: confirmation?.bookingId,
    paymentStatus: confirmation?.paymentStatus,
    bookingStatus: confirmation?.bookingStatus,
  };
}

function verifyMyBooking(booking, payload) {
  return {
    ok:
      Boolean(booking?.id) &&
      booking?.type === "cab" &&
      Boolean(booking?.payloadStorageKey) &&
      Boolean(payload?.bookingId),
    bookingId: booking?.id,
    payloadStorageKey: booking?.payloadStorageKey,
  };
}

function verifyBackendRefs(confirmation) {
  const refs = {
    backendCheckoutId: confirmation?.backendCheckoutId,
    backendBookingId: confirmation?.backendBookingId,
    backendPaymentId: confirmation?.backendPaymentId,
    backendRequestId: confirmation?.backendRequestId,
    backendServiceType: confirmation?.backendServiceType,
    backendCheckoutStatus: confirmation?.backendCheckoutStatus,
  };
  return {
    ok:
      Boolean(refs.backendCheckoutId) &&
      Boolean(refs.backendBookingId) &&
      Boolean(refs.backendPaymentId) &&
      Boolean(refs.backendRequestId) &&
      refs.backendServiceType === "cab" &&
      refs.backendCheckoutStatus === "paid",
    refs,
  };
}

function verifyWalletGuard(confirmation, network) {
  const joined = network.map((entry) => entry.body || "").join("\n");
  return {
    ok:
      confirmation?.walletSource === "backend" &&
      confirmation?.walletSyncStatus === "synced" &&
      Boolean(confirmation?.backendWalletSnapshot) &&
      !joined.includes("WALLET_INSUFFICIENT_BALANCE"),
    walletSource: confirmation?.walletSource,
    walletSyncStatus: confirmation?.walletSyncStatus,
    backendWalletSnapshotPresent: Boolean(confirmation?.backendWalletSnapshot),
    staleLocalWalletRejected: !joined.includes("WALLET_INSUFFICIENT_BALANCE"),
  };
}

function verifyCabPayload(confirmation, seed) {
  const checks = {
    pickup: confirmation?.fromLocation === seed.searchMeta.from,
    drop: confirmation?.toLocation === seed.searchMeta.to,
    pickupDate: confirmation?.pickupDate === seed.searchMeta.pickupDate,
    pickupTime: confirmation?.pickupTime === seed.searchMeta.pickupTime,
    vehicle: confirmation?.cab?.id === seed.cab.id && confirmation?.cabName === seed.cab.name,
    fare: Number(confirmation?.fare?.baseFare || 0) === seed.fare.baseFare,
    taxes: Number(confirmation?.fare?.gst || 0) === seed.fare.taxesAndFees,
    addons:
      Array.isArray(confirmation?.selectedAddons) &&
      confirmation.selectedAddons.some((item) => item.id === "addon-driver-mask"),
    traveller:
      confirmation?.contactDetails?.mobile === seed.traveller.mobile &&
      confirmation?.travellers?.[0]?.fullName === seed.traveller.fullName,
    offer: confirmation?.appliedOffer?.code === seed.appliedOffer.code,
    wallet: Boolean(confirmation?.walletSource && confirmation?.walletSyncStatus),
    payment: confirmation?.paymentStatus === "paid",
    booking: Boolean(confirmation?.bookingId),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function verifyUniqueBookingRef(network) {
  const start = network.find(
    (entry) =>
      entry.method === "POST" && entry.url.includes("/services/cab/checkout/start")
  );
  const payload = safeJson(start?.requestBody);
  const rawPayload =
    payload?.rawPayload && typeof payload.rawPayload === "object"
      ? payload.rawPayload
      : payload;
  return {
    ok:
      Boolean(rawPayload?.bookingId) ||
      Boolean(rawPayload?.id) ||
      Boolean(rawPayload?.legacyFrontendId),
    bookingId: rawPayload?.bookingId,
    id: rawPayload?.id,
    legacyFrontendId: rawPayload?.legacyFrontendId,
  };
}

function summarizeBackendCall(network, pathFragment, expectedStatus) {
  const entry = network.find(
    (item) =>
      item.phase === "response" &&
      item.method === "POST" &&
      item.url.includes(pathFragment)
  );
  return {
    ok: Boolean(entry) && entry.status === expectedStatus,
    status: entry?.status,
    requestId: readRequestId(entry?.body),
  };
}

function summarizeConfirmCall(network) {
  const entry = network.find(
    (item) =>
      item.phase === "response" &&
      item.method === "POST" &&
      item.url.includes("/services/cab/checkout/") &&
      item.url.includes("/confirm")
  );
  return {
    ok: Boolean(entry) && entry.status === 200,
    status: entry?.status,
    requestId: readRequestId(entry?.body),
  };
}

function hasBackendRefs(value) {
  return Boolean(
    value?.backendCheckoutId ||
      value?.backendBookingId ||
      value?.backendPaymentId ||
      value?.backendRequestId ||
      value?.backendServiceType ||
      value?.backendCheckoutStatus
  );
}

function countConfirmCalls(network) {
  return network.filter(
    (item) =>
      item.phase === "response" &&
      item.method === "POST" &&
      item.url.includes("/services/cab/checkout/") &&
      item.url.includes("/confirm")
  ).length;
}

async function waitForUsefulPage(page) {
  await page.waitForFunction(
    () => document.body.innerText.length > 100,
    null,
    { timeout: 30000 }
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
  page.on("request", (request) => {
    const url = request.url();
    if (!url.includes("/api/v1/")) return;
    network.push({
      phase: "request",
      method: request.method(),
      url,
      status: "pending",
      body: "",
      requestBody: request.postData() || "",
    });
  });
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/v1/")) return;
    let body = "";
    try {
      body = await response.text();
    } catch {}
    network.push({
      phase: "response",
      method: response.request().method(),
      url,
      status: response.status(),
      body,
      requestBody: response.request().postData() || "",
    });
  });
  page.on("requestfailed", (request) => {
    network.push({
      phase: "requestfailed",
      method: request.method(),
      url: request.url(),
      status: "requestfailed",
      body: request.failure()?.errorText || "",
      requestBody: request.postData() || "",
    });
  });
  return network;
}

function safeJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readRequestId(body) {
  const parsed = safeJson(body);
  return parsed?.meta?.requestId || parsed?.requestId || "";
}

async function readExistingResult() {
  try {
    return JSON.parse(await readFile(JSON_PATH, "utf8"));
  } catch {
    return {};
  }
}

function computeStatus(data) {
  const checks = [
    data.health?.ok,
    data.health?.databaseOk,
    data.selector?.found,
    data.selector?.selected,
    data.uniqueBookingRef?.ok,
    data.backendStart?.ok,
    data.backendConfirm?.ok,
    data.backendRefs?.ok,
    data.walletGuard?.ok,
    data.cabPayloadIntegrity?.ok,
    data.confirmation?.ok,
    data.myBooking?.ok,
    data.viewDetail?.ok,
    data.manageReadPath?.ok,
    data.refreshDuplicateGuard?.ok,
    data.fallback?.ok,
  ];
  return checks.every(Boolean) ? "passed" : "failed";
}

async function writeArtifacts() {
  result.finishedAt = new Date().toISOString();
  await writeFile(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await writeFile(MD_PATH, buildMarkdownReport(result), "utf8");
}

function yesNo(value) {
  return value ? "PASS" : "FAIL";
}

function buildMarkdownReport(data) {
  return `# Phase 7A Cab Browser Certification

Status: ${data.status}

| Check | Result |
| --- | --- |
| Backend health | ${yesNo(data.health?.ok && data.health?.databaseOk)} |
| Selectors | ${yesNo(data.selector?.found && data.selector?.selected)} |
| Unique booking ref | ${yesNo(data.uniqueBookingRef?.ok)} |
| Backend start 201 | ${yesNo(data.backendStart?.ok)} |
| Backend confirm 200 | ${yesNo(data.backendConfirm?.ok)} |
| Backend refs | ${yesNo(data.backendRefs?.ok)} |
| Wallet guard | ${yesNo(data.walletGuard?.ok)} |
| Cab payload integrity | ${yesNo(data.cabPayloadIntegrity?.ok)} |
| Confirmation | ${yesNo(data.confirmation?.ok)} |
| My Booking | ${yesNo(data.myBooking?.ok)} |
| View Detail | ${yesNo(data.viewDetail?.ok)} |
| Manage read path | ${yesNo(data.manageReadPath?.ok)} |
| Refresh duplicate guard | ${yesNo(data.refreshDuplicateGuard?.ok)} |
| Backend-disabled fallback | ${yesNo(data.fallback?.ok)} |

## Backend

- Start status: ${data.backendStart?.status || "n/a"}
- Confirm status: ${data.backendConfirm?.status || "n/a"}
- Backend refs: ${JSON.stringify(data.backendRefs?.refs || {}, null, 2)}

## Wallet

- walletSource: ${data.walletGuard?.walletSource || "n/a"}
- walletSyncStatus: ${data.walletGuard?.walletSyncStatus || "n/a"}
- backendWalletSnapshotPresent: ${String(
    data.walletGuard?.backendWalletSnapshotPresent || false
  )}
- staleLocalWalletRejected: ${String(
    data.walletGuard?.staleLocalWalletRejected || false
  )}

## Duplicate Guard

${JSON.stringify(data.refreshDuplicateGuard || {}, null, 2)}

## Fallback

${JSON.stringify(data.fallback || {}, null, 2)}
`;
}

main().catch(async (error) => {
  result.status = "failed";
  result.error = error instanceof Error ? error.stack || error.message : String(error);
  await mkdir(OUT_DIR, { recursive: true });
  await writeArtifacts();
  console.error(result.error);
  process.exitCode = 1;
});
