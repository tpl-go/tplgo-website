"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import typography from "@/app/components/creators/catalog/CreatorTypography.module.css";
import CreatorStudioSidebar from "./CreatorStudioSidebar";
import CreatorStudioTopbar from "./CreatorStudioTopbar";
import CreatorStudioUtilityPanel from "./CreatorStudioUtilityPanel";
import CreatorSourceBadge from "@/app/components/creators/shared/CreatorSourceBadge";

export default function CreatorStudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const [drawer, setDrawer] = useState(false); const [query, setQuery] = useState(""); const [date, setDate] = useState("Last 30 days"); const [notice, setNotice] = useState("");
  return <div className={`${typography.scope} min-h-screen overflow-x-clip bg-[#f4f7fb] text-slate-950`}><CreatorStudioSidebar pathname={pathname} open={drawer} onClose={() => setDrawer(false)} onUpgrade={() => router.push("/creators/plans")} /><div className="min-h-screen lg:pl-[260px]"><CreatorStudioTopbar query={query} date={date} onQuery={setQuery} onDate={setDate} onMenu={() => setDrawer(true)} onPreview={setNotice} /><div className="mx-auto grid max-w-[1700px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_300px]"> <main className="min-w-0">{notice && <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="shrink-0 underline">Dismiss</button></div>}{query && <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Search preview: “{query}” · no search service is connected.</div>}{children}</main><CreatorStudioUtilityPanel /></div></div><CreatorSourceBadge source="fixture" /></div>;
}
