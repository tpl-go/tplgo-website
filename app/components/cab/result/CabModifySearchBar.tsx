"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";

import type { CabRideType } from "@/app/lib/cab/cabSearchTypes";
import type { CabResultSearchMeta } from "@/app/lib/cab/cabResultTypes";

import CabResultLocationField from "./CabResultLocationField";
import CabResultDateField from "./CabResultDateField";
import CabResultTimeField from "./CabResultTimeField";
import CabResultStopsModal from "./CabResultStopsModal";

type Props = {
  searchMeta: CabResultSearchMeta;
};

type SearchBarErrors = {
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

const RIDE_TYPE_OPTIONS: { label: string; value: CabRideType }[] = [
  { label: "Outstation One-Way", value: "outstationOneWay" },
  { label: "Outstation Round-Trip", value: "outstationRoundTrip" },
  { label: "Airport Transfers", value: "airportTransfers" },
  { label: "Hourly Rentals", value: "hourlyRentals" },
  { label: "Car Rental", value: "carRental" },
  { label: "Bike Rental", value: "bikeRental" },
];

function formatDisplayDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CabModifySearchBar({ searchMeta }: Props) {
  const router = useRouter();

  const [rideType, setRideType] = useState<CabRideType>(searchMeta.rideType);

  const [from, setFrom] = useState(searchMeta.from || "");
  const [to, setTo] = useState(searchMeta.to || "");
  const [pickup, setPickup] = useState(searchMeta.pickup || "");
  const [drop, setDrop] = useState(searchMeta.drop || "");

  const [departureDate, setDepartureDate] = useState(
    searchMeta.departureDate || ""
  );
  const [returnDate, setReturnDate] = useState(searchMeta.returnDate || "");
  const [pickupDate, setPickupDate] = useState(searchMeta.pickupDate || "");

  const [pickupTime, setPickupTime] = useState(
    searchMeta.pickupTime || "10:00 AM"
  );
  const [dropTime, setDropTime] = useState(searchMeta.dropTime || "09:45 PM");

  const [rentalPackage, setRentalPackage] = useState(
    searchMeta.rentalPackage || ""
  );
  const [rentalVehicleType, setRentalVehicleType] = useState(
    searchMeta.rentalVehicleType || ""
  );

  const [stops, setStops] = useState<string[]>(searchMeta.stops || []);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [errors, setErrors] = useState<SearchBarErrors>({});

  const stopsText = useMemo(
    () => stops.map((item) => item.trim()).filter(Boolean).join(", "),
    [stops]
  );

  const showStops =
    rideType === "outstationOneWay" || rideType === "outstationRoundTrip";

  function updateStop(index: number, value: string) {
    setStops((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addStop() {
    setStops((prev) => {
      if (prev.length >= 5) return prev;
      return [...prev, ""];
    });
  }

  function removeStop(index: number) {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRideTypeChange(nextRideType: CabRideType) {
    setRideType(nextRideType);

    setFrom("");
    setTo("");
    setPickup("");
    setDrop("");

    setDepartureDate("");
    setReturnDate("");
    setPickupDate("");

    setPickupTime("10:00 AM");
    setDropTime("09:45 PM");

    setRentalPackage("");
    setRentalVehicleType("");
    setStops([]);
    setErrors({});
  }

  function handleSwapFromTo() {
    setFrom(to);
    setTo(from);
    setErrors((prev) => ({
      ...prev,
      from: undefined,
      to: undefined,
    }));
  }

  function handleSwapPickupDrop() {
    setPickup(drop);
    setDrop(pickup);
    setErrors((prev) => ({
      ...prev,
      pickup: undefined,
      drop: undefined,
    }));
  }

  function validateSearch() {
    const nextErrors: SearchBarErrors = {};

    if (rideType === "outstationOneWay") {
      if (!from.trim()) nextErrors.from = "From city is required";
      if (!to.trim()) nextErrors.to = "To city is required";
      if (!departureDate) nextErrors.departureDate = "Pick-Up Date is required";
      if (!pickupTime.trim()) nextErrors.pickupTime = "Pick-Up Time is required";
    }

    if (rideType === "outstationRoundTrip") {
      if (!from.trim()) nextErrors.from = "From city is required";
      if (!to.trim()) nextErrors.to = "To city is required";
      if (!departureDate) nextErrors.departureDate = "Pick-Up Date is required";
      if (!returnDate) nextErrors.returnDate = "Drop Date is required";
      if (!pickupTime.trim()) nextErrors.pickupTime = "Pick-Up Time is required";
      if (!dropTime.trim()) nextErrors.dropTime = "Drop Time is required";
    }

    if (rideType === "airportTransfers") {
      if (!pickup.trim()) nextErrors.pickup = "Pickup location is required";
      if (!drop.trim()) nextErrors.drop = "Drop location is required";
      if (!departureDate) nextErrors.departureDate = "Pick-Up Date is required";
      if (!pickupTime.trim()) nextErrors.pickupTime = "Pick-Up Time is required";
    }

    if (rideType === "hourlyRentals") {
      if (!pickup.trim()) nextErrors.pickup = "Pickup location is required";
      if (!pickupDate) nextErrors.pickupDate = "Pick-Up Date is required";
      if (!pickupTime.trim()) nextErrors.pickupTime = "Pick-Up Time is required";
      if (!rentalPackage.trim()) nextErrors.rentalPackage = "Package is required";
    }

    if (rideType === "carRental" || rideType === "bikeRental") {
      if (!pickup.trim()) nextErrors.pickup = "Pickup location is required";
      if (!drop.trim()) nextErrors.drop = "Drop location is required";
      if (!pickupDate) nextErrors.pickupDate = "Pick-Up Date is required";
      if (!departureDate) nextErrors.departureDate = "Drop Date is required";
      if (!pickupTime.trim()) nextErrors.pickupTime = "Pick-Up Time is required";
      if (!dropTime.trim()) nextErrors.dropTime = "Drop Time is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSearch() {
    const isValid = validateSearch();
    if (!isValid) return;

    const params = new URLSearchParams();
    params.set("rideType", rideType);

    if (rideType === "outstationOneWay") {
      params.set("from", from.trim());
      params.set("to", to.trim());
      params.set("departureDate", departureDate);
      params.set("pickupTime", pickupTime);

      const cleanStops = stops.map((item) => item.trim()).filter(Boolean);
      if (cleanStops.length > 0) params.set("stops", cleanStops.join(","));
    }

    if (rideType === "outstationRoundTrip") {
      params.set("from", from.trim());
      params.set("to", to.trim());
      params.set("departureDate", departureDate);
      params.set("returnDate", returnDate);
      params.set("pickupTime", pickupTime);
      params.set("dropTime", dropTime);

      const cleanStops = stops.map((item) => item.trim()).filter(Boolean);
      if (cleanStops.length > 0) params.set("stops", cleanStops.join(","));
    }

    if (rideType === "airportTransfers") {
      params.set("pickup", pickup.trim());
      params.set("drop", drop.trim());
      params.set("departureDate", departureDate);
      params.set("pickupTime", pickupTime);
    }

    if (rideType === "hourlyRentals") {
      params.set("pickup", pickup.trim());
      params.set("pickupDate", pickupDate);
      params.set("pickupTime", pickupTime);
      params.set("rentalPackage", rentalPackage.trim());
    }

    if (rideType === "carRental" || rideType === "bikeRental") {
      params.set("pickup", pickup.trim());
      params.set("drop", drop.trim());
      params.set("pickupDate", pickupDate);
      params.set("departureDate", departureDate);
      params.set("pickupTime", pickupTime);
      params.set("dropTime", dropTime);
      if (rentalVehicleType) {
        params.set("rentalVehicleType", rentalVehicleType);
      }
    }

    router.push(`/cab/result?${params.toString()}`);
  }

  return (
    <>
      <div className="overflow-visible rounded-2xl border border-slate-200 bg-[#0f172a] shadow-sm">
        {rideType === "outstationOneWay" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_1.05fr_150px_1.05fr_180px_180px_170px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="From" dark error={errors.from}>
              <CabResultLocationField
                value={from}
                onChange={(value) => {
                  setFrom(value);
                  setErrors((prev) => ({ ...prev, from: undefined }));
                }}
                placeholder="From city"
              />
            </FieldBox>

            <FieldBox label="Stops" dark helper={stopsText || "No stops added"}>
              <button
                type="button"
                onClick={() => setStopModalOpen(true)}
                className="text-[13px] font-bold text-sky-400 transition hover:text-sky-300"
              >
                + ADD STOPS
              </button>
            </FieldBox>

            <FieldBox label="To" dark error={errors.to}>
              <CabResultLocationField
                value={to}
                onChange={(value) => {
                  setTo(value);
                  setErrors((prev) => ({ ...prev, to: undefined }));
                }}
                placeholder="To city"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date"
              dark
              helper={departureDate ? formatDisplayDate(departureDate) : ""}
              error={errors.departureDate}
            >
              <CabResultDateField
                value={departureDate}
                onChange={(value) => {
                  setDepartureDate(value);
                  setErrors((prev) => ({ ...prev, departureDate: undefined }));
                }}
                placeholder="Select date"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Time"
              dark
              helper={pickupTime}
              error={errors.pickupTime}
            >
              <CabResultTimeField
                value={pickupTime}
                onChange={(value) => {
                  setPickupTime(value);
                  setErrors((prev) => ({ ...prev, pickupTime: undefined }));
                }}
                placeholder="10:00 AM"
              />
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {rideType === "outstationRoundTrip" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_0.95fr_135px_0.95fr_165px_165px_155px_155px_155px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="From" dark error={errors.from}>
              <CabResultLocationField
                value={from}
                onChange={(value) => {
                  setFrom(value);
                  setErrors((prev) => ({ ...prev, from: undefined }));
                }}
                placeholder="From city"
              />
            </FieldBox>

            <FieldBox label="Stops" dark helper={stopsText || "No stops added"}>
              <button
                type="button"
                onClick={() => setStopModalOpen(true)}
                className="text-[13px] font-bold text-sky-400 transition hover:text-sky-300"
              >
                + ADD STOPS
              </button>
            </FieldBox>

            <FieldBox label="To" dark error={errors.to}>
              <CabResultLocationField
                value={to}
                onChange={(value) => {
                  setTo(value);
                  setErrors((prev) => ({ ...prev, to: undefined }));
                }}
                placeholder="To city"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date"
              dark
              helper={departureDate ? formatDisplayDate(departureDate) : ""}
              error={errors.departureDate}
            >
              <CabResultDateField
                value={departureDate}
                onChange={(value) => {
                  setDepartureDate(value);
                  setErrors((prev) => ({ ...prev, departureDate: undefined }));
                }}
                placeholder="Select date"
              />
            </FieldBox>

            <FieldBox
              label="Drop Date"
              dark
              helper={returnDate ? formatDisplayDate(returnDate) : ""}
              error={errors.returnDate}
            >
              <CabResultDateField
                value={returnDate}
                onChange={(value) => {
                  setReturnDate(value);
                  setErrors((prev) => ({ ...prev, returnDate: undefined }));
                }}
                placeholder="Select return"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Time"
              dark
              helper={pickupTime}
              error={errors.pickupTime}
            >
              <CabResultTimeField
                value={pickupTime}
                onChange={(value) => {
                  setPickupTime(value);
                  setErrors((prev) => ({ ...prev, pickupTime: undefined }));
                }}
                placeholder="10:00 AM"
              />
            </FieldBox>

            <FieldBox
              label="Drop Time"
              dark
              helper={`till ${dropTime}`}
              error={errors.dropTime}
            >
              <CabResultTimeField
                value={dropTime}
                onChange={(value) => {
                  setDropTime(value);
                  setErrors((prev) => ({ ...prev, dropTime: undefined }));
                }}
                placeholder="09:45 PM"
              />
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {rideType === "airportTransfers" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_1fr_72px_1fr_180px_180px_170px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="Pickup" dark error={errors.pickup}>
              <CabResultLocationField
                value={pickup}
                onChange={(value) => {
                  setPickup(value);
                  setErrors((prev) => ({ ...prev, pickup: undefined }));
                }}
                placeholder="Pickup location"
              />
            </FieldBox>

            <SwapBox onClick={handleSwapPickupDrop} />

            <FieldBox label="To" dark error={errors.drop}>
              <CabResultLocationField
                value={drop}
                onChange={(value) => {
                  setDrop(value);
                  setErrors((prev) => ({ ...prev, drop: undefined }));
                }}
                placeholder="Drop location"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date"
              dark
              helper={departureDate ? formatDisplayDate(departureDate) : ""}
              error={errors.departureDate}
            >
              <CabResultDateField
                value={departureDate}
                onChange={(value) => {
                  setDepartureDate(value);
                  setErrors((prev) => ({ ...prev, departureDate: undefined }));
                }}
                placeholder="Select date"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Time"
              dark
              helper={pickupTime}
              error={errors.pickupTime}
            >
              <CabResultTimeField
                value={pickupTime}
                onChange={(value) => {
                  setPickupTime(value);
                  setErrors((prev) => ({ ...prev, pickupTime: undefined }));
                }}
                placeholder="10:00 AM"
              />
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {rideType === "hourlyRentals" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_1.1fr_180px_180px_1fr_170px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="Pickup" dark error={errors.pickup}>
              <CabResultLocationField
                value={pickup}
                onChange={(value) => {
                  setPickup(value);
                  setErrors((prev) => ({ ...prev, pickup: undefined }));
                }}
                placeholder="Pickup location"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date"
              dark
              helper={pickupDate ? formatDisplayDate(pickupDate) : ""}
              error={errors.pickupDate}
            >
              <CabResultDateField
                value={pickupDate}
                onChange={(value) => {
                  setPickupDate(value);
                  setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                }}
                placeholder="Select date"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Time"
              dark
              helper={pickupTime}
              error={errors.pickupTime}
            >
              <CabResultTimeField
                value={pickupTime}
                onChange={(value) => {
                  setPickupTime(value);
                  setErrors((prev) => ({ ...prev, pickupTime: undefined }));
                }}
                placeholder="10:00 AM"
              />
            </FieldBox>

            <FieldBox
              label="Package"
              dark
              helper={rentalPackage || "Select package"}
              error={errors.rentalPackage}
            >
              <input
                value={rentalPackage}
                onChange={(e) => {
                  setRentalPackage(e.target.value);
                  setErrors((prev) => ({ ...prev, rentalPackage: undefined }));
                }}
                placeholder="8 hrs 80 kms"
                className="w-full bg-transparent text-[15px] font-semibold text-white outline-none placeholder:text-slate-400"
              />
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {rideType === "carRental" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_1fr_72px_1fr_210px_210px_170px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="Pickup" dark error={errors.pickup}>
              <CabResultLocationField
                value={pickup}
                onChange={(value) => {
                  setPickup(value);
                  setErrors((prev) => ({ ...prev, pickup: undefined }));
                }}
                placeholder="Pickup location"
              />
            </FieldBox>

            <SwapBox onClick={handleSwapPickupDrop} />

            <FieldBox label="Drop" dark error={errors.drop}>
              <CabResultLocationField
                value={drop}
                onChange={(value) => {
                  setDrop(value);
                  setErrors((prev) => ({ ...prev, drop: undefined }));
                }}
                placeholder="Drop location"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date / Time"
              dark
              helper={pickupDate ? formatDisplayDate(pickupDate) : ""}
              error={errors.pickupDate || errors.pickupTime}
            >
              <div className="space-y-1 overflow-visible">
                <CabResultDateField
                  value={pickupDate}
                  onChange={(value) => {
                    setPickupDate(value);
                    setErrors((prev) => ({
                      ...prev,
                      pickupDate: undefined,
                    }));
                  }}
                  placeholder="Select date"
                />
                <CabResultTimeField
                  value={pickupTime}
                  onChange={(value) => {
                    setPickupTime(value);
                    setErrors((prev) => ({
                      ...prev,
                      pickupTime: undefined,
                    }));
                  }}
                  placeholder="10:00 AM"
                />
              </div>
            </FieldBox>

            <FieldBox
              label="Drop Date / Time"
              dark
              helper={departureDate ? formatDisplayDate(departureDate) : ""}
              error={errors.departureDate || errors.dropTime}
            >
              <div className="space-y-1 overflow-visible">
                <CabResultDateField
                  value={departureDate}
                  onChange={(value) => {
                    setDepartureDate(value);
                    setErrors((prev) => ({
                      ...prev,
                      departureDate: undefined,
                    }));
                  }}
                  placeholder="Select date"
                />
                <CabResultTimeField
                  value={dropTime}
                  onChange={(value) => {
                    setDropTime(value);
                    setErrors((prev) => ({
                      ...prev,
                      dropTime: undefined,
                    }));
                  }}
                  placeholder="09:45 PM"
                />
              </div>
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {rideType === "bikeRental" && (
          <div className="grid grid-cols-1 overflow-visible lg:grid-cols-[180px_1fr_72px_1fr_210px_210px_170px]">
            <TripTypeBox rideType={rideType} onChange={handleRideTypeChange} />

            <FieldBox label="Pickup" dark error={errors.pickup}>
              <CabResultLocationField
                value={pickup}
                onChange={(value) => {
                  setPickup(value);
                  setErrors((prev) => ({ ...prev, pickup: undefined }));
                }}
                placeholder="Pickup location"
              />
            </FieldBox>

            <SwapBox onClick={handleSwapPickupDrop} />

            <FieldBox label="Drop" dark error={errors.drop}>
              <CabResultLocationField
                value={drop}
                onChange={(value) => {
                  setDrop(value);
                  setErrors((prev) => ({ ...prev, drop: undefined }));
                }}
                placeholder="Drop location"
              />
            </FieldBox>

            <FieldBox
              label="Pick-Up Date / Time"
              dark
              helper={pickupDate ? formatDisplayDate(pickupDate) : ""}
              error={errors.pickupDate || errors.pickupTime}
            >
              <div className="space-y-1 overflow-visible">
                <CabResultDateField
                  value={pickupDate}
                  onChange={(value) => {
                    setPickupDate(value);
                    setErrors((prev) => ({
                      ...prev,
                      pickupDate: undefined,
                    }));
                  }}
                  placeholder="Select date"
                />
                <CabResultTimeField
                  value={pickupTime}
                  onChange={(value) => {
                    setPickupTime(value);
                    setErrors((prev) => ({
                      ...prev,
                      pickupTime: undefined,
                    }));
                  }}
                  placeholder="10:00 AM"
                />
              </div>
            </FieldBox>

            <FieldBox
              label="Drop Date / Time"
              dark
              helper={departureDate ? formatDisplayDate(departureDate) : ""}
              error={errors.departureDate || errors.dropTime}
            >
              <div className="space-y-1 overflow-visible">
                <CabResultDateField
                  value={departureDate}
                  onChange={(value) => {
                    setDepartureDate(value);
                    setErrors((prev) => ({
                      ...prev,
                      departureDate: undefined,
                    }));
                  }}
                  placeholder="Select date"
                />
                <CabResultTimeField
                  value={dropTime}
                  onChange={(value) => {
                    setDropTime(value);
                    setErrors((prev) => ({
                      ...prev,
                      dropTime: undefined,
                    }));
                  }}
                  placeholder="09:45 PM"
                />
              </div>
            </FieldBox>

            <SearchBox onSearch={handleSearch} />
          </div>
        )}

        {showStops && stopsText ? (
          <div className="border-t border-slate-700 bg-[#0f172a] px-4 py-2 text-[12px] text-slate-300">
            <span className="font-semibold text-white">Stops:</span> {stopsText}
          </div>
        ) : null}
      </div>

      <CabResultStopsModal
        open={stopModalOpen && showStops}
        stops={stops}
        onClose={() => setStopModalOpen(false)}
        onChangeStop={updateStop}
        onAddStop={addStop}
        onRemoveStop={removeStop}
      />
    </>
  );
}

function TripTypeBox({
  rideType,
  onChange,
}: {
  rideType: CabRideType;
  onChange: (value: CabRideType) => void;
}) {
  return (
    <FieldBox label="Trip Type" dark>
      <select
        value={rideType}
        onChange={(e) => onChange(e.target.value as CabRideType)}
        className="w-full bg-transparent text-[15px] font-semibold text-white outline-none"
      >
        {RIDE_TYPE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value} className="text-black">
            {item.label}
          </option>
        ))}
      </select>
    </FieldBox>
  );
}

function SwapBox({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center justify-center border-r border-slate-700 bg-[#111827] px-2 py-2">
      <button
        type="button"
        onClick={onClick}
        className="flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-slate-700 bg-[#0b1220] text-sky-400 transition hover:border-sky-500/40 hover:bg-[#111a2c]"
        aria-label="Swap locations"
      >
        <ArrowLeftRight size={16} />
      </button>
    </div>
  );
}

function SearchBox({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex items-center justify-center border-l border-slate-700 bg-[#111827] px-3 py-2">
      <button
        type="button"
        onClick={onSearch}
        className="h-[46px] w-full rounded-xl bg-sky-500 px-4 text-[14px] font-extrabold text-white transition hover:bg-sky-600"
      >
        SEARCH
      </button>
    </div>
  );
}

function FieldBox({
  label,
  children,
  helper,
  error,
  dark = false,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
  error?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`min-w-0 overflow-visible border-r px-3 py-2 ${
        dark ? "border-slate-700 bg-[#111827]" : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${
          dark ? "text-sky-400" : "text-slate-500"
        }`}
      >
        {label}
      </div>

      <div className="overflow-visible">{children}</div>

      {error ? (
        <div className="mt-1 text-[11px] font-semibold text-red-400">
          {error}
        </div>
      ) : helper ? (
        <div
          className={`mt-1 truncate text-[11px] ${
            dark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}