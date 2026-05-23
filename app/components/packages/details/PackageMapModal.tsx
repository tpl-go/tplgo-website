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
        className={`absolute bg-white shadow-xl border rounded-2xl overflow-hidden
        ${max ? "inset-4" : "left-1/2 top-24 -translate-x-1/2 w-[980px] max-w-[94vw] h-[520px]"}`}
      >
        {/* header */}
        <div className="h-12 px-4 flex items-center justify-between border-b bg-white">
          <div className="text-sm font-bold text-black">
            {title ? title : "Route Map"}
          </div>

          <div className="flex items-center gap-2">
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
        <div className="h-[calc(100%-48px)] bg-gray-100 p-3">
          <div className="w-full h-full rounded-xl border bg-white overflow-hidden">
            <RouteMap places={places} />
          </div>
        </div>
      </div>
    </div>
  );
}