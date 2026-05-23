import CruiseDetailPage from "@/app/components/cruise/detail/CruiseDetailPage";

type Props = {
  params: {
    cruiseId: string;
  };
};

export default function Page({ params }: Props) {
  return <CruiseDetailPage cruiseId={params.cruiseId} />;
}