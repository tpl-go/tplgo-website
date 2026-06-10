import type {
  TiyaCreatorPick,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaSuggestion,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaCommerceBundle = {
  id: string;
  title: string;
  detail: string;
  source: "Creator" | "Local Market" | "Stay" | "Activity";
  cta: string;
  href: string;
  relevance: number;
};

export function generateCommerceBundles({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaCommerceBundle[] {
  const creatorPicks = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const marketPicks = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const suggestions = Array.isArray(plan.suggestions) ? plan.suggestions : [];
  const bundles: TiyaCommerceBundle[] = [];

  creatorPicks.slice(0, 2).forEach((creator: TiyaCreatorPick) => {
    bundles.push({
      id: `creator-${creator.id}`,
      title: creator.specialty,
      detail: `${creator.creatorName} fits ${creator.destination} with ${creator.routeFit}% route alignment.`,
      source: "Creator",
      cta: "View Creator",
      href: "/creators",
      relevance: creator.routeFit,
    });
  });

  marketPicks.slice(0, 2).forEach((product: TiyaLocalMarketPick) => {
    bundles.push({
      id: `market-${product.id}`,
      title: product.productName,
      detail: `${product.specialtyLabel} from ${product.localRegion}, matched to this route.`,
      source: "Local Market",
      cta: "View Local Market",
      href: "/local-market",
      relevance: product.routeRelevance,
    });
  });

  suggestions
    .filter((suggestion: TiyaSuggestion) => suggestion.category === "Stay")
    .slice(0, 1)
    .forEach((suggestion) => {
      bundles.push({
        id: `stay-${suggestion.title}`,
        title: suggestion.title,
        detail: suggestion.detail,
        source: "Stay",
        cta: intent.stayPreference === "Homestay" ? "View Homestays" : "View Hotels",
        href: intent.stayPreference === "Homestay" ? "/homestays/results" : "/hotels/results",
        relevance: 84,
      });
    });

  suggestions
    .filter((suggestion: TiyaSuggestion) => suggestion.category === "Activity")
    .slice(0, 1)
    .forEach((suggestion) => {
      bundles.push({
        id: `activity-${suggestion.title}`,
        title: suggestion.title,
        detail: suggestion.detail,
        source: "Activity",
        cta: "View Activities",
        href: "/explore",
        relevance: 82,
      });
    });

  return bundles.slice(0, 6);
}
