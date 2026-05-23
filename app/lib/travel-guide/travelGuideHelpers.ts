import { travelGuideArticles } from "./data/articles";
import { slugifyTravelGuide } from "./travelGuideUtils";

export function getAllTravelGuideArticles() {
  return travelGuideArticles;
}

export function getTravelGuideArticleBySlug(slug: string) {
  return travelGuideArticles.find((article) => article.slug === slug);
}

export function getRelatedTravelGuideArticles(
  currentSlug: string,
  limit = 3
) {
  return travelGuideArticles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, limit);
}

export function getTravelGuideCategories() {
  const categories = new Set(
    travelGuideArticles.map((article) => article.category)
  );

  return Array.from(categories);
}

export function getTravelGuideArticlesByCategory(category: string) {
  return travelGuideArticles.filter(
    (article) =>
      article.category.toLowerCase() === category.toLowerCase()
  );
}

export function getTravelGuideArticlesByDestination(destination: string) {
  return travelGuideArticles.filter(
    (article) =>
      article.destination?.toLowerCase() === destination.toLowerCase()
  );
}

export function getTravelGuideArticlesByTheme(theme: string) {
  return travelGuideArticles.filter(
    (article) =>
      article.theme?.toLowerCase() === theme.toLowerCase()
  );
}

export function getTravelGuideArticlesByCategorySlug(
  categorySlug: string
) {
  return travelGuideArticles.filter(
    (article) =>
      slugifyTravelGuide(article.category) === categorySlug
  );
}

export function getTravelGuideDestinations() {
  const destinations = new Set(
    travelGuideArticles
      .map((article) => article.destination)
      .filter(Boolean)
  );

  return Array.from(destinations);
}

export function getTravelGuideArticlesByDestinationSlug(
  destinationSlug: string
) {
  return travelGuideArticles.filter(
    (article) =>
      slugifyTravelGuide(article.destination || "") ===
      destinationSlug
  );
}

export function getTravelGuideThemes() {
  const themes = new Set(
    travelGuideArticles
      .map((article) => article.theme)
      .filter(Boolean)
  );

  return Array.from(themes);
}

export function getTravelGuideArticlesByThemeSlug(
  themeSlug: string
) {
  return travelGuideArticles.filter(
    (article) =>
      slugifyTravelGuide(article.theme || "") ===
      themeSlug
  );
}

export function getFeaturedTravelGuideArticles() {
  return travelGuideArticles
    .filter((article) => article.isFeatured)
    .sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );
}

export function getTrendingTravelGuideArticles() {
  return travelGuideArticles
    .filter((article) => article.isTrending)
    .sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );
}

export function getEditorsPickTravelGuideArticles() {
  return travelGuideArticles
    .filter((article) => article.isEditorsPick)
    .sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );
}