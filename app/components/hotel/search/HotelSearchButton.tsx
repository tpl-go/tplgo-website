"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateHotelSearchInput } from "@/app/lib/hotels/hotelBackendIntegration";

export default function HotelSearchButton({ state }: any) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSearch() {
    if (submitting) return;
    setSubmitting(true);

    const validation = validateHotelSearchInput({
      destination: state.city,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      rooms: state.rooms,
      maxPrice: state.price,
    });

    if (!validation.ok) {
      alert(validation.error);
      setSubmitting(false);
      return;
    }

    const totalAdults = validation.request.rooms.reduce(
      (sum: number, room: any) => sum + room.adults,
      0
    );
    const totalChildren = validation.request.rooms.reduce(
      (sum: number, room: any) => sum + room.children,
      0
    );

    const totalRooms = validation.request.rooms.length;

    const query = new URLSearchParams({
      city: validation.request.destination,
      checkIn: validation.request.checkIn,
      checkOut: validation.request.checkOut,
      rooms: String(totalRooms),
      adults: String(totalAdults),
      children: String(totalChildren),
      roomOccupancies: JSON.stringify(validation.request.rooms),
      price: validation.request.filters?.maxPrice || "",
    });

    router.push(`/hotels/results?${query.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleSearch}
      disabled={submitting}
      className="
        w-full md:w-auto
        min-h-[48px] md:min-h-0
        bg-gradient-to-r from-orange-500 to-lime-500
        text-white font-semibold
        text-sm md:text-base
        px-6 md:px-10
        py-3
        rounded-xl
        shadow-md
        transition-all duration-200
        hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70
      "
    >
      {submitting ? "SEARCHING..." : "SEARCH"}
    </button>
  );
}
