import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const files = {
  resolver: read("app/lib/booking/resolvers/flightResolver.ts"),
  sharedTypes: read("app/lib/booking/resolvers/sharedTypes.ts"),
  manageTypes: read("app/lib/manage/manageTypes.ts"),
  managePage: read("app/flights/manage/page.tsx"),
  manageDetails: read("app/components/manage/flight/ManageBookingDetails.tsx"),
  upcoming: read("app/components/account/bookings/sections/UpcomingJourneySection.tsx"),
  flightDetail: read("app/account/bookings/flight/[bookingId]/page.tsx"),
  actionsCard: read("app/components/confirmation/flight/FlightConfirmationActionsCard.tsx"),
  confirmation: read("app/flights/confirmation/page.tsx"),
  print: read("app/lib/booking/print/flightTicketPrint.ts"),
  bookingApi: read("app/lib/api/bookingApi.ts"),
};

const checks = [
  [
    "backend itinerary readback is normalized for manage/detail views",
    files.resolver.includes("normalizeBackendItinerarySnapshot") &&
      files.resolver.includes("itinerarySnapshot") &&
      files.resolver.includes("travellerSnapshot") &&
      files.resolver.includes("priceSnapshot"),
  ],
  [
    "backend test state is exposed by the flight resolver",
    files.sharedTypes.includes("supplierBookingDisabled?: boolean") &&
      files.resolver.includes("testStatus") &&
      files.resolver.includes("paymentCaptureAllowed"),
  ],
  [
    "manage page attempts backend-first readback for deep links",
    files.managePage.includes("getBackendFirstBookingPayload") &&
      files.managePage.includes("backendBookingRef") &&
      files.managePage.includes("legacyFrontendId"),
  ],
  [
    "manage page disables cancellation for backend test bookings",
    files.managePage.includes("Cancellation is disabled for TPL flight test bookings.") &&
      files.managePage.includes("Cancellation Disabled") &&
      files.managePage.includes("disabled: manageSummary.supplierBookingDisabled"),
  ],
  [
    "manage details render payment/test status and no issued ticket",
    files.manageDetails.includes("TPL Test / Simulation") &&
      files.manageDetails.includes("Payment:") &&
      files.manageDetails.includes("Ticket: {booking.ticketNumber || \"Not issued in test mode\"}"),
  ],
  [
    "My Booking list labels backend test flights and keeps payment status",
    files.upcoming.includes("isBackendTestFlightBooking") &&
      files.upcoming.includes("TPL Test / Simulation") &&
      files.upcoming.includes("Payment:") &&
      files.upcoming.includes("PNR/Ticket:"),
  ],
  [
    "My Booking list disables fake ticket download and cancellation for test flights",
    files.upcoming.includes("Test Summary Only") &&
      files.upcoming.includes("Cancellation Disabled") &&
      files.upcoming.includes("disabled={isBackendTestFlight}"),
  ],
  [
    "account flight detail displays backend test state safely",
    files.flightDetail.includes("TPL test/simulation booking") &&
      files.flightDetail.includes("PNR: Not issued in test mode") &&
      files.flightDetail.includes("Ticket: Not issued in test mode"),
  ],
  [
    "confirmation action card suppresses ticket download for backend test flow",
    files.actionsCard.includes("isBackendTestBooking") &&
      files.actionsCard.includes("Ticket Not Issued") &&
      files.confirmation.includes("isBackendTestBooking={isBackendTestBooking}"),
  ],
  [
    "print path renders test confirmation summary for backend test flow",
    files.print.includes("Test Confirmation") &&
      files.print.includes("test confirmation summary") &&
      files.print.includes("Ticket:") &&
      files.print.includes("Not issued in test mode"),
  ],
  [
    "generic backend booking list/detail helpers remain backend-first",
    files.bookingApi.includes("/api/v1/bookings") &&
      files.bookingApi.includes("/api/v1/bookings/${encodeURIComponent(bookingId)}/detail") &&
      files.bookingApi.includes("source: \"local_fallback\""),
  ],
];

const failed = checks.filter(([, ok]) => !ok);

for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length) {
  console.error(`\nD25B.3 booking-management smoke failed: ${failed.length} check(s).`);
  process.exit(1);
}

console.log("\nD25B.3 booking-management smoke passed.");
