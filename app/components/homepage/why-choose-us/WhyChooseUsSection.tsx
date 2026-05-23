"use client";

import WhyChooseAccordion from "./WhyChooseAccordion";
import { useState } from "react";


export default function WhyChooseUsSection() {

  const [activeId, setActiveId] = useState<string | null>(null);

  return (

    <section className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/whychooseusbg.jpg')" }}
    >

      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
<div className="relative max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-stretch">

        {/* LEFT SIDE */}
        <div>
          <h2 className="text-4xl lg:text-5x1 font-bold text-gray-900 mb-10 leading-tight">
            Why Choose TPL?
          </h2>

          <WhyChooseAccordion 
  activeId={activeId} 
  setActiveId={setActiveId} 
/>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex justify-center h-full pt-16">
  <div
    className={`bg-white rounded-3xl p-6 shadow-2xl 
    transition-all duration-500 ease-in-out h-full flex items-center
    ${activeId ? "scale-100 opacity-100" : "scale-95 opacity-90"}`}
  >
    <img
      src="/why-choose-us/visual.png"
      alt="Why Choose TPL"
      className="w-full max-w-md object-contain transition-all duration-500"
    />
  </div>
</div>
</div>
      </div>
    </section>
  );
}