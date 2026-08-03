import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const files = {
  integration: read("app/lib/hotels/hotelBackendIntegration.ts"),
  searchButton: read("app/components/hotel/search/HotelSearchButton.tsx"),
  results: read("app/hotels/results/page.tsx"),
  card: read("app/components/hotel/results/HotelResultCard.tsx"),
  booking: read("app/hotels/booking/page.tsx"),
  payment: read("app/hotels/payment/page.tsx"),
  confirmation: read("app/hotels/confirmation/page.tsx"),
  manage: read("app/hotels/manage/page.tsx"),
  myBooking: read("app/account/bookings/hotel/[bookingId]/page.tsx"),
};

const joined = Object.values(files).join("\n");
const checks = [
  ["search route", files.integration.includes("/api/v1/hotels/search")],
  ["details route", files.integration.includes("/api/v1/hotels/${encodeURIComponent(hotelId)}?searchId=")],
  ["rates route", files.integration.includes("/rates?searchId=")],
  ["quote route", files.integration.includes("/api/v1/hotels/quote")],
  ["simulate route", files.integration.includes("/api/v1/hotels/bookings/simulate")],
  ["payment start route", files.integration.includes("/payment/start")],
  ["payment confirm route", files.integration.includes("/payment/confirm")],
  ["readback route", files.integration.includes("getHotelBookingDraft")],
  ["search validation blocks invalid", files.searchButton.includes("validateHotelSearchInput")],
  ["per-room occupancy encoded", files.searchButton.includes("roomOccupancies")],
  ["results backend mapping", files.results.includes("mapBackendHotelToUiHotel")],
  ["details/rates on selection", files.card.includes("getHotelDetails") && files.card.includes("getHotelRates")],
  ["quote before review", files.card.includes("createHotelQuote")],
  ["guest validation", files.booking.includes("validateHotelGuestInput")],
  ["booking simulation", files.booking.includes("simulateHotelBooking")],
  ["draft safety flags", files.booking.includes("supplierReservationId !== null")],
  ["backend payment start", files.payment.includes("startHotelTestPayment")],
  ["backend payment confirm", files.payment.includes("confirmHotelTestPayment")],
  ["payment readback", files.payment.includes("getHotelBookingDraft")],
  ["non-INR blocked", files.payment.includes("available only for INR")],
  ["duplicate payment lock", files.payment.includes('paymentActionState === "processing"')],
  ["no wallet mutation in hotel payment", !files.payment.includes("saveWallet(") && !files.payment.includes("addWalletLedgerItem(")],
  ["confirmation safe copy", files.confirmation.includes("No supplier voucher issued")],
  ["manage safe copy", files.manage.includes("cancellation/refund/upgrade/downgrade/wallet actions are unavailable")],
  ["my booking safe copy", files.myBooking.includes("Supplier reservation: Not created in test mode")],
  ["private provider refs absent", !joined.includes("providerHotelRef") && !joined.includes("providerRoomRef") && !joined.includes("providerRateRef") && !joined.includes("providerQuoteRef")],
  ["no supplier booking route", !joined.includes("/supplier/book")],
  ["no cancellation route execution", !joined.includes("/payment/refund") && !joined.includes("/bookings/cancel")],
  ["no live payment wording", !joined.includes("live Razorpay")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length) {
  console.error(`Hotel D25E smoke failed: ${failures.map(([name]) => name).join(", ")}`);
  process.exit(1);
}
