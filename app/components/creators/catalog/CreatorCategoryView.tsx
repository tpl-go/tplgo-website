import { notFound } from "next/navigation";
import { searchAssets, getCategories } from "@/app/lib/creators/creatorCatalogRepository";
import { getCreatorCategoryPageConfig } from "@/app/lib/creators/creatorCategoryPageConfig";
import CreatorPremiumCategoryPage from "./category/CreatorPremiumCategoryPage";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CreatorCategoryView({ categorySlug, searchParams }: { categorySlug: string; searchParams: SearchParams }) {
  const config = getCreatorCategoryPageConfig(categorySlug);
  if (!config) notFound();
  const [assetsResult, categoriesResult] = await Promise.all([searchAssets({ pageSize: "100" }), getCategories()]);
  return <CreatorPremiumCategoryPage config={config} assets={assetsResult.data.assets} categories={categoriesResult.data} initialParams={searchParams} />;
}
