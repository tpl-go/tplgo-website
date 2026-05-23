export const DEVICE_SESSION_STORAGE_KEY = "tpl_device_sessions_v1";

export type DeviceSession = {
  id: string;
  label: string;
  type: string;
  location: string;
  loggedInSince: string;
  isCurrent: boolean;
  lastSeen: string;
};

function formatNow() {
  return new Date().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function detectBrowser(userAgent: string) {
  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/firefox/i.test(userAgent)) return "Firefox";
  return "Browser";
}

function detectDeviceType(userAgent: string) {
  if (/android/i.test(userAgent)) return "Android Device";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iPhone / iPad";
  if (/windows/i.test(userAgent)) return "Windows Desktop";
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac Desktop";
  return "Desktop Web";
}

export function getSavedDeviceSessions(): DeviceSession[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DEVICE_SESSION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DeviceSession[];
  } catch {
    return [];
  }
}

export function saveDeviceSessions(sessions: DeviceSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEVICE_SESSION_STORAGE_KEY,
    JSON.stringify(sessions)
  );
}

export function registerCurrentDeviceSession() {
  if (typeof window === "undefined") return [];

  const userAgent = window.navigator.userAgent;
  const browser = detectBrowser(userAgent);
  const deviceType = detectDeviceType(userAgent);

  const currentId =
    window.localStorage.getItem("tpl_current_device_id") ||
    `device_${Date.now()}`;

  window.localStorage.setItem("tpl_current_device_id", currentId);

  const nextCurrent: DeviceSession = {
    id: currentId,
    label: `${browser} (${deviceType})`,
    type: deviceType,
    location: "Current session",
    loggedInSince: formatNow(),
    isCurrent: true,
    lastSeen: new Date().toISOString(),
  };

  const previous = getSavedDeviceSessions();

  const normalized = previous.map((item) => ({
    ...item,
    isCurrent: item.id === currentId,
  }));

  const existingIndex = normalized.findIndex((item) => item.id === currentId);

  let nextSessions: DeviceSession[] = [];

  if (existingIndex >= 0) {
    nextSessions = normalized.map((item) =>
      item.id === currentId
        ? {
            ...item,
            label: nextCurrent.label,
            type: nextCurrent.type,
            location: nextCurrent.location,
            isCurrent: true,
            lastSeen: new Date().toISOString(),
          }
        : { ...item, isCurrent: false }
    );
  } else {
    nextSessions = [nextCurrent, ...normalized.map((item) => ({ ...item, isCurrent: false }))];
  }

  saveDeviceSessions(nextSessions);
  return nextSessions;
}

export function logoutDeviceSession(sessionId: string) {
  const sessions = getSavedDeviceSessions();
  const next = sessions.filter((item) => item.id !== sessionId);
  saveDeviceSessions(next);
  return next;
}