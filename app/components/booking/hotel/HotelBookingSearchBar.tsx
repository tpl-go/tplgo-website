"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";
import type { Hotel } from "@/app/data/stays/types";
import RoomGuestSelector from "@/app/components/hotel/search/RoomGuestSelector";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Room = {
  adults: number;
  children: number;
};

type Props = {
  hotel: Hotel;
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

export default function HotelBookingSearchBar({ hotel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = getToday();

  const defaultPropertyText = `${hotel.title}, ${hotel.city}, India`;

  const [city, setCity] = useState(defaultPropertyText);
  const [checkIn, setCheckIn] = useState<Date>(today);
  const [checkOut, setCheckOut] = useState<Date>(getTomorrow(today));
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0 }]);

  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement | null>(null);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const checkInRef = useRef<HTMLDivElement | null>(null);

  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const checkOutRef = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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

    setCity(defaultPropertyText);
    setCheckIn(incomingCheckIn);
    setCheckOut(
      incomingCheckOut > incomingCheckIn
        ? incomingCheckOut
        : getTomorrow(incomingCheckIn)
    );
    setRooms(safeRooms);
  }, [searchParams, defaultPropertyText]);

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
      alert("Please fill Property, Check-in and Check-out");
      return;
    }

    const normalizedCurrent = defaultPropertyText.trim().toLowerCase();
    const normalizedInput = city.trim().toLowerCase();

    if (normalizedInput === normalizedCurrent) {
      const query = new URLSearchParams({
        city: hotel.city,
        checkIn: checkIn.toString(),
        checkOut: checkOut.toString(),
        rooms: String(rooms.length),
        adults: String(totalAdults),
      });

      router.push(`/hotels/booking?${query.toString()}`);
    } else {
      const query = new URLSearchParams({
        city: city.trim(),
        checkIn: checkIn.toString(),
        checkOut: checkOut.toString(),
        rooms: String(rooms.length),
        adults: String(totalAdults),
      });

      router.push(`/hotels/results?${query.toString()}`);
    }
  };

  return (
    <div className="relative w-full border border-[#d7dce3] bg-white">
      <div className="grid grid-cols-[2.5fr_1.1fr_1.1fr_1.2fr_180px] items-stretch">
        {/* CITY */}
        <div
          ref={cityRef}
          className="relative border-r border-[#d7dce3] px-4 py-2"
        >
          <div className="text-[11px] font-bold uppercase text-[#6b7280]">
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
              className="h-[28px] w-full border-0 bg-transparent p-0 text-[15px] font-bold text-[#111827] outline-none"
            />
            <ChevronDown className="h-4 w-4 text-[#111827]" />
          </div>

          {cityOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full border border-[#d9e2ec] bg-white shadow-xl">
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCity(item);
                        setCityOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] text-[#111827] hover:bg-[#f8fbff]"
                    >
                      <MapPin className="h-4 w-4 text-[#0b74ff]" />
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
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
          className="relative border-r border-[#d7dce3] px-4 py-2"
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
              <div className="text-[15px] font-bold text-[#111827]">
                {format(checkIn, "dd MMM yy")}
              </div>
              <div className="text-xs text-[#111827]">
                {format(checkIn, "EEEE")}
              </div>
            </div>
            <Calendar className="h-4 w-4 text-[#111827]" />
          </button>

          {checkInOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 bg-white shadow-xl">
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
          className="relative border-r border-[#d7dce3] px-4 py-2"
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
              <div className="text-[15px] font-bold text-[#111827]">
                {format(checkOut, "dd MMM yy")}
              </div>
              <div className="text-xs text-[#111827]">
                {format(checkOut, "EEEE")}
              </div>
            </div>
            <Calendar className="h-4 w-4 text-[#111827]" />
          </button>

          {checkOutOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 bg-white shadow-xl">
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
        <div className="border-r border-[#d7dce3] px-0 py-0">
          <div className="[&>div]:!w-full [&>div>button:first-child]:!h-[72px] [&>div>button:first-child]:!w-full [&>div>button:first-child]:!rounded-none [&>div>button:first-child]:!border-0 [&>div>button:first-child]:!bg-transparent [&>div>button:first-child]:!text-black [&>div>button:first-child]:!shadow-none">
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
        <div className="flex items-center justify-center px-4 py-2">
          <button
            type="button"
            onClick={handleSearch}
            className="h-[50px] w-full rounded-[6px] bg-[#0b74ff] text-[18px] font-extrabold text-white transition hover:opacity-95"
          >
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}