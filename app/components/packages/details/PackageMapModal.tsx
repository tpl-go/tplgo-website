"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type Place = {
  name: string;
  lat: number;
  lng: number;
  day?: string;
};

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export default function PackageMapModal({
  open,
  onClose,
  title,
  places,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  places: Place[];
}) {
  const [max, setMax] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div
        className={`absolute flex flex-col overflow-hidden bg-white shadow-xl border rounded-none lg:rounded-2xl
        ${max ? "inset-0 lg:inset-4" : "inset-0 lg:left-1/2 lg:top-24 lg:h-[520px] lg:w-[980px] lg:max-w-[94vw] lg:-translate-x-1/2"}`}
      >
        {/* header */}
        <div className="min-h-12 shrink-0 px-3 py-2 flex flex-col gap-2 border-b bg-white lg:h-12 lg:flex-row lg:items-center lg:justify-between lg:px-4 lg:py-0">
          <div className="text-sm font-bold text-black">
            {title ? title : "Route Map"}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <button
              onClick={() => setMax((s) => !s)}
              className="px-3 py-1.5 rounded-lg border text-black text-xs font-semibold hover:shadow-sm"
            >
              {max ? "Minimize" : "Maximize"}
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-black text-xs font-semibold hover:shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 bg-gray-100 p-2 lg:p-3">
          <div className="w-full h-full rounded-xl border bg-white overflow-hidden">
            <RouteMap places={places} />
          </div>
        </div>
      </div>
    </div>
  );
}
