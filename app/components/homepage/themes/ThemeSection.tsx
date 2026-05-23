"use client";

import { useState } from "react";
import ThemeTabs from "./ThemeTabs";
import ThemeSlider from "./ThemeSlider";

export default function ThemeSection() {

  const themes = [
    { id: "cultural", name: "Cultural", image: "/themes/icons/cultural.jpg" },
    { id: "spiritual", name: "Spiritual", image: "/themes/icons/spiritual.jpg" },
    { id: "rural", name: "Rural", image: "/themes/icons/rural.jpg" },
    { id: "wellness", name: "Wellness & Medical", image: "/themes/icons/wellness-medical.jpg" },
    { id: "adventure", name: "Adventure & Nature", image: "/themes/icons/adventure-nature.jpg" },
    { id: "wildlife", name: "Eco & Wild Life", image: "/themes/icons/eco-wildlife.jpg" },
    { id: "romance", name: "Honeymoon & Celebration", image: "/themes/icons/honeymoon-celebration.jpg" },
    { id: "educational", name: "Educational", image: "/themes/icons/educational.jpg" },
    { id: "weekend", name: "Short & Weekend", image: "/themes/icons/short-weekend.jpg" },
    { id: "media", name: "Pre Wedding & Production", image: "/themes/icons/prewedding-production.jpg" },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/themebg.jpg')" }}
    >

      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      {/* TITLE */}
      <h2 className="text-center text-4xl font-bold text-gray-900 mb-6">
        Theme Packages
      </h2>

      {/* BUTTONS */}
      <ThemeTabs
        themes={themes}
        active={active}
        setActive={setActive}
      />

      {/* SLIDER */}
      <ThemeSlider themes={themes} />

    </section>
  );
}