"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "../lib/auth/auth.types";
import { getStoredAuthToken, getTplApiBaseUrl } from "../lib/api/tplApiClient";
import { accountEmailDisplay, readVerifiedLoginEmails } from "../lib/partner/accountLoginEmail";

export default function AccountLoginEmail({ user, qaPreviewEnabled }: { user: AuthUser | null; qaPreviewEnabled: boolean }) {
  const token = getStoredAuthToken();
  const [result, setResult] = useState<{ user: AuthUser; token: string | null; emails: string[] | null; profileEmail: string } | null>(null);
  useEffect(() => {
    if (!user || qaPreviewEnabled) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${getTplApiBaseUrl()}/api/v1/me`, {
          credentials: "include", signal: controller.signal,
          headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const payload = await response.json() as { data?: { user?: { email?: unknown } } };
        const emails = response.ok ? readVerifiedLoginEmails(payload, user!.id) : null;
        const profileEmail = typeof payload.data?.user?.email === "string" ? payload.data.user.email : "";
        if (!controller.signal.aborted) setResult({ user: user!, token, emails, profileEmail });
      } catch {
        if (!controller.signal.aborted) setResult({ user: user!, token, emails: null, profileEmail: "" });
      }
    }
    void load();
    return () => controller.abort();
  }, [user, token, qaPreviewEnabled]);

  const current = result?.user === user && result?.token === token;
  const emails = qaPreviewEnabled ? [] : current ? result!.emails : undefined;
  const display = accountEmailDisplay(emails, qaPreviewEnabled ? user?.email : current ? result!.profileEmail : undefined);
  return <>
    <p className="mt-1 text-white">{display.value}</p>
    <p className={display.verified ? "mt-1 text-emerald-300" : "mt-1 text-slate-500"}>{display.status}</p>
  </>;
}
