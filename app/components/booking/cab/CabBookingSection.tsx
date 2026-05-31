"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export default function CabBookingSection({
  title,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span className="break-words text-[17px] font-extrabold text-slate-900 sm:text-[18px]">
          {title}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="border-t border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
