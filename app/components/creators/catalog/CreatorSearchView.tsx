import { getCategories, searchAssets } from "@/app/lib/creators/creatorCatalogRepository";
import CreatorSearchPage from "./search/CreatorSearchPage";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CreatorSearchView({ searchParams }: { searchParams: SearchParams }) {
  const [assetsResult, categoriesResult] = await Promise.all([
    searchAssets({ pageSize: "100" }),
    getCategories(),
  ]);

  return (
    <CreatorSearchPage
      assets={assetsResult.data.assets}
      categories={categoriesResult.data}
      initialParams={searchParams}
    />
  );
}
