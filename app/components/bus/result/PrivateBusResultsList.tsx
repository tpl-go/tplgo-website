"use client";

import type { BusResultItem } from "@/app/lib/bus/busTypes";
import BusResultCard from "./BusResultCard";

type Props = {
  buses: BusResultItem[];
  focusedBusId?: string | null;
  onViewDetails?: (bus: BusResultItem) => void;
  onSelectSeats?: (bus: BusResultItem) => void;
};

export default function PrivateBusResultsList({
  buses,
  focusedBusId,
  onViewDetails,
  onSelectSeats,
}: Props) {
  if (!buses.length) return null;

  return (
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
  );
}
