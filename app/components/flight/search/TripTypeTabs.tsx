"use client";

type Props = {
  tripType: string;
  dispatch: any;
  variant?: "home" | "results";
};

export default function TripTypeTabs({
  tripType,
  dispatch,
  variant = "home",
}: Props) {
  const isResults = variant === "results";

  if (isResults) {
    return (
      <div className="flex h-[54px] w-full shrink-0 items-stretch sm:h-[64px] sm:w-auto">
        <div className="relative w-full sm:w-[120px]">
          <select
            value={tripType}
            onChange={(e) =>
              dispatch({
                type: "SET_TRIP_TYPE",
                payload: e.target.value,
              })
            }
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          >
            <option value="oneway" className="bg-[#111827] text-white">
              One Way
            </option>

            <option value="roundtrip" className="bg-[#111827] text-white">
              Round Trip
            </option>

            <option value="multicity" className="bg-[#111827] text-white">
              Multi City
            </option>
          </select>

          <div className="flex h-full w-full flex-col justify-center rounded-md border border-[#1f2937] bg-white px-3 py-2">
            <span className="text-[10px] font-semibold uppercase leading-none text-[#374151] sm:text-[11px]">
              Trip Type
            </span>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[14px] font-bold leading-none tracking-wide text-[#111827] sm:text-[16px]">
                {tripType === "oneway"
                  ? "One Way"
                  : tripType === "roundtrip"
                  ? "Round Trip"
                  : "Multi City"}
              </span>

              <span className="text-sm text-[#111827]">▾</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {["oneway", "roundtrip", "multicity"].map((type) => (
        <button
          key={type}
          onClick={() =>
            dispatch({
              type: "SET_TRIP_TYPE",
              payload: type,
            })
          }
          className={`h-10 rounded-full border px-5 text-sm font-bold transition-all duration-200 ${
            tripType === type
              ? "border-orange-500 bg-orange-600 text-white shadow"
              : "border-slate-700 bg-white/80 text-slate-900 hover:border-orange-400 hover:bg-orange-50"
          }`}
        >
          {type === "oneway"
            ? "One Way"
            : type === "roundtrip"
            ? "Round Trip"
            : "Multi City"}
        </button>
      ))}
    </div>
  );
}