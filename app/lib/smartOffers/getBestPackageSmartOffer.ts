import {
  SMART_OFFERS_DATA,
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

type PackageOfferInput = {
  routeId?: string;
  id?: string;
  slug?: string;
  title?: string;
  country?: string;
  countries?: string[];
  continent?: string;
  route?: string;
  cities?: string[];
  themes?: string[];
  theme?: string[] | string;
  subThemes?: string[];
  tags?: string[];
};

type BestPackageOfferResult = {
  offer: any | null;
  offerDiscount: number;
  finalPrice: number;
  isInternational: boolean;
  source: "activated" | "best_match" | "none";
  matchScore: number;
};

function norm(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value?: string) {
  return norm(value).replace(/\s+/g, "");
}

function matchText(source?: string, target?: string) {
  const s = norm(source);
  const t = norm(target);

  if (!s || !t) return false;
  if (s === t) return true;
  if (s.includes(t) || t.includes(s)) return true;

  return compact(s).includes(compact(t)) || compact(t).includes(compact(s));
}

function toArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
}

function anyMatch(sourceList: any[], targetList: any[]) {
  const sources = sourceList.filter(Boolean).map(String);
  const targets = targetList.filter(Boolean).map(String);

  if (!targets.length) return true;
  if (!sources.length) return false;

  return targets.some((target) =>
    sources.some((source) => matchText(source, target))
  );
}

function getPackageIds(pkg: PackageOfferInput) {
  return [pkg.routeId, pkg.id, pkg.slug]
    .filter(Boolean)
    .map((x) => String(x).replace(/^pkg-/, ""));
}

function getCountries(pkg: PackageOfferInput) {
  return [...toArray(pkg.country), ...toArray(pkg.countries)];
}

function getThemes(pkg: PackageOfferInput) {
  return [...toArray(pkg.theme), ...toArray(pkg.themes)];
}

function isIndiaPackage(pkg: PackageOfferInput) {
  const geo = [
    ...getCountries(pkg),
    pkg.continent,
    pkg.route,
    ...(pkg.cities || []),
  ];

  return geo.some((x) => matchText(x, "india"));
}

function passesStrictRule(offer: any, pkg: PackageOfferInput) {
  const packageIds = getPackageIds(pkg);
  const countries = getCountries(pkg);
  const themes = getThemes(pkg);
  const subThemes = toArray(pkg.subThemes);
  const tags = toArray(pkg.tags);
  const cities = toArray(pkg.cities);

  const rulePackageIds = toArray(offer.rule?.packageIds).map((x) =>
    x.replace(/^pkg-/, "")
  );
  const ruleCountries = toArray(offer.rule?.countries);
  const ruleContinents = toArray(offer.rule?.continents);
  const ruleThemes = toArray(offer.rule?.themes);
  const ruleSubThemes = toArray(offer.rule?.subThemes);
  const ruleTags = toArray(offer.rule?.tags);

  if (!anyMatch(packageIds, rulePackageIds)) return false;
  if (!anyMatch([...countries, ...cities], ruleCountries)) return false;
  if (!anyMatch([pkg.continent], ruleContinents)) return false;
  if (!anyMatch(themes, ruleThemes)) return false;
  if (!anyMatch(subThemes, ruleSubThemes)) return false;
  if (!anyMatch(tags, ruleTags)) return false;

  return true;
}

function getMatchScore(offer: any, pkg: PackageOfferInput) {
  if (!offer?.active) return -1;
  if (!(offer.service === "holiday" || offer.service === "all")) return -1;
  if (offer.offerType === "membership") return -1;

  const isInternational = !isIndiaPackage(pkg);

  if (offer.rule?.internationalOnly && !isInternational) return -1;
  if (offer.rule?.domesticOnly && isInternational) return -1;

  if (!passesStrictRule(offer, pkg)) return -1;

  const packageIds = getPackageIds(pkg);
  const countries = getCountries(pkg);
  const themes = getThemes(pkg);
  const subThemes = toArray(pkg.subThemes);
  const tags = toArray(pkg.tags);
  const cities = toArray(pkg.cities);

  let score = 0;

  const rulePackageIds = toArray(offer.rule?.packageIds).map((x) =>
    x.replace(/^pkg-/, "")
  );
  const ruleCountries = toArray(offer.rule?.countries);
  const ruleContinents = toArray(offer.rule?.continents);
  const ruleThemes = toArray(offer.rule?.themes);
  const ruleSubThemes = toArray(offer.rule?.subThemes);
  const ruleTags = toArray(offer.rule?.tags);
  const oldDestinations = toArray(offer.rule?.destinations);

  if (rulePackageIds.length) score += 1000;
  if (ruleTags.length && anyMatch(tags, ruleTags)) score += 500;
  if (ruleSubThemes.length && anyMatch(subThemes, ruleSubThemes)) score += 300;
  if (ruleThemes.length && anyMatch(themes, ruleThemes)) score += 200;
  if (ruleCountries.length && anyMatch([...countries, ...cities], ruleCountries)) score += 120;
  if (ruleContinents.length && anyMatch([pkg.continent], ruleContinents)) score += 60;

  if (oldDestinations.length) {
    oldDestinations.forEach((destination) => {
      if ([...countries, ...cities, pkg.continent].some((x) => matchText(x, destination))) {
        score += 80;
      } else if ([...themes, ...subThemes, ...tags, pkg.title, pkg.route].some((x) => matchText(x, destination))) {
        score += 70;
      }
    });
  }

  const hasAnyRule =
    rulePackageIds.length ||
    ruleCountries.length ||
    ruleContinents.length ||
    ruleThemes.length ||
    ruleSubThemes.length ||
    ruleTags.length ||
    oldDestinations.length;

  if (!hasAnyRule) score += 10;

  return score > 0 ? score : -1;
}

export function getBestPackageSmartOffer(
  pkg: PackageOfferInput,
  price: number
): BestPackageOfferResult {
  const basePrice = Math.round(Number(price || 0));
  const isInternational = !isIndiaPackage(pkg);

  const activeOffer = getSmartActiveOfferItem();
  const activeScore = activeOffer ? getMatchScore(activeOffer, pkg) : -1;

  if (activeOffer && activeScore >= 60) {
    const discount = Math.round(
      calculateSmartOfferDiscount(activeOffer, basePrice)
    );

    if (discount > 0) {
      return {
        offer: activeOffer,
        offerDiscount: discount,
        finalPrice: Math.max(basePrice - discount, 0),
        isInternational,
        source: "activated",
        matchScore: activeScore,
      };
    }
  }

  const best = SMART_OFFERS_DATA.map((offer: any) => {
    const matchScore = getMatchScore(offer, pkg);
    const discount = Math.round(calculateSmartOfferDiscount(offer, basePrice));

    return {
      offer,
      discount,
      matchScore,
      priority: Number(offer?.priority || 0),
    };
  })
    .filter((x) => x.matchScore > 0 && x.discount > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.discount - a.discount;
    })[0];

  if (!best) {
    return {
      offer: null,
      offerDiscount: 0,
      finalPrice: basePrice,
      isInternational,
      source: "none",
      matchScore: 0,
    };
  }

  return {
    offer: best.offer,
    offerDiscount: best.discount,
    finalPrice: Math.max(basePrice - best.discount, 0),
    isInternational,
    source: "best_match",
    matchScore: best.matchScore,
  };
}