import { BadgeCheck, DownloadCloud, FileCheck2, ShieldCheck, Stamp, UserCheck } from "lucide-react";

const points = [[FileCheck2, "Commercial & Editorial"], [UserCheck, "Model & Property Release"], [BadgeCheck, "Creator Ownership"], [ShieldCheck, "Moderated Content"], [Stamp, "License Certificate"], [DownloadCloud, "Secure Downloads"]] as const;

export default function CreatorTrustSection() {
  return <section className="border-y border-slate-200 bg-white py-10"><div className="mx-auto max-w-[1360px] px-4 sm:px-6"><div className="text-center"><h2 className="text-xl font-black tracking-tight">Trusted by creators. Loved by businesses.</h2></div><div className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">{points.map(([Icon, title]) => <div key={title} className="flex flex-col items-center text-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-700"><Icon className="h-4 w-4" /></span><p className="mt-2 text-[10px] font-bold text-slate-700">{title}</p></div>)}</div></div></section>;
}
