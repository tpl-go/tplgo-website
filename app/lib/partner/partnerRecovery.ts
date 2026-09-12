import { tplApiRequest } from "../api/tplApiClient";
import { parsePartnerAccess, type PartnerAccess } from "./partnerAccess";

export const recoverySupportMessage = "We could not complete automatic recovery safely. Contact Partner Support for a reviewed recovery.";
export class RecoveryError extends Error {
  constructor(public readonly status: number) { super(status === 409 ? recoverySupportMessage : status === 401 ? "Your session has expired. Use Partner Login again." : status === 429 ? "Please wait before requesting another code." : "We could not verify this request. Please try again."); }
}
async function request(path: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await tplApiRequest<unknown>(`/api/v1/partner/recovery/${path}`, { method: "POST", body, fallbackOnError: false });
  if (!response.ok) throw new RecoveryError(response.status);
  if (!response.data || typeof response.data !== "object" || Array.isArray(response.data)) throw new RecoveryError(503);
  return response.data as Record<string, unknown>;
}
export async function startRecovery(channel: "mobile" | "email", contact: string) {
  const data = await request("start", { channel, contact });
  if (data.accepted !== true || typeof data.challenge !== "string" || !/^[0-9a-f-]{36}$/i.test(data.challenge) || typeof data.expiresAt !== "string" || !Number.isFinite(Date.parse(data.expiresAt)) || typeof data.resendAvailableAt !== "string" || !Number.isFinite(Date.parse(data.resendAvailableAt))) throw new RecoveryError(503);
  return { challenge: data.challenge, expiresAt: data.expiresAt, resendAvailableAt: data.resendAvailableAt };
}
export type RecoveryConfirmation = { displayName: string; statusLabel: string; reference: string | null };
export async function verifyRecovery(challenge: string, otp: string): Promise<RecoveryConfirmation> {
  const data = await request("verify", { challenge, otp });
  const labels = ["Application in progress", "Updates required", "Application submitted", "Active Partner account", "Account setup pending", "Account status"];
  if (typeof data.displayName !== "string" || data.displayName.length > 160 || typeof data.statusLabel !== "string" || !labels.includes(data.statusLabel) || !(data.reference === null || typeof data.reference === "string" && /^APP-\d+-[a-f0-9]{8}$/i.test(data.reference))) throw new RecoveryError(503);
  return { displayName: data.displayName, statusLabel: data.statusLabel, reference: data.reference as string | null };
}
export async function completeRecovery(challenge: string): Promise<{ access: PartnerAccess; session: { token: string; expiresAt: string } | null }> {
  const data = await request("complete", { challenge });
  const session = data.session as { token?: unknown; expiresAt?: unknown } | null;
  if (session !== null && (!session || typeof session.token !== "string" || typeof session.expiresAt !== "string" || !Number.isFinite(Date.parse(session.expiresAt)))) throw new RecoveryError(503);
  return { access: parsePartnerAccess(data.access), session: session === null ? null : { token: session.token as string, expiresAt: session.expiresAt as string } };
}
