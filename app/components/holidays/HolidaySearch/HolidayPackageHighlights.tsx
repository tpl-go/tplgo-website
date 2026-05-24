"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

type Highlight = {
  name: string;
  slug: string;
  image: string;
  country: string;
  continent: string;
  state?: string;
};

/* ================= DEFAULT STATIC FALLBACK ================= */

const defaultHighlights: Highlight[] = [
  {
    name: "Goa",
    slug: "goa",
    image: "/holidays/goa.jpeg",
    country: "India",
    continent: "Asia",
    state: "Goa",
  },
  {
    name: "Manali",
    slug: "manali",
    image: "/holidays/manali.jpeg",
    country: "India",
    continent: "Asia",
    state: "Himachal Pradesh",
  },
  {
    name: "Dubai",
    slug: "dubai",
    image: "/holidays/dubai.jpeg",
    country: "Dubai",
    continent: "Asia",
  },
  {
    name: "Bali",
    slug: "bali",
    image: "/holidays/bali.jpeg",
    country: "Indonesia",
    continent: "Asia",
  },
  {
    name: "Singapore",
    slug: "singapore",
    image: "/holidays/singapore.jpeg",
    country: "Singapore",
    continent: "Asia",
  },
  {
    name: "Thailand",
    slug: "thailand",
    image: "/holidays/thailand.jpeg",
    country: "Thailand",
    continent: "Asia",
  },
  {
    name: "Japan",
    slug: "japan",
    image: "/holidays/japan.jpeg",
    country: "Japan",
    continent: "Asia",
  },
  {
    name: "Sri Lanka",
    slug: "sri-lanka",
    image: "/holidays/srilanka.jpeg",
    country: "Sri Lanka",
    continent: "Asia",
  },
  {
    name: "Switzerland",
    slug: "switzerland",
    image: "/holidays/switzerland.jpeg",
    country: "Switzerland",
    continent: "Europe",
  },
  {
    name: "Paris",
    slug: "paris",
    image: "/holidays/paris.jpeg",
    country: "France",
    continent: "Europe",
  },
];

function normalizeValue(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

function getContinentSlug(continent?: string) {
  const key = normalizeValue(continent);

  const map: Record<string, string> = {
    asia: "asia",
    europe: "europe",
    northamerica: "northamerica",
    southamerica: "southamerica",
    africa: "africa",
    oceania: "oceania",
    antarctica: "antarctica",
  };

  return map[key] || "asia";
}

function buildDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export default function HolidayPackageHighlights() {
  const router = useRouter();

  const [highlights, setHighlights] = useState<Highlight[]>(defaultHighlights);
  const [apiLoaded, setApiLoaded] = useState(false);

  /* ================= FETCH API ================= */

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch("/api/holidays/highlights");
        if (!res.ok) return;

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setHighlights(data);
        }

        setApiLoaded(true);
      } catch (err) {
        console.log("API not ready, using fallback");
        setApiLoaded(true);
      }
    }

    fetchHighlights();
  }, []);

  const handleDestinationClick = (item: Highlight) => {
    const params = new URLSearchParams();

    params.set("origin", "Jaipur");
    params.set("toCity", item.name);
    params.set("date", buildDefaultDate());
    params.set("adults", "2");
    params.set("children", "0");
    params.set("rooms", "1");
    params.set("searchMode", "destination");

    const country = normalizeValue(item.country);

    if (country === "india") {
      params.set("destinationKind", "india");
      params.set("matchedState", item.state || item.name);
      router.push(`/popular/india?${params.toString()}`);
      return;
    }

    params.set("destinationKind", "international");
    params.set("matchedCountry", item.country);

    const continentSlug = getContinentSlug(item.continent);
    router.push(`/continent/${continentSlug}?${params.toString()}`);
  };

  return (
    <div className="mt-4 w-full rounded-2xl bg-white p-4 shadow-xl sm:p-6 md:flex md:items-start md:gap-6">
      {/* ================= MOBILE IMAGE CARDS ================= */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:hidden">
        {highlights.slice(0, 2).map((item, i) => (
          <button
            type="button"
            key={i}
            onClick={() => handleDestinationClick(item)}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm"
          >
            <img
              src={item.image}
              className="h-[96px] w-full object-cover transition group-hover:scale-105"
              alt={item.name}
            />

            <div className="px-3 py-2">
              <p className="text-sm font-extrabold text-slate-900">
                {item.name}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                {item.country}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ================= LEFT DEST GRID ================= */}
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-2 md:w-[60%] md:grid-cols-3 md:gap-x-6 md:gap-y-3">
        {highlights.map((d, i) => (
          <div
            key={i}
            onClick={() => handleDestinationClick(d)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-black transition hover:bg-orange-50 md:rounded-md md:border-0 md:bg-transparent md:px-2 md:py-1"
          >
            <MapPin size={14} className="shrink-0 text-orange-500" />
            <span className="truncate font-semibold md:font-normal">
              {d.name}
            </span>
          </div>
        ))}
      </div>

      {/* ================= RIGHT IMAGES ================= */}
      <div className="hidden w-[40%] items-center justify-center gap-3 md:flex">
        {highlights.slice(0, 2).map((item, i) => (
          <div
            key={i}
            onClick={() => handleDestinationClick(item)}
            className="group cursor-pointer text-center"
          >
            <img
              src={item.image}
              className="h-[110px] w-[200px] rounded-lg object-cover transition group-hover:scale-105"
              alt={item.name}
            />

            <p className="mt-1 text-xs font-medium text-black">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}