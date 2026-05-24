import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { aboutUsContent } from "@/app/lib/footer/aboutUsContent";

export default function AboutUsPage() {
  return (
    <FooterInfoPageLayout
      badge={aboutUsContent.badge}
      title={aboutUsContent.title}
      description={aboutUsContent.description}
      points={aboutUsContent.points}
    >
      <div className="space-y-6 text-sm leading-7 text-gray-700 sm:space-y-8 sm:text-base">
        {aboutUsContent.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[22px] border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:rounded-[26px] sm:p-6"
          >
            <h2 className="mb-3 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {section.title}
            </h2>

            <p className="leading-7 text-gray-700">
              {section.description}
            </p>
          </section>
        ))}
      </div>
    </FooterInfoPageLayout>
  );
}