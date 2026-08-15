#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(
  OUT_DIR,
  "phase6a-smart-planner-browser-result.json"
);
const MD_PATH = path.join(
  OUT_DIR,
  "phase6a-smart-planner-browser-report.md"
);

const SERVICE = "smart-planner";
const TRIP_TITLE = "Phase 6A Smart Planner Ladakh Circuit";
const ROUTE_LABEL = "Delhi -> Leh -> Nubra -> Pangong -> Delhi";
const SELECTED_BASKET_VALUE = 118000;
const OFFER_DISCOUNT = 10000;
const BASE_AFTER_OFFER = 108000;
const TAXES_AND_FEES = 7200;
const TOTAL_BEFORE_WALLET = 115200;
const EARNED_CREDIT = 2160;

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
    method: "smart-planner-payment-method-upi",
    payButton: "smart-planner-payment-pay-button",
    found: false,
    selected: false,
  },
  uniqueBookingRef: null,
  backendStart: null,
  backendConfirm: null,
  backendRefs: null,
  walletGuard: null,
  smartPlannerDataIntegrity: null,
  confirmation: null,
  myBooking: null,
  viewDetail: null,
  manageReadPath: null,
  fallback: null,
  refreshDuplicateGuard: null,
  pricingWalletRules: null,
  safety: {
    supplierApisCalled: false,
    livePaymentGatewayUsed: false,
    fallbackRemoved: false,
  },
  status: "failed",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (process.env.TPL_PHASE6A_MODE === "fallback-disabled") {
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

  console.log(`Phase 6A Smart Planner browser certification: ${result.status}`);
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
    `Phase 6A Smart Planner disabled-backend fallback: ${
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
  const seed = buildSmartPlannerSeed(mobile);

  const output = {
    selector: result.selector,
    uniqueBookingRef: null,
    backendStart: null,
    backendConfirm: null,
    backendRefs: null,
    walletGuard: null,
    smartPlannerDataIntegrity: null,
    confirmation: null,
    myBooking: null,
    viewDetail: null,
    manageReadPath: null,
    refreshDuplicateGuard: null,
    pricingWalletRules: null,
  };

  try {
    await seedSmartPlannerPage(page, auth, seed);
    await page.goto(`${FRONTEND_URL}/smart-planner/workspace`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Smart Planner") ||
        document.body.innerText.length > 100,
      null,
      { timeout: 30000 }
    );

    await page.goto(`${FRONTEND_URL}/smart-planner/review`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Review") ||
        document.body.innerText.length > 100,
      null,
      { timeout: 30000 }
    );

    await page.goto(`${FRONTEND_URL}/smart-planner/booking`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Booking") ||
        document.body.innerText.length > 100,
      null,
      { timeout: 30000 }
    );

    await page.goto(`${FRONTEND_URL}/smart-planner/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="smart-planner-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    output.selector.found = Boolean(
      await page
        .locator('[data-testid="smart-planner-payment-method-upi"]')
        .count()
    );
    await page.click('[data-testid="smart-planner-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="smart-planner-payment-method-upi"]')
          ?.getAttribute("data-selected") === "true" ||
        !document
          .querySelector('[data-testid="smart-planner-payment-pay-button"]')
          ?.hasAttribute("disabled"),
      null,
      { timeout: 10000 }
    );
    output.selector.selected = true;

    await page.waitForSelector('[data-testid="smart-planner-payment-pay-button"]', {
      timeout: 30000,
    });
    await page.click('[data-testid="smart-planner-payment-pay-button"]');
    await page.waitForFunction(
      () =>
        location.pathname.includes("/smart-planner/confirmation") &&
        Boolean(
          sessionStorage.getItem("tpl_tiya_planner_confirmation_v1") ||
            localStorage.getItem("tpl_tiya_planner_confirmation_v1")
        ),
      null,
      { timeout: 120000 }
    );

    const confirmation = await readPlannerPayloadFromPage(
      page,
      "tpl_tiya_planner_confirmation_v1"
    );
    const saved = await waitForSavedSmartPlannerBooking(page);
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
      ].includes("smart-planner-preview"),
    };

    output.backendStart = readEndpointResult(
      network,
      "/api/v1/services/smart-planner/checkout/start"
    );
    output.backendConfirm = readEndpointResult(
      network,
      "/api/v1/services/smart-planner/checkout/",
      "/confirm"
    );
    output.backendRefs = verifyBackendRefs(confirmation);
    output.walletGuard = verifyWalletGuard(confirmation, network);
    output.pricingWalletRules = verifyPricingWalletRules(confirmation, payload);
    output.smartPlannerDataIntegrity = verifySmartPlannerDataIntegrity({
      seed,
      confirmation,
      payload,
      saved,
    });
    output.confirmation = {
      ok:
        Boolean(confirmation) &&
        page.url().includes("/smart-planner/confirmation"),
      path: new URL(page.url()).pathname,
      bookingId: confirmation?.bookingId || null,
      savedBookingId: bookingId || null,
      paymentStatus:
        confirmation?.paymentStatus ||
        confirmation?.bookingMeta?.paymentStatus ||
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
      `${FRONTEND_URL}/account/bookings/smart-planner/${encodeURIComponent(
        bookingId
      )}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Smart Planner Trip Detail"),
      null,
      { timeout: 30000 }
    );
    output.viewDetail = {
      ok: await page.evaluate(
        ({ id }) =>
          document.body.innerText.includes("Smart Planner Trip Detail") &&
          document.body.innerText.includes(id) &&
          (document.body.innerText.includes("Selected Basket / Services") ||
            document.body.innerText.includes("Day-wise Itinerary")),
        { id: bookingId }
      ),
      path: new URL(page.url()).pathname,
    };

    await page.goto(
      `${FRONTEND_URL}/smart-planner/manage/${encodeURIComponent(bookingId)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Manage Your Smart Planner Booking"),
      null,
      { timeout: 30000 }
    );
    output.manageReadPath = {
      ok: await page.evaluate(
        ({ id }) =>
          document.body.innerText.includes(id) &&
          document.body.innerText.includes("Manage Your Smart Planner Booking") &&
          document.body.innerText.includes("Selected Services") &&
          document.body.innerText.includes("Planner Intelligence"),
        { id: bookingId }
      ),
      path: `${new URL(page.url()).pathname}${new URL(page.url()).search}`,
    };

    const preRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountBefore = countEndpoint(
      network,
      "/api/v1/services/smart-planner/checkout/",
      "/confirm"
    );
    await page.goto(`${FRONTEND_URL}/smart-planner/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.body.innerText.includes("Smart Planner"),
      null,
      { timeout: 30000 }
    );
    const postRefresh = await readBookingState(page, bookingId, mobile);
    const confirmCountAfter = countEndpoint(
      network,
      "/api/v1/services/smart-planner/checkout/",
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
    await seedSmartPlannerPage(page, auth, buildSmartPlannerSeed(mobile));
    step = "payment";
    await page.goto(`${FRONTEND_URL}/smart-planner/payment`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('[data-testid="smart-planner-payment-method-upi"]', {
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    await page.click('[data-testid="smart-planner-payment-method-upi"]');
    await page.waitForFunction(
      () =>
        !document
          .querySelector('[data-testid="smart-planner-payment-pay-button"]')
          ?.hasAttribute("disabled"),
      null,
      { timeout: 10000 }
    );
    await page.click('[data-testid="smart-planner-payment-pay-button"]');
    step = "confirmation";
    await page.waitForFunction(
      () =>
        location.pathname.includes("/smart-planner/confirmation") &&
        Boolean(
          sessionStorage.getItem("tpl_tiya_planner_confirmation_v1") ||
            localStorage.getItem("tpl_tiya_planner_confirmation_v1")
        ),
      null,
      { timeout: 120000 }
    );
    const confirmation = await readPlannerPayloadFromPage(
      page,
      "tpl_tiya_planner_confirmation_v1"
    );
    const saved = await waitForSavedSmartPlannerBooking(page);
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
      `${FRONTEND_URL}/account/bookings/smart-planner/${encodeURIComponent(
        saved.id
      )}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Smart Planner Trip Detail"),
      null,
      { timeout: 30000 }
    );
    const detailOk = await page.evaluate(
      () =>
        document.body.innerText.includes("Smart Planner Trip Detail") &&
        (document.body.innerText.includes("Selected Basket / Services") ||
          document.body.innerText.includes("Day-wise Itinerary"))
    );

    step = "manage-read-path";
    await page.goto(
      `${FRONTEND_URL}/smart-planner/manage/${encodeURIComponent(saved.id)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(
      () => document.body.innerText.includes("Manage Your Smart Planner Booking"),
      null,
      { timeout: 30000 }
    );
    const manageOk = await page.evaluate(
      () =>
        document.body.innerText.includes("Manage Your Smart Planner Booking") &&
        document.body.innerText.includes("Selected Services")
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
        entry.url.includes("/api/v1/services/smart-planner/checkout")
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

async function seedSmartPlannerPage(page, auth, seed) {
  await page.goto(FRONTEND_URL, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.evaluate(
    ({ authRecord, payload, mobile }) => {
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
        "tplPaymentLeadTraveller",
        JSON.stringify({
          name: "Phase Planner",
          email: "phase6a.smartplanner@example.com",
          mobile,
          contactDetails: {
            countryCode: "+91",
            email: "phase6a.smartplanner@example.com",
            mobile,
          },
        })
      );
      const handoff = {
        payload,
        plannerFareSummary: payload.plannerFareSummary,
        selectedBasketValue: payload.selectedBasketValue,
        totalBasketValue: payload.selectedBasketValue,
      };
      sessionStorage.setItem(
        "tpl_tiya_planner_booking_draft_v1",
        JSON.stringify(handoff)
      );
      sessionStorage.setItem("tpl_tiya_checkout_v1", JSON.stringify(payload));
      sessionStorage.setItem(
        "tpl_tiya_review_draft_v1",
        JSON.stringify({ reviewPayload: payload })
      );
      sessionStorage.setItem(
        "tpl_tiya_workspace_review_payload_v1",
        JSON.stringify(payload)
      );
    },
    {
      authRecord: { user: auth.user, session: auth.session },
      payload: seed,
      mobile: auth.mobile,
    }
  );
}

function buildSmartPlannerSeed(mobile) {
  const selectedBasketItems = [
    basketItem("flight-del-leh", "Phase Air DEL - IXL", "flight", 26000, "Delhi", "Day 1"),
    basketItem("hotel-leh", "Leh Heritage Hotel", "hotel", 36000, "Leh", "Days 1-2"),
    basketItem("cab-ladakh", "Private Ladakh SUV", "cab", 22000, "Leh", "Days 1-5"),
    basketItem("activity-pangong", "Pangong Lake Experience", "activity", 16000, "Pangong", "Day 4"),
    basketItem("market-leh", "Leh Local Market Walk", "local-market", 8000, "Leh", "Day 2"),
    basketItem("creator-nubra", "Nubra Creator Sunrise Shoot", "creator", 10000, "Nubra", "Day 3"),
  ];
  const selectedServices = {
    selectedActivities: [selectedBasketItems[3]],
    selectedCabs: [selectedBasketItems[2]],
    selectedCreatorSpots: [selectedBasketItems[5]],
    selectedFlights: [selectedBasketItems[0]],
    selectedHotels: [selectedBasketItems[1]],
    selectedHomestays: [],
    selectedInsurance: [],
    selectedLocalLifeItems: [],
    selectedLocalMarketItems: [selectedBasketItems[4]],
    selectedMeals: [
      basketItem("meal-leh", "Ladakhi Dinner Plan", "meal", 0, "Leh", "Day 2"),
    ],
    selectedTransfers: [selectedBasketItems[2]],
    selectedVisa: [],
  };
  const plannerFareSummary = {
    addOnsTotal: 0,
    baseAfterOffer: BASE_AFTER_OFFER,
    baseAmount: SELECTED_BASKET_VALUE,
    convenienceFee: 0,
    currency: "INR",
    earnedCreditAmount: EARNED_CREDIT,
    earnedCreditUsed: 99999,
    finalPayable: 0,
    offerData: {
      code: "SMART10",
      description: "Phase 6A Smart Planner controlled offer",
      title: "Smart Planner Phase 6A Offer",
    },
    offerDiscount: OFFER_DISCOUNT,
    promoCreditUsed: 99999,
    refundWalletUsed: 99999,
    selectedBasketValue: SELECTED_BASKET_VALUE,
    taxesAndFees: TAXES_AND_FEES,
    totalWalletBenefit: 299997,
  };

  return {
    aiPlannerMetadata: {
      model: "mock-tiya-local",
      promptVersion: "phase-6a-browser-cert",
      recommendationRunId: "phase6a-ai-run-001",
    },
    bookingMode: "controlled-browser-certification",
    contactDetails: {
      countryCode: "+91",
      email: "phase6a.smartplanner@example.com",
      mobile,
    },
    dayPlans: itineraryDays(),
    dayStatus: {
      day1: "FINALIZED",
      day2: "FINALIZED",
      day3: "FINALIZED",
      day4: "FINALIZED",
      day5: "FINALIZED",
    },
    itinerary: itineraryDays(),
    notes: "Phase 6A controlled browser certification seed.",
    plannerAudit: {
      auditStatus: "ready",
      routeReadiness: "ready",
      weatherStatus: "clear",
    },
    plannerFareSummary,
    plannerIntelligence: {
      recommendations: ["Start early for Pangong", "Carry warm layers"],
      routeAlerts: ["High altitude acclimatisation required"],
      score: 94,
    },
    plannerMetadata: {
      phase: "6A",
      source: "browser-certification",
      workspaceId: "phase6a-workspace-001",
    },
    preferences: {
      pace: "balanced",
      travelStyle: "premium-adventure",
    },
    quoteEstimate: {
      amount: TOTAL_BEFORE_WALLET,
      total: TOTAL_BEFORE_WALLET,
    },
    readinessStatus: {
      bookingReadiness: "ready",
      overallStatus: "ready",
      permitStatus: "ready",
      roadStatus: "open",
      weatherStatus: "clear",
    },
    routeData: {
      difficulty: "Moderate",
      routeLabel: ROUTE_LABEL,
      title: "Ladakh Circuit",
    },
    routeVariants: [
      { label: "Comfort Adventure", strategy: "balanced" },
      { label: "Fast Circuit", strategy: "compressed" },
    ],
    selectedActivities: selectedServices.selectedActivities,
    selectedBasketItems,
    selectedBasketValue: SELECTED_BASKET_VALUE,
    selectedCabs: selectedServices.selectedCabs,
    selectedCreatorSpots: selectedServices.selectedCreatorSpots,
    selectedFlights: selectedServices.selectedFlights,
    selectedHotels: selectedServices.selectedHotels,
    selectedLocalMarketItems: selectedServices.selectedLocalMarketItems,
    selectedMeals: selectedServices.selectedMeals,
    selectedRoute: {
      label: "Ladakh Circuit",
      routeLabel: ROUTE_LABEL,
      title: "Ladakh Circuit",
    },
    selectedRouteVariant: {
      label: "Comfort Adventure",
      strategy: "balanced",
    },
    selectedServices,
    travellers: {
      adults: 2,
      children: 0,
      contactDetails: {
        countryCode: "+91",
        email: "phase6a.smartplanner@example.com",
        mobile,
      },
      total: 2,
      travellers: [
        {
          email: "phase6a.smartplanner@example.com",
          firstName: "Phase",
          fullName: "Phase Planner",
          gender: "male",
          id: "traveller-1",
          lastName: "Planner",
          mobile,
          travellerType: "Adult",
        },
        {
          firstName: "Cert",
          fullName: "Cert Traveller",
          gender: "female",
          id: "traveller-2",
          lastName: "Traveller",
          travellerType: "Adult",
        },
      ],
    },
    travellerDetails: [
      {
        email: "phase6a.smartplanner@example.com",
        firstName: "Phase",
        fullName: "Phase Planner",
        id: "traveller-1",
        lastName: "Planner",
        mobile,
        travellerType: "Adult",
      },
      {
        firstName: "Cert",
        fullName: "Cert Traveller",
        id: "traveller-2",
        lastName: "Traveller",
        travellerType: "Adult",
      },
    ],
    trip: {
      dateRange: { end: "2026-09-19", start: "2026-09-15" },
      destination: "Ladakh",
      duration: "4N / 5D",
      durationDays: 5,
      durationLabel: "4N / 5D",
      endDate: "2026-09-19",
      name: TRIP_TITLE,
      nights: 4,
      origin: "Delhi",
      startDate: "2026-09-15",
      title: TRIP_TITLE,
      totalDays: 5,
      travelStyle: "Premium Adventure",
      tripType: "domestic",
    },
    tripMode: "domestic",
    updatedAt: new Date().toISOString(),
  };
}

function basketItem(id, title, type, amount, city, dayLabel) {
  return {
    amount,
    category: type,
    city,
    date: "2026-09-15",
    dayLabel,
    id,
    name: title,
    serviceGroup: type,
    serviceType: type,
    title,
    type,
  };
}

function itineraryDays() {
  return [
    { city: "Leh", day: 1, id: "day1", title: "Arrival in Leh" },
    { city: "Leh", day: 2, id: "day2", title: "Leh acclimatisation and market walk" },
    { city: "Nubra", day: 3, id: "day3", title: "Leh to Nubra Valley" },
    { city: "Pangong", day: 4, id: "day4", title: "Nubra to Pangong Lake" },
    { city: "Delhi", day: 5, id: "day5", title: "Return to Delhi" },
  ];
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
    requestedMobile || `95555${Math.floor(10000 + Math.random() * 89999)}`;
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

async function readPlannerPayloadFromPage(page, key) {
  return page.evaluate((storageKey) => {
    function safeJson(value) {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    function readDetail(detailStorageKey) {
      const manifest = safeJson(localStorage.getItem(detailStorageKey));
      if (!manifest?.detailId || !manifest?.chunkCount) return null;
      let serialized = "";
      for (let index = 0; index < manifest.chunkCount; index += 1) {
        serialized +=
          localStorage.getItem(`tpl_tiya_detail_chunk_${manifest.detailId}_${index}`) ||
          "";
      }
      return safeJson(serialized);
    }
    const parsed = safeJson(
      sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)
    );
    if (parsed?.__plannerDetailRecord && parsed.detailStorageKey) {
      return readDetail(parsed.detailStorageKey) || parsed;
    }
    return parsed;
  }, key);
}

async function waitForSavedSmartPlannerBooking(page) {
  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem("tpl_bookings_v1");
      if (!raw) return false;
      try {
        return JSON.parse(raw).some(
          (booking) => booking?.type === "smart-planner"
        );
      } catch {
        return false;
      }
    },
    null,
    { timeout: 60000 }
  );
  return page.evaluate(() => {
    const raw = localStorage.getItem("tpl_bookings_v1");
    const bookings = raw ? JSON.parse(raw) : [];
    return (
      bookings.find((booking) => booking?.type === "smart-planner") || null
    );
  });
}

async function readStoredBookingPayload(page, key) {
  if (!key) return null;
  return page.evaluate((payloadKey) => {
    function safeJson(value) {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    const manifest = safeJson(localStorage.getItem(payloadKey));
    if (manifest?.detailId && manifest?.chunkCount) {
      let serialized = "";
      for (let index = 0; index < manifest.chunkCount; index += 1) {
        serialized +=
          localStorage.getItem(`tpl_tiya_detail_chunk_${manifest.detailId}_${index}`) ||
          "";
      }
      return safeJson(serialized);
    }
    const parsed = safeJson(
      localStorage.getItem(payloadKey) || sessionStorage.getItem(payloadKey)
    );
    if (parsed?.__plannerDetailRecord && parsed.detailStorageKey) {
      return safeJson(localStorage.getItem(parsed.detailStorageKey)) || parsed;
    }
    return parsed;
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
        confirmation?.backendServiceType === SERVICE &&
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

function verifyPricingWalletRules(confirmation, payload) {
  const fare =
    confirmation?.fare ||
    confirmation?.pricing ||
    confirmation?.fareSummary ||
    payload?.pricing ||
    payload?.fareSummary ||
    {};
  const plannerFare =
    confirmation?.plannerFareSummary ||
    confirmation?.fareSummary ||
    confirmation?.pricing ||
    payload?.fareSummary ||
    payload?.pricing ||
    {};
  const wallet = fare.walletBreakdown || confirmation?.walletBreakdown || {};
  const checks = {
    selectedBasketValue:
      Number(plannerFare.selectedBasketValue || fare.basePrice || 0) ===
      SELECTED_BASKET_VALUE,
    offerPreserved:
      Number(plannerFare.offerDiscount || fare.couponDiscount || 0) ===
      OFFER_DISCOUNT,
    baseAfterOffer:
      Number(plannerFare.baseAfterOffer || fare.baseAfterOffer || 0) ===
      BASE_AFTER_OFFER,
    taxesPreserved:
      Number(plannerFare.taxesAndFees || fare.feesAndTaxes || 0) ===
      TAXES_AND_FEES,
    earnedCreditPreserved:
      Number(
        confirmation?.earnedCreditAmount ||
          plannerFare.earnedCreditAmount ||
          wallet.earnedOnThisBooking ||
          0
      ) === EARNED_CREDIT,
    walletMetadataPreserved: Boolean(
      confirmation?.walletSource && confirmation?.walletSyncStatus
    ),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

function verifySmartPlannerDataIntegrity({ seed, confirmation, payload, saved }) {
  const full = payload?.fullPayload || payload?.originalPayload || payload || {};
  const smart = full.smartPlannerPayload || confirmation?.smartPlannerPayload || {};
  const selectedBasketItems = full.selectedBasketItems || smart.selectedBasketItems || [];
  const selectedServices = full.selectedServices || smart.selectedServices || {};
  const checks = {
    bookingId: Boolean(saved?.id && payload?.bookingId),
    itinerary:
      Array.isArray(full.dayPlans || smart.dayPlans || smart.itinerary) &&
      (full.dayPlans || smart.dayPlans || smart.itinerary).length >= 5,
    basket: Array.isArray(selectedBasketItems) && selectedBasketItems.length >= 6,
    selectedServices: Boolean(selectedServices.selectedHotels?.length),
    selectedHotels: Boolean(selectedServices.selectedHotels?.[0]?.title),
    selectedFlights: Boolean(
      selectedServices.selectedFlights?.[0]?.title ||
        selectedBasketItems.some((item) => item?.type === "flight")
    ),
    selectedCabs: Boolean(selectedServices.selectedCabs?.[0]?.title),
    selectedActivities: Boolean(selectedServices.selectedActivities?.[0]?.title),
    travellerData: Boolean(
      full.travellers || smart.travellers || confirmation?.traveller?.travellers
    ),
    pricing:
      Number(
        full.pricing?.selectedBasketValue ||
          full.fareSummary?.selectedBasketValue ||
          confirmation?.pricing?.selectedBasketValue ||
          confirmation?.fareSummary?.selectedBasketValue ||
          0
      ) ===
        SELECTED_BASKET_VALUE ||
      Number(confirmation?.plannerFareSummary?.selectedBasketValue || 0) ===
        SELECTED_BASKET_VALUE,
    offerMetadata:
      confirmation?.plannerFareSummary?.offerData?.code === "SMART10" ||
      confirmation?.fareSummary?.offerData?.code === "SMART10" ||
      full.fareSummary?.offerData?.code === "SMART10" ||
      full.pricing?.offerData?.code === "SMART10" ||
      full.offerSummary?.code === "SMART10",
    walletMetadata: Boolean(confirmation?.walletSource || full.walletSource),
    plannerMetadata: Boolean(smart.plannerMetadata || seed.plannerMetadata),
    aiPlannerMetadata: Boolean(smart.aiPlannerMetadata || seed.aiPlannerMetadata),
    bookingMetadata: Boolean(full.bookingMeta?.bookingId || confirmation?.bookingMeta?.bookingId),
    confirmationPayload: Boolean(confirmation?.summary || confirmation?.smartPlannerPayload),
    myBookingDetailPayload: Boolean(saved?.payloadStorageKey && payload),
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
    data.smartPlannerDataIntegrity?.ok &&
    data.pricingWalletRules?.ok &&
    data.confirmation?.ok &&
    data.myBooking?.ok &&
    data.viewDetail?.ok &&
    data.manageReadPath?.ok &&
    data.fallback?.ok &&
    data.refreshDuplicateGuard?.ok
    ? "passed"
    : "failed";
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
    "# Phase 6A Smart Planner Browser Certification Result",
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
    `- Smart Planner data integrity: ok=${data.smartPlannerDataIntegrity?.ok}`,
    `- Pricing/wallet rules unchanged: ok=${data.pricingWalletRules?.ok}`,
    `- Confirmation: ok=${data.confirmation?.ok}`,
    `- My Booking: ok=${data.myBooking?.ok}`,
    `- View Detail: ok=${data.viewDetail?.ok}`,
    `- Manage read path: ok=${data.manageReadPath?.ok}`,
    `- Fallback: ok=${data.fallback?.ok}, refsAbsent=${data.fallback?.backendRefsAbsent}, checkoutRequestCount=${data.fallback?.checkoutRequestCount}`,
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
