"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ThemeBanner from "../../components/theme/ThemeBanner";
import SubThemeTabs from "../../components/theme/SubThemeTabs";
import ThemeFilters from "../../components/theme/ThemeFilters";
import ThemePackagesGrid from "../../components/theme/ThemePackagesGrid";
import ThemeTabs from "../../components/homepage/themes/ThemeTabs";

interface PageProps {
  params: Promise<{
    themeSlug?: string;
  }>;
}

type ThemeItem = {
  id: string;
  name: string;
  key: string;
  aliases: string[];
};

function normalizeSlug(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ThemePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const themeSlug = normalizeSlug(
    decodeURIComponent(resolvedParams?.themeSlug ?? "")
  );

  const themes: ThemeItem[] = [
    {
      id: "culture",
      name: "Culture",
      key: "CULTURAL TOURISM",
      aliases: ["culture", "cultural"],
    },
    {
      id: "spiritual",
      name: "Spiritual",
      key: "SPIRITUAL TOURISM",
      aliases: [
        "spiritual",
        "spiritual-packages",
        "spiritual-tourism",
        "religious",
      ],
    },
    {
      id: "rural",
      name: "Rural",
      key: "RURAL TOURISM",
      aliases: ["rural", "rural-tourism"],
    },
    {
      id: "wellness",
      name: "Wellness & Medical",
      key: "WELLNESS TOURISM",
      aliases: [
        "wellness",
        "wellness-medical",
        "wellness-and-medical",
        "medical",
        "wellness-medical-tourism",
      ],
    },
    {
      id: "adventure",
      name: "Adventure & Nature",
      key: "ADVENTURE TOURISM",
      aliases: [
        "adventure",
        "adventure-nature",
        "adventure-and-nature",
        "adventure-and-wildlife",
        "nature",
      ],
    },
    {
      id: "wildlife",
      name: "Eco & Wildlife",
      key: "WILDLIFE TOURISM",
      aliases: [
        "wildlife",
        "wildlife-eco",
        "eco-and-wild-life",
        "eco-wildlife",
        "wild-life",
      ],
    },
    {
      id: "romance",
      name: "Honeymoon & Celebration",
      key: "HONEYMOON TOURISM",
      aliases: [
        "romance",
        "romance-celebration",
        "honeymoon-and-celebrations",
        "honeymoon-and-celebration",
        "honeymoon",
      ],
    },
    {
      id: "educational",
      name: "Educational",
      key: "EDUCATIONAL TOURISM",
      aliases: [
        "educational",
        "educational-special-interest",
        "special-interest",
      ],
    },
    {
      id: "weekend",
      name: "Short & Weekend",
      key: "SHORT WEEKEND TOURISM",
      aliases: [
        "weekend",
        "short-weekend",
        "short-and-weekend",
        "weekend-tour",
      ],
    },
    {
      id: "media",
      name: "Pre Wedding & production",
      key: "MEDIA PRODUCTION TOURISM",
      aliases: [
        "media",
        "media-production",
        "pre-wedding-and-production",
        "prewedding",
      ],
    },
  ];

  const activeThemeId = useMemo(() => {
    const matched =
      themes.find((t) => normalizeSlug(t.id) === themeSlug) ||
      themes.find((t) =>
        t.aliases.some((alias) => normalizeSlug(alias) === themeSlug)
      );

    return matched?.id || "culture";
  }, [themeSlug]);

  const activeTheme = themes.find((t) => t.id === activeThemeId)!;

  const themeSubThemes: Record<string, string[]> = {
    "CULTURAL TOURISM": [
      "Heritage & Historical Monuments",
      "Forts, Palaces & Royal Trails",
      "UNESCO World Heritage Sites",
      "Architecture & Old Cities",
      "Festivals, Fairs & Traditions",
      "Handicrafts & Local Art",
      "Cultural Performances & Events",
    ],
    "SPIRITUAL TOURISM": [
      "Pilgrimage Tours",
      "Temple Circuits",
      "Jyotirlinga Circuits",
      "Char Dham & Sacred Routes",
      "Buddhist & Jain Circuits",
      "Sikh & Sufi Circuits",
      "Spiritual Retreats",
    ],
    "RURAL TOURISM": [
      "Village Stay Experiences",
      "Farm Stay & Agri Tourism",
      "Tribal Tourism",
      "Local Occupation Experiences",
      "Rural Crafts & Skills",
      "Rural Food & Lifestyle",
    ],
    "WELLNESS TOURISM": [
      "Ayurveda Retreats",
      "Yoga & Meditation",
      "Nature Healing Retreats",
      "Detox & Rejuvenation Programs",
      "Medical Check-up Tours",
      "Surgery & Treatment Packages",
    ],
    "ADVENTURE TOURISM": [
      "Himalayan Adventure",
      "Trekking & Hiking",
      "Mountaineering",
      "Desert Safari",
      "Forest & Nature Trails",
      "River Rafting",
      "Paragliding & Sky Sports",
      "Scuba & Water Sports",
      "Cycling & Road Trips",
    ],
    "WILDLIFE TOURISM": [
      "National Parks & Sanctuaries",
      "Jungle Safari",
      "Bird Watching",
      "Eco Villages",
      "Sustainable Travel Programs",
    ],
    "HONEYMOON TOURISM": [
      "Honeymoon Packages",
      "Romantic Getaways",
      "Island Honeymoon",
      "Destination Weddings",
      "Anniversary & Celebration Tours",
    ],
    "EDUCATIONAL TOURISM": [
      "School & College Tours",
      "Study Tours",
      "Industrial Visits",
      "Photography Tours",
      "Culinary Learning Tours",
      "Art & Craft Workshops",
      "Science & Space Tourism",
    ],
    "SHORT WEEKEND TOURISM": [
      "Short Break Holidays",
      "City Break Tours",
      "Weekend Getaways",
    ],
    "MEDIA PRODUCTION TOURISM": [
      "Film Shooting Locations",
      "OTT & Web Series Shoots",
      "Ad & Commercial Shoots",
      "Music Video Shoots",
      "Pre-Wedding & Fashion Shoots",
    ],
  };

  const subThemes = useMemo(() => {
    return themeSubThemes[activeTheme.key] || [];
  }, [activeTheme.key]);

  const subParamKey = searchParams.toString();

  const [activeSubTheme, setActiveSubTheme] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [resetFilters, setResetFilters] = useState(false);

  const handleClearAll = () => {
    setSelectedFilters([]);
    setActiveSubTheme("");
    setResetFilters((prev) => !prev);
  };

  const handleThemeSwitch = (id: string) => {
    router.push(`/themes/${id}`);
  };

  useEffect(() => {
    const subFromSlug = searchParams.get("sub");
    const subFromName = searchParams.get("subTheme");

    const matchedSubTheme =
      subThemes.find(
        (item) => normalizeSlug(item) === normalizeSlug(subFromSlug || "")
      ) ||
      subThemes.find(
        (item) => normalizeSlug(item) === normalizeSlug(subFromName || "")
      ) ||
      "";

    setActiveSubTheme((prev) =>
      prev === matchedSubTheme ? prev : matchedSubTheme
    );

    setSelectedFilters((prev) => (prev.length === 0 ? prev : []));
    setResetFilters((prev) => !prev);
  }, [activeThemeId, subParamKey, subThemes]);

  return (
    <main className="relative">
      <ThemeBanner themeId={activeThemeId} themeName={activeTheme.name} />

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm px-4 pt-4 pb-6">
          <ThemeTabs
            themes={themes.map((t) => ({ id: t.id, name: t.name }))}
            active={activeThemeId}
            setActive={handleThemeSwitch}
          />

          <div className="-mt-10">
            <SubThemeTabs
              themeName={activeTheme.name}
              subThemes={subThemes}
              activeSubTheme={activeSubTheme}
              setActiveSubTheme={setActiveSubTheme}
            />
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-16 mt-4">
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 sticky top-32 h-fit">
              <ThemeFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                continents={[
                  "Asia",
                  "Europe",
                  "North America",
                  "South America",
                  "Africa",
                  "Australia & New Zealand",
                  "Antarctica",
                ]}
                activeContinent=""
                setActiveContinent={() => {}}
                activeSubTheme={activeSubTheme}
                setActiveSubTheme={setActiveSubTheme}
                activeThemeId={activeThemeId}
                subThemes={subThemes}
                resetFilters={resetFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <ThemePackagesGrid
                theme={activeTheme.key}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                activeSubTheme={activeSubTheme}
                setActiveSubTheme={setActiveSubTheme}
                resetFilters={resetFilters}
                setResetFilters={setResetFilters}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}