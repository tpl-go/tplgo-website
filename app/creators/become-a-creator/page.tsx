import { notFound } from "next/navigation";
import CreatorBecomeCreatorPage from "@/app/components/creators/catalog/onboarding/CreatorBecomeCreatorPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
export const dynamic = "force-dynamic";
export const metadata = { title: "Become a Creator | TPL Creators", description: "Start a guided application to sell original travel media through TPL Creators." };
export default function BecomeCreatorRoute() { if (!isCreatorCatalogEnabled()) notFound(); return <CreatorBecomeCreatorPage />; }
