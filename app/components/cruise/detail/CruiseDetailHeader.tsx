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
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
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
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
            <h1 className="text-[20px] font-bold leading-tight text-slate-950">
              {title}
            </h1>

            <div className="text-center md:text-center">
  <div className="inline-flex items-center rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-4 py-2 shadow-sm">
    <span className="text-[15px] font-semibold tracking-[0.01em] text-slate-900">
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

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 xl:justify-end">
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

        <div className="shrink-0">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold ${
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
    <div className="inline-flex min-w-0 items-center gap-1.5 text-slate-800">
      {icon ? <span className="shrink-0 text-slate-500">{icon}</span> : null}

      <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        {label}:
      </span>

      <span className="text-[13px] font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}