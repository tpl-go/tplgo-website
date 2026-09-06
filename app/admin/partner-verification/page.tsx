"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, FileText, RefreshCcw, Search, XCircle } from "lucide-react";
import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { adminApiRequest, readAdminSession, type AdminApiResult } from "../../lib/admin/adminApiClient";
import type { PartnerDocument, PartnerOrganizationBundle, PartnerRequirement, PartnerServiceScope, PartnerVerificationEvent, PartnerVerificationStatus } from "../../lib/partner/partnerApiClient";

type PartnerQueueRow = {
  review: { id: string; status: PartnerVerificationStatus; submittedAt?: string | null; reviewerAdminId?: string | null };
  organization: { id: string; legalName: string; brandName?: string | null; organizationType: string; country?: string | null };
  selectedServices: PartnerServiceScope[];
  readiness: PartnerOrganizationBundle["readiness"];
  blockingCount: number;
};

type AdminDecisionAction = "start_review" | "send_senior_review" | "start_senior_review" | "recommend_approval" | "send_back_correction" | "escalate" | "start_final_approval" | "final_approve" | "reject" | "request_changes" | "renewal_required" | "hold" | "note";
type AdminPermission = "partner_verification.read" | "partner_verification.review" | "partner_verification.level1_review" | "partner_verification.level2_review" | "partner_verification.final_approve" | "partner_verification.manage";
type ReviewDepth = "TWO_LEVEL" | "THREE_LEVEL";
type ReviewStage = "LEVEL_1_READY" | "LEVEL_1_IN_REVIEW" | "LEVEL_2_READY" | "LEVEL_2_IN_REVIEW" | "LEVEL_3_READY" | "LEVEL_3_IN_REVIEW" | "CHANGES_REQUIRED" | "REJECTED" | "ON_HOLD" | "VERIFIED" | "EXPIRED";
type DocumentReviewState = "awaiting" | "submitted" | "unavailable";
type QueueTab = "my-reviews" | "level-1" | "senior-review" | "final-approval" | "changes" | "completed" | "all";

type AdminDocumentAccess = {
  document: Record<string, unknown>;
  access: {
    download?: { url: string; expiresAt: string; supported: boolean };
    publicUrl: null;
    executionStatus: string;
  };
};

const queueTabs: Array<{ id: QueueTab; label: string }> = [
  { id: "my-reviews", label: "My Reviews" },
  { id: "level-1", label: "Level 1" },
  { id: "senior-review", label: "Senior Review" },
  { id: "final-approval", label: "Final Approval" },
  { id: "changes", label: "Changes Required" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

const stateOptions = [
  { value: "", label: "All states" },
  { value: "SUBMITTED", label: "Ready for Review" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "CHANGES_REQUIRED", label: "Changes Required" },
  { value: "VERIFIED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Renewal Required" },
  { value: "EXPIRING_SOON", label: "Expiring Soon" },
];

export default function AdminPartnerVerificationPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Verification & Compliance">
        <AdminPartnerVerificationView />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminPartnerVerificationView() {
  const searchParams = useSearchParams();
  const requestedOrganizationId = searchParams.get("organizationId");
  const [queueResult, setQueueResult] = useState<AdminApiResult<PartnerQueueRow[]> | null>(null);
  const [detailResult, setDetailResult] = useState<AdminApiResult<PartnerOrganizationBundle> | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(requestedOrganizationId);
  const [activeTab, setActiveTab] = useState<QueueTab>("level-1");
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [submittedAfter, setSubmittedAfter] = useState("");
  const [decisionDraft, setDecisionDraft] = useState({ reason: "", partnerMessage: "", internalNote: "", category: "document_quality" });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [documentAccessMessage, setDocumentAccessMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);

  const loadDetail = useCallback(async (organizationId: string) => {
    setActiveOrganizationId(organizationId);
    const result = await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partner-verification/organizations/${encodeURIComponent(organizationId)}`);
    setDetailResult(result);
  }, []);

  const loadQueue = useCallback(async () => {
    setAdminPermissions(readAdminSession()?.admin.permissions ?? []);
    const result = await adminApiRequest<PartnerQueueRow[]>("/api/v1/admin/partner-verification/queue");
    setQueueResult(result);
    if (result.ok && requestedOrganizationId) await loadDetail(requestedOrganizationId);
  }, [loadDetail, requestedOrganizationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const queue = useMemo(() => (queueResult?.ok ? queueResult.data : []), [queueResult]);
  const filterOptions = useMemo(() => buildFilterOptions(queue), [queue]);
  const filteredQueue = useMemo(() => filterQueue(queue, { activeTab, query, serviceFilter, countryFilter, stateFilter, submittedAfter }), [queue, activeTab, query, serviceFilter, countryFilter, stateFilter, submittedAfter]);
  const detail = detailResult?.ok ? detailResult.data : null;
  const accessDenied = (queueResult && !queueResult.ok && queueResult.status === 403) || (detailResult && !detailResult.ok && detailResult.status === 403);

  async function decide(requirement: PartnerRequirement, action: AdminDecisionAction) {
    if (!activeOrganizationId) return;
    const document = documentForRequirement(detail, requirement.id);
    const needsReason = action === "reject" || action === "request_changes" || action === "renewal_required" || action === "hold";
    if (!document && action !== "note") {
      setActionMessage("Waiting for Partner document.");
      return;
    }
    if (needsReason && !decisionDraft.reason.trim()) {
      setActionMessage("Add a message to Partner before saving this decision.");
      return;
    }
    if ((action === "final_approve" || action === "reject" || action === "hold") && !window.confirm(`${action === "final_approve" ? "Final approve" : action === "reject" ? "Reject" : "Hold"} this verification check?`)) return;
    setBusyAction(`${requirement.id}:${action}`);
    const result = await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partner-verification/organizations/${encodeURIComponent(activeOrganizationId)}/decision`, {
      method: "POST",
      body: {
        action,
        requirementId: requirement.id,
        documentId: document?.id,
        note: decisionDraft.reason.trim() || undefined,
        partnerMessage: decisionDraft.partnerMessage.trim() || decisionDraft.reason.trim() || undefined,
        internalNote: decisionDraft.internalNote.trim() || undefined,
        reasonCategory: decisionDraft.category,
      },
    });
    setBusyAction(null);
    if (!result.ok) {
      setActionMessage(result.error.message);
      return;
    }
    setDecisionDraft({ reason: "", partnerMessage: "", internalNote: "", category: "document_quality" });
    setActionMessage("Review decision saved.");
    setDetailResult(result);
    await loadQueue();
  }

  async function openDocument(requirement: PartnerRequirement) {
    if (!activeOrganizationId) return;
    const document = documentForRequirement(detail, requirement.id);
    if (!document) {
      setDocumentAccessMessage("No submitted document is linked to this check.");
      return;
    }
    setDocumentAccessMessage(null);
    const result = await adminApiRequest<AdminDocumentAccess>(`/api/v1/admin/partner-verification/organizations/${encodeURIComponent(activeOrganizationId)}/documents/${encodeURIComponent(document.id)}/access`);
    if (!result.ok) {
      setDocumentAccessMessage(result.error.message);
      return;
    }
    if (result.data.access.executionStatus !== "READY" || !result.data.access.download?.supported || !result.data.access.download.url) {
      setDocumentAccessMessage("Private document access is not ready.");
      return;
    }
    window.open(result.data.access.download.url, "_blank", "noopener,noreferrer");
    setDocumentAccessMessage(`Temporary document access expires ${new Date(result.data.access.download.expiresAt).toLocaleString()}.`);
  }

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 rounded-2xl border border-sky-300/15 bg-[#101827] p-4 shadow-2xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Admin breadcrumbs">
            <Link href="/admin" className="hover:text-sky-200">Admin</Link>
            <span>/</span>
            <Link href="/admin/partners" className="hover:text-sky-200">Partners</Link>
            <span>/</span>
            <Link href="/admin/partner-verification" className="hover:text-sky-200">Verification & Compliance</Link>
            {detail ? <><span>/</span><span className="text-slate-200">{detail.organization.legalName}</span></> : null}
          </nav>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Verification & Compliance</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-400">Review Partner documents and complete verification checks.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/partner-verification/rules" className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 text-sm font-black text-cyan-100 hover:bg-cyan-400/15">Verification Rules</Link><button type="button" onClick={loadQueue} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 text-sm font-black text-sky-100 hover:bg-sky-400/15">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button></div>
      </div>

      {accessDenied ? <AccessDeniedState /> : null}
      {accessDenied ? null : (
        <>
      {queueResult && !queueResult.ok ? <Notice text={queueResult.error.message} /> : null}
      {detailResult && !detailResult.ok ? <Notice text={detailResult.error.message} /> : null}

      {!requestedOrganizationId ? (
        <QueueView rows={filteredQueue} filters={{ activeTab, query, serviceFilter, countryFilter, stateFilter, submittedAfter }} filterOptions={filterOptions} onTab={setActiveTab} onQuery={setQuery} onService={setServiceFilter} onCountry={setCountryFilter} onState={setStateFilter} onSubmittedAfter={setSubmittedAfter} />
      ) : (
        <RecordView detail={detail} adminPermissions={adminPermissions} actionMessage={actionMessage} documentAccessMessage={documentAccessMessage} decisionDraft={decisionDraft} busyAction={busyAction} onDecisionDraft={setDecisionDraft} onOpenDocument={openDocument} onDecide={decide} />
      )}
        </>
      )}
    </div>
  );
}

function AccessDeniedState() {
  return (
    <section className="rounded-2xl border border-amber-300/25 bg-[#111827] p-6 shadow-2xl shadow-black/25" data-admin-verification-denied="true">
      <p className="text-lg font-black text-white">You don&apos;t have access to Partner verification reviews.</p>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">Ask a Super Admin or authorized Partner verification reviewer to update your Admin role.</p>
      <Link href="/admin/partners" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 text-sm font-black text-sky-100 hover:bg-sky-400/15">
        <ArrowLeft className="h-4 w-4" /> Back to Partners
      </Link>
    </section>
  );
}

function QueueView({ rows, filters, filterOptions, onTab, onQuery, onService, onCountry, onState, onSubmittedAfter }: { rows: PartnerQueueRow[]; filters: { activeTab: QueueTab; query: string; serviceFilter: string; countryFilter: string; stateFilter: string; submittedAfter: string }; filterOptions: ReturnType<typeof buildFilterOptions>; onTab: (value: QueueTab) => void; onQuery: (value: string) => void; onService: (value: string) => void; onCountry: (value: string) => void; onState: (value: string) => void; onSubmittedAfter: (value: string) => void }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-2xl shadow-black/25" data-admin-verification-queue="true">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Verification review queues">
        {queueTabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={filters.activeTab === tab.id} onClick={() => onTab(tab.id)} className={`rounded-full border px-3 py-2 text-xs font-black ${filters.activeTab === tab.id ? "border-[#f97316]/60 bg-[#f97316]/15 text-[#fed7aa]" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-sky-300/30"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_180px_160px_180px_170px]">
        <label className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input value={filters.query} onChange={(event) => onQuery(event.target.value)} placeholder="Search Partner or business" className="h-10 w-full rounded-xl border border-white/10 bg-[#0b1220] pl-9 pr-3 text-sm font-semibold text-white outline-none focus:border-sky-300/40" />
        </label>
        <Select value={filters.serviceFilter} onChange={onService} label="Service" options={["", ...filterOptions.services]} />
        <Select value={filters.countryFilter} onChange={onCountry} label="Country" options={["", ...filterOptions.countries]} />
        <Select value={filters.stateFilter} onChange={onState} label="State" options={stateOptions} />
        <input value={filters.submittedAfter} onChange={(event) => onSubmittedAfter(event.target.value)} type="date" aria-label="Submitted after" className="h-10 rounded-xl border border-white/10 bg-[#0b1220] px-3 text-sm font-semibold text-white outline-none focus:border-sky-300/40" />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        {rows.length ? rows.map((row) => <QueueRow key={row.organization.id} row={row} />) : <p className="p-6 text-sm font-semibold text-slate-400">No Partner verification submissions are ready for review.</p>}
      </div>
    </section>
  );
}

function QueueRow({ row }: { row: PartnerQueueRow }) {
  return (
    <Link href={`/admin/partner-verification?organizationId=${encodeURIComponent(row.organization.id)}`} className="grid gap-3 border-b border-white/10 bg-[#0b1220] p-4 text-sm last:border-b-0 hover:bg-[#0f1a2e] lg:grid-cols-[minmax(0,1.25fr)_130px_minmax(0,1fr)_160px_145px]">
      <div className="min-w-0">
        <p className="break-words font-black text-white">{row.organization.legalName}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">{row.organization.organizationType}</p>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Country</p>
        <p className="mt-1 font-semibold text-slate-200">{row.organization.country || "India"}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Services</p>
        <p className="mt-1 break-words font-semibold text-slate-200">{serviceHeadline(row.selectedServices)}</p>
      </div>
      <div>
        <StatusChip status={row.review.status} />
        <p className="mt-2 text-xs text-slate-500">{formatDate(row.review.submittedAt)}</p>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Next action</p>
        <p className="mt-1 font-semibold text-[#fed7aa]">{nextQueueAction(row.review.status)}</p>
      </div>
    </Link>
  );
}

function RecordView({ detail, adminPermissions, actionMessage, documentAccessMessage, decisionDraft, busyAction, onDecisionDraft, onOpenDocument, onDecide }: { detail: PartnerOrganizationBundle | null; adminPermissions: string[]; actionMessage: string | null; documentAccessMessage: string | null; decisionDraft: DecisionDraft; busyAction: string | null; onDecisionDraft: (value: DecisionDraft) => void; onOpenDocument: (requirement: PartnerRequirement) => void; onDecide: (requirement: PartnerRequirement, action: AdminDecisionAction) => void }) {
  if (!detail) return <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-sm font-semibold text-slate-400">Loading verification record...</div>;
  const grouped = groupRequirements(detail.requirements);
  return (
    <div className="space-y-5" data-admin-verification-record="true">
      <Link href="/admin/partner-verification" className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-slate-200 hover:border-sky-300/30"><ArrowLeft className="h-4 w-4" /> Back to Verification & Compliance queue</Link>
      {actionMessage ? <Notice text={actionMessage} /> : null}
      {documentAccessMessage ? <Notice text={documentAccessMessage} /> : null}
      <Panel title="Partner summary">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Fact label="Legal/business name" value={detail.organization.legalName} />
          <Fact label="Display/brand name" value={detail.organization.brandName || "Not provided"} />
          <Fact label="Individual or organization" value={detail.organization.organizationType.includes("Individual") ? "Individual" : "Organization"} />
          <Fact label="Entity type" value={detail.organization.organizationType} />
          <Fact label="Country" value={detail.organization.country} />
          <Fact label="Operating jurisdiction" value={[detail.organization.city, detail.organization.stateRegion].filter(Boolean).join(", ") || detail.organization.country} />
          <Fact label="Application status" value={humanStatus(detail.review?.status ?? "NOT_SUBMITTED")} />
          <Fact label="Authorized representative" value={authorizedRepresentative(detail) ? "Confirmed" : "Not confirmed"} />
        </div>
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Selected services</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">{serviceHeadline(detail.serviceScopes)}</p>
        </div>
      </Panel>
      <Panel title="Verification progress">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Required now" value={`${readyNow(detail)}/${requiredNow(detail)} ready`} />
          <Metric label="Service checks" value={`${serviceReady(detail)}/${serviceTotal(detail)} approved`} />
          <Metric label="Ready for review" value={`${countStatus(detail, "SUBMITTED")}`} />
          <Metric label="Approved" value={`${countStatus(detail, "VERIFIED")}`} />
          <Metric label="Changes required" value={`${countStatus(detail, "CHANGES_REQUIRED")}`} />
          <Metric label="Expired" value={`${countStatus(detail, "EXPIRED")}`} />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-400">Overall application readiness: {humanStatus(detail.readiness.overallVerificationStatus)}</p>
      </Panel>
      <Panel title="Verification checks">
        <div className="grid gap-4">
          {grouped.map((group) => <RequirementGroup key={group.title} title={group.title} requirements={group.requirements} detail={detail} adminPermissions={adminPermissions} decisionDraft={decisionDraft} busyAction={busyAction} onDecisionDraft={onDecisionDraft} onOpenDocument={onOpenDocument} onDecide={onDecide} />)}
        </div>
      </Panel>
      <Panel title="Review history">
        <div className="grid gap-2">
          {detail.events.length ? detail.events.map((event) => <HistoryRow key={event.id} event={event} />) : <p className="text-sm font-semibold text-slate-400">No review history yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

type DecisionDraft = { reason: string; partnerMessage: string; internalNote: string; category: string };

function RequirementGroup(props: { title: string; requirements: PartnerRequirement[]; detail: PartnerOrganizationBundle; adminPermissions: string[]; decisionDraft: DecisionDraft; busyAction: string | null; onDecisionDraft: (value: DecisionDraft) => void; onOpenDocument: (requirement: PartnerRequirement) => void; onDecide: (requirement: PartnerRequirement, action: AdminDecisionAction) => void }) {
  return (
    <section>
      <h3 className="text-sm font-black text-cyan-100">{props.title}</h3>
      <div className="mt-2 grid gap-3">
        {props.requirements.map((requirement) => <RequirementCard key={requirement.id} requirement={requirement} detail={props.detail} adminPermissions={props.adminPermissions} decisionDraft={props.decisionDraft} busyAction={props.busyAction} onDecisionDraft={props.onDecisionDraft} onOpenDocument={props.onOpenDocument} onDecide={props.onDecide} />)}
      </div>
    </section>
  );
}

function RequirementCard({ requirement, detail, adminPermissions, decisionDraft, busyAction, onDecisionDraft, onOpenDocument, onDecide }: { requirement: PartnerRequirement; detail: PartnerOrganizationBundle; adminPermissions: string[]; decisionDraft: DecisionDraft; busyAction: string | null; onDecisionDraft: (value: DecisionDraft) => void; onOpenDocument: (requirement: PartnerRequirement) => void; onDecide: (requirement: PartnerRequirement, action: AdminDecisionAction) => void }) {
  const document = documentForRequirement(detail, requirement.id);
  const depth = reviewDepthForRequirement(requirement);
  const stage = reviewStageForRequirement(requirement, detail.events, depth);
  const documentState = documentReviewState(requirement, document);
  const actions = reviewActions(stage, documentState === "submitted", adminPermissions, requirement.expires);
  const showDecisionInputs = actions.some((item) => actionNeedsMessage(item.action));
  return (
    <article className="rounded-xl border border-white/10 bg-[#0b1220] p-4" data-admin-verification-check="true">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-white">{requirement.title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-400">{requirement.description}</p>
          <p className="mt-2 text-xs font-semibold text-sky-300/70">Applies to: <span className="text-white">{applicableServices(detail, requirement)}</span></p>
          <p className="mt-1 text-xs font-semibold text-sky-300/70">{stageLabel(requirement)}</p>
        </div>
        <StatusChip status={requirement.status} />
      </div>

      <ReviewStageFlow depth={depth} stage={stage} documentState={documentState} events={detail.events.filter((event) => event.requirementId === requirement.id)} />

      <div className="mt-4 rounded-xl border border-white/10 bg-[#111827] p-3" data-document-review-state={documentState}>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-300/70">Partner document</p>
        {document ? (
          <div className="mt-2">
            <p className="text-sm font-black text-white">Document submitted</p>
            <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-300 md:grid-cols-2">
              <span>{document.documentType}</span>
              <span>{document.originalFilename}</span>
              <span>{document.mimeType}</span>
              <span>Uploaded {formatDate((document as PartnerDocument & { createdAt?: string }).createdAt)}</span>
              <span>Issue date: {document.issueDate || "Not provided"}</span>
              <span>Expiry: {document.noExpiry ? "No expiry" : document.expiryDate || "Not provided"}</span>
              <span>Version: current replacement</span>
              <span>State: {humanStatus(document.status)}</span>
            </div>
          </div>
        ) : documentState === "unavailable" ? (
          <div className="mt-2 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
            <p className="font-black text-amber-50">Document unavailable</p>
            <p className="mt-1 text-amber-100/85">The submission record exists, but its document cannot be opened.</p>
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-white/10 bg-[#0b1220] p-3 text-sm font-semibold text-slate-400">
            <p className="font-black text-white">Awaiting Partner document</p>
            <p className="mt-1">Not started</p>
          </div>
        )}
        {document ? (
          <button type="button" onClick={() => onOpenDocument(requirement)} className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-400/10 px-3 text-xs font-black text-sky-100 hover:bg-sky-400/15">
            <Eye className="h-4 w-4" /> View document
          </button>
        ) : null}
      </div>

      {document?.reviewNote ? <div className="mt-3 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100"><AlertTriangle className="mr-2 inline h-4 w-4" /> Previous reviewer feedback: {document.reviewNote}</div> : null}

      <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-[#111827] p-3">
        {showDecisionInputs ? <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1 text-xs font-black uppercase tracking-[0.1em] text-sky-300/70">
            Message to Partner
            <textarea value={decisionDraft.reason} onChange={(event) => onDecisionDraft({ ...decisionDraft, reason: event.target.value })} className="min-h-20 rounded-xl border border-white/10 bg-[#0b1220] p-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#f97316]/60" />
          </label>
          <label className="grid gap-1 text-xs font-black uppercase tracking-[0.1em] text-sky-300/70">
            Private admin note
            <textarea value={decisionDraft.internalNote} onChange={(event) => onDecisionDraft({ ...decisionDraft, internalNote: event.target.value })} className="min-h-20 rounded-xl border border-white/10 bg-[#0b1220] p-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-sky-300/50" />
          </label>
        </div> : null}
        <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-300/70">Next review action</p>
        <div className="flex flex-wrap gap-2">
          {actions.length ? actions.map((action) => <DecisionButton key={action.action} label={action.label} action={action.action} requirement={requirement} busyAction={busyAction} onDecide={onDecide} />) : <p className="text-sm font-semibold text-slate-400">{waitingCopy(stage, documentState)}</p>}
        </div>
      </div>
    </article>
  );
}

function DecisionButton({ label, action, requirement, busyAction, onDecide }: { label: string; action: AdminDecisionAction; requirement: PartnerRequirement; busyAction: string | null; onDecide: (requirement: PartnerRequirement, action: AdminDecisionAction) => void }) {
  const busy = busyAction === `${requirement.id}:${action}`;
  const tone = action === "final_approve" || action === "recommend_approval" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : action === "reject" ? "border-red-400/30 bg-red-500/10 text-red-100" : action === "request_changes" || action === "renewal_required" || action === "hold" || action === "send_back_correction" ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-[#f97316]/35 bg-[#f97316]/10 text-[#fed7aa]";
  return (
    <button type="button" disabled={busy} onClick={() => onDecide(requirement, action)} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black disabled:opacity-50 ${tone}`}>
      {action === "final_approve" || action === "recommend_approval" ? <CheckCircle2 className="h-4 w-4" /> : action === "reject" ? <XCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      {busy ? "Saving" : label}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-2xl shadow-black/20"><h2 className="mb-3 text-sm font-black text-cyan-100">{title}</h2>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-sky-300/70">{label}</p><p className="mt-1 break-words text-sm font-semibold text-white">{value}</p></div>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-[#0b1220] px-3 text-sm font-semibold text-white outline-none focus:border-sky-300/40">{options.map((option) => {
    const value = typeof option === "string" ? option : option.value;
    const optionLabel = typeof option === "string" ? option || label : option.label;
    return <option key={value || "all"} value={value}>{optionLabel}</option>;
  })}</select>;
}

function Notice({ text }: { text: string }) {
  return <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{text}</div>;
}

function StatusChip({ status }: { status: string }) {
  const tone = status === "VERIFIED"
    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
    : status === "REJECTED" || status === "EXPIRED"
      ? "border-red-400/35 bg-red-500/10 text-red-100"
      : status === "CHANGES_REQUIRED" || status === "EXPIRING_SOON"
        ? "border-amber-300/35 bg-amber-300/10 text-amber-100"
        : status === "UNDER_REVIEW"
          ? "border-blue-300/35 bg-blue-400/10 text-blue-100"
          : status === "SUBMITTED"
            ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
            : "border-slate-400/25 bg-slate-400/10 text-slate-200";
  return <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-black ${tone}`}>{humanStatus(status)}</span>;
}

function ReviewStageFlow({ depth, stage, documentState, events }: { depth: ReviewDepth; stage: ReviewStage; documentState: DocumentReviewState; events: PartnerVerificationEvent[] }) {
  const steps = depth === "TWO_LEVEL"
    ? ["Document submitted", "Document Check", "Final Review", "Verified"]
    : ["Document submitted", "Document Check", "Senior Review", "Final Approval", "Verified"];
  const activeIndex = documentState === "submitted" ? reviewStageIndex(depth, stage) : 0;
  const latest = events.find((event) => event.action.startsWith("admin.review."));
  const currentAction = documentState === "awaiting" ? "Awaiting Partner document" : documentState === "unavailable" ? "Document unavailable" : stageCopy(stage);
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#111827] p-3" data-review-stage-flow={depth}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-black">
        {steps.map((step, index) => (
          <span key={step} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${index < activeIndex ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : index === activeIndex ? "border-[#f97316]/40 bg-[#f97316]/10 text-[#fed7aa]" : "border-slate-500/25 bg-slate-500/10 text-slate-300"}`}>
            {index < activeIndex ? "✓" : index === activeIndex ? "●" : "○"} {step}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-400">Current action required: <span className="text-[#fed7aa]">{currentAction}</span></p>
      <p className="mt-1 text-xs font-semibold text-slate-400">Previous reviewer: <span className="text-white">{latest ? "Recorded" : "Not recorded"}</span></p>
    </div>
  );
}

function HistoryRow({ event }: { event: PartnerVerificationEvent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3 text-sm">
      <p className="font-black text-white">{event.action.replace(/admin\.review\./, "Review ").replace(/_/g, " ")}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{event.reason || event.newStatus || "Recorded"} - {formatDate(event.createdAt)}</p>
    </div>
  );
}

function filterQueue(rows: PartnerQueueRow[], filters: { activeTab: QueueTab; query: string; serviceFilter: string; countryFilter: string; stateFilter: string; submittedAfter: string }) {
  return rows.filter((row) => {
    const haystack = `${row.organization.legalName} ${row.organization.brandName ?? ""}`.toLowerCase();
    if (filters.query && !haystack.includes(filters.query.toLowerCase())) return false;
    if (filters.serviceFilter && !row.selectedServices.some((service) => service.serviceCode === filters.serviceFilter || service.serviceLabel === filters.serviceFilter)) return false;
    if (filters.countryFilter && (row.organization.country || "India") !== filters.countryFilter) return false;
    if (filters.stateFilter && row.review.status !== filters.stateFilter) return false;
    if (filters.submittedAfter && row.review.submittedAt && new Date(row.review.submittedAt) < new Date(filters.submittedAfter)) return false;
    if (filters.activeTab === "my-reviews") return row.review.status === "SUBMITTED" || row.review.status === "UNDER_REVIEW";
    if (filters.activeTab === "level-1") return row.review.status === "SUBMITTED";
    if (filters.activeTab === "senior-review") return row.review.status === "UNDER_REVIEW";
    if (filters.activeTab === "final-approval") return row.review.status === "UNDER_REVIEW";
    if (filters.activeTab === "changes") return row.review.status === "CHANGES_REQUIRED";
    if (filters.activeTab === "completed") return row.review.status === "VERIFIED" || row.review.status === "REJECTED" || row.review.status === "EXPIRED" || row.review.status === "EXPIRING_SOON";
    return true;
  });
}

function buildFilterOptions(rows: PartnerQueueRow[]) {
  return {
    services: [...new Set(rows.flatMap((row) => row.selectedServices.map((service) => service.serviceLabel)))].sort(),
    countries: [...new Set(rows.map((row) => row.organization.country || "India"))].sort(),
  };
}

function serviceHeadline(services: PartnerServiceScope[]) {
  if (!services.length) return "No services selected";
  if (services.length === 1) return services[0]!.serviceLabel;
  return `${services[0]!.serviceLabel} + ${services.length - 1} more`;
}

function nextQueueAction(status: string) {
  if (status === "SUBMITTED") return "Start document check";
  if (status === "UNDER_REVIEW") return "Review document";
  if (status === "CHANGES_REQUIRED") return "Wait for Partner";
  if (status === "VERIFIED") return "Ready for activation";
  if (status === "REJECTED") return "Closed";
  if (status === "EXPIRED" || status === "EXPIRING_SOON") return "Request renewal";
  return "Review";
}

function humanStatus(status: string) {
  if (status === "SUBMITTED") return "Ready for Review";
  if (status === "UNDER_REVIEW") return "Under Review";
  if (status === "CHANGES_REQUIRED") return "Changes Required";
  if (status === "VERIFIED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "EXPIRED") return "Renewal Required";
  if (status === "EXPIRING_SOON") return "Expiring Soon";
  return "Not Started";
}

function stageLabel(requirement: PartnerRequirement) {
  const stage = requirement.metadata?.requirementStage;
  if (stage === "REQUIRED_NOW") return "Required now";
  if (stage === "BEFORE_ACTIVATION") return "Required before this service goes live";
  return "Only if applicable";
}

function reviewDepthForRequirement(requirement: PartnerRequirement): ReviewDepth {
  if (requirement.metadata?.reviewDepth === "TWO_LEVEL" || requirement.metadata?.reviewDepth === "THREE_LEVEL") return requirement.metadata.reviewDepth;
  if (requirement.serviceScopeId) return "THREE_LEVEL";
  if (["PROPERTY", "VEHICLE", "DRIVER", "PROFESSIONAL", "SERVICE", "LOCATION", "EQUIPMENT_ASSET"].includes(requirement.ownerEntityType)) return "THREE_LEVEL";
  return "TWO_LEVEL";
}

function reviewStageForRequirement(requirement: PartnerRequirement, events: PartnerVerificationEvent[], depth: ReviewDepth): ReviewStage {
  if (requirement.status === "VERIFIED") return "VERIFIED";
  if (requirement.status === "CHANGES_REQUIRED") return "CHANGES_REQUIRED";
  if (requirement.status === "REJECTED") return "REJECTED";
  if (requirement.status === "EXPIRED" || requirement.status === "EXPIRING_SOON") return "EXPIRED";
  if (requirement.status === "SUBMITTED") return "LEVEL_1_READY";
  const latest = latestRequirementEvent(events, requirement.id);
  if (latest?.action === "admin.review.send_senior_review") return "LEVEL_2_READY";
  if (latest?.action === "admin.review.start_senior_review") return "LEVEL_2_IN_REVIEW";
  if (latest?.action === "admin.review.recommend_approval") return depth === "TWO_LEVEL" ? "VERIFIED" : "LEVEL_3_READY";
  if (latest?.action === "admin.review.escalate") return "LEVEL_3_READY";
  if (latest?.action === "admin.review.start_final_approval") return "LEVEL_3_IN_REVIEW";
  if (latest?.action === "admin.review.hold") return "ON_HOLD";
  return requirement.status === "UNDER_REVIEW" ? "LEVEL_1_IN_REVIEW" : "LEVEL_1_READY";
}

function latestRequirementEvent(events: PartnerVerificationEvent[], requirementId: string) {
  return [...events].reverse().find((event) => event.requirementId === requirementId && event.action.startsWith("admin.review."));
}

function reviewActions(stage: ReviewStage, hasDocument: boolean, permissions: string[], expires?: boolean): Array<{ action: AdminDecisionAction; label: string }> {
  if (!hasDocument) return [];
  if (stage === "LEVEL_1_READY") return visibleActions([{ action: "start_review", label: "Start document check" }], permissions);
  if (stage === "LEVEL_1_IN_REVIEW") return visibleActions([{ action: "send_senior_review", label: "Send for senior review" }, { action: "request_changes", label: "Request changes" }], permissions);
  if (stage === "LEVEL_2_READY") return visibleActions([{ action: "start_senior_review", label: "Start senior review" }], permissions);
  if (stage === "LEVEL_2_IN_REVIEW") return visibleActions([{ action: "recommend_approval", label: "Recommend approval" }, { action: "send_back_correction", label: "Send back for correction" }, { action: "request_changes", label: "Request changes" }, { action: "reject", label: "Reject" }, { action: "escalate", label: "Escalate" }], permissions);
  if (stage === "LEVEL_3_READY") return visibleActions([{ action: "start_final_approval", label: "Start final approval" }], permissions);
  if (stage === "LEVEL_3_IN_REVIEW") return visibleActions([{ action: "final_approve", label: "Final approve" }, { action: "request_changes", label: "Request changes" }, { action: "reject", label: "Reject" }, { action: "hold", label: "Hold for additional review" }], permissions);
  if (stage === "VERIFIED" && expires) return visibleActions([{ action: "renewal_required", label: "Renewal required" }], permissions);
  return [];
}

function visibleActions(actions: Array<{ action: AdminDecisionAction; label: string }>, permissions: string[]) {
  return actions.filter((item) => canRunAction(item.action, permissions));
}

function canRunAction(action: AdminDecisionAction, permissions: string[]) {
  const has = (permission: AdminPermission) => permissions.includes(permission) || permissions.includes("admin.super") || permissions.includes("*");
  const manage = has("partner_verification.manage");
  if (action === "start_review" || action === "send_senior_review") return manage || has("partner_verification.level1_review");
  if (action === "start_senior_review" || action === "recommend_approval" || action === "send_back_correction" || action === "escalate") return manage || has("partner_verification.level2_review");
  if (action === "start_final_approval" || action === "final_approve" || action === "hold") return manage || has("partner_verification.final_approve");
  if (action === "reject") return manage || has("partner_verification.level2_review") || has("partner_verification.final_approve");
  if (action === "request_changes" || action === "renewal_required") return manage || has("partner_verification.level1_review") || has("partner_verification.level2_review") || has("partner_verification.final_approve");
  return manage || has("partner_verification.review");
}

function waitingCopy(stage: ReviewStage, documentState: DocumentReviewState) {
  if (documentState === "awaiting") return "Awaiting Partner document.";
  if (documentState === "unavailable") return "Document unavailable.";
  if (stage === "CHANGES_REQUIRED") return "Waiting for Partner update.";
  if (stage === "EXPIRED") return "Waiting for replacement.";
  if (stage === "VERIFIED") return "Verified.";
  if (stage === "ON_HOLD") return "Hold for additional review.";
  return "No action available for your reviewer level.";
}

function documentReviewState(requirement: PartnerRequirement, document: PartnerDocument | null): DocumentReviewState {
  if (document) return "submitted";
  if (requirementHasSubmissionState(requirement.status)) return "unavailable";
  return "awaiting";
}

function requirementHasSubmissionState(status: PartnerRequirement["status"]) {
  return ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "CHANGES_REQUIRED", "REJECTED", "EXPIRING_SOON", "EXPIRED"].includes(status);
}

function actionNeedsMessage(action: AdminDecisionAction) {
  return ["request_changes", "reject", "hold", "renewal_required"].includes(action);
}

function reviewStageIndex(depth: ReviewDepth, stage: ReviewStage) {
  if (stage === "VERIFIED") return depth === "TWO_LEVEL" ? 3 : 4;
  if (stage === "LEVEL_3_READY" || stage === "LEVEL_3_IN_REVIEW") return 3;
  if (stage === "LEVEL_2_READY" || stage === "LEVEL_2_IN_REVIEW") return 2;
  if (stage === "LEVEL_1_READY" || stage === "LEVEL_1_IN_REVIEW") return 1;
  return 0;
}

function stageCopy(stage: ReviewStage) {
  if (stage === "LEVEL_1_READY") return "Start document check";
  if (stage === "LEVEL_1_IN_REVIEW") return "Document Check";
  if (stage === "LEVEL_2_READY") return "Start senior review";
  if (stage === "LEVEL_2_IN_REVIEW") return "Senior Review";
  if (stage === "LEVEL_3_READY") return "Start final approval";
  if (stage === "LEVEL_3_IN_REVIEW") return "Final Approval";
  if (stage === "CHANGES_REQUIRED") return "Waiting for Partner update";
  if (stage === "REJECTED") return "Rejected";
  if (stage === "EXPIRED") return "Renewal required";
  if (stage === "VERIFIED") return "Verified";
  return "Hold for additional review";
}

function groupRequirements(requirements: PartnerRequirement[]) {
  return [
    { title: "Business details", requirements: requirements.filter((item) => item.ownerEntityType === "ORGANIZATION") },
    { title: "Your identity/representative", requirements: requirements.filter((item) => ["PERSON", "PROFESSIONAL", "DRIVER"].includes(item.ownerEntityType) && !item.serviceScopeId) },
    { title: "Service-specific checks", requirements: requirements.filter((item) => Boolean(item.serviceScopeId)) },
    { title: "Additional/conditional checks", requirements: requirements.filter((item) => item.ownerEntityType === "LOCATION" || item.metadata?.requirementStage === "IF_APPLICABLE") },
  ].filter((group) => group.requirements.length);
}

function documentForRequirement(detail: PartnerOrganizationBundle | null, requirementId: string): PartnerDocument | null {
  const link = detail?.links?.find((item) => item.requirementId === requirementId && item.status === "active");
  return detail?.documents.find((document) => document.id === link?.documentId) ?? null;
}

function applicableServices(detail: PartnerOrganizationBundle, requirement: PartnerRequirement) {
  if (!requirement.serviceScopeId) return detail.serviceScopes.map((service) => service.serviceLabel).join(", ") || "Partner business";
  return detail.serviceScopes.find((service) => service.id === requirement.serviceScopeId)?.serviceLabel ?? "Selected service";
}

function requiredNow(detail: PartnerOrganizationBundle) {
  return detail.requirements.filter((item) => item.metadata?.requirementStage === "REQUIRED_NOW").length;
}

function readyNow(detail: PartnerOrganizationBundle) {
  return detail.requirements.filter((item) => item.metadata?.requirementStage === "REQUIRED_NOW" && ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "EXPIRING_SOON"].includes(item.status)).length;
}

function serviceTotal(detail: PartnerOrganizationBundle) {
  return detail.requirements.filter((item) => item.metadata?.requirementStage === "BEFORE_ACTIVATION").length;
}

function serviceReady(detail: PartnerOrganizationBundle) {
  return detail.requirements.filter((item) => item.metadata?.requirementStage === "BEFORE_ACTIVATION" && item.status === "VERIFIED").length;
}

function countStatus(detail: PartnerOrganizationBundle, status: PartnerVerificationStatus) {
  return detail.requirements.filter((item) => item.status === status).length;
}

function authorizedRepresentative(detail: PartnerOrganizationBundle) {
  const draft = detail.organization.metadata?.applicationDraft;
  if (!draft || typeof draft !== "object") return false;
  const contact = (draft as Record<string, unknown>).accountContact;
  return Boolean(contact && typeof contact === "object" && (contact as Record<string, unknown>).authorizedRepresentative);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "Not submitted";
}


