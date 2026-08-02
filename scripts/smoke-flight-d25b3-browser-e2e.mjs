import { chromium } from "playwright";

const baseUrl = process.env.D25B3_FRONTEND_URL || "http://127.0.0.1:3043";
const bookingRef = "TPL-SIM-FLT-D25B3-BROWSER-001";

const auth = {
  user: {
    id: "guest_d25b3",
    mobile: "9876543210",
    fullName: "D25B Three",
    email: "d25b3@example.test",
    accountType: "personal",
    leadTraveller: { phone: "9876543210" },
  },
};

const payload = {
  bookingId: bookingRef,
  backendBookingRef: bookingRef,
  bookingMeta: { backendBookingRef: bookingRef, supplierBookingDisabled: true },
  reviewData: {
    bookingType: "oneWay",
    tripMode: "domestic",
    cabinClass: "Economy",
    passengers: { adults: 1, children: 0, infants: 0 },
    journeys: [
      {
        journeyLabel: "Outbound",
        segments: [
          {
            airline: "TPL Mock Air",
            flightNumber: "TP123",
            from: "Delhi",
            to: "Mumbai",
            fromCode: "DEL",
            toCode: "BOM",
            departureDate: "2026-09-15",
            arrivalDate: "2026-09-15",
            departureTime: "10:00",
            arrivalTime: "12:10",
            duration: "2h 10m",
            cabinBaggage: "7kg",
            checkinBaggage: "15kg",
          },
        ],
      },
    ],
  },
  travellerValidation: {
    travellers: [
      {
        id: "traveller-1",
        title: "Mr",
        firstName: "D25B",
        lastName: "Three",
        travellerType: "adult",
      },
    ],
    contactDetails: {
      countryCode: "+91",
      mobile: "9876543210",
      email: "d25b3@example.test",
    },
  },
  paymentData: {
    totalPaid: 5000,
    currency: "INR",
    method: "Razorpay Test",
    paidAt: "2026-08-02T10:00:00.000Z",
    paymentStatus: "paid",
    paymentRef: "pay_test_d25b3",
  },
  backendTestPaymentConfirmation: {
    status: "TPL_TEST_BOOKING_CONFIRMED",
    confirmationRef: "TPL-TEST-FLT-D25B3",
    backendBookingRef: bookingRef,
    confirmedAt: "2026-08-02T10:01:00.000Z",
  },
  backendSimulation: {
    bookingRef,
    bookingAllowed: false,
    ticketingAllowed: false,
    paymentCaptureAllowed: false,
    pnr: null,
    ticketNumber: null,
  },
  supplierBookingDisabled: true,
  bookingAllowed: false,
  ticketingAllowed: false,
  paymentCaptureAllowed: false,
  pnr: null,
  ticketNumber: null,
  testStatus: "TPL_TEST_BOOKING_CONFIRMED",
  pricingSnapshot: { total: 5000, currency: "INR" },
};

const booking = {
  id: bookingRef,
  bookingId: bookingRef,
  backendBookingRef: bookingRef,
  type: "flight",
  title: "DEL -> BOM",
  bookingDate: "2026-08-02T10:02:00.000Z",
  travelDate: "2026-09-15",
  travellers: "1 Traveller",
  travellersLabel: "1 Traveller",
  amount: 5000,
  status: "upcoming",
  mobile: "9876543210",
  leadTraveller: {
    name: "D25B Three",
    mobile: "9876543210",
    email: "d25b3@example.test",
  },
  ticketType: "flight",
  payloadStorageKey: "tpl_booking_payload_flight_d25b3_browser",
  paymentStatus: "paid",
  paymentId: "pay_test_d25b3",
  bookingStatus: "TPL_TEST_BOOKING_CONFIRMED",
};

const checks = [];

function record(label, ok, details = "") {
  checks.push({ label, ok, details });
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${details ? ` - ${details}` : ""}`);
}

async function text(page) {
  return page.locator("body").innerText();
}

async function noHorizontalOverflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2
  );
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/flights`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ auth, booking, payload }) => {
      localStorage.setItem("tpl_auth_session_v1", JSON.stringify(auth));
      localStorage.setItem("tpl_bookings_v1", JSON.stringify([booking]));
      localStorage.setItem(booking.payloadStorageKey, JSON.stringify(payload));
    },
    { auth, booking, payload }
  );

  for (const viewport of [
    ["desktop", 1440, 900],
    ["tablet", 768, 900],
    ["mobile430", 430, 900],
    ["mobile390", 390, 900],
    ["mobile360", 360, 900],
  ]) {
    const [name, width, height] = viewport;
    await page.setViewportSize({ width, height });
    await page.goto(`${baseUrl}/flights`, { waitUntil: "networkidle" });
    record(`/flights ${name} no horizontal overflow`, await noHorizontalOverflow(page));
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/account/bookings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const accountText = await text(page);
  record("My Booking shows backend booking ref", accountText.includes(bookingRef));
  record("My Booking shows test/simulation label", accountText.includes("TPL Test / Simulation"));
  record("My Booking shows payment paid", accountText.includes("PAID"));
  record("My Booking shows no PNR/ticket", accountText.includes("PNR/Ticket") && accountText.includes("Not issued in test mode"));
  record("My Booking disables cancellation", accountText.includes("Cancellation Disabled"));
  record("/account/bookings desktop no horizontal overflow", await noHorizontalOverflow(page));

  await page.getByRole("button", { name: "Manage Booking" }).first().click();
  await page.waitForURL(/\/flights\/manage/, { timeout: 15000 });
  await page.waitForTimeout(1000);
  const manageText = await text(page);
  record("Manage opens from My Booking", page.url().includes("/flights/manage"));
  record("Manage displays same booking ref", manageText.includes(bookingRef));
  record("Manage displays payment paid", manageText.includes("Payment: PAID"));
  record("Manage displays test state", manageText.includes("TPL_TEST_BOOKING_CONFIRMED"));
  record("Manage displays no issued PNR/ticket", manageText.includes("Not issued in test mode"));
  record("Manage disables cancellation", manageText.includes("Cancellation Disabled"));
  record("/flights/manage desktop no horizontal overflow", await noHorizontalOverflow(page));

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const refreshText = await text(page);
  record("Manage refresh preserves booking ref", refreshText.includes(bookingRef));
  record("Manage refresh preserves test state", refreshText.includes("TPL_TEST_BOOKING_CONFIRMED"));

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`${baseUrl}/flights/manage?bookingId=${encodeURIComponent(bookingRef)}&from=direct`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  const mobileManageText = await text(page);
  record("Direct Manage deep-link opens booking", mobileManageText.includes(bookingRef));
  record("/flights/manage mobile no horizontal overflow", await noHorizontalOverflow(page));
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\nD25B.3 browser E2E failed: ${failed.length} check(s).`);
  process.exit(1);
}

console.log("\nD25B.3 browser E2E passed.");
