import FooterInfoPageLayout from "@/app/components/footer-pages/FooterInfoPageLayout";
import { contactContent } from "@/app/lib/footer/contactContent";

export default function ContactPage() {
  return (
    <FooterInfoPageLayout
      badge={contactContent.badge}
      title={contactContent.title}
      description={contactContent.description}
    >
      <div className="space-y-10">
        <div className="grid md:grid-cols-3 gap-6">
          {contactContent.contactCards.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="block rounded-2xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-orange-600 font-semibold">
                {item.value}
              </p>
              <p className="mt-3 text-sm text-gray-600 leading-6">
                {item.description}
              </p>
            </a>
          ))}
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            We can help you with
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {contactContent.supportTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
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