import Image from "next/image";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import type { MarketplaceAssetType } from "@/app/lib/creators/creatorMarketplaceHomeTypes";

const popular = ["India", "Mountains", "Beaches", "Aerial", "City", "Wildlife", "Temples"];
const types: Array<[string, "all" | MarketplaceAssetType]> = [["All Assets", "all"], ["Photos", "photo"], ["Videos", "video"], ["Drone", "drone"], ["Templates", "template"], ["Presets", "preset"], ["Graphics", "graphic"]];

export default function CreatorMarketplaceHero({ query, assetType, onQueryChange, onAssetTypeChange, onSearch, onStudio }: {
  query: string; assetType: "all" | MarketplaceAssetType; onQueryChange: (value: string) => void;
  onAssetTypeChange: (value: "all" | MarketplaceAssetType) => void; onSearch: () => void; onStudio: () => void;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#071831] text-white">
      <Image src="/themes/banners/culture-2.jpg" alt="Creator filming a mountain journey" fill priority sizes="100vw" className="object-cover object-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06172f] via-[#071831]/90 to-[#071831]/15" />
      <div className="relative mx-auto grid min-h-[410px] max-w-[1440px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur"><Sparkles className="h-3 w-3 text-blue-300" /> Global creative marketplace</span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[46px]">Discover creative assets built for every journey</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-200 sm:text-base">Photos, videos, reels and templates from global creators—with clear licensing and subscription access through one TPL account.</p>
          <form onSubmit={(event) => { event.preventDefault(); onSearch(); }} className="mt-6 flex max-w-3xl flex-col overflow-hidden rounded-xl bg-white p-1.5 shadow-2xl sm:flex-row">
            <label className="sr-only" htmlFor="creator-asset-type">Asset type</label>
            <select id="creator-asset-type" value={assetType} onChange={(event) => onAssetTypeChange(event.target.value as "all" | MarketplaceAssetType)} className="h-11 rounded-lg border-0 bg-slate-100 px-3 text-xs font-bold text-slate-800 outline-none sm:w-36">
              {types.map(([label, value]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="sr-only" htmlFor="creator-search">Search creative assets</label>
            <div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><input id="creator-search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search photos, footage, templates and more" className="h-11 w-full px-11 text-sm text-slate-900 outline-none placeholder:text-slate-400" /></div>
            <button className="h-11 rounded-lg bg-blue-600 px-6 text-xs font-black text-white hover:bg-blue-700" type="submit">Search</button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]"><span className="font-bold text-slate-300">Popular:</span>{popular.map((item) => <button key={item} onClick={() => { onQueryChange(item); requestAnimationFrame(onSearch); }} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-semibold hover:bg-white/20" type="button">{item}</button>)}</div>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={onSearch} className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-xs font-black hover:bg-blue-500">Explore Assets <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={onStudio} className="h-10 rounded-md border border-white/40 bg-white/10 px-5 text-xs font-black backdrop-blur hover:bg-white/20">Start Selling</button></div>
        </div>
        <aside className="hidden rounded-2xl border border-white/20 bg-[#071831]/65 p-5 shadow-xl backdrop-blur-md lg:block">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-200">Built for confidence</p>
          <div className="mt-4 space-y-4 text-xs font-bold">{[[Sparkles, "Subscription first", "Premium assets in one plan"], [ShieldCheck, "Commercial license", "Clear usage rights"], [CheckCircle2, "Secure & trusted", "Reviewed marketplace content"], [UserRoundCheck, "One TPL account", "Browse, sell and manage"]].map(([Icon, title, copy]) => <div key={String(title)} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/20"><Icon className="h-4 w-4 text-blue-200" /></span><div><p>{String(title)}</p><p className="mt-0.5 text-[10px] font-medium text-slate-300">{String(copy)}</p></div></div>)}</div>
        </aside>
      </div>
    </section>
  );
}
