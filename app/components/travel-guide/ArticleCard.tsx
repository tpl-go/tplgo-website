import Link from "next/link";

import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  article: TravelGuideArticle;
};

export default function ArticleCard({
  article,
}: Props) {
  return (
    <Link
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

        <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-900 shadow">
          {article.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
          <span>{article.publishDate}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 leading-9 group-hover:text-orange-600 transition">
          {article.title}
        </h3>

        <p className="mt-4 text-[15px] leading-7 text-gray-600">
          {article.shortDescription}
        </p>

        {/* Tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-7 inline-flex items-center text-sm font-bold text-orange-600">
          Read Full Guide →
        </div>
      </div>
    </Link>
  );
}