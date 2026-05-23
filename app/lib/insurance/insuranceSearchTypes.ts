export type InsuranceType =
  | "travel"
  | "international"
  | "domestic"
  | "student"
  | "senior"
  | "family"
  | "visa";

export type InsuranceTraveller = {
  id: string;
  label: string;
  age: number;
};

export type InsuranceSearchPayload = {
  insuranceType: InsuranceType;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: InsuranceTraveller[];
  coverageAmount: number;
  hasMedicalCondition: boolean;
  tripPurpose: string;
  source: "homepage";
};

export const INSURANCE_TYPE_OPTIONS: {
  label: string;
  value: InsuranceType;
  description: string;
}[] = [
  {
    label: "Travel Insurance",
    value: "travel",
    description: "Smart cover for your trip",
  },
  {
    label: "International",
    value: "international",
    description: "Global medical & travel cover",
  },
  {
    label: "Domestic",
    value: "domestic",
    description: "India travel protection",
  },
  {
    label: "Student",
    value: "student",
    description: "Long stay student cover",
  },
  {
    label: "Senior Citizen",
    value: "senior",
    description: "Age-friendly travel plans",
  },
  {
    label: "Family Trip",
    value: "family",
    description: "One policy for family travel",
  },
  {
    label: "Visa Insurance",
    value: "visa",
    description: "Visa compliant insurance",
  },
];

export const COVERAGE_OPTIONS = [
  50000,
  100000,
  250000,
  500000,
  1000000,
];