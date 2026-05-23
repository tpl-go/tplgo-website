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

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { category } = await params;

  const categoryName =
    deslugifyTravelGuide(category);

  return {
    title: `${categoryName} Travel Guides | TPL`,
    description: `Explore ${categoryName} travel guides, destination insights and travel planning articles from TPL.`,
  };
}

export default async function TravelGuideCategoryPage({
  params,
}: Props) {
  const { category } = await params;

  const articles =
    getTravelGuideArticlesByCategorySlug(
      category
    );

  if (!articles.length) {
    notFound();
  }

  const categoryName =
  deslugifyTravelGuide(category);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-[#0B1F3A] text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/travel-guide"
            className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/20 transition"
          >
            ← Back to Travel Guide
          </Link>

          <div className="mt-8">
            <div className="inline-flex rounded-full bg-orange-500 px-4 py-1 text-sm font-bold">
              Category
            </div>

            <h1 className="mt-5 text-5xl font-bold leading-tight">
              {categoryName} Travel Guides
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              Explore expert travel articles, destination insights
              and planning tips related to {categoryName.toLowerCase()} travel.
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/travel-guide/${article.slug}`}
              className="group rounded-3xl overflow-hidden border border-gray-200 bg-white hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-60 overflow-hidden bg-gray-100">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
                  <span>{article.publishDate}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 leading-9 group-hover:text-orange-600 transition">
                  {article.title}
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-gray-600">
                  {article.shortDescription}
                </p>

                <div className="mt-7 inline-flex items-center text-sm font-bold text-orange-600">
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