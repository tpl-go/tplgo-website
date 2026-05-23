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
    <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-6 py-6 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <ShieldCheck size={34} />
            </div>

            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-white/90">
                Policy Issued Successfully
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight">
                {provider} — {planName}
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/90">
                Your travel insurance policy is confirmed and ready.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/15 px-5 py-4 backdrop-blur">
            <p className="text-xs font-bold text-white/80">Policy Status</p>
            <p className="mt-1 text-lg font-black text-white">
              {policyStatus || "Active"}
            </p>

            <p className="mt-3 text-xs font-bold text-white/80">
              Payment Status
            </p>
            <p className="mt-1 text-sm font-black text-white">
              {paymentStatus || "Paid"}
            </p>
          </div>
        </div>

        {earnedCreditAmount > 0 && (
          <div className="mt-5 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-extrabold backdrop-blur">
            🎁 You earned ₹
            {Number(earnedCreditAmount).toLocaleString("en-IN")} TPL Earned
            Credit on this policy booking.
          </div>
        )}
      </div>

      <div className="grid gap-3 px-6 py-5 md:grid-cols-3">
        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Policy Number</p>
          <p className="mt-1 break-all text-sm font-black text-gray-950">
            {policyNumber}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Booking ID</p>
          <p className="mt-1 break-all text-sm font-black text-gray-950">
            {bookingId}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="text-xs font-bold text-gray-500">Booked On</p>
          <p className="mt-1 text-sm font-black text-gray-950">
            {formatDate(bookedOn)}
          </p>
        </div>
      </div>
    </section>
  );
}