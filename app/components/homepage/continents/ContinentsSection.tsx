"use client";

import { useState } from "react";
import ContinentTabs from "./ContinentTabs";
import ContinentSlider from "./ContinentSlider";

export default function ContinentsSection() {
  const continents = [
    {
      id: "asia",
      name: "Asia",
      image: "/continents/icons/asia.jpg",
      imageUrl: "/continents/icons/asia.jpg",
      imageQuery: "Asia holiday packages",
      fallbackImage: "/continents/icons/asia.jpg",
      imageAlt: "Asia holiday packages",
    },
    {
      id: "europe",
      name: "Europe",
      image: "/continents/icons/europe.jpg",
      imageUrl: "/continents/icons/europe.jpg",
      imageQuery: "Europe holiday packages",
      fallbackImage: "/continents/icons/europe.jpg",
      imageAlt: "Europe holiday packages",
    },
    {
      id: "northamerica",
      name: "North America",
      image: "/continents/icons/north-america.jpg",
      imageUrl: "/continents/icons/north-america.jpg",
      imageQuery: "North America holiday packages",
      fallbackImage: "/continents/icons/north-america.jpg",
      imageAlt: "North America holiday packages",
    },
    {
      id: "southamerica",
      name: "South America",
      image: "/continents/icons/south-america.jpg",
      imageUrl: "/continents/icons/south-america.jpg",
      imageQuery: "South America holiday packages",
      fallbackImage: "/continents/icons/south-america.jpg",
      imageAlt: "South America holiday packages",
    },
    {
      id: "africa",
      name: "Africa",
      image: "/continents/icons/africa.jpg",
      imageUrl: "/continents/icons/africa.jpg",
      imageQuery: "Africa holiday packages",
      fallbackImage: "/continents/icons/africa.jpg",
      imageAlt: "Africa holiday packages",
    },
    {
      id: "oceania",
      name: "Australia & New Zealand",
      image: "/continents/icons/oceania.jpg",
      imageUrl: "/continents/icons/oceania.jpg",
      imageQuery: "Australia New Zealand holiday packages",
      fallbackImage: "/continents/icons/oceania.jpg",
      imageAlt: "Australia and New Zealand holiday packages",
    },
    {
      id: "antarctica",
      name: "Antarctica",
      image: "/continents/icons/antarctica.jpg",
      imageUrl: "/continents/icons/antarctica.jpg",
      imageQuery: "Antarctica travel expedition",
      fallbackImage: "/continents/icons/antarctica.jpg",
      imageAlt: "Antarctica travel expedition",
    },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative mt-2 w-full overflow-hidden rounded-[22px] bg-cover bg-center px-3 py-4 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/continentbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      {/* TITLE */}
      <h2 className="relative z-10 mb-4 text-center text-[22px] font-black leading-7 text-gray-900 sm:mb-6 sm:text-4xl">
        Continental Packages
      </h2>

      {/* BUTTONS */}
      <div className="relative z-10">
        <ContinentTabs
          continents={continents}
          active={active}
          setActive={setActive}
        />
      </div>

      {/* SLIDER */}
      <div className="relative z-10">
        <ContinentSlider continents={continents} />
      </div>
    </section>
  );
}
