"use client";

import { useEffect, useMemo, useState } from "react";

type TripSecureStatus = "pending" | "selected" | "skipped";

export type TripSecurePayload = {
  tripSecureStatus: TripSecureStatus;
  tripSecureLabel: string;
  tripSecurePrice: number;
};

type Props = {
  isEnabled: boolean;
  onChange?: (payload: TripSecurePayload) => void;
};

const TRIP_SECURE_PRICE = 499;

export default function HotelBookingTripSecureSection({
  isEnabled,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState<
    "yes" | "no" | "pending"
  >("pending");

  const tripSecureStatus: TripSecureStatus = useMemo(() => {
    if (selectedOption === "yes") return "selected";
    if (selectedOption === "no") return "skipped";
    return "pending";
  }, [selectedOption]);

  const tripSecurePrice =
    selectedOption === "yes" ? TRIP_SECURE_PRICE : 0;

  const summaryText =
    tripSecureStatus === "selected"
      ? `Trip Secure selected - ₹${tripSecurePrice.toLocaleString("en-IN")}`
      : tripSecureStatus === "skipped"
      ? "Trip Secure skipped"
      : "No trip secure option selected";

  useEffect(() => {
    onChange?.({
      tripSecureStatus,
      tripSecureLabel:
        selectedOption === "yes"
          ? "Trip Secure selected"
          : selectedOption === "no"
          ? "Trip Secure skipped"
          : "No trip secure option selected",
      tripSecurePrice,
    });
  }, [tripSecureStatus, selectedOption, tripSecurePrice, onChange]);

  return (
    <section className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white">
      <div
        className="flex min-h-[58px] cursor-pointer items-center justify-between gap-3 border-b border-[#d9e2ec] bg-[#fffdf4] px-3 md:gap-4 md:px-5"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[12px] font-extrabold text-white ${
              isEnabled ? "bg-[#22c55e]" : "bg-[#d9534f]"
            }`}
          >
            {isEnabled ? "✓" : "!"}
          </span>

          <h3 className="text-[17px] font-extrabold text-[#1f2937] md:text-[18px]">
            Trip Secure
          </h3>
        </div>

        <span
          className={`text-[18px] font-bold text-[#55a8d8] transition ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        >
          ˅
        </span>
      </div>

      {isOpen && (
        <div className="border-t border-[#e5e7eb] bg-white p-3 md:p-5">
          {!isEnabled ? (
            <div className="rounded-lg border border-[#f3d2d0] bg-[#fff7f7] p-4 md:p-5">
              <div className="text-[17px] font-extrabold text-[#111827] md:text-[18px]">
                Trip Secure locked
              </div>
              <div className="mt-2 text-[14px] leading-6 text-[#6b7280]">
                Please complete Guest Detail section first to continue with Trip
                Secure.
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#d9e2ec] bg-[#f8fbff] p-4 md:p-5">
              <div className="text-[19px] font-extrabold text-[#111827] md:text-[22px]">
                Protect Your Hotel Booking
              </div>

              <div className="mt-2 text-[17px] font-extrabold text-[#111827] md:text-[18px]">
                ₹499{" "}
                <span className="text-[14px] font-semibold text-[#374151]">
                  / Booking
                </span>
              </div>

              <div className="mt-2 text-[14px] leading-6 text-[#4b5563]">
                {summaryText}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_160px]">
                <BenefitCard
                  title="Priority Support"
                  subtitle="Faster help during booking issues"
                />
                <BenefitCard
                  title="Cancellation Help"
                  subtitle="Better support for eligible cases"
                />
                <BenefitCard
                  title="Booking Protection"
                  subtitle="Extra reassurance for stay confirmation"
                />
                <div className="flex min-h-[64px] items-center justify-center rounded-lg border border-[#d9e2ec] bg-white px-3 text-center text-[14px] font-bold text-[#0284c7] md:min-h-[74px]">
                  View Benefits →
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#dbeafe] bg-[#f6fbff] px-3 py-2 text-[13px] font-semibold text-[#374151]">
                Recommended for your stay.
              </div>

              <div className="mt-5 grid gap-3">
                <label className="flex items-center gap-3 text-[15px] font-semibold text-[#111827]">
                  <input
                    type="radio"
                    name="hotel-trip-secure"
                    checked={selectedOption === "yes"}
                    onChange={() => setSelectedOption("yes")}
                  />
                  <span>Yes, secure my hotel booking.</span>
                </label>

                <label className="flex items-center gap-3 text-[15px] font-semibold text-[#111827]">
                  <input
                    type="radio"
                    name="hotel-trip-secure"
                    checked={selectedOption === "no"}
                    onChange={() => setSelectedOption("no")}
                  />
                  <span>No, continue without trip secure.</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function BenefitCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-[64px] rounded-lg border border-[#d9e2ec] bg-white p-3 md:min-h-[74px] md:p-4">
      <div className="text-[15px] font-bold text-[#111827] md:text-[16px]">{title}</div>
      <div className="mt-1 text-[13px] text-[#4b5563]">{subtitle}</div>
    </div>
  );
}
