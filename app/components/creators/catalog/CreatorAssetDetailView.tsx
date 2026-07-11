import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Download, FileText, Star } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getAsset, getRelatedAssets } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorAdvancedAssetDetailEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAdvancedAssetDetailView from "./CreatorAdvancedAssetDetailView";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

export default async function CreatorAssetDetailView({ assetSlug }: { assetSlug: string }) {
  if (isCreatorAdvancedAssetDetailEnabled()) return <CreatorAdvancedAssetDetailView assetSlug={assetSlug} />;

  const assetResult = await getAsset(assetSlug);
  const asset = assetResult.data;
  if (!asset) notFound();
  const relatedResult = await getRelatedAssets(asset);
  const related = relatedResult.data;

  return (
    <CreatorCatalogShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <div className="space-y-6">
          <CreatorCatalogSourceNotice source={assetResult.source} error={assetResult.error} />
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
            <div className="aspect-[16/9] bg-stone-100">
              <TPLDynamicImage
                imageQuery={asset.previewQuery}
                fallbackQuery="premium creator asset preview"
                alt={asset.title}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
                preferDynamic
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{asset.category.replace(/-/g, " ")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">{asset.title}</h1>
            <p className="mt-3 text-lg font-bold text-slate-600">{asset.subtitle}</p>
            <p className="mt-5 text-base leading-7 text-slate-700">{asset.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel title="Technical specs" rows={[
              ["Media type", asset.mediaType],
              ["Formats", asset.formats.join(", ")],
              ["Dimensions", asset.dimensions || "-"],
              ["Duration", asset.duration || "-"],
              ["File size", asset.fileSize],
              ["Version", asset.version],
            ]} />
            <InfoPanel title="Included files" rows={asset.includedFiles.map((item) => [item, "Included"])} />
          </div>
          <section>
            <h2 className="mb-4 text-2xl font-black tracking-normal text-slate-950">Related assets</h2>
            <CreatorAssetGrid assets={related} />
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-3xl font-black text-slate-950">₹{asset.price.toLocaleString("en-IN")}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
                <Star className="h-3.5 w-3.5 fill-current" />
                {asset.rating}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">{asset.salesLabel} · {asset.reviewCount} reviews</p>
            <div className="mt-5 space-y-2">
              {asset.licenses.map((license) => (
                <div key={license} className="flex items-center justify-between rounded-2xl border border-stone-200 px-3 py-3 text-sm font-bold">
                  <span className="capitalize">{license.replace(/-/g, " ")}</span>
                  <BadgeCheck className="h-4 w-4 text-emerald-700" />
                </div>
              ))}
            </div>
            <button disabled className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-300 text-sm font-black text-white">
              <Download className="h-4 w-4" />
              Checkout disabled
            </button>
            <p className="mt-3 text-xs leading-5 text-slate-500">Phase 1 is public catalog only. Paid orders, download tokens and entitlements remain disabled.</p>
          </div>
          <Link href={`/creators/authors/${asset.creatorSlug}`} className="block rounded-3xl border border-stone-200 bg-white p-5 hover:border-slate-400">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Author</p>
            <p className="mt-2 text-lg font-black text-slate-950">{asset.creatorName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{asset.creatorRole}</p>
          </Link>
        </aside>
      </section>
    </CreatorCatalogShell>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-cyan-700" />
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      <div className="divide-y divide-stone-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-right font-black text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
