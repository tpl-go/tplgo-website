"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import AccountDropdown from "@/app/components/account/AccountDropdown";
import HeaderPrintModal from "@/app/components/common/print/HeaderPrintModal";

type TopHeaderProps = {
  onChatWithAI?: () => void;
};

export default function TopHeader({ onChatWithAI }: TopHeaderProps) {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState<"ai" | "account" | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // NEW: mobile menu state

  const menuRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setOpenMenu(null);
    router.push("/");
  };

  const handleOpenPrintModal = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setShowPrintModal(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleOpenAITravelExpert = () => {
      setOpenMenu(null);
      setMobileMenuOpen(false);
      onChatWithAI?.();
    };

    window.addEventListener("TPL_OPEN_AI_TRAVEL_EXPERT", handleOpenAITravelExpert);

    return () => {
      window.removeEventListener("TPL_OPEN_AI_TRAVEL_EXPERT", handleOpenAITravelExpert);
    };
  }, [onChatWithAI]);

  return (
    <>
      <header className="relative z-[200] bg-white shadow-sm isolate">
        <div
          ref={menuRef}
          className="max-w-7xl mx-auto px-3 py-3 flex items-center justify-between"
        >
          {/* LOGO — same as before */}
          <div className="flex items-center gap-10 py-1">
            <Link href="/">
              <img
                src="/logo.png"
                alt="TPL Logo"
                className="w-20 h-10 object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* DESKTOP NAV — same as before, hidden on mobile */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-black">
            <Link
              href="/"
              className="flex items-center gap-1 cursor-pointer hover:text-black transition duration-200"
            >
              🏠 <span>Home</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) => (prev === "ai" ? null : "ai"))
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-400 text-black font-semibold bg-orange-100 hover:bg-orange-100 transition"
              >
                🤖 <span>AI Travel Expert</span>
              </button>

              {openMenu === "ai" && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                  <button
                    type="button"
                    onClick={() => { setOpenMenu(null); onChatWithAI?.(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    💬 Chat with AI
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpenMenu(null); alert("Voice AI coming soon"); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 whitespace-nowrap"
                  >
                    🎤 Speak to AI
                  </button>
                  <button type="button" className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                    🧳 Plan My Trip
                  </button>
                  <button type="button" className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                    🌍 Best Package Suggestions
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/explore"
              className="group relative flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-3.5 py-1.5 text-white font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="absolute -top-2 -right-2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white shadow-sm">
                Soon
              </span>
              🎬 <span>TPL Creators</span>
            </Link>

            <Link href="/flight-tracking" className="flex items-center gap-1 cursor-pointer hover:text-black">
              ✈️ <span>Flight Tracking</span>
            </Link>

            <Link href="/web-check-in" className="flex items-center gap-1 cursor-pointer hover:text-black">
              🧾 <span>Web Check-in</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenPrintModal}
              className="flex items-center gap-1 cursor-pointer hover:text-black"
            >
              🖨 <span>Print</span>
            </button>
          </nav>

          {/* RIGHT SIDE — Language + Currency + Login */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language — desktop mein dikhe, mobile mein chhupa do */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">🌐</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>

            {/* Currency — desktop mein dikhe, mobile mein chhupa do */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">💱</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            {/* Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((prev) => prev === "account" ? null : "account")
                  }
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition"
                >
                  My Account
                </button>
                {openMenu === "account" && (
                  <AccountDropdown
                    onClose={() => setOpenMenu(null)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal({ accountType: "personal", intent: "generic" })}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition"
              >
                <span className="hidden sm:inline">Login / Signup</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            {/* HAMBURGER BUTTON — sirf mobile pe dikhega */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition gap-1.5"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU — sirf mobile pe, hamburger click karne par */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex flex-col gap-1">

            {/* Language + Currency mobile mein yahan */}
            <div className="flex items-center gap-3 py-2 border-b border-gray-100 mb-1">
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-sm">🌐</span>
                <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-sm">💱</span>
                <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-black"
            >
              🏠 Home
            </Link>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onChatWithAI?.(); }}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-orange-50 text-sm font-semibold text-black text-left"
            >
              🤖 AI Travel Expert
            </button>

            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-cyan-500 text-white text-sm font-semibold"
            >
              🎬 TPL Creators
              <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Soon</span>
            </Link>

            <Link
              href="/flight-tracking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-black"
            >
              ✈️ Flight Tracking
            </Link>

            <Link
              href="/web-check-in"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-black"
            >
              🧾 Web Check-in
            </Link>

            <button
              type="button"
              onClick={handleOpenPrintModal}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-black text-left"
            >
              🖨 Print
            </button>
          </div>
        )}
      </header>

      <HeaderPrintModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />
    </>
  );
}