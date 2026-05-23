import TestimonialsSlider from "./TestimonialsSlider";

export default function TestimonialsSection() {
  return (
    <section
      className="relative w-full mt-2 px-8 py-6 rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/testimonialsbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-8 text-center text-white">
        <h2 className="text-4xl lg:text-4xl font-bold mb-4">
          What Our Travellers Say
        </h2>

        <p className="mb-10 text-lg opacity-80">
          Trusted by thousands of happy travellers across India.
        </p>

        <TestimonialsSlider />
      </div>
    </section>
  );
}