"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronRight, Eye, FilePenLine, Loader2, MoreHorizontal, RefreshCcw, Save, Send, Trash2, XCircle } from "lucide-react";
import { AdminBackButton } from "../../_components/AdminBackButton";
import {
  approveAdminPartnerServiceCatalogueDraft,
  deleteAdminPartnerServiceCatalogueDraftItem,
  getAdminPartnerServiceCatalogue,
  publishAdminPartnerServiceCatalogue,
  requestAdminPartnerServiceCatalogueChanges,
  saveAdminPartnerServiceCatalogueDraft,
  submitAdminPartnerServiceCatalogueApproval,
  type AdminPartnerServiceCatalogueItem,
  type AdminPartnerServiceCatalogueResponse,
} from "../../../lib/admin/adminApiClient";
import { partnerServiceCatalog } from "../../../lib/partner/partnerServiceCatalog";

type Mode = "new" | "edit";
type LoadState = "loading" | "ready" | "error";
type Message = { tone: "success" | "error" | "info"; text: string };
type FormState = {
  domainId: string;
  name: string;
  shortDescription: string;
  icon: string;
  displayOrder: string;
  status: "active" | "inactive" | "archived";
  countries: string;
  individualAllowed: boolean;
  organizationAllowed: boolean;
  availableInApplications: boolean;
  aliases: string;
};

const serviceCatalogueHref = "/admin/website-experience/pages/partner/service-catalogue";
const defaultCountries = "IN, AE, US, CA, GB, AU, SG";

export function AdminPartnerServiceCatalogueDomainEditorClient({ mode, domainId }: { mode: Mode; domainId?: string }) {
  const [data, setData] = useState<AdminPartnerServiceCatalogueResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [bypassReason, setBypassReason] = useState("");
  const [form, setForm] = useState<FormState>(() => emptyForm(domainId));
  const [original, setOriginal] = useState<FormState>(() => emptyForm(domainId));

  const load = useCallback(async () => {
    setLoadState("loading");
    const result = await getAdminPartnerServiceCatalogue();
    if (!result.ok) {
      setLoadState("error");
      setMessage({ tone: "error", text: result.error.message || "We couldn't load this domain." });
      return;
    }
    const resolved = resolveDomainForm(result.data, mode, domainId);
    if (!resolved && mode === "edit") {
      setLoadState("error");
      setMessage({ tone: "error", text: "We couldn't load this domain." });
      return;
    }
    setData(result.data);
    setForm(resolved ?? emptyForm(domainId));
    setOriginal(resolved ?? emptyForm(domainId));
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1") setPreview(true);
    setLoadState("ready");
  }, [domainId, mode]);

  useEffect(() => {
    // Initial API hydration for this dedicated Admin route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const domainName = form.name.trim() || "New Domain";
  const rootStableCode = `${form.domainId || slugify(domainName)}-root`;
  const workflowState = data?.workflowState ?? "published";
  const activeWorkflow = Boolean(data?.hasUnpublishedChanges && data.workflowRecord?.sourceRecordId === form.domainId);
  const canManage = Boolean(data?.permissions.canManage);
  const canPublish = Boolean(data?.permissions.canPublish);
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(original);
  const statusLabel = activeWorkflow ? workflowLabel(workflowState) : mode === "new" ? "Not Live" : form.status === "archived" ? "Archived" : "Published";
  const detailHref = `${serviceCatalogueHref}?domain=${encodeURIComponent(form.domainId)}`;

  const submitLabel = workflowState === "changes_requested" ? "Resubmit for Approval" : "Send for Approval";
  const confirmLeave = () => !hasUnsavedChanges || window.confirm("Discard unsaved changes and leave this domain editor?");

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  async function saveDraft() {
    if (!data) return;
    const error = validateForm(form, data, mode);
    if (error) {
      setMessage({ tone: "error", text: error });
      return;
    }
    setBusy("save");
    setMessage({ tone: "info", text: "Saving domain draft..." });
    const item = buildDomainRootItem(form, data);
    const result = await saveAdminPartnerServiceCatalogueDraft({
      item,
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Saved domain draft for ${item.name}`,
    });
    if (!result.ok) {
      setBusy("");
      setMessage({ tone: "error", text: result.error.message || "We couldn't save this draft." });
      return;
    }
    const confirmed = await getAdminPartnerServiceCatalogue();
    setBusy("");
    if (!confirmed.ok || !confirmed.data.draft.items.some((candidate) => candidate.stableCode === item.stableCode)) {
      setMessage({ tone: "error", text: "We couldn't confirm this draft in the catalogue. Reload and try again." });
      return;
    }
    setData(confirmed.data);
    setOriginal(form);
    setPreview(false);
    if (mode === "new") window.history.replaceState(null, "", `/admin/website-experience/pages/partner/service-catalogue/domains/${encodeURIComponent(item.domain)}/edit`);
    setMessage({ tone: "success", text: `Domain draft saved. ${item.name} · Draft v${confirmed.data.draftVersion}. Next action: Send for Approval.` });
  }

  async function submitForApproval() {
    if (!data) return;
    setBusy("submit");
    const result = await submitAdminPartnerServiceCatalogueApproval({
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Sent domain draft for approval: ${domainName}`,
      note: reviewNote,
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "We couldn't send this draft for approval." });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: "Sent for approval. Waiting for Review." });
  }

  async function review(action: "approve" | "request") {
    if (!data) return;
    if (action === "request" && !reviewNote.trim()) {
      setMessage({ tone: "error", text: "Add a review note before requesting changes." });
      return;
    }
    setBusy(action);
    const result = action === "approve"
      ? await approveAdminPartnerServiceCatalogueDraft({ expectedDraftVersion: data.draftVersion, changeSummary: `Approved domain draft: ${domainName}`, note: reviewNote })
      : await requestAdminPartnerServiceCatalogueChanges({ expectedDraftVersion: data.draftVersion, changeSummary: `Requested changes for domain draft: ${domainName}`, note: reviewNote });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "Review action failed." });
      return;
    }
    setData(result.data);
    setReviewNote("");
    setMessage({ tone: "success", text: action === "approve" ? "Approved. Next action: Publish Now." : "Changes requested. The editor can update and resubmit this draft." });
  }

  async function publish() {
    if (!data) return;
    setBusy("publish");
    const result = await publishAdminPartnerServiceCatalogue({
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Published Service Catalogue snapshot containing ${domainName}`,
      reason: bypassReason,
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "Publish failed." });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: `${domainName} is now available in the published catalogue.` });
  }

  async function deleteDraft() {
    if (!data) return;
    const confirmed = window.confirm(mode === "new" ? "Delete this domain draft? This removes only the unpublished draft Domain." : "Delete this domain draft? This removes only the unpublished draft. The published Service Catalogue will remain unchanged.");
    if (!confirmed) return;
    setBusy("delete");
    const result = await deleteAdminPartnerServiceCatalogueDraftItem(rootStableCode, {
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Deleted domain draft for ${domainName}`,
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "We couldn't delete this draft." });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: "Draft deleted. Published catalogue content remains unchanged." });
    window.location.assign(serviceCatalogueHref);
  }

  if (loadState === "loading") return <StatePanel icon={Loader2} spin title="Loading domain..." text="Preparing the domain workflow." />;
  if (loadState === "error" || !data) {
    return <StatePanel icon={XCircle} title="We couldn't load this domain." text="Please try again." action={<div className="flex flex-wrap gap-2"><AdminBackButton href={serviceCatalogueHref} label="Back to Service Catalogue" /><button type="button" onClick={load} className="editorButton secondary"><RefreshCcw size={16} /> Retry</button></div>} />;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#07111f] p-4 text-slate-100 shadow-2xl shadow-sky-950/30 lg:p-6">
      <EditorStyles />
      <div className="rounded-2xl border border-sky-300/15 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/15">
        <AdminBackButton href={mode === "edit" ? detailHref : serviceCatalogueHref} label={mode === "edit" ? `Back to ${domainName}` : "Back to Service Catalogue"} />
        <Breadcrumb mode={mode} domainName={domainName} domainHref={detailHref} />
        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-cyan-100">{mode === "new" ? "Add Domain" : "Edit Domain"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{mode === "new" ? "Create a new service domain for the Partner catalogue." : "Update this service domain."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip label={statusLabel} tone={statusLabel === "Not Live" ? "orange" : workflowState === "approved" ? "green" : workflowState === "in_review" ? "violet" : "cyan"} />
            <Chip label={`Draft v${data.draftVersion}`} />
            <Chip label={`Published v${data.publishedVersion}`} />
          </div>
        </div>
      </div>

      {message ? <MessageBox message={message} /> : null}

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <main className="space-y-4 min-w-0">
          <ActionBar
            canManage={canManage}
            canPublish={canPublish}
            busy={busy}
            workflowState={workflowState}
            activeWorkflow={activeWorkflow}
            hasUnsavedChanges={hasUnsavedChanges}
            submitLabel={submitLabel}
            reviewNote={reviewNote}
            bypassReason={bypassReason}
            onReviewNoteChange={setReviewNote}
            onBypassReasonChange={setBypassReason}
            onPreview={() => setPreview(true)}
            onSave={saveDraft}
            onSubmit={submitForApproval}
            onApprove={() => review("approve")}
            onRequestChanges={() => review("request")}
            onPublish={publish}
            onDelete={deleteDraft}
            confirmLeave={confirmLeave}
          />
          {preview ? (
            <PreviewPanel form={form} statusLabel={statusLabel} onBack={() => setPreview(false)} onSave={saveDraft} busy={busy} canManage={canManage} />
          ) : (
            <DomainForm form={form} setForm={setForm} disabled={!canManage || ["in_review", "approved"].includes(workflowState)} existingDomain={mode === "edit"} />
          )}
        </main>
        <aside className="space-y-4 min-w-0">
          <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4">
            <h3 className="text-base font-black text-sky-100">Workflow</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Save as Draft keeps the published catalogue unchanged. Send for Approval moves this domain change into the common review queue.</p>
            {data.review?.note ? <p className="mt-3 rounded-xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-bold text-orange-100">Review note: {data.review.note}</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4">
            <h3 className="text-base font-black text-sky-100">Publish Scope</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Publishing uses the approved Service Catalogue snapshot. This workflow record identifies the domain change included in that snapshot.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function DomainForm({ form, setForm, disabled, existingDomain }: { form: FormState; setForm: (value: FormState | ((current: FormState) => FormState)) => void; disabled: boolean; existingDomain: boolean }) {
  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));
  return (
    <form className="space-y-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4" onSubmit={(event) => event.preventDefault()}>
      <FormSection title="Basic Information">
        <Field label="Domain name" value={form.name} onChange={(value) => update({ name: value, ...(existingDomain ? {} : { domainId: slugify(value) }) })} disabled={disabled} />
        <Field label="Short description" value={form.shortDescription} onChange={(value) => update({ shortDescription: value })} disabled={disabled} multiline />
        <Field label="Icon" value={form.icon} onChange={(value) => update({ icon: value })} disabled={disabled} helper="Use the existing icon name used by the catalogue." />
        <Field label="Display order" value={form.displayOrder} onChange={(value) => update({ displayOrder: value.replace(/[^0-9]/g, "") })} disabled={disabled} />
        <Field label="Domain reference" value={form.domainId} onChange={(value) => update({ domainId: slugify(value) })} disabled={disabled || existingDomain} helper="Generated once and preserved after creation." />
      </FormSection>
      <FormSection title="Availability">
        <SelectField label="Lifecycle state" value={form.status} onChange={(value) => update({ status: value as FormState["status"], availableInApplications: value === "active" })} disabled={disabled} options={[["active", "Active"], ["inactive", "Inactive"], ["archived", "Archived"]]} />
        <Field label="Country availability" value={form.countries} onChange={(value) => update({ countries: value.toUpperCase() })} disabled={disabled} helper="Comma-separated country codes." />
        <Toggle label="Available in Partner applications" checked={form.availableInApplications} onChange={(value) => update({ availableInApplications: value, status: value ? "active" : "inactive" })} disabled={disabled} />
      </FormSection>
      <FormSection title="Partner Eligibility">
        <Toggle label="Individual Partners" checked={form.individualAllowed} onChange={(value) => update({ individualAllowed: value })} disabled={disabled} />
        <Toggle label="Business or organization Partners" checked={form.organizationAllowed} onChange={(value) => update({ organizationAllowed: value })} disabled={disabled} />
      </FormSection>
      <FormSection title="Search & Display">
        <Field label="Search aliases" value={form.aliases} onChange={(value) => update({ aliases: value })} disabled={disabled} helper="Comma-separated search terms." />
      </FormSection>
    </form>
  );
}

function ActionBar(props: {
  canManage: boolean;
  canPublish: boolean;
  busy: string;
  workflowState: string;
  activeWorkflow: boolean;
  hasUnsavedChanges: boolean;
  submitLabel: string;
  reviewNote: string;
  bypassReason: string;
  onReviewNoteChange: (value: string) => void;
  onBypassReasonChange: (value: string) => void;
  onPreview: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onPublish: () => void;
  onDelete: () => void;
  confirmLeave: () => boolean;
}) {
  const draftLike = props.activeWorkflow && ["draft", "changes_requested"].includes(props.workflowState);
  const inReview = props.activeWorkflow && props.workflowState === "in_review";
  const approved = props.activeWorkflow && props.workflowState === "approved";
  return (
    <section className="rounded-2xl border border-sky-300/15 bg-[#0b1628] p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-base font-black text-sky-100">Actions</h3>
          <p className="mt-1 text-sm text-slate-400">{inReview ? "Waiting for Review" : approved ? "Approved and ready for publication." : draftLike ? "Draft saved. The next workflow action is available here." : "Preview changes before saving a draft."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={serviceCatalogueHref} onClick={(event) => { if (!props.confirmLeave()) event.preventDefault(); }} className="editorButton secondary">Cancel</Link>
          <button type="button" onClick={props.onPreview} className="editorButton secondary"><Eye size={16} /> {draftLike || approved ? "Preview Draft" : "Preview Changes"}</button>
          {!inReview && !approved ? <button type="button" disabled={!props.canManage || props.busy === "save"} onClick={props.onSave} className="editorButton primary"><Save size={16} /> Save as Draft</button> : null}
          {draftLike && !props.hasUnsavedChanges ? <button type="button" disabled={!props.canManage || props.busy === "submit"} onClick={props.onSubmit} className="editorButton publish"><Send size={16} /> {props.submitLabel}</button> : null}
          {inReview && props.canPublish ? <button type="button" disabled={props.busy === "approve"} onClick={props.onApprove} className="editorButton primary"><CheckCircle2 size={16} /> Approve</button> : null}
          {inReview && props.canPublish ? <button type="button" disabled={props.busy === "request"} onClick={props.onRequestChanges} className="editorButton danger"><AlertTriangle size={16} /> Request Changes</button> : null}
          {approved && props.canPublish ? <button type="button" disabled={props.busy === "publish"} onClick={props.onPublish} className="editorButton publish"><CheckCircle2 size={16} /> Publish Now</button> : null}
          {draftLike ? (
            <details className="relative">
              <summary className="editorButton secondary cursor-pointer list-none"><MoreHorizontal size={16} /> More Actions</summary>
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-sky-300/15 bg-[#07111f] p-2 shadow-2xl shadow-black/40">
                <button type="button" disabled={!props.canManage || props.busy === "delete"} onClick={props.onDelete} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-orange-100 hover:bg-orange-400/10 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={15} /> Delete Draft</button>
              </div>
            </details>
          ) : null}
        </div>
      </div>
      {(inReview || approved || props.workflowState === "changes_requested") ? (
        <label className="mt-4 block">
          <span className="text-xs font-black uppercase text-slate-400">{inReview ? "Review note" : "Note"}</span>
          <textarea value={props.reviewNote} onChange={(event) => props.onReviewNoteChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20" />
        </label>
      ) : null}
      {approved && props.canPublish ? (
        <label className="mt-4 block">
          <span className="text-xs font-black uppercase text-slate-400">Publish note</span>
          <textarea value={props.bypassReason} onChange={(event) => props.onBypassReasonChange(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20" placeholder="Optional publication note" />
        </label>
      ) : null}
    </section>
  );
}

function PreviewPanel({ form, statusLabel, onBack, onSave, busy, canManage }: { form: FormState; statusLabel: string; onBack: () => void; onSave: () => void; busy: string; canManage: boolean }) {
  return (
    <section className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[#0b1628] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-orange-200">Preview</p>
          <h3 className="mt-1 text-2xl font-black text-cyan-100">{form.name || "New Domain"}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{form.shortDescription || "Domain description will appear here."}</p>
        </div>
        <Chip label="Not Live" tone="orange" />
      </div>
      <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
        <div className="flex min-h-20 flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1b31] p-3 lg:flex-row lg:items-center">
          <span>
            <span className="block text-base font-black text-slate-100">{form.name || "New Domain"}</span>
            <span className="mt-1 block text-sm leading-5 text-slate-400">{form.shortDescription || "Domain description will appear here."}</span>
            <span className="mt-2 flex flex-wrap gap-2 text-xs">
              <Chip label={statusLabel} tone="cyan" />
              <Chip label={form.availableInApplications ? "Available" : "Not available"} />
              <Chip label={`${splitList(form.countries).length} Countries`} />
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-sky-200" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Detail label="Individual Partners" value={form.individualAllowed ? "Allowed" : "Not allowed"} />
        <Detail label="Business Partners" value={form.organizationAllowed ? "Allowed" : "Not allowed"} />
        <Detail label="Application availability" value={form.availableInApplications ? "Available" : "Not available"} />
        <Detail label="Search terms" value={form.aliases || "No aliases added"} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className="editorButton secondary"><FilePenLine size={16} /> Back to Editing</button>
        <button type="button" disabled={!canManage || busy === "save"} onClick={onSave} className="editorButton primary"><Save size={16} /> Save as Draft</button>
      </div>
    </section>
  );
}

function Breadcrumb({ mode, domainName, domainHref }: { mode: Mode; domainName: string; domainHref: string }) {
  const items = [
    { label: "Website Experience", href: "/admin/website-experience" },
    { label: "Pages", href: "/admin/website-experience/pages" },
    { label: "Partner", href: "/admin/website-experience/pages/partner" },
    { label: "Service Catalogue", href: serviceCatalogueHref },
    ...(mode === "edit" ? [{ label: domainName, href: domainHref }] : []),
    { label: mode === "new" ? "Add Domain" : "Edit" },
  ];
  return (
    <nav className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item.label}:${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className="text-slate-600">&gt;</span> : null}
          {"href" in item && item.href ? <Link href={item.href} className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">{item.label}</Link> : <span aria-current="page" className="text-cyan-100">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function resolveDomainForm(data: AdminPartnerServiceCatalogueResponse, mode: Mode, domainId?: string): FormState | null {
  if (mode === "new") return emptyForm(domainId);
  if (!domainId) return null;
  const item = domainRootItem(data.draft.items, domainId) ?? firstDomainItem(data.draft.items, domainId);
  if (!item) return null;
  return {
    domainId,
    name: domainTitle(domainId, item),
    shortDescription: item.shortDescription || domainDescription(domainId),
    icon: item.icon || domainIcon(domainId),
    displayOrder: String(item.displayOrder ?? 0),
    status: item.status,
    countries: item.countries.join(", "),
    individualAllowed: item.individualAllowed,
    organizationAllowed: item.organizationAllowed,
    availableInApplications: item.status === "active",
    aliases: item.aliases.join(", "),
  };
}

function buildDomainRootItem(form: FormState, data: AdminPartnerServiceCatalogueResponse): AdminPartnerServiceCatalogueItem {
  const existing = domainRootItem(data.draft.items, form.domainId);
  const first = firstDomainItem(data.draft.items, form.domainId);
  const stableCode = existing?.stableCode ?? `${form.domainId}-root`;
  return {
    id: existing?.id ?? `svc_${stableCode}`,
    stableCode,
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    domain: form.domainId,
    parentCode: undefined,
    icon: form.icon.trim() || domainIcon(form.domainId),
    displayOrder: Number.parseInt(form.displayOrder, 10) || first?.displayOrder || nextDomainOrder(data.draft.items),
    status: form.availableInApplications ? "active" : form.status,
    published: Boolean(existing?.published),
    countries: splitList(form.countries).map((value) => value.toUpperCase()),
    individualAllowed: form.individualAllowed,
    organizationAllowed: form.organizationAllowed,
    applicationSelectable: false,
    serviceApprovalRequired: true,
    verificationProfileKey: existing?.verificationProfileKey ?? first?.verificationProfileKey ?? "manual_review",
    capabilities: existing?.capabilities.length ? existing.capabilities : first?.capabilities.length ? first.capabilities : ["project_enquiries"],
    aliases: splitList(form.aliases),
  };
}

function validateForm(form: FormState, data: AdminPartnerServiceCatalogueResponse, mode: Mode) {
  if (!form.name.trim()) return "Enter a domain name.";
  if (!form.shortDescription.trim()) return "Enter a short description.";
  if (!form.domainId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.domainId)) return "Use a valid domain reference.";
  if (splitList(form.countries).some((country) => !/^[A-Z]{2}$/.test(country.toUpperCase()))) return "Use two-letter country codes.";
  if (!form.individualAllowed && !form.organizationAllowed) return "Allow at least one Partner eligibility type.";
  if (mode === "new" && data.draft.items.some((item) => item.domain === form.domainId)) return "A domain with this name already exists.";
  return "";
}

function emptyForm(domainId?: string): FormState {
  return {
    domainId: domainId ?? "",
    name: "",
    shortDescription: "",
    icon: "briefcase",
    displayOrder: "",
    status: "inactive",
    countries: defaultCountries,
    individualAllowed: true,
    organizationAllowed: true,
    availableInApplications: false,
    aliases: "",
  };
}

function domainRootItem(items: AdminPartnerServiceCatalogueItem[], domainId: string) {
  return items.find((item) => item.domain === domainId && !item.parentCode && !item.applicationSelectable && (item.stableCode === `${domainId}-root` || slugify(item.name) === domainId));
}

function firstDomainItem(items: AdminPartnerServiceCatalogueItem[], domainId: string) {
  return items.filter((item) => item.domain === domainId).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))[0];
}

function nextDomainOrder(items: AdminPartnerServiceCatalogueItem[]) {
  return Math.max(0, ...items.map((item) => item.displayOrder)) + 100;
}

function domainTitle(id: string, item?: AdminPartnerServiceCatalogueItem) {
  return domainRootItem([item].filter(Boolean) as AdminPartnerServiceCatalogueItem[], id)?.name ?? partnerServiceCatalog.find((domain) => domain.id === id)?.title ?? titleize(id);
}

function domainDescription(id: string) {
  return partnerServiceCatalog.find((domain) => domain.id === id)?.description ?? "Additional Partner services and emerging service areas.";
}

function domainIcon(id: string) {
  return id ? "briefcase" : "briefcase";
}

function workflowLabel(state: string) {
  if (state === "in_review") return "In Review";
  if (state === "changes_requested") return "Changes Requested";
  return state.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleize(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3"><h3 className="text-base font-black text-sky-100">{title}</h3><div className="grid gap-3 lg:grid-cols-2">{children}</div></section>;
}

function Field({ label, value, onChange, disabled, helper, multiline }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; helper?: string; multiline?: boolean }) {
  return <label className={multiline ? "block lg:col-span-2" : "block"}><span className="text-xs font-black uppercase text-slate-400">{label}</span>{multiline ? <textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /> : <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" />}{helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}</label>;
}

function SelectField({ label, value, onChange, disabled, options }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; options: string[][] }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60">{options.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#07111f] p-3 text-sm font-bold text-slate-200"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-sky-300 text-sky-500 focus:ring-sky-400" />{label}</label>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#07111f] p-3"><p className="text-[11px] font-black uppercase text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-200">{value}</p></div>;
}

function Chip({ label, tone = "slate" }: { label: string; tone?: "cyan" | "green" | "orange" | "violet" | "slate" }) {
  const className = tone === "green" ? "border-emerald-300/25 bg-emerald-500/12 text-emerald-100" : tone === "orange" ? "border-orange-300/30 bg-orange-500/12 text-orange-100" : tone === "violet" ? "border-indigo-300/25 bg-indigo-500/12 text-indigo-100" : tone === "cyan" ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-100" : "border-slate-300/15 bg-slate-400/10 text-slate-200";
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function MessageBox({ message }: { message: Message }) {
  return <div role="status" className={`rounded-xl border p-3 text-sm font-bold ${message.tone === "success" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" : message.tone === "error" ? "border-orange-300/40 bg-orange-500/10 text-orange-100" : "border-sky-300/30 bg-sky-400/10 text-sky-100"}`}>{message.text}</div>;
}

function StatePanel({ icon: Icon, title, text, action, spin }: { icon: typeof Loader2; title: string; text: string; action?: ReactNode; spin?: boolean }) {
  return <section className="rounded-2xl border border-sky-300/15 bg-[#07111f] p-8 text-slate-100"><Icon className={spin ? "animate-spin text-sky-300" : "text-orange-300"} size={28} /><h2 className="mt-4 text-2xl font-black text-sky-100">{title}</h2><p className="mt-2 text-sm text-slate-400">{text}</p>{action ? <div className="mt-4">{action}</div> : null}</section>;
}

function EditorStyles() {
  return <style>{`
    .editorButton { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.12); padding: 0.625rem 0.875rem; font-size: 0.875rem; font-weight: 900; transition: border-color 150ms ease, background-color 150ms ease; }
    .editorButton:focus-visible { outline: 2px solid rgb(125,211,252); outline-offset: 2px; }
    .editorButton:disabled { cursor: not-allowed; opacity: 0.55; }
    .editorButton.primary { background: linear-gradient(135deg, #0284c7, #2563eb); color: #f8fafc; box-shadow: 0 14px 30px rgba(37,99,235,0.22); }
    .editorButton.secondary { background: rgba(15,23,42,0.72); color: #dbeafe; border-color: rgba(125,211,252,0.22); }
    .editorButton.publish { background: linear-gradient(135deg, #f97316, #2563eb); color: #fff7ed; box-shadow: 0 14px 30px rgba(249,115,22,0.20); }
    .editorButton.danger { background: rgba(154,52,18,0.22); color: #fed7aa; border-color: rgba(251,146,60,0.30); }
  `}</style>;
}
