"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
};

export default function MultiCityModal({
  isOpen,
  onClose,
  title,
  maxWidthClass = "max-w-5xl",
  children,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 px-0 py-0 backdrop-blur-[2px] sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[92vh] w-full ${maxWidthClass} overflow-hidden rounded-t-[28px] border border-white/70 bg-white shadow-[0_-18px_60px_rgba(15,23,42,0.28)] sm:max-h-[90vh] sm:rounded-3xl sm:shadow-[0_24px_80px_rgba(15,23,42,0.24)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <div className="text-[16px] font-black text-slate-950 sm:text-[18px]">
              {title || "Details"}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Multi City leg
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[24px] leading-none text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-68px)] overflow-y-auto bg-slate-50 sm:max-h-[calc(90vh-78px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
