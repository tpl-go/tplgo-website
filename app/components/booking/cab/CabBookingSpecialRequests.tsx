"use client";

import { useState } from "react";
import type { CabBookingAddon } from "@/app/lib/cab/cabBookingTypes";

type Props = {
  items: CabBookingAddon[];
  onChange: (selected: CabBookingAddon[]) => void;
};

export default function CabBookingSpecialRequests({
  items,
  onChange,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggle(id: string) {
    const updatedIds = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id];

    setSelectedIds(updatedIds);
    onChange(items.filter((item) => updatedIds.includes(item.id)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => {
        const active = selectedIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              active
                ? "border-sky-500 bg-sky-50"
                : "border-slate-200 bg-white hover:border-sky-300"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="pt-[2px]">
                  <input
                    type="checkbox"
                    checked={active}
                    readOnly
                    className="h-[18px] w-[18px] rounded border-slate-300 accent-sky-500"
                  />
                </div>

                <div className="min-w-0">
                  <div className="break-words text-[16px] font-bold text-slate-900">
                    {item.title}
                  </div>

                  <div className="mt-1 break-words text-[13px] text-slate-500">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-[18px] font-extrabold text-slate-900">
                ₹{item.price}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
