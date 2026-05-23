import Link from "next/link";

type InfoPoint = {
  title: string;
  description: string;
};

type FooterInfoPageLayoutProps = {
  badge?: string;
  title: string;
  description: string;
  points?: InfoPoint[];
  children?: React.ReactNode;
};

export default function FooterInfoPageLayout({
  badge = "TPL",
  title,
  description,
  points = [],
  children,
}: FooterInfoPageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-50 via-white to-orange-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-blue-700 shadow-sm">
            {badge}
          </div>

          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-base md:text-lg text-gray-600 leading-8">
            {description}
          </p>

          <div className="mt-7">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {points.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {points.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {children && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
            {children}
          </div>
        )}
      </section>
    </main>
  );
}