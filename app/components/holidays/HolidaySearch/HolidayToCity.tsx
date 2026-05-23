"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  value: string;
  setValue: any;
};

export default function HolidayToCity({ value, setValue }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<any>(null);

  const cities = [
    "Jaipur",
    "Delhi",
    "Mumbai",
    "Goa",
    "Kerala",
    "Manali",
    "Andaman",
    "Leh",
    "Gangtok",
    "Bali",
    "Nainital",
    "Kashmir",
    "Vietnam",
    "Mauritius",
    "Maldives",
  ];

  const filtered = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <div
        onClick={() => setOpen(!open)}
        className="relative flex h-[86px] w-[200px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
      >
        <span className="text-[11px] font-bold text-slate-600">
          To City
        </span>

        <p className="truncate text-lg font-extrabold text-slate-950">
          {value || "Select City"}
        </p>

        <span className="text-[11px] text-slate-600">Destination</span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
      </div>

      {open && (
        <div className="absolute left-0 top-[90px] z-[9999] max-h-60 w-[220px] overflow-y-auto rounded-2xl border border-slate-700 bg-white text-black shadow-2xl">
          <input
            type="text"
            placeholder="Search City"
            className="w-full border-b border-slate-200 bg-white p-3 text-sm font-medium text-black outline-none placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.map((c, i) => (
            <p
              key={i}
              onClick={() => {
                setValue(c);
                setOpen(false);
                setSearch("");
              }}
              className="cursor-pointer px-4 py-3 text-sm font-semibold text-black hover:bg-orange-50"
            >
              {c}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}