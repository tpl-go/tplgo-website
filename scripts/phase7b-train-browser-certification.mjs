#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "phase7b-train-browser-result.json");
const MD_PATH = path.join(OUT_DIR, "phase7b-train-browser-report.md");

const FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: "train",
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
    method: "train-payment-method-upi",
    payButton: "train-payment-pay-button",
    irctcPassword: "train-irctc-password",
    irctcCaptcha: "train-irctc-captcha",
    irctcVerify: "train-irctc-verify-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  trainPayloadIntegrity: null,
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

  if (process.env.TPL_PHASE7B_MODE === "fallback-disabled") {
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

  console.log(`Phase 7B Train browser certification: ${result.status}`);
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
    `Phase 7B Train disabled-backend fallback: ${
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
  const seed = buildTrainSeed(auth.mobile);
  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    trainPayloadIntegrity: null,
    pricingRules: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
  };

  try {
    await seedTrainPage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/train/result?fromCity=Delhi&fromCode=NDLS&toCity=Mumbai&toCode=MMCT&date=2026-08-18`, {
      waitUntil: "domcontentloaded",
    });
    await waitForUsefulPage(page);
    await page.goto(`${FRONTEND_URL}/train/booking`, { waitUntil: "domcontentloaded" });
    await waitForUsefulPage(page);

    await page.goto(`${FRONTEND_URL}/train/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="train-payment-method-upi"]', {
      timeout: 30000,
    });
    output.selector.found = true;
    await page.click('[data-testid="train-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="train-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true",
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;
    await page.click('[data-testid="train-payment-pay-button"]');

    await page.waitForFunction(
      () =>
        location.pathname.includes("/train/irctc-auth") &&
        Boolean(sessionStorage.getItem("tplTrainPaymentConfirmedData")),
      null,
      { timeout: 45000 }
    );
    await page.fill('[data-testid="train-irctc-password"]', "certification-pass");
    await page.fill('[data-testid="train-irctc-captcha"]', "X7K9P");
    await page.click('[data-testid="train-irctc-verify-button"]');

    await page.waitForFunction(
      () =>
        location.pathname.includes("/train/confirmation") &&
        Boolean(sessionStorage.getItem("trainConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readTrainSnapshot(page, auth.mobile);
    output.confirmation = verifyConfirmation(snapshot.confirmation);
    output.myBooking = verifyMyBooking(snapshot.booking, snapshot.payload);
    output.backendRefs = verifyBackendRefs(snapshot.confirmation);
    output.walletGuard = verifyWalletGuard(snapshot.confirmation, network);
    output.trainPayloadIntegrity = verifyTrainPayload(snapshot.confirmation, seed);
    output.pricingRules = verifyPricingRules(snapshot.confirmation, seed);
    output.uniqueBookingRef = verifyUniqueBookingRef(network);
    output.backendStart = summarizeBackendCall(network, "/services/train/checkout/start", 201);
    output.backendConfirm = summarizeConfirmCall(network);

    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;
    await page.goto(`${FRONTEND_URL}/account/bookings/train/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Train Booking Detail") &&
        document.body.innerText.includes("Rajdhani"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = { ok: true, bookingId };

    await page.goto(`${FRONTEND_URL}/train/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readTrainSnapshot(page, auth.mobile);
    const manageText = await page.locator("body").innerText().catch(() => "");
    output.manageReadPath = {
      ok:
        manageSnapshot.payload?.bookingId === bookingId &&
        manageSnapshot.payload?.trainNumber === seed.bookingPayload.train.trainNumber &&
        !manageText.includes("Train booking not") &&
        !manageText.includes("not found"),
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
  const seed = buildTrainSeed(auth.mobile, "fallback");

  try {
    await seedTrainPage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/train/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="train-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="train-payment-method-upi"]');
    await page.click('[data-testid="train-payment-pay-button"]');
    await page.waitForFunction(
      () => location.pathname.includes("/train/irctc-auth"),
      null,
      { timeout: 45000 }
    );
    await page.fill('[data-testid="train-irctc-password"]', "fallback-pass");
    await page.fill('[data-testid="train-irctc-captcha"]', "X7K9P");
    await page.click('[data-testid="train-irctc-verify-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/train/confirmation") &&
        Boolean(sessionStorage.getItem("trainConfirmationData")),
      null,
      { timeout: 45000 }
    );
    await page.waitForTimeout(2500);

    const snapshot = await readTrainSnapshot(page, auth.mobile);
    const bookingId = snapshot.booking?.id || snapshot.confirmation?.bookingId;

    await page.goto(`${FRONTEND_URL}/account/bookings/train/${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => document.body.innerText.includes("Train Booking Detail"),
      null,
      { timeout: 30000 }
    );
    await page.goto(`${FRONTEND_URL}/train/manage?bookingId=${encodeURIComponent(bookingId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const manageSnapshot = await readTrainSnapshot(page, auth.mobile);

    const checkoutRequestCount = network.filter((entry) =>
      entry.url.includes("/services/train/checkout")
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

function buildTrainSeed(mobile, variant = "primary") {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const baseFare = variant === "fallback" ? 2450 : 2650;
  const appliedOffer = 300;
  const convenienceFee = 80;
  const gatewayFee = 35;
  const confirmUpgradeAmount = 120;
  const baseAfterOffer = baseFare - appliedOffer;
  const nonBenefitTotal = convenienceFee + gatewayFee + confirmUpgradeAmount;
  const totalBeforeWallet = baseAfterOffer + nonBenefitTotal;
  const walletBreakdown = {
    promoUsed: 700,
    earnedUsed: 500,
    refundUsed: 400,
    totalWalletUsed: 1600,
    tplCreditUsed: 1200,
    earnedOnThisBooking: Math.floor(baseAfterOffer * 0.02),
    promoAvailable: 99999,
    earnedAvailable: 99999,
    refundWalletAvailable: 99999,
  };
  const totalAmount = totalBeforeWallet - walletBreakdown.totalWalletUsed;

  return {
    bookingId: `TRN-PHASE7B-${suffix}`,
    id: `TRN-PHASE7B-ID-${suffix}`,
    legacyFrontendId: `train-phase7b-${suffix}`,
    bookingPayload: {
      trainId: "train-rajdhani-12952",
      trainName: "Mumbai Rajdhani Express",
      trainNumber: "12952",
      train: {
        id: "train-rajdhani-12952",
        trainName: "Mumbai Rajdhani Express",
        name: "Mumbai Rajdhani Express",
        trainNumber: "12952",
        ticketPrice: baseFare,
      },
      route: "NDLS → MMCT",
      fromCity: "Delhi",
      fromCode: "NDLS",
      fromStation: "New Delhi",
      toCity: "Mumbai",
      toCode: "MMCT",
      toStation: "Mumbai Central",
      travelDate: "2026-08-18",
      journeyDate: "2026-08-18",
      date: "2026-08-18",
      departureTime: "16:55",
      arrivalTime: "08:35",
      duration: "15h 40m",
      classCode: "3A",
      quota: "General",
      bookingType: "Regular Ticket",
      ticketPrice: baseFare,
      passengers: [
        {
          id: "1",
          fullName: "Phase Seven Train Traveller",
          firstName: "Phase",
          lastName: "Traveller",
          gender: "Male",
          age: "34",
          berthPreference: "Lower",
        },
      ],
      contactDetails: {
        countryCode: "+91",
        mobile,
        email: `phase7b.train.${suffix}@example.com`,
      },
    },
    travellers: [
      {
        id: "1",
        fullName: "Phase Seven Train Traveller",
        firstName: "Phase",
        lastName: "Traveller",
        gender: "Male",
        age: "34",
        berthPreference: "Lower",
      },
    ],
    contactDetails: {
      countryCode: "+91",
      mobile,
      email: `phase7b.train.${suffix}@example.com`,
    },
    irctcAccount: {
      username: `phase7b_${suffix}`.replace(/[^a-zA-Z0-9_]/g, "_"),
    },
    appliedOffer: {
      code: "TRAINCERT300",
      title: "Train certification offer",
      description: "Certification-only train offer metadata",
      discountAmount: appliedOffer,
    },
    appliedOfferCode: "TRAINCERT300",
    appliedOfferTitle: "Train certification offer",
    offerData: {
      code: "TRAINCERT300",
      title: "Train certification offer",
    },
    pricing: {
      pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",
      baseFare,
      trueBaseFare: baseFare,
      baseAfterOffer,
      convenienceFee,
      gatewayFee,
      confirmUpgradeAmount,
      nonBenefitTotal,
      totalBeforeWallet,
      appliedOffer,
      offerApplied: appliedOffer,
      appliedOfferAmount: appliedOffer,
      appliedOfferCode: "TRAINCERT300",
      appliedOfferTitle: "Train certification offer",
      offerData: { code: "TRAINCERT300" },
      tplCredit: walletBreakdown.totalWalletUsed,
      tplCreditUsed: walletBreakdown.tplCreditUsed,
      totalWalletUsed: walletBreakdown.totalWalletUsed,
      totalAmount,
      payableAmount: totalAmount,
      grandTotal: totalAmount,
      earnedOnThisBooking: walletBreakdown.earnedOnThisBooking,
      walletCalc: {
        promoUsed: walletBreakdown.promoUsed,
        earnedUsed: walletBreakdown.earnedUsed,
        refundUsed: walletBreakdown.refundUsed,
      },
      walletBreakdown,
      rules: {
        offerAppliesOn: "true_base_train_fare",
        promoEarnedAppliesOn: "base_after_offer",
        refundWalletAppliesOn: "final_payable",
        earnedCreditRate: 0.02,
        managePaymentPromoEarnedAllowed: false,
        managePaymentRefundWalletAllowed: true,
      },
    },
    walletBreakdown,
    timerLeft: 900,
  };
}

async function seedTrainPage(page, auth, seed) {
  await page.goto(`${FRONTEND_URL}/train/payment`, {
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
      sessionStorage.setItem("tplTrainPaymentData", JSON.stringify(seed));
    },
    { auth, seed }
  );
}

async function readTrainSnapshot(page, mobile) {
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
      parse(sessionStorage.getItem("trainConfirmationData")) ||
      parse(sessionStorage.getItem("trainPaymentSuccessData")) ||
      parse(sessionStorage.getItem("tplTrainPaymentConfirmedData"));
    const bookings = parse(localStorage.getItem("tpl_bookings_v1")) || [];
    const booking =
      bookings.find(
        (item) =>
          item.type === "train" &&
          item.mobile === mobile &&
          item.id === confirmation?.bookingId
      ) ||
      bookings.find((item) => item.type === "train" && item.mobile === mobile) ||
      null;
    const payload = booking?.payloadStorageKey
      ? parse(localStorage.getItem(booking.payloadStorageKey))
      : null;
    const ledger = parse(localStorage.getItem(`tpl_wallet_ledger_v1_${mobile}`)) || [];
    return { confirmation, bookings, booking, payload, ledger };
  }, mobile);
}

async function verifyRefreshDuplicateGuard(page, network, mobile) {
  const before = await readTrainSnapshot(page, mobile);
  const beforeCount = before.bookings.filter(
    (item) => item.type === "train" && item.mobile === mobile
  ).length;
  const beforeLedgerCount = before.ledger.length;
  const beforeConfirmCalls = countConfirmCalls(network);

  for (let index = 0; index < 3; index += 1) {
    await page.goto(`${FRONTEND_URL}/train/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1000);
  }

  const after = await readTrainSnapshot(page, mobile);
  const afterCount = after.bookings.filter(
    (item) => item.type === "train" && item.mobile === mobile
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
      booking?.type === "train" &&
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
      refs.backendServiceType === "train" &&
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

function verifyTrainPayload(confirmation, seed) {
  const checks = {
    bookingId: Boolean(confirmation?.bookingId),
    trainName: confirmation?.trainName === seed.bookingPayload.trainName,
    trainNumber: confirmation?.trainNumber === seed.bookingPayload.trainNumber,
    route: String(confirmation?.route || "").includes("NDLS"),
    boarding: confirmation?.boardingStation === seed.bookingPayload.fromCity,
    destination: confirmation?.destinationStation === seed.bookingPayload.toCity,
    journeyDate: confirmation?.journeyDate === seed.bookingPayload.journeyDate,
    departureTime: confirmation?.departureTime === seed.bookingPayload.departureTime,
    arrivalTime: confirmation?.arrivalTime === seed.bookingPayload.arrivalTime,
    traveller:
      confirmation?.contactDetails?.mobile === seed.contactDetails.mobile &&
      confirmation?.travellers?.[0]?.fullName === seed.travellers[0].fullName,
    pricing: Number(confirmation?.pricing?.baseFare || 0) === seed.pricing.baseFare,
    offer: confirmation?.appliedOfferCode === seed.appliedOfferCode,
    wallet: Boolean(confirmation?.walletSource && confirmation?.walletSyncStatus),
    payment: confirmation?.paymentStatus === "paid",
    pnr: Boolean(confirmation?.pnrNumber || confirmation?.pnr),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function verifyPricingRules(confirmation, seed) {
  const fare = confirmation?.fare || confirmation?.pricing || {};
  const rules = fare?.rules || {};
  const expectedEarned = Math.floor(seed.pricing.baseAfterOffer * 0.02);
  return {
    ok:
      rules.offerAppliesOn === "true_base_train_fare" &&
      rules.promoEarnedAppliesOn === "base_after_offer" &&
      rules.refundWalletAppliesOn === "final_payable" &&
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
      entry.url.includes("/services/train/checkout/start")
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
      item.url.includes("/services/train/checkout/") &&
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
      item.url.includes("/services/train/checkout/") &&
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
    requestedMobile || `97777${Math.floor(10000 + Math.random() * 89999)}`;
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
    data.trainPayloadIntegrity?.ok,
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
  return `# Phase 7B Train Browser Certification

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
| Train payload integrity | ${yesNo(data.trainPayloadIntegrity?.ok)} |
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
- staleLocalWalletRejected: ${String(data.walletGuard?.staleLocalWalletRejected || false)}

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
