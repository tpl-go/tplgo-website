#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "phase7c-cruise-browser-result.json");
const MD_PATH = path.join(OUT_DIR, "phase7c-cruise-browser-report.md");

const FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: "cruise",
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
    method: "cruise-payment-method-upi",
    payButton: "cruise-payment-pay-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  cruisePayloadIntegrity: null,
  pricingRules: null,
  confirmation: null,
  myBooking: null,
  viewDetail: null,
  manageReadPath: null,
  refreshDuplicateGuard: null,
  fallback: null,
  safety: {
    supplierApisCalled: false,
    livePaymentGatewayUsed: false,
    uiRedesigned: false,
    apiContractChanged: false,
  },
  status: "failed",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (process.env.TPL_PHASE7C_MODE === "fallback-disabled") {
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

  console.log(`Phase 7C Cruise browser certification: ${result.status}`);
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
    `Phase 7C Cruise disabled-backend fallback: ${
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
  const seed = buildCruiseSeed(auth.mobile);
  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    cruisePayloadIntegrity: null,
    pricingRules: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
  };

  try {
    await seedCruisePage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/cruise/result?destination=Arabian%20Sea&departurePort=Mumbai&sailingMonth=2026-09`, {
      waitUntil: "domcontentloaded",
    });
    await waitForUsefulPage(page);
    await page.goto(`${FRONTEND_URL}/cruise/detail/${encodeURIComponent(seed.cruise.id)}`, {
      waitUntil: "domcontentloaded",
    }).catch(() => {});
    await waitForUsefulPage(page).catch(() => {});
    await page.goto(`${FRONTEND_URL}/cruise/booking`, {
      waitUntil: "domcontentloaded",
    });
    await waitForUsefulPage(page);

    await page.goto(`${FRONTEND_URL}/cruise/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="cruise-payment-method-upi"]', {
      timeout: 30000,
    });
    output.selector.found = true;
    await page.click('[data-testid="cruise-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="cruise-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true",
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;
    await page.click('[data-testid="cruise-payment-pay-button"]');

    await page.waitForFunction(
      () =>
        location.pathname.includes("/cruise/confirmation") &&
        Boolean(sessionStorage.getItem("tplCruiseConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readCruiseSnapshot(page, auth.mobile);
    output.confirmation = verifyConfirmation(snapshot.confirmation);
    output.myBooking = verifyMyBooking(snapshot.booking, snapshot.payload);
    output.backendRefs = verifyBackendRefs(snapshot.confirmation);
    output.walletGuard = verifyWalletGuard(snapshot.confirmation, network);
    output.cruisePayloadIntegrity = verifyCruisePayload(snapshot.confirmation, seed);
    output.pricingRules = verifyPricingRules(snapshot.confirmation, seed);
    output.uniqueBookingRef = verifyUniqueBookingRef(network);
    output.backendStart = summarizeBackendCall(network, "/services/cruise/checkout/start", 201);
    output.backendConfirm = summarizeConfirmCall(network);

    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;
    await page.goto(`${FRONTEND_URL}/account/bookings/cruise/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Cruise Booking Detail") ||
        document.body.innerText.includes("Cruise Journey Details"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = { ok: true, bookingId };

    await page.goto(`${FRONTEND_URL}/cruise/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readCruiseSnapshot(page, auth.mobile);
    const manageText = await page.locator("body").innerText().catch(() => "");
    output.manageReadPath = {
      ok:
        manageSnapshot.payload?.bookingId === bookingId &&
        manageSnapshot.payload?.cruise?.title === seed.cruise.title &&
        !manageText.includes("Cruise booking not found"),
      bookingId,
      payloadFound: Boolean(manageSnapshot.payload),
      rendered: manageText.length > 0,
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
  const seed = buildCruiseSeed(auth.mobile, "fallback");

  try {
    await seedCruisePage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/cruise/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="cruise-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="cruise-payment-method-upi"]');
    await page.click('[data-testid="cruise-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/cruise/confirmation") &&
        Boolean(sessionStorage.getItem("tplCruiseConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readCruiseSnapshot(page, auth.mobile);
    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;

    await page.goto(`${FRONTEND_URL}/account/bookings/cruise/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.body.innerText.includes("Cruise"),
      null,
      { timeout: 30000 }
    );
    await page.goto(`${FRONTEND_URL}/cruise/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readCruiseSnapshot(page, auth.mobile);

    const checkoutRequestCount = network.filter((entry) =>
      entry.url.includes("/services/cruise/checkout")
    ).length;
    const refsAbsent = !hasBackendRefs(snapshot.confirmation);

    return {
      ok:
        Boolean(snapshot.confirmation?.bookingId) &&
        Boolean(snapshot.booking?.id) &&
        Boolean(manageSnapshot.payload?.bookingId) &&
        refsAbsent &&
        checkoutRequestCount === 0,
      localConfirmation: Boolean(snapshot.confirmation?.bookingId),
      myBooking: Boolean(snapshot.booking?.id),
      viewDetail: true,
      manageReadPath: Boolean(manageSnapshot.payload?.bookingId),
      backendRefsAbsent: refsAbsent,
      checkoutRequestCount,
    };
  } finally {
    await page.close();
  }
}

function buildCruiseSeed(mobile, variant = "primary") {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const baseFare = variant === "fallback" ? 48000 : 52000;
  const appliedOffer = 6000;
  const baseAfterOffer = baseFare - appliedOffer;
  const taxes = 4200;
  const portCharges = 2500;
  const gratuityCharges = 1800;
  const addonTotal = 3500;
  const totalBeforeWallet = baseAfterOffer + taxes + portCharges + gratuityCharges + addonTotal;
  const walletBreakdown = {
    promoUsed: 2500,
    earnedUsed: 1800,
    refundUsed: 2200,
    totalWalletUsed: 6500,
    tplCreditUsed: 4300,
    earnedOnThisBooking: Math.floor(baseAfterOffer * 0.02),
    promoAvailable: 99999,
    earnedAvailable: 99999,
    refundWalletAvailable: 99999,
  };
  const grandTotal = totalBeforeWallet - walletBreakdown.totalWalletUsed;

  return {
    bookingId: `CRU-PHASE7C-${suffix}`,
    id: `CRU-PHASE7C-ID-${suffix}`,
    legacyFrontendId: `cruise-phase7c-${suffix}`,
    cruise: {
      id: "cordelia-arabian-sea",
      title: "Arabian Sea Discovery Cruise",
      name: "Arabian Sea Discovery Cruise",
      cruiseLine: "Cordelia Cruises",
      shipName: "Empress",
      route: "Mumbai - Goa - Mumbai",
      itinerary: ["Mumbai", "At Sea", "Goa", "Mumbai"],
      departurePort: "Mumbai",
      arrivalPort: "Mumbai",
      returnPort: "Mumbai",
      sailingStartDate: "2026-09-18",
      sailingDate: "2026-09-18",
      duration: "4 Nights / 5 Days",
    },
    cabins: {
      selectedCabin: {
        id: "balcony-premium",
        name: "Premium Balcony Cabin",
        cabinType: "Balcony",
        price: baseFare,
        taxes,
      },
      selectedAddons: [
        {
          id: "dining-upgrade",
          title: "Specialty Dining Upgrade",
          price: addonTotal,
        },
      ],
      pricingSummary: {
        cabins: [
          {
            cabinKey: "cabin-1",
            cabinId: "balcony-premium",
            cabinName: "Premium Balcony Cabin",
            adults: 2,
            children: 0,
            infants: 0,
            subtotal: baseFare,
          },
        ],
        cabinsTotal: baseFare,
        taxesAndFees: taxes + portCharges + gratuityCharges,
        addonsTotal: addonTotal,
        grandTotal,
      },
    },
    travellers: {
      list: [
        {
          id: "1",
          firstName: "Phase",
          lastName: "Cruise",
          fullName: "Phase Cruise Traveller",
          gender: "Male",
          age: "38",
          nationality: "Indian",
        },
        {
          id: "2",
          firstName: "Seven",
          lastName: "Cruise",
          fullName: "Seven Cruise Traveller",
          gender: "Female",
          age: "35",
          nationality: "Indian",
        },
      ],
      contact: {
        countryCode: "+91",
        mobile,
        email: `phase7c.cruise.${suffix}@example.com`,
      },
    },
    additionalInfo: {
      specialRequest: "Anniversary dinner seating",
    },
    offer: {
      id: "CRUISECERT6000",
      code: "CRUISECERT6000",
      title: "Cruise certification offer",
      discountAmount: appliedOffer,
    },
    fare: {
      pricingVersion: "TPL_CRUISE_PRICING_RULE_V1",
      baseFare,
      baseAfterOffer,
      taxes,
      portCharges,
      gratuityCharges,
      addonsTotal: addonTotal,
      appliedOffer,
      offerApplied: appliedOffer,
      totalBeforeWallet,
      grandTotal,
      totalAmount: grandTotal,
      payableAmount: grandTotal,
      walletBreakdown,
      earnedOnThisBooking: walletBreakdown.earnedOnThisBooking,
      rules: {
        offerAppliesOn: "base_cruise_amount",
        promoEarnedAppliesOn: "base_after_offer",
        refundWalletAppliesOn: "payable",
        earnedCreditRate: 0.02,
        addonsOutsideBenefitBase: true,
        taxesOutsideBenefitBase: true,
        managePaymentPromoEarnedAllowed: false,
        managePaymentRefundWalletAllowed: true,
      },
    },
    session: {
      timerLeft: 600,
      createdAt: new Date().toISOString(),
    },
  };
}

async function seedCruisePage(page, auth, seed) {
  await page.goto(`${FRONTEND_URL}/cruise/payment`, {
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
      sessionStorage.setItem("tplCruiseBookingSession", JSON.stringify(seed));
      sessionStorage.setItem("tplCruiseBookingDraft", JSON.stringify(seed));
    },
    { auth, seed }
  );
}

async function readCruiseSnapshot(page, mobile) {
  return page.evaluate((mobile) => {
    const parse = (value) => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };
    const confirmation = parse(sessionStorage.getItem("tplCruiseConfirmationData"));
    const bookings = parse(localStorage.getItem("tpl_bookings_v1")) || [];
    const booking =
      bookings.find(
        (item) =>
          item.type === "cruise" &&
          item.mobile === mobile &&
          item.id === confirmation?.bookingId
      ) ||
      bookings.find((item) => item.type === "cruise" && item.mobile === mobile) ||
      null;
    const payload = booking?.payloadStorageKey
      ? parse(localStorage.getItem(booking.payloadStorageKey))
      : null;
    const ledger = parse(localStorage.getItem(`tpl_wallet_ledger_v1_${mobile}`)) || [];
    return { confirmation, bookings, booking, payload, ledger };
  }, mobile);
}

async function verifyRefreshDuplicateGuard(page, network, mobile) {
  const before = await readCruiseSnapshot(page, mobile);
  const beforeCount = before.bookings.filter(
    (item) => item.type === "cruise" && item.mobile === mobile
  ).length;
  const beforeLedgerCount = before.ledger.length;
  const beforeConfirmCalls = countConfirmCalls(network);

  for (let index = 0; index < 3; index += 1) {
    await page.goto(`${FRONTEND_URL}/cruise/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1000);
  }

  const after = await readCruiseSnapshot(page, mobile);
  const afterCount = after.bookings.filter(
    (item) => item.type === "cruise" && item.mobile === mobile
  ).length;
  const afterLedgerCount = after.ledger.length;
  const afterConfirmCalls = countConfirmCalls(network);

  return {
    ok:
      beforeCount === afterCount &&
      beforeLedgerCount === afterLedgerCount &&
      beforeConfirmCalls === afterConfirmCalls,
    bookingCountBefore: beforeCount,
    bookingCountAfter: afterCount,
    ledgerCountBefore: beforeLedgerCount,
    ledgerCountAfter: afterLedgerCount,
    backendConfirmCountBefore: beforeConfirmCalls,
    backendConfirmCountAfter: afterConfirmCalls,
  };
}

function verifyConfirmation(confirmation) {
  return {
    ok: Boolean(confirmation?.bookingId && confirmation?.paymentData?.paidAt),
    bookingId: confirmation?.bookingId,
    paymentStatus: confirmation?.paymentStatus || confirmation?.paymentData?.paymentStatus || "paid",
  };
}

function verifyMyBooking(booking, payload) {
  return {
    ok:
      Boolean(booking?.id) &&
      booking?.type === "cruise" &&
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
      refs.backendServiceType === "cruise" &&
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

function verifyCruisePayload(confirmation, seed) {
  const checks = {
    title: confirmation?.cruise?.title === seed.cruise.title,
    route: confirmation?.cruise?.route === seed.cruise.route,
    departurePort: confirmation?.cruise?.departurePort === seed.cruise.departurePort,
    returnPort:
      confirmation?.cruise?.returnPort === seed.cruise.returnPort ||
      confirmation?.cruise?.arrivalPort === seed.cruise.arrivalPort,
    sailingDate: confirmation?.cruise?.sailingStartDate === seed.cruise.sailingStartDate,
    duration: confirmation?.cruise?.duration === seed.cruise.duration,
    cabin:
      confirmation?.cabins?.selectedCabin?.cabinType ===
      seed.cabins.selectedCabin.cabinType,
    traveller:
      confirmation?.travellers?.contact?.mobile === seed.travellers.contact.mobile &&
      confirmation?.travellers?.list?.[0]?.fullName === seed.travellers.list[0].fullName,
    addons:
      Array.isArray(confirmation?.cabins?.selectedAddons) &&
      confirmation.cabins.selectedAddons.some((item) => item.id === "dining-upgrade"),
    taxes: Number(confirmation?.fare?.taxes || 0) === seed.fare.taxes,
    offer: confirmation?.offer?.code === seed.offer.code,
    wallet: Boolean(confirmation?.walletSource && confirmation?.walletSyncStatus),
    payment: Boolean(confirmation?.paymentData?.paidAt),
    booking: Boolean(confirmation?.bookingId),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function verifyPricingRules(confirmation, seed) {
  const fare = confirmation?.fare || {};
  const rules = fare?.rules || {};
  const expectedEarned = Math.floor(seed.fare.baseAfterOffer * 0.02);
  return {
    ok:
      rules.offerAppliesOn === "base_cruise_amount" &&
      rules.promoEarnedAppliesOn === "base_after_offer" &&
      rules.refundWalletAppliesOn === "payable" &&
      rules.addonsOutsideBenefitBase === true &&
      rules.taxesOutsideBenefitBase === true &&
      rules.managePaymentPromoEarnedAllowed === false &&
      rules.managePaymentRefundWalletAllowed === true &&
      Number(fare.earnedOnThisBooking || 0) === expectedEarned,
    rules,
    expectedEarned,
    actualEarned: Number(fare.earnedOnThisBooking || 0),
  };
}

function verifyUniqueBookingRef(network) {
  const start = network.find(
    (entry) =>
      entry.phase === "request" &&
      entry.method === "POST" &&
      entry.url.includes("/services/cruise/checkout/start")
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
      item.url.includes("/services/cruise/checkout/") &&
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
      item.url.includes("/services/cruise/checkout/") &&
      item.url.includes("/confirm")
  ).length;
}

async function waitForUsefulPage(page) {
  await page.waitForFunction(() => document.body.innerText.length > 50, null, {
    timeout: 30000,
  });
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
    requestedMobile || `98888${Math.floor(10000 + Math.random() * 89999)}`;
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
    data.cruisePayloadIntegrity?.ok,
    data.pricingRules?.ok,
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
  return `# Phase 7C Cruise Browser Certification

Status: ${data.status}

| Check | Result |
| --- | --- |
| Backend health | ${yesNo(data.health?.ok && data.health?.databaseOk)} |
| Selectors | ${yesNo(data.selector?.found && data.selector?.selected)} |
| Unique booking ref | ${yesNo(data.uniqueBookingRef?.ok)} |
| Backend start 201 | ${yesNo(data.backendStart?.ok)} |
| Backend confirm 200 | ${yesNo(data.backendConfirm?.ok)} |
| Backend refs | ${yesNo(data.backendRefs?.ok)} |
| Wallet source/sync | ${yesNo(data.walletGuard?.ok)} |
| Cruise payload integrity | ${yesNo(data.cruisePayloadIntegrity?.ok)} |
| Pricing rules | ${yesNo(data.pricingRules?.ok)} |
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
- backendWalletSnapshotPresent: ${String(data.walletGuard?.backendWalletSnapshotPresent || false)}

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
