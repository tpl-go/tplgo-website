"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";

import TravelGuideSearch from "@/app/components/travel-guide/TravelGuideSearch";
import ArticleCard from "@/app/components/travel-guide/ArticleCard";
import TravelGuideHero from "@/app/components/travel-guide/TravelGuideHero";
import FeaturedGuidesSection from "@/app/components/travel-guide/FeaturedGuidesSection";
import ArticleSection from "@/app/components/travel-guide/ArticleSection";

import {
  getAllTravelGuideArticles,
  getEditorsPickTravelGuideArticles,
  getFeaturedTravelGuideArticles,
  getTravelGuideCategories,
  getTravelGuideDestinations,
  getTravelGuideThemes,
  getTrendingTravelGuideArticles,
} from "@/app/lib/travel-guide/travelGuideHelpers";

import { slugifyTravelGuide } from "@/app/lib/travel-guide/travelGuideUtils";

export default function TravelGuidePage() {
  const allArticles = getAllTravelGuideArticles();

  const featuredArticles =
    getFeaturedTravelGuideArticles();

  const trendingArticles =
    getTrendingTravelGuideArticles();

  const editorsPickArticles =
    getEditorsPickTravelGuideArticles();

  const categories = getTravelGuideCategories();

  const destinations = getTravelGuideDestinations();

  const themes = getTravelGuideThemes();

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState("all");

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchesCategory =
        activeCategory === "all"
          ? true
          : article.category === activeCategory;

      const query = search.toLowerCase();

      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.shortDescription
          .toLowerCase()
          .includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.destination
          ?.toLowerCase()
          .includes(query) ||
        article.theme?.toLowerCase().includes(query) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      return matchesCategory && matchesSearch;
    });
  }, [allArticles, search, activeCategory]);

  const featuredArticle = featuredArticles[0];

  const spiritualArticles = allArticles.filter(
    (article) =>
      article.theme?.toLowerCase() ===
      "spiritual"
  );

  const adventureArticles = allArticles.filter(
    (article) =>
      article.theme?.toLowerCase() ===
        "adventure" ||
      article.theme?.toLowerCase() ===
        "adventure & nature"
  );

  const honeymoonArticles = allArticles.filter(
    (article) =>
      article.theme?.toLowerCase() ===
        "honeymoon" ||
      article.theme?.toLowerCase() ===
        "honeymoon & celebration"
  );

  const highlightedArticleSlugs = new Set([
    ...featuredArticles.map(
      (article) => article.slug
    ),

    ...trendingArticles.map(
      (article) => article.slug
    ),

    ...editorsPickArticles.map(
      (article) => article.slug
    ),
  ]);

  const latestArticles = filteredArticles.filter(
    (article) =>
      !highlightedArticleSlugs.has(article.slug)
  );

  return (
    <FooterInfoPageLayout
      badge="Travel Guide"
      title="Travel inspiration, destination guides and expert travel tips"
      description="Explore destination insights, travel planning ideas, pilgrimage guides, honeymoon inspiration and expert travel recommendations from TPL."
    >
      <div className="space-y-16">
        {/* HERO */}
        <TravelGuideHero
          featuredArticle={featuredArticle}
        />

        {/* FEATURED + TRENDING */}
        <FeaturedGuidesSection
          featuredArticles={featuredArticles}
          trendingArticles={trendingArticles}
        />

        {/* TOP HIGHLIGHTS */}
        <section className="grid md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="text-3xl font-bold text-gray-900">
              {allArticles.length}
            </div>

            <div className="mt-2 text-sm font-medium text-gray-600">
              Expert Travel Guides
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="text-3xl font-bold text-gray-900">
              24/7
            </div>

            <div className="mt-2 text-sm font-medium text-gray-600">
              Travel Assistance & Planning
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="text-3xl font-bold text-gray-900">
              Personalized
            </div>

            <div className="mt-2 text-sm font-medium text-gray-600">
              Destination Recommendations
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <TravelGuideSearch
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* CATEGORIES */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/travel-guide/category/${slugifyTravelGuide(
                  category
                )}`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        {/* DESTINATIONS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Popular Destinations
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {destinations.map((destination) => (
              <Link
                key={destination}
                href={`/travel-guide/destination/${slugifyTravelGuide(
                  destination
                )}`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition"
              >
                {destination}
              </Link>
            ))}
          </div>
        </section>

        {/* THEMES */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Explore by Theme
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {themes.map((theme) => (
              <Link
                key={theme}
                href={`/travel-guide/theme/${slugifyTravelGuide(
                  theme
                )}`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition"
              >
                {theme}
              </Link>
            ))}
          </div>
        </section>

        {/* SPIRITUAL */}
        <ArticleSection
          id="spiritual-guides"
          title="Spiritual Travel Guides"
          description="Pilgrimage planning, temple circuits, Char Dham routes and sacred travel experiences."
          articles={spiritualArticles}
        />

        {/* ADVENTURE */}
        <ArticleSection
          id="adventure-guides"
          title="Adventure & Nature Guides"
          description="Trekking, mountain journeys, wildlife escapes and outdoor travel inspiration."
          articles={adventureArticles}
        />

        {/* HONEYMOON */}
        <ArticleSection
          id="honeymoon-guides"
          title="Honeymoon & Romantic Escapes"
          description="Romantic destinations, couple experiences and honeymoon travel inspiration."
          articles={honeymoonArticles}
        />

        {/* TRENDING */}
        {trendingArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-4xl font-bold text-gray-900">
                Trending Travel Guides
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
              {trendingArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                />
              ))}
            </div>
          </section>
        )}

        {/* EDITOR PICKS */}
        {editorsPickArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-4xl font-bold text-gray-900">
                Editor Picks
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
              {editorsPickArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                />
              ))}
            </div>
          </section>
        )}

        {/* LATEST */}
        <section id="latest-guides">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                Latest Travel Guides
              </h2>

              <p className="mt-3 text-gray-600">
                Showing {latestArticles.length} article
                {latestArticles.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <div className="text-2xl font-bold text-gray-900">
                No travel guides found
              </div>

              <p className="mt-4 text-gray-600">
                Try searching with another keyword or category.
              </p>
            </div>
          )}
        </section>
      </div>
    </FooterInfoPageLayout>
  );
}