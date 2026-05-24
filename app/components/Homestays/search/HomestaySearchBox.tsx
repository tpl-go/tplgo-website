"use client";

import { useReducer, useState, useRef, useEffect } from "react";
import HomestaySearchButton from "./HomestaySearchButton";
import { HomestayReducer } from "./HomestayReducer";
import HomestayRoomGuestSelector from "./HomestayRoomGuestSelector";
import HomestayPriceFilter from "./HomestayPriceFilter";
import HomeStayCalender from "./HomeStayCalender";
import HomestayCitySelector from "./HomestayCitySelector";

const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export default function HomestaySearchBox() {
  const [state, dispatch] = useReducer(HomestayReducer, {
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
    <div className="mt-4 md:mt-7 w-full rounded-[24px] md:rounded-[26px] border border-white/45 bg-white/20 px-3 md:px-5 pt-3 pb-5 md:pb-7 shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-1 gap-3 md:flex md:flex-nowrap md:items-center md:justify-center md:gap-3">
        <HomestayCitySelector dispatch={dispatch} />

        <HomeStayCalender
          dispatch={dispatch}
          type="CHECKIN"
          date={state.checkIn}
        />

        <HomeStayCalender
          dispatch={dispatch}
          type="CHECKOUT"
          date={state.checkOut}
        />

        <HomestayRoomGuestSelector
          state={state}
          dispatch={dispatch}
          popup={popup}
          setPopup={setPopup}
          popupRef={popupRef}
        />

        <HomestayPriceFilter dispatch={dispatch} />
      </div>

      <div className="relative mt-5 md:mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="order-2 cursor-pointer text-center text-sm font-bold text-orange-600 hover:underline md:order-none md:text-left">
          List Your Property
        </span>

        <div className="order-1 flex w-full justify-center md:absolute md:left-1/2 md:order-none md:w-auto md:-translate-x-1/2">
          <div className="w-full md:w-auto">
            <HomestaySearchButton state={state} />
          </div>
        </div>

        <div className="hidden w-[130px] md:block" />
      </div>
    </div>
  );
}