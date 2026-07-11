import { notFound } from "next/navigation";
import CreatorAuthorView from "@/app/components/creators/catalog/CreatorAuthorView";
import { getCreatorProfile } from "@/app/lib/creators/creatorCatalogService";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorSlug: string }>;
}) {
  const { creatorSlug } = await params;
  const creator = getCreatorProfile(creatorSlug);
  return {
    title: creator ? `${creator.name} | TPL Creator Market` : "Creator Author | TPL",
    description: creator?.bio,
  };
}

export default async function CreatorAuthorPage({
  params,
}: {
  params: Promise<{ creatorSlug: string }>;
}) {
  if (!isCreatorCatalogEnabled()) notFound();
  const { creatorSlug } = await params;

  return <CreatorAuthorView creatorSlug={creatorSlug} />;
}
