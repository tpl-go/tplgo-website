import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, FolderKanban, LayoutDashboard, Library, Menu, Search, Settings, Sparkles, UploadCloud } from "lucide-react";
import type { CreatorWorkspaceSection } from "@/app/lib/creators/creatorWorkspaceTypes";

const navItems: Array<{ href: string; label: string; section: CreatorWorkspaceSection }> = [
  { href: "/creator/dashboard", label: "Dashboard", section: "dashboard" },
  { href: "/creator/onboarding", label: "Onboarding", section: "onboarding" },
  { href: "/creator/assets", label: "Assets", section: "assets" },
  { href: "/creator/assets/new", label: "New Asset", section: "asset-wizard" },
  { href: "/creator/uploads", label: "Uploads", section: "uploads" },
  { href: "/creator/media-library", label: "Media", section: "media-library" },
  { href: "/creator/collections", label: "Collections", section: "collections" },
  { href: "/creator/analytics", label: "Analytics", section: "analytics" },
  { href: "/creator/earnings", label: "Earnings", section: "earnings" },
  { href: "/creator/settings", label: "Settings", section: "settings" },
];

const mobileNavItems: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: "/creator/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/creator/assets", icon: Library, label: "Assets" },
  { href: "/creator/uploads", icon: UploadCloud, label: "Uploads" },
  { href: "/creator/settings", icon: Settings, label: "Settings" },
];

export default function CreatorWorkspaceShell({ section, title, children }: { section: CreatorWorkspaceSection; title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f3ef] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-stone-200 bg-[#111827] text-white lg:block">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">TPL Creator</p>
                <h1 className="flex items-center gap-2 text-lg font-black">Studio <span className="rounded-full bg-cyan-300/20 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-cyan-100">Beta</span></h1>
              </div>
            </div>
            <nav className="mt-8 grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-black ${item.section === section ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 lg:hidden" aria-label="Open creator workspace navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Public beta workspace</p>
                <h2 className="truncate text-lg font-black text-slate-950">{title}</h2>
              </div>
              <div className="hidden min-h-11 w-full max-w-sm items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 md:flex">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-500">Workspace search preview</span>
              </div>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200" aria-label="Creator notification preview">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0">{children}</div>
            <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
              <PreviewPanel icon={<LayoutDashboard className="h-5 w-5" />} title="Preview mode" text="No persistence, upload, publishing, payment, payout or admin mutation is enabled." />
              <PreviewPanel icon={<FolderKanban className="h-5 w-5" />} title="Shared identity" text="Creator Studio uses the same TPL user identity. No separate account shell exists." />
              <PreviewPanel icon={<UploadCloud className="h-5 w-5" />} title="Storage locked" text="Upload, storage write and malware scan execution permissions remain false." />
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-stone-200 bg-white p-2 lg:hidden">
            {mobileNavItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-black text-slate-700">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function PreviewPanel({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">{icon}</span>
        <div>
          <h3 className="text-sm font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}
