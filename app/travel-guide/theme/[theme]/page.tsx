import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getTravelGuideArticlesByThemeSlug,
  getTravelGuideThemes,
} from "@/app/lib/travel-guide/travelGuideHelpers";

import {
  deslugifyTravelGuide,
  slugifyTravelGuide,
} from "@/app/lib/travel-guide/travelGuideUtils";

import ArticleCard from "@/app/components/travel-guide/ArticleCard";

type Props = {
  params: Promise<{
    theme: string;
  }>;
};

export async function generateStaticParams() {
  return getTravelGuideThemes().map((theme) => ({
    theme: slugifyTravelGuide(theme || ""),
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { theme } = await params;

  const themeName =
    deslugifyTravelGuide(theme);

  return {
    title: `${themeName} Travel Guides | TPL`,
    description: `Explore ${themeName} travel guides, destination inspiration and expert travel articles from TPL.`,
  };
}

export default async function TravelGuideThemePage({
  params,
}: Props) {
  const { theme } = await params;

  const articles =
    getTravelGuideArticlesByThemeSlug(theme);

  if (!articles.length) {
    notFound();
  }

  const themeName =
    deslugifyTravelGuide(theme);

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
              Theme
            </div>

            <h1 className="mt-5 text-5xl font-bold leading-tight">
              {themeName} Travel Guides
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              Explore expert travel guides, destination
              inspiration and curated travel experiences
              related to {themeName.toLowerCase()} travel.
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
            />
          ))}
        </div>
      </section>
    </main>
  );
}