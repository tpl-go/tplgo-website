import { notFound } from "next/navigation";
import AdminProtected from "@/app/admin/_components/AdminProtected";
import AdminShell from "@/app/admin/_components/AdminShell";
import CreatorAdminOperationsShell from "./CreatorAdminOperationsShell";
import { getCreatorAdminPreview, isCreatorAdminSectionEnabled } from "@/app/lib/creators/creatorAdminService";
import type { CreatorAdminOperationRow, CreatorAdminQueueItem, CreatorAdminSection } from "@/app/lib/creators/creatorAdminTypes";

export default function CreatorAdminOperationsPage({ section }: { section: CreatorAdminSection }) {
  if (!isCreatorAdminSectionEnabled(section)) {
    notFound();
  }

  const preview = getCreatorAdminPreview(section);

  return (
    <AdminProtected>
      <AdminShell title="Creator Operations">
        <CreatorAdminOperationsShell section={section} title={preview.title}>
          <div className="space-y-5 pb-20 xl:pb-0">
            <Hero title={preview.title} />
            {section === "dashboard" ? <Dashboard /> : null}
            {section === "onboarding" || section === "profiles" || section === "profile-detail" ? <QueuePanel title="Creator onboarding operations" rows={preview.onboarding} /> : null}
            {section === "assets" || section === "asset-detail" || section === "moderation" ? <QueuePanel title="Asset moderation queue" rows={preview.assetModeration} /> : null}
            {section === "copyright" || section === "licenses" ? <QueuePanel title="Copyright and licensing operations" rows={preview.copyrightCases} /> : null}
            {section === "orders" || section === "refunds" ? <RowsPanel title="Order / payment / refund visibility" rows={preview.orders} /> : null}
            {section === "entitlements" || section === "downloads" ? <RowsPanel title="Entitlement and download monitoring" rows={preview.entitlements} /> : null}
            {section === "earnings" || section === "payouts" ? <EarningsPanel /> : null}
            {section === "reviews" || section === "disputes" ? <QueuePanel title="Reviews, disputes and support" rows={[...preview.reviews, ...preview.disputes]} /> : null}
            {section === "risk" ? <QueuePanel title="Risk and fraud readiness" rows={preview.risk} /> : null}
            {section === "categories" || section === "collections" || section === "featured" ? <RowsPanel title="Catalog operations" rows={preview.catalog} /> : null}
            {section === "analytics" || section === "reports" || section === "settings" ? <RowsPanel title="Analytics and reports" rows={preview.analytics} /> : null}
            <PermissionsPanel />
          </div>
        </CreatorAdminOperationsShell>
      </AdminShell>
    </AdminProtected>
  );
}

function Hero({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white p-5 text-slate-950">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Preview only</p>
      <div className="mt-2 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Creator Admin Operations is a hidden, read-only foundation for moderation, onboarding, copyright, licensing, orders, entitlements, downloads, earnings, disputes, risk and analytics.
          </p>
        </div>
        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">No real mutation</span>
      </div>
    </section>
  );
}

function Dashboard() {
  const preview = getCreatorAdminPreview("dashboard");
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {preview.dashboard.metrics.map((metric) => (
          <article key={metric.id} className="rounded-2xl border border-white/10 bg-white p-4 text-slate-950">
            <p className="text-xs font-black uppercase text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-black">{metric.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{metric.detail}</p>
          </article>
        ))}
      </section>
      <QueuePanel title="Moderation action queue" rows={preview.dashboard.moderationQueue} />
      <QueuePanel title="Risk alerts" rows={preview.dashboard.riskAlerts} />
      <RowsPanel title="Operational control readiness" rows={preview.dashboard.operationalRows} />
    </>
  );
}

function QueuePanel({ title, rows }: { title: string; rows: CreatorAdminQueueItem[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white text-slate-950">
      <PanelHeader title={title} />
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">{row.owner}</p>
                <h3 className="mt-1 text-base font-black">{row.title}</h3>
              </div>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{row.detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">Priority: {row.priority}</span>
              {row.riskSignal ? <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">{row.riskSignal}</span> : null}
              <DisabledAction label="Mutation disabled" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RowsPanel({ title, rows }: { title: string; rows: CreatorAdminOperationRow[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white text-slate-950">
      <PanelHeader title={title} />
      <div className="overflow-x-auto p-4">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Area</th>
              <th className="px-3 py-3">Operation</th>
              <th className="px-3 py-3">Read model</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-3 font-black text-slate-700">{row.area}</td>
                <td className="px-3 py-3">{row.item}</td>
                <td className="px-3 py-3">
                  <p className="font-black">{row.value}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{row.detail}</p>
                </td>
                <td className="px-3 py-3"><StatusPill status={row.status} /></td>
                <td className="px-3 py-3"><DisabledAction label="Read only" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EarningsPanel() {
  const { earnings } = getCreatorAdminPreview("earnings");
  return (
    <section className="rounded-2xl border border-white/10 bg-white text-slate-950">
      <PanelHeader title="Creator earnings and payout readiness" />
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(earnings)
          .filter(([key]) => !["providerPending", "previewOnly"].includes(key))
          .map(([key, value]) => (
            <article key={key} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-black uppercase text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="mt-2 text-xl font-black">₹{Number(value).toLocaleString("en-IN")}</p>
            </article>
          ))}
      </div>
    </section>
  );
}

function PermissionsPanel() {
  const permissions = getCreatorAdminPreview("dashboard").permissions;
  const disabled = Object.entries(permissions).filter(([, value]) => value === false);
  return (
    <section className="rounded-2xl border border-white/10 bg-white text-slate-950">
      <PanelHeader title="Mutation safety" />
      <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {disabled.map(([key]) => (
          <span key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">{key}: false</span>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ title }: { title: string }) {
  return <div className="border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-black">{title}</h2></div>;
}

function StatusPill({ status }: { status: string }) {
  return <span className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-black text-cyan-700">{status.replace(/_/g, " ")}</span>;
}

function DisabledAction({ label }: { label: string }) {
  return <button type="button" disabled className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-400">{label}</button>;
}
