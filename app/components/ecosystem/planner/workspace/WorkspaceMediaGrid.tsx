import { useState } from "react";
import { PlayCircle, X } from "lucide-react";

import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import MiniStaticMap from "./shared/MiniStaticMap";

export default function WorkspaceMediaGrid({
  selectedRoute,
  fromCity,
  toCity,
}: {
  selectedRoute: TiyaRouteOption;
  fromCity: string;
  toCity: string;
}) {
  const [activePanel, setActivePanel] = useState<
    "gallery" | "video" | "highlights" | "map" | "activities" | "stay" | null
  >(null);
  const imageQuery = `${toCity} ${selectedRoute.name} scenic travel route`;
  const galleryQueries = [
    imageQuery,
    `${toCity} destination travel highlights`,
  ];
  const highlights = [
    selectedRoute.bestFor,
    selectedRoute.routeStyle,
    selectedRoute.difficulty,
    `${selectedRoute.riskLevel} risk`,
  ];

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">
        <button
          type="button"
          onClick={() => setActivePanel("gallery")}
          className="relative col-span-1 h-[200px] cursor-pointer overflow-hidden rounded-2xl border bg-gray-100 text-left lg:col-span-3"
        >
          <TPLDynamicImage
            imageQuery={imageQuery}
            fallbackQuery="india scenic travel route"
            alt={selectedRoute.name}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover"
            preferDynamic
            sizes="(max-width: 1024px) 100vw, 25vw"
          />
          <div className="absolute bottom-3 left-3">
            <span className="rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white">
              VIEW GALLERY →
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel("video")}
          className="col-span-1 flex h-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border bg-black text-white lg:col-span-3"
        >
          <div className="text-center">
            <PlayCircle size={42} className="mx-auto text-orange-300" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/70">
              Route video preview
            </p>
          </div>
        </button>

        <div className="col-span-1 min-h-[200px] overflow-hidden rounded-2xl border bg-white p-3 lg:col-span-2">
          <div className="text-xs font-bold tracking-wide text-gray-800">
            ROUTE HIGHLIGHTS
          </div>

          <div className="mt-2 space-y-1.5">
            {highlights.slice(0, 4).map((h) => (
              <div key={h} className="flex gap-2 text-xs text-gray-800">
                <span className="mt-[1px] text-green-600">✔</span>
                <span className="leading-snug">{h}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActivePanel("highlights")}
            className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActivePanel("map")}
          className="col-span-1 min-h-[200px] cursor-pointer rounded-2xl border bg-white p-3 text-left hover:shadow-sm lg:col-span-2"
        >
          <div className="mb-2 text-[11px] font-bold tracking-wide text-gray-800">
            ROUTE MAP
          </div>
          <MiniStaticMap fromCity={fromCity} toCity={toCity} selectedRoute={selectedRoute} />
        </button>

        <div className="col-span-1 grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1 lg:grid-rows-2">
          <button
            type="button"
            onClick={() => setActivePanel("activities")}
            className="relative flex min-h-[86px] cursor-pointer items-center overflow-hidden rounded-2xl border bg-gray-900 px-4 text-left text-white"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-40" />
            <div className="relative text-sm font-semibold">Activities</div>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel("stay")}
            className="relative flex min-h-[86px] cursor-pointer items-center overflow-hidden rounded-2xl border bg-gray-800 px-4 text-left text-white"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-40" />
            <div className="relative text-sm font-semibold">Stay & Property</div>
          </button>
        </div>
      </div>
      {activePanel ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/65 p-3 py-5 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[calc(100dvh-2.5rem)] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-3xl border border-white/15 bg-[#061839] text-white shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  Smart Planner media
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  {activePanel === "gallery"
                    ? "Route Gallery"
                    : activePanel === "video"
                      ? "Video Preview"
                      : activePanel === "highlights"
                        ? "Route Highlights"
                        : activePanel === "map"
                          ? "Route Map"
                          : activePanel === "activities"
                            ? "Activities Preview"
                            : "Stay & Property Preview"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid max-h-[calc(100dvh-9rem)] gap-4 overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryQueries.map((query) => (
                  <div
                    key={query}
                    className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-white/10"
                  >
                    <TPLDynamicImage
                      imageQuery={query}
                      fallbackQuery="india scenic destination"
                      alt={`${selectedRoute.name} ${query}`}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="h-full w-full object-cover"
                      preferDynamic
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold leading-6 text-white/70">
                {selectedRoute.name} media for {fromCity} to {toCity}. This panel is connected to the current Smart Planner route context; richer media assets can plug into the same drawer without changing planner state.
              </p>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-50"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs font-bold text-white/65">
                Current route: {selectedRoute.routeStyle} · {selectedRoute.distance} · {selectedRoute.duration}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
