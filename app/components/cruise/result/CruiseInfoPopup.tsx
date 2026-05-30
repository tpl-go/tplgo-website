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
    <>
      <div className="fixed inset-0 z-[180] h-[100dvh] overflow-hidden bg-black/45 md:hidden">
        <div className="absolute inset-x-0 bottom-0 flex h-[84dvh] max-h-[84dvh] min-h-0 flex-col overflow-hidden rounded-t-[30px] border border-slate-200 bg-[#fff9ec] shadow-[0_-18px_40px_rgba(15,23,42,0.24)]">
          <div className="shrink-0 border-b border-slate-200 bg-[#fff9ec] px-5 pb-4 pt-5 pr-16">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg"
              aria-label="Close cruise info"
            >
              <X size={18} />
            </button>

            <div className="inline-flex rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-[12px] font-extrabold text-orange-700">
              Cruise Info
            </div>

            <div className="mt-3 line-clamp-2 text-[22px] font-black leading-7 text-slate-900">
              {item.title}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
            <div className="rounded-2xl border border-orange-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
                Selected topic
              </div>
              <div className="mt-1 break-words text-[15px] font-black text-slate-900">
                {item.label}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] font-medium leading-7 text-slate-700 shadow-sm">
              {item.description}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 z-[80] hidden items-center justify-center bg-black/45 px-4 md:flex">
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
    </>
  );
}
