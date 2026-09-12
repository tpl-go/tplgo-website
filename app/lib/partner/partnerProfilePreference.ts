const key = "tpl_partner_profile_preference_v1";
const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readPartnerProfilePreference(): string | null {
  try {
    const value = window.sessionStorage.getItem(key);
    return value && validId.test(value) ? value : null;
  } catch { return null; }
}

export function rememberPartnerProfile(organizationId: string): void {
  try { if (validId.test(organizationId)) window.sessionStorage.setItem(key, organizationId); } catch { /* The URL still carries the selected profile for this visit. */ }
}

export function clearPartnerProfilePreference(): void {
  try { window.sessionStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
}

// A routing preference only. Every endpoint rechecks current server membership.
export function withPartnerProfile(path: string): string {
  const fromUrl = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("organizationId");
  const id = fromUrl ?? readPartnerProfilePreference();
  return id ? `${path}?organizationId=${encodeURIComponent(id)}` : path;
}
