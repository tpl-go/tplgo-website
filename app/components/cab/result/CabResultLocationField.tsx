"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    width: 320,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    let left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY + 8;
    const maxLeft = window.scrollX + window.innerWidth - width - 16;
    if (left > maxLeft) left = Math.max(window.scrollX + 16, maxLeft);
    setPopupStyle({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handle = () => updatePosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open]);

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
    <>
      <div ref={triggerRef}>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[16px] font-semibold text-white outline-none placeholder:text-slate-400"
        />
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[140] max-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <div className="max-h-[300px] overflow-y-auto p-2">
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
          </div>,
          document.body
        )}
    </>
  );
}