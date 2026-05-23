"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import { useTestimonialsData } from "./useTestimonialsData";

export default function TestimonialsSlider() {
  const testimonials = useTestimonialsData();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={prevSlide}
        className="absolute left-0 bg-white/20 hover:bg-white/40 p-3 rounded-full transition"
      >
        <ChevronLeft />
      </button>

      <div className="grid md:grid-cols-3 gap-8 transition-all duration-500">
        {[0, 1, 2].map((offset) => {
          const index = (current + offset) % testimonials.length;
          const item = testimonials[index];

          return <TestimonialCard key={item.id} item={item} />;
        })}
      </div>

      <button
        onClick={nextSlide}
        className="absolute right-0 bg-white/20 hover:bg-white/40 p-3 rounded-full transition"
      >
        <ChevronRight />
      </button>
    </div>
  );
}