"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readAdminSession } from "../../lib/admin/adminApiClient";

export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const session = readAdminSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm text-slate-500">
        Checking admin session
      </div>
    );
  }

  return <>{children}</>;
}
