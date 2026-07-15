import { notFound } from "next/navigation";
import { getAsset, getCreator, getRelatedAssets } from "@/app/lib/creators/creatorCatalogRepository";
import CreatorAssetDetailPage from "./asset-detail/CreatorAssetDetailPage";

export default async function CreatorAssetDetailView({ assetSlug }: { assetSlug: string }) {
  const assetResult = await getAsset(assetSlug);
  const asset = assetResult.data;
  if (!asset) notFound();

  const [creatorResult, relatedResult] = await Promise.all([
    getCreator(asset.creatorSlug),
    getRelatedAssets(asset),
  ]);

  return (
    <CreatorAssetDetailPage
      asset={asset}
      creator={creatorResult.data}
      related={relatedResult.data.filter((item) => item.slug !== asset.slug).slice(0, 6)}
      source={assetResult.source}
    />
  );
}
