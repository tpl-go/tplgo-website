import { ChevronDown } from "lucide-react";
import { licensingFaqs } from "@/app/lib/creators/creatorLicensingData";

export default function CreatorFAQ() {
  return <section className="bg-[#f4f7fb] py-14"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Licensing questions</p><h2 className="mt-2">Frequently asked questions</h2><p className="mt-3 font-medium text-slate-600">Practical answers for creators, buyers, agencies and commercial teams.</p></div><div className="mt-8 grid gap-3 lg:grid-cols-2">{licensingFaqs.map(([question, answer]) => <details key={question} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-bold text-slate-950"><span>{question}</span><ChevronDown className="h-5 w-5 shrink-0 text-blue-700 transition group-open:rotate-180" /></summary><p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600">{answer}</p></details>)}</div></div></section>;
}
