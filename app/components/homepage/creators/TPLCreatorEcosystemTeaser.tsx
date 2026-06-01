"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Globe2,
  ShieldCheck,
  Sparkles,
  Wallet,
  Video,
} from "lucide-react";

const CREATOR_BG =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";

const HERO_CREATOR_BG =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80";

const creatorCards = [
  {
    icon: Clapperboard,
    title: "Creator Categories",
    desc: "Reels, vlogs, hotel stories, food walks and destination discovery formats.",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=700&q=80",
  },
  {
    icon: Camera,
    title: "Creator Studio",
    desc: "Briefs, shoots, content drops and brand-ready travel assets in one workflow.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80",
  },
  {
    icon: Wallet,
    title: "Monetization Layer",
    desc: "Earnings, licensing and campaign opportunities designed for travel creators.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
  },
];

export default function TPLCreatorEcosystemTeaser() {
  return (
    <section className="relative bg-white px-2 py-3 md:px-3">
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[24px] bg-[#061839] px-3 py-4 shadow-sm sm:rounded-[30px] sm:px-5 sm:py-5 lg:px-6 lg:py-5"
        style={{
          backgroundImage: `url(${CREATOR_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#061839]/96 via-[#061839]/78 to-[#061839]/48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061839]/82 via-[#061839]/18 to-[#061839]/28" />

        <div className="relative mx-auto grid w-full max-w-[1520px] items-center gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <div>
            <div className="mb-3 flex w-full items-center gap-3 rounded-[20px] border border-white/20 bg-white/14 px-3 py-2 shadow-sm backdrop-blur-md sm:w-fit">
              <div className="relative flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#061839] via-[#0b5cff] to-[#00a8ff] shadow-md sm:h-12 sm:w-20">
                <div className="absolute -left-4 top-2 h-10 w-10 rounded-full bg-white/15 blur-md" />
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400" />

                <Video size={24} className="relative z-10 text-white sm:size-[28px]" />

                <div className="absolute bottom-2 left-3 h-1.5 w-8 rounded-full bg-white/35 sm:w-10" />
                <div className="absolute bottom-2 right-3 h-1.5 w-2 rounded-full bg-white/60" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200 sm:text-[11px]">
                  Creator Studio
                </p>

                <p className="truncate text-sm font-extrabold text-white">
                  Camera on. Revenue strong.
                </p>
              </div>
            </div>

            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/14 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:px-4 sm:text-sm">
              <Sparkles size={15} className="shrink-0 text-orange-200" />
              <span className="truncate">TPL Travel Creator Ecosystem</span>
            </div>

            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[42px]">
              Travel creators become a TPL economy.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/88 sm:text-[15px]">
              A premium creator layer where storytellers, filmmakers and explorers
              shape destination discovery, studio workflows, licensing and travel commerce.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/creators"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-7 py-3 text-[15px] font-black text-white shadow-[0_10px_30px_rgba(255,145,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                Explore Creators
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/creators"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/16 px-5 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/22"
              >
                Become a Creator
              </Link>
            </div>

            <div className="mt-4 grid max-w-xl grid-cols-3 gap-2">
              {[
                ["Studio", "Creator tools"],
                ["License", "Travel media"],
                ["Earn", "Creator economy"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/20 bg-white/14 p-3 shadow-sm backdrop-blur-xl"
                >
                  <h3 className="text-base font-extrabold text-white sm:text-lg">
                    {title}
                  </h3>

                  <p className="mt-1 text-[10px] leading-tight text-blue-50/72 sm:text-[11px]">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="mb-3 overflow-hidden rounded-[22px] border border-white/25 bg-white/12 shadow-xl backdrop-blur-md sm:rounded-[26px]"
              style={{
                backgroundImage: `url(${HERO_CREATOR_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative min-h-[180px] sm:min-h-[220px] lg:min-h-[235px]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#061839]/82 via-[#061839]/28 to-transparent" />

                <div className="absolute left-4 top-4 flex gap-2">
                  {["Video", "Photo", "License"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                    Creator economy
                  </p>

                  <h3 className="mt-1 text-2xl font-black leading-tight sm:text-[30px]">
                    Camera on. Revenue strong.
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid gap-2.5">
              {creatorCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="relative overflow-hidden rounded-[20px] border border-white/25 bg-[#061839] p-3 shadow-xl"
                    style={{
                      backgroundImage: `url(${card.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#061839]/96 via-[#061839]/84 to-[#061839]/58" />

                    <div className="relative flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#061839] shadow-md">
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-white sm:text-base">
                          {card.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-blue-100">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[20px] border border-white/25 bg-white/90 p-3 shadow-lg backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#061839] text-white">
                    <ShieldCheck size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-[#0f172a] sm:text-base">
                      Licensed Travel Media
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Travel media, creator profiles, AI discovery and creator monetization inside TPL.
                    </p>

                    <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                      <Globe2 size={15} />
                      Global travel creator network
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}