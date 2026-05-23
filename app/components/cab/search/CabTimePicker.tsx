"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  value: string;
  open: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onApply: (value: string) => void;
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

export default function CabTimePicker({
  value,
  open,
  anchorRef,
  onClose,
  onApply,
}: Props) {
  const initial = useMemo(() => parseTime(value), [value]);

  const [mounted, setMounted] = useState(false);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedMeridiem, setSelectedMeridiem] = useState<"AM" | "PM">(
  initial.meridiem === "PM" ? "PM" : "AM"
);
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const next = parseTime(value);
    setSelectedHour(next.hour);
    setSelectedMinute(next.minute);
    setSelectedMeridiem(next.meridiem === "PM" ? "PM" : "AM");
  }, [open, value]);

  useEffect(() => {
    if (!open || !anchorRef?.current) return;

    function updatePosition() {
      if (!anchorRef?.current) return;

      const rect = anchorRef.current.getBoundingClientRect();
      const popupWidth = 360;
      const gap = 10;

      let left =
        rect.left + window.scrollX + rect.width / 2 - popupWidth / 2;

      let top = rect.bottom + window.scrollY + gap;

      const minLeft = window.scrollX + 16;
      const maxLeft = window.scrollX + window.innerWidth - popupWidth - 16;

      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      setPopupStyle({ top, left });
    }

    updatePosition();

    const handle = () => updatePosition();

    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);

    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="absolute z-[30] w-[360px] overflow-hidden rounded-[20px] border border-black bg-white shadow-2xl"
      style={{
        top: popupStyle.top,
        left: popupStyle.left,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="text-[14px] font-extrabold text-slate-900">
          Pickup Time
        </div>

        <button
          type="button"
          onClick={() =>
            onApply(`${selectedHour}:${selectedMinute} ${selectedMeridiem}`)
          }
          className="rounded-full bg-orange-600 px-4 py-2 text-[12px] font-extrabold text-white transition hover:bg-orange-700"
        >
          APPLY
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        <PickerColumn
          title="Hour"
          options={HOURS}
          selectedValue={selectedHour}
          onSelect={setSelectedHour}
          suffix="Hr"
        />

        <PickerColumn
          title="Minute"
          options={MINUTES}
          selectedValue={selectedMinute}
          onSelect={setSelectedMinute}
          suffix="min"
        />

        <PickerColumn
          title="AM / PM"
          options={[...MERIDIEMS]}
          selectedValue={selectedMeridiem}
          onSelect={(value) => setSelectedMeridiem(value as "AM" | "PM")}
        />
      </div>
    </div>,
    document.body
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
      <div className="mb-2 text-[12px] font-bold text-slate-600">{title}</div>

      <div className="h-[220px] overflow-y-auto rounded-2xl border border-black/20 bg-slate-50 p-2">
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
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600"
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