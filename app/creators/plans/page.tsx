import { notFound } from "next/navigation";
import CreatorPlansPage from "@/app/components/creators/catalog/plans/CreatorPlansPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plans & Pricing | TPL Creators", description: "Compare Creator plans for premium assets, commercial licensing, creator tools and business teams." };

export default function CreatorPlansRoute() {
  if (!isCreatorCatalogEnabled()) notFound();
  return <CreatorPlansPage />;
}
