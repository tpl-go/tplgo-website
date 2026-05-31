import BusResultTopSearchBar from "@/app/components/bus/result/BusResultTopSearchBar";
import BusResultsPageShell from "@/app/components/bus/result/BusResultsPageShell";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

import {
  searchBuses,
  sortBusResults,
} from "@/app/lib/bus/busSearchHelpers";

type BusResultPageProps = {
  searchParams: Promise<{
    fromCity?: string;
    fromPoint?: string;
    toCity?: string;
    toPoint?: string;
    date?: string;
    sort?: "relevance" | "rating" | "price" | "fastest" | "departure" | "arrival";
  }>;
};

export default async function BusResultPage({
  searchParams,
}: BusResultPageProps) {
  const params = await searchParams;

  const fromCity = params.fromCity || "";
  const fromPoint = params.fromPoint || "";
  const toCity = params.toCity || "";
  const toPoint = params.toPoint || "";
  const date = params.date || "";
  const sort = params.sort || "relevance";

  const rawResults =
    fromCity && toCity && date
      ? searchBuses({
          fromCity,
          fromPoint,
          toCity,
          toPoint,
          date,
        })
      : [];

  const results = sortBusResults(rawResults, sort);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-black">
      <div className="bg-[#f5f7fb] px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Bus Results" />
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-3 md:px-4 md:py-4">
        {/* TOP SEARCH BAR */}
        <div className="mb-4">
          <BusResultTopSearchBar
            key={`${fromCity}-${fromPoint}-${toCity}-${toPoint}-${date}`}
            initialSearch={{
              fromCity,
              fromPoint,
              toCity,
              toPoint,
              date,
            }}
          />
        </div>

        {/* FILTERS + RESULTS SHELL */}
        <BusResultsPageShell
          fromCity={fromCity}
          fromPoint={fromPoint}
          toCity={toCity}
          toPoint={toPoint}
          date={date}
          sort={sort}
          results={results}
        />
      </div>
    </main>
  );
}
