import { ArrowRight, Check } from "lucide-react";
import { creatorLicenseTiers } from "@/app/lib/creators/creatorLicensingData";

const tones = {
  blue: { border: "border-blue-200", badge: "bg-blue-100 text-blue-800", icon: "bg-blue-600", glow: "from-blue-600" },
  gold: { border: "border-amber-300", badge: "bg-amber-100 text-amber-900", icon: "bg-amber-500", glow: "from-amber-500" },
  purple: { border: "border-violet-300", badge: "bg-violet-100 text-violet-800", icon: "bg-violet-600", glow: "from-violet-600" },
} as const;

export default function CreatorLicenseCards({ onCompare }: { onCompare: () => void }) {
  return <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-18">
    <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Choose with confidence</p><h2 className="mt-2">A license for every level of ambition</h2><p className="mt-3 font-medium text-slate-600">Clear usage tiers protect creators while giving modern teams the commercial freedom they need.</p></div>
    <div className="mt-9 grid gap-5 lg:grid-cols-3">
      {creatorLicenseTiers.map((tier) => { const tone = tones[tier.color]; return <article key={tier.key} className={`relative overflow-hidden rounded-2xl border-2 ${tone.border} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}>
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.glow} to-transparent`} />
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone.badge}`}>{tier.badge}</span>
        <h3 className="mt-5 text-xl font-extrabold text-slate-950">{tier.name}</h3><p className="mt-2 min-h-12 font-medium text-slate-600">{tier.description}</p>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">{tier.highlight}</span></div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{tier.suitableFor.map((item) => <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${tone.icon} text-white`}><Check className="h-3 w-3" /></span>{item}</li>)}</ul>
        <button type="button" onClick={onCompare} className="mt-6 inline-flex min-h-10 items-center gap-2 font-bold text-slate-900 hover:text-blue-700">View usage rights <ArrowRight className="h-4 w-4" /></button>
      </article>; })}
    </div>
  </section>;
}
