"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import AccountDropdown from "@/app/components/account/AccountDropdown";
import {
  getSupportedFlightDisplayCurrencies,
  readFlightDisplayCurrencyPreference,
  saveFlightDisplayCurrencyPreference,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";

const services = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Flights", icon: "✈️", href: "/flights" },
  { label: "Hotels", icon: "🏨", href: "/hotels/results" },
  { label: "Homestay", icon: "🏡", href: "/homestays/results" },
  { label: "Holidays", icon: "🎁", href: "/holidays" },
  { label: "Bus", icon: "🚌", href: "/bus/result" },
  { label: "Train", icon: "🚆", href: "/train/result" },
  { label: "Cabs", icon: "🚕", href: "/cab/result" },
  { label: "Cruise", icon: "🚢", href: "/cruise/result" },
  { label: "Insurance", icon: "🛡️", href: "/insurance/results" },
  { label: "Visa", icon: "📄", href: "/visa/results" },
];

function isActive(pathname: string, href: string) {
  const base = href.split("/")[1];

  if (!base) {
    return pathname === "/";
  }

  return pathname.startsWith(`/${base}`);
}

export default function InnerStickyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { openLoginModal, user, isAuthenticated, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<FlightCurrency>("INR");
  const supportedCurrencies = getSupportedFlightDisplayCurrencies();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDisplayCurrency(readFlightDisplayCurrencyPreference());
  }, []);

  const handleCurrencyChange = (value: string) => {
    const next = value as FlightCurrency;
    setDisplayCurrency(next);
    saveFlightDisplayCurrencyPreference(next);
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-[300] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      {/* DESKTOP — untouched */}
      <div className="hidden md:flex mx-auto h-[66px] max-w-[1500px] items-center justify-between gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="TPL Logo"
            className="h-9 w-16 object-contain"
          />
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
          {services.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-[48px] min-w-[72px] flex-col items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
                <span className="mt-1 whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2">
            <span className="text-sm">🌐</span>
            <select className="bg-transparent text-xs font-bold text-slate-800 outline-none">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2">
            <span className="text-sm">💱</span>
            <select
              value={displayCurrency}
              onChange={(event) => handleCurrencyChange(event.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          {isAuthenticated && user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
              >
                My Account
              </button>

              {accountOpen && (
                <AccountDropdown
                  onClose={() => setAccountOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                openLoginModal({
                  accountType: "personal",
                  intent: "generic",
                })
              }
              className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* MOBILE — added separately */}
      <div className="md:hidden">
        <div className="flex h-[58px] items-center justify-between gap-2 px-3">
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/logo.png"
              alt="TPL Logo"
              className="h-9 w-16 object-contain"
            />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
            <div className="flex h-8 items-center gap-1 rounded-lg bg-slate-100 px-1.5">
              <span className="text-[11px]">🌐</span>
              <select className="w-[34px] bg-transparent text-[10px] font-bold text-slate-800 outline-none">
                <option>EN</option>
                <option>HI</option>
              </select>
            </div>

            <div className="flex h-8 items-center gap-1 rounded-lg bg-slate-100 px-1.5">
              <span className="text-[11px]">💱</span>
              <select
                value={displayCurrency}
                onChange={(event) => handleCurrencyChange(event.target.value)}
                className="w-[42px] bg-transparent text-[10px] font-bold text-slate-800 outline-none"
              >
                {supportedCurrencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            {isAuthenticated && user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="h-8 rounded-lg bg-blue-600 px-2.5 text-[11px] font-bold text-white"
                >
                  Account
                </button>

                {accountOpen && (
                  <AccountDropdown
                    onClose={() => setAccountOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openLoginModal({
                    accountType: "personal",
                    intent: "generic",
                  })
                }
                className="h-8 rounded-lg bg-blue-600 px-2.5 text-[11px] font-bold text-white"
              >
                Login
              </button>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2 scrollbar-hide">
          {services.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-[46px] min-w-[66px] flex-col items-center justify-center rounded-xl border px-2 text-[11px] font-bold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-100 bg-white text-slate-700"
                }`}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
                <span className="mt-1 whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
