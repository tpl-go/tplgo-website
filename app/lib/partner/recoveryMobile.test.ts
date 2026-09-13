import { expect, test } from "vitest";
import { normalizeRecoveryMobile, recoveryMobilePaste } from "./recoveryMobile";

for (const input of ["9876543210", "98765 43210", "+91 98765 43210", "919876543210", "00919876543210"]) test(`India input normalizes once: ${input}`, () => {
  expect(normalizeRecoveryMobile(input)).toBe("+919876543210");
  expect(normalizeRecoveryMobile(normalizeRecoveryMobile(input)!)).toBe("+919876543210");
});
for (const [country, input, canonical] of [
  ["GB", "2079460000", "+442079460000"], ["IN", "+44 20 7946 0000", "+442079460000"],
  ["AE", "501234567", "+971501234567"], ["IN", "00971501234567", "+971501234567"],
  ["SG", "61234567", "+6561234567"], ["AU", "412345678", "+61412345678"],
  ["CA", "4165550100", "+14165550100"], ["US", "2025550100", "+12025550100"],
  ["DE", "3012345678", "+493012345678"], ["FR", "612345678", "+33612345678"],
  ["OTHER", "+819012345678", "+819012345678"],
]) test(`supported international input: ${country}/${input}`, () => expect(normalizeRecoveryMobile(input, country)).toBe(canonical));
for (const input of ["", "12345", "mobile", "9876543210 ext 4", "+91919876543210", "91919876543210", "++919876543210", "91+9876543210", "+919876543210999", "0000", "+4402079460000"]) test(`invalid input is rejected, never truncated: ${input}`, () => expect(normalizeRecoveryMobile(input)).toBeNull());
test("unknown dial codes need Other and an explicit international prefix", () => {
  expect(normalizeRecoveryMobile("+819012345678", "IN")).toBeNull();
  expect(normalizeRecoveryMobile("819012345678", "OTHER")).toBeNull();
});
test("international paste selects its country and preserves the national number", () => {
  expect(recoveryMobilePaste("+44 20 7946 0000", "IN")).toEqual({ countryCode: "GB", contact: "2079460000" });
  expect(recoveryMobilePaste("+1 416 555 0100", "CA")).toEqual({ countryCode: "CA", contact: "4165550100" });
  expect(recoveryMobilePaste("+819012345678", "OTHER")).toEqual({ countryCode: "OTHER", contact: "+819012345678" });
  expect(recoveryMobilePaste("+91919876543210", "IN")).toBeNull();
});
