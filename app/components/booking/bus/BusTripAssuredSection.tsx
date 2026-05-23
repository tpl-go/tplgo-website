"use client";

type Props = {
  travellerCount: number;
  selected: boolean;
  total: number;
  onToggle: (value: boolean) => void;
};

export default function BusTripAssuredSection({
  travellerCount,
  selected,
  total,
  onToggle,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-extrabold text-slate-900">
            Get TripAssured at just ₹20
          </h2>
          <p className="mt-1 text-[15px] text-slate-600">
            Flat 2x Refund Full Terms And Conditions
          </p>
        </div>

        <div className="rounded-full bg-violet-50 px-4 py-2 text-[13px] font-bold text-violet-700">
          10 Lakh+ people secured their trips
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 px-4 py-3 text-[16px] font-semibold text-slate-800">
          Upto ₹75000 for Hospitalisation
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3 text-[16px] font-semibold text-slate-800">
          Upto ₹5 lakh for Death/Disability
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 text-[16px] text-slate-800">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>
          Add TripAssured at ₹20/Person
          <span className="ml-1 font-bold text-sky-600">
            ({travellerCount} × ₹20 = ₹{total})
          </span>
        </span>
      </label>
    </section>
  );
}