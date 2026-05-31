"use client";

import CabConfirmationTopCard from "./CabConfirmationTopCard";
import CabConfirmationTripCard from "./CabConfirmationTripCard";
import CabConfirmationTravellerCard from "./CabConfirmationTravellerCard";
import CabConfirmationFareCard from "./CabConfirmationFareCard";
import CabConfirmationActionsCard from "./CabConfirmationActionsCard";
import type { CabConfirmationBookingRecord } from "@/app/lib/cab/cabConfirmationTypes";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";

export default function CabConfirmationPageClient({
  record,
}: {
  record: CabConfirmationBookingRecord;
}) {
  const TopCard = CabConfirmationTopCard as any;
  const TripCard = CabConfirmationTripCard as any;
  const TravellerCard = CabConfirmationTravellerCard as any;
  const FareCard = CabConfirmationFareCard as any;
  const ActionsCard = CabConfirmationActionsCard as any;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-black">
      <MobileInnerBack title="Cab Confirmation" />
      <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-6">
        <div className="space-y-5">
          <TopCard record={record} />
          <TripCard record={record} />
          <TravellerCard record={record} />
          <FareCard record={record} />
          <ActionsCard record={record} />
        </div>
      </div>
    </main>
  );
}
