import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { customerSupportContent } from "@/app/lib/footer/customerSupportContent";

export default function CustomerSupportPage() {
  return (
    <FooterInfoPageLayout
      badge={customerSupportContent.badge}
      title={customerSupportContent.title}
      description={customerSupportContent.description}
    >
      <div className="space-y-12">
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerSupportContent.supportCategories.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Contact Support
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {customerSupportContent.contactMethods.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 hover:border-orange-300 hover:shadow-md transition"
              >
                <div className="text-sm font-semibold text-gray-500">
                  {item.label}
                </div>

                <div className="mt-2 text-lg font-bold text-orange-600">
                  {item.value}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </FooterInfoPageLayout>
  );
}