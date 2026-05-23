"use client";

import { InfoCard, SectionTitle, formatPrice } from "./CabManageShared";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  cabName: string;
  cabType: string;
  tripType: string;
  rideId: string;
  fromLocation: string;
  toLocation: string;
  pickupDate: string;
  pickupTime: string;
  travellersLabel: string;
  specialRequest: string;
  fareSummary: {
    baseFare: number;
    driverAllowance: number;
    nightCharge: number;
    tollTax: number;
    stateTax: number;
    parkingCharge: number;
    gst: number;
    tplCredit: number;
    appliedOffer: number;
    totalAmount: number;
  };
};

export default function CabManageSummary({
  bookingStatus,
  bookedAt,
  cabName,
  cabType,
  tripType,
  rideId,
  fromLocation,
  toLocation,
  pickupDate,
  pickupTime,
  travellersLabel,
  specialRequest,
  fareSummary,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Cab Booking Summary"
        subtitle="Current confirmed cab booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Pickup Date" value={pickupDate} />

        <InfoCard label="Cab" value={cabName} />
        <InfoCard label="Cab Type" value={cabType} />
        <InfoCard label="Trip Type" value={tripType || "-"} />
        <InfoCard label="Ride ID" value={rideId || "-"} />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">
          Ride Snapshot
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard label="From" value={fromLocation || "-"} />
          <InfoCard label="To" value={toLocation || "-"} />
          <InfoCard label="Pickup Time" value={pickupTime || "-"} />
          <InfoCard label="Travellers" value={travellersLabel || "-"} />
        </div>

        {specialRequest ? (
          <div className="mt-4 rounded-2xl border border-black/5 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Special Request / Add-ons
            </p>
            <p className="mt-1 text-sm font-bold text-[#111827]">
              {specialRequest}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard label="Base Fare" value={formatPrice(fareSummary.baseFare)} />
          <InfoCard
            label="Driver Allowance"
            value={formatPrice(fareSummary.driverAllowance)}
          />
          <InfoCard
            label="Night Charge"
            value={formatPrice(fareSummary.nightCharge)}
          />
          <InfoCard label="Toll Tax" value={formatPrice(fareSummary.tollTax)} />
          <InfoCard
            label="State Tax"
            value={formatPrice(fareSummary.stateTax)}
          />
          <InfoCard
            label="Parking"
            value={formatPrice(fareSummary.parkingCharge)}
          />
          <InfoCard label="GST" value={formatPrice(fareSummary.gst)} />
          <InfoCard
            label="TPL Credit"
            value={`- ${formatPrice(fareSummary.tplCredit)}`}
          />
          <InfoCard
            label="Applied Offer"
            value={`- ${formatPrice(fareSummary.appliedOffer)}`}
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