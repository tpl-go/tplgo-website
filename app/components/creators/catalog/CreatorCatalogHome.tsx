import Link from "next/link";
import { ArrowRight, BadgeCheck, Download, Layers3, Search } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getCatalog } from "@/app/lib/creators/creatorCatalogRepository";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice } from "./CreatorCatalogStates";

const phaseBadges = [
  {
    title: "Catalog only",
    text: "Checkout and downloads remain preview-only.",
    Icon: Download,
  },
  {
    title: "License-first",
    text: "Personal, commercial, extended and editorial models.",
    Icon: BadgeCheck,
  },
  {
    title: "No OTA impact",
    text: "Isolated Creator routes and catalog data.",
    Icon: ArrowRight,
  },
];

export default async function CreatorCatalogHome() {
  const catalog = await getCatalog();
  const assets = catalog.data.assets.slice(0, 4);
  const categories = catalog.data.categories;
  const collections = catalog.data.collections;
  const creators = catalog.data.creators;

  return (
    <CreatorCatalogShell>
      <section className="relative overflow-hidden bg-slate-950">
        <TPLDynamicImage
          imageQuery="premium digital creator marketplace cinematic studio assets"
          fallbackQuery="creator studio digital assets marketplace"
          alt="TPL Creator digital asset marketplace"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-45"
          preferDynamic
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-cyan-950/40" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="w-fit rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">
              Digital Asset Marketplace
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium creator assets for modern media, brands and city stories.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-200 sm:text-lg">
              Discover photos, footage, templates, LUTs, maps, digital guides and creator bundles with clear licensing and future entitlement-ready downloads.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/creators/search" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                <Search className="h-4 w-4" />
                Explore catalog
              </Link>
              <Link href="/creators/collections/creator-launch-kits" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
                <Layers3 className="h-4 w-4" />
                View launch kits
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {phaseBadges.map(({ title, text, Icon }) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                <Icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-black">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CreatorCatalogSourceNotice source={catalog.source} error={catalog.error} />
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Featured assets</p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950">Ready for preview</h2>
          </div>
          <Link href="/creators/search" className="hidden text-sm font-black text-slate-700 hover:text-slate-950 sm:inline-flex">
            Browse all
          </Link>
        </div>
        <CreatorAssetGrid assets={assets} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Categories</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <Link key={category.slug} href={`/creators/categories/${category.slug}`} className="rounded-2xl border border-stone-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
                  <p className="font-black text-slate-950">{category.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Collections</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {collections.map((collection) => (
                  <Link key={collection.slug} href={`/creators/collections/${collection.slug}`} className="rounded-2xl bg-stone-100 p-4 transition hover:-translate-y-0.5 hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
                    <p className="font-black text-slate-950">{collection.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{collection.description}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Authors</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {creators.map((creator) => (
                  <Link key={creator.slug} href={`/creators/authors/${creator.slug}`} className="rounded-2xl border border-stone-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
                    <p className="font-black text-slate-950">{creator.name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{creator.role}</p>
                    <p className="mt-2 text-sm font-black text-amber-700">{creator.rating} rating</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </CreatorCatalogShell>
  );
}
