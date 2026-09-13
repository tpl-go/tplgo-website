// User-only ordering: superseded requests cannot restore old data.
export function latestAccountRead() {
  let revision = 0;
  return {
    begin() { const current = ++revision; return () => current === revision; },
    cancel() { revision++; },
  };
}

// The methods endpoint projects active, verified canonical identifiers (including
// supported legacy mobile authority). Never derive this from profile/storage data.
export function loginMobileDisplay(payload: unknown, ownerId: string): string {
  const result = payload as { ok?: boolean; data?: { ownerId?: string; methods?: unknown } } | null;
  if (result?.ok !== true || result.data?.ownerId !== ownerId || !Array.isArray(result.data.methods)) return "Login mobile unavailable";
  if (result.data.methods.some(row => !row || typeof row.provider !== "string" || typeof row.verified !== "boolean")) return "Login mobile unavailable";
  const mobiles = result.data.methods.filter(row => row.provider === "mobile" && row.verified === true && (row.status === undefined || row.status === "active"));
  if (mobiles.some(row => typeof row.id !== "string" || typeof row.label !== "string" || !/^\+\*{6}\d{4}$/.test(row.label))) return "Login mobile unavailable";
  if (!mobiles.length) return "Mobile not added";
  if (mobiles.length > 1) return `${mobiles.length} verified login mobiles`;
  return `${mobiles[0].label} · Verified`;
}

export type AccountDevice = { id: string; label: string; lastSeenAt: string | null };
export function readAccountDevices(payload: unknown, userId: string): AccountDevice[] | null {
  const result = payload as { ok?: boolean; data?: { deviceSessions?: unknown } } | null;
  const rows = result?.data?.deviceSessions;
  if (result?.ok !== true || !Array.isArray(rows)) return null;
  if (!rows.every(row => row && row.userId === userId && typeof row.id === "string")) return null;
  return rows.map(row => ({
    id: row.id,
    label: typeof row.deviceLabel === "string" && row.deviceLabel.trim() ? row.deviceLabel : "Device record",
    lastSeenAt: typeof row.lastSeenAt === "string" && Number.isFinite(Date.parse(row.lastSeenAt)) ? row.lastSeenAt : null,
  }));
}
