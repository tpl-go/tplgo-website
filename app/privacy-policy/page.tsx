import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { privacyPolicyContent } from "@/app/lib/footer/privacyPolicyContent";

export default function PrivacyPolicyPage() {
  return (
    <FooterInfoPageLayout
      badge={privacyPolicyContent.badge}
      title={privacyPolicyContent.title}
      description={privacyPolicyContent.description}
    >
      <div className="space-y-6 text-gray-700 sm:space-y-8 sm:leading-7">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold leading-6 text-blue-800">
            Last Updated: {privacyPolicyContent.lastUpdated}
          </p>
        </div>

        {privacyPolicyContent.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              {section.title}
            </h2>

            <p className="text-sm leading-7 text-gray-700 sm:text-base">
              {section.description}
            </p>
          </section>
        ))}
      </div>
    </FooterInfoPageLayout>
  );
}