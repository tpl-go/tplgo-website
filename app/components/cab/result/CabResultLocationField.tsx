"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CAB_LOCATION_OPTIONS } from "@/app/lib/cab/cabSearchData";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function CabResultLocationField({
  value,
  onChange,
  placeholder,
}: Props) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return CAB_LOCATION_OPTIONS;
    return CAB_LOCATION_OPTIONS.filter(
      (item) =>
        item.city.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.code || "").toLowerCase().includes(q)
    );
  }, [value]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={triggerRef} className="relative overflow-visible">
      <div>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] font-semibold text-white outline-none placeholder:text-slate-400 sm:text-[16px]"
        />
      </div>

      {open ? (
        <div
          ref={popupRef}
          className="absolute left-0 right-0 top-full z-[220] mt-2 max-h-[260px] overflow-hidden overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-2xl md:max-h-[300px]"
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="max-h-[260px] touch-pan-y overflow-y-auto overscroll-contain p-2 md:max-h-[300px]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.city);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-sky-50"
                >
                  <div className="text-[15px] font-semibold text-slate-800">
                    {item.city}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    {item.label}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-slate-500">
                No location found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
