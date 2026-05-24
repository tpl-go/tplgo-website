"use client";

import { useState } from "react";
import ContinentTabs from "./ContinentTabs";
import ContinentSlider from "./ContinentSlider";

export default function ContinentsSection() {
  const continents = [
    { id: "asia", name: "Asia", image: "/continents/icons/asia.jpg" },
    { id: "europe", name: "Europe", image: "/continents/icons/europe.jpg" },
    {
      id: "northamerica",
      name: "North America",
      image: "/continents/icons/north-america.jpg",
    },
    {
      id: "southamerica",
      name: "South America",
      image: "/continents/icons/south-america.jpg",
    },
    { id: "africa", name: "Africa", image: "/continents/icons/africa.jpg" },
    {
      id: "oceania",
      name: "Australia & New Zealand",
      image: "/continents/icons/oceania.jpg",
    },
    {
      id: "antarctica",
      name: "Antarctica",
      image: "/continents/icons/antarctica.jpg",
    },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/continentbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      {/* TITLE */}
      <h2 className="relative z-10 mb-5 text-center text-2xl font-bold text-gray-900 sm:mb-6 sm:text-4xl">
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