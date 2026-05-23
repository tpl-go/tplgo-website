"use client";

import { useState } from "react";
import ContinentTabs from "./ContinentTabs";
import ContinentSlider from "./ContinentSlider";

export default function ContinentsSection() {

  const continents = [
    { id: "asia", name: "Asia", image: "/continents/icons/asia.jpg" },
    { id: "europe", name: "Europe", image: "/continents/icons/europe.jpg" },
    { id: "northamerica", name: "North America", image: "/continents/icons/north-america.jpg" },
    { id: "southamerica", name: "South America", image: "/continents/icons/south-america.jpg" },
    { id: "africa", name: "Africa", image: "/continents/icons/africa.jpg" },
    { id: "oceania", name: "Australia & New Zealand", image: "/continents/icons/oceania.jpg" },
    { id: "antarctica", name: "Antarctica", image: "/continents/icons/antarctica.jpg" },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/continentbg.jpg')" }}
    >

      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      {/* TITLE */}
      <h2 className="text-center text-4xl font-bold text-gray-900 mb-6">
        Continental Packages
      </h2>

      {/* BUTTONS */}
      <ContinentTabs
        continents={continents}
        active={active}
        setActive={setActive}
      />

      {/* SLIDER */}
      <ContinentSlider continents={continents} />

    </section>
  );
}