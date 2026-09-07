import { adminApiRequest } from "./adminApiClient";

export type ScheduleAction = "cancel" | "reschedule" | "retry";
export type ScheduleTarget = "website_experience" | "verification_policy" | "service_catalogue";
export type CentralSchedule = {
  id: string; targetType: ScheduleTarget; targetName: string; targetPath: string;
  targetTypeLabel?: string; editorRoute: string; summary: string; status: string; statusLabel: string;
  scheduledFor: string; timezone: string; scheduledBy: string;
  attemptCount: number; lastAttemptAt: string | null; executedAt: string | null;
  cancelledAt: string | null; failureReason: string | null;
  actions: ScheduleAction[]; revision: string;
};
export type ScheduleHistory = { schedule: CentralSchedule; events: Array<{
  action: string; createdAt: string; actor: string; previousTime: string | null; scheduledTime: string | null;
}> };
const base = "/api/v1/admin/central-workflow/schedules";
export function listCentralSchedules(targetType?: ScheduleTarget, targetId?: string) {
  const query = new URLSearchParams();
  if (targetType) query.set("targetType", targetType);
  if (targetId) query.set("targetId", targetId);
  return adminApiRequest<{ rows: CentralSchedule[] }>(`${base}?${query}`);
}
export function readCentralScheduleHistory(id: string) {
  return adminApiRequest<ScheduleHistory>(`${base}/${encodeURIComponent(id)}/history`);
}
export function changeCentralSchedule(row: CentralSchedule, action: ScheduleAction, schedule?: { scheduledFor: string; timezone: string }) {
  return adminApiRequest<{ schedule: CentralSchedule; message: string }>(`${base}/${encodeURIComponent(row.id)}/${action}`, {
    method: "POST", body: { revision: row.revision, ...schedule },
  });
}
export function validateScheduleForm(date: string, time: string, timezone: string, now = Date.now()) {
  const value = new Date(`${date}T${time}:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !Number.isFinite(value.getTime()) || value.getTime() <= now || value.toISOString().slice(0, 16) !== `${date}T${time}`) {
    return { error: "Choose a valid future publication date and time (UTC)." };
  }
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(value); }
  catch { return { error: "Choose a valid display timezone." }; }
  return { scheduledFor: value.toISOString(), timezone };
}
