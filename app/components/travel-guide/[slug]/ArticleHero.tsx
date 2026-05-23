import Link from "next/link";

import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  article: TravelGuideArticle;
};

export default function ArticleHero({
  article,
}: Props) {
  return (
    <section className="relative h-[520px] overflow-hidden">
      <img
        src={article.heroImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/80 mb-6">
          <Link
            href="/"
            className="hover:text-white transition"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/travel-guide"
            className="hover:text-white transition"
          >
            Travel Guide
          </Link>

          <span>/</span>

          <span className="text-white font-medium">
            {article.title}
          </span>
        </div>

        <Link
          href="/travel-guide"
          className="mb-6 inline-flex w-fit rounded-full bg-white/15 backdrop-blur border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/25 transition"
        >
          ← Back to Travel Guide
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
            {article.category}
          </span>

          <span className="rounded-full bg-white/15 backdrop-blur px-4 py-1 text-xs font-medium text-white">
            {article.readTime}
          </span>

          <span className="rounded-full bg-white/15 backdrop-blur px-4 py-1 text-xs font-medium text-white">
            {article.publishDate}
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl md:text-6xl font-bold leading-tight text-white">
          {article.title}
        </h1>

        <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-white/85">
          {article.shortDescription}
        </p>

        {/* Tags */}
        <div className="mt-7 flex flex-wrap gap-3">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/20 bg-white/10 backdrop-blur px-4 py-1 text-sm text-white"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}