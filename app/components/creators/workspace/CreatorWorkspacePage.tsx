import { notFound } from "next/navigation";
import CreatorWorkspaceShell from "./CreatorWorkspaceShell";
import { getCreatorWorkspacePreview, isCreatorWorkspaceSectionEnabled } from "@/app/lib/creators/creatorWorkspaceService";
import type { CreatorWorkspaceSection } from "@/app/lib/creators/creatorWorkspaceTypes";

const titles: Record<CreatorWorkspaceSection, string> = {
  dashboard: "Dashboard",
  onboarding: "Creator Onboarding",
  profile: "Creator Profile",
  assets: "Asset Manager",
  "asset-wizard": "Asset Creation Wizard",
  uploads: "Upload Preview",
  "media-library": "Media Library",
  collections: "Collections Manager",
  versions: "Asset Versions",
  orders: "Orders Preview",
  earnings: "Earnings Preview",
  analytics: "Analytics Preview",
  reviews: "Reviews Preview",
  licenses: "License Insights",
  notifications: "Notifications Preview",
  settings: "Settings Foundation",
  support: "Support Preview",
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CreatorWorkspacePage({ section }: { section: CreatorWorkspaceSection }) {
  if (!isCreatorWorkspaceSectionEnabled(section)) notFound();
  const preview = getCreatorWorkspacePreview(section);

  return (
    <CreatorWorkspaceShell section={section} title={titles[section]}>
      <div className="grid gap-5">
        <Hero title={titles[section]} subtitle="Hidden Creator Studio foundation. Preview data only; all mutations are disabled." />
        {section === "dashboard" ? <DashboardView preview={preview} /> : null}
        {section === "onboarding" ? <OnboardingView /> : null}
        {section === "profile" ? <ProfileView preview={preview} /> : null}
        {section === "assets" || section === "media-library" ? <AssetManagerView preview={preview} /> : null}
        {section === "asset-wizard" ? <WizardView /> : null}
        {section === "uploads" ? <UploadView preview={preview} /> : null}
        {section === "collections" ? <CollectionView preview={preview} /> : null}
        {section === "versions" ? <VersionView preview={preview} /> : null}
        {section === "orders" ? <OrdersView preview={preview} /> : null}
        {section === "earnings" ? <EarningsView preview={preview} /> : null}
        {section === "analytics" ? <AnalyticsView preview={preview} /> : null}
        {section === "reviews" ? <ReviewsView preview={preview} /> : null}
        {section === "licenses" ? <LicenseView preview={preview} /> : null}
        {section === "notifications" || section === "settings" || section === "support" ? <SimpleOperationalView section={section} /> : null}
      </div>
    </CreatorWorkspaceShell>
  );
}

function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">TPL Creator Studio</p>
      <h1 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-300">{subtitle}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function DashboardView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Published" value={preview.dashboard.statusSummary.published} />
        <Metric label="Pending review" value={preview.dashboard.statusSummary.under_review} />
        <Metric label="Downloads preview" value={preview.dashboard.totalDownloadsPreview.toLocaleString("en-IN")} />
        <Metric label="Sales preview" value={preview.dashboard.totalSalesPreview.toLocaleString("en-IN")} />
      </div>
      <AssetManagerView preview={preview} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ListPanel title="Recent orders" items={preview.orders.map((order) => `${order.assetTitle} - ₹${order.amount.toLocaleString("en-IN")} - ${order.paymentState}`)} />
        <ListPanel title="Quality alerts" items={[...preview.dashboard.qualityAlerts, ...preview.dashboard.aiSuggestions]} />
      </div>
    </>
  );
}

function OnboardingView() {
  const steps = ["Creator identity", "Display name and profile", "Creator type", "Expertise/categories", "Portfolio links", "Tax readiness", "Bank/payout readiness", "Agreement acceptance", "Copyright declaration", "Review submission preview"];
  return <ListPanel title="Onboarding steps" items={steps.map((step, index) => `${index + 1}. ${step} - preview only`)} />;
}

function ProfileView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title={preview.profile.displayName} items={[preview.profile.bio, `Status: ${preview.profile.status}`, `Skills: ${preview.profile.skills.join(", ")}`, `Shared TPL identity: ${preview.identity.usesSharedTplIdentity}`]} />;
}

function AssetManagerView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-slate-950">Assets</h2>
        <p className="text-sm font-bold text-slate-500">List/grid, search, filters and bulk actions are preview-only.</p>
      </div>
      <div className="grid gap-3 p-4">
        {preview.assets.map((asset) => (
          <article key={asset.assetId} className="grid gap-3 rounded-2xl border border-stone-200 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-base font-black text-slate-950">{asset.title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">{formatLabel(asset.assetType)} · {asset.category} · v{asset.version}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full bg-stone-100 px-3 py-2 text-slate-700">{formatLabel(asset.status)}</span>
              <span className="rounded-full bg-cyan-50 px-3 py-2 text-cyan-800">{formatLabel(asset.moderationState)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function WizardView() {
  const steps = ["Asset type", "Basic information", "Category and tags", "Preview media", "Source files", "Technical specifications", "License selection", "Pricing", "Copyright and releases", "AI disclosure", "Support/version policy", "Review and submit"];
  return <ListPanel title="Asset creation wizard" items={steps.map((step) => `${step} - no submit or publish mutation`)} />;
}

function UploadView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Upload preview states" items={preview.uploads.map((upload) => `${upload.fileName} - ${formatLabel(upload.status)} - Upload allowed: ${upload.uploadAllowed}`)} />;
}

function CollectionView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Collections manager" items={preview.collections.map((collection) => `${collection.title} - ${formatLabel(collection.publishStatus)} - Bundle readiness: ${collection.bundleReadiness}`)} />;
}

function VersionView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Version manager" items={preview.versions.map((version) => `${version.semanticVersion} - ${formatLabel(version.status)} - ${formatLabel(version.buyerAccessPolicy)}`)} />;
}

function OrdersView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Orders and sales preview" items={preview.orders.map((order) => `${order.orderId} - ${formatLabel(order.license)} - ${formatLabel(order.entitlementState)} - no buyer PII`)} />;
}

function EarningsView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Metric label="Gross sales preview" value={`₹${preview.earnings.grossSales.toLocaleString("en-IN")}`} />
      <Metric label="Creator share preview" value={`₹${preview.earnings.creatorShare.toLocaleString("en-IN")}`} />
      <Metric label="Payout pending preview" value={`₹${preview.earnings.payoutPending.toLocaleString("en-IN")}`} />
    </div>
  );
}

function AnalyticsView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Analytics preview" items={[`License mix: ${JSON.stringify(preview.dashboard.licenseMix)}`, `Geography: ${preview.dashboard.geographicDemandPreview.map((item) => `${item.country} ${item.demand}%`).join(", ")}`, `Trending: ${preview.dashboard.trendingCategories.join(", ")}`]} />;
}

function ReviewsView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="Reviews preview" items={preview.reviews.map((review) => `${review.rating}/5 - ${review.text} - responseReady:${review.creatorResponseReady}`)} />;
}

function LicenseView({ preview }: { preview: ReturnType<typeof getCreatorWorkspacePreview> }) {
  return <ListPanel title="License insights" items={Object.entries(preview.dashboard.licenseMix).map(([license, value]) => `${license}: ${value}% preview mix`)} />;
}

function SimpleOperationalView({ section }: { section: CreatorWorkspaceSection }) {
  return <ListPanel title={`${section} foundation`} items={["Preview data only", "No mutation", "No separate account", "No notification send", "No support identity duplication"]} />;
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-stone-50 px-4 py-3 text-sm font-bold leading-6 text-slate-700 ring-1 ring-transparent transition hover:bg-stone-100 hover:ring-stone-200">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
