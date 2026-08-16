import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Film,
  HeartHandshake,
  Home,
  Hotel,
  KeyRound,
  LayoutDashboard,
  MapPinned,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  Webhook,
} from "lucide-react";
import { isPartnerDeskPreviewEnabled } from "../lib/partner/partnerPreviewGate";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Organization", icon: Building2 },
  { label: "Services", icon: Store },
  { label: "Team", icon: Users },
  { label: "Onboarding", icon: ClipboardCheck },
  { label: "Verification", icon: BadgeCheck },
  { label: "Integrations", icon: Webhook },
  { label: "Analytics", icon: BarChart3 },
  { label: "Support", icon: HeartHandshake },
];

const SERVICE_GROUPS = [
  {
    title: "Travel & Stay",
    icon: Hotel,
    items: ["Hotels", "Homestays", "Travel Agency / DMC"],
  },
  {
    title: "Mobility",
    icon: MapPinned,
    items: ["Cab", "Bus", "Bike", "Helicopter", "Shikara / local transport"],
  },
  {
    title: "Experiences",
    icon: Activity,
    items: ["Activities", "Adventure", "Local Life", "Guides / experiences"],
  },
  {
    title: "Tourism Themes",
    icon: Home,
    items: ["Rural / Agro Tourism", "Eco Tourism", "Wellness"],
  },
  {
    title: "Specialized Services",
    icon: Settings2,
    items: ["Medical Tourism", "Marketplace Seller"],
  },
  {
    title: "Destination Wedding",
    icon: HeartHandshake,
    items: [
      "Venues",
      "Hotels / Resorts",
      "Wedding Planners",
      "Decorators",
      "Catering",
      "Photography / Videography",
      "Makeup / Styling",
      "Artists / Entertainment",
      "Transport / Logistics",
    ],
  },
  {
    title: "Shooting / Film / OTT",
    icon: Film,
    items: [
      "Shooting Locations",
      "Location Facilitation",
      "Permissions Support",
      "Accommodation",
      "Transport",
      "Local Crew",
      "Equipment / Production Support",
      "Production Services",
    ],
  },
];

const READINESS_STEPS = [
  { label: "Personal TPL Identity", status: "Identity ready", state: "ready" },
  { label: "Partner Candidate", status: "Capability foundation ready", state: "ready" },
  { label: "Organization Membership", status: "Not implemented in D28E3", state: "pending" },
  { label: "Verification", status: "Not configured", state: "pending" },
  { label: "Service Scopes", status: "Preview categories only", state: "pending" },
];

export default function PartnerPreviewPage() {
  if (!isPartnerDeskPreviewEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="border-b border-[#dbe3ef] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f766e] text-white">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#0f766e]">
                Preview / Development
              </p>
              <h1 className="text-[20px] font-black leading-7 text-[#111827] sm:text-[24px]">
                TPL Partner Desk
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cfd8e3] bg-white px-4 text-[13px] font-black text-[#334155] transition hover:border-[#94a3b8]"
          >
            Back to TPL GO
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-6">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <nav className="grid gap-1 rounded-lg border border-[#dbe3ef] bg-white p-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex h-10 items-center gap-3 rounded-md px-3 text-left text-[13px] font-bold text-[#475569] transition hover:bg-[#eef6f5] hover:text-[#0f766e]"
              >
                <item.icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="grid gap-5">
          <section className="rounded-lg border border-[#dbe3ef] bg-white p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#99f6e4] bg-[#ecfdf5] px-3 py-1 text-[12px] font-black text-[#0f766e]">
                  <CheckCircle2 size={14} aria-hidden="true" />
                  Preview shell active
                </div>
                <h2 className="mt-4 text-[24px] font-black leading-8 text-[#111827] sm:text-[34px] sm:leading-10">
                  Partner operations readiness workspace
                </h2>
                <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-6 text-[#64748b]">
                  This D28E3 surface shows the future partner operating model without granting supplier permissions,
                  inventory publication, payment mutation, ticketing, refunds, or organization RBAC.
                </p>
              </div>
              <div className="grid gap-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-4">
                <StatusLine label="Runtime" value="Vercel Preview / Development" />
                <StatusLine label="Production access" value="Blocked by server gate" />
                <StatusLine label="Commercial mutations" value="Disabled" />
                <StatusLine label="Organization RBAC" value="Deferred to D28E5" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-[#dbe3ef] bg-white p-5">
              <h2 className="text-[18px] font-black text-[#111827]">Unified identity state</h2>
              <div className="mt-4 grid gap-3">
                {READINESS_STEPS.map((step) => (
                  <div key={step.label} className="flex gap-3 rounded-lg border border-[#e2e8f0] p-3">
                    <div
                      className={
                        step.state === "ready"
                          ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#15803d]"
                          : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]"
                      }
                    >
                      <CheckCircle2 size={14} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-black text-[#111827]">{step.label}</h3>
                      <p className="mt-1 text-[12px] font-bold leading-5 text-[#64748b]">{step.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#dbe3ef] bg-white p-5">
              <h2 className="text-[18px] font-black text-[#111827]">Context architecture</h2>
              <div className="mt-4 grid gap-3">
                <ContextPill label="Personal" status="Current TPL identity" tone="ready" />
                <ContextPill label="Creator" status="Existing Creator capability compatible" tone="ready" />
                <ContextPill label="Partner" status="Candidate preview only" tone="pending" />
              </div>
              <p className="mt-4 text-[12px] font-bold leading-5 text-[#64748b]">
                No client-side context selector grants authorization. Future partner permissions require server-side
                organization membership and service scopes.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[#dbe3ef] bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[18px] font-black text-[#111827]">Future service scope preview</h2>
                <p className="mt-1 text-[13px] font-bold leading-5 text-[#64748b]">
                  Category readiness only. No active supplier inventory exists in this shell.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">
                <KeyRound size={13} aria-hidden="true" />
                Permissions not issued
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SERVICE_GROUPS.map((group) => (
                <article key={group.title} className="rounded-lg border border-[#e2e8f0] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef6f5] text-[#0f766e]">
                      <group.icon size={17} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-black text-[#111827]">{group.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[#dbe3ef] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-bold text-[#475569]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px] font-bold">
      <span className="text-[#92400e]">{label}</span>
      <span className="text-right text-[#111827]">{value}</span>
    </div>
  );
}

function ContextPill({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: "ready" | "pending";
}) {
  return (
    <div className="rounded-lg border border-[#e2e8f0] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-black text-[#111827]">{label}</span>
        <span
          className={
            tone === "ready"
              ? "rounded-full bg-[#dcfce7] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#15803d]"
              : "rounded-full bg-[#f1f5f9] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#64748b]"
          }
        >
          {tone === "ready" ? "Ready" : "Preview"}
        </span>
      </div>
      <p className="mt-1 text-[12px] font-bold leading-5 text-[#64748b]">{status}</p>
    </div>
  );
}
