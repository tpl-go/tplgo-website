"use client";

import { useMemo, useState } from "react";
import { Expand, FileText, Music, Play, ShieldCheck, X } from "lucide-react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import type { CreatorAsset, CreatorPreviewMedia } from "@/app/lib/creators/creatorCatalogTypes";

function MediaIcon({ type, className }: { type: CreatorPreviewMedia["type"]; className: string }) {
  if (type === "video") return <Play className={className} />;
  if (type === "audio") return <Music className={className} />;
  if (type === "document") return <FileText className={className} />;
  return <ShieldCheck className={className} />;
}

export default function CreatorMediaPreviewGallery({ asset, mediaPreviewsEnabled }: { asset: CreatorAsset; mediaPreviewsEnabled: boolean }) {
  const media = useMemo(() => asset.previewMedia.length ? asset.previewMedia : [{ id: "main", type: asset.mediaType, title: asset.title, previewQuery: asset.previewQuery }], [asset]);
  const [activeId, setActiveId] = useState(media[0]?.id || "main");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = media.find((item) => item.id === activeId) || media[0];

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
      <div className="relative aspect-[16/10] bg-slate-950 sm:aspect-[16/9]">
        <TPLDynamicImage
          imageQuery={active.previewQuery}
          fallbackQuery="premium creator asset preview"
          alt={active.title}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
          preferDynamic
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/70 to-transparent p-4 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-black backdrop-blur">
            <MediaIcon type={active.type} className="h-4 w-4" />
            {active.type} preview
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            disabled={!mediaPreviewsEnabled}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3 text-xs font-black text-slate-950 disabled:bg-white/60 disabled:text-slate-500"
          >
            <Expand className="h-4 w-4" />
            {mediaPreviewsEnabled ? "Preview" : "Preview locked"}
          </button>
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-slate-950/65 px-3 py-2 text-xs font-black text-white backdrop-blur">
          TPL preview watermark ready
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto p-3">
        {media.map((item) => {
          const activeThumb = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`flex min-w-[9rem] items-center gap-2 rounded-2xl border px-3 py-3 text-left text-xs font-black ${activeThumb ? "border-slate-950 bg-slate-950 text-white" : "border-stone-200 bg-stone-50 text-slate-700"}`}
            >
              <MediaIcon type={item.type} className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-2">{item.title}</span>
            </button>
          );
        })}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 p-4 text-white">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="aspect-[16/9]">
                <TPLDynamicImage
                  imageQuery={active.previewQuery}
                  fallbackQuery="premium creator asset fullscreen preview"
                  alt={active.title}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  preferDynamic
                  sizes="100vw"
                />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-300">{active.title} · Safe preview only. No raw source files exposed.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
