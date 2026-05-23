import CabModifySearchBar from "@/app/components/cab/result/CabModifySearchBar";
import CabResultCard from "@/app/components/cab/result/CabResultCard";
import CabResultFilters from "@/app/components/cab/result/CabResultFilters";
import { CAB_RESULT_DATA } from "@/app/lib/cab/cabResultData";
import type { CabResultItem } from "@/app/lib/cab/cabResultTypes";
import { parseCabResultSearchParams } from "@/app/lib/cab/cabResultHelpers";
import CabResultPageClient from "@/app/components/cab/result/CabResultPageClient";

export default async function CabResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchMeta = parseCabResultSearchParams(resolvedSearchParams);

  const baseItems: CabResultItem[] = CAB_RESULT_DATA.filter(
    (item) => item.rideType === searchMeta.rideType
  );

  return (
    <CabResultPageClient
      searchMeta={searchMeta}
      baseItems={baseItems}
    />
  );
}