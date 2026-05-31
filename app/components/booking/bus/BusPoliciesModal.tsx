"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BusPoliciesModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-end justify-center bg-black/45 px-0 md:items-center md:px-4">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 md:px-6">
          <h2 className="text-[20px] font-extrabold text-slate-900 md:text-[24px]">
            Booking Policies
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 text-[14px] leading-7 text-slate-700 md:px-6 md:text-[15px]">
          <p>• Valid government ID required during boarding.</p>
          <p>• Reporting time should be at least 15 minutes before departure.</p>
          <p>• Operator may change boarding point timing slightly if needed.</p>
          <p>• Cancellation and refund rules depend on operator and selected protection add-ons.</p>
          <p>• Seats once booked are subject to operator confirmation.</p>
        </div>

        <div className="border-t border-slate-200 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-full bg-slate-900 text-sm font-bold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
