import { describe, expect, it } from "vitest";
import { partnerSupplyHistorySource, partnerSupplyHistoryTitle } from "./partnerSupplyHistory";

describe("Partner supply history presentation", () => {
  it("shows a safe customer-facing origin for canonical client surfaces", () => {
    expect(partnerSupplyHistorySource({ clientSurface: "mobile" })).toBe("Mobile Partner Desk");
    expect(partnerSupplyHistorySource({ clientSurface: "website" })).toBe("Website Partner Desk");
    expect(partnerSupplyHistorySource({ clientSurface: "admin" })).toBe("TPL Admin");
  });

  it("does not expose an unknown raw origin", () => {
    expect(partnerSupplyHistorySource({ clientSurface: "private-worker-name" })).toBe("Partner Desk");
    expect(partnerSupplyHistorySource({})).toBe("Partner Desk");
  });

  it("uses readable action and version labels", () => {
    expect(partnerSupplyHistoryTitle({ entityType: "availability", action: "updated", version: 2, summary: {}, at: "2026-09-21T00:00:00Z" })).toBe("Availability updated · version 2");
  });
});
