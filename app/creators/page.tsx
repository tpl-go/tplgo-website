import CreatorsLanding from "@/app/components/ecosystem/creators/CreatorsLanding";
import CreatorCatalogHome from "@/app/components/creators/catalog/CreatorCatalogHome";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export default function CreatorsPage() {
  if (isCreatorCatalogEnabled()) return <CreatorCatalogHome />;

  return <CreatorsLanding />;
}
