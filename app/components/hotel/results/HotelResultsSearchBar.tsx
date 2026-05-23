"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";
import RoomGuestSelector from "../search/RoomGuestSelector";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Room = {
  adults: number;
  children: number;
};

const cities = [
  "Delhi",
  "Mumbai",
  "Jaipur",
  "Goa",
  "Manali",
  "Shimla",
  "Udaipur",
  "Nainital",
  "Mussoorie",
  "Rishikesh",
  "Varanasi",
  "Agra",
  "Kolkata",
  "Bangalore",
  "Chennai",
  "Hyderabad",
];

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getTomorrow(base?: Date) {
  const ref = base ? new Date(base) : getToday();
  ref.setDate(ref.getDate() + 1);
  return ref;
}

function safeDate(value: string | null, fallback: Date) {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function toQueryDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function HotelResultsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = useMemo(() => getToday(), []);
  const tomorrow = useMemo(() => getTomorrow(today), [today]);

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState<Date>(today);
  const [checkOut, setCheckOut] = useState<Date>(tomorrow);
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);
  const [price] = useState("");

  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement | null>(null);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const checkInRef = useRef<HTMLDivElement | null>(null);

  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const checkOutRef = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const incomingCity = searchParams.get("city") || "";
    const incomingCheckIn = safeDate(searchParams.get("checkIn"), today);
    const incomingCheckOut = safeDate(
      searchParams.get("checkOut"),
      getTomorrow(incomingCheckIn)
    );

    const incomingRooms = Math.max(Number(searchParams.get("rooms") || "1"), 1);
    const incomingAdults = Math.max(Number(searchParams.get("adults") || "2"), 1);

    const safeRooms: Room[] = Array.from({ length: incomingRooms }, (_, index) => ({
      adults: index === 0 ? incomingAdults : 2,
      children: 0,
    }));

    setCity(incomingCity);
    setCheckIn(incomingCheckIn);
    setCheckOut(
      incomingCheckOut > incomingCheckIn
        ? incomingCheckOut
        : getTomorrow(incomingCheckIn)
    );
    setRooms(safeRooms);
  }, [searchParams, today]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (cityRef.current && !cityRef.current.contains(target)) {
        setCityOpen(false);
      }

      if (checkInRef.current && !checkInRef.current.contains(target)) {
        setCheckInOpen(false);
      }

      if (checkOutRef.current && !checkOutRef.current.contains(target)) {
        setCheckOutOpen(false);
      }

      if (popupRef.current && !popupRef.current.contains(target)) {
        setPopup(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter((item) =>
      item.toLowerCase().includes(city.toLowerCase())
    );
  }, [city]);

  const totalAdults = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.adults, 0);
  }, [rooms]);

  const handleSearch = () => {
    if (!city || !checkIn || !checkOut) {
      alert("Please fill City, Check-in and Check-out");
      return;
    }

    const query = new URLSearchParams({
      city: city.trim(),
      checkIn: toQueryDate(checkIn),
      checkOut: toQueryDate(checkOut),
      rooms: String(rooms.length),
      adults: String(totalAdults),
      price,
    });

    router.push(`/hotels/results?${query.toString()}`);
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-[2.2fr_1.1fr_1.1fr_1.2fr_155px] items-stretch overflow-visible">
        {/* CITY */}
        <div
          ref={cityRef}
          className="relative border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
            City, Area or Property
          </div>

          <div className="mt-1 flex items-center gap-2">
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setCityOpen(true);
              }}
              onFocus={() => setCityOpen(true)}
              placeholder="Enter City"
              className="h-[30px] w-full border-0 bg-transparent p-0 text-[15px] font-extrabold text-white outline-none placeholder:text-slate-400"
            />
            <ChevronDown className="h-4 w-4 text-cyan-300" />
          </div>

          {cityOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl">
              <div className="max-h-60 overflow-y-auto py-1 scrollbar-hide">
                {filteredCities.length > 0 ? (
                  filteredCities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCity(item);
                        setCityOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-bold text-slate-200 transition hover:bg-white/10"
                    >
                      <MapPin className="h-4 w-4 text-cyan-300" />
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-300">
                    No matching city found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CHECK IN */}
        <div
          ref={checkInRef}
          className="relative border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
        >
          <button
            type="button"
            onClick={() => {
              setCheckInOpen((prev) => !prev);
              setCheckOutOpen(false);
            }}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
                Check In
              </div>
              <div className="mt-1 text-[15px] font-extrabold text-white">
                {format(checkIn, "dd MMM yy")}
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                {format(checkIn, "EEEE")}
              </div>
            </div>
            <Calendar className="h-4 w-4 text-cyan-300" />
          </button>

          {checkInOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 rounded-2xl bg-white shadow-2xl">
              <DateRange
                ranges={[
                  {
                    startDate: checkIn,
                    endDate: checkOut,
                    key: "selection",
                  },
                ]}
                months={2}
                direction="horizontal"
                moveRangeOnFirstSelection={false}
                showDateDisplay={false}
                minDate={today}
                onChange={(item: any) => {
                  const start = item.selection.startDate || today;
                  const nextDay = addDays(start, 1);

                  setCheckIn(start);
                  setCheckOut(nextDay);
                  setCheckInOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* CHECK OUT */}
        <div
          ref={checkOutRef}
          className="relative border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
        >
          <button
            type="button"
            onClick={() => {
              setCheckOutOpen((prev) => !prev);
              setCheckInOpen(false);
            }}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
                Check Out
              </div>
              <div className="mt-1 text-[15px] font-extrabold text-white">
                {format(checkOut, "dd MMM yy")}
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                {format(checkOut, "EEEE")}
              </div>
            </div>
            <Calendar className="h-4 w-4 text-cyan-300" />
          </button>

          {checkOutOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 rounded-2xl bg-white shadow-2xl">
              <DateRange
                ranges={[
                  {
                    startDate: checkIn,
                    endDate: checkOut,
                    key: "selection",
                  },
                ]}
                months={2}
                direction="horizontal"
                moveRangeOnFirstSelection={false}
                showDateDisplay={false}
                minDate={addDays(checkIn, 1)}
                onChange={(item: any) => {
                  const end = item.selection.endDate || addDays(checkIn, 1);

                  if (end > checkIn) {
                    setCheckOut(end);
                    setCheckOutOpen(false);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* ROOMS */}
        <div className="border-r border-white/10 bg-white/[0.035] px-0 py-0 transition hover:bg-white/[0.07]">
          <div className="[&>div]:!w-full [&>div>button:first-child]:!h-[78px] [&>div>button:first-child]:!w-full [&>div>button:first-child]:!rounded-none [&>div>button:first-child]:!border-0 [&>div>button:first-child]:!bg-transparent [&>div>button:first-child]:!text-white [&>div>button:first-child]:!shadow-none [&>div>button:first-child_*]:!text-white [&>div>button:first-child_*:first-child]:!text-cyan-300">
            <RoomGuestSelector
              state={{ rooms }}
              dispatch={(action: any) => {
                if (action.type === "SET_ROOMS") {
                  setRooms(action.payload);
                }
              }}
              popup={popup}
              setPopup={setPopup}
              popupRef={popupRef}
            />
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="flex items-center justify-center bg-white/[0.04] px-3 py-2">
          <button
            type="button"
            onClick={handleSearch}
            className="h-[46px] w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-500"
          >
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}