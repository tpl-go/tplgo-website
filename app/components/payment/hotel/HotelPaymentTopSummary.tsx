"use client";

import { useMemo, useState } from "react";
import type { Hotel, RoomVariant } from "@/app/data/stays/types";

type SearchMeta = {
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
};

type GuestItem = {
  firstName?: string;
  lastName?: string;
  label?: string;
};

type Props = {
  hotel: Hotel;
  selectedVariant: RoomVariant | null;
  searchMeta: SearchMeta;
  guestValidation?: {
    guests?: GuestItem[];
    isValid?: boolean;
    travellers?: GuestItem[];
    contactDetails?: {
      countryCode?: string;
      mobile?: string;
      email?: string;
    };
  } | null;
  tripSecureData?: {
    selected: boolean;
    amount: number;
  };
  cabData?: {
    selected: boolean;
    amount: number;
    label: string;
  };
  addonsData?: {
    selected: boolean;
    amount: number;
    label: string;
  };
  offerData?: {
    code?: string;
    title?: string;
    amount?: number;
  } | null;
  specialRequest?: string;
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Not selected";

  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function calculateNights(checkIn?: string, checkOut?: string) {
  const start = parseLocalDate(checkIn || "");
  const end = parseLocalDate(checkOut || "");

  if (!start || !end) return 1;

  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

function parseLocalDate(value: string) {
  if (!value) return null;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function travellerFullName(traveller?: GuestItem) {
  const fullName = [
    traveller?.firstName?.trim(),
    traveller?.lastName?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || traveller?.label || "Primary Guest";
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
      <div className="mb-1 text-[13px] font-bold text-[#6b7280]">{label}</div>
      <div className="text-[14px] font-semibold leading-[22px] text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[13px] font-bold text-[#6b7280]">
      {children}
    </div>
  );
}

export default function HotelPaymentTopSummary({
  hotel,
  selectedVariant,
  searchMeta,
  guestValidation,
  tripSecureData,
  cabData,
  addonsData,
  offerData,
  specialRequest = "",
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const nights = calculateNights(searchMeta.checkIn, searchMeta.checkOut);

  const primaryTraveller =
    guestValidation?.travellers?.[0] ||
    guestValidation?.guests?.[0] ||
    null;

  const primaryGuestName = travellerFullName(primaryTraveller);

  const guestSummary = useMemo(() => {
    const adults = searchMeta.adults || 0;
    const children = searchMeta.children || 0;

    return `${searchMeta.rooms} Room${searchMeta.rooms > 1 ? "s" : ""}, ${adults} Adult${
      adults > 1 ? "s" : ""
    }${children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}`;
  }, [searchMeta]);

  const roomSummary = selectedVariant
    ? `${selectedVariant.name} • ${selectedVariant.mealPlan} • ${selectedVariant.cancellation}`
    : "Base room selected";

  const contactSummary = `${
    guestValidation?.contactDetails?.email || "email@example.com"
  }, ${(guestValidation?.contactDetails?.countryCode || "+91")}-${
    guestValidation?.contactDetails?.mobile || "0000000000"
  }`;

  const tripSecureSummary =
    tripSecureData?.selected && (tripSecureData.amount || 0) > 0
      ? `Selected • ₹${tripSecureData.amount.toLocaleString("en-IN")}`
      : "Skipped";

  const cabSummary =
    cabData?.selected && (cabData.amount || 0) > 0
      ? `${cabData.label} • ₹${cabData.amount.toLocaleString("en-IN")}`
      : "Skipped";

  const addonsSummary =
    addonsData?.selected && (addonsData.amount || 0) > 0
      ? `${addonsData.label} • ₹${addonsData.amount.toLocaleString("en-IN")}`
      : "Skipped";

  const offerSummary =
    offerData?.amount && offerData.amount > 0
      ? `${offerData.code || "OFFER"} • Save ₹${offerData.amount.toLocaleString(
          "en-IN"
        )}`
      : "No offer applied";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#eef6ff] shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:rounded-[18px]">
      <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between md:gap-4 md:px-5 md:py-[18px]">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[28px] leading-none">🏨</div>

          <h2 className="m-0 text-[20px] font-extrabold leading-[27px] text-[#1f2937] md:text-[22px] md:leading-[30px]">
            {hotel.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold leading-5 text-[#4b5563] md:gap-2 md:text-[14px]">
            <span>
              {hotel.area}, {hotel.city}
            </span>
            <span>|</span>
            <span>{formatDateLabel(searchMeta.checkIn)}</span>
            <span>→</span>
            <span>{formatDateLabel(searchMeta.checkOut)}</span>
            <span>|</span>
            <span>
              {nights} Night{nights > 1 ? "s" : ""}
            </span>
            <span>|</span>
            <span>{guestSummary}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="self-start whitespace-nowrap border-0 bg-transparent text-[13px] font-extrabold text-[#1d9bf0] md:pt-[6px] md:text-[14px]"
        >
          {showDetails ? "HIDE DETAILS ▲" : "VIEW DETAILS ▼"}
        </button>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#d9e2ec] bg-white px-4 py-4 md:flex-row md:flex-wrap md:justify-between md:gap-[18px] md:px-5">
        <div className="min-w-0">
          <div className="mb-1 text-[13px] font-bold text-[#6b7280]">
            Booking details will be sent to:
          </div>

          <div className="text-[15px] font-bold text-[#1f2937]">
            {primaryGuestName}
          </div>

          <div className="mt-1 text-[13px] font-medium text-[#4b5563]">
            {contactSummary}
          </div>
        </div>

        <div className="min-w-0 md:min-w-[260px]">
          <div className="mb-1 text-[13px] font-bold text-[#6b7280]">
            Hotel Stay Summary
          </div>

          <div className="text-[15px] font-bold text-[#1f2937]">
            {roomSummary}
          </div>

          <div className="mt-1 text-[13px] font-medium text-[#4b5563]">
            {hotel.area}, {hotel.city}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 gap-4 border-t border-[#d9e2ec] bg-[#f8fbff] px-4 py-4 md:grid-cols-[1.2fr_1fr] md:gap-[18px] md:px-5">
          <div>
            <SectionLabel>Hotel Booking Summary</SectionLabel>

            <div className="grid gap-3">
              <div className="rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
                <div className="mb-2 text-[14px] font-extrabold text-[#111827]">
                  Property Details
                </div>

                <div className="grid gap-3">
                  <InfoRow label="Hotel" value={hotel.title} />
                  <InfoRow
                    label="Location"
                    value={`${hotel.area}, ${hotel.city}`}
                  />
                  <InfoRow
                    label="Check-In / Check-Out"
                    value={`${formatDateLabel(
                      searchMeta.checkIn
                    )} → ${formatDateLabel(searchMeta.checkOut)}`}
                  />
                  <InfoRow
                    label="Stay Duration"
                    value={`${nights} Night${nights > 1 ? "s" : ""}`}
                  />
                  <InfoRow label="Rooms & Guests" value={guestSummary} />
                  <InfoRow label="Selected Room" value={roomSummary} />
                  <InfoRow
                    label="Room Capacity"
                    value={
                      selectedVariant
                        ? `${selectedVariant.maxAdults} Adults${
                            selectedVariant.maxChildren > 0
                              ? `, ${selectedVariant.maxChildren} Children`
                              : ""
                          }`
                        : "Standard capacity"
                    }
                  />
                  <InfoRow
                    label="Amenities"
                    value={
                      selectedVariant?.amenities?.join(" • ") ||
                      hotel.amenities?.slice(0, 6).join(" • ") ||
                      "Amenities available"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Guest, Add-ons & Request Summary</SectionLabel>

            <div className="grid gap-3 rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
              <InfoRow label="Primary Guest" value={primaryGuestName} />
              <InfoRow label="Contact" value={contactSummary} />
              <InfoRow label="Trip Secure" value={tripSecureSummary} />
              <InfoRow label="Cab" value={cabSummary} />
              <InfoRow label="Add-ons" value={addonsSummary} />
              <InfoRow label="Applied Offer" value={offerSummary} />
              <InfoRow
                label="Special Request"
                value={specialRequest.trim() || "No special request added"}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
