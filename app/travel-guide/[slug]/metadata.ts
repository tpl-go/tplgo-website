import type { Metadata } from "next";

import { getTravelGuideArticleBySlug } from "@/app/lib/travel-guide/travelGuideHelpers";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const article = getTravelGuideArticleBySlug(params.slug);

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