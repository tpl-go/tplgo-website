"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { readAccountDevices } from "@/app/lib/account/userAccountRead";
import { useUserAccountRead } from "../../useUserAccountRead";

export default function LoggedDevicesSection() {
  const { user } = useAuth();
  const read = useUserAccountRead("/api/v1/me/device-sessions");
  const devices = read.status === "ready" ? readAccountDevices(read.payload, user?.id ?? "") : null;
  return <div className="bg-white">
    <div className="border-b border-gray-200 px-6 py-5"><h1 className="text-[18px] font-semibold text-slate-900">Device information</h1><p className="mt-2 text-[12px] leading-5 text-slate-600">Device records saved to this account. This is not a list of active sign-in sessions, and it may not include every device. Signing out other devices is not available here.</p></div>
    <div className="space-y-4 px-6 py-6">
      {read.status === "loading" ? <p role="status">Loading device information…</p>
        : read.status === "signed-out" ? <p>Sign in to view account device information.</p>
        : devices === null ? <p role="status">Device information is unavailable. Please try again later.</p>
        : devices.length === 0 ? <p>No device records are available for this account.</p>
        : devices.map(device => <article key={device.id} className="rounded-2xl border border-gray-200 bg-white p-4"><h2 className="break-words text-[15px] font-semibold text-slate-900">{device.label}</h2><p className="mt-1 text-[12px] text-slate-600">{device.lastSeenAt ? `Last recorded activity: ${new Date(device.lastSeenAt).toLocaleString()}` : "Last activity was not recorded."}</p></article>)}
    </div>
  </div>;
}
