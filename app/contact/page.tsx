import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { contactContent } from "@/app/lib/footer/contactContent";

export default function ContactPage() {
  return (
    <FooterInfoPageLayout
      badge={contactContent.badge}
      title={contactContent.title}
      description={contactContent.description}
    >
      <div className="space-y-8 sm:space-y-10">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {contactContent.contactCards.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="block rounded-[22px] border border-gray-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md sm:rounded-2xl sm:p-6"
            >
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                {item.title}
              </h3>

              <p className="mt-2 break-words text-sm font-semibold text-orange-600 sm:text-base">
                {item.value}
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {item.description}
              </p>
            </a>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
            We can help you with
          </h2>

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {contactContent.supportTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium leading-6 text-gray-700"
              >
                {topic}
              </div>
            ))}
          </div>
        </section>
      </div>
    </FooterInfoPageLayout>
  );
}