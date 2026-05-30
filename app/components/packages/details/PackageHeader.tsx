"use client";

import { useMemo } from "react";

type Variant = "withFlight" | "withoutFlight";

type Props = {
  title: string;
  durationLabel: string;
  packageType: "Customizable" | "Fixed";
  route: string[];
  variant: Variant;
  onVariantChange: (v: Variant) => void;
  travelDateLabel?: string;
  originCity?: string;
  onChangeDate?: () => void;
  onChangeCity?: () => void;
};

export default function PackageHeader({
  title,
  durationLabel,
  packageType,
  route,
  variant,
  onVariantChange,
  travelDateLabel,
  originCity,
  onChangeDate,
  onChangeCity,
}: Props) {
  const typeStyle =
    packageType === "Customizable"
      ? "bg-gray-100 border-gray-200 text-gray-800"
      : "bg-gray-900 border-gray-900 text-white";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const shareText = useMemo(() => {
    const routeText = route?.length ? ` (${route.join(" • ")})` : "";
    return `${title} - ${durationLabel}${routeText}`;
  }, [title, durationLabel, route]);

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
    <div className="bg-white border rounded-2xl shadow-sm px-3 py-3 lg:py-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        {/* LEFT */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-snug text-black md:text-xl">
            {title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span
              className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${typeStyle}`}
            >
              {packageType}
            </span>

            <span className="px-2.5 py-1 rounded-md bg-white border text-xs font-semibold text-gray-800">
              {durationLabel}
            </span>

            {route.map((r) => (
              <span key={r} className="text-gray-700 text-xs">
                • {r}
              </span>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-3 pt-1 min-w-0">
          {travelDateLabel ? (
            <button
              type="button"
              onClick={onChangeDate}
              className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:border-blue-400 hover:bg-blue-100 whitespace-nowrap shadow-sm"
            >
              <span className="text-base">📅</span>
              <span>{travelDateLabel}</span>
              {onChangeDate ? <span className="text-xs ml-1">✏</span> : null}
            </button>
          ) : null}

          {variant === "withFlight" && originCity ? (
            <button
              type="button"
              onClick={onChangeCity}
              className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900 transition hover:border-orange-400 hover:bg-orange-100 whitespace-nowrap shadow-sm"
            >
              <span className="text-base">🛫</span>
              <span>{originCity}</span>
              {onChangeCity ? <span className="text-xs ml-1">✏</span> : null}
            </button>
          ) : null}
        </div>

        {/* RIGHT */}
        <div className="flex w-full flex-col items-stretch gap-2 shrink-0 md:w-auto md:items-end">
          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
            <button
              onClick={() => onVariantChange("withFlight")}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold transition md:w-auto ${
                variant === "withFlight"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-800 border-gray-300 hover:shadow-sm"
              }`}
            >
              With Flight
            </button>

            <button
              onClick={() => onVariantChange("withoutFlight")}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold transition md:w-auto ${
                variant === "withoutFlight"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-800 border-gray-300 hover:shadow-sm"
              }`}
            >
              Without Flight
            </button>
          </div>

          <button
            onClick={onShare}
            className="mt-1 flex items-center justify-end gap-1 text-xs tracking-wider text-gray-600 hover:text-black"
          >
            🔗 <span className="underline">Share</span>
          </button>
        </div>
      </div>

      {/* MOBILE FALLBACK */}
      <div className="mt-2 flex flex-col gap-2 md:hidden sm:flex-row sm:flex-wrap">
        {travelDateLabel ? (
          <button
            type="button"
            onClick={onChangeDate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm sm:w-auto"
          >
            <span className="text-base">📅</span>
            <span>{travelDateLabel}</span>
            {onChangeDate ? <span className="text-xs ml-1">✏</span> : null}
          </button>
        ) : null}

        {variant === "withFlight" && originCity ? (
          <button
            type="button"
            onClick={onChangeCity}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900 shadow-sm sm:w-auto"
          >
            <span className="text-base">🛫</span>
            <span>{originCity}</span>
            {onChangeCity ? <span className="text-xs ml-1">✏</span> : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}
