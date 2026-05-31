"use client";

import { useEffect, useMemo, useState } from "react";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import BusResultCard from "./BusResultCard";

type Props = {
  buses: BusResultItem[];
  focusedBusId?: string | null;
  onViewDetails?: (bus: BusResultItem) => void;
  onSelectSeats?: (bus: BusResultItem) => void;
};

export default function GovernmentBusGroupCard({
  buses,
  focusedBusId,
  onViewDetails,
  onSelectSeats,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(() => {
    if (!buses.length) return null;

    const operatorName = buses[0].operatorName;
    const minPrice = Math.min(...buses.map((b) => b.price));
    const maxPrice = Math.max(...buses.map((b) => b.price));

    return {
      operatorName,
      count: buses.length,
      minPrice,
      maxPrice,
    };
  }, [buses]);

  useEffect(() => {
    if (!focusedBusId) return;
    if (buses.some((bus) => bus.id === focusedBusId)) {
      setExpanded(true);
    }
  }, [buses, focusedBusId]);

  if (!summary) return null;

  return (
    <div className="space-y-3">
      
      {/* GOV HEADER CARD */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* LEFT */}
          <div className="min-w-0">
            <span className="inline-block text-[10px] font-semibold text-indigo-600 mb-1">
              Government Bus
            </span>

            <h3 className="break-words text-[18px] font-semibold text-slate-900">
              {summary.operatorName}
            </h3>

            <p className="text-[12px] text-slate-500 mt-[2px]">
              {summary.count} Buses
            </p>
          </div>

          {/* RIGHT */}
          <div className="text-left sm:text-right">
            <p className="text-[18px] font-semibold text-slate-900">
              ₹{summary.minPrice} - ₹{summary.maxPrice}
            </p>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-[15px] font-medium text-sky-600 hover:underline mt-1"
            >
              {expanded ? "Hide buses ▲" : "View buses ▼"}
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDED LIST */}
      {expanded && (
        <div className="space-y-3">
          {buses.map((bus) => (
            <BusResultCard
              key={bus.id}
              bus={bus}
              focused={bus.id === focusedBusId}
              onViewDetails={onViewDetails}
              onSelectSeats={onSelectSeats}
            />
          ))}
        </div>
      )}
    </div>
  );
}
