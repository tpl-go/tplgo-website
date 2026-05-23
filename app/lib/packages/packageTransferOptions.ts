import type { PackageTransferOption } from "./packageSelectionTypes";

export function getPackageTransferOptions(): PackageTransferOption[] {
  return [
    {
      id: "trf-1",
      vehicleType: "Shared",
      title: "Included Shared Transfer",
      subtitle: "Airport / Intercity shared basis",
      seats: 1,
      luggage: 1,
      fareDiff: 0,
      included: true,
    },
    {
      id: "trf-2",
      vehicleType: "Sedan",
      title: "Private Sedan Transfer",
      subtitle: "Ideal for couple / 2 adults",
      seats: 4,
      luggage: 2,
      fareDiff: 1800,
      included: false,
    },
    {
      id: "trf-3",
      vehicleType: "SUV",
      title: "Private SUV Transfer",
      subtitle: "More comfort and luggage space",
      seats: 6,
      luggage: 4,
      fareDiff: 3200,
      included: false,
    },
  ];
}