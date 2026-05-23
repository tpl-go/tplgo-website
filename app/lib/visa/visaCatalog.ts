export type VisaOption = {
  id: string;
  country: string;
  nationality: string;
  visaType: "Tourist" | "Business" | "Student" | "Transit";
  title: string;
  processingTime: string;
  validity: string;
  stayDuration: string;
  entryType: string;
  embassyFee: number;
  serviceFee: number;
  totalPrice: number;
  documents: string[];
  notes: string[];
};

export const visaCatalog: VisaOption[] = [
  {
    id: "uae-tourist-30",
    country: "United Arab Emirates",
    nationality: "India",
    visaType: "Tourist",
    title: "UAE Tourist Visa - 30 Days",
    processingTime: "3 - 5 working days",
    validity: "60 days from issue",
    stayDuration: "30 days",
    entryType: "Single Entry",
    embassyFee: 6500,
    serviceFee: 1499,
    totalPrice: 7999,
    documents: [
      "Passport front and back page",
      "Passport size photo",
      "Confirmed travel date",
      "Mobile number and email",
    ],
    notes: [
      "Visa approval depends on immigration authority.",
      "Processing time may change during holidays.",
    ],
  },
  {
    id: "uae-tourist-60",
    country: "United Arab Emirates",
    nationality: "India",
    visaType: "Tourist",
    title: "UAE Tourist Visa - 60 Days",
    processingTime: "4 - 6 working days",
    validity: "60 days from issue",
    stayDuration: "60 days",
    entryType: "Single Entry",
    embassyFee: 10500,
    serviceFee: 1999,
    totalPrice: 12499,
    documents: [
      "Passport front and back page",
      "Passport size photo",
      "Confirmed travel date",
      "Mobile number and email",
    ],
    notes: [
      "Overstay penalties apply as per UAE immigration rules.",
      "Final decision is subject to immigration approval.",
    ],
  },
  {
    id: "singapore-tourist",
    country: "Singapore",
    nationality: "India",
    visaType: "Tourist",
    title: "Singapore Tourist Visa",
    processingTime: "5 - 7 working days",
    validity: "Up to 2 years",
    stayDuration: "As per immigration approval",
    entryType: "Multiple Entry",
    embassyFee: 2500,
    serviceFee: 1499,
    totalPrice: 3999,
    documents: [
      "Passport copy",
      "Photo with white background",
      "Bank statement",
      "Hotel booking",
      "Flight ticket",
    ],
    notes: [
      "Visa validity is decided by embassy.",
      "Additional documents may be requested.",
    ],
  },
];

export function searchVisaOptions(params: {
  country?: string;
  nationality?: string;
  visaType?: string;
}) {
  return visaCatalog.filter((item) => {
    const countryMatch = params.country
      ? item.country === params.country
      : true;

    const nationalityMatch = params.nationality
      ? item.nationality === params.nationality
      : true;

    const typeMatch = params.visaType
      ? item.visaType === params.visaType
      : true;

    return countryMatch && nationalityMatch && typeMatch;
  });
}