"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TrainDateStrip from "./TrainDateStrip";

type Props = {
  selectedDate: string;
};

export default function TrainDateStripSection({ selectedDate }: Props) {
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

    router.push(`/train/result?${params.toString()}`);
  }

  return (
    <TrainDateStrip
      selectedDate={selected}
      onDateSelect={handleDateSelect}
    />
  );
}