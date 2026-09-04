import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const notificationCenterSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminNotificationCenter.tsx"), "utf8");
const adminShellSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminShell.tsx"), "utf8");
const adminApiSource = readFileSync(join(process.cwd(), "app/lib/admin/adminApiClient.ts"), "utf8");

test("Notification Center is an internal workflow inbox", () => {
  expect(notificationCenterSource).toContain("<h2");
  expect(notificationCenterSource).toContain("Notifications");
  expect(notificationCenterSource).toContain("Workflow updates that need your attention.");
  expect(notificationCenterSource).toContain("data.notifications.map");
  expect(notificationCenterSource).toContain("NotificationRow");
  expect(notificationCenterSource).not.toContain("Enterprise Notification, Alert Routing & Escalation Center");
  expect(notificationCenterSource).not.toContain("No sending or escalation execution");
});

test("Notification Center supports unread state and mark read actions", () => {
  expect(notificationCenterSource).toContain("data.unreadCount");
  expect(notificationCenterSource).toContain("Mark all read");
  expect(notificationCenterSource).toContain("markAdminNotificationRead");
  expect(notificationCenterSource).toContain("markAllAdminNotificationsRead");
  expect(notificationCenterSource).toContain('aria-label="Unread"');
  expect(notificationCenterSource).toContain("You are all caught up.");
  expect(adminShellSource).toContain("notificationUnreadCount");
  expect(adminShellSource).toContain("getAdminNotificationCenter({ limit: 1, status: \"unread\" })");
});

test("Notification Center exposes human filters and exact internal deep links", () => {
  expect(notificationCenterSource).toContain("All");
  expect(notificationCenterSource).toContain("Unread");
  expect(notificationCenterSource).toContain("Approvals");
  expect(notificationCenterSource).toContain("Publishing");
  expect(notificationCenterSource).toContain("Service Requests");
  expect(notificationCenterSource).toContain("notification.internalDeepLink");
  expect(notificationCenterSource).not.toContain("raw event type");
  expect(notificationCenterSource).not.toContain("JSON");
});

test("Admin API client exposes workflow notification contract", () => {
  expect(adminApiSource).toContain("AdminWorkflowNotification");
  expect(adminApiSource).toContain("unreadCount: number");
  expect(adminApiSource).toContain("internalDeepLink: string");
  expect(adminApiSource).toContain("/api/v1/admin/notifications/read-all");
  expect(adminApiSource).toContain("/api/v1/admin/notifications/${encodeURIComponent(notificationId)}/read");
});
