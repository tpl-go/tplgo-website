"use client";

import { useEffect, useRef } from "react";
import { CruiseDurationOption } from "@/app/lib/cruise/cruiseTypes";

type CruiseDurationFieldProps = {
  value: CruiseDurationOption | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (duration: CruiseDurationOption) => void;
  options: CruiseDurationOption[];
};

export default function CruiseDurationField({
  value,
  isOpen,
  onOpen,
  onClose,
  onSelect,
  options,
}: CruiseDurationFieldProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={fieldRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="flex min-h-[132px] w-full flex-col items-start justify-center rounded-2xl px-4 py-4 text-left transition hover:bg-white/75"
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
          Duration
        </span>

        <span className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-[21px] text-slate-950">
          {value?.label || "Any Duration"}
        </span>

        <span className="mt-2 line-clamp-2 text-[12px] leading-[16px] text-slate-600">
          Choose cruise nights
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[9999] w-full">
          <div className="rounded-2xl border border-black bg-white p-2 shadow-2xl">
            <ul className="space-y-1">
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(option)}
                    className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                      value?.id === option.id
                        ? "bg-orange-500 text-white"
                        : "text-slate-800 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}