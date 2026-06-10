import type { OverviewCard } from "../data/routePreviewData";

type OverviewSectionProps = {
  overviewCards: OverviewCard[];
  onOpenOverviewDetail: (card: OverviewCard) => void;
  onContinue: () => void;
};

export default function OverviewSection({
  overviewCards,
  onOpenOverviewDetail,
  onContinue,
}: OverviewSectionProps) {
  return (
<div className="grid min-w-0 gap-3 sm:gap-4">
<div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
  {overviewCards.map((card) => (
    <div
      key={card.id}
      className="group relative min-w-0 overflow-hidden rounded-2xl border border-sky-200 bg-white/82 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] sm:p-4"
    >
      <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 via-orange-300 to-orange-500" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-cyan-700 shadow-sm">
              <card.icon size={16} />
            </span>
            <p className="text-sm font-black text-slate-950">
              {card.title}
            </p>
          </div>
          <p className="mt-2 line-clamp-3 text-sm font-bold leading-6 text-slate-700">
            {card.preview}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenOverviewDetail(card)}
          className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100 sm:w-auto"
        >
          View Detail
        </button>
      </div>
    </div>
  ))}
</div>

<div className="flex justify-center">
  <button
    type="button"
    onClick={onContinue}
    className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-6 py-3 text-sm font-black text-white shadow-[0_16px_38px_rgba(255,123,0,0.28)] transition hover:translate-y-[-1px] hover:brightness-105 sm:w-[360px]"
  >
    Continue with this Route
  </button>
</div>
</div>
  );
}
