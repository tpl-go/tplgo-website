"use client";

import { useRouter } from "next/navigation";

export default function HomestaySearchButton({ state }: any) {
  const router = useRouter();

  function handleSearch() {
    const rooms = Array.isArray(state.rooms) ? state.rooms : [{ adults: 2, children: 0 }];

    const totalAdults = rooms.reduce(
      (sum: number, room: any) => sum + (room.adults || 0),
      0
    );

    const totalChildren = rooms.reduce(
      (sum: number, room: any) => sum + (room.children || 0),
      0
    );

    if (!state.city || !state.checkIn || !state.checkOut || rooms.length < 1 || totalAdults < 1) {
      alert("Please fill City, Check-in, Check-out and Guests");
      return;
    }

    const query = new URLSearchParams({
      city: state.city,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      rooms: String(rooms.length),
      adults: String(totalAdults),
      children: String(totalChildren),
      price: state.price || "",
    });

    router.push(`/homestays/results?${query.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="bg-gradient-to-r from-orange-500 to-green-400 
                 text-white font-semibold 
                 px-10 py-3 
                 rounded-xl 
                 shadow-md 
                 hover:scale-105 
                 transition-all duration-200"
    >
      SEARCH
    </button>
  );
}