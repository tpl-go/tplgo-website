"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import CabTimePicker from "./CabTimePicker";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function CabTimeFieldCompactNoIcon({
  label,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[75px] w-full items-center justify-between rounded-2xl border border-black bg-white/60 px-3 py-2 text-left transition-all duration-300 hover:bg-white/75"
      >
        <div className="min-w-0">
          <div className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-600">
            {label}
          </div>

          <div className="whitespace-nowrap text-[15px] font-extrabold leading-[18px] text-slate-950">
            {value}
          </div>

          <div className="mt-1 truncate text-[10px] text-slate-600">
            Select time
          </div>
        </div>

        <ChevronDown
          size={16}
          className="shrink-0 text-black"
        />
      </button>

      <CabTimePicker
        value={value}
        open={open}
        anchorRef={wrapperRef}
        onClose={() => setOpen(false)}
        onApply={(nextValue) => {
          onChange(nextValue);
          setOpen(false);
        }}
      />
    </div>
  );
}