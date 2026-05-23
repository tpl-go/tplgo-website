"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";
import CabTimePicker from "./CabTimePicker";

type Props = {
  label: string;
  value: string;
  helperText?: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export default function CabTimeField({
  label,
  value,
  helperText,
  onChange,
  compact = false,
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
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const boxHeight = compact ? "h-[75px]" : "h-[86px]";
  const iconBox = compact ? "h-9 w-9" : "h-10 w-10";

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex ${boxHeight} w-full items-center justify-between gap-2 rounded-2xl border border-black bg-white/60 px-3 py-2 text-left transition-all duration-300 hover:bg-white/75`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex ${iconBox} shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600`}
          >
            <Clock3 size={16} />
          </div>

          <div className="min-w-0 text-left">
            <div className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {label}
            </div>

            <div className="whitespace-nowrap text-[15px] font-extrabold leading-[18px] text-slate-950">
              {value}
            </div>

            {helperText ? (
              <div className="mt-1 truncate text-[10px] text-slate-600">
                {helperText}
              </div>
            ) : (
              <div className="mt-1 truncate text-[10px] text-slate-600">
                Select time
              </div>
            )}
          </div>
        </div>

        <ChevronDown size={16} className="shrink-0 text-black" />
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