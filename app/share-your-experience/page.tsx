import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { shareExperienceContent } from "@/app/lib/footer/shareExperienceContent";

export default function ShareYourExperiencePage() {
  return (
    <FooterInfoPageLayout
      badge={shareExperienceContent.badge}
      title={shareExperienceContent.title}
      description={shareExperienceContent.description}
    >
      <div className="space-y-8 sm:space-y-10">
        <section>
          <h2 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">
            What can you share?
          </h2>

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {shareExperienceContent.experienceTypes.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-6 text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">
            Share your feedback
          </h2>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {shareExperienceContent.channels.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-[22px] border border-gray-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md sm:rounded-2xl sm:p-6"
              >
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                  {item.title}
                </h3>

                <p className="mt-2 break-words text-sm font-semibold text-orange-600 sm:text-base">
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