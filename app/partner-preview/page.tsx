import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  Code2,
  Database,
  FileText,
  Headphones,
  KeyRound,
  LayoutDashboard,
  RefreshCcw,
  ShieldCheck,
  Users,
  Webhook,
} from "lucide-react";

const SANDBOX_MODULES = [
  { title: "Dashboard", detail: "Preview-only partner operating summary.", icon: LayoutDashboard },
  { title: "Organization Profile", detail: "Synthetic organization profile and status.", icon: Building2 },
  { title: "Inventory", detail: "Navigation placeholder. No live inventory mutation.", icon: Database },
  { title: "Rates", detail: "Navigation placeholder. No commercial rate publication.", icon: BarChart3 },
  { title: "Availability", detail: "Navigation placeholder. No production availability writes.", icon: CalendarDays },
  { title: "Content", detail: "Navigation placeholder for future moderated content.", icon: FileText },
  { title: "Bookings", detail: "Synthetic preview bookings only. No supplier booking.", icon: Activity },
  { title: "API / Integrations", detail: "Sandbox credential design placeholder.", icon: KeyRound },
  { title: "CRM / PMS", detail: "Connector readiness placeholder.", icon: Code2 },
  { title: "Webhooks", detail: "Signed webhook design placeholder.", icon: Webhook },
  { title: "Sync History", detail: "Synthetic sync status and validation readiness.", icon: RefreshCcw },
  { title: "Team", detail: "Future owner/admin/operator/read-only role model.", icon: Users },
  { title: "Support", detail: "Preview support and onboarding handoff.", icon: Headphones },
];

export default function PartnerPreviewPage() {
  if (!isPartnerPreviewSandboxEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] text-[#0f172a]">
      <section className="border-b border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-center text-[13px] font-black uppercase tracking-[0.08em] text-[#1d4ed8]">
        TEST / PREVIEW PARTNER SANDBOX - no production permissions
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 md:py-7">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:flex-row md:items-start md:justify-between md:p-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-[12px] font-black text-[#1d4ed8]">
              <ShieldCheck size={14} aria-hidden="true" />
              Isolated preview tenant
            </div>
            <h1 className="mt-3 text-[24px] font-black leading-8 text-[#0f172a] md:text-[32px] md:leading-10">
              Partner Preview Workspace
            </h1>
            <p className="mt-2 max-w-3xl text-[13px] font-semibold leading-5 text-[#64748b] md:text-[14px] md:leading-6">
              This workspace is a navigation shell for future partner operations. It uses synthetic non-PII
              preview context only and cannot publish inventory, rates, bookings, tickets, or settlement changes.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-[#d9e2ec] bg-white px-4 text-[13px] font-black text-[#334155]"
          >
            Back to TPL GO
          </Link>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <PreviewMetric label="Sandbox Org" value="TPL-PREVIEW-ORG" />
          <PreviewMetric label="Status" value="TEST / PREVIEW" />
          <PreviewMetric label="Commercial Mutations" value="DISABLED" />
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SANDBOX_MODULES.map((item) => (
            <PreviewModule key={item.title} {...item} />
          ))}
        </section>

        <section className="rounded-2xl border border-[#fecaca] bg-[#fff7f7] p-4 text-[13px] font-bold leading-5 text-[#991b1b] md:p-5">
          Sandbox rules: no production partner session, no cross-tenant access, no customer-impacting data,
          no supplier booking, no ticketing, no payment mutation, no live inventory/rate publication.
        </section>
      </div>
    </main>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d9e2ec] bg-white p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">{label}</div>
      <div className="mt-1 text-[16px] font-black text-[#0f172a]">{value}</div>
    </div>
  );
}

function PreviewModule({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <article className="rounded-xl border border-[#d9e2ec] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0b5fff]">
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-black text-[#0f172a]">{title}</h2>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748b]">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function isPartnerPreviewSandboxEnabled() {
  if (process.env.VERCEL_ENV === "production") return false;
  return process.env.PARTNER_PREVIEW_SANDBOX_ENABLED === "true";
}
