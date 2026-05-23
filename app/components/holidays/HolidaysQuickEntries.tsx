"use client";

import { useRouter } from "next/navigation";

const entries = [
  {
    title: "India Holidays",
    desc: "State-wise domestic packages",
    icon: "🇮🇳",
    href: "/popular/india",
  },
  {
    title: "International Holidays",
    desc: "Explore by continent",
    icon: "🌍",
    href: "/continent/asia",
  },
  {
    title: "Theme Holidays",
    desc: "Honeymoon, adventure, spiritual & more",
    icon: "🎯",
    href: "/themes/romance",
  },
];

export default function HolidaysQuickEntries() {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {entries.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => router.push(item.href)}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-4xl">{item.icon}</div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            {item.title}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {item.desc}
          </p>
        </button>
      ))}
    </section>
  );
}