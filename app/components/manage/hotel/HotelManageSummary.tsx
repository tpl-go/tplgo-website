"use client";

import { InfoCard, SectionTitle, formatPrice } from "./HotelManageShared";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  checkIn: string;
  checkOut: string;
  hotelName: string;
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

export default function HotelManageSummary({
  bookingStatus,
  bookedAt,
  checkIn,
  checkOut,
  hotelName,
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
        title="Hotel Booking Summary"
        subtitle="Current confirmed hotel booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Check-in Date" value={checkIn} />
        <InfoCard label="Hotel" value={hotelName} />
        <InfoCard label="City" value={city} />
        <InfoCard label="Room Type" value={roomName} />
        <InfoCard label="Guests" value={guestsLabel} />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Stay Snapshot</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard label="Check-in" value={checkIn} />
          <InfoCard label="Check-out" value={checkOut} />
          <InfoCard label="Rooms / Nights" value={`${rooms} Room • ${nights} Night`} />
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoCard label="Room Price" value={formatPrice(fareSummary.roomPrice)} />
          <InfoCard label="Taxes" value={formatPrice(fareSummary.taxes)} />
          <InfoCard label="Total Paid" value={formatPrice(fareSummary.totalAmount)} />
        </div>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}