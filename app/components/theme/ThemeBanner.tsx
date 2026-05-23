"use client";

import { useEffect, useState } from "react";

interface Props {
  themeId: string;
  themeName: string;
}



export default function ThemeBanner({ themeId, themeName }: Props) {

  const imageSlug = themeId && themeId.length > 0 ? themeId : "culture";

  const formattedName =
    imageSlug
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const images = [
    `/themes/banners/${imageSlug}-1.jpg`,
    `/themes/banners/${imageSlug}-2.jpg`,
    `/themes/banners/${imageSlug}-3.jpg`,
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [imageSlug]);

  return (
    <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">

      {/* Background Image Slider */}
      <img
        src={images[index]}
        alt={themeName}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {themeName} Theme Packages
        </h1>

        <p className="text-white/90 text-lg">
          Explore curated travel experiences under {themeName} theme
        </p>

      </div>
    </section>
  );
}