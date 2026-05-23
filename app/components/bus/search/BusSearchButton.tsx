"use client";

import { useRouter } from "next/navigation";

export default function BusSearchButton({ state }: any) {
  const router = useRouter();

  function handleSearch() {
    if (!state.fromCity || !state.toCity || !state.travelDate) {
      alert("Please fill From, To and Travel Date");
      return;
    }

    if (state.fromCity.trim().toLowerCase() === state.toCity.trim().toLowerCase()) {
      alert("From and To cities cannot be the same");
      return;
    }

    const query = new URLSearchParams({
      fromCity: state.fromCity,
      fromPoint: state.fromPoint || "All Boarding Points",
      toCity: state.toCity,
      toPoint: state.toPoint || "All Drop Points",
      date: state.travelDate,
    });

    router.push(`/bus/result?${query.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="h-[78px] w-full min-w-[180px] rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-rose-500 px-8 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    >
      Search Buses
    </button>
  );
}