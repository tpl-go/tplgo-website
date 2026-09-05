"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BadgeIndianRupee,
  Bell,
  BellRing,
  BookOpen,
  Bot,
  Building2,
  ClipboardCheck,
  Clapperboard,
  CreditCard,
  Database,
  FileText,
  FileBarChart,
  FileClock,
  Gauge,
  Gift,
  Headphones,
  Landmark,
  KeyRound,
  LineChart,
  LayoutDashboard,
  Link2,
  LogOut,
  Map,
  MapPinned,
  MonitorCog,
  Network,
  Newspaper,
  Radar,
  RefreshCcw,
  Search,
  ShieldCheck,
  Shield,
  ServerCog,
  UserCog,
  Users,
  WalletCards,
  Workflow,
  Store,
} from "lucide-react";
import { adminLogout, getAdminNotificationCenter, readAdminSession, refreshAdminSession } from "../../lib/admin/adminApiClient";
import type { AdminSession } from "../../lib/admin/adminApiClient";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ecosystem", label: "Ecosystem OS", icon: Network },
  { href: "/admin/integration", label: "Integration Hub", icon: Link2 },
  { href: "/admin/creators", label: "Creators", icon: Clapperboard },
  { href: "/admin/marketplace", label: "TPL Marketplace", icon: Store },
  { href: "/admin/local-life", label: "Local Life", icon: MapPinned },
  { href: "/admin/search", label: "Enterprise Search", icon: Search },
  { href: "/admin/data-governance", label: "Data Governance", icon: Database },
  { href: "/admin/executive", label: "Executive Intelligence", icon: LineChart },
  { href: "/admin/ai", label: "AI Operations", icon: Bot },
  { href: "/admin/observability", label: "Observability", icon: Radar },
  { href: "/admin/operations", label: "Operations Intelligence", icon: Activity },
  { href: "/admin/communications", label: "Communications", icon: Bell },
  { href: "/admin/notifications", label: "Notifications", icon: BellRing },
  { href: "/admin/workflows", label: "Workflows", icon: Workflow },
  { href: "/admin/knowledge", label: "Knowledge / Runbooks", icon: FileText },
  { href: "/admin/teams", label: "Teams / RACI", icon: UserCog },
  { href: "/admin/approvals", label: "Approval / Governance", icon: ClipboardCheck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/customers", label: "Customers / CRM", icon: Users },
  { href: "/admin/offers", label: "Offers", icon: Gift },
  { href: "/admin/planner", label: "Smart Planner", icon: Map },
  { href: "/admin/content", label: "Content", icon: Newspaper },
  { href: "/admin/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/platform", label: "Platform", icon: ServerCog },
  { href: "/admin/audit", label: "Audit", icon: Activity },
  { href: "/admin/system", label: "System", icon: Gauge },
];

const partnerNavItems = [
  { href: "/admin/partners", label: "Overview", icon: Building2 },
  { href: "/admin/partners/applications", label: "Applications", icon: ClipboardCheck },
  { href: "/admin/partner-verification", label: "Verification & Compliance", icon: ShieldCheck },
  { href: "/admin/partners/organizations", label: "Organizations", icon: Users },
  { href: "/admin/partners/documents-compliance", label: "Documents & Compliance", icon: FileText },
];

const websiteContentNavItems = [
  { href: "/admin/website-experience", label: "Website Experience", icon: MonitorCog, permission: "content.read" },
];

const financeNavItems = [
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/refunds", label: "Refunds", icon: RefreshCcw },
  { href: "/admin/wallets", label: "Wallet", icon: WalletCards },
  { href: "/admin/ledger", label: "Ledger", icon: FileClock },
  { href: "/admin/settlement", label: "Settlement", icon: Landmark },
  { href: "/admin/gateway-status", label: "Gateway Status", icon: BadgeIndianRupee },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: RefreshCcw },
  { href: "/admin/finance-reports", label: "Reports", icon: FileBarChart },
];

const secondaryNavItems = [
  { href: "/admin/identity-access", label: "Identity & Access", icon: KeyRound, permission: "auth_activity.read" },
  { href: "/admin/security/sessions", label: "Sessions", icon: ShieldCheck },
  { href: "/admin/security/mfa", label: "MFA controls", icon: ShieldCheck },
  { href: null, label: "Support queue", icon: Headphones },
];

type AdminNavLinkItem = {
  href: string;
  label: string;
  icon: typeof KeyRound;
  permission?: string;
};

function isAdminNavLinkItem(item: { href: string | null }): item is AdminNavLinkItem {
  return typeof item.href === "string";
}

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(() => readAdminSession());
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const canAccess = (permission?: string) => {
    if (!permission) return true;
    if (!session) return true;
    return session.admin.permissions.includes(permission);
  };
  const missingPermission = (permission?: string) => Boolean(permission && session && !session.admin.permissions.includes(permission));
  const serviceCatalogueShell = true;

  useEffect(() => {
    let active = true;
    void refreshAdminSession().then((refreshed) => {
      if (active && refreshed) setSession(refreshed);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getAdminNotificationCenter({ limit: 1, status: "unread" }).then((result) => {
      if (active && result.ok) setNotificationUnreadCount(result.data.unreadCount);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    router.replace("/admin/login");
  };

  return (
    <div className="tpl-admin-shell min-h-screen bg-[#050b16] text-slate-100">
      <style>{`
        .tpl-admin-shell main { color: #e2e8f0; }
        .tpl-admin-shell main .bg-white { background-color: rgba(11, 22, 40, 0.96) !important; }
        .tpl-admin-shell main .bg-slate-50 { background-color: rgba(15, 23, 42, 0.82) !important; }
        .tpl-admin-shell main .bg-slate-100 { background-color: rgba(30, 41, 59, 0.78) !important; }
        .tpl-admin-shell main .border-slate-200,
        .tpl-admin-shell main .border-slate-100 { border-color: rgba(125, 211, 252, 0.14) !important; }
        .tpl-admin-shell main .text-slate-950,
        .tpl-admin-shell main .text-slate-900,
        .tpl-admin-shell main .text-slate-800 { color: #eaf6ff !important; }
        .tpl-admin-shell main .text-slate-700,
        .tpl-admin-shell main .text-slate-600 { color: #cbd5e1 !important; }
        .tpl-admin-shell main .text-slate-500 { color: #94a3b8 !important; }
        .tpl-admin-shell main input,
        .tpl-admin-shell main select,
        .tpl-admin-shell main textarea { background-color: #081427 !important; color: #e2e8f0 !important; border-color: rgba(125, 211, 252, 0.20) !important; }
        .tpl-admin-shell main input::placeholder,
        .tpl-admin-shell main textarea::placeholder { color: #64748b !important; }
        .tpl-admin-shell main button:focus-visible,
        .tpl-admin-shell main a:focus-visible,
        .tpl-admin-shell main input:focus-visible,
        .tpl-admin-shell main select:focus-visible,
        .tpl-admin-shell main textarea:focus-visible { outline: 2px solid #7dd3fc; outline-offset: 2px; }
      `}</style>
      <aside className={serviceCatalogueShell ? "fixed left-0 top-0 hidden h-screen w-72 border-r border-sky-300/10 bg-[#07111f] lg:block" : "fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white lg:block"}>
        <div className={serviceCatalogueShell ? "flex h-16 items-center gap-3 border-b border-sky-300/10 bg-gradient-to-r from-[#07111f] via-[#0a1b33] to-[#1f2937] px-6 text-white" : "flex h-16 items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-6 text-white"}>
          <div className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white ring-1 ring-white/15">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-5">TPL Admin</p>
            <p className="text-xs text-slate-300">Operations Console</p>
          </div>
        </div>
        <nav className="h-[calc(100vh-4rem)] space-y-6 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <p className={serviceCatalogueShell ? "border-l-2 border-sky-400 px-3 pb-2 text-[11px] font-semibold uppercase text-sky-300" : "border-l-2 border-blue-500 px-3 pb-2 text-[11px] font-semibold uppercase text-blue-600"}>Operations</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) : false;
            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-10 items-center gap-3 rounded border-l-2 px-3 text-sm font-medium",
                  serviceCatalogueShell
                    ? active ? "border-sky-400 bg-sky-400/12 text-sky-100" : "border-transparent text-slate-400 hover:bg-sky-400/10 hover:text-sky-100"
                    : active ? "border-blue-500 bg-blue-50 text-blue-800" : "border-transparent text-slate-600 hover:bg-blue-50/60 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/admin/notifications" && notificationUnreadCount > 0 ? (
                  <span className="ml-auto rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-semibold text-slate-950" aria-label={`${notificationUnreadCount} unread notifications`}>
                    {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                  </span>
                ) : null}
              </Link>
            ) : (
              <div
                key={item.label}
                className="flex h-10 items-center justify-between gap-3 rounded px-3 text-sm font-medium text-slate-400"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  Soon
                </span>
              </div>
            );
          })}
          </div>
          <div className={serviceCatalogueShell ? "space-y-1 border-t border-sky-300/10 pt-4" : "space-y-1 border-t border-slate-100 pt-4"}>
            <p className={serviceCatalogueShell ? "border-l-2 border-orange-400 px-3 pb-2 text-[11px] font-semibold uppercase text-orange-300" : "border-l-2 border-emerald-500 px-3 pb-2 text-[11px] font-semibold uppercase text-emerald-700"}>Partners</p>
            {partnerNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin/partner-verification" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded border-l-2 px-3 text-sm font-medium",
                    serviceCatalogueShell
                      ? active ? "border-orange-400 bg-orange-400/12 text-orange-100" : "border-transparent text-slate-400 hover:bg-sky-400/10 hover:text-sky-100"
                      : active ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-transparent text-slate-600 hover:bg-emerald-50/60 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className={serviceCatalogueShell ? "space-y-1 border-t border-sky-300/10 pt-4" : "space-y-1 border-t border-slate-100 pt-4"}>
            <p className={serviceCatalogueShell ? "border-l-2 border-cyan-400 px-3 pb-2 text-[11px] font-semibold uppercase text-cyan-300" : "border-l-2 border-purple-500 px-3 pb-2 text-[11px] font-semibold uppercase text-purple-700"}>Website & Content</p>
            {websiteContentNavItems.filter((item) => canAccess(item.permission)).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded border-l-2 px-3 text-sm font-medium",
                    serviceCatalogueShell
                      ? active ? "border-cyan-400 bg-cyan-400/12 text-cyan-100" : "border-transparent text-slate-400 hover:bg-cyan-400/10 hover:text-cyan-100"
                      : active ? "border-purple-500 bg-purple-50 text-purple-800" : "border-transparent text-slate-600 hover:bg-purple-50/60 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className={serviceCatalogueShell ? "space-y-1 border-t border-sky-300/10 pt-4" : "space-y-1 border-t border-slate-100 pt-4"}>
            <p className={serviceCatalogueShell ? "border-l-2 border-slate-500 px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400" : "border-l-2 border-emerald-500 px-3 pb-2 text-[11px] font-semibold uppercase text-emerald-700"}>Finance</p>
            {financeNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded border-l-2 px-3 text-sm font-medium",
                    serviceCatalogueShell
                      ? active ? "border-slate-400 bg-slate-400/12 text-slate-100" : "border-transparent text-slate-500 hover:bg-slate-400/10 hover:text-slate-200"
                      : active ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-transparent text-slate-600 hover:bg-emerald-50/60 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className={serviceCatalogueShell ? "space-y-1 border-t border-sky-300/10 pt-4" : "space-y-1 border-t border-slate-100 pt-4"}>
            <p className={serviceCatalogueShell ? "border-l-2 border-orange-400 px-3 pb-2 text-[11px] font-semibold uppercase text-orange-300" : "border-l-2 border-orange-500 px-3 pb-2 text-[11px] font-semibold uppercase text-orange-700"}>Admin Controls</p>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.href ? pathname === item.href || pathname.startsWith(item.href) : false;
              const locked = missingPermission(item.permission);
              return item.href ? (
                locked ? (
                  <div
                    key={item.href}
                    aria-disabled="true"
                    title="Ask a Super Admin for Identity & Access permission."
                    className="flex h-10 items-center justify-between gap-3 rounded border-l-2 border-transparent px-3 text-sm font-medium text-slate-400"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-600">
                      Access needed
                    </span>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex h-10 items-center gap-3 rounded border-l-2 px-3 text-sm font-medium",
                      serviceCatalogueShell
                        ? active ? "border-orange-400 bg-orange-400/12 text-orange-100" : "border-transparent text-slate-400 hover:bg-orange-400/10 hover:text-orange-100"
                        : active ? "border-orange-500 bg-orange-50 text-orange-800" : "border-transparent text-slate-600 hover:bg-orange-50/60 hover:text-slate-950",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              ) : (
                <div
                  key={item.label}
                  className="flex h-10 items-center justify-between gap-3 rounded px-3 text-sm font-medium text-slate-400"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className={serviceCatalogueShell ? "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sky-300/10 bg-[#07111f]/95 px-4 text-slate-100 backdrop-blur lg:px-8" : "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8"}>
          <div>
            <h1 className={serviceCatalogueShell ? "text-base font-semibold text-sky-100" : "text-base font-semibold text-slate-950"}>{title}</h1>
            <p className={serviceCatalogueShell ? "text-xs text-orange-200" : "text-xs text-slate-500"}>Staging workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={serviceCatalogueShell ? "hidden items-center gap-2 rounded border border-sky-300/15 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 md:flex" : "hidden items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-600 md:flex"}>
              <Bell className="h-4 w-4" />
              {session?.admin.email ?? "Admin"}
            </div>
            <div className={serviceCatalogueShell ? "hidden items-center gap-2 rounded border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-xs text-orange-100 md:flex" : "hidden items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-600 md:flex"}>
              <BadgeIndianRupee className="h-4 w-4" />
              Staging console
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={serviceCatalogueShell ? "flex h-9 items-center gap-2 rounded bg-sky-500 px-3 text-sm font-medium text-[#06101e] hover:bg-sky-400" : "flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>
        <nav className={serviceCatalogueShell ? "border-b border-sky-300/10 bg-[#07111f] px-4 py-3 lg:hidden" : "border-b border-slate-200 bg-white px-4 py-3 lg:hidden"} aria-label="Admin quick navigation">
          <p className={serviceCatalogueShell ? "text-[11px] font-semibold uppercase text-sky-300" : "text-[11px] font-semibold uppercase text-slate-400"}>Admin quick links</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {[
              ...partnerNavItems,
              ...websiteContentNavItems.filter((item) => canAccess(item.permission)),
              ...secondaryNavItems.filter(isAdminNavLinkItem).filter((item) => !missingPermission(item.permission)),
            ].map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin/partner-verification" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded border px-3 text-sm font-medium",
                    serviceCatalogueShell
                      ? active ? "border-sky-300 bg-sky-400 text-[#06101e]" : "border-sky-300/15 bg-white/[0.04] text-slate-300"
                      : active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
