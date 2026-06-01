"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  buildImageProviderUrl,
  isLocalImageSource,
  resolveDynamicImage,
} from "@/app/lib/images/dynamicImageEngine";
import { genericTravelImageQuery } from "@/app/lib/images/imageQueryMaps";

type Props = {
  src?: string | null;
  imageQuery?: string | null;
  fallbackSrc?: string | null;
  alt?: string | null;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  preferDynamic?: boolean;
  fallbackQuery?: string | null;
};

export default function TPLDynamicImage({
  src,
  imageQuery,
  fallbackSrc,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "100vw",
  preferDynamic = false,
  fallbackQuery = genericTravelImageQuery,
}: Props) {
  const resolved = useMemo(
    () =>
      resolveDynamicImage({
        imageUrl: src,
        imageQuery,
        fallbackImage: fallbackSrc,
        imageAlt: alt,
        preferDynamic,
      }),
    [src, imageQuery, fallbackSrc, alt, preferDynamic]
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasTriedFallbackQuery, setHasTriedFallbackQuery] = useState(false);
  const [activeSrc, setActiveSrc] = useState(resolved.src);

  const fallbackQuerySrc = useMemo(
    () => buildImageProviderUrl(fallbackQuery),
    [fallbackQuery]
  );

  useEffect(() => {
    setActiveSrc(resolved.src);
    setIsLoaded(false);
    setHasError(false);
    setHasTriedFallbackQuery(false);
  }, [resolved.src]);

  const useNextImage = Boolean(activeSrc) && isLocalImageSource(activeSrc);
  const showPlaceholder = hasError || !activeSrc;

  const handleImageError = () => {
    if (
      fallbackQuerySrc &&
      !hasTriedFallbackQuery &&
      fallbackQuerySrc !== activeSrc
    ) {
      setHasTriedFallbackQuery(true);
      setIsLoaded(false);
      setActiveSrc(fallbackQuerySrc);
      return;
    }

    if (fallbackSrc && fallbackSrc !== activeSrc) {
      setIsLoaded(false);
      setActiveSrc(fallbackSrc);
      return;
    }

    setHasError(true);
    setIsLoaded(true);
    if (process.env.NODE_ENV !== "production") {
      console.warn("TPLDynamicImage travel placeholder used", {
        imageQuery,
        fallbackQuery,
        src: activeSrc,
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      data-image-query={process.env.NODE_ENV !== "production" ? imageQuery || undefined : undefined}
      data-image-source={process.env.NODE_ENV !== "production" ? resolved.source : undefined}
    >
      {!isLoaded ? (
        <div className="absolute inset-0 animate-pulse bg-slate-200/80" />
      ) : null}

      {showPlaceholder ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-orange-100 px-4 text-center text-slate-700">
          <div className="mb-2 h-8 w-8 rounded-full border-2 border-white/80 bg-white/70 shadow-sm" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Travel Image
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            Destination preview
          </p>
        </div>
      ) : useNextImage ? (
        <Image
          src={activeSrc}
          alt={resolved.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={imgClassName}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      ) : (
        <img
          src={activeSrc}
          alt={resolved.alt}
          className={imgClassName}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
