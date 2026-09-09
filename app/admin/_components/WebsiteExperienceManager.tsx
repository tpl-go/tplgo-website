"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CentralSchedulePanel } from "./CentralSchedulePanel";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clock3,
  Archive,
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Pencil,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AdminBackButton } from "./AdminBackButton";
import {
  cancelAdminWebsiteExperienceSchedule,
  approveAdminWebsiteExperienceDraft,
  archiveAdminWebsiteExperienceContext,
  deleteAdminWebsiteExperienceDraft,
  getAdminAgreementTemplates,
  getAdminPartnerServiceCatalogue,
  getAdminWebsiteExperienceLoginSignup,
  publishAdminWebsiteExperienceContext,
  requestAdminWebsiteExperienceChanges,
  restoreAdminWebsiteExperienceContext,
  saveAdminAgreementTemplateDraft,
  saveAdminWebsiteExperienceDraft,
  scheduleAdminWebsiteExperienceContext,
  submitAdminWebsiteExperienceApproval,
  uploadAdminAgreementTemplateDocument,
  uploadAdminWebsiteExperienceMedia,
  type AdminAgreementTemplate,
  type AdminApiError,
  type AdminPartnerServiceCatalogueResponse,
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

type CatalogueQueueState =
  | { status: "idle"; data: AdminPartnerServiceCatalogueResponse | null }
  | { status: "ready"; data: AdminPartnerServiceCatalogueResponse }
  | { status: "error"; data: null };

type BlockKey = "brand" | "hero" | "copy" | "benefits" | "trust";
type PreviewDevice = "desktop" | "tablet" | "mobile";
type EditorView = "contexts" | "blocks" | "editor" | "workflow";
type WorkflowView = "drafts" | "in_review" | "approved" | "scheduled" | "published" | "archive" | "versions";

const blocks: Array<{ key: BlockKey; label: string; detail: string; icon: LucideIcon; tone: string }> = [
  { key: "brand", label: "Brand", detail: "Logo, brand label, and alt text", icon: BadgeCheck, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  { key: "hero", label: "Hero Images", detail: "Desktop and mobile artwork", icon: ImageIcon, tone: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  { key: "copy", label: "Headline & Copy", detail: "Eyebrow, headline, highlight, subtitle", icon: FileText, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  { key: "benefits", label: "Benefits", detail: "Up to four compact benefit rows", icon: Layers3, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { key: "trust", label: "Trust / Footer", detail: "Footer line and active status", icon: ShieldCheck, tone: "bg-violet-50 text-violet-700 border-violet-100" },
];

const workflowViews: Array<{ key: WorkflowView; label: string; detail: string; icon: LucideIcon }> = [
  { key: "drafts", label: "Drafts", detail: "Saved unpublished changes waiting for submission.", icon: FileText },
  { key: "in_review", label: "Needs Approval", detail: "Changes waiting for review.", icon: Send },
  { key: "approved", label: "Ready to Publish", detail: "Approved changes ready to publish or schedule.", icon: CheckCircle2 },
  { key: "scheduled", label: "Scheduled", detail: "Approved changes scheduled for publication.", icon: CalendarClock },
  { key: "published", label: "Published Content", detail: "Content currently published.", icon: Globe2 },
  { key: "archive", label: "Archive", detail: "Archived contexts and restore-to-draft actions.", icon: Archive },
  { key: "versions", label: "Versions & Audit", detail: "Human-readable version and audit history.", icon: Clock3 },
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

const contextDescriptions: Partial<Record<WebsiteExperienceContext, string>> = {
  user_login: "Manage the content shown on the User Login screen.",
  partner_login: "Manage the content shown on the Partner Login screen.",
  partner_registration: "Manage Partner registration content.",
};

export function WebsiteExperienceManager({
  mode = "login-signup",
  partnerApplicationNodeId,
  partnerApplicationUnitId,
  partnerAgreementTemplateId,
}: {
  mode?: "login-signup" | "partner-application";
  partnerApplicationNodeId?: string;
  partnerApplicationUnitId?: string;
  partnerAgreementTemplateId?: string;
}) {
  const initialWorkflowView = readInitialWorkflowView();
  const initialContext = readInitialContext(mode);
  const initialWorkflowDraftId = readInitialWorkflowDraftId();
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [catalogueState, setCatalogueState] = useState<CatalogueQueueState>({ status: "idle", data: null });
  const [activeContext, setActiveContext] = useState<WebsiteExperienceContext>(initialContext);
  const [activeBlock, setActiveBlock] = useState<BlockKey | null>(partnerApplicationNodeId ? "copy" : null);
  const [editorView, setEditorView] = useState<EditorView>(initialWorkflowView ? "workflow" : mode === "partner-application" ? "blocks" : "contexts");
  const [workflowView, setWorkflowView] = useState<WorkflowView | null>(initialWorkflowView);
  const [workflowOrigin, setWorkflowOrigin] = useState<WorkflowView | null>(initialWorkflowView);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [drafts, setDrafts] = useState<Partial<Record<WebsiteExperienceContext, WebsiteExperienceContent>>>({});
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [bypassReason, setBypassReason] = useState("");

  const load = useCallback(async () => {
    const [result, catalogueResult] = await Promise.all([
      getAdminWebsiteExperienceLoginSignup(),
      getAdminPartnerServiceCatalogue(),
    ]);
    setCatalogueState(catalogueResult.ok ? { status: "ready", data: catalogueResult.data } : { status: "error", data: null });
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
  const contextRows = useMemo(() => {
    const rows = state.data?.contexts ?? [];
    return mode === "partner-application" ? rows.filter((item) => item.context === "partner_application") : rows.filter((item) => item.context !== "partner_application");
  }, [mode, state.data?.contexts]);
  const activeRow = contextRows.find((item) => item.context === activeContext) ?? state.data?.contexts.find((item) => item.context === activeContext);
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
    setMessage(mode === "partner-application" ? "Draft saved. Partner Application presentation stays unchanged until Publish Now or the scheduled time." : "Draft saved. Public Login & Signup stays unchanged until Publish Now or the scheduled time.");
    setEditorView("editor");
    void load();
  };

  const publish = async () => {
    setBusyAction("publish");
    setMessage("");
    const result = await publishAdminWebsiteExperienceContext(activeContext, bypassReason ? { reason: bypassReason } : undefined);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage(mode === "partner-application" ? "Published now. Partner Application presentation uses this version." : "Published now. The public Login & Signup content uses this version.");
    void load();
  };

  const workflowAction = async (action: "submit" | "approve" | "request-changes" | "delete-draft" | "archive" | "restore", contextOverride?: WebsiteExperienceContext) => {
    const targetContext = contextOverride ?? activeContext;
    setBusyAction(action);
    setMessage("");
    const result =
      action === "submit" ? await submitAdminWebsiteExperienceApproval(targetContext, reviewNote)
      : action === "approve" ? await approveAdminWebsiteExperienceDraft(targetContext, reviewNote)
      : action === "request-changes" ? await requestAdminWebsiteExperienceChanges(targetContext, reviewNote)
      : action === "delete-draft" ? await deleteAdminWebsiteExperienceDraft(targetContext)
      : action === "archive" ? await archiveAdminWebsiteExperienceContext(targetContext, reviewNote)
      : await restoreAdminWebsiteExperienceContext(targetContext, reviewNote);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage(statusMessage(action));
    setReviewNote("");
    setEditorView("editor");
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
      ...(bypassReason ? { reason: bypassReason } : {}),
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

  const selectContext = (context: WebsiteExperienceContext) => {
    setActiveContext(context);
    setActiveBlock(null);
    setWorkflowView(null);
    setWorkflowOrigin(null);
    setEditorView("blocks");
  };

  const selectBlock = (block: BlockKey) => {
    setActiveBlock(block);
    setWorkflowView(null);
    setWorkflowOrigin(null);
    setEditorView("editor");
  };

  const openDraft = (context: WebsiteExperienceContext, origin?: WorkflowView) => {
    setActiveContext(context);
    setActiveBlock("copy");
    setWorkflowOrigin(origin ?? null);
    setWorkflowView(null);
    setEditorView("editor");
  };

  if (editorView === "workflow" && workflowView) {
    if (workflowView === "scheduled") return <div className="space-y-4"><Link href="/admin/website-experience">Back to Website Experience</Link><CentralSchedulePanel /></div>;
    if (workflowView === "drafts" && initialWorkflowDraftId) {
      return (
        <WorkflowDraftDetailView
          draftId={initialWorkflowDraftId}
          data={state.data}
          onSubmit={(context) => {
            setActiveContext(context);
            void workflowAction("submit", context);
          }}
        />
      );
    }
    return (
      <WorkflowQueueView
        view={workflowView}
        data={state.data}
        catalogue={catalogueState.data}
        onOpen={openDraft}
        onPreview={openDraft}
        onSubmit={(context) => {
          setActiveContext(context);
          void workflowAction("submit", context);
        }}
      />
    );
  }

  if (mode === "login-signup" && editorView === "contexts") {
    return (
      <ContentListShell
        eyebrow="Website Experience > Global Experience"
        breadcrumb={<HierarchyBreadcrumb items={[
          { label: "Website Experience", href: "/admin/website-experience" },
          { label: "Global Experience", href: "/admin/website-experience/global" },
          { label: "Login & Signup" },
        ]} />}
        title="Login & Signup"
        detail="Choose an experience to manage."
        backHref="/admin/website-experience/global"
        backLabel="Back to Global Experience"
      >
        {contextRows.map((item) => (
          <ContentDrilldownRow
            key={item.context}
            icon={FileText}
            title={contextLabels[item.context]}
            detail={contextDescriptions[item.context] ?? "Manage this experience content."}
            status={item.workflowState ?? item.status}
            meta={item.updatedAt ? `Last updated ${formatDateTime(item.updatedAt)}` : "Last updated not available"}
            action="Open"
            onClick={() => selectContext(item.context)}
          />
        ))}
      </ContentListShell>
    );
  }

  if (mode === "login-signup" && editorView === "blocks") {
    return (
      <ContentListShell
        eyebrow="Website Experience > Global Experience > Login & Signup"
        title={contextLabels[activeContext]}
        detail="Open one editable item. The item editor contains Preview Changes, Save as Draft, approval, publish, schedule, delete draft, archive, and version history controls."
        backLabel="Back to Login & Signup"
        onBack={() => setEditorView("contexts")}
      >
        <ItemStatusStrip activeRow={activeRow} />
        {blocks.map((block) => (
          <ContentDrilldownRow
            key={block.key}
            icon={block.icon}
            title={block.label}
            detail={block.detail}
            status={activeRow.workflowState ?? activeRow.status}
            meta={`Last modified ${activeRow.updatedAt ? formatDateTime(activeRow.updatedAt) : "not available"}`}
            action="Edit"
            onClick={() => selectBlock(block.key)}
          />
        ))}
      </ContentListShell>
    );
  }

  if (mode === "partner-application" && !partnerApplicationNodeId && editorView === "blocks") {
    return (
      <ContentListShell
        eyebrow="Website Experience > Pages > Partner"
        title="Partner Application"
        detail="Open one Partner Application section. Save changes as a draft here; approval, publishing, scheduling and history stay in the central workflow."
        backHref="/admin/website-experience/pages/partner"
        backLabel="Back to Partner"
      >
        <ItemStatusStrip activeRow={activeRow} />
        <PartnerApplicationTreeEditor
          content={activeDraft}
          selectedNodeId={undefined}
          selectedStepSevenUnitId={undefined}
          selectedAgreementTemplateId={undefined}
          canWrite={canWrite}
          activeRow={activeRow}
          busyAction={busyAction}
          message={message}
          onContentChange={updateDraft}
          onSaveDraft={saveDraft}
        />
      </ContentListShell>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-sky-300/15 bg-[#081427] p-5 shadow-xl shadow-black/20">
        <Breadcrumbs
          mode={mode}
          workflowOrigin={workflowOrigin}
          activeContext={contextLabels[activeContext]}
          activeBlock={mode === "partner-application" ? partnerApplicationRouteTitle(activeDraft, partnerApplicationNodeId, partnerApplicationUnitId, partnerAgreementTemplateId) : blocks.find((block) => block.key === activeBlock)?.label ?? "Editable Item"}
          partnerApplicationNodeId={partnerApplicationNodeId}
          partnerApplicationUnitId={partnerApplicationUnitId}
          partnerAgreementTemplateId={partnerAgreementTemplateId}
        />
        <div className="mt-4">
          <AdminBackButton
            href={mode === "partner-application" ? partnerApplicationBackHref(partnerApplicationNodeId, partnerApplicationUnitId, partnerAgreementTemplateId) : undefined}
            onClick={mode === "partner-application" ? undefined : workflowOrigin ? () => {
              setWorkflowView(workflowOrigin);
              setEditorView("workflow");
            } : () => setEditorView("blocks")}
            label={mode === "partner-application" ? partnerApplicationBackLabel(partnerApplicationNodeId, partnerApplicationUnitId, partnerAgreementTemplateId) : workflowOrigin ? `Back to ${workflowViewLabel(workflowOrigin)}` : `Back to ${contextLabels[activeContext]}`}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">{mode === "partner-application" ? "Pages / Partner" : "Global Experience / Login & Signup"}</p>
            <h2 className="mt-1 text-2xl font-black text-cyan-100">{mode === "partner-application" ? partnerApplicationRouteTitle(activeDraft, partnerApplicationNodeId, partnerApplicationUnitId, partnerAgreementTemplateId) : blocks.find((block) => block.key === activeBlock)?.label ?? "Editable Item"}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
              {mode === "partner-application"
                ? "Manage safe Partner Application presentation fields. Eligibility, validation, approval, and service activation stay locked outside this editor."
                : "Manage shared login presentation used across TPL GO. Auth behavior, OTP, RBAC, and provider settings stay locked outside this editor."}
            </p>
          </div>
          <ItemStatusStrip activeRow={activeRow} />
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-4 min-w-0">
          {mode === "partner-application" ? null : (
            <section className="rounded-2xl border border-sky-300/15 bg-[#0b1628] p-5 shadow-xl shadow-black/20">
              <CentralSchedulePanel targetType="website_experience" targetId={activeContext} onChanged={() => void load()} />
              <WorkflowActionBar
                canWrite={canWrite}
                canPublish={canPublish}
                schedule={schedule}
                activeRow={activeRow}
                busyAction={busyAction}
                message={message}
                reviewNote={reviewNote}
                bypassReason={bypassReason}
                onScheduleChange={setSchedule}
                onSaveDraft={saveDraft}
                onPublish={publish}
                onSchedule={schedulePublish}
                onCancelSchedule={cancelSchedule}
                onReviewNoteChange={setReviewNote}
                onBypassReasonChange={setBypassReason}
                onWorkflowAction={workflowAction}
                onPreview={() => setMessage(activeRow.hasUnpublishedChanges ? "Draft Preview is shown beside this editor and is not live." : "Unsaved Preview is shown beside this editor and is not live.")}
              />
            </section>
          )}

          <section className="rounded-2xl border border-sky-300/15 bg-white p-5 shadow-sm">
            <BlockEditor
              block={activeBlock ?? "brand"}
              content={activeDraft}
              partnerApplicationNodeId={partnerApplicationNodeId}
              partnerApplicationUnitId={partnerApplicationUnitId}
              partnerAgreementTemplateId={partnerAgreementTemplateId}
              canWrite={canWrite}
              canPublish={canPublish}
              schedule={schedule}
              activeRow={activeRow}
              busyAction={busyAction}
              message={message}
              reviewNote={reviewNote}
              bypassReason={bypassReason}
              onContentChange={updateDraft}
              onBenefitChange={updateBenefit}
              onUploaded={applyUploadedMedia}
              onScheduleChange={setSchedule}
              onSaveDraft={saveDraft}
              onPublish={publish}
              onSchedule={schedulePublish}
              onCancelSchedule={cancelSchedule}
              onReviewNoteChange={setReviewNote}
              onBypassReasonChange={setBypassReason}
              onWorkflowAction={workflowAction}
            />
          </section>

          {mode === "login-signup" ? <PartnerRegistrationIntakes rows={state.data.partnerRegistrationIntakes} /> : null}
        </div>

        <aside className="space-y-4 xl:col-span-2 2xl:col-span-1">
          <PreviewPanel content={activeDraft} device={previewDevice} onDeviceChange={setPreviewDevice} />
          <LockedSecurity fields={state.data.schema.lockedSecurityFields} />
          {mode === "partner-application" ? <CompactEditorMetadata activeRow={activeRow} /> : <AuditList rows={state.data.recentAudit} />}
        </aside>
      </div>
    </section>
  );
}

function Breadcrumbs({
  mode,
  workflowOrigin,
  activeContext,
  activeBlock,
  partnerApplicationNodeId,
  partnerApplicationUnitId,
  partnerAgreementTemplateId,
}: {
  mode: "login-signup" | "partner-application";
  workflowOrigin?: WorkflowView | null;
  activeContext: string;
  activeBlock: string;
  partnerApplicationNodeId?: string;
  partnerApplicationUnitId?: string;
  partnerAgreementTemplateId?: string;
}) {
  if (workflowOrigin && mode === "login-signup") {
    const originLabel = workflowViewLabel(workflowOrigin);
    return (
      <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400" aria-label="Website Experience breadcrumbs">
        <Link href="/admin/website-experience" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
          Website Experience
        </Link>
        <span aria-hidden="true" className="text-slate-600">&gt;</span>
        <Link href={`/admin/website-experience/login-signup?workflow=${workflowOrigin}`} className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
          {originLabel}
        </Link>
        <span aria-hidden="true" className="text-slate-600">&gt;</span>
        <span aria-current="page" className="text-cyan-100">{activeContext}</span>
      </nav>
    );
  }
  if (mode === "partner-application") {
    const items: Array<{ label: string; href?: string }> = [
      { label: "Website Experience", href: "/admin/website-experience" },
      { label: "Pages", href: "/admin/website-experience/pages" },
      { label: "Partner", href: "/admin/website-experience/pages/partner" },
      { label: "Partner Application", href: "/admin/website-experience/pages/partner/application" },
    ];
    if (partnerApplicationNodeId) {
      items.push({
        label: partnerApplicationNodeId === "step-7-partner-agreement" ? "Step 7 Partner Agreement" : activeBlock,
        href: partnerApplicationUnitId ? `/admin/website-experience/pages/partner/application/${partnerApplicationNodeId}` : undefined,
      });
    }
    if (partnerApplicationUnitId) {
      items.push({
        label: stepSevenUnitTitles[partnerApplicationUnitId] ?? activeBlock,
        href: partnerAgreementTemplateId ? stepSevenUnitHref(partnerApplicationUnitId) : undefined,
      });
    }
    if (partnerAgreementTemplateId) {
      items.push({ label: partnerAgreementTemplateId === "new" ? "Add Agreement Template" : "Edit Agreement Template" });
    }
    return <HierarchyBreadcrumb items={items} />;
  }
  const items = ["Website Experience", "Global Experience", "Login & Signup", activeContext, activeBlock];
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400" aria-label="Website Experience breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item}:${index}`} className="flex items-center gap-2">
          {index > 0 ? <span className="text-slate-600">&gt;</span> : null}
          <span className={index === items.length - 1 ? "text-cyan-100" : ""}>{item}</span>
        </span>
      ))}
    </nav>
  );
}

function HierarchyBreadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item.label}:${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className="text-slate-600">&gt;</span> : null}
          {item.href ? (
            <Link href={item.href} className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-slate-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function ContentListShell({
  eyebrow,
  breadcrumb,
  title,
  detail,
  backHref,
  backLabel,
  onBack,
  children,
}: {
  eyebrow: string;
  breadcrumb?: React.ReactNode;
  title: string;
  detail: string;
  backHref?: string;
  backLabel: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-sky-300/10 bg-[#0b1628]/95 p-5 shadow-xl shadow-black/20">
      <AdminBackButton href={backHref} onClick={onBack} label={backLabel} />
      <div>
        {breadcrumb ?? <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-black text-cyan-100">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{detail}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ContentDrilldownRow({
  icon: Icon,
  title,
  detail,
  status,
  meta,
  action,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  status: string;
  meta: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 w-full flex-col gap-3 rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-left shadow-lg shadow-black/10 transition hover:border-sky-300/35 hover:bg-[#0b1b33] focus:outline-none focus:ring-2 focus:ring-sky-300 md:flex-row md:items-center md:justify-between"
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-cyan-200 ring-1 ring-sky-300/20">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-black text-sky-50">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-400">{detail}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">{meta}</span>
        </span>
      </span>
      <span className="flex shrink-0 flex-wrap items-center gap-2">
        <StatusChip label={workflowLabel(status)} tone={workflowTone(status)} />
        <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100">
          {action}
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </button>
  );
}

function ItemStatusStrip({ activeRow }: { activeRow: WebsiteExperienceAdminContext }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusChip label={workflowLabel(activeRow.workflowState ?? activeRow.status)} tone={workflowTone(activeRow.workflowState ?? activeRow.status)} />
      <StatusChip label={`Draft v${activeRow.draftVersion}`} tone="draft" />
      <StatusChip label={`Published v${activeRow.publishedVersion}`} tone="published" />
      {activeRow.scheduledFor ? <StatusChip label={`Scheduled ${formatDateTime(activeRow.scheduledFor)}`} tone="scheduled" /> : null}
      <span className="inline-flex min-h-8 items-center rounded-full border border-slate-600 bg-slate-900 px-3 text-xs font-semibold text-slate-300">
        Last modified {activeRow.updatedAt ? formatDateTime(activeRow.updatedAt) : "not available"}
      </span>
    </div>
  );
}

function WorkflowQueueView({
  view,
  data,
  catalogue,
  onOpen,
  onPreview,
  onSubmit,
}: {
  view: WorkflowView;
  data: WebsiteExperienceAdminResponse;
  catalogue?: AdminPartnerServiceCatalogueResponse | null;
  onOpen: (context: WebsiteExperienceContext, origin?: WorkflowView) => void;
  onPreview: (context: WebsiteExperienceContext, origin?: WorkflowView) => void;
  onSubmit?: (context: WebsiteExperienceContext) => void;
}) {
  const selected = workflowViews.find((item) => item.key === view) ?? workflowViews[0];
  const rows = workflowRowsForView(data, view);
  const catalogueRow = catalogueWorkflowRow(catalogue, view);
  const hasRows = rows.length > 0 || Boolean(catalogueRow);
  return (
    <ContentListShell
      eyebrow={`Website Experience > ${selected.label}`}
      breadcrumb={<WorkflowBreadcrumb current={selected.label} />}
      title={selected.label}
      detail={selected.detail}
      backLabel="Back to Website Experience"
      backHref="/admin/website-experience"
    >
      {catalogueRow ? (
        <div className="rounded-2xl border border-sky-300/10 bg-[#081427] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-sky-50">Service Catalogue</h3>
                <StatusChip label={workflowLabel(catalogueRow.workflowState)} tone={workflowTone(catalogueRow.workflowState)} />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">{catalogueRow.title}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{catalogueRow.detail}</p>
              {catalogue?.review?.note ? <p className="mt-2 rounded border border-orange-300/20 bg-orange-400/10 p-2 text-xs font-semibold text-orange-100">Review note: {catalogue.review.note}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href={`${catalogueRow.href}?preview=1`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100">
                <Eye className="h-4 w-4" />
                {view === "approved" ? "Preview Approved Version" : "Preview Draft"}
              </Link>
              <Link href={catalogueRow.href} className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100">
                <Pencil className="h-4 w-4" />
                Open/Edit
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      {rows.length ? rows.map((row) => (
        <div key={`${view}:${row.context}`} className="rounded-2xl border border-sky-300/10 bg-[#081427] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-sky-50">{row.label}</h3>
                <StatusChip label={workflowLabel(row.workflowState ?? row.status)} tone={workflowTone(row.workflowState ?? row.status)} />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">{publishScope(row.context)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Draft v{row.draftVersion} - Published v{row.publishedVersion} - Changed {row.updatedAt ? formatDateTime(row.updatedAt) : "not available"}</p>
              {row.review?.note ? <p className="mt-2 rounded border border-orange-300/20 bg-orange-400/10 p-2 text-xs font-semibold text-orange-100">Review note: {row.review.note}</p> : null}
              {row.draftContent.agreementTemplateDraft?.readinessMissing?.length ? (
                <div className="mt-2 rounded border border-amber-300/20 bg-amber-400/10 p-2 text-xs font-semibold text-amber-100">
                  <p>Not ready for approval yet:</p>
                  <ul className="mt-1 grid gap-1">
                    {row.draftContent.agreementTemplateDraft.readinessMissing.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" onClick={() => onPreview(row.context, view)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100">
                <Eye className="h-4 w-4" />
                {view === "approved" ? "Preview Approved Version" : "Preview Draft"}
              </button>
              {row.draftContent.agreementTemplateDraft?.templateId ? (
                <Link href={agreementTemplateCentralDraftRoute(row.draftContent.agreementTemplateDraft.templateId)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100">
                  <Pencil className="h-4 w-4" />
                  Open/Edit
                </Link>
              ) : (
                <button type="button" onClick={() => onOpen(row.context, view)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100">
                  <Pencil className="h-4 w-4" />
                  Open/Edit
                </button>
              )}
              {view === "drafts" ? (
                <button type="button" disabled={Boolean(row.draftContent.agreementTemplateDraft?.readinessMissing?.length)} onClick={() => onSubmit?.(row.context)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 text-xs font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send className="h-4 w-4" />
                  Send for Approval
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )) : !hasRows ? (
        <p className="rounded-2xl border border-sky-300/10 bg-[#081427] p-4 text-sm font-semibold text-slate-300">No {selected.label.toLowerCase()} items.</p>
      ) : null}
    </ContentListShell>
  );
}

function WorkflowDraftDetailView({
  draftId,
  data,
  onSubmit,
}: {
  draftId: string;
  data: WebsiteExperienceAdminResponse;
  onSubmit: (context: WebsiteExperienceContext) => void;
}) {
  const row = data.contexts.find((item) => workflowDraftIdForContext(item) === draftId || item.context === draftId);
  const marker = row?.draftContent.agreementTemplateDraft;
  if (!row) {
    return (
      <ContentListShell
        eyebrow="Website Experience > Drafts"
        breadcrumb={<WorkflowBreadcrumb current="Draft Detail" />}
        title="Draft not found"
        detail="The saved Draft could not be found. Return to Drafts and choose another item."
        backHref="/admin/website-experience/login-signup?workflow=drafts"
        backLabel="Back to Drafts"
      >
        <PanelNotice tone="danger" text="This saved Draft is no longer available." />
      </ContentListShell>
    );
  }
  const missing = marker?.readinessMissing ?? [];
  const targetLabel = marker?.targetLabel ?? row.label;
  const editHref = marker?.templateId
    ? `${stepSevenUnitHref("agreement-templates")}/${encodeURIComponent(marker.templateId)}`
    : "/admin/website-experience/pages/partner/application";
  return (
    <ContentListShell
      eyebrow="Website Experience > Drafts"
      breadcrumb={<WorkflowBreadcrumb current="Draft Detail" />}
      title={targetLabel}
      detail="Review this saved Draft before sending it for approval. Publishing and scheduling remain central."
      backHref="/admin/website-experience/login-signup?workflow=drafts"
      backLabel="Back to Drafts"
    >
      <div className="rounded-2xl border border-sky-300/10 bg-[#081427] p-5" data-central-draft-detail={draftId}>
        <div className="grid gap-3 text-sm text-slate-300">
          <DraftDetailLine label="Human-readable target" value={targetLabel} />
          <DraftDetailLine label="Agreement Template name" value={marker?.title ?? "Partner Application"} />
          <DraftDetailLine label="Current version" value={`Draft v${row.draftVersion}`} />
          <DraftDetailLine label="Saved date/time" value={row.updatedAt ? formatDateTime(row.updatedAt) : "Not available"} />
          <DraftDetailLine label="Saved by" value={row.review?.submittedByAdminId ?? row.review?.reviewedByAdminId ?? "Last editor recorded in audit"} />
          <DraftDetailLine label="Readiness status" value={missing.length ? "Needs more details before approval" : "Ready for approval review"} />
        </div>
        {missing.length ? (
          <div className="mt-4 rounded border border-amber-300/20 bg-amber-400/10 p-3 text-xs font-semibold text-amber-100">
            <p>Missing before approval:</p>
            <ul className="mt-2 grid gap-1">
              {missing.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`${editHref}#website-experience-preview`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-black text-cyan-100">
            <Eye className="h-4 w-4" />
            Preview
          </Link>
          <Link href={editHref} className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 text-xs font-black text-orange-100">
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button type="button" disabled={Boolean(missing.length)} onClick={() => onSubmit(row.context)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 text-xs font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="h-4 w-4" />
            Send for Approval
          </button>
        </div>
      </div>
    </ContentListShell>
  );
}

function DraftDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded border border-sky-300/10 bg-white/5 p-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
      <span className="font-semibold text-sky-50">{value}</span>
    </div>
  );
}

function WorkflowBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Website Experience breadcrumbs">
      <Link href="/admin/website-experience" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
        Website Experience
      </Link>
      <span aria-hidden="true" className="text-slate-600">&gt;</span>
      <span aria-current="page" className="text-slate-300">{current}</span>
    </nav>
  );
}

function BlockEditor({
  block,
  content,
  partnerApplicationNodeId,
  partnerApplicationUnitId,
  partnerAgreementTemplateId,
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
  reviewNote,
  bypassReason,
  onReviewNoteChange,
  onBypassReasonChange,
  onWorkflowAction,
}: {
  block: BlockKey;
  content: WebsiteExperienceContent;
  partnerApplicationNodeId?: string;
  partnerApplicationUnitId?: string;
  partnerAgreementTemplateId?: string;
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  reviewNote: string;
  bypassReason: string;
  onContentChange: (patch: Partial<WebsiteExperienceContent>) => void;
  onBenefitChange: (index: number, patch: Partial<WebsiteExperienceBenefit>) => void;
  onUploaded: (media: { slot: string; url: string; altText?: string }) => void;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
  onReviewNoteChange: (value: string) => void;
  onBypassReasonChange: (value: string) => void;
  onWorkflowAction: (action: "submit" | "approve" | "request-changes" | "delete-draft" | "archive" | "restore") => void;
}) {
  if (content.context === "partner_application") {
    return (
      <>
        <PartnerApplicationTreeEditor
          content={content}
          selectedNodeId={partnerApplicationNodeId}
          selectedStepSevenUnitId={partnerApplicationUnitId}
          selectedAgreementTemplateId={partnerAgreementTemplateId}
          canWrite={canWrite}
          activeRow={activeRow}
          busyAction={busyAction}
          message={message}
          onContentChange={onContentChange}
          onSaveDraft={onSaveDraft}
        />
      </>
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
      <WorkflowActions
        canWrite={canWrite}
        canPublish={canPublish}
        schedule={schedule}
        activeRow={activeRow}
        busyAction={busyAction}
        message={message}
        reviewNote={reviewNote}
        bypassReason={bypassReason}
        onScheduleChange={onScheduleChange}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        onSchedule={onSchedule}
        onCancelSchedule={onCancelSchedule}
        onReviewNoteChange={onReviewNoteChange}
        onBypassReasonChange={onBypassReasonChange}
        onWorkflowAction={onWorkflowAction}
      />
    </EditorSection>
  );
}

function PartnerApplicationTreeEditor({
  content,
  selectedNodeId,
  selectedStepSevenUnitId,
  selectedAgreementTemplateId,
  canWrite,
  activeRow,
  busyAction,
  message,
  onContentChange,
  onSaveDraft,
}: {
  content: WebsiteExperienceContent;
  selectedNodeId?: string;
  selectedStepSevenUnitId?: string;
  selectedAgreementTemplateId?: string;
  canWrite: boolean;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  onContentChange: (patch: Partial<WebsiteExperienceContent>) => void;
  onSaveDraft: () => void;
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
  const selectedNode = selectedNodeId ? tree?.children.find((node) => node.id === selectedNodeId) : undefined;
  if (!selectedNodeId) {
    return (
      <EditorSection title="Partner Application" detail="Open one application section at a time.">
        <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          Website Experience &gt; Pages &gt; Partner &gt; Partner Application
        </div>
        <div className="space-y-3">
          {(tree?.children ?? []).map((node) => (
            <Link
              key={node.id}
              href={`/admin/website-experience/pages/partner/application/${node.id}`}
              className="flex min-h-20 w-full flex-col justify-between gap-4 rounded border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:flex-row sm:items-center"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">{node.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{partnerApplicationSectionDescription(node.id, node.editableFields.length)}</span>
                <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">{partnerApplicationWorkflowLabel(activeRow)}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-blue-700" />
            </Link>
          ))}
        </div>
      </EditorSection>
    );
  }

  if (!selectedNode) {
    return (
      <EditorSection title="Partner Application" detail="The requested Partner Application section was not found.">
        <AdminBackButton href="/admin/website-experience/pages/partner/application" label="Back to Partner Application" className="border-slate-300 bg-slate-950 text-sky-100" />
      </EditorSection>
    );
  }

  return (
    <EditorSection title={selectedNode.label} detail="Edit only this Partner Application section's safe presentation fields.">
      <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        Website Experience &gt; Pages &gt; Partner &gt; Partner Application &gt; {selectedNode.label}
      </div>
      <AdminBackButton href="/admin/website-experience/pages/partner/application" label="Back to Partner Application" className="border-slate-300 bg-slate-950 text-sky-100" />
      {selectedNode.id === "step-7-partner-agreement" ? (
        <StepSevenContentUnits
          activeUnit={selectedStepSevenUnitId}
          templateId={selectedAgreementTemplateId}
          node={selectedNode}
          canWrite={canWrite}
          busyAction={busyAction}
          onNodeChange={(patch) => updateNode(selectedNode.id, patch)}
          onCtaChange={(key, value) => updateCta(selectedNode.id, key, value)}
        />
      ) : null}
      <div className="space-y-3">
        {[selectedNode].map((node) => (
          <section key={node.id} className={node.id === "step-7-partner-agreement" ? "sr-only" : "rounded border border-slate-200 bg-slate-50 p-3"}>
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
      <LocalStepEditorActions canWrite={canWrite} busyAction={busyAction} message={message} onSaveDraft={onSaveDraft} />
    </EditorSection>
  );
}

function partnerApplicationSectionDescription(nodeId: string, editableFields: number): string {
  if (nodeId === "application-shell") return "Application shell, progress and shared guidance.";
  if (nodeId === "step-7-partner-agreement") return "Page content, agreement templates, signing instructions and declarations.";
  if (nodeId === "step-8-review-submit") return "Review and Submit guidance for the final onboarding step.";
  return `${editableFields} editable presentation fields.`;
}

function partnerApplicationWorkflowLabel(activeRow: WebsiteExperienceAdminContext): string {
  if (activeRow.workflowState === "in_review") return "Needs review";
  if (activeRow.workflowState === "approved") return "Approved centrally";
  if (activeRow.workflowState === "scheduled") return "Scheduled centrally";
  if (activeRow.hasUnpublishedChanges) return "Draft changes";
  return "Published";
}

function agreementTemplateWorkflowLabel(title: string): string {
  return `Partner Application / Step 7 / Agreement Template / ${title || "Agreement Template"}`;
}

function LocalStepEditorActions({ canWrite, busyAction, message, onSaveDraft }: { canWrite: boolean; busyAction: string; message: string; onSaveDraft: () => void }) {
  return (
    <div className="rounded border border-cyan-200 bg-cyan-50 p-4">
      <p className="text-sm font-semibold text-cyan-950">Preview this item beside the editor, then save changes as a draft. Approval, publishing, scheduling and history are handled from the central Website Experience workflow.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <a href="#website-experience-preview" className="inline-flex h-10 items-center gap-2 rounded border border-cyan-300 bg-white px-4 text-sm font-semibold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <Eye className="h-4 w-4" />
          Preview
        </a>
        <button type="button" disabled={!canWrite || busyAction === "save"} onClick={onSaveDraft} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          <Save className="h-4 w-4" />
          Save as Draft
        </button>
      </div>
      {message ? <p className="mt-3 rounded border border-cyan-200 bg-white p-3 text-sm font-semibold text-cyan-900">{message}</p> : null}
    </div>
  );
}

const stepSevenUnits = [
  ["page-content", "Page Content", "Title, subtitle and page help text."],
  ["agreement-templates", "Agreement Templates", "Create, review and save agreement templates."],
  ["signer-instructions", "Signer Instructions", "Signer and authority guidance."],
  ["signing-methods", "Signing Methods", "Acceptance, signed document and future eSign guidance."],
  ["signed-document-instructions", "Signed Document Instructions", "Private signed PDF upload guidance."],
  ["declarations", "Declarations", "Partner acceptance declaration copy."],
  ["agreement-status-messages", "Agreement Status Messages", "Human status and next-action messages."],
  ["summary-guidance", "Summary Guidance", "Right-side summary labels and guidance."],
] as const;

const stepSevenUnitIds = new Set<string>(stepSevenUnits.map(([id]) => id));

const stepSevenUnitTitles = Object.fromEntries(stepSevenUnits.map(([id, label]) => [id, label])) as Record<string, string>;

function stepSevenUnitHref(unit: string) {
  return `/admin/website-experience/pages/partner/application/step-7-partner-agreement/${unit}`;
}

function StepSevenContentUnits({
  activeUnit,
  templateId,
  node,
  canWrite,
  busyAction,
  onNodeChange,
  onCtaChange,
}: {
  activeUnit?: string;
  templateId?: string;
  node: NonNullable<WebsiteExperienceContent["applicationTree"]>["children"][number];
  canWrite: boolean;
  busyAction: string;
  onNodeChange: (patch: Record<string, string>) => void;
  onCtaChange: (key: string, value: string) => void;
}) {
  if (!activeUnit) {
    return (
      <div className="grid gap-4" data-step7-overview-page="true">
        <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-950">
          Choose one area to edit. Each item opens on its own page. Preview and Save as Draft are available inside the editor; approval and publishing stay in the central workflow.
        </div>
        <div className="space-y-3" data-step7-content-unit-list="vertical">
          {stepSevenUnits.map(([id, label, detail]) => (
            <Link key={id} href={stepSevenUnitHref(id)} data-step7-content-unit-row={id} className="flex min-h-16 w-full items-center justify-between gap-4 rounded border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-300">
              <span>
                <span className="block text-sm font-semibold text-slate-950">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{detail}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-blue-700" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!stepSevenUnitIds.has(activeUnit)) {
    return (
      <div className="grid gap-4" data-step7-content-unit-editor="not-found">
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">This Step 7 content page was not found.</p>
        <AdminBackButton href="/admin/website-experience/pages/partner/application/step-7-partner-agreement" label="Back to Step 7" className="border-slate-300 bg-slate-950 text-sky-100" />
      </div>
    );
  }

  return (
    <div className="grid gap-4" data-step7-dedicated-page={activeUnit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-base font-black text-slate-950">{stepSevenUnitTitles[activeUnit]}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">Edit this content area only. Preview and Save as Draft keep the central Website Experience workflow unchanged.</p>
        </div>
        <AdminBackButton href="/admin/website-experience/pages/partner/application/step-7-partner-agreement" label="Back to Step 7" className="border-slate-300 bg-white text-slate-800" />
      </div>
      <section className="rounded border border-slate-200 bg-slate-50 p-4" data-step7-content-unit-editor={activeUnit}>
        {activeUnit === "agreement-templates" ? (
          <AgreementTemplateDraftPanel canWrite={canWrite} busyAction={busyAction} templateId={templateId} />
        ) : activeUnit === "signer-instructions" ? (
          <Field label="Signer instructions" value={node.rightHelpCopy} maxLength={300} onChange={(value) => onNodeChange({ rightHelpCopy: value })} />
        ) : activeUnit === "signing-methods" ? (
          <Field label="Signing-method explanation" value={node.domainIntroductionCopy} maxLength={260} onChange={(value) => onNodeChange({ domainIntroductionCopy: value })} />
        ) : activeUnit === "signed-document-instructions" ? (
          <Field label="Signed document instructions" value={node.sectionDescription} maxLength={260} onChange={(value) => onNodeChange({ sectionDescription: value })} />
        ) : activeUnit === "declarations" ? (
          <Field label="Declaration guidance" value={node.emptyStateCopy} maxLength={180} onChange={(value) => onNodeChange({ emptyStateCopy: value })} />
        ) : activeUnit === "agreement-status-messages" ? (
          <div className="grid gap-3">
            <Field label="Review ready message" value={node.ctaLabels.reviewReady ?? ""} maxLength={120} onChange={(value) => onCtaChange("reviewReady", value)} />
            <Field label="Review incomplete message" value={node.ctaLabels.reviewIncomplete ?? ""} maxLength={160} onChange={(value) => onCtaChange("reviewIncomplete", value)} />
          </div>
        ) : activeUnit === "summary-guidance" ? (
          <Field label="Summary guidance" value={node.otherServiceGuidance} maxLength={180} onChange={(value) => onNodeChange({ otherServiceGuidance: value })} />
        ) : (
          <div className="grid gap-3">
            <Field label="Title" value={node.title} maxLength={80} onChange={(value) => onNodeChange({ title: value })} />
            <Field label="Subtitle" value={node.subtitle} maxLength={180} onChange={(value) => onNodeChange({ subtitle: value })} />
            <Field label="Help text" value={node.helperText} maxLength={220} onChange={(value) => onNodeChange({ helperText: value })} />
          </div>
        )}
      </section>
    </div>
  );
}

type AgreementTemplateDraftState = {
  id?: string;
  title: string;
  stableKey: string;
  agreementType: string;
  agreementRole: string;
  templateSourceType: string;
  country: string;
  entityType: string;
  serviceScheduleRefs: string;
  mappedServices: string;
  introduction: string;
  sectionBody: string;
  signingPolicy: string;
  priority: string;
  active: boolean;
  sourceDocument?: Record<string, unknown> | null;
};

type TemplateUploadState = "idle" | "selected" | "preparing" | "uploading" | "verifying" | "uploaded" | "failed";

function AgreementTemplateDraftPanel({ canWrite, busyAction, templateId }: { canWrite: boolean; busyAction: string; templateId?: string }) {
  const [templates, setTemplates] = useState<AdminAgreementTemplate[]>([]);
  const [supportedPlaceholders, setSupportedPlaceholders] = useState<string[]>([]);
  const [draft, setDraft] = useState<AgreementTemplateDraftState>(() => newAgreementTemplateDraft());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadState, setUploadState] = useState<TemplateUploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedDraftRoute, setSavedDraftRoute] = useState("");
  const [savedDraftLabel, setSavedDraftLabel] = useState("");
  useEffect(() => {
    let active = true;
    getAdminAgreementTemplates().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setTemplates(result.data.rows);
      setSupportedPlaceholders(result.data.supportedPlaceholders);
      if (templateId === "new") {
        setDraft(newAgreementTemplateDraft());
        setError("");
      } else if (templateId) {
        const selected = result.data.rows.find((item) => item.id === templateId);
        if (selected) {
          setDraft(draftFromAgreementTemplate(selected));
          setUploadState(selected.metadata?.sourceDocument ? "uploaded" : "idle");
          setSavedDraftRoute(centralDraftRouteFromTemplate(selected));
          setSavedDraftLabel(agreementTemplateWorkflowLabel(selected.title));
          setError("");
        } else {
          setError("This agreement template was not found.");
        }
      } else {
        setError("");
      }
    });
    return () => {
      active = false;
    };
  }, [templateId]);
  const updateDraft = (patch: Partial<AgreementTemplateDraftState>) => setDraft((current) => ({ ...current, ...patch }));
  const uploadTemplate = async (file: File | null) => {
    if (!file) return;
    setUploadState("selected");
    setUploadMessage("Selected");
    setError("");
    const localValidation = validateAgreementTemplateUploadFile(file);
    if (localValidation) {
      setUploadState("failed");
      setUploadMessage("Upload failed — Retry");
      setError(localValidation);
      return;
    }
    setUploadState("preparing");
    setUploadMessage("Preparing upload");
    await Promise.resolve();
    setUploadState("uploading");
    setUploadMessage("Uploading");
    const result = await uploadAdminAgreementTemplateDocument({ file });
    if (!result.ok) {
      setUploadState("failed");
      setUploadMessage("Document upload needs attention");
      setError(formatAgreementTemplateUploadError(result.error.message, result.requestId));
      return;
    }
    setUploadState("verifying");
    setUploadMessage("Verifying");
    if (result.data.uploadStatus !== "UPLOADED" || result.data.verified !== true || !result.data.storageReference) {
      setUploadState("failed");
      setUploadMessage("Document upload needs attention");
      setError(`The upload reached storage but could not be verified. Reference: ${result.requestId}`);
      return;
    }
    updateDraft({
      sourceDocument: {
        storageReference: result.data.storageReference,
        filename: result.data.filename,
        mimeType: result.data.mimeType,
        sizeBytes: result.data.sizeBytes,
        uploadStatus: result.data.uploadStatus,
        verified: result.data.verified,
        publicUrl: null,
      },
    });
    setUploadState("uploaded");
    setUploadMessage("Uploaded");
    setMessage("Template document uploaded privately and verified. Save as Draft keeps the reference with this template.");
  };
  const saveTemplate = async () => {
    const draftError = validateInitialAgreementTemplateDraft(draft, uploadState);
    if (draftError) {
      setError(draftError);
      return;
    }
    setSaving(true);
    setError("");
    const result = await saveAdminAgreementTemplateDraft({
      id: draft.id,
      title: draft.title,
      stableKey: draft.stableKey,
      country: draft.country,
      entityType: draft.entityType,
      agreementType: draft.agreementType,
      lifecycleStatus: "DRAFT",
      introduction: draft.introduction,
      sections: [{ id: "agreement_content", title: "Agreement content", body: draft.sectionBody }],
      serviceScheduleRefs: splitCsv(draft.serviceScheduleRefs),
      metadata: {
        agreementRole: draft.agreementRole,
        templateSourceType: draft.templateSourceType,
        mappedServices: splitCsv(draft.mappedServices),
        signingPolicy: draft.signingPolicy,
        priority: Number(draft.priority) || 100,
        active: draft.active,
        sourceDocument: draft.sourceDocument ?? null,
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setTemplates((current) => [result.data.template, ...current.filter((item) => item.id !== result.data.template.id)]);
    setDraft(draftFromAgreementTemplate(result.data.template));
    setSavedDraftRoute(result.data.centralDraft?.route ?? "");
    setSavedDraftLabel(result.data.centralDraft?.targetLabel ?? result.data.targetLabel);
    setMessage(result.data.safeMessage);
  };
  const removeSourceDocument = () => {
    updateDraft({ sourceDocument: null });
    setUploadState("idle");
    setUploadMessage("");
    setMessage("Source document removed from this draft. Save as Draft to keep the change.");
  };
  const readiness = templateReadinessChecklist(draft);
  const uploadNeedsAttention = ["selected", "preparing", "uploading", "verifying", "failed"].includes(uploadState);
  const visibleReadiness = uploadNeedsAttention
    ? ["Document upload needs attention. Retry the upload or remove the file and use agreement text."]
    : readiness;
  const preview = renderTemplatePreview(draft);
  return (
    <div className="grid gap-4" data-agreement-template-manager="functional">
      {!templateId ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-700">Create and edit agreement templates here. Save as Draft sends changes to the central Website Experience workflow; approval, publishing, scheduling and history stay there.</p>
            <Link aria-disabled={!canWrite} href={canWrite ? `${stepSevenUnitHref("agreement-templates")}/new` : stepSevenUnitHref("agreement-templates")} className={`inline-flex h-10 items-center justify-center rounded px-4 text-sm font-bold ${canWrite ? "bg-slate-950 text-white" : "cursor-not-allowed bg-slate-300 text-slate-600"}`}>Add Agreement Template</Link>
          </div>
          <div className="space-y-3">
            {templates.length === 0 ? <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">No agreement templates found. Add a draft template to begin.</p> : null}
            {templates.map((template) => (
              <Link key={template.id} href={`${stepSevenUnitHref("agreement-templates")}/${template.id}`} className="flex w-full flex-col gap-3 rounded border border-slate-200 bg-white p-4 text-left hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-black text-slate-950">{template.title}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{humanAgreementStatus(template.lifecycleStatus)} · version {template.versionNumber}</span>
                </span>
                <span className="grid gap-1 text-xs leading-5 text-slate-600 sm:grid-cols-2">
                  <span>Agreement type: {humanLabel(template.agreementType)}</span>
                  <span>Who this agreement is for: {String(template.metadata?.agreementRole ?? "Base Agreement")}</span>
                  <span>Where this agreement applies: {template.country}</span>
                  <span>Entity type: {template.entityType === "ANY" ? "Any entity type" : template.entityType}</span>
                  <span>Services covered: {displayList(template.serviceScheduleRefs)}</span>
                  <span>Source document: {sourceDocumentName(template.metadata?.sourceDocument)}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-base font-black text-slate-950">{templateId === "new" ? "Add Agreement Template" : "Edit Agreement Template"}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">One field per row. Draft templates cannot be issued to Partners until approved and published in the central workflow.</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">Version {draft.id ? "saved" : "new"} · Last saved after a successful Save as Draft · Full activity remains in central History.</p>
            </div>
            <AdminBackButton href={stepSevenUnitHref("agreement-templates")} label="Back to Agreement Templates" className="border-slate-300 bg-white text-slate-800" />
          </div>
          <div className="grid gap-4">
            <Field label="Template name" value={draft.title} maxLength={120} onChange={(value) => updateDraft({ title: value })} />
            <TemplateSelect label="Who this agreement is for" value={draft.agreementRole} options={["Base Agreement", "Service Schedule/Appendix", "Separate Agreement Required"]} onChange={(value) => updateDraft({ agreementRole: value })} />
            <TemplateSelect label="Source document type" value={draft.templateSourceType} options={["structured_autofill", "static_pdf", "docx_source"]} onChange={(value) => updateDraft({ templateSourceType: value })} />
            <Field label="Agreement type" value={draft.agreementType} maxLength={80} onChange={(value) => updateDraft({ agreementType: value })} />
            <Field label="Where this agreement applies" value={draft.country} maxLength={80} onChange={(value) => updateDraft({ country: value })} />
            <Field label="Entity type" value={draft.entityType} maxLength={80} onChange={(value) => updateDraft({ entityType: value })} />
            <Field label="Services covered" value={draft.mappedServices} maxLength={260} onChange={(value) => updateDraft({ mappedServices: value, serviceScheduleRefs: value })} />
            <Field label="Service schedule names" value={draft.serviceScheduleRefs} maxLength={260} onChange={(value) => updateDraft({ serviceScheduleRefs: value })} />
            <Field label="Priority" value={draft.priority} maxLength={4} onChange={(value) => updateDraft({ priority: value.replace(/\D/g, "") })} />
            <TemplateTextArea label="Introduction" value={draft.introduction} maxLength={2000} onChange={(value) => updateDraft({ introduction: value })} />
            <TemplateTextArea label="Agreement body" value={draft.sectionBody} maxLength={8000} onChange={(value) => updateDraft({ sectionBody: value })} />
            <TemplateTextArea label="Signing requirements" value={draft.signingPolicy} maxLength={600} onChange={(value) => updateDraft({ signingPolicy: value })} />
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Upload template document</span>
              <input disabled={!canWrite || ["preparing", "uploading", "verifying"].includes(uploadState)} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => uploadTemplate(event.target.files?.[0] ?? null)} className="rounded border border-slate-300 bg-white p-3 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60" />
              <span className="text-xs leading-5 text-slate-600">PDF/DOCX only. Stored privately. Choose another file to replace the current source document.</span>
              {uploadMessage ? <span data-agreement-template-upload-state={uploadState} className={`rounded border p-2 text-xs font-semibold ${uploadState === "uploaded" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : uploadState === "failed" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{uploadMessage}</span> : null}
              {draft.sourceDocument ? (
                <span className="flex flex-col gap-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
                  <span>Saved source: {sourceDocumentName(draft.sourceDocument)}</span>
                  <button type="button" disabled={!canWrite} onClick={removeSourceDocument} className="rounded border border-emerald-300 bg-white px-2 py-1 text-emerald-900 disabled:opacity-50">Remove file</button>
                </span>
              ) : null}
            </label>
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-amber-800">Readiness before approval</p>
              {visibleReadiness.length ? (
                <ul className="mt-2 grid gap-1 text-xs font-semibold text-amber-900">
                  {visibleReadiness.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              ) : <p className="mt-2 text-xs font-semibold text-emerald-800">Ready to preview and send for approval from the central Draft.</p>}
            </div>
            <div className="rounded border border-slate-200 bg-white p-3">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Company details added automatically</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(supportedPlaceholders.length ? supportedPlaceholders : defaultAgreementPlaceholders).map((placeholder) => <span key={placeholder} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{humanPlaceholderLabel(placeholder)}</span>)}
              </div>
            </div>
            <div className="rounded border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-cyan-800">Sample preview</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-cyan-950">{preview}</p>
            </div>
            {message ? <p className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
            {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
            {savedDraftRoute ? (
              <div className="rounded border border-cyan-200 bg-cyan-50 p-3" data-agreement-template-central-draft-handoff="ready">
                <p className="text-sm font-semibold text-cyan-950">Saved Draft: {savedDraftLabel || "Partner Application agreement template"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setMessage("Continue editing this saved draft. Open Draft is available when you are ready.")} className="inline-flex h-10 items-center rounded border border-cyan-300 bg-white px-4 text-sm font-semibold text-cyan-900">Continue Editing</button>
                  <Link href={savedDraftRoute} className="inline-flex h-10 items-center rounded bg-cyan-700 px-4 text-sm font-semibold text-white">Open Draft</Link>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <a href="#website-experience-preview" className="inline-flex h-10 items-center gap-2 rounded border border-cyan-300 bg-white px-4 text-sm font-semibold text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <Eye className="h-4 w-4" />
                Preview
              </a>
              {savedDraftRoute ? <Link href={savedDraftRoute} className="inline-flex h-10 items-center gap-2 rounded border border-cyan-300 bg-white px-4 text-sm font-semibold text-cyan-900">Open saved draft</Link> : null}
              <button type="button" disabled={!canWrite || busyAction === "save" || saving || ["preparing", "uploading", "verifying", "failed"].includes(uploadState)} onClick={saveTemplate} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                <Save className="h-4 w-4" />
                Save as Draft
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const defaultAgreementPlaceholders = ["partner.legal_name", "partner.brand_name", "partner.entity_type", "partner.registration_reference", "partner.registered_address", "partner.country", "partner.authorized_signer_name", "partner.authorized_signer_role", "partner.selected_services", "partner.service_schedule_summary", "partner.payout_country", "partner.tax_residency", "agreement.id", "agreement.version", "agreement.issue_date", "agreement.effective_date"];

function newAgreementTemplateDraft(): AgreementTemplateDraftState {
  return {
    title: "Partner Master Services Agreement",
    stableKey: "partner_master_services_global",
    agreementType: "partner_master_services",
    agreementRole: "Base Agreement",
    templateSourceType: "structured_autofill",
    country: "GLOBAL",
    entityType: "ANY",
    serviceScheduleRefs: "",
    mappedServices: "",
    introduction: "Admin-approved agreement introduction.",
    sectionBody: "Agreement for {{partner.legal_name}} covering {{partner.selected_services}}.",
    signingPolicy: "Authenticated acceptance and manual signed-document flow are available. eSign provider remains disabled until approved.",
    priority: "100",
    active: true,
    sourceDocument: null,
  };
}

function draftFromAgreementTemplate(template: AdminAgreementTemplate): AgreementTemplateDraftState {
  return {
    id: template.id,
    title: template.title,
    stableKey: template.stableKey,
    agreementType: template.agreementType,
    agreementRole: String(template.metadata?.agreementRole ?? "Base Agreement"),
    templateSourceType: String(template.metadata?.templateSourceType ?? "structured_autofill"),
    country: template.country,
    entityType: template.entityType,
    serviceScheduleRefs: (template.serviceScheduleRefs ?? []).join(", "),
    mappedServices: Array.isArray(template.metadata?.mappedServices) ? (template.metadata.mappedServices as string[]).join(", ") : (template.serviceScheduleRefs ?? []).join(", "),
    introduction: template.introduction,
    sectionBody: String(template.sections?.[0]?.body ?? ""),
    signingPolicy: String(template.metadata?.signingPolicy ?? ""),
    priority: String(template.metadata?.priority ?? 100),
    active: template.metadata?.active !== false,
    sourceDocument: (template.metadata?.sourceDocument as Record<string, unknown> | undefined) ?? null,
  };
}

function validateAgreementTemplateUploadFile(file: File): string {
  const name = file.name.trim().toLowerCase();
  const isPdf = name.endsWith(".pdf") && file.type === "application/pdf";
  const isDocx = name.endsWith(".docx") && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!isPdf && !isDocx) return "Only PDF or DOCX agreement templates can be uploaded.";
  if (file.size <= 0) return "Choose a non-empty file.";
  if (file.size > 10 * 1024 * 1024) return "Use a file up to 10 MB.";
  return "";
}

function validateInitialAgreementTemplateDraft(draft: AgreementTemplateDraftState, uploadState: TemplateUploadState): string {
  if (!draft.title.trim()) return "Agreement name is required.";
  if (!draft.agreementRole.trim()) return "Agreement type is required.";
  if (["selected", "preparing", "uploading", "verifying"].includes(uploadState)) return "Wait for the selected file to finish uploading before saving this draft.";
  if (uploadState === "failed") return "Retry the document upload or remove the failed file before saving this draft.";
  if (!draft.sourceDocument && !draft.sectionBody.trim()) return "Add editable agreement text or upload a PDF/DOCX before saving this draft.";
  return "";
}

function formatAgreementTemplateUploadError(message: string, requestId: string): string {
  const trimmed = message.trim() || "Agreement template upload failed. Check the file and try again.";
  if (/failed to fetch|networkerror|load failed/i.test(trimmed)) {
    return `The server could not read the uploaded file. Check your connection and retry. Reference: ${requestId}`;
  }
  if (/unauthorized|sign in|session/i.test(trimmed)) {
    return `Your session has expired. Sign in again. Reference: ${requestId}`;
  }
  if (/permission|forbidden/i.test(trimmed)) {
    return `You do not have permission to upload agreement documents. Reference: ${requestId}`;
  }
  if (/too large|10 MB/i.test(trimmed)) {
    return `The file is larger than 10 MB. Choose a smaller PDF or DOCX. Reference: ${requestId}`;
  }
  if (/not a valid|does not match|PDF|DOCX|format|type/i.test(trimmed)) {
    return `${trimmed} Reference: ${requestId}`;
  }
  if (/storage|verify|verification/i.test(trimmed)) {
    return `Private document storage is temporarily unavailable or could not verify the upload. Reference: ${requestId}`;
  }
  return `${trimmed} Reference: ${requestId}`;
}

function templateReadinessChecklist(draft: AgreementTemplateDraftState): string[] {
  const missing: string[] = [];
  if (!draft.country.trim()) missing.push("Choose where this agreement applies.");
  if (!draft.entityType.trim()) missing.push("Choose who this agreement is for.");
  if (draft.agreementRole !== "Base Agreement" && !splitCsv(draft.mappedServices).length) missing.push("Choose the services covered.");
  if (!draft.sourceDocument && !draft.sectionBody.trim()) missing.push("Add agreement text or a source document.");
  if (!draft.signingPolicy.trim()) missing.push("Add signing requirements.");
  if (!draft.introduction.trim()) missing.push("Add introduction text.");
  if (renderTemplatePreview(draft).includes("Missing insert option:")) missing.push("Remove or replace unknown company detail insert options.");
  return missing;
}

function splitCsv(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function displayList(values?: string[]): string {
  return values && values.length ? values.join(", ") : "All selected services";
}

function humanAgreementStatus(value?: string): string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "published") return "Published";
  if (normalized === "draft") return "Draft changes";
  if (normalized === "archived") return "Archived";
  if (normalized === "approved") return "Approved";
  if (normalized === "scheduled") return "Scheduled";
  return humanLabel(value ?? "Current status");
}

function humanLabel(value: string): string {
  const known: Record<string, string> = {
    structured_autofill: "Editable agreement text",
    static_pdf: "Static PDF",
    docx_source: "DOCX source file",
    partner_master_services: "Partner master services agreement",
    GLOBAL: "All countries",
    ANY: "Any entity type",
  };
  if (known[value]) return known[value];
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanPlaceholderLabel(value: string): string {
  const labels: Record<string, string> = {
    "partner.legal_name": "Company legal name",
    "partner.brand_name": "Brand name",
    "partner.entity_type": "Entity type",
    "partner.registration_reference": "Registration reference",
    "partner.registered_address": "Registered address",
    "partner.country": "Country",
    "partner.authorized_signer_name": "Authorized signer",
    "partner.authorized_signer_role": "Signer role",
    "partner.selected_services": "Selected services",
    "partner.service_schedule_summary": "Service schedule summary",
    "partner.payout_country": "Payout country",
    "partner.tax_residency": "Tax residency",
    "agreement.id": "Agreement reference",
    "agreement.version": "Agreement version",
    "agreement.issue_date": "Agreement date",
    "agreement.effective_date": "Effective date",
  };
  return labels[value] ?? humanLabel(value);
}

function sourceDocumentName(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Editable agreement text";
  const filename = (value as Record<string, unknown>).filename;
  return typeof filename === "string" && filename.trim() ? filename : "Private template document";
}

function renderTemplatePreview(draft: AgreementTemplateDraftState): string {
  const samples: Record<string, string> = {
    "partner.legal_name": "Sample Partner Private Limited",
    "partner.brand_name": "Sample Partner",
    "partner.entity_type": "Private Limited",
    "partner.registration_reference": "SAMPLE-REG-0001",
    "partner.registered_address": "Sample registered address",
    "partner.country": draft.country === "GLOBAL" ? "India" : draft.country,
    "partner.authorized_signer_name": "Sample Authorized Signer",
    "partner.authorized_signer_role": "Director",
    "partner.selected_services": splitCsv(draft.mappedServices).join(", ") || "Hotel, Transport",
    "partner.service_schedule_summary": splitCsv(draft.serviceScheduleRefs).join(", ") || "Base service schedule",
    "partner.payout_country": "India",
    "partner.tax_residency": "India",
    "agreement.id": "SAMPLE-AGREEMENT-ID",
    "agreement.version": "v1",
    "agreement.issue_date": "Sample issue date",
    "agreement.effective_date": "Sample effective date",
  };
  return draft.sectionBody.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, key: string) => samples[key.trim()] ?? `Missing insert option: ${key.trim()}`);
}

function TemplateSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-blue-500">
        {options.map((option) => <option key={option} value={option}>{humanLabel(option)}</option>)}
      </select>
    </label>
  );
}

function TemplateTextArea({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <textarea value={value} maxLength={maxLength} rows={5} onChange={(event) => onChange(event.target.value.replace(/[<>]/g, ""))} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case leading-6 text-slate-900 outline-none focus:border-blue-500" />
    </label>
  );
}

function WorkflowActionBar({
  canWrite,
  canPublish,
  schedule,
  activeRow,
  busyAction,
  message,
  reviewNote,
  bypassReason,
  onScheduleChange,
  onSaveDraft,
  onPublish,
  onSchedule,
  onCancelSchedule,
  onReviewNoteChange,
  onBypassReasonChange,
  onWorkflowAction,
  onPreview,
}: {
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  reviewNote: string;
  bypassReason: string;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
  onReviewNoteChange: (value: string) => void;
  onBypassReasonChange: (value: string) => void;
  onWorkflowAction: (action: "submit" | "approve" | "request-changes" | "delete-draft" | "archive" | "restore") => void;
  onPreview: () => void;
}) {
  const workflowState = activeRow.workflowState ?? activeRow.status;
  const isDraftLike = workflowState === "draft" || workflowState === "working_changes" || workflowState === "changes_requested";
  const isInReview = workflowState === "in_review";
  const isApproved = workflowState === "approved";
  const isScheduled = workflowState === "scheduled" || Boolean(activeRow.scheduledFor);
  const isPublished = workflowState === "published" && !activeRow.hasUnpublishedChanges;
  const isArchived = workflowState === "archived";
  const previewLabel = activeRow.hasUnpublishedChanges ? "Draft Preview" : "Unsaved Preview";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-200">Item workflow</p>
          <h3 className="mt-1 text-xl font-black text-cyan-100">{workflowLabel(workflowState)}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{publishScope(activeRow.context)}. Preview is not live content.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip label={`Published v${activeRow.publishedVersion}`} tone="published" />
          <StatusChip label={`Draft v${activeRow.draftVersion}`} tone="draft" />
        </div>
      </div>

      {activeRow.review?.note ? (
        <div className="rounded-xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-semibold text-orange-100">
          Review note: {activeRow.review.note}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onPreview} className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 text-sm font-black text-cyan-100 hover:border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300">
          <Eye className="h-4 w-4" />
          Preview Changes
        </button>

        {isDraftLike ? (
          <button type="button" disabled={!canWrite || busyAction === "save"} onClick={onSaveDraft} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300">
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
        ) : null}

        {activeRow.hasUnpublishedChanges && isDraftLike ? (
          <button type="button" disabled={!canWrite || busyAction === "submit"} onClick={() => onWorkflowAction("submit")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-300/25 bg-sky-500/15 px-4 text-sm font-black text-sky-100 disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="h-4 w-4" />
            {workflowState === "changes_requested" ? "Resubmit for Approval" : "Send for Approval"}
          </button>
        ) : null}

        {isInReview && canPublish ? (
          <>
            <button type="button" disabled={busyAction === "approve"} onClick={() => onWorkflowAction("approve")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
              <BadgeCheck className="h-4 w-4" />
              Approve
            </button>
            <button type="button" disabled={busyAction === "request-changes" || !reviewNote.trim()} onClick={() => onWorkflowAction("request-changes")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-300/30 bg-orange-400/10 px-4 text-sm font-black text-orange-100 disabled:cursor-not-allowed disabled:opacity-50">
              <XCircle className="h-4 w-4" />
              Request Changes
            </button>
          </>
        ) : null}

        {isApproved && canPublish ? (
          <>
            <button type="button" disabled={busyAction === "publish"} onClick={onPublish} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
              Publish Now
            </button>
            <button type="button" disabled={busyAction === "schedule"} onClick={onSchedule} className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 text-sm font-black text-amber-100 disabled:cursor-not-allowed disabled:opacity-50">
              <CalendarClock className="h-4 w-4" />
              Schedule
            </button>
          </>
        ) : null}

        {isScheduled && canPublish ? (
          <button type="button" disabled={busyAction === "cancel-schedule"} onClick={onCancelSchedule} className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 text-sm font-black text-amber-100 disabled:cursor-not-allowed disabled:opacity-50">
            <XCircle className="h-4 w-4" />
            Cancel Schedule
          </button>
        ) : null}

        {isPublished ? (
          <button type="button" onClick={onPreview} className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 text-sm font-black text-emerald-100">
            <Globe2 className="h-4 w-4" />
            View Published
          </button>
        ) : null}

        {isArchived && canWrite ? (
          <button type="button" disabled={busyAction === "restore"} onClick={() => onWorkflowAction("restore")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 text-sm font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
            <RotateCcw className="h-4 w-4" />
            Restore as Draft
          </button>
        ) : null}
      </div>

      {(isInReview || workflowState === "changes_requested") ? (
        <Field label={isInReview ? "Review note" : "Submission note"} value={reviewNote} maxLength={500} onChange={onReviewNoteChange} />
      ) : null}

      {(isApproved || isScheduled) ? (
        <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <ScheduleField label="Publish date" type="date" value={schedule.date} onChange={(date) => onScheduleChange({ ...schedule, date })} />
            <ScheduleField label="Publish time" type="time" value={schedule.time} onChange={(time) => onScheduleChange({ ...schedule, time })} />
            <Field label="Timezone" value={schedule.timezone} maxLength={64} onChange={(timezone) => onScheduleChange({ ...schedule, timezone })} />
          </div>
          {activeRow.scheduledFor ? <p className="mt-2 text-xs font-semibold text-amber-100">Scheduled for {formatDateTime(activeRow.scheduledFor)} {activeRow.scheduledTimezone || ""}</p> : null}
        </div>
      ) : null}

      <details className="rounded-xl border border-slate-700 bg-slate-950/45 p-4">
        <summary className="cursor-pointer text-sm font-black text-slate-100">More Actions</summary>
        <div className="mt-3 space-y-3">
          {canPublish ? <Field label="Super Admin bypass reason" value={bypassReason} maxLength={500} onChange={onBypassReasonChange} /> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!canWrite || !activeRow.hasUnpublishedChanges || busyAction === "delete-draft"} onClick={() => window.confirm("This will remove only this unpublished draft. The currently published website content will remain unchanged.") && onWorkflowAction("delete-draft")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-4 text-sm font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 className="h-4 w-4" />
              Delete Draft
            </button>
            <button type="button" disabled={!canPublish || busyAction === "archive"} onClick={() => window.confirm("Archive this content through the Website Experience workflow? Historical versions and audit remain preserved.") && onWorkflowAction("archive")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300/25 bg-red-500/10 px-4 text-sm font-black text-red-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Archive className="h-4 w-4" />
              Archive
            </button>
            <button type="button" onClick={onPreview} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-4 text-sm font-black text-slate-200">
              <Clock3 className="h-4 w-4" />
              Version History
            </button>
          </div>
        </div>
      </details>

      {message ? <p className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm font-semibold text-cyan-100">{message}</p> : null}
      <p className="text-xs font-semibold text-slate-500">{previewLabel} is available in the preview panel beside this editor. It is not live content.</p>
    </div>
  );
}

function WorkflowActions({
  canWrite,
  canPublish,
  schedule,
  activeRow,
  busyAction,
  message,
  reviewNote,
  bypassReason,
  onScheduleChange,
  onSaveDraft,
  onPublish,
  onSchedule,
  onCancelSchedule,
  onReviewNoteChange,
  onBypassReasonChange,
  onWorkflowAction,
}: {
  canWrite: boolean;
  canPublish: boolean;
  schedule: typeof defaultSchedule;
  activeRow: WebsiteExperienceAdminContext;
  busyAction: string;
  message: string;
  reviewNote: string;
  bypassReason: string;
  onScheduleChange: (value: typeof defaultSchedule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
  onReviewNoteChange: (value: string) => void;
  onBypassReasonChange: (value: string) => void;
  onWorkflowAction: (action: "submit" | "approve" | "request-changes" | "delete-draft" | "archive" | "restore") => void;
}) {
  const workflowState = activeRow.workflowState ?? activeRow.status;
  return (
    <>
      <div className="grid gap-3 md:grid-cols-4">
        <WorkflowCard label="Status" value={workflowLabel(workflowState)} detail={activeRow.hasUnpublishedChanges ? "Unpublished changes exist" : "No saved draft changes"} />
        <WorkflowCard label="Draft" value={`v${activeRow.draftVersion}`} detail="Editable working version" />
        <WorkflowCard label="Published" value={`v${activeRow.publishedVersion}`} detail={activeRow.publishedAt ? formatDateTime(activeRow.publishedAt) : "Default content"} />
        <WorkflowCard label="Scheduled" value={activeRow.scheduledVersion ? `v${activeRow.scheduledVersion}` : "None"} detail={activeRow.scheduledFor ? `${formatDateTime(activeRow.scheduledFor)} ${activeRow.scheduledTimezone || ""}` : "No future publish"} />
      </div>
      {activeRow.review?.note ? (
        <div className="rounded border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-900">
          Review note: {activeRow.review.note}
        </div>
      ) : null}
      <Field label="Review note / bypass reason" value={reviewNote} maxLength={500} onChange={onReviewNoteChange} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canWrite || busyAction === "save"} onClick={onSaveDraft} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          <Save className="h-4 w-4" />
          Save Draft
        </button>
        <button type="button" disabled={!canWrite || busyAction === "submit"} onClick={() => onWorkflowAction("submit")} className="inline-flex h-10 items-center gap-2 rounded border border-cyan-300 bg-cyan-50 px-4 text-sm font-semibold text-cyan-900 disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-4 w-4" />
          Send for Approval
        </button>
        <button type="button" disabled={!canPublish || busyAction === "approve"} onClick={() => onWorkflowAction("approve")} className="inline-flex h-10 items-center gap-2 rounded bg-emerald-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200">
          <BadgeCheck className="h-4 w-4" />
          Approve
        </button>
        <button type="button" disabled={!canPublish || busyAction === "request-changes"} onClick={() => onWorkflowAction("request-changes")} className="inline-flex h-10 items-center gap-2 rounded border border-orange-300 bg-orange-50 px-4 text-sm font-semibold text-orange-900 disabled:cursor-not-allowed disabled:opacity-50">
          <XCircle className="h-4 w-4" />
          Request Changes
        </button>
        <button type="button" disabled={!canPublish || busyAction === "publish"} onClick={onPublish} className="inline-flex h-10 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-200">
          <Send className="h-4 w-4" />
          Publish Now
        </button>
      </div>
      <details className="rounded border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">Super Admin bypass and More Actions</summary>
        <div className="mt-3 space-y-3">
          <Field label="Super Admin bypass reason" value={bypassReason} maxLength={500} onChange={onBypassReasonChange} />
          <p className="text-xs leading-5 text-slate-600">Delete Draft removes only the draft. Published content remains unchanged. Archive hides a context according to the current Website Experience active flag. Restore returns an archived context to Draft.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!canWrite || busyAction === "delete-draft"} onClick={() => window.confirm("This removes only the draft. Published content remains unchanged.") && onWorkflowAction("delete-draft")} className="inline-flex h-10 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 className="h-4 w-4" />
              Delete Draft
            </button>
            <button type="button" disabled={!canPublish || busyAction === "archive"} onClick={() => window.confirm("Archive this Website Experience context? Historical versions and audit remain preserved.") && onWorkflowAction("archive")} className="inline-flex h-10 items-center gap-2 rounded border border-orange-300 bg-orange-50 px-4 text-sm font-semibold text-orange-900 disabled:cursor-not-allowed disabled:opacity-50">
              <Archive className="h-4 w-4" />
              Archive
            </button>
            <button type="button" disabled={!canWrite || busyAction === "restore"} onClick={() => onWorkflowAction("restore")} className="inline-flex h-10 items-center gap-2 rounded border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">
              <BadgeCheck className="h-4 w-4" />
              Restore to Draft
            </button>
          </div>
        </div>
      </details>
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
    <section id="website-experience-preview" className="sticky top-20 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-700" />
          <h4 className="text-sm font-semibold text-slate-950">Draft Preview</h4>
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
      <p className="mt-2 text-xs font-semibold text-slate-600">Preview Changes shows the current editor draft and never publishes content.</p>
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

function CompactEditorMetadata({ activeRow }: { activeRow: WebsiteExperienceAdminContext }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-950">Content status</h4>
      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600">
        <span>Version: Draft v{activeRow.draftVersion}</span>
        <span>Last saved: {activeRow.updatedAt ? formatDateTime(activeRow.updatedAt) : "Not available"}</span>
        <span>Last published: {activeRow.publishedAt ? formatDateTime(activeRow.publishedAt) : "Not published yet"}</span>
        <span>Updated by: recorded in central History</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Full activity is available from the central History area.</p>
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

function StatusChip({ label, tone }: { label: string; tone: "draft" | "published" | "scheduled" | "review" | "changes" | "archived" }) {
  const className = tone === "published"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : tone === "scheduled"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "review"
        ? "border-cyan-200 bg-cyan-50 text-cyan-800"
        : tone === "changes"
          ? "border-orange-200 bg-orange-50 text-orange-800"
          : tone === "archived"
            ? "border-slate-300 bg-slate-100 text-slate-700"
      : "border-blue-200 bg-blue-50 text-blue-700";
  return <span className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold ${className}`}>{label}</span>;
}

function workflowLabel(status: string) {
  if (status === "in_review") return "In Review";
  if (status === "changes_requested") return "Changes Requested";
  if (status === "working_changes") return "Working Changes";
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function workflowTone(status: string): "draft" | "published" | "scheduled" | "review" | "changes" | "archived" {
  if (status === "published" || status === "approved") return "published";
  if (status === "scheduled") return "scheduled";
  if (status === "in_review") return "review";
  if (status === "changes_requested") return "changes";
  if (status === "archived") return "archived";
  return "draft";
}

function publishScope(context: WebsiteExperienceContext) {
  if (context === "partner_application") return "Publish Partner Application content";
  return `Publish ${contextLabels[context]} changes`;
}

function partnerApplicationNodeLabel(content: WebsiteExperienceContent, selectedNodeId?: string) {
  if (!selectedNodeId) return "Partner Application";
  return content.applicationTree?.children.find((node) => node.id === selectedNodeId)?.label ?? "Partner Application Item";
}

function partnerApplicationRouteTitle(content: WebsiteExperienceContent, selectedNodeId?: string, selectedUnitId?: string, templateId?: string): string {
  if (templateId) return templateId === "new" ? "Add Agreement Template" : "Edit Agreement Template";
  if (selectedUnitId) return stepSevenUnitTitles[selectedUnitId] ?? "Step 7 Content";
  return partnerApplicationNodeLabel(content, selectedNodeId);
}

function partnerApplicationBackHref(selectedNodeId?: string, selectedUnitId?: string, templateId?: string): string {
  if (templateId) return stepSevenUnitHref("agreement-templates");
  if (selectedUnitId) return "/admin/website-experience/pages/partner/application/step-7-partner-agreement";
  if (selectedNodeId) return "/admin/website-experience/pages/partner/application";
  return "/admin/website-experience/pages/partner";
}

function partnerApplicationBackLabel(selectedNodeId?: string, selectedUnitId?: string, templateId?: string): string {
  if (templateId) return "Back to Agreement Templates";
  if (selectedUnitId) return "Back to Step 7";
  if (selectedNodeId) return "Back to Partner Application";
  return "Back to Partner";
}

function workflowRowsForView(data: WebsiteExperienceAdminResponse, view: WorkflowView) {
  if (view === "versions") return data.contexts;
  return data.contexts.filter((context) => {
    const state = context.workflowState ?? context.status;
    if (view === "drafts") return context.hasUnpublishedChanges && (state === "draft" || state === "working_changes" || state === "changes_requested");
    if (view === "scheduled") return Boolean(context.scheduledFor) || state === "scheduled";
    if (view === "published") return context.publishedVersion > 0 && state === "published";
    if (view === "archive") return state === "archived";
    return state === view;
  });
}

function catalogueWorkflowRow(catalogue: AdminPartnerServiceCatalogueResponse | null | undefined, view: WorkflowView) {
  const record = catalogue?.workflowRecord;
  if (!catalogue || !record) return null;
  const state = record.workflowState;
  const matches =
    view === "drafts" ? catalogue.hasUnpublishedChanges && (state === "draft" || state === "changes_requested")
    : view === "in_review" ? state === "in_review"
    : view === "approved" ? state === "approved"
    : false;
  if (!matches) return null;
  const domainId = record.sourceRecordId && record.sourceRecordId !== "default" ? record.sourceRecordId : catalogue.review?.domainId;
  const serviceId = catalogue.review?.scopeType === "item" ? catalogue.review?.itemCode : undefined;
  const href = serviceId
    ? `/admin/website-experience/pages/partner/service-catalogue/services/${encodeURIComponent(serviceId)}/edit`
    : domainId
    ? `/admin/website-experience/pages/partner/service-catalogue/domains/${encodeURIComponent(domainId)}/edit`
    : "/admin/website-experience/pages/partner/service-catalogue";
  const changedAt = record.changedAt ? formatDateTime(record.changedAt) : "not available";
  const scopeLabel = serviceId ? "Service changes" : "Domain changes";
  return {
    workflowState: state,
    href,
    title: serviceId ? `${record.itemService} · ${scopeLabel}` : `${record.sectionDomain} · ${scopeLabel}`,
    detail: `Draft v${record.draftVersion} - Published v${record.publishedVersion} - Changed ${changedAt}`,
  };
}

function readInitialWorkflowView(): WorkflowView | null {
  if (typeof window === "undefined") return null;
  const view = new URLSearchParams(window.location.search).get("workflow") as WorkflowView | null;
  return view && workflowViews.some((item) => item.key === view) ? view : null;
}

function readInitialContext(mode: "login-signup" | "partner-application"): WebsiteExperienceContext {
  if (mode === "partner-application") return "partner_application";
  if (typeof window === "undefined") return "user_login";
  const context = new URLSearchParams(window.location.search).get("context");
  return context === "partner_application" || context === "partner_registration" || context === "partner_login" || context === "user_login"
    ? context
    : "user_login";
}

function readInitialWorkflowDraftId(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("draftId") ?? "";
}

function agreementTemplateDraftId(templateId: string): string {
  return `agreement_template:${templateId}`;
}

function agreementTemplateCentralDraftRoute(templateId: string): string {
  return `/admin/website-experience/login-signup?workflow=drafts&context=partner_application&draftId=${encodeURIComponent(agreementTemplateDraftId(templateId))}`;
}

function centralDraftRouteFromTemplate(template: AdminAgreementTemplate): string {
  const route = typeof template.metadata?.centralDraftRoute === "string" ? template.metadata.centralDraftRoute : "";
  return route.startsWith("/admin/") ? route : agreementTemplateCentralDraftRoute(template.id);
}

function workflowDraftIdForContext(row: WebsiteExperienceAdminContext): string {
  const marker = row.draftContent.agreementTemplateDraft;
  return marker?.templateId ? agreementTemplateDraftId(marker.templateId) : row.context;
}

function workflowViewLabel(view: WorkflowView) {
  return workflowViews.find((item) => item.key === view)?.label ?? "Website Experience";
}

function statusMessage(action: "submit" | "approve" | "request-changes" | "delete-draft" | "archive" | "restore") {
  if (action === "submit") return "Sent for approval. Publish and Schedule remain controlled by authorized users.";
  if (action === "approve") return "Approved. Publish Now or Schedule can use this approved draft.";
  if (action === "request-changes") return "Changes requested. The draft returned to the editor workflow.";
  if (action === "delete-draft") return "Draft deleted. Published content remains unchanged.";
  if (action === "archive") return "Archived. History and audit remain preserved.";
  return "Restored to Draft. Publish is still required before live content changes.";
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
