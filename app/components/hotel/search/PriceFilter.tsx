"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function PriceFilter({ dispatch }: any) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select Range");

  const dropdownRef = useRef<any>(null);

  // 🔥 Outside click close
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);

    dispatch({
      type: "PRICE",
      payload: value,
    });

    setOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative shrink-0"
    >
      <div
        onClick={() => setOpen(!open)}
        className="flex h-[86px] w-[190px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
      >
        <span className="text-[11px] font-bold text-slate-600">
          PRICE PER NIGHT
        </span>

        <div className="flex w-full items-center justify-between">
          <span className="truncate text-lg font-extrabold text-slate-950">
            {selected}
          </span>

          <ChevronDown size={17} className="text-slate-700" />
        </div>

        <span className="text-[11px] text-slate-600">
          Budget preference
        </span>
      </div>

      {open && (
        <div className="absolute left-0 top-[90px] z-[9999] w-full overflow-hidden rounded-2xl border border-slate-700 bg-white text-black shadow-2xl">
          <div
            onClick={() => handleSelect("₹0–₹1500")}
            className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-orange-50"
          >
            ₹0–₹1500
          </div>

          <div
            onClick={() => handleSelect("₹1500–₹2500")}
            className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-orange-50"
          >
            ₹1500–₹2500
          </div>

          <div
            onClick={() => handleSelect("₹2500–₹5000")}
            className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-orange-50"
          >
            ₹2500–₹5000
          </div>

          <div
            onClick={() => handleSelect("₹5000+")}
            className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-orange-50"
          >
            ₹5000+
          </div>
        </div>
      )}
    </div>
  );
}