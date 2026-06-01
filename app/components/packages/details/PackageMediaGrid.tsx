"use client";

import React, { useMemo, useState } from "react";
import PackageMapModal from "./PackageMapModal";
import dynamic from "next/dynamic";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getSmartPackageImage } from "@/app/lib/images/smartPackageImageResolver";

const MiniRouteMap = dynamic(() => import("./MiniRouteMap"), {
  ssr: false,
});

type Place = {
  name: string;
  lat: number;
  lng: number;
  day?: string;
};

type Media = {
  coverImage?: string;
  videoUrl?: string;
  packageHighlights?: string[];
  activitiesLabel?: string;
  propertyLabel?: string;
  gallerySlug?: string;
  routeMap?: Place[];
};

type SelectedHotel = {
  hotelName?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

type SelectedActivity = {
  title?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

type SelectedTransfer = {
  title?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

type Props = {
  packageId: string;
  media: Media;
  packageTitle?: string;
  destinationCity?: string;
  travelDate?: string;
  originCity?: string;
  variant?: "withFlight" | "withoutFlight";
  route?: string[];
  selectedHotel?: SelectedHotel | null;
  selectedActivity?: SelectedActivity | null;
  selectedTransfer?: SelectedTransfer | null;
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  lucknow: { lat: 26.8467, lng: 80.9462 },

  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  munnar: { lat: 10.0889, lng: 77.0595 },
  thekkady: { lat: 9.6031, lng: 77.1615 },
  alleppey: { lat: 9.4981, lng: 76.3388 },
  alappuzha: { lat: 9.4981, lng: 76.3388 },

  srinagar: { lat: 34.0837, lng: 74.7973 },
  gulmarg: { lat: 34.0484, lng: 74.3805 },
  pahalgam: { lat: 34.0159, lng: 75.3180 },
  sonmarg: { lat: 34.2999, lng: 75.2931 },

  manali: { lat: 32.2396, lng: 77.1887 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  goa: { lat: 15.2993, lng: 74.1240 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  jaisalmer: { lat: 26.9157, lng: 70.9083 },
  leh: { lat: 34.1526, lng: 77.5771 },
};

function normalizeCityName(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");
}

function getCoordsForCity(city?: string | null) {
  const normalized = normalizeCityName(city);
  if (!normalized) return null;

  if (CITY_COORDS[normalized]) {
    return CITY_COORDS[normalized];
  }

  const matchedKey = Object.keys(CITY_COORDS).find(
    (key) => normalized.includes(key) || key.includes(normalized)
  );

  if (matchedKey) {
    return CITY_COORDS[matchedKey];
  }

  return null;
}

function buildPlacesFromRoute(route: string[] = []) {
  return route
    .map((city, index) => {
      const coords = getCoordsForCity(city);
      if (!coords) return null;

      return {
        name: city,
        lat: coords.lat,
        lng: coords.lng,
        day: `Day ${index + 1}`,
      };
    })
    .filter(Boolean) as Place[];
}

function buildRoutePlaces(params: {
  route?: string[];
  mediaRouteMap?: Place[];
  destinationCity?: string;
  originCity?: string;
}) {
  const { route, mediaRouteMap, destinationCity, originCity } = params;

  // 1. Primary source: package route
  const routePlaces = buildPlacesFromRoute(route || []);
  if (routePlaces.length > 0) return routePlaces;

  // 2. Backup: media.routeMap
  if (Array.isArray(mediaRouteMap) && mediaRouteMap.length > 0) {
    return mediaRouteMap;
  }

  // 3. Fallback: origin -> destination
  const originCoords = getCoordsForCity(originCity);
  const destinationCoords = getCoordsForCity(destinationCity);

  if (originCoords && destinationCoords) {
    return [
      {
        name: originCity || "Origin",
        lat: originCoords.lat,
        lng: originCoords.lng,
        day: "Start",
      },
      {
        name: destinationCity || "Destination",
        lat: destinationCoords.lat,
        lng: destinationCoords.lng,
        day: "Arrival",
      },
    ];
  }

  // 4. Final fallback: destination only
  if (destinationCoords) {
    return [
      {
        name: destinationCity || "Destination",
        lat: destinationCoords.lat,
        lng: destinationCoords.lng,
        day: "Stay",
      },
    ];
  }

  return [];
}

export default function PackageMediaGrid({
  packageId,
  media,
  packageTitle,
  destinationCity,
  travelDate,
  originCity,
  variant,
  route = [],
  selectedHotel,
  selectedActivity,
  selectedTransfer,
}: Props) {
  const [mapOpen, setMapOpen] = useState(false);

  const smartCoverImage = getSmartPackageImage({
    routeId: packageId,
    title: packageTitle,
    coverImage: media?.coverImage,
    route: Array.isArray(route) ? route.join(" ") : "",
    cities: route,
  });
  const videoUrl = media?.videoUrl || "";
  const packageHighlights = media?.packageHighlights || [];
  const activitiesLabel = media?.activitiesLabel || "Activities";
  const propertyLabel =
    selectedHotel?.hotelName || media?.propertyLabel || "Property";

  const places: Place[] = useMemo(() => {
    return buildRoutePlaces({
      route,
      mediaRouteMap: media?.routeMap,
      destinationCity,
      originCity,
    });
  }, [route, media?.routeMap, destinationCity, originCity, packageTitle, travelDate, variant]);

  const mapTitle = useMemo(() => {
    if (route.length > 1) return "Package Route Map";
    if (destinationCity) return `${destinationCity} Route Map`;
    return "Route Map";
  }, [route, destinationCity]);

  const goGallery = (tab?: string) => {
    const q = tab ? `?tab=${tab}` : "";
    window.location.href = `/packages/${packageId}/gallery${q}`;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) return url;

    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

    const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
    if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;

    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="mt-1 overflow-hidden">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div
          className="col-span-1 lg:col-span-3 rounded-2xl overflow-hidden border bg-gray-100 cursor-pointer relative h-[180px] sm:h-[220px] lg:h-[200px]"
          onClick={() => goGallery("gallery")}
        >
          <TPLDynamicImage
            src={smartCoverImage.src}
            imageQuery={smartCoverImage.imageQuery}
            fallbackSrc={smartCoverImage.fallbackSrc}
            fallbackQuery={smartCoverImage.fallbackQuery}
            alt={smartCoverImage.alt || "Package cover"}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover"
            sizes="(max-width: 1024px) 100vw, 25vw"
            priority
            preferDynamic={smartCoverImage.preferDynamic}
          />
          <div className="absolute left-3 bottom-3">
            <button className="bg-black/70 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-black/80 transition">
              VIEW GALLERY →
            </button>
          </div>
        </div>

        <div
          className="col-span-1 lg:col-span-3 rounded-2xl overflow-hidden border bg-black cursor-pointer h-[180px] sm:h-[220px] lg:h-[200px]"
          onClick={() => goGallery("video")}
        >
          {embedUrl ? (
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title="Package Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xs">
              Video placeholder
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 rounded-2xl border bg-white p-3 min-h-[150px] overflow-hidden lg:h-[200px]">
          <div className="text-xs font-bold text-gray-800 tracking-wide">
            PACKAGE HIGHLIGHTS
          </div>

          <div className="mt-2 space-y-1.5">
            {(packageHighlights.length
              ? packageHighlights
              : ["Highlights will appear here."]
            )
              .slice(0, 4)
              .map((h) => (
                <div key={h} className="flex gap-2 text-xs text-gray-800">
                  <span className="mt-[1px] text-green-600">✔</span>
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
          </div>

          <button
            onClick={() => goGallery("highlights")}
            className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        <div
          className="col-span-1 lg:col-span-2 rounded-2xl border bg-white p-3 min-h-[175px] cursor-pointer hover:shadow-sm transition lg:h-[200px]"
          onClick={() => setMapOpen(true)}
        >
          <div className="mb-2 text-[11px] font-bold text-gray-800 tracking-wide">
            {mapTitle}
          </div>

          <div className="rounded-xl overflow-hidden h-[135px] relative z-0 lg:h-[150px]">
            <MiniRouteMap places={places} />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-3 lg:h-[200px] lg:grid-cols-1 lg:grid-rows-2">
          <div
            className="min-h-[86px] rounded-2xl border bg-gray-900 text-white flex items-center px-4 cursor-pointer relative overflow-hidden lg:min-h-0"
            onClick={() => goGallery("activities")}
          >
            <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-black/10 to-black/70" />
            <div className="relative text-sm font-semibold">
              {activitiesLabel}
            </div>
          </div>

          <div
            className="min-h-[86px] rounded-2xl border bg-gray-800 text-white flex items-center px-4 cursor-pointer relative overflow-hidden lg:min-h-0"
            onClick={() => goGallery("property")}
          >
            <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-black/10 to-black/70" />
            <div className="relative text-sm font-semibold">{propertyLabel}</div>
          </div>
        </div>
      </div>

      <PackageMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={mapTitle}
        places={places}
      />
    </div>
  );
}
