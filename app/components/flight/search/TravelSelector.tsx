"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  state: any;
  dispatch: any;
  variant?: "home" | "results";
};

export default function TravelSelector({
  state,
  dispatch,
  variant = "home",
}: Props) {
  const isResults = variant === "results";

  const [open, setOpen] = useState(false);
  const [tempTravellers, setTempTravellers] = useState(state.travellers);
  const [error, setError] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const applyChanges = () => {
    if (tempTravellers.infants > tempTravellers.adults) {
      setError("Infants cannot be more than Adults");
      return;
    }

    dispatch({
      type: "SET_TRAVELLERS",
      payload: tempTravellers,
    });

    setError("");
    setOpen(false);
  };

  const renderCounter = (
    label: string,
    value: number,
    key: string,
    max: number
  ) => (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: max + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setTempTravellers({ ...tempTravellers, [key]: i })}
            className={`h-9 w-9 rounded-md border text-sm font-bold transition ${
              value === i
                ? "border-orange-500 bg-orange-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-orange-400"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );

  const summaryText = `${
    state.travellers.adults + state.travellers.children
  } Traveller${
    state.travellers.adults + state.travellers.children > 1 ? "s" : ""
  } • ${state.travellers.cabin}`;

  return (
    <div className={isResults ? "relative shrink-0" : "relative shrink-0"} ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={`cursor-pointer ${
          isResults
            ? "flex h-[72px] w-[210px] flex-col justify-center rounded-md border border-black bg-white px-4"
            : "flex h-[86px] w-[230px] flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
        }`}
      >
        {isResults ? (
          <div className="min-w-0 leading-tight">
            <span className="block text-[11px] font-semibold uppercase text-black">
              Passenger & Class
            </span>
            <p className="truncate text-[18px] font-bold text-black">
              {summaryText}
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <span className="block text-[11px] font-bold text-slate-600">
              Traveller & Class
            </span>
            <p className="truncate text-lg font-extrabold text-slate-950">
              {summaryText}
            </p>
            <span className="block text-[11px] text-slate-600">
              Passenger details
            </span>
          </div>
        )}
      </div>

      {open && (
        <div
          className={`absolute z-30 rounded-xl border bg-white p-6 shadow-2xl ${
            isResults
              ? "top-[72px] right-0 w-[700px] border-gray-200"
              : "top-[90px] right-0 w-[700px] border-slate-700"
          }`}
        >
          <div className="flex gap-10">
            <div className="flex w-full flex-col gap-6">
              {renderCounter(
                "Adults (12+)",
                tempTravellers.adults,
                "adults",
                9
              )}

              <div className="flex gap-10">
                <div className="w-1/2">
                  {renderCounter(
                    "Children (2y - 12y)",
                    tempTravellers.children,
                    "children",
                    6
                  )}
                </div>

                <div className="w-1/2">
                  {renderCounter(
                    "Infants (below 2y)",
                    tempTravellers.infants,
                    "infants",
                    6
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">
              Choose Travel Class
            </p>

            <div className="flex flex-wrap gap-3">
              {["Economy", "Premium Economy", "Business", "First Class"].map(
                (cabin) => (
                  <button
                    key={cabin}
                    onClick={() =>
                      setTempTravellers({
                        ...tempTravellers,
                        cabin,
                      })
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                      tempTravellers.cabin === cabin
                        ? "border-orange-500 bg-orange-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-orange-400"
                    }`}
                  >
                    {cabin}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={applyChanges}
              className="rounded-full bg-orange-600 px-8 py-2 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              APPLY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}