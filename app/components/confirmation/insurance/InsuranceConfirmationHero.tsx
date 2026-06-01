"use client";

import { ShieldCheck } from "lucide-react";

type Props = {
  policyNumber: string;
  bookingId: string;
  provider: string;
  planName: string;
  policyStatus: string;
  paymentStatus: string;
  bookedOn: string;
  earnedCreditAmount?: number;
};

function formatDate(value: string) {
  if (!value) return "Today";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InsuranceConfirmationHero({
  policyNumber,
  bookingId,
  provider,
  planName,
  policyStatus,
  paymentStatus,
  bookedOn,
  earnedCreditAmount = 0,
}: Props) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm md:rounded-3xl">
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-4 py-5 text-white md:px-6 md:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3 md:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur md:h-16 md:w-16">
              <ShieldCheck className="h-7 w-7 md:h-[34px] md:w-[34px]" />
            </div>

            <div className="min-w-0">
              <p className="break-words text-xs font-extrabold uppercase tracking-wide text-white/90 md:text-sm">
                Policy Issued Successfully
              </p>

              <h1 className="mt-1 break-words text-2xl font-black leading-8 tracking-tight md:text-3xl md:leading-9">
                {provider} — {planName}
              </h1>

              <p className="mt-2 break-words text-sm font-semibold leading-5 text-white/90">
                Your travel insurance policy is confirmed and ready.
              </p>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur md:px-5 md:py-4 lg:w-auto">
            <p className="text-xs font-bold text-white/80">Policy Status</p>
            <p className="mt-1 break-words text-lg font-black text-white">
              {policyStatus || "Active"}
            </p>

            <p className="mt-3 text-xs font-bold text-white/80">
              Payment Status
            </p>
            <p className="mt-1 break-words text-sm font-black text-white">
              {paymentStatus || "Paid"}
            </p>
          </div>
        </div>

        {earnedCreditAmount > 0 && (
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-extrabold leading-5 backdrop-blur md:mt-5">
            🎁 You earned ₹
            {Number(earnedCreditAmount).toLocaleString("en-IN")} TPL Earned
            Credit on this policy booking.
          </div>
        )}
      </div>

      <div className="grid gap-3 px-4 py-4 md:grid-cols-3 md:px-6 md:py-5">
        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Policy Number</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {policyNumber}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Booking ID</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {bookingId}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Booked On</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {formatDate(bookedOn)}
          </p>
        </div>
      </div>
    </section>
  );
}
