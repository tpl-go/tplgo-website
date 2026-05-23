"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Room = {
  adults: number;
  children: number;
};

type Props = {
  rooms: Room[];
  setRooms: any;
};

export default function HolidayRoomGuest({ rooms, setRooms }: Props) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number>(rooms.length - 1);
  const ref = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setEditIndex(rooms.length - 1);
  }, [rooms.length]);

  const updateRoom = (
    index: number,
    type: "adults" | "children",
    action: "inc" | "dec"
  ) => {
    const updated = [...rooms];

    if (action === "inc") {
      if (
        type === "adults" &&
        updated[index].adults < 3 &&
        updated[index].adults + updated[index].children < 4
      ) {
        updated[index].adults++;
      }

      if (
        type === "children" &&
        updated[index].adults + updated[index].children < 4
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
    if (rooms.length < 4) {
      setRooms([...rooms, { adults: 2, children: 0 }]);
    }
  };

  const removeRoom = (index: number) => {
    const updated = rooms.filter((_: any, i: number) => i !== index);
    setRooms(updated);
  };

  const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);

  const guestSummary =
    totalChildren > 0
      ? `${totalAdults} Adults, ${totalChildren} Child${totalChildren > 1 ? "ren" : ""}`
      : `${totalAdults} Adults`;

  return (
    <div ref={ref} className="relative shrink-0">
      <div
        onClick={() => setOpen(true)}
        className="relative flex h-[86px] w-[200px] cursor-pointer flex-col justify-center rounded-2xl border border-black bg-white/60 px-4 py-3"
      >
        <span className="text-[11px] font-bold text-slate-600">
          Rooms & Guests
        </span>

        <p className="truncate pr-6 text-lg font-extrabold text-slate-950">
          {guestSummary}
        </p>

        <span className="text-[11px] text-slate-600">
          {rooms.length} Room{rooms.length > 1 ? "s" : ""}
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
      </div>

      {open && (
        <div className="absolute left-0 top-[90px] z-[9999] w-[420px] rounded-2xl border border-black bg-white p-5 text-black shadow-2xl">
          {rooms.map((room, i) => {
            const isExpanded = i === editIndex;

            return (
              <div key={i} className="mb-4 border-b pb-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      ROOM {i + 1}
                    </p>

                    {!isExpanded && (
                      <p className="text-sm text-slate-600">
                        {room.adults} Adult{room.adults > 1 ? "s" : ""}
                        {room.children > 0
                          ? `, ${room.children} Child${
                              room.children > 1 ? "ren" : ""
                            }`
                          : ""}
                        <span
                          className="ml-2 cursor-pointer font-semibold text-orange-600"
                          onClick={() => setEditIndex(i)}
                        >
                          Edit
                        </span>
                      </p>
                    )}
                  </div>

                  {rooms.length > 1 && (
                    <p
                      className="cursor-pointer text-xs font-bold text-orange-600"
                      onClick={() => removeRoom(i)}
                    >
                      REMOVE
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <>
                    <div className="mb-3 rounded-xl bg-orange-50 p-2 text-xs font-semibold text-orange-900">
                      Total 4 guests (Max. 3 adults) allowed in a room
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Adults - Above 12 Years
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateRoom(i, "adults", "dec")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {room.adults.toString().padStart(2, "0")}
                        </span>

                        <button
                          onClick={() => updateRoom(i, "adults", "inc")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Children - Below 12 Years
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateRoom(i, "children", "dec")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {room.children.toString().padStart(2, "0")}
                        </span>

                        <button
                          onClick={() => updateRoom(i, "children", "inc")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
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
              onClick={addRoom}
              className="rounded-full border border-orange-400 bg-white px-4 py-2 text-sm font-bold text-orange-600"
            >
              ADD ANOTHER ROOM +
            </button>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-orange-600 px-6 py-2 font-bold text-white"
            >
              APPLY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}