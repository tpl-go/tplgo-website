export type CountryOption = { code: string; name: string; dialCode: string; minLength: number; maxLength: number; certifiedOtp: boolean };
export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "IN", name: "India", dialCode: "91", minLength: 10, maxLength: 10, certifiedOtp: true },
  { code: "US", name: "United States", dialCode: "1", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "GB", name: "United Kingdom", dialCode: "44", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "AE", name: "United Arab Emirates", dialCode: "971", minLength: 8, maxLength: 9, certifiedOtp: false },
  { code: "SG", name: "Singapore", dialCode: "65", minLength: 8, maxLength: 8, certifiedOtp: false },
  { code: "AU", name: "Australia", dialCode: "61", minLength: 9, maxLength: 9, certifiedOtp: false },
  { code: "CA", name: "Canada", dialCode: "1", minLength: 10, maxLength: 10, certifiedOtp: false },
  { code: "DE", name: "Germany", dialCode: "49", minLength: 10, maxLength: 11, certifiedOtp: false },
  { code: "FR", name: "France", dialCode: "33", minLength: 9, maxLength: 9, certifiedOtp: false },
  { code: "OTHER", name: "Other", dialCode: "", minLength: 6, maxLength: 15, certifiedOtp: false },
];
export function getCountry(code: string): CountryOption { return COUNTRY_OPTIONS.find((item) => item.code === code) || COUNTRY_OPTIONS[0]; }
