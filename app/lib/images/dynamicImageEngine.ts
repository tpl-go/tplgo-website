import { stableTravelImageMap } from "@/app/lib/images/imageQueryMaps";

export type DynamicImageInput = {
  imageUrl?: string | null;
  imageQuery?: string | null;
  fallbackImage?: string | null;
  imageAlt?: string | null;
  preferDynamic?: boolean;
};

export type ResolvedDynamicImage = {
  src: string;
  alt: string;
  source: "imageUrl" | "imageQuery" | "fallbackImage" | "tplFallback";
};

export const TPL_FINAL_FALLBACK_IMAGE = "/logo.png";

const IMAGE_QUERY_PROVIDER_BASE = "https://source.unsplash.com/featured/1200x900";

const STABLE_UNSPLASH_IMAGE_MAP: Record<string, string> = {
  "india travel destination":
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "bali travel destination":
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  "thailand travel destination":
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
  "dubai travel destination":
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  "london travel destination":
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
  "paris travel destination":
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  "new york travel destination":
    "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
  "brazil travel destination":
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
  "egypt travel destination":
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
  "maldives travel destination":
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  "goa travel destination":
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "manali travel destination":
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
  "jaipur travel destination":
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
  "asia holiday packages":
    "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
  "europe holiday packages":
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  "north america holiday packages":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "south america holiday packages":
    "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80",
  "africa holiday packages":
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  "australia new zealand holiday packages":
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
  "antarctica travel expedition":
    "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=1200&q=80",
  "cultural travel experiences":
    "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80",
  "spiritual travel experiences":
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
  "rural travel experiences":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "wellness medical travel experiences":
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "adventure nature travel experiences":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "eco wildlife travel experiences":
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "honeymoon celebration travel experiences":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "educational travel experiences":
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "short weekend travel experiences":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "pre wedding production travel experiences":
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "adventure travel mountains trekking india":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "luxury beach vacation tropical india":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "honeymoon romantic resort couple travel":
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
  "wildlife safari jungle india":
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "spiritual temple india meditation":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "luxury resort infinity pool travel":
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  "road trip scenic highway mountains india":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  "family vacation resort india":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "india local culture heritage market":
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "indian food street market travel":
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1200&q=80",
  "nature eco retreat mountains india":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "rural india village travel culture":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "wellness yoga spa retreat india":
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "educational student travel heritage india":
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "weekend getaway mountains resort india":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "pre wedding photography destination india":
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "adventure travel rafting trekking india":
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
  "luxury resort vacation india":
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  "cruise vacation ocean luxury":
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80",
  "corporate business travel conference india":
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "europe luxury travel scenic city":
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  "asia travel culture mountains beach":
    "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
  "dubai luxury skyline desert":
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  "north america scenic city nature travel":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "south america mountains rainforest travel":
    "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80",
  "africa safari luxury travel":
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  "australia new zealand scenic travel":
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
  "antarctica expedition ice travel":
    "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=1200&q=80",
  "rajasthan palace desert india":
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
  "kerala backwaters luxury":
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
  "kashmir valley snow mountains":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "kashmir honeymoon luxury mountains":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "goa beach resort india":
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "ladakh mountain road trip india":
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
  "himachal mountains manali india":
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
  "uttarakhand himalaya temple river india":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "sikkim mountains monastery india":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "meghalaya waterfalls mountains india":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "andaman island beach india":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "tamil nadu temple heritage india":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "karnataka hampi heritage india":
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "gujarat kutch desert heritage india":
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
  "maharashtra mumbai travel india":
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=80",
  "assam kaziranga tea garden india":
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "darjeeling hills tea garden india":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "odisha temple beach india":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "bodh gaya buddhist temple india":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "varanasi ghat temple india":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "char dham yatra himalaya temple":
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  "ladakh group road trip bikes":
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
  "northeast india mountains lake":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "india heritage group tour palace":
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
  "group trekking himalaya mountains india":
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
  "family vacation group tour india":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "group tour bus travel india":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  "weekend group getaway india":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  ...stableTravelImageMap,
};

function normalizeImageQuery(query?: string | null) {
  return String(query || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function encodeImageQuery(query?: string | null) {
  return encodeURIComponent(String(query || "").trim().replace(/\s+/g, " "));
}

function buildProtectedQuery(query?: string | null) {
  const cleanQuery = String(query || "").trim().replace(/\s+/g, " ");

  if (!cleanQuery) return "";

  const normalized = cleanQuery.toLowerCase();
  const negativeTerms = ["-car", "-van", "-bus", "-logo"];

  if (!normalized.includes("agra") && !normalized.includes("taj mahal")) {
    negativeTerms.push("-taj mahal");
  }

  return `${cleanQuery} ${negativeTerms.join(" ")}`;
}

export function buildImageProviderUrl(query?: string | null) {
  const mappedImage = STABLE_UNSPLASH_IMAGE_MAP[normalizeImageQuery(query)];

  if (mappedImage) return mappedImage;

  const encodedQuery = encodeImageQuery(buildProtectedQuery(query));

  if (!encodedQuery) return "";

  return `${IMAGE_QUERY_PROVIDER_BASE}?${encodedQuery}`;
}

export function resolveDynamicImage({
  imageUrl,
  imageQuery,
  fallbackImage,
  imageAlt,
  preferDynamic = false,
}: DynamicImageInput): ResolvedDynamicImage {
  const cleanImageUrl = String(imageUrl || "").trim();
  const cleanFallback = String(fallbackImage || "").trim();
  const cleanAlt = String(imageAlt || "").trim() || "TPL image";
  const providerUrl = buildImageProviderUrl(imageQuery);

  if (preferDynamic && providerUrl) {
    return {
      src: providerUrl,
      alt: cleanAlt,
      source: "imageQuery",
    };
  }

  if (cleanImageUrl) {
    return {
      src: cleanImageUrl,
      alt: cleanAlt,
      source: "imageUrl",
    };
  }

  if (providerUrl) {
    return {
      src: providerUrl,
      alt: cleanAlt,
      source: "imageQuery",
    };
  }

  if (cleanFallback) {
    return {
      src: cleanFallback,
      alt: cleanAlt,
      source: "fallbackImage",
    };
  }

  return {
    src: TPL_FINAL_FALLBACK_IMAGE,
    alt: cleanAlt,
    source: "tplFallback",
  };
}

export function isLocalImageSource(src: string) {
  return src.startsWith("/");
}
