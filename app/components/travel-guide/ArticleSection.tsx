import ArticleCard from "./ArticleCard";

import type { TravelGuideArticle } from "@/app/lib/travel-guide/travelGuideTypes";

type Props = {
  id?: string;
  title: string;
  description?: string;
  articles: TravelGuideArticle[];
};

export default function ArticleSection({
  id,
  title,
  description,
  articles,
}: Props) {
  if (!articles.length) return null;

  return (
    <section id={id}>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>

          {description && (
            <p className="mt-3 text-gray-600">{description}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}