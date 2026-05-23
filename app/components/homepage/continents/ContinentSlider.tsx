"use client";

import { useRef } from "react";
import useContinentScroll from "./useContinentScroll";
import ContinentCard from "./ContinentCard";

export default function ContinentSlider({ continents }: any) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useContinentScroll(scrollRef, pauseRef);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
      className="flex gap-6 overflow-x-hidden scroll-smooth scrollbar-hide"
    >
      {[...continents, ...continents,...continents].map((c, index) => (
        <ContinentCard key={index} c={c} />
      ))}
    </div>
  );
}