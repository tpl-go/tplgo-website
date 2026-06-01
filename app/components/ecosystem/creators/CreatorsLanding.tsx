import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";

const creatorBlocks = [
  {
    title: "Creator Categories",
    text: "Travel filmmakers, destination hosts, reviewers, storytellers, and local experts.",
  },
  {
    title: "Creator Studio",
    text: "Future tools for briefs, trip drops, content calendars, and campaign-ready assets.",
  },
  {
    title: "Licensing Hub",
    text: "A scalable layer for brand usage, destination rights, and premium travel media.",
  },
  {
    title: "Earnings Console",
    text: "Future revenue tracking for bookings, campaigns, licensing, and creator-led experiences.",
  },
];

export default function CreatorsLanding() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950">
        <TPLDynamicImage
          imageQuery="travel creator filming cinematic mountains camera luxury destination"
          fallbackQuery="cinematic travel creator camera destination"
          alt="TPL creator ecosystem"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-55"
          priority
          preferDynamic
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-blue-950/35" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="w-fit rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
              TPL Creator Ecosystem
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Travel creation, built for commerce.
            </h1>

            <p className="mt-5 text-2xl font-black tracking-tight text-cyan-100 sm:text-3xl">
              Camera on. Revenue strong.
            </p>

            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-200 sm:text-lg">
              A premium creator economy foundation for travel content, licensed media, destination storytelling, and booking-led revenue.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creatorBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 h-28 overflow-hidden rounded-xl bg-slate-100">
                <TPLDynamicImage
                  imageQuery={`${block.title} travel creator economy`}
                  fallbackQuery="travel creator camera studio destination"
                  alt={block.title}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  preferDynamic
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <h2 className="text-lg font-black text-slate-950">{block.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {block.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
