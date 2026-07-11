import Link from "next/link";
import { Star } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { CreatorAsset } from "@/app/lib/creators/creatorCatalogTypes";

export default function CreatorAssetCard({ asset }: { asset: CreatorAsset }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <Link href={`/creators/assets/${asset.slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-stone-100">
          <TPLDynamicImage
            imageQuery={asset.previewQuery}
            fallbackQuery="premium digital creator asset marketplace"
            alt={asset.title}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-300 hover:scale-105"
            preferDynamic
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/creators/assets/${asset.slug}`} className="line-clamp-2 text-base font-black text-slate-950 hover:text-cyan-800">
              {asset.title}
            </Link>
            <Link href={`/creators/authors/${asset.creatorSlug}`} className="mt-1 block truncate text-xs font-bold text-slate-500 hover:text-slate-900">
              {asset.creatorName}
            </Link>
          </div>
          <p className="shrink-0 text-sm font-black text-slate-950">₹{asset.price.toLocaleString("en-IN")}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{asset.subtitle}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
            <Star className="h-3.5 w-3.5 fill-current" />
            {asset.rating}
          </span>
          <span>{asset.reviewCount} reviews</span>
          <span>{asset.mediaType}</span>
        </div>
      </div>
    </article>
  );
}
