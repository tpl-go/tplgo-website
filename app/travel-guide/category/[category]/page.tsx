import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getTravelGuideArticlesByCategorySlug,
  getTravelGuideCategories,
} from "@/app/lib/travel-guide/travelGuideHelpers";

import {
  deslugifyTravelGuide,
  slugifyTravelGuide,
} from "@/app/lib/travel-guide/travelGuideUtils";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateStaticParams() {
  return getTravelGuideCategories().map((category) => ({
    category: slugifyTravelGuide(category),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;

  const categoryName = deslugifyTravelGuide(category);

  return {
    title: `${categoryName} Travel Guides | TPL`,
    description: `Explore ${categoryName} travel guides, destination insights and travel planning articles from TPL.`,
  };
}

export default async function TravelGuideCategoryPage({ params }: Props) {
  const { category } = await params;

  const articles = getTravelGuideArticlesByCategorySlug(category);

  if (!articles.length) {
    notFound();
  }

  const categoryName = deslugifyTravelGuide(category);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-[#0B1F3A] px-3 py-12 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/travel-guide"
            className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20 sm:px-5 sm:text-sm"
          >
            ← Back to Travel Guide
          </Link>

          <div className="mt-7 sm:mt-8">
            <div className="inline-flex rounded-full bg-orange-500 px-4 py-1 text-xs font-bold sm:text-sm">
              Category
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-5xl">
              {categoryName} Travel Guides
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:mt-5 sm:text-lg sm:leading-8">
              Explore expert travel articles, destination insights and planning
              tips related to {categoryName.toLowerCase()} travel.
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-5 md:grid-cols-2 md:gap-7 xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/travel-guide/${article.slug}`}
              className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white transition-all duration-300 hover:shadow-2xl sm:rounded-3xl"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden bg-gray-100 sm:h-60">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-3 text-xs font-medium text-gray-500 sm:mb-4 sm:text-sm">
                  <span>{article.publishDate}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="text-xl font-bold leading-7 text-gray-900 transition group-hover:text-orange-600 sm:text-2xl sm:leading-9">
                  {article.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-600 sm:mt-4 sm:text-[15px]">
                  {article.shortDescription}
                </p>

                <div className="mt-5 inline-flex items-center text-sm font-bold text-orange-600 sm:mt-7">
                  Read Full Guide →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}