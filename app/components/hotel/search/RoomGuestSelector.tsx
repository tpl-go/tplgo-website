"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

type Room = {
  adults: number;
  children: number;
};

type Props = {
  state: any;
  dispatch: any;
  popup: boolean;
  setPopup: any;
  popupRef: any;
  className?: string;
};

export default function RoomGuestSelector({
  state,
  dispatch,
  popup,
  setPopup,
  popupRef,
  className = "",
}: Props) {
  const rooms: Room[] = Array.isArray(state.rooms)
    ? state.rooms
    : [{ adults: 2, children: 0 }];

  const [editIndex, setEditIndex] = useState(rooms.length - 1);

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

    dispatch({
      type: "SET_ROOMS",
      payload: updated,
    });
  };

  const addRoom = () => {
    if (rooms.length < 4) {
      dispatch({
        type: "SET_ROOMS",
        payload: [...rooms, { adults: 2, children: 0 }],
      });
    }
  };

  const removeRoom = (index: number) => {
    dispatch({
      type: "SET_ROOMS",
      payload: rooms.filter((_: any, i: number) => i !== index),
    });
  };

  const totalAdults = useMemo(
    () => rooms.reduce((sum, room) => sum + room.adults, 0),
    [rooms]
  );

  const totalChildren = useMemo(
    () => rooms.reduce((sum, room) => sum + room.children, 0),
    [rooms]
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
    <div
      ref={popupRef}
      className={`relative w-full shrink-0 md:w-auto ${className}`}
    >
      <button
        type="button"
        onClick={() => setPopup(!popup)}
        className="relative flex h-[76px] md:h-[86px] w-full md:w-[230px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3 text-left"
      >
        <span className="text-[10px] md:text-[11px] font-bold text-slate-600">
          Rooms & Guests
        </span>

        <p className="truncate pr-6 text-base md:text-lg font-extrabold leading-[22px] text-slate-950">
          {guestSummary}
        </p>

        <span className="text-[10px] md:text-[11px] text-slate-600">
          {rooms.length} Room{rooms.length > 1 ? "s" : ""}
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
      </button>

      {popup && (
        <div className="absolute right-0 top-[82px] md:top-[90px] z-[9999] w-[calc(100vw-40px)] md:w-[420px] max-w-[95vw] rounded-2xl border border-slate-700 bg-white p-4 md:p-5 text-black shadow-2xl">
          {rooms.map((room, i) => {
            const isExpanded = i === editIndex;

            return (
              <div key={i} className="mb-4 border-b pb-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between gap-3">
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

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Adults - Above 12 Years
                      </span>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateRoom(i, "adults", "dec")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {room.adults.toString().padStart(2, "0")}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateRoom(i, "adults", "inc")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Children - Below 12 Years
                      </span>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateRoom(i, "children", "dec")}
                          className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
                        >
                          -
                        </button>

                        <span className="w-6 text-center font-bold">
                          {room.children.toString().padStart(2, "0")}
                        </span>

                        <button
                          type="button"
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

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={addRoom}
              className="rounded-full border border-orange-400 bg-white px-4 py-2 text-sm font-bold text-orange-600"
            >
              ADD ANOTHER ROOM +
            </button>

            <button
              type="button"
              onClick={() => setPopup(false)}
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