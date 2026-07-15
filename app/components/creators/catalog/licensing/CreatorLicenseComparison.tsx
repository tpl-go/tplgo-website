import { Check, Minus } from "lucide-react";
import { creatorLicenseTiers, licenseComparisonRows } from "@/app/lib/creators/creatorLicensingData";

function Value({ value }: { value: boolean | string }) {
  if (value === true) return <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700"><Check className="h-4 w-4" /> Included</span>;
  if (value === false) return <span className="inline-flex items-center gap-1.5 font-medium text-slate-500"><Minus className="h-4 w-4" /> Not included</span>;
  return <span className="font-semibold text-blue-700">{value}</span>;
}

export default function CreatorLicenseComparison() {
  return <section id="license-comparison" className="scroll-mt-24 bg-[#f4f7fb] py-14 lg:py-18">
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Side-by-side clarity</p><h2 className="mt-2">Compare license rights</h2><p className="mt-3 font-medium text-slate-600">Use this overview to choose a starting tier. Final rights are always confirmed by the issued license.</p></div>
      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block"><table className="w-full border-collapse text-left"><thead><tr className="bg-[#071831] text-white"><th className="px-5 py-4 text-sm font-bold">Usage right</th>{creatorLicenseTiers.map((tier) => <th key={tier.key} className="px-5 py-4 text-sm font-bold">{tier.name}</th>)}</tr></thead><tbody>{licenseComparisonRows.map((row, index) => <tr key={row.feature} className={index % 2 ? "bg-slate-50" : "bg-white"}><th className="border-t border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-900">{row.feature}</th><td className="border-t border-slate-200 px-5 py-3.5 text-sm"><Value value={row.standard} /></td><td className="border-t border-slate-200 px-5 py-3.5 text-sm"><Value value={row.extended} /></td><td className="border-t border-slate-200 px-5 py-3.5 text-sm"><Value value={row.enterprise} /></td></tr>)}</tbody></table></div>
      <div className="mt-7 grid gap-4 md:hidden">{creatorLicenseTiers.map((tier) => <article key={tier.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-extrabold">{tier.name}</h3><dl className="mt-4 divide-y divide-slate-200">{licenseComparisonRows.map((row) => <div key={row.feature} className="flex items-center justify-between gap-4 py-3"><dt className="text-sm font-medium text-slate-700">{row.feature}</dt><dd className="shrink-0 text-right text-sm"><Value value={row[tier.key]} /></dd></div>)}</dl></article>)}</div>
    </div>
  </section>;
}
