import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const files = {
  payment: read("app/hotels/payment/page.tsx"),
  paymentOptions: read("app/components/payment/hotel/HotelPaymentOptionSection.tsx"),
  razorpay: read("app/lib/api/razorpayCheckoutClient.ts"),
  confirmation: read("app/hotels/confirmation/page.tsx"),
  manage: read("app/hotels/manage/page.tsx"),
  myBooking: read("app/account/bookings/hotel/[bookingId]/page.tsx"),
  myBookingList: read("app/components/account/bookings/sections/UpcomingJourneySection.tsx"),
};

const joined = Object.values(files).join("\n");
const paymentHandler = files.payment.slice(files.payment.indexOf("const handleMockPayment"));
const checks = [
  ["card option emits cards", files.paymentOptions.includes('onPaymentMethodChange?.("cards")')],
  ["hotel card path starts razorpay", files.payment.includes('selectedPaymentMethod === "cards"') && files.payment.includes('paymentMethod: useRazorpayMethod ? "razorpay" : "mock"')],
  ["razorpay opens only after backend start", files.payment.indexOf("startHotelTestPayment") < files.payment.indexOf("openRazorpayTestCheckout")],
  ["razorpay payload is test checked", files.payment.includes("isRazorpayTestCheckoutEnabled()") && files.payment.includes("isValidRazorpayTestCheckoutPayload(start.data.checkout)")],
  ["backend confirm receives razorpay result", files.payment.includes("gatewayPaymentId:") && files.payment.includes("razorpayResult?.gatewayPaymentId") && files.payment.includes("gatewaySignature: razorpayResult?.gatewaySignature")],
  ["frontend-only success not accepted", paymentHandler.indexOf("openRazorpayTestCheckout") < paymentHandler.indexOf("const confirm = await confirmHotelTestPayment") && paymentHandler.indexOf("const confirm = await confirmHotelTestPayment") < paymentHandler.indexOf('router.push("/hotels/confirmation")')],
  ["raw card fields removed", !files.paymentOptions.includes("Card Number") && !files.paymentOptions.includes("CVV") && !files.paymentOptions.includes("Expiry")],
  ["test checkout copy visible", files.paymentOptions.includes("Razorpay Test Checkout")],
  ["confirmation test wording", files.confirmation.includes("TPL Test Confirmation")],
  ["no voucher issued", files.confirmation.includes("Voucher: Not Issued")],
  ["my booking supplier absent", files.myBooking.includes("Supplier reservation: Not created in test mode")],
  ["my booking list marks hotel test bookings", files.myBookingList.includes("isBackendTestHotelBooking") && files.myBookingList.includes("TPL Test / Simulation")],
  ["my booking list disables supplier actions", files.myBookingList.includes("Test Summary Only") && files.myBookingList.includes("Cancellation Disabled")],
  ["my booking list suppresses voucher action for hotel tests", files.myBookingList.includes("Voucher:") && files.myBookingList.includes("Not issued in test mode")],
  ["manage supplier actions disabled", files.manage.includes("cancellation/refund/upgrade/downgrade/wallet actions are unavailable")],
  ["no supplier reservation creation", !joined.includes("/supplier/book") && !joined.includes("supplierReservationId: \"")],
  ["no live razorpay enablement", !joined.includes("live Razorpay") && !joined.includes("NEXT_PUBLIC_RAZORPAY_KEY_SECRET")],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length) {
  console.error(`Hotel D25F freeze smoke failed: ${failures.map(([name]) => name).join(", ")}`);
  process.exit(1);
}
