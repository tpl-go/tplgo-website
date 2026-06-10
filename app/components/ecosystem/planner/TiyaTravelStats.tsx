import { Gauge } from "lucide-react";
import type { TiyaTravelStat } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTravelStatsProps = {
  stats: TiyaTravelStat[];
};

export default function TiyaTravelStats({ stats }: TiyaTravelStatsProps) {
  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
        <Gauge size={15} />
        Travel operating stats
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {safeStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/10 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-black text-white">{stat.value}</p>
            {typeof stat.score === "number" ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
                  style={{ width: `${stat.score}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
