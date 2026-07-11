import { getCategories, searchAssets } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorAdvancedSearchEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import CreatorAdvancedSearchView from "./CreatorAdvancedSearchView";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice, CreatorRetryLink } from "./CreatorCatalogStates";

type SearchParams = Record<string, string | string[] | undefined>;

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreatorSearchView({ searchParams }: { searchParams: SearchParams }) {
  if (isCreatorAdvancedSearchEnabled()) return <CreatorAdvancedSearchView searchParams={searchParams} />;

  const q = param(searchParams, "q") || "";
  const category = param(searchParams, "category") || "";
  const license = param(searchParams, "license") || "";
  const mediaType = param(searchParams, "mediaType") || "";
  const sort = param(searchParams, "sort") || "";
  const assetsResult = await searchAssets({ query: q, category, license, mediaType, sort });
  const categoriesResult = await getCategories();
  const categories = categoriesResult.data;

  return (
    <CreatorCatalogShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-5 lg:sticky lg:top-4">
          <p className="text-sm font-black text-slate-950">Filters</p>
          <form className="mt-4 space-y-4" action="/creators/search">
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Keyword</span>
              <input name="q" defaultValue={q} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold outline-none focus:border-slate-500" />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Category</span>
              <select name="category" defaultValue={category} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold">
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.title}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">License</span>
              <select name="license" defaultValue={license} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold">
                <option value="">Any license</option>
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
                <option value="extended">Extended</option>
                <option value="editorial">Editorial</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Media</span>
              <select name="mediaType" defaultValue={mediaType} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold">
                <option value="">Any media</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
                <option value="template">Template</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Sort</span>
              <select name="sort" defaultValue={sort} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold">
                <option value="">Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
                <option value="price-low">Price low</option>
                <option value="price-high">Price high</option>
              </select>
            </label>
            <button type="submit" className="h-11 w-full rounded-xl bg-slate-950 text-sm font-black text-white">
              Apply filters
            </button>
          </form>
        </aside>
        <div>
          <CreatorCatalogSourceNotice source={assetsResult.source} error={assetsResult.error || categoriesResult.error} />
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Creator search</p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">{q ? `Results for "${q}"` : "Browse digital assets"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-slate-500">{assetsResult.data.pagination.total} assets</p>
              {assetsResult.error ? <CreatorRetryLink href="/creators/search" /> : null}
            </div>
          </div>
          <CreatorAssetGrid assets={assetsResult.data.assets} />
        </div>
      </section>
    </CreatorCatalogShell>
  );
}
