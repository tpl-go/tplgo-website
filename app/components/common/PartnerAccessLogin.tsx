"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { partnerAccessDestination, readPartnerAccess } from "@/app/lib/partner/partnerAccess";

export default function PartnerAccessLogin({ onClose, onUserLogin }: { onClose: () => void; onUserLogin: () => void }) {
  const auth = useAuth();
  const title = useId();
  const panel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [method, setMethod] = useState<"mobile" | "email">("mobile");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const valid = method === "mobile" ? /^\d{10}$/.test(identifier) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const destination = method === "mobile" ? `+91${identifier}` : identifier.trim().toLowerCase();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => { if (sent) panel.current?.querySelector<HTMLInputElement>('input[autocomplete="one-time-code"]')?.focus(); }, [sent]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  async function submit(resend = false) {
    if (busy.current || !valid || (sent && !resend && !/^\d{6}$/.test(otp)) || (resend && Date.now() < resendAt)) return;
    busy.current = true; setLoading(true); setError("");
    try {
      if (!sent || resend) {
        const result = await (method === "mobile" ? auth.sendOtp(destination, "partner") : auth.sendEmailOtp(destination, "partner"));
        setResendAt(Date.parse(result?.resendAvailableAt || "") || Date.now() + 60000);
        setOtp(""); setSent(true);
      } else {
        await (method === "mobile" ? auth.verifyOtp(destination, otp, "partner") : auth.verifyEmailOtp(destination, otp, "partner"));
        setOtp("");
        const access = await readPartnerAccess().catch(() => null);
        window.location.assign(access ? partnerAccessDestination(access) ?? "/partner-access" : "/partner-access");
      }
    } catch { setError("Unable to continue. Check the code or retry shortly."); }
    finally { busy.current = false; setLoading(false); }
  }
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={() => !loading && onClose()}>
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={title} className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 text-gray-900 shadow-xl" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => {
      if (event.key === "Escape" && !loading) onClose();
      if (event.key === "Tab") {
        const controls = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}>
      <button type="button" aria-label="Close" title="Close" className="absolute right-3 top-3 p-2" disabled={loading} onClick={onClose}><X size={20}/></button>
      <div role="tablist" aria-label="Login area" className="mb-6 flex gap-5 pr-8 text-sm"><button role="tab" aria-selected="false" disabled={loading} onClick={onUserLogin}>User Login</button><button role="tab" aria-selected="true" className="border-b-2 border-emerald-700 pb-2 font-semibold">Partner Access</button></div>
      <h2 id={title} className="text-xl font-semibold">Sign in or start your Partner application</h2>
      <p className="mt-2 text-sm text-gray-600">OTP verifies your identity only. It does not approve or activate a Partner.</p>
      <div className="my-5 flex gap-2" role="group" aria-label="Login method">{(["mobile", "email"] as const).map((value) => <button key={value} aria-pressed={method === value} disabled={loading || sent} className={`flex-1 border-b-2 py-2 capitalize ${method === value ? "border-emerald-700 font-semibold" : "border-gray-200"}`} onClick={() => { setMethod(value); setIdentifier(""); setError(""); }}>{value} login</button>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="block text-sm font-medium">{method === "mobile" ? "Mobile number (+91)" : "Email address"}<input className="mt-2 w-full rounded border border-gray-300 px-3 py-3" disabled={sent || loading} type={method === "email" ? "email" : "tel"} autoComplete={method === "email" ? "email" : "tel-national"} value={identifier} onChange={(event) => setIdentifier(method === "mobile" ? event.target.value.replace(/\D/g, "").slice(0,10) : event.target.value)} /></label>
        {sent && <label className="mt-4 block text-sm font-medium">Verification code<input className="mt-2 w-full rounded border border-gray-300 px-3 py-3" value={otp} inputMode="numeric" autoComplete="one-time-code" maxLength={6} disabled={loading} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0,6))}/></label>}
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading || !valid || (sent && otp.length !== 6)} className="mt-5 w-full rounded bg-emerald-800 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Please wait..." : "Continue with OTP"}</button>
      </form>
      {sent && <div className="mt-4 flex justify-between gap-3 text-sm"><button disabled={loading || now < resendAt} onClick={() => void submit(true)}>{now < resendAt ? `Resend in ${Math.ceil((resendAt-now)/1000)}s` : "Resend OTP"}</button><button disabled={loading} onClick={() => { setSent(false); setOtp(""); setError(""); }}>Change login</button></div>}
    </div>
  </div>;
}
