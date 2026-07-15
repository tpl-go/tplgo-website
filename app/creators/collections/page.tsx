import { notFound } from "next/navigation";
import CreatorCollectionsPage from "@/app/components/creators/catalog/collection/CreatorCollectionsPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
export const dynamic = "force-dynamic";
export default function CollectionsPage() { if (!isCreatorCatalogEnabled()) notFound(); return <CreatorCollectionsPage />; }
