import assert from "node:assert/strict";
import test from "node:test";
import {
  getPhoneCountry,
  isNationalPhoneValid,
  sanitizePhoneDigits,
  splitDisplayMobile,
  toBackendMobile,
  toDisplayMobile,
} from "./mobileIdentity";

test("India partner mobile uses the same backend-normalized ten digit format as login", () => {
  const india = getPhoneCountry("IN");

  assert.equal(india.dialCode, "91");
  assert.equal(isNationalPhoneValid("9876543210", india), true);
  assert.equal(toBackendMobile("98765 43210", india), "9876543210");
  assert.equal(toDisplayMobile("98765 43210", india), "+919876543210");
});

test("non-India partner mobile keeps global calling code support", () => {
  const singapore = getPhoneCountry("SG");

  assert.equal(singapore.dialCode, "65");
  assert.equal(isNationalPhoneValid("81234567", singapore), true);
  assert.equal(toBackendMobile("8123 4567", singapore), "6581234567");
  assert.equal(toDisplayMobile("8123 4567", singapore), "+6581234567");
});

test("display mobile parsing supports saved E.164 values", () => {
  assert.deepEqual(splitDisplayMobile("+919876543210"), { countryCode: "IN", nationalMobile: "9876543210" });
  assert.deepEqual(splitDisplayMobile("+6581234567"), { countryCode: "SG", nationalMobile: "81234567" });
  assert.equal(sanitizePhoneDigits("+91 98765-43210"), "919876543210");
});
