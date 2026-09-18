"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
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
import { removeProfilePhoto, uploadProfilePhoto, useCanonicalProfilePhoto, type ProfilePhoto } from "@/app/lib/account/profilePhoto";

const tabs = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/account/trips", label: "My Trips" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/wallet", label: "My Wallet" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/downloads", label: "My Downloads" },
  { href: "/account/medical-care", label: "Medical Care" },
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
  const { photo, status: photoStatus } = useCanonicalProfilePhoto();
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoProgress,setPhotoProgress]=useState<number|null>(null);
  const [photoMessage,setPhotoMessage]=useState("");
  const photoEditable=pathname==="/account/profile";
  const choosePhoto=async(file:File)=>{
    setPhotoMessage("");setPhotoProgress(0);
    try{await uploadProfilePhoto(file,setPhotoProgress);setPhotoMessage("Profile photo updated.");}
    catch(error){setPhotoMessage(error instanceof Error?error.message:"Your photo could not be updated. Please try again.");}
    finally{setPhotoProgress(null);if(photoInput.current)photoInput.current.value="";}
  };
  const removePhoto=async()=>{
    if(!window.confirm("Remove your profile photo?"))return;
    setPhotoMessage("");setPhotoProgress(0);
    try{await removeProfilePhoto();setPhotoMessage("Profile photo removed.");}
    catch(error){setPhotoMessage(error instanceof Error?error.message:"Your photo could not be removed. Please try again.");}
    finally{setPhotoProgress(null);}
  };
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
      <input ref={photoInput} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" aria-label="Choose a profile photo" onChange={event=>{const file=event.target.files?.[0];if(file)void choosePhoto(file);}} />
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
                  <HeroAvatar photo={photo} editable={photoEditable} busy={photoProgress!==null||photoStatus==="loading"} onEdit={()=>photoInput.current?.click()} />

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
                    {photoEditable?<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/95"><button type="button" disabled={photoProgress!==null||photoStatus==="loading"} onClick={()=>photoInput.current?.click()} className="font-semibold underline underline-offset-2 disabled:opacity-60">{photo?"Replace photo":"Add photo"}</button>{photo?<button type="button" disabled={photoProgress!==null} onClick={()=>void removePhoto()} className="font-semibold underline underline-offset-2 disabled:opacity-60">Remove photo</button>:null}{photoProgress!==null?<span role="status">Uploading… {photoProgress}%</span>:null}{photoMessage?<span role="status">{photoMessage}</span>:null}</div>:null}
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
                  <HeroAvatar photo={photo} editable={photoEditable} busy={photoProgress!==null||photoStatus==="loading"} onEdit={()=>photoInput.current?.click()} />

                  <h1 className="mt-4 text-[22px] font-extrabold leading-tight text-white">
                    {bannerName}
                  </h1>
                  {photoEditable?<div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-white/95"><button type="button" disabled={photoProgress!==null||photoStatus==="loading"} onClick={()=>photoInput.current?.click()} className="font-semibold underline underline-offset-2 disabled:opacity-60">{photo?"Replace photo":"Add photo"}</button>{photo?<button type="button" disabled={photoProgress!==null} onClick={()=>void removePhoto()} className="font-semibold underline underline-offset-2 disabled:opacity-60">Remove photo</button>:null}</div>:null}
                  {photoEditable&&photoProgress!==null?<p role="status" className="mt-2 text-xs text-white/95">Uploading… {photoProgress}%</p>:null}
                  {photoEditable&&photoMessage?<p role="status" className="mt-2 text-xs text-white/95">{photoMessage}</p>:null}

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
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

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
          <div className="md:hidden grid grid-cols-2 gap-2 border-b border-gray-100 px-3 py-3 sm:grid-cols-3">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                    className={`min-w-0 rounded-xl px-3 py-2 text-center text-[12px] font-bold leading-4 transition ${
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

function HeroAvatar({photo,editable,busy,onEdit}:{photo:ProfilePhoto|null;editable:boolean;busy:boolean;onEdit:()=>void}){
  const picture=<span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 text-white shadow-xl backdrop-blur-md">{photo?<Image key={photo.version} src={photo.thumbnailUrl} alt="Your profile" width={96} height={96} unoptimized className="h-full w-full object-cover"/>:<span className="text-2xl" aria-label="No profile photo">👤</span>}</span>;
  if(!editable)return <Link href="/account/profile" aria-label="Open My Profile" className="rounded-full outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800">{picture}</Link>;
  return <div className="relative h-24 w-24 shrink-0">{picture}<button type="button" disabled={busy} onClick={onEdit} aria-label={photo?"Replace profile photo":"Add profile photo"} className="absolute -bottom-1 -right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg outline-none transition hover:bg-blue-700 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 disabled:opacity-60"><Camera className="h-4 w-4" aria-hidden="true"/></button></div>;
}
