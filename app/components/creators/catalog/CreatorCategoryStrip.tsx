import Link from "next/link";
import { Camera, Clapperboard, Compass, Film, Image as ImageIcon, Layers3, Palette, SlidersHorizontal } from "lucide-react";
import { marketplaceHomeCategories } from "@/app/lib/creators/creatorMarketplaceHomeData";
import type { MarketplaceAssetType } from "@/app/lib/creators/creatorMarketplaceHomeTypes";
import { creatorCategoryRoutes } from "@/app/lib/creators/creatorRouteRegistry";

const icons = [Camera, Clapperboard, Film, Compass, Layers3, SlidersHorizontal, Palette, ImageIcon];
const labels = ["Photos", "Videos", "Reels", "Drone Footage", "Templates", "Presets", "Graphics", "Destination Guides"];

export default function CreatorCategoryStrip({ onSelect }: { onSelect: (type: MarketplaceAssetType) => void }) {
  return <section aria-label="Asset categories" className="border-b border-slate-200 bg-slate-50"><div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:thin] sm:px-6 lg:px-10">{marketplaceHomeCategories.map((category, index) => {
    const Icon = icons[index]!;
    const label = labels[index]!;
    return <Link key={label} href={creatorCategoryRoutes()[index]?.href ?? "/creators/search"} onClick={() => onSelect(category.assetType)} className="group flex min-h-14 min-w-[142px] flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-xs font-extrabold text-slate-950">{label}</strong><span className="mt-0.5 block text-[10px] font-semibold text-slate-600">{category.count.toLocaleString("en-IN")} assets</span></span>
    </Link>;
  })}</div></section>;
}
