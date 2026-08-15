import Image from "next/image";
import { Clock3, ShieldCheck } from "lucide-react";

export default function CreatorLibraryHero() {
  return <section className="relative isolate overflow-hidden bg-[#071831] text-white"><Image src="/themes/banners/culture-2.jpg" alt="TPL Creator library travel workspace" fill priority sizes="100vw" className="object-cover opacity-35" /><div className="absolute inset-0 bg-gradient-to-r from-[#041124] via-[#071831]/95 to-[#071831]/50" /><div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16"><p className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-100"><ShieldCheck className="h-4 w-4" /> Personal creator workspace</p><h1 className="mt-5">My Library</h1><p className="mt-4 max-w-2xl text-base font-medium text-slate-200 sm:text-lg">All your saved assets, downloads, licenses and collections in one place.</p><p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-200"><Clock3 className="h-4 w-4 text-blue-300" /> Library preview updated just now</p></div></section>;
}
