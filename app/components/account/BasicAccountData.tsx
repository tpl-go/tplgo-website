"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { getStoredAuthToken, getTplApiBaseUrl } from "@/app/lib/api/tplApiClient";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import type { BasicRecord } from "@/app/lib/account/basicAccount";

export class AccountDataError extends Error { constructor(public code: string, message: string) { super(message); } }
type Status = "loading" | "ready" | "error";
function useResource(kind: "profile" | "travellers") {
  const { user, isAuthenticated } = useAuth();
  const token = getStoredAuthToken();
  const current = useRef({ user, token, isAuthenticated }); current.current = { user, token, isAuthenticated };
  const generation = useRef(0);
  const [state, setState] = useState<{ owner: typeof user; token: string | null; status: Status; rows: BasicRecord[] }>({ owner: null, token: null, status: "loading", rows: [] });
  const request = useCallback(async (method = "GET", body?: unknown, id?: string, operation?: string) => {
    const owner = user, requestToken = token, epoch = generation.current;
    const valid = () => current.current.user === owner && current.current.isAuthenticated && current.current.token === requestToken && getStoredAuthToken() === requestToken && generation.current === epoch;
    if (!owner?.id || !isAuthenticated || !valid()) throw new AccountDataError("STALE_OWNER", "Sign in to access your details.");
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
    try {
      const base = getTplApiBaseUrl(); if (!base) throw new Error();
      const response = await fetch(`${base}/api/v1/me/${kind}${id ? `/${id}` : ""}`, { method, credentials: "include", cache: "no-store", signal: controller.signal,
        headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}), ...(operation ? { "Idempotency-Key": operation } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      const payload = await response.json();
      if (!valid()) throw new AccountDataError("STALE_OWNER", "Your account changed. Open your details again.");
      if (controller.signal.aborted) throw new Error();
      if (!response.ok || payload.ok === false) throw new AccountDataError(payload.error?.code ?? "UNAVAILABLE", payload.error?.message ?? "We could not complete this request. Your edits are still here; retry.");
      const data = payload.data;
      if (method === "DELETE") return [];
      const rows: BasicRecord[] = method === "GET" && kind === "travellers" ? data?.travellers : (data?.profile ?? data?.traveller) ? [data.profile ?? data.traveller] : kind === "profile" && data?.profile === null ? [] : null;
      if (!Array.isArray(rows) || rows.some(r => r.userId !== owner.id || typeof r.id !== "string" || !Number.isInteger(r.version) || r.version < 1)) throw new Error();
      return rows;
    } catch (e) { if (e instanceof AccountDataError) throw e; throw new AccountDataError("UNAVAILABLE", "We could not complete this request. Your edits are still here; retry."); }
    finally { clearTimeout(timer); }
  }, [user, token, isAuthenticated, kind]);
  const reload = useCallback(async () => {
    const sequence = ++generation.current;
    setState({ owner: user, token, status: "loading", rows: [] });
    try { const rows = await request(); if (sequence === generation.current) setState({ owner: user, token, status: "ready", rows }); return rows; }
    catch (error) { if (sequence === generation.current) setState({ owner: user, token, status: "error", rows: [] }); throw error; }
  }, [user, token, request]);
  useEffect(() => {
    const refresh = () => { void reload().catch(() => {}); };
    refresh(); window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    // This is an ordering counter, not a DOM ref: cleanup must invalidate the current generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { generation.current++; window.removeEventListener(AUTH_UPDATED_EVENT, refresh); };
  }, [reload]);
  const save = async (method: string, body?: unknown, id?: string, operation?: string) => {
    const rows = await request(method, body, id, operation);
    setState(previous => ({ owner: user, token, status: "ready", rows: kind === "profile" ? rows : method === "DELETE" ? previous.rows.filter(r => r.id !== id) : [...previous.rows.filter(r => r.id !== rows[0].id), ...rows] }));
    return rows[0];
  };
  const validState = isAuthenticated && state.owner === user && state.token === token;
  return { status: validState ? state.status : "loading" as Status, rows: validState ? state.rows : [], reload, save, owner: user };
}
type Resource = ReturnType<typeof useResource>;
const Context = createContext<{ profile: Resource; travellers: Resource } | null>(null);
export function BasicAccountProvider({ children }: { children: React.ReactNode }) {
  const profile = useResource("profile"), travellers = useResource("travellers");
  return <Context.Provider value={{ profile, travellers }}>{children}</Context.Provider>;
}
export function useBasicAccount() { const context = useContext(Context); if (!context) throw new Error("Account context required"); return context; }
export function AccountReadState({ resource }: { resource: Resource }) {
  return <div className="p-6" role="status">{resource.status === "loading" ? "Loading your saved details…" : "Your saved details are unavailable."}{resource.status === "error" && <button className="ml-3 underline" onClick={() => void resource.reload().catch(() => {})}>Retry</button>}</div>;
}
export function SavedBasicReview({ details }: { details: object }) {
  const labels: Record<string, string> = { firstName: "First and middle name", lastName: "Last name", gender: "Gender", dob: "Date of birth", email: "Personal email", mobile: "Personal mobile", nationality: "Nationality", maritalStatus: "Marital status", anniversary: "Anniversary", country: "Country code", state: "State or region", city: "City", relation: "Relationship", frequentFlyers: "Frequent flyers" };
  return <section aria-label="Latest saved details"><h2>Latest saved values - your edits below are unchanged</h2><dl className="break-words text-xs">{Object.entries(details).filter(([key]) => key in labels).map(([key, value]) => <div key={key}><dt className="font-semibold">{labels[key]}</dt><dd>{Array.isArray(value) ? value.filter(f => f.airline || f.flyerNumber).map(f => `${f.airline}: ${f.flyerNumber}`).join("; ") || "Not added" : value || "Not added"}</dd></div>)}</dl></section>;
}
