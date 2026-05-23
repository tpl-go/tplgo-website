import type { PackageFlightOption } from "./packageSelectionTypes";

export function getPackageFlightOptions(params: {
  originCity: string;
  destinationCity: string;
  travelDate: string;
}): PackageFlightOption[] {
  const { originCity, destinationCity } = params;

  return [
    {
      id: "flt-1",
      airline: "IndiGo",
      from: originCity,
      to: destinationCity,
      departureTime: "06:10",
      arrivalTime: "08:45",
      duration: "2h 35m",
      fareDiff: 0,
      included: true,
    },
    {
      id: "flt-2",
      airline: "Air India",
      from: originCity,
      to: destinationCity,
      departureTime: "09:30",
      arrivalTime: "12:05",
      duration: "2h 35m",
      fareDiff: 1800,
      included: false,
    },
    {
      id: "flt-3",
      airline: "Akasa Air",
      from: originCity,
      to: destinationCity,
      departureTime: "14:15",
      arrivalTime: "16:50",
      duration: "2h 35m",
      fareDiff: 950,
      included: false,
    },
  ];
}