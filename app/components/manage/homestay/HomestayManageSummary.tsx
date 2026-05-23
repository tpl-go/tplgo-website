"use client";

import { InfoCard, SectionTitle, formatPrice } from "../hotel/HotelManageShared";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  checkIn: string;
  checkOut: string;
  stayName: string;
  city: string;
  roomName: string;
  guestsLabel: string;
  rooms: number;
  nights: number;
  fareSummary: {
    roomPrice: number;
    taxes: number;
    totalAmount: number;
  };
};

export default function HomestayManageSummary({
  bookingStatus,
  bookedAt,
  checkIn,
  checkOut,
  stayName,
  city,
  roomName,
  guestsLabel,
  rooms,
  nights,
  fareSummary,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Homestay Booking Summary"
        subtitle="Current confirmed homestay booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Check-in Date" value={checkIn} />
        <InfoCard label="Homestay" value={stayName} />
        <InfoCard label="City" value={city} />
        <InfoCard label="Room Type" value={roomName} />
        <InfoCard label="Guests" value={guestsLabel} />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Stay Snapshot</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard label="Check-in" value={checkIn} />
          <InfoCard label="Check-out" value={checkOut} />
          <InfoCard
            label="Rooms / Nights"
            value={`${rooms} Room • ${nights} Night`}
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard
            label="Stay Price"
            value={formatPrice(fareSummary.roomPrice)}
          />
          <InfoCard
            label="Taxes"
            value={formatPrice(fareSummary.taxes)}
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