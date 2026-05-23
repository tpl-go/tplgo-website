import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { cancellationPolicyContent } from "@/app/lib/footer/cancellationPolicyContent";

export default function CancellationPolicyPage() {
  return (
    <FooterInfoPageLayout
      badge={cancellationPolicyContent.badge}
      title={cancellationPolicyContent.title}
      description={cancellationPolicyContent.description}
    >
      <div className="space-y-8 text-gray-700 leading-7">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4">
          <p className="text-sm font-semibold text-blue-800">
            Last Updated: {cancellationPolicyContent.lastUpdated}
          </p>
        </div>

        {cancellationPolicyContent.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {section.title}
            </h2>
            <p>{section.description}</p>
          </section>
        ))}
      </div>
    </FooterInfoPageLayout>
  );
}