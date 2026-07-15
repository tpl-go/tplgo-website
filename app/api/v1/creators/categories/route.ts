import { creatorBackendReadDisabled, creatorBackendReadOk, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendCategories } from "@/app/lib/creators/creatorBackendReadService";

export async function GET() {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  return creatorBackendReadOk(getCreatorBackendCategories());
}
