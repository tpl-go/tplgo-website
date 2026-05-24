"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

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

type Props = {
  dispatch: any;
  value?: string;
  placeholder?: string;
};

export default function CitySelector({
  dispatch,
  value = "",
  placeholder = "Enter City",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const ref = useRef<any>(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = cities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: string) => {
    setSearch(city);
    dispatch({ type: "SET_CITY", payload: city });
    setOpen(false);
  };

  const handleChange = (text: string) => {
    setSearch(text);
    dispatch({ type: "SET_CITY", payload: text });
  };

  return (
    <div ref={ref} className="relative w-full shrink-0 md:w-auto">
      <div
        onClick={() => setOpen(true)}
        className="flex h-[76px] md:h-[86px] w-full md:w-[240px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
      >
        <span className="text-[10px] md:text-[11px] font-bold text-slate-600">
          City, Hotel or Location
        </span>

        <div className="mt-1 flex w-full items-center">
          <input
            value={search}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setOpen(true)}
            className="min-w-0 flex-1 bg-transparent text-base md:text-lg font-extrabold text-slate-950 outline-none placeholder:text-slate-500"
            placeholder={placeholder}
          />

          <ChevronDown
            size={17}
            className="ml-2 flex-shrink-0 text-slate-700 pointer-events-none"
          />
        </div>

        <span className="text-[10px] md:text-[11px] text-slate-600">
          Search by destination
        </span>
      </div>

      {open && (
        <div className="absolute left-0 top-[82px] md:top-[90px] z-[9999] max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-700 bg-white text-black shadow-2xl">
          {filtered.length > 0 ? (
            filtered.map((city, i) => (
              <div
                key={i}
                onClick={() => handleSelect(city)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold hover:bg-orange-50"
              >
                <MapPin size={16} />
                {city}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching city found
            </div>
          )}
        </div>
      )}
    </div>
  );
}