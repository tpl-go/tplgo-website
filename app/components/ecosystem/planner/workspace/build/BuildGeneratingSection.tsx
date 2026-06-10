export default function BuildGeneratingSection({
  generationSteps,
}: {
  generationSteps: string[];
}) {
  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-200 bg-[#061839] p-5 text-white shadow-[0_20px_70px_rgba(6,24,57,0.18)]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
          Tiya is building your trip
        </p>
        <h3 className="mt-2 text-3xl font-black">
          Generating smart itinerary
        </h3>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {generationSteps.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3"
            >
              <span
                className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-300"
                style={{ animationDelay: `${index * 120}ms` }}
              />
              <span className="text-sm font-bold text-white/82">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
