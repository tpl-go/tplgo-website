export type PartnerPreviewGateInput = {
  vercelEnv?: string | undefined;
  nodeEnv?: string | undefined;
  sandboxFlag?: string | undefined;
};

export function isPartnerDeskPreviewEnabled(input: PartnerPreviewGateInput = {}): boolean {
  const vercelEnv = input.vercelEnv ?? process.env.VERCEL_ENV;
  const nodeEnv = input.nodeEnv ?? process.env.NODE_ENV;
  const sandboxFlag = input.sandboxFlag ?? process.env.PARTNER_PREVIEW_SANDBOX_ENABLED;

  if (vercelEnv === "production") return false;
  if (vercelEnv === "preview") return true;
  return nodeEnv === "development" && sandboxFlag === "true";
}
