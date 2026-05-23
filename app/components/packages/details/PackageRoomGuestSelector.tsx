"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type Room = {
  adults: number;
  children: number;
};

type Props = {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  popup: boolean;
  setPopup: (value: boolean) => void;
  popupRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

export default function PackageRoomGuestSelector({
  rooms,
  setRooms,
  popup,
  setPopup,
  popupRef,
  className = "",
}: Props) {
  const safeRooms: Room[] =
    Array.isArray(rooms) && rooms.length > 0
      ? rooms
      : [{ adults: 2, children: 0 }];

  const [editIndex, setEditIndex] = useState(safeRooms.length - 1);

  useEffect(() => {
    setEditIndex(safeRooms.length - 1);
  }, [safeRooms.length]);

  const updateRoom = (
    index: number,
    type: "adults" | "children",
    action: "inc" | "dec"
  ) => {
    const updated = [...safeRooms];

    if (action === "inc") {
      if (
        type === "adults" &&
        updated[index].adults < 4 &&
        updated[index].adults + updated[index].children < 6
      ) {
        updated[index].adults++;
      }

      if (
        type === "children" &&
        updated[index].adults + updated[index].children < 6
      ) {
        updated[index].children++;
      }
    }

    if (action === "dec") {
      if (type === "adults" && updated[index].adults > 1) {
        updated[index].adults--;
      }

      if (type === "children" && updated[index].children > 0) {
        updated[index].children--;
      }
    }

    setRooms(updated);
  };

  const addRoom = () => {
    if (safeRooms.length < 4) {
      setRooms([...safeRooms, { adults: 2, children: 0 }]);
    }
  };

  const removeRoom = (index: number) => {
    if (safeRooms.length === 1) return;
    setRooms(safeRooms.filter((_, i) => i !== index));
  };

  const totalAdults = useMemo(
    () => safeRooms.reduce((sum, room) => sum + room.adults, 0),
    [safeRooms]
  );

  const totalChildren = useMemo(
    () => safeRooms.reduce((sum, room) => sum + room.children, 0),
    [safeRooms]
  );

  const guestSummary = useMemo(() => {
    const parts = [];
    parts.push(`${totalAdults} Adult${totalAdults > 1 ? "s" : ""}`);

    if (totalChildren > 0) {
      parts.push(`${totalChildren} Child${totalChildren > 1 ? "ren" : ""}`);
    }

    return parts.join(", ");
  }, [totalAdults, totalChildren]);

  return (
    <div ref={popupRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setPopup(!popup)}
        className="relative flex h-[76px] w-full flex-col justify-center bg-transparent px-4 text-left"
      >
        <span className="text-[11px] font-bold uppercase text-[#6b7280]">
          Rooms & Guests
        </span>

        <p className="pr-6 text-[15px] font-bold text-[#111827] leading-[20px]">
          {guestSummary}
        </p>

        <span className="text-[11px] text-[#111827]">
          {safeRooms.length} Room{safeRooms.length > 1 ? "s" : ""}
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111827]" />
      </button>

      {popup && (
        <div className="absolute right-0 top-[85px] z-[999] w-[430px] rounded-xl border border-gray-200 bg-white p-5 text-black shadow-xl">
          {safeRooms.map((room, i) => {
            const isExpanded = i === editIndex;

            return (
              <div key={i} className="mb-4 border-b pb-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">ROOM {i + 1}</p>

                    {!isExpanded && (
                      <p className="text-sm text-gray-600">
                        {room.adults} Adult{room.adults > 1 ? "s" : ""}
                        {room.children > 0
                          ? `, ${room.children} Child${room.children > 1 ? "ren" : ""}`
                          : ""}
                        <span
                          className="ml-2 cursor-pointer text-blue-500"
                          onClick={() => setEditIndex(i)}
                        >
                          Edit
                        </span>
                      </p>
                    )}
                  </div>

                  {safeRooms.length > 1 && (
                    <p
                      className="cursor-pointer text-xs text-blue-500"
                      onClick={() => removeRoom(i)}
                    >
                      REMOVE
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <>
                    <div className="mb-3 rounded bg-orange-50 p-2 text-xs text-[#7c2d12]">
                      Package planning base: max 6 guests allowed in one room
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm">Adults - Above 12 Years</span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateRoom(i, "adults", "dec")}
                          className="rounded border px-2"
                        >
                          -
                        </button>

                        <span className="w-6 text-center">
                          {room.adults.toString().padStart(2, "0")}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateRoom(i, "adults", "inc")}
                          className="rounded border px-2"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Children - Below 12 Years</span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateRoom(i, "children", "dec")}
                          className="rounded border px-2"
                        >
                          -
                        </button>

                        <span className="w-6 text-center">
                          {room.children.toString().padStart(2, "0")}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateRoom(i, "children", "inc")}
                          className="rounded border px-2"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={addRoom}
              className="rounded border px-4 py-2 text-sm text-blue-500"
            >
              ADD ANOTHER ROOM +
            </button>

            <button
              type="button"
              onClick={() => setPopup(false)}
              className="rounded bg-orange-500 px-6 py-2 font-semibold text-white"
            >
              APPLY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}