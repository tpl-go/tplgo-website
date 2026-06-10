import { ArrowRight, WandSparkles } from "lucide-react";

export default function BuildIntroSection({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-[#061839] px-6 py-9 text-center text-white lg:px-10 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(249,115,22,0.18),transparent_28%)]" />

      <div className="relative mx-auto max-w-[900px]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
          Build your itinerary
        </p>

        <h2 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight lg:text-4xl">
          Turn this route into a fully editable AI journey
        </h2>

        <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72">
          Tiya will ask only a few smart inputs, then build transport, stay,
          activities, budget, route alerts and editable itinerary in one clean
          workspace.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mx-auto mt-7 flex min-h-16 w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-8 py-4 text-base font-black text-white shadow-[0_20px_46px_rgba(255,123,0,0.34)] transition hover:scale-[1.02]"
        >
          <WandSparkles size={20} />
          Build My Smart Journey
          <ArrowRight size={18} />
        </button>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            "Budget aware",
            "Weather aware",
            "Creator powered",
            "Local market integrated",
            "Editable later",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-black text-white/78"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
