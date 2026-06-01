"use client";

import { useState } from "react";
import ThemeTabs from "./ThemeTabs";
import ThemeSlider from "./ThemeSlider";
import { getThemeImageQuery } from "@/app/lib/images/themeImageQueries";

export default function ThemeSection() {
  const themes = [
    {
      id: "cultural",
      name: "Cultural",
      image: "/themes/icons/cultural.jpg",
      imageUrl: "/themes/icons/cultural.jpg",
      imageQuery: getThemeImageQuery("cultural", "Cultural"),
      fallbackImage: "/themes/icons/cultural.jpg",
      imageAlt: "Cultural travel packages",
    },
    {
      id: "spiritual",
      name: "Spiritual",
      image: "/themes/icons/spiritual.jpg",
      imageUrl: "/themes/icons/spiritual.jpg",
      imageQuery: getThemeImageQuery("spiritual", "Spiritual"),
      fallbackImage: "/themes/icons/spiritual.jpg",
      imageAlt: "Spiritual travel packages",
    },
    {
      id: "rural",
      name: "Rural",
      image: "/themes/icons/rural.jpg",
      imageUrl: "/themes/icons/rural.jpg",
      imageQuery: getThemeImageQuery("rural", "Rural"),
      fallbackImage: "/themes/icons/rural.jpg",
      imageAlt: "Rural travel packages",
    },
    {
      id: "wellness",
      name: "Wellness & Medical",
      image: "/themes/icons/wellness-medical.jpg",
      imageUrl: "/themes/icons/wellness-medical.jpg",
      imageQuery: getThemeImageQuery("wellness", "Wellness & Medical"),
      fallbackImage: "/themes/icons/wellness-medical.jpg",
      imageAlt: "Wellness and medical travel packages",
    },
    {
      id: "adventure",
      name: "Adventure & Nature",
      image: "/themes/icons/adventure-nature.jpg",
      imageUrl: "/themes/icons/adventure-nature.jpg",
      imageQuery: getThemeImageQuery("adventure", "Adventure & Nature"),
      fallbackImage: "/themes/icons/adventure-nature.jpg",
      imageAlt: "Adventure and nature travel packages",
    },
    {
      id: "wildlife",
      name: "Eco & Wild Life",
      image: "/themes/icons/eco-wildlife.jpg",
      imageUrl: "/themes/icons/eco-wildlife.jpg",
      imageQuery: getThemeImageQuery("wildlife", "Eco & Wild Life"),
      fallbackImage: "/themes/icons/eco-wildlife.jpg",
      imageAlt: "Eco and wildlife travel packages",
    },
    {
      id: "romance",
      name: "Honeymoon & Celebration",
      image: "/themes/icons/honeymoon-celebration.jpg",
      imageUrl: "/themes/icons/honeymoon-celebration.jpg",
      imageQuery: getThemeImageQuery("romance", "Honeymoon & Celebration"),
      fallbackImage: "/themes/icons/honeymoon-celebration.jpg",
      imageAlt: "Honeymoon and celebration travel packages",
    },
    {
      id: "educational",
      name: "Educational",
      image: "/themes/icons/educational.jpg",
      imageUrl: "/themes/icons/educational.jpg",
      imageQuery: getThemeImageQuery("educational", "Educational"),
      fallbackImage: "/themes/icons/educational.jpg",
      imageAlt: "Educational travel packages",
    },
    {
      id: "weekend",
      name: "Short & Weekend",
      image: "/themes/icons/short-weekend.jpg",
      imageUrl: "/themes/icons/short-weekend.jpg",
      imageQuery: getThemeImageQuery("weekend", "Short & Weekend"),
      fallbackImage: "/themes/icons/short-weekend.jpg",
      imageAlt: "Short and weekend travel packages",
    },
    {
      id: "media",
      name: "Pre Wedding & Production",
      image: "/themes/icons/prewedding-production.jpg",
      imageUrl: "/themes/icons/prewedding-production.jpg",
      imageQuery: getThemeImageQuery("media", "Pre Wedding & Production"),
      fallbackImage: "/themes/icons/prewedding-production.jpg",
      imageAlt: "Pre wedding and production travel packages",
    },
  ];

  const [active, setActive] = useState("");

  return (
    <section
      className="relative mt-2 w-full overflow-hidden rounded-[22px] bg-cover bg-center px-3 py-4 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/themebg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      {/* TITLE */}
      <h2 className="relative z-10 mb-4 text-center text-[22px] font-black leading-7 text-gray-900 sm:mb-6 sm:text-4xl">
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
