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
    <div className="w-full mt-4 bg-white rounded-2xl shadow-xl p-6 flex gap-6 items-start">
      {/* ================= LEFT DEST GRID ================= */}
      <div className="grid grid-cols-3 gap-y-3 gap-x-6 w-[60%]">
        {highlights.map((d, i) => (
          <div
            key={i}
            onClick={() => handleDestinationClick(d)}
            className="flex items-center gap-2 text-sm text-black
            cursor-pointer hover:bg-orange-50 px-2 py-1
            rounded-md transition"
          >
            <MapPin size={14} className="text-orange-500" />
            <span>{d.name}</span>
          </div>
        ))}
      </div>

      {/* ================= RIGHT IMAGES ================= */}
      <div className="w-[40%] flex items-center justify-center gap-3">
        {highlights.slice(0, 2).map((item, i) => (
          <div
            key={i}
            onClick={() => handleDestinationClick(item)}
            className="cursor-pointer group text-center"
          >
            <img
              src={item.image}
              className="w-[200px] h-[110px]
              rounded-lg object-cover
              group-hover:scale-105 transition"
              alt={item.name}
            />

            <p className="text-xs mt-1 text-black font-medium">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}