import { notFound, redirect } from "next/navigation";
import CreatorAuthorView from "@/app/components/creators/catalog/CreatorAuthorView";
import { resolveCreatorProfile } from "@/app/lib/creators/creatorProfileResolver";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorSlug: string }>;
}) {
  const { creatorSlug } = await params;
  const resolution = await resolveCreatorProfile(creatorSlug);
  const creator = resolution.kind === "found" ? resolution.profile : null;
  return {
    title: creator ? `${creator.displayName} | TPL Creator Market` : "Creator Author | TPL",
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
  const resolution = await resolveCreatorProfile(creatorSlug);
  if (resolution.kind === "found" && resolution.redirectRequired) redirect(`/creators/authors/${resolution.canonicalSlug}`);
  return <CreatorAuthorView creatorSlug={creatorSlug} />;
}
