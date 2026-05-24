"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import HolidayTabs from "./HolidayTabs";
import HolidayRoomGuest from "./HolidayRoomGuest";
import HolidayFilters, { type HolidayFilterState } from "./HolidayFilters";
import HolidayPackageHighlights from "./HolidayPackageHighlights";
import HolidayFromCity from "./HolidayFromCity";
import HolidayToCity from "./HolidayToCity";
import GlobalDatePicker from "@/app/components/global/GlobalDatePicker";

import {
  resolveHolidaySearchTarget,
  buildHolidayResolvedUrl,
} from "@/app/lib/holidays/resolveHolidaySearchTarget";

type Room = {
  adults: number;
  children: number;
};

function formatDateToYMD(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveSelectedThemeFromTab(activeTab: string) {
  if (!activeTab || activeTab === "search") return "";

  const tabMap: Record<string, string> = {
    "honeymoon-and-celebrations": "honeymoon-and-celebrations",
    "group-tour-package": "group-tour-package",
    "weekend-tour": "weekend-tour",
    "adventure-and-wildlife": "adventure-and-wildlife",
    "spiritual-packages": "spiritual-packages",
    "pre-wedding-and-production": "pre-wedding-and-production",

    honeymoon: "honeymoon-and-celebrations",
    group: "group-tour-package",
    weekend: "weekend-tour",
    adventure: "adventure-and-wildlife",
    spiritual: "spiritual-packages",
    prewedding: "pre-wedding-and-production",
  };

  return tabMap[activeTab] || "";
}

export default function HolidaySearchBox() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("search");

  const [fromCity, setFromCity] = useState("Jaipur");
  const [toCity, setToCity] = useState("Goa");
  const [departure, setDeparture] = useState(new Date());

  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);

  const [filters, setFilters] = useState<HolidayFilterState>({
    durationBucket: "",
    flightPreference: "",
    budgetBucket: "",
    hotelCategory: null,
  });

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterRef = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalAdults = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.adults, 0);
  }, [rooms]);

  const totalChildren = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.children, 0);
  }, [rooms]);

  const totalRooms = useMemo(() => rooms.length, [rooms]);

  const selectedTheme = useMemo(() => {
    return resolveSelectedThemeFromTab(activeTab);
  }, [activeTab]);

  const handleSearch = () => {
    const formattedDate = formatDateToYMD(departure);

    const resolved = resolveHolidaySearchTarget({
      originCity: fromCity,
      toCity,
      departureDate: formattedDate,
      adults: totalAdults,
      children: totalChildren,
      rooms: totalRooms,
      selectedTheme,
      selectedSubTheme: "",
      filters: {
        durationBucket: filters.durationBucket,
        flightPreference: filters.flightPreference,
        budgetBucket: filters.budgetBucket,
      },
    });

    const finalUrl = buildHolidayResolvedUrl(resolved);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "holidaySearchContext",
        JSON.stringify({
          origin: fromCity,
          toCity,
          date: formattedDate,
          adults: totalAdults,
          children: totalChildren,
          rooms: totalRooms,
          roomDetails: rooms,
          selectedTheme,
          selectedSubTheme: "",
          activeTab,
          resolvedMode: resolved.mode,
          resolvedRoute: resolved.route,
          matchedBy: resolved.matchedBy,
          matchedCity: resolved.matchedCity || "",
          matchedCountry: resolved.matchedCountry || "",
          matchedContinent: resolved.matchedContinent || "",
          filters: {
            durationBucket: filters.durationBucket,
            flightPreference: filters.flightPreference,
            budgetBucket: filters.budgetBucket,
            hotelCategory: filters.hotelCategory,
          },
        })
      );
    }

    router.push(finalUrl);
  };

  return (
    <div className="mt-4 w-full rounded-[22px] border border-white/45 bg-white/20 px-3 pt-3 pb-5 shadow-xl backdrop-blur-md sm:rounded-[26px] sm:px-5 sm:pb-7">
      <HolidayTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab !== "search" && (
        <HolidayPackageHighlights category={activeTab} />
      )}

      {activeTab === "search" && (
        <div className="mt-3 flex w-full flex-col items-stretch justify-center gap-3 md:flex-row md:flex-nowrap md:items-center">
          <div className="w-full md:w-auto">
            <HolidayFromCity value={fromCity} setValue={setFromCity} />
          </div>

          <div className="flex justify-center md:block">
            <div className="flex h-10 w-10 shrink-0 rotate-90 items-center justify-center rounded-full border border-slate-300 bg-white/90 shadow-sm md:h-11 md:w-11 md:rotate-0 md:bg-white/80">
              <span className="text-lg font-bold text-slate-700">⇄</span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <HolidayToCity value={toCity} setValue={setToCity} />
          </div>

          <div className="w-full md:w-auto">
            <GlobalDatePicker
              label="Departure Date"
              value={departure}
              setValue={setDeparture}
            />
          </div>

          <div className="w-full md:w-auto">
            <HolidayRoomGuest rooms={rooms} setRooms={setRooms} />
          </div>

          <div className="w-full md:w-auto">
            <HolidayFilters
              showFilterPopup={showFilterPopup}
              setShowFilterPopup={setShowFilterPopup}
              filterRef={filterRef}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-center sm:mt-7">
        <button
          type="button"
          onClick={handleSearch}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-lime-500 px-8 py-3 text-base font-extrabold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto sm:px-10"
        >
          {activeTab === "search" ? "SEARCH" : "EXPLORE PACKAGES"}
        </button>
      </div>
    </div>
  );
}