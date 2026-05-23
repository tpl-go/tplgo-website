import type { CabLocationItem, CabRentalPackage } from "./cabSearchTypes";

export const CAB_LOCATION_OPTIONS: CabLocationItem[] = [
  {
    id: "loc-1",
    city: "Mumbai",
    code: "BOM",
    label: "Mumbai, Maharashtra",
    type: "city",
  },
  {
    id: "loc-2",
    city: "Pune",
    code: "PNQ",
    label: "Pune, Maharashtra",
    type: "city",
  },
  {
    id: "loc-3",
    city: "Delhi",
    code: "DEL",
    label: "Delhi",
    type: "city",
  },
  {
    id: "loc-4",
    city: "Indore",
    code: "IDR",
    label: "Indore, Madhya Pradesh",
    type: "city",
  },
  {
    id: "loc-5",
    city: "Ujjain",
    label: "Ujjain, Madhya Pradesh",
    type: "city",
  },
  {
    id: "loc-6",
    city: "Bangalore",
    code: "BLR",
    label: "Bangalore, Karnataka",
    type: "city",
  },
  {
    id: "loc-7",
    city: "Mumbai Airport",
    code: "BOM",
    label: "Chhatrapati Shivaji Maharaj International Airport",
    type: "airport",
  },
  {
    id: "loc-8",
    city: "Delhi Airport",
    code: "DEL",
    label: "Indira Gandhi International Airport",
    type: "airport",
  },
  {
    id: "loc-9",
    city: "Pune Airport",
    code: "PNQ",
    label: "Pune International Airport",
    type: "airport",
  },
  {
    id: "loc-10",
    city: "Bangalore Airport",
    code: "BLR",
    label: "Kempegowda International Airport",
    type: "airport",
  },
];

export const CAB_RENTAL_PACKAGES: CabRentalPackage[] = [
  {
    id: "pkg-1",
    label: "1 hr 10 kms",
    hours: 1,
    kms: 10,
  },
  {
    id: "pkg-2",
    label: "2 hrs 20 kms",
    hours: 2,
    kms: 20,
  },
  {
    id: "pkg-3",
    label: "4 hrs 40 kms",
    hours: 4,
    kms: 40,
  },
  {
    id: "pkg-4",
    label: "8 hrs 80 kms",
    hours: 8,
    kms: 80,
  },
  {
    id: "pkg-5",
    label: "12 hrs 120 kms",
    hours: 12,
    kms: 120,
  },
];