"use client";

import { InfoCard, SectionTitle, formatPrice } from "./PackageManageShared";

type Props = {
  bookingStatus: string;
  bookedAt: string;
  packageTitle: string;
  packageSlug?: string;
  routeLabel: string;
  travelDate: string;
  variant?: string;
  originCity?: string;
  days?: number;
  nights?: number;
  travellersLabel: string;
  fareSummary: {
    basePrice: number;
    upgradedDiffTotal: number;
    feesAndTaxes: number;
    insuranceAmount: number;
    couponDiscount: number;
    tplCreditUsed: number;
    totalAmount: number;
  };
};

export default function PackageManageSummary({
  bookingStatus,
  bookedAt,
  packageTitle,
  packageSlug,
  routeLabel,
  travelDate,
  variant,
  originCity,
  days,
  nights,
  travellersLabel,
  fareSummary,
}: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Package Booking Summary"
        subtitle="Current confirmed package booking snapshot."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Booking Status" value={capitalize(bookingStatus)} />
        <InfoCard label="Payment Status" value="Paid" />
        <InfoCard label="Booked On" value={bookedAt} />
        <InfoCard label="Travel Date" value={travelDate} />
        <InfoCard label="Package" value={packageTitle} />
        <InfoCard label="Package Code" value={packageSlug || "-"} />
        <InfoCard label="Route" value={routeLabel} />
        <InfoCard label="Travellers" value={travellersLabel} />
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">
          Trip Snapshot
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard label="Origin City" value={originCity || "-"} />
          <InfoCard label="Variant" value={variant || "-"} />
          <InfoCard label="Days" value={days ? `${days} Days` : "-"} />
          <InfoCard label="Nights" value={nights ? `${nights} Nights` : "-"} />
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 bg-[#f8f9fb] p-5">
        <h3 className="text-base font-bold text-[#111827]">
          Fare Snapshot
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <InfoCard
            label="Base Price"
            value={formatPrice(fareSummary.basePrice)}
          />
          <InfoCard
            label="Upgrade Diff"
            value={formatPrice(fareSummary.upgradedDiffTotal)}
          />
          <InfoCard
            label="Taxes / Fees"
            value={formatPrice(fareSummary.feesAndTaxes)}
          />
          <InfoCard
            label="Insurance"
            value={formatPrice(fareSummary.insuranceAmount)}
          />
          <InfoCard
            label="Coupon Discount"
            value={`- ${formatPrice(fareSummary.couponDiscount)}`}
          />
          <InfoCard
            label="TPL Credit"
            value={`- ${formatPrice(fareSummary.tplCreditUsed)}`}
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