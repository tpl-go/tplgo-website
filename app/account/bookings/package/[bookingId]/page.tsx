"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PackageConfirmationSuccessHeader from "@/app/components/confirmation/packages/PackageConfirmationSuccessHeader";
import PackageConfirmationSummaryCard from "@/app/components/confirmation/packages/PackageConfirmationSummaryCard";
import PackageConfirmationTravellerCard from "@/app/components/confirmation/packages/PackageConfirmationTravellerCard";
import PackageConfirmationAddOnCard from "@/app/components/confirmation/packages/PackageConfirmationAddOnCard";
import PackageConfirmationItineraryCard from "@/app/components/confirmation/packages/PackageConfirmationItineraryCard";
import PackageConfirmationCancellationCard from "@/app/components/confirmation/packages/PackageConfirmationCancellationCard";
import PackageConfirmationFareCard from "@/app/components/confirmation/packages/PackageConfirmationFareCard";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

type ConfirmationPayload = any;

function buildPaymentId() {
  return `TPL-PAY-${Date.now().toString().slice(-6)}`;
}

function buildInvoiceId() {
  return `TPL-INV-${Date.now().toString().slice(-6)}`;
}

export default function PackageBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [data, setData] = useState<ConfirmationPayload | null>(null);

  useEffect(() => {
    const loadBookingDetail = () => {
      const all = getAllBookings();

      const found =
        all.find((item) => item.id === bookingId && item.type === "package") ||
        null;

      setBooking(found);

      if (found?.payloadStorageKey) {
        const savedPayload = getBookingPayload<ConfirmationPayload>(
          found.payloadStorageKey
        );

        setData(savedPayload ? { ...savedPayload } : null);
      } else {
        setData(null);
      }
    };

    loadBookingDetail();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
    window.addEventListener("storage", loadBookingDetail);
    window.addEventListener("focus", loadBookingDetail);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
      window.removeEventListener("storage", loadBookingDetail);
      window.removeEventListener("focus", loadBookingDetail);
    };
  }, [bookingId]);

  const paymentId = useMemo(() => {
    return data?.payment?.paymentId || data?.paymentId || buildPaymentId();
  }, [data?.payment?.paymentId, data?.paymentId]);

  const invoiceNumber = useMemo(() => {
    return data?.invoiceNumber || buildInvoiceId();
  }, [data?.invoiceNumber]);

  if (!booking || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Package booking detail not found.
        </div>
      </main>
    );
  }

  const summary = data.summary || {};
  const traveller = data.traveller || {};
  const addOn = data.addOn || {};
  const itinerary = data.itinerary || {};
  const cancellation = data.cancellation || {};
  const payment = data.payment || {};
  const fare = data.fare || {};
  const leadTraveller = data.leadTraveller || {};

  const finalEarnedCreditAmount =
    Number(data.earnedCreditAmount || 0) ||
    Number(fare?.walletBreakdown?.earnedOnThisBooking || 0);

  const packageSelectionState =
    summary.packageSelectionState || itinerary.packageSelectionState || {};

  const upgradeBreakupRows = [
    {
      label: "Flight Upgrade",
      value: Number(packageSelectionState.flightFareDiff || 0),
    },
    {
      label: "Hotel Upgrade",
      value: Number(packageSelectionState.hotelFareDiff || 0),
    },
    {
      label: "Transfer Upgrade",
      value: Number(packageSelectionState.transferFareDiff || 0),
    },
    {
      label: "Meal Upgrade",
      value: Number(packageSelectionState.mealFareDiff || 0),
    },
    {
      label: "Activity Upgrade",
      value: Number(packageSelectionState.activityFareDiff || 0),
    },
  ].filter((item) => item.value > 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="min-h-[72px] bg-white border-b flex flex-col items-start justify-center gap-3 px-3 py-3 md:h-[72px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="text-2xl font-black">TPL</div>

        <button
          onClick={() => router.push("/account/bookings")}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:px-5 md:text-[13px]"
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
          <span>Back to My Bookings</span>
        </button>
      </div>

      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="text-[19px] font-black leading-7 text-slate-900 md:text-[22px]">
            Package Booking Detail
          </div>

          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-6">
        <div className="w-full flex flex-col gap-4">
          <PackageConfirmationSuccessHeader
            bookingId={booking.id}
            title={summary.packageTitle || "Package Booking Confirmed"}
            bookingStatus={data.bookingStatus || "confirmed"}
            paymentStatus={
              payment.paymentActionState === "success" ? "paid" : "pending"
            }
            bookedAt={payment.paidAt || booking.bookingDate}
            packageCode={summary.packageSlug}
            travelDate={summary.travelDate}
            route={summary.route}
            variant={summary.variant}
          />

          {finalEarnedCreditAmount > 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-[14px] font-bold text-green-700">
              🎉 You earned ₹
              {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
              Earned Credit. This has been added to your wallet.
            </div>
          ) : null}

          <PackageConfirmationSummaryCard
            packageTitle={summary.packageTitle}
            packageSlug={summary.packageSlug}
            route={summary.route}
            nights={summary.nights}
            days={summary.days}
            variant={summary.variant}
            travelDate={summary.travelDate}
            originCity={summary.originCity}
            rooms={summary.rooms}
            totalAdults={summary.totalAdults}
            totalChildren={summary.totalChildren}
            totalRooms={summary.totalRooms}
            isInternationalTrip={summary.isInternationalTrip}
            selectionState={summary.packageSelectionState}
            includedFlightLabels={summary.includedFlightLabels}
            includedHotelLabels={summary.includedHotelLabels}
            includedTransferLabels={summary.includedTransferLabels}
            includedMealLabels={summary.includedMealLabels}
            includedActivityLabels={summary.includedActivityLabels}
            bookingId={booking.id}
            bookingStatus={data.bookingStatus || "confirmed"}
          />

          <PackageConfirmationTravellerCard
            leadTraveller={leadTraveller}
            travellers={traveller.travellers || []}
            contactDetails={traveller.contactDetails || {}}
            gstDetails={traveller.gstDetails || {}}
          />

          <PackageConfirmationAddOnCard
            addOn={addOn}
            totalTravellers={payment.totalTravellers || summary.totalAdults || 1}
          />

          <PackageConfirmationItineraryCard
            title="Package Itinerary & Inclusions"
            travelDate={itinerary.travelDate || summary.travelDate}
            dayPlans={itinerary.dayPlans || []}
            features={itinerary.features || summary.features}
            packageSelectionState={
              itinerary.packageSelectionState || summary.packageSelectionState
            }
            includedFlightLabels={
              itinerary.includedFlightLabels || summary.includedFlightLabels || []
            }
            includedHotelLabels={
              itinerary.includedHotelLabels || summary.includedHotelLabels || []
            }
            includedTransferLabels={
              itinerary.includedTransferLabels ||
              summary.includedTransferLabels ||
              []
            }
            includedMealLabels={
              itinerary.includedMealLabels || summary.includedMealLabels || []
            }
            includedActivityLabels={
              itinerary.includedActivityLabels ||
              summary.includedActivityLabels ||
              []
            }
          />

          <PackageConfirmationCancellationCard
            travelDate={summary.travelDate}
            exclusions={cancellation.exclusions || []}
          />

          <PackageConfirmationFareCard
            bookingId={booking.id}
            paymentId={paymentId}
            invoiceNumber={invoiceNumber}
            paymentMethod={payment.selectedPaymentMethod}
            paymentStatus={
              payment.paymentActionState === "success" ? "paid" : "pending"
            }
            paidAt={payment.paidAt || booking.bookingDate}
            basePrice={fare.basePrice}
            upgradedDiffTotal={fare.upgradedDiffTotal}
            feesAndTaxes={fare.feesAndTaxes}
            insuranceAmount={fare.insuranceAmount}
            couponDiscount={fare.couponDiscount}
            tplCreditUsed={fare.tplCreditUsed}
            grandTotal={
              fare.finalPayableAmount ||
              fare.grandTotal ||
              booking.amount
            }
            appliedCoupon={fare.appliedCoupon}
            totalTravellers={
              payment.totalTravellers || summary.totalAdults
            }
            appliedOfferAmount={fare.couponDiscount}
            appliedOfferCode={fare.appliedCoupon}
            baseAfterOffer={fare.baseAfterOffer}
            totalBeforeWallet={fare.totalBeforeWallet}
            upgradeBreakupRows={upgradeBreakupRows}
            walletCalc={{
              promoUsed:
                Number(fare?.walletBreakdown?.promoUsed || 0) ||
                Number(payment?.promoUsed || 0),

              earnedUsed:
                Number(fare?.walletBreakdown?.earnedUsed || 0) ||
                Number(payment?.earnedUsed || 0),

              refundUsed:
                Number(fare?.walletBreakdown?.refundUsed || 0) ||
                Number(payment?.refundUsed || 0),
            }}
            earnedOnThisBooking={finalEarnedCreditAmount}
          />
        </div>
      </div>
    </main>
  );
}