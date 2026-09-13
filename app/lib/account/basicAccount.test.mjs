import { describe, it, expect, vi } from "vitest";
import { profileForm, profileInput, travellerForm, travellerInput } from "./basicAccount";
import { getSavedProfile } from "./profileStorage";
import { getSavedTravellers, seedAccountAndTravellerSafely } from "../booking/safeProfileSeed";
describe("basic personal details boundary", () => {
  it("never uploads sensitive fields or login identifiers from a form save", () => {
    const profile = { ...profileForm(null), firstName: "Single", passportNo: "synthetic-protected", panCard: "synthetic-protected", photo: "synthetic-photo" };
    const payload = profileInput(profile, 0);
    expect(payload).toMatchObject({ firstName: "Single", mobile: null, email: null, address: { countryCode: null, region: null, city: null } });
    expect(JSON.stringify(payload)).not.toContain("synthetic-protected"); expect(JSON.stringify(payload)).not.toContain("synthetic-photo");
    expect(travellerInput({ ...travellerForm(), firstName: "Single", mobile: "+442079460123", passportNo: "synthetic-document" }).mobile).toBe("+442079460123");
  });
  it("legacy booking reads and confirmation neither enumerate nor mutate ambiguous browser data", () => {
    const storage = { getItem: vi.fn(() => JSON.stringify({ firstName: "Other owner", passportNo: "synthetic-document" })), setItem: vi.fn(), removeItem: vi.fn(), key: vi.fn() };
    vi.stubGlobal("window", { localStorage: storage }); vi.stubGlobal("localStorage", storage);
    try {
      expect(getSavedProfile("synthetic-key").firstName).toBe(""); expect(getSavedTravellers("synthetic-key")).toEqual([]);
      expect(seedAccountAndTravellerSafely({ mobile: "synthetic-key", traveller: { firstName: "Guest" }, source: "flight" })).toBeNull();
      for (const operation of Object.values(storage)) expect(operation).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });
  it("selected booking snapshot stays independent from editable reusable form", () => {
    const reusable = travellerForm(); reusable.firstName = "Selected";
    const draft = structuredClone(travellerInput(reusable)); reusable.firstName = "Edited"; reusable.frequentFlyers.push({ id: 2, airline: "Synthetic", flyerNumber: "S1" });
    expect(draft.firstName).toBe("Selected"); expect(draft.metadata.frequentFlyers).toEqual([]);
  });
});
