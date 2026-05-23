"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { CAB_RENTAL_PACKAGES } from "@/app/lib/cab/cabSearchData";
import type { CabRentalPackage } from "@/app/lib/cab/cabSearchTypes";

type Props = {
  value: CabRentalPackage | null;
  onChange: (pkg: CabRentalPackage) => void;
  compact?: boolean;
};

export default function CabPackageField({
  value,
  onChange,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !wrapperRef.current) return;

    function updatePosition() {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const gap = 10;

      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + gap;
      let width = rect.width;

      const minLeft = window.scrollX + 16;
      const maxLeft = window.scrollX + window.innerWidth - width - 16;

      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      setPopupStyle({
        top,
        left,
        width,
      });
    }

    updatePosition();

    const handle = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handle);
    window.addEventListener("resize", handle);

    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
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

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedLabel = useMemo(() => {
    return value?.label || "Select package";
  }, [value]);

  return (
    <>
      <div ref={wrapperRef} className="relative w-full min-w-0">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-2xl border border-black bg-white/60 px-3 py-2 text-left transition-all duration-300 hover:bg-white/75 ${
            compact ? "h-[75px]" : "h-[86px]"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Rental Package
            </div>

            <div
              className={`truncate font-extrabold text-slate-950 ${
                compact ? "text-[14px]" : "text-[15px]"
              }`}
            >
              {selectedLabel}
            </div>

            <div className="mt-1 truncate text-[10px] text-slate-600">
              Choose KM & Hours package
            </div>
          </div>

          <ChevronDown
            size={16}
            className={`shrink-0 text-black transition duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[130] rounded-2xl border border-black bg-white shadow-[0_20px_40px_rgba(15,23,42,0.14)]"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <div
              className="max-h-[220px] overflow-y-auto overscroll-contain p-2"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {CAB_RENTAL_PACKAGES.map((item) => {
                const active = value?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      active
                        ? "bg-orange-500 text-white"
                        : "text-slate-800 hover:bg-orange-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold">
                        {item.label}
                      </div>
                    </div>

                    {active ? (
                      <span className="ml-3 text-[11px] font-extrabold">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}