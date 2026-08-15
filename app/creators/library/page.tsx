import { notFound } from "next/navigation";
import CreatorLibraryPage from "@/app/components/creators/catalog/library/CreatorLibraryPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Library | TPL Creators", description: "Manage saved assets, downloads, licenses and Creator collections in one workspace." };

export default function CreatorLibraryRoute() {
  if (!isCreatorCatalogEnabled()) notFound();
  return <CreatorLibraryPage />;
}
