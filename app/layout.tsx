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
          overflow-x-clip
        `}
      >
        <AuthProvider>
          {/* 🔥 STICKY HEADER SECTION */}
          <StickyHeaderWrapper />

          <main className="bg-white min-h-screen w-full overflow-x-clip">
            {children}
          </main>

          <ScrollTop />
        </AuthProvider>
      </body>
    </html>
  );
}
