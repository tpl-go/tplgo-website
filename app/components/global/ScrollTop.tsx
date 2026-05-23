"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-2 right-0 z-40 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="group relative w-12 h-12 rounded-full 
        bg-gradient-to-br from-orange-500 to-orange-600
        shadow-xl shadow-orange-500/30
        flex items-center justify-center
        hover:scale-110 transition-transform duration-300"
      >
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-full bg-orange-500/20 blur-lg group-hover:blur-xl transition-all duration-300"></span>

        <ChevronUp
          size={22}
          strokeWidth={2.5}
          className="relative text-white"
        />
      </button>
    </div>
  );
}