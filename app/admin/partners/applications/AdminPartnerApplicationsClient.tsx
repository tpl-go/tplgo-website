"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronRight, FileText, Lock, MessageSquare, RefreshCcw, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { adminApiRequest, type AdminApiResult } from "@/app/lib/admin/adminApiClient";

type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "CHANGES_REQUESTED" | "RESUBMITTED" | "NOT_APPROVED" | "APPROVED";
type StepKey = "account_contact" | "business_identity" | "business_location" | "services" | "verification_compliance" | "payout_tax" | "partner_agreement";

type QueueRow = {
  submissionId: string;
  applicationId: string;
  organizationId: string;
  organizationName: string;
  contact: string;
  country: string;
  entityType: string;
  selectedServices: string[];
  submissionReference: string;
  submissionRevision: number;
  submittedAt: string;
  workflowStatus: ApplicationStatus;
  verificationStatus: string;
  payoutTaxStatus: string;
  agreementStatus: string;
  assignedReviewer: string | null;
  ageLabel: string;
  transitionVersion: number;
  blockers: string[];
  warnings: string[];
};

type QueueResponse = {
  rows: QueueRow[];
  counts: Record<string, number>;
  filters: Record<string, string>;
};

type DetailResponse = {
  submission: {
    id: string;
    applicationId: string;
    organizationId: string;
    submissionRevision: number;
    workflowStatus: ApplicationStatus;
    snapshotHash: string;
    submittedAt: string;
    submittedByUserId: string;
    previousSubmissionId: string | null;
    submissionKind: "SUBMISSION" | "RESUBMISSION";
    transitionVersion: number;
    partnerVisibleMessage: string | null;
  };
  organization: { name: string; legalName: string; brandName: string | null; country: string; entityType: string; status: string };
  contact: { displayName: string; email: string; mobile: string };
  snapshot: {
    applicationRevision: number;
    steps: Array<{ step: StepKey; label: string; status: string; reason: string; blockerCodes: string[]; warningCodes: string[]; specialistHref: string }>;
    selectedServices: string[];
    verificationRequirements: Array<{ title: string; status: string; stage: string | null; priority: string | null }>;
    payoutTax: Record<string, unknown> | null;
    agreement: Record<string, unknown> | null;
    declarationAcceptances: Array<{ declarationId: string; version: number; acceptedAt: string | null; acceptedByUserId: string | null }>;
  };
  readiness: { approvalReady: boolean; approvalBlockers: string[]; warnings: string[] };
  messages: { partnerVisible: string | null; privateAdminNotes: Array<{ id: string; author: string; createdAt: string; note: string }> };
  permissions: { canRead: boolean; canReview: boolean; canManage: boolean; canFinalApprove: boolean };
  actions: {
    canStartReview: boolean;
    canRequestChanges: boolean;
    canNotApprove: boolean;
    canApprove: boolean;
    canAddPrivateNote: boolean;
    disabledReasons: Record<string, string>;
  };
  timeline: Array<{ id: string; action: string; label: string; fromStatus: string | null; toStatus: string | null; actor: string; occurredAt: string; partnerVisibleMessage: string | null; correctionSections: StepKey[]; privateNotePresent: boolean }>;
};

const statuses: Array<{ value: "ACTIONABLE" | ApplicationStatus; label: string }> = [
  { value: "ACTIONABLE", label: "Actionable" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "RESUBMITTED", label: "Resubmitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "CHANGES_REQUESTED", label: "Changes Requested" },
  { value: "NOT_APPROVED", label: "Not Approved" },
  { value: "APPROVED", label: "Approved" },
];

const stepLabels: Record<StepKey, string> = {
  account_contact: "Account & Contact",
  business_identity: "Business Identity",
  business_location: "Business Location",
  services: "Services",
  verification_compliance: "Verification & Compliance",
  payout_tax: "Payout & Tax",
  partner_agreement: "Partner Agreement",
};

export default function AdminPartnerApplicationsClient({ initialSubmissionId }: { initialSubmissionId?: string }) {
  const searchParams = useSearchParams();
  const qa = searchParams.get("qa") === "1";
  const [status, setStatus] = useState(searchParams.get("status") ?? "ACTIONABLE");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [service, setService] = useState(searchParams.get("service") ?? "");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [entityType, setEntityType] = useState(searchParams.get("entityType") ?? "");
  const [verification, setVerification] = useState(searchParams.get("verification") ?? "");
  const [payoutTax, setPayoutTax] = useState(searchParams.get("payoutTax") ?? "");
  const [agreement, setAgreement] = useState(searchParams.get("agreement") ?? "");
  const [reviewer, setReviewer] = useState(searchParams.get("reviewer") ?? "");
  const [queue, setQueue] = useState<AdminApiResult<QueueResponse> | null>(null);
  const [detail, setDetail] = useState<AdminApiResult<DetailResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(initialSubmissionId ?? searchParams.get("submission") ?? "");
  const [notice, setNotice] = useState("");
  const [qaState, setQaState] = useState(createQaState);

  const load = useCallback(async () => {
    setLoading(true);
    if (qa) {
      const fixtures = qaState.queue;
      const chosen = selectedId || fixtures.rows[0]?.submissionId || "";
      setSelectedId(chosen);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (service) params.set("service", service);
    if (country) params.set("country", country);
    if (entityType) params.set("entityType", entityType);
    if (verification) params.set("verification", verification);
    if (payoutTax) params.set("payoutTax", payoutTax);
    if (agreement) params.set("agreement", agreement);
    if (reviewer) params.set("reviewer", reviewer);
    const queueResult = await adminApiRequest<QueueResponse>(`/api/v1/admin/partner-applications?${params.toString()}`);
    setQueue(queueResult);
    const nextId = selectedId || (queueResult.ok ? queueResult.data.rows[0]?.submissionId ?? "" : "");
    setSelectedId(nextId);
    if (nextId) setDetail(await adminApiRequest<DetailResponse>(`/api/v1/admin/partner-applications/${encodeURIComponent(nextId)}`));
    else setDetail(null);
    setLoading(false);
  }, [agreement, country, entityType, payoutTax, qa, qaState, reviewer, search, selectedId, service, status, verification]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const queueData = qa ? qaState.queue : queue?.ok ? queue.data : null;
  const rows = queueData ? filterQaRows(queueData.rows, { status, search, service, country, entityType, verification, payoutTax, agreement, reviewer }, qa) : [];
  const detailData = qa ? qaState.details[selectedId || qaState.queue.rows[0].submissionId] : detail?.ok ? detail.data : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center">
        <Link href="/admin/partners" className="font-medium text-slate-600 hover:text-slate-950">Partners</Link>
        <ChevronRight className="hidden h-4 w-4 md:block" />
        <span>Partner Applications</span>
      </div>
      <section className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Final review</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Partner Applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review submitted Partner applications without activating organizations, services, payouts or Partner Desk access.</p>
            {qa ? <p className="mt-2 inline-flex rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">QA preview only. No application record was changed.</p> : null}
          </div>
          <button type="button" onClick={load} className="inline-flex h-10 w-fit items-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </section>
      {queue && !queue.ok ? <Notice text={queue.error.message} /> : null}
      <Filters
        status={status}
        search={search}
        service={service}
        country={country}
        entityType={entityType}
        verification={verification}
        payoutTax={payoutTax}
        agreement={agreement}
        reviewer={reviewer}
        onStatus={setStatus}
        onSearch={setSearch}
        onService={setService}
        onCountry={setCountry}
        onEntityType={setEntityType}
        onVerification={setVerification}
        onPayoutTax={setPayoutTax}
        onAgreement={setAgreement}
        onReviewer={setReviewer}
        counts={queueData?.counts ?? {}}
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <Queue rows={rows} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setNotice(""); }} qa={qa} />
        {detailData ? (
          <Detail key={detailData.submission.id} detail={detailData} assignedReviewer={queueData?.rows.find((row) => row.submissionId === detailData.submission.id)?.assignedReviewer} qa={qa} notice={notice} onNotice={setNotice} onReload={load} onQaAction={(action, input) => {
            const result = simulateQaAction(qaState, detailData.submission.id, action, input);
            setQaState(result.state);
            setNotice(result.notice);
            return result.state !== qaState;
          }} />
        ) : (
          <Empty label={loading ? "Loading application review detail." : "Select an application to review."} />
        )}
      </div>
    </div>
  );
}

function Filters({
  status,
  search,
  service,
  country,
  entityType,
  verification,
  payoutTax,
  agreement,
  reviewer,
  onStatus,
  onSearch,
  onService,
  onCountry,
  onEntityType,
  onVerification,
  onPayoutTax,
  onAgreement,
  onReviewer,
  counts,
}: {
  status: string;
  search: string;
  service: string;
  country: string;
  entityType: string;
  verification: string;
  payoutTax: string;
  agreement: string;
  reviewer: string;
  onStatus: (value: string) => void;
  onSearch: (value: string) => void;
  onService: (value: string) => void;
  onCountry: (value: string) => void;
  onEntityType: (value: string) => void;
  onVerification: (value: string) => void;
  onPayoutTax: (value: string) => void;
  onAgreement: (value: string) => void;
  onReviewer: (value: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button key={item.value} type="button" onClick={() => onStatus(item.value)} className={`rounded px-3 py-1.5 text-xs font-semibold ${status === item.value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>
            {item.label} {counts[item.value] ? `(${counts[item.value]})` : ""}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <div className="mt-1 flex h-10 items-center gap-2 rounded border border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => onSearch(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Business or application reference" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">Service</span>
          <input value={service} onChange={(event) => onService(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none" placeholder="Hotel" />
        </label>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <FilterInput label="Country" value={country} onChange={onCountry} placeholder="India" />
        <FilterInput label="Entity type" value={entityType} onChange={onEntityType} placeholder="Private Limited" />
        <FilterInput label="Verification" value={verification} onChange={onVerification} placeholder="Under review" />
        <FilterInput label="Payout & Tax" value={payoutTax} onChange={onPayoutTax} placeholder="Submitted" />
        <FilterInput label="Agreement" value={agreement} onChange={onAgreement} placeholder="Completed" />
        <FilterInput label="Assigned reviewer" value={reviewer} onChange={onReviewer} placeholder="Unassigned" />
      </div>
    </section>
  );
}

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm outline-none" placeholder={placeholder} />
    </label>
  );
}

function Queue({ rows, selectedId, onSelect, qa }: { rows: QueueRow[]; selectedId: string; onSelect: (id: string) => void; qa: boolean }) {
  if (rows.length === 0) return <Empty label="No Partner applications match these filters." />;
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-950">Review queue</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <button key={row.submissionId} type="button" onClick={() => onSelect(row.submissionId)} className={`block w-full p-4 text-left hover:bg-slate-50 ${selectedId === row.submissionId ? "bg-slate-50" : ""}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{row.organizationName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.contact} · {row.country} · {row.entityType}</p>
                <p className="mt-2 text-sm text-slate-600">{row.selectedServices.join(", ") || "No selected services"}</p>
                <p className="mt-1 text-xs text-slate-500">{row.submissionReference} · Revision {row.submissionRevision} · {formatDate(row.submittedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Pill label={statusLabel(row.workflowStatus)} />
                <Pill label={row.assignedReviewer ?? "Unassigned"} />
                <Pill label="Open review" />
                {qa ? <Pill label="QA" /> : null}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Detail({ detail, assignedReviewer, qa, notice, onNotice, onReload, onQaAction }: { detail: DetailResponse; assignedReviewer?: string | null; qa: boolean; notice: string; onNotice: (value: string) => void; onReload: () => Promise<void> | void; onQaAction: (action: ReviewAction, input: ActionInput) => boolean }) {
  const [message, setMessage] = useState(detail.messages.partnerVisible ?? "");
  const [privateNote, setPrivateNote] = useState("");
  const [reasonCategory, setReasonCategory] = useState("specialist_readiness");
  const [sections, setSections] = useState<Set<StepKey>>(new Set(["services"]));
  const [pending, setPending] = useState<ReviewAction | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const input = { partnerMessage: message, privateNote, reasonCategory, correctionSections: [...sections] };
  const reason = (action: ReviewAction) => busy ? "An action is being recorded." : actionDisabledReason(detail, action, input);
  const doAction = async (action: ReviewAction) => {
    if (busyRef.current) return;
    const disabled = actionDisabledReason(detail, action, input);
    if (disabled) { onNotice(disabled); return; }
    setPending(null);
    if (qa) {
      if (onQaAction(action, input)) setPrivateNote("");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
    const body = {
      expectedTransitionVersion: detail.submission.transitionVersion,
      correctionSections: [...sections],
      partnerMessage: message,
      privateNote,
      reasonCategory,
    };
    const result = await adminApiRequest<DetailResponse>(`/api/v1/admin/partner-applications/${encodeURIComponent(detail.submission.id)}/${action}`, {
      method: "POST",
      headers: { "Idempotency-Key": `admin-final-${action}-${detail.submission.id}-${detail.submission.transitionVersion}` },
      body,
    });
    if (result.ok) {
      onNotice(`${actionLabel(action)} recorded.`);
      setPrivateNote("");
      await onReload();
    } else {
      onNotice(result.status === 409 ? "This application review changed. Refresh before continuing." : result.error.message);
    }
    } catch {
      onNotice("The action could not be confirmed. Refresh before trying again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return (
    <section className="space-y-4 rounded border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/admin/partners/applications" className="text-xs font-semibold text-slate-500 hover:text-slate-950">Back to Partner Applications</Link>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{detail.organization.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{detail.submission.submissionKind === "RESUBMISSION" ? "Resubmission" : "Submission"} {detail.submission.submissionRevision} · {statusLabel(detail.submission.workflowStatus)}</p>
        </div>
        <Pill label={`Transition v${detail.submission.transitionVersion}`} />
      </div>
      {pending ? <ActionConfirmation action={pending} onCancel={() => setPending(null)} onConfirm={() => void doAction(pending)} /> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Assigned reviewer" value={assignedReviewer ?? "Unassigned"} />
        <Info label="Submitted" value={formatDate(detail.submission.submittedAt)} />
        <Info label="Contact" value={`${detail.contact.displayName} · ${detail.contact.email}`} />
        <Info label="Activation" value="Not changed by final approval" />
      </div>
      <Panel title="Submitted Snapshot">
        <div className="grid gap-3 md:grid-cols-2">
          {detail.snapshot.steps.map((step) => (
            <div key={step.step} className="rounded border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.reason}</p>
                </div>
                <Pill label={readinessLabel(step.status)} />
              </div>
              <Link href={step.specialistHref} className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline-offset-2 hover:underline">Open specialist evidence</Link>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Approval Readiness">
        {detail.readiness.approvalBlockers.length ? (
          <div className="space-y-2">
            {detail.readiness.approvalBlockers.map((blocker) => <p key={blocker} className="text-sm text-amber-700"><AlertTriangle className="mr-2 inline h-4 w-4" />{humanCode(blocker)}</p>)}
          </div>
        ) : (
          <p className="text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-4 w-4" />Specialist approval readiness is complete.</p>
        )}
      </Panel>
      <Panel title="Declarations">
        <div className="space-y-2">
          {detail.snapshot.declarationAcceptances.map((item) => (
            <p key={`${item.declarationId}:${item.version}`} className="text-sm text-slate-600">{item.declarationId} v{item.version} · {item.acceptedAt ? formatDate(item.acceptedAt) : "Accepted timestamp not available"}</p>
          ))}
        </div>
      </Panel>
      <Panel title="Decision Controls">
        {detail.messages.partnerVisible ? <p className="mb-3 text-sm">Partner-visible result: {detail.messages.partnerVisible}</p> : null}
        <div className="grid gap-3">
          <textarea aria-label="Partner-visible message" value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-20 rounded border border-slate-200 p-3 text-sm" placeholder="Partner-visible message" />
          <textarea aria-label="Private Admin note" value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} className="min-h-20 rounded border border-slate-200 p-3 text-sm" placeholder="Private Admin note" />
          <input aria-label="Reason category" value={reasonCategory} onChange={(event) => setReasonCategory(event.target.value)} className="h-10 rounded border border-slate-200 px-3 text-sm" placeholder="Reason category" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(stepLabels) as StepKey[]).map((step) => (
              <label key={step} className="inline-flex items-center gap-2 rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={sections.has(step)} onChange={(event) => setSections((current) => {
                  const next = new Set(current);
                  if (event.target.checked) next.add(step);
                  else next.delete(step);
                  return next;
                })} />
                {stepLabels[step]}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Start review" icon={ShieldCheck} enabled={!reason("start-review")} reason={reason("start-review")} onClick={() => void doAction("start-review")} />
            <ActionButton label="Request changes" icon={MessageSquare} enabled={!reason("request-changes")} reason={reason("request-changes")} onClick={() => setPending("request-changes")} />
            <ActionButton label="Not approve" icon={Lock} enabled={!reason("not-approve")} reason={reason("not-approve")} onClick={() => setPending("not-approve")} />
            <ActionButton label="Approve final application" icon={CheckCircle2} enabled={!reason("approve")} reason={reason("approve")} onClick={() => setPending("approve")} />
            <ActionButton label="Add private note" icon={FileText} enabled={!reason("notes")} reason={reason("notes")} onClick={() => void doAction("notes")} />
          </div>
          {notice ? <Notice text={notice} /> : null}
        </div>
      </Panel>
      <Panel title="Private Admin Notes">
        {detail.messages.privateAdminNotes.length ? detail.messages.privateAdminNotes.map((note) => <p key={note.id} className="text-sm text-slate-600">{note.author} · {formatDate(note.createdAt)} · {note.note}</p>) : <p className="text-sm text-slate-500">No private notes.</p>}
      </Panel>
      <Panel title="Timeline">
        <div className="space-y-2">
          {detail.timeline.map((event) => (
            <p key={event.id} className="text-sm text-slate-600">{event.label} · {event.actor} · {formatDate(event.occurredAt)}{event.partnerVisibleMessage ? ` · ${event.partnerVisibleMessage}` : ""}{event.correctionSections.length ? ` · ${event.correctionSections.map((step) => stepLabels[step]).join(", ")}` : ""}</p>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function ActionButton({ label, icon: Icon, enabled, reason, onClick }: { label: string; icon: LucideIcon; enabled: boolean; reason?: string; onClick: () => void }) {
  const reasonId = `action-reason-${label.toLowerCase().replace(/ /g, "-")}`;
  return (
    <span className="inline-flex flex-col">
      <button type="button" disabled={!enabled} aria-describedby={!enabled && reason ? reasonId : undefined} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded px-4 py-2 text-sm font-semibold ${enabled ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-400"}`}>
        <Icon className="h-4 w-4" /> {label}
      </button>
      {!enabled && reason ? <span id={reasonId} className="mt-1 max-w-56 text-xs text-slate-500">{reason}</span> : null}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded border border-slate-200 p-4"><h3 className="mb-3 text-sm font-semibold text-slate-950">{title}</h3>{children}</section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-slate-200 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div>;
}

function Pill({ label }: { label: string }) {
  return <span className="inline-flex max-w-52 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"><span className="truncate">{label}</span></span>;
}

function Notice({ text }: { text: string }) {
  return <div role="status" aria-live="polite" className="rounded border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">{text}</div>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">{label}</div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readinessLabel(value: string) {
  if (value === "NEEDS_ATTENTION") return "Needs Attention";
  if (value === "UNDER_REVIEW") return "Under Review";
  return statusLabel(value);
}

function humanCode(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionLabel(value: string) {
  if (value === "notes") return "Add Private Note";
  if (value === "approve") return "Approve Final Application";
  return statusLabel(value.replace(/-/g, "_"));
}

type ReviewAction = "start-review" | "request-changes" | "not-approve" | "approve" | "notes";
type ActionInput = { partnerMessage: string; privateNote: string; reasonCategory: string; correctionSections: StepKey[] };
const actionKeys = {
  "start-review": ["canStartReview", "startReview"],
  "request-changes": ["canRequestChanges", "requestChanges"],
  "not-approve": ["canNotApprove", "notApprove"],
  approve: ["canApprove", "approve"],
  notes: ["canAddPrivateNote", "privateNote"],
} as const;

export function actionDisabledReason(detail: DetailResponse, action: ReviewAction, input: ActionInput): string {
  const [flag, key] = actionKeys[action];
  const permission = action === "approve" || action === "not-approve" ? detail.permissions.canFinalApprove : detail.permissions.canReview || detail.permissions.canManage;
  if (!permission) return detail.actions.disabledReasons[key] || "You do not have permission for this action.";
  const status = detail.submission.workflowStatus;
  if (action === "start-review" && !["SUBMITTED", "RESUBMITTED"].includes(status)) return "Start Review requires Submitted or Resubmitted status.";
  if (action !== "start-review" && action !== "notes" && !["UNDER_REVIEW", "RESUBMITTED"].includes(status)) return "This action requires Under Review or Resubmitted status.";
  if (action === "approve" && (!detail.readiness.approvalReady || detail.readiness.approvalBlockers.length)) return "Specialist approval blockers remain.";
  if (!detail.actions[flag]) return detail.actions.disabledReasons[key] || "This action is unavailable for this application.";
  const missing: string[] = [];
  if (action === "request-changes" && !input.correctionSections.length) missing.push("Select at least one correction section.");
  if (action === "not-approve" && !input.reasonCategory.trim()) missing.push("Reason category is required.");
  if ((action === "request-changes" || action === "not-approve") && !input.partnerMessage.trim()) missing.push("Partner-visible message is required.");
  if (action === "notes" && !input.privateNote.trim()) missing.push("Private Admin note is required.");
  return missing.join(" ");
}

export function ActionConfirmation({ action, onCancel, onConfirm }: { action: ReviewAction; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} aria-modal="true" aria-labelledby="review-confirm-title" aria-describedby="review-confirm-description" onCancel={(event) => { event.preventDefault(); onCancel(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-black/40">
    <h2 id="review-confirm-title" className="text-lg font-semibold">{actionLabel(action)}</h2>
    <p id="review-confirm-description" className="mt-3 text-sm text-slate-600">{action === "approve" ? "Approval does not activate the organization, services, payouts or Partner Desk access." : `Confirm ${actionLabel(action).toLowerCase()} for this application using the entered Partner-visible message.`}</p>
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      <button type="button" autoFocus onClick={onCancel} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>
      <button type="button" onClick={onConfirm} className="rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{actionLabel(action)}</button>
    </div>
  </dialog>;
}

export function createQaState() {
  const queue = qaQueue();
  return { queue, details: Object.fromEntries(queue.rows.map((row) => [row.submissionId, qaDetail(row.submissionId)])) };
}

export function simulateQaAction(state: ReturnType<typeof createQaState>, id: string, action: ReviewAction, input: ActionInput) {
  const detail = state.details[id];
  const disabled = actionDisabledReason(detail, action, input);
  if (disabled) return { state, notice: disabled };
  if (id === "qa-stale-conflict") return { state, notice: "This application review changed. Refresh before continuing. QA preview only; no application record was changed." };
  const now = new Date().toISOString();
  const from = detail.submission.workflowStatus;
  const to: ApplicationStatus = action === "start-review" ? "UNDER_REVIEW" : action === "request-changes" ? "CHANGES_REQUESTED" : action === "not-approve" ? "NOT_APPROVED" : action === "approve" ? "APPROVED" : from;
  const version = detail.submission.transitionVersion + (action === "notes" ? 0 : 1);
  const partnerMessage = action === "request-changes" || action === "not-approve" ? input.partnerMessage.trim() : detail.messages.partnerVisible;
  const next: DetailResponse = {
    ...detail,
    submission: { ...detail.submission, workflowStatus: to, transitionVersion: version, partnerVisibleMessage: partnerMessage },
    messages: { partnerVisible: partnerMessage, privateAdminNotes: input.privateNote.trim() ? [...detail.messages.privateAdminNotes, { id: `${id}:note:${detail.messages.privateAdminNotes.length}`, author: "QA Reviewer", createdAt: now, note: input.privateNote.trim() }] : detail.messages.privateAdminNotes },
    timeline: action === "notes" ? detail.timeline : [...detail.timeline, { id: `${id}:${version}`, action, label: actionLabel(action), fromStatus: from, toStatus: to, actor: "QA Reviewer", occurredAt: now, partnerVisibleMessage: action === "request-changes" || action === "not-approve" ? partnerMessage : null, correctionSections: action === "request-changes" ? [...input.correctionSections] : [], privateNotePresent: Boolean(input.privateNote.trim()) }],
    actions: { ...detail.actions, canStartReview: to === "RESUBMITTED" || to === "SUBMITTED", canRequestChanges: to === "UNDER_REVIEW" || to === "RESUBMITTED", canNotApprove: to === "UNDER_REVIEW" || to === "RESUBMITTED", canApprove: (to === "UNDER_REVIEW" || to === "RESUBMITTED") && detail.readiness.approvalReady && !detail.readiness.approvalBlockers.length },
  };
  const rows = state.queue.rows.map((row) => row.submissionId === id ? { ...row, workflowStatus: to, transitionVersion: version, assignedReviewer: action === "start-review" ? "QA Reviewer" : row.assignedReviewer } : row);
  const counts: Record<string, number> = { ACTIONABLE: 0 };
  for (const row of rows) {
    counts[row.workflowStatus] = (counts[row.workflowStatus] ?? 0) + 1;
    if (["SUBMITTED", "RESUBMITTED", "UNDER_REVIEW"].includes(row.workflowStatus)) counts.ACTIONABLE++;
  }
  return { state: { queue: { ...state.queue, rows, counts }, details: { ...state.details, [id]: next } }, notice: `QA preview only. ${actionLabel(action)} was simulated. No application record was changed.` };
}

function filterQaRows(rows: QueueRow[], filters: { status: string; search: string; service: string; country: string; entityType: string; verification: string; payoutTax: string; agreement: string; reviewer: string }, qa: boolean) {
  if (!qa) return rows;
  return rows.filter((row) => {
    const statusOk = filters.status === "ACTIONABLE" ? ["SUBMITTED", "RESUBMITTED", "UNDER_REVIEW"].includes(row.workflowStatus) : row.workflowStatus === filters.status;
    const searchOk = !filters.search || [row.organizationName, row.submissionReference, row.contact].join(" ").toLowerCase().includes(filters.search.toLowerCase());
    const serviceOk = !filters.service || row.selectedServices.some((service) => service.toLowerCase().includes(filters.service.toLowerCase()));
    const countryOk = !filters.country || row.country.toLowerCase().includes(filters.country.toLowerCase());
    const entityOk = !filters.entityType || row.entityType.toLowerCase().includes(filters.entityType.toLowerCase());
    const verificationOk = !filters.verification || row.verificationStatus.toLowerCase().includes(filters.verification.toLowerCase());
    const payoutOk = !filters.payoutTax || row.payoutTaxStatus.toLowerCase().includes(filters.payoutTax.toLowerCase());
    const agreementOk = !filters.agreement || row.agreementStatus.toLowerCase().includes(filters.agreement.toLowerCase());
    const reviewerOk = !filters.reviewer || (row.assignedReviewer ?? "Unassigned").toLowerCase().includes(filters.reviewer.toLowerCase());
    return statusOk && searchOk && serviceOk && countryOk && entityOk && verificationOk && payoutOk && agreementOk && reviewerOk;
  });
}

function qaQueue(): QueueResponse {
  const now = "2026-09-10T10:30:00.000Z";
  const fixtureStatuses: Array<ApplicationStatus | "APPROVAL_BLOCKED" | "STALE_CONFLICT" | "READ_ONLY"> = ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "RESUBMITTED", "NOT_APPROVED", "APPROVED", "APPROVAL_BLOCKED", "STALE_CONFLICT", "READ_ONLY"];
  const rows: QueueRow[] = fixtureStatuses.map((fixture, index) => {
    const status = fixture === "APPROVAL_BLOCKED" || fixture === "STALE_CONFLICT" || fixture === "READ_ONLY" ? "UNDER_REVIEW" : fixture;
    const blockers = fixture === "APPROVAL_BLOCKED" || (status === "UNDER_REVIEW" && index === 1) ? ["PAYOUT_TAX_NOT_APPROVED"] : [];
    return {
      submissionId: `qa-${fixture.toLowerCase().replace(/_/g, "-")}`,
      applicationId: `qa-app-${index}`,
      organizationId: `qa-org-${index}`,
      organizationName: `QA ${fixture === "APPROVAL_BLOCKED" ? "Approval Blocked" : fixture === "STALE_CONFLICT" ? "Stale Transition Conflict" : fixture === "READ_ONLY" ? "Read Only" : statusLabel(status)} Partner`,
      contact: "qa-owner@example.test",
      country: "India",
      entityType: "Private Limited",
      selectedServices: ["Hotel", "Cab"],
      submissionReference: `QA-APP-${index + 1}`,
      submissionRevision: index + 1,
      submittedAt: now,
      workflowStatus: status as ApplicationStatus,
      verificationStatus: index === 0 ? "UNDER_REVIEW" : "COMPLETE",
      payoutTaxStatus: index === 0 ? "SUBMITTED" : "VERIFIED",
      agreementStatus: index === 0 ? "READY" : "COMPLETED",
      assignedReviewer: index % 2 === 0 ? null : "reviewer@example.test",
      ageLabel: "QA",
      transitionVersion: 1,
      blockers,
      warnings: [],
    };
  });
  return { rows, counts: { ACTIONABLE: 6, SUBMITTED: 1, UNDER_REVIEW: 4, CHANGES_REQUESTED: 1, RESUBMITTED: 1, NOT_APPROVED: 1, APPROVED: 1 }, filters: {} };
}

function qaDetail(id: string): DetailResponse {
  const row = qaQueue().rows.find((item) => item.submissionId === id) ?? qaQueue().rows[0]!;
  return {
    submission: { id: row.submissionId, applicationId: row.applicationId, organizationId: row.organizationId, submissionRevision: row.submissionRevision, workflowStatus: row.workflowStatus, snapshotHash: "qa", submittedAt: row.submittedAt, submittedByUserId: "qa-user", previousSubmissionId: row.workflowStatus === "RESUBMITTED" ? "qa-submitted" : null, submissionKind: row.workflowStatus === "RESUBMITTED" ? "RESUBMISSION" : "SUBMISSION", transitionVersion: row.transitionVersion, partnerVisibleMessage: row.workflowStatus === "CHANGES_REQUESTED" ? "Please update the Services section." : null },
    organization: { name: row.organizationName, legalName: row.organizationName, brandName: row.organizationName, country: row.country, entityType: row.entityType, status: "draft" },
    contact: { displayName: "QA Owner", email: row.contact, mobile: "+91 ********01" },
    snapshot: {
      applicationRevision: 7,
      steps: (Object.keys(stepLabels) as StepKey[]).map((step) => ({ step, label: stepLabels[step], status: step === "payout_tax" && row.blockers.length ? "UNDER_REVIEW" : "COMPLETE", reason: step === "payout_tax" && row.blockers.length ? "Payout and tax specialist review is not complete." : "Submitted evidence is available.", blockerCodes: [], warningCodes: [], specialistHref: step === "payout_tax" ? "/admin/partners/payout-tax" : step === "partner_agreement" ? "/admin/partners/agreements" : "/admin/partner-verification" })),
      selectedServices: row.selectedServices,
      verificationRequirements: [{ title: "Property Licence", status: "SUBMITTED", stage: "REQUIRED_NOW", priority: "MANDATORY" }],
      payoutTax: { status: row.payoutTaxStatus, activationAllowed: false },
      agreement: { reviewStatus: row.agreementStatus, activationAllowed: false },
      declarationAcceptances: [{ declarationId: "qa-test-only-final-declaration", version: 1, acceptedAt: row.submittedAt, acceptedByUserId: "qa-user" }],
    },
    readiness: { approvalReady: row.blockers.length === 0, approvalBlockers: row.blockers, warnings: [] },
    messages: { partnerVisible: row.workflowStatus === "CHANGES_REQUESTED" ? "Please update the Services section." : null, privateAdminNotes: [] },
    permissions: { canRead: true, canReview: !id.includes("read-only"), canManage: false, canFinalApprove: !id.includes("read-only") },
    actions: {
      canStartReview: !id.includes("read-only") && (row.workflowStatus === "SUBMITTED" || row.workflowStatus === "RESUBMITTED"),
      canRequestChanges: !id.includes("read-only") && (row.workflowStatus === "UNDER_REVIEW" || row.workflowStatus === "RESUBMITTED"),
      canNotApprove: !id.includes("read-only") && (row.workflowStatus === "UNDER_REVIEW" || row.workflowStatus === "RESUBMITTED"),
      canApprove: !id.includes("read-only") && (row.workflowStatus === "UNDER_REVIEW" || row.workflowStatus === "RESUBMITTED") && row.blockers.length === 0 && !id.includes("stale-transition-conflict"),
      canAddPrivateNote: !id.includes("read-only"),
      disabledReasons: id.includes("read-only")
        ? { startReview: "Read-only Admins can view but cannot change final application reviews.", requestChanges: "Read-only Admins can view but cannot request changes.", notApprove: "Read-only Admins can view but cannot decide applications.", approve: "Read-only Admins can view but cannot approve applications.", privateNote: "Read-only Admins can view but cannot add private notes." }
        : id.includes("stale-transition-conflict")
          ? { approve: "This application review changed. Refresh before continuing." }
          : row.blockers.length
            ? { approve: "Specialist approval blockers remain." }
            : {},
    },
    timeline: [{ id: `${row.submissionId}:submitted`, action: "application.submitted", label: "Application submitted", fromStatus: "READY_TO_SUBMIT", toStatus: row.workflowStatus, actor: "QA Partner", occurredAt: row.submittedAt, partnerVisibleMessage: null, correctionSections: [], privateNotePresent: false }],
  };
}
