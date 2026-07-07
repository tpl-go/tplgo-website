"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Clapperboard,
  FolderKanban,
  Globe2,
  Images,
  Inbox,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Tags,
  UserRoundCheck,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminCreatorDetail,
  getAdminCreators,
  type AdminApiError,
  type AdminCreatorAnalyticsItem,
  type AdminCreatorCampaignItem,
  type AdminCreatorDashboard,
  type AdminCreatorDetail,
  type AdminCreatorFoundationItem,
  type AdminCreatorListRow,
  type AdminCreatorMediaItem,
  type AdminCreatorMetric,
  type AdminCreatorStatus,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: AdminCreatorDashboard; error: null }
  | { status: "ready"; data: AdminCreatorDashboard; error: null }
  | { status: "error"; data: AdminCreatorDashboard; error: AdminApiError };

type DetailState =
  | { status: "idle"; data: AdminCreatorDetail | null; error: null }
  | { status: "loading"; data: AdminCreatorDetail | null; error: null }
  | { status: "ready"; data: AdminCreatorDetail; error: null }
  | { status: "error"; data: AdminCreatorDetail | null; error: AdminApiError };

const emptyDashboard: AdminCreatorDashboard = {
  metrics: [],
  creators: [],
  media: [],
  campaigns: [],
  analytics: [],
  workspace: [],
  studio: [],
  marketplace: [],
  moderation: [],
  ecosystem: [],
  executive: [],
  identity: [],
  studioOperations: [],
  marketplaceOperations: [],
  executiveAnalytics: [],
  campaignOperations: [],
  communicationCenter: [],
  financialCenter: [],
  creatorCrm: [],
  reports: [],
  search: [],
  businessCenter: [],
  assetLifecycle: [],
  marketplaceIntelligence: [],
  aiCreatorStudio: [],
  businessIntelligence: [],
  travelCreatorNetwork: [],
  creatorReputation: [],
  mobileReadiness: [],
  enterpriseReports: [],
  deepEcosystemIntelligence: [],
};

export function AdminCreatorsCenter() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: emptyDashboard, error: null });
  const [detail, setDetail] = useState<DetailState>({ status: "idle", data: null, error: null });

  function openDetail(creatorId: string) {
    setDetail((current) => ({ status: "loading", data: current.data, error: null }));
    void getAdminCreatorDetail(creatorId).then((result) => {
      setDetail(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: null, error: result.error });
    });
  }

  useEffect(() => {
    let active = true;
    void getAdminCreators().then((result) => {
      if (!active) return;
      setState(result.ok ? { status: "ready", data: result.data, error: null } : { status: "error", data: emptyDashboard, error: result.error });
      if (result.ok && result.data.creators[0]) {
        openDetail(result.data.creators[0].creatorId);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const data = state.data;

  return (
    <div className="space-y-6">
      <Hero />

      {state.status === "error" ? <Notice tone="danger" text={state.error.message} /> : null}
      {state.status === "loading" ? <Notice tone="neutral" text="Loading creator ecosystem read models from the admin API." /> : null}
      {detail.status === "error" ? <Notice tone="danger" text={detail.error.message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <div className="space-y-4">
          <PlatformSection title="Creator Executive Dashboard" icon={BarChart3} rows={data.executive} />
          <PlatformSection title="Creator Identity" icon={UserRoundCheck} rows={data.identity} />
          <CreatorIdentity rows={data.workspace} />
          <CreatorList rows={data.creators} onOpen={openDetail} />
          <CreatorStudio rows={data.studio} media={data.media} />
          <PlatformSection title="Creator Studio Operations" icon={Images} rows={data.studioOperations} />
          <CreatorMarketplace rows={data.marketplace} />
          <PlatformSection title="Creator Marketplace Operations" icon={ShoppingBag} rows={data.marketplaceOperations} />
          <MediaModeration rows={data.media} />
          <ModerationCenter rows={data.moderation} />
          <CampaignFoundation rows={data.campaigns} />
          <PlatformSection title="Campaign Operations" icon={Megaphone} rows={data.campaignOperations} />
          <PlatformSection title="Communications" icon={Inbox} rows={data.communicationCenter} />
          <PlatformSection title="Financial Center" icon={BriefcaseBusiness} rows={data.financialCenter} />
          <PlatformSection title="Creator Business Center" icon={BriefcaseBusiness} rows={data.businessCenter} />
          <PlatformSection title="Asset Lifecycle Management" icon={Video} rows={data.assetLifecycle} />
          <PlatformSection title="Marketplace Intelligence" icon={ShoppingBag} rows={data.marketplaceIntelligence} />
          <PlatformSection title="AI Creator Studio" icon={ShieldCheck} rows={data.aiCreatorStudio} />
          <PlatformSection title="Business Intelligence" icon={BarChart3} rows={data.businessIntelligence} />
          <PlatformSection title="Travel Creator Network" icon={Globe2} rows={data.travelCreatorNetwork} />
          <PlatformSection title="Creator Reputation" icon={ShieldCheck} rows={data.creatorReputation} />
          <PlatformSection title="Creator Mobile Platform Readiness" icon={Images} rows={data.mobileReadiness} />
          <PlatformSection title="Creator CRM" icon={Clapperboard} rows={data.creatorCrm} />
          <PlatformSection title="Reports" icon={FolderKanban} rows={data.reports} />
          <PlatformSection title="Enterprise Reports" icon={FolderKanban} rows={data.enterpriseReports} />
          <PlatformSection title="Enterprise Search" icon={Tags} rows={data.search} />
          <EcosystemIntegration rows={data.ecosystem} />
          <PlatformSection title="Deep Ecosystem Intelligence" icon={Globe2} rows={data.deepEcosystemIntelligence} />
        </div>
        <div className="space-y-4">
          <CreatorWorkspace detail={detail} />
          <Analytics rows={data.analytics} />
          <PlatformSection title="Executive Analytics" icon={BarChart3} rows={data.executiveAnalytics} compact />
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">TPL Ecosystem</p>
      <div className="mt-2 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">TPL Creators Admin Foundation</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only creator business platform foundation for identity, studio assets, marketplace licensing, moderation, campaigns, analytics, communications, approvals, and ecosystem integration.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          No approval, payout, media, campaign, or customer mutations
        </span>
      </div>
    </section>
  );
}

function PlatformSection({ title, icon: Icon, rows, compact = false }: { title: string; icon: LucideIcon; rows: AdminCreatorFoundationItem[]; compact?: boolean }) {
  return (
    <Panel title={title} icon={Icon}>
      {compact ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{row.item}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
                </div>
                <StatusPill status={row.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{row.value}</p>
            </article>
          ))}
        </div>
      ) : (
        <DataTable
          headers={["Area", "Capability", "Read Model", "Status", "Action"]}
          rows={rows.map((row) => [
            row.area,
            row.item,
            <div key={`${row.id}-detail`} className="max-w-xl">
              <p className="font-semibold text-slate-800">{row.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
            </div>,
            <StatusPill key={`${row.id}-status`} status={row.status} />,
            <DisabledButton key={`${row.id}-action`} label="Read only" />,
          ])}
          emptyText={`No ${title.toLowerCase()} rows returned.`}
        />
      )}
    </Panel>
  );
}

function CreatorIdentity({ rows }: { rows: AdminCreatorFoundationItem[] }) {
  return (
    <Panel title="Creator Identity & Workspace" icon={Inbox}>
      <FoundationGrid rows={rows} />
    </Panel>
  );
}

function CreatorList({ rows, onOpen }: { rows: AdminCreatorListRow[]; onOpen: (creatorId: string) => void }) {
  return (
    <Panel title="Creator List" icon={UserRoundCheck}>
      <DataTable
        headers={["Creator ID", "Name", "Category", "Status", "Verification", "Content", "Earnings", "Risk", "Open"]}
        rows={rows.map((row) => [
          row.creatorId,
          row.name,
          row.category,
          <StatusPill key={`${row.creatorId}-status`} status={row.status} />,
          <StatusPill key={`${row.creatorId}-verification`} status={row.verificationStatus} />,
          row.contentCount,
          row.earnings,
          row.riskFlag,
          <button key={`${row.creatorId}-open`} type="button" onClick={() => onOpen(row.creatorId)} className="text-xs font-semibold text-slate-700 hover:text-slate-950">Open</button>,
        ])}
        emptyText="No creator rows returned."
      />
    </Panel>
  );
}

function CreatorWorkspace({ detail }: { detail: DetailState }) {
  const data = detail.data;
  return (
    <Panel title="Creator Workspace" icon={Clapperboard}>
      {detail.status === "loading" ? <Notice tone="neutral" text="Loading creator workspace." /> : null}
      {!data ? <p className="text-sm text-slate-500">Select a creator to inspect the read-only workspace.</p> : null}
      {data ? (
        <div className="space-y-3">
          <WorkspaceSection title="Profile" rows={Object.entries(data.profile).map(([label, value]) => [label, value])} />
          <WorkspaceSection title="Workspace Home" rows={foundationRows(data.workspace)} />
          <WorkspaceSection title="Creator Studio" rows={foundationRows(data.studio)} />
          <WorkspaceSection title="Marketplace" rows={foundationRows(data.marketplace)} />
          <WorkspaceSection title="Verification" rows={analyticsRows(data.verification)} />
          <WorkspaceSection title="Content / Media" rows={data.media.map((item) => [item.title, item.mediaType, item.status])} />
          <WorkspaceSection title="Licensing" rows={analyticsRows(data.licensing)} />
          <WorkspaceSection title="Campaigns" rows={data.campaigns.map((item) => [item.campaign, item.campaignType, item.status])} />
          <WorkspaceSection title="Moderation" rows={analyticsRows(data.moderation)} />
          <WorkspaceSection title="Earnings" rows={analyticsRows(data.earnings)} />
          <WorkspaceSection title="Analytics" rows={analyticsRows(data.analytics)} />
          <WorkspaceSection title="Ecosystem Integration" rows={foundationRows(data.ecosystem)} />
          <WorkspaceSection title="Communications" rows={analyticsRows(data.communications)} />
          <WorkspaceSection title="Approvals" rows={analyticsRows(data.approvals)} />
          <WorkspaceSection title="Audit" rows={analyticsRows(data.audit)} />
        </div>
      ) : null}
    </Panel>
  );
}

function CreatorStudio({ rows, media }: { rows: AdminCreatorFoundationItem[]; media: AdminCreatorMediaItem[] }) {
  const assetTypes = Array.from(new Set(media.map((item) => item.mediaType.replace(/_/g, " ")))).join(", ") || "No assets";
  return (
    <Panel title="Creator Studio" icon={Images}>
      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">Asset preview coverage</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{assetTypes}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Upload, bulk edit, AI tagging, duplicate detection, and version actions remain disabled.</p>
      </div>
      <FoundationGrid rows={rows} />
    </Panel>
  );
}

function CreatorMarketplace({ rows }: { rows: AdminCreatorFoundationItem[] }) {
  return (
    <Panel title="Creator Marketplace" icon={ShoppingBag}>
      <FoundationGrid rows={rows} />
    </Panel>
  );
}

function MediaModeration({ rows }: { rows: AdminCreatorMediaItem[] }) {
  return (
    <Panel title="Media Moderation Foundation" icon={Video}>
      <DataTable
        headers={["Title", "Creator", "Type", "Status", "License", "Actions"]}
        rows={rows.map((row) => [
          row.title,
          row.creatorId,
          row.mediaType.replace(/_/g, " "),
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <StatusPill key={`${row.id}-license`} status={row.licenseStatus} />,
          <div key={`${row.id}-actions`} className="flex gap-2">
            <DisabledButton label="Approve disabled" />
            <DisabledButton label="Reject disabled" />
          </div>,
        ])}
        emptyText="No creator media returned."
      />
    </Panel>
  );
}

function ModerationCenter({ rows }: { rows: AdminCreatorAnalyticsItem[] }) {
  return (
    <Panel title="Moderation Center" icon={ShieldCheck}>
      <DataTable
        headers={["Signal", "Value", "Status", "Action"]}
        rows={rows.map((row) => [
          row.metric,
          row.value,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-action`} label="Review disabled" />,
        ])}
        emptyText="No moderation read-model rows returned."
      />
    </Panel>
  );
}

function CampaignFoundation({ rows }: { rows: AdminCreatorCampaignItem[] }) {
  return (
    <Panel title="Campaign Center" icon={Megaphone}>
      <DataTable
        headers={["Campaign", "Type", "Creator", "Status", "Action"]}
        rows={rows.map((row) => [
          row.campaign,
          row.campaignType.replace(/_/g, " "),
          row.creatorId,
          <StatusPill key={`${row.id}-status`} status={row.status} />,
          <DisabledButton key={`${row.id}-action`} label="Action disabled" />,
        ])}
        emptyText="No creator campaigns returned."
      />
    </Panel>
  );
}

function EcosystemIntegration({ rows }: { rows: AdminCreatorFoundationItem[] }) {
  return (
    <Panel title="Creator Ecosystem Integration" icon={Globe2}>
      <FoundationGrid rows={rows} />
    </Panel>
  );
}

function Analytics({ rows }: { rows: AdminCreatorAnalyticsItem[] }) {
  return (
    <Panel title="Creator Analytics Foundation" icon={BarChart3}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.metric}</p>
                <p className="mt-1 text-xs text-slate-500">{row.detail}</p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950">{row.value}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function FoundationGrid({ rows }: { rows: AdminCreatorFoundationItem[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {rows.length === 0 ? <p className="text-sm text-slate-500">No foundation rows returned.</p> : null}
      {rows.map((row) => (
        <article key={row.id} className="rounded border border-slate-200 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{row.area}</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{row.item}</p>
            </div>
            <StatusPill status={row.status} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{row.value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
          <div className="mt-3 flex items-center gap-2">
            <Tags className="h-4 w-4 text-slate-400" />
            <DisabledButton label="Action disabled" />
          </div>
        </article>
      ))}
    </div>
  );
}

function WorkspaceSection({ title, rows }: { title: string; rows: Array<Array<ReactNode>> }) {
  return (
    <details className="rounded border border-slate-200" open>
      <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">{title}</summary>
      <div className="border-t border-slate-100 p-3">
        <DataTable headers={["Item", "Value", "Status"]} rows={rows} emptyText={`No ${title.toLowerCase()} rows returned.`} />
      </div>
    </details>
  );
}

function MetricCard({ metric }: { metric: AdminCreatorMetric }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-700">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{metric.detail}</p>
    </article>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DataTable({ headers, rows, emptyText }: { headers: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={headers.length}>{emptyText}</td>
            </tr>
          ) : null}
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="hover:bg-slate-50">
              {row.map((cell, cellIndex) => <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-3 text-slate-600">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: AdminCreatorStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status.replace(/_/g, " ")}</span>;
}

function DisabledButton({ label }: { label: string }) {
  return <button type="button" disabled className="h-8 rounded border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-400">{label}</button>;
}

function Notice({ tone, text }: { tone: "danger" | "neutral"; text: string }) {
  const className = tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600";
  return <div className={`rounded border px-4 py-3 text-sm ${className}`}>{text}</div>;
}

function analyticsRows(rows: AdminCreatorAnalyticsItem[]): Array<Array<ReactNode>> {
  return rows.map((row) => [row.metric, row.value, <StatusPill key={row.id} status={row.status} />]);
}

function foundationRows(rows: AdminCreatorFoundationItem[]): Array<Array<ReactNode>> {
  return rows.map((row) => [row.item, row.value, <StatusPill key={row.id} status={row.status} />]);
}

function statusClass(status: AdminCreatorStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "pending" || status === "needs_api") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}
