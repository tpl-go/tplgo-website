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
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold text-slate-900">
            Free Cancellation
          </h2>
          <p className="mt-1 text-[13px] text-slate-600">
            Claim 100% refund until 6 hours before your journey
          </p>
        </div>

        <div className="w-fit rounded-full bg-cyan-50 px-4 py-2 text-[12px] font-bold text-cyan-700">
          Customers saved big in last 3 months
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <div className="grid min-w-[640px] grid-cols-6 border-b border-slate-200 bg-slate-50 text-center text-[12px] font-semibold text-slate-700 md:min-w-0">
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
