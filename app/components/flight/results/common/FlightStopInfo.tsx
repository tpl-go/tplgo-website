"use client";

import { useMemo, useState } from "react";

type LayoverItem = {
  city?: string;
  code?: string;
  duration?: string;
};

type Props = {
  duration: string;
  stopsText: string;
  baggage?: string;
  stopCount?: number;
  layovers?: LayoverItem[];
  className?: string;
};

export default function FlightStopInfo({
  duration,
  stopsText,
  baggage,
  stopCount = 0,
  layovers = [],
  className = "",
}: Props) {
  const [showLayover, setShowLayover] = useState(false);

  const hasLayoverInfo = useMemo(() => {
    return stopCount > 0 && layovers.length > 0;
  }, [stopCount, layovers]);

  const layoverTitle = stopCount > 1 ? "Plane changes" : "Plane change";

  return (
    <div className={`min-w-0 text-center ${className}`}>
      <div className="text-[12px] font-medium text-[#374151] sm:text-[13px]">
        {duration}
      </div>

      <button
        type="button"
        className="relative mt-1 flex w-full items-center justify-center gap-2"
        onMouseEnter={() => hasLayoverInfo && setShowLayover(true)}
        onMouseLeave={() => hasLayoverInfo && setShowLayover(false)}
        onClick={() => hasLayoverInfo && setShowLayover((prev) => !prev)}
      >
        <div className="h-[2px] flex-1 bg-[#d1d5db]" />
        <div className="shrink-0 text-[10px] font-medium text-[#6b7280] sm:text-[11px]">
          {stopsText}
        </div>
        <div className="h-[2px] flex-1 bg-[#d1d5db]" />

        {showLayover && hasLayoverInfo && (
          <div className="absolute left-1/2 top-full z-50 mt-2 w-[220px] -translate-x-1/2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-left shadow-xl sm:w-max sm:min-w-[240px] sm:px-4">
            <div className="text-[13px] font-semibold text-[#111827]">
              {layoverTitle}
            </div>

            <div className="mt-2 space-y-1">
              {layovers.map((item, index) => (
                <div key={index} className="text-[12px] text-[#374151]">
                  {[item.city, item.code ? `(${item.code})` : ""]
                    .filter(Boolean)
                    .join(" ")}
                  {item.duration ? ` | ${item.duration} Layover` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </button>

      {baggage ? (
        <div className="mt-2 text-[10px] text-[#0ea5e9] sm:text-[11px]">
          {baggage}
        </div>
      ) : null}
    </div>
  );
}