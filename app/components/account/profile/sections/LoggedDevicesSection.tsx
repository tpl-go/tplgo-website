"use client";

import { useEffect, useState } from "react";
import {
  DeviceSession,
  getSavedDeviceSessions,
  logoutDeviceSession,
} from "@/app/lib/account/deviceSessions";

export default function LoggedDevicesSection() {
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);

  useEffect(() => {
    setDeviceSessions(getSavedDeviceSessions());
  }, []);

  const handleLogoutDevice = (sessionId: string) => {
    const next = logoutDeviceSession(sessionId);
    setDeviceSessions(next);
  };

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Logged in Device
        </h1>
      </div>

      <div className="space-y-4 px-6 py-6">
        {deviceSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No device sessions found.
          </div>
        ) : (
          deviceSessions.map((device) => (
            <div
              key={device.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[22px]">
                  {device.type.toLowerCase().includes("android") ||
                  device.type.toLowerCase().includes("iphone")
                    ? "📱"
                    : "🖥️"}
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {device.label}
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {device.type}
                  </p>
                  <p className="text-[12px] text-slate-500">{device.location}</p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    Logged in since {device.loggedInSince}
                  </p>
                </div>
              </div>

              {device.isCurrent ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700">
                  Current Device
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleLogoutDevice(device.id)}
                  className="h-10 rounded-xl border border-red-200 px-4 text-[12px] font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}