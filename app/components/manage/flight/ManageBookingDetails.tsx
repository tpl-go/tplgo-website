"use client";

import React from "react";
import { FlightManageBookingRecord } from "@/app/lib/manage/manageTypes";
import { formatFlightMoney, normalizeFlightCurrency } from "@/app/lib/flights/flightCurrency";

interface ManageBookingDetailsProps {
  booking: FlightManageBookingRecord;
}

export default function ManageBookingDetails({
  booking,
}: ManageBookingDetailsProps) {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Flight Booking
            </p>
            <h2 className="mt-1 break-words text-[20px] font-bold leading-7 text-[#111827] md:text-xl">
              {booking.origin} → {booking.destination}
            </h2>
            <p className="mt-1 break-words text-sm text-[#6b7280]">
              {booking.airlineName} • {booking.flightNumber}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Status
            </p>
            <p className="mt-1 text-sm font-bold text-[#111827]">
              {booking.bookingStatus.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
          <h3 className="text-base font-bold text-[#111827]">Traveller Details</h3>
          <div className="mt-4 space-y-3">
            {booking.travellers.map((traveller) => (
              <div
                key={traveller.id}
                className="rounded-2xl bg-[#f8f9fb] px-4 py-3"
              >
                <p className="break-words text-sm font-semibold text-[#111827]">
                  {traveller.title} {traveller.firstName} {traveller.lastName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                  {traveller.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
          <h3 className="text-base font-bold text-[#111827]">Contact Details</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Email
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[#111827]">
                {booking.contact.email}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Phone
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[#111827]">
                {booking.contact.phone}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Travel Date
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {booking.travelDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[24px] md:p-5">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>
        <div className="mt-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
            Total Paid
          </p>
          <p className="mt-1 text-lg font-bold text-[#111827]">
            {formatFlightMoney(
              booking.baseFareSnapshot.totalPaidAmount,
              normalizeFlightCurrency(booking.baseFareSnapshot.currency)
            )}
          </p>
        </div>
        <div className="mt-3 grid gap-2 text-[12px] font-bold leading-5 text-[#475569] md:grid-cols-2">
          <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
            PNR: {booking.pnr || "Not issued in test mode"}
          </div>
          <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
            Ticket: Not issued in test mode
          </div>
        </div>
      </div>
    </div>
  );
}
