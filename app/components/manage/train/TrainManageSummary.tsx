"use client";

import {
  InfoCard,
  SectionTitle,
  formatPrice,
} from "./TrainManageShared";

type FareSummary = {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  otherCharges: number;
  tax: number;
};

type Props = {
  bookingStatus: string;

  bookedAt: string;

  trainName: string;
  trainNumber: string;

  route: string;

  boardingStation: string;
  destinationStation: string;

  journeyDate: string;

  departureTime: string;
  arrivalTime: string;

  coachClass: string;
  quota: string;

  pnrNumber: string;

  travellersLabel: string;

  fareSummary: FareSummary;

  totalAmount: number;
};

export default function TrainManageSummary({
  bookingStatus,
  bookedAt,
  trainName,
  trainNumber,
  route,
  boardingStation,
  destinationStation,
  journeyDate,
  departureTime,
  arrivalTime,
  coachClass,
  quota,
  pnrNumber,
  travellersLabel,
  fareSummary,
  totalAmount,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionTitle
            title="Train Booking Summary"
            subtitle="Review train journey, passenger and fare details."
          />

          <div className="min-w-0 rounded-2xl border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-green-700">
              Booking Status
            </p>

            <p className="mt-1 break-words text-sm font-extrabold text-green-700">
              {bookingStatus || "Confirmed"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
          <h3 className="break-words text-lg font-black text-[#111827]">
            Journey Details
          </h3>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard
              label="Train"
              value={`${trainName} ${trainNumber}`}
            />

            <InfoCard
              label="Route"
              value={route}
            />

            <InfoCard
              label="Boarding"
              value={boardingStation}
            />

            <InfoCard
              label="Destination"
              value={destinationStation}
            />

            <InfoCard
              label="Journey Date"
              value={journeyDate}
            />

            <InfoCard
              label="Booked At"
              value={bookedAt}
            />

            <InfoCard
              label="Departure"
              value={departureTime}
            />

            <InfoCard
              label="Arrival"
              value={arrivalTime}
            />

            <InfoCard
              label="Class"
              value={coachClass}
            />

            <InfoCard
              label="Quota"
              value={quota}
            />

            <InfoCard
              label="PNR Number"
              value={pnrNumber}
            />

            <InfoCard
              label="Travellers"
              value={travellersLabel}
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:rounded-[28px] md:p-5 lg:p-6">
          <h3 className="break-words text-lg font-black text-[#111827]">
            Fare Summary
          </h3>

          <div className="mt-5 space-y-3">
            <FareRow
              label="Base Fare"
              value={formatPrice(
                fareSummary.baseFare
              )}
            />

            <FareRow
              label="Reservation Charge"
              value={formatPrice(
                fareSummary.reservationCharge
              )}
            />

            <FareRow
              label="Superfast Charge"
              value={formatPrice(
                fareSummary.superfastCharge
              )}
            />

            <FareRow
              label="Other Charges"
              value={formatPrice(
                fareSummary.otherCharges
              )}
            />

            <FareRow
              label="Tax"
              value={formatPrice(
                fareSummary.tax
              )}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4 md:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">
              Total Paid
            </p>

            <p className="mt-2 break-words text-[26px] font-black text-[#111827] md:text-3xl">
              {formatPrice(totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FareRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 rounded-2xl bg-[#f8fafc] px-4 py-3">
      <p className="min-w-0 break-words text-sm font-semibold text-[#4b5563]">
        {label}
      </p>

      <p className="shrink-0 whitespace-nowrap text-sm font-black text-[#111827]">
        {value}
      </p>
    </div>
  );
}
