import { notFound } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getAssetsForCreator, getCreator } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorAdvancedAssetDetailEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

export default async function CreatorAuthorView({ creatorSlug }: { creatorSlug: string }) {
  const creatorResult = await getCreator(creatorSlug);
  const creator = creatorResult.data;
  if (!creator) notFound();
  const assetsResult = await getAssetsForCreator(creator.slug);
  const showAdvanced = isCreatorAdvancedAssetDetailEnabled();

  return (
    <CreatorCatalogShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-5 md:grid-cols-[16rem_1fr]">
          <div className="aspect-square overflow-hidden rounded-3xl bg-stone-100">
            <TPLDynamicImage
              imageQuery={creator.avatarQuery}
              fallbackQuery="verified creator profile portrait"
              alt={creator.name}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
              preferDynamic
              sizes="(max-width: 768px) 100vw, 16rem"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-normal text-slate-950">{creator.name}</h1>
              {creator.verified ? <BadgeCheck className="h-6 w-6 text-cyan-700" /> : null}
            </div>
            <p className="mt-1 text-sm font-black text-slate-500">{creator.handle} · {creator.location}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{creator.bio}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-amber-700">
                <Star className="h-4 w-4 fill-current" />
                {creator.rating} rating
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-2 text-slate-700">{creator.assetCount} assets</span>
              <span className="rounded-full bg-stone-100 px-3 py-2 text-slate-700">{creator.followersLabel} followers</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {creator.specialties.map((item) => (
                <span key={item} className="rounded-full border border-stone-200 px-3 py-1 text-xs font-black text-slate-600">{item}</span>
              ))}
            </div>
            {showAdvanced ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatCard label="Portfolio" value={`${creator.assetCount} assets`} />
                <StatCard label="Followers" value={creator.followersLabel} />
                <StatCard label="Verified" value={creator.verified ? "Creator" : "Pending"} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <CreatorCatalogSourceNotice source={assetsResult.source} error={assetsResult.error || creatorResult.error} />
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-normal text-slate-950">Assets by {creator.name}</h2>
            {showAdvanced ? <p className="mt-1 text-sm font-semibold text-slate-500">Featured, licensed and collection-ready portfolio items.</p> : null}
          </div>
        </div>
        <CreatorAssetGrid assets={assetsResult.data.assets} />
      </section>
    </CreatorCatalogShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-100 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
