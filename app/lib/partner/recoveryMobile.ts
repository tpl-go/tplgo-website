import { COUNTRY_OPTIONS, getCountry, type CountryOption } from "../auth/mobileCountries";

const validNational = (digits: string, country: CountryOption) => digits.length >= country.minLength && digits.length <= country.maxLength;
// Recovery submits one canonical international identifier. An explicit pasted
// international prefix wins over the selected country; never truncate a contact.
export function normalizeRecoveryMobile(value: string, countryCode = "IN"): string | null {
  const raw = value.trim();
  if (!raw || !/^(?:\+|00)?[\d ()-]+$/.test(raw)) return null;
  const selected = getCountry(countryCode);
  let digits = raw.replace(/\D/g, "");
  const international = raw.startsWith("+") || raw.startsWith("00");
  if (raw.startsWith("00")) digits = digits.slice(2);
  if (international) {
    const country = COUNTRY_OPTIONS.filter((item) => item.dialCode && digits.startsWith(item.dialCode)).sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
    if (country && !validNational(digits.slice(country.dialCode.length), country)) return null;
    if (!country && selected.code !== "OTHER") return null;
  } else if (selected.code === "OTHER") {
    return null; // Unknown dial codes require an explicit + or 00 prefix.
  } else if (!(digits.startsWith(selected.dialCode) && validNational(digits.slice(selected.dialCode.length), selected))) {
    if (!validNational(digits, selected)) return null;
    digits = selected.dialCode + digits;
  }
  return /^[1-9]\d{9,14}$/.test(digits) ? `+${digits}` : null;
}

export function recoveryMobilePaste(value: string, countryCode: string) {
  const canonical = normalizeRecoveryMobile(value, countryCode);
  if (!canonical) return null;
  const selected = getCountry(countryCode);
  const matches = COUNTRY_OPTIONS.filter((item) => item.dialCode && canonical.slice(1).startsWith(item.dialCode)).sort((a, b) => b.dialCode.length - a.dialCode.length);
  const country = matches.find((item) => item.code === selected.code) ?? matches[0];
  return country ? { countryCode: country.code, contact: canonical.slice(country.dialCode.length + 1) } : { countryCode: "OTHER", contact: canonical };
}
