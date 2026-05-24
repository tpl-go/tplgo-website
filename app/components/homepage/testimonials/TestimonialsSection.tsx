import TestimonialsSlider from "./TestimonialsSlider";

export default function TestimonialsSection() {
  return (
    <section
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/testimonialsbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-white/5 sm:rounded-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-1 text-center text-white sm:px-8">
        <h2 className="text-2xl font-bold leading-tight sm:text-4xl lg:text-4xl">
          What Our Travellers Say
        </h2>

        <p className="mx-auto mt-3 mb-7 max-w-2xl text-sm leading-6 opacity-80 sm:mb-10 sm:text-lg sm:leading-8">
          Trusted by thousands of happy travellers across India.
        </p>

        <TestimonialsSlider />
      </div>
    </section>
  );
}