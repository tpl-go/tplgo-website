import { Check } from "lucide-react";
import { uploadSteps } from "@/app/lib/creators/creatorUploadWizardData";

export default function CreatorUploadStepper({ current }: { current: number }) {
  return <nav aria-label="Upload progress" className="snap-x overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><ol className="flex min-w-[780px] items-start">{uploadSteps.map((step, index) => <li key={step.key} className="flex min-w-0 flex-1 snap-center items-start"><div className="flex min-w-[70px] flex-col items-center text-center"><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${index < current ? "bg-emerald-600 text-white" : index === current ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-100 text-slate-500"}`}>{index < current ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`mt-2 text-xs font-semibold ${index === current ? "text-blue-700" : index < current ? "text-emerald-700" : "text-slate-500"}`}>{step.label}</span></div>{index < uploadSteps.length - 1 && <span className={`mt-4 h-0.5 flex-1 ${index < current ? "bg-emerald-500" : "bg-slate-200"}`} />}</li>)}</ol></nav>;
}
