export type PartnerQaPreviewGateInput = {
  qaFlag?: string | undefined;
  vercelEnv?: string | undefined;
  nodeEnv?: string | undefined;
  host?: string | null | undefined;
  apiBaseUrl?: string | undefined;
};

export function isPartnerQaPreviewEnabled(input: PartnerQaPreviewGateInput = {}): boolean {
  const qaFlag = input.qaFlag ?? process.env.PARTNER_QA_PREVIEW_ENABLED;
  const vercelEnv = input.vercelEnv ?? process.env.VERCEL_ENV;
  const host = (input.host ?? "").toLowerCase();
  const apiBaseUrl = input.apiBaseUrl ?? process.env.NEXT_PUBLIC_TPL_API_BASE_URL ?? "";

  if (qaFlag !== "true") return false;
  if (vercelEnv === "production") return false;
  if (host === "tplgo.com" || host === "www.tplgo.com") return false;

  const isStagingHost = host === "staging.tplgo.com";
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const targetsStagingApi = apiBaseUrl.replace(/\/+$/, "") === "https://api-staging.tplgo.com";

  if (isStagingHost) return targetsStagingApi;
  return isLocalHost;
}

export function isPartnerQaPreviewRequested(value: unknown): boolean {
  return value === "1" || value === "true";
}
