"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";
import PackageRoomGuestSelector from "./PackageRoomGuestSelector";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Room = {
  adults: number;
  children: number;
};

type Props = {
  originCity: string;
  setOriginCity: (value: string) => void;

  travelDate: Date;
  setTravelDate: (value: Date) => void;

  rooms: Room[];
  setRooms: (rooms: Room[]) => void;

  onApply?: () => void;
  hasPendingChanges?: boolean;
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
  "Srinagar",
  "Gulmarg",
  "Pahalgam",
  "Kochi",
  "Munnar",
  "Thekkady",
  "Alleppey",
];

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function PackageCompactSearchBar({
  originCity,
  setOriginCity,
  travelDate,
  setTravelDate,
  rooms,
  setRooms,
  onApply,
  hasPendingChanges = false,
}: Props) {
  const today = getToday();

  const [cityInput, setCityInput] = useState(originCity || "");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement | null>(null);

  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCityInput(originCity || "");
  }, [originCity]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (cityRef.current && !cityRef.current.contains(target)) {
        setCityOpen(false);
      }

      if (dateRef.current && !dateRef.current.contains(target)) {
        setDateOpen(false);
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
      item.toLowerCase().includes(cityInput.toLowerCase())
    );
  }, [cityInput]);

  const totalAdults = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.adults, 0);
  }, [rooms]);

  const totalChildren = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.children, 0);
  }, [rooms]);

  const guestLabel = useMemo(() => {
    let label = `${totalAdults} Adult${totalAdults > 1 ? "s" : ""}`;
    if (totalChildren > 0) {
      label += `, ${totalChildren} Child${totalChildren > 1 ? "ren" : ""}`;
    }
    return label;
  }, [totalAdults, totalChildren]);

  return (
    <div className="relative w-full overflow-visible rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-[2.1fr_1.15fr_1.2fr_155px] items-stretch overflow-visible">
        <div
          ref={cityRef}
          className="relative border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
            Origin City
          </div>

          <div className="mt-1 flex items-center gap-2">
            <input
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setOriginCity(e.target.value);
                setCityOpen(true);
              }}
              onFocus={() => setCityOpen(true)}
              placeholder="Enter Origin City"
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
                        setCityInput(item);
                        setOriginCity(item);
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

        <div
          ref={dateRef}
          className="relative border-r border-white/10 bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.07]"
        >
          <button
            type="button"
            onClick={() => setDateOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
                Travel Date
              </div>
              <div className="mt-1 text-[15px] font-extrabold text-white">
                {format(travelDate, "dd MMM yy")}
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                {format(travelDate, "EEEE")}
              </div>
            </div>
            <Calendar className="h-4 w-4 text-cyan-300" />
          </button>

          {dateOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 rounded-2xl bg-white shadow-2xl">
              <DateRange
                ranges={[
                  {
                    startDate: travelDate,
                    endDate: addDays(travelDate, 1),
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
                  setTravelDate(start);
                  setDateOpen(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="border-r border-white/10 bg-white/[0.035] px-0 py-0 transition hover:bg-white/[0.07]">
          <div className="[&>div]:!w-full [&>div>button:first-child]:!h-[68px] [&>div>button:first-child]:!w-full [&>div>button:first-child]:!rounded-none [&>div>button:first-child]:!border-0 [&>div>button:first-child]:!bg-transparent [&>div>button:first-child]:!text-white [&>div>button:first-child]:!shadow-none [&>div>button:first-child_*]:!text-white [&>div>button:first-child_*:first-child]:!text-cyan-300">
            <PackageRoomGuestSelector
              rooms={rooms}
              setRooms={setRooms}
              popup={popup}
              setPopup={setPopup}
              popupRef={popupRef}
            />
          </div>
        </div>

        <div className="flex items-center justify-center bg-white/[0.04] px-3 py-2">
          <button
            type="button"
            onClick={onApply}
            className={`h-[46px] w-full rounded-xl px-4 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition ${
              hasPendingChanges
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-500"
                : "bg-gradient-to-r from-cyan-500/80 to-blue-500/80"
            }`}
          >
            MODIFY
          </button>
        </div>
      </div>
    </div>
  );
}