import { creatorBackendReadDisabled, creatorBackendReadOk, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendLicenseDefinitions } from "@/app/lib/creators/creatorBackendReadService";

export async function GET() {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  return creatorBackendReadOk(getCreatorBackendLicenseDefinitions());
}
