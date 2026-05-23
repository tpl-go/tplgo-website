import { getBestPackageSmartOffer } from "@/app/lib/smartOffers/getBestPackageSmartOffer";

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
  theme?: string[] | string;
  themes?: string[];
  subThemes?: string[];
  tags?: string[];
};

type OfferPreviewResult = {
  label: string;
  code: string;
  discount: number;
  finalPrice: number;
  offer: any | null;
};

function buildOfferLabel(offer: any, discount: number) {
  if (!offer) return "";

  if (offer.discountMode === "percent") {
    return `${offer.discountValue}% OFF`;
  }

  return `Save ₹${Math.round(discount).toLocaleString("en-IN")}`;
}

export function getPackageOfferPreview(
  pkg: PackageOfferInput,
  price: number
): OfferPreviewResult | null {
  const result = getBestPackageSmartOffer(pkg, price);

  if (!result?.offer || Number(result.offerDiscount || 0) <= 0) {
    return null;
  }

  return {
    label: buildOfferLabel(result.offer, result.offerDiscount),
    code: result.offer?.couponCode || result.offer?.slug || "",
    discount: Math.round(Number(result.offerDiscount || 0)),
    finalPrice: Math.round(Number(result.finalPrice || price || 0)),
    offer: result.offer,
  };
}