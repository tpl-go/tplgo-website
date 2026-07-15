"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import type { CreatorAsset, CreatorCategory } from "@/app/lib/creators/creatorCatalogTypes";
import type { CreatorCategoryPageConfig } from "@/app/lib/creators/creatorCategoryPageConfig";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import CreatorSearchFilters from "../search/CreatorSearchFilters";
import CreatorSearchToolbar from "../search/CreatorSearchToolbar";
import CreatorSearchResults from "../search/CreatorSearchResults";
import CreatorSearchPagination from "../search/CreatorSearchPagination";
import CreatorSearchBanner from "../search/CreatorSearchBanner";
import CreatorCategoryHero from "./CreatorCategoryHero";
import typography from "../CreatorTypography.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const pageSize = 6;

export default function CreatorPremiumCategoryPage({ config, assets, categories }: { config: CreatorCategoryPageConfig; assets: CreatorAsset[]; categories: CreatorCategory[]; initialParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [studioRequested, setStudioRequested] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  useEffect(() => { if (studioRequested && isAuthenticated && user) router.push("/creator-studio"); }, [isAuthenticated, router, studioRequested, user]);
  const update = (patch: Record<string, string | null>, resetPage = true) => { const next = new URLSearchParams(params.toString()); for (const [key, value] of Object.entries(patch)) { if (value) next.set(key, value); else next.delete(key); } if (resetPage && !("page" in patch)) next.delete("page"); router.push(`${pathname}?${next.toString()}`, { scroll: false }); };
  const clear = () => router.push(pathname, { scroll: false });
  const openStudio = () => { if (isAuthenticated && user) router.push("/creator-studio"); else { setStudioRequested(true); openLoginModal(); } };

  const filtered = useMemo(() => {
    const query = (params.get("q") ?? "").toLowerCase();
    const orientation = params.get("orientation") ?? "";
    const resolution = (params.get("resolution") ?? "").toLowerCase();
    const license = params.get("license") ?? "";
    const price = params.get("price") ?? "";
    const location = (params.get("location") ?? "").toLowerCase();
    const categoryOverride = params.get("category") ?? "";
    const candidates = assets.filter((asset) => {
      const text = [asset.title, asset.subtitle, asset.description, asset.category, asset.subcategory, asset.creatorName, ...asset.tags].join(" ").toLowerCase();
      const semanticMatch = config.semanticTerms.some((term) => text.includes(term));
      const belongs = config.slug === "photos" ? asset.mediaType === "image"
        : config.slug === "videos" ? asset.mediaType === "video"
        : config.slug === "templates" ? asset.category === "templates"
        : config.slug === "presets" ? asset.category === "presets-luts" || semanticMatch
        : config.slug === "destination-guides" ? asset.category === "guides" || asset.category === "maps-routes"
        : semanticMatch || asset.category === config.catalogCategory;
      if (!belongs) return false;
      if (query && !text.includes(query)) return false;
      if (orientation && asset.orientation !== orientation) return false;
      if (resolution && !(asset.resolution ?? "").toLowerCase().includes(resolution)) return false;
      if (license && !asset.licenses.includes(license as never)) return false;
      if (price === "under-499" && asset.price > 499) return false;
      if (price === "under-999" && asset.price > 999) return false;
      if (location && !text.includes(location)) return false;
      if (categoryOverride && asset.category !== categoryOverride) return false;
      return true;
    });
    const sort = params.get("sort") ?? "popular";
    return [...candidates].sort((a, b) => sort === "newest" ? b.updatedAt.localeCompare(a.updatedAt) : sort === "top-rated" ? b.rating - a.rating : sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.reviewCount - a.reviewCount);
  }, [assets, config, params]);
  const page = Math.max(Number(params.get("page") ?? "1"), 1);
  const pageCount = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilters = [...params.entries()].filter(([key, value]) => value && !["q", "sort", "page"].includes(key));

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-slate-50 text-slate-950`}><CreatorMarketplaceHeader onStudio={openStudio} userName={user?.fullName ?? user?.email ?? "Account"} /><main><CreatorCategoryHero config={config} query={params.get("q") ?? ""} onSearch={(query) => router.push(`/creators/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(config.slug)}`)} onTag={(tag) => router.push(`/creators/search?q=${encodeURIComponent(tag)}&type=${encodeURIComponent(config.slug)}`)} /><div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10"><CreatorSearchFilters categories={categories} params={params} onUpdate={update} onClear={clear} /><section className="min-w-0"><CreatorSearchToolbar query={config.title} count={filtered.length} activeFilters={activeFilters} sort={params.get("sort") ?? "popular"} view={view} onRemove={(key) => update({ [key]: null })} onClear={clear} onSort={(sort) => update({ sort: sort === "popular" ? null : sort }, false)} onView={setView} /><CreatorSearchResults assets={visible} view={view} onClear={clear} onPopular={(value) => router.push(`/creators/search?q=${encodeURIComponent(value)}&type=${config.slug}`)} /><CreatorSearchPagination page={currentPage} pageCount={pageCount} onPage={(value) => update({ page: String(value) }, false)} /></section></div><CreatorSearchBanner /></main><CreatorMarketplaceFooter onStudio={openStudio} /></div>;
}
