"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import { BasicAccountProvider, useBasicAccount } from "@/app/components/account/BasicAccountData";
import {
  WALLET_UPDATED_EVENT,
  formatWalletPrice,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";
import { getBackendFirstWallet } from "@/app/lib/api/walletApi";
import { UserAccountTrustProvider, UserLoginEmail, UserLoginMobile } from "@/app/components/account/UserAccountTrust";

const tabs = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/account/trips", label: "My Trips" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/wallet", label: "My Wallet" },
];


export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthLoading, isAuthenticated, authError, openLoginModal } = useAuth();
  const pathname = usePathname();
  if (isAuthLoading || !isAuthenticated || !user?.id) {
    return <main className="min-h-screen bg-[#f6f8fb] p-6"><div className="mx-auto max-w-7xl rounded-2xl border bg-white p-6" role="status">
      <h1 className="text-xl font-semibold">My Account</h1>
      <p className="my-4">{isAuthLoading ? "Confirming your session…" : authError ? "We could not confirm your session. Please retry." : "Sign in to view your account."}</p>
      {!isAuthLoading && (authError ? <button onClick={() => window.location.reload()}>Retry</button> : <button onClick={() => openLoginModal({ redirectAfterLogin: pathname })}>Sign in</button>)}
    </div></main>;
  }
  return <BasicAccountProvider key={user.id}><UserAccountTrustProvider><AccountLayoutContent key={user.id}>{children}</AccountLayoutContent></UserAccountTrustProvider></BasicAccountProvider>;
}

function AccountLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthLoading, isAuthenticated, user } = useAuth();

  const { profile } = useBasicAccount();
  const photo = null;
  const bannerName = profile.status === "ready" ? [profile.rows[0]?.firstName, profile.rows[0]?.lastName].filter(Boolean).join(" ") || "Personal Account" : profile.status === "loading" ? "Loading profile..." : "Profile unavailable";
  const [wallet, setWallet] = useState<Wallet | null>(null);



  const getActiveMobile = useCallback(() => {
    return isAuthenticated ? user?.mobile || "" : "";
  }, [isAuthenticated, user?.mobile]);

  useEffect(() => {
    let cancelled = false;
    let sequence = 0;

    const syncWallet = async () => {
      const request = ++sequence;
      setWallet(null);
      if (isAuthLoading || !isAuthenticated || !user?.id) {
        setWallet(null);
        return;
      }

      const result = await getBackendFirstWallet(undefined, {
        allowLocalFallback: false,
      });
      if (!cancelled && request === sequence) {
        setWallet(result.source === "backend" ? result.wallet : null);
      }
    };

    void syncWallet();

    window.addEventListener(WALLET_UPDATED_EVENT, syncWallet);
    window.addEventListener(AUTH_UPDATED_EVENT, syncWallet);
    window.addEventListener("storage", syncWallet);

    return () => {
      cancelled = true;
      window.removeEventListener(WALLET_UPDATED_EVENT, syncWallet);
      window.removeEventListener(AUTH_UPDATED_EVENT, syncWallet);
      window.removeEventListener("storage", syncWallet);
    };
  }, [getActiveMobile, isAuthLoading, isAuthenticated, user?.id]);

  const totalWalletBalance =
    Number(wallet?.promoCredit || 0) +
    Number(wallet?.earnedCredit || 0) +
    Number(wallet?.refundableBalance || 0);

  return (
    <main className="bg-[#f6f8fb] min-h-screen pb-10">
      {/* MOBILE TOP SPACING — inner sticky header overlap fix */}
      <div className="h-[12px] md:hidden" />

      <div className="max-w-7xl mx-auto px-3 md:px-4 pt-3 md:pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          {/* DESKTOP BANNER */}
          <div
            className="hidden md:block h-[220px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.50), rgba(15,23,42,0.42)), url('/demo/kerala-cover.jpg')",
            }}
          />

          {/* MOBILE BANNER */}
          <div
            className="md:hidden h-[350px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.62), rgba(15,23,42,0.55)), url('/demo/kerala-cover.jpg')",
            }}
          />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 md:px-6 pb-4 md:pb-5">
              {/* DESKTOP */}
              <div className="hidden md:flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <button
                      type="button"
                      disabled aria-label="Profile photo changes are unavailable" title="Photo persistence requires protected storage"
                      className="w-24 h-24 rounded-full overflow-hidden bg-white/18 backdrop-blur-md border border-white/30 text-white shadow-lg flex items-center justify-center hover:bg-white/22 transition"
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-center">
                          <div className="text-2xl leading-none">📷</div>
                          <div className="text-[11px] font-medium mt-1">
                            Photo unavailable
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="text-white pb-1">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                      {bannerName}
                    </h1>

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-white/95">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <UserLoginMobile />
                      </div>

                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <UserLoginEmail />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <div className="min-w-[220px] rounded-2xl border border-white/20 bg-white/12 backdrop-blur-md px-5 py-4 text-white shadow-lg">
                    <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
                      TPL Wallet
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <h3 className="text-3xl font-bold leading-none">
                        {wallet ? formatWalletPrice(totalWalletBalance) : "\u2014"}
                      </h3>

                      <span className="text-sm text-white/80 mb-1">
                        {wallet ? "Available" : "Balance unavailable"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-white/80">
                      Includes Promo Credit, Earned Credit, and Refund Wallet
                      balance.
                    </p>
                  </div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="md:hidden">
                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    disabled aria-label="Profile photo changes are unavailable" title="Photo persistence requires protected storage"
                    className="h-24 w-24 overflow-hidden rounded-full border border-white/30 bg-white/15 backdrop-blur-md shadow-xl"
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt="User"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-white">
                        <div className="text-2xl">📷</div>
                        <div className="mt-1 text-[10px] font-medium">
                          Photo unavailable
                        </div>
                      </div>
                    )}
                  </button>

                  <h1 className="mt-4 text-[22px] font-extrabold leading-tight text-white">
                    {bannerName}
                  </h1>

                  <div className="mt-3 space-y-1 text-sm text-white/90">
                    <div className="flex items-center justify-center gap-2">
                      <span>📞</span>
                      <UserLoginMobile />
                    </div>

                    <div className="flex items-center justify-center gap-2 break-all">
                      <span>✉️</span>
                      <UserLoginEmail />
                    </div>
                  </div>

                  <div className="mt-5 w-full rounded-2xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md shadow-lg">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
                      TPL Wallet
                    </p>

                    <div className="mt-2 flex items-end justify-center gap-2">
                      <h3 className="text-3xl font-extrabold leading-none">
                        {wallet ? formatWalletPrice(totalWalletBalance) : "\u2014"}
                      </h3>

                      <span className="mb-1 text-xs text-white/75">
                        {wallet ? "Available" : "Balance unavailable"}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-white/80">
                      Includes Promo Credit, Earned Credit and Refund Wallet
                      balance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* DESKTOP TABS */}
          <div className="hidden md:flex flex-wrap items-center gap-0 border-b border-gray-100">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative px-5 md:px-6 h-14 inline-flex items-center text-sm font-semibold transition ${
                    isActive
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}

                  {isActive && (
                    <span className="absolute left-0 bottom-0 w-full h-[3px] bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* MOBILE TABS */}
          <div className="md:hidden flex gap-2 overflow-x-auto border-b border-gray-100 px-3 py-3 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`shrink-0 rounded-xl px-4 py-2 text-[12px] font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="p-3 md:p-5 md:pt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
