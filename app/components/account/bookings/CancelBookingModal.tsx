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
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl rounded-[24px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden"
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

          <div className="border-b border-gray-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] px-6 py-5 pr-16">
            <h3 className="text-[20px] font-black text-slate-900">
              Cancel Booking
            </h3>
            <p className="mt-1 text-[13px] text-slate-600">
              Please review refund and cancellation details before continuing.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.7px] text-slate-500">
                Booking
              </div>

              <div className="mt-2 text-[16px] font-bold text-slate-900">
                {bookingTitle || "Booking"}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-800">Booking ID:</span>{" "}
                  {bookingId || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Travel Date:</span>{" "}
                  {travelDate || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.7px] text-red-500">
                  Cancellation Charge
                </div>
                <div className="mt-2 text-[22px] font-black text-red-700">
                  ₹{cancellationCharge.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.7px] text-green-600">
                  Refundable Amount
                </div>
                <div className="mt-2 text-[22px] font-black text-green-700">
                  ₹{refundableAmount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-[13px] font-medium leading-6 text-slate-600">
              {policyText || "Refund will be processed as per current policy."}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-6 py-5">
            <button
              type="button"
              onClick={() => setShowPolicyPopup(true)}
              className="text-[13px] font-semibold text-[#0b5fff] transition hover:underline"
            >
              Cancellation Policy
            </button>

            <div className="flex items-center gap-3">
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
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-[24px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setShowPolicyPopup(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[16px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Close"
            >
              ×
            </button>

            <div className="border-b border-gray-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-6 py-5 pr-16">
              <h4 className="text-[19px] font-black text-slate-900">
                Cancellation Policy
              </h4>
              <p className="mt-1 text-[13px] text-slate-600">
                Please read the full policy before cancelling this booking.
              </p>
            </div>

            <div className="max-h-[380px] overflow-y-auto px-6 py-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-line text-[14px] leading-7 text-slate-700">
  {`1. Cancellation request once submitted and confirmed may not be reversible automatically.

2. Refund amount is calculated according to the active fare rule, supplier policy, travel date proximity, and any non-refundable service component.

3. Payment gateway charges, supplier service fees, seat / meal / insurance / add-on charges may be partially refundable or fully non-refundable depending on the selected product.

4. Refund processing may complete in multiple stages depending on airline, hotel, package vendor, bank, wallet, UPI, card network, or settlement partner.

5. TPL may show an estimated refundable amount during cancellation, but final refund may vary if supplier-side rules, manual review, or post-booking changes apply.

6. Once cancellation is completed, the booking will move to cancelled status and refund tracking will continue under refund status.`}
</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPolicyPopup(false)}
                className="h-11 rounded-xl border border-gray-300 px-5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
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