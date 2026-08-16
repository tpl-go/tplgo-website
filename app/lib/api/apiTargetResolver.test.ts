import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveTplApiTarget,
  TPL_PRODUCTION_API_BASE_URL,
  TPL_SMOKE_PROXY_API_BASE_URL,
} from "./apiTargetResolver";

test("Preview without API URL blocks production fallback", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "production",
    vercelEnv: "preview",
  });

  assert.equal(target.baseUrl, "");
  assert.equal(target.status, "preview-blocked");
  assert.equal(target.isPreview, true);
  assert.equal(target.usesProductionFallback, false);
});

test("Preview with explicit safe API URL uses configured target", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "production",
    vercelEnv: "preview",
    apiBaseUrl: "https://api-preview.example.test/",
  });

  assert.equal(target.baseUrl, "https://api-preview.example.test");
  assert.equal(target.status, "configured");
  assert.equal(target.usesProductionFallback, false);
});

test("Preview with explicit production API URL is blocked", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "production",
    nextPublicVercelEnv: "preview",
    apiBaseUrl: TPL_PRODUCTION_API_BASE_URL,
  });

  assert.equal(target.baseUrl, "");
  assert.equal(target.status, "preview-blocked");
  assert.equal(target.usesProductionFallback, false);
});

test("Production preserves existing production API fallback", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "production",
    vercelEnv: "production",
  });

  assert.equal(target.baseUrl, TPL_PRODUCTION_API_BASE_URL);
  assert.equal(target.status, "production-default");
  assert.equal(target.usesProductionFallback, true);
});

test("Development preserves existing unconfigured behavior", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "development",
  });

  assert.equal(target.baseUrl, "");
  assert.equal(target.status, "unconfigured");
  assert.equal(target.usesProductionFallback, false);
});

test("Admin resolver prefers explicit admin API URL", () => {
  const target = resolveTplApiTarget(
    {
      nodeEnv: "production",
      vercelEnv: "preview",
      apiBaseUrl: "https://api-preview.example.test",
      adminApiBaseUrl: "https://admin-api-preview.example.test/",
    },
    { preferAdminApiBase: true }
  );

  assert.equal(target.baseUrl, "https://admin-api-preview.example.test");
  assert.equal(target.status, "configured");
});

test("Allowed smoke proxy resolves to the same-origin proxy target", () => {
  const target = resolveTplApiTarget({
    nodeEnv: "development",
    smokeApiProxyEnabled: "true",
  });

  assert.equal(target.baseUrl, TPL_SMOKE_PROXY_API_BASE_URL);
  assert.equal(target.status, "smoke-proxy");
});
