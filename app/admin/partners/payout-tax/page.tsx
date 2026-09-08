"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, RefreshCcw, ShieldCheck } from "lucide-react";
import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { adminApiRequest, readAdminSession, type AdminApiResult } from "../../../lib/admin/adminApiClient";
import type { PartnerOrganizationBundle, PartnerPayoutTaxStatus } from "../../../lib/partner/partnerApiClient";

type PayoutTaxQueueRow = {
  organizationId: string;
  organizationName: string;
  country: string;
  entityType: string;
  status: PartnerPayoutTaxStatus;
  currentStage: string;
  bankStatus: PartnerPayoutTaxStatus;
  taxStatus: PartnerPayoutTaxStatus;
  maskedBankAccount?: string | null;
  maskedTaxIdentifier?: string | null;
  submittedAt?: string | null;
  updatedAt?: string;
};

type PayoutTaxQueueResponse = {
  rows: PayoutTaxQueueRow[];
  permissions: { canRead: boolean; canReview: boolean; canManage: boolean; canSensitiveRead: boolean };
};

const filters = ["Ready for review", "Under review", "Changes required", "Verified", "Rejected", "Expired/Renewal required", "All"];

export default function AdminPartnerPayoutTaxPage() {
  return (
    <AdminProtected requiredPermissions={["partner_payout_tax.read"]}>
      <AdminShell title="Partner Payout & Tax">
        <AdminPartnerPayoutTaxReview />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminPartnerPayoutTaxReview() {
  const [queueResult, setQueueResult] = useState<AdminApiResult<PayoutTaxQueueResponse> | null>(null);
  const [detailResult, setDetailResult] = useState<AdminApiResult<PartnerOrganizationBundle> | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Ready for review");
  const [message, setMessage] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const permissions = readAdminSession()?.admin.permissions ?? [];
  const canReview = permissions.includes("partner_payout_tax.review") || permissions.includes("partner_payout_tax.manage");
  const canManage = permissions.includes("partner_payout_tax.manage");

  const load = useCallback(async () => {
    const result = await adminApiRequest<PayoutTaxQueueResponse>("/api/v1/admin/partners/payout-tax");
    setQueueResult(result);
    if (result.ok && selectedOrganizationId) {
      setDetailResult(await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partners/payout-tax/${encodeURIComponent(selectedOrganizationId)}`));
    }
  }, [selectedOrganizationId]);

  useEffect(() => {
    let active = true;
    async function loadInitialState() {
      const result = await adminApiRequest<PayoutTaxQueueResponse>("/api/v1/admin/partners/payout-tax");
      if (!active) return;
      setQueueResult(result);
      if (result.ok && selectedOrganizationId) {
        const detail = await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partners/payout-tax/${encodeURIComponent(selectedOrganizationId)}`);
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
    const state = filter === "Ready for review" ? "SUBMITTED" : filter === "Under review" ? "UNDER_REVIEW" : filter === "Changes required" ? "CHANGES_REQUIRED" : filter === "Expired/Renewal required" ? "EXPIRED" : filter.toUpperCase();
    return all.filter((row) => row.status === state || row.currentStage === state);
  }, [filter, queueResult]);
  const detail = detailResult?.ok ? detailResult.data : null;

  async function openDetail(organizationId: string) {
    setSelectedOrganizationId(organizationId);
    setDetailResult(await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partners/payout-tax/${encodeURIComponent(organizationId)}`));
  }

  async function act(action: string) {
    if (!selectedOrganizationId) return;
    const needsReason = ["request_changes", "reject", "mark_expired", "reopen"].includes(action);
    if (needsReason && !reason.trim()) {
      setMessage("Add a reason before saving this decision.");
      return;
    }
    const result = await adminApiRequest<PartnerOrganizationBundle>(`/api/v1/admin/partners/payout-tax/${encodeURIComponent(selectedOrganizationId)}/actions`, {
      method: "POST",
      body: { action, note: reason.trim() || undefined, partnerMessage: reason.trim() || undefined, internalNote: privateNote.trim() || undefined },
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setReason("");
    setPrivateNote("");
    setMessage("Review decision saved.");
    setDetailResult(result);
    await load();
  }

  if (queueResult && !queueResult.ok) {
    return <State message={queueResult.status === 403 ? "You do not have permission to view payout and tax reviews." : queueResult.error.message} />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">Partner Admin</p>
            <h1 className="mt-2 text-2xl font-black">Payout & Tax review</h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">Review masked payout and tax submissions. Payout activation remains separate.</p>
          </div>
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-100"><RefreshCcw size={16} /> Refresh</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1 text-xs font-black ${filter === item ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300"}`}>{item}</button>)}</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-3">
          {rows.length ? rows.map((row) => (
            <button key={row.organizationId} type="button" onClick={() => void openDetail(row.organizationId)} className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left shadow-lg hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{row.organizationName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{row.country} · {row.entityType}</p>
                </div>
                <StatusPill status={row.status} />
              </div>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-2">
                <span>Bank: {statusLabel(row.bankStatus)}</span>
                <span>Tax: {statusLabel(row.taxStatus)}</span>
                <span>Account: {row.maskedBankAccount || "Masked after save"}</span>
                <span>Tax ID: {row.maskedTaxIdentifier || "Masked after save"}</span>
              </div>
            </button>
          )) : <State message="No payout and tax reviews in this queue." />}
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-xl">
          {detail ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-300">Review detail</p>
                  <h2 className="mt-2 text-xl font-black">{detail.organization.brandName || detail.organization.legalName}</h2>
                  <p className="text-sm font-semibold text-slate-400">{detail.organization.country} · {detail.organization.organizationType}</p>
                </div>
                <Link href={`/admin/partner-verification?organizationId=${encodeURIComponent(detail.organization.id)}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-black text-sky-200"><Eye size={14} /> Documents</Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard title="Payout" rows={[["Country", detail.payoutProfile?.payoutCountry || "Not provided"], ["Currency", detail.payoutProfile?.settlementCurrency || "Not provided"], ["Beneficiary", detail.payoutProfile?.beneficiaryLegalName || "Not provided"], ["Bank account", detail.payoutProfile?.bankAccountMasked || "Masked after save"], ["Bank status", statusLabel(detail.payoutTaxReview?.bankStatus ?? detail.payoutProfile?.bankVerificationStatus ?? "NOT_PROVIDED")]]} />
                <InfoCard title="Tax" rows={[["Residency", detail.taxProfile?.taxResidencyCountries?.join(", ") || "Not provided"], ["Legal name", detail.taxProfile?.legalTaxName || "Not provided"], ["Tax ID", detail.taxProfile?.indiaPanMasked || detail.taxProfile?.indiaGstinMasked || detail.taxProfile?.foreignTaxIdentifierMasked || detail.taxProfile?.taxIdentifierMasked || "Masked after save"], ["Tax status", statusLabel(detail.payoutTaxReview?.taxStatus ?? detail.taxProfile?.taxRegistrationStatus ?? "NOT_PROVIDED")], ["Activation", "Not active"]]} />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <label className="text-sm font-black text-white">Message or reason</label>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-sky-400" placeholder="Required for changes, rejection, expiry or reopen." />
                <label className="mt-3 block text-sm font-black text-white">Private Admin note</label>
                <textarea value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} className="mt-2 min-h-16 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-sky-400" placeholder="Internal note. Not shown to Partner." />
              </div>
              <div className="flex flex-wrap gap-2">
                {canReview ? <><Action onClick={() => void act("start_review")} label="Start review" /><Action onClick={() => void act("verify_bank")} label="Verify bank evidence" /><Action onClick={() => void act("verify_tax")} label="Verify tax evidence" /><Action onClick={() => void act("send_senior_review")} label="Send to senior reviewer" /></> : null}
                {canManage ? <><Action onClick={() => void act("approve_review")} label="Approve review" tone="success" /><Action onClick={() => void act("request_changes")} label="Request changes" tone="warning" /><Action onClick={() => void act("reject")} label="Reject" tone="danger" /><Action onClick={() => void act("mark_expired")} label="Mark expired" tone="warning" /></> : null}
              </div>
              {message ? <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-sm font-semibold text-sky-100">{message}</p> : null}
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100"><ShieldCheck className="mr-2 inline h-4 w-4" />Full bank and tax values are not displayed here.</div>
            </div>
          ) : <State message="Select a Partner submission to review payout and tax details." />}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-black text-white">{title}</h3><dl className="mt-3 space-y-2 text-sm">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-400">{label}</dt><dd className="max-w-[220px] break-words text-right font-bold text-white">{value}</dd></div>)}</dl></section>;
}

function Action({ label, onClick, tone = "primary" }: { label: string; onClick: () => void; tone?: "primary" | "success" | "warning" | "danger" }) {
  const color = tone === "danger" ? "bg-red-600" : tone === "success" ? "bg-emerald-600" : tone === "warning" ? "bg-amber-600" : "bg-sky-600";
  return <button type="button" onClick={onClick} className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-black text-white ${color}`}>{label}</button>;
}

function StatusPill({ status }: { status: string }) {
  const color = status === "VERIFIED" ? "bg-emerald-500/15 text-emerald-200" : status === "REJECTED" || status === "CHANGES_REQUIRED" || status === "EXPIRED" ? "bg-red-500/15 text-red-200" : "bg-amber-500/15 text-amber-100";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${color}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function State({ message }: { message: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm font-semibold text-slate-300"><AlertTriangle className="mb-3 h-5 w-5 text-amber-300" />{message}</div>;
}
