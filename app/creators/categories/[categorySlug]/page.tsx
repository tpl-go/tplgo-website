import { notFound } from "next/navigation";
import CreatorCategoryView from "@/app/components/creators/catalog/CreatorCategoryView";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { getCreatorCategory } from "@/app/lib/creators/creatorCatalogService";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = getCreatorCategory(categorySlug);
  return {
    title: category ? `${category.title} | TPL Creator Market` : "Creator Category | TPL",
    description: category?.description,
  };
}

export default async function CreatorCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();
  const { categorySlug } = await params;

  return <CreatorCategoryView categorySlug={categorySlug} />;
}
