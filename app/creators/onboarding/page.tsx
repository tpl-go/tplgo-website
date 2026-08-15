import { notFound } from "next/navigation";
import CreatorOnboardingPage from "@/app/components/creators/catalog/onboarding/CreatorOnboardingPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
export const dynamic = "force-dynamic";
export const metadata = { title: "Creator Application | TPL Creators", description: "Complete the guided TPL Creator onboarding preview." };
export default function CreatorOnboardingRoute() { if (!isCreatorCatalogEnabled()) notFound(); return <CreatorOnboardingPage />; }
