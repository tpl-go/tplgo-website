"use client";

import React from "react";
import { FlightManageBookingRecord } from "@/lib/manage/manageTypes";

interface ManageBookingDetailsProps {
  booking: FlightManageBookingRecord;
}

export default function ManageBookingDetails({
  booking,
}: ManageBookingDetailsProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Flight Booking
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#111827]">
              {booking.origin} → {booking.destination}
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
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
        <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-[#111827]">Traveller Details</h3>
          <div className="mt-4 space-y-3">
            {booking.travellers.map((traveller) => (
              <div
                key={traveller.id}
                className="rounded-2xl bg-[#f8f9fb] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#111827]">
                  {traveller.title} {traveller.firstName} {traveller.lastName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                  {traveller.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-[#111827]">Contact Details</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {booking.contact.email}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f9fb] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
                Phone
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
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

      <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#111827]">Fare Snapshot</h3>
        <div className="mt-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6b7280]">
            Total Paid
          </p>
          <p className="mt-1 text-lg font-bold text-[#111827]">
            ₹{booking.baseFareSnapshot.totalPaidAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}