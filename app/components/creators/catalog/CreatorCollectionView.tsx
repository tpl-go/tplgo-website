import { notFound } from "next/navigation";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getAssetsForCollection, getCollection, getCollections } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorAdvancedAssetDetailEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

export default async function CreatorCollectionView({ collectionSlug }: { collectionSlug: string }) {
  const collectionResult = await getCollection(collectionSlug);
  const collection = collectionResult.data;
  if (!collection) notFound();
  const assetsResult = await getAssetsForCollection(collection.slug);
  const showAdvanced = isCreatorAdvancedAssetDetailEnabled();
  const collectionsResult = await getCollections();
  const relatedCollections = collectionsResult.data.filter((item) => item.slug !== collection.slug).slice(0, 3);

  return (
    <CreatorCatalogShell>
      <section className="relative overflow-hidden bg-slate-950">
        <TPLDynamicImage
          imageQuery={collection.coverQuery}
          fallbackQuery="curated creator asset collection"
          alt={collection.title}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-45"
          preferDynamic
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Curated collection</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white">{collection.title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-200">{collection.description}</p>
          <p className="mt-4 text-sm font-black text-cyan-100">Curated by {collection.curator}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CreatorCatalogSourceNotice source={assetsResult.source} error={assetsResult.error || collectionResult.error || collectionsResult.error} />
        <CreatorAssetGrid assets={assetsResult.data.assets} />
        {showAdvanced ? (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Related collections</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedCollections.map((item) => (
                <a key={item.slug} href={`/creators/collections/${item.slug}`} className="rounded-2xl bg-stone-100 p-4 hover:bg-stone-200">
                  <p className="font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </CreatorCatalogShell>
  );
}
