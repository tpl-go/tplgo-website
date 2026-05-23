import FlightsPageClient from "../components/flight/results/FlightsPageClient";

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
    <FlightsPageClient
      key={JSON.stringify(params)}
      initialParams={params}
    />
  );
}