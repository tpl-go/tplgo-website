import { BedDouble, Car, Sparkles, Ticket } from "lucide-react";
import type { TiyaSuggestion } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaEmptyState } from "./TiyaPolishStates";

type TiyaSuggestionCardsProps = {
  suggestions: TiyaSuggestion[];
};

const iconMap = {
  Stay: BedDouble,
  Activity: Ticket,
  Transport: Car,
};

export default function TiyaSuggestionCards({
  suggestions,
}: TiyaSuggestionCardsProps) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <section className="rounded-3xl border border-white/80 bg-white/72 p-3 shadow-[0_18px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <Sparkles size={15} />
            Smart suggestions
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
            Stay, activity and transport picks
          </h2>
        </div>
        <p className="text-sm font-bold text-slate-500">
          Ranked by route fit, comfort and budget.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {safeSuggestions.length === 0 ? (
          <div className="lg:col-span-3">
            <TiyaEmptyState
              icon={Sparkles}
              eyebrow="Smart suggestions"
              title="Tiya has no suggestions to show yet"
              detail="Generate or adjust the trip brief and Tiya will surface stay, activity and transport picks matched to the route."
              tone="light"
            />
          </div>
        ) : null}
        {safeSuggestions.map((suggestion) => {
          const Icon = iconMap[suggestion.category];

          return (
            <article
              key={suggestion.id}
              className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-white">
                  <Icon size={20} />
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                  {suggestion.fit}
                </span>
              </div>
              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                {suggestion.category}
              </p>
              <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">
                {suggestion.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {suggestion.detail}
              </p>
              <div className="mt-4 rounded-2xl bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
                {suggestion.price}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
