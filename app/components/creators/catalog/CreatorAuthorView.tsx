import { notFound } from "next/navigation";
import { getAssetsForCreator, getCategories } from "@/app/lib/creators/creatorCatalogRepository";
import { resolveCreatorProfile } from "@/app/lib/creators/creatorProfileResolver";
import CreatorProfilePage from "./authors/CreatorProfilePage";

export default async function CreatorAuthorView({ creatorSlug }: { creatorSlug: string }) {
  const resolution = await resolveCreatorProfile(creatorSlug);
  if (resolution.kind === "not_found") notFound();
  if (resolution.kind === "unavailable") throw new Error("CREATOR_PROFILE_TEMPORARILY_UNAVAILABLE");
  const creator = resolution.profile;
  const [assetsResult, categoriesResult] = await Promise.all([getAssetsForCreator(creator.slug), getCategories()]);
  return <CreatorProfilePage creator={creator} assets={assetsResult.data.assets} categories={categoriesResult.data} />;
}
