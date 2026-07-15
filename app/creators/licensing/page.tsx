import { notFound } from "next/navigation";
import CreatorLicensingPage from "@/app/components/creators/catalog/licensing/CreatorLicensingPage";
import { isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Licensing Center | TPL Creators",
  description: "Compare Standard, Extended and Enterprise licensing for TPL Creator assets.",
};

export default function CreatorLicensingRoute() {
  if (!isCreatorCatalogEnabled()) notFound();
  return <CreatorLicensingPage />;
}
