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

  const [openMenu, setOpenMenu] = useState<"account" | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();

  const closeMenus = () => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    router.push("/");
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

            <Link
              href="/smart-planner"
              onClick={closeMenus}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-blue-500/25 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-3 py-1.5 text-black shadow-[0_0_18px_rgba(37,99,235,0.12)] transition hover:border-blue-500/45 hover:shadow-[0_0_22px_rgba(14,165,233,0.18)]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-8 w-8 bg-white/40 opacity-0 blur-sm transition group-hover:left-full group-hover:opacity-100" />
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 text-[10px] font-black text-white shadow-[0_0_12px_rgba(37,99,235,0.28)]">
                AI
              </span>
              <span className="relative flex items-center gap-1.5 leading-none">
                <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif text-[17px] font-black italic tracking-normal text-transparent">
                  Tiya
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-[11px] font-extrabold text-slate-800">
                    Smart Planner
                  </span>
                </span>
              </span>
            </Link>

            <Link
              href="/creators"
              className="group relative flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-3.5 py-1.5 text-white font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              
              🎬 <span>TPL Creators</span><span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">Beta</span>
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
            <Link
              href="/smart-planner"
              onClick={closeMenus}
              className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-3 py-2.5 text-black shadow-[0_0_16px_rgba(37,99,235,0.12)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 text-[10px] font-black text-white shadow-[0_0_12px_rgba(37,99,235,0.25)]">
                AI
              </span>
              <span className="flex items-center gap-2 leading-none">
                <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 bg-clip-text font-serif text-[19px] font-black italic tracking-normal text-transparent">
                  Tiya
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-[13px] font-extrabold text-slate-800">
                    Smart Planner
                  </span>
                </span>
              </span>
            </Link>

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
