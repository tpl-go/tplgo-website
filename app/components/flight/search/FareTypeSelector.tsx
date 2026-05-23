"use client";

type Props = {
  fareType: string;
  dispatch: any;
};

export default function FareTypeSelector({
  fareType,
  dispatch,
}: Props) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {[
        "Regular",
        "Student",
        "Divyang",
        "Armed Forces",
        "Doctor & Nurse",
        "Senior Citizen",
        "Government Employee",
      ].map((fare) => (
        <button
          key={fare}
          onClick={() =>
            dispatch({ type: "SET_FARE", payload: fare })
          }
          className={`h-9 rounded-full border px-4 text-sm font-bold transition-all duration-200 ${
            fareType === fare
              ? "border-orange-500 bg-orange-600 text-white shadow"
              : "border-slate-700 bg-white/75 text-slate-900 hover:border-orange-400 hover:bg-orange-50"
          }`}
        >
          {fare}
        </button>
      ))}
    </div>
  );
}