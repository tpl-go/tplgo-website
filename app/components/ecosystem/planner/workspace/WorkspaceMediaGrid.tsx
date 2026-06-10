import { PlayCircle } from "lucide-react";

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
  const imageQuery = `${toCity} ${selectedRoute.name} scenic travel route`;
  const highlights = [
    selectedRoute.bestFor,
    selectedRoute.routeStyle,
    selectedRoute.difficulty,
    `${selectedRoute.riskLevel} risk`,
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="relative col-span-1 h-[200px] cursor-pointer overflow-hidden rounded-2xl border bg-gray-100 lg:col-span-3">
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
            <button className="rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white hover:bg-black/80">
              VIEW GALLERY →
            </button>
          </div>
        </div>

        <div className="col-span-1 flex h-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border bg-black text-white lg:col-span-3">
          <div className="text-center">
            <PlayCircle size={42} className="mx-auto text-orange-300" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/70">
              Route video preview
            </p>
          </div>
        </div>

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

          <button className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline">
            VIEW ALL
          </button>
        </div>

        <div className="col-span-1 min-h-[200px] cursor-pointer rounded-2xl border bg-white p-3 hover:shadow-sm lg:col-span-2">
          <div className="mb-2 text-[11px] font-bold tracking-wide text-gray-800">
            ROUTE MAP
          </div>
          <MiniStaticMap fromCity={fromCity} toCity={toCity} selectedRoute={selectedRoute} />
        </div>

        <div className="col-span-1 grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1 lg:grid-rows-2">
          <div className="relative flex min-h-[86px] cursor-pointer items-center overflow-hidden rounded-2xl border bg-gray-900 px-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-40" />
            <div className="relative text-sm font-semibold">Activities</div>
          </div>

          <div className="relative flex min-h-[86px] cursor-pointer items-center overflow-hidden rounded-2xl border bg-gray-800 px-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-40" />
            <div className="relative text-sm font-semibold">Stay & Property</div>
          </div>
        </div>
      </div>
    </div>
  );
}
