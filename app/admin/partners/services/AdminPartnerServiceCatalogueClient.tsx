"use client";

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  FilePenLine,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { AdminBackButton } from "../../_components/AdminBackButton";
import {
  changeAdminPartnerServiceCatalogueLifecycle,
  deleteAdminPartnerServiceCatalogueDraftItem,
  getAdminPartnerServiceCatalogue,
  saveAdminPartnerServiceCatalogueDraft,
  type AdminPartnerServiceCatalogueItem,
  type AdminPartnerServiceCatalogueResponse,
} from "../../../lib/admin/adminApiClient";
import { partnerServiceCatalog } from "../../../lib/partner/partnerServiceCatalog";

type Tone = "blue" | "cyan" | "orange" | "slate" | "violet" | "green" | "red";
type ItemKind = "category" | "service" | "sub-service";
type DialogMode = "add-domain" | "edit-domain" | "add-category" | "edit-category" | "add-service" | "edit-service" | "add-sub-service" | "edit-sub-service" | "delete";

const domainIcons: Record<string, string> = {
  "stay-accommodation": "bed",
  "travel-agencies-dmc-tour-operators": "briefcase",
  "tours-packages-journeys": "map",
  "yatra-spiritual-cultural": "landmark",
  "transport-mobility": "car",
  "experiences-activities-adventure": "sparkles",
  "medical-tourism-healthcare": "heart-pulse",
  "wedding-events": "party-popper",
  "film-shooting-ott": "clapperboard",
  "marketplace-local-commerce": "shopping-bag",
  "professional-local-services": "user-check",
  "other-emerging": "plus-circle",
};

export function AdminPartnerServiceCatalogueClient() {
  const [data, setData] = useState<AdminPartnerServiceCatalogueResponse | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [selectedDomain, setSelectedDomain] = useState(() => initialQueryParam("domain"));
  const [selectedItemCode, setSelectedItemCode] = useState(() => initialQueryParam("service"));
  const [query, setQuery] = useState("");
  const [domainQuery, setDomainQuery] = useState("");
  const [domainStatus, setDomainStatus] = useState("");
  const [status, setStatus] = useState("");
  const [itemType, setItemType] = useState("");
  const [selectable, setSelectable] = useState("");
  const [dialog, setDialog] = useState<{ mode: DialogMode; item?: AdminPartnerServiceCatalogueItem; parent?: AdminPartnerServiceCatalogueItem; domain?: string } | null>(null);
  const [draft, setDraft] = useState<AdminPartnerServiceCatalogueItem | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminPartnerServiceCatalogueItem | null>(null);

  async function loadCatalogue() {
    setLoadState("loading");
    const result = await getAdminPartnerServiceCatalogue();
    if (!result.ok) {
      setLoadState("error");
      setMessage({ tone: "error", text: result.error.message || "Catalogue data could not be loaded." });
      return;
    }
    setData(result.data);
    setLoadState("ready");
  }

  useEffect(() => {
    // Initial API hydration for this client-only Admin route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCatalogue();
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedDomain(params.get("domain") ?? "");
      setSelectedItemCode(params.get("service") ?? "");
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const items = useMemo(() => data?.draft.items ?? [], [data]);
  const publishedCodes = useMemo(() => new Set((data?.published.items ?? []).map((item) => item.stableCode)), [data]);
  const domains = useMemo(() => buildDomainRows(items, publishedCodes), [items, publishedCodes]);
  const activeDomain = useMemo(() => domains.find((domain) => domain.id === selectedDomain), [domains, selectedDomain]);
  const scopedItems = useMemo(() => items.filter((item) => item.domain === selectedDomain), [items, selectedDomain]);
  const visibleScopedItems = useMemo(() => activeDomain ? scopedItems.filter((item) => !isDomainRootItem(item, activeDomain)) : scopedItems, [activeDomain, scopedItems]);
  const selectedItem = useMemo(() => scopedItems.find((item) => item.stableCode === selectedItemCode), [scopedItems, selectedItemCode]);
  const filteredDomains = useMemo(() => {
    const q = normalize(domainQuery);
    return domains.filter((domain) => {
      if (domainStatus && domain.statusLabel !== domainStatus) return false;
      if (!q) return true;
      return normalize([domain.title, domain.description, domain.aliases.join(" ")].join(" ")).includes(q);
    });
  }, [domainQuery, domainStatus, domains]);
  const filteredScopedItems = useMemo(() => filterDomainItems(visibleScopedItems, scopedItems, { query, status, itemType, selectable }), [itemType, query, scopedItems, selectable, status, visibleScopedItems]);

  function openDialog(mode: DialogMode, item?: AdminPartnerServiceCatalogueItem, parent?: AdminPartnerServiceCatalogueItem) {
    const domain = item?.domain ?? parent?.domain ?? selectedDomain;
    setDialog({ mode, item, parent, domain });
    setDraft(mode === "delete" ? item ? cloneItem(item) : null : draftForMode(mode, domain, item, parent, items));
    setMessage(null);
  }

  function closeDialog() {
    setDialog(null);
    setDraft(null);
  }

  function navigate(next: { domain?: string; service?: string }) {
    const domain = next.domain ?? "";
    const service = next.service ?? "";
    setSelectedDomain(domain);
    setSelectedItemCode(service);
    const params = new URLSearchParams();
    if (domain) params.set("domain", domain);
    if (service) params.set("service", service);
    const url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState(null, "", url);
  }

  function updateDraft(next: Partial<AdminPartnerServiceCatalogueItem>) {
    setDraft((current) => current ? { ...current, ...next } : current);
  }

  async function saveDraft() {
    if (!draft || !data) return;
    setBusy("saving");
    setMessage({ tone: "info", text: "Saving draft..." });
    const result = await saveAdminPartnerServiceCatalogueDraft({ item: draft, expectedDraftVersion: data.draftVersion, changeSummary: `Saved draft for ${draft.stableCode}` });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Save failed" });
      return;
    }
    setData(result.data);
    if (draft.domain) setSelectedDomain(draft.domain);
    closeDialog();
    setMessage({ tone: "success", text: `Draft saved successfully. Partner Service Catalogue · Draft v${result.data.draftVersion}. Next action: Send for Approval.` });
  }

  async function lifecycle(item: AdminPartnerServiceCatalogueItem, action: "activate" | "inactivate" | "archive" | "reactivate") {
    if (!data) return;
    setBusy(`${action}:${item.stableCode}`);
    setMessage({ tone: "info", text: action === "archive" ? "Creating archive draft..." : action === "reactivate" ? "Creating restore draft..." : "Saving draft..." });
    const result = await changeAdminPartnerServiceCatalogueLifecycle(item.stableCode, action, { expectedDraftVersion: data.draftVersion, changeSummary: `${action} ${item.stableCode}` });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Action failed" });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: action === "archive" ? "Archive draft saved. Preview it, then send it for approval before publishing." : action === "reactivate" ? "Restore draft saved. Preview it, then send it for approval before publishing." : "Draft saved" });
  }

  async function deleteDraft() {
    if (!draft || !data) return;
    setBusy(`delete:${draft.stableCode}`);
    setMessage({ tone: "info", text: "Deleting draft..." });
    const result = await deleteAdminPartnerServiceCatalogueDraftItem(draft.stableCode, { expectedDraftVersion: data.draftVersion, changeSummary: `Deleted draft for ${draft.stableCode}` });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Action failed" });
      return;
    }
    setData(result.data);
    closeDialog();
    setMessage({ tone: "success", text: "Draft deleted. Published catalogue content remains unchanged." });
  }

  const hasDetailContext = Boolean(selectedDomain || selectedItemCode);

  if (loadState === "loading") {
    return (
      <>
        {hasDetailContext ? <HideCatalogueRouteChrome /> : null}
        <StatePanel icon={Loader2} spin title={hasDetailContext ? "Loading domain..." : "Loading service catalogue..."} text={hasDetailContext ? "Preparing this domain." : "Preparing the catalogue home."} />
      </>
    );
  }
  if (loadState === "error" || !data) {
    return (
      <>
        {hasDetailContext ? <HideCatalogueRouteChrome /> : null}
        <StatePanel
          icon={XCircle}
          title={hasDetailContext ? "We couldn't load this domain." : "We couldn't load the service catalogue."}
          text="Please try again."
          action={<div className="flex flex-wrap gap-2"><AdminBackButton href="/admin/website-experience/pages/partner/service-catalogue" label="Back to Service Catalogue" /><button type="button" onClick={loadCatalogue} className="premiumButton secondary"><RefreshCcw size={16} /> Retry</button></div>}
        />
      </>
    );
  }

  const showCatalogueHomeHeader = !selectedDomain && !selectedItem;

  return (
    <div data-admin-service-catalogue="true" className="min-h-screen rounded-2xl border border-sky-300/10 bg-[#07111f] p-4 text-slate-100 shadow-2xl shadow-sky-950/30 lg:p-6">
      <PremiumStyles />
      {!showCatalogueHomeHeader ? <HideCatalogueRouteChrome /> : null}
      {showCatalogueHomeHeader ? <CatalogueHeader
        data={data}
        domains={domains}
      /> : null}
      {message ? <Message tone={message.tone} text={message.text} /> : null}

      {selectedItem && activeDomain ? (
        <ServiceFocusedView
          item={selectedItem}
          domain={activeDomain}
          allDomainItems={scopedItems}
          canManage={data.permissions.canManage}
          busy={busy}
          onBack={() => navigate({ domain: activeDomain.id })}
          onEdit={(item) => openDialog(itemKind(item, scopedItems) === "sub-service" ? "edit-sub-service" : itemKind(item, scopedItems) === "category" ? "edit-category" : "edit-service", item)}
          onAddSubService={(item) => openDialog("add-sub-service", undefined, item)}
          onArchive={(item) => lifecycle(item, "archive")}
          onReactivate={(item) => lifecycle(item, "reactivate")}
          onDelete={(item) => openDialog("delete", item)}
        />
      ) : !activeDomain ? (
        <AllDomainsView
          domains={filteredDomains}
          query={domainQuery}
          setQuery={setDomainQuery}
          status={domainStatus}
          setStatus={setDomainStatus}
          canManage={data.permissions.canManage}
          onAddDomain={() => openDialog("add-domain")}
          onOpen={(domain) => {
             navigate({ domain: domain.id });
            setQuery("");
            setStatus("");
            setItemType("");
            setSelectable("");
          }}
        />
      ) : (
        <DomainDetailView
          domain={activeDomain}
          items={filteredScopedItems}
          allDomainItems={scopedItems}
          query={query}
          status={status}
          itemType={itemType}
          selectable={selectable}
          setQuery={setQuery}
          setStatus={setStatus}
          setItemType={setItemType}
          setSelectable={setSelectable}
          canManage={data.permissions.canManage}
          busy={busy}
           onBack={() => navigate({})}
          onAddCategory={() => openDialog("add-category")}
          onAddService={() => openDialog("add-service")}
          onEditDomain={() => openDialog("edit-domain", firstItemForDomain(items, activeDomain.id))}
          onArchiveDomain={() => {
            const item = firstItemForDomain(items, activeDomain.id);
            if (item) void lifecycle(item, "archive");
          }}
          onEdit={(item) => openDialog(itemKind(item, scopedItems) === "sub-service" ? "edit-sub-service" : itemKind(item, scopedItems) === "category" ? "edit-category" : "edit-service", item)}
          onAddSubService={(item) => openDialog("add-sub-service", undefined, item)}
          onArchive={(item) => lifecycle(item, "archive")}
          onReactivate={(item) => lifecycle(item, "reactivate")}
          onDelete={(item) => openDialog("delete", item)}
           onOpenItem={(item) => navigate({ domain: activeDomain.id, service: item.stableCode })}
        />
      )}

      {dialog ? (
        <CatalogueDialog
          mode={dialog.mode}
          domainTitle={activeDomain?.title ?? domainTitle(dialog.domain ?? draft?.domain ?? "")}
          draft={draft}
          allItems={items}
          canManage={data.permissions.canManage}
          busy={busy}
          onChange={updateDraft}
          onClose={closeDialog}
          onSave={saveDraft}
          onDelete={deleteDraft}
        />
      ) : null}
      {previewItem ? <CataloguePreviewModal item={previewItem} data={data} onClose={() => setPreviewItem(null)} onEdit={() => {
        const item = previewItem;
        setPreviewItem(null);
        openDialog(itemKind(item, items.filter((candidate) => candidate.domain === item.domain)) === "sub-service" ? "edit-sub-service" : itemKind(item, items.filter((candidate) => candidate.domain === item.domain)) === "category" ? "edit-category" : "edit-service", item);
      }} /> : null}
    </div>
  );
}

function CatalogueHeader({
  data,
  domains,
}: {
  data: AdminPartnerServiceCatalogueResponse;
  domains: DomainRow[];
}) {
  const state = data.workflowState ?? (data.hasUnpublishedChanges ? "draft" : "published");
  const totalServices = domains.reduce((sum, domain) => sum + domain.serviceCount, 0);
  const pendingChanges = domains.reduce((sum, domain) => sum + domain.draftCount, 0);
  const summaryState = catalogueStatusLabel(state, pendingChanges, Boolean(data.published.items.length));
  const unresolvedRequests = data.requestedServices.filter((request) => !request.resolution && !["closed", "rejected", "mapped", "draft_created"].includes(request.status)).length;
  return (
    <section className="rounded-2xl border border-sky-300/15 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl font-black tracking-normal text-sky-100">Service Catalogue</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Manage Partner service domains and services.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Catalogue summary">
          <SummaryChip label="Domains" value={String(domains.length)} />
          <SummaryChip label="Services" value={String(totalServices)} />
          {pendingChanges > 0 ? <SummaryChip label={pendingChanges === 1 ? "Pending Change" : "Pending Changes"} value={String(pendingChanges)} highlight /> : null}
          <StatusChip label={summaryState} tone={statusTone(summaryState)} />
          <Link href="/admin/website-experience/service-requests" className="inline-flex min-h-9 items-center rounded-full border border-sky-300/10 bg-white/[0.04] px-3 text-xs font-black text-slate-300 transition hover:border-sky-300/30 hover:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            {unresolvedRequests} Service {unresolvedRequests === 1 ? "Request" : "Requests"}
          </Link>
          <Link href="/admin/website-experience/versions-audit?source=service_catalogue" className="inline-flex min-h-9 items-center rounded-full border border-sky-300/10 bg-white/[0.04] px-3 text-xs font-black text-slate-300 transition hover:border-sky-300/30 hover:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            View History
          </Link>
        </div>
      </div>
    </section>
  );
}

function AllDomainsView(props: {
  domains: DomainRow[];
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  canManage: boolean;
  onAddDomain: () => void;
  onOpen: (domain: DomainRow) => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/15">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-black text-sky-100">Domains</h3>
          <p className="mt-1 text-sm text-slate-400">Manage service domains and their services.</p>
        </div>
        {props.canManage ? <button type="button" onClick={props.onAddDomain} className="premiumButton primary"><Plus size={16} /> Add Domain</button> : null}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <label className="block">
          <span className="text-xs font-black uppercase text-slate-400">Search Domains</span>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-500/20">
            <Search size={16} className="text-sky-300" />
            <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search domains" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase text-slate-400">Status Filter</span>
          <select value={props.status} onChange={(event) => props.setStatus(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20">
            {domainStatusOptions.map((option) => <option key={option} value={option === "All" ? "" : option}>{option}</option>)}
          </select>
        </label>
      </div>
      {props.domains.length === 0 ? <Empty label={props.query || props.status ? "No matching domains" : "No domains have been added yet."} /> : (
        <div className="mt-4 space-y-3">
          {props.domains.map((domain) => (
            <button key={domain.id} type="button" onClick={() => props.onOpen(domain)} className="flex min-h-20 w-full flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1b31] p-3 text-left shadow-md shadow-black/10 transition hover:border-sky-300/30 hover:bg-[#10213b] focus:outline-none focus:ring-2 focus:ring-sky-300 lg:flex-row lg:items-center">
              <span className="flex min-w-0 items-start gap-3">
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-cyan-200 ring-1 ring-sky-300/15">
                  <Layers3 className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-slate-100">{domain.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-400">{domain.description}</span>
                  <span className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-sky-300/10 bg-white/[0.04] px-3 py-1 font-black text-slate-300">{domain.serviceCount} Services</span>
                    {domain.draftCount > 0 ? <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-black text-amber-100">{domain.draftCount} Pending {domain.draftCount === 1 ? "Change" : "Changes"}</span> : null}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3 lg:justify-end">
                <StatusChip label={domain.statusLabel} tone={statusTone(domain.statusLabel)} />
                <ChevronRight className="h-4 w-4 text-sky-200" />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function DomainDetailView(props: {
  domain: DomainRow;
  items: AdminPartnerServiceCatalogueItem[];
  allDomainItems: AdminPartnerServiceCatalogueItem[];
  query: string;
  status: string;
  itemType: string;
  selectable: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setItemType: Dispatch<SetStateAction<string>>;
  setSelectable: Dispatch<SetStateAction<string>>;
  canManage: boolean;
  busy: string;
  onBack: () => void;
  onAddCategory: () => void;
  onAddService: () => void;
  onEditDomain: () => void;
  onArchiveDomain: () => void;
  onEdit: (item: AdminPartnerServiceCatalogueItem) => void;
  onAddSubService: (item: AdminPartnerServiceCatalogueItem) => void;
  onArchive: (item: AdminPartnerServiceCatalogueItem) => void;
  onReactivate: (item: AdminPartnerServiceCatalogueItem) => void;
  onDelete: (item: AdminPartnerServiceCatalogueItem) => void;
  onOpenItem: (item: AdminPartnerServiceCatalogueItem) => void;
}) {
  const tree = buildHierarchy(props.items, props.allDomainItems);
  const directItems = props.allDomainItems.filter((item) => !item.parentCode);
  const pendingChanges = props.domain.draftCount;
  const statusLabel = props.domain.statusLabel;
  const categoryCount = props.domain.categoryCount;
  const serviceCount = props.domain.serviceCount;
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/15">
        <AdminBackButton href="/admin/website-experience/pages/partner/service-catalogue" label="Back to Service Catalogue" />
        <DomainBreadcrumb domainName={props.domain.title} />
        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h3 className="text-3xl font-black text-cyan-100">{props.domain.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{props.domain.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusChip label={statusLabel} tone={statusTone(statusLabel)} />
              <SummaryChip label={serviceCount === 1 ? "Service" : "Services"} value={String(serviceCount)} />
              {categoryCount > 0 ? <SummaryChip label={categoryCount === 1 ? "Category" : "Categories"} value={String(categoryCount)} /> : null}
              {pendingChanges > 0 ? <SummaryChip label={pendingChanges === 1 ? "Pending Change" : "Pending Changes"} value={String(pendingChanges)} highlight /> : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" disabled={!props.canManage} onClick={props.onAddService} className="premiumButton primary"><Plus size={16} /> Add Service</button>
            <button type="button" disabled={!props.canManage} onClick={props.onEditDomain} className="premiumButton secondary"><FilePenLine size={16} /> Edit Domain</button>
            <details className="relative">
              <summary className="premiumButton secondary cursor-pointer list-none">More Actions</summary>
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-sky-300/15 bg-[#07111f] p-2 shadow-2xl shadow-black/40">
                <button type="button" disabled={!props.canManage} onClick={props.onAddCategory} className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-sky-400/10 focus:outline-none focus:ring-2 focus:ring-sky-300">Add Category</button>
                <Link href="/admin/website-experience/versions-audit?source=service_catalogue" className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:bg-sky-400/10 focus:outline-none focus:ring-2 focus:ring-sky-300">Version History</Link>
                <button type="button" disabled={!props.canManage || props.busy !== "" || !directItems.length} onClick={props.onArchiveDomain} className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-orange-100 hover:bg-orange-400/10 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50">Start Archive</button>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-lg shadow-black/15">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-cyan-100"><Filter size={16} /> Filters</div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_14rem_14rem]">
          <label className="block md:col-span-2">
            <span className="text-xs font-black uppercase text-slate-400">Search services</span>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus:ring-sky-500/20">
              <Search size={16} className="text-sky-300" />
              <input data-admin-service-search="true" value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search services" />
            </div>
          </label>
          <Select label="Type" value={props.itemType} onChange={props.setItemType} options={[["category", "Category"], ["service", "Service"], ["sub-service", "Sub-service"]]} />
          <Select label="Status" value={props.status} onChange={props.setStatus} options={[["inactive", "Draft"], ["active", "Published"], ["archived", "Archived"]]} />
          <details className="md:col-span-2 xl:col-span-3">
            <summary className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-xs font-black text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300">More Filters</summary>
            <div className="mt-3 max-w-sm">
              <Select label="Application availability" value={props.selectable} onChange={props.setSelectable} options={[["true", "Available"], ["false", "Not available"]]} />
            </div>
          </details>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4 shadow-lg shadow-black/15">
        <div className="flex flex-col gap-1">
          <h4 className="text-xl font-black text-sky-100">Services</h4>
          <p className="text-sm leading-6 text-slate-400">Manage categories and services in this domain.</p>
        </div>
        {tree.length === 0 ? <Empty label={props.query || props.status || props.itemType || props.selectable ? "No matching services found." : "No services have been added to this domain yet."} /> : (
          <div className="mt-4 space-y-3">
            {tree.map((node) => (
              <HierarchyRow
                key={node.item.stableCode}
                node={node}
                onOpenItem={props.onOpenItem}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function HierarchyRow({ node, onOpenItem }: {
  node: HierarchyNode;
  onOpenItem?: (item: AdminPartnerServiceCatalogueItem) => void;
}) {
  const kind = node.kind;
  return (
    <article className={`${node.depth > 0 ? "ml-0 md:ml-5" : ""}`}>
      <button type="button" onClick={() => onOpenItem?.(node.item)} className="flex min-h-20 w-full flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1b31] p-3 text-left shadow-md shadow-black/10 transition hover:border-sky-300/30 hover:bg-[#10213b] focus:outline-none focus:ring-2 focus:ring-sky-300 lg:flex-row lg:items-center">
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-cyan-200 ring-1 ring-sky-300/15">
            <Layers3 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="block text-base font-black text-slate-100">{node.item.name}</span>
              <StatusChip label={titleKind(kind)} tone={kind === "category" ? "violet" : kind === "sub-service" ? "orange" : "blue"} />
            </span>
            <span className="mt-1 block text-sm leading-5 text-slate-400">{node.item.shortDescription}</span>
            <span className="mt-2 flex flex-wrap gap-2 text-xs">
              {node.children.length > 0 ? <span className="rounded-full border border-sky-300/10 bg-white/[0.04] px-3 py-1 font-black text-slate-300">{node.children.length} {node.children.length === 1 ? "item" : "items"}</span> : null}
              {!node.item.published ? <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-black text-amber-100">Pending Change</span> : null}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3 lg:justify-end">
          <StatusChip label={itemStatusLabel(node.item)} tone={itemStatusTone(node.item)} />
          <ChevronRight className="h-4 w-4 text-sky-200" />
        </span>
      </button>
      {node.children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <HierarchyRow key={child.item.stableCode} node={child} onOpenItem={onOpenItem} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function ServiceFocusedView(props: {
  item: AdminPartnerServiceCatalogueItem;
  domain: DomainRow;
  allDomainItems: AdminPartnerServiceCatalogueItem[];
  canManage: boolean;
  busy: string;
  onBack: () => void;
  onEdit: (item: AdminPartnerServiceCatalogueItem) => void;
  onAddSubService: (item: AdminPartnerServiceCatalogueItem) => void;
  onArchive: (item: AdminPartnerServiceCatalogueItem) => void;
  onReactivate: (item: AdminPartnerServiceCatalogueItem) => void;
  onDelete: (item: AdminPartnerServiceCatalogueItem) => void;
}) {
  const children = props.allDomainItems.filter((item) => item.parentCode === props.item.stableCode).sort(sortItems);
  const kind = itemKind(props.item, props.allDomainItems);
  return (
    <section className="mt-5 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/20">
        <AdminBackButton onClick={props.onBack} label={`Back to ${props.domain.title}`} />
        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Service Catalogue <ChevronRight className="inline h-3 w-3" /> {props.domain.title} <ChevronRight className="inline h-3 w-3" /> {props.item.name}</p>
            <h3 className="mt-1 text-3xl font-black text-cyan-100">{props.item.name}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{props.item.shortDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!props.canManage} onClick={() => props.onEdit(props.item)} className="premiumButton primary"><FilePenLine size={16} /> Edit {titleKind(kind)}</button>
            {kind !== "sub-service" ? <button type="button" disabled={!props.canManage} onClick={() => props.onAddSubService(props.item)} className="premiumButton secondary"><Plus size={16} /> Add Sub-service</button> : null}
            {props.item.status === "archived" ? (
              <button type="button" disabled={!props.canManage || props.busy !== ""} onClick={() => props.onReactivate(props.item)} className="premiumButton secondary"><RotateCcw size={16} /> Reactivate</button>
            ) : (
              <button type="button" disabled={!props.canManage || props.busy !== ""} onClick={() => props.onArchive(props.item)} className="premiumButton danger"><Archive size={16} /> Archive</button>
            )}
            <button type="button" disabled={!props.canManage || !canDeleteDraft(props.item, children.map((child) => ({ item: child, kind: itemKind(child, props.allDomainItems), depth: 1, parentLabel: props.item.name, children: [] }))) || props.busy !== ""} onClick={() => props.onDelete(props.item)} className="premiumButton danger"><Trash2 size={16} /> Safe Delete</button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-xl shadow-black/20">
        <h4 className="text-xl font-black text-sky-100">Service Details</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Detail label="Type" value={titleKind(kind)} />
          <Detail label="Status" value={props.item.status} />
          <Detail label="Parent" value={props.item.parentCode ? props.allDomainItems.find((item) => item.stableCode === props.item.parentCode)?.name ?? props.item.parentCode : props.domain.title} />
          <Detail label="Countries" value={props.item.countries.join(", ") || "All configured"} />
          <Detail label="Eligibility" value={`${props.item.individualAllowed ? "Individual" : ""}${props.item.individualAllowed && props.item.organizationAllowed ? " / " : ""}${props.item.organizationAllowed ? "Organization" : ""}` || "Not configured"} />
          <Detail label="Application selectable" value={props.item.applicationSelectable ? "Selectable" : "Not selectable"} />
          <Detail label="Verification Profile" value={props.item.verificationProfileKey || "None"} />
          <Detail label="Capabilities" value={props.item.capabilities.join(", ") || "None"} />
          <Detail label="Aliases / Search Terms" value={props.item.aliases.join(", ") || "None"} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-black text-orange-100">Sub-services</h4>
          {kind !== "sub-service" ? <button type="button" disabled={!props.canManage} onClick={() => props.onAddSubService(props.item)} className="premiumButton primary"><Plus size={16} /> Add Sub-service</button> : null}
        </div>
        {children.length === 0 ? <Empty label="No Sub-services are configured for this item." /> : (
          <div className="mt-4 space-y-3">
            {children.map((child) => (
              <article key={child.stableCode} className="rounded-2xl border border-white/10 bg-[#07111f] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <StatusChip label={child.status} tone={child.status === "active" ? "cyan" : child.status === "archived" ? "orange" : "slate"} />
                    <h5 className="mt-2 text-base font-black text-slate-100">{child.name}</h5>
                    <p className="mt-1 text-sm text-slate-400">{child.shortDescription}</p>
                  </div>
                  <button type="button" disabled={!props.canManage} onClick={() => props.onEdit(child)} className="premiumButton compact secondary"><FilePenLine size={14} /> Edit Sub-service</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function CatalogueDialog(props: {
  mode: DialogMode;
  domainTitle: string;
  draft: AdminPartnerServiceCatalogueItem | null;
  allItems: AdminPartnerServiceCatalogueItem[];
  canManage: boolean;
  busy: string;
  onChange: (next: Partial<AdminPartnerServiceCatalogueItem>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  if (!props.draft) return null;
  const isDelete = props.mode === "delete";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="catalogue-dialog-title">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-sky-300/20 bg-[#07111f] p-5 text-slate-100 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-orange-300">{dialogEyebrow(props.mode)}</p>
            <h3 id="catalogue-dialog-title" className="mt-1 text-2xl font-black text-cyan-100">{dialogTitle(props.mode)}</h3>
            <p className="mt-2 text-sm text-slate-400">Domain: {props.domainTitle}</p>
          </div>
          <button type="button" onClick={props.onClose} className="premiumButton compact secondary" aria-label="Close"><X size={16} /></button>
        </div>
        {isDelete ? (
          <div className="mt-5 rounded-2xl border border-orange-300/30 bg-orange-500/10 p-4">
            <h4 className="text-lg font-black text-orange-100">Delete Draft</h4>
            <p className="mt-2 text-sm leading-6 text-orange-100/85">This permanently removes the draft item named {props.draft.name}. Published, referenced, child-bearing or historical items cannot be hard-deleted and must be archived instead.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={props.onClose} className="premiumButton secondary">Cancel</button>
              <button type="button" disabled={!props.canManage || props.busy === `delete:${props.draft.stableCode}`} onClick={props.onDelete} className="premiumButton danger">{props.busy === `delete:${props.draft.stableCode}` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Delete Draft</button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Input label="Stable code" value={props.draft.stableCode} disabled={props.mode.startsWith("edit") || !props.canManage} onChange={(value) => props.onChange({ stableCode: slugify(value), id: `svc_${slugify(value)}` })} />
              <Select label="Domain" value={props.draft.domain} disabled={!props.canManage} onChange={(value) => props.onChange({ domain: value })} options={partnerServiceCatalog.map((domain) => [domain.id, domain.title])} />
              <Input label="Service name" value={props.draft.name} disabled={!props.canManage} onChange={(value) => props.onChange({ name: value })} />
              <Input label="Icon" value={props.draft.icon} disabled={!props.canManage} onChange={(value) => props.onChange({ icon: value })} />
              <Textarea label="Short description" value={props.draft.shortDescription} disabled={!props.canManage} onChange={(value) => props.onChange({ shortDescription: value })} />
              <Input label="Parent code" value={props.draft.parentCode ?? ""} disabled={!props.canManage} onChange={(value) => props.onChange({ parentCode: value.trim() || undefined })} />
              <Input label="Display order" value={String(props.draft.displayOrder)} disabled={!props.canManage} onChange={(value) => props.onChange({ displayOrder: Number(value) })} />
              <Select label="Status" value={props.draft.status} disabled={!props.canManage} onChange={(value) => props.onChange({ status: value as AdminPartnerServiceCatalogueItem["status"] })} options={[["active", "Active"], ["inactive", "Inactive"], ["archived", "Archived"]]} />
              <Input label="Countries" value={props.draft.countries.join(", ")} disabled={!props.canManage} onChange={(value) => props.onChange({ countries: splitList(value).map((item) => item.toUpperCase()) })} />
              <Input label="Verification Profile" value={props.draft.verificationProfileKey} disabled={!props.canManage} onChange={(value) => props.onChange({ verificationProfileKey: value })} />
              <Input label="Capabilities" value={props.draft.capabilities.join(", ")} disabled={!props.canManage} onChange={(value) => props.onChange({ capabilities: splitList(value) })} />
              <Input label="Aliases / Search Terms" value={props.draft.aliases.join(", ")} disabled={!props.canManage} onChange={(value) => props.onChange({ aliases: splitList(value) })} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Toggle label="Individual allowed" checked={props.draft.individualAllowed} disabled={!props.canManage} onChange={(value) => props.onChange({ individualAllowed: value })} />
              <Toggle label="Organization allowed" checked={props.draft.organizationAllowed} disabled={!props.canManage} onChange={(value) => props.onChange({ organizationAllowed: value })} />
              <Toggle label="Application selectable" checked={props.draft.applicationSelectable} disabled={!props.canManage} onChange={(value) => props.onChange({ applicationSelectable: value })} />
              <Toggle label="Service approval required" checked={props.draft.serviceApprovalRequired} disabled={!props.canManage} onChange={(value) => props.onChange({ serviceApprovalRequired: value })} />
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              <button type="button" onClick={props.onClose} className="premiumButton secondary">Cancel</button>
              <button type="button" disabled={!props.canManage || props.busy === "saving"} onClick={props.onSave} className="premiumButton primary">{props.busy === "saving" ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Draft</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function CataloguePreviewModal({ item, data, onClose, onEdit }: { item: AdminPartnerServiceCatalogueItem; data: AdminPartnerServiceCatalogueResponse; onClose: () => void; onEdit: () => void }) {
  const domainItems = data.preview.items.filter((candidate) => candidate.domain === item.domain);
  const kind = itemKind(item, domainItems);
  const state = data.workflowState ?? (data.hasUnpublishedChanges ? "draft" : "published");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="catalogue-preview-title">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-cyan-300/20 bg-[#07111f] p-5 text-slate-100 shadow-2xl shadow-black/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-orange-300">{data.hasUnpublishedChanges ? "Draft Preview" : "Published Preview"} · Not Live Change</p>
            <h3 id="catalogue-preview-title" className="mt-1 text-2xl font-black text-cyan-100">{item.name}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Previewing {domainTitle(item.domain)} / {titleKind(kind)}. This preview never publishes catalogue changes.</p>
          </div>
          <button type="button" onClick={onClose} className="premiumButton compact secondary" aria-label="Close preview"><X size={16} /></button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Detail label="Workflow" value={workflowTitle(state)} />
          <Detail label="Draft Version" value={`v${data.draftVersion}`} />
          <Detail label="Published Version" value={`v${data.publishedVersion}`} />
          <Detail label="Domain" value={domainTitle(item.domain)} />
          <Detail label="Type" value={titleKind(kind)} />
          <Detail label="Status" value={item.status} />
          <Detail label="Partner Step 4 Visibility" value={item.status === "active" && item.applicationSelectable ? "Eligible after publish and policy filtering" : "Not selectable for new Partner applications"} />
          <Detail label="Eligibility" value={`${item.individualAllowed ? "Individual" : ""}${item.individualAllowed && item.organizationAllowed ? " / " : ""}${item.organizationAllowed ? "Organization" : ""}` || "Not configured"} />
          <Detail label="Countries" value={item.countries.join(", ") || "All configured"} />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1b31] p-4">
          <h4 className="text-lg font-black text-sky-100">How this service card will read</h4>
          <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-[#07111f] p-4">
            <div className="flex flex-wrap gap-2">
              <StatusChip label={domainTitle(item.domain)} tone="cyan" />
              <StatusChip label={item.applicationSelectable ? "Selectable" : "Not selectable"} tone={item.applicationSelectable ? "green" : "slate"} />
            </div>
            <h5 className="mt-3 text-xl font-black text-slate-100">{item.name}</h5>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.shortDescription}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="premiumButton secondary">Back to Editing</button>
          {data.permissions.canManage ? <button type="button" onClick={onEdit} className="premiumButton primary"><FilePenLine size={16} /> Edit Service</button> : null}
        </div>
      </section>
    </div>
  );
}

type DomainRow = {
  id: string;
  title: string;
  description: string;
  status: AdminPartnerServiceCatalogueItem["status"];
  statusLabel: DomainStatusLabel;
  categoryCount: number;
  serviceCount: number;
  selectableCount: number;
  draftCount: number;
  hasPublishedContent: boolean;
  aliases: string[];
};

type DomainStatusLabel = "Draft" | "In Review" | "Changes Requested" | "Approved" | "Scheduled" | "Published" | "Published with Draft Changes" | "Archived";

const domainStatusOptions: Array<"All" | DomainStatusLabel> = [
  "All",
  "Draft",
  "In Review",
  "Changes Requested",
  "Approved",
  "Scheduled",
  "Published",
  "Published with Draft Changes",
  "Archived",
];

type HierarchyNode = {
  item: AdminPartnerServiceCatalogueItem;
  kind: ItemKind;
  depth: number;
  parentLabel: string;
  children: HierarchyNode[];
};

function buildDomainRows(items: AdminPartnerServiceCatalogueItem[], publishedCodes: Set<string>): DomainRow[] {
  const domainIds = [...new Set([...partnerServiceCatalog.map((domain) => domain.id), ...items.map((item) => item.domain)])];
  return domainIds.map((id) => {
    const domainItems = items.filter((item) => item.domain === id);
    const domain = { id, title: domainTitle(id) };
    const visibleItems = domainItems.filter((item) => !isDomainRootItem(item, domain));
    const statuses = domainItems.map((item) => item.status);
    const draftCount = domainItems.filter((item) => !item.published && !publishedCodes.has(item.stableCode)).length;
    const hasPublishedContent = domainItems.some((item) => item.published || publishedCodes.has(item.stableCode));
    const status = domainItems.length === 0 ? "inactive" : statuses.includes("active") ? "active" : statuses.includes("inactive") ? "inactive" : "archived";
    return {
      id,
      title: domain.title,
      description: domainDescription(id),
      status,
      statusLabel: domainStatusLabel(status, draftCount, hasPublishedContent),
      categoryCount: visibleItems.filter((item) => itemKind(item, domainItems) === "category").length,
      serviceCount: visibleItems.filter((item) => itemKind(item, domainItems) !== "category").length,
      selectableCount: domainItems.filter((item) => item.applicationSelectable).length,
      draftCount,
      hasPublishedContent,
      aliases: domainItems.flatMap((item) => item.aliases),
    };
  });
}

function domainStatusLabel(status: AdminPartnerServiceCatalogueItem["status"], draftCount: number, hasPublishedContent: boolean): DomainStatusLabel {
  if (status === "archived") return "Archived";
  if (draftCount > 0 && hasPublishedContent) return "Published with Draft Changes";
  if (draftCount > 0) return "Draft";
  return hasPublishedContent ? "Published" : "Draft";
}

function buildHierarchy(items: AdminPartnerServiceCatalogueItem[], allDomainItems: AdminPartnerServiceCatalogueItem[]): HierarchyNode[] {
  const byParent = new Map<string, AdminPartnerServiceCatalogueItem[]>();
  const visibleCodes = new Set(items.map((item) => item.stableCode));
  for (const item of items) {
    const parent = item.parentCode && visibleCodes.has(item.parentCode) ? item.parentCode : "__root__";
    byParent.set(parent, [...(byParent.get(parent) ?? []), item]);
  }
  const createNode = (item: AdminPartnerServiceCatalogueItem, depth: number): HierarchyNode => ({
    item,
    kind: itemKind(item, allDomainItems),
    depth,
    parentLabel: item.parentCode ? allDomainItems.find((candidate) => candidate.stableCode === item.parentCode)?.name ?? item.parentCode : "",
    children: (byParent.get(item.stableCode) ?? []).sort(sortItems).map((child) => createNode(child, depth + 1)),
  });
  return (byParent.get("__root__") ?? []).sort(sortItems).map((item) => createNode(item, 0));
}

function filterDomainItems(items: AdminPartnerServiceCatalogueItem[], allDomainItems: AdminPartnerServiceCatalogueItem[], filter: { query: string; status: string; itemType: string; selectable: string }) {
  const q = normalize(filter.query);
  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (filter.selectable && String(item.applicationSelectable) !== filter.selectable) return false;
    if (filter.itemType && itemKind(item, allDomainItems) !== filter.itemType) return false;
    if (!q) return true;
    return normalize([item.name, item.shortDescription, item.aliases.join(" ")].join(" ")).includes(q);
  });
}

function itemKind(item: AdminPartnerServiceCatalogueItem, domainItems: AdminPartnerServiceCatalogueItem[]): ItemKind {
  const hasChildren = domainItems.some((candidate) => candidate.parentCode === item.stableCode);
  const parent = item.parentCode ? domainItems.find((candidate) => candidate.stableCode === item.parentCode) : undefined;
  if (parent && isDomainRootItem(parent, { id: item.domain, title: domainTitle(item.domain) })) {
    if (hasChildren && !item.applicationSelectable) return "category";
    return "service";
  }
  if (parent) {
    const parentHasChildren = domainItems.some((candidate) => candidate.parentCode === parent.stableCode);
    if (!parent.applicationSelectable && parentHasChildren) return "service";
    return "sub-service";
  }
  if (item.parentCode) return "sub-service";
  if (hasChildren && !item.applicationSelectable) return "category";
  return "service";
}

function isDomainRootItem(item: AdminPartnerServiceCatalogueItem, domain: { id: string; title: string }) {
  return !item.parentCode && !item.applicationSelectable && (item.stableCode === `${domain.id}-root` || normalize(item.name) === normalize(domain.title));
}

function draftForMode(mode: DialogMode, domain: string, item: AdminPartnerServiceCatalogueItem | undefined, parent: AdminPartnerServiceCatalogueItem | undefined, items: AdminPartnerServiceCatalogueItem[]): AdminPartnerServiceCatalogueItem {
  if (item) return cloneItem(item);
  const base = mode === "add-category" ? "qa-test-category" : mode === "add-sub-service" ? "qa-test-sub-service" : mode === "add-domain" ? "qa-test-domain-service" : "qa-test-service";
  const code = uniqueStableCode(base, items);
  return {
    id: `svc_${code}`,
    stableCode: code,
    name: mode === "add-category" ? "QA Test Category" : mode === "add-sub-service" ? "QA Test Sub-service" : mode === "add-domain" ? "QA Test Domain Service" : "QA Test Service",
    shortDescription: "Fictional staging draft item for Admin review.",
    domain,
    parentCode: parent?.stableCode,
    icon: parent?.icon ?? domainIcon(domain),
    displayOrder: Math.max(0, ...items.filter((candidate) => candidate.domain === domain).map((candidate) => candidate.displayOrder)) + 1,
    status: "inactive",
    published: false,
    countries: ["IN"],
    individualAllowed: true,
    organizationAllowed: true,
    applicationSelectable: mode !== "add-category",
    serviceApprovalRequired: true,
    verificationProfileKey: "manual_review",
    capabilities: ["project_enquiries"],
    aliases: [],
  };
}

function canDeleteDraft(item: AdminPartnerServiceCatalogueItem, children: { length: number }) {
  return !item.published && children.length === 0;
}

function firstItemForDomain(items: AdminPartnerServiceCatalogueItem[], domain: string) {
  return items.filter((item) => item.domain === domain).sort(sortItems)[0];
}

function sortItems(a: AdminPartnerServiceCatalogueItem, b: AdminPartnerServiceCatalogueItem) {
  return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
}

function cloneItem(item: AdminPartnerServiceCatalogueItem): AdminPartnerServiceCatalogueItem {
  return { ...item, countries: [...item.countries], capabilities: [...item.capabilities], aliases: [...item.aliases] };
}

function uniqueStableCode(base: string, items: AdminPartnerServiceCatalogueItem[]) {
  let candidate = slugify(base) || "draft-service";
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

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function initialQueryParam(key: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

function domainTitle(id: string) {
  return partnerServiceCatalog.find((domain) => domain.id === id)?.title ?? id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function domainDescription(id: string) {
  return partnerServiceCatalog.find((domain) => domain.id === id)?.description ?? "Additional Partner services and emerging service areas.";
}

function domainIcon(id: string) {
  return domainIcons[id] ?? "briefcase";
}

function titleKind(kind: ItemKind) {
  return kind.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function itemStatusLabel(item: AdminPartnerServiceCatalogueItem) {
  if (item.status === "archived") return "Archived";
  if (!item.published) return "Draft";
  return "Published";
}

function itemStatusTone(item: AdminPartnerServiceCatalogueItem): Tone {
  if (item.status === "archived") return "slate";
  if (!item.published) return "orange";
  return "green";
}

function workflowTitle(state: string) {
  return state.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function catalogueStatusLabel(state: string, pendingChanges: number, hasPublishedContent: boolean): DomainStatusLabel {
  if (pendingChanges > 0 && hasPublishedContent) return "Published with Draft Changes";
  if (state === "in_review") return "In Review";
  if (state === "changes_requested") return "Changes Requested";
  if (state === "approved") return "Approved";
  if (state === "archived") return "Archived";
  return state === "draft" && pendingChanges > 0 ? "Draft" : "Published";
}

function statusTone(label: DomainStatusLabel): Tone {
  if (label === "Published") return "green";
  if (label === "Published with Draft Changes") return "green";
  if (label === "Draft" || label === "Scheduled") return "orange";
  if (label === "In Review") return "violet";
  if (label === "Changes Requested") return "orange";
  if (label === "Approved") return "cyan";
  return "slate";
}

function dialogEyebrow(mode: DialogMode) {
  if (mode.includes("domain")) return "Domain action";
  if (mode.includes("category")) return "Category action";
  if (mode.includes("sub-service")) return "Sub-service action";
  if (mode === "delete") return "Safe Delete";
  return "Service action";
}

function dialogTitle(mode: DialogMode) {
  if (mode === "add-domain") return "Add Domain";
  if (mode === "edit-domain") return "Edit Domain";
  if (mode === "add-category") return "Add Category";
  if (mode === "edit-category") return "Edit Category";
  if (mode === "add-sub-service") return "Add Sub-service";
  if (mode === "edit-sub-service") return "Edit Sub-service";
  if (mode === "delete") return "Delete Draft";
  return mode === "add-service" ? "Add Service" : "Edit Service";
}

function Message({ tone, text }: { tone: "success" | "error" | "info"; text: string }) {
  return <div role="status" className={`mt-4 rounded-xl border p-3 text-sm font-bold ${tone === "success" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" : tone === "error" ? "border-orange-300/40 bg-orange-500/10 text-orange-100" : "border-sky-300/30 bg-sky-400/10 text-sky-100"}`}>{text}</div>;
}

function HideCatalogueRouteChrome() {
  return <style>{`.catalogueRouteChrome { display: none; }`}</style>;
}

function SummaryChip({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-black ${highlight ? "border-amber-300/25 bg-amber-400/10 text-amber-100" : "border-sky-300/10 bg-white/[0.04] text-slate-300"}`}>
      <span className="text-sky-100">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function DomainBreadcrumb({ domainName }: { domainName: string }) {
  return (
    <nav className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      <Link href="/admin/website-experience" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Website Experience
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      <Link href="/admin/website-experience/pages" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Pages
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      <Link href="/admin/website-experience/pages/partner" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Partner
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      <Link href="/admin/website-experience/pages/partner/service-catalogue" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Service Catalogue
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      <span aria-current="page" className="text-cyan-100">{domainName}</span>
    </nav>
  );
}

function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-black ${toneClass(tone)}`}>{label}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
      <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}

function Select({ label, value, options, onChange, disabled }: { label: string; value: string; options: string[][]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"><option value="">All</option>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>;
}

function Input({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /></label>;
}

function Textarea({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block md:col-span-2"><span className="text-xs font-black uppercase text-slate-400">{label}</span><textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /></label>;
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm font-bold text-slate-200"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-sky-300 text-sky-500 focus:ring-sky-400" />{label}</label>;
}

function Empty({ label }: { label: string }) {
  return <div className="mt-4 rounded-2xl border border-dashed border-sky-300/20 bg-[#0d1b31] p-6 text-sm font-bold text-slate-400">{label}</div>;
}

function StatePanel({ icon: Icon, title, text, action, spin }: { icon: typeof Loader2; title: string; text: string; action?: ReactNode; spin?: boolean }) {
  return <section className="rounded-2xl border border-sky-300/15 bg-[#07111f] p-8 text-slate-100"><Icon className={spin ? "animate-spin text-sky-300" : "text-orange-300"} size={28} /><h2 className="mt-4 text-2xl font-black text-sky-100">{title}</h2><p className="mt-2 text-sm text-slate-400">{text}</p>{action ? <div className="mt-4">{action}</div> : null}</section>;
}

function toneClass(tone: Tone) {
  if (tone === "blue") return "border-sky-300/25 bg-sky-500/12 text-sky-100";
  if (tone === "cyan") return "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";
  if (tone === "orange") return "border-orange-300/30 bg-orange-500/12 text-orange-100";
  if (tone === "violet") return "border-indigo-300/25 bg-indigo-500/12 text-indigo-100";
  if (tone === "green") return "border-emerald-300/25 bg-emerald-500/12 text-emerald-100";
  if (tone === "red") return "border-red-300/30 bg-red-500/12 text-red-100";
  return "border-slate-300/15 bg-slate-400/10 text-slate-200";
}

function PremiumStyles() {
  return (
    <style>{`
      .premiumButton {
        display: inline-flex;
        min-height: 2.75rem;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(255,255,255,0.12);
        padding: 0.625rem 0.875rem;
        font-size: 0.875rem;
        font-weight: 900;
        transition: border-color 150ms ease, background-color 150ms ease, transform 150ms ease;
      }
      .premiumButton:focus-visible { outline: 2px solid rgb(125,211,252); outline-offset: 2px; }
      .premiumButton:disabled { cursor: not-allowed; opacity: 0.55; }
      .premiumButton.primary { background: linear-gradient(135deg, #0284c7, #2563eb); color: #f8fafc; box-shadow: 0 14px 30px rgba(37,99,235,0.22); }
      .premiumButton.secondary { background: rgba(15,23,42,0.72); color: #dbeafe; border-color: rgba(125,211,252,0.22); }
      .premiumButton.publish { background: linear-gradient(135deg, #f97316, #2563eb); color: #fff7ed; box-shadow: 0 14px 30px rgba(249,115,22,0.20); }
      .premiumButton.danger { background: rgba(154,52,18,0.22); color: #fed7aa; border-color: rgba(251,146,60,0.30); }
      .premiumButton.compact { min-height: 2.25rem; padding: 0.45rem 0.625rem; font-size: 0.75rem; }
    `}</style>
  );
}
