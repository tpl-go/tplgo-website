"use client";

import { useState } from "react";
import { Compass, PlayCircle, Sparkles, X } from "lucide-react";

type Props = {
  city: string;
  total: number;
};

export default function HomestayResultsTopStrip({ city, total }: Props) {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <>
      <div className="mb-3 overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white px-3 py-3 text-sm shadow-[0_1px_8px_rgba(16,24,40,0.05)] md:flex md:items-center md:justify-between md:gap-3 md:rounded-none md:px-4 md:py-2.5 md:shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="min-w-0 border-b border-[#eef2f7] pb-2 md:flex md:items-center md:gap-3 md:overflow-hidden md:border-b-0 md:pb-0">
          <div className="min-w-0 md:shrink-0">
            <div className="truncate text-[15px] font-extrabold text-[#111827] md:inline">
              Homestays in {city}
            </div>
            <span className="mt-0.5 block text-[12px] font-semibold text-[#64748b] md:ml-1 md:mt-0 md:inline md:text-[14px] md:text-[#4b5563]">
              {total} homestays available
            </span>
          </div>

          <span className="hidden text-[#cbd5e1] md:inline">|</span>

          <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-0 md:flex-nowrap md:gap-3">
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dbeafe] bg-[#f8fbff] px-3 py-1 text-[12px] font-bold text-[#0b74ff] transition hover:bg-[#eef6ff] md:text-[13px] md:font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            TPL Picks
          </button>

          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-[#fcfcfd] px-3 py-1 text-[12px] font-bold text-[#374151] transition hover:border-[#dbeafe] hover:bg-[#f8fbff] hover:text-[#0b74ff] md:text-[13px] md:font-semibold"
          >
            <Compass className="h-3.5 w-3.5" />
            Offbeat
          </button>

          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dbeafe] bg-[#f8fbff] px-3 py-1 text-[12px] font-bold text-[#0b74ff] transition hover:bg-[#eef6ff] md:hidden"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Explore with TPL
          </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowVideoModal(true)}
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#dbeafe] bg-[#f8fbff] px-3 py-1 text-[13px] font-semibold text-[#0b74ff] transition hover:bg-[#eef6ff] md:inline-flex"
        >
          <PlayCircle className="h-4 w-4" />
          Watch Video
        </button>
      </div>

      {showVideoModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div className="min-w-0">
                <div className="truncate text-[18px] font-extrabold text-[#111827] md:text-[20px]">
                  Explore Homestays in {city} with TPL
                </div>
                <div className="mt-1 text-[13px] font-medium text-[#6b7280]">
                  Watch before you book
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#374151] transition hover:bg-[#f8fafc]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-[#f8fbff]">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#dbeafe] to-[#eef6ff]">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                      <PlayCircle className="h-9 w-9 text-[#0b74ff]" />
                    </div>
                    <div className="mt-4 text-[18px] font-extrabold text-[#111827]">
                      YouTube Video Space
                    </div>
                    <div className="mt-1 text-[14px] font-medium text-[#4b5563]">
                      Homestay destination guide video yahan embed hoga
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-3">
                  <div className="text-[12px] font-bold uppercase text-[#6b7280]">
                    Best For
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    Cozy stay understanding
                  </div>
                </div>

                <div className="rounded-xl border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-3">
                  <div className="text-[12px] font-bold uppercase text-[#6b7280]">
                    Helps In
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    Better homestay selection
                  </div>
                </div>

                <div className="rounded-xl border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-3">
                  <div className="text-[12px] font-bold uppercase text-[#6b7280]">
                    Powered By
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    TPL Explorer Guide
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="rounded-lg bg-[#0b74ff] px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:opacity-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
