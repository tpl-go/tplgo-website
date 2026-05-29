import FlightsPageClient from "../components/flight/results/FlightsPageClient";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;

  const params: Record<string, string | undefined> = {};

  Object.entries(rawParams).forEach(([key, value]) => {
    params[key] = Array.isArray(value) ? value[0] : value;
  });

  return (
    <main className="w-full overflow-x-hidden bg-[#f5f7fb]">
      <div className="mx-auto w-full max-w-7xl px-3 pt-3 lg:hidden">
        <MobileInnerBack title="Flights" />
      </div>

      <FlightsPageClient
        key={JSON.stringify(params)}
        initialParams={params}
      />
    </main>
  );
}