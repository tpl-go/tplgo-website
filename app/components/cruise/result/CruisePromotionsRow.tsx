"use client";

import { CruiseInfoItem } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  items: CruiseInfoItem[];
  onOpenInfo: (item: CruiseInfoItem) => void;
};

export default function CruisePromotionsRow({ items, onOpenInfo }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {items.map((item) => (
          <PromoItem key={item.id} item={item} onOpenInfo={onOpenInfo} />
        ))}
      </div>
    </div>
  );
}

function PromoItem({
  item,
  onOpenInfo,
}: {
  item: CruiseInfoItem;
  onOpenInfo: (item: CruiseInfoItem) => void;
}) {
  const shortCode =
    item.label === "Buy One Get One Offer"
      ? "BOGO"
      : item.label === "Special Promotions"
      ? "PROMO"
      : item.label === "Non Refundable Deposit"
      ? "NRD"
      : item.label === "Onboard Credit"
      ? "$"
      : "INFO";

  return (
    <button
      type="button"
      onClick={() => onOpenInfo(item)}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-[14px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-sm"
    >
      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-700">
        {shortCode}
      </span>
      <span className="leading-5">{item.label}</span>
    </button>
  );
}