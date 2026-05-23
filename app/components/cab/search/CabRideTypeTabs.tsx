"use client";

import type { CabRideType } from "@/app/lib/cab/cabSearchTypes";

type Props = {
  activeRideType: CabRideType;
  onChange: (rideType: CabRideType) => void;
};

const RIDE_TYPE_OPTIONS: {
  label: string;
  value: CabRideType;
  badge?: string;
}[] = [
  { label: "Outstation One-Way", value: "outstationOneWay" },
  { label: "Outstation Round-Trip", value: "outstationRoundTrip" },
  { label: "Airport Transfers", value: "airportTransfers" },
  { label: "Hourly Rentals", value: "hourlyRentals", badge: "new" },
];

const RENTAL_TYPE_OPTIONS: {
  label: string;
  value: CabRideType;
}[] = [
  { label: "Car Rental", value: "carRental" },
  { label: "Bike Rental", value: "bikeRental" },
];

export default function CabRideTypeTabs({
  activeRideType,
  onChange,
}: Props) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      {RIDE_TYPE_OPTIONS.map((item) => {
        const active = activeRideType === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`relative rounded-full border px-5 py-2 text-[13px] font-bold transition-all duration-200 ${
              active
                ? "border-orange-500 bg-orange-500 text-white shadow-md"
                : "border-black bg-white/60 text-black hover:bg-white"
            }`}
          >
            {item.label}

            {item.badge ? (
              <span
                className={`ml-2 rounded-full px-2 py-[2px] text-[9px] font-extrabold uppercase ${
                  active
                    ? "bg-white text-orange-600"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}

      <div className="hidden h-6 w-px bg-black/30 lg:block" />

      {RENTAL_TYPE_OPTIONS.map((item) => {
        const active = activeRideType === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-full border px-5 py-2 text-[13px] font-bold transition-all duration-200 ${
              active
                ? "border-orange-500 bg-orange-500 text-white shadow-md"
                : "border-black bg-white/60 text-black hover:bg-white"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}