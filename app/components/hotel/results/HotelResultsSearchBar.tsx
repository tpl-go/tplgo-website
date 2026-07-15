"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import type { RangeKeyDict } from "react-date-range";
import { format, addDays } from "date-fns";
import RoomGuestSelector from "../search/RoomGuestSelector";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Room = {
  adults: number;
  children: number;
};

type RoomAction = {
  type: string;
  payload?: Room[];
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
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function toQueryDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const mobileCityRef = useRef<HTMLDivElement | null>(null);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const checkInRef = useRef<HTMLDivElement | null>(null);
  const mobileCheckInRef = useRef<HTMLDivElement | null>(null);

  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const checkOutRef = useRef<HTMLDivElement | null>(null);
  const mobileCheckOutRef = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const mobilePopupRef = useRef<HTMLDivElement | null>(null);

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      const insideCity =
        cityRef.current?.contains(target) || mobileCityRef.current?.contains(target);
      const insideCheckIn =
        checkInRef.current?.contains(target) ||
        mobileCheckInRef.current?.contains(target);
      const insideCheckOut =
        checkOutRef.current?.contains(target) ||
        mobileCheckOutRef.current?.contains(target);
      const insidePopup =
        popupRef.current?.contains(target) || mobilePopupRef.current?.contains(target);

      if (!insideCity) {
        setCityOpen(false);
      }

      if (!insideCheckIn) {
        setCheckInOpen(false);
      }

      if (!insideCheckOut) {
        setCheckOutOpen(false);
      }

      if (!insidePopup) {
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
    <>
      <div className="relative w-full overflow-visible rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)] md:hidden">
        <div className="relative" ref={mobileCityRef}>
          <div className="border-b border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
              City, Area or Property
            </div>

            <div className="mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-cyan-300" />
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setCityOpen(true);
              }}
              onFocus={() => setCityOpen(true)}
              placeholder="Enter City"
              className="h-[30px] min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-extrabold text-white outline-none placeholder:text-slate-400"
            />
            <ChevronDown className="h-4 w-4 shrink-0 text-cyan-300" />
            </div>
          </div>

          {cityOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl">
              <div className="max-h-56 overflow-y-auto py-1 scrollbar-hide">
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

        <div className="grid grid-cols-1 items-stretch overflow-visible">
          <div
            ref={mobileCheckInRef}
            className="relative border-b border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
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
              <div className="fixed inset-x-3 top-[118px] z-[60] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <DateRange
                  ranges={[
                    {
                      startDate: checkIn,
                      endDate: checkOut,
                      key: "selection",
                    },
                  ]}
                  months={1}
                  direction="vertical"
                  moveRangeOnFirstSelection={false}
                  showDateDisplay={false}
                  minDate={today}
                  onChange={(item: RangeKeyDict) => {
                    const start = item.selection?.startDate || today;
                    const nextDay = addDays(start, 1);

                    setCheckIn(start);
                    setCheckOut(nextDay);
                    setCheckInOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <div
            ref={mobileCheckOutRef}
            className="relative border-b border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
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
              <div className="fixed inset-x-3 top-[118px] z-[60] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <DateRange
                  ranges={[
                    {
                      startDate: checkIn,
                      endDate: checkOut,
                      key: "selection",
                    },
                  ]}
                  months={1}
                  direction="vertical"
                  moveRangeOnFirstSelection={false}
                  showDateDisplay={false}
                  minDate={addDays(checkIn, 1)}
                  onChange={(item: RangeKeyDict) => {
                    const end = item.selection?.endDate || addDays(checkIn, 1);

                    if (end > checkIn) {
                      setCheckOut(end);
                      setCheckOutOpen(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0">
          <div className="min-w-0 border-b border-white/10 bg-white/[0.035]">
            <div className="[&>div]:!w-full [&>div>button:first-child]:!min-h-[72px] [&>div>button:first-child]:!w-full [&>div>button:first-child]:!rounded-none [&>div>button:first-child]:!border-0 [&>div>button:first-child]:!bg-transparent [&>div>button:first-child]:!px-3 [&>div>button:first-child]:!py-2.5 [&>div>button:first-child]:!text-white [&>div>button:first-child]:!shadow-none [&>div>button:first-child_*]:!text-white [&>div>button:first-child_*:first-child]:!text-cyan-300 [&>div>button:first-child>p]:!whitespace-normal [&>div>button:first-child>p]:!break-words [&>div>button:first-child>p]:!pr-7 [&>div>button:first-child>p]:!text-[14px] [&>div>button:first-child>p]:!leading-[18px]">
              <RoomGuestSelector
                state={{ rooms }}
                dispatch={(action: RoomAction) => {
                  if (action.type === "SET_ROOMS" && action.payload) {
                    setRooms(action.payload);
                  }
                }}
                popup={popup}
                setPopup={setPopup}
                popupRef={mobilePopupRef}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="m-3 h-[46px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition hover:from-cyan-300 hover:to-blue-500"
          >
            SEARCH
          </button>
        </div>
      </div>

      <div className="relative hidden w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)] md:block">
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
                onChange={(item: RangeKeyDict) => {
                  const start = item.selection?.startDate || today;
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
                onChange={(item: RangeKeyDict) => {
                  const end = item.selection?.endDate || addDays(checkIn, 1);

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
              dispatch={(action: RoomAction) => {
                if (action.type === "SET_ROOMS" && action.payload) {
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
    </>
  );
}
