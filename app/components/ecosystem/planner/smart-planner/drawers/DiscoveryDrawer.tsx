"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Navigation,
  Plus,
  Route,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";

const LOCAL_LIFE_ROUTE = "/local-life";

export type DiscoveryItem = {
  id: string;
  category: string;
  title: string;
  image: string;
  description: string;
  distance?: string;
  bestTime?: string;
  duration?: string;
  difficulty?: string;
  googleRating?: string;
  weatherStatus?: string;
  crowdLevel?: string;
  creatorReviews?: string;
  openStatus?: string;
  bestPhotographyTime?: string;
  nearbyFood?: string[];
  nearbyMarket?: string[];
};

export type AnchorRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type DiscoveryDrawerProps = {
  item: DiscoveryItem | null;
  isOpen: boolean;
  anchorRect?: AnchorRect | null;
  onClose: () => void;
  onAddToTrip?: (item: DiscoveryItem) => void;
  onSave?: (item: DiscoveryItem) => void;
  onCreatorTips?: (item: DiscoveryItem) => void;
};

function isImageSource(value: string) {
  return value.startsWith("/") || value.startsWith("http");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function DiscoveryDrawer({
  item,
  isOpen,
  anchorRect,
  onClose,
  onAddToTrip,
  onSave,
}: DiscoveryDrawerProps) {
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    if (!mediaQuery.matches) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !actionMessage) return;

    const timeoutId = window.setTimeout(() => setActionMessage(""), 0);
    return () => window.clearTimeout(timeoutId);
  }, [actionMessage, isOpen]);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = window.setTimeout(() => {
      setActionMessage("");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const desktopPopoverStyle = useMemo<CSSProperties>(() => {
    if (typeof window === "undefined" || !anchorRect) {
      return {
        position: "absolute",
        top: 24,
        left: 24,
        width: 380,
        zIndex: 140,
      };
    }

    const POPOVER_WIDTH = 380;
    const GAP = 14;
    const SAFE = 16;

    let left = anchorRect.right + window.scrollX + GAP;

    if (left + POPOVER_WIDTH > window.scrollX + window.innerWidth - SAFE) {
      left = anchorRect.left + window.scrollX - POPOVER_WIDTH - GAP;
    }

    left = clamp(left, window.scrollX + SAFE, window.scrollX + window.innerWidth - POPOVER_WIDTH - SAFE);

    const top = Math.max(anchorRect.top + window.scrollY, window.scrollY + SAFE);

    return {
      position: "absolute",
      top,
      left,
      width: POPOVER_WIDTH,
      zIndex: 140,
    };
  }, [anchorRect]);

  if (!item || !isOpen) return null;

  const highlights: Array<readonly [string, string, LucideIcon]> = [
    ["Best Time", item.bestTime || "Golden hour", Clock],
    ["Distance", item.distance || "Nearby", MapPin],
    ["Duration", item.duration || "1 Hour", Route],
    ["Difficulty", item.difficulty || "Easy", Navigation],
  ];

  const mobileHighlights: Array<readonly [string, string, LucideIcon]> = [
    ...highlights,
    ["Popularity", item.crowdLevel || "Emerging", Users],
  ];

  const discoveryInsights: Array<readonly [string, string, LucideIcon]> = [
    ["Photography", item.bestPhotographyTime || "Golden hour", Camera],
    ["Crowd", item.crowdLevel || "Moderate", Users],
    ["Creator", item.creatorReviews || "Creator-ready", Star],
    ["Family", "Friendly", Heart],
  ];

  const nearby = [
    ...(item.nearbyFood || ["Local breakfast stop", "Creator-friendly cafe"]),
    ...(item.nearbyMarket || ["Nearby market lane", "Local product pocket"]),
    "Photo-friendly viewpoint",
    "Cultural stop",
  ].slice(0, 4);

  function handleAddToTrip() {
    if (!item) return;
    onAddToTrip?.(item);
    setActionMessage("Added to trip draft");
  }

  function handleSave() {
    if (!item) return;
    onSave?.(item);
    setActionMessage("Saved");
  }

  const actionMessageNode = actionMessage ? (
      <div className="mb-2 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 shadow-sm">
        <CheckCircle2 size={14} />
        {actionMessage}
      </div>
    ) : null;

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[130] ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close discovery details"
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/10 md:bg-transparent"
        />

        {/* MOBILE BOTTOM SHEET */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} discovery details`}
          className="absolute bottom-0 left-0 w-full overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:hidden"
        >
          <div className="flex max-h-[85vh] flex-col">
            <div className="flex shrink-0 justify-center bg-white pt-2">
              <span className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>
            <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100 sm:h-56">
              <TPLDynamicImage
                src={isImageSource(item.image) ? item.image : undefined}
                imageQuery={isImageSource(item.image) ? undefined : item.image}
                fallbackQuery={`${item.title} ${item.category} travel`}
                alt={item.title}
                className="absolute inset-0 h-full w-full"
                imgClassName="h-full w-full object-cover"
                preferDynamic={!isImageSource(item.image)}
                sizes="100vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/20 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/16 text-white backdrop-blur transition hover:bg-white/24"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-full border border-white/28 bg-white/16 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-white backdrop-blur">
                  {item.category}
                </span>

                <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                  {item.title}
                </h3>
              </div>
            </div>

            <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-4 pb-6">
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Quick highlights
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {mobileHighlights.map(([label, value, Icon]) => (
                    <div
                      key={`${item.id}-${label}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <Icon size={15} className="text-slate-500" />

                      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                        {label}
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-950">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Why visit
                </p>

                <p className="mt-2 rounded-2xl border border-slate-100 bg-white p-3 text-sm font-semibold leading-6 text-slate-700 shadow-sm">
                  {item.description}
                </p>
              </section>

              <section className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Discovery insights
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {discoveryInsights.map(([label, value, Icon]) => (
                    <div
                      key={`${item.id}-${label}`}
                      className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3"
                    >
                      <Icon size={16} className="text-emerald-700" />

                      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                        {label}
                      </p>

                      <p className="mt-1 text-xs font-black text-slate-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Nearby suggestions
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {nearby.map((suggestion) => (
                    <div
                      key={`${item.id}-${suggestion}`}
                      className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-xs font-black text-slate-800"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 p-3 pb-[calc(1rem_+_env(safe-area-inset-bottom))] backdrop-blur">
              {actionMessageNode}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToTrip}
                  className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white"
                >
                  <Plus size={14} className="mr-1 inline" />
                  Add To Trip
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800"
                >
                  Save
                </button>

                <Link
                  href="/explore"
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-center text-xs font-black text-orange-700"
                >
                  View Creator Tips
                </Link>

                <Link
                  href={LOCAL_LIFE_ROUTE}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700"
                >
                  Open Local Life
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* DESKTOP ANCHORED POPOVER */}
      {anchorRect ? (
        <aside
          role="dialog"
          aria-modal="false"
          aria-label={`${item.title} discovery details`}
          style={desktopPopoverStyle}
          className="hidden overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:block"
        >
          <div className="relative h-28 overflow-hidden bg-slate-100">
            <TPLDynamicImage
              src={isImageSource(item.image) ? item.image : undefined}
              imageQuery={isImageSource(item.image) ? undefined : item.image}
              fallbackQuery={`${item.title} ${item.category} travel`}
              alt={item.title}
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
              preferDynamic={!isImageSource(item.image)}
              sizes="380px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/76 via-slate-950/20 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/16 text-white backdrop-blur transition hover:bg-white/24"
            >
              <X size={16} />
            </button>

            <div className="absolute bottom-3 left-3 right-3">
              <span className="rounded-full border border-white/28 bg-white/16 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-white backdrop-blur">
                {item.category}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="line-clamp-2 text-lg font-black leading-tight text-slate-950">
              {item.title}
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {highlights.map(([label, value, Icon]) => (
                <div
                  key={`${item.id}-desktop-${label}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5"
                >
                  <Icon size={14} className="text-slate-500" />

                  <p className="mt-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs font-black text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                Why visit
              </p>

              <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                {item.description}
              </p>
            </section>

            <div className="mt-3">
              {actionMessageNode}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToTrip}
                className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white"
              >
                <Plus size={14} className="mr-1 inline" />
                Add To Trip
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800"
              >
                Save
              </button>

              <Link
                href="/explore"
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-center text-xs font-black text-orange-700"
              >
                View Creator Tips
              </Link>

              <Link
                href={LOCAL_LIFE_ROUTE}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700"
              >
                Open Local Life
              </Link>
            </div>
          </div>
        </aside>
      ) : null}
    </Portal>
  );
}
