"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  Clock3,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Tablet,
  Upload,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  cancelAdminWebsiteExperienceSchedule,
  getAdminWebsiteExperienceLoginSignup,
  publishAdminWebsiteExperienceContext,
  saveAdminWebsiteExperienceDraft,
  scheduleAdminWebsiteExperienceContext,
  uploadAdminWebsiteExperienceMedia,
  type AdminApiError,
  type PartnerRegistrationIntakeView,
  type WebsiteExperienceAdminContext,
  type WebsiteExperienceAdminResponse,
  type WebsiteExperienceBenefit,
  type WebsiteExperienceContent,
  type WebsiteExperienceContext,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: WebsiteExperienceAdminResponse | null; error: null }
  | { status: "ready"; data: WebsiteExperienceAdminResponse; error: null }
  | { status: "error"; data: WebsiteExperienceAdminResponse | null; error: AdminApiError };

type BlockKey = "brand" | "hero" | "copy" | "benefits" | "trust" | "workflow";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const blocks: Array<{ key: BlockKey; label: string; detail: string; icon: LucideIcon; tone: string }> = [
  { key: "brand", label: "Brand", detail: "Logo, brand label, and alt text", icon: BadgeCheck, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  { key: "hero", label: "Hero Images", detail: "Desktop and mobile artwork", icon: ImageIcon, tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  { key: "copy", label: "Headline & Copy", detail: "Eyebrow, headline, highlight, subtitle", icon: FileText, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  { key: "benefits", label: "Benefits", detail: "Up to four compact benefit rows", icon: Layers3, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { key: "trust", label: "Trust / Footer", detail: "Footer line and active status", icon: ShieldCheck, tone: "bg-violet-50 text-violet-700 border-violet-100" },
  { key: "workflow", label: "Workflow", detail: "Save draft, schedule, publish now", icon: CalendarClock, tone: "bg-slate-50 text-slate-700 border-slate-200" },
];

const mediaSlots = {
  brand: "auth_promo_brand_image",
  desktop: "auth_promo_desktop_hero",
  mobile: "auth_promo_mobile_hero",
};

const defaultSchedule = {
  date: "",
  time: "",
  endDate: "",
  endTime: "",
  timezone: "Asia/Kolkata",
};

const contextLabels: Record<WebsiteExperienceContext, string> = {
  user_login: "User Login",
  partner_login: "Partner Login",
  partner_registration: "Partner Registration",
  partner_application: "Partner Application",
};

export function WebsiteExperienceManager() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [activeContext, setActiveContext] = useState<WebsiteExperienceContext>("user_login");
  const [activeBlock, setActiveBlock] = useState<BlockKey>("brand");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [drafts, setDrafts] = useState<Partial<Record<WebsiteExperienceContext, WebsiteExperienceContent>>>({});
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const load = useCallback(async () => {
    const result = await getAdminWebsiteExperienceLoginSignup();
    if (!result.ok) {
      setState({ status: "error", data: null, error: result.error });
      return;
    }
    setState({ status: "ready", data: result.data, error: null });
    setDrafts(Object.fromEntries(result.data.contexts.map((item) => [item.context, item.draftContent])));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const activeDraft = drafts[activeContext];
  const contextRows = state.data?.contexts ?? [];
  const activeRow = contextRows.find((item) => item.context === activeContext);
  const permissions = state.data?.permissions;
  const canWrite = Boolean(permissions?.canWrite);
  const canPublish = Boolean(permissions?.canPublish);

  const updateDraft = (patch: Partial<WebsiteExperienceContent>) => {
    if (!activeDraft) return;
    setDrafts((current) => ({
      ...current,
      [activeContext]: { ...activeDraft, ...patch },
    }));
  };

  const updateBenefit = (index: number, patch: Partial<WebsiteExperienceBenefit>) => {
    if (!activeDraft) return;
    const benefits = [...activeDraft.benefits];
    benefits[index] = { ...benefits[index], ...patch };
    updateDraft({ benefits });
  };

  const applyUploadedMedia = (media: { slot: string; url: string; altText?: string }) => {
    if (!activeDraft) return;
    if (media.slot === mediaSlots.brand) {
      updateDraft({ brandLogoImage: media.url, brandLogoAlt: media.altText || activeDraft.brandLogoAlt });
      return;
    }
    if (media.slot === mediaSlots.desktop) {
      updateDraft({ desktopImage: media.url, desktopImageAlt: media.altText || activeDraft.desktopImageAlt });
      return;
    }
    if (media.slot === mediaSlots.mobile) {
      updateDraft({ mobileImage: media.url, mobileImageAlt: media.altText || activeDraft.mobileImageAlt });
    }
  };

  const saveDraft = async () => {
    if (!activeDraft) return;
    setBusyAction("save");
    setMessage("");
    const result = await saveAdminWebsiteExperienceDraft(activeContext, activeDraft);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Draft saved. Public Login & Signup stays unchanged until Publish Now or the scheduled time.");
    void load();
  };

  const publish = async () => {
    setBusyAction("publish");
    setMessage("");
    const result = await publishAdminWebsiteExperienceContext(activeContext);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Published now. The public Login & Signup content uses this version.");
    void load();
  };

  const schedulePublish = async () => {
    const publishAt = buildIso(schedule.date, schedule.time);
    const endAt = schedule.endDate && schedule.endTime ? buildIso(schedule.endDate, schedule.endTime) : undefined;
    if (!publishAt) {
      setMessage("Choose a publish date and time before scheduling.");
      return;
    }
    setBusyAction("schedule");
    setMessage("");
    const result = await scheduleAdminWebsiteExperienceContext(activeContext, {
      publishAt,
      ...(endAt ? { endAt } : {}),
      timezone: schedule.timezone,
    });
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Scheduled. Current published content stays live until the scheduled time.");
    void load();
  };

  const cancelSchedule = async () => {
    setBusyAction("cancel-schedule");
    setMessage("");
    const result = await cancelAdminWebsiteExperienceSchedule(activeContext);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Schedule cancelled. The current published version remains live.");
    void load();
  };

  if (state.status === "loading" && !state.data) return <PanelNotice text="Loading Website Experience..." />;
  if (state.status === "error") return <PanelNotice tone="danger" text={state.error.message} />;
  if (!state.data || !activeDraft || !activeRow) return null;

  return (
    <section className="space-y-5">
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <Breadcrumbs activeContext={contextLabels[activeContext]} activeBlock={blocks.find((block) => block.key === activeBlock)?.label ?? "Brand"} />
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-700">Global Experience / Login & Signup</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Login & Signup</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Manage shared login presentation used across TPL GO. Auth behavior, OTP, RBAC, and provider settings stay locked outside this editor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusChip label={`Draft v${activeRow.draftVersion}`} tone="draft" />
            <StatusChip label={`Published v${activeRow.publishedVersion}`} tone="published" />
            {activeRow.scheduledFor ? <StatusChip label={`Scheduled ${formatDateTime(activeRow.scheduledFor)}`} tone="scheduled" /> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[18rem_minmax(0,1fr)_28rem] xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase text-slate-500">Contexts</p>
            <div className="space-y-2">
              {contextRows.map((item) => (
                <button
                  key={item.context}
                  type="button"
                  onClick={() => {
                    setActiveContext(item.context);
                    setActiveBlock("brand");
                  }}
                  className={`w-full rounded border px-3 py-3 text-left text-sm font-semibold ${
                    item.context === activeContext ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {contextLabels[item.context]}
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    {item.scheduledFor ? "Scheduled" : item.draftVersion > item.publishedVersion ? "Draft changes" : "Published"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase text-slate-500">Blocks</p>
            <div className="space-y-2">
              {blocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.key}
                    type="button"
                    onClick={() => setActiveBlock(block.key)}
                    className={`w-full rounded border px-3 py-3 text-left ${activeBlock === block.key ? block.tone : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {block.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{block.detail}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <BlockEditor
              block={activeBlock}
              content={activeDraft}
              canWrite={canWrite}
              canPublish={canPublish}
              schedule={schedule}
              activeRow={activeRow}
              busyAction={busyAction}
              message={message}
              onContentChange={updateDraft}
              onBenefitChange={updateBenefit}
              onUploaded={applyUploadedMedia}
              onScheduleChange={setSchedule}
              onSaveDraft={saveDraft}
              onPublish={publish}
              onSchedule={schedulePublish}
              onCancelSchedule={cancelSchedule}
            />
          </section>

          <PartnerRegistrationIntakes rows={state.data.partnerRegistrationIntakes} />
        </div>

        <aside className="space-y-4 xl:col-span-2 2xl:col-span-1">
          <PreviewPanel content={activeDraft} device={previewDevice} onDeviceChange={setPreviewDevice} />
          <LockedSecurity fields={state.data.schema.lockedSecurityFields} />
          <AuditList rows={state.data.recentAudit} />
        </aside>
      </div>
    </section>
  );
}

function Breadcrumbs({ activeContext, activeBlock }: { activeContext: string; activeBlock: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Website Experience breadcrumbs">
      {["Website Experience", "Global Experience", "Login & Signup", activeContext, activeBlock].map((item, index) => (
        <span key={`${item}:${index}`} className="flex items-center gap-2">
          {index > 0 ? <span className="text-slate-300">&gt;</span> : null}
          <span className={index === 4 ? "text-slate-950" : ""}>{item}</span>
        </span>
      ))}
    </nav>
  );
}

function BlockEditor({
  block,
  content,
  canWrite,
  canPublish,
  schedule,
  activeRow,
  busyAction,
  message,
  onContentChange,
  onBenefitChange,
  onUploaded,
  onScheduleChange,
  onSaveDraft,
  onPublish,
  onSchedule,
  onCancelSchedule,
}: {
  block: BlockKey;
  content: WebsiteExperienceContent;
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  onContentChange: (patch: Partial<WebsiteExperienceContent>) => void;
  onBenefitChange: (index: number, patch: Partial<WebsiteExperienceBenefit>) => void;
  onUploaded: (media: { slot: string; url: string; altText?: string }) => void;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
}) {
  if (content.context === "partner_application") {
    return (
      <PartnerApplicationTreeEditor
        content={content}
        canWrite={canWrite}
        canPublish={canPublish}
        schedule={schedule}
        activeRow={activeRow}
        busyAction={busyAction}
        message={message}
        onContentChange={onContentChange}
        onScheduleChange={onScheduleChange}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        onSchedule={onSchedule}
        onCancelSchedule={onCancelSchedule}
      />
    );
  }

  if (block === "brand") {
    return (
      <EditorSection title="Brand" detail="Manage the brand image slot and fallback label. This is presentation-only media.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Brand label fallback" value={content.brandLabel} maxLength={40} onChange={(value) => onContentChange({ brandLabel: value })} />
          <Field label="Brand image alt text" value={content.brandLogoAlt || ""} maxLength={120} onChange={(value) => onContentChange({ brandLogoAlt: value })} />
        </div>
        <MediaUpload slot={mediaSlots.brand} slotLabel="Brand image / logo" canWrite={canWrite} onUploaded={onUploaded} context={content.context} />
        {content.brandLogoImage ? <ImageReference label="Current brand image" value={content.brandLogoImage} onRemove={() => onContentChange({ brandLogoImage: "" })} /> : null}
      </EditorSection>
    );
  }

  if (block === "hero") {
    return (
      <EditorSection title="Hero Images" detail="Use separate desktop and mobile artwork so crops stay intentional.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Desktop image alt text" value={content.desktopImageAlt || ""} maxLength={120} onChange={(value) => onContentChange({ desktopImageAlt: value })} />
          <Field label="Mobile image alt text" value={content.mobileImageAlt || ""} maxLength={120} onChange={(value) => onContentChange({ mobileImageAlt: value })} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MediaUpload slot={mediaSlots.desktop} slotLabel="Desktop hero image" canWrite={canWrite} onUploaded={onUploaded} context={content.context} />
          <MediaUpload slot={mediaSlots.mobile} slotLabel="Mobile hero image" canWrite={canWrite} onUploaded={onUploaded} context={content.context} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <ImageReference label="Current desktop hero" value={content.desktopImage} onRemove={() => onContentChange({ desktopImage: "" })} />
          <ImageReference label="Current mobile hero" value={content.mobileImage || ""} onRemove={() => onContentChange({ mobileImage: "" })} />
        </div>
      </EditorSection>
    );
  }

  if (block === "copy") {
    return (
      <EditorSection title="Headline & Copy" detail="Keep copy concise so the approved compact login modal cannot be broken by long text.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Eyebrow" value={content.eyebrow} maxLength={64} onChange={(value) => onContentChange({ eyebrow: value })} />
          <Field label="Highlighted text" value={content.highlightedText} maxLength={40} onChange={(value) => onContentChange({ highlightedText: value })} />
        </div>
        <Field label="Headline" value={content.headline} maxLength={80} onChange={(value) => onContentChange({ headline: value })} />
        <Field label="Subtitle" value={content.subtitle} maxLength={180} onChange={(value) => onContentChange({ subtitle: value })} />
      </EditorSection>
    );
  }

  if (block === "benefits") {
    return (
      <EditorSection title="Benefits" detail="Edit compact benefit rows used in the promotional panel.">
        <div className="grid gap-3 lg:grid-cols-2">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Benefit {index + 1}</p>
              <div className="grid gap-3">
                <Field label="Title" value={benefit.title} maxLength={50} onChange={(value) => onBenefitChange(index, { title: value })} />
                <Field label="Supporting text" value={benefit.description} maxLength={90} onChange={(value) => onBenefitChange(index, { description: value })} />
                <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
                  <span>Tone</span>
                  <select value={benefit.tone} onChange={(event) => onBenefitChange(index, { tone: event.target.value as WebsiteExperienceBenefit["tone"] })} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm normal-case text-slate-900">
                    <option value="sky">Sky</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="violet">Violet</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </EditorSection>
    );
  }

  if (block === "trust") {
    return (
      <EditorSection title="Trust / Footer" detail="Control the small trust line and whether this context is active.">
        <Field label="Footer / trust line" value={content.footerTrustLine} maxLength={140} onChange={(value) => onContentChange({ footerTrustLine: value })} />
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={content.active} onChange={(event) => onContentChange({ active: event.target.checked })} />
          Active
        </label>
      </EditorSection>
    );
  }

  return (
    <EditorSection title="Workflow" detail="Save a private draft, publish immediately, or schedule the draft for a future time.">
      <div className="grid gap-3 md:grid-cols-3">
        <WorkflowCard label="Draft" value={`v${activeRow.draftVersion}`} detail="Editable working version" />
        <WorkflowCard label="Published" value={`v${activeRow.publishedVersion}`} detail={activeRow.publishedAt ? formatDateTime(activeRow.publishedAt) : "Default content"} />
        <WorkflowCard label="Scheduled" value={activeRow.scheduledVersion ? `v${activeRow.scheduledVersion}` : "None"} detail={activeRow.scheduledFor ? `${formatDateTime(activeRow.scheduledFor)} ${activeRow.scheduledTimezone || ""}` : "No future publish"} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canWrite || busyAction === "save"} onClick={onSaveDraft} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          <Save className="h-4 w-4" />
          Save Draft
        </button>
        <button type="button" disabled={!canPublish || busyAction === "publish"} onClick={onPublish} className="inline-flex h-10 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-200">
          <Send className="h-4 w-4" />
          Publish Now
        </button>
      </div>
      <div className="rounded border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <CalendarClock className="h-4 w-4" />
          Schedule
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ScheduleField label="Publish date" type="date" value={schedule.date} onChange={(date) => onScheduleChange({ ...schedule, date })} />
          <ScheduleField label="Publish time" type="time" value={schedule.time} onChange={(time) => onScheduleChange({ ...schedule, time })} />
          <Field label="Timezone" value={schedule.timezone} maxLength={64} onChange={(timezone) => onScheduleChange({ ...schedule, timezone })} />
          <ScheduleField label="Optional end date" type="date" value={schedule.endDate} onChange={(endDate) => onScheduleChange({ ...schedule, endDate })} />
          <ScheduleField label="Optional end time" type="time" value={schedule.endTime} onChange={(endTime) => onScheduleChange({ ...schedule, endTime })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={!canPublish || busyAction === "schedule"} onClick={onSchedule} className="inline-flex h-10 items-center gap-2 rounded bg-amber-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-amber-200">
            <Clock3 className="h-4 w-4" />
            Schedule
          </button>
          {activeRow.scheduledFor ? (
            <button type="button" disabled={!canPublish || busyAction === "cancel-schedule"} onClick={onCancelSchedule} className="inline-flex h-10 items-center gap-2 rounded border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
              <XCircle className="h-4 w-4" />
              Cancel Schedule
            </button>
          ) : null}
        </div>
      </div>
      {message ? <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
    </EditorSection>
  );
}

function PartnerApplicationTreeEditor({
  content,
  canWrite,
  canPublish,
  schedule,
  activeRow,
  busyAction,
  message,
  onContentChange,
  onScheduleChange,
  onSaveDraft,
  onPublish,
  onSchedule,
  onCancelSchedule,
}: {
  content: WebsiteExperienceContent;
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  onContentChange: (patch: Partial<WebsiteExperienceContent>) => void;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
}) {
  const tree = content.applicationTree;
  const updateNode = (nodeId: string, patch: Record<string, string>) => {
    if (!tree) return;
    onContentChange({
      applicationTree: {
        ...tree,
        children: tree.children.map((node) => node.id === nodeId ? { ...node, ...patch } : node),
      },
    });
  };
  const updateCta = (nodeId: string, key: string, value: string) => {
    if (!tree) return;
    onContentChange({
      applicationTree: {
        ...tree,
        children: tree.children.map((node) => node.id === nodeId ? { ...node, ctaLabels: { ...node.ctaLabels, [key]: value } } : node),
      },
    });
  };
  const stepFour = tree?.children.find((node) => node.id === "step-4-services");
  return (
    <EditorSection title="Partner Application" detail="Persist safe Partner Application presentation copy in the existing Website Experience content engine.">
      <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        Partner Experience &gt; Partner Application &gt; Application Shell &gt; Step 1-8
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {(tree?.children ?? []).map((node) => (
          <section key={node.id} className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-950">{node.label}</h4>
              <span className="rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">{node.editableFields.length} editable fields</span>
            </div>
            <div className="mt-3 grid gap-3">
              <Field label="Title" value={node.title} maxLength={80} onChange={(value) => updateNode(node.id, { title: value })} />
              <Field label="Subtitle" value={node.subtitle} maxLength={180} onChange={(value) => updateNode(node.id, { subtitle: value })} />
              {node.id === "step-4-services" ? (
                <>
                  <Field label="Helper text" value={node.helperText} maxLength={220} onChange={(value) => updateNode(node.id, { helperText: value })} />
                  <Field label="Right help copy" value={node.rightHelpCopy} maxLength={300} onChange={(value) => updateNode(node.id, { rightHelpCopy: value })} />
                  <Field label="Section description" value={node.sectionDescription} maxLength={260} onChange={(value) => updateNode(node.id, { sectionDescription: value })} />
                  <Field label="Domain introduction copy" value={node.domainIntroductionCopy} maxLength={260} onChange={(value) => updateNode(node.id, { domainIntroductionCopy: value })} />
                  <Field label="Empty-state copy" value={node.emptyStateCopy} maxLength={180} onChange={(value) => updateNode(node.id, { emptyStateCopy: value })} />
                  <Field label="Other-service guidance" value={node.otherServiceGuidance} maxLength={180} onChange={(value) => updateNode(node.id, { otherServiceGuidance: value })} />
                  {Object.entries(node.ctaLabels).map(([key, value]) => (
                    <Field key={key} label={`CTA: ${key}`} value={value} maxLength={60} onChange={(next) => updateCta(node.id, key, next)} />
                  ))}
                </>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {node.lockedFields.slice(0, 6).map((field) => <span key={field} className="rounded bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-800">{field}</span>)}
            </div>
          </section>
        ))}
      </div>
      {stepFour ? <p className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-600">Step 4 preview source: {stepFour.title} - {stepFour.subtitle}</p> : null}
      <WorkflowActions
        canWrite={canWrite}
        canPublish={canPublish}
        schedule={schedule}
        activeRow={activeRow}
        busyAction={busyAction}
        message={message}
        onScheduleChange={onScheduleChange}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        onSchedule={onSchedule}
        onCancelSchedule={onCancelSchedule}
      />
    </EditorSection>
  );
}

function WorkflowActions({
  canWrite,
  canPublish,
  schedule,
  activeRow,
  busyAction,
  message,
  onScheduleChange,
  onSaveDraft,
  onPublish,
  onSchedule,
  onCancelSchedule,
}: {
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <WorkflowCard label="Draft" value={`v${activeRow.draftVersion}`} detail="Editable working version" />
        <WorkflowCard label="Published" value={`v${activeRow.publishedVersion}`} detail={activeRow.publishedAt ? formatDateTime(activeRow.publishedAt) : "Default content"} />
        <WorkflowCard label="Scheduled" value={activeRow.scheduledVersion ? `v${activeRow.scheduledVersion}` : "None"} detail={activeRow.scheduledFor ? `${formatDateTime(activeRow.scheduledFor)} ${activeRow.scheduledTimezone || ""}` : "No future publish"} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canWrite || busyAction === "save"} onClick={onSaveDraft} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          <Save className="h-4 w-4" />
          Save Draft
        </button>
        <button type="button" disabled={!canPublish || busyAction === "publish"} onClick={onPublish} className="inline-flex h-10 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-200">
          <Send className="h-4 w-4" />
          Publish Now
        </button>
      </div>
      <div className="rounded border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <CalendarClock className="h-4 w-4" />
          Schedule
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ScheduleField label="Publish date" type="date" value={schedule.date} onChange={(date) => onScheduleChange({ ...schedule, date })} />
          <ScheduleField label="Publish time" type="time" value={schedule.time} onChange={(time) => onScheduleChange({ ...schedule, time })} />
          <Field label="Timezone" value={schedule.timezone} maxLength={64} onChange={(timezone) => onScheduleChange({ ...schedule, timezone })} />
          <ScheduleField label="Optional end date" type="date" value={schedule.endDate} onChange={(endDate) => onScheduleChange({ ...schedule, endDate })} />
          <ScheduleField label="Optional end time" type="time" value={schedule.endTime} onChange={(endTime) => onScheduleChange({ ...schedule, endTime })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={!canPublish || busyAction === "schedule"} onClick={onSchedule} className="inline-flex h-10 items-center gap-2 rounded bg-amber-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-amber-200">
            <Clock3 className="h-4 w-4" />
            Schedule
          </button>
          {activeRow.scheduledFor ? (
            <button type="button" disabled={!canPublish || busyAction === "cancel-schedule"} onClick={onCancelSchedule} className="inline-flex h-10 items-center gap-2 rounded border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
              <XCircle className="h-4 w-4" />
              Cancel Schedule
            </button>
          ) : null}
        </div>
      </div>
      {message ? <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
    </>
  );
}

function EditorSection({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value.replace(/[<>]/g, ""))} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-blue-500" />
    </label>
  );
}

function ScheduleField({ label, type, value, onChange }: { label: string; type: "date" | "time"; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-blue-500" />
    </label>
  );
}

function MediaUpload({
  context,
  slot,
  slotLabel,
  canWrite,
  onUploaded,
}: {
  context: WebsiteExperienceContext;
  slot: string;
  slotLabel: string;
  canWrite: boolean;
  onUploaded: (media: { slot: string; url: string; altText?: string }) => void;
}) {
  const [altText, setAltText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<WebsiteExperienceAdminResponse["recentMedia"][number] | null>(null);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) return;
    const result = await uploadAdminWebsiteExperienceMedia({
      context,
      slot,
      file,
      altText,
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setUploaded(result.data);
    onUploaded({ slot: result.data.slot, url: result.data.url, altText: result.data.altText });
    setMessage("Uploaded into draft. Save Draft keeps it private until Publish Now or Schedule.");
  };

  return (
    <section className="rounded border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-950">{slotLabel}</h4>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <Field label="Alt text" value={altText} maxLength={120} onChange={setAltText} />
        <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
          <span>Upload image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={!canWrite}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block h-10 w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs normal-case text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-slate-700"
          />
        </label>
        <button type="button" disabled={!canWrite || !file} onClick={upload} className="mt-5 h-10 rounded border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          Upload
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-semibold text-slate-700">{message}</p> : null}
      {uploaded ? (
        <div className="mt-3 flex items-center gap-3 rounded border border-slate-100 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uploaded.url} alt={uploaded.altText || "Uploaded presentation media"} className="h-14 w-20 rounded bg-white object-cover" />
          <div className="min-w-0 text-xs text-slate-600">
            <p className="truncate font-semibold text-slate-900">{uploaded.originalFilename || "Uploaded image"}</p>
            <p>{uploaded.width && uploaded.height ? `${uploaded.width} x ${uploaded.height}px` : "Dimensions unavailable"} - {(uploaded.sizeBytes / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ImageReference({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="truncate text-sm text-slate-700">{value}</p>
      </div>
      <button type="button" onClick={onRemove} className="shrink-0 rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
        Remove
      </button>
    </div>
  );
}

function PreviewPanel({ content, device, onDeviceChange }: { content: WebsiteExperienceContent; device: PreviewDevice; onDeviceChange: (device: PreviewDevice) => void }) {
  const deviceOptions: Array<{ key: PreviewDevice; label: string; icon: LucideIcon }> = [
    { key: "desktop", label: "Desktop", icon: Monitor },
    { key: "tablet", label: "Tablet", icon: Tablet },
    { key: "mobile", label: "Mobile", icon: Smartphone },
  ];
  const frameClass = device === "desktop" ? "max-w-[460px]" : device === "tablet" ? "max-w-[360px]" : "max-w-[230px]";
  return (
    <section className="sticky top-20 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-700" />
          <h4 className="text-sm font-semibold text-slate-950">Live Draft Preview</h4>
        </div>
        <div className="flex rounded border border-slate-200 bg-slate-50 p-1">
          {deviceOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onDeviceChange(option.key)}
                className={`inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-semibold ${device === option.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 rounded bg-slate-100 p-3">
        <div className={`mx-auto overflow-hidden rounded border border-slate-300 bg-white ${frameClass}`}>
          <PromoPreview content={content} compact={device !== "desktop"} />
        </div>
      </div>
    </section>
  );
}

function PromoPreview({ content, compact }: { content: WebsiteExperienceContent; compact: boolean }) {
  if (content.context === "partner_application" && content.applicationTree) {
    const stepFour = content.applicationTree.children.find((node) => node.id === "step-4-services");
    return (
      <div className="min-h-[420px] bg-slate-950 p-4 text-white">
        <p className="text-[10px] font-bold uppercase text-sky-300">{content.applicationTree.root}</p>
        <h5 className={compact ? "mt-2 text-xl font-black" : "mt-2 text-2xl font-black"}>Partner Application</h5>
        <div className="mt-4 space-y-2">
          {content.applicationTree.children.slice(0, compact ? 5 : 9).map((node) => (
            <div key={node.id} className={`rounded border p-2 ${node.id === "step-4-services" ? "border-sky-400 bg-sky-500/15" : "border-white/10 bg-white/5"}`}>
              <b className="block text-xs">{node.label}</b>
              <span className="block text-[11px] text-blue-100">{node.title}</span>
            </div>
          ))}
        </div>
        {stepFour ? <p className="mt-4 rounded bg-white/10 p-2 text-[11px] text-blue-100">{stepFour.subtitle}</p> : null}
      </div>
    );
  }
  const firstImage = compact ? content.mobileImage || content.desktopImage : content.desktopImage || content.mobileImage;
  return (
    <div className="relative min-h-[420px] overflow-hidden bg-slate-900 p-4 text-white">
      {firstImage ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('${firstImage}')` }} /> : null}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-blue-950/65 to-slate-950/80" />
      <div className="relative flex min-h-[390px] flex-col justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {content.brandLogoImage ? <img src={content.brandLogoImage} alt={content.brandLogoAlt || content.brandLabel} className="h-8 w-8 rounded bg-white object-contain p-1" /> : null}
          <span className="text-sm font-black">{content.brandLabel}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-blue-200">{content.eyebrow}</p>
          <h5 className={compact ? "mt-2 text-2xl font-black leading-8" : "mt-2 text-3xl font-black leading-9"}>
            {content.headline} <span className="text-sky-300">{content.highlightedText}</span>
          </h5>
          <p className="mt-2 text-sm leading-6 text-blue-100">{content.subtitle}</p>
        </div>
        <div className="space-y-2">
          {content.benefits.slice(0, compact ? 3 : 4).map((benefit) => (
            <div key={`${benefit.title}:${benefit.tone}`} className="flex items-center gap-2 rounded border border-white/15 bg-white/10 p-2">
              <span className={["h-7 w-7 rounded", toneClass(benefit.tone)].join(" ")} />
              <span><b className="block text-xs">{benefit.title}</b><span className="text-[11px] text-blue-100">{benefit.description}</span></span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-blue-100">{content.footerTrustLine}</p>
      </div>
    </div>
  );
}

function LockedSecurity({ fields }: { fields: string[] }) {
  return (
    <section className="rounded border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <h4 className="text-sm font-semibold text-emerald-950">Security Boundary</h4>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {fields.map((field) => <span key={field} className="rounded bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800">{field}</span>)}
      </div>
    </section>
  );
}

function AuditList({ rows }: { rows: WebsiteExperienceAdminResponse["recentAudit"] }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-950">Recent Audit</h4>
      <div className="mt-3 space-y-2">
        {rows.length ? rows.map((row) => (
          <div key={row.id} className="rounded bg-slate-50 p-2 text-xs text-slate-600">
            <b className="text-slate-900">{row.action}</b>
            <span className="block">{row.changeSummary || row.context || row.entityId}</span>
          </div>
        )) : <p className="text-xs text-slate-500">No content actions recorded yet.</p>}
      </div>
    </section>
  );
}

function PartnerRegistrationIntakes({ rows }: { rows: PartnerRegistrationIntakeView[] }) {
  const others = useMemo(() => rows.filter((row) => row.primaryCategory === "OTHER"), [rows]);
  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-950">Recent Others Service Suggestions</h4>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">Read-only intake visibility. Official service taxonomy mapping remains deferred.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>{["Legal name", "Primary category", "Requested service", "Email", "Status"].map((header) => <th key={header} className="border-b border-slate-100 px-2 py-2 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {(others.length ? others : rows.slice(0, 5)).map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-2 py-2 font-semibold text-slate-900">{row.legalName}</td>
                <td className="px-2 py-2 text-slate-600">{row.primaryCategory === "OTHER" ? "Others" : row.primaryCategory}</td>
                <td className="px-2 py-2 text-slate-600">{row.requestedServiceName || "-"}</td>
                <td className="px-2 py-2 text-slate-600">{row.businessEmail}</td>
                <td className="px-2 py-2 text-slate-600">{row.status}</td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={5} className="px-2 py-5 text-center text-slate-500">No registration intakes yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkflowCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: "draft" | "published" | "scheduled" }) {
  const className = tone === "published"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : tone === "scheduled"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-blue-200 bg-blue-50 text-blue-700";
  return <span className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold ${className}`}>{label}</span>;
}

function PanelNotice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  return <section className={`rounded border p-4 text-sm ${tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600"}`}>{text}</section>;
}

function toneClass(tone: WebsiteExperienceBenefit["tone"]) {
  if (tone === "emerald") return "bg-emerald-400";
  if (tone === "amber") return "bg-amber-400";
  if (tone === "violet") return "bg-violet-400";
  return "bg-sky-400";
}

function buildIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
