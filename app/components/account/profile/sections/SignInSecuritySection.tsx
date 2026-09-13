"use client";
import { UserSignInDetails } from "../../UserAccountTrust";
import LoginMethods from "../../LoginMethods";
export default function SignInSecuritySection() {
  return <div className="bg-white">
    <div className="border-b border-gray-200 px-6 py-5"><h1 className="text-[18px] font-semibold text-slate-900">Sign-in & Security</h1><p className="mt-1 text-[12px] text-slate-600">Your TPL account uses one-time codes or Google to sign in.</p></div>
    <div className="space-y-5 px-6 py-6"><UserSignInDetails /><LoginMethods /><p className="text-sm leading-6 text-slate-600">There is no TPL password to reset here. Manage your Google password through your Google account. Never share a sign-in code.</p><p className="text-sm leading-6 text-slate-600">Use Log out in the account menu to leave this account. Device information is available separately; signing out other devices is not available here.</p></div>
  </div>;
}
