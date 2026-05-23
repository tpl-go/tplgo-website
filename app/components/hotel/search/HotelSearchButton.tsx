"use client";

import { useRouter } from "next/navigation";

export default function HotelSearchButton({ state }: any) {
  const router = useRouter();

  function handleSearch() {
    if (!state.city || !state.checkIn || !state.checkOut) {
      alert("Please fill City, Check-in, Check-out");
      return;
    }

    // total adults count nikalna
    const totalAdults = state.rooms.reduce(
      (sum: number, room: any) => sum + room.adults,
      0
    );

    const totalRooms = state.rooms.length;

    // query params banana
    const query = new URLSearchParams({
      city: state.city,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      rooms: String(totalRooms),
      adults: String(totalAdults),
      price: state.price || "",
    });

    // 🚀 redirect to result page
    router.push(`/hotels/results?${query.toString()}`);
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