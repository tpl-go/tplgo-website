import { notFound } from "next/navigation";
import CreatorSearchView from "@/app/components/creators/catalog/CreatorSearchView";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export default async function CreatorSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();

  return <CreatorSearchView searchParams={await searchParams} />;
}
