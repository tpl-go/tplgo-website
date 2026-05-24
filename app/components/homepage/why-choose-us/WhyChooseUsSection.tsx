"use client";

import WhyChooseAccordion from "./WhyChooseAccordion";
import { useState } from "react";

export default function WhyChooseUsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/whychooseusbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      <div className="relative mx-auto max-w-6xl rounded-[24px] bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-10">
        <div className="mx-auto grid max-w-7xl items-stretch gap-6 lg:grid-cols-2 lg:gap-16">
          {/* LEFT SIDE */}
          <div>
            <h2 className="mb-5 text-2xl font-bold leading-tight text-gray-900 sm:mb-10 sm:text-4xl lg:text-5xl">
              Why Choose TPL?
            </h2>

            <WhyChooseAccordion activeId={activeId} setActiveId={setActiveId} />
          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex h-full justify-center pt-2 sm:pt-6 lg:pt-16">
            <div
              className={`flex h-full items-center rounded-[24px] bg-white p-4 shadow-2xl transition-all duration-500 ease-in-out sm:rounded-3xl sm:p-6 ${
                activeId ? "scale-100 opacity-100" : "scale-95 opacity-90"
              }`}
            >
              <img
                src="/why-choose-us/visual.png"
                alt="Why Choose TPL"
                className="w-full max-w-xs object-contain transition-all duration-500 sm:max-w-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}