"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "../../_components/AdminShell";
import { setupAdminPassword, type AdminApiResult } from "../../../lib/admin/adminApiClient";

export default function AdminPasswordSetupPage() {
  return (
    <Suspense fallback={<AdminPasswordFrame title="Password Setup" message="Loading setup form" />}>
      <AdminPasswordSetupContent />
    </Suspense>
  );
}

function AdminPasswordSetupContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<AdminApiResult<{ completed: boolean }> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const response = await setupAdminPassword(token, password);
    setResult(response);
    setSubmitting(false);
    if (response.ok) {
      setToken("");
      setPassword("");
    }
  }

  return (
    <AdminShell title="Password Setup">
      <PasswordForm
        title="Set admin password"
        token={token}
        password={password}
        submitting={submitting}
        submitLabel="Set password"
        result={result}
        onTokenChange={setToken}
        onPasswordChange={setPassword}
        onSubmit={submit}
      />
    </AdminShell>
  );
}

function PasswordForm({
  title,
  token,
  password,
  submitting,
  submitLabel,
  result,
  onTokenChange,
  onPasswordChange,
  onSubmit,
}: {
  title: string;
  token: string;
  password: string;
  submitting: boolean;
  submitLabel: string;
  result: AdminApiResult<{ completed: boolean }> | null;
  onTokenChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="max-w-xl rounded border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Token</span>
          <input
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
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
            onChange={(event) => onPasswordChange(event.target.value)}
            className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            autoComplete="new-password"
            required
          />
        </label>
        <button type="submit" disabled={submitting} className="h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60">
          {submitting ? "Submitting" : submitLabel}
        </button>
      </form>
      <ResultNotice result={result} successMessage="Password has been set." />
    </section>
  );
}

function ResultNotice({ result, successMessage }: { result: AdminApiResult<unknown> | null; successMessage: string }) {
  if (!result) return null;
  return result.ok ? (
    <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{successMessage}</div>
  ) : (
    <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p>{result.error.message}</p>
      <p className="mt-1 text-xs">Request ID: {result.requestId}</p>
    </div>
  );
}

function AdminPasswordFrame({ title, message }: { title: string; message: string }) {
  return (
    <AdminShell title={title}>
      <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">{message}</div>
    </AdminShell>
  );
}
