"use client";

import { useEffect, useRef, useState } from "react";
import CruiseTravellersPopover from "./CruiseTravellersPopover";
import { CruiseTravellers } from "@/app/lib/cruise/cruiseTypes";
import { getCruiseTravellersLabel } from "@/app/lib/cruise/cruiseSearchHelpers";

type CruiseTravellersFieldProps = {
  value: CruiseTravellers;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onUpdate: (key: "adults" | "children" | "infants", delta: number) => void;
  error?: string;
};

export default function CruiseTravellersField({
  value,
  isOpen,
  onOpen,
  onClose,
  onUpdate,
  error,
}: CruiseTravellersFieldProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [localValue, setLocalValue] = useState<CruiseTravellers>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

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

  const travellersLabel = getCruiseTravellersLabel(localValue);

  function handleUpdate(
    key: "adults" | "children" | "infants",
    delta: number
  ) {
    setLocalValue((prev) => {
      const currentValue = prev[key];
      const nextValue = currentValue + delta;

      const guardedValue =
        key === "adults" ? Math.max(1, nextValue) : Math.max(0, nextValue);

      return {
        ...prev,
        [key]: guardedValue,
      };
    });

    onUpdate(key, delta);
  }

  return (
    <div ref={fieldRef} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="flex min-h-[132px] w-full flex-col items-start justify-center rounded-2xl px-4 py-4 text-left transition hover:bg-white/75"
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
          Travellers
        </span>

        <span className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-[21px] text-slate-950">
          {travellersLabel}
        </span>

        <span className="mt-2 line-clamp-2 text-[12px] leading-[16px] text-slate-600">
          Select guests
        </span>
      </button>

      {error ? <p className="mt-1 px-2 text-xs text-red-500">{error}</p> : null}

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-[300px] max-w-[90vw]">
          <CruiseTravellersPopover value={localValue} onUpdate={handleUpdate} />
        </div>
      ) : null}
    </div>
  );
}