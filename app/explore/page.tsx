import Link from "next/link";
import MobileInnerBack from "@/app/components/common/mobile/MobileInnerBack";
import {
  ArrowRight,
  Bot,
  Camera,
  Clapperboard,
  Compass,
  Globe2,
  ImageIcon,
  PlayCircle,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const ecosystemCards = [
  {
    icon: Clapperboard,
    title: "Travel Reels",
    desc: "Creators will showcase cinematic reels, destination stories and immersive travel moments.",
  },
  {
    icon: Camera,
    title: "Destination Photography",
    desc: "Premium travel photos, drone shots, hidden places and local cultural visuals.",
  },
  {
    icon: Wallet,
    title: "Creator Earnings",
    desc: "Future monetization layer for approved travel media and creator contribution.",
  },
  {
    icon: Bot,
    title: "AI Discovery",
    desc: "Future AI recommendations for creator content, destinations and package inspiration.",
  },
];

const showcaseItems = [
  "Ladakh Drone Story",
  "Hidden Jaipur Walk",
  "Bali Beach Reel",
  "Kerala Backwater Frames",
];

const futureItems = [
  "Creator Profiles",
  "Media Library",
  "Creator Dashboard",
  "Earnings Wallet",
  "AI Content Discovery",
  "Destination Storytelling",
];

export default function ExplorePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      <div className="absolute left-3 top-3 z-30 lg:hidden">
        <MobileInnerBack title="Back" />
      </div>

      <section className="relative overflow-hidden bg-[#061839] px-3 pb-10 pt-16 text-white sm:px-4 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.36),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.26),transparent_40%)]" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-7 md:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur-md md:mb-5 md:px-4 md:text-sm">
              <Rocket size={16} />
              Launching Soon
            </div>

            <h1 className="max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
              TPL Travel Creator Ecosystem
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 md:mt-5 md:text-lg md:leading-8">
              A cinematic creator economy layer inside TPL where travel
              storytellers, photographers, filmmakers and explorers will inspire
              travellers through reels, images, hidden places and future earning
              opportunities.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-8">
              <Link
                href="/"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#061839] shadow-xl transition hover:-translate-y-0.5 sm:w-auto"
              >
                Back to TPL
                <ArrowRight size={17} />
              </Link>

              <button className="min-h-11 w-full rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md sm:w-auto">
                Join Waitlist
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {showcaseItems.map((item, index) => (
              <div
                key={item}
                className={`min-h-[118px] rounded-[22px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:min-h-[150px] md:min-h-[185px] md:rounded-[30px] md:p-5 ${
                  index % 2 === 1 ? "sm:mt-10" : ""
                }`}
              >
                <div className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold md:mb-14">
                  Coming Soon
                </div>

                <PlayCircle className="mb-3 text-cyan-200" size={24} />

                <h3 className="text-base font-extrabold md:text-xl">{item}</h3>
                <p className="mt-2 text-sm text-blue-100">
                  Creator media preview
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#eef5ff] via-white to-[#f3f8ff] px-3 py-10 sm:px-4 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061839] text-white shadow-lg md:h-14 md:w-14">
              <Sparkles size={25} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-950 md:text-4xl">
              Inspire • Create • Earn
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              TPL Creators will connect travel inspiration with real OTA
              discovery. Future creator media can help travellers explore
              destinations, choose packages, discover hidden places and
              experience journeys before booking.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-5 lg:grid-cols-4">
            {ecosystemCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:rounded-[28px] md:p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#061839] md:mb-5 md:h-12 md:w-12">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-950 md:text-lg">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-4 md:py-16">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-[#061839] p-4 text-white shadow-xl md:rounded-[34px] md:p-10">
          <div className="grid items-center gap-7 md:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100 md:text-sm">
                <Globe2 size={16} />
                OTA Integrated Vision
              </div>

              <h2 className="text-2xl font-extrabold md:text-4xl">
                Not a separate platform. A creator layer inside TPL.
              </h2>

              <p className="mt-4 text-sm leading-7 text-blue-100 md:text-base">
                Creator content will be connected with destinations, packages,
                travel guides, AI recommendations, special offers and future
                booking journeys — keeping the full ecosystem inside TPL.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md md:rounded-[26px] md:p-5">
                <ImageIcon className="mb-4 text-cyan-200" size={24} />
                <h3 className="font-extrabold">Media Showcase</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Future reels, images, drone visuals and destination snippets.
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md md:rounded-[26px] md:p-5">
                <TrendingUp className="mb-4 text-cyan-200" size={24} />
                <h3 className="font-extrabold">Creator Growth</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Future visibility, analytics and performance insights for
                  travel creators.
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:col-span-2 md:rounded-[26px] md:p-5">
                <Bot className="mb-4 text-cyan-200" size={24} />
                <h3 className="font-extrabold">AI Travel Discovery</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Future AI can recommend creator content based on destination,
                  budget, theme, travel intent and package interest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-3 py-10 sm:px-4 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 md:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#061839] md:text-sm">
                <Compass size={16} />
                Future Ecosystem Preview
              </div>

              <h2 className="text-2xl font-extrabold text-slate-950 md:text-4xl">
                Built for travellers, creators and destination discovery.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                This Coming Soon version is only the teaser. Future phases can
                include creator onboarding, upload approvals, public creator
                profiles, media licensing, earnings wallet and creator analytics.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {futureItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#061839]">
                    <Users size={18} />
                  </div>

                  <p className="text-sm font-bold text-slate-800 md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-20 pt-10 sm:px-4 md:py-16">
        <div className="mx-auto max-w-5xl rounded-[24px] bg-gradient-to-br from-[#061839] via-[#0b3a7a] to-[#0b5cff] p-5 text-center text-white shadow-2xl md:rounded-[34px] md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100 md:text-sm md:tracking-[0.25em]">
            Something big is coming
          </p>

          <h2 className="mt-4 text-2xl font-extrabold md:text-5xl">
            Travel creators will soon have a home inside TPL.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
            The current experience is a premium Coming Soon layer. Uploads,
            approvals, creator dashboard, earning wallet, analytics and backend
            workflows will be added later.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button className="min-h-11 w-full rounded-full bg-white px-7 py-3 text-sm font-bold text-[#061839] sm:w-auto">
              Join Waitlist
            </button>

            <Link
              href="/"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-md sm:w-auto"
            >
              Explore TPL
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
