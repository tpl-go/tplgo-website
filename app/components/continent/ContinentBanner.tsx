"use client";

import { useEffect, useState } from "react";

interface Props {
  slug: string;
}

export default function ContinentBanner({ slug }: Props) {

  const imageSlug = slug && slug.length > 0 ? slug : "asia";

  const formattedName =
imageSlug
.split(" ")
.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
.join(" ");

const displayName =
slug === "oceania"
  ? "Australia & New Zealand"
  : formattedName;



  const images = [
    `/continents/banners/${imageSlug}-1.jpg`,
    `/continents/banners/${imageSlug}-2.jpg`,
    `/continents/banners/${imageSlug}-3.jpg`,
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">

      {/* Background Image Slider */}
      <img
        src={images[index]}
        alt={displayName}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {displayName} Packages
        </h1>

        <p className="text-white/90 text-lg">
          Explore curated holiday packages across {displayName}
        </p>
      </div>

    </section>
  );
}