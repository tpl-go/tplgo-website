"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import FlightConfirmationJourneyCard from "@/app/components/confirmation/flight/FlightConfirmationJourneyCard";
import FlightConfirmationPassengerCard from "@/app/components/confirmation/flight/FlightConfirmationPassengerCard";
import FlightConfirmationFareCard from "@/app/components/confirmation/flight/FlightConfirmationFareCard";

import {
  getAllBookings,
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

type ConfirmationPayload = any;

function normalizeTravellerValidation(payload: ConfirmationPayload | null) {
  const travellerValidation = payload?.travellerValidation || {};

  return {
    ...travellerValidation,
    travellers: Array.isArray(travellerValidation?.travellers)
      ? travellerValidation.travellers.map((item: any, index: number) => ({
          ...item,
          id: item?.id || `traveller-${index + 1}`,
          title: item?.title || item?.salutation || "Mr",
          firstName: item?.firstName || "",
          middleName: item?.middleName || "",
          lastName: item?.lastName || "",
          travellerType: item?.travellerType || item?.type || "adult",
        }))
      : [],
    contactDetails: {
      ...(travellerValidation?.contactDetails || {}),
      email: travellerValidation?.contactDetails?.email || "",
      mobile:
        travellerValidation?.contactDetails?.mobile ||
        travellerValidation?.contactDetails?.phone ||
        "",
    },
  };
}

export default function FlightBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<ConfirmationPayload | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadBookingDetail = () => {
      const all = getAllBookings();
      const found = all.find((item) => item.id === bookingId) || null;
      setBooking(found);

      if (found?.payloadStorageKey) {
        const savedPayload = getBookingPayload<ConfirmationPayload>(
          found.payloadStorageKey
        );

        setPayload(savedPayload ? { ...savedPayload } : null);
      } else {
        setPayload(null);
      }

      setRefreshKey((prev) => prev + 1);
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

  const reviewData = payload?.reviewData;
  const travellerValidation = useMemo(
    () => normalizeTravellerValidation(payload),
    [payload, refreshKey]
  );

  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;
  const paymentData = payload?.paymentData || {};
  const managePayment = payload?.managePayment || {};

  const priceBreakup = useMemo(() => {
    const pricing = reviewData?.pricing || {};

    const recalculatedTotal = Math.max(
      (pricing.perAdultBaseFare || 0) *
        ((reviewData?.passengers?.adults || 0) +
          (reviewData?.passengers?.children || 0) +
          (reviewData?.passengers?.infants || 0)) +
        (pricing.tax || 0) +
        (pricing.surcharge || 0) +
        (seatMealData?.seatTotal || 0) +
        (seatMealData?.mealTotal || 0) +
        (cabData?.cabPrice || 0) +
        (insuranceData?.insurancePrice || 0) +
        (addonsData?.addonsPrice || 0) -
        (offerData?.discountAmount || 0) -
        (pricing.discount || 0) -
        (pricing.tplCredit || 0),
      0
    );

    const totalAmount =
      managePayment?.updatedTotalAmount ||
      paymentData?.totalPaid ||
      recalculatedTotal;

    return {
      baseFare:
        (pricing.perAdultBaseFare || 0) *
        ((reviewData?.passengers?.adults || 0) +
          (reviewData?.passengers?.children || 0) +
          (reviewData?.passengers?.infants || 0)),
      tax: pricing.tax || 0,
      surcharge: pricing.surcharge || 0,
      seatTotal: seatMealData?.seatTotal || 0,
      mealTotal: seatMealData?.mealTotal || 0,
      cabTotal: cabData?.cabPrice || 0,
      insuranceTotal: insuranceData?.insurancePrice || 0,
      addonsTotal: addonsData?.addonsPrice || 0,
      appliedOffer: offerData?.discountAmount || 0,
      discount: pricing.discount || 0,
      tplCredit: pricing.tplCredit || 0,
      totalAmount,
    };
  }, [
    reviewData,
    seatMealData,
    cabData,
    insuranceData,
    addonsData,
    offerData,
    paymentData,
    managePayment,
  ]);

  const firstJourney = reviewData?.journeys?.[0];
  const firstSegment = firstJourney?.segments?.[0];
  const lastJourney = reviewData?.journeys?.[reviewData?.journeys?.length - 1];
  const lastSegment =
    lastJourney?.segments?.[lastJourney?.segments?.length - 1] || firstSegment;

  const routeTitle =
    reviewData?.bookingType === "roundTrip"
      ? `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        } → ${lastSegment?.toCode || lastSegment?.to || "ORG"}`
      : reviewData?.bookingType === "multiCity"
      ? "Multi City Flight Booking"
      : `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
          firstSegment?.toCode || firstSegment?.to || "DST"
        }`;

  const airlineSummary =
    firstSegment?.airline && firstSegment?.flightNumber
      ? `${firstSegment.airline} • ${firstSegment.flightNumber}`
      : "Flight Ticket";

  const journeyDateLabel = firstSegment?.departureDate || null;

  if (!booking || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#eef3f8]">
        <div className="bg-white p-6 rounded-xl border font-semibold">
          Booking detail not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] text-black">
      <div className="h-[72px] bg-white border-b flex justify-between items-center px-6">
        <div className="text-2xl font-black">TPL</div>

        <button
          onClick={() => router.push("/account/bookings")}
          className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-5 py-2 text-[13px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:bg-[#f8fbff] hover:border-[#bfd3ea]"
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
          <span>Back to My Bookings</span>
        </button>
      </div>

      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-[22px] font-black text-slate-900">
            Flight Booking Detail
          </div>
          <div className="text-sm text-slate-600 mt-1">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="w-full flex flex-col gap-4">
          <div className="rounded-[24px] border border-[#d9e2ec] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="min-h-[60px] px-5 border-b border-[#e5e7eb] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-black text-[#111827]">
                Booking Summary
              </h2>

              <button
                type="button"
                onClick={() => router.push("/account/bookings")}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition hover:bg-[#f8fbff] hover:border-[#bfd3ea]"
              >
                <span style={{ fontSize: "13px", lineHeight: 1 }}>←</span>
                <span>Back</span>
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <InfoCard label="Booking Status" value={capitalize(booking.status)} />
              <InfoCard label="Payment Status" value="Paid" />
              <InfoCard
                label="Booked On"
                value={formatDateTime(
                  managePayment?.paidAt ||
                    paymentData?.paidAt ||
                    booking.bookingDate
                )}
              />
              <InfoCard label="Travel Date" value={journeyDateLabel || "-"} />
              <InfoCard label="Booking Type" value={reviewData?.bookingType || "-"} />
              <InfoCard label="Trip Mode" value={reviewData?.tripMode || "-"} />
              <InfoCard label="Cabin Class" value={reviewData?.cabinClass || "-"} />
              <InfoCard label="Airline Summary" value={airlineSummary} />
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4 text-[15px] font-bold text-[#0f172a]">
                {routeTitle}
              </div>
            </div>
          </div>

          <FlightConfirmationJourneyCard
            journeys={reviewData?.journeys || []}
            cabinClass={reviewData?.cabinClass}
          />

          <FlightConfirmationPassengerCard
            key={`passenger-${refreshKey}`}
            travellerValidation={travellerValidation}
            seatMealData={seatMealData}
            cabData={cabData}
            insuranceData={insuranceData}
            addonsData={addonsData}
          />

          <FlightConfirmationFareCard
            priceBreakup={priceBreakup}
            paymentMethod={
              managePayment?.method ||
              paymentData?.method ||
              "Online Payment"
            }
            paymentStatus="paid"
            paidAt={
              managePayment?.paidAt ||
              paymentData?.paidAt ||
              booking.bookingDate
            }
          />
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.7px] text-[#64748b] mb-2">
        {label}
      </div>
      <div className="text-[14px] font-extrabold text-[#111827] leading-[20px] break-words">
        {value || "-"}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(value: string) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}