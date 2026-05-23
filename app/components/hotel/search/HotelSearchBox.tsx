"use client";

import { useReducer, useState, useRef, useEffect } from "react";
import HotelSearchButton from "./HotelSearchButton";
import { hotelReducer } from "./hotelReducer";
import RoomGuestSelector from "./RoomGuestSelector";
import PriceFilter from "./PriceFilter";
import HotelCalender from "./HotelCalender";
import CitySelector from "./CitySelector";

const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export default function HotelSearchBox() {
  const [state, dispatch] = useReducer(hotelReducer, {
    city: "",
    checkIn: null,
    checkOut: null,

    rooms: [{ adults: 2, children: 0 }],

    price: "",
  });

  const [popup, setPopup] = useState(false);
  const popupRef = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const checkInMin = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const checkOutMin = state.checkIn
    ? new Date(
        new Date(state.checkIn).getTime() +
          86400000 -
          new Date(state.checkIn).getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0]
    : new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

  useEffect(() => {
    if (!state.checkIn) {
      dispatch({ type: "SET_CHECKIN", payload: checkInMin });
    }

    if (!state.checkOut) {
      dispatch({ type: "SET_CHECKOUT", payload: checkOutMin });
    }
  }, []);

  return (
    <div className="mt-7 w-full rounded-[26px] border border-white/45 bg-white/20 px-5 pt-3 pb-7 shadow-xl backdrop-blur-md">
      <div className="flex flex-nowrap items-center justify-center gap-3">
        <CitySelector dispatch={dispatch} />

        <HotelCalender dispatch={dispatch} type="CHECKIN" date={state.checkIn} />

        <HotelCalender
          dispatch={dispatch}
          type="CHECKOUT"
          date={state.checkOut}
        />

        <RoomGuestSelector
          state={state}
          dispatch={dispatch}
          popup={popup}
          setPopup={setPopup}
          popupRef={popupRef}
        />

        <PriceFilter dispatch={dispatch} />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <span className="cursor-pointer text-sm font-bold text-orange-600 hover:underline">
          List Your Property
        </span>

        <div className="absolute left-1/2 -translate-x-1/2">
          <HotelSearchButton state={state} />
        </div>

        <div className="w-[130px]" />
      </div>
    </div>
  );
}