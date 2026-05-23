export type TravelGuideBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "heading";
      content: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "quote";
      content: string;
    }
  | {
      type: "cta";
      title: string;
      description: string;
      buttonText: string;
      href: string;
    }
  | {
      type: "faq";
      question: string;
      answer: string;
    };

export type RelatedPackage = {
  title: string;

  href?: string;

  priceText?: string;

  linkedTheme?: string;
  linkedSubTheme?: string;

  linkedDestination?: string;
  linkedCountry?: string;
  linkedContinent?: string;
};

export type TravelGuideArticle = {
  slug: string;
  title: string;
  shortDescription: string;
  heroImage: string;
  category: string;
  destination?: string;
  continent?: string;
  theme?: string;
  tags: string[];
  readTime: string;
  author: string;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;

  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorsPick?: boolean;
  priority?: number;

  relatedPackages?: RelatedPackage[];

  blocks: TravelGuideBlock[];
};