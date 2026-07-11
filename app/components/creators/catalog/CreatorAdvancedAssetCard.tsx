import Link from "next/link";
import { BadgeCheck, Eye, Heart, Star } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { CreatorAsset } from "@/app/lib/creators/creatorCatalogTypes";

export default function CreatorAdvancedAssetCard({ asset }: { asset: CreatorAsset }) {
  const priceFrom = Math.min(...asset.licenseOptions.map((option) => option.price));

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Link href={`/creators/assets/${asset.slug}`} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-cyan-500">
          <TPLDynamicImage
            imageQuery={asset.previewQuery}
            fallbackQuery="premium digital creator asset marketplace"
            alt={asset.title}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            preferDynamic
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        </Link>
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-black uppercase text-white backdrop-blur">
          {asset.mediaType}
        </div>
        <button type="button" disabled aria-label="Save asset preview disabled" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-400">
          <Heart className="h-4 w-4" />
        </button>
        <Link href={`/creators/assets/${asset.slug}`} className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">
          <Eye className="h-4 w-4" />
          Preview
        </Link>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/creators/assets/${asset.slug}`} className="line-clamp-2 text-base font-black text-slate-950 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
              {asset.title}
            </Link>
            <Link href={`/creators/authors/${asset.creatorSlug}`} className="mt-1 flex items-center gap-1 truncate text-xs font-bold text-slate-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
              <BadgeCheck className="h-3.5 w-3.5 text-cyan-700" />
              {asset.creatorName}
            </Link>
          </div>
          <p className="shrink-0 text-sm font-black text-slate-950">₹{priceFrom.toLocaleString("en-IN")}+</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{asset.subtitle}</p>
        <div className="flex flex-wrap gap-1">
          {asset.licenses.slice(0, 3).map((license) => (
            <span key={license} className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-black text-slate-600">{license}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
            <Star className="h-3.5 w-3.5 fill-current" />
            {asset.rating}
          </span>
          <span>{asset.reviewCount} reviews</span>
          <span>{asset.formats.slice(0, 2).join(", ")}</span>
        </div>
      </div>
    </article>
  );
}
