"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Eye, FilePenLine, Loader2, MoreHorizontal, RefreshCcw, Save, Send, Trash2, XCircle } from "lucide-react";
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
type ServiceStatus = "active" | "inactive" | "archived";
type FormState = {
  stableCode: string;
  domainId: string;
  parentCode: string;
  name: string;
  shortDescription: string;
  icon: string;
  displayOrder: string;
  status: ServiceStatus;
  countries: string;
  individualAllowed: boolean;
  organizationAllowed: boolean;
  applicationSelectable: boolean;
  serviceApprovalRequired: boolean;
  aliases: string;
  verificationProfileKey: string;
  capabilities: string;
};

const serviceCatalogueHref = "/admin/website-experience/pages/partner/service-catalogue";
const defaultCountries = "IN, AE, US, CA, GB, AU, SG";

export function AdminPartnerServiceCatalogueServiceEditorClient({
  mode,
  domainId,
  serviceId,
  parentCode,
}: {
  mode: Mode;
  domainId?: string;
  serviceId?: string;
  parentCode?: string;
}) {
  const [data, setData] = useState<AdminPartnerServiceCatalogueResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [publishNote, setPublishNote] = useState("");
  const [form, setForm] = useState<FormState>(() => emptyForm(domainId, parentCode));
  const [original, setOriginal] = useState<FormState>(() => emptyForm(domainId, parentCode));

  const load = useCallback(async () => {
    setLoadState("loading");
    const result = await getAdminPartnerServiceCatalogue();
    if (!result.ok) {
      setLoadState("error");
      setMessage({ tone: "error", text: result.error.message || "We couldn't load this service." });
      return;
    }
    const resolved = resolveServiceForm(result.data, mode, domainId, serviceId, parentCode);
    if (!resolved && mode === "edit") {
      setLoadState("error");
      setMessage({ tone: "error", text: "We couldn't load this service." });
      return;
    }
    setData(result.data);
    setForm(resolved ?? emptyForm(domainId, parentCode));
    setOriginal(resolved ?? emptyForm(domainId, parentCode));
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1") setPreview(true);
    setLoadState("ready");
  }, [domainId, mode, parentCode, serviceId]);

  useEffect(() => {
    // Initial API hydration for this dedicated Admin route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const serviceName = form.name.trim() || "New Service";
  const workflowState = data?.workflowState ?? "published";
  const activeWorkflow = Boolean(data?.hasUnpublishedChanges && data.review?.itemCode === form.stableCode);
  const canManage = Boolean(data?.permissions.canManage);
  const canPublish = Boolean(data?.permissions.canPublish);
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(original);
  const domainName = data ? domainTitle(form.domainId, data.draft.items) : domainTitle(form.domainId);
  const serviceHref = `${serviceCatalogueHref}?domain=${encodeURIComponent(form.domainId)}&service=${encodeURIComponent(form.stableCode)}`;
  const domainHref = `${serviceCatalogueHref}?domain=${encodeURIComponent(form.domainId)}`;
  const backHref = mode === "edit" ? serviceHref : domainHref;
  const backLabel = mode === "edit" ? `Back to ${serviceName}` : `Back to ${domainName}`;
  const statusLabel = activeWorkflow ? workflowLabel(workflowState) : mode === "new" ? "Not Live" : form.status === "archived" ? "Archived" : "Published";
  const submitLabel = workflowState === "changes_requested" ? "Resubmit for Approval" : "Send for Approval";
  const domainItems = useMemo(() => (data?.draft.items ?? []).filter((item) => item.domain === form.domainId), [data, form.domainId]);
  const placementOptions = useMemo(() => placementChoices(domainItems, form.stableCode), [domainItems, form.stableCode]);
  const confirmLeave = () => !hasUnsavedChanges || window.confirm("Discard unsaved changes and leave this service editor?");

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
    setMessage({ tone: "info", text: "Saving service draft..." });
    const item = buildServiceItem(form, data);
    const result = await saveAdminPartnerServiceCatalogueDraft({
      item,
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Saved service draft for ${item.name}`,
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
    const savedForm = resolveServiceForm(confirmed.data, "edit", item.domain, item.stableCode, item.parentCode) ?? formFromItem(item);
    setData(confirmed.data);
    setForm(savedForm);
    setOriginal(savedForm);
    setPreview(false);
    if (mode === "new") window.history.replaceState(null, "", `/admin/website-experience/pages/partner/service-catalogue/services/${encodeURIComponent(item.stableCode)}/edit`);
    setMessage({ tone: "success", text: `Service draft saved. ${item.name} · Draft v${confirmed.data.draftVersion}. Next action: Send for Approval.` });
  }

  async function submitForApproval() {
    if (!data) return;
    setBusy("submit");
    const result = await submitAdminPartnerServiceCatalogueApproval({
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Sent service draft for approval: ${serviceName}`,
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
      ? await approveAdminPartnerServiceCatalogueDraft({ expectedDraftVersion: data.draftVersion, changeSummary: `Approved service draft: ${serviceName}`, note: reviewNote })
      : await requestAdminPartnerServiceCatalogueChanges({ expectedDraftVersion: data.draftVersion, changeSummary: `Requested changes for service draft: ${serviceName}`, note: reviewNote });
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
      changeSummary: `Published Service Catalogue snapshot containing ${serviceName}`,
      reason: publishNote,
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "Publish failed." });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: `${serviceName} is now available in the published catalogue.` });
  }

  async function deleteDraft() {
    if (!data || !form.stableCode) return;
    const confirmed = window.confirm(mode === "new" ? "Delete this service draft? This removes only the unpublished draft Service." : "Delete this service draft? This removes only the unpublished draft. The published Service Catalogue will remain unchanged.");
    if (!confirmed) return;
    setBusy("delete");
    const result = await deleteAdminPartnerServiceCatalogueDraftItem(form.stableCode, {
      expectedDraftVersion: data.draftVersion,
      changeSummary: `Deleted service draft for ${serviceName}`,
    });
    setBusy("");
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error.message || "We couldn't delete this draft." });
      return;
    }
    setData(result.data);
    setMessage({ tone: "success", text: "Draft deleted. Published catalogue content remains unchanged." });
    window.location.assign(domainHref);
  }

  if (loadState === "loading") return <StatePanel icon={Loader2} spin title="Loading service..." text="Preparing the service workflow." />;
  if (loadState === "error" || !data) {
    return <StatePanel icon={XCircle} title="We couldn't load this service." text="Please try again." action={<div className="flex flex-wrap gap-2"><AdminBackButton href={domainHref} label="Back to Service Catalogue" /><button type="button" onClick={load} className="editorButton secondary"><RefreshCcw size={16} /> Retry</button></div>} />;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#07111f] p-4 text-slate-100 shadow-2xl shadow-sky-950/30 lg:p-6">
      <EditorStyles />
      <div className="rounded-2xl border border-sky-300/15 bg-[#0b1628]/95 p-4 shadow-lg shadow-black/15">
        <AdminBackButton href={backHref} label={backLabel} />
        <Breadcrumb mode={mode} domainName={domainName} domainHref={domainHref} serviceName={serviceName} serviceHref={serviceHref} />
        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-cyan-100">{mode === "new" ? "Add Service" : "Edit Service"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{mode === "new" ? "Add a service to this domain." : "Update this service."}</p>
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
        <main className="min-w-0 space-y-4">
          <ActionBar
            canManage={canManage}
            canPublish={canPublish}
            busy={busy}
            workflowState={workflowState}
            activeWorkflow={activeWorkflow}
            hasUnsavedChanges={hasUnsavedChanges}
            submitLabel={submitLabel}
            reviewNote={reviewNote}
            publishNote={publishNote}
            onReviewNoteChange={setReviewNote}
            onPublishNoteChange={setPublishNote}
            onPreview={() => setPreview(true)}
            onSave={saveDraft}
            onSubmit={submitForApproval}
            onApprove={() => review("approve")}
            onRequestChanges={() => review("request")}
            onPublish={publish}
            onDelete={deleteDraft}
            confirmLeave={confirmLeave}
            cancelHref={backHref}
          />
          {preview ? (
            <PreviewPanel form={form} domainName={domainName} statusLabel={statusLabel} onBack={() => setPreview(false)} onSave={saveDraft} busy={busy} canManage={canManage} />
          ) : (
            <ServiceForm form={form} setForm={setForm} disabled={!canManage || ["in_review", "approved"].includes(workflowState)} placementOptions={placementOptions} capabilityOptions={data.schema.capabilities} mode={mode} />
          )}
        </main>
        <aside className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4">
            <h3 className="text-base font-black text-sky-100">Workflow</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Save as Draft keeps the published catalogue unchanged. Send for Approval moves this service change into the common review queue.</p>
            {data.review?.note ? <p className="mt-3 rounded-xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-bold text-orange-100">Review note: {data.review.note}</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-[#0b1628] p-4">
            <h3 className="text-base font-black text-sky-100">Publish Scope</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Publishing uses the approved Service Catalogue snapshot. This workflow record identifies the service change included in that snapshot.</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ServiceForm(props: {
  form: FormState;
  setForm: (value: FormState | ((current: FormState) => FormState)) => void;
  disabled: boolean;
  placementOptions: string[][];
  capabilityOptions: string[];
  mode: Mode;
}) {
  const update = (patch: Partial<FormState>) => props.setForm((current) => ({ ...current, ...patch }));
  return (
    <form className="space-y-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4" onSubmit={(event) => event.preventDefault()}>
      <FormSection title="Basic Information">
        <Field label="Service name" value={props.form.name} onChange={(value) => update({ name: value })} disabled={props.disabled} />
        <Field label="Short description" value={props.form.shortDescription} onChange={(value) => update({ shortDescription: value })} disabled={props.disabled} multiline />
        <Field label="Icon" value={props.form.icon} onChange={(value) => update({ icon: value })} disabled={props.disabled} helper="Use the existing icon name used by the catalogue." />
        <Field label="Display order" value={props.form.displayOrder} onChange={(value) => update({ displayOrder: value.replace(/[^0-9]/g, "") })} disabled={props.disabled} />
      </FormSection>
      <FormSection title="Placement">
        <SelectField label="Domain" value={props.form.domainId} onChange={(value) => update({ domainId: value, parentCode: "" })} disabled={props.disabled || props.mode === "edit"} options={partnerServiceCatalog.map((domain) => [domain.id, domain.title])} />
        <SelectField label="Category or parent" value={props.form.parentCode} onChange={(value) => update({ parentCode: value })} disabled={props.disabled} options={[["", "No parent"], ...props.placementOptions]} />
      </FormSection>
      <FormSection title="Availability">
        <SelectField label="Lifecycle state" value={props.form.status} onChange={(value) => update({ status: value as ServiceStatus, applicationSelectable: value === "active" })} disabled={props.disabled} options={[["active", "Active"], ["inactive", "Inactive"], ["archived", "Archived"]]} />
        <Field label="Country availability" value={props.form.countries} onChange={(value) => update({ countries: value.toUpperCase() })} disabled={props.disabled} helper="Comma-separated country codes." />
        <Toggle label="Available in Partner applications" checked={props.form.applicationSelectable} onChange={(value) => update({ applicationSelectable: value, status: value ? "active" : "inactive" })} disabled={props.disabled} />
      </FormSection>
      <FormSection title="Partner Eligibility">
        <Toggle label="Individual Partners" checked={props.form.individualAllowed} onChange={(value) => update({ individualAllowed: value })} disabled={props.disabled} />
        <Toggle label="Business or organization Partners" checked={props.form.organizationAllowed} onChange={(value) => update({ organizationAllowed: value })} disabled={props.disabled} />
      </FormSection>
      <FormSection title="Search & Discovery">
        <Field label="Search aliases" value={props.form.aliases} onChange={(value) => update({ aliases: value })} disabled={props.disabled} helper="Comma-separated search terms." />
      </FormSection>
      <FormSection title="Policy Mapping">
        <SelectField label="Review profile" value={props.form.verificationProfileKey} onChange={(value) => update({ verificationProfileKey: value })} disabled={props.disabled} options={[["manual_review", "Manual review"], ["business_license_review", "Business license review"], ["medical_provider_review", "Medical provider review"], ["travel_partner_review", "Travel partner review"]]} />
        <Field label="Enabled capabilities" value={props.form.capabilities} onChange={(value) => update({ capabilities: value })} disabled={props.disabled} helper={props.capabilityOptions.length ? `Supported: ${props.capabilityOptions.join(", ")}` : "Comma-separated capability labels."} />
        <Toggle label="Partner request requires review" checked={props.form.serviceApprovalRequired} onChange={(value) => update({ serviceApprovalRequired: value })} disabled={props.disabled} />
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
  publishNote: string;
  onReviewNoteChange: (value: string) => void;
  onPublishNoteChange: (value: string) => void;
  onPreview: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onPublish: () => void;
  onDelete: () => void;
  confirmLeave: () => boolean;
  cancelHref: string;
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
          <Link href={props.cancelHref} onClick={(event) => { if (!props.confirmLeave()) event.preventDefault(); }} className="editorButton secondary">Cancel</Link>
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
          <textarea value={props.publishNote} onChange={(event) => props.onPublishNoteChange(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20" placeholder="Optional publication note" />
        </label>
      ) : null}
    </section>
  );
}

function PreviewPanel({ form, domainName, statusLabel, onBack, onSave, busy, canManage }: { form: FormState; domainName: string; statusLabel: string; onBack: () => void; onSave: () => void; busy: string; canManage: boolean }) {
  return (
    <section className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[#0b1628] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-orange-200">Preview</p>
          <h3 className="mt-1 text-2xl font-black text-cyan-100">{form.name || "New Service"}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{form.shortDescription || "Service description will appear here."}</p>
        </div>
        <Chip label="Not Live" tone="orange" />
      </div>
      <div className="rounded-xl border border-white/10 bg-[#07111f] p-3">
        <p className="text-xs font-black uppercase text-slate-500">Partner Step 4 service card</p>
        <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-[#0d1b31] p-4">
          <div className="flex flex-wrap gap-2">
            <Chip label={domainName} tone="cyan" />
            <Chip label={form.applicationSelectable ? "Available" : "Not available"} tone={form.applicationSelectable ? "green" : "slate"} />
            <Chip label={statusLabel} tone="cyan" />
          </div>
          <h4 className="mt-3 text-xl font-black text-slate-100">{form.name || "New Service"}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">{form.shortDescription || "Service description will appear here."}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Detail label="Domain" value={domainName} />
        <Detail label="Placement" value={form.parentCode ? "Nested under selected parent" : "Domain level"} />
        <Detail label="Country availability" value={form.countries || "All configured"} />
        <Detail label="Partner eligibility" value={`${form.individualAllowed ? "Individual" : ""}${form.individualAllowed && form.organizationAllowed ? " / " : ""}${form.organizationAllowed ? "Business or organization" : ""}` || "Not configured"} />
        <Detail label="Application availability" value={form.applicationSelectable ? "Available" : "Not available"} />
        <Detail label="Search terms" value={form.aliases || "No aliases added"} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className="editorButton secondary"><FilePenLine size={16} /> Back to Editing</button>
        <button type="button" disabled={!canManage || busy === "save"} onClick={onSave} className="editorButton primary"><Save size={16} /> Save as Draft</button>
      </div>
    </section>
  );
}

function Breadcrumb({ mode, domainName, domainHref, serviceName, serviceHref }: { mode: Mode; domainName: string; domainHref: string; serviceName: string; serviceHref: string }) {
  const items = [
    { label: "Website Experience", href: "/admin/website-experience" },
    { label: "Pages", href: "/admin/website-experience/pages" },
    { label: "Partner", href: "/admin/website-experience/pages/partner" },
    { label: "Service Catalogue", href: serviceCatalogueHref },
    { label: domainName, href: domainHref },
    ...(mode === "edit" ? [{ label: serviceName, href: serviceHref }] : []),
    { label: mode === "new" ? "Add Service" : "Edit" },
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

function resolveServiceForm(data: AdminPartnerServiceCatalogueResponse, mode: Mode, domainId?: string, serviceId?: string, parentCode?: string): FormState | null {
  if (mode === "new") return emptyForm(domainId, parentCode);
  if (!serviceId) return null;
  const item = data.draft.items.find((candidate) => candidate.stableCode === serviceId);
  return item ? formFromItem(item) : null;
}

function formFromItem(item: AdminPartnerServiceCatalogueItem): FormState {
  return {
    stableCode: item.stableCode,
    domainId: item.domain,
    parentCode: item.parentCode ?? "",
    name: item.name,
    shortDescription: item.shortDescription,
    icon: item.icon,
    displayOrder: String(item.displayOrder ?? 0),
    status: item.status,
    countries: item.countries.join(", "),
    individualAllowed: item.individualAllowed,
    organizationAllowed: item.organizationAllowed,
    applicationSelectable: item.applicationSelectable,
    serviceApprovalRequired: item.serviceApprovalRequired,
    aliases: item.aliases.join(", "),
    verificationProfileKey: item.verificationProfileKey || "manual_review",
    capabilities: item.capabilities.join(", ") || "project_enquiries",
  };
}

function buildServiceItem(form: FormState, data: AdminPartnerServiceCatalogueResponse): AdminPartnerServiceCatalogueItem {
  const existing = form.stableCode ? data.draft.items.find((item) => item.stableCode === form.stableCode) : undefined;
  const stableCode = existing?.stableCode ?? uniqueStableCode(`${form.domainId}-${slugify(form.name)}`, data.draft.items);
  return {
    id: existing?.id ?? `svc_${stableCode}`,
    stableCode,
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    domain: form.domainId,
    parentCode: form.parentCode || undefined,
    icon: form.icon.trim() || "briefcase",
    displayOrder: Number.parseInt(form.displayOrder, 10) || nextOrder(data.draft.items, form.domainId),
    status: form.applicationSelectable ? "active" : form.status,
    published: Boolean(existing?.published),
    countries: splitList(form.countries).map((value) => value.toUpperCase()),
    individualAllowed: form.individualAllowed,
    organizationAllowed: form.organizationAllowed,
    applicationSelectable: form.applicationSelectable,
    serviceApprovalRequired: form.serviceApprovalRequired,
    verificationProfileKey: form.verificationProfileKey.trim() || existing?.verificationProfileKey || "manual_review",
    capabilities: splitList(form.capabilities),
    aliases: splitList(form.aliases),
  };
}

function validateForm(form: FormState, data: AdminPartnerServiceCatalogueResponse, mode: Mode) {
  if (!form.domainId) return "Choose a domain.";
  if (!form.name.trim()) return "Enter a service name.";
  if (!form.shortDescription.trim()) return "Enter a short description.";
  if (splitList(form.countries).some((country) => !/^[A-Z]{2}$/.test(country.toUpperCase()))) return "Use two-letter country codes.";
  if (!form.individualAllowed && !form.organizationAllowed) return "Allow at least one Partner eligibility type.";
  if (!splitList(form.capabilities).length) return "Add at least one enabled capability.";
  if (form.parentCode && !data.draft.items.some((item) => item.domain === form.domainId && item.stableCode === form.parentCode)) return "Choose an existing parent in this domain.";
  const generatedCode = `${form.domainId}-${slugify(form.name)}`;
  if (mode === "new" && data.draft.items.some((item) => item.stableCode === generatedCode)) return "A service with this name already exists in this domain.";
  return "";
}

function emptyForm(domainId?: string, parentCode?: string): FormState {
  return {
    stableCode: "",
    domainId: domainId ?? partnerServiceCatalog[0]?.id ?? "",
    parentCode: parentCode ?? "",
    name: "",
    shortDescription: "",
    icon: "briefcase",
    displayOrder: "",
    status: "inactive",
    countries: defaultCountries,
    individualAllowed: true,
    organizationAllowed: true,
    applicationSelectable: false,
    serviceApprovalRequired: true,
    aliases: "",
    verificationProfileKey: "manual_review",
    capabilities: "project_enquiries",
  };
}

function placementChoices(items: AdminPartnerServiceCatalogueItem[], stableCode: string) {
  return items
    .filter((item) => item.stableCode !== stableCode && !isDomainRootItem(item))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .map((item) => [item.stableCode, item.name]);
}

function isDomainRootItem(item: AdminPartnerServiceCatalogueItem) {
  const domain = partnerServiceCatalog.find((candidate) => candidate.id === item.domain);
  return !item.parentCode && !item.applicationSelectable && (item.stableCode === `${item.domain}-root` || normalize(item.name) === normalize(domain?.title ?? ""));
}

function nextOrder(items: AdminPartnerServiceCatalogueItem[], domainId: string) {
  return Math.max(0, ...items.filter((item) => item.domain === domainId).map((item) => item.displayOrder)) + 1;
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

function domainTitle(id: string, items: AdminPartnerServiceCatalogueItem[] = []) {
  const root = items.find((item) => item.domain === id && isDomainRootItem(item));
  return root?.name ?? partnerServiceCatalog.find((domain) => domain.id === id)?.title ?? titleize(id);
}

function workflowLabel(state: string) {
  if (state === "in_review") return "In Review";
  if (state === "changes_requested") return "Changes Requested";
  return titleize(state.replace(/_/g, "-"));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleize(value: string) {
  return value.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3"><h3 className="text-base font-black text-sky-100">{title}</h3><div className="grid gap-3 lg:grid-cols-2">{children}</div></section>;
}

function Field({ label, value, onChange, disabled, helper, multiline }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; helper?: string; multiline?: boolean }) {
  return <label className={multiline ? "block lg:col-span-2" : "block"}><span className="text-xs font-black uppercase text-slate-400">{label}</span>{multiline ? <textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" /> : <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60" />}{helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}</label>;
}

function SelectField({ label, value, onChange, disabled, options }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; options: string[][] }) {
  return <label className="block"><span className="text-xs font-black uppercase text-slate-400">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-sky-300/15 bg-[#07111f] px-3 text-sm text-slate-100 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60">{options.map(([id, label]) => <option key={id || "empty"} value={id}>{label}</option>)}</select></label>;
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
