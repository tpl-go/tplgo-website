"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "../../../_components/AdminShell";
import { confirmAdminPasswordReset, type AdminApiResult } from "../../../../lib/admin/adminApiClient";

export default function AdminPasswordResetConfirmPage() {
  return (
    <Suspense fallback={<AdminPasswordFrame />}>
      <AdminPasswordResetConfirmContent />
    </Suspense>
  );
}

function AdminPasswordResetConfirmContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<AdminApiResult<{ completed: boolean }> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const response = await confirmAdminPasswordReset(token, password);
    setResult(response);
    setSubmitting(false);
    if (response.ok) {
      setToken("");
      setPassword("");
    }
  }

  return (
    <AdminShell title="Confirm Password Reset">
      <section className="max-w-xl rounded border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-950">Set new admin password</h2>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Reset token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              autoComplete="off"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" disabled={submitting} className="h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
            {submitting ? "Submitting" : "Reset password"}
          </button>
        </form>
        {result?.ok ? (
          <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Password has been reset.</div>
        ) : null}
        {result && !result.ok ? (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>{result.error.message}</p>
            <p className="mt-1 text-xs">Request ID: {result.requestId}</p>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}

function AdminPasswordFrame() {
  return (
    <AdminShell title="Confirm Password Reset">
      <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading reset form</div>
    </AdminShell>
  );
}
