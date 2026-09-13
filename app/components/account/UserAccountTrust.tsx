"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { accountEmailDisplay, readVerifiedLoginEmails } from "@/app/lib/partner/accountLoginEmail";
import { useUserAccountRead } from "./useUserAccountRead";
import { getSavedProfile, PROFILE_UPDATED_EVENT } from "@/app/lib/account/profileStorage";

const TrustContext = createContext({ login: accountEmailDisplay(undefined), profile: accountEmailDisplay(undefined) });
export function UserAccountTrustProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const read = useUserAccountRead("/api/v1/me");
  const [, refreshProfile] = useState(0);
  useEffect(() => {
    const refresh = () => refreshProfile(value => value + 1);
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
  }, []);
  const emails = read.status === "loading" ? undefined : read.status === "ready" ? readVerifiedLoginEmails(read.payload, user?.id ?? "") : null;
  // This is the existing editable browser profile, not the legacy /me.email field.
  const profileEmail = user ? getSavedProfile(user.mobile || "").email : "";
  const login = accountEmailDisplay(emails);
  const profile = profileEmail ? accountEmailDisplay([], profileEmail)
    : { value: "No profile email saved", status: "Not verified for sign-in", verified: false };
  return <TrustContext.Provider value={{ login, profile }}>{children}</TrustContext.Provider>;
}
export function UserLoginEmail() {
  const { login } = useContext(TrustContext);
  return <span className="min-w-0 break-words" data-testid="user-login-email">{login.value} <span className="text-xs">· {login.status}</span></span>;
}
export function UserSignInDetails() {
  const { login, profile } = useContext(TrustContext);
  return <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 shadow-[0_10px_28px_rgba(14,165,233,0.08)]" aria-label="Sign-in details">
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0b5fff]">Sign-in & Contact Details</p>
    <h2 className="mt-1 text-[16px] font-semibold text-slate-950">Your sign-in details</h2>
    <p className="mt-1 text-[12px] leading-5 text-slate-600">Login emails are separate from your personal profile email. Editing personal details does not change or verify a sign-in method.</p>
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      {[{ label: "Login email", ...login }, { label: "Profile email · this browser", ...profile }].map(item => <article key={item.label} className="min-w-0 rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${item.verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span>
        <p className="mt-3 text-[11px] font-black uppercase tracking-wide text-slate-500">{item.label}</p>
        <p className="mt-1 break-words text-[14px] font-bold text-slate-950">{item.value}</p>
      </article>)}
      <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm"><p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Sign-in options</p><p className="mt-3 text-sm text-slate-700">Use a mobile or email code, or Google, from User Login.</p><p className="mt-2 text-xs text-slate-500">Only confirmed login emails above are marked Verified. This does not confirm a connected Google account.</p></article>
    </div>
  </section>;
}
