export type PhoneCountryOption = {
  code: string;
  name: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  certifiedOtp: boolean;
};

export const phoneCountryOptions: PhoneCountryOption[] = [
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

export function getPhoneCountry(code: string): PhoneCountryOption {
  return phoneCountryOptions.find((item) => item.code === code) || phoneCountryOptions[0];
}

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isNationalPhoneValid(value: string, country: PhoneCountryOption): boolean {
  const digits = sanitizePhoneDigits(value);
  return digits.length >= country.minLength && digits.length <= country.maxLength;
}

export function toBackendMobile(nationalMobile: string, country: PhoneCountryOption): string {
  const digits = sanitizePhoneDigits(nationalMobile);
  if (country.code === "IN" && digits.length === 10) return digits;
  return `${country.dialCode}${digits}`.replace(/\D/g, "").slice(0, 15);
}

export function toDisplayMobile(nationalMobile: string, country: PhoneCountryOption): string {
  const backendMobile = toBackendMobile(nationalMobile, country);
  return country.dialCode ? `+${backendMobile}` : backendMobile;
}

export function splitDisplayMobile(value: string): { countryCode: string; nationalMobile: string } {
  const digits = sanitizePhoneDigits(value);
  if (!digits) return { countryCode: "IN", nationalMobile: "" };

  const matches = phoneCountryOptions
    .filter((country) => country.dialCode && digits.startsWith(country.dialCode))
    .sort((a, b) => b.dialCode.length - a.dialCode.length);
  const matched = matches[0];
  if (!matched) return { countryCode: "OTHER", nationalMobile: digits };

  const nationalMobile = digits.slice(matched.dialCode.length);
  if (nationalMobile.length >= matched.minLength || value.trim().startsWith("+")) {
    return { countryCode: matched.code, nationalMobile: nationalMobile.slice(0, matched.maxLength) };
  }

  return { countryCode: "IN", nationalMobile: digits.slice(0, getPhoneCountry("IN").maxLength) };
}
