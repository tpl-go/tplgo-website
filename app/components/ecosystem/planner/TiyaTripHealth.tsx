import { Activity, BrainCircuit, CheckCircle2 } from "lucide-react";
import type { TiyaTripHealth as TiyaTripHealthData } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTripHealthProps = {
  health: TiyaTripHealthData;
  isGenerating?: boolean;
};

export default function TiyaTripHealth({
  health,
  isGenerating = false,
}: TiyaTripHealthProps) {
  const angle = `${Math.round((health.overallScore / 100) * 360)}deg`;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
        <Activity size={15} className={isGenerating ? "animate-pulse" : undefined} />
        Trip health score
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full p-2 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
          style={{
            background: `conic-gradient(#fb923c ${angle}, rgba(255,255,255,0.12) ${angle})`,
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#061839]">
            <span className="text-4xl font-black">{health.overallScore}%</span>
            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              AI health
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-3">
            <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
            <p className="text-sm font-semibold leading-6 text-white/75">
              {health.recommendationNote}
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {health.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="font-black text-white/70">{metric.label}</span>
                  <span className="font-black text-white">{metric.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
            <CheckCircle2 size={14} />
            Frontend AI simulation
          </div>
        </div>
      </div>
    </section>
  );
}
