export const TPL_PRODUCTION_API_BASE_URL = "https://api.tplgo.com";
export const TPL_STAGING_API_BASE_URL_HOSTNAME = "api-staging.tplgo.com";
export const TPL_SMOKE_PROXY_API_BASE_URL = "/api/backend";
export const TPL_APP_DEV_ENV_MARKER = "app-development";

export type ApiTargetResolution = {
  baseUrl: string;
  status:
    | "configured"
    | "production-default"
    | "smoke-proxy"
    | "preview-blocked"
    | "cross-environment-blocked"
    | "unconfigured";
  isPreview: boolean;
  usesProductionFallback: boolean;
};

export type ApiTargetEnv = {
  nodeEnv?: string;
  vercelEnv?: string;
  nextPublicVercelEnv?: string;
  apiBaseUrl?: string;
  adminApiBaseUrl?: string;
  smokeApiProxyEnabled?: string;
  allowProductionSmokeProxy?: string;
  tplEnv?: string;
};

export type ApiTargetOptions = {
  preferAdminApiBase?: boolean;
};

export function resolveTplApiTarget(
  env: ApiTargetEnv = readCurrentApiTargetEnv(),
  options: ApiTargetOptions = {}
): ApiTargetResolution {
  const nodeEnv = clean(env.nodeEnv);
  const isPreview = isVercelPreviewEnv(env);

  if (isSmokeApiProxyAllowed(env)) {
    return {
      baseUrl: TPL_SMOKE_PROXY_API_BASE_URL,
      status: "smoke-proxy",
      isPreview,
      usesProductionFallback: false,
    };
  }

  const configured = clean(
    options.preferAdminApiBase ? env.adminApiBaseUrl || env.apiBaseUrl : env.apiBaseUrl
  );
  if (configured) {
    if (isPreview && isProductionApiUrl(configured)) {
      return blockedPreview(isPreview);
    }

    // App Development builds must never fall back onto the Website Staging backend
    // (or vice versa) even if a config value is ever copy-pasted between environments.
    // This is scoped strictly to isAppDevEnv(env) so it can never affect Staging's own
    // resolution path, which does not set NEXT_PUBLIC_TPL_ENV=app-development.
    if (isAppDevEnv(env) && isStagingApiUrl(configured)) {
      return crossEnvironmentBlocked(isPreview);
    }

    return {
      baseUrl: trimTrailingSlashes(configured),
      status: "configured",
      isPreview,
      usesProductionFallback: false,
    };
  }

  if (isPreview) {
    return blockedPreview(isPreview);
  }

  if (nodeEnv === "production") {
    return {
      baseUrl: TPL_PRODUCTION_API_BASE_URL,
      status: "production-default",
      isPreview,
      usesProductionFallback: true,
    };
  }

  return {
    baseUrl: "",
    status: "unconfigured",
    isPreview,
    usesProductionFallback: false,
  };
}

export function resolveCurrentTplApiTarget(options: ApiTargetOptions = {}) {
  return resolveTplApiTarget(readCurrentApiTargetEnv(), options);
}

export function isVercelPreviewEnv(env: ApiTargetEnv = readCurrentApiTargetEnv()): boolean {
  return clean(env.vercelEnv).toLowerCase() === "preview" ||
    clean(env.nextPublicVercelEnv).toLowerCase() === "preview";
}

export function isProductionApiUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase() === "api.tplgo.com";
  } catch {
    return false;
  }
}

export function isStagingApiUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase() === TPL_STAGING_API_BASE_URL_HOSTNAME;
  } catch {
    return false;
  }
}

export function isAppDevEnv(env: ApiTargetEnv = readCurrentApiTargetEnv()): boolean {
  return clean(env.tplEnv).toLowerCase() === TPL_APP_DEV_ENV_MARKER;
}

function isSmokeApiProxyAllowed(env: ApiTargetEnv): boolean {
  if (clean(env.smokeApiProxyEnabled) !== "true") return false;
  const nodeEnv = clean(env.nodeEnv);
  return nodeEnv !== "production" || clean(env.allowProductionSmokeProxy) === "true";
}

function blockedPreview(isPreview: boolean): ApiTargetResolution {
  return {
    baseUrl: "",
    status: "preview-blocked",
    isPreview,
    usesProductionFallback: false,
  };
}

function crossEnvironmentBlocked(isPreview: boolean): ApiTargetResolution {
  return {
    baseUrl: "",
    status: "cross-environment-blocked",
    isPreview,
    usesProductionFallback: false,
  };
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function clean(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function readCurrentApiTargetEnv(): ApiTargetEnv {
  return {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    nextPublicVercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    apiBaseUrl: process.env.NEXT_PUBLIC_TPL_API_BASE_URL,
    adminApiBaseUrl: process.env.NEXT_PUBLIC_TPL_ADMIN_API_BASE_URL,
    smokeApiProxyEnabled: process.env.NEXT_PUBLIC_TPL_SMOKE_API_PROXY_ENABLED,
    allowProductionSmokeProxy: process.env.NEXT_PUBLIC_TPL_ALLOW_PRODUCTION_SMOKE_PROXY,
    tplEnv: process.env.NEXT_PUBLIC_TPL_ENV,
  };
}
