"use client";

import { InfoCard, SectionTitle, formatPrice } from "./BusManageShared";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  busName: string;
  operatorName: string;
  busType: string;
  routeLabel: string;
  fromCity: string;
  toCity: string;
  boardingPoint: string;
  droppingPoint: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  travellersLabel: string;
  fareSummary: {
    baseFare: number;
    taxAndSurcharge: number;
    tripSecureTotal: number;
    freeCancellationTotal: number;
    tplCredit: number;
    appliedOffer: number;
    discount: number;
    totalAmount: number;
  };
};

export default function BusManageSummary({
  bookingStatus,
  bookedAt,
  busName,
  operatorName,
  busType,
  routeLabel,
  fromCity,
  toCity,
  boardingPoint,
  droppingPoint,
  travelDate,
  departureTime,
  arrivalTime,
  duration,
  travellersLabel,
  fareSummary,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Bus Booking Summary"
        subtitle="Current confirmed bus booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Travel Date" value={travelDate} />

        <InfoCard label="Bus" value={busName} />
        <InfoCard label="Operator" value={operatorName || "-"} />
        <InfoCard label="Bus Type" value={busType || "-"} />
        <InfoCard label="Travellers" value={travellersLabel} />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-4 sm:p-5">
        <h3 className="text-base font-bold text-[#111827]">
          Journey Snapshot
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard label="Route" value={routeLabel} />
          <InfoCard label="From City" value={fromCity || "-"} />
          <InfoCard label="To City" value={toCity || "-"} />
          <InfoCard label="Duration" value={duration || "-"} />
          <InfoCard label="Departure" value={departureTime || "-"} />
          <InfoCard label="Arrival" value={arrivalTime || "-"} />
          <InfoCard label="Boarding Point" value={boardingPoint || "-"} />
          <InfoCard label="Dropping Point" value={droppingPoint || "-"} />
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-4 sm:p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard
            label="Base Fare"
            value={formatPrice(fareSummary.baseFare)}
          />
          <InfoCard
            label="Taxes & Fees"
            value={formatPrice(fareSummary.taxAndSurcharge)}
          />
          <InfoCard
            label="Trip Secure"
            value={formatPrice(fareSummary.tripSecureTotal)}
          />
          <InfoCard
            label="Free Cancellation"
            value={formatPrice(fareSummary.freeCancellationTotal)}
          />
          <InfoCard
            label="TPL Credit"
            value={`- ${formatPrice(fareSummary.tplCredit)}`}
          />
          <InfoCard
            label="Applied Offer"
            value={`- ${formatPrice(fareSummary.appliedOffer)}`}
          />
          <InfoCard
            label="Discount"
            value={`- ${formatPrice(fareSummary.discount)}`}
          />
          <InfoCard
            label="Total Paid"
            value={formatPrice(fareSummary.totalAmount)}
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
