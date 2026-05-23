"use client";

import { useRouter } from "next/navigation";
import ExperienceGrid from "./ExperienceGrid";
import { Experience } from "./types";
import { useExperienceRank } from "./useExperienceRank";

export default function ExperiencesSection() {
  const router = useRouter();

  const experiences: Experience[] = [
    { id: "cruise", name: "Cruise", image: "/experiences/cruise.jpg", salesScore: 987, slug: "cruise" },
    { id: "adventure", name: "Adventure", image: "/experiences/adventure.jpg", salesScore: 850, slug: "adventure" },
    { id: "honeymoon", name: "Honeymoon", image: "/experiences/honeymoon.jpg", salesScore: 720, slug: "honeymoon" },
    { id: "production", name: "Production", image: "/experiences/production.jpg", salesScore: 650, slug: "production" },
    { id: "spiritual", name: "Spiritual Retreats", image: "/experiences/spiritual.jpg", salesScore: 600, slug: "spiritual" },
    { id: "wildlife", name: "Wildlife Safari", image: "/experiences/wildlife.jpg", salesScore: 540, slug: "wildlife" },
    { id: "luxury", name: "Luxury Escapes", image: "/experiences/luxury.jpg", salesScore: 500, slug: "luxury" },
    { id: "roadtrip", name: "Road Trips", image: "/experiences/roadtrip.jpg", salesScore: 470, slug: "roadtrip" },
    { id: "weekend", name: "Weekend Getaways", image: "/experiences/weekend.jpg", salesScore: 430, slug: "weekend" },
    { id: "corporate", name: "Corporate Travel", image: "/experiences/corporate.jpg", salesScore: 390, slug: "corporate" },
  ];

  const sorted = useExperienceRank(experiences);

  const smartExperienceRoute = (slug: string) => {
    const s = (slug || "").toLowerCase();

    const withSub = (path: string, sub: string) => {
      return `${path}?sub=${encodeURIComponent(sub)}&source=experience`;
    };

    // 1) Service driven experience
    if (s.includes("cruise")) {
      return "/cruise/result?source=experience&mode=smart&advanceDays=30&sort=cheapest";
    }

    // 2) Smart mapping → Theme pages with subtheme preselected
    if (s.includes("adventure")) {
      return withSub("/themes/adventure", "Himalayan Adventure");
    }

    if (s.includes("roadtrip")) {
      return withSub("/themes/adventure", "Cycling & Road Trips");
    }

    if (s.includes("honeymoon")) {
      return withSub("/themes/romance", "Honeymoon Packages");
    }

    if (s.includes("luxury")) {
      return withSub("/themes/romance", "Romantic Getaways");
    }

    if (s.includes("production")) {
      return withSub("/themes/media", "Pre-Wedding & Fashion Shoots");
    }

    if (s.includes("spiritual")) {
      return withSub("/themes/spiritual", "Spiritual Retreats");
    }

    if (s.includes("wildlife") || s.includes("safari") || s.includes("wild")) {
      return withSub("/themes/wildlife", "Jungle Safari");
    }

    if (s.includes("weekend")) {
      return withSub("/themes/weekend", "Weekend Getaways");
    }

    // 3) Group tour driven experience
    if (s.includes("corporate")) {
  return "/group-tours?source=experience&tab=Corporate";
}

    // 4) fallback safe
    return "/themes/culture?source=experience";
  };

  const handleClick = (slug: string) => {
    const route = smartExperienceRoute(slug);
    router.push(route);
  };

  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/experiencebg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      <h2 className="text-center text-4xl font-bold text-gray-900 mb-14">
        TPL Experiences
      </h2>

      <ExperienceGrid sorted={sorted} handleClick={handleClick} />
    </section>
  );
}