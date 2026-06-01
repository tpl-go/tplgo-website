"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const MARKET_BG =
  "https://images.unsplash.com/photo-1599661046827-dacde6976549?auto=format&fit=crop&w=1800&q=80";

const LEFT_BG =
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80";

const marketCards = [
  {
    icon: MapPin,
    title: "Destination Finds",
    desc: "Curated local products connected to where travellers are going next.",
    image:
      "https://images.unsplash.com/photo-1599661046827-dacde6976549?auto=format&fit=crop&w=700&q=80",
  },
  {
    icon: BadgeCheck,
    title: "Creator Recommended",
    desc: "Trusted picks from travel creators, guides and local experts.",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=700&q=80",
  },
  {
    icon: ShoppingBag,
    title: "Trip-Linked Commerce",
    desc: "A premium marketplace layer for authentic souvenirs, crafts and food.",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=700&q=80",
  },
];

export default function TPLLocalMarketTeaser() {
  return (
    <section className="relative bg-white px-2 py-3 md:px-3">
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[24px] border border-amber-100 bg-[#23170f] px-3 py-5 shadow-sm sm:rounded-[30px] sm:px-5 sm:py-6 lg:px-6 lg:py-7"
        style={{
          backgroundImage: `url(${MARKET_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f140c]/92 via-[#3a2412]/72 to-[#1f140c]/44" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f140c]/82 via-[#1f140c]/12 to-amber-950/18" />

        <div className="relative mx-auto grid w-full max-w-[1520px] items-center gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-7">
          <div
            className="relative min-h-[230px] overflow-hidden rounded-[22px] border border-white/25 bg-white/12 shadow-xl backdrop-blur-md sm:min-h-[280px] sm:rounded-[26px] lg:min-h-[320px]"
            style={{
              backgroundImage: `url(${LEFT_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f140c]/58 via-[#1f140c]/12 to-transparent" />

            <div className="absolute left-4 top-4 grid grid-cols-3 gap-2">
              {["Crafts", "Spices", "Tea"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/18 p-4 text-white shadow-lg backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                Destination commerce
              </p>
              <h3 className="mt-1 text-xl font-black leading-tight sm:text-2xl">
                Bring the place home.
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/88 sm:text-sm">
                Local products, creator picks and authentic marketplace discovery
                connected to travel.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/22 bg-white/16 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-100 shadow-sm backdrop-blur-md">
              <Sparkles size={15} className="shrink-0" />
              <span className="truncate">TPL Local Market</span>
            </div>

            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[44px]">
              Authentic local discovery, built into travel.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/88 sm:text-[15px]">
              A premium destination marketplace for local products, creator
              recommended finds and authentic India-led commerce experiences.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {marketCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="overflow-hidden rounded-[20px] border border-white/20 bg-white/92 shadow-sm backdrop-blur-xl"
                  >
                    <div
                      className="relative h-20 sm:h-24"
                      style={{
                        backgroundImage: `url(${card.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#051633]/68 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-md">
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="p-3.5">
                      <h3 className="text-sm font-black text-slate-950 sm:text-[15px]">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/local-market"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-7 py-3 text-[15px] font-black text-white shadow-[0_10px_30px_rgba(255,145,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                Explore Local Market
                <ArrowRight size={17} />
              </Link>

              <div className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/16 px-5 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-md">
                Curated for every trip
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}