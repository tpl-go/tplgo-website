"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { partnerAccessDestination, readPartnerAccess, startPartnerApplication, type PartnerAccess } from "@/app/lib/partner/partnerAccess";

export default function PartnerAccessPage() {
  const { openLoginModal } = useAuth();
  const [access, setAccess] = useState<PartnerAccess | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const busy = useRef(false);
  const key = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const accept = useCallback((result: PartnerAccess) => {
    const destination = partnerAccessDestination(result);
    if (destination) window.location.replace(destination);
    else setAccess(result);
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try { accept(await readPartnerAccess()); } catch { setError("Partner access could not be confirmed. Sign in or retry."); }
    finally { setLoading(false); }
  }, [accept]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { heading.current?.focus(); }, [recovery, access]);
  async function start() {
    if (busy.current || access?.outcome !== "NO_LINKED_PROFILE") return;
    busy.current = true; setLoading(true); setError("");
    try { key.current ??= crypto.randomUUID(); accept(await startPartnerApplication(key.current)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to open your application. Please retry."); }
    finally { busy.current = false; setLoading(false); }
  }
  const button = "rounded bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50";
  return <main className="mx-auto min-h-[65vh] w-full max-w-2xl px-5 py-12 text-gray-900">
    <Link href="/" className="text-sm text-emerald-800">TPL GO</Link>
    {recovery ? <><h1 ref={heading} tabIndex={-1} className="mt-8 text-2xl font-semibold">Recover Existing Partner Access</h1><p className="my-5">Secure recovery is not yet available on staging.</p><div className="flex flex-wrap gap-4"><Link href="/customer-support" className={button}>Support</Link><button onClick={() => setRecovery(false)}>Back</button></div></> : <>
      <h1 ref={heading} tabIndex={-1} className="mt-8 text-2xl font-semibold">{access?.outcome === "NO_LINKED_PROFILE" ? "No Partner profile is linked to this login" : access?.outcome === "SETUP_PENDING" ? "Application approved. Setup pending" : "Partner Access"}</h1>
      {loading && <p role="status" className="my-5">Opening Partner access...</p>}
      {access?.outcome === "NO_LINKED_PROFILE" && <><p className="my-5">Start a new application, or recover access if you have already applied using another mobile number or email.</p><div className="flex flex-col gap-4 sm:flex-row"><button className={button} disabled={loading} onClick={() => void start()}>Start New Partner Application</button><button className="rounded border border-gray-300 px-4 py-3 text-sm" disabled={loading} onClick={() => setRecovery(true)}>Recover Existing Partner Access</button></div></>}
      {access?.outcome === "SETUP_PENDING" && <p className="my-5">Your application is approved. Organization, services, payouts and operational Partner Desk access are not activated by this approval.</p>}
      {access && ["ACTIVE", "RESTRICTED", "SELECTION_REQUIRED"].includes(access.outcome) && <><p className="my-5">{access.outcome === "SELECTION_REQUIRED" ? "Contact Support to select your Partner organization." : access.outcome === "RESTRICTED" ? "Your Partner access requires Support assistance." : "Operational workspace access must be confirmed before continuing. Contact Support."}</p><Link href="/customer-support" className={button}>Support</Link></>}
      {error && <div className="mt-6"><p role="alert" className="mb-4 text-red-700">{error}</p><div className="flex gap-5"><button onClick={() => void refresh()} disabled={loading}>Retry</button><button onClick={() => openLoginModal({ accountType: "partner" })}>Sign in</button></div></div>}
    </>}
  </main>;
}
