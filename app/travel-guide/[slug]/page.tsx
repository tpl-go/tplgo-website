import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { travelGuideArticles } from "@/app/lib/travel-guide/data/articles";

import {
  getRelatedTravelGuideArticles,
  getTravelGuideArticleBySlug,
} from "@/app/lib/travel-guide/travelGuideHelpers";

import ArticleHero from "@/app/components/travel-guide/[slug]/ArticleHero";
import ArticleContentRenderer from "@/app/components/travel-guide/[slug]/ArticleContentRenderer";
import ArticleSidebar from "@/app/components/travel-guide/[slug]/ArticleSidebar";
import ReadingProgressBar from "@/app/components/travel-guide/[slug]/ReadingProgressBar";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return travelGuideArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const article = getTravelGuideArticleBySlug(slug);

  if (!article) {
    return {
      title: "Travel Guide | TPL",
      description: "Travel guides and destination insights from TPL.",
    };
  }

  return {
    title: article.seoTitle,

    description: article.seoDescription,

    keywords: article.tags,

    openGraph: {
      title: article.seoTitle,

      description: article.seoDescription,

      images: [
        {
          url: article.heroImage,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: article.seoTitle,

      description: article.seoDescription,

      images: [article.heroImage],
    },
  };
}

export default async function TravelGuideDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  const article = getTravelGuideArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles =
    getRelatedTravelGuideArticles(article.slug);

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "Article",

    headline: article.title,

    description: article.seoDescription,

    image: article.heroImage,

    author: {
      "@type": "Organization",

      name: article.author || "TPL Team",
    },

    publisher: {
      "@type": "Organization",

      name: "TPL",
    },

    datePublished: article.publishDate,
  };

  return (
    <main className="min-h-screen bg-gray-50">

<ReadingProgressBar />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* HERO */}
      <ArticleHero article={article} />

      {/* BODY */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10">
          {/* ARTICLE CONTENT */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
            <ArticleContentRenderer
              blocks={article.blocks}
            />
          </div>

          {/* SIDEBAR */}
          <ArticleSidebar
  article={article}
  relatedArticles={relatedArticles}
  blocks={article.blocks}
/>
        </div>
      </section>
    </main>
  );
}