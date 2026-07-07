import CruiseDetailPage from "@/app/components/cruise/detail/CruiseDetailPage";

type Props = {
  params: Promise<{
    cruiseId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { cruiseId } = await params;
  return <CruiseDetailPage cruiseId={cruiseId} />;
}
