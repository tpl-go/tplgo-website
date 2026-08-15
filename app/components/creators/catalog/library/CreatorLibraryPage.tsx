"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { creatorCollectionConfigs } from "@/app/lib/creators/creatorCollectionPageConfig";
import { followingCreators, libraryTabs, recentSearches, type LibraryTab } from "@/app/lib/creators/creatorLibraryData";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import typography from "../CreatorTypography.module.css";
import CreatorCollectionCard from "../collection/CreatorCollectionCard";
import CreatorLibraryHero from "./CreatorLibraryHero";
import CreatorLibrarySidebar from "./CreatorLibrarySidebar";
import { CreatorLibraryActivity, CreatorLibraryStats, CreatorLibraryStorage } from "./CreatorLibraryOverview";
import CreatorLibraryAssets from "./CreatorLibraryAssets";
import CreatorLibraryLicenses from "./CreatorLibraryLicenses";
import CreatorLibraryTestingCommerce from "./CreatorLibraryTestingCommerce";

const validTabs = new Set<LibraryTab>(libraryTabs.map((item) => item.key));

export default function CreatorLibraryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const requested = params.get("tab") as LibraryTab | null;
  const tab = requested && validTabs.has(requested) ? requested : "overview";
  const userName = user?.fullName ?? user?.email?.split("@")[0] ?? "Creator Member";
  const studio = () => isAuthenticated && user ? router.push("/creator-studio") : openLoginModal();
  const setTab = (next: LibraryTab) => router.push(next === "overview" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  const action = (value: "searches" | "following" | "settings" | "help") => setNotice(value === "searches" ? `Recent searches: ${recentSearches.join(" · ")}` : value === "following" ? `Following: ${followingCreators.join(" · ")}` : value === "settings" ? "Library settings preview opened — no account preferences were changed." : "Creator Help Center preview opened.");
  const collections = useMemo(() => creatorCollectionConfigs.slice(0, 4), []);
  const sectionTitle = libraryTabs.find((item) => item.key === tab)?.label ?? "Overview";

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-slate-50 text-slate-950`}><CreatorMarketplaceHeader onStudio={studio} userName={userName} /><main><CreatorLibraryHero /><div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10"><CreatorLibraryStats onTab={setTab} /><div className="mt-7 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]"><CreatorLibrarySidebar current={tab} userName={userName} open={drawer} onClose={() => setDrawer(false)} onTab={setTab} onAction={action} onUpgrade={() => router.push("/creators/plans")} /><section className="min-w-0"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Personal workspace</p><h2 className="mt-1">{sectionTitle}</h2></div><button type="button" onClick={() => setDrawer(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 font-bold lg:hidden"><Menu className="h-4 w-4" />Library Menu</button></div><nav aria-label="Library content tabs" className="mt-5 overflow-x-auto border-b border-slate-200"><div className="flex w-max min-w-full">{libraryTabs.map((item) => <button type="button" key={item.key} onClick={() => setTab(item.key)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold ${tab === item.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-600 hover:text-slate-950"}`}>{item.label}</button>)}</div></nav>{notice && <div role="status" className="mt-5 flex items-start justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="shrink-0 underline">Dismiss</button></div>}<div className="mt-6">{tab === "overview" && <div className="space-y-8"><CreatorLibraryTestingCommerce tab={tab} /><section><div className="flex items-end justify-between gap-4"><div><h2>Recent downloads</h2><p className="mt-1 text-sm font-medium text-slate-600">Your latest licensed assets and quick actions.</p></div><button type="button" onClick={() => setTab("downloads")} className="text-sm font-bold text-blue-700">View all</button></div><div className="mt-5"><CreatorLibraryAssets mode="downloads" limit={3} onPreview={setNotice} /></div></section><div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><CreatorLibraryActivity /><CreatorLibraryStorage onUpgrade={() => router.push("/creators/plans")} /></div></div>}{["licensed-assets", "plan-downloads", "orders", "history"].includes(tab) && <CreatorLibraryTestingCommerce tab={tab} />}{tab === "downloads" && <CreatorLibraryAssets mode="downloads" onPreview={setNotice} />}{tab === "saved" && <CreatorLibraryAssets mode="saved" onPreview={setNotice} />}{tab === "licenses" && <div className="space-y-6"><CreatorLibraryTestingCommerce tab={tab} /><CreatorLibraryLicenses /></div>}{tab === "collections" && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{collections.map((collection) => <CreatorCollectionCard key={collection.slug} collection={collection} />)}</div>}{tab === "history" && <CreatorLibraryActivity />}</div>{tab === "overview" && <div className="mt-8 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Search className="h-5 w-5 text-blue-700" /><h3 className="mt-3">Recent searches</h3><div className="mt-3 flex flex-wrap gap-2">{recentSearches.map((item) => <button type="button" key={item} onClick={() => router.push(`/creators/search?q=${encodeURIComponent(item)}`)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{item}</button>)}</div></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><UserRoundCheck className="h-5 w-5 text-blue-700" /><h3 className="mt-3">Following creators</h3><p className="mt-3 text-sm font-medium text-slate-600">{followingCreators.join(" · ")}</p></article></div>}</section></div></div></main><CreatorMarketplaceFooter onStudio={studio} /></div>;
}
