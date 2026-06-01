import TPLDynamicImage from "@/app/components/common/TPLDynamicImage";

const plannerModules = [
  {
    title: "Route Intelligence",
    label: "Signal Layer",
    description: "Destination matching, season sense, stay logic, and route fit will live here.",
  },
  {
    title: "Itinerary Builder",
    label: "Trip OS",
    description: "A future workspace for day plans, pace, activities, meals, and experience flow.",
  },
  {
    title: "Booking Ready",
    label: "Commerce Bridge",
    description: "Planner outputs will prepare structured choices for flights, stays, transfers, and packages.",
  },
];

export default function SmartPlannerLanding() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f9ff] text-slate-950">
      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <TPLDynamicImage
          imageQuery="premium ai travel planner dashboard world map luxury itinerary"
          fallbackQuery="luxury travel planning desk world map"
          alt="Tiya Smart Planner"
          className="absolute inset-0 h-full w-full opacity-20"
          imgClassName="h-full w-full object-cover"
          priority
          preferDynamic
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-blue-50/90" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="w-fit rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm">
              TPL AI Travel System
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif italic text-transparent">
                Tiya
              </span>{" "}
              Smart Planner
            </h1>

            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-650 sm:text-lg">
              A premium AI travel operating system for shaping routes, itineraries, and booking-ready decisions inside TPL.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["AI route logic", "Trip memory", "Booking-ready shell"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-white/90 p-3 shadow-[0_24px_70px_rgba(37,99,235,0.16)]">
            <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-slate-950">
              <TPLDynamicImage
                imageQuery="luxury travel itinerary map planning laptop passport"
                fallbackQuery="travel planning map passport"
                alt="Planner command preview"
                className="h-[240px] w-full sm:h-[320px]"
                imgClassName="h-full w-full object-cover opacity-80"
                preferDynamic
                sizes="(max-width: 1024px) 100vw, 44vw"
              />
              <div className="border-t border-white/10 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                      Future Planner Shell
                    </div>
                    <div className="mt-1 text-lg font-black text-white">
                      Route to booking intelligence
                    </div>
                  </div>
                  <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-200">
                    AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {plannerModules.map((module) => (
            <article
              key={module.title}
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                {module.label}
              </div>
              <h2 className="mt-3 text-xl font-black text-slate-950">
                {module.title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {module.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
