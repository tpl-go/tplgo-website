"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import type { CreatorAsset, CreatorCategory } from "@/app/lib/creators/creatorCatalogTypes";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import CreatorSearchBar from "./CreatorSearchBar";
import CreatorSearchFilters from "./CreatorSearchFilters";
import CreatorSearchToolbar from "./CreatorSearchToolbar";
import CreatorSearchResults from "./CreatorSearchResults";
import CreatorSearchPagination from "./CreatorSearchPagination";
import CreatorSearchBanner from "./CreatorSearchBanner";
import typography from "../CreatorTypography.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const pageSize = 6;

const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
const mediaFor = (type: string) => ({ photo: "image", photos: "image", video: "video", videos: "video", reel: "template", reels: "template", drone: "video", template: "template", presets: "template", graphics: "document", guides: "document" }[type] ?? type);

export default function CreatorSearchPage({ assets, categories, initialParams }: { assets: CreatorAsset[]; categories: CreatorCategory[]; initialParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [studioRequested, setStudioRequested] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { if (studioRequested && isAuthenticated && user) router.push("/creator-studio"); }, [isAuthenticated, router, studioRequested, user]);

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(urlParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage && !("page" in patch)) next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const clear = () => router.push(pathname, { scroll: false });
  const openStudio = () => { if (isAuthenticated && user) router.push("/creator-studio"); else { setStudioRequested(true); openLoginModal(); } };

  const filtered = useMemo(() => {
    const q = (urlParams.get("q") ?? "").trim().toLowerCase();
    const type = mediaFor(urlParams.get("type") ?? urlParams.get("mediaType") ?? "");
    const orientation = urlParams.get("orientation") ?? "";
    const category = urlParams.get("category") ?? "";
    const resolution = (urlParams.get("resolution") ?? "").toLowerCase();
    const duration = urlParams.get("duration") ?? "";
    const license = urlParams.get("license") ?? "";
    const price = urlParams.get("price") ?? "";
    const color = urlParams.get("color") ?? "";
    const location = (urlParams.get("location") ?? "").toLowerCase();
    const values = assets.filter((asset) => {
      const text = [asset.title, asset.subtitle, asset.description, asset.creatorName, asset.creatorRole, asset.category, asset.subcategory, ...asset.tags].join(" ").toLowerCase();
      if (q && q !== "india" && !text.includes(q)) return false;
      if (type && asset.mediaType !== type) return false;
      if (orientation && asset.orientation !== orientation) return false;
      if (category && asset.category !== category) return false;
      if (resolution && !(asset.resolution ?? "").toLowerCase().includes(resolution)) return false;
      if (duration === "short" && (!asset.duration || Number.parseInt(asset.duration) > 1)) return false;
      if (license && !asset.licenses.includes(license as never)) return false;
      if (price === "under-499" && asset.price > 499) return false;
      if (price === "under-999" && asset.price > 999) return false;
      if (location && !text.includes(location)) return false;
      if (color && !text.includes(color)) return false;
      return true;
    });
    const sort = urlParams.get("sort") ?? "popular";
    return [...values].sort((a, b) => {
      if (sort === "newest") return b.updatedAt.localeCompare(a.updatedAt);
      if (sort === "top-rated") return b.rating - a.rating;
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "most-downloaded") return b.reviewCount - a.reviewCount;
      if (sort === "trending") return b.rating * b.reviewCount - a.rating * a.reviewCount;
      return b.reviewCount - a.reviewCount;
    });
  }, [assets, urlParams]);

  const page = Math.max(Number(urlParams.get("page") ?? "1"), 1);
  const pageCount = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilters = [...urlParams.entries()].filter(([key, value]) => value && !["q", "sort", "page"].includes(key));

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-slate-50 text-slate-950`}>
    <CreatorMarketplaceHeader onStudio={openStudio} userName={user?.fullName ?? user?.email ?? "Account"} />
    <main>
      <CreatorSearchBar key={urlParams.get("q") ?? "all"} initialQuery={urlParams.get("q") ?? one(initialParams.q)} type={urlParams.get("type") ?? ""} safe={urlParams.get("safe") !== "off"} onSubmit={(value) => update({ q: value || null })} onType={(type) => update({ type: type || null })} onSafe={(safe) => update({ safe: safe ? null : "off" })} onPopular={(value) => update({ q: value })} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10">
        <CreatorSearchFilters categories={categories} params={urlParams} onUpdate={update} onClear={clear} />
        <section className="min-w-0"><CreatorSearchToolbar query={urlParams.get("q") ?? ""} count={filtered.length} activeFilters={activeFilters} sort={urlParams.get("sort") ?? "popular"} view={view} onRemove={(key) => update({ [key]: null })} onClear={clear} onSort={(sort) => update({ sort: sort === "popular" ? null : sort }, false)} onView={setView} /><CreatorSearchResults assets={visible} view={view} onClear={clear} onPopular={(value) => update({ q: value })} /><CreatorSearchPagination page={currentPage} pageCount={pageCount} onPage={(value) => update({ page: String(value) }, false)} /></section>
      </div>
      <CreatorSearchBanner />
    </main>
    <CreatorMarketplaceFooter onStudio={openStudio} />
  </div>;
}
