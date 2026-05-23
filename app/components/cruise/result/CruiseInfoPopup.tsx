"use client";

import { X } from "lucide-react";
import { CruiseInfoItem } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  open: boolean;
  item: CruiseInfoItem | null;
  onClose: () => void;
};

export default function CruiseInfoPopup({ open, item, onClose }: Props) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
      <div className="relative w-full max-w-[640px] rounded-[24px] border border-slate-200 bg-[#fff9ec] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white"
        >
          <X size={18} />
        </button>

        <div className="space-y-5">
          <div className="text-[28px] font-semibold text-slate-900">
            {item.title}
          </div>

          <div className="border-t border-slate-300" />

          <div className="text-[22px] font-medium text-slate-800">
            {item.label}
          </div>

          <div className="rounded-xl border border-slate-300 bg-white px-5 py-5 text-[18px] leading-8 text-slate-700">
            {item.description}
          </div>
        </div>
      </div>
    </div>
  );
}