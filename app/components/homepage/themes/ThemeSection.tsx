"use client";

import { useState } from "react";
import ThemeTabs from "./ThemeTabs";
import ThemeSlider from "./ThemeSlider";

export default function ThemeSection() {
  const themes = [
    { id: "cultural", name: "Cultural", image: "/themes/icons/cultural.jpg" },
    { id: "spiritual", name: "Spiritual", image: "/themes/icons/spiritual.jpg" },
    { id: "rural", name: "Rural", image: "/themes/icons/rural.jpg" },
    {
      id: "wellness",
      name: "Wellness & Medical",
      image: "/themes/icons/wellness-medical.jpg",
    },
    {
      id: "adventure",
      name: "Adventure & Nature",
      image: "/themes/icons/adventure-nature.jpg",
    },
    {
      id: "wildlife",
      name: "Eco & Wild Life",
      image: "/themes/icons/eco-wildlife.jpg",
    },
    {
      id: "romance",
      name: "Honeymoon & Celebration",
      image: "/themes/icons/honeymoon-celebration.jpg",
    },
    {
      id: "educational",
      name: "Educational",
      image: "/themes/icons/educational.jpg",
    },
    {
      id: "weekend",
      name: "Short & Weekend",
      image: "/themes/icons/short-weekend.jpg",
    },
    {
      id: "media",
      name: "Pre Wedding & Production",
      image: "/themes/icons/prewedding-production.jpg",
    },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/themebg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      {/* TITLE */}
      <h2 className="relative z-10 mb-5 text-center text-2xl font-bold text-gray-900 sm:mb-6 sm:text-4xl">
        Theme Packages
      </h2>

      {/* BUTTONS */}
      <div className="relative z-10">
        <ThemeTabs themes={themes} active={active} setActive={setActive} />
      </div>

      {/* SLIDER */}
      <div className="relative z-10">
        <ThemeSlider themes={themes} />
      </div>
    </section>
  );
}