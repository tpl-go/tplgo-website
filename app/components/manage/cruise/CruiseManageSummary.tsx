"use client";

import { InfoCard, SectionTitle, formatPrice } from "./CruiseManageShared";

type Props = {
  bookingStatus?: string;
  bookedAt?: string;

  cruiseTitle?: string;
  cruiseLine?: string;
  shipName?: string;

  route?: string;
  departurePort?: string;
  arrivalPort?: string;

  sailingDate?: string;
  sailingEndDate?: string;

  cabinName?: string;
  travellersLabel?: string;
  totalTravellers?: number;

  fareSummary?: {
    baseFare?: number;
    taxes?: number;
    portCharges?: number;
    gratuityCharges?: number;
    totalAmount?: number;
  };

  totalAmount?: number;
};

export default function CruiseManageSummary({
  bookingStatus = "",
  bookedAt = "",
  cruiseTitle = "Cruise Booking",
  cruiseLine = "-",
  shipName = "-",
  route = "-",
  departurePort = "-",
  arrivalPort = "-",
  sailingDate = "-",
  sailingEndDate = "-",
  cabinName = "Selected Cabin",
  travellersLabel = "",
  totalTravellers = 0,
  fareSummary,
  totalAmount = 0,
}: Props) {
  const safeFare = {
    baseFare: Number(fareSummary?.baseFare || 0),
    taxes: Number(fareSummary?.taxes || 0),
    portCharges: Number(fareSummary?.portCharges || 0),
    gratuityCharges: Number(fareSummary?.gratuityCharges || 0),
    totalAmount: Number(fareSummary?.totalAmount || totalAmount || 0),
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Cruise Booking Summary"
        subtitle="Current confirmed cruise booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Cruise Line" value={cruiseLine} />

        <InfoCard label="Cruise" value={cruiseTitle} />
        <InfoCard label="Ship Name" value={shipName} />
        <InfoCard label="Cabin Type" value={cabinName} />
        <InfoCard
          label="Travellers"
          value={travellersLabel || `${totalTravellers || 1} Traveller`}
        />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">
          Sailing Snapshot
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Route" value={route} />
          <InfoCard label="Departure Port" value={departurePort} />
          <InfoCard label="Arrival Port" value={arrivalPort} />
          <InfoCard label="Sailing Date" value={sailingDate} />
          <InfoCard label="Return Date" value={sailingEndDate} />
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="Base Fare" value={formatPrice(safeFare.baseFare)} />
          <InfoCard label="Taxes" value={formatPrice(safeFare.taxes)} />
          <InfoCard
            label="Port Charges"
            value={formatPrice(safeFare.portCharges)}
          />
          <InfoCard
            label="Gratuity"
            value={formatPrice(safeFare.gratuityCharges)}
          />
          <InfoCard
            label="Total Paid"
            value={formatPrice(safeFare.totalAmount)}
          />
        </div>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}