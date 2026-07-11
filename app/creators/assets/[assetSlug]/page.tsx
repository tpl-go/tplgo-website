import { notFound } from "next/navigation";
import CreatorAssetDetailView from "@/app/components/creators/catalog/CreatorAssetDetailView";
import { getCreatorAsset } from "@/app/lib/creators/creatorCatalogService";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ assetSlug: string }>;
}) {
  const { assetSlug } = await params;
  const asset = getCreatorAsset(assetSlug);
  return {
    title: asset ? `${asset.title} | TPL Creator Market` : "Creator Asset | TPL",
    description: asset?.subtitle,
  };
}

export default async function CreatorAssetPage({
  params,
}: {
  params: Promise<{ assetSlug: string }>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();
  const { assetSlug } = await params;

  return <CreatorAssetDetailView assetSlug={assetSlug} />;
}
