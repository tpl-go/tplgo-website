"use client";

import { Trash2 } from "lucide-react";
import CabLocationSelector from "./CabLocationSelector";
import type { CabLocationItem, CabStopItem } from "@/app/lib/cab/cabSearchTypes";

type Props = {
  stops: CabStopItem[];
  onRemoveStop: (stopId: string) => void;
  onUpdateStopLocation: (
    stopId: string,
    location: CabLocationItem | null
  ) => void;
  compact?: boolean;
};

export default function CabAddStopsSection({
  stops,
  onRemoveStop,
  onUpdateStopLocation,
  compact = false,
}: Props) {
  if (stops.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {stops.map((stop, index) => (
        <div
          key={stop.id}
          className="flex w-full items-center gap-2 rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <CabLocationSelector
              label={`Stop ${index + 1}`}
              value={stop.location}
              onChange={(location) => onUpdateStopLocation(stop.id, location)}
              placeholder="Enter stop location"
              compact={compact}
            />
          </div>

          <button
            type="button"
            onClick={() => onRemoveStop(stop.id)}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
            aria-label={`Remove stop ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}