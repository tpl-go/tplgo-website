import { creatorBackendReadDisabled, creatorBackendReadOk, filtersFromRequest, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { searchCreatorBackendAssets } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(request: Request) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  return creatorBackendReadOk(searchCreatorBackendAssets(filtersFromRequest(request)));
}
