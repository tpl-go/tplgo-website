"use client";

import type { BusResultItem } from "@/app/lib/bus/busTypes";
import BusResultCard from "./BusResultCard";

type Props = {
  buses: BusResultItem[];
  onViewDetails?: (bus: BusResultItem) => void;
  onSelectSeats?: (bus: BusResultItem) => void;
};

export default function PrivateBusResultsList({
  buses,
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
          onViewDetails={onViewDetails}
          onSelectSeats={onSelectSeats}
        />
      ))}
    </div>
  );
}