"use client";

import { useRef } from "react";
import useThemeScroll from "./useThemeScroll";
import ThemeCard from "./ThemeCard";

export default function ThemeSlider({ themes }: any) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useThemeScroll(scrollRef, pauseRef);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
      className="flex gap-6 overflow-x-hidden scroll-smooth scrollbar-hide"
    >
      {[...themes, ...themes, ...themes].map((t, index) => (
        <ThemeCard key={index} t={t} />
      ))}
    </div>
  );
}