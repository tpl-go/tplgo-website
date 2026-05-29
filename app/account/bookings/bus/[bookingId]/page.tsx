"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BusConfirmationJourneyCard from "@/app/components/confirmation/bus/BusConfirmationJourneyCard";
import BusConfirmationTravellerCard from "@/app/components/confirmation/bus/BusConfirmationTravellerCard";
import BusConfirmationFareCard from "@/app/components/confirmation/bus/BusConfirmationFareCard";

import {
  getAllBookings,
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

type Payload = any;

function safeAmount(value: any) {
  return Math.round(Math.max(Number(value || 0), 0));
}

function resolveManagedFare(payload: Payload | null, booking: BookingItem | null) {
  const fare = payload?.fare || {};
  const pricing = payload?.pricing || {};
  const paymentData = payload?.paymentData || {};
  const managePayment = payload?.managePayment || {};
  const manageDraft = payload?.manageDraft || {};
  const seatQuote = manageDraft?.seatQuote || managePayment?.seatQuote || {};

  const baseFare = safeAmount(fare?.baseFare || pricing?.baseFare);

  const seatUpgradeTotal = safeAmount(
    managePayment?.seatUpgradeTotal ??
      managePayment?.seatCharges ??
      fare?.seatUpgradeTotal ??
      fare?.seatCharges ??
      pricing?.seatUpgradeTotal ??
      pricing?.seatCharges ??
      payload?.originalBookingBaseline?.seatUpgradeTotal ??
      0
  );

  const managedDifference = Number(
    managePayment?.difference ??
      managePayment?.upgradeAmount ??
      managePayment?.downgradeAmount ??
      seatQuote?.difference ??
      0
  );

  const updatedTotalAmount = safeAmount(
    managePayment?.updatedTotalAmount ||
      managePayment?.finalTotal ||
      managePayment?.totalPaid ||
      0
  );

  const totalAmount = safeAmount(
    updatedTotalAmount ||
      fare?.totalPaid ||
      fare?.totalAmount ||
      paymentData?.totalPaid ||
      paymentData?.totalAmount ||
      booking?.amount ||
      0
  );

  return {
    baseFare,
    seatUpgradeTotal,
    taxAndSurcharge: safeAmount(fare?.taxAndSurcharge || pricing?.taxAndSurcharge),
    tripSecureTotal: safeAmount(fare?.tripSecureTotal || pricing?.tripSecureTotal),
    freeCancellationTotal: safeAmount(
      fare?.freeCancellationTotal || pricing?.freeCancellationTotal
    ),
    tplCredit: safeAmount(fare?.tplCredit || pricing?.tplCredit),
    appliedOffer: safeAmount(fare?.appliedOffer || pricing?.offerApplied),
    discount: safeAmount(fare?.discount || pricing?.discount),
    totalAmount,
    managedDifference,
    walletCalc: {
      promoUsed:
        safeAmount(fare?.walletBreakdown?.promoUsed) ||
        safeAmount(paymentData?.promoUsed),
      earnedUsed:
        safeAmount(fare?.walletBreakdown?.earnedUsed) ||
        safeAmount(paymentData?.earnedUsed),
      refundUsed:
        safeAmount(fare?.walletBreakdown?.refundUsed) ||
        safeAmount(paymentData?.refundUsed),
    },
    earnedOnThisBooking: safeAmount(
      payload?.earnedCreditAmount ||
        fare?.walletBreakdown?.earnedOnThisBooking ||
        0
    ),
  };
}

export default function BusBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = () => {
      const all = getAllBookings();
      const found =
        all.find((b) => b.id === bookingId && b.type === "bus") || null;

      setBooking(found);

      if (found?.payloadStorageKey) {
        const data = getBookingPayload<Payload>(found.payloadStorageKey);
        setPayload(data ? { ...data } : null);
      } else {
        setPayload(null);
      }

      setRefreshKey((p) => p + 1);
    };

    load();

    window.addEventListener(BOOKING_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, [bookingId]);

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Bus booking detail not found.
        </div>
      </main>
    );
  }

  const bookingPayload = payload?.bookingPayload || {};
  const search = bookingPayload?.search || {};
  const bus = bookingPayload?.bus || {};

  const busName =
    payload?.busName ||
    bus?.name ||
    bus?.busName ||
    bus?.travelsName ||
    "Bus Booking";

  const operatorName =
    payload?.operatorName || bus?.operatorName || bus?.travelsName || "";

  const travelDate =
    payload?.travelDate || search?.date || booking.travelDate || "";

  const departureTime =
    payload?.departureTime ||
    bookingPayload?.selectedBoardingPoint?.time ||
    bus?.departureTime ||
    "";

  const arrivalTime =
    payload?.arrivalTime ||
    bookingPayload?.selectedDroppingPoint?.time ||
    bus?.arrivalTime ||
    "";

  const duration = payload?.duration || bus?.duration || "";
  const busType = payload?.busType || bus?.busType || bus?.type || "";

  const travellers = Array.isArray(payload?.travellers) ? payload.travellers : [];
  const contactDetails = payload?.contactDetails || {};
  const ticketNumber = payload?.ticketNumber || payload?.operatorTicketNo || "";

  const paymentData = payload?.paymentData || {};

  const paymentMethod =
    payload?.selectedPaymentMethod ||
    paymentData?.method ||
    payload?.paymentMethod ||
    payload?.managePayment?.method ||
    "Online Payment";

  const paidAt =
    payload?.managePayment?.paidAt ||
    paymentData?.paidAt ||
    payload?.paidAt ||
    payload?.bookedOn ||
    booking.bookingDate;

  const paymentStatus =
    payload?.paymentState === "success" ||
    payload?.paymentStatus === "paid" ||
    payload?.paymentStatus === "Paid"
      ? "success"
      : payload?.paymentStatus === "pending" ||
        payload?.paymentStatus === "Pending"
      ? "pending"
      : "success";

  const fareSummary = resolveManagedFare(payload, booking);

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
            Bus Booking Detail
          </div>

          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 flex flex-col gap-4 md:px-4 md:py-6">
        <BusConfirmationJourneyCard
          busName={busName}
          operatorName={operatorName}
          busType={busType}
          fromCity={search?.fromCity || payload?.fromCity || ""}
          toCity={search?.toCity || payload?.toCity || ""}
          fromPoint={search?.fromPoint || ""}
          toPoint={search?.toPoint || ""}
          travelDate={travelDate}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          duration={duration}
          boardingPoint={bookingPayload?.selectedBoardingPoint}
          droppingPoint={bookingPayload?.selectedDroppingPoint}
        />

        <BusConfirmationTravellerCard
          key={`trav-${refreshKey}`}
          travellers={travellers}
          contactDetails={contactDetails}
        />

        <BusConfirmationFareCard
          bookingId={booking.id}
          paymentId={
            payload?.managePayment?.paymentId ||
            payload?.paymentId ||
            payload?.transactionId ||
            paymentData?.paymentId ||
            "-"
          }
          ticketNumber={ticketNumber}
          baseFare={fareSummary.baseFare}
          seatUpgradeTotal={fareSummary.seatUpgradeTotal}
          taxAndSurcharge={fareSummary.taxAndSurcharge}
          tripSecureTotal={fareSummary.tripSecureTotal}
          freeCancellationTotal={fareSummary.freeCancellationTotal}
          tplCredit={fareSummary.tplCredit}
          appliedOffer={fareSummary.appliedOffer}
          discount={fareSummary.discount}
          totalAmount={fareSummary.totalAmount}
          paymentMethod={paymentMethod}
          paymentStatus={paymentStatus}
          paidAt={paidAt}
          walletCalc={fareSummary.walletCalc}
          earnedOnThisBooking={fareSummary.earnedOnThisBooking}
        />
      </div>
    </main>
  );
}