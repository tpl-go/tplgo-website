"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import {
  PROFILE_UPDATED_EVENT,
  getSavedProfile,
  saveProfile,
} from "@/app/lib/account/profileStorage";
import {
  getWallet,
  WALLET_UPDATED_EVENT,
  formatWalletPrice,
  type Wallet,
} from "@/app/lib/wallet/walletStorage";

const tabs = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/account/trips", label: "My Trips" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/wallet", label: "My Wallet" },
];

function getActiveAuthUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("tpl_auth_session_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

function isDefaultProfileName(name: string) {
  const clean = name.trim().toLowerCase();
  return clean === "" || clean === "pk";
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [photo, setPhoto] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState("Personal Account");
  const [bannerMobile, setBannerMobile] = useState("+91 0000000000");
  const [bannerEmail, setBannerEmail] = useState("Add Email Address");
  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getActiveMobile = () => {
    const authUser = getActiveAuthUser();
    return authUser?.mobile || user?.mobile || "";
  };

  const getActiveEmail = () => {
    const authUser = getActiveAuthUser();
    return authUser?.email || user?.email || "";
  };

  const getActiveFullName = () => {
    const authUser = getActiveAuthUser();
    return authUser?.fullName || user?.fullName || "";
  };

  useEffect(() => {
    const syncProfile = () => {
      const activeMobile = getActiveMobile();
      const activeEmail = getActiveEmail();
      const activeFullName = getActiveFullName();

      if (!activeMobile) {
        setBannerName("Personal Account");
        setBannerMobile("+91 0000000000");
        setBannerEmail("Add Email Address");
        setPhoto(null);
        return;
      }

      const profile = getSavedProfile(activeMobile);

      const profileName = `${profile.firstName || ""} ${
        profile.lastName || ""
      }`.trim();

      const finalName = isDefaultProfileName(profileName)
        ? activeFullName || "Personal Account"
        : profileName;

      setBannerName(finalName || "Personal Account");
      setBannerMobile(profile.mobile || activeMobile || "+91 0000000000");
      setBannerEmail(profile.email || activeEmail || "Add Email Address");
      setPhoto(profile.photo || null);
    };

    syncProfile();

    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    window.addEventListener(AUTH_UPDATED_EVENT, syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
      window.removeEventListener(AUTH_UPDATED_EVENT, syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [user?.mobile]);

  useEffect(() => {
    const syncWallet = () => {
      const activeMobile = getActiveMobile();

      if (!activeMobile) {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
        return;
      }

      setWallet(getWallet(activeMobile));
    };

    syncWallet();

    window.addEventListener(WALLET_UPDATED_EVENT, syncWallet);
    window.addEventListener(AUTH_UPDATED_EVENT, syncWallet);
    window.addEventListener("storage", syncWallet);

    return () => {
      window.removeEventListener(WALLET_UPDATED_EVENT, syncWallet);
      window.removeEventListener(AUTH_UPDATED_EVENT, syncWallet);
      window.removeEventListener("storage", syncWallet);
    };
  }, [user?.mobile]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const activeMobile = getActiveMobile();
    if (!activeMobile) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const nextPhoto = reader.result as string;
      setPhoto(nextPhoto);

      const profile = getSavedProfile(activeMobile);
      const nextProfile = {
        ...profile,
        mobile: activeMobile,
        email: profile.email || getActiveEmail(),
        photo: nextPhoto,
      };

      saveProfile(activeMobile, nextProfile);
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
    };

    reader.readAsDataURL(file);
  };

  const totalWalletBalance =
    Number(wallet.promoCredit || 0) +
    Number(wallet.earnedCredit || 0) +
    Number(wallet.refundableBalance || 0);

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
                      onClick={handlePhotoClick}
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
                            Add Photo
                          </div>
                        </div>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="text-white pb-1">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                      {bannerName}
                    </h1>

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-white/95">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{bannerMobile}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <span>{bannerEmail}</span>
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
                        {formatWalletPrice(totalWalletBalance)}
                      </h3>

                      <span className="text-sm text-white/80 mb-1">
                        Available
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
                    onClick={handlePhotoClick}
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
                          Add Photo
                        </div>
                      </div>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <h1 className="mt-4 text-[22px] font-extrabold leading-tight text-white">
                    {bannerName}
                  </h1>

                  <div className="mt-3 space-y-1 text-sm text-white/90">
                    <div className="flex items-center justify-center gap-2">
                      <span>📞</span>
                      <span>{bannerMobile}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 break-all">
                      <span>✉️</span>
                      <span>{bannerEmail}</span>
                    </div>
                  </div>

                  <div className="mt-5 w-full rounded-2xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md shadow-lg">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
                      TPL Wallet
                    </p>

                    <div className="mt-2 flex items-end justify-center gap-2">
                      <h3 className="text-3xl font-extrabold leading-none">
                        {formatWalletPrice(totalWalletBalance)}
                      </h3>

                      <span className="mb-1 text-xs text-white/75">
                        Available
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
