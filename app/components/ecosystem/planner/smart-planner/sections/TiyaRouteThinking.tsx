import { Bot, CloudSun, Compass, Map, Route, Sparkles } from "lucide-react";

const thinkingSteps = [
  ["Route scanning", Route],
  ["Destination analysis", Map],
  ["Weather intelligence", CloudSun],
  ["Transport matching", Compass],
  ["Scenic analysis", Sparkles],
] as const;

export default function TiyaRouteThinking() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#061839] p-5 text-white shadow-[0_24px_90px_rgba(6,24,57,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(249,115,22,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Bot size={14} className="animate-pulse" />
              Tiya route generation
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">
              AI is building route possibilities
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
              Tiya is checking movement patterns, comfort, weather, scenic
              value and budget fit before revealing journey paths.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-5 lg:min-w-[560px]">
            {thinkingSteps.map(([label, Icon], index) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.08] p-3"
              >
                <Icon
                  size={18}
                  className={`text-orange-200 ${
                    index === 0 ? "animate-pulse" : ""
                  }`}
                />
                <p className="mt-2 text-[11px] font-black leading-4 text-white/75">
                  {label}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-orange-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
