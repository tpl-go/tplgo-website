export const TPL_PRODUCTION_API_BASE_URL = "https://api.tplgo.com";
export const TPL_SMOKE_PROXY_API_BASE_URL = "/api/backend";

export type ApiTargetResolution = {
  baseUrl: string;
  status:
    | "configured"
    | "production-default"
    | "smoke-proxy"
    | "preview-blocked"
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
  };
}
