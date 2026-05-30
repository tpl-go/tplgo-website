"use client";

type Props = {
  overview: string;
  cruiseLine: string;
  shipName: string;
  departurePort: string;
  arrivalPort: string;
  sailingDate: string | null;
  cabinSummary: {
    label: string;
    value?: number;
  }[];
};

export default function CruiseInfoTab({
  overview,
  cruiseLine,
  shipName,
  departurePort,
  arrivalPort,
  sailingDate,
  cabinSummary,
}: Props) {
  return (
    <div className="space-y-3 p-3 lg:space-y-4 lg:p-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm lg:shadow-none">
        <div className="text-[15px] font-black text-slate-900 lg:text-[16px] lg:font-semibold">Overview</div>
        <div className="mt-2 text-[13px] font-medium leading-6 text-slate-600 lg:text-sm">{overview}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:shadow-none">
          <div className="text-[15px] font-black text-slate-900 lg:text-[16px] lg:font-semibold">Cruise Details</div>
          <div className="mt-3 space-y-2 text-[13px] font-medium text-slate-600 lg:text-sm">
            <div><span className="font-semibold text-slate-800">Cruise Line:</span> {cruiseLine}</div>
            <div><span className="font-semibold text-slate-800">Ship:</span> {shipName}</div>
            <div><span className="font-semibold text-slate-800">Departure:</span> {departurePort}</div>
            <div><span className="font-semibold text-slate-800">Arrival:</span> {arrivalPort}</div>
            {sailingDate ? (
              <div><span className="font-semibold text-slate-800">Sailing Date:</span> {sailingDate}</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:shadow-none">
          <div className="text-[15px] font-black text-slate-900 lg:text-[16px] lg:font-semibold">Cabin Pricing</div>
          <div className="mt-3 space-y-2 text-[13px] font-medium text-slate-600 lg:text-sm">
            {cabinSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{item.label}</span>
                <span>{item.value ? `₹${item.value.toLocaleString("en-IN")}` : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
