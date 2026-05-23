"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    name: "Honeymoon",
    icon: "💍",
    href: "/themes/romance?sub=Honeymoon%20Packages",
  },
  {
    name: "Adventure",
    icon: "🏔️",
    href: "/themes/adventure?sub=Himalayan%20Adventure",
  },
  {
    name: "Spiritual",
    icon: "🛕",
    href: "/themes/spiritual?sub=Spiritual%20Retreats",
  },
  {
    name: "Wildlife",
    icon: "🐅",
    href: "/themes/wildlife?sub=Jungle%20Safari",
  },
  {
    name: "Weekend",
    icon: "🌄",
    href: "/themes/weekend?sub=Weekend%20Getaways",
  },
  {
    name: "Pre Wedding",
    icon: "🎬",
    href: "/themes/media?sub=Pre-Wedding%20%26%20Fashion%20Shoots",
  },
];

export default function HolidaysThemeSection() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Theme Holidays
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-900">
        Choose Your Travel Experience
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-6">
        {themes.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => router.push(item.href)}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-3xl">{item.icon}</div>
            <p className="mt-2 text-sm font-black text-slate-800">
              {item.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}