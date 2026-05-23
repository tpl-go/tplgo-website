"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { TrainRouteStop } from "@/app/lib/train/trainResultTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  trainName: string;
  trainNumber: string;
  routeStops: TrainRouteStop[];
};

export default function TrainRouteModal({
  open,
  onClose,
  trainName,
  trainNumber,
  routeStops,
}: Props) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[820px] rounded-[24px] border border-slate-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-300 hover:text-red-500"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-200 px-6 py-5">
          <div className="pr-10 text-[28px] font-extrabold text-slate-900">
            {trainName}
          </div>
          <div className="mt-1 text-[15px] font-medium text-slate-500">
            / {trainNumber}
          </div>
        </div>

        <div className="max-h-[520px] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-[1.8fr_0.7fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-slate-200 pb-3 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            <div>Station Name</div>
            <div>Code</div>
            <div>Arrives</div>
            <div>Halt (min)</div>
            <div>Departs</div>
          </div>

          <div className="divide-y divide-slate-100">
            {routeStops.map((stop, index) => (
              <div
                key={`${stop.stationCode}-${stop.day}-${index}`}
                className="grid grid-cols-[1.8fr_0.7fr_0.8fr_0.9fr_0.7fr] gap-3 py-4 text-[14px]"
              >
                <div className="font-semibold text-slate-900">
                  {stop.stationName}
                </div>

                <div className="font-medium text-slate-700">
                  {stop.stationCode}
                </div>

                <div className="text-slate-700">{stop.arrival}</div>

                <div className="text-slate-700">
                  {stop.haltMinutes ? String(stop.haltMinutes).padStart(2, "0") : "--"}
                </div>

                <div className="text-slate-700">{stop.departure}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}