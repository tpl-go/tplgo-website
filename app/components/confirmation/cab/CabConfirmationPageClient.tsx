"use client";

import CabConfirmationTopCard from "./CabConfirmationTopCard";
import CabConfirmationTripCard from "./CabConfirmationTripCard";
import CabConfirmationTravellerCard from "./CabConfirmationTravellerCard";
import CabConfirmationFareCard from "./CabConfirmationFareCard";
import CabConfirmationActionsCard from "./CabConfirmationActionsCard";
import type { CabConfirmationBookingRecord } from "@/app/lib/cab/cabConfirmationTypes";

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
    <main className="min-h-screen bg-[#f5f7fb] text-black">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
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