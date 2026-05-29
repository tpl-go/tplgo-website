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
    <div className="rounded-2xl border border-[#dbe4ef] bg-white p-2.5 shadow-sm xl:p-4">
      <div className="px-1 text-[12px] font-black text-[#111827] xl:px-0 xl:text-[16px]">
        Flight selection view
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5 xl:mt-4 xl:flex xl:items-center xl:gap-3">
        <button
          type="button"
          onClick={() => onChange("individual")}
          className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-black transition xl:px-5 xl:py-3 xl:text-[15px] xl:font-semibold ${
            viewMode === "individual"
              ? "border-[#38bdf8] bg-[#eef9ff] text-[#0284c7]"
              : "border-[#dbe4ef] bg-white text-[#111827] hover:bg-[#f8fbff]"
          }`}
        >
          Individual
        </button>

        <button
          type="button"
          onClick={() => onChange("combined")}
          className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-black transition xl:px-5 xl:py-3 xl:text-[15px] xl:font-semibold ${
            viewMode === "combined"
              ? "border-[#38bdf8] bg-[#eef9ff] text-[#0284c7]"
              : "border-[#dbe4ef] bg-white text-[#111827] hover:bg-[#f8fbff]"
          }`}
        >
          Combined
        </button>
      </div>
    </div>
  );
}
