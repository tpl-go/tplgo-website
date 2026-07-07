"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import {
  disableAdminMfa,
  enrollAdminMfa,
  getAdminMfaStatus,
  getAdminSessions,
  regenerateAdminMfaBackupCodes,
  revokeAdminSession,
  revokeAllAdminSessions,
  type AdminApiResult,
  type AdminMfaStatus,
  type AdminSessionView,
} from "../../../lib/admin/adminApiClient";

export default function AdminSecuritySessionsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Security Sessions">
        <AdminSecuritySessionsView />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminSecuritySessionsView() {
  const [sessionsResult, setSessionsResult] = useState<AdminApiResult<AdminSessionView[]> | null>(null);
  const [mfaResult, setMfaResult] = useState<AdminApiResult<AdminMfaStatus> | null>(null);
  const [actionResult, setActionResult] = useState<AdminApiResult<unknown> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [sessions, mfa] = await Promise.all([getAdminSessions(), getAdminMfaStatus()]);
    setSessionsResult(sessions);
    setMfaResult(mfa);
  }

  useEffect(() => {
    let active = true;
    void Promise.all([getAdminSessions(), getAdminMfaStatus()]).then(([sessions, mfa]) => {
      if (!active) return;
      setSessionsResult(sessions);
      setMfaResult(mfa);
    });
    return () => {
      active = false;
    };
  }, []);

  async function revokeSession(session: AdminSessionView) {
    if (!window.confirm(session.currentSession ? "Revoke the current session and sign out?" : "Revoke this admin session?")) return;
    setBusy(session.sessionId);
    const result = await revokeAdminSession(session.sessionId);
    setActionResult(result);
    setBusy(null);
    await load();
  }

  async function revokeAll() {
    if (!window.confirm("Revoke all other admin sessions? The current session will stay active.")) return;
    setBusy("revoke-all");
    const result = await revokeAllAdminSessions();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  async function enrollMfa() {
    setBusy("mfa-enroll");
    const result = await enrollAdminMfa();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  async function disableMfa() {
    if (!window.confirm("Disable MFA foundation for this admin account?")) return;
    setBusy("mfa-disable");
    const result = await disableAdminMfa();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  async function regenerateBackupCodes() {
    if (!window.confirm("Regenerate MFA backup codes? Existing backup codes will be replaced.")) return;
    setBusy("mfa-backup");
    const result = await regenerateAdminMfaBackupCodes();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  const sessions = sessionsResult?.ok ? sessionsResult.data : [];
  const mfa = mfaResult?.ok ? mfaResult.data : null;
  const actionData = actionResult?.ok ? actionResult.data as Partial<AdminMfaStatus> : null;

  return (
    <div className="space-y-6">
      {sessionsResult && !sessionsResult.ok ? <Notice tone="warn" text={sessionsResult.error.message} requestId={sessionsResult.requestId} /> : null}
      {mfaResult && !mfaResult.ok ? <Notice tone="warn" text={mfaResult.error.message} requestId={mfaResult.requestId} /> : null}
      {actionResult?.ok ? (
        <Notice tone="success" text="Security action completed." requestId={actionResult.requestId}>
          {actionData?.secret ? (
            <div className="mt-3 rounded border border-emerald-200 bg-white p-3">
              <p className="text-xs font-medium text-emerald-950">Enrollment secret</p>
              <p className="mt-1 break-all text-slate-950">{actionData.secret}</p>
            </div>
          ) : null}
          {actionData?.backupCodes?.length ? (
            <div className="mt-3 rounded border border-emerald-200 bg-white p-3">
              <p className="text-xs font-medium text-emerald-950">Backup codes</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {actionData.backupCodes.map((code) => (
                  <code key={code} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-950">{code}</code>
                ))}
              </div>
            </div>
          ) : null}
        </Notice>
      ) : null}
      {actionResult && !actionResult.ok ? <Notice tone="warn" text={actionResult.error.message} requestId={actionResult.requestId} /> : null}

      <section className="rounded border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Admin Sessions</h2>
            <p className="mt-1 text-xs text-slate-500">Session tokens remain hashed at rest.</p>
          </div>
          <button
            type="button"
            onClick={revokeAll}
            disabled={busy === "revoke-all"}
            className="h-9 rounded bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-60"
          >
            {busy === "revoke-all" ? "Revoking" : "Revoke all other sessions"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["session", "mode", "ip", "userAgent", "created", "expires", "status", "action"].map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={8}>Sessions will appear here when backend data exists.</td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.sessionId}>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="font-mono text-xs">{session.sessionId}</span>
                      {session.currentSession ? <span className="ml-2 rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900">Current</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{session.authMode ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{session.ipAddress ?? "-"}</td>
                    <td className="max-w-72 truncate px-4 py-3 text-slate-700">{session.userAgent ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(session.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(session.expiresAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{session.revokedAt ? "Revoked" : "Active"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => revokeSession(session)}
                        disabled={Boolean(session.revokedAt) || busy === session.sessionId}
                        className="h-8 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        {busy === session.sessionId ? "Revoking" : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">MFA Foundation</h2>
            <p className="mt-1 text-xs text-slate-500">Enabled admins complete an MFA challenge during password login.</p>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {mfa?.enabled ? "Enabled" : "Not enrolled"}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <MetaItem label="Enrolled At" value={mfa?.enrolledAt ? formatDate(mfa.enrolledAt) : "-"} />
          <MetaItem label="Backup Codes" value={mfa?.backupCodesCount ?? 0} />
          <MetaItem label="Login Challenge" value={mfa?.enabled ? "Enforced" : "Not enrolled"} />
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={enrollMfa} disabled={busy === "mfa-enroll"} className="h-9 rounded bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-60">
            {busy === "mfa-enroll" ? "Enrolling" : "Enroll MFA"}
          </button>
          <button type="button" onClick={regenerateBackupCodes} disabled={busy === "mfa-backup" || !mfa?.enabled} className="h-9 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50">
            {busy === "mfa-backup" ? "Regenerating" : "Regenerate backup codes"}
          </button>
          <button type="button" onClick={disableMfa} disabled={busy === "mfa-disable" || !mfa?.enabled} className="h-9 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50">
            {busy === "mfa-disable" ? "Disabling" : "Disable MFA"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Notice({ tone, text, requestId, children }: { tone: "success" | "warn"; text: string; requestId?: string; children?: ReactNode }) {
  const classes = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div className={`rounded border p-3 text-sm ${classes}`}>
      <p>{text}</p>
      {requestId ? <p className="mt-1 text-xs">Request ID: {requestId}</p> : null}
      {children}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-slate-900">{String(value ?? "-")}</dd>
    </div>
  );
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
