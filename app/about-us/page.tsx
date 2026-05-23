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
      <div className="space-y-8 text-gray-700 leading-7">
        {aboutUsContent.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {section.title}
            </h2>
            <p>{section.description}</p>
          </section>
        ))}
      </div>
    </FooterInfoPageLayout>
  );
}