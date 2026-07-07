"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import AdminShell from "../../_components/AdminShell";
import { requestAdminPasswordReset, type AdminApiResult, type AdminPasswordTokenResponse } from "../../../lib/admin/adminApiClient";

export default function AdminPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<AdminApiResult<AdminPasswordTokenResponse> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const response = await requestAdminPasswordReset(email);
    setResult(response);
    setSubmitting(false);
    if (response.ok) setEmail("");
  }

  const developmentToken = result?.ok ? result.data.token?.developmentToken : undefined;

  return (
    <AdminShell title="Password Reset">
      <section className="max-w-xl rounded border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-950">Request password reset</h2>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              autoComplete="email"
              required
            />
          </label>
          <button type="submit" disabled={submitting} className="h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
            {submitting ? "Submitting" : "Request reset"}
          </button>
        </form>
        {result?.ok ? (
          <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p>Password reset request accepted.</p>
            {developmentToken ? (
              <div className="mt-3 rounded border border-emerald-200 bg-white p-3">
                <p className="text-xs font-medium text-emerald-950">Development reset link</p>
                <Link className="mt-1 block break-all text-slate-950 underline-offset-2 hover:underline" href={`/admin/password/reset/confirm?token=${encodeURIComponent(developmentToken)}`}>
                  {`${typeof window !== "undefined" ? window.location.origin : ""}/admin/password/reset/confirm?token=${encodeURIComponent(developmentToken)}`}
                </Link>
              </div>
            ) : (
              <p className="mt-1">Setup link dispatch is queued for future notification delivery.</p>
            )}
          </div>
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
