import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { licensingHeroStats, licensingTrustItems } from "@/app/lib/creators/creatorLicensingData";

export default function CreatorLicensingHero({ onCompare, onPlans }: { onCompare: () => void; onPlans: () => void }) {
  return <section className="relative isolate overflow-hidden bg-[#071831] text-white">
    <Image src="/themes/banners/culture-2.jpg" alt="A premium travel licensing landscape" fill priority sizes="100vw" className="object-cover opacity-45" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#041124] via-[#071831]/95 to-[#071831]/55" />
    <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] lg:items-end lg:px-10 lg:py-20">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-100"><CheckCircle2 className="h-4 w-4" /> TPL Licensing Center</p>
        <h1 className="mt-5 max-w-4xl">Simple licensing for every creator and every business.</h1>
        <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-200 sm:text-lg">Commercial licensing, creator protection, enterprise-ready usage rights and transparent licensing for modern businesses.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onCompare} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">Compare Licenses <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={onPlans} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20">View Plans</button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-[#071831]/70 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          {licensingHeroStats.map((stat) => <div key={stat.label} className="rounded-xl bg-white/10 px-2 py-4 text-center"><strong className="block text-xl font-extrabold sm:text-2xl">{stat.value}</strong><span className="mt-1 block text-xs font-semibold text-slate-200">{stat.label}</span></div>)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {licensingTrustItems.map(({ label, icon: Icon }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-semibold text-slate-100 backdrop-blur"><Icon className="h-4 w-4 shrink-0 text-blue-300" />{label}</div>)}
        </div>
      </div>
    </div>
  </section>;
}
