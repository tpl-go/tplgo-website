"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Star } from "lucide-react";
import type { CreatorAsset, CreatorProfile } from "@/app/lib/creators/creatorCatalogTypes";

const tabs = ["Details", "Description", "License", "Location", "Reviews"] as const;
type Tab = typeof tabs[number];

export default function CreatorAssetTabs({ asset, creator }: { asset: CreatorAsset; creator: CreatorProfile | null }) {
  const [active, setActive] = useState<Tab>("Details");
  const detailRows = [
    ["File type", asset.formats.join(", ")], ["Resolution", asset.resolution], ["Dimensions", asset.dimensions],
    ["File size", asset.fileSize], ["Orientation", asset.orientation], ["Duration", asset.duration],
    ["Frame rate", asset.frameRate], ["Software", asset.software?.join(", ")], ["Included files", asset.includedFiles.join(", ")],
    ["Category", asset.subcategory], ["Date added", asset.updatedAt], ["Copyright", asset.copyrightDeclaration],
  ].filter((row): row is string[] => Boolean(row[1]));
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex overflow-x-auto border-b border-slate-200 px-3">{tabs.map((tab) => <button type="button" key={tab} onClick={() => setActive(tab)} className={`shrink-0 border-b-2 px-4 py-3 text-[11px] font-black ${active === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}>{tab}</button>)}</div><div className="p-5 sm:p-6">
    {active === "Details" && <div className="grid gap-x-8 sm:grid-cols-2">{detailRows.map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 border-b border-slate-100 py-3 text-[11px]"><span className="font-semibold text-slate-500">{label}</span><span className="font-bold text-slate-800">{value}</span></div>)}</div>}
    {active === "Description" && <div className="space-y-4 text-sm font-medium leading-7 text-slate-600"><p>{asset.description}</p><div><h3 className="text-xs font-black text-slate-900">Suitable uses</h3><p className="mt-1">Destination campaigns, editorial storytelling, social content, presentations and licensed commercial production where the selected license permits.</p></div><div><h3 className="text-xs font-black text-slate-900">Creator notes</h3><p className="mt-1">{asset.supportSummary} Raw source redistribution and misleading usage remain prohibited.</p></div></div>}
    {active === "License" && <div className="grid gap-4 md:grid-cols-2"><LicenseBlock title="Standard License" text="Commercial use for a defined project, with certificate readiness and no raw asset redistribution." /><LicenseBlock title="Extended License" text="Expanded campaign distribution and higher-volume use while preserving creator ownership." /><LicenseBlock title="Editorial and releases" text={asset.releaseMetadata} /><LicenseBlock title="Prohibited use" text="No resale as a standalone asset, unlawful use, ownership claims or unlicensed redistribution." /><Link href="/creators/search?q=licensing" className="text-xs font-black text-blue-700">Explore licensing guidance →</Link></div>}
    {active === "Location" && <div className="grid gap-5 md:grid-cols-[1fr_260px]"><div><h3 className="text-sm font-black">{creator?.location ?? "India"}</h3><p className="mt-2 text-xs font-medium leading-6 text-slate-600">Destination context is derived from the creator metadata and asset tags: {asset.tags.join(", ")}.</p></div><div className="grid min-h-32 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 text-center text-xs font-bold text-slate-500"><span><MapPin className="mx-auto mb-2 h-5 w-5 text-blue-600" />Map-ready location preview<br /><small>No external map API used</small></span></div></div>}
    {active === "Reviews" && <div><div className="flex items-center gap-3"><span className="text-3xl font-black">{asset.rating}</span><span className="text-xs font-bold text-slate-500"><span className="flex text-amber-400">{[0,1,2,3,4].map((item) => <Star key={item} className="h-3.5 w-3.5 fill-current" />)}</span>{asset.reviewCount} verified marketplace reviews</span></div><div className="mt-5 grid gap-3 md:grid-cols-2"><Review name="Meera K." text="Excellent visual quality and clear licensing information." /><Review name="Arjun Studio" text="The preview and technical metadata made selection straightforward." /></div><p className="mt-4 text-[10px] font-semibold text-slate-400">Read-only preview reviews. Live review submission is disabled.</p></div>}
  </div></section>;
}

function LicenseBlock({ title, text }: { title: string; text: string }) { return <div className="rounded-lg bg-slate-50 p-4"><h3 className="text-xs font-black">{title}</h3><p className="mt-2 text-[11px] font-medium leading-5 text-slate-600">{text}</p></div>; }
function Review({ name, text }: { name: string; text: string }) { return <article className="rounded-lg border border-slate-200 p-4"><div className="flex items-center gap-2 text-[11px] font-black"><span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-blue-700">{name[0]}</span>{name}</div><p className="mt-2 text-[11px] font-medium leading-5 text-slate-600">{text}</p></article>; }
