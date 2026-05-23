"use client";

import { useRouter, useSearchParams } from "next/navigation";
import BusDateFareStrip from "./BusDateFareStrip";

type Props = {
  fromCity: string;
  toCity: string;
  selectedDate: string;
};

export default function BusDateFareStripSection({
  fromCity,
  toCity,
  selectedDate,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = selectedDate ? new Date(selectedDate) : new Date();

  function handleDateSelect(date: Date) {
    const localISO = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", localISO);

    router.push(`/bus/result?${params.toString()}`);
  }

  return (
    <BusDateFareStrip
      fromCity={fromCity}
      toCity={toCity}
      selectedDate={selected}
      onDateSelect={handleDateSelect}
    />
  );
}