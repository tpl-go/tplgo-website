import { notFound } from "next/navigation";
import CreatorCategoryView from "@/app/components/creators/catalog/CreatorCategoryView";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { getCreatorCategoryPageConfig } from "@/app/lib/creators/creatorCategoryPageConfig";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = getCreatorCategoryPageConfig(categorySlug);
  return {
    title: category ? `${category.title} | TPL Creator Market` : "Creator Category | TPL",
    description: category?.description,
  };
}

export default async function CreatorCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();
  const { categorySlug } = await params;

  if (!getCreatorCategoryPageConfig(categorySlug)) notFound();
  return <CreatorCategoryView categorySlug={categorySlug} searchParams={await searchParams} />;
}
