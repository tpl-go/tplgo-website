import { partnerAdminNavigation } from "./partnerAdminRoutes";

const sections = {
  overview: { description: "A clear view of your partner network." },
  applications: { description: "A dedicated space for partner applications." },
  partners: { description: "Your partner directory, in one place." },
  reports: { description: "A dedicated space for partner reporting." },
} as const;

export default function PartnerModuleSection({ section }: { section: keyof typeof sections }) {
  const content = sections[section];
  const title = partnerAdminNavigation.find((item) => item.key === section)?.label;
  return <section aria-labelledby="partner-section-title" data-partner-module-panel className="min-h-72 rounded-xl border border-sky-300/15 bg-[#0b1628] px-6 py-8 sm:min-h-80 sm:px-8">
    <h2 id="partner-section-title" className="text-xl font-semibold tracking-tight text-slate-100">{title}</h2>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{content.description}</p>
    <div className="mt-10 border-t border-sky-300/10 pt-6"><p className="text-sm text-slate-500">This section will be set up next.</p></div>
  </section>;
}
