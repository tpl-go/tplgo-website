"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApiRequest, readAdminSession } from "@/app/lib/admin/adminApiClient";
import { watchVisiblePublication } from "@/app/lib/partner/publishedRefresh";

type State = "loading" | "ready" | "error" | "forbidden";
function ownerKey() {
  const session = readAdminSession();
  return session ? JSON.stringify([session.admin.id, session.session.id, session.session.token, session.admin.permissions]) : "";
}

/** Scoped refresh only: does not change filters, selection, pagination or focus. */
export function usePartnerPublishedRead<T>(path: string | null, permissions: readonly string[], validate?: (value: unknown) => boolean) {
  const [result, setResult] = useState<{ key: string; owner: string; state: State; data: T | null }>({ key: "", owner: "", state: "loading", data: null });
  const retryRef = useRef<() => void>(() => {});
  const permissionKey = permissions.join("|");
  useEffect(() => {
    if (!path) return;
    let live = true, pending = false;
    let catalogueVersion = -1;
    const owner = ownerKey();
    const clear = () => {
      if (ownerKey() !== owner) { live = false; setResult({ key: path, owner: "", state: "forbidden", data: null }); }
    };
    const refresh = async () => {
      clear();
      if (!live || pending) return;
      const session = readAdminSession();
      if (!session || !permissionKey.split("|").every(p => session.admin.permissions.includes(p))) {
        setResult({ key: path, owner, state: "forbidden", data: null }); return;
      }
      pending = true;
      setResult(current => current.key === path && current.owner === owner && current.data ? current : { key: path, owner, state: "loading", data: null });
      try {
        const response = await adminApiRequest<T>(path);
        if (!live || ownerKey() !== owner) return;
        if (response.ok && (!validate || validate(response.data))) {
          const version = (response.data as { catalogueVersion?: number } | null)?.catalogueVersion;
          if (typeof version === "number" && version < catalogueVersion) {
            setResult(current => ({ ...current, state: "error" })); return;
          }
          if (typeof version === "number") catalogueVersion = version;
          setResult({ key: path, owner, state: "ready", data: response.data });
        } else {
          const forbidden = !response.ok && [401, 403].includes(response.status);
          setResult(current => ({ key: path, owner, state: forbidden ? "forbidden" : "error", data: !forbidden && current.key === path && current.owner === owner ? current.data : null }));
        }
      } catch {
        if (live && ownerKey() === owner) setResult(current => ({ key: path, owner, state: "error", data: current.key === path && current.owner === owner ? current.data : null }));
      } finally { pending = false; }
    };
    retryRef.current = () => { if (document.visibilityState !== "hidden") void refresh(); };
    const stop = watchVisiblePublication(refresh);
    const checkOwner = window.setInterval(clear, 1000);
    window.addEventListener("storage", clear);
    return () => { live = false; stop(); clearInterval(checkOwner); window.removeEventListener("storage", clear); };
  }, [path, permissionKey, validate]);
  return { data: result.key === path ? result.data : null, state: result.key === path ? result.state : "loading" as State, retry: useCallback(() => retryRef.current(), []) };
}
