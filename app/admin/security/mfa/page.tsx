"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import {
  disableAdminMfa,
  enrollAdminMfa,
  getAdminMfaQr,
  getAdminMfaStatus,
  regenerateAdminMfaBackupCodes,
  verifyAdminMfa,
  type AdminApiResult,
  type AdminMfaQr,
  type AdminMfaStatus,
} from "../../../lib/admin/adminApiClient";

export default function AdminSecurityMfaPage() {
  return (
    <AdminProtected>
      <AdminShell title="Security MFA">
        <AdminSecurityMfaView />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminSecurityMfaView() {
  const [mfaResult, setMfaResult] = useState<AdminApiResult<AdminMfaStatus> | null>(null);
  const [actionResult, setActionResult] = useState<AdminApiResult<unknown> | null>(null);
  const [qrResult, setQrResult] = useState<AdminApiResult<AdminMfaQr> | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setMfaResult(await getAdminMfaStatus());
  }

  useEffect(() => {
    let active = true;
    void getAdminMfaStatus().then((result) => {
      if (active) setMfaResult(result);
    });
    return () => {
      active = false;
    };
  }, []);

  async function enrollMfa() {
    setBusy("enroll");
    const result = await enrollAdminMfa();
    setActionResult(result);
    if (result.ok) {
      setQrResult(await getAdminMfaQr());
    }
    setBusy(null);
    await load();
  }

  async function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("verify");
    const result = await verifyAdminMfa(code);
    setActionResult(result);
    setBusy(null);
    if (result.ok) setCode("");
    await load();
  }

  async function regenerateBackupCodes() {
    if (!window.confirm("Regenerate MFA backup codes? Existing backup codes will be replaced.")) return;
    setBusy("backup");
    const result = await regenerateAdminMfaBackupCodes();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  async function disableMfa() {
    if (!window.confirm("Disable MFA for this admin account?")) return;
    setBusy("disable");
    const result = await disableAdminMfa();
    setActionResult(result);
    setBusy(null);
    await load();
  }

  const mfa = mfaResult?.ok ? mfaResult.data : null;
  const actionData = actionResult?.ok ? actionResult.data as Partial<AdminMfaStatus> & { verified?: boolean } : null;

  return (
    <div className="space-y-6">
      {mfaResult && !mfaResult.ok ? <Notice tone="warn" text={mfaResult.error.message} requestId={mfaResult.requestId} /> : null}
      {actionResult?.ok ? (
        <Notice tone="success" text={actionData?.verified ? "MFA code verified." : "MFA action completed."} requestId={actionResult.requestId}>
          {actionData?.secret ? <SecretBlock label="Manual secret" value={actionData.secret} /> : null}
          {actionData?.otpauthUri ? <SecretBlock label="otpauth URI" value={actionData.otpauthUri} /> : null}
          {actionData?.backupCodes?.length ? (
            <div className="mt-3 rounded border border-emerald-200 bg-white p-3">
              <p className="text-xs font-medium text-emerald-950">Backup codes shown once</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {actionData.backupCodes.map((backupCode) => (
                  <code key={backupCode} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-950">{backupCode}</code>
                ))}
              </div>
            </div>
          ) : null}
        </Notice>
      ) : null}
      {actionResult && !actionResult.ok ? <Notice tone="warn" text={actionResult.error.message} requestId={actionResult.requestId} /> : null}
      {qrResult?.ok ? <SecretBlock label="QR provisioning otpauth URI" value={qrResult.data.otpauthUri} /> : null}
      {qrResult && !qrResult.ok ? <Notice tone="warn" text={qrResult.error.message} requestId={qrResult.requestId} /> : null}

      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">MFA status</h2>
            <p className="mt-1 text-xs text-slate-500">Enabled accounts must complete MFA after password login.</p>
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
          <button type="button" onClick={enrollMfa} disabled={busy === "enroll"} className="h-9 rounded bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-60">
            {busy === "enroll" ? "Enrolling" : "Enroll MFA"}
          </button>
          <button type="button" onClick={regenerateBackupCodes} disabled={busy === "backup" || !mfa?.enabled} className="h-9 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50">
            {busy === "backup" ? "Regenerating" : "Regenerate backup codes"}
          </button>
          <button type="button" onClick={disableMfa} disabled={busy === "disable" || !mfa?.enabled} className="h-9 rounded border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50">
            {busy === "disable" ? "Disabling" : "Disable MFA"}
          </button>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-950">Verify enrollment code</h2>
        <form className="mt-4 flex max-w-md gap-3" onSubmit={verifyEnrollment}>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded border border-slate-200 px-3 text-sm uppercase outline-none focus:border-slate-500"
            placeholder="123456 or XXXX-XXXX"
          />
          <button type="submit" disabled={busy === "verify" || !code.trim()} className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "verify" ? "Verifying" : "Verify"}
          </button>
        </form>
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

function SecretBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-slate-950">{value}</p>
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
