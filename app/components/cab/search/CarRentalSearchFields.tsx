"use client";

import type { CabLocationItem } from "@/app/lib/cab/cabSearchTypes";
import CabLocationSelector from "./CabLocationSelector";
import CabDateFieldCompactNoIcon from "./CabDateFieldCompactNoIcon";
import CabTimeFieldCompactNoIcon from "./CabTimeFieldCompactNoIcon";

type Props = {
  pickupLocation: CabLocationItem | null;
  dropLocation: CabLocationItem | null;
  pickupDate: Date | null;
  dropDate: Date | null;
  pickupTime: string;
  dropTime: string;
  onChangePickupLocation: (location: CabLocationItem | null) => void;
  onChangeDropLocation: (location: CabLocationItem | null) => void;
  onChangePickupDate: (date: Date | null) => void;
  onChangeDropDate: (date: Date | null) => void;
  onChangePickupTime: (time: string) => void;
  onChangeDropTime: (time: string) => void;
};

export default function CarRentalSearchFields({
  pickupLocation,
  dropLocation,
  pickupDate,
  dropDate,
  pickupTime,
  dropTime,
  onChangePickupLocation,
  onChangeDropLocation,
  onChangePickupDate,
  onChangeDropDate,
  onChangePickupTime,
  onChangeDropTime,
}: Props) {
  return (
    <div className="grid grid-cols-[1.05fr_0.78fr_0.72fr_1.05fr_0.78fr_0.72fr] items-center gap-3 overflow-visible">
      <CabLocationSelector
        label="Pickup Location"
        value={pickupLocation}
        onChange={onChangePickupLocation}
        placeholder="Enter pickup location"
        excludeId={dropLocation?.id}
        compact
      />

      <CabDateFieldCompactNoIcon
        label="Pickup Date"
        value={pickupDate}
        onChange={onChangePickupDate}
      />

      <CabTimeFieldCompactNoIcon
        label="Pickup Time"
        value={pickupTime}
        onChange={onChangePickupTime}
      />

      <CabLocationSelector
        label="Drop Location"
        value={dropLocation}
        onChange={onChangeDropLocation}
        placeholder="Enter drop location"
        excludeId={pickupLocation?.id}
        compact
      />

      <CabDateFieldCompactNoIcon
        label="Drop Date"
        value={dropDate}
        onChange={onChangeDropDate}
      />

      <CabTimeFieldCompactNoIcon
        label="Drop Time"
        value={dropTime}
        onChange={onChangeDropTime}
      />
    </div>
  );
}