function flag(name: string, fallback = false) { const value = process.env[name]; return value === undefined ? fallback : value === "true"; }
export const creatorIntegrationFlags = {
  integrationEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_INTEGRATION_ENABLED"),
  testApiEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_TEST_API_ENABLED"),
  publicCatalogApiEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG_API_ENABLED") || flag("NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG"),
  workspaceReadsEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_WORKSPACE_READS_ENABLED") || flag("NEXT_PUBLIC_TPL_CREATOR_WORKSPACE_BACKEND"),
  fixtureFallbackEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_FIXTURE_FALLBACK_ENABLED", true),
  sourceBadgeEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_SOURCE_BADGE_ENABLED", process.env.NODE_ENV !== "production"),
  studioGuardEnabled: () => flag("NEXT_PUBLIC_TPL_CREATOR_STUDIO_GUARD_ENABLED", true),
  certificationMode: () => flag("NEXT_PUBLIC_TPL_CREATOR_CERTIFICATION_MODE"),
};
export function creatorFallbackAllowed() { return creatorIntegrationFlags.fixtureFallbackEnabled() && !creatorIntegrationFlags.certificationMode(); }
