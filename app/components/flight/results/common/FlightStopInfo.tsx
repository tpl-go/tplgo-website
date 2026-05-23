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
      <div className="text-[13px] font-medium text-[#374151]">{duration}</div>

      <div
        className="relative mt-1 flex items-center justify-center gap-2"
        onMouseEnter={() => hasLayoverInfo && setShowLayover(true)}
        onMouseLeave={() => hasLayoverInfo && setShowLayover(false)}
      >
        <div className="h-[2px] flex-1 bg-[#d1d5db]" />
        <div className="shrink-0 text-[11px] font-medium text-[#6b7280]">
          {stopsText}
        </div>
        <div className="h-[2px] flex-1 bg-[#d1d5db]" />

        {showLayover && hasLayoverInfo && (
          <div className="absolute left-1/2 top-full z-50 mt-2 w-max min-w-[240px] -translate-x-1/2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-left shadow-xl">
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
      </div>

      {baggage ? (
        <div className="mt-2 text-[11px] text-[#0ea5e9]">{baggage}</div>
      ) : null}
    </div>
  );
}