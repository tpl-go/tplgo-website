"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, FileSearch, ListChecks, PlayCircle, RefreshCcw, Send, ShieldCheck } from "lucide-react";
import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { adminApiRequest, readAdminSession } from "../../../lib/admin/adminApiClient";

type PolicyRule = {
  stableRequirementCode: string;
  displayLabel: string;
  partnerExplanation: string;
  adminReviewGuidance: string;
  evidenceType: string;
  owner: string;
  necessity: "REQUIRED_NOW" | "BEFORE_ACTIVATION" | "IF_APPLICABLE" | "OPTIONAL";
  activationBlocking: boolean;
  reviewDepth: "TWO_LEVEL" | "THREE_LEVEL";
  displayOrder: number;
  active: boolean;
  archived: boolean;
  serviceProfiles?: string[];
  country?: string;
};

type PolicyView = {
  published: { humanName: string; version: string; status: string; effectiveFrom: string; updatedAt: string };
  draft: { version: string; status: string } | null;
  pendingApproval: { version: string; status: string } | null;
  scheduled: { version: string; status: string } | null;
  groups: Array<{ key: string; name: string; coverage: string; requirementCount: number; status: string; lastUpdated: string; rules: PolicyRule[] }>;
  totals: { activeRequirements: number; conflicts: number; validationIssues: string[] };
  permissions: { canRead: boolean; canManage: boolean; canApprove: boolean; canPublish: boolean };
  nextActions: string[];
};

type PreviewResult = { preview: Array<{ requirementCode: string; title: string; description: string; priority: string; metadata: Record<string, unknown> }>; writesPartnerData: boolean; uploadsDocuments: boolean };

export default function VerificationRulesPage() {
  return <AdminProtected><AdminShell title="Verification Rules"><VerificationRulesClient /></AdminShell></AdminProtected>;
}

function VerificationRulesClient() {
  const [policy, setPolicy] = useState<PolicyView | null>(null);
  const [message, setMessage] = useState("Loading verification rules.");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const permissions = readAdminSession()?.admin.permissions ?? [];
  const localCanRead = hasPermission(permissions, "partner_verification_policy.read");
  const activeGroup = useMemo(() => policy?.groups[0] ?? null, [policy]);

  async function load() {
    const result = await adminApiRequest<PolicyView>("/api/v1/admin/partner-verification/policies");
    if (result.ok) { setPolicy(result.data); setMessage(""); return; }
    if (result.error.code === "ADMIN_UNAUTHORIZED" || result.error.code === "ADMIN_FORBIDDEN") setMessage("You do not have access to Verification Rules.");
    else setMessage(result.error.message);
  }

  async function transition(path: string, label: string) {
    const result = await adminApiRequest<PolicyView>(path, { method: "POST", body: JSON.stringify({}) });
    if (result.ok) { setPolicy(result.data); setMessage(`${label} completed.`); return; }
    setMessage(result.error.message);
  }

  async function runPreview() {
    const result = await adminApiRequest<PreviewResult>("/api/v1/admin/partner-verification/policies/preview", {
      method: "POST",
      body: JSON.stringify({ country: "India", organizationType: "Private Limited", services: [{ serviceCode: "qa-yatra-operator", serviceLabel: "QA Yatra Operator", verificationProfileKey: "travel_yatra_operator", metadata: { verificationProfileKey: "travel_yatra_operator" } }], useDraft: Boolean(policy?.draft) }),
    });
    if (result.ok) { setPreview(result.data); setMessage("Preview calculated without Partner writes or document upload."); return; }
    setMessage(result.error.message);
  }

  if (message && !policy && !localCanRead) return <AccessDenied />;

  return (
    <div className="space-y-5 text-slate-100" data-verification-rules-page="true">
      <header className="rounded-2xl border border-sky-300/15 bg-[#101827] p-4 shadow-2xl shadow-black/20">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Admin breadcrumbs">
          <Link href="/admin" className="hover:text-sky-200">Admin</Link><span>/</span>
          <Link href="/admin/partners" className="hover:text-sky-200">Partners</Link><span>/</span>
          <Link href="/admin/partner-verification" className="hover:text-sky-200">Verification & Compliance</Link><span>/</span>
          <span className="text-slate-200">Verification Rules</span>
        </nav>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin/partner-verification" className="inline-flex items-center gap-2 text-xs font-black text-sky-200"><ArrowLeft className="h-4 w-4" /> Back to Partner Reviews</Link>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Verification Rules</h1>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-400">Manage which checks and documents Partners must complete.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 text-sm font-black text-sky-100"><RefreshCcw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/partner-verification" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-slate-300">Partner Reviews</Link>
        <span className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100">Verification Rules</span>
      </div>

      {message ? <p className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">{message}</p> : null}
      {policy ? <PolicyHome policy={policy} activeGroup={activeGroup} onPreview={runPreview} onDraft={() => transition("/api/v1/admin/partner-verification/policies/draft", "Draft created")} onSubmit={() => transition("/api/v1/admin/partner-verification/policies/approval/submit", "Sent for approval")} onApprove={() => transition("/api/v1/admin/partner-verification/policies/approval/approve", "Approval")} onPublish={() => transition("/api/v1/admin/partner-verification/policies/publish", "Publish")} /> : null}
      {preview ? <PreviewPanel preview={preview} /> : null}
    </div>
  );
}

function PolicyHome({ policy, activeGroup, onPreview, onDraft, onSubmit, onApprove, onPublish }: { policy: PolicyView; activeGroup: PolicyView["groups"][number] | null; onPreview: () => void; onDraft: () => void; onSubmit: () => void; onApprove: () => void; onPublish: () => void }) {
  const action = nextAction(policy);
  return <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5" data-policy-workflow="true">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Published policy version</p>
      <h2 className="mt-2 text-xl font-black text-white">{policy.published.version}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-400">Draft changes do not affect Partner Step 5 until approved and published.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric icon={CheckCircle2} label="Active requirements" value={policy.totals.activeRequirements} />
        <Metric icon={Clock} label="Validation issues" value={policy.totals.conflicts} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onPreview} className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 text-sm font-black text-sky-100"><FileSearch className="h-4 w-4" /> Preview requirements</button>
        {action === "Create draft" && policy.permissions.canManage ? <button type="button" onClick={onDraft} className="primaryAction"><PlayCircle className="h-4 w-4" /> Create draft</button> : null}
        {action === "Send for approval" && policy.permissions.canManage ? <button type="button" onClick={onSubmit} className="primaryAction"><Send className="h-4 w-4" /> Send for approval</button> : null}
        {action === "Approve" && policy.permissions.canApprove ? <button type="button" onClick={onApprove} className="primaryAction"><CheckCircle2 className="h-4 w-4" /> Approve</button> : null}
        {action === "Publish now" && policy.permissions.canPublish ? <button type="button" onClick={onPublish} className="primaryAction"><ShieldCheck className="h-4 w-4" /> Publish now</button> : null}
      </div>
    </section>
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5" data-policy-groups="true">
      <h2 className="text-lg font-black text-cyan-100">Policy groups</h2>
      <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
        {policy.groups.map((group) => <div key={group.key} className="grid gap-2 bg-[#0b1220] p-4 text-sm md:grid-cols-[1fr_180px_140px_90px] md:items-center">
          <div><p className="font-black text-white">{group.name}</p><p className="mt-1 text-xs font-semibold text-slate-400">{group.coverage}</p></div>
          <p className="font-semibold text-sky-300/80">{group.requirementCount} requirements</p>
          <Status text={group.status} />
          <span className="font-black text-orange-200">Open</span>
        </div>)}
      </div>
    </section>
    {activeGroup ? <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 xl:col-span-2" data-requirement-list="true">
      <h2 className="text-lg font-black text-cyan-100">Requirement list</h2>
      <div className="mt-4 space-y-3">{activeGroup.rules.map((rule) => <article key={rule.stableRequirementCode + rule.displayLabel} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="text-base font-black text-white">{rule.displayLabel}</p><p className="mt-1 text-sm font-semibold text-slate-400">{rule.partnerExplanation}</p></div><Status text={necessityLabel(rule.necessity)} /></div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-sky-300/80"><span>{rule.reviewDepth === "THREE_LEVEL" ? "Three-level review" : "Two-level review"}</span><span>{rule.activationBlocking ? "Blocks activation" : "Does not block activation"}</span><span>{rule.evidenceType}</span></div>
      </article>)}</div>
    </section> : null}
  </div>;
}

function PreviewPanel({ preview }: { preview: PreviewResult }) {
  return <section className="rounded-2xl border border-cyan-300/20 bg-[#111827] p-5" data-policy-preview="true">
    <h2 className="text-lg font-black text-cyan-100">Policy preview simulator</h2>
    <p className="mt-1 text-sm font-semibold text-slate-400">Preview creates no Partner records, document uploads or external verification.</p>
    <div className="mt-4 space-y-2">{preview.preview.map((item) => <div key={item.requirementCode} className="rounded-xl border border-white/10 bg-[#0b1220] p-3"><p className="font-black text-white">{item.title}</p><p className="text-sm text-slate-400">{item.description}</p><p className="mt-1 text-xs font-black text-orange-200">{String(item.metadata.reviewDepth)} · {String(item.metadata.requirementStage)}</p></div>)}</div>
  </section>;
}

function AccessDenied() { return <AdminProtected><AdminShell title="Verification Rules"><section className="rounded-2xl border border-amber-300/25 bg-[#111827] p-6"><p className="text-lg font-black text-white">You do not have access to Verification Rules.</p><Link href="/admin/partner-verification" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 text-sm font-black text-sky-100"><ArrowLeft className="h-4 w-4" /> Back to Verification & Compliance</Link></section></AdminShell></AdminProtected>; }
function Metric({ icon: Icon, label, value }: { icon: typeof ListChecks; label: string; value: number }) { return <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3"><Icon className="h-4 w-4 text-cyan-200" /><p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-sky-300/70">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>; }
function Status({ text }: { text: string }) { return <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">{text}</span>; }
function nextAction(policy: PolicyView) { return policy.nextActions.find((item) => ["Create draft", "Send for approval", "Approve", "Publish now"].includes(item)) ?? "Preview requirements"; }
function necessityLabel(value: PolicyRule["necessity"]) { if (value === "REQUIRED_NOW") return "Required now"; if (value === "BEFORE_ACTIVATION") return "Required before activation"; if (value === "OPTIONAL") return "Optional"; return "Only if applicable"; }
function hasPermission(permissions: string[], permission: string) { return permissions.includes(permission) || permissions.includes("admin.super") || permissions.includes("*"); }


