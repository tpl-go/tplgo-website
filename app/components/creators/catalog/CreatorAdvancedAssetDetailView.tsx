import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Copyright, FileText, ShieldCheck, Sparkles, Star } from "lucide-react";
import {
  getAsset,
  getAssetsForCreator,
  getCreator,
  getRelatedAssets,
} from "@/app/lib/creators/creatorCatalogRepository";
import {
  isCreatorLicenseCompareEnabled,
  isCreatorMediaPreviewsEnabled,
} from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import CreatorLicensePanel from "./CreatorLicensePanel";
import CreatorMediaPreviewGallery from "./CreatorMediaPreviewGallery";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

export default async function CreatorAdvancedAssetDetailView({ assetSlug }: { assetSlug: string }) {
  const assetResult = await getAsset(assetSlug);
  const asset = assetResult.data;
  if (!asset) notFound();

  const creatorResult = await getCreator(asset.creatorSlug);
  const creator = creatorResult.data;
  const relatedResult = await getRelatedAssets(asset);
  const related = relatedResult.data;
  const creatorAssetsResult = await getAssetsForCreator(asset.creatorSlug);
  const moreFromCreator = creatorAssetsResult.data.assets.filter((item) => item.slug !== asset.slug).slice(0, 4);

  return (
    <CreatorCatalogShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[1fr_25rem] lg:px-8">
        <div className="space-y-6">
          <CreatorCatalogSourceNotice source={assetResult.source} error={assetResult.error || creatorResult.error || creatorAssetsResult.error} />
          <CreatorMediaPreviewGallery asset={asset} mediaPreviewsEnabled={isCreatorMediaPreviewsEnabled()} />

          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-700">
                {asset.category.replace(/-/g, " ")}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-slate-600">{asset.subcategory}</span>
              {asset.isAiAssisted ? <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">AI-assisted disclosed</span> : null}
              {asset.isEditorial ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Editorial metadata</span> : null}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">{asset.title}</h1>
            <p className="mt-3 max-w-3xl text-lg font-bold leading-8 text-slate-600">{asset.subtitle}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
              <Link href={`/creators/authors/${asset.creatorSlug}`} className="inline-flex items-center gap-2 text-slate-950 hover:text-cyan-800">
                {creator?.verified ? <BadgeCheck className="h-4 w-4 text-cyan-700" /> : null}
                {asset.creatorName}
              </Link>
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Star className="h-4 w-4 fill-current" />
                {asset.rating} · {asset.reviewCount} reviews
              </span>
              <span>{asset.salesLabel}</span>
            </div>
            <p className="mt-6 text-base leading-8 text-slate-700">{asset.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <AdvancedInfoPanel title="Technical specifications" icon="file" rows={[
              ["Media type", asset.mediaType],
              ["Subcategory", asset.subcategory],
              ["Formats", asset.formats.join(", ")],
              ["Orientation", asset.orientation],
              ["Resolution", asset.resolution || "-"],
              ["Dimensions", asset.dimensions || "-"],
              ["Duration", asset.duration || "-"],
              ["Frame rate", asset.frameRate || "-"],
              ["File size", asset.fileSize],
              ["Software", asset.software?.join(", ") || "-"],
              ["Version", asset.version],
              ["Last updated", asset.updatedAt],
            ]} />
            <AdvancedInfoPanel title="Included files" icon="shield" rows={asset.includedFiles.map((item) => [item, "Included"])} />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <AdvancedInfoPanel title="Copyright and release readiness" icon="copyright" rows={[
              ["Copyright", asset.copyrightDeclaration],
              ["Release metadata", asset.releaseMetadata],
              ["AI disclosure", asset.isAiAssisted ? "AI-assisted content disclosed" : "No AI-assisted disclosure"],
            ]} />
            <AdvancedInfoPanel title="Support and changelog" icon="calendar" rows={[
              ["Support", asset.supportSummary],
              ...asset.changelog.map((item, index) => [`Change ${index + 1}`, item]),
            ]} />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Discovery</p>
                <h2 className="mt-1 text-2xl font-black tracking-normal text-slate-950">Similar assets</h2>
              </div>
              <Sparkles className="h-5 w-5 text-slate-400" />
            </div>
            <CreatorAssetGrid assets={related} />
          </section>

          {moreFromCreator.length ? (
            <section>
              <h2 className="mb-4 text-2xl font-black tracking-normal text-slate-950">More from {asset.creatorName}</h2>
              <CreatorAssetGrid assets={moreFromCreator} />
            </section>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-4">
          <CreatorLicensePanel asset={asset} compareEnabled={isCreatorLicenseCompareEnabled()} />
          <Link href={`/creators/authors/${asset.creatorSlug}`} className="block rounded-3xl border border-stone-200 bg-white p-5 hover:border-slate-400">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Creator storefront</p>
            <p className="mt-2 text-lg font-black text-slate-950">{asset.creatorName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{asset.creatorRole}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{creator?.bio || "Verified Creator profile readiness."}</p>
          </Link>
        </aside>
      </section>
    </CreatorCatalogShell>
  );
}

function AdvancedInfoPanel({ title, rows, icon }: { title: string; rows: string[][]; icon: "file" | "shield" | "copyright" | "calendar" }) {
  const Icon = icon === "shield" ? ShieldCheck : icon === "copyright" ? Copyright : icon === "calendar" ? CalendarDays : FileText;

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-700" />
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      <div className="divide-y divide-stone-100">
        {rows.map(([label, value]) => (
          <div key={`${label}-${value}`} className="grid gap-1 py-3 text-sm sm:grid-cols-[10rem_1fr]">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="font-black leading-6 text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
