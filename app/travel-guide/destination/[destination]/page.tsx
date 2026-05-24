import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getTravelGuideArticlesByDestinationSlug,
  getTravelGuideDestinations,
} from "@/app/lib/travel-guide/travelGuideHelpers";

import {
  deslugifyTravelGuide,
  slugifyTravelGuide,
} from "@/app/lib/travel-guide/travelGuideUtils";

import ArticleCard from "@/app/components/travel-guide/ArticleCard";

type Props = {
  params: Promise<{
    destination: string;
  }>;
};

export async function generateStaticParams() {
  return getTravelGuideDestinations().map((destination) => ({
    destination: slugifyTravelGuide(destination || ""),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination } = await params;

  const destinationName = deslugifyTravelGuide(destination);

  return {
    title: `${destinationName} Travel Guides | TPL`,
    description: `Explore ${destinationName} travel guides, destination insights and expert travel planning articles from TPL.`,
  };
}

export default async function TravelGuideDestinationPage({ params }: Props) {
  const { destination } = await params;

  const articles = getTravelGuideArticlesByDestinationSlug(destination);

  if (!articles.length) {
    notFound();
  }

  const destinationName = deslugifyTravelGuide(destination);

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
              Destination
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-5xl">
              {destinationName} Travel Guides
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:mt-5 sm:text-lg sm:leading-8">
              Explore destination insights, travel tips, itineraries and expert
              travel planning guides for {destinationName}.
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-5 md:grid-cols-2 md:gap-7 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}