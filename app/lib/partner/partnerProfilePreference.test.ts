import { expect, test } from "vitest";
import { clearPartnerProfilePreference, readPartnerProfilePreference, rememberPartnerProfile, withPartnerProfile } from "./partnerProfilePreference";

const first = "11111111-1111-4111-8111-111111111111";
const values = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { search: "" }, sessionStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } } });

test("remembered Partner profile contains only an ID and is appended as a server-revalidated preference", () => {
  clearPartnerProfilePreference();
  rememberPartnerProfile(first);
  expect(readPartnerProfilePreference()).toBe(first);
  expect([...values.values()]).toEqual([first]);
  expect(withPartnerProfile("/api/v1/partner/application/draft")).toBe(`/api/v1/partner/application/draft?organizationId=${first}`);
});

test("invalid preferences fail closed and logout cleanup can remove them", () => {
  values.set("tpl_partner_profile_preference_v1", "not-an-organization");
  expect(readPartnerProfilePreference()).toBeNull();
  clearPartnerProfilePreference();
  expect(values.size).toBe(0);
});
