import { notFound } from "next/navigation"; import CreatorDirectoryPage from "@/app/components/creators/catalog/authors/CreatorDirectoryPage"; import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { listCanonicalCreatorProfiles } from "@/app/lib/creators/creatorProfileResolver";
export const dynamic = "force-dynamic";
export default async function CreatorsDirectoryRoute() { if (!isCreatorCatalogEnabled()) notFound(); const result = await listCanonicalCreatorProfiles(); if (result.source === "unavailable") throw new Error("CREATOR_DIRECTORY_TEMPORARILY_UNAVAILABLE"); return <CreatorDirectoryPage profiles={result.profiles} />; }
