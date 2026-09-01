"use client";

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import {
  Archive,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileClock,
  FilePenLine,
  Filter,
  Layers3,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  changeAdminPartnerServiceCatalogueLifecycle,
  getAdminPartnerServiceCatalogue,
  publishAdminPartnerServiceCatalogue,
  resolveAdminPartnerRequestedService,
  saveAdminPartnerServiceCatalogueDraft,
  type AdminPartnerApplicationContentTree,
  type AdminPartnerServiceCatalogueItem,
  type AdminPartnerServiceCatalogueResponse,
} from "../../../lib/admin/adminApiClient";
import { partnerServiceCatalog } from "../../../lib/partner/partnerServiceCatalog";

type TabKey = "domains" | "categories" | "services" | "requested" | "versions";
type Tone = "blue" | "cyan" | "orange" | "slate" | "violet";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Layers3 }> = [
  { key: "domains", label: "Domains", icon: Layers3 },
  { key: "categories", label: "Categories", icon: Boxes },
  { key: "services", label: "Services", icon: ShieldCheck },
  { key: "requested", label: "Requested Services", icon: FileClock },
  { key: "versions", label: "Versions & Audit", icon: Clock3 },
];

const countries = ["IN", "AE", "US", "CA", "GB", "AU", "SG", "TH", "NP", "BT"];
const domainTitle = new Map<string, string>(partnerServiceCatalog.map((domain) => [domain.id, domain.title]));

export function AdminPartnerServiceCatalogueClient() {
  const [data, setData] = useState<AdminPartnerServiceCatalogueResponse | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("services");
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [published, setPublished] = useState("");
  const [country, setCountry] = useState("");
  const [entity, setEntity] = useState("");
  const [selectable, setSelectable] = useState("");
  const [verificationProfile, setVerificationProfile] = useState("");
  const [editing, setEditing] = useState<AdminPartnerServiceCatalogueItem | null>(null);
  const [draft, setDraft] = useState<AdminPartnerServiceCatalogueItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  async function loadCatalogue() {
    setLoadState("loading");
    const result = await getAdminPartnerServiceCatalogue();
    if (!result.ok) {
      setLoadState("error");
      setMessage({ tone: "error", text: result.error.message || "Catalogue data could not be loaded." });
      return;
    }
    const first = result.data.draft.items[0] ?? null;
    setData(result.data);
    setEditing(first);
    setDraft(first ? cloneItem(first) : null);
    setLoadState("ready");
  }

  useEffect(() => {
    // Initial API hydration for this client-only Admin route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCatalogue();
  }, []);

  const services = useMemo(() => data?.draft.items ?? [], [data]);
  const filteredServices = useMemo(() => filterServices(services, { query, domain, status, published, country, entity, selectable, verificationProfile }), [country, domain, entity, published, query, selectable, services, status, verificationProfile]);
  const verificationProfiles = useMemo(() => [...new Set(services.map((service) => service.verificationProfileKey))].sort(), [services]);
  const domains = useMemo(() => [...new Set(services.map((service) => service.domain))].map((id) => ({
    id,
    title: domainTitle.get(id) ?? titleFromId(id),
    count: services.filter((service) => service.domain === id).length,
    active: services.filter((service) => service.domain === id && service.status === "active").length,
    selectable: services.filter((service) => service.domain === id && service.applicationSelectable).length,
  })), [services]);

  function openService(service: AdminPartnerServiceCatalogueItem) {
    setEditing(service);
    setDraft(cloneItem(service));
    setMessage(null);
  }

  function updateDraft(next: Partial<AdminPartnerServiceCatalogueItem>) {
    setDraft((current) => current ? { ...current, ...next } : current);
  }

  async function saveDraft() {
    if (!draft || !data) return;
    setBusy("saving");
    setMessage({ tone: "info", text: "Saving..." });
    const result = await saveAdminPartnerServiceCatalogueDraft({ item: draft, expectedDraftVersion: data.draftVersion, changeSummary: `Saved draft for ${draft.stableCode}` });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Save failed" });
      return;
    }
    setData(result.data);
    const saved = result.data.draft.items.find((item) => item.stableCode === draft.stableCode) ?? null;
    setEditing(saved);
    setDraft(saved ? cloneItem(saved) : null);
    setMessage({ tone: "success", text: "Draft saved" });
  }

  async function publishDraft() {
    if (!data) return;
    setBusy("publishing");
    setMessage({ tone: "info", text: "Publishing..." });
    const result = await publishAdminPartnerServiceCatalogue({ expectedDraftVersion: data.draftVersion, changeSummary: "Published Partner Service Catalogue" });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Publish failed" });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: "Published" });
  }

  async function lifecycle(action: "activate" | "inactivate" | "archive" | "reactivate") {
    if (!editing || !data) return;
    setBusy(action);
    const result = await changeAdminPartnerServiceCatalogueLifecycle(editing.stableCode, action, { expectedDraftVersion: data.draftVersion, changeSummary: `${action} ${editing.stableCode}` });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Save failed" });
      return;
    }
    setData(result.data);
    const saved = result.data.draft.items.find((item) => item.stableCode === editing.stableCode) ?? null;
    setEditing(saved);
    setDraft(saved ? cloneItem(saved) : null);
    setMessage({ tone: "success", text: "Draft saved" });
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
      setMessage({ tone: "error", text: result.status === 403 ? "Permission denied" : result.status === 409 ? "Version conflict" : result.error.message || "Save failed" });
      return;
    }
    setData(result.data);
    setResolutionNote("");
    setMessage({ tone: "success", text: "Draft saved" });
  }

  if (loadState === "loading") return <StatePanel icon={Loader2} spin title="Loading..." text="Loading Partner Service Catalogue from the staging API." />;
  if (loadState === "error" || !data) return <StatePanel icon={XCircle} title="Save failed" text="Catalogue data could not be loaded. Check Admin permissions and API health." action={<button type="button" onClick={loadCatalogue} className="premiumButton secondary"><RefreshCcw size={16} /> Retry</button>} />;

  return (
    <div data-admin-service-catalogue="true" className="min-h-screen rounded-2xl border border-sky-300/10 bg-[#07111f] p-4 text-slate-100 shadow-2xl shadow-sky-950/30 lg:p-6">
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
      <section className="overflow-hidden rounded-2xl border border-sky-300/15 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.35),transparent_34%),linear-gradient(135deg,#0a1930,#111827_55%,#1c1917)] p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Admin / Partners</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-sky-100 lg:text-4xl">Service Catalogue</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Inspect and govern the S4A Partner service taxonomy used by Step 4. Draft changes stay Admin-only until an authorized publish.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <WorkflowChip icon={FilePenLine} label={`Draft v${data.draftVersion}`} tone="cyan" />
            <WorkflowChip icon={CheckCircle2} label={`Published v${data.publishedVersion}`} tone="blue" />
            <WorkflowChip icon={Clock3} label={data.scheduling.supported ? "Scheduled" : "No schedule"} tone="orange" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric tone="blue" label="Domains" value={domains.length} />
          <Metric tone="cyan" label="Catalogue items" value={services.length} />
          <Metric tone="orange" label="Selectable" value={services.filter((service) => service.applicationSelectable).length} />
          <Metric tone="violet" label="Requests" value={data.requestedServices.length} />
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Service catalogue sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${active ? "bg-sky-500 text-[#06101e] shadow-lg shadow-sky-500/20" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-sky-300/50"}`}><Icon size={16} />{tab.label}</button>;
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMessage({ tone: "info", text: "Preview uses the current draft catalogue without publishing." })} className="premiumButton secondary"><Eye size={16} /> Preview</button>
            <button type="button" disabled={!data.permissions.canPublish || busy === "publishing"} onClick={publishDraft} className="premiumButton publish">{busy === "publishing" ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Publish</button>
          </div>
        </div>
        {message ? <div role="status" className={`mt-4 rounded-xl border p-3 text-sm font-bold ${message.tone === "success" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" : message.tone === "error" ? "border-orange-300/40 bg-orange-500/10 text-orange-100" : "border-sky-300/30 bg-sky-400/10 text-sky-100"}`}>{message.text}</div> : null}
      </section>

      {activeTab === "services" ? <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"><section className="space-y-4"><FilterPanel {...{ query, domain, status, published, country, entity, selectable, verificationProfile, verificationProfiles, setQuery, setDomain, setStatus, setPublished, setCountry, setEntity, setSelectable, setVerificationProfile }} /><ServiceTable services={filteredServices} selected={editing?.stableCode} onOpen={openService} /></section><EditPanel data={data} service={draft} busy={busy} onChange={updateDraft} onSave={saveDraft} onLifecycle={lifecycle} /></div> : null}
      {activeTab === "domains" ? <DomainGrid domains={domains} /> : null}
      {activeTab === "categories" ? <ContentAlignment tree={data.draft.contentTree} /> : null}
      {activeTab === "requested" ? <RequestedServices rows={data.requestedServices} services={services} note={resolutionNote} busy={busy} onNote={setResolutionNote} onResolve={resolveRequest} /> : null}
      {activeTab === "versions" ? <VersionsAudit data={data} /> : null}
    </div>
  );
}

function FilterPanel(props: {
  query: string;
  domain: string;
  status: string;
  published: string;
  country: string;
  entity: string;
  selectable: string;
  verificationProfile: string;
  verificationProfiles: string[];
  setQuery: Dispatch<SetStateAction<string>>;
  setDomain: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setPublished: Dispatch<SetStateAction<string>>;
  setCountry: Dispatch<SetStateAction<string>>;
  setEntity: Dispatch<SetStateAction<string>>;
  setSelectable: Dispatch<SetStateAction<string>>;
  setVerificationProfile: Dispatch<SetStateAction<string>>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-lg shadow-black/20">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-cyan-100"><Filter size={16} /> Filters</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block md:col-span-2"><span className="text-xs font-black uppercase text-slate-400">Search</span><div className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-sky-300/15 bg-[#07111f] px-3 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-500/20"><Search size={16} className="text-sky-300" /><input data-admin-service-search="true" value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Name, alias, profile, stable code" /></div></label>
        <Select label="Domain" value={props.domain} onChange={props.setDomain} options={partnerServiceCatalog.map((item) => [item.id, item.title])} />
        <Select label="Status" value={props.status} onChange={props.setStatus} options={[["active", "Active"], ["inactive", "Inactive"], ["archived", "Archived"]]} />
        <Select label="Published" value={props.published} onChange={props.setPublished} options={[["true", "Published"], ["false", "Draft"]]} />
        <Select label="Country" value={props.country} onChange={props.setCountry} options={countries.map((item) => [item, item])} />
        <Select label="Entity" value={props.entity} onChange={props.setEntity} options={[["individual", "Individual"], ["organization", "Organization"]]} />
        <Select label="Selectable" value={props.selectable} onChange={props.setSelectable} options={[["true", "Application selectable"], ["false", "Not selectable"]]} />
        <Select label="Verification Profile" value={props.verificationProfile} onChange={props.setVerificationProfile} options={props.verificationProfiles.map((item: string) => [item, item.replace(/_/g, " ")])} />
      </div>
    </section>
  );
}

function ServiceTable({ services, selected, onOpen }: { services: AdminPartnerServiceCatalogueItem[]; selected?: string; onOpen: (service: AdminPartnerServiceCatalogueItem) => void }) {
  if (services.length === 0) return <Empty label="No catalogue services match these filters." />;
  return <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1628] shadow-xl shadow-black/20"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-[#11233d] text-xs uppercase text-sky-100"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Hierarchy</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Eligibility</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">{services.map((service) => <tr key={service.stableCode} className={selected === service.stableCode ? "bg-sky-400/10" : "hover:bg-white/[0.03]"}><td className="px-4 py-3"><div className="font-black text-slate-100">{service.name}</div><div className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{service.shortDescription}</div></td><td className="px-4 py-3 text-xs text-slate-300">{domainTitle.get(service.domain) ?? titleFromId(service.domain)}{service.parentCode ? <><ChevronRight className="mx-1 inline h-3 w-3" />{service.parentCode}</> : null}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1"><StatusChip label={service.status} tone={service.status === "active" ? "cyan" : service.status === "archived" ? "orange" : "slate"} /><StatusChip label={service.published ? "Published" : "Draft"} tone={service.published ? "blue" : "slate"} /></div></td><td className="px-4 py-3 text-xs text-slate-300">{service.countries.join(", ")}<div>{service.individualAllowed ? "Individual" : ""}{service.individualAllowed && service.organizationAllowed ? " / " : ""}{service.organizationAllowed ? "Organization" : ""}</div></td><td className="px-4 py-3 text-xs text-slate-300">{service.verificationProfileKey.replace(/_/g, " ")}</td><td className="px-4 py-3"><button type="button" onClick={() => onOpen(service)} className="premiumButton compact secondary"><FilePenLine size={14} /> Edit</button></td></tr>)}</tbody></table></div>;
}

function EditPanel({ data, service, busy, onChange, onSave, onLifecycle }: { data: AdminPartnerServiceCatalogueResponse; service: AdminPartnerServiceCatalogueItem | null; busy: string; onChange: (next: Partial<AdminPartnerServiceCatalogueItem>) => void; onSave: () => void; onLifecycle: (action: "activate" | "inactivate" | "archive" | "reactivate") => void }) {
  if (!service) return <Empty label="Select a service to edit." />;
  const canManage = data.permissions.canManage;
  return <aside data-admin-service-editor="true" className="rounded-2xl border border-sky-300/15 bg-[#0d1b31] p-4 shadow-xl shadow-black/25 xl:sticky xl:top-4 xl:self-start"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-orange-300">Draft editor</p><h3 className="mt-1 text-xl font-black text-sky-100">{service.name}</h3></div><StatusChip label={service.status} tone={service.status === "active" ? "cyan" : service.status === "archived" ? "orange" : "slate"} /></div><div className="mt-4 grid gap-3"><Input label="Service name" value={service.name} disabled={!canManage} onChange={(value) => onChange({ name: value })} /><Textarea label="Short description" value={service.shortDescription} disabled={!canManage} onChange={(value) => onChange({ shortDescription: value })} /><Select label="Domain" value={service.domain} disabled={!canManage} onChange={(value) => onChange({ domain: value })} options={partnerServiceCatalog.map((item) => [item.id, item.title])} /><Input label="Verification Profile" value={service.verificationProfileKey} disabled={!canManage} onChange={(value) => onChange({ verificationProfileKey: value })} /><Input label="Aliases / Search Terms" value={service.aliases.join(", ")} disabled={!canManage} onChange={(value) => onChange({ aliases: value.split(",").map((item) => item.trim()).filter(Boolean) })} /><Input label="Countries" value={service.countries.join(", ")} disabled={!canManage} onChange={(value) => onChange({ countries: value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean) })} /><div className="grid grid-cols-2 gap-2"><Toggle label="Individual" checked={service.individualAllowed} disabled={!canManage} onChange={(value) => onChange({ individualAllowed: value })} /><Toggle label="Organization" checked={service.organizationAllowed} disabled={!canManage} onChange={(value) => onChange({ organizationAllowed: value })} /><Toggle label="Application selectable" checked={service.applicationSelectable} disabled={!canManage} onChange={(value) => onChange({ applicationSelectable: value })} /><Toggle label="Approval required" checked={service.serviceApprovalRequired} disabled={!canManage} onChange={(value) => onChange({ serviceApprovalRequired: value })} /></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" disabled={!canManage || busy === "saving"} onClick={onSave} className="premiumButton primary">{busy === "saving" ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Draft</button><button type="button" disabled={!canManage || busy !== ""} onClick={() => onLifecycle(service.status === "archived" ? "reactivate" : "archive")} className="premiumButton danger">{service.status === "archived" ? <RotateCcw size={16} /> : <Archive size={16} />} {service.status === "archived" ? "Reactivate" : "Archive"}</button><button type="button" disabled={!canManage || busy !== ""} onClick={() => onLifecycle("activate")} className="premiumButton secondary"><CheckCircle2 size={16} /> Activate</button><button type="button" disabled={!canManage || busy !== ""} onClick={() => onLifecycle("inactivate")} className="premiumButton secondary"><XCircle size={16} /> Inactivate</button></div>{!canManage ? <p className="mt-3 text-xs font-bold text-orange-200">Permission denied</p> : null}</aside>;
}

function DomainGrid({ domains }: { domains: Array<{ id: string; title: string; count: number; active: number; selectable: number }> }) {
  return <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{domains.map((domain, index) => <div key={domain.id} className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4 shadow-lg shadow-black/20"><p className={`text-xs font-black uppercase ${index % 3 === 0 ? "text-cyan-300" : index % 3 === 1 ? "text-sky-300" : "text-orange-300"}`}>Domain</p><h3 className="mt-2 text-lg font-black text-slate-100">{domain.title}</h3><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><MetricMini label="Items" value={domain.count} /><MetricMini label="Active" value={domain.active} /><MetricMini label="Selectable" value={domain.selectable} /></div></div>)}</section>;
}

function ContentAlignment({ tree }: { tree: AdminPartnerApplicationContentTree }) {
  return <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1b31] p-5"><p className="text-xs font-black uppercase text-cyan-300">Actual Content Editor Integration</p><h3 className="mt-2 text-xl font-black text-sky-100">{tree.root}</h3><div className="mt-4 grid gap-2 md:grid-cols-2">{tree.children.map((node) => <div key={node.id} className="rounded-xl border border-white/10 bg-[#07111f] p-3"><div className="font-black text-slate-100">{node.label}</div><div className="mt-2 text-xs text-slate-400">Editable: {node.editableFields.join(", ")}</div><div className="mt-1 text-xs text-orange-200">Locked: {node.lockedFields.join(", ")}</div></div>)}</div><Link href="/admin/website-experience/login-signup" className="premiumButton secondary mt-4 inline-flex">Open Existing Content Editor</Link></section>;
}

function RequestedServices({ rows, services, note, busy, onNote, onResolve }: { rows: AdminPartnerServiceCatalogueResponse["requestedServices"]; services: AdminPartnerServiceCatalogueItem[]; note: string; busy: string; onNote: (value: string) => void; onResolve: (requestKey: string, resolutionType: "mapped_to_existing" | "draft_service_created" | "closed", mappedServiceCode?: string) => void }) {
  return <section className="mt-5 space-y-3"><Textarea label="Resolution note" value={note} onChange={onNote} />{rows.length === 0 ? <Empty label="No requested services are waiting for review." /> : rows.map((row) => <div key={row.requestKey} className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-black uppercase text-orange-300">{row.source.replace(/_/g, " ")}</p><h3 className="mt-1 text-lg font-black text-slate-100">{row.requestedName}</h3><p className="mt-1 text-sm text-slate-400">{row.description || "No description supplied."}</p><p className="mt-2 text-xs text-slate-500">{row.closestDomain || "No closest domain"}</p></div><StatusChip label={row.status} tone={row.status === "new" ? "orange" : "cyan"} /></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onResolve(row.requestKey, "mapped_to_existing", services[0]?.stableCode)} className="premiumButton secondary">Map Existing</button><button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onResolve(row.requestKey, "draft_service_created")} className="premiumButton primary">Create Draft</button><button type="button" disabled={busy === `resolve:${row.requestKey}`} onClick={() => onResolve(row.requestKey, "closed")} className="premiumButton danger">Close</button></div></div>)}</section>;
}

function VersionsAudit({ data }: { data: AdminPartnerServiceCatalogueResponse }) {
  return <section className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4"><h3 className="text-lg font-black text-cyan-100">Versions</h3>{data.versions.length === 0 ? <p className="mt-3 text-sm text-slate-400">No version records yet.</p> : data.versions.map((version) => <div key={version.id} className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm"><b className="text-slate-100">v{version.version}</b> <span className="text-slate-400">{version.status}</span><div className="text-xs text-slate-500">{version.createdAt}</div></div>)}</div><div className="rounded-2xl border border-white/10 bg-[#0d1b31] p-4"><h3 className="text-lg font-black text-orange-100">Audit</h3>{data.audit.length === 0 ? <p className="mt-3 text-sm text-slate-400">No catalogue audit records yet.</p> : data.audit.map((event) => <div key={event.id} className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm"><b className="text-slate-100">{event.action}</b><div className="text-xs text-slate-400">{event.changeSummary || event.entityId}</div><div className="text-xs text-slate-500">{event.createdAt}</div></div>)}</div></section>;
}

function WorkflowChip({ icon: Icon, label, tone }: { icon: typeof FilePenLine; label: string; tone: Tone }) {
  return <div className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-black ${toneClass(tone)}`}><Icon size={16} />{label}</div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return <div className={`rounded-2xl border p-4 ${toneClass(tone)}`}><div className="text-2xl font-black">{value}</div><div className="mt-1 text-xs font-black uppercase opacity-80">{label}</div></div>;
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-white/[0.05] p-2"><div className="font-black text-sky-100">{value}</div><div className="text-slate-400">{label}</div></div>;
}

function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-black capitalize ${toneClass(tone)}`}>{label}</span>;
}

function Select({ label, value, options, onChange, disabled }: { label: string; value: string; options: string[][]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"><option value="">All</option>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>;
}

function Input({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /></label>;
}

function Textarea({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /></label>;
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm font-bold text-slate-200"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-sky-300 text-sky-500 focus:ring-sky-400" />{label}</label>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-sky-300/20 bg-[#0d1b31] p-6 text-sm font-bold text-slate-400">{label}</div>;
}

function StatePanel({ icon: Icon, title, text, action, spin }: { icon: typeof Loader2; title: string; text: string; action?: ReactNode; spin?: boolean }) {
  return <section className="rounded-2xl border border-sky-300/15 bg-[#07111f] p-8 text-slate-100"><Icon className={spin ? "animate-spin text-sky-300" : "text-orange-300"} size={28} /><h2 className="mt-4 text-2xl font-black text-sky-100">{title}</h2><p className="mt-2 text-sm text-slate-400">{text}</p>{action ? <div className="mt-4">{action}</div> : null}</section>;
}

function filterServices(services: AdminPartnerServiceCatalogueItem[], filter: Record<string, string>) {
  const q = filter.query.trim().toLowerCase();
  return services.filter((service) => {
    if (filter.domain && service.domain !== filter.domain) return false;
    if (filter.status && service.status !== filter.status) return false;
    if (filter.published && String(service.published) !== filter.published) return false;
    if (filter.country && !service.countries.includes(filter.country)) return false;
    if (filter.entity === "individual" && !service.individualAllowed) return false;
    if (filter.entity === "organization" && !service.organizationAllowed) return false;
    if (filter.selectable && String(service.applicationSelectable) !== filter.selectable) return false;
    if (filter.verificationProfile && service.verificationProfileKey !== filter.verificationProfile) return false;
    if (!q) return true;
    return [service.name, service.shortDescription, service.stableCode, service.domain, service.verificationProfileKey, ...service.aliases].join(" ").toLowerCase().includes(q);
  });
}

function cloneItem(item: AdminPartnerServiceCatalogueItem): AdminPartnerServiceCatalogueItem {
  return { ...item, countries: [...item.countries], capabilities: [...item.capabilities], aliases: [...item.aliases] };
}

function titleFromId(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function toneClass(tone: Tone) {
  if (tone === "blue") return "border-sky-300/25 bg-sky-500/12 text-sky-100";
  if (tone === "cyan") return "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";
  if (tone === "orange") return "border-orange-300/30 bg-orange-500/12 text-orange-100";
  if (tone === "violet") return "border-indigo-300/25 bg-indigo-500/12 text-indigo-100";
  return "border-slate-300/15 bg-slate-400/10 text-slate-200";
}
