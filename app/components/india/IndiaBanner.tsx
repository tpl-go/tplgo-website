"use client";

import { useEffect, useState } from "react";

interface Props {
  slug?: string;
}

export default function IndiaBanner({ slug = "india" }: Props) {
  const imageSlug = slug && slug.length > 0 ? slug : "india";

  const displayName = "India";

  const images = [
    `/india/banners/${imageSlug}-1.jpg`,
    `/india/banners/${imageSlug}-2.jpg`,
    `/india/banners/${imageSlug}-3.jpg`,
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-[240px] sm:h-[300px] lg:h-[400px] flex items-center justify-center overflow-hidden">
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 lg:mb-4 leading-tight">
          {displayName} Packages
        </h1>

        <p className="text-white/90 text-sm sm:text-base lg:text-lg max-w-[280px] sm:max-w-none mx-auto">
          Explore curated holiday packages across {displayName}
        </p>
      </div>
    </section>
  );
}
