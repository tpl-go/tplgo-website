"use client";

type Props = {
  selected: boolean;
  total: number;
  onToggle: (value: boolean) => void;
};

export default function BusFreeCancellationSection({
  selected,
  total,
  onToggle,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold text-slate-900">
            Free Cancellation
          </h2>
          <p className="mt-1 text-[13px] text-slate-600">
            Claim 100% refund until 6 hours before your journey
          </p>
        </div>

        <div className="rounded-full bg-cyan-50 px-4 py-2 text-[12px] font-bold text-cyan-700">
          Customers saved big in last 3 months
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-center text-[12px] font-semibold text-slate-700">
          <div className="px-3 py-3">Now</div>
          <div className="px-3 py-3">90% Refund</div>
          <div className="px-3 py-3">70% Refund</div>
          <div className="px-3 py-3">50% Refund</div>
          <div className="px-3 py-3">No Refund</div>
          <div className="px-3 py-3">No Refund</div>
        </div>

        <div className="bg-white px-4 py-4 text-center text-[13px] font-medium text-slate-600">
          Full Refund till journey protection window with Free Cancellation
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 text-[14px] text-slate-800">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>Add Free Cancellation at ₹{total}</span>
      </label>
    </section>
  );
}