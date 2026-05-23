import Link from "next/link";

import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  featuredArticle?: TravelGuideArticle;
};

export default function TravelGuideHero({ featuredArticle }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#0B1F3A] text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#102B52] to-orange-500/30" />

      {featuredArticle?.heroImage && (
        <img
          src={featuredArticle.heroImage}
          alt={featuredArticle.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
      )}

      <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 px-8 md:px-12 py-14 md:py-16 items-center">
        <div>
          <div className="inline-flex rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-sm font-semibold">
            TPL Travel Guide
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
            Expert travel guides for smarter trip planning
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg leading-8 text-white/85">
            Explore destination guides, pilgrimage planning, travel tips,
            curated packages and expert recommendations from TPL.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#latest-guides"
              className="rounded-full bg-orange-500 px-7 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
            >
              Explore Guides
            </Link>

            <a
              href="https://wa.me/919649400299"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0B1F3A] hover:bg-orange-50 transition"
            >
              Talk to Travel Expert
            </a>
          </div>
        </div>

        {featuredArticle && (
          <Link
            href={`/travel-guide/${featuredArticle.slug}`}
            className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur p-6 hover:bg-white/15 transition"
          >
            <div className="text-sm font-bold text-orange-300">
              Featured Guide
            </div>

            <h2 className="mt-4 text-3xl font-bold leading-10">
              {featuredArticle.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/80">
              {featuredArticle.shortDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {featuredArticle.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-7 text-sm font-bold text-orange-300">
              Read Full Guide →
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}