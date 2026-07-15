import { ChevronDown } from "lucide-react";
import { plansFaqs } from "@/app/lib/creators/creatorPlansData";

export default function CreatorPlansFAQ() {
  return <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-10"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Plan questions</p><h2 className="mt-2">Frequently asked questions</h2><p className="mt-3 font-medium text-slate-600">Clear answers about plan flexibility, downloads, licensing, creator tools and teams.</p></div><div className="mt-8 grid gap-3 lg:grid-cols-2">{plansFaqs.map(([question, answer]) => <details key={question} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-bold text-slate-950"><span>{question}</span><ChevronDown className="h-5 w-5 shrink-0 text-blue-700 transition group-open:rotate-180" /></summary><p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600">{answer}</p></details>)}</div></section>;
}
