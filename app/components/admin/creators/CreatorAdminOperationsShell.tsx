import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, BarChart3, FileSearch, Gavel, LayoutDashboard, Library, Search, ShieldCheck, WalletCards } from "lucide-react";
import type { CreatorAdminSection } from "@/app/lib/creators/creatorAdminTypes";

const navItems: Array<{ href: string; label: string; section: CreatorAdminSection; icon: LucideIcon }> = [
  { href: "/admin/creators/dashboard", label: "Dashboard", section: "dashboard", icon: LayoutDashboard },
  { href: "/admin/creators/onboarding", label: "Onboarding", section: "onboarding", icon: ShieldCheck },
  { href: "/admin/creators/moderation", label: "Moderation", section: "moderation", icon: FileSearch },
  { href: "/admin/creators/copyright", label: "Copyright", section: "copyright", icon: Gavel },
  { href: "/admin/creators/orders", label: "Orders", section: "orders", icon: Library },
  { href: "/admin/creators/entitlements", label: "Entitlements", section: "entitlements", icon: ShieldCheck },
  { href: "/admin/creators/earnings", label: "Earnings", section: "earnings", icon: WalletCards },
  { href: "/admin/creators/risk", label: "Risk", section: "risk", icon: AlertTriangle },
  { href: "/admin/creators/analytics", label: "Analytics", section: "analytics", icon: BarChart3 },
];

export default function CreatorAdminOperationsShell({ section, title, children }: { section: CreatorAdminSection; title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="grid min-h-screen xl:grid-cols-[300px_1fr]">
        <aside className="hidden border-r border-white/10 bg-slate-950 xl:block">
          <div className="p-5">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Hidden operations</p>
              <h1 className="mt-1 text-xl font-black">Creator Admin</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">Read-only operations preview. No approval, publishing, payout, payment, entitlement or download mutation.</p>
            </div>
            <nav className="mt-6 grid gap-1">
              {navItems.map(({ href, label, section: itemSection, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black ${itemSection === section ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Creator admin preview</p>
                <h2 className="truncate text-lg font-black">{title}</h2>
              </div>
              <div className="hidden min-h-11 w-full max-w-sm items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 md:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Operations search readiness</span>
              </div>
            </div>
          </header>

          <div className="grid gap-5 px-4 py-5 sm:px-6 2xl:grid-cols-[1fr_340px]">
            <div className="min-w-0">{children}</div>
            <aside className="grid h-fit gap-4 2xl:sticky 2xl:top-24">
              <GuardPanel title="Fail closed" text="All Creator admin routes return not found while admin flags are off." />
              <GuardPanel title="Read only" text="Approve, reject, suspend, publish, storage, payout, payment, refund, wallet, entitlement and download mutations are disabled." />
              <GuardPanel title="Admin compatibility" text="No separate admin authentication, global role mutation, account shell change, Marketplace change or Local Life change." />
            </aside>
          </div>

          <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-slate-950 p-2 xl:hidden">
            {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-black text-slate-300">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}

function GuardPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-black text-white">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{text}</p>
    </div>
  );
}
