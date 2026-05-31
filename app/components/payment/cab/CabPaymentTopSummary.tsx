"use client";

import { useMemo, useState } from "react";

type TravellerDetails = {
  pickupLocation?: string;
  fullName?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  usePickupAsBillingAddress?: boolean;
};

type CabAddonItem = {
  id: string;
  title: string;
  description: string;
  price: number;
};

type CabOfferItem = {
  id?: string;
  code?: string;
  title?: string;
  description?: string;
  discountAmount?: number;
} | null;

type Props = {
  cab: {
    id: string;
    name: string;
    brand?: string;
    image?: string;
    rideType?: string;
    vehicleType?: string;
    fuelType?: string;
    transmission?: string;
    seats?: number;
    luggage?: number;
    engineCc?: number;
    helmetIncluded?: boolean;
    rating?: number;
    reviewCount?: number;
    finalPrice: number;
    kmsIncluded?: number;
    extraKmFare?: number;
  };
  searchMeta: {
    rideType?: string;
    from?: string;
    to?: string;
    pickup?: string;
    drop?: string;
    departureDate?: string;
    returnDate?: string;
    pickupDate?: string;
    pickupTime?: string;
    dropTime?: string;
    rentalPackage?: string;
  };
  traveller?: TravellerDetails | null;
  selectedAddons?: CabAddonItem[];
  appliedOffer?: CabOfferItem;
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Not selected";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function formatRideTypeLabel(rideType?: string) {
  switch (rideType) {
    case "outstationOneWay":
      return "Outstation One-Way";
    case "outstationRoundTrip":
      return "Outstation Round-Trip";
    case "airportTransfers":
      return "Airport Transfer";
    case "hourlyRentals":
      return "Hourly Rental";
    case "carRental":
      return "Car Rental";
    case "bikeRental":
      return "Bike Rental";
    default:
      return "Cab Booking";
  }
}

function formatVehicleType(type?: string) {
  if (!type) return "Vehicle";
  if (type === "compactsuv") return "Compact SUV";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function travellerFullName(traveller?: TravellerDetails | null) {
  return traveller?.fullName?.trim() || "Primary Traveller";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[12px] font-bold text-[#6b7280]">{label}</div>
      <div className="break-words text-[13px] font-semibold leading-[20px] text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[12px] font-bold text-[#6b7280]">
      {children}
    </div>
  );
}

export default function CabPaymentTopSummary({
  cab,
  searchMeta,
  traveller,
  selectedAddons = [],
  appliedOffer,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const primaryTravellerName = travellerFullName(traveller);

  const contactSummary = `${traveller?.email || "email@example.com"}, +91-${
    traveller?.mobile || "0000000000"
  }`;

  const addonSummary = useMemo(() => {
    if (!selectedAddons.length) return "No special request selected";
    return selectedAddons.map((item) => item.title).join(", ");
  }, [selectedAddons]);

  const offerSummary =
    appliedOffer?.discountAmount && appliedOffer.discountAmount > 0
      ? `${appliedOffer.code || "OFFER"} • Save ₹${appliedOffer.discountAmount.toLocaleString(
          "en-IN"
        )}`
      : "No offer applied";

  const routeSummary = useMemo(() => {
    if (
      searchMeta.rideType === "outstationOneWay" ||
      searchMeta.rideType === "outstationRoundTrip"
    ) {
      return `${searchMeta.from || "From"} → ${searchMeta.to || "To"}`;
    }

    if (
      searchMeta.rideType === "airportTransfers" ||
      searchMeta.rideType === "carRental" ||
      searchMeta.rideType === "bikeRental"
    ) {
      return `${searchMeta.pickup || "Pickup"} → ${searchMeta.drop || "Drop"}`;
    }

    if (searchMeta.rideType === "hourlyRentals") {
      return `${searchMeta.pickup || "Pickup"} • ${searchMeta.rentalPackage || "Package"}`;
    }

    return "Route not selected";
  }, [searchMeta]);

  const journeyDateLabel = useMemo(() => {
    if (
      searchMeta.rideType === "hourlyRentals" ||
      searchMeta.rideType === "carRental" ||
      searchMeta.rideType === "bikeRental"
    ) {
      return formatDateLabel(searchMeta.pickupDate || searchMeta.departureDate);
    }

    return formatDateLabel(searchMeta.departureDate);
  }, [searchMeta]);

  const scheduleSummary = useMemo(() => {
    if (searchMeta.rideType === "outstationRoundTrip") {
      return `${searchMeta.pickupTime || "Not selected"} → ${searchMeta.dropTime || "Not selected"}`;
    }

    if (
      searchMeta.rideType === "carRental" ||
      searchMeta.rideType === "bikeRental"
    ) {
      return `${searchMeta.pickupTime || "Not selected"} → ${searchMeta.dropTime || "Not selected"}`;
    }

    return searchMeta.pickupTime || "Not selected";
  }, [searchMeta]);

  const cabMetaSummary = useMemo(() => {
    if (searchMeta.rideType === "bikeRental") {
      return `${formatVehicleType(cab.vehicleType)} • ${cab.engineCc || 0}cc • ${
        cab.fuelType?.toUpperCase() || "NA"
      }`;
    }

    return `${formatVehicleType(cab.vehicleType)} • ${
      cab.transmission
        ? cab.transmission.charAt(0).toUpperCase() + cab.transmission.slice(1)
        : "Manual"
    } • ${cab.seats || 4} Seats`;
  }, [cab, searchMeta]);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-[#eef6ff] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 px-4 py-[18px] sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[24px] leading-none">
            {searchMeta.rideType === "bikeRental" ? "🏍️" : "🚖"}
          </div>

          <h2 className="m-0 break-words text-[18px] font-extrabold leading-[26px] text-[#1f2937] sm:text-[20px] sm:leading-[28px]">
            {cab.brand ? `${cab.brand} ${cab.name}` : cab.name}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2 break-words text-[13px] font-semibold text-[#4b5563]">
            <span>{formatRideTypeLabel(searchMeta.rideType)}</span>
            <span>|</span>
            <span>{routeSummary}</span>
            <span>|</span>
            <span>{journeyDateLabel}</span>
            <span>|</span>
            <span>{cabMetaSummary}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="h-10 w-full rounded-xl border border-[#bfdbfe] bg-white px-3 text-[13px] font-extrabold text-[#1d9bf0] sm:w-auto sm:whitespace-nowrap sm:border-0 sm:bg-transparent sm:pt-[6px]"
        >
          {showDetails ? "HIDE DETAILS ▲" : "VIEW DETAILS ▼"}
        </button>
      </div>

      <div className="flex flex-col gap-[18px] border-t border-[#d9e2ec] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Booking details will be sent to:
          </div>

          <div className="break-words text-[14px] font-bold text-[#1f2937]">
            {primaryTravellerName}
          </div>

          <div className="mt-1 break-words text-[12px] font-medium text-[#4b5563]">
            {contactSummary}
          </div>
        </div>

        <div className="min-w-0 sm:min-w-[260px]">
          <div className="mb-1 text-[12px] font-bold text-[#6b7280]">
            Journey Summary
          </div>

          <div className="break-words text-[14px] font-bold text-[#1f2937]">
            {routeSummary}
          </div>

          <div className="mt-1 break-words text-[12px] font-medium text-[#4b5563]">
            {journeyDateLabel} • {scheduleSummary}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 gap-[18px] border-t border-[#d9e2ec] bg-[#f8fbff] px-4 py-4 lg:grid-cols-[1.2fr_1fr] lg:px-5">
          <div className="min-w-0">
            <SectionLabel>Cab Booking Summary</SectionLabel>

            <div className="grid gap-3">
              <div className="rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
                <div className="mb-2 text-[13px] font-extrabold text-[#111827]">
                  Trip & Vehicle Details
                </div>

                <div className="grid gap-3">
                  <InfoRow
                    label="Ride Type"
                    value={formatRideTypeLabel(searchMeta.rideType)}
                  />
                  <InfoRow label="Vehicle" value={cab.brand ? `${cab.brand} ${cab.name}` : cab.name} />
                  <InfoRow label="Route" value={routeSummary} />
                  <InfoRow label="Journey Date" value={journeyDateLabel} />
                  <InfoRow label="Time" value={scheduleSummary} />
                  <InfoRow label="Vehicle Info" value={cabMetaSummary} />
                  <InfoRow
                    label="Fuel Type"
                    value={cab.fuelType?.toUpperCase() || "NA"}
                  />
                  <InfoRow
                    label="Included Distance"
                    value={
                      cab.kmsIncluded
                        ? `${cab.kmsIncluded} kms`
                        : "As per selected package"
                    }
                  />
                  <InfoRow
                    label="Extra Fare"
                    value={
                      cab.extraKmFare
                        ? `₹${cab.extraKmFare}/km`
                        : "As applicable"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <SectionLabel>Traveller, Add-ons & Offer Summary</SectionLabel>

            <div className="grid gap-3 rounded-[10px] border border-[#d9e2ec] bg-white p-[14px]">
              <InfoRow label="Primary Traveller" value={primaryTravellerName} />
              <InfoRow label="Contact" value={contactSummary} />
              <InfoRow
                label="Pickup Address"
                value={traveller?.pickupLocation || "Not entered"}
              />
              <InfoRow label="Special Requests" value={addonSummary} />
              <InfoRow label="Applied Offer" value={offerSummary} />
              <InfoRow
                label="Billing Address"
                value={
                  traveller?.usePickupAsBillingAddress
                    ? "Same as pickup location"
                    : "Separate billing address"
                }
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
