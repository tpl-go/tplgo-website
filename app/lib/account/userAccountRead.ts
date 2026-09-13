// User-only ordering: superseded requests cannot restore old data.
export function latestAccountRead() {
  let revision = 0;
  return {
    begin() { const current = ++revision; return () => current === revision; },
    cancel() { revision++; },
  };
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
