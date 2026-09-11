import type { Metadata } from "next";
import "./globals.css";
import ScrollTop from "./components/global/ScrollTop";
import StickyHeaderWrapper from "./components/layout/StickyHeaderWrapper";
import AuthProvider from "./providers/AuthProvider";

function getMetadataBase(): URL {
  const fallbackUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_TPL_APP_BASE_URL ||
    "http://localhost:3000";

  try {
    return new URL(fallbackUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "TPL GO",
  description: "Treeyambak OTA Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white scroll-smooth">
      <body
        className={`
          antialiased
          bg-white
          text-black
          min-h-screen
          overflow-x-hidden
        `}
      >
        <AuthProvider>
          {process.env.TPL_ENVIRONMENT === "isolated-partner-private-s8e3" &&
            process.env.NEXT_PUBLIC_TPL_API_BASE_URL === "http://127.0.0.1:4300" && (
              <aside aria-label="Private demo environment" className="border-b border-red-700 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-900">
                DEMO / TEST ONLY. Simulated OTP delivery and test legal acceptance. No operational activation.
              </aside>
            )}
          {/* 🔥 STICKY HEADER SECTION */}
          <StickyHeaderWrapper />

          <main className="bg-white min-h-screen w-full overflow-x-hidden">
            {children}
          </main>

          <ScrollTop />
        </AuthProvider>
      </body>
    </html>
  );
}
