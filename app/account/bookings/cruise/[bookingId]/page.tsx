"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CruiseConfirmationSuccessHeader from "@/app/components/confirmation/cruise/CruiseConfirmationSuccessHeader";
import CruiseConfirmationTripCard from "@/app/components/confirmation/cruise/CruiseConfirmationTripCard";
import CruiseConfirmationCabinTravellerCard from "@/app/components/confirmation/cruise/CruiseConfirmationCabinTravellerCard";
import CruiseConfirmationFareCard from "@/app/components/confirmation/cruise/CruiseConfirmationFareCard";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBackendFirstBookingPayload } from "@/app/lib/api/bookingApi";

type Payload = any;

export default function CruiseBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await getBackendFirstBookingPayload<Payload>(
        bookingId,
        "cruise"
      );
      if (cancelled) return;

      setBooking(result.booking);
      setPayload(result.payload);
    };

    void load();

    window.addEventListener(BOOKING_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      cancelled = true;
      window.removeEventListener(BOOKING_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, [bookingId]);

  const fareData = useMemo(() => {
    const pricingSummary = payload?.cabins?.pricingSummary || {};
    const paymentData = payload?.paymentData || {};
    const managePayment = payload?.managePayment || {};
    const offer = payload?.offer || null;
    const fare = payload?.fare || {};
    const walletBreakdown = fare?.walletBreakdown || {};

    const baseFare = Number(
      fare?.baseFare ||
        pricingSummary?.cabinsTotal ||
        pricingSummary?.baseFare ||
        managePayment?.baseFare ||
        0
    );

    const taxes = Number(
      fare?.taxes ||
        fare?.tax ||
        pricingSummary?.taxesAndFees ||
        pricingSummary?.taxes ||
        managePayment?.taxes ||
        0
    );

    const portCharges = Number(
      fare?.portCharges ||
        pricingSummary?.portCharges ||
        managePayment?.portCharges ||
        0
    );

    const gratuityCharges = Number(
      fare?.gratuityCharges ||
        pricingSummary?.gratuityCharges ||
        managePayment?.gratuityCharges ||
        0
    );

    const insuranceTotal = Number(
      fare?.insuranceTotal ||
        (paymentData?.insuranceSelected ? paymentData?.insuranceAmount : 0) ||
        pricingSummary?.insuranceTotal ||
        managePayment?.insuranceTotal ||
        0
    );

    const addonsTotal = Number(
      fare?.addonsTotal ||
        pricingSummary?.addonsTotal ||
        managePayment?.addonsTotal ||
        0
    );

    const appliedOffer = Number(
      fare?.appliedOffer ||
        offer?.discountAmount ||
        pricingSummary?.appliedOffer ||
        managePayment?.appliedOffer ||
        0
    );

    const discount = Number(
      fare?.discount ||
        pricingSummary?.discount ||
        managePayment?.discount ||
        0
    );

    const promoUsed = Number(walletBreakdown?.promoUsed || 0);
    const earnedUsed = Number(walletBreakdown?.earnedUsed || 0);
    const refundUsed = Number(walletBreakdown?.refundUsed || 0);

    const tplCredit = Number(
      fare?.tplCreditUsed ||
        fare?.tplCredit ||
        paymentData?.tplCredit ||
        pricingSummary?.tplCredit ||
        managePayment?.tplCredit ||
        walletBreakdown?.totalWalletUsed ||
        promoUsed + earnedUsed + refundUsed ||
        0
    );

    const totalAmount = Number(
      managePayment?.updatedTotalAmount ||
        fare?.grandTotal ||
        fare?.totalAmount ||
        fare?.totalPaid ||
        paymentData?.finalPayableAmount ||
        paymentData?.totalPaid ||
        pricingSummary?.grandTotal ||
        booking?.amount ||
        Math.max(
          baseFare +
            taxes +
            portCharges +
            gratuityCharges +
            insuranceTotal +
            addonsTotal -
            appliedOffer -
            discount -
            tplCredit,
          0
        )
    );

    return {
      baseFare,
      taxes,
      portCharges,
      gratuityCharges,
      insuranceTotal,
      addonsTotal,
      appliedOffer,
      appliedOfferCode:
        fare?.appliedOfferCode || offer?.code || offer?.couponCode || "",
      appliedOfferTitle:
        fare?.appliedOfferTitle ||
        offer?.title ||
        "Best Cruise Offer Applied",
      offerData: fare?.offerData || offer || null,
      discount,
      tplCredit,
      walletCalc: {
        promoUsed,
        earnedUsed,
        refundUsed,
      },
      earnedOnThisBooking: Number(
        payload?.earnedCreditAmount ||
          fare?.earnedOnThisBooking ||
          walletBreakdown?.earnedOnThisBooking ||
          paymentData?.earnedCreditAmount ||
          0
      ),
      totalAmount,
    };
  }, [payload, booking?.amount]);

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Cruise booking detail not found.
        </div>
      </main>
    );
  }

  const cruise = payload?.cruise || {};
  const cabinData = payload?.cabins || {};
  const pricingSummary = cabinData?.pricingSummary || {};
  const travellers = payload?.travellers?.list || [];
  const contact = payload?.travellers?.contact || {};
  const paymentData = payload?.paymentData || {};

  const finalEarnedCreditAmount =
    Number(payload?.earnedCreditAmount || 0) ||
    Number(fareData?.earnedOnThisBooking || 0) ||
    Number(paymentData?.earnedCreditAmount || 0) ||
    Number(paymentData?.walletBreakdown?.earnedOnThisBooking || 0);

  const bookedAt =
    paymentData?.paidAt ||
    (payload?.session?.createdAt
      ? new Date(payload.session.createdAt).toISOString()
      : booking.bookingDate);

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
            Cruise Booking Detail
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 flex flex-col gap-4 md:px-4 md:py-6">
        <CruiseConfirmationSuccessHeader
          bookingId={booking.id}
          title={cruise?.title || "Cruise Booking"}
          bookingStatus="confirmed"
          paymentStatus="paid"
          bookedAt={bookedAt}
          cruiseLine={cruise?.cruiseLine || null}
          sailingDate={cruise?.sailingDate || null}
        />

        {finalEarnedCreditAmount > 0 ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-[14px] font-bold text-green-700">
            🎉 You earned ₹
            {Number(finalEarnedCreditAmount).toLocaleString("en-IN")} TPL
            Earned Credit. This has been added to your wallet.
          </div>
        ) : null}

        <CruiseConfirmationTripCard
          title={cruise?.title || "Cruise Booking"}
          route={cruise?.route || null}
          departurePort={cruise?.departurePort || null}
          arrivalPort={cruise?.arrivalPort || null}
          sailingStartDate={cruise?.sailingStartDate || cruise?.sailingDate || null}
          sailingEndDate={cruise?.sailingEndDate || null}
          sailingDate={cruise?.sailingDate || null}
          visitingPorts={cruise?.visitingPorts || []}
          cruiseLine={cruise?.cruiseLine || null}
          shipName={cruise?.shipName || null}
          durationLabel={cruise?.durationLabel || null}
        />

        <CruiseConfirmationCabinTravellerCard
          cabins={pricingSummary?.cabins || []}
          travellers={travellers}
          contactDetails={contact}
        />

        <CruiseConfirmationFareCard
          bookingId={booking.id}
          paymentId={
            paymentData?.paymentId ||
            payload?.paymentId ||
            payload?.transactionId ||
            `PAY-${booking.id.slice(-6)}`
          }
          baseFare={fareData.baseFare}
          taxes={fareData.taxes}
          portCharges={fareData.portCharges}
          gratuityCharges={fareData.gratuityCharges}
          insuranceTotal={fareData.insuranceTotal}
          addonsTotal={fareData.addonsTotal}
          appliedOffer={fareData.appliedOffer}
          appliedOfferCode={fareData.appliedOfferCode}
          appliedOfferTitle={fareData.appliedOfferTitle}
          offerData={fareData.offerData}
          discount={fareData.discount}
          tplCredit={fareData.tplCredit}
          totalAmount={fareData.totalAmount}
          paymentMethod={paymentData?.selectedPaymentMethod || paymentData?.method || "UPI"}
          paymentStatus="success"
          paidAt={paymentData?.paidAt || booking.bookingDate}
          walletCalc={fareData.walletCalc}
          earnedOnThisBooking={finalEarnedCreditAmount}
        />
      </div>
    </main>
  );
}
