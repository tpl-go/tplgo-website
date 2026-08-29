"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, FileText, MessageSquare, RefreshCcw, XCircle } from "lucide-react";
import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { adminApiRequest, type AdminApiResult } from "../../lib/admin/adminApiClient";
import type { PartnerOrganizationBundle, PartnerServiceScope } from "../../lib/partner/partnerApiClient";

type PartnerQueueRow = {
  review: { id: string; status: string; submittedAt?: string | null };
  organization: { id: string; legalName: string; brandName?: string | null; organizationType: string };
  selectedServices: PartnerServiceScope[];
  readiness: PartnerOrganizationBundle["readiness"];
  blockingCount: number;
};

type AdminDecisionAction = "approve" | "reject" | "request_changes" | "note";

type AdminDocumentAccess = {
  document: Record<string, unknown>;
  access: {
    download?: { url: string; expiresAt: string; supported: boolean };
    publicUrl: null;
    executionStatus: string;
  };
};

export default function AdminPartnerVerificationPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Verification">
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
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyAction, setBusyAction] = useState<AdminDecisionAction | null>(null);
  const [documentAccessMessage, setDocumentAccessMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async (organizationId: string) => {
    setActiveOrganizationId(organizationId);
    const result = await adminApiRequest<PartnerOrganizationBundle>(
      `/api/v1/admin/partner-verification/organizations/${encodeURIComponent(organizationId)}`
    );
    setDetailResult(result);
  }, []);

  const loadQueue = useCallback(async () => {
    const result = await adminApiRequest<PartnerQueueRow[]>("/api/v1/admin/partner-verification/queue");
    setQueueResult(result);
    if (result.ok && result.data.length > 0) {
      const requestedRow = requestedOrganizationId
        ? result.data.find((row) => row.organization.id === requestedOrganizationId)
        : null;
      const nextOrganizationId = requestedRow?.organization.id ?? (!activeOrganizationId ? result.data[0].organization.id : null);
      if (nextOrganizationId && nextOrganizationId !== activeOrganizationId) {
        await loadDetail(nextOrganizationId);
      }
    }
  }, [activeOrganizationId, loadDetail, requestedOrganizationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  async function decide(action: AdminDecisionAction) {
    if (!activeOrganizationId) return;
    setBusyAction(action);
    const result = await adminApiRequest<PartnerOrganizationBundle>(
      `/api/v1/admin/partner-verification/organizations/${encodeURIComponent(activeOrganizationId)}/decision`,
      {
        method: "POST",
        body: { action, note: note.trim() || undefined },
      }
    );
    setBusyAction(null);
    setDetailResult(result);
    if (result.ok) {
      setNote("");
      await loadQueue();
    }
  }

  async function openDocument(documentId: string) {
    if (!activeOrganizationId) return;
    setDocumentAccessMessage(null);
    const result = await adminApiRequest<AdminDocumentAccess>(
      `/api/v1/admin/partner-verification/organizations/${encodeURIComponent(activeOrganizationId)}/documents/${encodeURIComponent(documentId)}/access`
    );
    if (!result.ok) {
      setDocumentAccessMessage(result.error.message);
      return;
    }
    if (result.data.access.executionStatus !== "READY" || !result.data.access.download?.supported || !result.data.access.download.url) {
      setDocumentAccessMessage("Private document access is not ready.");
      return;
    }
    window.open(result.data.access.download.url, "_blank", "noopener,noreferrer");
    setDocumentAccessMessage(`Temporary signed access issued until ${new Date(result.data.access.download.expiresAt).toLocaleString()}.`);
  }

  const queue = queueResult?.ok ? queueResult.data : [];
  const detail = detailResult?.ok ? detailResult.data : null;

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Review Queue</h2>
            <p className="text-xs text-slate-500">Staging backend records only</p>
          </div>
          <button type="button" onClick={loadQueue} className="rounded p-2 text-slate-600 hover:bg-slate-100" aria-label="Refresh queue">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
        {queueResult && !queueResult.ok ? <Notice text={queueResult.error.message} /> : null}
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {queue.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No submitted Partner reviews are waiting.</p>
          ) : (
            queue.map((row) => (
              <button
                key={row.organization.id}
                type="button"
                onClick={() => loadDetail(row.organization.id)}
                className={[
                  "mb-2 w-full rounded border p-3 text-left text-sm",
                  activeOrganizationId === row.organization.id ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <p className="font-semibold text-slate-950">{row.organization.legalName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.organization.organizationType}</p>
                <p className="mt-2 text-xs font-medium text-slate-700">{row.selectedServices.map((service) => service.serviceLabel).join(", ") || "No services"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{row.review.status}</Badge>
                  <Badge>{row.blockingCount} blocking</Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid min-w-0 gap-4">
        {detailResult && !detailResult.ok ? <Notice text={detailResult.error.message} /> : null}
        {!detail ? (
          <div className="rounded border border-slate-200 bg-white p-8 text-sm text-slate-500">Select a Partner review to inspect.</div>
        ) : (
          <>
            <div className="rounded border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{detail.organization.legalName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{detail.organization.brandName || "No brand name"} - {detail.organization.organizationType}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail.organization.city || "-"}, {detail.organization.stateRegion || "-"}, {detail.organization.country}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{detail.review?.status ?? "NOT_SUBMITTED"}</Badge>
                  <Badge>{detail.readiness.overallVerificationStatus}</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Metric label="Contacts" value={`${detail.contacts.filter((contact) => contact.verificationStatus === "verified").length}/${detail.contacts.length} verified`} />
                <Metric label="Services" value={`${detail.serviceScopes.length}`} />
                <Metric label="Blocking" value={`${detail.readiness.blockingRequirements.length}`} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Contacts">
                {detail.contacts.map((contact) => (
                  <Row key={contact.id} label={`${contact.channel} - ${contact.value}`} value={contact.verificationStatus} />
                ))}
              </Panel>
              <Panel title="Selected Services">
                {detail.serviceScopes.map((service) => (
                  <Row key={service.id} label={service.serviceLabel} value={service.status} />
                ))}
              </Panel>
            </div>

            <Panel title="Requirements">
              <div className="grid gap-2">
                {detail.requirements.map((requirement) => (
                  <div key={requirement.id} className="rounded border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{requirement.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{requirement.description}</p>
                      </div>
                      <Badge>{requirement.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Document Metadata">
              {detail.documents.length === 0 ? (
                <p className="text-sm text-slate-500">No private document metadata exists yet.</p>
              ) : (
                detail.documents.map((document) => (
                  <div key={document.id} className="flex flex-col gap-2 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-700">{document.originalFilename} ({document.mimeType})</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{document.status}</Badge>
                      <button type="button" onClick={() => openDocument(document.id)} className="inline-flex h-8 items-center gap-2 rounded bg-white px-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
              {documentAccessMessage ? <p className="mt-2 text-xs font-medium text-slate-500">{documentAccessMessage}</p> : null}
            </Panel>

            <Panel title="Review Actions">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Decision note"
                className="min-h-24 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton icon={<CheckCircle2 className="h-4 w-4" />} label="Approve" busy={busyAction === "approve"} onClick={() => decide("approve")} />
                <ActionButton icon={<XCircle className="h-4 w-4" />} label="Reject" busy={busyAction === "reject"} onClick={() => decide("reject")} />
                <ActionButton icon={<FileText className="h-4 w-4" />} label="Request Changes" busy={busyAction === "request_changes"} onClick={() => decide("request_changes")} />
                <ActionButton icon={<MessageSquare className="h-4 w-4" />} label="Add Note" busy={busyAction === "note"} onClick={() => decide("note")} />
              </div>
            </Panel>

            <Panel title="Review History">
              <div className="grid gap-2">
                {detail.events.map((event) => (
                  <Row key={event.id} label={event.action} value={event.reason || event.newStatus || event.createdAt} />
                ))}
              </div>
            </Panel>
          </>
        )}
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-500">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{children}</span>;
}

function ActionButton({ icon, label, busy, onClick }: { icon: React.ReactNode; label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {icon}
      {busy ? "Saving" : label}
    </button>
  );
}

function Notice({ text }: { text: string }) {
  return <div className="m-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">{text}</div>;
}
