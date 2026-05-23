"use client";

import { useState } from "react";

type TravellerItem = {
  fullName?: string;
  age?: string;
  gender?: string;
  berthPreference?: string;
};

type Props = {
  paymentPayload: {
    bookingPayload: {
      trainId?: string;
      trainName: string;
      trainNumber: string;
      fromCity: string;
      fromCode: string;
      toCity: string;
      toCode: string;
      travelDate: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
      classCode: string;
      quota: string;
      bookingType: string;
      ticketPrice: number;
      statusText?: string;
    };
    travellers: TravellerItem[];
    contactDetails: {
      email?: string;
      mobile?: string;
    };
    irctcAccount: {
      username?: string;
    };
    appliedOffer?: {
      code?: string;
      title?: string;
      discountAmount?: number;
    } | null;
  };
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-bold text-[#6b7280]">{label}</div>
      <div className="text-[13px] font-semibold leading-[20px] text-[#1f2937]">
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

export default function TrainPaymentTopSummary({
  paymentPayload,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const { bookingPayload, travellers, contactDetails, irctcAccount, appliedOffer } =
    paymentPayload;

  const primaryTraveller = travellers?.[0];
  const primaryTravellerName =
    primaryTraveller?.fullName?.trim() || "Primary Traveller";

  const contactSummary = `${contactDetails?.email || "email@example.com"}, +91-${
    contactDetails?.mobile || "0000000000"
  }`;

  const offerSummary =
    appliedOffer?.discountAmount && appliedOffer.discountAmount > 0
      ? `${appliedOffer.code || "OFFER"} • Save ₹${appliedOffer.discountAmount.toLocaleString(
          "en-IN"
        )}`
      : "No offer applied";

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-[#eef6ff] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4 px-5 py-[18px]">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[24px] leading-none">🚆</div>

          <h2 className="m-0 text-[20px] font-extrabold leading-[28px] text-[#1f2937]">
            {bookingPayload.trainName}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#4b5563]">
            <span>#{bookingPayload.trainNumber}</span>
            <span>|</span>
            <span>{bookingPayload.fromCity}</span>
            <span>→</span>
            <span>{bookingPayload.toCity}</span>
            <span>|</span>
            <span>{formatDateLabel(bookingPayload.travelDate)}</span>
            <span>|</span>
            <span>{bookingPayload.classCode}</span>
            <span>|</span>
            <span>{travellers.length} Traveller{travellers.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="whitespace-nowrap border-0 bg-transparent pt-[6px] text-[13px] font-extrabold text-[#1d9bf0]"
        >
          {showDetails ? "HIDE DETAILS ▲" : "VIEW DETAILS ▼"}
        </button>
      </div>

      <div className="flex flex-wrap justify-between gap-[18px] border-t border-[#d9e2ec] bg-white px-5 py-4">
        <div className="min-w-0">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Booking details will be sent to:
          </div>

          <div className="text-[14px] font-bold text-[#1f2937]">
            {primaryTravellerName}
          </div>

          <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
            {contactSummary}
          </div>
        </div>

        <div className="min-w-[260px]">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Train Journey Summary
          </div>

          <div className="text-[14px] font-bold text-[#1f2937]">
            {bookingPayload.classCode} • {bookingPayload.quota}
          </div>

          <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
            {bookingPayload.fromCode} → {bookingPayload.toCode}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-[1.2fr_1fr] gap-[18px] border-t border-[#d9e2ec] bg-[#f8fbff] px-5 py-4">
          <div>
            <SectionLabel>Train Booking Summary</SectionLabel>

            <div className="grid gap-3">
              <div className="rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
                <div className="mb-2 text-[13px] font-extrabold text-[#111827]">
                  Route & Train Details
                </div>

                <div className="grid gap-3">
                  <InfoRow
                    label="Train"
                    value={`${bookingPayload.trainName} (#${bookingPayload.trainNumber})`}
                  />
                  <InfoRow
                    label="Route"
                    value={`${bookingPayload.fromCity} (${bookingPayload.fromCode}) → ${bookingPayload.toCity} (${bookingPayload.toCode})`}
                  />
                  <InfoRow
                    label="Journey Date"
                    value={formatDateLabel(bookingPayload.travelDate)}
                  />
                  <InfoRow
                    label="Departure / Arrival"
                    value={`${bookingPayload.departureTime} → ${bookingPayload.arrivalTime}`}
                  />
                  <InfoRow
                    label="Duration"
                    value={bookingPayload.duration}
                  />
                  <InfoRow
                    label="Class / Quota"
                    value={`${bookingPayload.classCode} • ${bookingPayload.quota}`}
                  />
                  <InfoRow
                    label="Booking Type"
                    value={bookingPayload.bookingType}
                  />
                  <InfoRow
                    label="Status"
                    value={bookingPayload.statusText || "Selected"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Traveller, IRCTC & Offer Summary</SectionLabel>

            <div className="grid gap-3 rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
              <InfoRow label="Primary Traveller" value={primaryTravellerName} />
              <InfoRow label="Contact" value={contactSummary} />
              <InfoRow
                label="IRCTC Username"
                value={irctcAccount?.username || "Not entered"}
              />
              <InfoRow label="Applied Offer" value={offerSummary} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}