import { expect, test } from "vitest";
import { activeCountries, countryMaster, findCountry } from "./countryMaster";

test("country master exposes reusable partner onboarding country metadata", () => {
  const india = findCountry("IN");
  const uae = findCountry("United Arab Emirates");

  expect(india.displayName).toBe("India");
  expect(india.callingCode).toBe("+91");
  expect(india.partnerOnboardingSupported).toBe("supported");
  expect(india.addressRegionLabel).toBe("State / UT");
  expect(india.postalCodeRequired).toBe(true);

  expect(uae.countryCode).toBe("AE");
  expect(uae.postalCodeRequired).toBe(false);
});

test("country master keeps existence separate from onboarding support", () => {
  expect(countryMaster.some((item) => item.partnerOnboardingSupported === "restricted")).toBe(true);
  expect(activeCountries().length).toBe(countryMaster.length);
});
