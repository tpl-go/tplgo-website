"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BusPoliciesModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[24px] font-extrabold text-slate-900">
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

        <div className="space-y-4 px-6 py-5 text-[15px] leading-7 text-slate-700">
          <p>• Valid government ID required during boarding.</p>
          <p>• Reporting time should be at least 15 minutes before departure.</p>
          <p>• Operator may change boarding point timing slightly if needed.</p>
          <p>• Cancellation and refund rules depend on operator and selected protection add-ons.</p>
          <p>• Seats once booked are subject to operator confirmation.</p>
        </div>
      </div>
    </div>
  );
}