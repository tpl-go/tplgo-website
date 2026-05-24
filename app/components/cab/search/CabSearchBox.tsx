"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import type {
  CabRideType,
  CabSearchFormState,
  CabLocationItem,
  CabRentalPackage,
} from "@/app/lib/cab/cabSearchTypes";

import {
  buildCabSearchPayload,
  canAddMoreStops,
  createEmptyCabStop,
  getCabSearchRoute,
  getDefaultCabSearchFormState,
  swapCabLocations,
} from "@/app/lib/cab/cabSearchHelpers";

import CabRideTypeTabs from "./CabRideTypeTabs";
import CabDateField from "./CabDateField";
import CabTimeField from "./CabTimeField";
import CabAddStopsSection from "./CabAddStopsSection";
import CabPackageField from "./CabPackageField";
import CabSearchButton from "./CabSearchButton";
import CabLocationSelector from "./CabLocationSelector";
import CabDateFieldCompactNoIcon from "./CabDateFieldCompactNoIcon";
import CabTimeFieldCompactNoIcon from "./CabTimeFieldCompactNoIcon";
import CarRentalSearchFields from "./CarRentalSearchFields";
import BikeRentalSearchFields from "./BikeRentalSearchFields";

export default function CabSearchBox() {
  const router = useRouter();

  const [form, setForm] = useState<CabSearchFormState>(
    getDefaultCabSearchFormState()
  );

  function updateRideType(rideType: CabRideType) {
    const defaultForm = getDefaultCabSearchFormState();

    setForm({
      ...defaultForm,
      rideType,
      rentalPackage:
        rideType === "hourlyRentals" ? defaultForm.rentalPackage : null,
    });
  }

  function updateFromLocation(location: CabLocationItem | null) {
    setForm((prev) => ({ ...prev, fromLocation: location }));
  }

  function updateToLocation(location: CabLocationItem | null) {
    setForm((prev) => ({ ...prev, toLocation: location }));
  }

  function updatePickupLocation(location: CabLocationItem | null) {
    setForm((prev) => ({ ...prev, pickupLocation: location }));
  }

  function updateDropLocation(location: CabLocationItem | null) {
    setForm((prev) => ({ ...prev, dropLocation: location }));
  }

  function updateDepartureDate(date: Date | null) {
    setForm((prev) => ({ ...prev, departureDate: date }));
  }

  function updateReturnDate(date: Date | null) {
    setForm((prev) => ({ ...prev, returnDate: date }));
  }

  function updatePickupDate(date: Date | null) {
    setForm((prev) => ({ ...prev, pickupDate: date }));
  }

  function updatePickupTime(time: string) {
    setForm((prev) => ({ ...prev, pickupTime: time }));
  }

  function updateDropTime(time: string) {
    setForm((prev) => ({ ...prev, dropTime: time }));
  }

  function updateRentalPackage(pkg: CabRentalPackage | null) {
    setForm((prev) => ({ ...prev, rentalPackage: pkg }));
  }

  function handleSwapLocations() {
    setForm((prev) => swapCabLocations(prev));
  }

  function handleSwapAirportLocations() {
    setForm((prev) => ({
      ...prev,
      pickupLocation: prev.dropLocation,
      dropLocation: prev.pickupLocation,
    }));
  }

  function handleAddStop() {
    setForm((prev) => {
      if (!canAddMoreStops(prev.stops)) return prev;

      return {
        ...prev,
        stops: [...prev.stops, createEmptyCabStop(prev.stops.length + 1)],
      };
    });
  }

  function handleRemoveStop(stopId: string) {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((stop) => stop.id !== stopId),
    }));
  }

  function handleUpdateStopLocation(
    stopId: string,
    location: CabLocationItem | null
  ) {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) =>
        stop.id === stopId ? { ...stop, location } : stop
      ),
    }));
  }

  function validateCabSearch() {
    if (form.rideType === "outstationOneWay") {
      if (
        !form.fromLocation ||
        !form.toLocation ||
        !form.departureDate ||
        !form.pickupTime
      ) {
        alert("Please fill From, To, Departure Date and Pickup Time");
        return false;
      }
    }

    if (form.rideType === "outstationRoundTrip") {
      if (
        !form.fromLocation ||
        !form.toLocation ||
        !form.departureDate ||
        !form.returnDate ||
        !form.pickupTime ||
        !form.dropTime
      ) {
        alert(
          "Please fill From, To, Departure, Return, Pickup Time and Drop Time"
        );
        return false;
      }
    }

    if (form.rideType === "airportTransfers") {
      if (
        !form.pickupLocation ||
        !form.dropLocation ||
        !form.departureDate ||
        !form.pickupTime
      ) {
        alert("Please fill Pickup, Drop, Date and Pickup Time");
        return false;
      }
    }

    if (form.rideType === "hourlyRentals") {
      if (
        !form.pickupLocation ||
        !form.pickupDate ||
        !form.pickupTime ||
        !form.rentalPackage
      ) {
        alert(
          "Please fill Pickup Location, Pickup Date, Pickup Time and Package"
        );
        return false;
      }
    }

    if (form.rideType === "carRental") {
      if (
        !form.pickupLocation ||
        !form.dropLocation ||
        !form.pickupDate ||
        !form.departureDate ||
        !form.pickupTime ||
        !form.dropTime
      ) {
        alert(
          "Please fill Pickup Location, Pickup Date, Pickup Time, Drop Location, Drop Date and Drop Time"
        );
        return false;
      }
    }

    if (form.rideType === "bikeRental") {
      if (
        !form.pickupLocation ||
        !form.dropLocation ||
        !form.pickupDate ||
        !form.departureDate ||
        !form.pickupTime ||
        !form.dropTime
      ) {
        alert(
          "Please fill Pickup Location, Pickup Date, Pickup Time, Drop Location, Drop Date and Drop Time"
        );
        return false;
      }
    }

    return true;
  }

  function getCabSearchButtonLabel() {
    if (form.rideType === "bikeRental") return "Search Bikes";
    if (form.rideType === "carRental") return "Search Cars";
    return "Search Cabs";
  }

  function handleSearch() {
    const isValid = validateCabSearch();
    if (!isValid) return;

    const payload = buildCabSearchPayload(form);
    const params = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
        return;
      }

      if (value) params.set(key, value);
    });

    router.push(`${getCabSearchRoute(form.rideType)}?${params.toString()}`);
  }

  const swapButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-orange-50";

  const addStopButtonClass = `inline-flex h-[42px] items-center gap-2 rounded-full border px-4 text-[13px] font-extrabold ${
    form.stops.length >= 5
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
      : "border-orange-300 bg-white/80 text-orange-600 hover:bg-orange-50"
  }`;

  return (
    <div className="mt-4 md:mt-7 w-full rounded-[24px] md:rounded-[26px] border border-white/45 bg-white/20 px-3 md:px-5 pt-3 pb-5 md:pb-7 shadow-xl backdrop-blur-md">
      {/* Desktop Search Type Tabs — untouched */}
<div className="hidden md:block">
  <CabRideTypeTabs
    activeRideType={form.rideType}
    onChange={updateRideType}
  />
</div>

{/* Mobile Search Type Dropdown */}
<div className="md:hidden">
  <label className="mb-1 block text-[11px] font-extrabold text-white">
    Cab Search Type
  </label>

  <select
    value={form.rideType}
    onChange={(e) => updateRideType(e.target.value as CabRideType)}
    className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
  >
    <option value="outstationOneWay">Outstation One Way</option>
    <option value="outstationRoundTrip">Outstation Round Trip</option>
    <option value="airportTransfers">Airport Transfers</option>
    <option value="hourlyRentals">Hourly Rentals</option>
    <option value="carRental">Car Rental</option>
    <option value="bikeRental">Bike Rental</option>
  </select>
</div>

      <div className="mt-3 space-y-3">
        {form.rideType === "outstationOneWay" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr_190px_190px] items-center gap-3 overflow-visible">
              <CabLocationSelector
                label="From"
                value={form.fromLocation}
                onChange={updateFromLocation}
                placeholder="Pickup city"
                excludeId={form.toLocation?.id}
                compact
              />

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className={swapButtonClass}
                  aria-label="Swap locations"
                >
                  ⇄
                </button>
              </div>

              <CabLocationSelector
                label="To"
                value={form.toLocation}
                onChange={updateToLocation}
                placeholder="Drop city"
                excludeId={form.fromLocation?.id}
                compact
              />

              <CabDateField
                label="Departure"
                value={form.departureDate}
                onChange={updateDepartureDate}
                compact
              />

              <CabTimeField
                label="Pick up time"
                value={form.pickupTime}
                onChange={updatePickupTime}
                compact
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr_320px] md:items-start">
              <div className="flex flex-col items-start gap-3">
                <button
                  type="button"
                  onClick={handleAddStop}
                  disabled={form.stops.length >= 5}
                  className={addStopButtonClass}
                >
                  <Plus size={16} />
                  Add Stop
                  <span className="text-slate-400">
                    ({form.stops.length}/5)
                  </span>
                </button>

                <CabAddStopsSection
                  stops={form.stops}
                  onRemoveStop={handleRemoveStop}
                  onUpdateStopLocation={handleUpdateStopLocation}
                  compact
                />
              </div>

              <div className="flex justify-center">
                <div className="w-full md:w-auto">
                  <CabSearchButton
                    onClick={handleSearch}
                    compact
                    label={getCabSearchButtonLabel()}
                  />
                </div>
              </div>

              <div />
            </div>
          </>
        )}

        {form.rideType === "outstationRoundTrip" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr_150px_150px_150px_150px] items-center gap-3 overflow-visible">
              <CabLocationSelector
                label="From"
                value={form.fromLocation}
                onChange={updateFromLocation}
                placeholder="Pickup city"
                excludeId={form.toLocation?.id}
                compact
              />

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className={swapButtonClass}
                  aria-label="Swap locations"
                >
                  ⇄
                </button>
              </div>

              <CabLocationSelector
                label="To"
                value={form.toLocation}
                onChange={updateToLocation}
                placeholder="Drop city"
                excludeId={form.fromLocation?.id}
                compact
              />

              <CabDateFieldCompactNoIcon
                label="Departure"
                value={form.departureDate}
                onChange={updateDepartureDate}
              />

              <CabDateFieldCompactNoIcon
                label="Return"
                value={form.returnDate}
                onChange={updateReturnDate}
              />

              <CabTimeFieldCompactNoIcon
                label="Pick up time"
                value={form.pickupTime}
                onChange={updatePickupTime}
              />

              <CabTimeFieldCompactNoIcon
                label="Drop Time"
                value={form.dropTime}
                onChange={updateDropTime}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr_320px] md:items-start">
              <div className="flex flex-col items-start gap-3">
                <button
                  type="button"
                  onClick={handleAddStop}
                  disabled={form.stops.length >= 5}
                  className={addStopButtonClass}
                >
                  <Plus size={16} />
                  Add Stop
                  <span className="text-slate-400">
                    ({form.stops.length}/5)
                  </span>
                </button>

                <CabAddStopsSection
                  stops={form.stops}
                  onRemoveStop={handleRemoveStop}
                  onUpdateStopLocation={handleUpdateStopLocation}
                  compact
                />
              </div>

              <div className="flex justify-center">
                <div className="w-full md:w-auto">
                  <CabSearchButton
                    onClick={handleSearch}
                    compact
                    label={getCabSearchButtonLabel()}
                  />
                </div>
              </div>

              <div />
            </div>
          </>
        )}

        {form.rideType === "airportTransfers" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr_190px_190px] items-center gap-3 overflow-visible">
              <CabLocationSelector
                label="Pickup"
                value={form.pickupLocation}
                onChange={updatePickupLocation}
                placeholder="Pickup location"
                excludeId={form.dropLocation?.id}
                compact
              />

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSwapAirportLocations}
                  className={swapButtonClass}
                  aria-label="Swap locations"
                >
                  ⇄
                </button>
              </div>

              <CabLocationSelector
                label="Drop"
                value={form.dropLocation}
                onChange={updateDropLocation}
                placeholder="Drop location"
                excludeId={form.pickupLocation?.id}
                compact
              />

              <CabDateFieldCompactNoIcon
                label="Departure"
                value={form.departureDate}
                onChange={updateDepartureDate}
              />

              <CabTimeFieldCompactNoIcon
                label="Pick up time"
                value={form.pickupTime}
                onChange={updatePickupTime}
              />
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-full md:w-auto">
                <CabSearchButton
                  onClick={handleSearch}
                  compact
                  label={getCabSearchButtonLabel()}
                />
              </div>
            </div>
          </>
        )}

        {form.rideType === "hourlyRentals" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_190px_190px_220px] items-center gap-3 overflow-visible">
              <CabLocationSelector
                label="Pickup Location"
                value={form.pickupLocation}
                onChange={updatePickupLocation}
                placeholder="Enter pickup location"
                compact
              />

              <CabDateFieldCompactNoIcon
                label="Pickup Date"
                value={form.pickupDate}
                onChange={updatePickupDate}
              />

              <CabTimeFieldCompactNoIcon
                label="Pick up time"
                value={form.pickupTime}
                onChange={updatePickupTime}
              />

              <CabPackageField
                value={form.rentalPackage}
                onChange={updateRentalPackage}
                compact
              />
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-full md:w-auto">
                <CabSearchButton
                  onClick={handleSearch}
                  compact
                  label={getCabSearchButtonLabel()}
                />
              </div>
            </div>
          </>
        )}

        {form.rideType === "carRental" && (
          <>
            <div className="overflow-visible">
              <CarRentalSearchFields
                pickupLocation={form.pickupLocation}
                dropLocation={form.dropLocation}
                pickupDate={form.pickupDate}
                dropDate={form.departureDate}
                pickupTime={form.pickupTime}
                dropTime={form.dropTime}
                onChangePickupLocation={updatePickupLocation}
                onChangeDropLocation={updateDropLocation}
                onChangePickupDate={updatePickupDate}
                onChangeDropDate={updateDepartureDate}
                onChangePickupTime={updatePickupTime}
                onChangeDropTime={updateDropTime}
              />
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-full md:w-auto">
                <CabSearchButton
                  onClick={handleSearch}
                  compact
                  label={getCabSearchButtonLabel()}
                />
              </div>
            </div>
          </>
        )}

        {form.rideType === "bikeRental" && (
          <>
            <div className="overflow-visible">
              <BikeRentalSearchFields
                pickupLocation={form.pickupLocation}
                dropLocation={form.dropLocation}
                pickupDate={form.pickupDate}
                dropDate={form.departureDate}
                pickupTime={form.pickupTime}
                dropTime={form.dropTime}
                onChangePickupLocation={updatePickupLocation}
                onChangeDropLocation={updateDropLocation}
                onChangePickupDate={updatePickupDate}
                onChangeDropDate={updateDepartureDate}
                onChangePickupTime={updatePickupTime}
                onChangeDropTime={updateDropTime}
              />
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-full md:w-auto">
                <CabSearchButton
                  onClick={handleSearch}
                  compact
                  label={getCabSearchButtonLabel()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}