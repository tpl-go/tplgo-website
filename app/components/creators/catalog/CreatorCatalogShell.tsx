import Link from "next/link";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { listCreatorCategories } from "@/app/lib/creators/creatorCatalogService";

export default function CreatorCatalogShell({ children }: { children: React.ReactNode }) {
  const categories = listCreatorCategories();

  return (
    <main className="min-h-screen overflow-x-hidden bg-stone-50 text-slate-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Link href="/creators" className="flex w-fit items-center gap-2 text-lg font-black tracking-normal text-slate-950">
              TPL Creator Market
              <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-800">Beta</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
            <Link className="rounded-full px-3 py-2 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" href="/creators/search">
                Search
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" href="/creators/collections/creator-launch-kits">
                Collections
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" href="/creators/authors/aira-studio">
                Authors
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" href="/creators/licensing">
                Licensing
              </Link>
            </nav>
          </div>
          <form action="/creators/search" className="flex min-h-12 items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4">
            <Search className="h-5 w-5 flex-shrink-0 text-slate-500" />
            <input
              name="q"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400 focus-visible:ring-0"
              placeholder="Search photos, videos, templates, guides and route packs"
            />
            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" type="submit">
              Search
            </button>
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/creators/categories/${category.slug}`}
                className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-700" />
          <p>Catalog preview only. Checkout, paid entitlements and downloads remain disabled.</p>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-cyan-700" />
          <p>Digital marketplace-first architecture for assets, licenses, authors, collections and future delivery.</p>
          </div>
          <p className="font-semibold text-slate-500">Feature flagged by `NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG`.</p>
        </div>
      </footer>
    </main>
  );
}
