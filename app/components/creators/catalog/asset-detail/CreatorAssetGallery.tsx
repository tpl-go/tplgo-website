"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, FileText, Pause, Play, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { CreatorAsset } from "@/app/lib/creators/creatorCatalogTypes";
import { marketplaceHomeAssets } from "@/app/lib/creators/creatorMarketplaceHomeData";

export default function CreatorAssetGallery({ asset, primaryImage }: { asset: CreatorAsset; primaryImage: string }) {
  const images = useMemo(() => {
    const related = marketplaceHomeAssets.filter((item) => item.creatorSlug === asset.creatorSlug || item.collectionSlugs.some((slug) => asset.collectionSlugs.includes(slug))).map((item) => item.previewImage);
    return [...new Set([primaryImage, ...related])].slice(0, Math.max(asset.previewMedia.length, 3));
  }, [asset, primaryImage]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoLike = asset.mediaType === "video" || asset.orientation === "portrait" && asset.duration;
  const active = images[index] ?? primaryImage;
  const move = (delta: number) => setIndex((value) => (value + delta + images.length) % images.length);

  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className={`relative overflow-hidden bg-[#071831] ${asset.orientation === "portrait" ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
      <Image src={active} alt={`${asset.title} preview ${index + 1}`} fill priority sizes="(min-width:1024px) 70vw, 100vw" className="object-contain" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-4xl font-black uppercase tracking-[0.35em] text-white/12">TPL Preview</div>
      <div className="absolute left-3 top-3 flex gap-2"><span className="rounded bg-[#071831]/85 px-2 py-1 text-[9px] font-black uppercase text-white">{asset.mediaType}</span>{asset.resolution && <span className="rounded bg-white/90 px-2 py-1 text-[9px] font-black text-slate-900">{asset.resolution}</span>}</div>
      <div className="absolute right-3 top-3 flex gap-2"><span className="rounded bg-black/65 px-2 py-1 text-[9px] font-bold text-white">{index + 1} / {images.length}</span><button type="button" onClick={() => setLightbox(true)} className="grid h-8 w-8 place-items-center rounded bg-white text-slate-900" aria-label="Open fullscreen preview"><Expand className="h-4 w-4" /></button></div>
      {images.length > 1 && <><button onClick={() => move(-1)} type="button" aria-label="Previous preview" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => move(1)} type="button" aria-label="Next preview" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronRight className="h-5 w-5" /></button></>}
      {videoLike && <button type="button" onClick={() => setPlaying((value) => !value)} className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-blue-700 shadow-xl" aria-label={playing ? "Pause muted preview" : "Play muted preview"}>{playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}</button>}
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[9px] font-bold text-white"><ShieldCheck className="h-3 w-3" />Watermark-ready preview</div>{asset.duration && <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[9px] font-bold text-white">{asset.duration}</div>}
    </div>
    <div className="flex gap-2 overflow-x-auto p-3">{images.map((src, itemIndex) => <button type="button" key={`${src}-${itemIndex}`} onClick={() => setIndex(itemIndex)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${itemIndex === index ? "border-blue-600" : "border-transparent"}`}><Image src={src} alt="" fill sizes="96px" className="object-cover" /></button>)}{asset.previewMedia.filter((item) => item.type === "document").map((item) => <div key={item.id} className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><FileText className="h-5 w-5" /></div>)}</div>
    {lightbox && <div className="fixed inset-0 z-[500] grid place-items-center bg-slate-950/95 p-4"><button onClick={() => setLightbox(false)} type="button" aria-label="Close fullscreen preview" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white"><X className="h-5 w-5" /></button><div className="relative h-[80vh] w-full max-w-6xl"><Image src={active} alt={asset.title} fill sizes="100vw" className="object-contain" /></div></div>}
  </section>;
}
