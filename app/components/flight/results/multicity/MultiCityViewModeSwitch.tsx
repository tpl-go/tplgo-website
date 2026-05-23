"use client";

type Props = {
  viewMode: "combined" | "individual";
  onChange: (mode: "combined" | "individual") => void;
};

export default function MultiCityViewModeSwitch({
  viewMode,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#dbe4ef] bg-white p-4 shadow-sm">
      <div className="text-[16px] font-bold text-[#111827]">
        Flight selection view
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange("individual")}
          className={`flex-1 rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
            viewMode === "individual"
              ? "border-[#38bdf8] bg-[#eef9ff] text-[#0284c7]"
              : "border-[#dbe4ef] bg-white text-[#111827] hover:bg-[#f8fbff]"
          }`}
        >
          Individual Flights
        </button>

        <button
          type="button"
          onClick={() => onChange("combined")}
          className={`flex-1 rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
            viewMode === "combined"
              ? "border-[#38bdf8] bg-[#eef9ff] text-[#0284c7]"
              : "border-[#dbe4ef] bg-white text-[#111827] hover:bg-[#f8fbff]"
          }`}
        >
          Combined Flights
        </button>
      </div>
    </div>
  );
}