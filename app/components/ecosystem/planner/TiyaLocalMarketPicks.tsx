import {
  BadgeCheck,
  Bookmark,
  MapPinned,
  PackagePlus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { TiyaLocalMarketPick } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaEmptyState, TiyaAISkeleton } from "./TiyaPolishStates";

type TiyaLocalMarketPicksProps = {
  products?: TiyaLocalMarketPick[] | null;
  isGenerating?: boolean;
};

export default function TiyaLocalMarketPicks({
  products = [],
  isGenerating = false,
}: TiyaLocalMarketPicksProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const highlightedCount = safeProducts.filter((product) => product.isHighlighted).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="relative border-b border-blue-100/80 bg-white/80 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              <ShoppingBag
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Local commerce layer
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
              TPL Local Market Recommendations
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Regional products matched to the destination, route purpose and
              creator-led discovery signals.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
            {highlightedCount} route-relevant pick{highlightedCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-3">
        {isGenerating ? (
          <div className="lg:col-span-3">
            <TiyaAISkeleton label="Tiya is curating destination-linked local market picks." />
          </div>
        ) : null}
        {!isGenerating && safeProducts.length === 0 ? (
          <div className="lg:col-span-3">
            <TiyaEmptyState
              icon={ShoppingBag}
              eyebrow="TPL local market"
              title="No local market picks are active for this plan"
              detail="Turn on Local Market or add shopping, food, culture or creator interests to connect the journey with regional products."
              tone="light"
            />
          </div>
        ) : null}
        {safeProducts.map((product) => (
          <article
            key={product.id}
            className={`flex min-h-[320px] flex-col rounded-3xl border p-4 transition ${
              product.isHighlighted
                ? "border-orange-200 bg-orange-50/80 shadow-[0_14px_38px_rgba(249,115,22,0.14)]"
                : "border-blue-100 bg-white"
            }`}
          >
            <div className="relative overflow-hidden rounded-[26px] border border-blue-100 bg-[#061839] p-4 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(249,115,22,0.2),transparent_28%)]" />
              <div className="relative flex min-h-[122px] flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <ShoppingBag size={21} />
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                    {product.productType}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                    Product preview
                  </p>
                  <h3 className="mt-1 text-lg font-black leading-tight">
                    {product.productName}
                  </h3>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                <BadgeCheck size={13} />
                {product.authenticityBadge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                <MapPinned size={13} />
                {product.localRegion}
              </span>
              {product.isCreatorRecommended ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-black text-orange-700">
                  <Sparkles size={13} />
                  Creator recommended
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              {product.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                  Price range
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {product.priceRange}
                </p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">
                  Route relevance
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {product.routeRelevance}%
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
              {product.specialtyLabel}
            </div>

            <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-3 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
              >
                <PackagePlus size={14} />
                Add to Trip
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800"
              >
                <Bookmark size={14} />
                Save Product
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
