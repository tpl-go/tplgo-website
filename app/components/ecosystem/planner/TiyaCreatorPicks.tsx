import {
  BadgeCheck,
  Bookmark,
  Camera,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TiyaCreatorPick } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaEmptyState, TiyaAISkeleton } from "./TiyaPolishStates";

type TiyaCreatorPicksProps = {
  creators?: TiyaCreatorPick[] | null;
  isGenerating?: boolean;
};

const creatorActions: [string, LucideIcon][] = [
  ["View Creator", Sparkles],
  ["Add to Trip", Plus],
  ["Save Spot", Bookmark],
];

export default function TiyaCreatorPicks({
  creators = [],
  isGenerating = false,
}: TiyaCreatorPicksProps) {
  const safeCreators = Array.isArray(creators) ? creators : [];
  const highlightedCount = safeCreators.filter((creator) => creator.isHighlighted).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.18)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Camera
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Creator ecosystem
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Tiya Creator Picks
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Destination-linked creators matched to route stops, travel style
              and selected interests.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
            {highlightedCount} high-fit creator{highlightedCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-3">
        {isGenerating ? (
          <div className="lg:col-span-3">
            <TiyaAISkeleton label="Tiya is matching creators to route, style and interests." />
          </div>
        ) : null}
        {!isGenerating && safeCreators.length === 0 ? (
          <div className="lg:col-span-3">
            <TiyaEmptyState
              icon={Camera}
              eyebrow="Creator discovery"
              title="Tiya has no creator picks for this route yet"
              detail="Enable creator spots or add culture, food, adventure or local market interests to build a stronger creator-fit layer."
            />
          </div>
        ) : null}
        {safeCreators.map((creator, index) => (
          <article
            key={creator.id}
            className={`overflow-hidden rounded-3xl border transition ${
              creator.isHighlighted
                ? "border-orange-300/50 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
                : "border-white/10 bg-white/[0.08]"
            }`}
          >
            <div className="relative min-h-[190px] p-4">
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(14,165,233,0.24),rgba(15,23,42,0.18),rgba(249,115,22,0.22))]" />
              <div className="absolute inset-x-4 bottom-4 top-4 rounded-[26px] border border-white/10 bg-black/10" />
              <div className="relative flex h-full min-h-[158px] flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <UserRound size={22} />
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-black text-white">
                    <BadgeCheck size={13} className="text-cyan-100" />
                    Verified
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                    Reel preview {index + 1}
                  </p>
                  <h3 className="mt-1 text-xl font-black leading-tight text-white">
                    {creator.creatorName}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-white/70">
                    {creator.handle}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {creator.tags.map((tag) => (
                  <span
                    key={`${creator.id}-${tag}`}
                    className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                    Route fit
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {creator.routeFit}%
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                    Engagement
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {creator.engagementScore}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm font-semibold leading-6 text-white/70">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-orange-200" />
                <div>
                  <p className="font-black text-white">{creator.destination}</p>
                  <p>{creator.recommendationNote}</p>
                  <p className="mt-1 text-xs font-black text-cyan-100">
                    Stopover: {creator.suggestedStopover}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {creatorActions.map(([label, ButtonIcon]) => {
                  return (
                    <button
                      key={`${creator.id}-${label}`}
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
                    >
                      <ButtonIcon size={14} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
