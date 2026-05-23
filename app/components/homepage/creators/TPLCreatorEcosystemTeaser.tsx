"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Globe2,
  PlayCircle,
  Sparkles,
  Wallet,
  Video,
} from "lucide-react";

const creatorCards = [
  {
    icon: Clapperboard,
    title: "Travel Reels",
    desc: "Cinematic travel stories and immersive destination moments.",
  },
  {
    icon: Camera,
    title: "Destination Photography",
    desc: "Hidden places, local culture, drone shots and creator visuals.",
  },
  {
    icon: Wallet,
    title: "Creator Economy",
    desc: "Future earning ecosystem for travel creators inside TPL.",
  },
];

export default function TPLCreatorEcosystemTeaser() {
  return (
    <section className="relative bg-white px-2 py-3 md:px-3">
      <div className="relative mx-auto w-full overflow-hidden rounded-[30px] bg-gradient-to-br from-[#eef5ff] via-[#f8fbff] to-[#edf7ff] px-5 py-10 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_38%)]" />
        <div className="absolute inset-0 bg-white/30" />

        <div className="relative mx-auto grid w-full max-w-[1520px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 flex w-fit items-center gap-3 rounded-[22px] border border-blue-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md">
              <div className="relative flex h-14 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#061839] via-[#0b5cff] to-[#00a8ff] shadow-md">
                <div className="absolute -left-4 top-2 h-10 w-10 rounded-full bg-white/15 blur-md" />
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400" />

                <Video size={30} className="relative z-10 text-white" />

                <div className="absolute bottom-2 left-3 h-1.5 w-10 rounded-full bg-white/35" />
                <div className="absolute bottom-2 right-3 h-1.5 w-2 rounded-full bg-white/60" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Creator Studio
                </p>
                <p className="text-sm font-extrabold text-[#0f172a]">
                  Shoot. Share. Inspire.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-sm backdrop-blur-md">
              <Sparkles size={16} className="text-blue-600" />
              TPL Travel Creator Ecosystem
            </div>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#0f172a] md:text-5xl">
              Inspire <span className="text-blue-600">•</span> Create{" "}
              <span className="text-blue-600">•</span> Earn
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
              A next-generation creator ecosystem inside TPL where travel
              storytellers, filmmakers, photographers and explorers will shape
              the future of destination discovery.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-[#0b5cff] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#064fd6]"
              >
                Explore Future
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm backdrop-blur-md transition hover:bg-white"
              >
                Become a Creator
              </Link>
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white/85 p-3 shadow-sm backdrop-blur-xl">
                <h3 className="text-xl font-extrabold text-[#0f172a]">10K+</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Future Creators
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/85 p-3 shadow-sm backdrop-blur-xl">
                <h3 className="text-xl font-extrabold text-[#0f172a]">500+</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Destinations
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/85 p-3 shadow-sm backdrop-blur-xl">
                <h3 className="text-xl font-extrabold text-[#0f172a]">AI</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Smart Discovery
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-3">
              {creatorCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className={`rounded-[24px] border border-white/70 bg-[#061839] p-4 shadow-xl transition hover:-translate-y-1 ${
                      index === 1
                        ? "lg:ml-10"
                        : index === 2
                        ? "lg:ml-5"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#061839] shadow-md">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {card.title}
                        </h3>

                        <p className="mt-1.5 text-sm leading-6 text-blue-100">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[24px] border border-cyan-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061839] text-white">
                    <PlayCircle size={22} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-[#0f172a]">
                        Launching Soon
                      </h3>

                      <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">
                        COMING SOON
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      Travel media, creator profiles, AI discovery and future
                      creator monetization — all inside TPL.
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <Globe2 size={16} />
                      Global travel creator network
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}