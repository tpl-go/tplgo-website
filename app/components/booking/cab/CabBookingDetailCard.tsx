"use client";

import Image from "next/image";
import type { CabBookingPageData } from "@/app/lib/cab/cabBookingTypes";

type Props = {
  data: CabBookingPageData;
};

export default function CabBookingDetailCard({ data }: Props) {
  const { cab, searchMeta } = data;
  const isBike = searchMeta.rideType === "bikeRental";

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[130px_1fr]">
        <div className="rounded-[18px] bg-[#eef8ff] p-3">
          <div className="flex h-[84px] items-center justify-center rounded-[14px] bg-[#dff3ff]">
            <Image
              src={cab.image}
              alt={cab.name}
              width={110}
              height={64}
              className="h-[64px] w-auto object-contain"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[22px] font-extrabold text-slate-900">{cab.name}</h2>
            <span className="rounded-md bg-sky-600 px-2 py-[2px] text-[11px] font-bold text-white">
              {cab.rating}/5
            </span>
          </div>

          <div className="mt-1 text-[14px] text-slate-500">
            {cab.brand} • {cab.reviewCount} reviews
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <InfoBox
              label={searchMeta.from || searchMeta.pickup || "Pickup"}
              value={searchMeta.to || searchMeta.drop || "Drop"}
            />
            <InfoBox
              label="Travel Date"
              value={
                searchMeta.departureDate ||
                searchMeta.pickupDate ||
                "Not selected"
              }
            />
            <InfoBox label="Pickup Time" value={searchMeta.pickupTime || "10:00 AM"} />
            <InfoBox
              label={isBike ? "Bike Info" : "Vehicle Info"}
              value={
                isBike
                  ? `${cab.engineCc || 0}cc • ${cab.fuelType || ""}`
                  : `${cab.seats || 4} Seats • ${cab.fuelType || ""}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}