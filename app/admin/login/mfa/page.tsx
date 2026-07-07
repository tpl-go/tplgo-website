"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  clearAdminMfaChallenge,
  getAdminApiBaseUrl,
  readAdminMfaChallenge,
  verifyAdminLoginMfa,
  writeAdminSession,
  type AdminLoginMfaChallenge,
} from "../../../lib/admin/adminApiClient";

export default function AdminLoginMfaPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<AdminLoginMfaChallenge | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const stored = readAdminMfaChallenge();
      if (!stored) {
        router.replace("/admin/login");
        return;
      }
      setChallenge(stored);
    });
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge) return;
    setLoading(true);
    setError(null);
    const result = await verifyAdminLoginMfa(challenge.mfaChallengeId, code);
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    writeAdminSession(result.data);
    clearAdminMfaChallenge();
    router.replace("/admin");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 text-slate-950">
      <section className="w-full max-w-md rounded border border-slate-200 bg-white p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">MFA verification</h1>
            <p className="text-sm text-slate-500">Enter a TOTP or backup code</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Code</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm uppercase outline-none focus:border-slate-500"
              placeholder="123456 or XXXX-XXXX"
              autoComplete="one-time-code"
            />
          </label>
          {challenge ? (
            <div className="rounded bg-slate-50 p-3 text-xs text-slate-500">
              Challenge expires at {new Date(challenge.expiresAt).toLocaleString()}
            </div>
          ) : null}
          {error && <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
          <button
            type="submit"
            disabled={loading || !challenge}
            className="h-10 w-full rounded bg-slate-950 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Verifying" : "Verify"}
          </button>
        </form>

        <div className="mt-6 rounded bg-slate-50 p-3 text-xs text-slate-500">
          API base: {getAdminApiBaseUrl() || "Not configured"}
        </div>
      </section>
    </main>
  );
}
