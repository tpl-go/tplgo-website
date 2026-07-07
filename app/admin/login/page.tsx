"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  adminLogin,
  getAdminApiBaseUrl,
  isAdminMfaChallenge,
  startAdminSso,
  writeAdminMfaChallenge,
  writeAdminSession,
  type AdminSsoProvider,
} from "../../lib/admin/adminApiClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dev-admin@tpl.local");
  const [password, setPassword] = useState("TplLocalAdmin123");
  const [role, setRole] = useState("super_admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<AdminSsoProvider | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await adminLogin({ email, password, role });
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    if (isAdminMfaChallenge(result.data)) {
      writeAdminMfaChallenge(result.data);
      router.replace("/admin/login/mfa");
      return;
    }
    writeAdminSession(result.data);
    router.replace("/admin");
  };

  const handleSsoStart = async (provider: AdminSsoProvider) => {
    setError(null);
    setSsoLoading(provider);
    const result = await startAdminSso(provider);
    setSsoLoading(null);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    window.location.assign(result.data.authorizationUrl);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 text-slate-950">
      <section className="w-full max-w-md rounded border border-slate-200 bg-white p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">TPL Admin</h1>
            <p className="text-sm text-slate-500">Development admin access</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
              autoComplete="current-password"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
            >
              <option value="super_admin">super_admin</option>
              <option value="ops_admin">ops_admin</option>
              <option value="finance_admin">finance_admin</option>
              <option value="support_admin">support_admin</option>
              <option value="content_admin">content_admin</option>
              <option value="creator_admin">creator_admin</option>
              <option value="market_admin">market_admin</option>
              <option value="read_only">read_only</option>
            </select>
          </label>
          {error && <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded bg-slate-950 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>SSO</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void handleSsoStart("google")}
            disabled={Boolean(ssoLoading)}
            className="h-10 rounded border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            {ssoLoading === "google" ? "Opening" : "Google"}
          </button>
          <button
            type="button"
            onClick={() => void handleSsoStart("microsoft")}
            disabled={Boolean(ssoLoading)}
            className="h-10 rounded border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            {ssoLoading === "microsoft" ? "Opening" : "Microsoft"}
          </button>
        </div>

        <div className="mt-6 rounded bg-slate-50 p-3 text-xs text-slate-500">
          API base: {getAdminApiBaseUrl() || "Not configured"}
        </div>
      </section>
    </main>
  );
}
