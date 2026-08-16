import assert from "node:assert/strict";
import test from "node:test";
import { isPartnerDeskPreviewEnabled } from "./partnerPreviewGate";

test("Partner Desk shell is visible in Vercel Preview", () => {
  assert.equal(isPartnerDeskPreviewEnabled({ vercelEnv: "preview", nodeEnv: "production" }), true);
});

test("Partner Desk shell remains blocked in production", () => {
  assert.equal(
    isPartnerDeskPreviewEnabled({
      vercelEnv: "production",
      nodeEnv: "production",
      sandboxFlag: "true",
    }),
    false
  );
});

test("local development requires the sandbox flag", () => {
  assert.equal(isPartnerDeskPreviewEnabled({ nodeEnv: "development", sandboxFlag: "true" }), true);
  assert.equal(isPartnerDeskPreviewEnabled({ nodeEnv: "development", sandboxFlag: "false" }), false);
});
