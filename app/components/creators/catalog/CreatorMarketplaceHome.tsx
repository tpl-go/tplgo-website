"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import {
  discoveryFilters,
  marketplaceHomeAssets,
} from "@/app/lib/creators/creatorMarketplaceHomeData";
import type {
  MarketplaceAssetType,
  MarketplaceDiscoveryFilter,
  MarketplaceHomeAsset,
} from "@/app/lib/creators/creatorMarketplaceHomeTypes";
import CreatorMarketplaceHeader from "./CreatorMarketplaceHeader";
import CreatorMarketplaceHero from "./CreatorMarketplaceHero";
import CreatorCategoryStrip from "./CreatorCategoryStrip";
import CreatorTrendingAssets from "./CreatorTrendingAssets";
import CreatorPremiumCollections from "./CreatorPremiumCollections";
import CreatorFeaturedCreators from "./CreatorFeaturedCreators";
import CreatorPlanBenefits from "./CreatorPlanBenefits";
import CreatorTrustSection from "./CreatorTrustSection";
import CreatorSellerCTA from "./CreatorSellerCTA";
import CreatorMarketplaceFooter from "./CreatorMarketplaceFooter";
import typography from "./CreatorTypography.module.css";

function matchesDiscovery(asset: MarketplaceHomeAsset, filter: MarketplaceDiscoveryFilter) {
  if (filter === "popular") return true;
  if (filter === "new") return asset.newRelease;
  if (filter === "rated") return asset.rating >= 4.8;
  if (filter === "under-499") return asset.price <= 499;
  if (filter === "commercial") return asset.licenseTypes.includes("commercial");
  if (filter === "extended") return asset.licenseTypes.includes("extended");
  if (filter === "4k") return asset.resolution.toLowerCase().includes("4k");
  if (filter === "drone") return asset.assetType === "drone";
  return asset.assetType === "preset" && asset.tags.includes("mobile");
}

export default function CreatorMarketplaceHome() {
  const router = useRouter();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [query, setQuery] = useState("");
  const [assetType, setAssetType] = useState<"all" | MarketplaceAssetType>("all");
  const [discovery, setDiscovery] = useState<MarketplaceDiscoveryFilter>("popular");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [studioRequested, setStudioRequested] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (studioRequested && isAuthenticated && user) router.push("/creator-studio");
  }, [isAuthenticated, router, studioRequested, user]);

  const assets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return marketplaceHomeAssets
      .filter((asset) => {
        if (assetType !== "all" && asset.assetType !== assetType) return false;
        if (!matchesDiscovery(asset, discovery)) return false;
        return !normalized || [asset.title, asset.description, asset.category, asset.creator, ...asset.tags]
          .join(" ").toLowerCase().includes(normalized);
      })
      .sort((left, right) => {
        if (sort === "newest") return Number(right.newRelease) - Number(left.newRelease);
        if (sort === "rating") return right.rating - left.rating;
        if (sort === "price-low") return left.price - right.price;
        if (sort === "price-high") return right.price - left.price;
        return right.downloads - left.downloads;
      });
  }, [assetType, discovery, query, sort]);

  const openStudio = () => {
    if (isAuthenticated && user) return router.push("/creator-studio");
    setStudioRequested(true);
    openLoginModal();
  };

  const runSearch = () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={`${typography.scope} min-h-screen overflow-x-clip bg-white text-slate-950`}>
      <CreatorMarketplaceHeader onStudio={openStudio} userName={user?.fullName ?? user?.email ?? "Account"} />
      <main>
        <CreatorMarketplaceHero
          query={query}
          assetType={assetType}
          onQueryChange={setQuery}
          onAssetTypeChange={setAssetType}
          onSearch={runSearch}
          onStudio={openStudio}
        />
        <CreatorCategoryStrip onSelect={(type) => { setAssetType(type); requestAnimationFrame(runSearch); }} />
        <CreatorTrendingAssets
          ref={resultsRef}
          assets={assets}
          discovery={discovery}
          discoveryFilters={discoveryFilters}
          sort={sort}
          wishlist={wishlist}
          onDiscoveryChange={setDiscovery}
          onSortChange={setSort}
          onWishlist={(slug) => setWishlist((current) => {
            const next = new Set(current);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
          })}
          onClear={() => { setQuery(""); setAssetType("all"); setDiscovery("popular"); setSort("popular"); }}
        />
        <CreatorPremiumCollections />
        <CreatorFeaturedCreators />
        <CreatorPlanBenefits />
        <CreatorTrustSection />
        <CreatorSellerCTA onStudio={openStudio} />
      </main>
      <CreatorMarketplaceFooter onStudio={openStudio} />
    </div>
  );
}
