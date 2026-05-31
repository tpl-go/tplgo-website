"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);
const MERIDIEMS = ["AM", "PM"] as const;

function parseTime(value: string) {
  const safe = value?.trim() || "10:00 AM";
  const [timePart, meridiemPart = "AM"] = safe.split(" ");
  const [hh = "10", mm = "00"] = timePart.split(":");

  return {
    hour: HOURS.includes(hh) ? hh : "10",
    minute: MINUTES.includes(mm) ? mm : "00",
    meridiem: meridiemPart === "PM" ? "PM" : "AM",
  };
}

export default function CabResultTimeField({
  value,
  onChange,
  placeholder = "10:00 AM",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const initial = parseTime(value);

  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedMeridiem, setSelectedMeridiem] = useState<"AM" | "PM">(
  initial.meridiem === "PM" ? "PM" : "AM"
);

  useEffect(() => {
    if (!open) return;

    const next = parseTime(value);
    setSelectedHour(next.hour);
    setSelectedMinute(next.minute);
    setSelectedMeridiem(next.meridiem === "PM" ? "PM" : "AM");
  }, [open, value]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function applyTime() {
    onChange(`${selectedHour}:${selectedMinute} ${selectedMeridiem}`);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative overflow-visible">
      <input
        readOnly
        value={value}
        onClick={() => setOpen((prev) => !prev)}
        placeholder={placeholder}
        className="w-full cursor-pointer bg-transparent text-[15px] font-semibold text-white outline-none placeholder:text-slate-400 sm:text-[16px]"
      />

      {open && (
        <div
          ref={popupRef}
          className="absolute left-0 top-[calc(100%+8px)] z-[140] w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-[14px] font-extrabold text-slate-900">
              Select Time
            </div>

            <button
              type="button"
              onClick={applyTime}
              className="rounded-full bg-sky-600 px-4 py-2 text-[12px] font-extrabold text-white transition hover:bg-sky-700"
            >
              APPLY
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
            <PickerColumn
              title="Hour"
              options={HOURS}
              selectedValue={selectedHour}
              onSelect={setSelectedHour}
              suffix=""
            />

            <PickerColumn
              title="Minute"
              options={MINUTES}
              selectedValue={selectedMinute}
              onSelect={setSelectedMinute}
              suffix=""
            />

            <PickerColumn
              title="AM / PM"
              options={[...MERIDIEMS]}
              selectedValue={selectedMeridiem}
              onSelect={(value) => setSelectedMeridiem(value as "AM" | "PM")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PickerColumn({
  title,
  options,
  selectedValue,
  onSelect,
  suffix,
}: {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[12px] font-bold text-slate-500">{title}</div>

      <div className="h-[180px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:h-[220px]">
        <div className="space-y-2">
          {options.map((option) => {
            const active = selectedValue === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`flex h-[42px] w-full items-center justify-center rounded-xl text-[14px] font-bold transition ${
                  active
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-sky-50"
                }`}
              >
                {option}
                {suffix ? ` ${suffix}` : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
