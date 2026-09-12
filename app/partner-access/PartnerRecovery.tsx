"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { completeRecovery, RecoveryError, recoverySupportMessage, startRecovery, verifyRecovery, type RecoveryConfirmation } from "@/app/lib/partner/partnerRecovery";
import type { PartnerAccess } from "@/app/lib/partner/partnerAccess";

const action = "min-h-11 rounded-xl bg-amber-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";
const secondary = "min-h-11 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";
const field = "mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-white focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/30";

export default function PartnerRecovery({ onCancel, onComplete }: { onCancel: () => void; onComplete: (access: PartnerAccess) => void }) {
  const { adoptRecoveredPartnerSession } = useAuth();
  const [stage, setStage] = useState<"find" | "verify" | "confirm" | "support">("find");
  const [channel, setChannel] = useState<"mobile" | "email">("mobile");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof startRecovery>> | null>(null);
  const [confirmation, setConfirmation] = useState<RecoveryConfirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [now, setNow] = useState(Date.now());
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { heading.current?.focus(); }, [stage]);
  const countdown = challenge ? Math.max(0, Math.ceil((Date.parse(challenge.resendAvailableAt) - now) / 1000)) : 0;
  const expired = Boolean(challenge && Date.parse(challenge.expiresAt) <= now);
  async function run(operation: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try { await operation(); } catch (caught) {
      if (caught instanceof RecoveryError && caught.status === 409) setStage("support");
      else setError(caught instanceof RecoveryError ? caught.message : "Recovery could not be completed. Please try again.");
    } finally { inFlight.current = false; setBusy(false); }
  }
  const send = () => run(async () => { const result = await startRecovery(channel, contact); setChallenge(result); setOtp(""); setFailedAttempts(0); setNow(Date.now()); setStage("verify"); });
  async function confirm() {
    if (!challenge) return;
    let result;
    try { result = await completeRecovery(challenge.challenge); }
    catch (caught) {
      // A committed response can be lost after its HttpOnly cookie rotated. The
      // new cookie must authenticate before the server accepts an idempotent retry.
      if (!(caught instanceof RecoveryError) || ![401, 503].includes(caught.status)) throw caught;
      await adoptRecoveredPartnerSession(null);
      result = await completeRecovery(challenge.challenge);
    }
    await adoptRecoveredPartnerSession(result.session);
    setContact(""); setChallenge(null); onComplete(result.access);
  }
  return <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-8" aria-busy={busy}>
    <h1 ref={heading} tabIndex={-1} className="text-2xl font-black tracking-tight outline-none sm:text-3xl">{stage === "find" ? "Find your Partner application" : stage === "verify" ? "Verify ownership" : stage === "confirm" ? "Confirm account recovery" : "Contact Partner Support"}</h1>
    {stage === "find" && <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); void send(); }}>
      <p className="text-sm leading-6 text-slate-300">Use the mobile number or email registered on your existing application.</p>
      <label className="block text-sm font-semibold">Registered contact<select className={field} value={channel} disabled={busy} onChange={(event) => { setChannel(event.target.value as "mobile" | "email"); setContact(""); }}><option value="mobile">Mobile</option><option value="email">Email</option></select></label>
      <label className="block text-sm font-semibold">{channel === "mobile" ? "Registered mobile number" : "Registered email"}<input className={field} type={channel === "mobile" ? "tel" : "email"} autoComplete="off" value={contact} required maxLength={channel === "mobile" ? 24 : 254} disabled={busy} placeholder={channel === "mobile" ? "+91 mobile number" : "Registered email"} onChange={(event) => setContact(event.target.value)} /></label>
      {channel === "mobile" && <p className="text-xs text-slate-400">Include the country code for numbers outside India.</p>}
      <button className={action} disabled={busy || !contact.trim()}>Send verification code</button>
    </form>}
    {stage === "verify" && <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); void run(async () => { if (!challenge || failedAttempts >= 5) return; try { setConfirmation(await verifyRecovery(challenge.challenge, otp)); } catch (caught) { if (caught instanceof RecoveryError && caught.status === 400) setFailedAttempts((count) => count + 1); throw caught; } setOtp(""); setStage("confirm"); }); }}>
      <p className="text-sm leading-6 text-slate-300">If automatic recovery is available, a code will be sent to the contact you entered.</p>
      <label className="block text-sm font-semibold">Verification code<input className={`${field} text-center text-2xl tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} disabled={busy || expired} required onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} /></label>
      {expired && <p role="status" className="text-sm text-amber-200">This code has expired. Request a new code.</p>}
      {failedAttempts >= 5 && <p role="status" className="text-sm text-amber-200">Request a new code to try again.</p>}
      <div className="flex flex-wrap gap-3"><button className={action} disabled={busy || expired || failedAttempts >= 5 || otp.length !== 6}>Verify code</button><button type="button" className={secondary} disabled={busy || countdown > 0} onClick={() => void send()}>{countdown ? `Resend in ${countdown}s` : "Resend code"}</button></div>
    </form>}
    {stage === "confirm" && confirmation && <div className="mt-6 space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="break-words text-xl font-bold">{confirmation.displayName}</h2><p className="mt-2 text-sm text-amber-200">{confirmation.statusLabel}</p>{confirmation.reference && <p className="mt-2 text-sm text-slate-300">{confirmation.reference}</p>}</div>
      <p className="text-sm leading-6 text-slate-300">Your current login will open this Partner account. Other sessions will be signed out.</p>
      <button className={action} disabled={busy || expired} onClick={() => void run(confirm)}>Confirm recovery</button>
      {expired && <p role="status" className="text-sm text-amber-200">Verification has expired. Go back and request a new code.</p>}
    </div>}
    {stage === "support" && <div className="mt-6 space-y-5"><p className="text-sm leading-6 text-slate-300">{recoverySupportMessage}</p><Link className={`${secondary} inline-flex items-center`} href="/customer-support">Contact Partner Support</Link></div>}
    {busy && <p role="status" className="mt-5 text-sm text-slate-300">{stage === "confirm" ? "Opening your Partner account…" : "Please wait…"}</p>}
    {error && <p role="alert" className="mt-5 text-sm text-amber-200">{error}</p>}
    <div className="mt-7 flex flex-wrap gap-3">{stage !== "find" && <button type="button" className={secondary} disabled={busy} onClick={() => { setStage("find"); setOtp(""); setConfirmation(null); setError(""); }}>Back</button>}<button type="button" className={secondary} disabled={busy} onClick={onCancel}>Cancel</button></div>
  </section>;
}
