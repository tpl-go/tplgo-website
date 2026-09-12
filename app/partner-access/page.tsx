"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileCheck2, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  PartnerAccessRequestError,
  partnerAccessDestination,
  readPartnerAccess,
  startPartnerApplication,
  type PartnerAccess,
  type PartnerProfile,
} from "@/app/lib/partner/partnerAccess";
import {
  fetchPartnerApplicationSubmissionForOrganization,
  type PartnerApplicationReadiness,
  type PartnerApplicationSubmissionSummary,
} from "@/app/lib/partner/partnerApiClient";
import { readPartnerProfilePreference } from "@/app/lib/partner/partnerProfilePreference";
import {
  cleanPartnerApplicationName,
  partnerProfileLifecycleLabel,
} from "@/app/lib/partner/partnerOperatorPresentation";
import { visibleSubmissionReference } from "@/app/lib/partner/partnerStep8Review";
import PartnerAccessShell from "./PartnerAccessShell";
import PartnerProfileChooser from "./PartnerProfileChooser";
import PartnerRecovery from "./PartnerRecovery";

type PartnerView = "access" | "landing" | "recovery";
type PartnerStatusSummary = {
  readiness: PartnerApplicationReadiness;
  latestSubmission: PartnerApplicationSubmissionSummary | null;
};

export default function PartnerAccessPage() {
  const { isAuthLoading, isAuthenticated, user, openLoginModal, logout } = useAuth();
  const [access, setAccess] = useState<PartnerAccess | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PartnerProfile | null>(null);
  const [statusSummary, setStatusSummary] = useState<PartnerStatusSummary | null>(null);
  const [summaryState, setSummaryState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PartnerView>("access");
  const [multipleProfiles, setMultipleProfiles] = useState(false);
  const startBusy = useRef(false);
  const resolveInFlight = useRef<Promise<void> | null>(null);
  const sessionResetInFlight = useRef<Promise<void> | null>(null);
  const startKey = useRef<string | null>(null);

  const accept = useCallback((result: PartnerAccess, profile?: PartnerProfile) => {
    const destination = partnerAccessDestination(result);
    if (destination) {
      window.location.replace(destination);
      return;
    }
    if (profile) {
      setSelectedProfile(profile);
      setMultipleProfiles(true);
    }
    if (result.outcome === "SELECTION_REQUIRED") setMultipleProfiles(true);
    setAccess(result);
    setView("access");
  }, []);

  const refresh = useCallback((revalidateRememberedSelection = true) => {
    if (resolveInFlight.current) return resolveInFlight.current;
    const hadPreference = Boolean(readPartnerProfilePreference());
    const request = (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await readPartnerAccess({ revalidateRememberedSelection });
        if (hadPreference && result.outcome !== "SELECTION_REQUIRED") setMultipleProfiles(true);
        accept(result);
      } catch (caught) {
        if (caught instanceof PartnerAccessRequestError && caught.status === 401) {
          await logout();
          setAccess(null);
          setError("Your session has expired. Sign in again to continue.");
        } else {
          setError("Your Partner account could not be opened. Please retry.");
        }
      } finally {
        setLoading(false);
      }
    })();
    resolveInFlight.current = request;
    void request.finally(() => {
      if (resolveInFlight.current === request) resolveInFlight.current = null;
    });
    return request;
  }, [accept, logout]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const explicitExit = new URLSearchParams(window.location.search).get("intent") === "exit";
    if (explicitExit) {
      setAccess(null);
      setSelectedProfile(null);
      setStatusSummary(null);
      setSummaryState("idle");
      setView("landing");
      setLoading(false);
      return;
    }
    void refresh();
  }, [isAuthLoading, isAuthenticated, refresh]);

  useEffect(() => {
    const organizationId = access?.organizationId;
    if (!organizationId || !["APPLICATION_STATUS", "SETUP_PENDING", "ACTIVE"].includes(access.outcome)) {
      setStatusSummary(null);
      setSummaryState("idle");
      return;
    }
    let cancelled = false;
    setSummaryState("loading");
    void fetchPartnerApplicationSubmissionForOrganization(organizationId).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data.readiness.organizationId === organizationId) {
        setStatusSummary(result.data);
        setSummaryState("ready");
      } else {
        setStatusSummary(null);
        setSummaryState("error");
      }
    });
    return () => { cancelled = true; };
  }, [access]);

  async function start() {
    if (startBusy.current || access?.outcome !== "NO_LINKED_PROFILE") return;
    startBusy.current = true;
    setLoading(true);
    setError("");
    try {
      startKey.current ??= crypto.randomUUID();
      accept(await startPartnerApplication(startKey.current));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The application could not be opened. Please retry.");
    } finally {
      startBusy.current = false;
      setLoading(false);
    }
  }

  function resetPartnerViewState() {
    setAccess(null);
    setSelectedProfile(null);
    setStatusSummary(null);
    setSummaryState("idle");
    setMultipleProfiles(false);
    setView("access");
    setLoading(false);
    setError("");
  }

  function resetSession(destination: "home" | "partner-login") {
    if (sessionResetInFlight.current) return sessionResetInFlight.current;
    const request = (async () => {
      await logout();
      resetPartnerViewState();
      if (destination === "home") {
        window.location.replace("/");
        return;
      }
      openLoginModal({ accountType: "partner", intent: "partner" });
    })();
    sessionResetInFlight.current = request;
    void request.finally(() => {
      if (sessionResetInFlight.current === request) sessionResetInFlight.current = null;
    });
    return request;
  }

  function openPartnerLanding() {
    setView("landing");
    setError("");
  }

  function reopenPartnerAccount() {
    if (new URLSearchParams(window.location.search).get("intent") === "exit") {
      window.history.replaceState(window.history.state, "", "/partner-access");
    }
    setView("access");
    setAccess(null);
    setSelectedProfile(null);
    setStatusSummary(null);
    void refresh(false);
  }

  function backFromDestination() {
    if (multipleProfiles) {
      setAccess(null);
      setSelectedProfile(null);
      setStatusSummary(null);
      void refresh(false);
      return;
    }
    openPartnerLanding();
  }

  const displayName = user?.fullName;
  const shellTitle = !isAuthLoading && !isAuthenticated ? "Partner Login" : partnerShellTitle(view, access);
  const shell = (content: React.ReactNode, authenticated = isAuthenticated) => (
    <PartnerAccessShell
      title={shellTitle}
      displayName={displayName}
      authenticated={authenticated}
      onUseAnotherLogin={() => { void resetSession("partner-login"); }}
      onLogout={() => { void resetSession("home"); }}
    >
      {content}
    </PartnerAccessShell>
  );

  if (isAuthLoading) {
    return shell(<LoadingState text="Opening your Partner account…" />, false);
  }

  if (!isAuthenticated) {
    return shell(
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Partner Login</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-300">Sign in to continue to your Partner application or account.</p>
        {error ? <p role="alert" className="mt-5 text-sm font-semibold text-red-200">{error}</p> : null}
        <button type="button" onClick={() => openLoginModal({ accountType: "partner", intent: "partner" })} className={`${primaryActionClass} mt-7`}>
          Continue to Partner Login <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>,
      false,
    );
  }

  if (view === "landing") {
    return shell(
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">TPL GO Partner</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Partner Desk</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-300">Open your Partner application or account in the secure Partner workspace.</p>
        <button type="button" onClick={reopenPartnerAccount} className={`${primaryActionClass} mt-7`}>
          Continue to Partner account <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>,
    );
  }

  if (view === "recovery") {
    return shell(<PartnerRecovery onCancel={() => setView("access")} onComplete={accept} />);
  }

  if (loading && !access) return shell(<LoadingState text="Opening your Partner account…" />);

  if (error && !access) {
    return shell(
      <div className="mx-auto max-w-xl">
        <ShieldAlert aria-hidden="true" className="h-9 w-9 text-red-300" />
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Partner account unavailable</h1>
        <p role="alert" className="mt-4 text-sm font-semibold text-red-100">{error}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" disabled={loading} onClick={() => void refresh()} className={primaryActionClass}>Retry</button>
          <button type="button" onClick={() => { void resetSession("partner-login"); }} className={secondaryActionClass}>Use another Partner login</button>
        </div>
      </div>,
    );
  }

  if (access?.outcome === "SELECTION_REQUIRED") {
    return shell(<PartnerProfileChooser profiles={access.profiles ?? []} onSelected={accept} onBack={openPartnerLanding} />);
  }

  if (access?.outcome === "NO_LINKED_PROFILE") {
    return shell(
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">No Partner application found</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-300 sm:text-base">
          We could not find a Partner application or account linked to this login. Check the mobile number, email or Google account you used earlier.
        </p>
        {error ? <p role="alert" className="mt-5 text-sm font-semibold text-red-200">{error}</p> : null}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => { void resetSession("partner-login"); }} className={secondaryActionClass}>Use another Partner login</button>
          <button type="button" disabled={loading} onClick={() => setView("recovery")} className={secondaryActionClass}>Recover existing application</button>
          <button type="button" disabled={loading} onClick={() => void start()} className={primaryActionClass}>
            {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            Start a new Partner application
          </button>
        </div>
        <button type="button" onClick={() => { void resetSession("partner-login"); }} className={`${backActionClass} mt-8`}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>
      </div>,
    );
  }

  if (access && ["APPLICATION_STATUS", "SETUP_PENDING", "ACTIVE"].includes(access.outcome) && !selectedProfile && (summaryState === "idle" || summaryState === "loading")) {
    return shell(<LoadingState text="Confirming your Partner account…" />);
  }

  if (access?.outcome === "APPLICATION_STATUS") {
    return shell(
      <SubmittedStatus
        profile={selectedProfile}
        summary={statusSummary}
        summaryState={summaryState}
        onBack={backFromDestination}
      />,
    );
  }

  if (access?.outcome === "ACTIVE") {
    return shell(
      <ActiveHolding profile={selectedProfile} summary={statusSummary} summaryState={summaryState} onBack={backFromDestination} />,
    );
  }

  if (access?.outcome === "SETUP_PENDING") {
    return shell(
      <SetupPending profile={selectedProfile} summary={statusSummary} summaryState={summaryState} onBack={backFromDestination} />,
    );
  }

  if (access?.outcome === "RESTRICTED") {
    return shell(
      <div className="mx-auto max-w-2xl">
        <ShieldAlert aria-hidden="true" className="h-10 w-10 text-amber-300" />
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Partner account access is unavailable</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-300">Contact Partner Support for help with this account.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/customer-support" className={secondaryActionClass}>Contact Partner Support</Link>
          <button type="button" onClick={backFromDestination} className={backActionClass}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>
        </div>
      </div>,
    );
  }

  return shell(<LoadingState text="Opening your Partner account…" />);
}

function SubmittedStatus({ profile, summary, summaryState, onBack }: { profile: PartnerProfile | null; summary: PartnerStatusSummary | null; summaryState: "idle" | "loading" | "ready" | "error"; onBack: () => void }) {
  const name = partnerBusinessName(profile, summary);
  const reference = profile?.reference ?? visibleSubmissionReference(summary?.latestSubmission ?? null);
  const date = summary?.latestSubmission?.submittedAt ?? profile?.updatedAt ?? null;
  const lifecycle = profile?.status ?? summary?.readiness.applicationStatus;
  const status = lifecycle ? partnerReviewStatusLabel(lifecycle) : "Application submitted";
  const heading = lifecycle === "NOT_APPROVED" ? "Application status" : "Application submitted";

  return (
    <div className="mx-auto max-w-2xl">
      <FileCheck2 aria-hidden="true" className="h-11 w-11 text-sky-300" />
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{heading}</h1>
      <p className="mt-3 text-lg font-black text-white">{name}</p>
      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:grid-cols-2">
        {reference ? <StatusDetail label="Reference" value={reference} /> : null}
        {date ? <StatusDetail label="Submitted" value={formatPartnerDate(date)} /> : null}
        <StatusDetail label="Current status" value={status} />
      </div>
      <p className="mt-5 text-sm font-medium leading-6 text-slate-300">TPL GO is reviewing your application. We will update this Partner account when the review is complete.</p>
      <SummaryNotice state={summaryState} />
      <button type="button" onClick={onBack} className={`${backActionClass} mt-8`}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>
    </div>
  );
}

function ActiveHolding({ profile, summary, summaryState, onBack }: { profile: PartnerProfile | null; summary: PartnerStatusSummary | null; summaryState: "idle" | "loading" | "ready" | "error"; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <CheckCircle2 aria-hidden="true" className="h-11 w-11 text-emerald-300" />
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Your Partner account is active</h1>
      <p className="mt-3 text-lg font-black text-white">{partnerBusinessName(profile, summary)}</p>
      <p className="mt-5 text-sm font-medium leading-6 text-slate-300">Your Partner Desk is being prepared for the next activation phase.</p>
      <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-200">Account status</p>
        <p className="mt-2 text-lg font-black text-white">Active Partner account</p>
      </div>
      <SummaryNotice state={summaryState} />
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className={backActionClass}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>
        <Link href="/customer-support" className={secondaryActionClass}>Contact Partner Support</Link>
      </div>
    </div>
  );
}

function SetupPending({ profile, summary, summaryState, onBack }: { profile: PartnerProfile | null; summary: PartnerStatusSummary | null; summaryState: "idle" | "loading" | "ready" | "error"; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Clock3 aria-hidden="true" className="h-11 w-11 text-orange-300" />
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Account setup pending</h1>
      <p className="mt-3 text-lg font-black text-white">{partnerBusinessName(profile, summary)}</p>
      <p className="mt-5 text-sm font-medium leading-6 text-slate-300">Your application is approved. We will update this Partner account when the next setup phase is ready.</p>
      <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-300/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">Account status</p>
        <p className="mt-2 text-lg font-black text-white">Account setup pending</p>
      </div>
      <SummaryNotice state={summaryState} />
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className={backActionClass}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>
        <Link href="/customer-support" className={secondaryActionClass}>Contact Partner Support</Link>
      </div>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return <div role="status" className="flex min-h-44 flex-col items-center justify-center gap-4 text-center"><Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-orange-300" /><p className="text-base font-black text-white">{text}</p></div>;
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-black text-white">{value}</p></div>;
}

function SummaryNotice({ state }: { state: "idle" | "loading" | "ready" | "error" }) {
  if (state === "loading") return <p role="status" className="mt-4 text-xs font-semibold text-slate-400">Confirming the latest account details…</p>;
  if (state === "error") return <p className="mt-4 text-xs font-semibold text-amber-200">The latest account details are temporarily unavailable. The access status shown above remains unchanged.</p>;
  return null;
}

function partnerBusinessName(profile: PartnerProfile | null, summary: PartnerStatusSummary | null): string {
  return cleanPartnerApplicationName(profile?.displayName || summary?.readiness.organizationName || "Partner account");
}

function partnerReviewStatusLabel(status: string): string {
  if (status === "SUBMITTED") return "Submitted for review";
  if (status === "UNDER_REVIEW") return "Under review";
  if (status === "RESUBMITTED") return "Updates submitted";
  if (status === "NOT_APPROVED") return "Application not approved";
  return partnerProfileLifecycleLabel(status);
}

function partnerShellTitle(view: PartnerView, access: PartnerAccess | null): string {
  if (view === "landing") return "Partner Desk";
  if (view === "recovery") return "Account recovery";
  if (access?.outcome === "SELECTION_REQUIRED") return "Choose a business";
  if (access?.outcome === "APPLICATION_STATUS") return "Application status";
  if (access?.outcome === "ACTIVE") return "Partner account";
  if (access?.outcome === "SETUP_PENDING") return "Account setup";
  if (access?.outcome === "NO_LINKED_PROFILE") return "Partner access";
  return "Partner Desk";
}

function formatPartnerDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const primaryActionClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400";
const secondaryActionClass = "inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:border-orange-400/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400";
const backActionClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400";
