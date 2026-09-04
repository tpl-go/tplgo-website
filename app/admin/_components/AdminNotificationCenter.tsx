"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BellRing,
  CheckCheck,
  ChevronRight,
  Clock,
  FileCheck2,
  RefreshCcw,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminNotificationCenter,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminApiError,
  type AdminNotificationCenterDashboard,
  type AdminWorkflowNotification,
} from "../../lib/admin/adminApiClient";

type FilterKey = AdminNotificationCenterDashboard["filters"][number];

type LoadState =
  | { status: "loading"; data: AdminNotificationCenterDashboard; error: null }
  | { status: "ready"; data: AdminNotificationCenterDashboard; error: null }
  | { status: "error"; data: AdminNotificationCenterDashboard; error: AdminApiError };

const emptyDashboard: AdminNotificationCenterDashboard = {
  unreadCount: 0,
  filters: ["all", "unread", "approvals", "publishing", "service_requests", "system"],
  notifications: [],
};

const filterLabels: Record<FilterKey, string> = {
  all: "All",
  unread: "Unread",
  approvals: "Approvals",
  publishing: "Publishing",
  service_requests: "Service Requests",
  system: "System",
};

const iconByCategory: Record<AdminWorkflowNotification["category"], LucideIcon> = {
  approvals: FileCheck2,
  publishing: Send,
  service_requests: BellRing,
  system: Archive,
};

export function AdminNotificationCenter() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });

  const load = (nextFilter: FilterKey = filter) => {
    setState((current) => ({ status: "loading", data: current.data, error: null }));
    void getAdminNotificationCenter({ limit: 100, offset: 0, status: nextFilter }).then((result) => {
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
    });
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const data = state.data;
  const visibleFilters = useMemo(() => data.filters.length ? data.filters : emptyDashboard.filters, [data.filters]);

  const markRead = (notificationId: string) => {
    void markAdminNotificationRead(notificationId).then((result) => {
      if (result.ok) setState({ status: "ready", data: result.data, error: null });
    });
  };

  const markAllRead = () => {
    void markAllAdminNotificationsRead().then((result) => {
      if (result.ok) setState({ status: "ready", data: result.data, error: null });
    });
  };

  return (
    <div className="space-y-5">
      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Notifications</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Workflow updates that need your attention.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <BellRing className="h-4 w-4" />
              {data.unreadCount} unread
            </span>
            <button
              type="button"
              onClick={markAllRead}
              disabled={data.unreadCount === 0}
              className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2" aria-label="Notification filters">
          {visibleFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                filter === item ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {filterLabels[item]}
            </button>
          ))}
        </div>
      </section>

      {state.status === "error" ? (
        <Notice text="We couldn't load notifications." action={<RetryButton onClick={() => load(filter)} />} />
      ) : null}

      <section className="rounded border border-slate-200 bg-white">
        {state.status === "loading" ? <Notice text="Loading notifications..." /> : null}
        {state.status !== "loading" && data.notifications.length === 0 ? <EmptyState /> : null}
        <div className="divide-y divide-slate-100">
          {data.notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} onOpen={() => markRead(notification.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NotificationRow({ notification, onOpen }: { notification: AdminWorkflowNotification; onOpen: () => void }) {
  const Icon = iconByCategory[notification.category] ?? BellRing;
  return (
    <Link
      href={notification.internalDeepLink}
      onClick={onOpen}
      className="group flex items-center gap-4 p-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border ${notification.unread ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-950">{notification.title}</span>
          {notification.unread ? <span className="h-2 w-2 rounded-full bg-cyan-500" aria-label="Unread" /> : null}
        </span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{notification.message}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          {notification.context ? <span>{notification.context}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatTime(notification.createdAt)}
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-slate-600" aria-hidden="true" />
    </Link>
  );
}

function Notice({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" role="status">
      <span>{text}</span>
      {action}
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <RefreshCcw className="h-4 w-4" />
      Retry
    </button>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">You are all caught up.</p>
      <p className="mt-1 text-sm text-slate-500">New workflow updates will appear here.</p>
    </div>
  );
}

function formatTime(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Time unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
