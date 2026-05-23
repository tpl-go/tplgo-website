"use client";

import type { CruiseResultItem } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  item: CruiseResultItem;
};

export default function CruiseShipPreviewHeader({ item }: Props) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <div className="text-[22px] font-bold uppercase tracking-tight text-slate-900">
        SHIP: {item.shipName}
      </div>
    </div>
  );
}