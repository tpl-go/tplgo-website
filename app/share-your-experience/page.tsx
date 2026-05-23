import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { shareExperienceContent } from "@/app/lib/footer/shareExperienceContent";

export default function ShareYourExperiencePage() {
  return (
    <FooterInfoPageLayout
      badge={shareExperienceContent.badge}
      title={shareExperienceContent.title}
      description={shareExperienceContent.description}
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            What can you share?
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {shareExperienceContent.experienceTypes.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Share your feedback
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {shareExperienceContent.channels.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-orange-300 hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-orange-600 font-semibold">
                  {item.value}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </FooterInfoPageLayout>
  );
}