import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";

const marketSections = [
  {
    title: "Destination Products",
    text: "Curated local goods connected to the places travellers already love.",
    query: "india local market handicraft travel products",
  },
  {
    title: "Creator Recommended",
    text: "Future shelves shaped by creators, local experts, and trusted TPL experiences.",
    query: "travel creator recommended local products market",
  },
  {
    title: "Authentic Local Brands",
    text: "A premium storefront for regional makers, food, crafts, wellness, and culture.",
    query: "authentic local artisan market india travel shopping",
  },
];

export default function LocalMarketLanding() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-950">
      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <TPLDynamicImage
          imageQuery="premium destination marketplace local artisan products india travel"
          fallbackQuery="local market artisan products travel india"
          alt="TPL Local Market"
          className="absolute inset-0 h-full w-full opacity-25"
          imgClassName="h-full w-full object-cover"
          priority
          preferDynamic
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-cyan-50/90" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <div className="w-fit rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm">
              Destination Marketplace
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Local finds, linked to every journey.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-650 sm:text-lg">
              A premium market foundation for destination products, creator picks, authentic local brands, and travel-led discovery.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {marketSections.map((section) => (
            <article
              key={section.title}
              className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm"
            >
              <TPLDynamicImage
                imageQuery={section.query}
                fallbackQuery="destination local market travel products"
                alt={section.title}
                className="h-44 w-full"
                imgClassName="h-full w-full object-cover"
                preferDynamic
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="p-5">
                <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  {section.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
