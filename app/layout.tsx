import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollTop from "./components/global/ScrollTop";
import StickyHeaderWrapper from "./components/layout/StickyHeaderWrapper";
import AuthProvider from "./providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          bg-white
          text-black
          min-h-screen
          overflow-x-hidden
        `}
      >
        <AuthProvider>
          {/* 🔥 STICKY HEADER SECTION */}
          <StickyHeaderWrapper />

          <main className="bg-white min-h-screen">
            {children}
          </main>

          <ScrollTop />
        </AuthProvider>
      </body>
    </html>
  );
}