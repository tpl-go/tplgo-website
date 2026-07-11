import {
  getFilterOptions,
  searchAssets,
} from "@/app/lib/creators/creatorCatalogRepository";
import CreatorAssetGrid from "./CreatorAssetGrid";
import CreatorCatalogShell from "./CreatorCatalogShell";
import { CreatorCatalogSourceNotice, CreatorRetryLink } from "./CreatorCatalogStates";

type SearchParams = Record<string, string | string[] | undefined>;

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreatorAdvancedSearchView({ searchParams }: { searchParams: SearchParams }) {
  const filters = {
    query: param(searchParams, "q") || "",
    category: param(searchParams, "category") || "",
    subcategory: param(searchParams, "subcategory") || "",
    license: param(searchParams, "license") || "",
    mediaType: param(searchParams, "mediaType") || "",
    format: param(searchParams, "format") || "",
    software: param(searchParams, "software") || "",
    orientation: param(searchParams, "orientation") || "",
    resolution: param(searchParams, "resolution") || "",
    duration: param(searchParams, "duration") || "",
    minPrice: param(searchParams, "minPrice") || "",
    maxPrice: param(searchParams, "maxPrice") || "",
    minRating: param(searchParams, "minRating") || "",
    aiDisclosure: param(searchParams, "aiDisclosure") || "",
    sort: param(searchParams, "sort") || "",
  };
  const assetsResult = await searchAssets(filters);
  const filterOptions = await getFilterOptions();
  const categories = filterOptions.data.categories;
  const subcategories = filterOptions.data.subcategories;
  const formats = filterOptions.data.formats;
  const software = filterOptions.data.software;
  const resolutions = filterOptions.data.resolutions;

  return (
    <CreatorCatalogShell>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Advanced search</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            {filters.query ? `Results for "${filters.query}"` : "Search creator assets"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Filter by category, license, asset type, format, software, orientation, resolution, duration, rating and AI disclosure. Checkout remains disabled.
          </p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {["drone footage", "reel templates", "route packs", "editorial photos", "commercial license"].map((suggestion) => (
              <a key={suggestion} href={`/creators/search?q=${encodeURIComponent(suggestion)}`} className="shrink-0 rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-slate-700">
                {suggestion}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8">
        <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-5 lg:sticky lg:top-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-950">Advanced filters</p>
            <span className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-black text-cyan-700">Mobile drawer ready</span>
          </div>
          <form className="mt-4 grid gap-4" action="/creators/search">
            <FilterInput label="Keyword" name="q" value={filters.query} />
            <FilterSelect label="Category" name="category" value={filters.category} options={[["", "All categories"], ...categories.map((item) => [item.slug, item.title] as [string, string])]} />
            <FilterSelect label="Subcategory" name="subcategory" value={filters.subcategory} options={[["", "All subcategories"], ...subcategories.map((item) => [item, item] as [string, string])]} />
            <FilterSelect label="Asset type" name="mediaType" value={filters.mediaType} options={[["", "Any type"], ["image", "Image"], ["video", "Video"], ["audio", "Audio"], ["document", "Document"], ["template", "Template"]]} />
            <FilterSelect label="License" name="license" value={filters.license} options={[["", "Any license"], ["personal", "Personal"], ["commercial", "Commercial"], ["extended", "Extended"], ["editorial", "Editorial"]]} />
            <FilterSelect label="Format" name="format" value={filters.format} options={[["", "Any format"], ...formats.map((item) => [item, item] as [string, string])]} />
            <FilterSelect label="Software" name="software" value={filters.software} options={[["", "Any software"], ...software.map((item) => [item, item] as [string, string])]} />
            <FilterSelect label="Orientation" name="orientation" value={filters.orientation} options={[["", "Any orientation"], ["landscape", "Landscape"], ["portrait", "Portrait"], ["square", "Square"], ["mixed", "Mixed"]]} />
            <FilterSelect label="Resolution" name="resolution" value={filters.resolution} options={[["", "Any resolution"], ...resolutions.map((item) => [item, item] as [string, string])]} />
            <FilterInput label="Duration contains" name="duration" value={filters.duration} />
            <div className="grid grid-cols-2 gap-3">
              <FilterInput label="Min price" name="minPrice" value={filters.minPrice} />
              <FilterInput label="Max price" name="maxPrice" value={filters.maxPrice} />
            </div>
            <FilterSelect label="Rating" name="minRating" value={filters.minRating} options={[["", "Any rating"], ["4.5", "4.5+"], ["4.7", "4.7+"], ["4.9", "4.9"]]} />
            <FilterSelect label="AI disclosure" name="aiDisclosure" value={filters.aiDisclosure} options={[["", "Any"], ["ai", "AI-assisted"], ["non-ai", "Non-AI disclosed"]]} />
            <FilterSelect label="Sort" name="sort" value={filters.sort} options={[["", "Popular"], ["newest", "Newest"], ["rating", "Rating"], ["price-low", "Price low"], ["price-high", "Price high"]]} />
            <button type="submit" className="h-12 rounded-2xl bg-slate-950 text-sm font-black text-white">Apply filters</button>
          </form>
        </aside>
        <div>
          <CreatorCatalogSourceNotice source={assetsResult.source} error={assetsResult.error || filterOptions.error} />
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-normal text-slate-950">Catalog results</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Backend API replacement ready through the catalog service abstraction.</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-slate-500">
                {assetsResult.data.pagination.total} assets · page {assetsResult.data.pagination.page}
              </p>
              {assetsResult.error ? <CreatorRetryLink href="/creators/search" /> : null}
            </div>
          </div>
          <CreatorAssetGrid assets={assetsResult.data.assets} emptyText="No assets match these filters. Try another category, license or price range." />
        </div>
      </section>
    </CreatorCatalogShell>
  );
}

function FilterInput({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <input name={name} defaultValue={value} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold outline-none focus:border-slate-500" />
    </label>
  );
}

function FilterSelect({ label, name, value, options }: { label: string; name: string; value: string; options: Array<[string, string]> }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <select name={name} defaultValue={value} className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-semibold">
        {options.map(([optionValue, optionLabel]) => (
          <option key={`${name}-${optionValue}`} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}
