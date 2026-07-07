"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  completeAdminSsoCallback,
  isAdminMfaChallenge,
  writeAdminMfaChallenge,
  writeAdminSession,
  type AdminSsoProvider,
} from "../../../../lib/admin/adminApiClient";

export default function AdminSsoCallbackPage() {
  return (
    <Suspense fallback={<AdminSsoCallbackShell message="Completing SSO sign in" />}>
      <AdminSsoCallbackContent />
    </Suspense>
  );
}

function AdminSsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing SSO sign in");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const provider = parseProvider(searchParams.get("provider"));
    const state = searchParams.get("state") || "";
    const code = searchParams.get("code") || undefined;

    if (!state) {
      void Promise.resolve().then(() => {
        if (!active) return;
        setError("SSO callback is missing state.");
        setMessage("SSO sign in stopped");
      });
      return;
    }

    void completeAdminSsoCallback({ provider, state, code }).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error.message);
        setMessage("SSO sign in is not available");
        return;
      }
      if (isAdminMfaChallenge(result.data)) {
        writeAdminMfaChallenge(result.data);
        router.replace("/admin/login/mfa");
        return;
      }
      writeAdminSession(result.data);
      router.replace("/admin");
    });

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return <AdminSsoCallbackShell message={message} error={error} />;
}

function AdminSsoCallbackShell({ message, error }: { message: string; error?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 text-slate-950">
      <section className="w-full max-w-md rounded border border-slate-200 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">TPL Admin SSO</h1>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        {error ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>
        ) : (
          <div className="rounded bg-slate-50 p-3 text-sm text-slate-600">Please wait.</div>
        )}
      </section>
    </main>
  );
}

function parseProvider(value: string | null): AdminSsoProvider | undefined {
  if (value === "google" || value === "microsoft") return value;
  return undefined;
}
