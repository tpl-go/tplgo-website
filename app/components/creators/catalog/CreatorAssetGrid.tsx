import type { CreatorAsset } from "@/app/lib/creators/creatorCatalogTypes";
import { isCreatorAdvancedSearchEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAdvancedAssetCard from "./CreatorAdvancedAssetCard";
import CreatorAssetCard from "./CreatorAssetCard";

export default function CreatorAssetGrid({ assets, emptyText = "No creator assets match this view." }: { assets: CreatorAsset[]; emptyText?: string }) {
  const useAdvancedCards = isCreatorAdvancedSearchEnabled();

  if (!assets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((asset) => (
        useAdvancedCards ? <CreatorAdvancedAssetCard key={asset.id} asset={asset} /> : <CreatorAssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
