import { CheckCircle2 } from "lucide-react";
import { creatorBenefits, eligibilityGuidelines } from "@/app/lib/creators/creatorOnboardingData";
import { StepIntro } from "./CreatorOnboardingFields";

export function CreatorBenefitsStep() {
  return <div><StepIntro eyebrow="Step 1 · Your opportunity" title="Build a global creator business" copy="TPL Creators combines marketplace reach, professional tools and transparent licensing in one creator-first ecosystem." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{creatorBenefits.map(({ title, description, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm font-medium text-slate-600">{description}</p></article>)}</div></div>;
}

export function CreatorEligibilityStep() {
  return <div><StepIntro eyebrow="Step 2 · Creator standards" title="Confirm your eligibility" copy="A trusted marketplace starts with original work, clear ownership and respectful community participation." /><div className="mt-8 grid gap-4 md:grid-cols-2">{eligibilityGuidelines.map(({ title, description, icon: Icon }) => <article key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm font-medium text-slate-600">{description}</p></div></article>)}</div><div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />Continuing confirms that you understand these preview eligibility requirements. Formal review occurs only after backend onboarding is enabled.</div></div>;
}
