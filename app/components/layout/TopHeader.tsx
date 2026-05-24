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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();

  const closeMenus = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setMobileAiOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    router.push("/");
  };

  const handleOpenAI = () => {
    closeMenus();
    onChatWithAI?.();
  };

  const handleComingSoon = (message: string) => {
    alert(message);
    closeMenus();
  };

  const handleOpenPrintModal = () => {
    closeMenus();
    setShowPrintModal(true);
  };

  const handleLogin = () => {
    closeMenus();
    openLoginModal({
      accountType: "personal",
      intent: "generic",
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        closeMenus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenAITravelExpert = () => {
      handleOpenAI();
    };

    window.addEventListener("TPL_OPEN_AI_TRAVEL_EXPERT", handleOpenAITravelExpert);

    return () => {
      window.removeEventListener("TPL_OPEN_AI_TRAVEL_EXPERT", handleOpenAITravelExpert);
    };
  }, [onChatWithAI]);

  return (
    <>
      <header
        ref={menuRef}
        className="relative z-[200] bg-white shadow-sm isolate"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-3 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center shrink-0">
            <Link href="/" onClick={closeMenus}>
              <img
                src="/logo.png"
                alt="TPL Logo"
                className="w-16 h-10 sm:w-20 object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* DESKTOP NAV — untouched design */}
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
                onClick={() => setOpenMenu((prev) => (prev === "ai" ? null : "ai"))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-400 text-black font-semibold bg-orange-100 hover:bg-orange-100 transition"
              >
                🤖 <span>AI Travel Expert</span>
              </button>

              {openMenu === "ai" && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                  <button
                    type="button"
                    onClick={handleOpenAI}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    💬 Chat with AI
                  </button>

                  <button
                    type="button"
                    onClick={() => handleComingSoon("Voice AI coming soon")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 whitespace-nowrap"
                  >
                    🎤 Speak to AI
                  </button>

                  <button
                    type="button"
                    onClick={() => handleComingSoon("Plan My Trip coming soon")}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    🧳 Plan My Trip
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleComingSoon("Best Package Suggestions coming soon")
                    }
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
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

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-1.5 md:gap-4">
            {/* DESKTOP LANGUAGE */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">🌐</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>

            {/* DESKTOP CURRENCY */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <span className="text-black text-sm">💱</span>
              <select className="bg-transparent text-black text-sm font-semibold outline-none cursor-pointer">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            {/* MOBILE HOME */}
            <Link
              href="/"
              onClick={closeMenus}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-[15px]"
              aria-label="Home"
            >
              🏠
            </Link>

            {/* MOBILE LANGUAGE */}
            <div className="md:hidden flex items-center gap-1 bg-gray-100 px-1 h-8 rounded-lg">
              <span className="text-[11px]">🌐</span>
              <select className="bg-transparent text-[10px] font-semibold text-black outline-none cursor-pointer w-[32px]">
                <option>EN</option>
                <option>HI</option>
              </select>
            </div>

            {/* MOBILE CURRENCY */}
            <div className="md:hidden flex items-center gap-1 bg-gray-100 px-1 h-8 rounded-lg">
              <span className="text-[11px]">💱</span>
              <select className="bg-transparent text-[10px] font-semibold text-black outline-none cursor-pointer w-[40px]">
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            {/* LOGIN / ACCOUNT */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => (prev === "account" ? null : "account"))}
                  className="bg-blue-600 text-white px-2.5 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium hover:bg-blue-700 transition"
                >
                  <span className="hidden md:inline">My Account</span>
                  <span className="md:hidden">Account</span>
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
                onClick={handleLogin}
                className="bg-blue-600 text-white px-2.5 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium hover:bg-blue-700 transition"
              >
                <span className="hidden md:inline">Login / Signup</span>
                <span className="md:hidden">Login</span>
              </button>
            )}

            {/* MOBILE 3 VERTICAL LINE MENU */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileAiOpen(false);
                setOpenMenu(null);
              }}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-[3px]">
                <span className="block w-[14px] h-[2px] rounded-full bg-gray-700" />
                <span className="block w-[14px] h-[2px] rounded-full bg-gray-700" />
                <span className="block w-[14px] h-[2px] rounded-full bg-gray-700" />
              </div>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setMobileAiOpen((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-2 py-2.5 rounded-lg hover:bg-orange-50 text-sm font-semibold text-black text-left"
            >
              <span>🤖 AI Travel Expert</span>
              <span>{mobileAiOpen ? "−" : "+"}</span>
            </button>

            {mobileAiOpen && (
              <div className="ml-3 mb-1 border-l border-orange-200 pl-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleOpenAI}
                  className="px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left"
                >
                  💬 Chat with AI
                </button>

                <button
                  type="button"
                  onClick={() => handleComingSoon("Voice AI coming soon")}
                  className="px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left"
                >
                  🎤 Speak to AI
                </button>

                <button
                  type="button"
                  onClick={() => handleComingSoon("Plan My Trip coming soon")}
                  className="px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left"
                >
                  🧳 Plan My Trip
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleComingSoon("Best Package Suggestions coming soon")
                  }
                  className="px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left"
                >
                  🌍 Best Package Suggestions
                </button>
              </div>
            )}

            <Link
              href="/explore"
              onClick={closeMenus}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-cyan-500 text-white text-sm font-semibold"
            >
              🎬 TPL Creators
              <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                Soon
              </span>
            </Link>

            <Link
              href="/flight-tracking"
              onClick={closeMenus}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-black"
            >
              ✈️ Flight Tracking
            </Link>

            <Link
              href="/web-check-in"
              onClick={closeMenus}
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

      <HeaderPrintModal open={showPrintModal} onClose={() => setShowPrintModal(false)} />
    </>
  );
}