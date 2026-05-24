import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { customerSupportContent } from "@/app/lib/footer/customerSupportContent";

export default function CustomerSupportPage() {
  return (
    <FooterInfoPageLayout
      badge={customerSupportContent.badge}
      title={customerSupportContent.title}
      description={customerSupportContent.description}
    >
      <div className="space-y-10 sm:space-y-12">
        <section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {customerSupportContent.supportCategories.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md sm:rounded-2xl sm:p-6"
              >
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">
            Contact Support
          </h2>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {customerSupportContent.contactMethods.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-[22px] border border-gray-200 bg-gray-50 p-4 transition hover:border-orange-300 hover:shadow-md sm:rounded-2xl sm:p-5"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">
                  {item.label}
                </div>

                <div className="mt-2 break-words text-base font-bold text-orange-600 sm:text-lg">
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