"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, RefreshCcw, ShieldCheck } from "lucide-react";
import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { adminApiRequest, readAdminSession, type AdminApiResult } from "../../../lib/admin/adminApiClient";
import type { PartnerAgreementStatus, PartnerOrganizationBundle } from "../../../lib/partner/partnerApiClient";

type AgreementQueueRow = {
  organizationId: string;
  agreementId: string;
  organizationName: string;
  country: string;
  entityType: string;
  signerName?: string | null;
  signerRole?: string | null;
  agreementType: string;
  templateVersion: number;
  serviceScheduleCount: number;
  signingMethod: string;
  status: PartnerAgreementStatus;
  tplReviewStatus: string;
  currentStage: string;
  updatedAt?: string;
};

type AgreementQueueResponse = {
  rows: AgreementQueueRow[];
  permissions: { canRead: boolean; canReview: boolean; canManage: boolean; canCountersign: boolean; canSensitiveRead: boolean };
};

const filters = ["Ready to issue", "Partner action required", "Signed document received", "Under review", "Changes required", "Countersign pending", "Completed", "Rejected", "Expired", "All"];

export default function AdminPartnerAgreementsPage() {
  return (
    <AdminProtected requiredPermissions={["partner_agreement.read"]}>
      <AdminShell title="Partner Agreements">
        <AdminPartnerAgreements />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminPartnerAgreements() {
  const [queueResult, setQueueResult] = useState<AdminApiResult<AgreementQueueResponse> | null>(null);
  const [detailResult, setDetailResult] = useState<AdminApiResult<PartnerOrganizationBundle & { agreementPermissions?: AgreementQueueResponse["permissions"]; activationAllowed?: boolean }> | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const permissions = readAdminSession()?.admin.permissions ?? [];
  const canReview = permissions.includes("partner_agreement.review") || permissions.includes("partner_agreement.manage");
  const canManage = permissions.includes("partner_agreement.manage");
  const canCountersign = permissions.includes("partner_agreement.countersign") || permissions.includes("partner_agreement.manage");

  const load = useCallback(async () => {
    const result = await adminApiRequest<AgreementQueueResponse>("/api/v1/admin/partners/agreements");
    setQueueResult(result);
    if (result.ok && selectedOrganizationId) {
      setDetailResult(await adminApiRequest(`/api/v1/admin/partners/agreements/${encodeURIComponent(selectedOrganizationId)}`));
    }
  }, [selectedOrganizationId]);

  useEffect(() => {
    let active = true;
    async function loadInitialState() {
      const result = await adminApiRequest<AgreementQueueResponse>("/api/v1/admin/partners/agreements");
      if (!active) return;
      setQueueResult(result);
      if (result.ok && selectedOrganizationId) {
        const detail = await adminApiRequest<PartnerOrganizationBundle & { agreementPermissions?: AgreementQueueResponse["permissions"]; activationAllowed?: boolean }>(`/api/v1/admin/partners/agreements/${encodeURIComponent(selectedOrganizationId)}`);
        if (active) setDetailResult(detail);
      }
    }
    void loadInitialState();
    return () => {
      active = false;
    };
  }, [refreshTick, selectedOrganizationId]);

  const rows = useMemo(() => {
    const all = queueResult?.ok ? queueResult.data.rows : [];
    if (filter === "All") return all;
    const state = agreementFilterState(filter);
    return all.filter((row) => row.status === state || row.currentStage === state || row.tplReviewStatus === state);
  }, [filter, queueResult]);
  const detail = detailResult?.ok ? detailResult.data : null;

  async function openDetail(organizationId: string) {
    setSelectedOrganizationId(organizationId);
    setDetailResult(await adminApiRequest(`/api/v1/admin/partners/agreements/${encodeURIComponent(organizationId)}`));
  }

  async function act(action: string) {
    if (!selectedOrganizationId) return;
    const needsReason = ["request_signer_correction", "request_changes", "reject", "expire", "void", "supersede", "reopen"].includes(action);
    if (needsReason && !reason.trim()) {
      setMessage("Add a reason before saving this agreement decision.");
      return;
    }
    const result = await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partners/agreements/${encodeURIComponent(selectedOrganizationId)}/actions`, {
      method: "POST",
      body: { action, note: reason.trim() || undefined, partnerMessage: reason.trim() || undefined, internalNote: privateNote.trim() || undefined },
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setReason("");
    setPrivateNote("");
    setMessage("Agreement decision saved.");
    setDetailResult(result as AdminApiResult<PartnerOrganizationBundle & { agreementPermissions?: AgreementQueueResponse["permissions"]; activationAllowed?: boolean }>);
    await load();
  }

  if (queueResult && !queueResult.ok) {
    return <State message={queueResult.status === 403 ? "You do not have permission to view Partner agreements." : queueResult.error.message} />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">Partner Admin</p>
            <h1 className="mt-2 text-2xl font-black">Agreement review</h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">Issue and review Partner agreement evidence. Completion remains separate from final Partner approval.</p>
          </div>
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-100"><RefreshCcw size={16} /> Refresh</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1 text-xs font-black ${filter === item ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300"}`}>{item}</button>)}</div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="space-y-3">
          {rows.length ? rows.map((row) => (
            <button key={row.agreementId} type="button" onClick={() => void openDetail(row.organizationId)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left shadow-lg hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{row.organizationName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{row.country} · {row.entityType}</p>
                </div>
                <StatusPill status={row.status} />
              </div>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300">
                <span>Signer: {row.signerName || "Not added"}{row.signerRole ? ` · ${row.signerRole}` : ""}</span>
                <span>Template: v{row.templateVersion} · {row.serviceScheduleCount} service schedule(s)</span>
                <span>Method: {agreementSigningMethodLabel(row.signingMethod)}</span>
              </div>
            </button>
          )) : <State message="No Partner agreements in this queue." />}
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-xl">
          {detail?.agreement ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-300">Agreement detail</p>
                  <h2 className="mt-2 text-xl font-black">{detail.organization.brandName || detail.organization.legalName}</h2>
                  <p className="text-sm font-semibold text-slate-400">{detail.organization.country} · {detail.organization.organizationType}</p>
                </div>
                <Link href={`/admin/partner-verification?organizationId=${encodeURIComponent(detail.organization.id)}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-black text-sky-200"><Eye size={14} /> Verification</Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard title="Agreement" rows={[["Status", statusLabel(detail.agreement.status)], ["TPL review", statusLabel(detail.agreement.tplReviewStatus)], ["Template version", String(detail.agreement.templateVersion)], ["Hash", `${detail.agreement.snapshotHash.slice(0, 12)}…`], ["Activation", "Not active"]]} />
                <InfoCard title="Signer" rows={[["Name", detail.agreement.signerName || "Not added"], ["Role", detail.agreement.signerRole || "Not added"], ["Authority", detail.agreement.signerAuthorityBasis || "Not added"], ["Method", agreementSigningMethodLabel(detail.agreement.signingMethod)], ["Signed document", detail.agreement.signedDocumentId ? "Private document attached" : "Not attached"]]} />
              </div>
              <InfoCard title="Service schedules" rows={(detail.serviceScopes.filter((scope) => scope.status !== "disabled").map((scope) => [scope.serviceLabel, scope.serviceCode] as [string, string])).slice(0, 12)} />
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <label className="text-sm font-black text-white">Message or reason</label>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-sky-400" placeholder="Required for correction, rejection, expiry, void, supersede or reopen." />
                <label className="mt-3 block text-sm font-black text-white">Private Admin/legal note</label>
                <textarea value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} className="mt-2 min-h-16 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-sky-400" placeholder="Internal note. Not shown to Partner." />
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage ? <><Action onClick={() => void act("prepare_issue")} label="Prepare/issue" /><Action onClick={() => void act("request_signer_correction")} label="Request signer correction" tone="warning" /></> : null}
                {canReview ? <><Action onClick={() => void act("start_review")} label="Start review" /><Action onClick={() => void act("review_signed_document")} label="Review signed document" /><Action onClick={() => void act("send_senior_review")} label="Send to senior reviewer" /><Action onClick={() => void act("approve_signing_evidence")} label="Approve signing evidence" tone="success" /></> : null}
                {canCountersign ? <Action onClick={() => void act("record_countersign")} label="Record countersign" tone="success" /> : null}
                {canManage ? <><Action onClick={() => void act("request_changes")} label="Request changes" tone="warning" /><Action onClick={() => void act("reject")} label="Reject" tone="danger" /><Action onClick={() => void act("expire")} label="Expire" tone="warning" /><Action onClick={() => void act("void")} label="Void" tone="danger" /><Action onClick={() => void act("supersede")} label="Supersede" tone="warning" /><Action onClick={() => void act("reopen")} label="Reopen" /></> : null}
              </div>
              {message ? <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-sm font-semibold text-sky-100">{message}</p> : null}
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100"><ShieldCheck className="mr-2 inline h-4 w-4" />Agreement completion does not approve the Partner, activate services, activate payouts or open the Partner Desk.</div>
            </div>
          ) : <State message="Select a Partner agreement to review." />}
        </section>
      </div>
    </div>
  );
}

function agreementFilterState(filter: string): string {
  if (filter === "Ready to issue") return "READY_TO_ISSUE";
  if (filter === "Partner action required") return "PARTNER_ACTION_REQUIRED";
  if (filter === "Signed document received") return "SIGNED_DOCUMENT_UPLOADED";
  if (filter === "Under review") return "UNDER_ADMIN_REVIEW";
  if (filter === "Changes required") return "CHANGES_REQUIRED";
  if (filter === "Countersign pending") return "COUNTERSIGN_PENDING";
  return filter.toUpperCase().replace(/\s+/g, "_");
}

function agreementSigningMethodLabel(method: string): string {
  if (method === "manual_signed_document") return "Manual signed document";
  if (method === "esign_provider") return "eSign provider disabled";
  return "Authenticated acceptance";
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-black text-white">{title}</h3><dl className="mt-3 space-y-2 text-sm">{rows.length ? rows.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-slate-800 pb-2 last:border-b-0"><dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt><dd className="break-words font-bold text-white">{value}</dd></div>) : <p className="text-sm font-semibold text-slate-400">No records yet.</p>}</dl></section>;
}

function Action({ label, onClick, tone = "primary" }: { label: string; onClick: () => void; tone?: "primary" | "success" | "warning" | "danger" }) {
  const color = tone === "danger" ? "bg-red-600" : tone === "success" ? "bg-emerald-600" : tone === "warning" ? "bg-amber-600" : "bg-sky-600";
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-black text-white ${color}`}>{label}</button>;
}

function StatusPill({ status }: { status: string }) {
  const color = status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-200" : status === "REJECTED" || status === "CHANGES_REQUIRED" || status === "EXPIRED" || status === "VOID" ? "bg-red-500/15 text-red-200" : "bg-amber-500/15 text-amber-100";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${color}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function State({ message }: { message: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm font-semibold text-slate-300"><AlertTriangle className="mb-3 h-5 w-5 text-amber-300" />{message}</div>;
}
