import { notFound } from "next/navigation";
import { searchAssets, getCategories } from "@/app/lib/creators/creatorCatalogRepository";
import { getCreatorCollectionConfig } from "@/app/lib/creators/creatorCollectionPageConfig";
import CreatorCollectionDetail from "./collection/CreatorCollectionDetail";
export default async function CreatorCollectionView({ collectionSlug }: { collectionSlug: string }) { const config = getCreatorCollectionConfig(collectionSlug); if (!config) notFound(); const [assetsResult, categoriesResult] = await Promise.all([searchAssets({ pageSize: "100" }), getCategories()]); return <CreatorCollectionDetail config={config} assets={assetsResult.data.assets} categories={categoriesResult.data} />; }
