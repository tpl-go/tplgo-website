"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, BookmarkPlus, ChevronRight, Copy, Heart, MapPin, Share2, Star } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { CreatorAsset, CreatorCatalogSource, CreatorProfile } from "@/app/lib/creators/creatorCatalogTypes";
import { marketplaceHomeAssets } from "@/app/lib/creators/creatorMarketplaceHomeData";
import CreatorMarketplaceHeader from "../CreatorMarketplaceHeader";
import CreatorMarketplaceFooter from "../CreatorMarketplaceFooter";
import CreatorAssetGallery from "./CreatorAssetGallery";
import CreatorAssetSidebar from "./CreatorAssetSidebar";
import CreatorAssetTabs from "./CreatorAssetTabs";
import CreatorRelatedAssets from "./CreatorRelatedAssets";
import CreatorAssetTrustStrip from "./CreatorAssetTrustStrip";
import typography from "../CreatorTypography.module.css";
import { creatorTestCheckoutAllowed } from "@/app/lib/creators/creatorCommerceFlags";
import { stageCreatorCommerceSelection } from "@/app/lib/creators/creatorCommerceCheckoutAdapter";

export default function CreatorAssetDetailPage({ asset, creator, related, source }: { asset: CreatorAsset; creator: CreatorProfile | null; related: CreatorAsset[]; source: CreatorCatalogSource }) {
  const router = useRouter();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [wishlist, setWishlist] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [notice, setNotice] = useState("");
  const [studioRequested, setStudioRequested] = useState(false);
  const homeAsset = marketplaceHomeAssets.find((item) => item.slug === asset.slug);
  const previewImage = homeAsset?.previewImage ?? "/themes/banners/culture-2.jpg";
  const avatar = homeAsset?.creatorAvatar ?? marketplaceHomeAssets.find((item) => item.creatorSlug === asset.creatorSlug)?.creatorAvatar ?? "/experiences/adventure.jpg";

  useEffect(() => {
    if (studioRequested && isAuthenticated && user) router.push("/creator-studio");
  }, [isAuthenticated, router, studioRequested, user]);

  const gated = (action: () => void) => {
    if (!isAuthenticated || !user) return openLoginModal();
    action();
  };
  const openStudio = () => gated(() => router.push("/creator-studio"));
  const commerce = (message: string) => gated(() => {
    if (!message.startsWith("__commerce:")) return setNotice(message);
    if (!creatorTestCheckoutAllowed()) return setNotice("Testing commerce is disabled — no transaction was created.");
    const license = message.endsWith("extended") ? "extended" : "standard";
    stageCreatorCommerceSelection({ productType: license === "extended" ? "creator_asset_extended_license" : "creator_asset_standard_license", assetSlug: asset.slug });
    router.push("/creators/checkout/review");
  });
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: asset.title, url });
      else { await navigator.clipboard.writeText(url); setNotice("Asset link copied"); }
    } catch { setNotice("Sharing cancelled"); }
  };

  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-slate-50 text-slate-950`}>
    <CreatorMarketplaceHeader onStudio={() => { setStudioRequested(true); openStudio(); }} userName={user?.fullName ?? user?.email ?? "Account"} />
    <main>
      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[10px] font-semibold text-slate-500">
          <Link href="/creators">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href={`/creators/categories/${asset.category}`}>{asset.category.replace(/-/g, " ")}</Link><ChevronRight className="h-3 w-3" />
          <Link href={`/creators/search?q=${encodeURIComponent(asset.subcategory)}`}>{asset.subcategory}</Link><ChevronRight className="h-3 w-3" />
          <Link href={`/creators/search?q=${encodeURIComponent(asset.tags[0] ?? "travel")}`}>{asset.tags[0] ?? "Travel"}</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate font-bold text-slate-800">{asset.title}</span>
        </nav>

        <section className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl"><div className="flex flex-wrap items-center gap-2"><span className="rounded bg-blue-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">{asset.mediaType}</span>{asset.rating >= 4.9 && <span className="rounded bg-amber-100 px-2 py-1 text-[9px] font-black uppercase text-amber-800">Trending</span>}<span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{source === "backend" ? "Live catalog" : "Marketplace preview"}</span></div><h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{asset.title}</h1><p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">{asset.subtitle}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500"><span className="inline-flex items-center gap-1 text-amber-700"><Star className="h-3.5 w-3.5 fill-current" />{asset.rating} ({asset.reviewCount} reviews)</span><Link href={`/creators/authors/${asset.creatorSlug}`} className="inline-flex items-center gap-1.5 hover:text-blue-700"><Image src={avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />{asset.creatorName}<BadgeCheck className="h-3.5 w-3.5 text-blue-600" /></Link><span>{asset.salesLabel}</span>{creator?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{creator.location}</span>}</div></div>
          <div className="flex gap-2"><button type="button" onClick={() => gated(() => setWishlist((value) => !value))} className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[11px] font-bold ${wishlist ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-300 bg-white"}`}><Heart className={`h-4 w-4 ${wishlist ? "fill-current" : ""}`} />Wishlist</button><button type="button" onClick={() => gated(() => setSaved((value) => !value))} className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[11px] font-bold ${saved ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-300 bg-white"}`}><BookmarkPlus className="h-4 w-4" />Save</button><button type="button" onClick={share} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 bg-white" aria-label="Share asset"><Share2 className="h-4 w-4" /></button></div>
        </section>

        {notice && <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-[10px] font-bold text-white"><Copy className="h-3 w-3" />{notice}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-6"><CreatorAssetGallery asset={asset} primaryImage={previewImage} /><CreatorAssetTabs asset={asset} creator={creator} /><div className="flex flex-wrap gap-2">{asset.tags.map((tag) => <Link key={tag} href={`/creators/search?q=${encodeURIComponent(tag)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:border-blue-300 hover:text-blue-700">#{tag}</Link>)}</div></div>
          <CreatorAssetSidebar asset={asset} creator={creator} avatar={avatar} followed={followed} saved={saved} onFollow={() => gated(() => setFollowed((value) => !value))} onSave={() => gated(() => setSaved((value) => !value))} onGatedPreview={commerce} />
        </div>
      </div>
      <CreatorRelatedAssets assets={related} />
      <CreatorAssetTrustStrip />
    </main>
    <CreatorMarketplaceFooter onStudio={() => { setStudioRequested(true); openStudio(); }} />
  </div>;
}
