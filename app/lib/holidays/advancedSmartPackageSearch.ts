import { packageIndex } from "@/app/data/packages";
import { packageSeeds } from "@/app/data/packages/packageSeeds";

export type AdvancedPackageMatch = {
  id: string;
  slug: string;
  title: string;
  country: string;
  continent: string;
  cities: string[];
  theme: string[];
  subThemes: string[];
  score: number;
  matchedBy: string[];
};

type SearchablePackage = {
  id: string;
  slug: string;
  title: string;
  country: string;
  continent: string;
  cities: string[];
  theme: string[];
  subThemes: string[];
  tags: string[];
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "of",
  "for",
  "in",
  "to",
  "a",
  "an",
  "tour",
  "tours",
  "package",
  "packages",
  "trip",
  "holiday",
  "holidays",
  "experience",
  "experiences",
]);

const SYNONYM_GROUPS: string[][] = [
  ["honeymoon", "romantic", "romance", "couple", "celebration"],
  ["wildlife", "safari", "jungle", "nationalpark", "sanctuary"],
  ["spiritual", "pilgrimage", "temple", "religious", "jyotirlinga", "chardham", "dham"],
  ["luxury", "premium", "deluxe", "exclusive", "highend"],
  ["adventure", "trek", "trekking", "expedition", "rafting", "paragliding", "roadtrip"],
  ["nature", "scenic", "backwaters", "mountains", "forest", "lake", "valley"],
  ["medical", "treatment", "surgery", "checkup", "healthcare", "wellness"],
  ["wellness", "ayurveda", "yoga", "meditation", "detox", "rejuvenation"],
  ["culture", "cultural", "heritage", "historical", "monuments", "museum"],
  ["city", "urban", "metropolitan"],
  ["beach", "island", "coast", "coastal", "shore"],
  ["weekend", "shortbreak", "shorttrip", "quickescape"],
  ["desert", "dune"],
  ["snow", "alps", "himalaya", "mountain", "hillstation"],
  ["prewedding", "wedding", "production", "shoot", "fashion"],
];

const ALIAS_MAP: Record<string, string[]> = {
  newyork: ["new york", "nyc", "usa", "united states"],
  uk: ["united kingdom", "london"],
  uae: ["dubai", "united arab emirates"],
  bali: ["indonesia"],
  paris: ["france"],
  london: ["united kingdom", "uk"],
  kerala: ["kochi", "alleppey", "munnar", "kovalam", "varkala", "kumarakom"],
  kashmir: ["srinagar", "gulmarg", "pahalgam"],
  ladakh: ["leh", "nubra", "pangong"],
  chardham: ["char dham", "kedarnath", "badrinath", "gangotri", "yamunotri"],
  jimcorbett: ["corbett", "wildlife", "safari"],
  backwaters: ["alleppey", "kumarakom", "kerala"],
  honeymoon: ["romantic", "celebration"],
  wildlife: ["safari"],
  spiritual: ["pilgrimage", "temple"],
  luxury: ["premium"],
};

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value?: string) {
  return normalize(value).replace(/\s+/g, "");
}

function tokenize(value?: string) {
  return normalize(value)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function getSynonymFamily(token: string) {
  const normalized = compact(token);

  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map(compact);
    if (normalizedGroup.includes(normalized)) {
      return group;
    }
  }

  return [];
}

function expandTokens(tokens: string[]) {
  const expanded = new Set<string>();

  for (const token of tokens) {
    const n = compact(token);
    if (!n) continue;

    expanded.add(n);

    const family = getSynonymFamily(n);
    family.forEach((word) => expanded.add(compact(word)));

    if (ALIAS_MAP[n]) {
      ALIAS_MAP[n].forEach((word) => expanded.add(compact(word)));
    }
  }

  return Array.from(expanded);
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function isLooseFuzzyMatch(a: string, b: string) {
  const aa = compact(a);
  const bb = compact(b);

  if (!aa || !bb) return false;
  if (aa === bb) return true;

  const maxLen = Math.max(aa.length, bb.length);
  const distance = levenshtein(aa, bb);

  if (maxLen <= 4) return distance <= 1;
  if (maxLen <= 8) return distance <= 2;
  return distance <= 3;
}

function getSeedMap() {
  return new Map(packageSeeds.map((seed) => [seed.slug, seed]));
}

function buildSearchablePool(): SearchablePackage[] {
  const seedMap = getSeedMap();

  return packageIndex.map((pkg: any) => {
    const seed = seedMap.get(pkg.slug);

    const themeValues = Array.isArray(pkg.theme)
      ? pkg.theme
      : seed?.theme
        ? [seed.theme]
        : [];

    const subThemeValues = Array.isArray(pkg.subThemes)
      ? pkg.subThemes
      : seed?.subTheme
        ? [seed.subTheme]
        : [];

    return {
      id: String(pkg.id || "").replace("pkg-", ""),
      slug: pkg.slug || seed?.slug || "",
      title: pkg.title || seed?.title || "",
      country: seed?.country || pkg.countries?.[0] || "",
      continent: seed?.continent || pkg.continent || "",
      cities: seed?.cities || pkg.cities || [],
      theme: themeValues,
      subThemes: subThemeValues,
      tags: pkg.tags || [],
    };
  });
}

function buildFieldVariants(pkg: SearchablePackage) {
  const cityValues = pkg.cities || [];
  const themeValues = pkg.theme || [];
  const subThemeValues = pkg.subThemes || [];
  const tagValues = pkg.tags || [];

  const rawFields = [
    pkg.title,
    pkg.slug,
    pkg.country,
    pkg.continent,
    ...cityValues,
    ...themeValues,
    ...subThemeValues,
    ...tagValues,
  ].filter(Boolean);

  const normalizedFields = rawFields.map(normalize);
  const compactFields = rawFields.map(compact);

  const tokens = unique(
    rawFields.flatMap((field) => tokenize(field))
  );

  const expandedTokens = expandTokens(tokens);

  return {
    rawFields,
    normalizedFields,
    compactFields,
    tokens,
    expandedTokens,
  };
}

function scoreFieldContains(query: string, fields: string[]) {
  for (const field of fields) {
    if (field === query) return 1;
  }
  for (const field of fields) {
    if (field.includes(query) || query.includes(field)) return 0.7;
  }
  return 0;
}

function scoreTokenOverlap(queryTokens: string[], candidateTokens: string[]) {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const candidateSet = new Set(candidateTokens);
  let hits = 0;

  for (const token of queryTokens) {
    if (candidateSet.has(token)) hits++;
  }

  return hits / queryTokens.length;
}

function scoreExpandedTokenOverlap(queryTokens: string[], candidateTokens: string[]) {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const expandedQuery = expandTokens(queryTokens);
  const expandedCandidate = new Set(expandTokens(candidateTokens));

  let hits = 0;

  for (const token of expandedQuery) {
    if (expandedCandidate.has(token)) hits++;
  }

  return expandedQuery.length ? hits / expandedQuery.length : 0;
}

function scoreFuzzy(queryTokens: string[], candidateTokens: string[]) {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  let hits = 0;

  for (const q of queryTokens) {
    const matched = candidateTokens.some((token) => isLooseFuzzyMatch(q, token));
    if (matched) hits++;
  }

  return hits / queryTokens.length;
}

export function advancedSmartPackageSearch(
  input: string,
  limit = 20
): AdvancedPackageMatch[] {
  const normalizedQuery = normalize(input);
  const compactQuery = compact(input);
  const queryTokens = tokenize(input);
  const expandedQueryTokens = expandTokens(queryTokens);

  if (!normalizedQuery) return [];

  const pool = buildSearchablePool();

  const scored = pool
    .map((pkg) => {
      const matchedBy: string[] = [];
      let score = 0;

      const fields = buildFieldVariants(pkg);

      const titleNorm = normalize(pkg.title);
      const slugNorm = normalize(pkg.slug);
      const countryNorm = normalize(pkg.country);
      const continentNorm = normalize(pkg.continent);
      const cityNorms = (pkg.cities || []).map(normalize);

      const titleCompact = compact(pkg.title);
      const slugCompact = compact(pkg.slug);

      // 1. strongest exact hits
      if (titleNorm === normalizedQuery) {
        score += 140;
        matchedBy.push("title-exact");
      }

      if (slugNorm === normalizedQuery || slugCompact === compactQuery) {
        score += 135;
        matchedBy.push("slug-exact");
      }

      if (countryNorm === normalizedQuery) {
        score += 120;
        matchedBy.push("country-exact");
      }

      if (continentNorm === normalizedQuery) {
        score += 90;
        matchedBy.push("continent-exact");
      }

      if (cityNorms.some((city) => city === normalizedQuery)) {
        score += 125;
        matchedBy.push("city-exact");
      }

      if (titleCompact === compactQuery) {
        score += 130;
        matchedBy.push("title-compact");
      }

      // 2. phrase contains
      if (titleNorm.includes(normalizedQuery)) {
        score += 85;
        matchedBy.push("title-contains");
      }

      const fieldContainsScore = scoreFieldContains(
        normalizedQuery,
        fields.normalizedFields
      );
      if (fieldContainsScore > 0) {
        score += fieldContainsScore * 70;
        matchedBy.push("field-contains");
      }

      const compactContainsScore = scoreFieldContains(
        compactQuery,
        fields.compactFields
      );
      if (compactContainsScore > 0) {
        score += compactContainsScore * 55;
        matchedBy.push("compact-contains");
      }

      // 3. token overlap
      const tokenOverlap = scoreTokenOverlap(queryTokens, fields.tokens);
      if (tokenOverlap > 0) {
        score += tokenOverlap * 80;
        matchedBy.push("token-overlap");
      }

      const expandedTokenOverlap = scoreExpandedTokenOverlap(
        queryTokens,
        fields.tokens
      );
      if (expandedTokenOverlap > 0) {
        score += expandedTokenOverlap * 90;
        matchedBy.push("semantic-overlap");
      }

      // 4. fuzzy match
      const fuzzyScore = scoreFuzzy(queryTokens, fields.tokens);
      if (fuzzyScore > 0) {
        score += fuzzyScore * 45;
        matchedBy.push("fuzzy-match");
      }

      // 5. alias direct boosts
      for (const q of expandedQueryTokens) {
        if (fields.expandedTokens.includes(q)) {
          score += 12;
          matchedBy.push(`expanded-token:${q}`);
        }
      }

      // 6. destination priority boosts
      for (const q of queryTokens) {
        const qq = compact(q);

        if (cityNorms.some((city) => compact(city) === qq)) {
          score += 30;
          matchedBy.push(`city-token:${q}`);
        }

        if (compact(countryNorm) === qq) {
          score += 26;
          matchedBy.push(`country-token:${q}`);
        }

        if (compact(continentNorm) === qq) {
          score += 20;
          matchedBy.push(`continent-token:${q}`);
        }
      }

      // 7. multi-hit bonus
      const strongSignalCount = unique(matchedBy).length;
      if (strongSignalCount >= 3) {
        score += strongSignalCount * 8;
        matchedBy.push("multi-signal-bonus");
      }

      return {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        country: pkg.country,
        continent: pkg.continent,
        cities: pkg.cities,
        theme: pkg.theme,
        subThemes: pkg.subThemes,
        score: Math.round(score),
        matchedBy: unique(matchedBy),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      // tie-breakers
      const aTitle = a.title.length;
      const bTitle = b.title.length;

      return aTitle - bTitle;
    })
    .slice(0, limit);

  return scored;
}