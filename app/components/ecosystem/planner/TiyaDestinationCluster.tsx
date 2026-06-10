"use client";

import { Layers3 } from "lucide-react";
import type { TiyaDestinationCluster as TiyaDestinationClusterData } from "@/app/lib/ecosystem/planner/plannerClusterEngine";

type TiyaDestinationClusterProps = {
  cluster: TiyaDestinationClusterData;
};

export default function TiyaDestinationCluster({
  cluster,
}: TiyaDestinationClusterProps) {
  const safeDestinations = Array.isArray(cluster.destinations)
    ? cluster.destinations
    : [];

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/10 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
            <Layers3 size={14} />
            {cluster.clusterType}
          </div>
          <h3 className="mt-2 text-lg font-black text-white">{cluster.title}</h3>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-100">
          {cluster.backtrackingReduction}% less backtrack
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {safeDestinations.map((destination) => (
          <span
            key={destination.id}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-white"
          >
            {destination.name}
          </span>
        ))}
      </div>
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70">
        {cluster.transferPlan}
      </p>
    </article>
  );
}
