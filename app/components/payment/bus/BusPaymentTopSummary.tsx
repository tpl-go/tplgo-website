"use client";

import { useMemo, useState } from "react";

type TravellerItem = {
  seatNumber?: string;
  fullName?: string;
  age?: string;
  gender?: string;
};

type Props = {
  bookingPayload: {
    search: {
      fromCity: string;
      fromPoint: string;
      toCity: string;
      toPoint: string;
      date: string;
    };
    bus: any;
    selectedSeats: { seatNumber: string; price: number }[];
    selectedBoardingPoint: {
      id: string;
      name: string;
      address: string;
      time: string;
    };
    selectedDroppingPoint: {
      id: string;
      name: string;
      address: string;
      time: string;
    };
    totalFare: number;
    travellerCount: number;
  };
  travellers?: TravellerItem[];
  contactDetails?: {
    email?: string;
    mobile?: string;
    state?: string;
  } | null;
  addons?: {
    tripAssuredSelected?: boolean;
    tripAssuredTotal?: number;
    freeCancellationSelected?: boolean;
    freeCancellationTotal?: number;
  } | null;
  offerData?: {
    code?: string;
    title?: string;
    discountAmount?: number;
  } | null;
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Not selected";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function travellerFullName(traveller?: TravellerItem) {
  return traveller?.fullName?.trim() || "Primary Traveller";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[12px] font-bold text-[#6b7280]">{label}</div>
      <div className="break-words text-[13px] font-semibold leading-[20px] text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[12px] font-bold text-[#6b7280]">
      {children}
    </div>
  );
}

export default function BusPaymentTopSummary({
  bookingPayload,
  travellers = [],
  contactDetails,
  addons,
  offerData,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const primaryTraveller = travellers?.[0] || null;
  const primaryTravellerName = travellerFullName(primaryTraveller);

  const contactSummary = `${contactDetails?.email || "email@example.com"}, +91-${
    contactDetails?.mobile || "0000000000"
  }`;

  const tripSecureSummary =
    addons?.tripAssuredSelected && (addons?.tripAssuredTotal || 0) > 0
      ? `Selected • ₹${(addons?.tripAssuredTotal || 0).toLocaleString("en-IN")}`
      : "Skipped";

  const freeCancellationSummary =
    addons?.freeCancellationSelected && (addons?.freeCancellationTotal || 0) > 0
      ? `Selected • ₹${(addons?.freeCancellationTotal || 0).toLocaleString(
          "en-IN"
        )}`
      : "Skipped";

  const offerSummary =
    offerData?.discountAmount && offerData.discountAmount > 0
      ? `${offerData.code || "OFFER"} • Save ₹${offerData.discountAmount.toLocaleString(
          "en-IN"
        )}`
      : "No offer applied";

  const seatSummary = useMemo(() => {
    return bookingPayload.selectedSeats.map((item) => item.seatNumber).join(", ");
  }, [bookingPayload.selectedSeats]);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-[#eef6ff] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 px-4 py-[18px] sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[24px] leading-none">🚌</div>

          <h2 className="m-0 break-words text-[18px] font-extrabold leading-[26px] text-[#1f2937] sm:text-[20px] sm:leading-[28px]">
            {bookingPayload.bus.operatorName} ({bookingPayload.bus.busName})
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2 break-words text-[13px] font-semibold text-[#4b5563]">
            <span>{bookingPayload.search.fromCity}</span>
            <span>→</span>
            <span>{bookingPayload.search.toCity}</span>
            <span>|</span>
            <span>{formatDateLabel(bookingPayload.search.date)}</span>
            <span>|</span>
            <span>{bookingPayload.bus.busType}</span>
            <span>|</span>
            <span>{bookingPayload.travellerCount} Traveller{bookingPayload.travellerCount > 1 ? "s" : ""}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="h-10 w-full rounded-xl border border-[#bfdbfe] bg-white px-3 text-[13px] font-extrabold text-[#1d9bf0] sm:w-auto sm:whitespace-nowrap sm:border-0 sm:bg-transparent sm:pt-[6px]"
        >
          {showDetails ? "HIDE DETAILS ▲" : "VIEW DETAILS ▼"}
        </button>
      </div>

      <div className="flex flex-col gap-[18px] border-t border-[#d9e2ec] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Booking details will be sent to:
          </div>

          <div className="break-words text-[14px] font-bold text-[#1f2937]">
            {primaryTravellerName}
          </div>

          <div className="mt-1 break-words text-[12px] font-medium text-[#4b5563]">
            {contactSummary}
          </div>
        </div>

        <div className="min-w-0 sm:min-w-[260px]">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Bus Journey Summary
          </div>

          <div className="break-words text-[14px] font-bold text-[#1f2937]">
            Seats: {seatSummary}
          </div>

          <div className="mt-1 break-words text-[12px] font-medium text-[#4b5563]">
            {bookingPayload.selectedBoardingPoint.name} →{" "}
            {bookingPayload.selectedDroppingPoint.name}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 gap-[18px] border-t border-[#d9e2ec] bg-[#f8fbff] px-4 py-4 md:grid-cols-[1.2fr_1fr] md:px-5">
          <div className="min-w-0">
            <SectionLabel>Bus Booking Summary</SectionLabel>

            <div className="grid gap-3">
              <div className="rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
                <div className="mb-2 text-[13px] font-extrabold text-[#111827]">
                  Route & Bus Details
                </div>

                <div className="grid gap-3">
                  <InfoRow
                    label="Operator"
                    value={`${bookingPayload.bus.operatorName} (${bookingPayload.bus.busName})`}
                  />
                  <InfoRow
                    label="Route"
                    value={`${bookingPayload.search.fromCity} → ${bookingPayload.search.toCity}`}
                  />
                  <InfoRow
                    label="Journey Date"
                    value={formatDateLabel(bookingPayload.search.date)}
                  />
                  <InfoRow
                    label="Departure / Arrival"
                    value={`${bookingPayload.bus.departureTime} → ${bookingPayload.bus.arrivalTime}`}
                  />
                  <InfoRow
                    label="Duration"
                    value={bookingPayload.bus.duration}
                  />
                  <InfoRow
                    label="Seats Selected"
                    value={seatSummary}
                  />
                  <InfoRow
                    label="Boarding Point"
                    value={`${bookingPayload.selectedBoardingPoint.name} • ${bookingPayload.selectedBoardingPoint.time}`}
                  />
                  <InfoRow
                    label="Dropping Point"
                    value={`${bookingPayload.selectedDroppingPoint.name} • ${bookingPayload.selectedDroppingPoint.time}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <SectionLabel>Traveller, Add-ons & Offer Summary</SectionLabel>

            <div className="grid gap-3 rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
              <InfoRow label="Primary Traveller" value={primaryTravellerName} />
              <InfoRow label="Contact" value={contactSummary} />
              <InfoRow label="Trip Secure" value={tripSecureSummary} />
              <InfoRow
                label="Free Cancellation"
                value={freeCancellationSummary}
              />
              <InfoRow label="Applied Offer" value={offerSummary} />
              <InfoRow
                label="State"
                value={contactDetails?.state || "Not selected"}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
