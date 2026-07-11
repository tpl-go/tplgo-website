import { notFound } from "next/navigation";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getCategory, searchAssets } from "@/app/lib/creators/creatorCatalogRepository";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

export default async function CreatorCategoryView({ categorySlug }: { categorySlug: string }) {
  const categoryResult = await getCategory(categorySlug);
  const category = categoryResult.data;
  if (!category) notFound();
  const assetsResult = await searchAssets({ category: category.slug });

  return (
    <CreatorCatalogShell>
      <section className="relative overflow-hidden bg-slate-900">
        <TPLDynamicImage
          imageQuery={category.imageQuery}
          fallbackQuery="creator marketplace digital asset category"
          alt={category.title}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-45"
          preferDynamic
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Creator category</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white">{category.title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-200">{category.description}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CreatorCatalogSourceNotice source={assetsResult.source} error={assetsResult.error || categoryResult.error} />
        <CreatorAssetGrid assets={assetsResult.data.assets} />
      </section>
    </CreatorCatalogShell>
  );
}
