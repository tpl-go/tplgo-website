"use client";

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FilePenLine,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { AdminBackButton } from "../../_components/AdminBackButton";
import {
  changeAdminPartnerServiceCatalogueLifecycle,
  deleteAdminPartnerServiceCatalogueDraftItem,
  getAdminPartnerServiceCatalogue,
  publishAdminPartnerServiceCatalogue,
  approveAdminPartnerServiceCatalogueDraft,
  requestAdminPartnerServiceCatalogueChanges,
  resolveAdminPartnerRequestedService,
  saveAdminPartnerServiceCatalogueDraft,
  submitAdminPartnerServiceCatalogueApproval,
  type AdminPartnerServiceCatalogueItem,
  type AdminPartnerServiceCatalogueResponse,
} from "../../../lib/admin/adminApiClient";
import { partnerServiceCatalog } from "../../../lib/partner/partnerServiceCatalog";

type Tone = "blue" | "cyan" | "orange" | "slate" | "violet" | "green" | "red";
type ItemKind = "category" | "service" | "sub-service";
type DialogMode = "add-domain" | "edit-domain" | "add-category" | "edit-category" | "add-service" | "edit-service" | "add-sub-service" | "edit-sub-service" | "delete";
type CatalogueView = "domains" | "requested" | "audit";

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
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [catalogueView, setCatalogueView] = useState<CatalogueView>("domains");
  const [query, setQuery] = useState("");
  const [domainQuery, setDomainQuery] = useState("");
  const [status, setStatus] = useState("");
  const [itemType, setItemType] = useState("");
  const [selectable, setSelectable] = useState("");
  const [dialog, setDialog] = useState<{ mode: DialogMode; item?: AdminPartnerServiceCatalogueItem; parent?: AdminPartnerServiceCatalogueItem; domain?: string } | null>(null);
  const [draft, setDraft] = useState<AdminPartnerServiceCatalogueItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [reviewNote, setReviewNote] = useState("");
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
      const view = params.get("view");
      setCatalogueView(view === "requested" || view === "audit" ? view : "domains");
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
  const selectedItem = useMemo(() => scopedItems.find((item) => item.stableCode === selectedItemCode), [scopedItems, selectedItemCode]);
  const filteredDomains = useMemo(() => {
    const q = normalize(domainQuery);
    return domains.filter((domain) => {
      if (!q) return true;
      return normalize([domain.title, domain.id, domain.description].join(" ")).includes(q);
    });
  }, [domainQuery, domains]);
  const filteredScopedItems = useMemo(() => filterDomainItems(scopedItems, { query, status, itemType, selectable }), [itemType, query, scopedItems, selectable, status]);

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

  function navigate(next: { view?: CatalogueView; domain?: string; service?: string }) {
    const view = next.view ?? "domains";
    const domain = next.domain ?? "";
    const service = next.service ?? "";
    setCatalogueView(view);
    setSelectedDomain(domain);
    setSelectedItemCode(service);
    const params = new URLSearchParams();
    if (view !== "domains") params.set("view", view);
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

  async function publishDraft() {
    if (!data) return;
    setBusy("publishing");
    setMessage({ tone: "info", text: "Publishing..." });
    const result = await publishAdminPartnerServiceCatalogue({ expectedDraftVersion: data.draftVersion, changeSummary: "Published Partner Service Catalogue", reason: reviewNote });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Publish failed" });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: `Published successfully. Version ${result.data.publishedVersion} is now live.` });
  }

  async function submitForApproval() {
    if (!data) return;
    setBusy("submit");
    setMessage({ tone: "info", text: "Sending for approval..." });
    const result = await submitAdminPartnerServiceCatalogueApproval({ expectedDraftVersion: data.draftVersion, note: reviewNote, changeSummary: "Sent Partner Service Catalogue draft for approval" });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Send for Approval failed" });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: "Sent for approval. The catalogue draft is now in the In Review queue." });
  }

  async function approveDraft() {
    if (!data) return;
    setBusy("approve");
    setMessage({ tone: "info", text: "Approving draft..." });
    const result = await approveAdminPartnerServiceCatalogueDraft({ expectedDraftVersion: data.draftVersion, note: reviewNote, changeSummary: "Approved Partner Service Catalogue draft" });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Approve failed" });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: "Approved. Next action: Publish Now." });
  }

  async function requestChanges() {
    if (!data) return;
    if (!reviewNote.trim()) {
      setMessage({ tone: "error", text: "Request Changes requires a review note." });
      return;
    }
    setBusy("request-changes");
    setMessage({ tone: "info", text: "Requesting changes..." });
    const result = await requestAdminPartnerServiceCatalogueChanges({ expectedDraftVersion: data.draftVersion, note: reviewNote, changeSummary: "Requested changes to Partner Service Catalogue draft" });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Request Changes failed" });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: "Changes requested. The review note is visible on the catalogue draft." });
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

  async function resolveRequest(requestKey: string, resolutionType: "mapped_to_existing" | "draft_service_created" | "closed", mappedServiceCode?: string) {
    setBusy(`resolve:${requestKey}`);
    const result = await resolveAdminPartnerRequestedService({
      requestKey,
      resolutionType,
      mappedServiceCode,
      draftServiceCode: resolutionType === "draft_service_created" ? `draft-${requestKey.split(":").pop()}` : undefined,
      resolutionNote,
      expectedStatus: "new",
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Action failed" });
      return;
    }
    setData(result.data);
    setResolutionNote("");
    setMessage({ tone: "success", text: "Draft saved" });
  }

  if (loadState === "loading") return <StatePanel icon={Loader2} spin title="Loading catalogue..." text="Loading Partner Service Catalogue from the staging API." />;
  if (loadState === "error" || !data) return <StatePanel icon={XCircle} title="Action failed" text="Catalogue data could not be loaded. Check Admin permissions and API health." action={<button type="button" onClick={loadCatalogue} className="premiumButton secondary"><RefreshCcw size={16} /> Retry</button>} />;

  return (
    <div data-admin-service-catalogue="true" className="min-h-screen rounded-2xl border border-sky-300/10 bg-[#07111f] p-4 text-slate-100 shadow-2xl shadow-sky-950/30 lg:p-6">
      <PremiumStyles />
      <CatalogueHeader
        data={data}
        domains={domains}
        activeView={catalogueView}
        reviewNote={reviewNote}
        busy={busy}
        onReviewNote={setReviewNote}
        onNavigate={navigate}
        onPreview={() => setPreviewItem(selectedItem ?? firstItemForDomain(items, selectedDomain) ?? items[0] ?? null)}
        onSubmit={submitForApproval}
        onApprove={approveDraft}
        onRequestChanges={requestChanges}
        onPublish={publishDraft}
      />
      {message ? <Message tone={message.tone} text={message.text} /> : null}

      {catalogueView === "requested" ? (
        <RequestedServicesView
          data={data}
          services={items}
          note={resolutionNote}
          busy={busy}
          onBack={() => navigate({ view: "domains" })}
          onNote={setResolutionNote}
          onResolve={resolveRequest}
          onCreateDraft={(request) => {
            const requestDomain = request.closestDomain ?? "";
            const domain = domains.some((item) => item.id === requestDomain) ? requestDomain : selectedDomain || domains[0]?.id || "other-emerging";
            const item = draftForMode("add-service", domain, undefined, undefined, items);
            setDialog({ mode: "add-service", domain });
            setDraft({ ...item, name: request.requestedName, shortDescription: request.description || item.shortDescription, stableCode: uniqueStableCode(slugify(request.requestedName) || "requested-service", items), id: `svc_${uniqueStableCode(slugify(request.requestedName) || "requested-service", items)}` });
          }}
        />
      ) : catalogueView === "audit" ? (
        <VersionsAuditView data={data} onBack={() => navigate({ view: "domains" })} />
      ) : selectedItem && activeDomain ? (
        <ServiceFocusedView
          item={selectedItem}
          domain={activeDomain}
          allDomainItems={scopedItems}
          canManage={data.permissions.canManage}
          busy={busy}
          onBack={() => navigate({ view: "domains", domain: activeDomain.id })}
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
          canManage={data.permissions.canManage}
          onAddDomain={() => openDialog("add-domain")}
          onOpen={(domain) => {
            navigate({ view: "domains", domain: domain.id });
            setQuery("");
            setStatus("");
            setItemType("");
            setSelectable("");
          }}
          onEdit={(domain) => openDialog("edit-domain", firstItemForDomain(items, domain.id))}
          onArchive={(domain) => firstItemForDomain(items, domain.id) ? void lifecycle(firstItemForDomain(items, domain.id)!, "archive") : undefined}
          onReactivate={(domain) => firstItemForDomain(items, domain.id) ? void lifecycle(firstItemForDomain(items, domain.id)!, "reactivate") : undefined}
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
          onBack={() => navigate({ view: "domains" })}
          onAddCategory={() => openDialog("add-category")}
          onAddService={() => openDialog("add-service")}
          onEditDomain={() => openDialog("edit-domain", firstItemForDomain(items, activeDomain.id))}
          onEdit={(item) => openDialog(itemKind(item, scopedItems) === "sub-service" ? "edit-sub-service" : itemKind(item, scopedItems) === "category" ? "edit-category" : "edit-service", item)}
          onAddSubService={(item) => openDialog("add-sub-service", undefined, item)}
          onArchive={(item) => lifecycle(item, "archive")}
          onReactivate={(item) => lifecycle(item, "reactivate")}
          onDelete={(item) => openDialog("delete", item)}
          onOpenItem={(item) => navigate({ view: "domains", domain: activeDomain.id, service: item.stableCode })}
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
  activeView,
  reviewNote,
  busy,
  onReviewNote,
  onNavigate,
  onPreview,
  onSubmit,
  onApprove,
  onRequestChanges,
  onPublish,
}: {
  data: AdminPartnerServiceCatalogueResponse;
  domains: DomainRow[];
  activeView: CatalogueView;
  reviewNote: string;
  busy: string;
  onReviewNote: (value: string) => void;
  onNavigate: (next: { view?: CatalogueView; domain?: string; service?: string }) => void;
  onPreview: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onPublish: () => void;
}) {
  const state = data.workflowState ?? (data.hasUnpublishedChanges ? "draft" : "published");
  const canSubmit = data.permissions.canManage && data.hasUnpublishedChanges && (state === "draft" || state === "changes_requested");
  const canReview = data.permissions.canPublish && state === "in_review";
  const canPublish = data.permissions.canPublish && state === "approved";
  return (
    <section className="overflow-hidden rounded-2xl border border-sky-300/15 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.35),transparent_34%),linear-gradient(135deg,#0a1930,#111827_55%,#1c1917)] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Website Experience / Pages / Partner</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-sky-100 lg:text-4xl">Service Catalogue</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Manage catalogue Domains, Categories, Services, Sub-services, Requested Services, drafts, previews, publishes, versions and audit from the central Partner page context.</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-sky-300/15 bg-[#07111f]/80 p-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onPreview} className="premiumButton secondary"><Eye size={16} /> {data.hasUnpublishedChanges ? "Preview Draft" : "Preview Published"}</button>
            {canSubmit ? <button type="button" disabled={busy === "submit"} onClick={onSubmit} className="premiumButton primary">{busy === "submit" ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Send for Approval</button> : null}
            {canReview ? <button type="button" disabled={busy === "approve"} onClick={onApprove} className="premiumButton primary">{busy === "approve" ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Approve</button> : null}
            {canReview ? <button type="button" disabled={busy === "request-changes" || !reviewNote.trim()} onClick={onRequestChanges} className="premiumButton secondary"><XCircle size={16} /> Request Changes</button> : null}
            {canPublish ? <button type="button" disabled={busy === "publishing"} onClick={onPublish} className="premiumButton publish">{busy === "publishing" ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Publish Now</button> : null}
          </div>
          {(canReview || state === "changes_requested") ? <Textarea label={canReview ? "Review note" : "Submission note"} value={reviewNote} onChange={onReviewNote} /> : null}
          {state === "published" ? <p className="text-xs font-bold text-emerald-100">Published · create or edit a draft to start the next workflow.</p> : null}
          {state === "in_review" ? <p className="text-xs font-bold text-sky-100">Waiting for review. Publish is hidden until approval.</p> : null}
          {state === "approved" ? <p className="text-xs font-bold text-emerald-100">Approved · next action is Publish Now.</p> : null}
          {data.review?.note ? <p className="text-xs font-bold text-orange-100">Review note: {data.review.note}</p> : null}
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <button type="button" onClick={() => onNavigate({ view: "domains" })} className={`catalogueNavRow ${activeView === "domains" ? "active" : ""}`}>
          <span><Layers3 size={16} /> Domains</span>
          <span>{domains.length} domains <ChevronRight size={15} /></span>
        </button>
        <button type="button" onClick={() => onNavigate({ view: "requested" })} className={`catalogueNavRow ${activeView === "requested" ? "active" : ""}`}>
          <span><FilePenLine size={16} /> Requested Services</span>
          <span>{data.requestedServices.length} requests <ChevronRight size={15} /></span>
        </button>
        <button type="button" onClick={() => onNavigate({ view: "audit" })} className={`catalogueNavRow ${activeView === "audit" ? "active" : ""}`}>
          <span><Clock3 size={16} /> Versions & Audit</span>
          <span>{data.versions.length + data.audit.length} records <ChevronRight size={15} /></span>
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <WorkflowChip icon={FilePenLine} label={`Draft v${data.draftVersion}`} tone="cyan" />
        <WorkflowChip icon={CheckCircle2} label={`Published v${data.publishedVersion}`} tone="blue" />
        <WorkflowChip icon={Clock3} label={workflowTitle(state)} tone={state === "approved" || state === "published" ? "green" : state === "in_review" ? "violet" : "orange"} />
        <WorkflowChip icon={Clock3} label={data.scheduling.supported ? "Scheduled" : "No schedule"} tone="orange" />
      </div>
    </section>
  );
}

function AllDomainsView(props: {
  domains: DomainRow[];
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  canManage: boolean;
  onAddDomain: () => void;
  onOpen: (domain: DomainRow) => void;
  onEdit: (domain: DomainRow) => void;
  onArchive: (domain: DomainRow) => void;
  onReactivate: (domain: DomainRow) => void;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-cyan-300">Level 1 - Domains</p>
          <h3 className="text-2xl font-black text-sky-100">All Domains</h3>
        </div>
        <button type="button" disabled={!props.canManage} onClick={props.onAddDomain} className="premiumButton primary"><Plus size={16} /> Add Domain</button>
      </div>
      <label className="mt-4 block max-w-xl">
        <span className="text-xs font-black uppercase text-slate-400">Search Domains</span>
        <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-500/20">
          <Search size={16} className="text-sky-300" />
          <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search Domains" />
        </div>
      </label>
      {props.domains.length === 0 ? <Empty label="No Domains match these filters." /> : (
        <div className="mt-4 space-y-3">
          {props.domains.map((domain, index) => (
            <article key={domain.id} className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-lg shadow-black/20">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className={`text-xs font-black uppercase ${index % 3 === 0 ? "text-cyan-300" : index % 3 === 1 ? "text-sky-300" : "text-orange-300"}`}>Domain</p>
                  <h4 className="mt-2 text-lg font-black text-slate-100">{domain.title}</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{domain.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <MetricMini label="Categories" value={domain.categoryCount} />
                    <MetricMini label="Services" value={domain.serviceCount} />
                    <MetricMini label="Selectable" value={domain.selectableCount} />
                    <MetricMini label="Draft" value={domain.draftCount} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 xl:items-end">
                  <StatusChip label={domain.status} tone={domain.status === "active" ? "cyan" : domain.status === "archived" ? "orange" : "slate"} />
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => props.onOpen(domain)} className="premiumButton primary"><Layers3 size={16} /> Open / Manage</button>
                    <button type="button" disabled={!props.canManage} onClick={() => props.onEdit(domain)} className="premiumButton secondary"><FilePenLine size={16} /> Edit Domain</button>
                    {domain.status === "archived" ? (
                      <button type="button" disabled={!props.canManage} onClick={() => props.onReactivate(domain)} className="premiumButton secondary"><RotateCcw size={16} /> Reactivate Domain</button>
                    ) : (
                      <button type="button" disabled={!props.canManage} onClick={() => props.onArchive(domain)} className="premiumButton danger"><Archive size={16} /> Archive Domain</button>
                    )}
                  </div>
                </div>
              </div>
            </article>
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
  onEdit: (item: AdminPartnerServiceCatalogueItem) => void;
  onAddSubService: (item: AdminPartnerServiceCatalogueItem) => void;
  onArchive: (item: AdminPartnerServiceCatalogueItem) => void;
  onReactivate: (item: AdminPartnerServiceCatalogueItem) => void;
  onDelete: (item: AdminPartnerServiceCatalogueItem) => void;
  onOpenItem: (item: AdminPartnerServiceCatalogueItem) => void;
}) {
  const tree = buildHierarchy(props.items, props.allDomainItems);
  return (
    <section className="mt-5 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/20">
        <AdminBackButton onClick={props.onBack} label="Back to Service Catalogue" />
        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Service Catalogue <ChevronRight className="inline h-3 w-3" /> {props.domain.title}</p>
            <h3 className="mt-1 text-3xl font-black text-cyan-100">{props.domain.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{props.domain.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!props.canManage} onClick={props.onAddCategory} className="premiumButton primary"><Plus size={16} /> Add Category</button>
            <button type="button" disabled={!props.canManage} onClick={props.onAddService} className="premiumButton primary"><Plus size={16} /> Add Service</button>
            <button type="button" disabled={!props.canManage} onClick={props.onEditDomain} className="premiumButton secondary"><FilePenLine size={16} /> Edit Domain</button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-lg shadow-black/20">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-cyan-100"><Filter size={16} /> Searching within {props.domain.title}</div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block md:col-span-2">
            <span className="text-xs font-black uppercase text-slate-400">Search</span>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus:ring-sky-500/20">
              <Search size={16} className="text-sky-300" />
              <input data-admin-service-search="true" value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search current Domain" />
            </div>
          </label>
          <Select label="Item Type" value={props.itemType} onChange={props.setItemType} options={[["category", "Category"], ["service", "Service"], ["sub-service", "Sub-service"]]} />
          <Select label="Status" value={props.status} onChange={props.setStatus} options={[["active", "Active"], ["inactive", "Inactive"], ["archived", "Archived"]]} />
          <Select label="Selectable" value={props.selectable} onChange={props.setSelectable} options={[["true", "Application selectable"], ["false", "Not selectable"]]} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-black uppercase text-orange-300">Level 2 - Domain Detail</p>
          <h4 className="text-xl font-black text-sky-100">Categories, Services and Sub-services</h4>
        </div>
        {tree.length === 0 ? <Empty label="No Categories, Services or Sub-services match these filters." /> : (
          <div className="mt-4 space-y-3">
            {tree.map((node) => (
              <HierarchyRow
                key={node.item.stableCode}
                node={node}
                canManage={props.canManage}
                busy={props.busy}
                onEdit={props.onEdit}
                onAddSubService={props.onAddSubService}
                onArchive={props.onArchive}
                onReactivate={props.onReactivate}
                onDelete={props.onDelete}
                onOpenItem={props.onOpenItem}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function HierarchyRow({ node, canManage, busy, onEdit, onAddSubService, onArchive, onReactivate, onDelete, onOpenItem }: {
  node: HierarchyNode;
  canManage: boolean;
  busy: string;
  onEdit: (item: AdminPartnerServiceCatalogueItem) => void;
  onAddSubService: (item: AdminPartnerServiceCatalogueItem) => void;
  onArchive: (item: AdminPartnerServiceCatalogueItem) => void;
  onReactivate: (item: AdminPartnerServiceCatalogueItem) => void;
  onDelete: (item: AdminPartnerServiceCatalogueItem) => void;
  onOpenItem?: (item: AdminPartnerServiceCatalogueItem) => void;
}) {
  const kind = node.kind;
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#0d1b31] p-4 ${node.depth > 0 ? "ml-0 border-l-4 border-l-cyan-300/50 md:ml-6" : ""}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip label={kind} tone={kind === "category" ? "violet" : kind === "sub-service" ? "orange" : "blue"} />
            <StatusChip label={node.item.status} tone={node.item.status === "active" ? "cyan" : node.item.status === "archived" ? "orange" : "slate"} />
            <StatusChip label={node.item.published ? "Published" : "Draft"} tone={node.item.published ? "green" : "slate"} />
            {node.item.applicationSelectable ? <StatusChip label="Selectable" tone="cyan" /> : <StatusChip label="Not selectable" tone="slate" />}
          </div>
          <h5 className="mt-2 text-lg font-black text-slate-100">{node.item.name}</h5>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-400">{node.item.shortDescription}</p>
          <p className="mt-2 text-xs text-slate-500">Parent: {node.parentLabel || domainTitle(node.item.domain)} · Children: {node.children.length}</p>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          {onOpenItem ? <button type="button" onClick={() => onOpenItem(node.item)} className="premiumButton compact primary"><ChevronRight size={14} /> Open</button> : null}
          <button type="button" disabled={!canManage} onClick={() => onEdit(node.item)} className="premiumButton compact secondary"><FilePenLine size={14} /> Edit {titleKind(kind)}</button>
          {kind !== "sub-service" ? <button type="button" disabled={!canManage} onClick={() => onAddSubService(node.item)} className="premiumButton compact primary"><Plus size={14} /> Add Sub-service</button> : null}
          {node.item.status === "archived" ? (
            <button type="button" disabled={!canManage || busy !== ""} onClick={() => onReactivate(node.item)} className="premiumButton compact secondary"><RotateCcw size={14} /> Reactivate</button>
          ) : (
            <button type="button" disabled={!canManage || busy !== ""} onClick={() => onArchive(node.item)} className="premiumButton compact danger"><Archive size={14} /> Archive</button>
          )}
          <button type="button" disabled={!canManage || !canDeleteDraft(node.item, node.children) || busy !== ""} onClick={() => onDelete(node.item)} className="premiumButton compact danger"><Trash2 size={14} /> Safe Delete</button>
        </div>
      </div>
      {node.children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <HierarchyRow key={child.item.stableCode} node={child} canManage={canManage} busy={busy} onEdit={onEdit} onAddSubService={onAddSubService} onArchive={onArchive} onReactivate={onReactivate} onDelete={onDelete} onOpenItem={onOpenItem} />
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

function RequestedServicesView({ data, services, note, busy, onBack, onNote, onResolve, onCreateDraft }: {
  data: AdminPartnerServiceCatalogueResponse;
  services: AdminPartnerServiceCatalogueItem[];
  note: string;
  busy: string;
  onBack: () => void;
  onNote: (value: string) => void;
  onResolve: (requestKey: string, resolutionType: "mapped_to_existing" | "draft_service_created" | "closed", mappedServiceCode?: string) => void;
  onCreateDraft: (row: AdminPartnerServiceCatalogueResponse["requestedServices"][number]) => void;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1b31] p-4">
      <AdminBackButton onClick={onBack} label="Back to Service Catalogue" />
      <div className="mt-4">
        <p className="text-xs font-black uppercase text-orange-300">Service Catalogue</p>
        <h3 className="mt-1 text-2xl font-black text-orange-100">Requested Services</h3>
      </div>
      <div className="mt-4">
        <Textarea label="Resolution note" value={note} onChange={onNote} />
        {data.requestedServices.length === 0 ? <Empty label="No requested services are waiting for review." /> : data.requestedServices.map((row) => (
          <div key={row.requestKey} className="mt-3 rounded-2xl border border-white/10 bg-[#07111f] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-orange-300">{row.source.replace(/_/g, " ")}</p>
                <h4 className="mt-1 text-lg font-black text-slate-100">{row.requestedName}</h4>
                <p className="mt-1 text-sm text-slate-400">{row.description || "No description supplied."}</p>
                <p className="mt-2 text-xs text-slate-500">{row.closestDomain || "No closest domain"}</p>
              </div>
              <StatusChip label={row.status} tone={row.status === "new" ? "orange" : "cyan"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onResolve(row.requestKey, "mapped_to_existing", services[0]?.stableCode)} className="premiumButton secondary">Map Existing</button>
              <button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onCreateDraft(row)} className="premiumButton primary">Create Draft Service</button>
              <button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onResolve(row.requestKey, "closed")} className="premiumButton danger">Close</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VersionsAuditView({ data, onBack }: { data: AdminPartnerServiceCatalogueResponse; onBack: () => void }) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1b31] p-4">
      <AdminBackButton onClick={onBack} label="Back to Service Catalogue" />
      <h3 className="mt-4 text-2xl font-black text-cyan-100">Versions & Audit</h3>
      <div className="mt-3 space-y-3">
        {data.versions.slice(0, 6).map((version) => <div key={version.id} className="rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm"><b className="text-slate-100">v{version.version}</b> <span className="text-slate-400">{version.status}</span><div className="text-xs text-slate-500">{version.createdAt}</div></div>)}
        {data.audit.slice(0, 8).map((event) => <div key={event.id} className="rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm"><b className="text-slate-100">{event.action}</b><div className="text-xs text-slate-400">{event.changeSummary || event.entityId}</div><div className="text-xs text-slate-500">{event.createdAt}</div></div>)}
        {data.versions.length === 0 && data.audit.length === 0 ? <p className="text-sm text-slate-400">No version or audit records yet.</p> : null}
      </div>
    </section>
  );
}

type DomainRow = {
  id: string;
  title: string;
  description: string;
  status: AdminPartnerServiceCatalogueItem["status"];
  categoryCount: number;
  serviceCount: number;
  selectableCount: number;
  draftCount: number;
};

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
    const statuses = domainItems.map((item) => item.status);
    return {
      id,
      title: domainTitle(id),
      description: domainDescription(id),
      status: statuses.includes("active") ? "active" : statuses.includes("inactive") ? "inactive" : "archived",
      categoryCount: domainItems.filter((item) => itemKind(item, domainItems) === "category").length,
      serviceCount: domainItems.filter((item) => itemKind(item, domainItems) !== "category").length,
      selectableCount: domainItems.filter((item) => item.applicationSelectable).length,
      draftCount: domainItems.filter((item) => !item.published && !publishedCodes.has(item.stableCode)).length,
    };
  });
}

function buildHierarchy(items: AdminPartnerServiceCatalogueItem[], allDomainItems: AdminPartnerServiceCatalogueItem[]): HierarchyNode[] {
  const byParent = new Map<string, AdminPartnerServiceCatalogueItem[]>();
  for (const item of items) {
    const parent = item.parentCode ?? "__root__";
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

function filterDomainItems(items: AdminPartnerServiceCatalogueItem[], filter: { query: string; status: string; itemType: string; selectable: string }) {
  const q = normalize(filter.query);
  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (filter.selectable && String(item.applicationSelectable) !== filter.selectable) return false;
    if (filter.itemType && itemKind(item, items) !== filter.itemType) return false;
    if (!q) return true;
    return normalize([item.name, item.shortDescription, item.stableCode, item.verificationProfileKey, item.aliases.join(" ")].join(" ")).includes(q);
  });
}

function itemKind(item: AdminPartnerServiceCatalogueItem, domainItems: AdminPartnerServiceCatalogueItem[]): ItemKind {
  const hasChildren = domainItems.some((candidate) => candidate.parentCode === item.stableCode);
  if (item.parentCode) return "sub-service";
  if (hasChildren && !item.applicationSelectable) return "category";
  return "service";
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

function domainTitle(id: string) {
  return partnerServiceCatalog.find((domain) => domain.id === id)?.title ?? id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function domainDescription(id: string) {
  return partnerServiceCatalog.find((domain) => domain.id === id)?.description ?? "Draft-only service Domain managed inside the Partner Service Catalogue.";
}

function domainIcon(id: string) {
  return domainIcons[id] ?? "briefcase";
}

function titleKind(kind: ItemKind) {
  return kind.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function workflowTitle(state: string) {
  return state.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
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

function WorkflowChip({ icon: Icon, label, tone }: { icon: typeof FilePenLine; label: string; tone: Tone }) {
  return <div className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-black ${toneClass(tone)}`}><Icon size={16} />{label}</div>;
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-white/[0.05] p-2"><div className="font-black text-sky-100">{value}</div><div className="text-slate-400">{label}</div></div>;
}

function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-black capitalize ${toneClass(tone)}`}>{label}</span>;
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
      .catalogueNavRow {
        display: flex;
        min-height: 3.25rem;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-radius: 0.875rem;
        border: 1px solid rgba(125,211,252,0.14);
        background: rgba(8,20,39,0.78);
        padding: 0.75rem 0.875rem;
        text-align: left;
        color: #dbeafe;
        font-size: 0.875rem;
        font-weight: 900;
      }
      .catalogueNavRow > span { display: inline-flex; align-items: center; gap: 0.5rem; }
      .catalogueNavRow.active, .catalogueNavRow:hover { border-color: rgba(56,189,248,0.45); background: rgba(14,116,144,0.18); }
      .catalogueNavRow:focus-visible { outline: 2px solid rgb(125,211,252); outline-offset: 2px; }
    `}</style>
  );
}
