import Link from "next/link";
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, Youtube } from "lucide-react";
import { creatorRoute } from "@/app/lib/creators/creatorRouteRegistry";

type FooterLink = { label: string; href: string };
const route = (key: string, fallback = "/creators") => creatorRoute(key)?.href ?? fallback;
const columns: Array<{ heading: string; links: FooterLink[] }> = [
  { heading: "Explore", links: [
    { label: "Marketplace", href: route("explore") }, { label: "Search Assets", href: "/creators/search" },
    { label: "Collections", href: route("collections") }, { label: "Creators", href: route("creators") },
    { label: "My Library", href: route("library") },
  ] },
  { heading: "Categories", links: [
    "photos", "videos", "reels", "drone", "templates", "presets", "graphics", "destination-guides",
  ].map((key) => ({ label: creatorRoute(key)?.label ?? key, href: route(key, "/creators/search") })) },
  { heading: "Licensing & Plans", links: [
    { label: "Licensing Center", href: route("licensing") }, { label: "Standard License", href: route("licensing") },
    { label: "Extended License", href: route("licensing") }, { label: "Model & Property Releases", href: route("licensing") },
    { label: "Plans & Pricing", href: route("plans") },
  ] },
  { heading: "Company", links: [
    { label: "About TPL", href: "/about-us" }, { label: "Become a Creator", href: route("become") },
    { label: "Contact", href: "/contact" }, { label: "TPL Marketplace", href: "/local-market" },
  ] },
  { heading: "Support", links: [
    { label: "Help Center", href: "/customer-support" }, { label: "Creator FAQs", href: "/faq" },
    { label: "Creator Guidelines", href: route("become") }, { label: "Report an Issue", href: "/customer-support" },
  ] },
  { heading: "Legal", links: [
    { label: "Terms of Use", href: "/terms-and-conditions" }, { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "License Agreement", href: route("licensing") }, { label: "Refund Guidance", href: route("licensing") },
  ] },
];

export default function CreatorMarketplaceFooter({ onStudio }: { onStudio: () => void }) {
  return <footer className="bg-[#06152b] text-white">
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-8 border-b border-white/10 pb-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-300">Create with TPL</p><h2 className="mt-2 max-w-xl text-2xl font-extrabold text-white sm:text-3xl">Share travel stories with a global creative marketplace.</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300">Build your storefront, understand licensing and prepare your portfolio through the shared TPL account.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end"><Link href={route("become")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">Become a Creator <ArrowRight className="h-4 w-4" /></Link><button onClick={onStudio} type="button" className="min-h-11 rounded-lg border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">Open Creator Studio</button></div>
      </div>

      <div className="grid gap-9 py-10 lg:grid-cols-[1.25fr_3.75fr]">
        <div><Link href="/creators" className="inline-flex items-center gap-2 text-base font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"><span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-[10px]">TPL</span>TPL Creators</Link><p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-300">Premium travel photos, footage and creative assets from a global community—licensed with confidence.</p>
          <div className="mt-5"><h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-white">Social</h3><div className="mt-3 flex gap-2" aria-label="Social channels preview">{[Instagram, Youtube, Facebook, Linkedin].map((Icon, index) => <span key={index} title="Social channel preview — connection coming later" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-slate-300"><Icon className="h-4 w-4" /></span>)}</div></div>
          <details className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-white"><Mail className="h-4 w-4 text-blue-300" />Creator newsletter preview</summary><p className="mt-3 text-xs font-medium leading-5 text-slate-300">Newsletter signup is not connected yet. Creator announcements remain available through the Messages Center.</p><Link href="/creator-studio/messages" className="mt-3 inline-flex text-xs font-bold text-blue-300 hover:text-blue-200">Open Messages Center</Link></details>
        </div>
        <nav aria-label="Creator footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-6">{columns.map(({ heading, links }) => <section key={heading}><h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-white">{heading}</h3><ul className="mt-4 space-y-2.5">{links.map(({ label, href }) => <li key={label}><Link href={href} className="text-xs font-medium leading-5 text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">{label}</Link></li>)}</ul></section>)}</nav>
      </div>
      <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} The Path Less Travelled. All rights reserved.</p><p>Safe marketplace preview · Commerce execution remains disabled</p></div>
    </div>
  </footer>;
}
