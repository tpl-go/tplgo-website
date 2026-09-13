"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { getStoredAuthToken, getTplApiBaseUrl } from "@/app/lib/api/tplApiClient";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { latestAccountRead } from "@/app/lib/account/userAccountRead";

export type AccountRead = { status: "loading" | "ready" | "error" | "signed-out"; payload?: unknown };
export function useUserAccountRead(path: "/api/v1/me" | "/api/v1/me/device-sessions"): AccountRead {
  const { user } = useAuth();
  const token = getStoredAuthToken();
  const [result, setResult] = useState<{ owner: typeof user; token: string | null; read: AccountRead } | null>(null);
  useEffect(() => {
    if (!user) return;
    const order = latestAccountRead();
    let controller: AbortController | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      controller?.abort(); clearTimeout(timeout);
      controller = new AbortController();
      const signal = controller.signal;
      const isLatest = order.begin();
      const requestToken = getStoredAuthToken();
      const publish = (read: AccountRead) => {
        if (isLatest()) setResult({ owner: user, token: requestToken, read });
      };
      publish({ status: "loading" });
      timeout = setTimeout(() => { publish({ status: "error" }); order.cancel(); controller?.abort(); }, 15000);
      void (async () => {
        try {
          const base = getTplApiBaseUrl();
          if (!base) throw new Error("Account unavailable");
          const response = await fetch(`${base}${path}`, {
            credentials: "include", cache: "no-store", signal,
            headers: { Accept: "application/json", ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}) },
          });
          if (!response.ok) throw new Error("Account unavailable");
          const payload: unknown = await response.json();
          if (!signal.aborted) publish({ status: "ready", payload });
        } catch { if (!signal.aborted) publish({ status: "error" }); }
        finally { if (isLatest()) clearTimeout(timeout); }
      })();
    };
    const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === "tpl_auth_session_v1") load(); };
    load();
    window.addEventListener(AUTH_UPDATED_EVENT, load);
    window.addEventListener("storage", onStorage);
    return () => {
      order.cancel(); controller?.abort(); clearTimeout(timeout);
      window.removeEventListener(AUTH_UPDATED_EVENT, load);
      window.removeEventListener("storage", onStorage);
    };
  }, [user, token, path]);
  if (!user) return { status: "signed-out" };
  return result?.owner === user && result.token === token ? result.read : { status: "loading" };
}
