import Link from "next/link";

import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  featuredArticles: TravelGuideArticle[];
  trendingArticles: TravelGuideArticle[];
};

export default function FeaturedGuidesSection({
  featuredArticles,
  trendingArticles,
}: Props) {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            Discover
          </div>

          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
            Featured & Trending Guides
          </h2>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* LEFT FEATURED */}
        <div className="space-y-6">
          {featuredArticles.slice(0, 2).map((article) => (
            <Link
              key={article.slug}
              href={`/travel-guide/${article.slug}`}
              className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm hover:shadow-xl transition block"
            >
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute left-6 bottom-6 right-6">
                  <div className="inline-flex rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
                    {article.category}
                  </div>

                  <h3 className="mt-4 text-2xl md:text-3xl font-bold text-white leading-tight">
                    {article.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/80">
                    {article.shortDescription}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* RIGHT TRENDING */}
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              Trending Now
            </h3>

            <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              Popular
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {trendingArticles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/travel-guide/${article.slug}`}
                className="group flex gap-4 rounded-2xl border border-gray-100 p-3 hover:border-orange-300 hover:bg-orange-50/40 transition"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-sm font-bold text-white">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    {article.category}
                  </div>

                  <h4 className="mt-1 text-base font-bold leading-7 text-gray-900 group-hover:text-orange-600 transition">
                    {article.title}
                  </h4>

                  <div className="mt-2 text-xs text-gray-500">
                    {article.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}