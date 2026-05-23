"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Info,
  Share2,
} from "lucide-react";
import { CruiseInfoItem, CruiseSailingOption } from "@/app/lib/cruise/cruiseResultTypes";

type Props = {
  sailings: CruiseSailingOption[];
  onOpenInfo: (item: CruiseInfoItem) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value?: number) {
  if (!value) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CruiseDatesPanel({ sailings, onOpenInfo }: Props) {
  return (
    <div className="border-t border-slate-200 bg-[#fffef9] px-5 py-4">
      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
        <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_120px_250px] border-b border-slate-200 bg-slate-100 px-4 py-3 text-[15px] font-semibold text-slate-800">
          <div>DATE</div>
          <div>INSIDE</div>
          <div>OUTSIDE</div>
          <div>BALCONY</div>
          <div>SUITE</div>
          <div></div>
          <div className="text-right"></div>
        </div>

        <div className="divide-y divide-slate-200">
          {sailings.map((sailing) => (
            <CruiseDateRow
              key={sailing.id}
              sailing={sailing}
              onOpenInfo={onOpenInfo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CruiseDateRow({
  sailing,
  onOpenInfo,
}: {
  sailing: CruiseSailingOption;
  onOpenInfo: (item: CruiseInfoItem) => void;
}) {
  const compareInfo = useMemo<CruiseInfoItem>(
    () => ({
      id: `${sailing.id}-compare`,
      label: "Add this sailing to your cruise comparison",
      title: "Cruise Comparison",
      description:
        "This sailing can be added to a comparison tray in the next phase so users can compare cabins, prices, and inclusions.",
    }),
    [sailing.id]
  );

  const itineraryInfo = useMemo<CruiseInfoItem>(
    () => ({
      id: `${sailing.id}-itinerary`,
      label: "View Itinerary",
      title: "View Itinerary",
      description:
        "Day-wise itinerary, route map, timing, and port sequence for this sailing will open here in the next phase.",
    }),
    [sailing.id]
  );

  const shareInfo = useMemo<CruiseInfoItem>(
    () => ({
      id: `${sailing.id}-share`,
      label: "Share",
      title: "Share Sailing",
      description:
        "Shareable sailing link, copied itinerary summary, and quick send actions will appear here in the next phase.",
    }),
    [sailing.id]
  );

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_120px_250px] items-center gap-3">
        <div className="flex items-center gap-2">
          <MiniTooltipIcon
            icon={<Plus size={14} />}
            label="Add this sailing to your cruise comparison"
            onClick={() => onOpenInfo(compareInfo)}
          />

          <MiniTooltipIcon
            icon={<Info size={14} />}
            label="View Itinerary"
            onClick={() => onOpenInfo(itineraryInfo)}
          />

          <MiniTooltipIcon
            icon={<Share2 size={14} />}
            label="Share"
            onClick={() => onOpenInfo(shareInfo)}
          />
        </div>

        <div className="text-[16px] font-semibold text-slate-900">
          {formatDate(sailing.date)}
        </div>

        <div className="text-[16px] font-semibold text-slate-900">
          {formatPrice(sailing.inside)}
        </div>

        <div className="text-[16px] font-semibold text-slate-900">
          {formatPrice(sailing.outside)}
        </div>

        <div className="text-[16px] font-semibold text-slate-900">
          {formatPrice(sailing.balcony)}
        </div>

        <div className="text-[16px] font-semibold text-slate-900">
          {formatPrice(sailing.suite)}
        </div>

        <div className="flex items-center gap-1">
          {sailing.infoItems.map((info) => (
            <BadgeTooltip
              key={info.id}
              label={info.label}
              onClick={() => onOpenInfo(info)}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="text-right text-[15px] font-medium text-slate-700">
            Excludes taxes and fees: ₹6,018
          </div>

          <button
            type="button"
            onClick={() => onOpenInfo({
              id: `${sailing.id}-details`,
              label: "Show Details",
              title: "Show Details",
              description:
                "Cabin-wise fare rules, inclusions, fare breakup, taxes, and sailing detail summary will appear here in the next phase.",
            })}
            className="rounded-full bg-sky-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-sky-600"
          >
            SHOW DETAILS
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniTooltipIcon({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-slate-300 bg-white text-sky-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
      >
        {icon}
      </button>

      {showTip ? (
        <div className="absolute left-1/2 top-[38px] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-700 px-3 py-2 text-[13px] font-medium text-white shadow-lg">
          {label}
        </div>
      ) : null}
    </div>
  );
}

function BadgeTooltip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400"
      >
        {label === "Buy One Get One Offer"
          ? "BOGO"
          : label === "Special Promotions"
          ? "PROMO"
          : label === "Non Refundable Deposit"
          ? "NRD"
          : label === "Onboard Credit"
          ? "$"
          : label.slice(0, 4).toUpperCase()}
      </button>

      {showTip ? (
        <div className="absolute left-1/2 top-[34px] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-700 px-3 py-2 text-[13px] font-medium text-white shadow-lg">
          {label}
        </div>
      ) : null}
    </div>
  );
}