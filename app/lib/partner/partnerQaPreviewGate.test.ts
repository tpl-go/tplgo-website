// @ts-nocheck
import { describe, expect, it } from "vitest";
import { isPartnerQaPreviewEnabled, isPartnerQaPreviewRequested } from "./partnerQaPreviewGate";

describe("partner QA preview gate", () => {
  it("requires the explicit staging flag", () => {
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "false",
      vercelEnv: "preview",
      host: "staging.tplgo.com",
      apiBaseUrl: "https://api-staging.tplgo.com",
    })).toBe(false);
  });

  it("is enabled for staging host and staging API only", () => {
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "true",
      vercelEnv: "preview",
      host: "staging.tplgo.com",
      apiBaseUrl: "https://api-staging.tplgo.com",
    })).toBe(true);
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "true",
      vercelEnv: "preview",
      host: "staging.tplgo.com",
      apiBaseUrl: "https://api.tplgo.com",
    })).toBe(false);
  });

  it("is allowed on localhost only when the explicit flag is enabled", () => {
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "true",
      vercelEnv: "preview",
      host: "localhost:3018",
      apiBaseUrl: "https://api.tplgo.com",
    })).toBe(true);
  });

  it("is denied for production domains and production deployments", () => {
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "true",
      vercelEnv: "production",
      host: "staging.tplgo.com",
      apiBaseUrl: "https://api-staging.tplgo.com",
    })).toBe(false);
    expect(isPartnerQaPreviewEnabled({
      qaFlag: "true",
      vercelEnv: "preview",
      host: "tplgo.com",
      apiBaseUrl: "https://api-staging.tplgo.com",
    })).toBe(false);
  });

  it("treats query value alone as only a request", () => {
    expect(isPartnerQaPreviewRequested("1")).toBe(true);
    expect(isPartnerQaPreviewRequested("true")).toBe(true);
    expect(isPartnerQaPreviewRequested("0")).toBe(false);
  });
});
