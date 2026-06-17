"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Camera,
  Clock3,
  Eye,
  MapPinned,
  PackagePlus,
  Route,
  ShoppingBag,
  Sparkles,
  Utensils,
  WalletCards,
} from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { TiyaLocalMarketPick } from "@/app/lib/ecosystem/planner/plannerTypes";
import { TiyaAISkeleton, TiyaEmptyState } from "./TiyaPolishStates";

type LocalLifeCategory =
  | "All"
  | "Food & Snacks"
  | "Handicrafts"
  | "Travel Essentials"
  | "Culture Walks"
  | "Local Experiences"
  | "Creator Spots"
  | "Shopping Stops";

type TiyaLocalMarketPicksProps = {
  products?: TiyaLocalMarketPick[] | null;
  isGenerating?: boolean;
  savedProductIds?: string[];
  onProductAction?: (action: string, product: TiyaLocalMarketPick) => void;
};

const categoryTabs: LocalLifeCategory[] = [
  "All",
  "Food & Snacks",
  "Handicrafts",
  "Travel Essentials",
  "Culture Walks",
  "Local Experiences",
  "Creator Spots",
  "Shopping Stops",
];

function localLifeCategory(product: TiyaLocalMarketPick): LocalLifeCategory {
  const type = product.productType.toLowerCase();
  const text = `${product.productName} ${product.description} ${product.specialtyLabel}`.toLowerCase();

  if (type.includes("snack") || type.includes("spice") || type.includes("tea") || text.includes("food")) {
    return "Food & Snacks";
  }
  if (type.includes("handicraft") || text.includes("craft") || text.includes("keepsake")) {
    return "Handicrafts";
  }
  if (type.includes("travel essentials") || text.includes("pouch") || text.includes("utility")) {
    return "Travel Essentials";
  }
  if (product.isCreatorRecommended) return "Creator Spots";
  if (text.includes("walk") || text.includes("culture")) return "Culture Walks";
  if (text.includes("market") || text.includes("shopping")) return "Shopping Stops";
  return "Local Experiences";
}

function parsePriceRange(priceRange: string) {
  const values = priceRange
    .match(/\d[\d,]*/g)
    ?.map((value) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));
  const min = values?.[0] || 0;
  const max = values?.[1] || values?.[0] || 0;

  return { min, max };
}

function formatRange(min: number, max: number) {
  if (!min && !max) return "Price on request";
  if (min === max) return `₹${min.toLocaleString("en-IN")}`;
  return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
}

function averageScore(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function itemScores(product: TiyaLocalMarketPick) {
  const route = Math.max(0, Math.min(99, product.routeRelevance || 0));
  const creator = product.isCreatorRecommended
    ? Math.min(98, route + 7)
    : Math.max(66, route - 8);
  const commerce = product.authenticityBadge
    ? Math.min(97, route + 5)
    : Math.max(62, route - 12);

  return { commerce, creator, route };
}

function bestSlot(product: TiyaLocalMarketPick, index: number) {
  const category = localLifeCategory(product);
  const day = Math.min(3, index + 1);

  if (category === "Food & Snacks") return `Day ${day} evening`;
  if (category === "Travel Essentials") return `Day ${Math.max(1, day - 1)} morning`;
  if (category === "Creator Spots") return `Day ${day} golden hour`;
  return `Day ${day} late afternoon`;
}

function imageQueryFor(product: TiyaLocalMarketPick, category: LocalLifeCategory) {
  const typeQuery =
    category === "Food & Snacks"
      ? "street food local snack"
      : category === "Handicrafts"
        ? "handicraft local craft artisan"
        : category === "Travel Essentials"
          ? "travel essentials route utility"
          : category === "Creator Spots"
            ? "creator spot local culture"
            : "local culture market experience";

  return `${product.localRegion} ${product.productName} ${typeQuery} travel`;
}

export default function TiyaLocalMarketPicks({
  products = [],
  isGenerating = false,
  savedProductIds = [],
  onProductAction,
}: TiyaLocalMarketPicksProps) {
  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );
  const [activeCategory, setActiveCategory] = useState<LocalLifeCategory>("All");
  const [previewProductId, setPreviewProductId] = useState<string | undefined>();
  const selectedProducts = safeProducts.filter((product) => product.isHighlighted);
  const filteredProducts = safeProducts.filter((product) => {
    if (activeCategory === "All") return true;
    return localLifeCategory(product) === activeCategory;
  });
  const destination =
    safeProducts[0]?.localRegion ||
    selectedProducts[0]?.localRegion ||
    "Destination";
  const spend = selectedProducts.length
    ? selectedProducts.reduce(
        (total, product) => {
          const price = parsePriceRange(product.priceRange);
          return { min: total.min + price.min, max: total.max + price.max };
        },
        { min: 0, max: 0 }
      )
    : safeProducts.slice(0, 2).reduce(
        (total, product) => {
          const price = parsePriceRange(product.priceRange);
          return { min: total.min + price.min, max: total.max + price.max };
        },
        { min: 0, max: 0 }
      );
  const summary = useMemo(() => {
    const scores = safeProducts.map(itemScores);

    return {
      commerce: averageScore(scores.map((score) => score.commerce)),
      creator: averageScore(scores.map((score) => score.creator)),
      route: averageScore(scores.map((score) => score.route)),
    };
  }, [safeProducts]);

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.28)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(249,115,22,0.2),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <ShoppingBag size={15} className={isGenerating ? "animate-pulse" : undefined} />
              Local Life discovery engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Local Life
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/66">
              Local culture, food, products and experiences matched to the route,
              traveller style and creator-commerce signals.
            </p>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:w-[520px]">
            {[
              [`${destination} Local Life Plan`, `${safeProducts.length} matched picks`],
              ["Selected items", `${selectedProducts.length}`],
              ["Estimated local spend", formatRange(spend.min, spend.max)],
              ["Route fit", `${summary.route || 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="break-words text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  {label}
                </p>
                <p className="mt-1 break-words text-sm font-black text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Local Life Strategy Summary
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Destination", destination],
                ["Route relevance", `${safeProducts.filter((product) => product.routeRelevance >= 85).length} route-relevant picks`],
                ["Commerce value", `${summary.commerce || 0}%`],
                ["Creator value", `${summary.creator || 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <WalletCards size={15} />
              Local Life Basket
            </div>
            <div className="mt-3 grid gap-2">
              {[
                ["Selected Local Life Items", `${selectedProducts.length}`],
                ["Estimated Spend", formatRange(spend.min, spend.max)],
                ["Route Fit", `${summary.route || 0}%`],
                ["Commerce Value", `${summary.commerce || 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                  <span className="break-words text-xs font-bold text-white/58">{label}</span>
                  <span className="shrink-0 text-xs font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryTabs.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black transition ${
                activeCategory === category
                  ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-50"
                  : "border-white/10 bg-white/10 text-white/65 hover:bg-white/15"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isGenerating ? (
          <TiyaAISkeleton label="Tiya is curating destination-linked Local Life picks." />
        ) : null}

        {!isGenerating && safeProducts.length === 0 ? (
          <TiyaEmptyState
            icon={ShoppingBag}
            eyebrow="TPL Local Life"
            title="No Local Life picks are active for this plan"
            detail="Add shopping, food, culture or creator interests to connect the journey with regional products and experiences."
            tone="dark"
          />
        ) : null}

        <div className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredProducts.map((product, index) => {
            const category = localLifeCategory(product);
            const scores = itemScores(product);
            const previewOpen = previewProductId === product.id;
            const slot = bestSlot(product, index);
            const price = parsePriceRange(product.priceRange);
            const isSaved = savedProductIds.includes(product.id);

            return (
              <article
                key={product.id}
                className={`flex min-w-0 flex-col overflow-hidden rounded-3xl border transition ${
                  isSaved
                    ? "border-emerald-300/35 bg-emerald-400/12 shadow-[0_18px_52px_rgba(16,185,129,0.16)] ring-1 ring-emerald-300/16"
                    : product.isHighlighted
                    ? "border-orange-300/30 bg-orange-400/10 shadow-[0_18px_48px_rgba(249,115,22,0.18)]"
                    : "border-white/10 bg-white/[0.08]"
                }`}
              >
                <div className="relative min-h-[178px] overflow-hidden">
                  <TPLDynamicImage
                    imageQuery={imageQueryFor(product, category)}
                    fallbackQuery={`${product.localRegion} local culture market food travel`}
                    alt={`${product.productName} in ${product.localRegion}`}
                    preferDynamic
                    className="absolute inset-0"
                    imgClassName="h-full w-full object-cover"
                    sizes="(min-width: 1536px) 33vw, (min-width: 1024px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061839] via-[#061839]/34 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2 pr-3">
                    <span className="rounded-full border border-white/15 bg-[#061839]/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-50 backdrop-blur">
                      {category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100 backdrop-blur">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-400/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-50 backdrop-blur">
                        <Bookmark size={12} />
                        Bookmarked
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 min-w-0">
                    <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
                      <MapPinned size={13} />
                      {product.localRegion}
                    </p>
                    <h3 className="mt-1 break-words text-lg font-black leading-tight text-white">
                      {product.productName}
                    </h3>
                  </div>
                </div>

                <div className="grid flex-1 gap-3 p-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      ["Route relevance", `${scores.route}%`],
                      ["Creator value", `${scores.creator}%`],
                      ["Commerce value", `${scores.commerce}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/42">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
                      <Clock3 size={13} />
                      {slot}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[11px] font-black text-orange-100">
                      <WalletCards size={13} />
                      {product.priceRange}
                    </span>
                  </div>

                  <p className="break-words text-sm font-semibold leading-6 text-white/66">
                    {product.description}
                  </p>

                  <div className="rounded-2xl border border-cyan-300/14 bg-cyan-300/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                      Why it fits the itinerary
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold leading-5 text-cyan-50/78">
                      {product.specialtyLabel} aligns with the current route,
                      {product.isCreatorRecommended ? " creator value" : " traveller interest"},
                      and can be placed without disrupting transfer windows.
                    </p>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                        <Camera size={13} />
                        Creator Opportunity
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/64">
                        Good for photo, video or story. Best time: {slot.replace(/^Day \d+\s/, "")}.
                        Theme: {category === "Food & Snacks" ? "local food trail" : "local life discovery"}.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                        <Utensils size={13} />
                        Local Commerce
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/64">
                        Seller verified, destination relevant, route pickup or local delivery possible.
                      </p>
                    </div>
                  </div>

                  {isSaved ? (
                    <div className="rounded-2xl border border-emerald-300/22 bg-emerald-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
                      Bookmarked inside My Trips
                    </div>
                  ) : null}

                  {previewOpen ? (
                    <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
                        What Will Change
                      </p>
                      <div className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-orange-50/82">
                        <span>{slot} Local Life stop added.</span>
                        <span>Local spend +{formatRange(price.min, price.max)} estimate.</span>
                        <span>Creator value +12 and local commerce +18.</span>
                        <span>Activity basket, booking readiness and review payload updated.</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-auto grid gap-2 pt-1 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setPreviewProductId(previewOpen ? undefined : product.id)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onProductAction?.("Add to Trip", product)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-orange-500 px-3 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                    >
                      <PackagePlus size={14} />
                      Add to Trip
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onProductAction?.(
                          isSaved ? "Remove Saved Local Life" : "Save Local Life",
                          product
                        )
                      }
                      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${
                        isSaved
                          ? "border-red-300/24 bg-red-400/12 text-red-50 hover:bg-red-400/18"
                          : "border-cyan-300/18 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15"
                      }`}
                    >
                      <Bookmark size={14} />
                      {isSaved ? "Remove Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Route size={15} />
              Day-wise Local Life Plan
            </div>
            <div className="mt-3 grid gap-2">
              {selectedProducts.length ? (
                selectedProducts.map((product, index) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm font-black text-white">
                      {bestSlot(product, index)}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {product.productName} · {localLifeCategory(product)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/62">
                  No Local Life stop selected yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Transparent Local Life Change Log
            </div>
            <div className="mt-3 grid gap-2">
              {selectedProducts.length ? (
                selectedProducts.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm font-black text-white">Local Life Added</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {product.productName} added to {bestSlot(product, index)}.
                      Route fit +8. Cost {product.priceRange} estimate.
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/62">
                  Add or save an item to record Local Life decisions in the planner change log.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
