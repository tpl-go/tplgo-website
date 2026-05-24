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
    <div ref={ref} className="relative w-full shrink-0 md:w-auto">
      <div
        onClick={() => setOpen(!open)}
        className="relative flex min-h-[86px] w-full cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/70 px-4 py-3 shadow-sm md:h-[86px] md:w-[200px] md:bg-white/60 md:shadow-none"
      >
        <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-slate-600 md:text-[11px] md:normal-case md:tracking-normal">
          To City
        </span>

        <p className="mt-1 truncate text-[22px] font-extrabold leading-tight text-slate-950 md:text-lg">
          {value || "Select City"}
        </p>

        <span className="mt-0.5 text-[11px] leading-none text-slate-600">
          Destination
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
      </div>

      {open && (
        <div className="absolute left-0 top-[92px] z-[9999] max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-700 bg-white text-black shadow-2xl md:top-[90px] md:max-h-60 md:w-[220px]">
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