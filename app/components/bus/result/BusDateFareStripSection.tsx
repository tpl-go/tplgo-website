"use client";

import type { BusResultItem } from "@/app/lib/bus/busTypes";
import BusDateFareStrip from "./BusDateFareStrip";

type Props = {
  fromCity: string;
  toCity: string;
  selectedDate: string;
  visibleResults: BusResultItem[];
  focusedBusId?: string | null;
  onFocusBus: (busId: string) => void;
};

export default function BusDateFareStripSection({
  fromCity,
  toCity,
  selectedDate,
  visibleResults,
  focusedBusId,
  onFocusBus,
}: Props) {
  const selected = selectedDate ? new Date(selectedDate) : new Date();

  return (
    <BusDateFareStrip
      fromCity={fromCity}
      toCity={toCity}
      selectedDate={selected}
      visibleResults={visibleResults}
      focusedBusId={focusedBusId}
      onFocusBus={onFocusBus}
    />
  );
}
