import { Check } from "lucide-react";
import { creatorPlans, type BillingCycle } from "@/app/lib/creators/creatorPlansData";

const tones = {
  slate: { border: "border-slate-200", icon: "bg-slate-800", button: "bg-slate-900 hover:bg-slate-800" },
  blue: { border: "border-blue-200", icon: "bg-blue-600", button: "bg-blue-600 hover:bg-blue-500" },
  violet: { border: "border-violet-400", icon: "bg-violet-600", button: "bg-violet-600 hover:bg-violet-500" },
  cyan: { border: "border-cyan-200", icon: "bg-cyan-600", button: "bg-cyan-700 hover:bg-cyan-600" },
  amber: { border: "border-amber-300", icon: "bg-amber-500", button: "bg-amber-600 hover:bg-amber-500" },
  navy: { border: "border-slate-700", icon: "bg-blue-600", button: "bg-blue-600 hover:bg-blue-500" },
} as const;

const money = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export default function CreatorPlanCards({ cycle, onSelect }: { cycle: BillingCycle; onSelect: (planKey: string, planName: string) => void }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{creatorPlans.map((plan) => { const tone = tones[plan.tone]; const price = cycle === "yearly" ? plan.yearlyMonthlyPrice : plan.monthlyPrice; const dark = plan.tone === "navy"; const Icon = plan.icon; return <article key={plan.key} className={`relative flex min-h-full flex-col overflow-hidden rounded-2xl border-2 ${tone.border} ${dark ? "bg-[#071831] text-white" : "bg-white"} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}>{plan.badge && <span className="absolute right-0 top-0 rounded-bl-xl bg-violet-600 px-4 py-2 text-xs font-extrabold tracking-wide text-white">{plan.badge}</span>}<span className={`grid h-11 w-11 place-items-center rounded-xl ${tone.icon} text-white`}><Icon className="h-5 w-5" /></span><h3 className={`mt-5 text-xl font-extrabold ${dark ? "text-white" : "text-slate-950"}`}>{plan.name}</h3><p className={`mt-2 min-h-12 text-sm font-medium ${dark ? "text-slate-200" : "text-slate-600"}`}>{plan.description}</p><div className="mt-5 min-h-16">{price === null ? <><strong className="text-3xl font-extrabold">Custom</strong><span className={`mt-1 block text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>Tailored agreement</span></> : <><div><span className="text-lg font-bold">₹</span><strong className="text-3xl font-extrabold">{money(price)}</strong><span className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}> / month</span></div><span className={`mt-1 block text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>{cycle === "yearly" ? "Billed yearly · preview" : "Billed monthly · preview"}</span></>}</div><ul className="mt-5 flex-1 space-y-3 border-t border-slate-200/20 pt-5">{plan.features.map((feature) => <li key={feature} className={`flex items-start gap-2 text-sm font-semibold ${dark ? "text-slate-100" : "text-slate-700"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${tone.icon} text-white`}><Check className="h-3 w-3" /></span>{feature}</li>)}</ul><button type="button" onClick={() => onSelect(plan.key, plan.name)} className={`mt-6 min-h-11 rounded-lg px-5 py-3 font-bold text-white ${tone.button}`}>{plan.cta}</button></article>; })}</div>;
}
