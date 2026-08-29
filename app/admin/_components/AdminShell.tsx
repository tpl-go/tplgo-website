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
  Layers3,
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
import { adminLogout, readAdminSession } from "../../lib/admin/adminApiClient";
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
  { href: "/admin/partner-verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/partners/organizations", label: "Organizations", icon: Users },
  { href: "/admin/partners/services", label: "Services", icon: Layers3 },
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
  { href: "/admin/security/sessions", label: "Sessions", icon: ShieldCheck },
  { href: "/admin/security/mfa", label: "MFA controls", icon: ShieldCheck },
  { href: null, label: "Support queue", icon: Headphones },
];

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const canAccess = (permission?: string) => {
    if (!permission) return true;
    if (!session) return true;
    return session.admin.permissions.includes(permission);
  };

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setSession(readAdminSession());
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-950 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-5">TPL Admin</p>
            <p className="text-xs text-slate-500">Operations Console</p>
          </div>
        </div>
        <nav className="h-[calc(100vh-4rem)] space-y-6 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400">Operations</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) : false;
            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-10 items-center gap-3 rounded px-3 text-sm font-medium",
                  active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
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
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400">Partners</p>
            {partnerNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin/partner-verification" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded px-3 text-sm font-medium",
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400">Website & Content</p>
            {websiteContentNavItems.filter((item) => canAccess(item.permission)).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded px-3 text-sm font-medium",
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400">Finance</p>
            {financeNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded px-3 text-sm font-medium",
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase text-slate-400">Admin tools</p>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.href ? pathname === item.href || pathname.startsWith(item.href) : false;
              return item.href ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-10 items-center gap-3 rounded px-3 text-sm font-medium",
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
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
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div>
            <h1 className="text-base font-semibold text-slate-950">{title}</h1>
            <p className="text-xs text-slate-500">Backend-controlled admin surface</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-600 md:flex">
              <Bell className="h-4 w-4" />
              {session?.admin.email ?? "Admin"}
            </div>
            <div className="hidden items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-600 md:flex">
              <BadgeIndianRupee className="h-4 w-4" />
              Read-only foundation
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>
        <nav className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Admin quick navigation">
          <p className="text-[11px] font-semibold uppercase text-slate-400">Admin quick links</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {[...partnerNavItems, ...websiteContentNavItems.filter((item) => canAccess(item.permission))].map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin/partner-verification" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded border px-3 text-sm font-medium",
                    active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600",
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
