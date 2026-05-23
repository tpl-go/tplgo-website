"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const MiniRouteMap = dynamic(
  () => import("@/app/components/packages/details/MiniRouteMap"),
  {
    ssr: false,
  }
);

type Place = {
  name: string;
  lat: number;
  lng: number;
  day?: string;
};

type CruiseDetailMedia = {
  coverImage?: string;
  videoUrl?: string;
  cruiseHighlights?: string[];
  activitiesLabel?: string;
  propertyLabel?: string;
  routeMap?: Place[];
};

type Props = {
  cruiseId: string;
  media: CruiseDetailMedia;
  onOpenGallery?: () => void;
  onOpenRouteMap?: () => void;
};

export default function CruiseDetailMediaGrid({
  cruiseId,
  media,
  onOpenGallery,
  onOpenRouteMap,
}: Props) {
  const coverImage = media?.coverImage || "/cruise/results/brisbane-getaway.jpg";
  const videoUrl = media?.videoUrl || "";
  const cruiseHighlights = media?.cruiseHighlights || [];
  const activitiesLabel = media?.activitiesLabel || "Activities";
  const propertyLabel = media?.propertyLabel || "Ship Areas";

  const places: Place[] = useMemo(() => {
    return (
      media?.routeMap || [
        { name: "Departure Port", lat: 25.2048, lng: 55.2708, day: "Day 1" },
        { name: "Cruising", lat: 24.9, lng: 55.0, day: "Day 2" },
        { name: "Arrival Port", lat: 25.2048, lng: 55.2708, day: "Day 3" },
      ]
    );
  }, [media?.routeMap]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) return url;

    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

    const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
    if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;

    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="mt-1">
      <div className="grid grid-cols-12 gap-3">
        <div
          className="relative col-span-12 h-[200px] cursor-pointer overflow-hidden rounded-2xl border bg-slate-100 lg:col-span-3"
          onClick={onOpenGallery}
        >
          <img
            src={coverImage}
            alt={`${cruiseId} cover`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute left-3 bottom-3">
            <button
              type="button"
              className="rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/80"
            >
              VIEW GALLERY →
            </button>
          </div>
        </div>

        <div className="col-span-12 h-[200px] overflow-hidden rounded-2xl border bg-black lg:col-span-3">
          {embedUrl ? (
            <iframe
              className="h-full w-full"
              src={embedUrl}
              title="Cruise Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white">
              Ship video placeholder
            </div>
          )}
        </div>

        <div className="col-span-12 h-[200px] overflow-hidden rounded-2xl border bg-white p-3 lg:col-span-2">
          <div className="text-xs font-bold tracking-wide text-gray-800">
            CRUISE HIGHLIGHTS
          </div>

          <div className="mt-2 space-y-1.5">
            {(cruiseHighlights.length
              ? cruiseHighlights
              : [
                  "Premium ship experience",
                  "Ocean-view sailing route",
                  "Dining & entertainment onboard",
                  "Selected sailing benefits available",
                ]
            )
              .slice(0, 4)
              .map((h) => (
                <div key={h} className="flex gap-2 text-xs text-gray-800">
                  <span className="mt-[1px] text-green-600">✔</span>
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <div
          className="col-span-12 h-[200px] cursor-pointer rounded-2xl border bg-white p-3 transition hover:shadow-sm lg:col-span-2"
          onClick={onOpenRouteMap}
        >
          <div className="-m-3 h-[200px] overflow-hidden rounded-2xl">
            <MiniRouteMap places={places} />
          </div>
        </div>

        <div className="col-span-12 grid h-[200px] grid-rows-2 gap-3 lg:col-span-2">
          <div className="relative flex cursor-pointer items-center overflow-hidden rounded-2xl border bg-slate-900 px-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-50" />
            <div className="relative text-sm font-semibold">
              {activitiesLabel}
            </div>
          </div>

          <div className="relative flex cursor-pointer items-center overflow-hidden rounded-2xl border bg-slate-800 px-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-50" />
            <div className="relative text-sm font-semibold">
              {propertyLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}