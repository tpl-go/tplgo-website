"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readAdminSession, refreshAdminSession } from "../../lib/admin/adminApiClient";

export default function AdminProtected({
  children,
  requiredPermissions = [],
}: {
  children: React.ReactNode;
  requiredPermissions?: string[];
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const requiredPermissionKey = requiredPermissions.join("|");

  useEffect(() => {
    let active = true;
    void refreshAdminSession().then((refreshed) => {
      if (!active) return;
      const session = refreshed ?? readAdminSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      const required = requiredPermissionKey ? requiredPermissionKey.split("|") : [];
      const hasRequiredPermissions = required.every((permission) => session.admin.permissions.includes(permission));
      if (!hasRequiredPermissions) {
        setForbidden(true);
        setReady(true);
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [requiredPermissionKey, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm text-slate-500">
        Checking admin session
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 text-center">
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Access restricted</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Your Admin role does not include the required permission for this Admin area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
