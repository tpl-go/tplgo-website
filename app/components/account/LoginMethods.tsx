"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { getStoredAuthToken, getTplApiBaseUrl } from "@/app/lib/api/tplApiClient";
import CountryDialCodeSelect from "@/app/components/common/CountryDialCodeSelect";
import { getCountry } from "@/app/lib/auth/mobileCountries";

type Method = { id: string; provider: string; label: string; verified: boolean };
type Flow = { channel: "mobile" | "email"; actionId?: string; challenge?: string; phase: "method" | "reauth" | "google" | "target" | "complete" | "reconcile"; completionKey?: string };
type Result = { ownerId?: string; methods?: Method[]; actionId?: string; challenge?: string; authorizationUrl?: string; status?: string; verified?: boolean; session?: { token: string; expiresAt: string } };

export default function LoginMethods() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const token = getStoredAuthToken();
  if (!user || !isAuthenticated || isAuthLoading) return null;
  return <Methods key={`${user.id}:${token ?? "cookie"}`} ownerId={user.id} />;
}

function Methods({ ownerId }: { ownerId: string }) {
  const { adoptLinkedUserSession } = useAuth();
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [methodId, setMethodId] = useState("");
  const [otp, setOtp] = useState("");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("IN");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const alive = useRef(true);
  const sequence = useRef(0);
  const controllers = useRef(new Set<AbortController>());
  const token = useRef(getStoredAuthToken());
  useEffect(() => { alive.current = true; const pending = controllers.current; return () => { alive.current = false; for (const controller of pending) controller.abort(); }; }, []);
  const request = useCallback(async (path: string, body?: object): Promise<Result> => {
    const base = getTplApiBaseUrl();
    if (!base) throw new Error("Account service is unavailable. Please try again.");
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
    const response = await fetch(`${base}/api/v1/me/login-methods${path}`, {
      method: body ? "POST" : "GET", credentials: "include", cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(token.current ? { Authorization: `Bearer ${token.current}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "We could not complete this check. Please try again.");
    if (payload.data?.ownerId && payload.data.ownerId !== ownerId) throw new Error("Your account changed. Please start again.");
    return payload.data;
    } finally { controllers.current.delete(controller); }
  }, [ownerId]);
  const load = useCallback(async () => {
    const order = ++sequence.current; setError("");
    try { const data = await request(""); if (alive.current && sequence.current === order) setMethods(data.methods ?? []); }
    catch { if (alive.current && sequence.current === order) setError("We could not load your login methods. Please retry."); }
  }, [request]);
  useEffect(() => { void load(); }, [load]);
  const cancel = () => { sequence.current++; setFlow(null); setOtp(""); setContact(""); setError(""); setBusy(false); };
  const run = async () => {
    if (!flow || busy) return;
    const order = ++sequence.current;
    const current = () => alive.current && order === sequence.current && token.current === getStoredAuthToken();
    setBusy(true); setError("");
    try {
      if (flow.phase === "method") {
        const result = await request("/reauth/start", { operation: `add_${flow.channel}`, methodId });
        if (!current()) return;
        setOtp("");
        setFlow({ ...flow, actionId: result.actionId, challenge: result.challenge, phase: result.authorizationUrl ? "google" : "reauth" });
        if (result.authorizationUrl) {
          const url = new URL(result.authorizationUrl);
          if (url.origin !== "https://accounts.google.com") throw new Error("Google verification is unavailable.");
          window.open(url.toString(), "tpl-login-method-reauth", "popup,width=520,height=700");
        }
      } else if (flow.phase === "reauth" || flow.phase === "google") {
        await request("/reauth/verify", { actionId: flow.actionId, ...(flow.phase === "reauth" ? { challenge: flow.challenge, otp } : {}) });
        if (!current()) return;
        setOtp(""); setFlow({ ...flow, phase: "target" });
      } else if (flow.phase === "target") {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        const completionKey = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
        const selected = getCountry(country);
        const normalized = flow.channel === "email" ? contact.trim() : `+${selected.dialCode}${contact.replace(/\D/g, "")}`;
        const result = await request("/link/start", { actionId: flow.actionId, channel: flow.channel, contact: normalized, completionKey });
        if (!current()) return;
        if (result.status === "already_added") { cancel(); setMessage("This login method is already added."); return; }
        setOtp(""); setFlow({ ...flow, challenge: result.challenge, completionKey, phase: "complete" });
      } else {
        let result: Result;
        try {
          result = await request(flow.phase === "reconcile" ? "/link/reconcile" : "/link/complete", {
            actionId: flow.actionId, completionKey: flow.completionKey,
            ...(flow.phase === "complete" ? { challenge: flow.challenge, otp } : {}),
          });
        } catch (failure) {
          // Only transport uncertainty may mean completion committed without its response.
          if (current() && (failure instanceof TypeError || (failure instanceof DOMException && ["TimeoutError", "AbortError"].includes(failure.name)))) {
            setOtp(""); setFlow({ ...flow, phase: "reconcile" });
          }
          throw failure;
        }
        if (!current()) return;
        if (!result.session) throw new Error("Sign in again to confirm your updated login methods.");
        try { await adoptLinkedUserSession(result.session, ownerId, token.current); }
        catch (failure) { if (current()) { setOtp(""); setFlow({ ...flow, phase: "reconcile" }); } throw failure; }
      }
    } catch (failure) { if (current()) setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { if (current()) setBusy(false); }
  };
  return <section aria-label="Verified login methods" className="rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-sm sm:p-5">
    <h2 className="text-base font-semibold leading-6 text-slate-950">Your verified login methods</h2>
    <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-slate-600">Adding a login method does not change your profile or business contacts, or approve Partner or Creator access.</p>
    {methods === null ? <p className="mt-4 font-medium text-slate-700">{error ? "Login methods unavailable." : "Loading login methods…"}</p> : <ul className="my-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{methods.map(method => <li key={method.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"><span className="min-w-0 break-words font-medium text-slate-900">{method.label}</span><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">{method.provider === "google" ? "Connected" : "Verified"}</span></li>)}{!methods.some(m => m.provider === "google") && <li className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 font-medium text-slate-600">Google is not connected.</li>}</ul>}
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}
    {message && <p role="status" className="my-3 text-emerald-700">{message}</p>}
    {!flow && methods === null && error && <button type="button" onClick={() => void load()} className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800">Retry</button>}
    {!flow && methods && <div className="flex flex-wrap gap-3">{(["mobile", "email"] as const).map(channel => <button key={channel} type="button" disabled={!methods.length} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-100" onClick={() => { setMessage(""); setError(""); setMethodId(methods[0]?.id ?? ""); setFlow({ channel, phase: "method" }); }}>Add {channel}</button>)}</div>}
    {flow && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-slate-700">
      <p className="font-semibold text-slate-950">Add {flow.channel}</p>
      {flow.phase === "method" && <label className="block font-medium text-slate-800">First, confirm an existing login method<select aria-label="Existing login method" value={methodId} onChange={e => setMethodId(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">{methods?.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label>}
      {flow.phase === "google" && <p className="leading-6 text-slate-700">Complete Google verification in the separate window using your connected account, then continue here. If the window was blocked, cancel and try again with popups allowed.</p>}
      {flow.phase === "target" && <><label className="block font-medium text-slate-800">New {flow.channel}{flow.channel === "mobile" && <CountryDialCodeSelect label="New mobile" value={country} onChange={setCountry} className="my-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />}<input aria-label={`New ${flow.channel}`} type={flow.channel === "email" ? "email" : "tel"} autoComplete="off" value={contact} onChange={e => setContact(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label><p className="text-xs leading-5 text-slate-600">An identifier already used by another account cannot be moved here.</p></>}
      {(flow.phase === "reauth" || flow.phase === "complete") && <label className="block font-medium text-slate-800">{flow.phase === "reauth" ? "Code for your existing login method" : "Code for your new login method"}<input aria-label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /><span className="mt-1 block text-xs font-normal leading-5 text-slate-600">Codes expire after five minutes. To request another, restart after the waiting period.</span></label>}
      {flow.phase === "reconcile" && <p className="leading-6 text-slate-700">The response was interrupted. Retry confirmation within two minutes. This only retrieves the result of this addition.</p>}
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void run()} disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-300 disabled:text-white disabled:opacity-100">{busy ? "Please wait…" : flow.phase === "complete" ? `Confirm Add ${flow.channel}` : flow.phase === "reconcile" ? "Retry confirmation" : "Continue"}</button><button type="button" onClick={cancel} className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</button></div>
    </div>}
  </section>;
}
