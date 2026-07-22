"use client";

import { formatCurrency } from "@/app/lib/manage/manageUtils";

interface CancelBookingEntrySectionProps {
  bookingId: string;
  pnr: string;
  refundableAmount: number;
  deductionAmount: number;
  currency?: string;
  onContinue: () => void;
  isSubmitting?: boolean;
  cancellationStatus?: string;
  refundStatus?: string;
  refundMethod?: "original_payment" | "wallet" | "unknown";
  disableContinue?: boolean;
}

export default function CancelBookingEntrySection({
  bookingId,
  pnr,
  refundableAmount,
  deductionAmount,
  currency = "INR",
  onContinue,
  isSubmitting = false,
  cancellationStatus,
  refundStatus,
  refundMethod = "original_payment",
  disableContinue = false,
}: CancelBookingEntrySectionProps) {
  const totalAmount = Number(refundableAmount || 0) + Number(deductionAmount || 0);
  const normalizedCancellationStatus = cancellationStatus || "Final confirmation pending";
  const normalizedRefundStatus = refundStatus || "Not started";
  const refundMethodLabel =
    refundMethod === "wallet" ? "Refund Wallet" : "Original Payment / Bank";

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Cancel Booking
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827] md:text-2xl">
              Review cancellation before continuing
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Cancellation refund will be processed to the original payment mode
              or bank account as per airline and payment rules.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-red-500">
              Cancellation Status
            </p>
            <p className="mt-1 text-sm font-extrabold text-red-700">
              {normalizedCancellationStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <InfoCard label="Booking ID" value={bookingId || "-"} />
        <InfoCard label="PNR" value={pnr || "-"} />
        <InfoCard label="Refund Mode" value={refundMethodLabel} />
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Refund Estimate
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#111827]">
              Cancellation amount summary
            </h3>
            <p className="mt-1 text-sm text-[#6b7280]">
              Final deduction and refund may vary based on airline confirmation.
            </p>
          </div>

          <span className="rounded-full bg-[#fff7f2] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#ff6b00]">
            Estimate Only
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AmountCard
            label="Booking Amount"
            value={formatCurrency(totalAmount, currency)}
            tone="default"
          />
          <AmountCard
            label="Estimated Deduction"
            value={formatCurrency(deductionAmount, currency)}
            tone="danger"
          />
          <AmountCard
            label="Estimated Refund"
            value={formatCurrency(refundableAmount, currency)}
            tone="success"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoCard label="Cancellation Status" value={normalizedCancellationStatus} />
          <InfoCard label="Refund Status" value={normalizedRefundStatus} />
        </div>

        <div className="mt-6 rounded-[22px] border border-red-100 bg-[#fff7f7] px-4 py-4">
          <p className="text-sm font-semibold text-[#111827]">
            Important cancellation note
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            This is a pre-cancellation review. Continue to open the final
            cancellation confirmation flow before the booking is actually
            cancelled.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[#6b7280]">
            Refund Wallet is not used for full booking cancellation refunds.
          </p>

          <button
            type="button"
            onClick={onContinue}
            disabled={isSubmitting || disableContinue}
            className="h-[54px] rounded-full bg-[#111827] px-7 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disableContinue ? "Cancellation Recorded" : isSubmitting ? "Cancelling..." : "Continue to Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function AmountCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-50 text-red-700"
      : tone === "success"
      ? "bg-green-50 text-green-700"
      : "bg-[#f8f9fb] text-[#111827]";

  return (
    <div className={`rounded-[22px] px-4 py-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}