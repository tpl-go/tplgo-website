"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  Ship,
  Share2,
  MoonStar,
  Route,
} from "lucide-react";

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};

type Props = {
  title: string;
  tripLabel: string;
  durationLabel: string;
  route: string;
  cruiseLine: string;
  shipName: string;
  sailingDate: string | null;
  departurePort: string;
  arrivalPort: string;
};

export default function CruiseDetailHeader({
  title,
  tripLabel,
  durationLabel,
  route,
  cruiseLine,
  shipName,
  sailingDate,
  departurePort,
  arrivalPort,
}: Props) {
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const shareText = useMemo(() => {
    return `${title} - ${tripLabel} - ${durationLabel}`;
  }, [title, tripLabel, durationLabel]);

  const onShare = async () => {
    const url =
      shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    const text = shareText;

    try {
      const shareNavigator = navigator as ShareCapableNavigator;

      if (typeof navigator !== "undefined" && shareNavigator.share) {
        await shareNavigator.share({
          title,
          text,
          url,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link copied ✅");
        return;
      }

      prompt("Copy this link:", url);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm lg:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
            <h1 className="text-[18px] font-black leading-tight text-slate-950 lg:text-[20px] lg:font-bold">
              {title}
            </h1>

            <div className="text-left md:text-center">
  <div className="inline-flex max-w-full items-center rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-3 py-1.5 shadow-sm lg:px-4 lg:py-2">
    <span className="truncate text-[13px] font-extrabold tracking-[0.01em] text-slate-900 lg:text-[15px] lg:font-semibold">
      {tripLabel}
    </span>
  </div>
</div>
          </div>

          {/* Row 2 */}
          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <InfoPill icon={<MoonStar size={14} />} text={durationLabel} />
              <InfoPill icon={<Ship size={14} />} text={cruiseLine} />
              <InfoPill text={shipName} />
              {sailingDate ? (
                <InfoPill
                  icon={<CalendarDays size={14} />}
                  text={sailingDate}
                  highlight
                />
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:gap-x-5 xl:gap-y-2 xl:justify-end">
              <DetailItem
                label="Departure"
                value={departurePort}
                icon={<MapPin size={14} />}
              />
              <DetailItem
                label="Arrival"
                value={arrivalPort}
                icon={<MapPin size={14} />}
              />
              <DetailItem
                label="Route"
                value={route}
                icon={<Route size={14} />}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 lg:pt-0">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto lg:font-semibold"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoPill({
  text,
  icon,
  highlight = false,
}: {
  text: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${
        highlight
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate">{text}</span>
    </span>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 text-slate-800 xl:border-0 xl:bg-transparent xl:px-0 xl:py-0">
      {icon ? <span className="shrink-0 text-slate-500">{icon}</span> : null}

      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-500 xl:text-[12px] xl:font-semibold">
        {label}:
      </span>

      <span className="min-w-0 truncate text-[12px] font-bold text-slate-900 xl:text-[13px] xl:font-semibold">
        {value}
      </span>
    </div>
  );
}
