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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[90vh] w-full ${maxWidthClass} overflow-hidden rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <div className="text-[18px] font-semibold text-[#111827]">
            {title || "Details"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[30px] leading-none text-[#111827] hover:text-[#ef4444]"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(90vh-72px)] overflow-y-auto bg-[#f8fbff]">
          {children}
        </div>
      </div>
    </div>
  );
}