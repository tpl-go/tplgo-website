import CruiseResultsPageClient from "@/app/components/cruise/result/CruiseResultsPageClient";
import { getCruiseResultSearchMeta } from "@/app/lib/cruise/getCruiseResultSearchMeta";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CruiseResultPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const searchMeta = getCruiseResultSearchMeta(resolvedSearchParams);

  const pageKey = JSON.stringify({
    destination: searchMeta.destinationId,
    port: searchMeta.departurePortId,
    date: searchMeta.sailingDate,
    month: searchMeta.sailingMonth,
    duration: searchMeta.durationId,
    adults: searchMeta.adults,
    children: searchMeta.children,
    infants: searchMeta.infants,
  });

  return <CruiseResultsPageClient key={pageKey} searchMeta={searchMeta} />;
}
