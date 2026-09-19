import { getAdminApiBaseUrl, readAdminSession } from "@/app/lib/admin/adminApiClient";

/** Same authenticated request generates and downloads; no reusable export URL. */
export async function downloadApplicationExport(path: string, filename: string) {
  if (!path.startsWith("/api/v1/admin/partner-applications/")) throw new Error("Export is unavailable.");
  const session = readAdminSession();
  if (!session) throw new Error("Sign in to export applications.");
  const response = await fetch(getAdminApiBaseUrl() + path, { headers: { Authorization: `Bearer ${session.session.token}` }, cache: "no-store" });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || "The export could not be prepared.");
  }
  const blob = await response.blob();
  const current = readAdminSession();
  if (current?.session.id !== session.session.id || current?.session.token !== session.session.token || current?.admin.id !== session.admin.id) throw new Error("Your session changed. Sign in again to export.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");link.href = url;link.download = filename;link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
