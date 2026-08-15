#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const SERVICES = ["hotel", "homestay", "insurance", "visa", "bus"];
const MANAGED_PROCESSES = [];

const SERVICE_CONFIG = {
  hotel: {
    paymentUrl: "/hotels/payment",
    storageKey: "tplHotelBookingData",
    confirmationKeys: ["hotelConfirmationData", "hotelPaymentSuccessData"],
    methodTestId: "hotel-payment-method-upi",
    payTestId: "hotel-payment-pay-button",
    confirmationPath: "/hotels/confirmation",
    managePath: (id) => `/hotels/manage?bookingId=${encodeURIComponent(id)}`,
  },
  homestay: {
    paymentUrl: "/homestays/payment",
    storageKey: "tplHomestayBookingData",
    confirmationKeys: ["homestayConfirmationData", "homestayPaymentSuccessData"],
    methodTestId: "homestay-payment-method-upi",
    payTestId: "homestay-payment-pay-button",
    confirmationPath: "/homestays/confirmation",
    managePath: (id) => `/homestays/manage?bookingId=${encodeURIComponent(id)}`,
  },
  insurance: {
    paymentUrl: "/insurance/payment",
    storageKey: "tplInsuranceBookingData",
    confirmationKeys: ["tplInsuranceConfirmationData", "insurancePaymentSuccessData"],
    methodTestId: "insurance-payment-method-upi",
    payTestId: "insurance-payment-pay-button",
    confirmationPath: "/insurance/confirmation",
    managePath: (id) => `/insurance/manage?bookingId=${encodeURIComponent(id)}`,
  },
  visa: {
    paymentUrl: "/visa/payment",
    storageKey: "tplVisaBookingData",
    confirmationKeys: ["tplVisaConfirmationData", "visaPaymentSuccessData"],
    methodTestId: "visa-payment-method-upi",
    payTestId: "visa-payment-pay-button",
    confirmationPath: "/visa/confirmation",
    managePath: (id) => `/visa/status?applicationId=${encodeURIComponent(id)}`,
  },
  bus: {
    paymentUrl: "/bus/payment",
    storageKey: "tplBusPaymentData",
    confirmationKeys: ["busConfirmationData", "busPaymentSuccessData", "tplBusPaymentConfirmedData"],
    methodTestId: "bus-payment-method-upi",
    payTestId: "bus-payment-pay-button",
    confirmationPath: "/bus/confirmation",
    managePath: (id) => `/bus/manage?bookingId=${encodeURIComponent(id)}`,
  },
};

const REQUIRED_FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_CHECKOUT: "true",
  NEXT_PUBLIC_TPL_BACKEND_CHECKOUT_SERVICES: "hotel,homestay,insurance,visa,bus",
  NEXT_PUBLIC_TPL_BACKEND_FALLBACK_TO_LOCAL: "true",
  NEXT_PUBLIC_TPL_DEBUG_BACKEND_PAYLOADS: "false",
  NEXT_PUBLIC_TPL_API_BASE_URL: BACKEND_URL,
};

const startedAt = new Date().toISOString();
const result = {
  startedAt,
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL,
  flags: REQUIRED_FLAGS,
  runner: null,
  health: null,
  services: [],
  fallback: null,
  screenshots: [],
  serverDetection: {
    backendStarted: false,
    frontendStarted: false,
    backendReady: false,
    frontendReady: false,
  },
  safety: {
    supplierApisCalled: false,
    livePaymentGatewayUsed: false,
    fallbackRemoved: false,
  },
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await ensureLocalServers();
  result.health = await readHealth();

  const auth = await authenticate();
  const browser = await createBrowser();
  result.runner = browser.kind;

  try {
    for (const service of SERVICES) {
      console.log(`Running ${service} browser smoke...`);
      try {
        result.services.push(await withTimeout(runService(browser, service, auth), 90000, `${service} browser smoke timed out.`));
      } catch (error) {
        result.services.push({
          service,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    console.log("Running fallback browser smoke...");
    try {
      result.fallback = await withTimeout(runFallback(browser, auth), 90000, "Fallback browser smoke timed out.");
    } catch (error) {
      result.fallback = {
        service: "bus",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  } finally {
    await browser.close();
  }

  await writeArtifacts();
  const failed = result.services.some((item) => item.status !== "passed") || result.fallback?.status !== "passed";
  process.exitCode = failed ? 1 : 0;
  stopManagedProcesses();
}

async function readHealth() {
  const response = await fetchJsonWithTimeout(`${BACKEND_URL}/api/v1/health`, {}, 15000, "backend health");
  const body = await response.json();
  return {
    httpStatus: response.status,
    ok: Boolean(body?.ok),
    status: body?.data?.status,
    databaseOk: Boolean(body?.data?.checks?.database?.ok),
  };
}

async function ensureLocalServers() {
  result.serverDetection.backendReady = await canFetch(`${BACKEND_URL}/api/v1/health`, 5000);
  if (!result.serverDetection.backendReady && isLoopbackUrl(BACKEND_URL)) {
    startManagedProcess("backend", process.execPath, [path.resolve("tpl-api/dist/server.js")], path.resolve("tpl-api"), {
      ...process.env,
    });
    result.serverDetection.backendStarted = true;
  }
  result.serverDetection.backendReady = await waitForFetch(`${BACKEND_URL}/api/v1/health`, 60000, "backend health");

  result.serverDetection.frontendReady = await canFetch(FRONTEND_URL, 5000);
  if (!result.serverDetection.frontendReady && isLoopbackUrl(FRONTEND_URL)) {
    const frontendUrl = new URL(FRONTEND_URL);
    startManagedProcess("frontend", process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "dev", "--hostname", frontendUrl.hostname, "--port", frontendUrl.port || "3000"], process.cwd(), {
      ...process.env,
      ...REQUIRED_FLAGS,
    });
    result.serverDetection.frontendStarted = true;
  }
  result.serverDetection.frontendReady = await waitForFetch(FRONTEND_URL, 120000, "frontend");
}

function startManagedProcess(name, command, args, cwd, env) {
  const out = path.join(OUT_DIR, `${name}.out.log`);
  const err = path.join(OUT_DIR, `${name}.err.log`);
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.stdout.on("data", (chunk) => appendProcessLog(out, chunk));
  child.stderr.on("data", (chunk) => appendProcessLog(err, chunk));
  MANAGED_PROCESSES.push(child);
}

async function appendProcessLog(file, chunk) {
  await writeFile(file, chunk, { flag: "a" }).catch(() => {});
}

function stopManagedProcesses() {
  for (const child of MANAGED_PROCESSES) {
    if (!child.killed) child.kill();
  }
}

function isLoopbackUrl(value) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

async function waitForFetch(url, timeoutMs, label) {
  const started = Date.now();
  let lastError = "";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchJsonWithTimeout(url, {}, 5000, label);
      if (response.ok) return true;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(1000);
  }
  throw new Error(`${label} was not reachable at ${url}: ${lastError || "timed out"}`);
}

async function canFetch(url, timeoutMs) {
  try {
    const response = await fetchJsonWithTimeout(url, {}, timeoutMs, url);
    return response.ok;
  } catch {
    return false;
  }
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

async function authenticate() {
  const mobile = `96666${Math.floor(10000 + Math.random() * 89999)}`;
  const send = await postJson("/api/v1/auth/send-otp", { mobile });
  const otp = send?.data?.developmentOtp;
  if (!otp) throw new Error("Development OTP was not returned by local backend.");
  const verify = await postJson("/api/v1/auth/verify-otp", { mobile, otp });
  const token = verify?.data?.session?.token;
  if (!token) throw new Error("Auth token was not returned by local backend.");
  return {
    mobile,
    token,
    user: verify.data.user,
    session: verify.data.session,
  };
}

async function postJson(pathname, body, token) {
  const response = await fetch(`${BACKEND_URL}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${pathname} failed with HTTP ${response.status}: ${payload?.error?.code || "UNKNOWN"}`);
  }
  return payload;
}

async function runService(browser, service, auth) {
  const config = SERVICE_CONFIG[service];
  const bookingId = `TPL-${service.toUpperCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 8999)}`;
  const serviceResult = {
    service,
    status: "failed",
    bookingId,
    paymentPage: false,
    paymentSelected: false,
    backendStartStatus: null,
    backendConfirmStatus: null,
    backendRefs: {},
    confirmation: false,
    myBooking: false,
    viewDetail: false,
    manageStatus: false,
    savedBookingId: null,
    walletGuard: {},
    duplicateSideEffect: {},
    error: null,
    screenshot: null,
  };

  const page = await browser.newPage();
  const network = [];
  await page.enableNetwork((entry) => network.push(entry));

  try {
    await seedPage(page, auth, config.storageKey, buildPayload(service, bookingId, auth.mobile));
    await page.goto(`${FRONTEND_URL}${config.paymentUrl}`);
    await page.waitForSelector(`[data-testid="${config.methodTestId}"]`, 30000);
    serviceResult.paymentPage = true;
    await page.click(`[data-testid="${config.methodTestId}"]`);
    await page.waitForExpression(`document.querySelector('[data-testid="${config.methodTestId}"]')?.getAttribute('data-selected') === 'true'`, 10000);
    serviceResult.paymentSelected = true;
    await page.waitForSelector(`[data-testid="${config.payTestId}"]`, 30000);
    await page.click(`[data-testid="${config.payTestId}"]`);
    await page.waitForExpression(`location.pathname.includes('${config.confirmationPath}')`, 45000);

    const confirmation = await page.evaluate((keys) => {
      for (const key of keys) {
        const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      }
      return null;
    }, config.confirmationKeys);

    serviceResult.confirmation = Boolean(confirmation);
    serviceResult.backendRefs = readBackendRefs(confirmation);
    serviceResult.walletGuard = {
      walletSource: confirmation?.walletSource || confirmation?.metadata?.walletSource || null,
      walletSyncStatus: confirmation?.walletSyncStatus || confirmation?.metadata?.walletSyncStatus || null,
      walletInsufficient: network.some((entry) => entry.body?.includes("WALLET_INSUFFICIENT_BALANCE")),
    };

    serviceResult.backendStartStatus = findStatus(network, `/api/v1/services/${service}/checkout/start`);
    serviceResult.backendConfirmStatus = findStatus(network, `/api/v1/services/${service}/checkout/`, "/confirm");
    await page.waitForExpression(`(() => {
      const raw = localStorage.getItem('tpl_bookings_v1');
      if (!raw) return false;
      try {
        return JSON.parse(raw).some((booking) => booking?.type === '${service}');
      } catch {
        return false;
      }
    })()`, 30000);
    const savedBooking = await page.evaluate((currentService) => {
      const raw = localStorage.getItem("tpl_bookings_v1");
      const bookings = raw ? JSON.parse(raw) : [];
      return bookings.find((booking) => booking?.type === currentService) || null;
    }, service);
    serviceResult.savedBookingId = savedBooking?.id || null;
    const accountBookingId = serviceResult.savedBookingId || bookingId;

    await page.goto(`${FRONTEND_URL}/account/bookings`);
    await page.waitForExpression(`document.body.innerText.includes('${accountBookingId}')`, 20000);
    serviceResult.myBooking = true;

    await page.goto(`${FRONTEND_URL}/account/bookings/${service}/${encodeURIComponent(accountBookingId)}`);
    await page.waitForExpression(`document.body.innerText.length > 100`, 15000);
    serviceResult.viewDetail = await page.evaluate(() => document.body.innerText.length > 100);

    await page.goto(`${FRONTEND_URL}${config.managePath(accountBookingId)}`);
    await page.waitForExpression(`document.body.innerText.length > 100`, 15000);
    serviceResult.manageStatus = true;

    const startCount = network.filter((entry) => entry.method === "POST" && entry.url.includes(`/api/v1/services/${service}/checkout/start`)).length;
    const confirmCount = network.filter((entry) => entry.method === "POST" && entry.url.includes(`/api/v1/services/${service}/checkout/`) && entry.url.includes("/confirm")).length;
    serviceResult.duplicateSideEffect = {
      startPostCount: startCount,
      confirmPostCount: confirmCount,
      duplicateStart: startCount > 1,
      duplicateConfirm: confirmCount > 1,
    };

    serviceResult.status =
      serviceResult.paymentPage &&
      serviceResult.paymentSelected &&
      serviceResult.backendStartStatus === 201 &&
      serviceResult.backendConfirmStatus === 200 &&
      serviceResult.confirmation &&
      serviceResult.myBooking &&
      serviceResult.viewDetail &&
      serviceResult.manageStatus &&
      !serviceResult.walletGuard.walletInsufficient &&
      !serviceResult.duplicateSideEffect.duplicateStart &&
      !serviceResult.duplicateSideEffect.duplicateConfirm
        ? "passed"
        : "failed";
  } catch (error) {
    serviceResult.error = error instanceof Error ? error.message : String(error);
    serviceResult.screenshot = await captureFailure(page, `${service}-failure`);
  } finally {
    await page.close();
  }

  return serviceResult;
}

async function runFallback(browser, auth) {
  const service = "bus";
  const config = SERVICE_CONFIG[service];
  const bookingId = `TPL-BUS-FALLBACK-${Date.now()}`;
  const fallback = {
    service,
    status: "failed",
    confirmation: false,
    myBooking: false,
    backendRefsAbsent: false,
    savedBookingId: null,
    error: null,
    screenshot: null,
  };
  const page = await browser.newPage();

  try {
    await seedPage(page, auth, config.storageKey, buildPayload(service, bookingId, auth.mobile));
    await page.goto(`${FRONTEND_URL}${config.paymentUrl}`);
    await page.waitForSelector(`[data-testid="${config.methodTestId}"]`, 30000);
    await page.click(`[data-testid="${config.methodTestId}"]`);
    await page.waitForSelector(`[data-testid="${config.payTestId}"]`, 30000);
    await page.evaluate(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        if (url.includes("/api/v1/services/bus/checkout")) {
          return Promise.reject(new TypeError("fetch failed"));
        }
        return originalFetch(input, init);
      };
    });
    await page.click(`[data-testid="${config.payTestId}"]`);
    await page.waitForExpression(`location.pathname.includes('${config.confirmationPath}')`, 45000);
    const confirmation = await page.evaluate((keys) => {
      for (const key of keys) {
        const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      }
      return null;
    }, config.confirmationKeys);
    fallback.confirmation = Boolean(confirmation);
    const refs = readBackendRefs(confirmation);
    fallback.backendRefsAbsent = !refs.backendCheckoutId && !refs.backendBookingId && !refs.backendPaymentId;
    await page.setOffline(false);
    await page.waitForExpression(`(() => {
      const raw = localStorage.getItem('tpl_bookings_v1');
      if (!raw) return false;
      try {
        return JSON.parse(raw).some((booking) => booking?.type === 'bus');
      } catch {
        return false;
      }
    })()`, 30000);
    const savedBooking = await page.evaluate(() => {
      const raw = localStorage.getItem("tpl_bookings_v1");
      const bookings = raw ? JSON.parse(raw) : [];
      return bookings.find((booking) => booking?.type === "bus") || null;
    });
    fallback.savedBookingId = savedBooking?.id || null;
    await page.goto(`${FRONTEND_URL}/account/bookings`);
    await page.waitForExpression(`document.body.innerText.includes('${fallback.savedBookingId || bookingId}')`, 20000);
    fallback.myBooking = true;
    fallback.status = fallback.confirmation && fallback.myBooking && fallback.backendRefsAbsent ? "passed" : "failed";
  } catch (error) {
    fallback.error = error instanceof Error ? error.message : String(error);
    fallback.screenshot = await captureFailure(page, "fallback-failure");
  } finally {
    await page.setOffline(false).catch(() => {});
    await page.close();
  }

  return fallback;
}

async function seedPage(page, auth, storageKey, payload) {
  await page.goto(FRONTEND_URL);
  await page.evaluate(
    ({ authRecord, storageKey: key, payload: value }) => {
      localStorage.setItem("tpl_auth_session_v1", JSON.stringify(authRecord));
      sessionStorage.setItem(key, JSON.stringify(value));
      localStorage.setItem(key, JSON.stringify(value));
    },
    {
      authRecord: { user: auth.user, session: auth.session },
      storageKey,
      payload,
    }
  );
}

function buildPayload(service, bookingId, mobile) {
  const base = {
    id: bookingId,
    bookingId,
    legacyFrontendId: bookingId,
    serviceType: service,
    selectedPaymentMethod: "upi",
    paymentMethod: "upi",
    paymentStatus: "paid",
    paymentState: "success",
    timerLeft: 600,
    timestamp: Date.now(),
    traveller: { name: "Phase 3D Tester", mobile, email: "phase3d@example.com" },
    guestValidation: {
      isValid: true,
      contactDetails: { mobile, email: "phase3d@example.com", countryCode: "+91" },
      travellers: [{ name: "Phase 3D Tester", firstName: "Phase", lastName: "Tester", phone: mobile, email: "phase3d@example.com" }],
    },
    walletBreakdown: { promoUsed: 99999, earnedUsed: 99999, refundUsed: 99999, totalWalletUsed: 299997 },
    fareBreakup: { baseAmount: 1800, taxes: 180, totalAmount: 1980, walletBreakdown: { promoUsed: 99999, earnedUsed: 99999, refundUsed: 99999 } },
    pricing: { baseAmount: 1800, taxes: 180, totalAmount: 1980, walletBreakdown: { promoUsed: 99999, earnedUsed: 99999, refundUsed: 99999 } },
    finalTotal: 1980,
    appliedOffer: 0,
  };

  if (service === "hotel") {
    return {
      ...base,
      hotel: { id: "hotel-phase3d", name: "Phase 3D Hotel", city: "Jaipur", pricePerNight: 1800, taxes: 180 },
      selectedVariant: { id: "room-phase3d", name: "Deluxe Room", price: 1800, taxes: 180 },
      selectedRoom: { id: "room-phase3d", name: "Deluxe Room", price: 1800, taxes: 180 },
      searchMeta: { city: "Jaipur", checkIn: "2026-07-10", checkOut: "2026-07-11", rooms: 1, adults: 1, children: 0, nights: 1 },
      fareBreakup: { ...base.fareBreakup, roomPrice: 1800, rooms: 1, nights: 1, subtotal: 1800, taxes: 180, finalPayable: 1980 },
    };
  }
  if (service === "homestay") {
    return {
      ...base,
      homestay: { id: "homestay-phase3d", name: "Phase 3D Homestay", city: "Udaipur", pricePerNight: 1800, taxes: 180 },
      selectedVariant: { id: "stay-phase3d", name: "Lake Suite", price: 1800, taxes: 180 },
      searchMeta: { city: "Udaipur", checkIn: "2026-07-10", checkOut: "2026-07-11", rooms: 1, adults: 1, children: 0, nights: 1 },
      fareBreakup: { ...base.fareBreakup, stayPrice: 1800, rooms: 1, nights: 1, subtotal: 1800, taxes: 180, finalPayable: 1980 },
    };
  }
  if (service === "insurance") {
    return {
      ...base,
      user: { mobile, email: "phase3d@example.com" },
      plan: { id: "insurance-phase3d", name: "Phase 3D Cover", planName: "Phase 3D Cover", provider: "Insurance Provider", premium: 1800 },
      planName: "Phase 3D Cover",
      provider: "Insurance Provider",
      destination: "UAE",
      startDate: "2026-07-10",
      endDate: "2026-07-15",
      travellers: [{ name: "Phase 3D Tester", firstName: "Phase", lastName: "Tester", mobile, email: "phase3d@example.com" }],
      leadTraveller: { name: "Phase 3D Tester", firstName: "Phase", lastName: "Tester", mobile, email: "phase3d@example.com" },
    };
  }
  if (service === "visa") {
    return {
      ...base,
      option: {
        id: "visa-phase3d",
        country: "UAE",
        visaType: "Tourist",
        title: "UAE Tourist Visa",
        embassyFee: 1800,
        pricingSnapshot: { baseVisaAmount: 1800, taxes: 180, grossTotal: 1980, finalPayable: 1980, travellers: 1 },
      },
      visa: { country: "UAE", visaType: "Tourist", fee: 1800 },
      searchData: { country: "UAE", visaType: "Tourist", travelDate: "2026-07-10" },
      applicants: [{ name: "Phase 3D Tester", mobile, email: "phase3d@example.com" }],
      passports: [{ fullName: "Phase 3D Tester", passportNumber: "Z1234567" }],
      fareBreakup: { ...base.fareBreakup, baseVisaAmount: 1800, grossTotal: 1980, finalPayable: 1980, travellers: 1 },
    };
  }
  return {
    ...base,
    bookingPayload: {
      search: { fromCity: "Jaipur", fromPoint: "Sindhi Camp", toCity: "Delhi", toPoint: "Kashmere Gate", date: "2026-07-10" },
      bus: { name: "Phase 3D Travels", operatorName: "Phase 3D Travels", busType: "AC Seater", departureTime: "09:00", arrivalTime: "14:00", duration: "5h" },
      selectedSeats: [{ seatNumber: "A1", price: 1800 }],
      selectedBoardingPoint: { id: "boarding-phase3d", name: "Sindhi Camp", address: "Jaipur", time: "09:00" },
      selectedDroppingPoint: { id: "dropping-phase3d", name: "Kashmere Gate", address: "Delhi", time: "14:00" },
      totalFare: 1980,
      travellerCount: 1,
    },
    travellers: [{ fullName: "Phase 3D Tester", age: "30", gender: "Male", seatNumber: "A1" }],
    contactDetails: { email: "phase3d@example.com", mobile, hasGst: false, state: "Rajasthan", saveBilling: false },
    addons: { tripAssuredSelected: false, tripAssuredTotal: 0, freeCancellationSelected: false, freeCancellationTotal: 0 },
    pricing: { baseFare: 1800, taxAndSurcharge: 180, discount: 0, offerApplied: 0, tplCredit: 0, tripAssuredTotal: 0, freeCancellationTotal: 0, finalTotal: 1980 },
    bus: { operator: "Phase 3D Travels", from: "Jaipur", to: "Delhi", fare: 1800 },
    passengers: [{ name: "Phase 3D Tester", mobile, seat: "A1" }],
    selectedSeats: [{ seatNumber: "A1", price: 1800 }],
  };
}

function readBackendRefs(value) {
  return {
    backendCheckoutId: Boolean(value?.backendCheckoutId),
    backendBookingId: Boolean(value?.backendBookingId),
    backendPaymentId: Boolean(value?.backendPaymentId),
    backendRequestId: Boolean(value?.backendRequestId),
    backendServiceType: value?.backendServiceType || null,
    backendCheckoutStatus: value?.backendCheckoutStatus || null,
  };
}

function findStatus(network, includesA, includesB = "") {
  const match = [...network].reverse().find((entry) => entry.url.includes(includesA) && (!includesB || entry.url.includes(includesB)));
  return match?.status || null;
}

function storageProbeExpression(keys) {
  return keys.map((key) => `sessionStorage.getItem('${key}') || localStorage.getItem('${key}')`).join(" || ");
}

async function captureFailure(page, name) {
  try {
    const file = path.join(OUT_DIR, `${Date.now()}-${name}.png`);
    await page.screenshot(file);
    result.screenshots.push(file);
    return file;
  } catch {
    return null;
  }
}

async function writeArtifacts() {
  const finishedAt = new Date().toISOString();
  result.finishedAt = finishedAt;
  const jsonPath = path.join(OUT_DIR, "first-batch-browser-smoke-result.json");
  const mdPath = path.join(OUT_DIR, "first-batch-browser-smoke-report.md");
  await writeFile(jsonPath, JSON.stringify(result, null, 2));
  await writeFile(mdPath, renderMarkdown(result));
  console.log(`JSON result: ${jsonPath}`);
  console.log(`Markdown report: ${mdPath}`);
}

function renderMarkdown(data) {
  const lines = [
    "# First Batch Browser Smoke Report",
    "",
    `Started: ${data.startedAt}`,
    `Finished: ${data.finishedAt || ""}`,
    `Runner: ${data.runner || "unavailable"}`,
    "",
    "## Health",
    "",
    `- HTTP: ${data.health?.httpStatus}`,
    `- API ok: ${data.health?.ok}`,
    `- Database ok: ${data.health?.databaseOk}`,
    "",
    "## Services",
    "",
    "| Service | Status | Start | Confirm | Confirmation | My Booking | Detail | Manage/Status |",
    "| --- | --- | ---: | ---: | --- | --- | --- | --- |",
    ...data.services.map((item) => `| ${item.service} | ${item.status} | ${item.backendStartStatus ?? ""} | ${item.backendConfirmStatus ?? ""} | ${item.confirmation} | ${item.myBooking} | ${item.viewDetail} | ${item.manageStatus} |`),
    "",
    "## Fallback",
    "",
    `- Service: ${data.fallback?.service || ""}`,
    `- Status: ${data.fallback?.status || ""}`,
    `- Confirmation: ${data.fallback?.confirmation ?? ""}`,
    `- My Booking: ${data.fallback?.myBooking ?? ""}`,
    `- Backend refs absent: ${data.fallback?.backendRefsAbsent ?? ""}`,
    "",
    "## Safety",
    "",
    "- No supplier APIs are invoked by this script.",
    "- No live payment gateway is enabled by this script.",
    "- Fallback storage paths are not removed.",
  ];
  return `${lines.join("\n")}\n`;
}

async function createBrowser() {
  const playwright = await tryCreatePlaywrightBrowser();
  if (playwright) return playwright;
  return createCdpBrowser();
}

async function tryCreatePlaywrightBrowser() {
  try {
    const mod = await import("playwright");
    const browser = await mod.chromium.launch({ headless: true });
    return {
      kind: "playwright",
      async newPage() {
        const page = await browser.newPage();
        return new PlaywrightPage(page);
      },
      close: () => browser.close(),
    };
  } catch {
    return null;
  }
}

async function createCdpBrowser() {
  const executable = findBrowserExecutable();
  if (!executable) {
    throw new Error("No Playwright install and no Chrome/Edge executable found for CDP fallback.");
  }
  if (typeof WebSocket !== "function") {
    throw new Error("Node WebSocket is unavailable; install Playwright or use Node with WebSocket support.");
  }
  const port = 9222 + Math.floor(Math.random() * 1000);
  const userDataDir = path.join(tmpdir(), `tpl-phase3d-browser-${Date.now()}`);
  const child = spawn(executable, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ], { stdio: "ignore", detached: false });

  await waitForCdp(port);
  return {
    kind: `cdp:${path.basename(executable)}`,
    async newPage() {
      const target = await createCdpPageTarget(port);
      const client = await CdpClient.connect(target.webSocketDebuggerUrl);
      return new CdpPage(client);
    },
    async close() {
      child.kill();
    },
  };
}

async function createCdpPageTarget(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error(`Unable to create Chrome page target: HTTP ${response.status}`);
  return response.json();
}

function findBrowserExecutable() {
  const candidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      ]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

async function waitForCdp(port) {
  const url = `http://127.0.0.1:${port}/json/version`;
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await delay(250);
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint.");
}

class PlaywrightPage {
  constructor(page) {
    this.page = page;
    this.network = null;
  }
  async enableNetwork(callback) {
    this.network = callback;
    this.page.on("response", async (response) => {
      callback({ method: response.request().method(), url: response.url(), status: response.status(), body: "" });
    });
  }
  goto(url) { return this.page.goto(url, { waitUntil: "domcontentloaded" }); }
  waitForSelector(selector, timeout) { return this.page.waitForSelector(selector, { timeout }); }
  waitForExpression(expression, timeout) { return this.page.waitForFunction(expression, null, { timeout }); }
  click(selector) { return this.page.click(selector); }
  evaluate(fn, arg) { return this.page.evaluate(fn, arg); }
  screenshot(file) { return this.page.screenshot({ path: file, fullPage: true }); }
  async setOffline(value) { await this.page.context().setOffline(value); }
  close() { return this.page.close(); }
}

class CdpPage {
  constructor(client) {
    this.client = client;
    this.networkCallback = null;
    this.requestMethods = new Map();
    client.onMessage((message) => {
      if (message.method === "Network.requestWillBeSent") {
        this.requestMethods.set(message.params.requestId, message.params.request.method);
      }
      if (message.method === "Network.responseReceived" && this.networkCallback) {
        this.networkCallback({
          method: this.requestMethods.get(message.params.requestId) || "",
          url: message.params.response.url,
          status: message.params.response.status,
          body: "",
        });
      }
    });
  }
  async enableNetwork(callback) {
    this.networkCallback = callback;
    await this.client.send("Network.enable").catch(() => {});
  }
  async goto(url) {
    await this.client.send("Page.navigate", { url });
    await delay(1000);
  }
  async waitForSelector(selector, timeout) {
    await this.waitForExpression(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, timeout);
  }
  async waitForExpression(expression, timeout) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const value = await this.evaluate(`(() => { try { return Boolean(${expression}); } catch { return false; } })()`);
      if (value) return;
      await delay(250);
    }
    throw new Error(`Timed out waiting for expression: ${expression}`);
  }
  async click(selector) {
    const clicked = await this.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; })()`);
    if (!clicked) throw new Error(`Selector not found for click: ${selector}`);
    await delay(500);
  }
  async evaluate(fnOrExpression, arg) {
    const expression = typeof fnOrExpression === "function"
      ? `(${fnOrExpression.toString()})(${JSON.stringify(arg)})`
      : fnOrExpression;
    const response = await this.client.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text || "Browser evaluation failed.");
    }
    return response.result?.value;
  }
  async screenshot(file) {
    const response = await this.client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    await writeFile(file, Buffer.from(response.data, "base64"));
  }
  async setOffline(value) {
    await this.client.send("Network.emulateNetworkConditions", {
      offline: value,
      latency: 0,
      downloadThroughput: value ? 0 : -1,
      uploadThroughput: value ? 0 : -1,
    });
  }
  async close() {
    await this.client.send("Page.close").catch(() => {});
    await this.client.close();
  }
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = [];
    socket.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
  }
  static connect(url) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      const timeout = setTimeout(() => {
        try {
          socket.close();
        } catch {}
        reject(new Error("Timed out connecting to Chrome DevTools WebSocket."));
      }, 10000);
      socket.onopen = () => {
        clearTimeout(timeout);
        resolve(new CdpClient(socket));
      };
      socket.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to connect to Chrome DevTools WebSocket."));
      };
    });
  }
  onMessage(listener) {
    this.listeners.push(listener);
  }
  handleMessage(message) {
    for (const listener of this.listeners) listener(message);
    if (!message.id) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result || {});
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params, ...(sessionId ? { sessionId } : {}) };
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 15000);
      this.pending.set(id, { resolve, reject });
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify(payload));
    });
  }
  async close() {
    this.socket.close();
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, message) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

const keepAlive = setInterval(() => {}, 1000);

main().catch(async (error) => {
  result.error = error instanceof Error ? error.message : String(error);
  await mkdir(OUT_DIR, { recursive: true });
  await writeArtifacts();
  console.error(result.error);
  process.exitCode = 1;
}).finally(() => {
  stopManagedProcesses();
  clearInterval(keepAlive);
});
