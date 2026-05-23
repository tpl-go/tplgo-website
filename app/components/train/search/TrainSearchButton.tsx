"use client";

import { useRouter } from "next/navigation";
import type { TrainClassType, TrainStation } from "./trainTypes";

type Props = {
  from: TrainStation | null;
  to: TrainStation | null;
  travelDate: string;
  trainClass: TrainClassType;
};

export default function TrainSearchButton({
  from,
  to,
  travelDate,
  trainClass,
}: Props) {
  const router = useRouter();

  function handleSearch() {
    if (!from || !to || !travelDate) {
      alert("Please fill From, To and Travel Date");
      return;
    }

    if (from.code === to.code) {
      alert("From and To stations cannot be the same");
      return;
    }

    const query = new URLSearchParams({
      fromCity: from.city,
      fromCode: from.code,
      toCity: to.city,
      toCode: to.code,
      date: travelDate,
      class: trainClass,
    });

    router.push(`/train/result?${query.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="h-[56px] min-w-[220px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 text-[17px] font-extrabold text-white shadow-[0_14px_32px_rgba(234,88,12,0.28)] transition-all duration-300 hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
    >
      Search Trains
    </button>
  );
}