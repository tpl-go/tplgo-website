"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Layers3 } from "lucide-react";
import { TRAIN_CLASSES } from "./trainData";
import type { TrainClassType } from "./trainTypes";

type Props = {
  value: TrainClassType;
  onChange: (value: TrainClassType) => void;
};

export default function TrainClassSelector({ value, onChange }: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const width = rect.width;
    const gap = 10;

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + gap;

    const maxLeft = window.scrollX + window.innerWidth - width - 16;
    if (left > maxLeft) {
      left = Math.max(window.scrollX + 16, maxLeft);
    }

    const safeHeaderBottom = window.scrollY + 120;
    if (top < safeHeaderBottom) {
      top = safeHeaderBottom;
    }

    setPopupStyle({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeClass =
    TRAIN_CLASSES.find((item) => item.value === value) || TRAIN_CLASSES[0];

  return (
    <>
      <div className="w-full min-w-[180px]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[86px] w-full items-center gap-3 rounded-2xl border border-black bg-white/60 px-4 py-3 text-left transition-all duration-300 hover:bg-white/75"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
            <Layers3 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Class
            </p>

            <p className="text-lg font-extrabold text-slate-950">
              {activeClass.value}
            </p>

            <span className="text-[11px] text-slate-600">
              {activeClass.label}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-black" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[9999] max-h-[320px] overflow-hidden rounded-2xl border border-black bg-white shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <div className="max-h-[320px] overflow-y-auto p-2">
              {TRAIN_CLASSES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`block w-full rounded-xl px-4 py-3 text-left text-[15px] transition ${
                    item.value === value
                      ? "bg-orange-50 font-bold text-orange-600"
                      : "text-slate-700 hover:bg-orange-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}