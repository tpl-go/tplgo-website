export type CountryMasterEntry = {
  countryCode: string;
  displayName: string;
  callingCode: string;
  flag: string;
  active: boolean;
  partnerOnboardingSupported: "supported" | "restricted" | "unavailable";
  addressRegionLabel: string;
  postalCodeLabel: string;
  postalCodeRequired: boolean;
  defaultCurrency: string;
};

export const countryMaster: CountryMasterEntry[] = [
  country("IN", "India", "+91", "🇮🇳", "supported", "State / UT", "Postal / PIN Code", true, "INR"),
  country("AE", "United Arab Emirates", "+971", "🇦🇪", "supported", "Emirate", "Postal / ZIP Code", false, "AED"),
  country("US", "United States", "+1", "🇺🇸", "restricted", "State", "ZIP Code", true, "USD"),
  country("CA", "Canada", "+1", "🇨🇦", "restricted", "Province", "Postal Code", true, "CAD"),
  country("GB", "United Kingdom", "+44", "🇬🇧", "restricted", "County / Region", "Postcode", true, "GBP"),
  country("AU", "Australia", "+61", "🇦🇺", "restricted", "State / Territory", "Postcode", true, "AUD"),
  country("SG", "Singapore", "+65", "🇸🇬", "restricted", "Region", "Postal Code", true, "SGD"),
  country("TH", "Thailand", "+66", "🇹🇭", "restricted", "Province", "Postal Code", true, "THB"),
  country("NP", "Nepal", "+977", "🇳🇵", "restricted", "Province", "Postal Code", false, "NPR"),
  country("BT", "Bhutan", "+975", "🇧🇹", "restricted", "District", "Postal Code", false, "BTN"),
];

export function activeCountries(): CountryMasterEntry[] {
  return countryMaster.filter((item) => item.active);
}

export function findCountry(countryCodeOrName: string | undefined): CountryMasterEntry {
  const normalized = (countryCodeOrName ?? "").trim().toLowerCase();
  return countryMaster.find((item) => item.countryCode.toLowerCase() === normalized || item.displayName.toLowerCase() === normalized) ?? countryMaster[0]!;
}

function country(
  countryCode: string,
  displayName: string,
  callingCode: string,
  flag: string,
  partnerOnboardingSupported: CountryMasterEntry["partnerOnboardingSupported"],
  addressRegionLabel: string,
  postalCodeLabel: string,
  postalCodeRequired: boolean,
  defaultCurrency: string
): CountryMasterEntry {
  return { countryCode, displayName, callingCode, flag, active: true, partnerOnboardingSupported, addressRegionLabel, postalCodeLabel, postalCodeRequired, defaultCurrency };
}
