"use client";

import { useState } from "react";

type CancelBookingModalProps = {
  isOpen: boolean;
  bookingTitle?: string;
  bookingId?: string;
  travelDate?: string;
  refundableAmount?: number;
  cancellationCharge?: number;
  policyText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CancelBookingModal({
  isOpen,
  bookingTitle,
  bookingId,
  travelDate,
  refundableAmount = 0,
  cancellationCharge = 0,
  policyText,
  onClose,
  onConfirm,
}: CancelBookingModalProps) {
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-end justify-center overflow-x-hidden bg-black/40 px-3 py-3 md:items-center md:px-4 md:py-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-xl flex-col overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:max-h-[min(720px,calc(100vh-48px))] md:rounded-[24px]"
        >
          {/* Cross */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[16px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            title="Close"
          >
            ×
          </button>

          <div className="shrink-0 border-b border-gray-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] px-4 py-4 pr-16 md:px-6 md:py-5">
            <h3 className="text-[18px] font-black text-slate-900 md:text-[20px]">
              Cancel Booking
            </h3>
            <p className="mt-1 text-[13px] text-slate-600">
              Please review refund and cancellation details before continuing.
            </p>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 md:space-y-5 md:px-6 md:py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.7px] text-slate-500">
                Booking
              </div>

              <div className="mt-2 break-words text-[16px] font-bold text-slate-900">
                {bookingTitle || "Booking"}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2">
                <p className="min-w-0 break-words">
                  <span className="font-semibold text-slate-800">Booking ID:</span>{" "}
                  {bookingId || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Travel Date:</span>{" "}
                  {travelDate || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.7px] text-red-500">
                  Cancellation Charge
                </div>
                <div className="mt-2 text-[21px] font-black text-red-700 md:text-[22px]">
                  ₹{cancellationCharge.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.7px] text-green-600">
                  Refundable Amount
                </div>
                <div className="mt-2 text-[21px] font-black text-green-700 md:text-[22px]">
                  ₹{refundableAmount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="break-words rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-[13px] font-medium leading-6 text-slate-600">
              {policyText || "Refund will be processed as per current policy."}
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 px-4 py-4 md:flex md:items-center md:justify-between md:gap-4 md:px-6 md:py-5">
            <button
              type="button"
              onClick={() => setShowPolicyPopup(true)}
              className="w-full text-left text-[13px] font-semibold text-[#0b5fff] transition hover:underline md:w-auto"
            >
              Cancellation Policy
            </button>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:mt-0 md:flex md:items-center md:justify-end md:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-gray-300 px-5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="h-11 rounded-xl bg-red-600 px-5 text-[12px] font-bold text-white transition hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPolicyPopup && (
        <div
          onClick={() => setShowPolicyPopup(false)}
          className="fixed inset-0 z-[10000] flex items-end justify-center overflow-x-hidden bg-black/45 px-3 py-3 md:items-center md:px-4 md:py-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:max-h-[min(760px,calc(100vh-48px))] md:rounded-[24px]"
          >
            <button
              type="button"
              onClick={() => setShowPolicyPopup(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[16px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Close"
            >
              ×
            </button>

            <div className="shrink-0 border-b border-gray-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4 pr-16 md:px-6 md:py-5">
              <h4 className="text-[18px] font-black text-slate-900 md:text-[19px]">
                Cancellation Policy
              </h4>
              <p className="mt-1 text-[13px] text-slate-600">
                Please read the full policy before cancelling this booking.
              </p>
            </div>

            <div className="min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line break-words text-[13px] leading-6 text-slate-700 md:text-[14px] md:leading-7">
  {`1. Cancellation request once submitted and confirmed may not be reversible automatically.

2. Refund amount is calculated according to the active fare rule, supplier policy, travel date proximity, and any non-refundable service component.

3. Payment gateway charges, supplier service fees, seat / meal / insurance / add-on charges may be partially refundable or fully non-refundable depending on the selected product.

4. Refund processing may complete in multiple stages depending on airline, hotel, package vendor, bank, wallet, UPI, card network, or settlement partner.

5. TPL may show an estimated refundable amount during cancellation, but final refund may vary if supplier-side rules, manual review, or post-booking changes apply.

6. Once cancellation is completed, the booking will move to cancelled status and refund tracking will continue under refund status.`}
</p>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 px-4 py-4 md:flex md:justify-end md:px-6">
              <button
                type="button"
                onClick={() => setShowPolicyPopup(false)}
                className="h-11 w-full rounded-xl border border-gray-300 px-5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 md:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
