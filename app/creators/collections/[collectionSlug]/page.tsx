import { notFound } from "next/navigation";
import CreatorCollectionView from "@/app/components/creators/catalog/CreatorCollectionView";
import { getCreatorCollection } from "@/app/lib/creators/creatorCatalogService";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;
  const collection = getCreatorCollection(collectionSlug);
  return {
    title: collection ? `${collection.title} | TPL Creator Market` : "Creator Collection | TPL",
    description: collection?.description,
  };
}

export default async function CreatorCollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();
  const { collectionSlug } = await params;

  return <CreatorCollectionView collectionSlug={collectionSlug} />;
}
