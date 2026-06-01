"use client";

import { useEffect, useState } from "react";
import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";
import { getSmartThemeBannerImage } from "@/app/lib/images/smartPackageImageResolver";

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
  const smartImage = getSmartThemeBannerImage(themeId);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [imageSlug]);

  return (
    <section className="relative w-full h-[240px] sm:h-[300px] lg:h-[400px] flex items-center justify-center overflow-hidden">

      {/* Background Image Slider */}
      <TPLDynamicImage
        src={smartImage.src || images[index]}
        imageQuery={smartImage.imageQuery}
        fallbackSrc={smartImage.fallbackSrc || images[index]}
        fallbackQuery={smartImage.fallbackQuery}
        alt={themeName}
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover transition-opacity duration-1000"
        sizes="100vw"
        priority
        preferDynamic={smartImage.preferDynamic}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 lg:mb-4 leading-tight">
          {themeName} Theme Packages
        </h1>

        <p className="text-white/90 text-sm sm:text-base lg:text-lg max-w-[290px] sm:max-w-none mx-auto">
          Explore curated travel experiences under {themeName} theme
        </p>

      </div>
    </section>
  );
}
