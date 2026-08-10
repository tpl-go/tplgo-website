"use client";

import AircraftSeatMap from "@/app/components/booking/flight/AircraftSeatMap";
import { TravellerSeatSelection } from "@/app/lib/flights/ancillaries/ancillaryTypes";
import { formatCurrency } from "@/app/lib/manage/manageUtils";

type TravellerItem = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
};

interface ManageSeatsSectionProps {
  travellers: TravellerItem[];
  value: TravellerSeatSelection[];
  currency?: string;
  onChange: (next: TravellerSeatSelection[]) => void;
}

function getSelectionForTraveller(
  value: TravellerSeatSelection[],
  travellerId: string,
  index: number
) {
  const byId = value.find((item) => item.travellerId === travellerId);
  if (byId) return byId;
  return value[index] ?? null;
}

export default function ManageSeatsSection({
  travellers,
  value,
  currency = "INR",
}: ManageSeatsSectionProps) {
  const currentSeatCodeByTraveller = travellers.reduce<Record<string, string | null>>(
    (acc, traveller, index) => {
      const selection = getSelectionForTraveller(value, traveller.id, index);
      acc[traveller.id] = selection?.oldSeatCode || selection?.newSeatCode || null;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Manage Seats
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827]">
              Seat change availability
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Current seats are shown from the booking snapshot. Alternative seat changes
              require a backend read-only provider quote and are unavailable until the
              provider exposes that safe contract for this booking.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {travellers.map((traveller, index) => {
            const selection = getSelectionForTraveller(value, traveller.id, index);
            const currentSeat = selection?.oldSeatCode || selection?.newSeatCode || "Not assigned";
            const currentPrice = Number(selection?.oldPrice ?? selection?.newPrice ?? 0);
            return (
              <div key={traveller.id} className="rounded-2xl border border-[#d9e2ec] bg-[#f8fbff] px-4 py-4">
                <p className="text-sm font-bold text-[#111827]">
                  {traveller.title} {traveller.firstName} {traveller.lastName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#64748b]">
                  Traveller {index + 1} · {traveller.type}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3">
                  <span className="text-sm font-semibold text-[#4b5563]">Current seat</span>
                  <span className="text-sm font-black text-[#111827]">{currentSeat}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3">
                  <span className="text-sm font-semibold text-[#4b5563]">Seat value</span>
                  <span className="text-sm font-black text-[#111827]">
                    {formatCurrency(currentPrice, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
        <AircraftSeatMap
          mode="manage"
          seatMaps={[]}
          travellers={travellers.map((traveller, index) => ({
            id: traveller.id,
            label: `${traveller.title} ${traveller.firstName} ${traveller.lastName}`,
            subLabel: `Traveller ${index + 1} · ${traveller.type}`,
          }))}
          currentSeatCodeByTraveller={currentSeatCodeByTraveller}
          unavailableMessage="Seat-change map is unavailable for this booking. No supplier seat change, seat purchase or frontend fare-difference calculation has been attempted."
        />
      </div>
    </div>
  );
}
