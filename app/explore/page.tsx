import Link from "next/link";
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
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[#061839] px-4 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.36),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.26),transparent_40%)]" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
              <Rocket size={16} />
              Launching Soon
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
              TPL Travel Creator Ecosystem
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">
              A cinematic creator economy layer inside TPL where travel
              storytellers, photographers, filmmakers and explorers will inspire
              travellers through reels, images, hidden places and future earning
              opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#061839] shadow-xl transition hover:-translate-y-0.5"
              >
                Back to TPL
                <ArrowRight size={17} />
              </Link>

              <button className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md">
                Join Waitlist
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {showcaseItems.map((item, index) => (
              <div
                key={item}
                className={`min-h-[185px] rounded-[30px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl ${
                  index % 2 === 1 ? "sm:mt-10" : ""
                }`}
              >
                <div className="mb-14 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  Coming Soon
                </div>

                <PlayCircle className="mb-3 text-cyan-200" size={24} />

                <h3 className="text-xl font-extrabold">{item}</h3>
                <p className="mt-2 text-sm text-blue-100">
                  Creator media preview
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#eef5ff] via-white to-[#f3f8ff] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#061839] text-white shadow-lg">
              <Sparkles size={25} />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-950 md:text-4xl">
              Inspire • Create • Earn
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              TPL Creators will connect travel inspiration with real OTA
              discovery. Future creator media can help travellers explore
              destinations, choose packages, discover hidden places and
              experience journeys before booking.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ecosystemCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#061839]">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-950">
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

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-[34px] bg-[#061839] p-6 text-white shadow-xl md:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Globe2 size={16} />
                OTA Integrated Vision
              </div>

              <h2 className="text-3xl font-extrabold md:text-4xl">
                Not a separate platform. A creator layer inside TPL.
              </h2>

              <p className="mt-4 text-base leading-7 text-blue-100">
                Creator content will be connected with destinations, packages,
                travel guides, AI recommendations, special offers and future
                booking journeys — keeping the full ecosystem inside TPL.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <ImageIcon className="mb-4 text-cyan-200" size={24} />
                <h3 className="font-extrabold">Media Showcase</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Future reels, images, drone visuals and destination snippets.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <TrendingUp className="mb-4 text-cyan-200" size={24} />
                <h3 className="font-extrabold">Creator Growth</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Future visibility, analytics and performance insights for
                  travel creators.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-md sm:col-span-2">
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

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#061839]">
                <Compass size={16} />
                Future Ecosystem Preview
              </div>

              <h2 className="text-3xl font-extrabold text-slate-950 md:text-4xl">
                Built for travellers, creators and destination discovery.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#061839]">
                    <Users size={18} />
                  </div>

                  <p className="font-bold text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-[34px] bg-gradient-to-br from-[#061839] via-[#0b3a7a] to-[#0b5cff] p-8 text-center text-white shadow-2xl md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Something big is coming
          </p>

          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
            Travel creators will soon have a home inside TPL.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-100">
            The current experience is a premium Coming Soon layer. Uploads,
            approvals, creator dashboard, earning wallet, analytics and backend
            workflows will be added later.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="rounded-full bg-white px-7 py-3 text-sm font-bold text-[#061839]">
              Join Waitlist
            </button>

            <Link
              href="/"
              className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-md"
            >
              Explore TPL
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}