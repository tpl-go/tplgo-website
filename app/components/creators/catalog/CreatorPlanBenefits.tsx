import Link from "next/link";
import { BadgeCheck, DownloadCloud, FolderHeart, Gem, MonitorSmartphone, ScrollText } from "lucide-react";

const benefits = [[DownloadCloud, "Monthly Downloads"], [BadgeCheck, "Standard License"], [Gem, "Premium Assets"], [ScrollText, "License Certificate"], [FolderHeart, "Your Library"], [MonitorSmartphone, "Multi-device Access"]] as const;

export default function CreatorPlanBenefits() {
  return <section id="creator-plans" className="px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-[1360px] flex-col gap-6 rounded-2xl bg-gradient-to-r from-[#06172f] to-[#102b55] px-6 py-7 text-white shadow-xl lg:flex-row lg:items-center"><div className="shrink-0 lg:w-60"><h2 className="text-lg font-black">TPL Creator Plan Benefits</h2><p className="mt-1 text-xs font-medium text-slate-300">Plans for every creator and buyer</p></div><div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{benefits.map(([Icon, title]) => <div key={title} className="text-center"><span className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-blue-500/15 text-blue-200"><Icon className="h-4 w-4" /></span><p className="mt-2 text-[10px] font-bold">{title}</p></div>)}</div><Link href="/creators/search?plan=creator" className="shrink-0 rounded-md bg-blue-600 px-5 py-2.5 text-center text-xs font-black hover:bg-blue-500">View Plans</Link></div></section>;
}
