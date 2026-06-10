import TiyaItineraryTimeline from "./TiyaItineraryTimeline";
import type { Dispatch, SetStateAction } from "react";
import type { TiyaDayPlan } from "@/app/lib/ecosystem/planner/plannerTypes";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";

type TiyaDynamicItineraryProps = {
  days: TiyaDayPlan[];
  onDaysChange?: (days: TiyaDayPlan[]) => void;
  bookingBasket?: WorkspaceBookingBasketItem[];
  setBookingBasket?: Dispatch<SetStateAction<WorkspaceBookingBasketItem[]>>;
};

export default function TiyaDynamicItinerary({
  days,
  onDaysChange,
  bookingBasket,
  setBookingBasket,
}: TiyaDynamicItineraryProps) {
  return (
    <TiyaItineraryTimeline
      initialDays={days}
      onDaysChange={onDaysChange}
      bookingBasket={bookingBasket}
      setBookingBasket={setBookingBasket}
    />
  );
}
