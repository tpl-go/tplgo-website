"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderHeart, Upload, UserRound } from "lucide-react";
import { creatorRoutes } from "@/app/lib/creators/creatorRouteRegistry";
import CreatorSourceBadge from "@/app/components/creators/shared/CreatorSourceBadge";
import { defaultCreatorReadSource } from "@/app/lib/creators/creatorDataSource";

const primaryKeys = ["explore", "photos", "videos", "reels", "drone", "templates", "collections", "creators", "licensing", "plans"];
const nav = primaryKeys.map((key) => creatorRoutes.find((item) => item.key === key)).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => [item.key === "drone" ? "Drone" : item.label, item.href] as const);

export default function CreatorMarketplaceHeader({ onStudio, userName }: { onStudio: () => void; userName: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/creators") return pathname === href;
    if (href.includes("/collections/")) return pathname.startsWith("/creators/collections");
    if (href.includes("/authors/")) return pathname.startsWith("/creators/authors");
    return pathname.startsWith(href.split("?")[0]);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071831] text-white shadow-lg shadow-slate-950/10">
      <div className="mx-auto flex h-14 max-w-[1540px] items-center gap-5 px-4 sm:px-6 xl:px-8">
        <Link href="/creators" className="flex shrink-0 items-center gap-2 font-black tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-600 text-xs">TPL</span>
          <span className="text-[15px]">Creators</span>
        </Link>
        <nav aria-label="Creator marketplace" className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} aria-current={isActive(href) ? "page" : undefined} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${isActive(href) ? "bg-white text-[#071831] shadow-sm" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}>{label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button onClick={onStudio} type="button" className="hidden h-8 items-center gap-1.5 rounded-md border border-white/25 px-3 text-[11px] font-bold hover:bg-white/10 sm:flex"><Upload className="h-3.5 w-3.5" /> Upload</button>
          <button onClick={onStudio} type="button" className="h-8 rounded-md border border-blue-400/60 bg-blue-600 px-3 text-[11px] font-bold hover:bg-blue-500">Creator Studio</button>
          <Link href="/creators/library" aria-label="Your Creator library" aria-current={pathname === "/creators/library" ? "page" : undefined} className={`grid h-8 w-8 place-items-center rounded-md border hover:bg-white/10 ${pathname === "/creators/library" ? "border-blue-300 bg-white/15 text-blue-100" : "border-white/20"}`}><FolderHeart className="h-4 w-4" /></Link>
          <button onClick={onStudio} type="button" aria-label={`TPL account: ${userName}`} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 ring-1 ring-white/30 hover:bg-white/20"><UserRound className="h-4 w-4" /></button>
        </div>
      </div>
      <nav aria-label="Creator categories" className="flex min-h-11 items-center gap-1.5 overflow-x-auto border-t border-white/10 px-4 py-2 [scrollbar-width:thin] sm:px-6 xl:hidden">
        {nav.map(([label, href]) => <Link key={label} href={href} aria-current={isActive(href) ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300 ${isActive(href) ? "bg-white text-[#071831] shadow-sm" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}>{label}</Link>)}
      </nav>
      <CreatorSourceBadge source={defaultCreatorReadSource()} />
    </header>
  );
}
