import { RefreshCcw, WifiOff } from "lucide-react";
import type { CreatorCatalogSource } from "@/app/lib/creators/creatorCatalogTypes";

export function CreatorCatalogSourceNotice({ source, error }: { source: CreatorCatalogSource; error?: string }) {
  if (source === "backend") return null;
  if (source === "static" && !error) return null;

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm font-semibold leading-6 text-slate-700">
      <WifiOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" />
      <div>
        <p className="font-black text-slate-950">Preview catalog snapshot active</p>
        <p>{error ? "Live catalog is unavailable in this local review. Curated preview assets are shown instead." : "Curated preview assets are serving this page."}</p>
      </div>
    </div>
  );
}

export function CreatorEmptyState({ title = "No creator assets found", detail = "Try changing the search, category, license or format filters." }: { title?: string; detail?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
      <p className="text-lg font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

export function CreatorRetryLink({ href }: { href: string }) {
  return (
    <a href={href} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
      <RefreshCcw className="h-4 w-4" />
      Retry
    </a>
  );
}

export function CreatorCatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-64 animate-pulse rounded-2xl bg-stone-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`creator-skeleton-${index}`} className="rounded-3xl border border-stone-200 bg-white p-4">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-stone-200" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
