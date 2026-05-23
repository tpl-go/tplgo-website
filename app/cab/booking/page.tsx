import { CAB_RESULT_DATA } from "@/app/lib/cab/cabResultData";
import { parseCabResultSearchParams } from "@/app/lib/cab/cabResultHelpers";
import CabBookingPageClient from "@/app/components/booking/cab/CabBookingPageClient";

export default async function CabBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  const searchMeta = parseCabResultSearchParams(resolvedSearchParams);

  const cabId =
    typeof resolvedSearchParams.id === "string" ? resolvedSearchParams.id : "";

  const cab = CAB_RESULT_DATA.find((item) => item.id === cabId);

  if (!cab) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-4 py-8">
        <div className="mx-auto max-w-[1200px] rounded-[20px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-[22px] font-extrabold text-slate-900">
            Selected cab not found
          </div>
          <div className="mt-2 text-[14px] text-slate-500">
            Please go back to results and select a cab again.
          </div>
        </div>
      </main>
    );
  }

  return (
    <CabBookingPageClient
      cab={cab}
      searchMeta={searchMeta}
    />
  );
}