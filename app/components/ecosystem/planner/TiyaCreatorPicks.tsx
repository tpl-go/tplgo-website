"use client";

import {
  BadgeCheck,
  Bookmark,
  Camera,
  CheckCircle2,
  Clapperboard,
  Eye,
  Heart,
  MapPin,
  PlayCircle,
  Plus,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { TiyaCreatorPick } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaEmptyState, TiyaAISkeleton } from "./TiyaPolishStates";
import { useState } from "react";

type TiyaCreatorPicksProps = {
  creators?: TiyaCreatorPick[] | null;
  isGenerating?: boolean;
  addedCreatorIds?: string[];
  savedCreatorIds?: string[];
  onCreatorAction?: (action: string, creator: TiyaCreatorPick) => void;
};

function creatorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function creatorRating(creator: TiyaCreatorPick) {
  return (4.3 + Math.min(0.6, creator.engagementScore / 250)).toFixed(1);
}

function followerCount(creator: TiyaCreatorPick, index: number) {
  const count = Math.round(
    18000 + creator.engagementScore * 950 + creator.routeFit * 430 + index * 6200
  );

  if (count >= 100000) return `${(count / 100000).toFixed(1)}L`;
  return `${Math.round(count / 1000)}K`;
}

function creatorCoverQuery(creator: TiyaCreatorPick) {
  return `${creator.destination} ${creator.specialty} creator travel reel ${creator.tags.join(" ")}`;
}

function contentPreview(creator: TiyaCreatorPick) {
  const primaryTag = creator.tags[0] || "Creator";

  return {
    reel: `${creator.destination} ${primaryTag.toLowerCase()} reel`,
    story: `${creator.suggestedStopover} story sequence`,
    stop: creator.suggestedStopover,
  };
}

export default function TiyaCreatorPicks({
  creators = [],
  isGenerating = false,
  addedCreatorIds = [],
  savedCreatorIds = [],
  onCreatorAction,
}: TiyaCreatorPicksProps) {
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const safeCreators = Array.isArray(creators) ? creators : [];
  const highlightedCount = safeCreators.filter(
    (creator) => creator.isHighlighted
  ).length;
  const savedCount = safeCreators.filter((creator) =>
    savedCreatorIds.includes(creator.id)
  ).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.24)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Camera
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Creator ecosystem
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Creator Recommendations
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Social-first creators matched to route stops, traveller style,
              destination context and content potential.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
              {highlightedCount} high-fit creator{highlightedCount === 1 ? "" : "s"}
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
              {savedCount} bookmarked
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5 lg:grid-cols-2 2xl:grid-cols-3">
        {isGenerating ? (
          <div className="lg:col-span-2 2xl:col-span-3">
            <TiyaAISkeleton label="Tiya is matching creators to route, style and interests." />
          </div>
        ) : null}
        {!isGenerating && safeCreators.length === 0 ? (
          <div className="lg:col-span-2 2xl:col-span-3">
            <TiyaEmptyState
              icon={Camera}
              eyebrow="Creator discovery"
              title="Tiya has no creator picks for this route yet"
              detail="Enable creator spots or add culture, food, adventure or Local Life interests to build a stronger creator-fit layer."
            />
          </div>
        ) : null}

        {safeCreators.map((creator, index) => {
          const isSaved = savedCreatorIds.includes(creator.id);
          const isAdded = addedCreatorIds.includes(creator.id);
          const preview = contentPreview(creator);

          return (
            <article
              key={creator.id}
              className={`min-w-0 overflow-hidden rounded-3xl border transition ${
                isAdded
                  ? "border-cyan-300/40 bg-cyan-400/12 shadow-[0_18px_56px_rgba(34,211,238,0.16)] ring-1 ring-cyan-300/18"
                  : isSaved
                  ? "border-emerald-300/35 bg-emerald-400/12 shadow-[0_18px_52px_rgba(16,185,129,0.16)] ring-1 ring-emerald-300/16"
                  : creator.isHighlighted
                    ? "border-orange-300/42 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
                    : "border-white/10 bg-white/[0.08]"
              }`}
            >
              <div className="relative min-h-[236px] overflow-hidden">
                <TPLDynamicImage
                  imageQuery={creatorCoverQuery(creator)}
                  fallbackQuery={`${creator.destination} creator travel content local experience`}
                  alt={`${creator.creatorName} creator recommendation for ${creator.destination}`}
                  preferDynamic
                  className="absolute inset-0"
                  imgClassName="h-full w-full object-cover"
                  sizes="(min-width: 1536px) 33vw, (min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061839] via-[#061839]/58 to-[#061839]/12" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2 pr-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#061839]/72 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-50 backdrop-blur">
                    <BadgeCheck size={12} />
                    Verified Creator
                  </span>
                  {isSaved ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-400/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-50 backdrop-blur">
                      <Bookmark size={12} />
                      Saved ✓
                    </span>
                  ) : null}
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/35 bg-cyan-400/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-50 backdrop-blur">
                      <CheckCircle2 size={12} />
                      Added
                    </span>
                  ) : null}
                </div>

                <div className="absolute bottom-3 left-3 right-3 min-w-0">
                  <div className="flex items-end gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.32),rgba(249,115,22,0.34))] text-lg font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur">
                      {creatorInitials(creator.creatorName) || "TC"}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
                        <Clapperboard size={13} />
                        Featured creator
                      </p>
                      <h3 className="mt-1 break-words text-xl font-black leading-tight text-white">
                        {creator.creatorName}
                      </h3>
                      <p className="mt-1 truncate text-sm font-bold text-white/72">
                        {creator.handle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-4">
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                  {[
                    ["Route match", `${creator.routeFit}%`, Sparkles],
                    ["Rating", creatorRating(creator), Star],
                    ["Followers", followerCount(creator, index), Users],
                    ["Engagement", `${creator.engagementScore}`, Heart],
                  ].map(([label, value, MetricIcon]) => {
                    const Icon = MetricIcon as typeof Sparkles;

                    return (
                      <div
                        key={label as string}
                        className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3"
                      >
                        <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                          <Icon size={12} />
                          {label as string}
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {value as string}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {creator.tags.map((tag) => (
                    <span
                      key={`${creator.id}-${tag}`}
                      className="rounded-full border border-cyan-300/14 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-2xl border border-cyan-300/14 bg-cyan-300/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    Why Tiya Recommended
                  </p>
                  <div className="mt-2 grid gap-2 text-xs font-semibold leading-5 text-cyan-50/78 sm:grid-cols-2">
                    <p>Route match: {creator.routeFit}% fit for planned movement.</p>
                    <p>Traveller style: {creator.tags[0] || "creator"} content aligns with preferences.</p>
                    <p>Interest match: {creator.specialty} supports selected trip interests.</p>
                    <p>Destination match: built around {creator.destination} and nearby route stops.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#061839]/55 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                    Content Preview
                  </p>
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.055] p-3">
                      <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white">Featured reel</p>
                        <p className="break-words text-xs font-semibold leading-5 text-white/62">
                          {preview.reel}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-3">
                        <p className="flex items-center gap-1 text-xs font-black text-white">
                          <Camera size={13} />
                          Featured story
                        </p>
                        <p className="mt-1 break-words text-xs font-semibold leading-5 text-white/62">
                          {preview.story}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.055] p-3">
                        <p className="flex items-center gap-1 text-xs font-black text-white">
                          <MapPin size={13} />
                          Featured route stop
                        </p>
                        <p className="mt-1 break-words text-xs font-semibold leading-5 text-white/62">
                          {preview.stop}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm font-semibold leading-6 text-white/70">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-orange-200" />
                  <div className="min-w-0">
                    <p className="font-black text-white">{creator.destination}</p>
                    <p className="break-words">{creator.recommendationNote}</p>
                    <p className="mt-1 break-words text-xs font-black text-cyan-100">
                      Stopover: {creator.suggestedStopover}
                    </p>
                  </div>
                </div>

                {isSaved ? (
                  <div className="rounded-2xl border border-emerald-300/22 bg-emerald-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
                    Saved ✓ inside My Trips bookmarks
                  </div>
                ) : null}
                {isAdded ? (
                  <div className="rounded-2xl border border-cyan-300/24 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    ✓ Added to trip itinerary and planner basket
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => {
                      onCreatorAction?.("Explore Creator", creator);
                      setCreatorModalOpen(true);
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
                  >
                    <Eye size={14} />
                    Explore Creator
                  </button>
                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => onCreatorAction?.("Add to Trip", creator)}
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-black transition ${
                      isAdded
                        ? "border border-cyan-300/24 bg-cyan-400/14 text-cyan-50 shadow-[0_10px_24px_rgba(34,211,238,0.12)]"
                        : "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)] hover:bg-orange-400"
                    }`}
                  >
                    {isAdded ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                    {isAdded ? "✓ Added To Trip" : "Add To Trip"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onCreatorAction?.(
                        isSaved ? "Remove Saved Creator" : "Save Creator",
                        creator
                      )
                    }
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition ${
                      isSaved
                        ? "border-red-300/24 bg-red-400/12 text-red-50 hover:bg-red-400/18"
                        : "border-cyan-300/18 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15"
                    }`}
                  >
                    <Bookmark size={14} />
                    {isSaved ? "Remove Bookmark" : "Save Spot"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {creatorModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/12 bg-[#0D1B2F] text-white shadow-[0_30px_110px_rgba(0,0,0,0.46)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,138,31,0.10),rgba(7,17,31,0.96))] p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  TPL Creators
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Creator Marketplace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreatorModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-slate-200 transition hover:bg-white/[0.14]"
                aria-label="Close creator preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 p-5">
              {[
                "Creator Profiles",
                "Creator Routes",
                "Creator Stories",
                "Creator Marketplace",
                "Creator Followers",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-slate-100"
                >
                  {feature}
                </div>
              ))}
              <a
                href="/creators"
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-black text-[#0D1B2F]"
              >
                Open Creators
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
