"use client";

import { Map, Navigation } from "lucide-react";
import type { TiyaJourneyMap as TiyaJourneyMapData } from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaRouteVisualizer from "./TiyaRouteVisualizer";

type TiyaJourneyMapProps = {
  map: TiyaJourneyMapData;
};

const markerColors = {
  origin: "bg-cyan-300 text-blue-950",
  transport: "bg-blue-300 text-blue-950",
  stay: "bg-white text-blue-950",
  activity: "bg-emerald-300 text-emerald-950",
  creator: "bg-pink-300 text-pink-950",
  market: "bg-orange-300 text-orange-950",
  food: "bg-amber-300 text-amber-950",
  destination: "bg-orange-400 text-white",
};

export default function TiyaJourneyMap({ map }: TiyaJourneyMapProps) {
  const firstSegment = map.segments[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Map size={15} />
            AI journey map
          </div>
          <h3 className="mt-1 text-lg font-black text-white">{map.title}</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
          {map.transportMode}
        </div>
      </div>

      <div className="relative h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-[#04132e] sm:h-[320px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(249,115,22,0.18),transparent_30%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {map.segments.map((segment) => {
            const fromNode = map.nodes.find((node) => node.id === segment.fromNodeId);
            const toNode = map.nodes.find((node) => node.id === segment.toNodeId);

            if (!fromNode || !toNode) return null;

            return (
              <line
                key={segment.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={segment.segmentStyle === "flight" ? "#67e8f9" : "#fb923c"}
                strokeWidth="1.1"
                strokeDasharray={
                  segment.segmentStyle === "road" ? "0" : segment.segmentStyle === "train" ? "1 2" : "3 2"
                }
                strokeLinecap="round"
                opacity="0.78"
              />
            );
          })}
        </svg>

        {map.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_28px_rgba(34,211,238,0.25)] ${markerColors[node.markerType]}`}
            >
              <Navigation size={17} />
            </div>
            <div className="mt-2 min-w-[92px] rounded-2xl border border-white/10 bg-black/30 px-2 py-1 text-center backdrop-blur">
              <p className="truncate text-xs font-black text-white">{node.label}</p>
              <p className="text-[10px] font-bold text-white/60">{node.subLabel}</p>
            </div>
          </div>
        ))}
      </div>

      {firstSegment ? (
        <div className="mt-3">
          <TiyaRouteVisualizer segmentStyle={firstSegment.segmentStyle} />
        </div>
      ) : null}
    </div>
  );
}
