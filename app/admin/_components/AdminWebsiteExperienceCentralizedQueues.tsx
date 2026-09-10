"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Loader2, RefreshCcw, Search } from "lucide-react";
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
import {
  buildAuditRows,
  filterHistoryRows,
  formatHistoryDateTime,
  historyAreaFromValue,
  historyEventTypeFromValue,
  recordKindLabel,
  type HistoryArea,
  type HistoryEventType,
} from "./AdminWebsiteExperienceHistoryPresentation";

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
  const [source, setSource] = useState<"all" | HistoryArea>("all");
  const [eventType, setEventType] = useState<"all" | HistoryEventType>("all");
  const [search, setSearch] = useState("");
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
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSource(historyAreaFromValue(params.get("source")));
      setEventType(historyEventTypeFromValue(params.get("type")));
      setSearch(params.get("search") ?? "");
      setSelectedRecordId(params.get("record") ?? "");
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const records = useMemo(() => state.status === "ready" ? buildAuditRows(state.website, state.catalogue) : [], [state]);
  const visibleRecords = useMemo(() => filterHistoryRows(records, { search, source, eventType }), [eventType, records, search, source]);
  const selectedRecord = records.find((record) => record.id === selectedRecordId);

  function pushHistoryUrl(next: { source?: "all" | HistoryArea; eventType?: "all" | HistoryEventType; search?: string; recordId?: string }) {
    const nextSource = next.source ?? source;
    const nextEventType = next.eventType ?? eventType;
    const nextSearch = next.search ?? search;
    const nextRecordId = next.recordId ?? selectedRecordId;
    const params = new URLSearchParams();
    if (nextSource !== "all") params.set("source", nextSource);
    if (nextEventType !== "all") params.set("type", nextEventType);
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextRecordId) params.set("record", nextRecordId);
    window.history.pushState(null, "", params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname);
  }

  function updateSource(next: "all" | HistoryArea) {
    setSource(next);
    pushHistoryUrl({ source: next, recordId: "" });
  }

  function updateEventType(next: "all" | HistoryEventType) {
    setEventType(next);
    pushHistoryUrl({ eventType: next, recordId: "" });
  }

  function updateSearch(next: string) {
    setSearch(next);
    pushHistoryUrl({ search: next, recordId: "" });
  }

  function openRecord(recordId: string) {
    setSelectedRecordId(recordId);
    pushHistoryUrl({ recordId });
  }

  function closeRecord() {
    setSelectedRecordId("");
    pushHistoryUrl({ recordId: "" });
  }

  if (state.status === "loading") return <CentralState title="Loading History..." text="Preparing content activity." />;
  if (state.status === "error") return <CentralState title="We couldn't load content history." text="Navigation is still available." action={<button type="button" onClick={load} className="centralButton secondary"><RefreshCcw size={16} /> Retry</button>} />;

  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 text-slate-100 shadow-xl shadow-black/20">
      {selectedRecord ? (
        <>
          <AdminBackButton onClick={closeRecord} label="Back to History" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "History", href: "/admin/website-experience/versions-audit" }, { label: selectedRecord.actionLabel }]} />
          <CentralHeader title={selectedRecord.actionLabel} subtitle={selectedRecord.summary} />
          <div className="grid gap-3 rounded-xl border border-white/10 bg-[#081427] p-4 text-sm text-slate-300 sm:grid-cols-2" data-history-detail="operator">
            <HistoryDetailLine label="Item" value={selectedRecord.itemTitle} />
            <HistoryDetailLine label="Content type" value={selectedRecord.contentType} />
            <HistoryDetailLine label="Area" value={selectedRecord.contentArea} />
            <HistoryDetailLine label="Actor" value={selectedRecord.actor} />
            <HistoryDetailLine label="When" value={formatHistoryDateTime(selectedRecord.createdAt)} />
            <HistoryDetailLine label="Version" value={selectedRecord.versionLabel ?? "Not available"} />
            <HistoryDetailLine label="Previous state" value={selectedRecord.previousState ?? "Not available"} />
            <HistoryDetailLine label="Resulting state" value={selectedRecord.resultingState ?? "Not available"} />
            <HistoryDetailLine label="Record type" value={recordKindLabel(selectedRecord.recordKind)} />
            <HistoryDetailLine label="Summary" value={selectedRecord.summary || "Not available"} wide />
          </div>
          {selectedRecord.target ? (
            <Link href={selectedRecord.target.href} className="centralButton secondary w-fit" data-history-related-target={selectedRecord.id}>
              <Eye size={16} />
              {selectedRecord.target.label}
            </Link>
          ) : null}
        </>
      ) : (
        <>
          <AdminBackButton href="/admin/website-experience" label="Back to Website Experience" />
          <CentralBreadcrumb items={[{ label: "Website Experience", href: "/admin/website-experience" }, { label: "History" }]} />
          <CentralHeader title="History" subtitle="Track content changes, approvals and published versions." />
          <div className="grid gap-3 rounded-xl border border-white/10 bg-[#081427] p-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_14rem_14rem]" data-history-filters="compact">
            <label className="block min-w-0">
              <span className="text-xs font-black uppercase text-slate-400">Search</span>
              <span className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-500/20">
                <Search size={16} className="shrink-0 text-slate-500" />
                <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Item or action" className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
              </span>
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-black uppercase text-slate-400">Content</span>
              <select value={source} onChange={(event) => updateSource(historyAreaFromValue(event.target.value))} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20">
                <option value="all">All content</option>
                <option value="global">Global Experience</option>
                <option value="pages">Pages</option>
                <option value="partner_application">Partner Application</option>
                <option value="agreement_template">Agreement Templates</option>
                <option value="service_catalogue">Service Catalogue</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-black uppercase text-slate-400">Activity</span>
              <select value={eventType} onChange={(event) => updateEventType(historyEventTypeFromValue(event.target.value))} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20">
                <option value="all">All activity</option>
                <option value="draft_changes">Draft changes</option>
                <option value="approval">Approval activity</option>
                <option value="scheduling">Scheduling</option>
                <option value="publishing">Publishing</option>
                <option value="archived">Archived</option>
                <option value="versions">Versions</option>
              </select>
            </label>
          </div>
          {visibleRecords.length === 0 ? <EmptyPanel label="No history records match these filters." /> : (
            <div className="space-y-2" data-history-timeline="operator">
              {visibleRecords.map((record) => (
                <button key={record.id} type="button" onClick={() => openRecord(record.id)} className="flex min-h-16 w-full min-w-0 flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#081427] p-3 text-left shadow-md shadow-black/10 transition hover:border-sky-300/30 hover:bg-[#10213b] focus:outline-none focus:ring-2 focus:ring-sky-300 lg:flex-row lg:items-center">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-sky-50">{record.actionLabel}</span>
                    <span className="mt-1 block break-words text-sm text-slate-300">{record.itemTitle}</span>
                    <span className="mt-1 block text-xs text-slate-500">{record.contentType} · {record.actor} · {formatHistoryDateTime(record.createdAt)}</span>
                  </span>
                  <span className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusPill label={recordKindLabel(record.recordKind)} />
                    {record.versionLabel ? <StatusPill label={record.versionLabel} /> : null}
                    {record.resultingState ? <StatusPill label={record.resultingState} /> : null}
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

function HistoryDetailLine({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded border border-white/10 bg-white/[0.03] p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-100">{value}</p>
    </div>
  );
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
