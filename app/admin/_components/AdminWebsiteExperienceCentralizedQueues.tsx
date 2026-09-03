"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import { AdminBackButton } from "./AdminBackButton";
import {
  getAdminPartnerServiceCatalogue,
  getAdminWebsiteExperienceLoginSignup,
  resolveAdminPartnerRequestedService,
  saveAdminPartnerServiceCatalogueDraft,
  type AdminPartnerServiceCatalogueItem,
  type AdminPartnerServiceCatalogueResponse,
  type WebsiteExperienceAdminResponse,
} from "../../lib/admin/adminApiClient";
import { partnerServiceCatalog } from "../../lib/partner/partnerServiceCatalog";

type CatalogueState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: AdminPartnerServiceCatalogueResponse; error: null }
  | { status: "error"; data: null; error: string };

type AuditState =
  | { status: "loading"; website: null; catalogue: null; error: null }
  | { status: "ready"; website: WebsiteExperienceAdminResponse; catalogue: AdminPartnerServiceCatalogueResponse; error: null }
  | { status: "error"; website: null; catalogue: null; error: string };

type RequestResolution = "mapped_to_existing" | "draft_service_created" | "closed";

export function AdminWebsiteExperienceServiceRequestsClient() {
  const [state, setState] = useState<CatalogueState>({ status: "loading", data: null, error: null });
  const [selectedRequestKey, setSelectedRequestKey] = useState("");
  const [note, setNote] = useState("");
  const [mappedServiceCode, setMappedServiceCode] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState({ status: "loading", data: null, error: null });
    const result = await getAdminPartnerServiceCatalogue();
    setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: "We couldn't load service requests." });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    const syncFromUrl = () => setSelectedRequestKey(new URLSearchParams(window.location.search).get("request") ?? "");
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const selectedRequest = state.data?.requestedServices.find((request) => request.requestKey === selectedRequestKey);
  const services = useMemo(() => (state.data?.draft.items ?? []).filter((item) => item.applicationSelectable && item.status !== "archived").sort((a, b) => a.name.localeCompare(b.name)), [state.data]);

  function openRequest(requestKey: string) {
    setSelectedRequestKey(requestKey);
    setMessage("");
    const params = new URLSearchParams();
    params.set("request", requestKey);
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function closeRequest() {
    setSelectedRequestKey("");
    setMessage("");
    window.history.pushState(null, "", window.location.pathname);
  }

  async function resolveRequest(requestKey: string, resolutionType: RequestResolution, draftServiceCode?: string) {
    setBusy(`resolve:${requestKey}`);
    const result = await resolveAdminPartnerRequestedService({
      requestKey,
      resolutionType,
      mappedServiceCode: resolutionType === "mapped_to_existing" ? mappedServiceCode || undefined : undefined,
      draftServiceCode,
      resolutionNote: note,
      expectedStatus: "new",
    });
    setBusy("");
    if (!result.ok) {
      setMessage(result.status === 403 ? "Permission denied" : result.error.message || "Action failed");
      return;
    }
    setState({ status: "ready", data: result.data, error: null });
    setNote("");
    setMappedServiceCode("");
    setMessage(resolutionType === "draft_service_created" ? "Draft service created from this request." : resolutionType === "mapped_to_existing" ? "Request mapped to an existing service." : "Request closed.");
  }

  async function createDraftFromRequest(request: AdminPartnerServiceCatalogueResponse["requestedServices"][number]) {
    if (state.status !== "ready") return;
    const domain = request.closestDomain && partnerServiceCatalog.some((item) => item.id === request.closestDomain) ? request.closestDomain : "other-emerging";
    const stableCode = uniqueStableCode(slugify(request.requestedName) || "requested-service", state.data.draft.items);
    const draft: Partial<AdminPartnerServiceCatalogueItem> = {
      id: `svc_${stableCode}`,
      stableCode,
      name: request.requestedName,
      shortDescription: request.description || "Partner requested service.",
      domain,
      icon: "briefcase",
      displayOrder: Math.max(0, ...state.data.draft.items.filter((item) => item.domain === domain).map((item) => item.displayOrder)) + 1,
      status: "inactive",
      published: false,
      countries: ["IN"],
      individualAllowed: true,
      organizationAllowed: true,
      applicationSelectable: true,
      serviceApprovalRequired: true,
      verificationProfileKey: "manual_review",
      capabilities: ["project_enquiries"],
      aliases: [],
    };
    setBusy(`draft:${request.requestKey}`);
    const saved = await saveAdminPartnerServiceCatalogueDraft({ item: draft, expectedDraftVersion: state.data.draftVersion, changeSummary: `Created draft service for ${request.requestedName}` });
    if (!saved.ok) {
      setBusy("");
      setMessage(saved.status === 403 ? "Permission denied" : saved.error.message || "Draft could not be created");
      return;
    }
    setState({ status: "ready", data: saved.data, error: null });
    await resolveRequest(request.requestKey, "draft_service_created", stableCode);
  }

  if (state.status === "loading") return <CentralState title="Loading service requests..." text="Preparing Partner service requests." />;
  if (state.status === "error") return <CentralState title="We couldn't load service requests." text="Navigation is still available." action={<button type="button" onClick={load} className="centralButton secondary"><RefreshCcw size={16} /> Retry</button>} />;

  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 text-slate-100 shadow-xl shadow-black/20">
      {selectedRequest ? (
        <>
          <AdminBackButton onClick={closeRequest} label="Back to Service Requests" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "Service Requests", href: "/admin/website-experience/service-requests" }, { label: selectedRequest.requestedName }]} />
          <CentralHeader title={selectedRequest.requestedName} subtitle="Review this Partner service request." />
          <div className="rounded-xl border border-white/10 bg-[#081427] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm leading-6 text-slate-300">{selectedRequest.description || "No description supplied."}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">{domainTitle(selectedRequest.closestDomain)} · Requested {formatDateTime(selectedRequest.createdAt)}</p>
              </div>
              <StatusPill label={requestStatusLabel(selectedRequest)} />
            </div>
          </div>
          {message ? <p className="rounded-xl border border-sky-300/20 bg-sky-400/10 p-3 text-sm font-bold text-sky-100">{message}</p> : null}
          {state.data.permissions.canManage ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#081427] p-4">
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400">Map to Existing Service</span>
                <select value={mappedServiceCode} onChange={(event) => setMappedServiceCode(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20">
                  <option value="">Choose a service</option>
                  {services.map((service) => <option key={service.stableCode} value={service.stableCode}>{service.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400">Resolution Note</span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!mappedServiceCode || busy !== ""} onClick={() => resolveRequest(selectedRequest.requestKey, "mapped_to_existing")} className="centralButton secondary">Map to Existing Service</button>
                <button type="button" disabled={busy !== ""} onClick={() => createDraftFromRequest(selectedRequest)} className="centralButton primary">Create Draft Service</button>
                <button type="button" disabled={busy !== ""} onClick={() => resolveRequest(selectedRequest.requestKey, "closed")} className="centralButton danger">Reject</button>
                <button type="button" disabled={busy !== ""} onClick={() => resolveRequest(selectedRequest.requestKey, "closed")} className="centralButton secondary">Close</button>
              </div>
            </div>
          ) : null}
          <CentralStyles />
        </>
      ) : (
        <>
          <AdminBackButton href="/admin/website-experience" label="Back to Website Experience" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "Service Requests" }]} />
          <CentralHeader title="Service Requests" subtitle="Review services requested by Partners." />
          {state.data.requestedServices.length === 0 ? <EmptyPanel label="No service requests need attention." /> : (
            <div className="space-y-3">
              {state.data.requestedServices.map((request) => (
                <button key={request.requestKey} type="button" onClick={() => openRequest(request.requestKey)} className="flex min-h-20 w-full flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#081427] p-4 text-left shadow-md shadow-black/10 transition hover:border-sky-300/30 hover:bg-[#10213b] focus:outline-none focus:ring-2 focus:ring-sky-300 lg:flex-row lg:items-center">
                  <span className="min-w-0">
                    <span className="block text-base font-black text-sky-50">{request.requestedName}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-400">{request.description || "No description supplied."}</span>
                    <span className="mt-2 block text-xs font-semibold text-slate-500">{domainTitle(request.closestDomain)} · Requested {formatDateTime(request.createdAt)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <StatusPill label={requestStatusLabel(request)} />
                    <span className="inline-flex items-center gap-2 text-xs font-black text-cyan-100">Open <ArrowRight size={15} /></span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <CentralStyles />
        </>
      )}
    </section>
  );
}

export function AdminWebsiteExperienceVersionsAuditClient() {
  const [state, setState] = useState<AuditState>({ status: "loading", website: null, catalogue: null, error: null });
  const [source, setSource] = useState("all");
  const [selectedRecordId, setSelectedRecordId] = useState("");

  const load = useCallback(async () => {
    setState({ status: "loading", website: null, catalogue: null, error: null });
    const [website, catalogue] = await Promise.all([getAdminWebsiteExperienceLoginSignup(), getAdminPartnerServiceCatalogue()]);
    if (!website.ok || !catalogue.ok) {
      setState({ status: "error", website: null, catalogue: null, error: "We couldn't load content history." });
      return;
    }
    setState({ status: "ready", website: website.data, catalogue: catalogue.data, error: null });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const params = new URLSearchParams(window.location.search);
      setSource(params.get("source") ?? "all");
      setSelectedRecordId(params.get("record") ?? "");
    });
  }, []);

  const records = useMemo(() => state.status === "ready" ? buildAuditRows(state.website, state.catalogue) : [], [state]);
  const visibleRecords = source === "all" ? records : records.filter((record) => record.source === source);
  const selectedRecord = records.find((record) => record.id === selectedRecordId);

  function updateSource(next: string) {
    setSource(next);
    const params = new URLSearchParams();
    if (next !== "all") params.set("source", next);
    window.history.pushState(null, "", params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname);
  }

  function openRecord(recordId: string) {
    setSelectedRecordId(recordId);
    const params = new URLSearchParams();
    if (source !== "all") params.set("source", source);
    params.set("record", recordId);
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function closeRecord() {
    setSelectedRecordId("");
    const params = new URLSearchParams();
    if (source !== "all") params.set("source", source);
    window.history.pushState(null, "", params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname);
  }

  if (state.status === "loading") return <CentralState title="Loading content history..." text="Preparing Versions & Audit." />;
  if (state.status === "error") return <CentralState title="We couldn't load content history." text="Navigation is still available." action={<button type="button" onClick={load} className="centralButton secondary"><RefreshCcw size={16} /> Retry</button>} />;

  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 text-slate-100 shadow-xl shadow-black/20">
      {selectedRecord ? (
        <>
          <AdminBackButton onClick={closeRecord} label="Back to Versions & Audit" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "Versions & Audit", href: "/admin/website-experience/versions-audit" }, { label: selectedRecord.title }]} />
          <CentralHeader title={selectedRecord.title} subtitle={selectedRecord.detail} />
          <div className="rounded-xl border border-white/10 bg-[#081427] p-4 text-sm text-slate-300">
            <p><b className="text-slate-100">Source:</b> {sourceLabel(selectedRecord.source)}</p>
            <p className="mt-2"><b className="text-slate-100">When:</b> {formatDateTime(selectedRecord.createdAt)}</p>
            <p className="mt-2"><b className="text-slate-100">Status:</b> {selectedRecord.status}</p>
          </div>
        </>
      ) : (
        <>
          <AdminBackButton href="/admin/website-experience" label="Back to Website Experience" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "Versions & Audit" }]} />
          <CentralHeader title="Versions & Audit" subtitle="View content versions and activity history." />
          <label className="block max-w-sm">
            <span className="text-xs font-black uppercase text-slate-400">Source Filter</span>
            <select value={source} onChange={(event) => updateSource(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20">
              <option value="all">All</option>
              <option value="global">Global Experience</option>
              <option value="pages">Pages</option>
              <option value="partner_application">Partner Application</option>
              <option value="service_catalogue">Service Catalogue</option>
            </select>
          </label>
          {visibleRecords.length === 0 ? <EmptyPanel label="No history records match this filter." /> : (
            <div className="space-y-3">
              {visibleRecords.map((record) => (
                <button key={record.id} type="button" onClick={() => openRecord(record.id)} className="flex min-h-16 w-full flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#081427] p-4 text-left shadow-md shadow-black/10 transition hover:border-sky-300/30 hover:bg-[#10213b] focus:outline-none focus:ring-2 focus:ring-sky-300 lg:flex-row lg:items-center">
                  <span>
                    <span className="block text-base font-black text-sky-50">{record.title}</span>
                    <span className="mt-1 block text-sm text-slate-400">{record.detail}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <StatusPill label={sourceLabel(record.source)} />
                    <span className="text-xs font-semibold text-slate-500">{formatDateTime(record.createdAt)}</span>
                    <ArrowRight size={15} className="text-cyan-100" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <CentralStyles />
    </section>
  );
}

function buildAuditRows(website: WebsiteExperienceAdminResponse, catalogue: AdminPartnerServiceCatalogueResponse) {
  const websiteRows = website.recentAudit.map((row) => ({
    id: `website:${row.id}`,
    source: auditSource(row.context),
    title: humanAction(row.action),
    detail: row.changeSummary || contextTitle(row.context) || "Website Experience activity",
    status: humanAction(row.action),
    createdAt: row.createdAt,
  }));
  const catalogueAudit = catalogue.audit.map((row) => ({
    id: `catalogue-audit:${row.id}`,
    source: "service_catalogue",
    title: humanAction(row.action),
    detail: row.changeSummary || "Service Catalogue activity",
    status: humanAction(row.action),
    createdAt: row.createdAt,
  }));
  const catalogueVersions = catalogue.versions.map((row) => ({
    id: `catalogue-version:${row.id}`,
    source: "service_catalogue",
    title: `Catalogue Version ${row.version}`,
    detail: humanAction(row.status),
    status: humanAction(row.status),
    createdAt: row.publishedAt || row.createdAt,
  }));
  return [...catalogueAudit, ...catalogueVersions, ...websiteRows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function CentralHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-2xl font-black text-cyan-100">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p></div>;
}

function CentralBreadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item.label}:${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className="text-slate-600">&gt;</span> : null}
          {item.href ? <Link href={item.href} className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">{item.label}</Link> : <span aria-current="page" className="text-slate-300">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function CentralState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <section className="rounded-2xl border border-sky-300/15 bg-[#07111f] p-8 text-slate-100"><Loader2 className="animate-spin text-sky-300" size={28} /><h2 className="mt-4 text-2xl font-black text-sky-100">{title}</h2><p className="mt-2 text-sm text-slate-400">{text}</p>{action ? <div className="mt-4">{action}</div> : null}</section>;
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-sky-300/20 bg-[#081427] p-6 text-sm font-bold text-slate-400">{label}</div>;
}

function StatusPill({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-full border border-sky-300/15 bg-white/[0.04] px-3 py-1 text-xs font-black text-slate-200">{label}</span>;
}

function requestStatusLabel(request: AdminPartnerServiceCatalogueResponse["requestedServices"][number]) {
  if (request.resolution?.resolutionType === "mapped_to_existing") return "Mapped";
  if (request.resolution?.resolutionType === "draft_service_created") return "Draft Created";
  if (request.resolution?.resolutionType === "closed") return "Closed";
  if (request.status === "under_review") return "Under Review";
  if (request.status === "rejected") return "Rejected";
  if (request.status === "closed") return "Closed";
  return "New";
}

function auditSource(context?: string) {
  if (context === "partner_application") return "partner_application";
  if (context?.includes("page")) return "pages";
  return "global";
}

function sourceLabel(source: string) {
  if (source === "service_catalogue") return "Service Catalogue";
  if (source === "partner_application") return "Partner Application";
  if (source === "pages") return "Pages";
  if (source === "global") return "Global Experience";
  return "All";
}

function contextTitle(context?: string) {
  if (context === "partner_application") return "Partner Application";
  if (context === "partner_registration") return "Partner Registration";
  if (context === "partner_login") return "Partner Login";
  if (context === "user_login") return "User Login";
  return "";
}

function humanAction(value: string) {
  return value.split(/[_-]/g).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function domainTitle(id?: string) {
  if (!id) return "No closest domain";
  return partnerServiceCatalog.find((domain) => domain.id === id)?.title ?? humanAction(id);
}

function uniqueStableCode(base: string, items: AdminPartnerServiceCatalogueItem[]) {
  let candidate = slugify(base) || "requested-service";
  let index = 2;
  const codes = new Set(items.map((item) => item.stableCode));
  while (codes.has(candidate)) {
    candidate = `${slugify(base)}-${index}`;
    index += 1;
  }
  return candidate;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatDateTime(value?: string) {
  if (!value) return "not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "not available";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function CentralStyles() {
  return (
    <style>{`
      .centralButton {
        display: inline-flex;
        min-height: 2.5rem;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(255,255,255,0.12);
        padding: 0.55rem 0.8rem;
        font-size: 0.8125rem;
        font-weight: 900;
      }
      .centralButton:focus-visible { outline: 2px solid rgb(125,211,252); outline-offset: 2px; }
      .centralButton:disabled { cursor: not-allowed; opacity: 0.55; }
      .centralButton.primary { background: linear-gradient(135deg, #0284c7, #2563eb); color: #f8fafc; }
      .centralButton.secondary { background: rgba(15,23,42,0.72); color: #dbeafe; border-color: rgba(125,211,252,0.22); }
      .centralButton.danger { background: rgba(154,52,18,0.22); color: #fed7aa; border-color: rgba(251,146,60,0.30); }
    `}</style>
  );
}
