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
  return getTravelGuideDestinations().map(
    (destination) => ({
      destination: slugifyTravelGuide(destination || ""),
    })
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { destination } = await params;

  const destinationName =
    deslugifyTravelGuide(destination);

  return {
    title: `${destinationName} Travel Guides | TPL`,
    description: `Explore ${destinationName} travel guides, destination insights and expert travel planning articles from TPL.`,
  };
}

export default async function TravelGuideDestinationPage({
  params,
}: Props) {
  const { destination } = await params;

  const articles =
    getTravelGuideArticlesByDestinationSlug(
      destination
    );

  if (!articles.length) {
    notFound();
  }

  const destinationName =
    deslugifyTravelGuide(destination);

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
              Destination
            </div>

            <h1 className="mt-5 text-5xl font-bold leading-tight">
              {destinationName} Travel Guides
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              Explore destination insights, travel tips,
              itineraries and expert travel planning guides
              for {destinationName}.
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