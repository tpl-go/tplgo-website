"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import {
  adminApiRequest,
  createAdminSetupToken,
  createAdminRequestId,
  readAdminSession,
  type AdminApiResult,
  type AdminPasswordTokenResponse,
  type AdminUser,
} from "../../lib/admin/adminApiClient";

export default function AdminUsersPage() {
  return (
    <AdminProtected>
      <AdminShell title="Users">
        <AdminUsersView />
      </AdminShell>
    </AdminProtected>
  );
}

function AdminUsersView() {
  const [usersResult, setUsersResult] = useState<AdminApiResult<AdminUser[]> | null>(null);
  const [tokenResult, setTokenResult] = useState<AdminApiResult<AdminPasswordTokenResponse> | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [canResetPassword, setCanResetPassword] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      const session = readAdminSession();
      if (!active) return;
      setCanResetPassword(session?.admin.permissions.includes("admin.password.reset") ?? false);
      const result = await adminApiRequest<AdminUser[]>("/api/v1/admin/users");
      if (!active) return;
      setUsersResult(result.ok ? { ...result, data: normalizeAdminUsers(result.data, session?.admin) } : result);
    });
    return () => {
      active = false;
    };
  }, []);

  async function createSetupLink(adminUser: AdminUser) {
    const setupId = getSetupTokenAdminUserId(adminUser);
    if (!setupId) {
      setTokenResult({
        ok: false,
        error: {
          code: "ADMIN_USER_ID_MISSING",
          message: "Admin user id is missing from users response.",
        },
        status: 0,
        requestId: createAdminRequestId(),
      });
      return;
    }
    setActiveUserId(setupId);
    const result = await createAdminSetupToken(setupId);
    setTokenResult(result);
    setActiveUserId(null);
  }

  const users = usersResult?.ok ? usersResult.data : [];
  const developmentToken = tokenResult?.ok ? tokenResult.data.token?.developmentToken : undefined;

  return (
    <div className="space-y-5">
      {usersResult && !usersResult.ok ? (
        <Notice tone="warn" text={usersResult.error.message} requestId={usersResult.requestId} />
      ) : null}
      {tokenResult?.ok ? (
        <Notice
          tone="success"
          text={developmentToken ? "Development setup link created." : "Setup link dispatch queued for future notification delivery."}
          requestId={tokenResult.requestId}
        >
          {developmentToken ? (
            <Link className="mt-2 block break-all text-slate-950 underline-offset-2 hover:underline" href={`/admin/password/setup?token=${encodeURIComponent(developmentToken)}`}>
              {`${typeof window !== "undefined" ? window.location.origin : ""}/admin/password/setup?token=${encodeURIComponent(developmentToken)}`}
            </Link>
          ) : null}
        </Notice>
      ) : null}
      {tokenResult && !tokenResult.ok ? (
        <Notice tone="warn" text={tokenResult.error.message} requestId={tokenResult.requestId} />
      ) : null}
      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["email", "fullName", "status", "roles", "actions"].map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    Users will appear here when backend data exists.
                  </td>
                </tr>
              ) : (
                users.map((adminUser) => {
                  const setupTokenAdminUserId = getSetupTokenAdminUserId(adminUser);
                  const creatingSetupToken = setupTokenAdminUserId !== null && activeUserId === setupTokenAdminUserId;
                  return (
                    <tr key={adminUser.id}>
                      <td className="px-4 py-3 text-slate-700">{formatOptionalUserField(adminUser.email)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatOptionalUserField(adminUser.fullName)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatOptionalUserField(adminUser.status)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatUserRoles(adminUser)}</td>
                      <td className="px-4 py-3">
                        {canResetPassword ? (
                          <button
                            type="button"
                            onClick={() => createSetupLink(adminUser)}
                            disabled={creatingSetupToken}
                            className="h-8 rounded bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-60"
                          >
                            {creatingSetupToken ? "Creating" : "Setup token"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Permission gated</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatOptionalUserField(value: unknown): string {
  return typeof value === "string" && value.trim() ? value : "-";
}

function normalizeAdminUsers(users: AdminUser[], currentAdmin?: AdminUser): AdminUser[] {
  return users.map((adminUser) => {
    if (getSetupTokenAdminUserId(adminUser) || !currentAdmin) return adminUser;
    return adminUser.email === currentAdmin.email
      ? { ...adminUser, adminUserId: currentAdmin.id }
      : adminUser;
  });
}

function formatUserRoles(adminUser: AdminUser): string {
  const userRecord = adminUser as AdminUser & { role?: unknown };
  if (Array.isArray(userRecord.roles)) {
    const roles = userRecord.roles.filter((role): role is string => typeof role === "string" && role.trim().length > 0);
    return roles.length ? roles.join(", ") : "-";
  }
  return typeof userRecord.role === "string" && userRecord.role.trim() ? userRecord.role : "-";
}

function getSetupTokenAdminUserId(adminUser: AdminUser): string | null {
  return typeof adminUser.adminUserId === "string" && adminUser.adminUserId.trim()
    ? adminUser.adminUserId
    : null;
}

function Notice({
  tone,
  text,
  requestId,
  children,
}: {
  tone: "success" | "warn";
  text: string;
  requestId?: string;
  children?: ReactNode;
}) {
  const classes = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div className={`rounded border p-3 text-sm ${classes}`}>
      <p>{text}</p>
      {requestId ? <p className="mt-1 text-xs">Request ID: {requestId}</p> : null}
      {children}
    </div>
  );
}
