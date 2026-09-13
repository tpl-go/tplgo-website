// undefined means loading; null means the authoritative contract is unavailable.
export function accountEmailDisplay(emails: string[] | null | undefined, profileEmail?: string) {
  if (emails === undefined) return { value: "Checking login email…", status: "Checking", verified: false };
  if (emails === null) return { value: "Login email unavailable", status: "Could not confirm", verified: false };
  if (emails.length) return { value: emails.map(maskEmail).join(", "), status: "Verified", verified: true };
  return profileEmail
    ? { value: maskEmail(profileEmail), status: "Profile email · Not verified", verified: false }
    : { value: "Email not added", status: "Not added", verified: false };
}

export function readVerifiedLoginEmails(payload: unknown, expectedUserId: string): string[] | null {
  if (!payload || typeof payload !== "object") return null;
  const result = payload as { ok?: boolean; data?: { user?: { id?: unknown; verifiedLoginEmails?: unknown } } };
  const user = result.data?.user;
  if (result.ok !== true || user?.id !== expectedUserId || !Array.isArray(user.verifiedLoginEmails)
    || !user.verifiedLoginEmails.every((email) => typeof email === "string" && email.trim())) return null;
  return [...new Set((user.verifiedLoginEmails as string[]).map((email) => email.trim().toLowerCase()))].sort();
}

function maskEmail(value: string): string {
  const [name, domain] = value.split("@");
  if (!name || !domain) return "Email added";
  return `${name.slice(0, 1)}••••@${domain}`;
}
