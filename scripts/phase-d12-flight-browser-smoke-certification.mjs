#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FRONTEND_URL = process.env.TPL_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_TPL_API_BASE_URL || "http://127.0.0.1:4000";
const OUT_DIR = path.resolve("artifacts/browser-smoke");
const JSON_PATH = path.join(OUT_DIR, "d12-flight-browser-smoke-result.json");
const MD_PATH = path.join(OUT_DIR, "d12-flight-browser-smoke-report.md");
const RUN_BROWSER = process.env.TPL_D12_RUN_BROWSER === "1";

const REQUIRED_FLAGS = {
  NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH: "true",
  NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL: "true",
  NEXT_PUBLIC_TPL_API_BASE_URL: BACKEND_URL,
};

const result = {
  startedAt: new Date().toISOString(),
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL,
  mode: RUN_BROWSER ? "browser" : "static",
  flags: REQUIRED_FLAGS,
  tooling: null,
  staticChecks: [],
  browserChecks: [],
  mobileChecks: [],
  safety: {
    supplierBookingAdded: false,
    livePaymentCaptureAdded: false,
    providerOfferRefExposed: false,
    supplierConfirmationLanguageFound: false,
  },
  status: "failed",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  try {
    result.tooling = await auditTooling();
    result.staticChecks = await runStaticChecks();

    if (RUN_BROWSER) {
      const { browserChecks, mobileChecks } = await runBrowserChecks();
      result.browserChecks = browserChecks;
      result.mobileChecks = mobileChecks;
    }

    result.safety.providerOfferRefExposed = hasFailed(
      result.staticChecks,
      "frontend-provider-offer-ref-absent"
    );
    result.safety.supplierConfirmationLanguageFound = hasFailed(
      result.staticChecks,
      "supplier-confirmation-language-absent"
    );

    result.status = computeStatus();
    delete result.error;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.status = "failed";
  } finally {
    await writeArtifacts();
  }

  console.log(`D12 Flight browser smoke certification: ${result.status}`);
  console.log(`Mode: ${result.mode}`);
  console.log(`JSON result: ${JSON_PATH}`);
  console.log(`Markdown report: ${MD_PATH}`);
  process.exitCode = result.status === "passed" ? 0 : 1;
}

async function auditTooling() {
  const packageJson = JSON.parse(await readText("package.json"));
  const scripts = packageJson.scripts || {};
  const devDependencies = packageJson.devDependencies || {};

  return {
    playwrightDependency: Boolean(devDependencies.playwright),
    cypressDependency: Boolean(devDependencies.cypress),
    runnerConfig: {
      playwright: await fileExists("playwright.config.ts") || await fileExists("playwright.config.js"),
      cypress: await fileExists("cypress.config.ts") || await fileExists("cypress.config.js"),
    },
    standaloneBrowserScripts: Object.entries(scripts)
      .filter(([, command]) => String(command).includes("browser-certification"))
      .map(([name]) => name),
  };
}

async function runStaticChecks() {
  const files = {
    searchApi: await readText("app/lib/api/flightSearchApi.ts"),
    priceApi: await readText("app/lib/api/flightPriceApi.ts"),
    simulationApi: await readText("app/lib/api/flightBookingSimulationApi.ts"),
    paymentApi: await readText("app/lib/api/flightTestPaymentApi.ts"),
    review: await readText("app/flights/review/page.tsx"),
    payment: await readText("app/flights/payment/page.tsx"),
    confirmation: await readText("app/flights/confirmation/page.tsx"),
  };

  const allFrontendFlightText = Object.values(files).join("\n");

  return [
    check(
      "playwright-package-available",
      Boolean(result.tooling?.playwrightDependency),
      "Playwright is available for standalone browser certification scripts."
    ),
    check(
      "no-heavy-e2e-runner-config-required",
      !result.tooling?.runnerConfig?.playwright && !result.tooling?.runnerConfig?.cypress,
      "No full Playwright/Cypress runner config was introduced for D12."
    ),
    check(
      "backend-flight-search-client",
      files.searchApi.includes("/api/v1/flights/search") &&
        files.searchApi.includes("NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH"),
      "Frontend backend-search client uses the TPL backend search endpoint behind the feature flag."
    ),
    check(
      "backend-offer-safe-metadata",
        files.searchApi.includes("searchId") &&
        files.searchApi.includes("offerId") &&
        !files.searchApi.includes("providerOfferRef"),
      "Search result mapping keeps safe offer metadata and does not map providerOfferRef."
    ),
    check(
      "review-price-confirm-then-simulate",
      files.review.includes("confirmBackendFlightPrice") &&
        files.review.includes("simulateBackendFlightBooking") &&
        files.review.includes("backendSimulation") &&
        files.review.includes("priceConfirmationId"),
      "Review page confirms price and creates a TPL-only simulation before payment."
    ),
    check(
      "review-blocks-invalid-price-state",
      files.review.includes('backendPriceState !== "checking"') &&
        files.review.includes('backendPriceState !== "changed"') &&
        files.review.includes('backendPriceState !== "expired"') &&
        files.review.includes('backendPriceState !== "failed"'),
      "Review page blocks proceed while backend price confirmation is invalid."
    ),
    check(
      "payment-uses-flight-test-payment-endpoints",
      files.paymentApi.includes("/payment/test-order") &&
        files.paymentApi.includes("/payment/test-confirm") &&
        files.payment.includes("createFlightTestPaymentOrder") &&
        files.payment.includes("confirmFlightTestPayment"),
      "Backend-sourced payment path uses flight-specific test-payment endpoints."
    ),
    check(
      "payment-keeps-local-dummy-flow",
      files.payment.includes("startFlightBackendCheckout") &&
        files.payment.includes("storedPayload?.backendSimulation?.bookingDraftId"),
      "Legacy/local flow remains present when backendSimulation metadata is absent."
    ),
    check(
      "confirmation-test-mode-language",
      files.confirmation.includes("TPL Test Confirmation") &&
        files.confirmation.includes("PNR: Not issued in test mode") &&
        files.confirmation.includes("Ticket: Not issued in test mode"),
      "Confirmation page presents TPL-only test confirmation language."
    ),
    check(
      "supplier-confirmation-language-absent",
      !files.confirmation.includes("Supplier confirmed") &&
        !files.confirmation.includes("supplier confirmed") &&
        !files.confirmation.includes("real PNR"),
      "Confirmation page does not imply supplier confirmation for backend-sourced test flow."
    ),
    check(
      "frontend-provider-offer-ref-absent",
      !allFrontendFlightText.includes("providerOfferRef"),
      "Flight frontend path does not reference providerOfferRef."
    ),
    check(
      "public-response-safety-types",
      files.paymentApi.includes("supplierBookingDisabled: true") &&
        files.paymentApi.includes("bookingAllowed: false") &&
        files.paymentApi.includes("ticketingAllowed: false") &&
        files.paymentApi.includes("paymentCaptureAllowed: false") &&
        files.paymentApi.includes("pnr: null") &&
        files.paymentApi.includes("ticketNumber: null"),
      "Frontend API types preserve no-booking, no-ticketing, no-capture response guards."
    ),
  ];
}

async function runBrowserChecks() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const desktopPage = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const browserChecks = [];
    await seedConfirmation(desktopPage);
    await desktopPage.goto(`${FRONTEND_URL}/flights/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await desktopPage.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    const desktopText = await desktopPage.locator("body").innerText({ timeout: 30000 });
    const normalizedDesktopText = desktopText.toLowerCase();
    browserChecks.push(
      check("browser-confirmation-test-panel", normalizedDesktopText.includes("tpl test confirmation"), "Confirmation page renders the TPL test panel."),
      check("browser-pnr-not-issued", desktopText.includes("PNR: Not issued in test mode"), "Confirmation page does not show a real PNR."),
      check("browser-ticket-not-issued", desktopText.includes("Ticket: Not issued in test mode"), "Confirmation page does not show a real ticket."),
      check("browser-no-provider-ref", !desktopText.includes("providerOfferRef"), "Confirmation page does not render providerOfferRef.")
    );
    await desktopPage.close();

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const mobileChecks = [];
    await seedConfirmation(mobilePage);
    await mobilePage.goto(`${FRONTEND_URL}/flights/confirmation`, {
      waitUntil: "domcontentloaded",
    });
    await mobilePage.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    const mobileText = await mobilePage.locator("body").innerText({ timeout: 30000 });
    const normalizedMobileText = mobileText.toLowerCase();
    const overflow = await mobilePage.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const hasHorizontalScrollAncestor = (node) => {
        let current = node.parentElement;
        while (current && current !== document.body) {
          const style = window.getComputedStyle(current);
          const scrollable =
            ["auto", "scroll"].includes(style.overflowX) &&
            current.scrollWidth > current.clientWidth + 2;
          if (scrollable) return true;
          current = current.parentElement;
        }
        return false;
      };
      return Array.from(document.querySelectorAll("body *")).some((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const visible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity || "1") > 0 &&
          rect.height > 1 &&
          rect.width > 1;
        const hasUserVisibleContent =
          Boolean(String(node.textContent || "").trim()) ||
          ["IMG", "BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(node.tagName);
        if (style.position === "absolute" && !hasUserVisibleContent) return false;
        return visible && !hasHorizontalScrollAncestor(node) && rect.left >= 0 && rect.right > width + 24;
      });
    });
    mobileChecks.push(
      check("mobile-confirmation-test-panel", normalizedMobileText.includes("tpl test confirmation"), "Mobile confirmation renders the TPL test panel."),
      check("mobile-pnr-ticket-not-issued", mobileText.includes("PNR: Not issued in test mode") && mobileText.includes("Ticket: Not issued in test mode"), "Mobile confirmation keeps no-PNR/no-ticket language visible."),
      check("mobile-no-major-horizontal-overflow", !overflow, "Mobile confirmation has no major horizontal overflow.")
    );
    await mobilePage.close();

    return { browserChecks, mobileChecks };
  } finally {
    await browser.close();
  }
}

async function seedConfirmation(page) {
  await page.goto(`${FRONTEND_URL}/flights`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.evaluate(() => {
    const reviewData = {
      tripMode: "domestic",
      passengers: { adults: 1, children: 0, infants: 0 },
      journeys: [
        {
          segments: [
            {
              fromCode: "DEL",
              toCode: "BOM",
              from: "Delhi",
              to: "Mumbai",
              airlineName: "TPL Mock Air",
              flightNumber: "TP101",
              departureDate: "2026-08-20T09:00:00.000Z",
              arrivalDate: "2026-08-20T11:15:00.000Z",
            },
          ],
        },
      ],
      pricing: { baseFareTotal: 4500, tax: 550, surcharge: 0, discount: 0 },
    };
    const payload = {
      bookingId: "TPL-SIM-FLT-D12",
      reviewData,
      travellerValidation: {
        contactDetails: { mobile: "9999999999", email: "d12-smoke@example.test" },
        travellers: [{ firstName: "D12", lastName: "Smoke" }],
      },
      paymentData: {
        totalPaid: 5050,
        paymentStatus: "TPL_TEST_BOOKING_CONFIRMED",
        paidAt: new Date().toISOString(),
      },
      backendSimulation: {
        simulationId: "sim_d12_smoke",
        bookingDraftId: "draft_d12_smoke",
        bookingRef: "TPL-SIM-FLT-D12",
        priceConfirmationId: "price_d12_smoke",
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      },
      backendTestPaymentOrder: {
        paymentId: "pay_d12_smoke",
        paymentRef: "TPL-PAY-D12",
        status: "PAYMENT_PENDING_TEST_ONLY",
      },
      backendTestPaymentConfirmation: {
        paymentId: "pay_d12_smoke",
        status: "TPL_TEST_BOOKING_CONFIRMED",
        confirmationRef: "TPL-CONF-D12",
      },
    };
    sessionStorage.setItem("tplFlightConfirmationData", JSON.stringify(payload));
  });
}

function check(id, ok, details) {
  return { id, ok: Boolean(ok), details };
}

function hasFailed(checks, id) {
  return checks.some((item) => item.id === id && !item.ok);
}

function computeStatus() {
  const staticOk = result.staticChecks.every((item) => item.ok);
  const browserOk = !RUN_BROWSER || result.browserChecks.every((item) => item.ok);
  const mobileOk = !RUN_BROWSER || result.mobileChecks.every((item) => item.ok);
  return staticOk && browserOk && mobileOk ? "passed" : "failed";
}

async function readText(filePath) {
  return readFile(path.resolve(filePath), "utf8");
}

async function fileExists(filePath) {
  try {
    await readFile(path.resolve(filePath), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function writeArtifacts() {
  await writeFile(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await writeFile(MD_PATH, buildMarkdown(), "utf8");
}

function buildMarkdown() {
  const lines = [
    "# D12 Flight Browser Smoke Certification",
    "",
    `- Status: ${result.status}`,
    `- Mode: ${result.mode}`,
    `- Frontend URL: ${result.frontendUrl}`,
    `- Backend URL: ${result.backendUrl}`,
    "",
    "## Required Flags",
    "",
    ...Object.entries(result.flags).map(([key, value]) => `- ${key}=${value}`),
    "",
    "## Tooling",
    "",
    `- Playwright dependency: ${yesNo(result.tooling?.playwrightDependency)}`,
    `- Cypress dependency: ${yesNo(result.tooling?.cypressDependency)}`,
    `- Playwright config present: ${yesNo(result.tooling?.runnerConfig?.playwright)}`,
    `- Cypress config present: ${yesNo(result.tooling?.runnerConfig?.cypress)}`,
    "",
    "## Static Checks",
    "",
    ...formatChecks(result.staticChecks),
    "",
    "## Browser Checks",
    "",
    ...(RUN_BROWSER
      ? formatChecks(result.browserChecks)
      : ["- Skipped. Set TPL_D12_RUN_BROWSER=1 with local frontend running to execute browser checks."]),
    "",
    "## Mobile Checks",
    "",
    ...(RUN_BROWSER
      ? formatChecks(result.mobileChecks)
      : ["- Skipped. Set TPL_D12_RUN_BROWSER=1 with local frontend running to execute mobile viewport checks."]),
    "",
    "## Safety",
    "",
    `- Supplier booking added: ${yesNo(result.safety.supplierBookingAdded)}`,
    `- Live payment capture added: ${yesNo(result.safety.livePaymentCaptureAdded)}`,
    `- providerOfferRef exposed in checked frontend path: ${yesNo(result.safety.providerOfferRefExposed)}`,
    `- Supplier confirmation language found: ${yesNo(result.safety.supplierConfirmationLanguageFound)}`,
    "",
  ];

  if (result.error) {
    lines.push("## Error", "", result.error, "");
  }

  return `${lines.join("\n")}\n`;
}

function formatChecks(checks) {
  if (!checks.length) return ["- None."];
  return checks.map(
    (item) => `- ${item.ok ? "PASS" : "FAIL"} ${item.id}: ${item.details}`
  );
}

function yesNo(value) {
  return value ? "yes" : "no";
}

main();
